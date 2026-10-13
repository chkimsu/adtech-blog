#!/usr/bin/env node
// 파이썬 코드 블록 형식 검사. 설계: docs/superpowers/specs/2026-10-13-python-code-blocks-design.md
//   node scripts/check-code-blocks.js            → 새 형식 블록의 표시 오류와, 기준표보다 늘어난 옛 형식 블록을 알린다 (CI)
//   node scripts/check-code-blocks.js --update   → 지금 옛 형식 블록 수를 기준표로 다시 적는다
//   node scripts/check-code-blocks.js --json     → 블록마다 읽은 결과를 JSON 으로 낸다 (scripts/check-python-outputs.py 가 쓴다)
//   --root <폴더>                                → posts/ 와 기준표를 그 폴더에서 찾는다 (시험용)
//
// 블록 읽기는 js/code-steps.js 한 곳에 있다. 화면도 같은 파일로 읽는다.
// 옛 형식(하는 일 줄이 없는 블록)은 옮기는 동안 글마다 수를 scripts/code-blocks-baseline.json 에 적어 둔다.
// 기준표보다 늘거나 기준표에 없는 글에 있으면 실패한다. 새 글은 처음부터 새 형식이어야 한다.
const fs = require('fs');
const path = require('path');
const CodeSteps = require('../js/code-steps.js');

const args = process.argv.slice(2);
const rootAt = args.indexOf('--root');
const root = rootAt >= 0 ? path.resolve(args[rootAt + 1]) : path.join(__dirname, '..');
const BASELINE = path.join(root, 'scripts', 'code-blocks-baseline.json');
const FENCE = /^```python[^\n]*\n([\s\S]*?)^```[ \t]*$/gm;

function blocksOf(file) {
  const text = fs.readFileSync(path.join(root, 'posts', file), 'utf8');
  const out = [];
  FENCE.lastIndex = 0;
  let m;
  // fence 는 여는 펜스 줄 번호다. 블록 안 k 번째 줄은 파일의 fence + k 번째 줄이다.
  while ((m = FENCE.exec(text))) out.push({ fence: text.slice(0, m.index).split('\n').length, src: m[1] });
  return out;
}

const files = fs.readdirSync(path.join(root, 'posts')).filter(f => f.endsWith('.md')).sort();
const posts = new Set(files.map(f => f.replace(/\.md$/, '')));
const all = files.map(file => ({
  file,
  blocks: blocksOf(file).map(b => Object.assign(b, { model: CodeSteps.parse(b.src) })),
}));
const sum = o => Object.values(o).reduce((a, b) => a + b, 0);

function json() {
  const out = [];
  for (const { file, blocks } of all) {
    blocks.forEach((b, index) => {
      const m = b.model;
      out.push({
        post: file.replace(/\.md$/, ''), index, format: m.format, ok: m.ok, src: m.src,
        labels: m.labels || [], stepLines: m.stepLines || [], codeEnd: m.codeEnd === undefined ? null : m.codeEnd,
        out: m.out ? { varying: m.out.varying, groups: m.out.groups.map(g => ({ n: g.n, lines: g.lines })) } : null,
      });
    });
  }
  // process.exit 를 부르면 파이프로 나가던 큰 출력이 잘린다. 다 쓸 때까지 저절로 끝나게 둔다.
  process.stdout.write(JSON.stringify(out));
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
  for (const { file, blocks } of all) {
    for (const b of blocks) {
      const m = b.model;
      if (m.format !== 'steps') continue;
      steps++;
      const errors = m.errors.slice();
      for (const l of m.labels || []) {
        if (l.kind === 'cont-post' && !posts.has(l.post)) errors.push({ line: 1, msg: `이어서 돌릴 글 ${l.post} 가 posts/ 에 없습니다` });
      }
      for (const e of errors) {
        fail++;
        console.log(`✗ posts/${file}:${b.fence + e.line}  ${e.msg}`);
      }
    }
    const c = legacy[file] || 0;
    if (c > (base[file] || 0)) {
      fail++;
      console.log(`✗ posts/${file}  옛 형식 파이썬 블록 ${c}개 (기준표 ${base[file] || 0}개). 새 블록은 「# 하는 일:」 형식으로 씁니다`);
    }
  }
  console.log(`${fail ? '✗' : '✓'} 새 형식 블록 ${steps}개, 옛 형식 블록 ${sum(legacy)}개, 문제 ${fail}건`);
  process.exitCode = fail ? 1 : 0;
}

if (args.includes('--json')) json();
else check();
