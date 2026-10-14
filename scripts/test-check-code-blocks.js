#!/usr/bin/env node
// 형식 검사(scripts/check-code-blocks.js) 시험. 임시 폴더에 작은 글을 만들어 --root 로 돌려 본다.
//
//   node scripts/test-check-code-blocks.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const CHECK = path.join(__dirname, 'check-code-blocks.js');
const F = '`'.repeat(3);
let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}

// posts 는 { 파일 이름: [[꼬리표, 줄, 줄, ...], ...] }. ids 가 있으면 [[글 id, 파일 이름], ...] 로 js/posts.js 를 둔다.
const roots = [];
function site(posts, baseline, ids) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cb-test-'));
  roots.push(root);
  fs.mkdirSync(path.join(root, 'posts'));
  fs.mkdirSync(path.join(root, 'scripts'));
  for (const [name, blocks] of Object.entries(posts)) {
    const body = blocks.map(([tag, ...lines]) => `${F}${tag}\n${lines.join('\n')}\n${F}`).join('\n\n');
    fs.writeFileSync(path.join(root, 'posts', `${name}.md`), `# 시험\n\n${body}\n`);
  }
  if (baseline) fs.writeFileSync(path.join(root, 'scripts', 'code-blocks-baseline.json'), JSON.stringify(baseline));
  if (ids) {
    fs.mkdirSync(path.join(root, 'js'));
    const list = ids.map(([id, file]) => `{ id: '${id}', contentUrl: 'posts/${file}.md' }`).join(', ');
    fs.writeFileSync(path.join(root, 'js', 'posts.js'), `const posts = [${list}];\nmodule.exports = { posts };\n`);
  }
  return root;
}
function run(root, ...more) {
  const r = spawnSync(process.execPath, [CHECK, '--root', root, ...more], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout + r.stderr };
}

const NEW = ['python', '# 하는 일: 한 줄을 찍는다.', 'print(1)', '', '# 출력:', '# 뜻: 하나다.', '# 1'];
const OLD = ['python', 'print(1)'];

console.log('기준표');
let r = run(site({ a: [NEW] }, {}));
eq('새 형식 블록은 통과', [r.code, r.out.trim().split('\n').pop()], [0, '✓ 새 형식 블록 1개, 옛 형식 블록 0개, 문제 0건']);
r = run(site({ a: [OLD] }, {}));
eq('기준표에 없는 글의 옛 형식 블록은 실패', [r.code, r.out.includes('posts/a.md  옛 형식 파이썬 블록 1개 (기준표 0개)')], [1, true]);
r = run(site({ a: [OLD, OLD] }, { 'a.md': 1 }));
eq('기준표보다 늘면 실패', [r.code, r.out.includes('옛 형식 파이썬 블록 2개 (기준표 1개)')], [1, true]);
r = run(site({ a: [OLD] }, { 'a.md': 2 }));
eq('기준표보다 줄면 통과하고 알려 준다', [r.code, r.out.includes('기준표보다 줄어든 글 1편 (a.md 2→1)')], [0, true]);
const up = site({ a: [OLD], b: [NEW] }, { 'a.md': 3 });
r = run(up, '--update');
eq('--update 는 지금 수를 기준표로 적는다',
  [r.code, JSON.parse(fs.readFileSync(path.join(up, 'scripts', 'code-blocks-baseline.json'), 'utf8'))], [0, { 'a.md': 1 }]);

console.log('\n형식 오류는 파일의 줄 번호로 알린다');
// 글 맨 위가 「# 시험」, 빈 줄, 여는 울타리라서 블록 첫 줄이 파일 4번째 줄이다
r = run(site({ a: [['python', '# 하는 일: x.', '# 1단계: 하나', 'a = 1', '# 3단계: 셋', 'b = 2']] }, {}));
eq('건너뛴 단계 번호', [r.code, r.out.includes('posts/a.md:7  단계 번호는 2 이어야 합니다')], [1, true]);
r = run(site({ a: [['python', '#하는 일: x.', 'print(1)']] }, {}));
eq('하는 일 오타는 옛 형식으로 넘어가지 않는다', [r.code, r.out.includes('posts/a.md:4  하는 일 줄은 들여쓰기 없이')], [1, true]);

console.log('\n꼬리표');
r = run(site({ a: [['python3', ...NEW.slice(1)]] }, {}));
eq('python3 은 실패', [r.code, r.out.includes('posts/a.md:3  파이썬 블록의 꼬리표는 `python` 하나로 씁니다 (지금 `python3`)')], [1, true]);
r = run(site({ a: [['py', 'print(1)']] }, {}));
eq('py 도 실패', [r.code, r.out.includes('(지금 `py`)')], [1, true]);
r = run(site({ a: [['python title', 'print(1)']] }, {}));
eq('python 뒤에 글을 붙여도 실패', [r.code, r.out.includes('(지금 `python title`)')], [1, true]);
r = run(site({ a: [['text', 'print(1)'], ['pyramid', 'x = 1']] }, {}));
eq('파이썬이 아닌 꼬리표는 보지 않는다', r.code, 0);

console.log('\n이어서 돌릴 글은 글 id 로 쓴다');
const cont = id => ['python', `# (${id} 글의 코드에 이어서 돌린다.)`, '# 하는 일: 앞 글에 이어서 돈다.', 'print(y)', '', '# 출력:', '# 뜻: 앞 글의 y 다.', '# 6'];
const idSite = id => site({ B_File: [['python', 'y = 6']], c: [cont(id)] }, { 'B_File.md': 1 }, [['b-id', 'B_File'], ['c', 'c']]);
r = run(idSite('b-id'));
eq('글 id 로 쓰면 통과', r.code, 0);
r = run(idSite('b-id'), '--json');
eq('--json 은 이어서 돌릴 글의 파일 이름을 같이 낸다', JSON.parse(r.out).find(b => b.post === 'c').labels,
  [{ kind: 'cont-post', post: 'b-id', text: '앞 글에 이어서', file: 'B_File' }]);
r = run(idSite('B_File'));
eq('파일 이름으로 쓰면 글 id 를 알려 준다', [r.code, r.out.includes('posts/B_File.md 의 글 id 는 b-id 입니다')], [1, true]);
r = run(idSite('nope'));
eq('없는 글', [r.code, r.out.includes('이어서 돌릴 글 nope 가 js/posts.js 에 없습니다')], [1, true]);

console.log('\n폴더');
r = run(path.join(os.tmpdir(), 'cb-test-no-such-folder'));
eq('posts/ 가 없으면 멈춘다', [r.code, r.out.includes('posts/ 폴더가 없습니다')], [2, true]);

for (const d of roots) fs.rmSync(d, { recursive: true, force: true });
console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
