#!/usr/bin/env node
// 파이썬 코드 블록 형식 검사. 설계: docs/superpowers/specs/2026-10-13-python-code-blocks-design.md
//   node scripts/check-code-blocks.js            → 새 형식 블록의 표시 오류, python 이 아닌 파이썬 꼬리표, 이어서 돌릴 글의 id,
//                                                   기준표보다 늘어난 옛 형식 블록을 알린다 (CI). 기준표보다 줄면 --update 를 권한다
//   node scripts/check-code-blocks.js --update   → 지금 옛 형식 블록 수를 기준표로 다시 적는다
//   node scripts/check-code-blocks.js --json     → 블록마다 읽은 결과를 JSON 으로 낸다 (scripts/check-python-outputs.py 가 쓴다)
//   --root <폴더>                                → posts/ 와 기준표, js/posts.js 를 그 폴더에서 찾는다 (시험용)
//
// 블록 읽기는 js/code-steps.js 한 곳에 있다. 화면도 같은 파일로 읽는다.
// 옛 형식(하는 일 줄이 없는 블록)은 옮기는 동안 글마다 수를 scripts/code-blocks-baseline.json 에 적어 둔다.
// 기준표보다 늘거나 기준표에 없는 글에 있으면 실패한다. 새 글은 처음부터 새 형식이어야 한다.
// 시험: scripts/test-check-code-blocks.js
const fs = require('fs');
const path = require('path');
const CodeSteps = require('../js/code-steps.js');

const args = process.argv.slice(2);
const rootAt = args.indexOf('--root');
const root = rootAt >= 0 ? path.resolve(args[rootAt + 1]) : path.join(__dirname, '..');
const BASELINE = path.join(root, 'scripts', 'code-blocks-baseline.json');
// 울타리 하나. 꼬리표(info)와 안의 글을 같이 읽는다.
const FENCE = /^```([^\n`]*)\n([\s\S]*?)^```[ \t]*$/gm;
// 파이썬처럼 보이는 꼬리표. 화면은 꼬리표가 정확히 python 일 때만 새 형식으로 그리고, 검사 둘도 그 블록만 본다.
const PYLIKE = /^(?:py|py3|python\S*)(?:\s|$)/i;

if (!fs.existsSync(path.join(root, 'posts'))) {
  console.error(`✗ posts/ 폴더가 없습니다: ${path.join(root, 'posts')}`);
  process.exit(2);
}

function blocksOf(file) {
  const text = fs.readFileSync(path.join(root, 'posts', file), 'utf8');
  const out = [];
  FENCE.lastIndex = 0;
  let m;
  // fence 는 여는 울타리의 줄 번호다. 블록 안 k 번째 줄은 파일의 fence + k 번째 줄이다.
  while ((m = FENCE.exec(text))) {
    const tag = m[1].trim();
    const fence = text.slice(0, m.index).split('\n').length;
    if (tag === 'python') out.push({ fence, src: m[2] });
    else if (PYLIKE.test(tag)) out.push({ fence, src: m[2], badTag: tag });
  }
  return out;
}

// 글 id 와 파일 이름은 js/posts.js 가 잇는다. 대개 같지만 다른 글이 있다(mab-summary 는 mab.md).
// 「<글 id> 글의 코드에 이어서」 표시는 글 id 로 쓴다. 화면의 링크가 post.html?id=<글 id> 로 가기 때문이다.
// js/posts.js 가 없는 폴더(시험용)에서는 파일 이름을 글 id 로 본다.
function idsOf(files) {
  const ids = new Map();
  const js = path.join(root, 'js', 'posts.js');
  if (fs.existsSync(js)) {
    const list = require(js).posts;
    if (!Array.isArray(list)) {
      console.error(`✗ js/posts.js 에서 글 목록(posts 배열)을 읽지 못했습니다: ${js}`);
      process.exit(2);
    }
    for (const p of list) {
      // contentUrl 이 posts/<파일 이름>.md 꼴이 아니면 파일 이름을 '' 로 둔다. 그 글에 이어서 돌리면 아래에서 알린다.
      const m = /^posts\/(.+)\.md$/.exec(p.contentUrl || '');
      ids.set(p.id, m ? m[1] : '');
    }
  } else {
    for (const f of files) ids.set(f.replace(/\.md$/, ''), f.replace(/\.md$/, ''));
  }
  return ids;
}

const files = fs.readdirSync(path.join(root, 'posts')).filter(f => f.endsWith('.md')).sort();
const stems = new Set(files.map(f => f.replace(/\.md$/, '')));
const ids = idsOf(files);
const all = files.map(file => {
  const found = blocksOf(file);
  return {
    file,
    blocks: found.filter(b => !b.badTag).map(b => Object.assign(b, { model: CodeSteps.parse(b.src) })),
    badTags: found.filter(b => b.badTag),
  };
});
const sum = o => Object.values(o).reduce((a, b) => a + b, 0);

// 이어서 돌릴 글의 파일 이름. 글 id 가 아니면 null.
const fileOf = label => (ids.has(label.post) ? ids.get(label.post) : null);

function json() {
  const out = [];
  for (const { file, blocks } of all) {
    blocks.forEach((b, index) => {
      const m = b.model;
      out.push({
        post: file.replace(/\.md$/, ''), index, format: m.format, ok: m.ok, src: m.src,
        labels: (m.labels || []).map(l => (l.kind === 'cont-post' ? Object.assign({}, l, { file: fileOf(l) || l.post }) : l)),
        stepLines: m.stepLines || [], codeEnd: m.codeEnd === undefined ? null : m.codeEnd,
        out: m.out ? { varying: m.out.varying, groups: m.out.groups.map(g => ({ n: g.n, lines: g.lines })) } : null,
      });
    });
  }
  // process.exit 를 부르면 파이프로 나가던 큰 출력이 잘린다. 다 쓸 때까지 저절로 끝나게 둔다.
  process.stdout.write(JSON.stringify(out));
}

function contPostErrors(b) {
  const errors = [];
  const lines = b.src.split('\n');
  for (const l of b.model.labels || []) {
    if (l.kind !== 'cont-post') continue;
    const line = lines.findIndex(x => x.startsWith(`# (${l.post} 글의 코드에 이어서`)) + 1;
    const file = fileOf(l);
    if (file === null) {
      const byFile = [...ids].find(([, f]) => f === l.post);
      errors.push({ line, msg: byFile
        ? `이어서 돌릴 글은 글 id 로 씁니다 — posts/${l.post}.md 의 글 id 는 ${byFile[0]} 입니다`
        : `이어서 돌릴 글 ${l.post} 가 js/posts.js 에 없습니다` });
    } else if (file === '') {
      errors.push({ line, msg: `이어서 돌릴 글 ${l.post} 의 contentUrl 이 posts/<파일 이름>.md 꼴이 아닙니다` });
    } else if (!stems.has(file)) {
      errors.push({ line, msg: `이어서 돌릴 글 ${l.post} 의 파일 posts/${file}.md 가 없습니다` });
    }
  }
  return errors;
}

function check() {
  const legacy = {};
  for (const { file, blocks } of all) {
    const c = blocks.filter(b => b.model.format === 'legacy').length;
    if (c) legacy[file] = c;
  }
  if (args.includes('--update')) {
    fs.writeFileSync(BASELINE, JSON.stringify(legacy, null, 2) + '\n');
    console.log(`기준표를 다시 적었습니다 — 옛 형식 블록 ${sum(legacy)}개, 글 ${Object.keys(legacy).length}편`);
    return;
  }
  const base = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : {};
  let fail = 0, steps = 0;
  const shrunk = [];
  for (const { file, blocks, badTags } of all) {
    for (const b of badTags) {
      fail++;
      console.log(`✗ posts/${file}:${b.fence}  파이썬 블록의 꼬리표는 \`python\` 하나로 씁니다 (지금 \`${b.badTag}\`)`);
    }
    for (const b of blocks) {
      const m = b.model;
      if (m.format !== 'steps') continue;
      steps++;
      for (const e of m.errors.concat(contPostErrors(b))) {
        fail++;
        console.log(`✗ posts/${file}:${b.fence + e.line}  ${e.msg}`);
      }
    }
    const c = legacy[file] || 0;
    if (c > (base[file] || 0)) {
      fail++;
      console.log(`✗ posts/${file}  옛 형식 파이썬 블록 ${c}개 (기준표 ${base[file] || 0}개). 새 블록은 「# 하는 일:」 형식으로 씁니다`);
    } else if (c < (base[file] || 0)) {
      shrunk.push(`${file} ${base[file]}→${c}`);
    }
  }
  if (shrunk.length) {
    console.log(`  기준표보다 줄어든 글 ${shrunk.length}편 (${shrunk.join(', ')}) — node scripts/check-code-blocks.js --update 로 기준표를 줄입니다`);
  }
  console.log(`${fail ? '✗' : '✓'} 새 형식 블록 ${steps}개, 옛 형식 블록 ${sum(legacy)}개, 문제 ${fail}건`);
  process.exitCode = fail ? 1 : 0;
}

if (args.includes('--json')) json();
else check();
