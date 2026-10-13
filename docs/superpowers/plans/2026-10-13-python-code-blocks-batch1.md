# 파이썬 코드 블록 개편 — 첫 묶음 실행 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 파이썬 블록을 「하는 일, 단계, 뜻」 모양으로 그리는 화면 코드, 형식 검사와 실행 검사, 휴대폰 글 칸 여백 바로잡기를 넣고, 글 3편의 파이썬 블록 11개를 새 형식으로 옮긴다.

**Architecture:** `js/code-steps.js` 하나가 파이썬 블록을 토큰으로 읽고, 단계와 출력 묶음으로 나눈 뒤 HTML 로 그린다. 브라우저(`js/main.js`)와 node 형식 검사(`scripts/check-code-blocks.js`)가 이 파일을 같이 쓴다. 파이썬 실행 검사(`scripts/check-python-outputs.py`)는 형식 검사의 `--json` 출력으로 블록 구조를 받아, 블록을 실제로 돌리고 찍힌 줄과 그 줄을 찍은 단계를 견준다. 스타일은 `css/style.css` 맨 끝에 붙인다.

**Tech Stack:** 바닐라 JS(브라우저, node 20), marked 12, highlight.js 11.9.0(파이썬이 아닌 블록), Python 3.9 표준 라이브러리, GitHub Actions, Playwright MCP(화면 확인).

**Spec:** `docs/superpowers/specs/2026-10-13-python-code-blocks-design.md`. 확정 시안은 같은 폴더의 `2026-10-13-python-code-blocks-mock-width.html`(2번), `2026-10-13-python-code-blocks-mock-phone.html`(3번)이다.

> 이 계획의 코드와 기대 출력은 계획을 쓸 때 저장소 사본에서 모두 돌려 본 것이다. 단위 테스트 63개, 실행 검사 시험 10개, 글 3편의 형식 검사와 실행 검사, 1440, 1280, 1024, 390 폭의 화면 확인이 통과했다.

## Global Constraints

- 공개 저장소다. 사내 시스템, 플랫폼 이름을 코드, 주석, 커밋 메시지 어디에도 쓰지 않는다.
- 블록 안 글(하는 일, 단계 제목, 풀이, 메모, 뜻)은 평서체 `~한다, ~이다` 로 쓴다. 상태 표시는 정해진 글 그대로 쓴다.
- 해요체, `저희`, 가운뎃점, `실측`, `실체`, `축`, `가른다`, `갈린다`, 열하나 이상의 말로 쓴 숫자, 지어낸 말(`출력 칸` 등)을 쓰지 않는다. `node scripts/check-wording.js` 가 posts/ 의 코드 블록 안과 `js/*.js` 의 문자열까지 센다.
- 모서리는 `border-radius: 0`, 그림자 없음, 색은 디자인 토큰만 쓴다(새 hex 없음). `node scripts/check-design.js` 가 통과해야 한다.
- 실행되는 코드 줄은 바꾸지 않는다. 이 묶음에는 예외가 없다.
- 표시 꼴은 spec 그대로다 — `# 하는 일: …`, `# N단계: …`, `# 출력:` 또는 `# 출력 (…):`, `# N단계 뜻: …` 또는 `# 뜻: …`, 상태 표시 `# (<무엇> — 그대로 실행되지 않습니다.)`, `# (앞 블록에 이어서 돌린다.)`, `# (<글 id> 글의 코드에 이어서 돌린다.)`.
- 폭 문턱 — 블록 폭 926px 이하면 설명이 코드 위로 쌓이고, 600px 이하면 휴대폰 모양이다(둘 다 container query). 화면 768px 이하면 글 칸 여백이 24px 이다.
- `js/main.js` 에는 NUL 바이트가 4개 있다. 찾을 때 `grep -a` 를 쓰고, 고칠 때는 Edit 로 해당 줄만 바꾼다(파일을 통째로 다시 쓰지 않는다). 고친 뒤 `python3 -c "print(open('js/main.js','rb').read().count(b'\x00'))"` 가 `4` 여야 한다.
- 커밋은 git 사용자 `chkimsu` 로 한다. 파일을 이름으로 stage 한다(`git add -A` 금지). 메시지는 기존 꼴 `feat|fix|docs(범위): …` 이고 마지막 줄은 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` 이다.
- push 는 Task 10 에서 사용자 확인을 받은 뒤에만 한다. push 전에 `git fetch origin && git rebase origin/main` 을 한다(CI 가 sitemap 과 feed 를 다시 커밋한다).
- 임시 파일은 저장소 밖에 둔다. 아래 명령의 `$SCRATCH` 는 `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch1"; mkdir -p "$SCRATCH"` 로 정한다. 셸 변수는 명령마다 다시 정하고, 파일을 만들 때 쓸 실제 경로는 `echo "${TMPDIR:-/tmp}/code-steps-batch1"` 로 확인한다.

## Review Focus

1. **접는 절 안의 블록** — `:::deep` 은 닫힌 `<details>` 로 그려진다. 브라우저에 따라 처음 배치 때 블록 폭이 0 일 수 있다. 펼친 뒤 메모 자리와 쌓기가 잡혀 있어야 한다. Task 5 Step 8 이 펼친 뒤 배치가 빠진 블록 수(`unlaid`)를 센다.
2. **용어 풀이와 수식 렌더러** — 둘 다 `<pre>`, `<code>` 만 건너뛴다. 새 블록은 `div` 라서 그 안에 `demo-term` 이나 `katex` 가 생기면 코드 글자가 바뀐다. Task 5 Step 8 이 센다(`injected`).
3. **Copy 가 원문과 같다** — 본문 전처리가 빈 줄 3개 이상을 2개로 줄이면서 코드 안 빈 줄까지 줄이고 있었다. Task 5 Step 2 가 순서를 고치고 Step 8 이 `data-src` 와 마크다운 원문을 견준다(`copyMatches`).
4. **메모가 코드 글자를 덮지 않는다** — 한글 폭은 기기와 서체마다 다르다. 메모 자리를 그려진 폭으로 정하는지 Task 5 Step 8 이 메모 왼쪽 끝과 코드 글자 오른쪽 끝을 견준다(`noteOverlap`).
5. **페이지가 옆으로 넘치지 않는다** — 숨은 측정 글자(한글 100자)가 페이지를 넘친 일이 있다. Task 5 Step 8 과 Task 6 Step 4 가 1440, 1280, 1024, 390 폭에서 `scrollWidth` 를 본다(`overflow`).

---

## 파일 지도

| 파일 | 맡는 일 | 태스크 |
|---|---|---|
| `js/code-steps.js` (새) | 토크나이저, 파서, 그리기, 줄 나누기, 배치 | 1 |
| `scripts/test-code-steps.js` (새) | 파서와 그리기 단위 테스트 63개 | 1 |
| `scripts/check-code-blocks.js` (새) | 형식 검사, 옛 형식 기준표, `--json`, `--root` | 2 |
| `scripts/code-blocks-baseline.json` (새) | 글마다 옛 형식 블록 수 | 2, 4, 7, 8 |
| `scripts/check-python-outputs.py` (새) | 실행 검사 | 3 |
| `scripts/test-python-outputs.py` (새) | 실행 검사 시험 10개 | 3 |
| `.github/workflows/validate.yml` | 파이썬 준비와 검사 단계 넷 | 3 |
| `posts/two-tower-training.md` | 블록 3개 옮기기 | 4 |
| `js/main.js` | 코드 렌더러, Copy, 줄 접기, 배치 부르기, 용어 풀이와 수식 건너뛰기, 빈 줄 줄이기 순서 | 5 |
| `post.html` | 스크립트 한 줄, 글 칸 container 이름 | 5, 6 |
| `css/style.css` | 맨 끝에 코드 블록 묶음, 휴대폰 여백 | 5, 6 |
| `posts/algorithm-complexity-array.md` | 블록 5개 옮기기 | 7 |
| `posts/offpolicy-evaluation.md` | 블록 3개 옮기기 | 8 |
| `MARKDOWN_GUIDE.md`, `scripts/check-design.js` | 쓰는 규칙, 검사 머리 주석 | 9 |

---

### Task 1: 파서와 그리기 — `js/code-steps.js`

**Files:**
- Create: `js/code-steps.js`
- Create (test): `scripts/test-code-steps.js`

**Interfaces:**
- Consumes: 없음
- Produces (브라우저 `window.CodeSteps`, node `require('../js/code-steps.js')`):
  - `scan(src) → [{ text, toks: [{ k, v }], startsInString }]` — `k` 는 `comment`, `string`, `number`, `keyword`, `def`, `builtin`, `name`, `op`, `ws`
  - `parse(src)` → 옛 형식이면 `{ format: 'legacy', ok: true, errors: [], src }`. 새 형식이면 `{ format: 'steps', ok, errors: [{ line, msg }], labels: [{ kind: 'norun'|'cont'|'cont-post', text, post? }], head, rows: [{ n, title, detail: string[], from, items }], stepLines: [{ n, from }], codeEnd, out: null | { hint, varying, at, groups: [{ n|null, meaning, lines: string[], from }] }, src }`. `line` 은 블록 안 1부터, `from` 과 `codeEnd` 는 블록 안 0부터 센 줄 번호다. `n` 0 은 첫 단계 앞의 줄이다.
  - `render(model) → string` — `<div class="cb" data-src="…">…</div>`
  - `splitLines(html) → string[]`, `wrapLines(html, raw) → string`, `hasDrawing(raw) → boolean`
  - `widthCounts(s) → { wl, ww }`, `noteColumn(maxw, cap) → number`, `fitsNote(w, nc) → boolean`, `outputLayout(maxw, availCh, narrow) → 'three'|'stack'`
  - `mount(root) → void` (브라우저 전용 — 메모 자리, 접힘 막대, 출력 묶음 모양, 같은 번호 밝히기)

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`scripts/test-code-steps.js` 를 아래 내용으로 만든다.

````js
#!/usr/bin/env node
// 파이썬 코드 블록 파서(js/code-steps.js) 단위 테스트. DOM 이 없어도 도는 부분만 본다.
//
//   node scripts/test-code-steps.js
const C = require('../js/code-steps.js');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}
const kinds = line => C.scan(line)[0].toks.filter(t => t.k !== 'ws').map(t => `${t.k}:${t.v}`);
const msgs = src => C.parse(src).errors.map(e => `${e.line}:${e.msg}`);
const block = (...ls) => ls.join('\n');

console.log('토크나이저 — 주석과 문자열을 구분한다');
eq('줄 끝 주석', kinds('x = 1  # 하나'), ['name:x', 'op:=', 'number:1', 'comment:# 하나']);
eq('문자열 안의 # 은 주석이 아니다', kinds("s = '#1'  # 진짜 주석"), ['name:s', 'op:=', "string:'#1'", 'comment:# 진짜 주석']);
eq('f-string 안 중괄호는 문자열', kinds('print(f"{a:>3} #")'), ['builtin:print', 'op:(', 'string:f"{a:>3} #"', 'op:)']);
eq('raw 문자열의 \\\' 는 닫지 않는다', kinds("r'\\'' + x"), ["string:r'\\''", 'op:+', 'name:x']);
eq('def 뒤 이름', kinds('def softmax(xs):'), ['keyword:def', 'def:softmax', 'op:(', 'name:xs', 'op:)', 'op::']);
eq('속성 접근은 내장 함수로 보지 않는다', kinds('a.sum(x)'), ['name:a', 'op:.', 'name:sum', 'op:(', 'name:x', 'op:)']);
eq('숫자', kinds('1_000 3.5e-2 0x1F .5'), ['number:1_000', 'number:3.5e-2', 'number:0x1F', 'number:.5']);
eq('한글 이름', kinds('이웃 = []'), ['name:이웃', 'op:=', 'op:[', 'op:]']);
const tri = C.scan(block('s = """첫 줄', '# 1단계: 문자열 안', '끝"""  # 주석'));
eq('삼중 따옴표 안 줄은 문자열로 시작한다', tri.map(l => l.startsInString), [false, true, true]);
eq('삼중 따옴표가 닫힌 뒤 주석', tri[2].toks.map(t => t.k), ['string', 'ws', 'comment']);

console.log('\n파서 — 형식 판정');
eq('하는 일 줄이 없으면 옛 형식', C.parse(block('import math', 'print(1)')).format, 'legacy');
eq('의사코드 표시만 있으면 옛 형식', C.parse(block('# (의사코드 — 그대로 실행되지 않습니다.)', 'x = 1')).format, 'legacy');
const ok1 = C.parse(block(
  '# 하는 일: 두 수를 더한다.',
  'import math',
  '',
  '# 1단계: 값을 둔다',
  '# 더할 두 수다.',
  '# 둘 다 정수다.',
  'a, b = 1, 2          # 가상 값',
  '',
  '# 2단계: 더해서 찍는다',
  'print(a + b)',
  '',
  '# 출력:',
  '# 2단계 뜻: 1 과 2 를 더한 값이다.',
  '# 3'));
eq('새 형식', [ok1.format, ok1.ok], ['steps', true]);
eq('하는 일', ok1.head, '두 수를 더한다.');
eq('행: 첫 단계 앞 줄과 단계 둘', ok1.rows.map(r => r.n), [0, 1, 2]);
eq('단계 풀이는 한 문단으로 잇는다', ok1.rows[1].detail, ['더할 두 수다. 둘 다 정수다.']);
eq('줄 끝 주석은 메모', ok1.rows[1].items[0].note, '가상 값');
eq('행 끝 빈 줄은 뺀다', ok1.rows[1].items.map(x => x.kind), ['code']);
eq('단계 줄 위치(0부터)', ok1.stepLines, [{ n: 1, from: 3 }, { n: 2, from: 8 }]);
eq('코드 끝은 출력 표시 줄', ok1.codeEnd, 11);
eq('출력 묶음', ok1.out.groups.map(g => [g.n, g.meaning, g.lines]), [[2, '1 과 2 를 더한 값이다.', ['3']]]);

const notes = C.parse(block(
  '# 하는 일: 메모를 본다.',
  '# 1단계: 반복한다',
  'for i in range(2):',
  '    # 이어진 주석은',
  '    # 메모 하나로 잇는다',
  '    #',
  '    # 빈 주석 줄에서 나뉜다',
  '    x = i'));
eq('줄 사이 주석', notes.rows[0].items.filter(x => x.kind === 'note').map(x => [x.ind, x.text]),
  [[4, '이어진 주석은 메모 하나로 잇는다'], [4, '빈 주석 줄에서 나뉜다']]);

const nosteps = C.parse(block('# 하는 일: 한 줄을 찍는다.', 'print("hi")', '', '# 출력:', '# 뜻: 인사다.', '# hi'));
eq('단계 없는 블록', [nosteps.ok, nosteps.rows.map(r => r.n), nosteps.out.groups[0].n], [true, [0], null]);

const labels = C.parse(block('# (앞 블록에 이어서 돌린다.)', '# 하는 일: 이어서 돈다.', 'print(x)'));
eq('상태 표시', labels.labels, [{ kind: 'cont', text: '앞 블록에 이어서' }]);
const labels2 = C.parse(block('# (feedback-loop-bias 글의 코드에 이어서 돌린다.)', '# 하는 일: 앞 글에 이어서 돈다.', 'run()'));
eq('다른 글에 이어서', labels2.labels, [{ kind: 'cont-post', post: 'feedback-loop-bias', text: '앞 글에 이어서' }]);
const labels3 = C.parse(block('# (발췌 — 그대로 실행되지 않습니다.)', '# 하는 일: 조각이다.', '    return x'));
eq('실행 안 됨', labels3.labels, [{ kind: 'norun', text: '발췌' }]);

const varying = C.parse(block('# 하는 일: 시간을 잰다.', 'print(1)', '# 출력 (시간은 돌릴 때마다 다르다):', '# 뜻: 잰 시간이다.', '# 1'));
eq('「돌릴 때마다」 는 숫자를 빼고 비교', [varying.out.hint, varying.out.varying], ['시간은 돌릴 때마다 다르다', true]);

const blanks = C.parse(block('# 하는 일: 빈 줄을 찍는다.', 'print()', 'print("a")', '', '# 출력:', '# 뜻: 빈 줄 다음 a 다.', '#', '# a', '# ', '#   b  '));
eq('빈 찍힌 줄과 앞 공백', blanks.out.groups[0].lines, ['', 'a', '', '  b']);

const inString = C.parse(block('# 하는 일: 문자열 안 표시.', 's = """', '# 1단계: 문자열이다', '"""', 'print(s)'));
eq('여러 줄 문자열 안의 단계 표시는 표시가 아니다', inString.rows.map(r => r.n), [0]);

console.log('\n파서 — 형식 오류');
eq('단계 번호를 건너뛰면', msgs(block('# 하는 일: x.', '# 1단계: 하나', 'a = 1', '# 3단계: 셋', 'b = 2')), ['4:단계 번호는 2 이어야 합니다']);
eq('들여쓴 단계 표시', msgs(block('# 하는 일: x.', 'def f():', '    # 1단계: 안쪽', '    return 1')),
  ['3:단계 표시는 들여쓰기 없이 `# N단계: 제목` 꼴로 씁니다']);
eq('뜻 줄 없는 찍힌 줄', msgs(block('# 하는 일: x.', 'print(1)', '# 출력:', '# 1')), ['4:찍힌 줄 앞에 뜻 줄이 있어야 합니다']);
eq('찍힌 줄 없는 뜻 줄', msgs(block('# 하는 일: x.', 'print(1)', '# 출력:', '# 뜻: 하나.')),
  ['4:뜻 줄 아래에 찍힌 줄이 없습니다']);
eq('없는 단계를 가리키는 뜻', msgs(block('# 하는 일: x.', '# 1단계: 하나', 'print(1)', '# 출력:', '# 2단계 뜻: 둘.', '# 1')),
  ['5:2단계가 이 블록에 없습니다']);
eq('단계 없는 블록의 번호 붙은 뜻', msgs(block('# 하는 일: x.', 'print(1)', '# 출력:', '# 1단계 뜻: 하나.', '# 1')),
  ['4:단계 없는 블록의 뜻 줄에는 번호를 붙이지 않습니다']);
eq('출력 뒤 코드', msgs(block('# 하는 일: x.', 'print(1)', '# 출력:', '# 뜻: 하나.', '# 1', 'print(2)')),
  ['6:출력 영역 뒤에는 코드 줄을 둘 수 없습니다']);
eq('출력 영역의 빈 줄', msgs(block('# 하는 일: x.', 'print(1)', '# 출력:', '# 뜻: 하나.', '# 1', '', '# 2')),
  ['6:출력 영역의 빈 줄은 `#` 로 씁니다']);
eq('다른 꼴의 출력 표시', msgs(block('# 하는 일: x.', 'print(1)', '# 출력 예시:', '# 뜻: 하나.', '# 1')),
  ['3:출력 표시는 `# 출력:` 또는 `# 출력 (…):` 로 씁니다']);
eq('자리를 벗어난 하는 일', msgs(block('import math', '# 하는 일: x.', 'print(1)')),
  ['2:하는 일 줄은 블록 맨 위, 상태 표시 바로 다음 줄에 둡니다']);
eq('모르는 상태 표시', msgs(block('# (나중에 돌린다.)', '# 하는 일: x.', 'print(1)')),
  ['1:상태 표시는 정해진 세 가지 꼴 가운데 하나로 씁니다', '2:하는 일 줄은 블록 맨 위, 상태 표시 바로 다음 줄에 둡니다']);
eq('비어 있는 하는 일', msgs(block('# 하는 일:', 'print(1)')), ['1:하는 일이 비어 있습니다']);
eq('「# 출력을 …」 같은 주석은 출력 표시가 아니다', C.parse(block('# 하는 일: x.', '# 출력을 정리한다', 'print(1)')).out, null);

console.log('\n그리기');
const html = C.render(ok1);
eq('원문을 data-src 에 그대로', /data-src="([^"]*)"/.exec(html)[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'), ok1.src);
eq('단계가 있으면 cb-nosteps 가 아니다', html.includes('class="cb cb-nosteps"'), false);
eq('단계 없는 블록은 cb-nosteps', C.render(nosteps).includes('class="cb cb-nosteps"'), true);
eq('빈 괄호 사이에는 접는 자리를 두지 않는다', C.render(nosteps).includes('print</span>(<wbr>'), true);
eq('여는 괄호 뒤 접는 자리', C.render(C.parse(block('# 하는 일: x.', 'f(a, b)'))).includes('(<wbr>a,<wbr> b)'), true);
eq('빈 괄호', C.render(C.parse(block('# 하는 일: x.', 'f()'))).includes('f()'), true);
eq('메모가 달린 줄', html.includes('data-wl="11" data-ww="0" data-note="1"'), true);
eq('글자 이스케이프', C.render(C.parse(block('# 하는 일: <b> & "q"', 'x = 1'))).includes('&lt;b&gt; &amp; &quot;q&quot;'), true);
eq('묶음 앞뒤 빈 찍힌 줄은 그리지 않는다', (C.render(blanks).match(/class="cb-oln"/g) || []).length, 3);
eq('다른 글 링크', C.render(labels2).includes('<a class="cb-label" href="post.html?id=feedback-loop-bias">앞 글에 이어서</a>'), true);

console.log('\n파이썬이 아닌 블록 — 줄 나누기');
eq('열린 span 을 닫고 다시 연다', C.splitLines('<span class="a">x\ny</span>z'), ['<span class="a">x</span>', '<span class="a">y</span>z']);
eq('겹친 span', C.splitLines('<span class="a"><span class="b">1\n2</span></span>'),
  ['<span class="a"><span class="b">1</span></span>', '<span class="a"><span class="b">2</span></span>']);
eq('들여쓰기를 떼고 --ind 로', C.wrapLines('  <span class="k">key</span>: 1\nb', '  key: 1\nb'),
  '<span class="cb-ln" style="--ind:2"><span class="cb-src"><span class="k">key</span>: 1</span></span>' +
  '<span class="cb-ln" style="--ind:0"><span class="cb-src">b</span></span>');
eq('선 글자 그림', [C.hasDrawing('┌─┐'), C.hasDrawing('a -> b')], [true, false]);

console.log('\n배치 계산');
eq('메모 자리 = 가장 긴 줄 + 2', C.noteColumn(40, 86), 42);
eq('메모 자리는 cap - 22 를 넘지 않는다', C.noteColumn(80, 86), 64);
eq('메모가 들어가나', [C.fitsNote(40, 42), C.fitsNote(41, 42)], [true, false]);
eq('출력 세 열', C.outputLayout(50, 120, false), 'three');
eq('출력이 넓으면 뜻을 아래로', C.outputLayout(80, 120, false), 'stack');
eq('좁은 블록은 늘 아래로', C.outputLayout(10, 120, true), 'stack');
eq('한글 폭', C.widthCounts('손실 8.2'), { wl: 4, ww: 2 });

console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
````

- [ ] **Step 2: 테스트가 실패하는지 본다**

Run: `node scripts/test-code-steps.js`
Expected: `Error: Cannot find module '../js/code-steps.js'` 로 멈춘다.

- [ ] **Step 3: 모듈을 쓴다**

`js/code-steps.js` 를 아래 내용으로 만든다.

````js
/* 파이썬 코드 블록 — 하는 일, 단계, 뜻.
 * 설계: docs/superpowers/specs/2026-10-13-python-code-blocks-design.md
 * 브라우저에서는 window.CodeSteps, node 에서는 module.exports.
 * 화면(js/main.js)과 형식 검사(scripts/check-code-blocks.js)가 이 파일 하나로 블록을 읽는다. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CodeSteps = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- 토크나이저 ----------
  const KEYWORDS = new Set(('False None True and as assert async await break class continue def del elif else ' +
    'except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield').split(' '));
  const BUILTINS = new Set(('abs all any bool dict divmod enumerate filter float format frozenset getattr hasattr ' +
    'int isinstance iter len list map max min next object open pow print range repr reversed round set ' +
    'setattr sorted str sum super tuple type zip').split(' '));
  const STR_START = /^(?:[rRbBuUfF]|[rR][bBfF]|[bBfF][rR])?('''|"""|'|")/;
  const NUMBER = /^(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?[jJ]?)/;
  const NAME = /^[A-Za-z_\u0080-￿][A-Za-z0-9_\u0080-￿]*/;
  const WIDE = /[ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿ꥠ-꥿가-힣豈-﫿︰-﹏＀-｠￠-￦]/;

  // q 로 닫히는 자리 바로 뒤. 없으면 -1. 백슬래시는 늘 다음 글자를 건너뛴다.
  function closeString(text, from, q) {
    for (let j = from; j < text.length; j++) {
      if (text[j] === '\\') { j++; continue; }
      if (text.startsWith(q, j)) return j + q.length;
    }
    return -1;
  }

  // 줄마다 { text, toks: [{ k, v }], startsInString } 를 돌려준다.
  // k: comment, string, number, keyword, def, builtin, name, op, ws
  function scan(src) {
    const out = [];
    let str = null; // 다음 줄로 이어지는 문자열 { q }
    for (const text of String(src).split('\n')) {
      const toks = [];
      const startsInString = !!str;
      let i = 0;
      let prev = null; // 공백이 아닌 바로 앞 토큰
      if (str) {
        const end = closeString(text, 0, str.q);
        if (end < 0) {
          if (text) toks.push({ k: 'string', v: text });
          if (str.q.length === 1 && !text.endsWith('\\')) str = null;
          out.push({ text, toks, startsInString });
          continue;
        }
        toks.push({ k: 'string', v: text.slice(0, end) });
        prev = toks[0];
        i = end;
        str = null;
      }
      while (i < text.length) {
        const c = text[i];
        const rest = text.slice(i);
        let m;
        if (c === ' ' || c === '\t') {
          m = /^[ \t]+/.exec(rest);
          toks.push({ k: 'ws', v: m[0] });
          i += m[0].length;
          continue;
        }
        if (c === '#') { toks.push({ k: 'comment', v: rest }); break; }
        if ((m = STR_START.exec(rest))) {
          const end = closeString(text, i + m[0].length, m[1]);
          if (end >= 0) {
            toks.push({ k: 'string', v: text.slice(i, end) });
            prev = toks[toks.length - 1];
            i = end;
            continue;
          }
          toks.push({ k: 'string', v: rest });
          if (m[1].length === 3 || text.endsWith('\\')) str = { q: m[1] };
          break;
        }
        if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(text[i + 1] || ''))) {
          m = NUMBER.exec(rest);
          toks.push({ k: 'number', v: m[0] });
          prev = toks[toks.length - 1];
          i += m[0].length;
          continue;
        }
        if ((m = NAME.exec(rest))) {
          const v = m[0];
          let k = 'name';
          if (KEYWORDS.has(v)) k = 'keyword';
          else if (prev && prev.k === 'keyword' && (prev.v === 'def' || prev.v === 'class')) k = 'def';
          else if (BUILTINS.has(v) && !(prev && prev.v === '.')) k = 'builtin';
          toks.push({ k, v });
          prev = toks[toks.length - 1];
          i += v.length;
          continue;
        }
        toks.push({ k: 'op', v: c });
        prev = toks[toks.length - 1];
        i += 1;
      }
      out.push({ text, toks, startsInString });
    }
    return out;
  }

  // ---------- 파서 ----------
  const HEAD = /^# 하는 일:(.*)$/;
  const STATUS = [
    { re: /^# \((.+?) — 그대로 실행되지 않습니다\.\)\s*$/, make: m => ({ kind: 'norun', text: m[1] }) },
    { re: /^# \(앞 블록에 이어서 돌린다\.\)\s*$/, make: () => ({ kind: 'cont', text: '앞 블록에 이어서' }) },
    { re: /^# \(([a-z0-9-]+) 글의 코드에 이어서 돌린다\.\)\s*$/, make: m => ({ kind: 'cont-post', post: m[1], text: '앞 글에 이어서' }) },
  ];
  const STEP = /^# (\d+)단계: (.*\S)\s*$/;
  const STEP_LOOSE = /^\s*#\s*\d+\s*단계\s*:/;
  const OUT_ANY = /^# 출력(?=[\s(:]|$)/;
  const OUT = /^# 출력(?: \((.+)\))?:\s*$/;
  const MEAN = /^# (?:(\d+)단계 )?뜻: (.*\S)\s*$/;
  const MEAN_LOOSE = /^#\s*(?:\d+\s*단계\s*)?뜻\s*:/;

  function parse(src) {
    const text = String(src).replace(/\r\n?/g, '\n').replace(/\s+$/, '');
    const lines = text.split('\n');
    const info = scan(text);
    const n = lines.length;
    const errors = [];
    const err = (j, msg) => errors.push({ line: j + 1, msg });
    const first = j => info[j].toks.find(t => t.k !== 'ws');
    const isComment = j => !info[j].startsInString && !!first(j) && first(j).k === 'comment';
    const isCol0 = j => isComment(j) && lines[j][0] === '#';

    let i = 0;
    const labels = [];
    for (; i < n && isCol0(i); i++) {
      const st = STATUS.find(s => s.re.test(lines[i]));
      if (!st) break;
      labels.push(st.make(st.re.exec(lines[i])));
    }
    let outAt = -1;
    for (let j = 0; j < n; j++) if (isCol0(j) && OUT_ANY.test(lines[j])) { outAt = j; break; }
    const bodyEnd = outAt < 0 ? n : outAt;

    if (!(i < n && isCol0(i) && HEAD.test(lines[i]))) {
      let stray = -1;
      for (let j = 0; j < bodyEnd; j++) if (isCol0(j) && HEAD.test(lines[j])) { stray = j; break; }
      if (stray < 0) return { format: 'legacy', ok: true, errors: [], src: text };
      if (i < n && isCol0(i) && /^# \(.*\)\s*$/.test(lines[i])) err(i, '상태 표시는 정해진 세 가지 꼴 가운데 하나로 씁니다');
      err(stray, '하는 일 줄은 블록 맨 위, 상태 표시 바로 다음 줄에 둡니다');
      return { format: 'steps', ok: false, errors, src: text };
    }
    const headAt = i;
    const head = HEAD.exec(lines[headAt])[1].trim();
    if (!head) err(headAt, '하는 일이 비어 있습니다');

    // 몸통 — 단계로 나눈다. 번호 0 은 첫 단계 앞의 줄이다.
    const raw = [];
    let cur = { n: 0, title: '', detail: [], from: headAt + 1, lines: [] };
    let expect = 1;
    for (let j = headAt + 1; j < bodyEnd; j++) {
      if (isCol0(j) && HEAD.test(lines[j])) { err(j, '하는 일 줄은 블록에 하나만 둡니다'); continue; }
      const m = isCol0(j) ? STEP.exec(lines[j]) : null;
      if (m) {
        const num = Number(m[1]);
        if (num !== expect) err(j, `단계 번호는 ${expect} 이어야 합니다`);
        expect = num + 1;
        raw.push(cur);
        cur = { n: num, title: m[2], detail: [], from: j, lines: [] };
        let para = [];
        let k = j + 1;
        for (; k < bodyEnd && isCol0(k) && !STEP.test(lines[k]) && !HEAD.test(lines[k]); k++) {
          const t = lines[k].replace(/^#\s?/, '').trim();
          if (!t) { if (para.length) cur.detail.push(para.join(' ')); para = []; } else para.push(t);
        }
        if (para.length) cur.detail.push(para.join(' '));
        j = k - 1;
        continue;
      }
      if (isComment(j) && STEP_LOOSE.test(lines[j])) err(j, '단계 표시는 들여쓰기 없이 `# N단계: 제목` 꼴로 씁니다');
      cur.lines.push(j);
    }
    raw.push(cur);

    function items(idx) {
      const out = [];
      let note = null; // 이어 붙일 수 있는 줄 사이 메모
      for (const j of idx) {
        const indent = lines[j].length - lines[j].replace(/^[ \t]+/, '').length;
        if (!info[j].startsInString && !lines[j].trim()) { out.push({ kind: 'blank' }); note = null; continue; }
        if (isComment(j)) {
          const t = lines[j].trim().replace(/^#\s?/, '').trim();
          if (!t) { note = null; continue; }
          if (note && note.ind === indent) note.text += ' ' + t;
          else { note = { kind: 'note', ind: indent, text: t }; out.push(note); }
          continue;
        }
        note = null;
        const toks = info[j].toks.slice();
        let trail = null;
        if (toks.length && toks[toks.length - 1].k === 'comment') trail = toks.pop().v.replace(/^#\s?/, '').trim() || null;
        while (toks.length && toks[toks.length - 1].k === 'ws') toks.pop();
        out.push({ kind: 'code', line: j, ind: indent, toks, note: trail });
      }
      while (out.length && out[0].kind === 'blank') out.shift();
      while (out.length && out[out.length - 1].kind === 'blank') out.pop();
      return out;
    }
    const steps = raw.filter(r => r.n > 0).map(r => r.n);
    const rows = raw.map(r => ({ n: r.n, title: r.title, detail: r.detail, from: r.from, items: items(r.lines) }))
      .filter(r => r.n > 0 || r.items.length);

    // 출력 영역 — 뜻 줄이 아래 찍힌 줄들의 머리다.
    let out = null;
    if (outAt >= 0) {
      const om = OUT.exec(lines[outAt]);
      if (!om) err(outAt, '출력 표시는 `# 출력:` 또는 `# 출력 (…):` 로 씁니다');
      const hint = om && om[1] ? om[1].trim() : '';
      out = { hint, varying: /돌릴 때마다/.test(hint), at: outAt, groups: [] };
      let g = null;
      for (let j = outAt + 1; j < n; j++) {
        const l = lines[j];
        if (!l.startsWith('#')) {
          err(j, l.trim() ? '출력 영역 뒤에는 코드 줄을 둘 수 없습니다' : '출력 영역의 빈 줄은 `#` 로 씁니다');
          continue;
        }
        const mm = MEAN.exec(l);
        if (mm) { g = { n: mm[1] ? Number(mm[1]) : null, meaning: mm[2], lines: [], from: j }; out.groups.push(g); continue; }
        if (MEAN_LOOSE.test(l)) { err(j, '뜻 줄은 `# N단계 뜻: …` 또는 `# 뜻: …` 꼴로 씁니다'); continue; }
        const t = l === '#' ? '' : l.startsWith('# ') ? l.slice(2) : l.slice(1);
        if (!g) { err(j, '찍힌 줄 앞에 뜻 줄이 있어야 합니다'); g = { n: null, meaning: '', lines: [], from: j }; out.groups.push(g); }
        g.lines.push(t.replace(/\s+$/, ''));
      }
      if (!out.groups.length) err(outAt, '출력 표시 아래에 뜻 줄과 찍힌 줄이 없습니다');
      for (const gg of out.groups) {
        if (!gg.lines.length) err(gg.from, '뜻 줄 아래에 찍힌 줄이 없습니다');
        if (steps.length && gg.n !== null && !steps.includes(gg.n)) err(gg.from, `${gg.n}단계가 이 블록에 없습니다`);
        if (!steps.length && gg.n !== null) err(gg.from, '단계 없는 블록의 뜻 줄에는 번호를 붙이지 않습니다');
      }
    }
    return {
      format: 'steps', ok: errors.length === 0, errors, labels, head, rows,
      stepLines: raw.filter(r => r.n > 0).map(r => ({ n: r.n, from: r.from })),
      codeEnd: bodyEnd, out, src: text,
    };
  }

  // ---------- 그리기 ----------
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const CLS = { keyword: 'cb-k', def: 'cb-fn', builtin: 'cb-bi', string: 'cb-s', number: 'cb-n' };

  function widthCounts(s) {
    let wl = 0, ww = 0;
    for (const ch of s) { if (WIDE.test(ch)) ww++; else wl++; }
    return { wl, ww };
  }

  // 앞의 들여쓰기 ind 글자를 토큰에서 떼어 낸다.
  function dropIndent(toks, ind) {
    const out = toks.slice();
    let left = ind;
    while (left > 0 && out.length) {
      const t = out[0];
      if (t.v.length <= left) { left -= t.v.length; out.shift(); } else { out[0] = { k: t.k, v: t.v.slice(left) }; left = 0; }
    }
    return out;
  }

  // 점, 쉼표, 여는 괄호 뒤에 접는 자리(<wbr>)를 둔다. 바로 닫히는 빈 괄호는 뺀다.
  function codeHtml(toks) {
    let h = '';
    toks.forEach((tk, t) => {
      if (tk.k === 'op') {
        const next = toks[t + 1] ? toks[t + 1].v[0] : '';
        const brk = tk.v === '.' || tk.v === ',' || ((tk.v === '(' || tk.v === '[') && next !== ')' && next !== ']');
        h += esc(tk.v) + (brk ? '<wbr>' : '');
      } else if (CLS[tk.k]) h += `<span class="${CLS[tk.k]}">${esc(tk.v)}</span>`;
      else h += esc(tk.v);
    });
    return h;
  }

  function lineHtml(it) {
    if (it.kind === 'blank') return '<div class="cb-ln cb-blank"><span class="cb-src"> </span></div>';
    if (it.kind === 'note') return `<div class="cb-ln cb-ln-note" style="--ind:${it.ind}"><span class="cb-note">${esc(it.text)}</span></div>`;
    const toks = dropIndent(it.toks, it.ind);
    const w = widthCounts(toks.map(t => t.v).join(''));
    const note = it.note ? `<span class="cb-note">${esc(it.note)}</span>` : '';
    return `<div class="cb-ln${it.note ? ' has-note' : ''}" style="--ind:${it.ind}" data-wl="${it.ind + w.wl}" data-ww="${w.ww}"` +
      `${it.note ? ' data-note="1"' : ''}><span class="cb-src"><span class="cb-t">${codeHtml(toks) || ' '}</span></span>${note}</div>`;
  }

  function outLineHtml(t) {
    const ind = t.length - t.replace(/^ +/, '').length;
    const w = widthCounts(t);
    return `<div class="cb-oln" style="--ind:${ind}" data-wl="${w.wl}" data-ww="${w.ww}"><span class="cb-src">${esc(t.slice(ind)) || ' '}</span></div>`;
  }

  // 묶음 맨 앞과 맨 끝의 빈 줄은 그리지 않는다(검사는 그대로 비교한다).
  function trimBlank(ls) {
    let a = 0, b = ls.length;
    while (a < b && !ls[a].trim()) a++;
    while (b > a && !ls[b - 1].trim()) b--;
    return ls.slice(a, b);
  }

  function render(m) {
    const nosteps = !m.rows.some(r => r.n > 0);
    const labels = m.labels.map(l => (l.kind === 'cont-post'
      ? `<a class="cb-label" href="post.html?id=${esc(l.post)}">${esc(l.text)}</a>`
      : `<span class="cb-label">${esc(l.text)}</span>`)).join('');
    const rows = m.rows.map(r => {
      const exp = r.n > 0
        ? `<div class="cb-exp"><span class="cb-num">${r.n}</span><b>${esc(r.title)}</b>${r.detail.map(p => `<p>${esc(p)}</p>`).join('')}</div>`
        : '<div class="cb-exp cb-exp0"></div>';
      return `<div class="cb-row" data-step="${r.n}">${exp}<div class="cb-code">${r.items.map(lineHtml).join('')}</div></div>`;
    }).join('');
    let out = '';
    if (m.out) {
      const groups = m.out.groups.map(g => {
        const num = g.n !== null ? `<span class="cb-num cb-num-o">${g.n}</span>` : '<span class="cb-num-none"></span>';
        return `<div class="cb-grp" data-step="${g.n !== null ? g.n : ''}">${num}` +
          `<div class="cb-out-lines">${trimBlank(g.lines).map(outLineHtml).join('')}</div>` +
          `<div class="cb-out-mean">${esc(g.meaning)}</div></div>`;
      }).join('');
      out = '<div class="cb-out" data-layout="three">' +
        `<div class="cb-out-head"><span class="cb-out-tab">출력</span>${m.out.hint ? `<span class="cb-out-hint">${esc(m.out.hint)}</span>` : ''}</div>` +
        `<div class="cb-out-cols"><span>단계</span><span>찍힌 줄</span><span>뜻</span></div>${groups}</div>`;
    }
    return `<div class="cb${nosteps ? ' cb-nosteps' : ''}" data-src="${esc(m.src)}">` +
      // 글자 폭을 재는 숨은 글자. 크기 0 인 상자 안에 둬서 페이지 폭을 늘리지 않는다.
      `<span class="cb-probes" aria-hidden="true"><span class="cb-probe">${'0'.repeat(100)}</span>` +
      `<span class="cb-probe cb-probe-w">${'가'.repeat(100)}</span></span>` +
      `<div class="cb-head"><div class="cb-meta"><span class="cb-kicker">이 코드가 하는 일</span>${labels}` +
      '<span class="cb-lang">python</span><button class="cb-copy copy-btn" type="button">Copy</button></div>' +
      `<div class="cb-title">${esc(m.head)}</div></div>` +
      `<div class="cb-rows">${rows}</div>${out}</div>`;
  }

  // ---------- 파이썬이 아닌 블록 ----------
  // hljs 가 만든 HTML 을 줄마다 나눈다. 줄 끝에서 열린 span 을 닫고 다음 줄 앞에서 다시 연다.
  function splitLines(html) {
    const out = [];
    const stack = [];
    let cur = '';
    const re = /(<span\b[^>]*>)|(<\/span>)|(\n)|([^<\n]+)|(<[^>]*>)/g;
    let m;
    while ((m = re.exec(html))) {
      if (m[1]) { stack.push(m[1]); cur += m[1]; } else if (m[2]) { stack.pop(); cur += m[2]; } else if (m[3]) {
        cur += '</span>'.repeat(stack.length);
        out.push(cur);
        cur = stack.join('');
      } else cur += m[0];
    }
    out.push(cur);
    return out;
  }

  // 선 글자(U+2500~U+259F)로 그린 그림은 접지 않는다.
  const hasDrawing = raw => /[─-▟]/.test(raw);

  function wrapLines(html, raw) {
    const parts = splitLines(String(html).replace(/\n$/, ''));
    const rawLines = String(raw).replace(/\n$/, '').split('\n');
    return parts.map((h, i) => {
      const r = rawLines[i] || '';
      const ind = r.length - r.replace(/^ +/, '').length;
      return `<span class="cb-ln" style="--ind:${ind}"><span class="cb-src">${stripIndent(h, ind) || ' '}</span></span>`;
    }).join('');
  }

  // 줄 HTML 의 앞 공백 ind 개를 뗀다(태그는 건드리지 않는다).
  function stripIndent(h, ind) {
    let left = ind;
    return h.replace(/(<[^>]*>)|( +)/g, (m, tag, sp) => {
      if (tag || left <= 0) return m;
      const cut = Math.min(left, sp.length);
      left -= cut;
      return sp.slice(cut);
    });
  }

  // ---------- 배치(브라우저) ----------
  const noteColumn = (maxw, cap) => Math.max(0, Math.min(Math.ceil(maxw) + 2, cap - 22));
  const fitsNote = (w, nc) => w + 2 <= nc;
  const outputLayout = (maxw, availCh, narrow) => (!narrow && Math.ceil(maxw) + 2 <= 0.6 * availCh ? 'three' : 'stack');

  function layout(cb) {
    const probe = cb.querySelector('.cb-probe');
    const probeW = cb.querySelector('.cb-probe-w');
    const ch = probe.getBoundingClientRect().width / 100;
    if (!ch) return;
    const wide = probeW.getBoundingClientRect().width / 100 / ch; // 한글 한 자 = 라틴 몇 자
    const width = el => Number(el.dataset.wl) + Number(el.dataset.ww) * wide;
    const narrow = cb.getBoundingClientRect().width <= 600;
    cb.querySelectorAll('.cb-code').forEach(code => {
      const cs = getComputedStyle(code);
      const avail = code.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const noted = code.querySelectorAll('.cb-ln[data-note]');
      let maxw = 0;
      noted.forEach(l => { maxw = Math.max(maxw, width(l)); });
      const nc = noteColumn(maxw, Math.floor(avail / ch));
      code.style.setProperty('--nc', nc);
      noted.forEach(l => l.classList.toggle('is-drop', narrow || !fitsNote(width(l), nc)));
    });
    const out = cb.querySelector('.cb-out');
    if (out) {
      let maxo = 0;
      out.querySelectorAll('.cb-oln').forEach(l => { maxo = Math.max(maxo, width(l)); });
      out.style.setProperty('--oc', Math.ceil(maxo) + 2);
      out.dataset.layout = outputLayout(maxo, out.clientWidth / ch, narrow);
    }
    markWrapped(cb);
  }

  // 접힌 줄에 막대를 붙인다. getClientRects 는 글자 조각마다 상자를 돌려줘서 높이로 본다.
  function markWrapped(root) {
    root.querySelectorAll('.cb-src').forEach(s => {
      const lh = parseFloat(getComputedStyle(s).lineHeight);
      s.parentElement.classList.toggle('is-wrapped', lh > 0 && s.getBoundingClientRect().height > lh * 1.5);
    });
  }

  function hover(cb) {
    const set = n => cb.querySelectorAll('[data-step]').forEach(el => {
      el.classList.toggle('is-hot', !!n && n !== '0' && el.dataset.step === n);
    });
    cb.addEventListener('mouseover', e => {
      const t = e.target.closest('[data-step]');
      set(t ? t.dataset.step : null);
    });
    cb.addEventListener('mouseleave', () => set(null));
  }

  function mount(root) {
    const blocks = [...root.querySelectorAll('.cb')];
    const wraps = [...root.querySelectorAll('pre.cb-wrap')];
    const redo = () => { blocks.forEach(layout); wraps.forEach(markWrapped); };
    blocks.forEach(hover);
    redo();
    if (typeof ResizeObserver !== 'undefined') {
      let raf = 0;
      const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(redo); });
      blocks.concat(wraps).forEach(el => ro.observe(el));
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redo);
  }

  return { scan, parse, render, splitLines, wrapLines, hasDrawing, widthCounts, noteColumn, fitsNote, outputLayout, mount };
});
````

- [ ] **Step 4: 테스트가 통과하는지 본다**

Run: `node scripts/test-code-steps.js`
Expected: 마지막 줄 `63 통과, 0 실패`, 종료 코드 0.

- [ ] **Step 5: 실제 블록에서 주석 위치를 파이썬 토크나이저와 견준다**

토크나이저가 문자열 안의 `#` 을 주석으로 잘못 보면 메모와 표시를 잘못 읽는다. 블로그의 파이썬 블록 전부에서 주석 위치를 파이썬 `tokenize` 와 견준다.

Run (저장소 루트, `SCRATCH` 를 정한 뒤):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch1"; mkdir -p "$SCRATCH"
node -e "
const fs=require('fs'),C=require('./js/code-steps.js');
const F=/^\`\`\`python[^\n]*\n([\s\S]*?)^\`\`\`[ \t]*$/gm, out=[]; let legacy=0;
for (const p of fs.readdirSync('posts').filter(x=>x.endsWith('.md')).sort()) {
  const t=fs.readFileSync('posts/'+p,'utf8'); let m, bi=0;
  while ((m=F.exec(t))) { if (C.parse(m[1]).format==='legacy') legacy++;
    C.scan(m[1].replace(/\s+$/,'')).forEach((l,i)=>{ let col=0; for (const tk of l.toks) { if (tk.k==='comment') out.push([p,bi,i+1,col]); col+=tk.v.length; } }); bi++; }
}
fs.writeFileSync('$SCRATCH/js_comments.json', JSON.stringify(out)); console.log('legacy', legacy, 'comments', out.length);
" && SCRATCH="$SCRATCH" python3 - <<'EOF'
import glob, io, json, os, re, tokenize
F = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
js = set(map(tuple, json.load(open(os.environ['SCRATCH'] + '/js_comments.json'))))
py = set()
for p in sorted(glob.glob('posts/*.md')):
    for bi, m in enumerate(F.finditer(open(p, encoding='utf-8').read())):
        for tok in tokenize.generate_tokens(io.StringIO(m.group(1).rstrip() + '\n').readline):
            if tok.type == tokenize.COMMENT:
                py.add((os.path.basename(p), bi, tok.start[0], tok.start[1]))
print('only in js', len(js - py), 'only in py', len(py - js))
EOF
````

Expected: `legacy 247 comments 3703` 다음 줄 `only in js 0 only in py 0`. 글이 그사이 바뀌었으면 앞의 두 숫자는 달라질 수 있다. 뒤의 두 숫자는 0 이어야 한다.

- [ ] **Step 6: 커밋**

````bash
git add js/code-steps.js scripts/test-code-steps.js
git commit -F - <<'EOF'
feat(js): 파이썬 블록을 하는 일, 단계, 뜻으로 읽고 그리는 code-steps.js 와 단위 테스트 63개

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 2: 형식 검사 — `scripts/check-code-blocks.js`

**Files:**
- Create: `scripts/check-code-blocks.js`
- Create: `scripts/code-blocks-baseline.json` (Step 2 의 명령이 만든다)

**Interfaces:**
- Consumes: `CodeSteps.parse` (Task 1)
- Produces:
  - `node scripts/check-code-blocks.js` — 종료 코드 0 또는 1, 마지막 줄 `✓|✗ 새 형식 블록 N개, 옛 형식 블록 M개, 문제 K건`
  - `--update` — 기준표를 다시 적는다
  - `--json` — stdout 에 `[{ post, index, format, ok, src, labels, stepLines, codeEnd, out: { varying, groups: [{ n, lines }] } | null }]` (Task 3 이 읽는다)
  - `--root <폴더>` — 그 폴더의 `posts/` 와 `scripts/code-blocks-baseline.json` 을 쓴다(시험용)

- [ ] **Step 1: 검사를 쓴다**

`scripts/check-code-blocks.js` 를 아래 내용으로 만든다.

````js
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
````

- [ ] **Step 2: 기준표를 만든다**

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 247개, 글 85편`. `scripts/code-blocks-baseline.json` 이 생긴다.

- [ ] **Step 3: 지금 글이 통과하는지 본다**

Run: `node scripts/check-code-blocks.js`
Expected: `✓ 새 형식 블록 0개, 옛 형식 블록 247개, 문제 0건`, 종료 코드 0.

- [ ] **Step 4: 틀린 글을 잡는지 본다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch1"; mkdir -p "$SCRATCH"
T="$SCRATCH/fmt-neg" && rm -rf "$T" && mkdir -p "$T/posts" "$T/scripts"
printf '# 시험\n\n```python\n# 하는 일: 번호를 건너뛴다.\n# 1단계: 하나\na = 1\n# 3단계: 셋\nprint(a)\n\n# 출력:\n# 1\n```\n\n```python\nprint("옛 형식")\n```\n' > "$T/posts/broken.md"
node scripts/check-code-blocks.js --root "$T"; echo "exit $?"
````

Expected:

````text
✗ posts/broken.md:7  단계 번호는 2 이어야 합니다
✗ posts/broken.md:11  찍힌 줄 앞에 뜻 줄이 있어야 합니다
✗ posts/broken.md  옛 형식 파이썬 블록 1개 (기준표 0개). 새 블록은 「# 하는 일:」 형식으로 씁니다
✗ 새 형식 블록 1개, 옛 형식 블록 1개, 문제 3건
exit 1
````

- [ ] **Step 5: `--json` 이 잘리지 않고 다 나오는지 본다**

큰 출력(600KB 안팎)이 파이프에서 잘리면 Task 3 이 JSON 을 못 읽는다.

Run: `node scripts/check-code-blocks.js --json | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d), sum(b['format']=='legacy' for b in d))"`
Expected: `247 247`

- [ ] **Step 6: 커밋**

````bash
git add scripts/check-code-blocks.js scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(scripts): 파이썬 블록 형식 검사와 옛 형식 기준표 — 247개 모두 옛 형식으로 시작

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 3: 실행 검사와 CI

**Files:**
- Create: `scripts/check-python-outputs.py`
- Create (test): `scripts/test-python-outputs.py`
- Modify: `.github/workflows/validate.yml`

**Interfaces:**
- Consumes: `node scripts/check-code-blocks.js --json [--root <폴더>]` (Task 2)
- Produces: `python3 scripts/check-python-outputs.py [--legacy] [--post <id>] [--jobs <n>] [--root <폴더>]` — 종료 코드 0 또는 1, 마지막 줄 `✓|✗ 통과 N, 건너뜀 N (라이브러리 없음 N, 실행 안 됨 N), 실패 N`

- [ ] **Step 1: 실패하는 시험을 쓴다**

`scripts/test-python-outputs.py` 를 아래 내용으로 만든다. 임시 폴더에 작은 글 10편을 만들고, 검사를 `--root` 로 돌려 결과를 본다.

````python
#!/usr/bin/env python3
"""실행 검사(scripts/check-python-outputs.py) 시험. 임시 폴더에 작은 글을 만들어 돌려 본다.

  python3 scripts/test-python-outputs.py
"""
import os
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
CHECK = os.path.join(HERE, 'check-python-outputs.py')
FENCE = '`' * 3

POSTS = {
    'ok': [
        '# 하는 일: 두 단계가 한 줄씩 찍는다.',
        '# 1단계: 하나를 찍는다',
        'print("하나")',
        '# 2단계: 둘을 찍는다',
        'print("둘")',
        '',
        '# 출력:',
        '# 1단계 뜻: 첫 줄이다.',
        '# 하나',
        '# 2단계 뜻: 둘째 줄이다.',
        '# 둘',
    ],
    'bad-line': [
        '# 하는 일: 한 줄을 찍는다.',
        'print("하나")',
        '',
        '# 출력:',
        '# 뜻: 첫 줄이다.',
        '# 둘',
    ],
    'bad-step': [
        '# 하는 일: 두 단계가 한 줄씩 찍는다.',
        '# 1단계: 하나를 찍는다',
        'print("하나")',
        '# 2단계: 둘을 찍는다',
        'print("둘")',
        '',
        '# 출력:',
        '# 1단계 뜻: 두 줄을 1단계가 찍었다고 잘못 적었다.',
        '# 하나',
        '# 둘',
    ],
    'fn': [
        '# 하는 일: 1단계의 함수를 2단계가 부른다.',
        '# 1단계: 함수를 만든다',
        'def show():',
        '    print("안에서 찍는다")',
        '# 2단계: 부른다',
        'show()',
        '',
        '# 출력:',
        '# 2단계 뜻: 함수 안의 print 는 부른 단계가 찍은 것이다.',
        '# 안에서 찍는다',
    ],
    'vary': [
        '# 하는 일: 길이를 잰다.',
        'print("걸린 시간", len("abc"), "ms")',
        '',
        '# 출력 (시간은 돌릴 때마다 다르다):',
        '# 뜻: 숫자는 비교하지 않는다.',
        '# 걸린 시간   7 ms',
    ],
    'stderr': [
        '# 하는 일: stdout 과 stderr 에 차례로 쓴다.',
        'import sys',
        'print("앞")',
        'print("가운데", file=sys.stderr)',
        'print("뒤")',
        '',
        '# 출력:',
        '# 뜻: 쓴 순서대로 모은다.',
        '# 앞',
        '# 가운데',
        '# 뒤',
    ],
    'no-output': [
        '# 하는 일: 찍기만 하고 출력을 안 적었다.',
        'print("하나")',
    ],
    'missing': [
        '# 하는 일: 없는 라이브러리를 쓴다.',
        'import no_such_module_for_test',
        'print(1)',
        '',
        '# 출력:',
        '# 뜻: 하나.',
        '# 1',
    ],
    'norun': [
        '# (발췌 — 그대로 실행되지 않습니다.)',
        '# 하는 일: 조각이다.',
        '    return x',
    ],
}
# 이어지는 블록 — 두 블록을 한 글에 둔다
CONT = [
    ['x = 41'],
    ['# (앞 블록에 이어서 돌린다.)', '# 하는 일: 앞 블록의 x 를 쓴다.', 'print(x + 1)', '', '# 출력:', '# 뜻: 앞 블록이 x 를 만들었다.', '# 42'],
]

pass_, fail = 0, 0


def eq(name, got, want):
    global pass_, fail
    ok = got == want
    pass_, fail = pass_ + ok, fail + (not ok)
    print('   %s %s%s' % ('✓' if ok else '✗', name, '' if ok else '\n       기대 %r\n       실제 %r' % (want, got)))


def write_post(root, pid, blocks):
    body = '\n\n'.join(FENCE + 'python\n' + '\n'.join(b) + '\n' + FENCE for b in blocks)
    with open(os.path.join(root, 'posts', pid + '.md'), 'w', encoding='utf-8') as f:
        f.write('# 시험\n\n' + body + '\n')


def run(root, pid):
    r = subprocess.run([sys.executable, CHECK, '--root', root, '--post', pid], capture_output=True, text=True)
    return r.returncode, r.stdout


root = tempfile.mkdtemp(prefix='pyout-test-')
os.makedirs(os.path.join(root, 'posts'))
for pid, lines in POSTS.items():
    write_post(root, pid, [lines])
write_post(root, 'cont', CONT)

print('맞게 적은 블록은 통과한다')
eq('두 단계', run(root, 'ok')[0], 0)
eq('함수 안의 print 는 부른 단계', run(root, 'fn')[0], 0)
eq('「돌릴 때마다」 는 숫자와 공백 폭을 빼고 비교', run(root, 'vary')[0], 0)
eq('stderr 도 쓴 순서대로', run(root, 'stderr')[0], 0)
eq('앞 블록에 이어서', run(root, 'cont')[0], 0)

print('\n틀리게 적은 블록은 실패한다')
code, out = run(root, 'bad-line')
eq('찍힌 줄이 다르면', (code, '1번째 찍힌 줄이 다릅니다' in out), (1, True))
code, out = run(root, 'bad-step')
eq('뜻 줄의 단계가 다르면', (code, '2번째 찍힌 줄은 2단계가 찍었는데 뜻 줄은 1단계입니다' in out), (1, True))
code, out = run(root, 'no-output')
eq('찍는데 출력 영역이 없으면', (code, '출력 영역이 없습니다' in out), (1, True))

print('\n돌릴 수 없는 블록은 건너뛴다')
code, out = run(root, 'missing')
eq('없는 라이브러리', (code, 'no_such_module_for_test 없음' in out), (0, True))
code, out = run(root, 'norun')
eq('그대로 실행되지 않는 블록', (code, '실행 안 됨 1' in out), (0, True))

print('\n%d 통과, %d 실패' % (pass_, fail))
sys.exit(1 if fail else 0)
````

- [ ] **Step 2: 시험이 실패하는지 본다**

Run: `python3 scripts/test-python-outputs.py`
Expected: 마지막 줄 `0 통과, 10 실패`, 종료 코드 1 (검사 파일이 아직 없다).

- [ ] **Step 3: 검사를 쓴다**

`scripts/check-python-outputs.py` 를 아래 내용으로 만든다.

````python
#!/usr/bin/env python3
"""파이썬 블록을 실제로 돌려 적힌 출력과 같은지 본다. 설계: docs/superpowers/specs/2026-10-13-python-code-blocks-design.md

  python3 scripts/check-python-outputs.py              새 형식 블록을 돌린다 (CI)
  python3 scripts/check-python-outputs.py --legacy     옛 형식 블록도 돌린다 (옮길 때 로컬에서)
  python3 scripts/check-python-outputs.py --post <id>  글 하나만 돌린다
  python3 scripts/check-python-outputs.py --jobs <n>   동시에 돌릴 수 (기본 4)
  python3 scripts/check-python-outputs.py --root <폴더> posts/ 를 그 폴더에서 찾는다 (시험용)

블록 읽기는 js/code-steps.js 한 곳에 있다. node scripts/check-code-blocks.js --json 으로 받아 쓴다.
표준 라이브러리만 쓴다. import 할 수 없는 라이브러리를 쓰는 블록은 실패로 치지 않고 건너뛴다.
찍힌 줄마다 그 줄을 쓸 때 실행 중이던 모듈 최상위 문장을 찾아, 그 문장이 속한 단계와 뜻 줄의 번호를 견준다.
"""
import argparse
import concurrent.futures as cf
import json
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TIMEOUT = 120
OUT_MARK = re.compile(r'^# 출력(?=[\s(:]|$)')
NUM = re.compile(r'\d+(?:[.,]\d+)*')

# 블록마다 새 프로세스에서 돈다. stdin 으로 {prefix: [앞 코드...], code: 블록 코드} 를 받는다.
HARNESS = r'''
import io, json, sys, types
job = json.load(sys.stdin)
real = sys.stdout
class W(io.TextIOBase):
    def __init__(self):
        self.lines, self.buf, self.at = [], '', None
    def writable(self):
        return True
    def write(self, s):
        f, top = sys._getframe(1), None
        while f is not None:
            if f.f_code.co_filename == '<block>':
                top = f.f_lineno
            f = f.f_back
        parts = s.split('\n')
        for p in parts[:-1]:
            if not self.buf:
                self.at = top
            self.lines.append([self.buf + p, self.at])
            self.buf, self.at = '', None
        if parts[-1]:
            if not self.buf:
                self.at = top
            self.buf += parts[-1]
        return len(s)
mod = types.ModuleType('__main__')
sys.modules['__main__'] = mod
g = mod.__dict__
res = {'lines': [], 'err': None, 'missing': None}
sys.stdout = sys.stderr = io.StringIO()
try:
    for i, code in enumerate(job['prefix']):
        exec(compile(code, '<prefix-%d>' % i, 'exec'), g)
except ModuleNotFoundError as e:
    res['missing'] = e.name
except BaseException as e:
    res['err'] = ('앞 블록에서 %s: %s' % (type(e).__name__, e))[:300]
if res['missing'] is None and res['err'] is None:
    w = W()
    sys.stdout = sys.stderr = w
    try:
        exec(compile(job['code'], '<block>', 'exec'), g)
    except SystemExit:
        pass
    except ModuleNotFoundError as e:
        res['missing'] = e.name
    except BaseException as e:
        res['err'] = ('%s: %s' % (type(e).__name__, e))[:300]
    if w.buf:
        w.lines.append([w.buf, w.at])
    res['lines'] = w.lines
sys.stdout, sys.stderr = real, sys.__stderr__
print(json.dumps(res, ensure_ascii=False))
'''


def load_blocks(root):
    js = os.path.join(ROOT, 'scripts', 'check-code-blocks.js')
    cmd = ['node', js, '--json'] + (['--root', root] if root else [])
    return json.loads(subprocess.run(cmd, capture_output=True, text=True, check=True).stdout)


def code_of(b):
    lines = b['src'].split('\n')
    end = b['codeEnd'] if b['format'] == 'steps' else next((i for i, l in enumerate(lines) if OUT_MARK.match(l)), len(lines))
    return '\n'.join(lines[:end]) + '\n'


def declared_of(b):
    """[(뜻 줄 번호 또는 None, 찍힌 줄)] — 출력 영역이 없으면 None."""
    if b['format'] == 'steps':
        if not b['out']:
            return None
        return [(g['n'], t) for g in b['out']['groups'] for t in g['lines']]
    lines = b['src'].split('\n')
    k = next((i for i, l in enumerate(lines) if OUT_MARK.match(l)), None)
    if k is None:
        return None
    return [(None, (l[2:] if l.startswith('# ') else l[1:] if l.startswith('#') else l).rstrip()) for l in lines[k + 1:]]


def labelled(b, kind):
    return any(l['kind'] == kind for l in b['labels'])


def norun(b):
    if b['format'] == 'legacy':
        return any('의사코드' in l for l in b['src'].split('\n')[:2])
    return labelled(b, 'norun')


def prefix_of(b, by_post):
    """이어지는 블록 앞에 먼저 돌릴 코드. 다른 글의 블록들, 그다음 이 글의 앞 블록들 차례."""
    if not (labelled(b, 'cont') or labelled(b, 'cont-post')):
        return []
    mine = by_post[b['post']]
    other = []
    for x in mine[:b['index'] + 1]:
        for l in x['labels']:
            if l['kind'] == 'cont-post':
                other += by_post.get(l['post'], [])
    seen, codes = set(), []
    for x in other + mine[:b['index']]:
        key = (x['post'], x['index'])
        if key not in seen and not norun(x):
            seen.add(key)
            codes.append(code_of(x))
    return codes


def step_of(b, lineno):
    if lineno is None:
        return None
    step = 0
    for s in b['stepLines']:
        if s['from'] <= lineno - 1:
            step = s['n']
    return step


def trim(xs, text):
    while xs and not text(xs[-1]).strip():
        xs = xs[:-1]
    return xs


def check(b, res):
    varying = bool(b['format'] == 'steps' and b['out'] and b['out']['varying'])
    norm = (lambda s: ' '.join(NUM.sub('0', s).split())) if varying else (lambda s: s.rstrip())
    actual = trim(res['lines'], lambda x: x[0])
    declared = declared_of(b)
    if declared is None:
        if actual and b['format'] == 'steps':
            return ['찍힌 줄이 %d줄 있는데 출력 영역이 없습니다' % len(actual)]
        return []
    declared = trim(declared, lambda x: x[1])
    a = [norm(x[0]) for x in actual]
    d = [norm(t) for _, t in declared]
    if a != d:
        i = next((k for k, (x, y) in enumerate(zip(a, d)) if x != y), min(len(a), len(d)))
        return ['%d번째 찍힌 줄이 다릅니다\n      적힌 줄: %s\n      찍힌 줄: %s' % (
            i + 1, d[i] if i < len(d) else '(없음)', a[i] if i < len(a) else '(없음)')]
    if b['format'] == 'steps' and b['stepLines']:
        for k, ((n, _), (_, lineno)) in enumerate(zip(declared, actual)):
            got, want = step_of(b, lineno), (n if n is not None else 0)
            if got != want:
                name = lambda s: '첫 단계 앞 코드' if s == 0 else '알 수 없는 곳' if s is None else '%d단계' % s
                return ['%d번째 찍힌 줄은 %s가 찍었는데 뜻 줄은 %s입니다' % (k + 1, name(got), name(want))]
    return []


def main():
    ap = argparse.ArgumentParser(description='파이썬 블록을 돌려 적힌 출력과 견준다')
    ap.add_argument('--legacy', action='store_true', help='옛 형식 블록도 돌린다')
    ap.add_argument('--post', help='글 하나만 (id)')
    ap.add_argument('--jobs', type=int, default=4, help='동시에 돌릴 수')
    ap.add_argument('--root', help='posts/ 가 있는 폴더 (시험용)')
    args = ap.parse_args()

    blocks = load_blocks(args.root)
    by_post = {}
    for b in blocks:
        by_post.setdefault(b['post'], []).append(b)
    todo = [b for b in blocks
            if (args.post is None or b['post'] == args.post)
            and ((b['format'] == 'steps' and b['ok']) or (args.legacy and b['format'] == 'legacy'))]

    work = tempfile.mkdtemp(prefix='pyblocks-')
    harness = os.path.join(work, 'harness.py')
    with open(harness, 'w', encoding='utf-8') as f:
        f.write(HARNESS)
    env = dict(os.environ, PYTHONHASHSEED='0', PYTHONIOENCODING='utf-8', MPLBACKEND='Agg')

    def run(b):
        if norun(b):
            return b, 'norun', None
        job = json.dumps({'prefix': prefix_of(b, by_post), 'code': code_of(b)})
        try:
            r = subprocess.run([sys.executable, '-s', harness], input=job, cwd=tempfile.mkdtemp(dir=work),
                               capture_output=True, text=True, timeout=TIMEOUT, env=env)
        except subprocess.TimeoutExpired:
            return b, 'fail', ['%d초 안에 끝나지 않았습니다' % TIMEOUT]
        try:
            res = json.loads(r.stdout.strip().splitlines()[-1])
        except (ValueError, IndexError):
            return b, 'fail', ['실행기가 결과를 내지 못했습니다: ' + r.stderr[-300:]]
        if res['missing']:
            return b, 'missing', res['missing']
        if res['err']:
            return b, 'fail', [res['err']]
        errs = check(b, res)
        return b, ('fail' if errs else 'pass'), errs

    with cf.ThreadPoolExecutor(max(1, args.jobs)) as ex:
        results = list(ex.map(run, todo))

    count = {'pass': 0, 'fail': 0, 'missing': 0, 'norun': 0}
    for b, status, detail in results:
        count[status] += 1
        where = 'posts/%s.md 의 %d번째 파이썬 블록' % (b['post'], b['index'] + 1)
        if status == 'fail':
            for e in detail:
                print('✗ %s — %s' % (where, e))
        elif status == 'missing':
            print('  건너뜀 %s (%s 없음)' % (where, detail))
    skipped = count['missing'] + count['norun']
    print('%s 통과 %d, 건너뜀 %d (라이브러리 없음 %d, 실행 안 됨 %d), 실패 %d' % (
        '✗' if count['fail'] else '✓', count['pass'], skipped, count['missing'], count['norun'], count['fail']))
    sys.exit(1 if count['fail'] else 0)


if __name__ == '__main__':
    main()
````

- [ ] **Step 4: 시험이 통과하는지 본다**

Run: `python3 scripts/test-python-outputs.py`
Expected: 마지막 줄 `10 통과, 0 실패`, 종료 코드 0.

- [ ] **Step 5: 지금 글에서 돌려 본다**

Run: `python3 scripts/check-python-outputs.py`
Expected: `✓ 통과 0, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0` (새 형식 블록이 아직 없다).

Run: `python3 scripts/check-python-outputs.py --legacy --jobs 8`
Expected: 1분 안쪽에 끝나고 마지막 줄이 `✗ 통과 215, 건너뜀 9 (라이브러리 없음 3, 실행 안 됨 6), 실패 23` 근처다. 로컬에 깔린 라이브러리(numpy, torch 등)에 따라 조금 다르다. 실패는 앞 블록에 이어서 도는 블록(상태 표시가 아직 없다), 시간을 재는 블록, spec 의 「적힌 출력과 다르다」 블록이다. 옮기면서 고칠 대상이고, 이 명령은 CI 에 넣지 않는다.

- [ ] **Step 6: CI 에 파이썬과 검사 단계를 더한다**

`.github/workflows/validate.yml` 에서 아래를 바꾼다.

old:

````yaml
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
````

new:

````yaml
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: actions/setup-python@v5
        with:
          python-version: '3.9'
````

old:

````yaml
      - name: 코스 두 장 구조
        run: node scripts/check-course-pages.js
````

new:

````yaml
      - name: 코스 두 장 구조
        run: node scripts/check-course-pages.js
      - name: 코드 블록 형식 (하는 일, 단계, 뜻)
        run: node scripts/check-code-blocks.js
      - name: 코드 블록 파서 단위 테스트
        run: node scripts/test-code-steps.js
      - name: 파이썬 블록 실행 검사 시험
        run: python scripts/test-python-outputs.py
      - name: 파이썬 블록 실행 (표준 라이브러리, 찍힌 줄과 단계)
        run: python scripts/check-python-outputs.py
````

Run: `grep -n "setup-python\|check-code-blocks\|test-code-steps\|python-outputs" .github/workflows/validate.yml`
Expected: 다섯 줄이 나온다(setup-python 1, 검사 4).

- [ ] **Step 7: 커밋**

````bash
git add scripts/check-python-outputs.py scripts/test-python-outputs.py .github/workflows/validate.yml
git commit -F - <<'EOF'
feat(scripts): 파이썬 블록을 돌려 찍힌 줄과 단계를 견주는 실행 검사와 시험 10개, CI 에 단계 넷

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 4: two-tower-training 블록 3개 옮기기

**Files:**
- Modify: `posts/two-tower-training.md` (파이썬 블록 3개)
- Modify: `scripts/code-blocks-baseline.json`
- 임시: `$SCRATCH/migrate_batch1.py` (저장소에 넣지 않는다. Task 7, 8 도 쓴다)

**Interfaces:**
- Consumes: `scripts/check-code-blocks.js` (Task 2), `scripts/check-python-outputs.py` (Task 3)
- Produces: 새 형식 블록 3개. 셋째 블록은 spec 5-3 의 예와 같다. Task 5 가 이 글로 화면을 확인한다.

- [ ] **Step 1: 옮기는 도우미를 저장소 밖에 둔다**

`$SCRATCH/migrate_batch1.py` 를 아래 내용으로 만든다. 실행되는 코드 줄은 다시 치지 않고, 원본 줄 사이에 표시 줄을 끼운다. 원본 블록이 계획을 쓸 때와 다르면 아무것도 바꾸지 않고 멈춘다. 새 블록의 하는 일, 단계, 뜻 글은 모두 이 파일의 `B` 에 있다.

````python
#!/usr/bin/env python3
"""첫 묶음 3편의 파이썬 블록을 새 형식(하는 일, 단계, 뜻)으로 옮기는 일회용 도우미. 저장소에 넣지 않는다.

실행되는 코드 줄은 다시 치지 않는다. 원본 줄 사이에 표시 줄을 끼우고, 머리 주석만 걷어 내고, 출력 줄 앞에 뜻 줄을 끼운다.
원본 블록이 계획을 쓸 때와 다르면(해시가 다르면) 아무것도 바꾸지 않고 멈춘다.

  python3 migrate_batch1.py <저장소>/posts <글 id>
"""
import hashlib
import re
import sys

POSTS, POST = sys.argv[1], sys.argv[2]
FENCE = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)

# 계획을 쓸 때 원본 블록의 sha256 앞 16자
HASH = {
    'two-tower-training': ['cbd37e17ccd1e3b2', '0a130d290c1928c8', 'c9f2651d85457dfb'],
    'algorithm-complexity-array': ['1af981f33058c6bb', 'ce748af31e1cb84c', '0fb2a205f5f8dfb3', 'b83f05571f605346', 'b3f7c2ad2a95f8d0'],
    'offpolicy-evaluation': ['d89caef5db342e24', '96bd2d549449fb66', 'ad8aad0ddf0b8fab'],
}

# post: [(블록 번호, 상태 표시, 하는 일, 지울 원본 줄, {원본 줄 번호: 그 앞에 끼울 줄}, {원본 줄 번호: 바꿀 줄}, 출력 괄호 글, {찍힌 줄 번호: 뜻 줄})]
B = {
    'two-tower-training': [
        (0, None,
         '가상 점수표 두 장으로 학습 전과 학습 뒤의 배치 손실을 τ = 0.1 에서 재고, 회원 A 줄의 확률을 펼쳐 본다.',
         [],
         {10: ['# 2단계: 배치 손실을 구하는 함수를 만든다',
               '# 줄마다 점수를 τ 로 나눠 소프트맥스를 취하고, 정답 칸 확률에 -log 를 씌워 네 줄을 평균한다.'],
          26: ['# 3단계: 두 점수표의 손실을 잰다',
               '# 학습 전 손실은 네 칸을 똑같이 찍을 때의 값 log 4 와 견준다.'],
          30: ['# 4단계: 회원 A 줄의 확률을 펼쳐 본다']},
         {2: ['# 1단계: 점수표 두 장을 둔다',
              '# 설명을 위한 가상 점수표다. 줄은 회원 A~D, 열은 러닝화, 캠핑 의자, 커피 머신, 요가 매트다.']},
         None,
         {0: '3단계 뜻: 학습 전 손실 1.390 은 네 칸을 똑같이 찍은 값 1.386 과 거의 같다. 학습 뒤에는 0.009 로 떨어진다.',
          3: '4단계 뜻: 정답 칸인 러닝화에 확률 0.989 가 몰린다. 이 줄의 손실은 0.011 이다.'}),
        (1, None,
         '3절의 학습 뒤 점수표를 온도 τ 만 1, 0.1, 0.05 로 바꿔 다시 재고, 배치가 4,096줄일 때 정답 칸 확률이 오를 수 있는 끝을 구한다.',
         [],
         {2: ['# 1단계: 3절의 학습 뒤 점수표와 소프트맥스를 다시 둔다']},
         {13: ['# 2단계: 온도만 바꿔 다시 잰다',
               '# 같은 학습 뒤 점수표다. 순서(대각선이 가장 큼)는 셋 다 같고, 확률이 얼마나 벌어지느냐만 바뀐다.'],
          19: ['# 3단계: 배치 4,096줄에서 가장 잘 배운 경우를 본다',
               '# 정답 칸 내적이 1, 나머지 4,095칸이 모두 -1 인 경우다.']},
         None,
         {0: '2단계 뜻: τ 가 작을수록 정답 칸 확률이 1 에 가까워지고 손실이 0 으로 간다.',
          3: '3단계 뜻: τ = 1 이면 아무리 잘 배워도 정답 칸 확률이 0.0018 에서 멈춘다. τ = 0.1 이면 거의 1 까지 오른다.'}),
        (2, None,
         '가짜 광고 200개로 두 타워를 300번 학습하고, 학습에 안 쓴 클릭 2,000건으로 Recall@10 을 잰다.',
         [],
         {4: ['# 1단계: 가짜 광고 200개를 만든다',
              '# 광고마다 정보 16개와 인기를 둔다. 인기가 앞 순위에 쏠려야 인기 보정이 하는 일이 보인다.'],
          12: ['# 2단계: 클릭 n건을 뽑는 함수를 만든다',
               '# 인기대로 광고를 뽑고, 그 광고를 누를 법한 회원 정보를 붙인다. 한 건이 양성 쌍 하나다.'],
          18: ['# 3단계: 타워 하나의 모양을 정한다',
               '# 정보 16개를 64개를 거쳐 벡터 32개로 바꾼다. 회원 타워와 광고 타워가 이 모양을 하나씩 따로 쓴다.'],
          27: ['# 4단계: 두 타워를 300번 학습한다',
               '# 배치 256건의 점수표에 인기 보정과 accidental hit 제거를 넣고, 대각선을 정답으로 손실을 줄인다.',
               '# 100번마다 손실을 찍는다.'],
          44: ['# 5단계: 학습에 안 쓴 클릭으로 잰다',
               '# 누른 광고가 상위 10개 안에 드는지 보고, 클릭 많은 순 10개를 모두에게 준 기준선과 견준다.']},
         {},
         'torch 2.7, CPU',
         {0: '4단계 뜻: 학습 전 손실이다. log 256 = 5.55 보다 큰 것은 인기 보정이 점수마다 다른 값을 더한 뒤라서다.',
          1: '4단계 뜻: 처음 100번에 4분의 1 아래로 줄고, 그 뒤로는 천천히 준다.',
          4: '5단계 뜻: 누른 광고가 상위 10개 안에 든 비율이다. 모두에게 같은 10개를 준 기준선의 두 배 가까이다.'}),
    ],
    'algorithm-complexity-array': [
        (0, None,
         '정수 목록에 같은 값이 두 번 나오는지를 두 방법으로 풀고, n 을 1,000 에서 8,000 까지 두 배씩 키우며 걸린 시간을 잰다.',
         list(range(0, 9)),
         {13: ['# 1단계: 두 방법을 만든다',
               '# 방법 A 는 짝을 전부 만들어 비교한다. 방법 B 는 이미 본 값을 집합에 넣어 두고 목록을 한 번만 훑는다.'],
          28: ['# 2단계: 걸린 시간을 재는 함수를 만든다'],
          36: ['# 3단계: n 을 두 배씩 키우며 잰다',
               '# 목록은 중복이 없게 만들어 두 방법 다 끝까지 훑게 했다. 그래야 가장 오래 걸리는 경우를 잰다.',
               '# 시간은 노트북 한 대에서 잰 값이라 기계마다 다르다. 볼 것은 n 이 두 배가 될 때 시간이 몇 배가 되나다.']},
         {},
         '시간은 돌릴 때마다 다르다',
         {0: '3단계 뜻: n 이 두 배가 될 때 짝 전부는 4배쯤, 집합은 2배쯤 는다. 밀리초 값은 기계마다 다르다.'}),
        (1, None,
         'n = 100,000 에서 「안에 있나」와 「맨 앞을 뺀다」를 list 와 다른 자료형(set, deque)으로 해 보고 걸린 시간을 견준다.',
         list(range(0, 8)),
         {15: ['# 1단계: 「안에 있나」를 list 와 set 으로 잰다',
               '# list 는 앞에서부터 훑고, set 은 해시로 한 번에 간다. 찾는 값을 늘 맨 끝에 두어 list 가 끝까지 훑게 했다.'],
          28: ['# 2단계: 「맨 앞을 뺀다」를 list 와 deque 로 잰다',
               '# list 는 뺄 때마다 나머지를 전부 한 칸씩 당기고, deque 는 그냥 뗀다.'],
          40: ['# 3단계: 두 짝을 표로 찍는다',
               '# 코딩 테스트에서 시간 초과가 나는 자리의 상당수가 여기다.']},
         {},
         '시간은 돌릴 때마다 다르다',
         {0: '3단계 뜻: 자료형 하나만 바꿨는데 「안에 있나」는 1만 배 넘게, 「맨 앞 빼기」는 수백 배 차이 난다. 배수는 기계마다 다르다.'}),
        (2, None,
         '지어낸 값 8개로 누적합을 한 줄 만들어 두고, 세 구간의 합을 더해서 구한 값과 뺄셈 한 번으로 구한 값을 견준다.',
         list(range(0, 4)),
         {12: ['# 2단계: 칸 번호, 값, 누적합을 나란히 찍는다'],
          17: ['# 3단계: 세 구간의 합을 두 방법으로 구한다',
               '# 구간의 합을 물을 때마다 더하면 물어본 횟수만큼 훑는다. 누적합은 뺄셈 한 번이면 끝난다.']},
         {7: ['# 1단계: 누적합을 만든다',
              '# pre[i] 는 ARR 의 앞 i 개를 더한 값이다. 앞에 0 을 하나 두는 것이 요령이다.']},
         None,
         {0: '2단계 뜻: 누적합 줄은 값 줄보다 하나 길다. 맨 앞에 둔 0 때문이다.',
          4: '3단계 뜻: 세 구간 모두 더한 값과 뺄셈 한 번으로 구한 값이 같다.'}),
        (3, None,
         '오름차순으로 정렬된 지어낸 값 8개에서, 더해서 28 이 되는 두 수를 양 끝에서 좁혀 오며 찾는다.',
         list(range(0, 5)),
         {9: ['# 1단계: 양 끝에서 좁혀 오는 함수를 만든다',
              '# 합이 목표보다 크면 오른쪽을 당기고, 작으면 왼쪽을 민다. 정렬돼 있다는 것이 이 방법의 전제다.',
              '# 정렬이 안 되어 있으면 먼저 정렬해야 한다.'],
          27: ['# 2단계: 목표 28 인 짝을 찾는다']},
         {},
         None,
         {0: '2단계 뜻: 회차마다 두 수의 합을 목표와 견줘 한쪽 끝을 옮긴다. 4회차에 합이 28 이 된다.',
          5: '2단계 뜻: 짝을 전부 만들면 28번 비교할 것을 4번에 끝냈다.'}),
        (4, None,
         '6절과 같은 값 8개에서 길이가 3 인 구간의 합이 가장 큰 자리를 찾는다.',
         list(range(0, 4)),
         {8: ['# 1단계: 첫 구간만 다 더한다'],
          12: ['# 2단계: 구간을 한 칸씩 옮긴다',
               '# 옮길 때마다 세 개를 다시 더하지 않는다. 빠지는 값을 빼고 들어오는 값을 더한다.'],
          23: ['# 3단계: 가장 큰 구간과 더한 횟수를 찍는다']},
         {},
         None,
         {0: '1단계 뜻: 처음 한 번만 세 개를 다 더한다.',
          1: '2단계 뜻: 뺄셈 한 번과 덧셈 한 번으로 합을 고친다. 최대가 바뀐 회차에 표시가 붙는다.',
          6: '3단계 뜻: 구간마다 다시 더하면 18번 더할 것을 13번에 끝냈다.'}),
    ],
    'offpolicy-evaluation': [
        (0, None,
         '지난주 로그 10,000건을 지어내고, 겹치는 건만 쓰는 Replay 로 새 정책을 채점해 진짜 값과 견준다.',
         list(range(0, 4)),
         {7: ['# 1단계: 로그를 지어낼 설정을 둔다',
              '# 진짜 CTR 을 코드에서 정해 두었으므로 정답을 알 수 있다. 실제 로그에는 정답이 없다.'],
          14: ['# 2단계: 지난주 로그를 만드는 함수를 만든다',
               '# 요청마다 후보 8개의 진짜 CTR, 옛 정책의 선택 확률, 옛 정책이 고른 후보, 클릭,',
               '# 새 정책이라면 골랐을 후보를 남긴다. 3절, 4절 코드는 여기서 만든 build_log() 를 그대로 이어서 쓴다.'],
          32: ['# 3단계: 지면마다 겹친 건으로 Replay CTR 을 센다',
               '# 옛 정책이 고른 후보와 새 정책이 고를 후보가 같은 요청이 겹친 건이다. 그 건들의 클릭률이 Replay 추정이다.'],
          43: ['# 4단계: Replay 추정을 진짜 값과 견준다'],
          51: ['# 5단계: 1절 표의 요청 한 건을 펼친다']},
         {8: ['# SLOTS 한 줄은 (지면, 요청 수, 기저 CTR 하한, 상한, 숨은 피처 z의 값어치) 다.']},
         None,
         {0: '3단계 뜻: 요청 10,000건 가운데 2,595건(25.9%)이 겹쳤고, 그 건들의 클릭률 3.31% 가 Replay 추정이다. '
             '클릭률이 높은 main_top 은 39.3% 가 남고 feed_low 는 15.8% 만 남는다.',
          7: '4단계 뜻: Replay 는 옛 정책보다 56.3% 낫다고 하지만 진짜로 나아진 폭은 22.5% 다.',
          11: '5단계 뜻: 새 정책이 고른 후보는 옛 정책이 1.28% 로만 고르는 후보다. 겹치면 그 한 건을 78배로 센다.'}),
        (1, '앞 블록에 이어서 돌린다.',
         '확률의 역수로 세기(IPS)가 왜 치우침이 없는지 요청 한 건에서 기대값을 직접 더해 보고, 로그 10,000건 전체에 같은 식을 적용한다.',
         list(range(0, 3)),
         {4: ['# 1단계: 요청 한 건의 IPS 기여를 후보마다 더한다',
              '# 옛 정책이 그 후보를 고를 확률 p 와 가중치 1/p 를 곱하면 1 이 되어, 진짜 CTR 을 한 번 센 것이 된다.'],
          19: ['# 2단계: 로그 10,000건 전체에 같은 식을 쓴다']},
         {},
         None,
         {0: '1단계 뜻: 여덟 줄 가운데 일곱 줄은 0 을 더하고, 새 정책이 고른 후보 4번만 p × (1/p) × CTR 을 더한다. '
             '합계가 그 후보의 진짜 CTR 0.02839 와 같다.',
          17: '2단계 뜻: 이번 주 IPS 추정 1.669% 는 진짜 값 2.807% 의 60% 쯤이다. 가중치 합계 9,681 은 요청 수 10,000 과 비슷하다.'}),
        (2, '앞 블록에 이어서 돌린다.',
         "겹친 건의 가중치가 어디에 몰렸는지 구간별로 세어 유효표본크기를 구하고, 같은 조건의 '지난주'를 400번 다시 뽑아 추정기 여섯 가지의 평균과 흔들림을 잰다.",
         list(range(0, 3)),
         {4: ['# 1단계: 겹친 건의 가중치를 구간별로 센다'],
          20: ['# 2단계: 유효표본크기(ESS)를 구한다',
               '# 가중치가 몇 건에 몰리면 겹친 건이 많아도 값을 지탱하는 건은 적다.'],
          46: ['# 4단계: 추정기마다 평균, 편향, 흔들림을 잰다']},
         {24: ["# 3단계: 같은 조건의 '지난주'를 400번 다시 뽑는다",
               '# 겹치지 않은 건은 어떤 추정기에도 0을 더한다. 그래서 겹칠 확률과 그때의 CTR만 있으면 된다.'],
          55: ['# 5단계: 로그를 10배로 늘려 본다',
               '# 400주를 10주씩 40묶음으로 합치면 요청 100,000건짜리 추정 40개가 된다.']},
         None,
         {0: '1단계 뜻: 가중치 40~80 구간의 52건이 가중치 합 9,681 가운데 3,343 을 들고 있는데, 이 52건에는 클릭이 하나도 없다.',
          8: '2단계 뜻: 겹친 건은 2,595건이지만 값을 지탱하는 건은 339건뿐이다. 그만큼이면 클릭이 9.5건이다.',
          12: '4단계 뜻: IPS 와 SNIPS 는 평균이 진짜 값에 가깝지만 표준편차가 0.8% 로 크다. '
              '절단은 흔들림을 줄이는 대신 아래로 치우치고, Replay 는 위로 치우친다.',
          21: '5단계 뜻: 로그를 10배로 늘리면 흔들림은 줄지만 Replay 의 편향 +0.376% 는 그대로다.'}),
    ],
}


def convert(src, spec):
    _, status, head, remove, insert, replace, hint, means = spec
    lines = src.rstrip('\n').split('\n')
    k = next(i for i, l in enumerate(lines) if re.match(r'^# 출력', l))
    code, outs = lines[:k], lines[k + 1:]
    new = []
    if status:
        new.append(f'# ({status})')
    new.append(f'# 하는 일: {head}')
    for i, l in enumerate(code):
        if i in remove:
            continue
        new += insert.get(i, [])
        new += replace[i] if i in replace else [l]
    while new and not new[-1].strip():
        new.pop()
    new.append('')
    new.append(f'# 출력 ({hint}):' if hint else '# 출력:')
    for i, l in enumerate(outs):
        if i in means:
            new.append(f'# {means[i]}')
        new.append(l)
    return '\n'.join(new) + '\n'


path = f'{POSTS}/{POST}.md'
text = open(path, encoding='utf-8').read()
ms = list(FENCE.finditer(text))
got = [hashlib.sha256(m.group(1).encode('utf-8')).hexdigest()[:16] for m in ms]
if got != HASH[POST]:
    sys.exit(f'{POST}: 원본 블록이 계획을 쓸 때와 다릅니다. 바꾸지 않고 멈춥니다.\n  기대 {HASH[POST]}\n  실제 {got}')
by = {s[0]: s for s in B[POST]}
pieces, last = [], 0
for bi, m in enumerate(ms):
    if bi in by:
        pieces.append(text[last:m.start(1)])
        pieces.append(convert(m.group(1), by[bi]))
        last = m.end(1)
pieces.append(text[last:])
open(path, 'w', encoding='utf-8').write(''.join(pieces))
print(f'{POST}: 블록 {len(by)}개를 옮겼습니다')
````

- [ ] **Step 2: 옮긴다**

Run: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch1"; mkdir -p "$SCRATCH"; python3 "$SCRATCH/migrate_batch1.py" posts two-tower-training`
Expected: `two-tower-training: 블록 3개를 옮겼습니다`. `원본 블록이 계획을 쓸 때와 다릅니다` 로 멈추면 이 태스크를 멈추고 사용자에게 알린다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지 본다**

Run:

````bash
python3 - two-tower-training <<'EOF'
import re, subprocess, sys
post = sys.argv[1]
F = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
new = open(f'posts/{post}.md', encoding='utf-8').read()
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
ob, nb = [m.group(1) for m in F.finditer(old)], [m.group(1) for m in F.finditer(new)]
assert len(ob) == len(nb), (len(ob), len(nb))
bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
same_prose = F.sub('', old) == F.sub('', new)
print(f'코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same_prose else "다르다"}')
sys.exit(1 if bad or not same_prose else 0)
EOF
````

Expected: `코드 줄이 바뀐 블록 [], 블록 밖 글 같다`

- [ ] **Step 4: 두 검사를 돌린다**

Run: `node scripts/check-code-blocks.js`
Expected: `✓ 새 형식 블록 3개, 옛 형식 블록 244개, 문제 0건`

Run: `python3 scripts/check-python-outputs.py --post two-tower-training`
Expected: `✓ 통과 3, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0`. 로컬에 torch 가 없으면 `✓ 통과 2, 건너뜀 1 (라이브러리 없음 1, 실행 안 됨 0), 실패 0` 이고, 그 줄 위에 `건너뜀 posts/two-tower-training.md 의 3번째 파이썬 블록 (torch 없음)` 이 찍힌다.

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0 (기준표보다 늘어난 곳 없음).

- [ ] **Step 5: 기준표를 줄인다**

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 244개, 글 84편`

- [ ] **Step 6: 커밋**

````bash
git add posts/two-tower-training.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): two-tower 학습 글의 파이썬 블록 3개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 5: 화면 — `post.html`, `js/main.js`, `css/style.css`

**Files:**
- Modify: `post.html` (스크립트 한 줄)
- Modify: `js/main.js` (열 군데)
- Modify: `css/style.css` (맨 끝에 붙인다)
- 임시: `$SCRATCH/nocache_server.py`

**Interfaces:**
- Consumes: `CodeSteps.parse`, `render`, `mount`, `wrapLines`, `hasDrawing` (Task 1). Task 4 가 옮긴 `posts/two-tower-training.md`.
- Produces: 새 형식 파이썬 블록이 `.cb` 로 그려진 글 페이지. 파이썬이 아닌 블록은 `pre.cb-wrap` 으로 줄마다 접힌다. 모든 블록의 Copy 가 원문을 복사한다.

- [ ] **Step 1: `post.html` 에서 `js/main.js` 앞에 `js/code-steps.js` 를 싣는다**

old:

````html
  <script src="js/comments.js"></script>
  <script src="js/main.js"></script>
````

new:

````html
  <script src="js/comments.js"></script>
  <script src="js/code-steps.js"></script>
  <script src="js/main.js"></script>
````

- [ ] **Step 2: `js/main.js` 를 고친다 (Edit 열 번, 파일 위쪽부터)**

**2-1. 용어 풀이가 새 블록 안 글자를 건드리지 않게** (`autoLinkGlossary` 안)

old:

````js
        if (child.classList && (child.classList.contains('katex') || child.classList.contains('demo-term'))) continue;
````

new:

````js
        if (child.classList && (child.classList.contains('katex') || child.classList.contains('demo-term') || child.classList.contains('cb'))) continue;
````

**2-2. 빈 줄 줄이기를 코드 펜스를 빼 둔 뒤로 옮긴다 — 앞쪽에서 지운다** (`preprocessMarkdown` 안)

old:

````js
  text = text
    // Normalize 3+ consecutive blank lines to max 2
    .replace(/\n{3,}/g, '\n\n')
    // Remove lines that are only a list marker with trailing whitespace (empty list items)
````

new:

````js
  text = text
    // Remove lines that are only a list marker with trailing whitespace (empty list items)
````

**2-3. 빈 줄 줄이기를 코드 펜스를 빼 둔 뒤에 한다** (`preprocessMarkdown` 안, 굵게 바꾸기 바로 앞)

old:

````js
  // **...** → <strong>...</strong>
````

new:

````js
  // 빈 줄 3개 이상은 2개로 줄인다. 코드 펜스를 빼 둔 뒤에 해야 코드 안의 빈 줄이 원문 그대로 남는다(Copy 가 원문을 복사한다).
  text = text.replace(/\n{3,}/g, '\n\n');

  // **...** → <strong>...</strong>
````

**2-4. Copy 함수를 하나로 묶고 새 블록의 Copy 를 건다** (`enhanceCodeBlocks` 머리)

old:

````js
function enhanceCodeBlocks(container) {
  const preBlocks = container.querySelectorAll('pre');
````

new:

````js
// 복사 버튼 — 「Copied!」를 2초 보이고, 클립보드가 막힌 곳(https 아님)에서는 textarea 로 복사한다.
function copyText(text, btn) {
  const done = () => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  };
  navigator.clipboard.writeText(text).then(done).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    done();
  });
}

function enhanceCodeBlocks(container) {
  // 새 파이썬 블록(js/code-steps.js 가 그린 .cb)은 머리와 Copy 를 스스로 갖는다. 원문을 복사한다.
  container.querySelectorAll('.cb').forEach(cb => {
    const btn = cb.querySelector('.cb-copy');
    if (btn) btn.addEventListener('click', () => copyText(cb.dataset.src, btn));
  });

  const preBlocks = container.querySelectorAll('pre');
````

**2-5. 파이썬이 아닌 블록의 긴 줄을 접는다** (`enhanceCodeBlocks` 안)

old:

````js
    // Build wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
````

new:

````js
    // 긴 줄은 접는다 — 파이썬이 아닌 블록만. 옮기기 전 파이썬 블록과 선 글자 그림은 지금처럼 옆으로 민다.
    const raw = codeEl.dataset.src;
    if (raw !== undefined && lang !== 'python' && typeof CodeSteps !== 'undefined' && !CodeSteps.hasDrawing(raw)) {
      codeEl.innerHTML = CodeSteps.wrapLines(codeEl.innerHTML, raw);
      pre.classList.add('cb-wrap');
    }

    // Build wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
````

**2-6. 옛 Copy 를 원문 복사로 바꾼다** (`enhanceCodeBlocks` 안)

old:

````js
    copyBtn.addEventListener('click', () => {
      const text = codeEl.innerText;
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        // Fallback for non-https
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    });
````

new:

````js
    copyBtn.addEventListener('click', () => copyText(raw !== undefined ? raw : codeEl.innerText, copyBtn));
````

**2-7. 코드 렌더러 — 새 형식 파이썬 블록은 code-steps 로 그리고, 원문을 남긴다** (marked `code()` 안)

old:

````js
              const language = lang && hljs.getLanguage(lang) ? lang : null;
              try {
````

new:

````js
              // 파이썬 블록 — 「# 하는 일:」 형식이면 하는 일, 단계, 뜻으로 그린다 (js/code-steps.js).
              // 옛 형식이거나 형식이 틀리면 아래 hljs 로 지금처럼 그린다.
              if (lang === 'python' && typeof CodeSteps !== 'undefined') {
                const model = CodeSteps.parse(text);
                if (model.format === 'steps' && model.ok) return CodeSteps.render(model);
              }

              // 원문 — Copy 버튼과 줄 접기가 쓴다
              const src = text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
              const language = lang && hljs.getLanguage(lang) ? lang : null;
              try {
````

**2-8. hljs 로 그리는 `<code>` 에 원문을 붙인다**

old:

````js
                return `<pre><code class="hljs language-${detectedLang}" data-lang="${detectedLang}">${highlighted}</code></pre>`;
````

new:

````js
                return `<pre><code class="hljs language-${detectedLang}" data-lang="${detectedLang}" data-src="${src}">${highlighted}</code></pre>`;
````

**2-9. 블록을 붙인 뒤 배치한다**

old:

````js
      // Enhance code blocks with language label + copy button
      enhanceCodeBlocks(contentContainer);
````

new:

````js
      // Enhance code blocks with language label + copy button
      enhanceCodeBlocks(contentContainer);

      // 새 파이썬 블록의 메모 자리, 접힌 줄 막대, 같은 번호 밝히기 (js/code-steps.js)
      if (typeof CodeSteps !== 'undefined') CodeSteps.mount(contentContainer);
````

**2-10. 수식 렌더러가 새 블록 안의 `$` 를 수식으로 읽지 않게** (`renderMathInElement` 옵션)

old:

````js
            throwOnError: false
          });
````

new:

````js
            ignoredClasses: ['cb'],
            throwOnError: false
          });
````

- [ ] **Step 3: `js/main.js` 가 깨지지 않았는지 본다**

Run: `python3 -c "print(open('js/main.js','rb').read().count(b'\x00'))" && node --check js/main.js && node --check js/code-steps.js && echo ok`
Expected: `4` 다음 줄 `ok`.

- [ ] **Step 4: 스타일을 붙인다**

`css/style.css` 맨 끝에 아래를 그대로 붙인다(휴대폰 여백은 Task 6 에서 붙인다).

````css

/* =========================================================
   코드 블록 — 하는 일, 단계, 뜻
   설계: docs/superpowers/specs/2026-10-13-python-code-blocks-design.md
   파이썬 블록은 js/code-steps.js 가 .cb 로 그린다. 다른 블록은 pre.cb-wrap 으로 줄마다 접는다.
   ========================================================= */
.post-content { --post-pad: 3.2rem; padding: 3rem var(--post-pad); }

/* 넓은 화면 — 글 칸 바로 아래 블록만 안쪽 여백까지 넓힌다(인용과 접는 절 안의 블록은 그대로) */
.post-content > .cb,
.post-content > .code-block-wrapper { margin-left: calc(-1 * var(--post-pad)); margin-right: calc(-1 * var(--post-pad)); }
.post-content > .cb { border-left: 0; border-right: 0; }
/* 접는 절(:::deep) 안의 블록은 접는 절 안쪽 끝까지 넓힌다(좌우 1.1rem 여백을 뺀다) */
.post-content .deep-dive > .cb,
.post-content .deep-dive > .code-block-wrapper { margin-left: 0; margin-right: 0; }
.post-content .deep-dive > .cb { border-left: 0; border-right: 0; }
.post-content > .code-block-wrapper > .code-header,
.post-content .deep-dive > .code-block-wrapper > .code-header,
:root[data-theme] .post-content > .code-block-wrapper > pre:not(.mermaid),
:root[data-theme] .post-content .deep-dive > .code-block-wrapper > pre:not(.mermaid) { border-left: 0; border-right: 0; }

.cb { container: cb / inline-size; position: relative; margin: 2rem 0; background: var(--plate); border: 1px solid var(--rule); border-top: 2px solid var(--ink); }
.cb-probes { position: absolute; left: 0; top: 0; width: 0; height: 0; overflow: hidden; visibility: hidden; pointer-events: none; }
.cb-probe { position: absolute; left: 0; top: 0; white-space: pre; font-family: var(--font-mono); font-size: 0.9rem; }

.cb-head { background: var(--paper); padding: 14px 20px 16px; border-bottom: 1px solid var(--rule); }
.cb-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 6px; }
.cb-kicker { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; color: var(--navy); }
.cb-label { font-family: var(--font-mono); font-size: 0.72rem; color: var(--ink2); border: 1px solid var(--rule); padding: 0 6px; }
a.cb-label { color: var(--navy); border-color: var(--navy-bd); text-decoration: none; }
.cb-lang { margin-left: auto; font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink3); }
.cb-title { font-size: 1.125rem; font-weight: 700; line-height: 1.55; color: var(--ink); }

.cb-row { display: grid; grid-template-columns: 260px minmax(0, 1fr); border-bottom: 1px solid var(--rule); }
.cb-row:last-child { border-bottom: 0; }
.cb-nosteps .cb-row { grid-template-columns: minmax(0, 1fr); }
.cb-nosteps .cb-exp0 { display: none; }
.cb-exp { background: var(--paper); padding: 12px 18px 14px; border-right: 1px solid var(--rule); font-size: 0.906rem; color: var(--ink2); }
.cb-exp b { display: block; margin: 6px 0 2px; font-size: 0.97rem; line-height: 1.5; color: var(--ink); }
.post-content .cb-exp p { margin: 0; font-size: inherit; line-height: 1.6; color: inherit; }
.post-content .cb-exp p + p { margin-top: 6px; }
.cb-num { display: inline-block; min-width: 24px; padding: 1px 7px; text-align: center; font-family: var(--font-mono); font-size: 0.75rem; font-weight: 600; line-height: 1.5; background: var(--navy); color: var(--paper); }
.cb-num-o { padding: 0 6px; background: var(--navy-bg); color: var(--navy); border: 1px solid var(--navy-bd); }
.cb-code { min-width: 0; padding: 12px 22px; }

/* 코드 줄 — 접힌 뒷줄은 들여쓰기에서 4자 더 들어간다(내어쓰기) */
.cb .cb-ln { font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.75; color: var(--ink2); }
pre.cb-wrap code { display: block; white-space: normal; }
pre.cb-wrap .cb-ln { display: block; }
.cb-src { display: block; position: relative; white-space: pre-wrap; overflow-wrap: anywhere; padding-left: calc(var(--ind, 0) * 1ch + 4ch); text-indent: -4ch; }
.cb-ln.is-wrapped > .cb-src::before,
.cb-oln.is-wrapped > .cb-src::before { content: ""; position: absolute; left: calc(var(--ind, 0) * 1ch - 10px); top: 4px; bottom: 4px; width: 2px; background: var(--navy); }
.cb-ln.has-note:not(.is-drop) { display: grid; grid-template-columns: calc(var(--nc, 40) * 1ch) minmax(0, 1fr); align-items: baseline; }
.cb-note { justify-self: start; padding: 1px 8px; font-family: var(--font-sans); font-size: 0.844rem; line-height: 1.55; white-space: normal; color: var(--ink); background: var(--navy-bg); border-left: 2px solid var(--navy); }
.cb-ln.is-drop .cb-note,
.cb-ln-note .cb-note { display: block; width: fit-content; max-width: calc(100% - var(--ind, 0) * 1ch); margin: 1px 0 4px calc(var(--ind, 0) * 1ch); }
.cb-k, .cb-fn { color: var(--ink); font-weight: 600; }
.cb-bi { color: var(--ink2); }
.cb-s { color: var(--series-6); }
.cb-n { color: var(--series-5); }

/* 같은 번호 밝히기 */
.cb-row.is-hot .cb-exp, .cb-row.is-hot .cb-code { background: var(--navy-bg); }
.cb-row.is-hot .cb-note { background: var(--paper); }
.cb-grp.is-hot { background: var(--navy-bg); }
.cb-grp.is-hot .cb-num-o { background: var(--navy); color: var(--paper); border-color: var(--navy); }

/* 출력 — 묶음마다 번호, 찍힌 줄, 뜻. 찍힌 줄이 넓으면(data-layout="stack") 뜻을 아래로 */
.cb-out { background: var(--paper); border-top: 2px solid var(--ink); }
.cb-out-head { display: flex; align-items: center; gap: 14px; border-bottom: 1px solid var(--rule); }
.cb-out-tab { padding: 6px 14px; font-family: var(--font-mono); font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em; background: var(--ink); color: var(--paper); }
.cb-out-hint { font-size: 0.844rem; color: var(--ink3); }
.cb-grp, .cb-out-cols { display: grid; grid-template-columns: 52px calc(var(--oc, 40) * 1ch) minmax(0, 1fr); column-gap: 14px; align-items: baseline; padding: 10px 20px 10px 16px; font-family: var(--font-mono); font-size: 0.9rem; border-bottom: 1px solid var(--rule2); }
.cb-grp:last-child { border-bottom: 0; }
.cb-out-cols { padding-top: 7px; padding-bottom: 5px; }
.cb-out-cols span { font-size: 0.72rem; letter-spacing: 0.02em; color: var(--ink3); }
.cb-grp > .cb-num { justify-self: start; }
.cb-out-lines { min-width: 0; }
.cb-oln { line-height: 1.7; color: var(--ink); }
.cb-out-mean { font-family: var(--font-sans); font-size: 0.906rem; line-height: 1.6; color: var(--ink2); }
.cb-out[data-layout="stack"] .cb-grp, .cb-out[data-layout="stack"] .cb-out-cols { grid-template-columns: 52px minmax(0, 1fr); }
.cb-out[data-layout="stack"] .cb-out-mean { grid-column: 2; margin-top: 4px; }
.cb-out[data-layout="stack"] .cb-out-cols span:nth-child(3) { display: none; }
.cb-nosteps .cb-num-none, .cb-nosteps .cb-out-cols span:first-child { display: none; }
.cb-nosteps .cb-grp, .cb-nosteps .cb-out-cols { grid-template-columns: calc(var(--oc, 40) * 1ch) minmax(0, 1fr); }
.cb-nosteps .cb-out[data-layout="stack"] .cb-grp, .cb-nosteps .cb-out[data-layout="stack"] .cb-out-cols { grid-template-columns: minmax(0, 1fr); }
.cb-nosteps .cb-out[data-layout="stack"] .cb-out-mean { grid-column: 1; }

/* 블록 폭 926px 이하 — 설명이 단계마다 코드 위로 간다 */
@container cb (max-width: 926px) {
  .cb-row { grid-template-columns: minmax(0, 1fr); }
  .cb-exp { padding: 9px 18px 10px 17px; border-right: 0; border-left: 3px solid var(--navy); background: var(--navy-bg); }
  .cb-exp0 { display: none; }
  .cb-exp b { display: inline; margin: 0 0 0 8px; }
  .post-content .cb-exp p { margin-top: 2px; }
}
/* 블록 폭 600px 이하 — 메모는 모두 줄 아래(js), 출력은 번호와 찍힌 줄 두 열 */
@container cb (max-width: 600px) {
  .cb-head { padding: 12px 14px 14px; }
  .cb-title { font-size: 1.03rem; }
  .cb-code { padding: 10px 14px; }
  .cb-out[data-layout] .cb-grp, .cb-out[data-layout] .cb-out-cols { grid-template-columns: 40px minmax(0, 1fr); padding: 10px 14px 10px 12px; }
  .cb-out[data-layout] .cb-out-mean { grid-column: 2; margin-top: 4px; }
  .cb-out[data-layout] .cb-out-cols span:nth-child(3) { display: none; }
  .cb-nosteps .cb-out[data-layout] .cb-grp, .cb-nosteps .cb-out[data-layout] .cb-out-cols { grid-template-columns: minmax(0, 1fr); }
  .cb-nosteps .cb-out[data-layout] .cb-out-mean { grid-column: 1; }
}
````

- [ ] **Step 5: 디자인 검사와 말투 검사**

Run: `node scripts/check-design.js && node scripts/check-wording.js && echo ok`
Expected: 두 검사가 지금처럼 통과하고 `ok`. 새 hex 와 새 낱말 문제가 없다.

- [ ] **Step 6: 캐시를 끈 로컬 서버를 띄운다**

`$SCRATCH/nocache_server.py` 를 아래 내용으로 만들고 저장소 루트를 8770 에서 연다(백그라운드).

````python
import http.server
import socketserver
import sys

ROOT = sys.argv[1]
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8766


class H(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.md': 'text/markdown; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
    }

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), H) as s:
    s.serve_forever()
````

Run (백그라운드, 저장소 루트에서): `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch1"; mkdir -p "$SCRATCH"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8770`

- [ ] **Step 7: 넓은 화면에서 본다 — Playwright**

1440×1000 으로 `http://127.0.0.1:8770/post.html?id=two-tower-training` 을 열고 그림을 찍는다(`.post-content > .cb` 첫째, 접는 절 안 `.cb`). 그림은 `.playwright-mcp/` 에 둔다(커밋하지 않는다). 머리 메뉴가 그림을 가리면 `document.querySelectorAll('header, nav, .navbar').forEach(h => h.style.position = 'static')` 를 먼저 돌린다.

볼 것: 블록 머리의 하는 일 한 줄, 왼쪽 설명 칸(번호, 굵은 제목, 풀이), 줄 끝 메모가 세로로 맞는지, 접힌 줄의 파란 막대, 출력 영역의 번호, 찍힌 줄, 뜻. 시안 `docs/superpowers/specs/2026-10-13-python-code-blocks-mock-width.html` 의 2번과 같은 모양이어야 한다.

- [ ] **Step 8: 넓은 화면 배치를 숫자로 확인한다**

1440, 1280, 1024 폭마다 페이지를 새로 열고 아래 함수를 `browser_evaluate` 로 돌린다.

````js
async () => {
  await document.fonts.ready;
  document.querySelectorAll('details.deep-dive').forEach(d => { d.open = true; });
  await new Promise(r => setTimeout(r, 600));
  const id = new URLSearchParams(location.search).get('id');
  const md = await (await fetch(`posts/${id}.md`)).text();
  const fences = [...md.matchAll(/^```python[^\n]*\n([\s\S]*?)^```[ \t]*$/gm)].map(m => m[1].replace(/\s+$/, ''));
  const cbs = [...document.querySelectorAll('.cb')];
  let overlap = 0;
  cbs.forEach(cb => cb.querySelectorAll('.cb-ln.has-note:not(.is-drop)').forEach(l => {
    if (l.querySelector('.cb-note').getBoundingClientRect().left < l.querySelector('.cb-t').getBoundingClientRect().right - 0.5) overlap++;
  }));
  return {
    blocks: cbs.length,
    copyMatches: cbs.every((cb, i) => cb.dataset.src === fences[i]),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    injected: document.querySelectorAll('.cb .demo-term, .cb .katex').length,
    noteOverlap: overlap,
    unlaid: cbs.filter(cb => [...cb.querySelectorAll('.cb-code')].some(c => c.style.getPropertyValue('--nc') === '')).length,
    layout: cbs.map(cb => [Math.round(cb.getBoundingClientRect().width),
      getComputedStyle(cb.querySelector('.cb-row')).gridTemplateColumns.split(' ').length,
      cb.querySelector('.cb-out') ? cb.querySelector('.cb-out').dataset.layout : null]),
  };
}
````

Expected — 세 폭 모두 `blocks: 3, copyMatches: true, overflow: false, injected: 0, noteOverlap: 0, unlaid: 0`. `layout` 은 폭마다 아래와 같다(블록 폭, 행의 열 수, 출력 모양).

| 화면 | layout | 뜻 |
|---|---|---|
| 1440 | `[[1051,2,"three"],[1051,2,"three"],[947,2,"three"]]` | 셋 다 나란히. 셋째는 접는 절 안이라 947 |
| 1280 | `[[891,1,"three"],[891,1,"three"],[787,1,"three"]]` | 셋 다 쌓임 |
| 1024 | `[[915,1,"three"],[915,1,"three"],[811,1,"three"]]` | 사이드바가 접혀 조금 넓지만 926 아래라 쌓임 |

- [ ] **Step 9: 다크 화면과 파이썬이 아닌 블록을 본다**

1440 폭 two-tower 페이지에서 `document.documentElement.setAttribute('data-theme','dark')` 뒤에 `getComputedStyle(document.querySelector('.cb-s')).color` 와 `.cb-n` 을 읽는다.
Expected: 다크 `rgb(111, 179, 166)`, `rgb(201, 124, 108)`. 라이트로 되돌리면 `rgb(47, 107, 99)`, `rgb(165, 74, 74)`. 다크 그림도 한 장 찍는다.

1024 폭으로 `post.html?id=api-basics` 를 열고 아래를 돌린다.

````js
async () => {
  await new Promise(r => setTimeout(r, 800));
  const pres = [...document.querySelectorAll('.post-content pre:not(.mermaid)')];
  return { pres: pres.length, wrap: document.querySelectorAll('pre.cb-wrap').length,
    overflowPres: pres.filter(p => p.scrollWidth > p.clientWidth + 1).length,
    srcAll: pres.every(p => p.querySelector('code').dataset.src !== undefined),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth };
}
````

Expected: `pres` 와 `wrap` 이 같고(이 글은 8과 8), `overflowPres: 0, srcAll: true, overflow: false`.

`post.html?id=auto-bidding-pacing` 에서 선 글자 그림 블록이 접히지 않는지 본다.

````js
async () => {
  await new Promise(r => setTimeout(r, 800));
  const draw = [...document.querySelectorAll('.post-content pre:not(.mermaid)')].filter(p => /[─-▟]/.test(p.querySelector('code').dataset.src || ''));
  return { drawing: draw.length, wrapped: draw.filter(p => p.classList.contains('cb-wrap')).length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth };
}
````

Expected: `{ drawing: 1, wrapped: 0, overflow: false }`

같은 번호 밝히기를 본다. 1440 폭 two-tower 페이지에서:

````js
async () => {
  const cb = document.querySelector('.post-content > .cb');
  cb.querySelector('.cb-row[data-step="3"] .cb-code').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  const hot = [...cb.querySelectorAll('.is-hot')].map(e => e.className.split(' ')[0] + ':' + e.dataset.step);
  cb.dispatchEvent(new MouseEvent('mouseleave'));
  return { hot, after: cb.querySelectorAll('.is-hot').length };
}
````

Expected: `{ hot: ["cb-row:3", "cb-grp:3"], after: 0 }` — 3단계 행에 올리면 3단계가 찍은 출력 묶음이 같이 밝아지고, 벗어나면 꺼진다.

옮기기 전 파이썬 블록이 지금 모양 그대로인지 본다. `post.html?id=ab-test-vs-mab` 에서:

````js
async () => {
  await new Promise(r => setTimeout(r, 800));
  const py = [...document.querySelectorAll('.post-content pre code.language-python')];
  return { legacy: py.length, wrapped: py.filter(c => c.closest('pre').classList.contains('cb-wrap')).length,
    src: py.every(c => c.dataset.src !== undefined), cb: document.querySelectorAll('.cb').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth };
}
````

Expected: `{ legacy: 2, wrapped: 0, src: true, cb: 0, overflow: false }`

- [ ] **Step 10: 서버를 끄고 커밋한다**

서버를 끈다(TaskStop 또는 프로세스 종료).

````bash
git add post.html js/main.js css/style.css
git commit -F - <<'EOF'
feat(posts): 파이썬 블록을 하는 일, 단계, 뜻으로 그리고 다른 블록은 줄마다 접는다 — Copy 는 원문

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 6: 휴대폰 여백 바로잡기

**Files:**
- Modify: `post.html` (글 칸을 감싼 container 에 이름)
- Modify: `css/style.css` (맨 끝에 붙인다)

**Interfaces:**
- Consumes: Task 5 의 `--post-pad` 변수
- Produces: 768px 이하에서 글 칸이 화면을 채우고 좌우 여백이 24px 이다. 모든 글에 걸린다.

- [ ] **Step 1: 글 칸 container 에 이름을 붙인다**

`post.html` 에서:

old:

````html
      <div class="container">
        <article class="post-content" id="post-content">
````

new:

````html
      <div class="container post-container">
        <article class="post-content" id="post-content">
````

- [ ] **Step 2: 휴대폰 규칙을 붙인다**

`css/style.css` 맨 끝(Task 5 에서 붙인 묶음 뒤)에 붙인다.

````css

/* 휴대폰 — 글 칸이 화면을 채운다. 위쪽 휴대폰 규칙(2rem 1.5rem)이 맨 끝 디자인 블록의 3.2rem 에 덮어써지던 것을 여기서 바로잡는다 */
@media (max-width: 768px) {
  .post-content { --post-pad: 24px; padding: 2rem var(--post-pad); border-left: 0; border-right: 0; }
  .post-container { padding-left: 0; padding-right: 0; }
}
````

- [ ] **Step 3: 디자인 검사**

Run: `node scripts/check-design.js && echo ok`
Expected: `ok`

- [ ] **Step 4: 휴대폰 폭에서 글 네 편을 숫자로 본다**

서버를 다시 띄운다(백그라운드, 저장소 루트에서 `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch1"; mkdir -p "$SCRATCH"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8770`. 서버 파일은 Task 5 Step 6 에서 만들었다). 390×844 로 아무 글이나 연 뒤 아래 함수를 돌린다. 숨긴 iframe 에 네 편을 차례로 열어 잰다.

````js
async () => {
  const out = {};
  for (const id of ['two-tower-training', 'api-basics', 'auto-bidding-pacing', 'ad-serving-flow']) {
    const f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;left:0;top:0;width:390px;height:844px;border:0;visibility:hidden';
    f.src = `post.html?id=${id}`;
    document.body.appendChild(f);
    await new Promise(r => { f.onload = r; });
    await new Promise(r => setTimeout(r, 1500));
    const d = f.contentDocument, de = d.documentElement, pc = d.querySelector('.post-content');
    const p = pc.querySelector(':scope > p');
    out[id] = { fills: Math.round(pc.getBoundingClientRect().width) === de.clientWidth && Math.round(pc.getBoundingClientRect().left) === 0,
                pad48: p ? Math.round(pc.getBoundingClientRect().width - p.getBoundingClientRect().width) : null,
                overflow: de.scrollWidth > de.clientWidth };
    f.remove();
  }
  return out;
}
````

Expected: 네 편 모두 `{ fills: true, pad48: 48, overflow: false }`. 네 편은 새 블록, 파이썬이 아닌 블록, 선 글자 그림, mermaid 와 카드 iframe 과 표가 있는 글이다.

- [ ] **Step 5: 휴대폰 그림을 찍는다**

390×844 로 two-tower 페이지를 열고 첫 블록과 접는 절 안 블록을 찍는다. 시안 `…-mock-phone.html` 의 3번처럼 긴 줄이 접히고 파란 막대가 붙고, 메모는 줄 아래로, 출력의 뜻은 찍힌 줄 아래로 가야 한다. 서버를 끈다.

- [ ] **Step 6: 커밋**

````bash
git add post.html css/style.css
git commit -F - <<'EOF'
fix(css): 휴대폰 글 칸 여백을 24px 로 — 맨 끝 디자인 블록의 3.2rem 이 휴대폰 규칙을 덮어쓰던 것

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 7: algorithm-complexity-array 블록 5개 옮기기

**Files:**
- Modify: `posts/algorithm-complexity-array.md` (파이썬 블록 5개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch1.py` (Task 4 Step 1), 두 검사
- Produces: 시간을 재는 블록 2개에 `# 출력 (시간은 돌릴 때마다 다르다):` 가 붙은 새 형식 블록 5개

- [ ] **Step 1: 옮긴다**

Run: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch1"; mkdir -p "$SCRATCH"; python3 "$SCRATCH/migrate_batch1.py" posts algorithm-complexity-array`
Expected: `algorithm-complexity-array: 블록 5개를 옮겼습니다`

- [ ] **Step 2: 코드 줄과 블록 밖 글이 그대로인지 본다**

Run:

````bash
python3 - algorithm-complexity-array <<'EOF'
import re, subprocess, sys
post = sys.argv[1]
F = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
new = open(f'posts/{post}.md', encoding='utf-8').read()
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
ob, nb = [m.group(1) for m in F.finditer(old)], [m.group(1) for m in F.finditer(new)]
assert len(ob) == len(nb), (len(ob), len(nb))
bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
same_prose = F.sub('', old) == F.sub('', new)
print(f'코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same_prose else "다르다"}')
sys.exit(1 if bad or not same_prose else 0)
EOF
````
Expected: `코드 줄이 바뀐 블록 [], 블록 밖 글 같다`

- [ ] **Step 3: 두 검사를 돌린다**

Run: `node scripts/check-code-blocks.js`
Expected: `✓ 새 형식 블록 8개, 옛 형식 블록 239개, 문제 0건`

Run: `python3 scripts/check-python-outputs.py --post algorithm-complexity-array`
Expected: `✓ 통과 5, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0`. 시간을 재는 블록 둘은 숫자를 빼고 비교하므로 기계가 달라도 통과한다.

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

- [ ] **Step 4: 기준표를 줄이고 커밋한다**

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 239개, 글 83편`

````bash
git add posts/algorithm-complexity-array.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 배열과 시간 복잡도 글의 파이썬 블록 5개를 하는 일, 단계, 뜻 형식으로 — 시간 재는 블록 둘에 시간 표시

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 8: offpolicy-evaluation 블록 3개 옮기기

**Files:**
- Modify: `posts/offpolicy-evaluation.md` (파이썬 블록 3개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch1.py` (Task 4 Step 1), 두 검사
- Produces: 둘째, 셋째 블록에 `# (앞 블록에 이어서 돌린다.)` 가 붙은 새 형식 블록 3개

- [ ] **Step 1: 옮긴다**

Run: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch1"; mkdir -p "$SCRATCH"; python3 "$SCRATCH/migrate_batch1.py" posts offpolicy-evaluation`
Expected: `offpolicy-evaluation: 블록 3개를 옮겼습니다`

- [ ] **Step 2: 코드 줄과 블록 밖 글이 그대로인지 본다**

Run:

````bash
python3 - offpolicy-evaluation <<'EOF'
import re, subprocess, sys
post = sys.argv[1]
F = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
new = open(f'posts/{post}.md', encoding='utf-8').read()
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
ob, nb = [m.group(1) for m in F.finditer(old)], [m.group(1) for m in F.finditer(new)]
assert len(ob) == len(nb), (len(ob), len(nb))
bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
same_prose = F.sub('', old) == F.sub('', new)
print(f'코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same_prose else "다르다"}')
sys.exit(1 if bad or not same_prose else 0)
EOF
````
Expected: `코드 줄이 바뀐 블록 [], 블록 밖 글 같다`

- [ ] **Step 3: 두 검사를 돌린다**

Run: `node scripts/check-code-blocks.js`
Expected: `✓ 새 형식 블록 11개, 옛 형식 블록 236개, 문제 0건`

Run: `python3 scripts/check-python-outputs.py --post offpolicy-evaluation`
Expected: `✓ 통과 3, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0`. 둘째와 셋째 블록은 첫 블록을 먼저 돌린 뒤 돈다.

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

- [ ] **Step 4: 기준표를 줄이고 커밋한다**

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 236개, 글 82편`

````bash
git add posts/offpolicy-evaluation.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): Off-Policy Evaluation 글의 파이썬 블록 3개를 하는 일, 단계, 뜻 형식으로 — 이어지는 블록 둘에 표시

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 9: 글쓰기 규칙 문서와 디자인 검사 주석

**Files:**
- Modify: `MARKDOWN_GUIDE.md` (여섯 군데)
- Modify: `scripts/check-design.js` (머리 주석 두 곳)

**Interfaces:**
- Consumes: 없음
- Produces: 새 형식 쓰는 법이 적힌 규칙 문서

- [ ] **Step 1: 검사 명령 목록에 두 줄을 더한다** (「새 글 추가 — 한 흐름」)

old:

````text
# 3) 검증 — 넷 다 통과해야 CI도 통과
````

new:

````text
# 3) 검증 — 다 통과해야 CI도 통과
````

old:

````text
node scripts/check-wording.js            # 말투와 낱말 (아래 "말투와 낱말") — 새 파일은 0건
````

new:

````text
node scripts/check-wording.js            # 말투와 낱말 (아래 "말투와 낱말") — 새 파일은 0건
node scripts/check-code-blocks.js        # 파이썬 블록 형식 (아래 "파이썬 블록 쓰는 법") — 새 글은 새 형식만
python3 scripts/check-python-outputs.py --post <slug>   # 파이썬 블록을 돌려 찍힌 줄과 단계가 맞나
````

- [ ] **Step 2: 글 내용 표준 4, 5번을 바꾼다**

old:

````text
4. **파이썬 예제**: 표준 라이브러리만, 복붙해 바로 돌아가게. 작성 후 **반드시 실제로 실행**해 `# 출력:` 주석에 결과를 붙이고 본문 숫자와 맞춥니다.
````

new:

````text
4. **파이썬 예제**: 표준 라이브러리만, 복붙해 바로 돌아가게. 작성 후 **반드시 실제로 실행**해 `# 출력:` 아래에 결과를 붙이고 본문 숫자와 맞춥니다. `python3 scripts/check-python-outputs.py --post <slug>` 가 블록을 돌려 찍힌 줄이 적힌 줄과 글자까지 같은지, 뜻 줄의 단계 번호가 맞는지 봅니다.
````

old:

````text
5. **주석이 곧 설명 본문입니다** — 무엇을+왜, 마지막에 출력 예시. (주석은 세이지 그린 이탤릭으로 렌더됩니다)
````

new:

````text
5. **블록은 「하는 일, 단계, 뜻」 형식으로 씁니다** — 맨 위 하는 일 한 줄, 단계마다 번호와 제목과 풀이, 출력 묶음마다 뜻. 화면은 이 표시를 읽어 왼쪽 설명 칸, 파란 메모, 출력 영역으로 그립니다. 쓰는 법은 아래 「파이썬 블록 쓰는 법」에 있습니다.
````

- [ ] **Step 3: 「파이썬 블록 쓰는 법」 절을 더한다** (글 내용 표준 10번 바로 뒤, `### 쉽게 쓰기` 앞)

old:

````text
### 쉽게 쓰기 — 직접 재 보고 배운 것 (2026-08-15 추가)
````

new:

````markdown
### 파이썬 블록 쓰는 법 — 하는 일, 단계, 뜻

블록 맨 위에 하는 일 한 줄, 단계마다 번호와 제목, 출력 묶음마다 뜻을 주석으로 적습니다. 화면(`js/code-steps.js`)이 이 표시를 읽어 왼쪽 설명 칸, 파란 메모, 출력 영역으로 그립니다. 표시는 모두 파이썬 주석이라 코드는 그대로 돌고, Copy 는 원문을 복사합니다. 설계는 `docs/superpowers/specs/2026-10-13-python-code-blocks-design.md` 에 있습니다.

| 표시 | 꼴 | 어디에 |
|---|---|---|
| 상태 | 괄호로 감싼 줄 (아래 목록) | 블록 맨 위. 없어도 됩니다 |
| 하는 일 | `# 하는 일: <한 줄>` | 상태 표시 다음 첫 줄. 블록에 하나 |
| 단계 | `# <N>단계: <제목>` 과 바로 아래 풀이 주석 줄 | 들여쓰기 없는 줄. N 은 1부터 하나씩 |
| 메모 | 줄 끝 주석, 코드 줄 사이 주석 | 지금처럼 씁니다 |
| 출력 | `# 출력:` 또는 `# 출력 (<괄호 안 글>):` | 블록 끝. 뒤에 코드 줄을 두지 않습니다 |
| 뜻 | `# <N>단계 뜻: <뜻>` 또는 `# 뜻: <뜻>` | 출력 영역 안. 아래 찍힌 줄들의 머리 |

```python
# 하는 일: 클릭 3건과 노출 100건으로 CTR 을 구한다.
# 1단계: 숫자를 둔다
clicks, imps = 3, 100        # 가상 값
# 2단계: CTR 을 찍는다
print(f'CTR {clicks / imps:.1%}')

# 출력:
# 2단계 뜻: 노출 100건에 클릭 3건이면 3% 다.
# CTR 3.0%
```

- 상태 표시는 넷입니다. `# (의사코드 — 그대로 실행되지 않습니다.)`, `# (발췌 — 그대로 실행되지 않습니다.)`, `# (앞 블록에 이어서 돌린다.)`, `# (<글 id> 글의 코드에 이어서 돌린다.)`. 실행 검사는 앞의 둘을 건너뛰고, 뒤의 둘은 앞 코드를 먼저 돌린 뒤 돌립니다.
- 블록 안의 글은 평서체(`~한다`)로 씁니다. 글 본문이 합쇼체여도 블록 안은 지금 주석처럼 평서체입니다.
- 뜻 줄의 번호는 그 아래 줄들을 찍은 단계입니다. 함수 안의 `print` 는 그 함수를 부른 단계가 찍은 것으로 셉니다. 첫 단계 앞의 코드가 찍은 줄과 단계 없는 블록의 줄은 번호 없이 `# 뜻:` 으로 씁니다.
- 찍힌 줄은 실행 검사가 낸 그대로 붙입니다. 빈 줄은 `#` 한 글자로 씁니다.
- 시간을 재는 블록은 `# 출력 (시간은 돌릴 때마다 다르다):` 로 씁니다. 실행 검사가 숫자를 빼고 비교합니다.
- 단계는 읽는 사람이 나눠 읽을 자리에만 둡니다. 짧고 한 가지 일만 하면 단계 없이 씁니다.
- 검사는 둘입니다. `node scripts/check-code-blocks.js` 가 형식을, `python3 scripts/check-python-outputs.py --post <slug>` 가 실행 결과를 봅니다. 옛 형식 블록은 기준표 `scripts/code-blocks-baseline.json` 에 적힌 만큼만 남을 수 있고, 새 글은 새 형식만 씁니다.

### 쉽게 쓰기 — 직접 재 보고 배운 것 (2026-08-15 추가)
````

- [ ] **Step 4: 디자인 절의 주석 색 문장을 바꾼다**

old:

````text
코드 주석은 세이지 그린 이탤릭(구문 강조는 예외로 남겨 둔 색입니다).
````

new:

````text
파이썬 블록은 「하는 일, 단계, 뜻」 모양으로 그리고(아래 「파이썬 블록 쓰는 법」), 주석은 파란 테두리 메모가 됩니다. 코드 글자색은 토큰입니다(키워드 `--ink` 굵게, 문자열 `--series-6`, 숫자 `--series-5`). hljs 색과 세이지 그린 이탤릭 주석은 파이썬이 아닌 블록과 아직 옮기지 않은 파이썬 블록에만 남습니다.
````

- [ ] **Step 5: 의사코드 규칙을 상태 표시 셋으로 넓힌다**

old:

````text
- **파이썬 블록에 `# 출력:` 주석을 붙일 때는 직접 실행한 결과만 붙이세요.** 실행이 안 되는 구조 스케치라면 첫 줄에 `# (의사코드 — 그대로 실행되지 않습니다.)` 를 달아 독자가 헤매지 않게 합니다.
````

new:

````text
- **파이썬 블록에 `# 출력:` 을 붙일 때는 직접 실행한 결과만 붙입니다.** 그대로는 돌지 않는 블록은 맨 위에 상태 표시를 답니다. 구조 스케치는 `# (의사코드 — 그대로 실행되지 않습니다.)`, 코드 조각은 `# (발췌 — 그대로 실행되지 않습니다.)`, 같은 글의 앞 블록이 있어야 도는 블록은 `# (앞 블록에 이어서 돌린다.)`, 다른 글의 코드가 있어야 도는 블록은 `# (<글 id> 글의 코드에 이어서 돌린다.)` 입니다. 실행 검사가 이 표시를 보고 건너뛰거나 앞 코드를 먼저 돌립니다.
````

- [ ] **Step 6: 디자인 검사 머리 주석을 바꾼다** (`scripts/check-design.js`)

old:

````js
// 데이터 시각화 계열색(--series-1..6)과 코드 구문 강조(hljs)는 3색조 밖이지만
// 의도한 예외다. 아래 ALLOWED_HEX 에 적어 두고, 그 밖의 hex 만 잡는다.
````

new:

````js
// 데이터 시각화 계열색(--series-1..6)과 코드 구문 강조(hljs)는 3색조 밖이지만
// 의도한 예외다. 계열색은 차트와, 파이썬 블록(js/code-steps.js)의 문자열과 숫자에 쓴다.
// 아래 ALLOWED_HEX 에 적어 두고, 그 밖의 hex 만 잡는다.
````

old:

````js
// hljs 구문 강조 — 코드 가독성 때문에 남긴 예외. 세이지 주석색은 표기 규칙에 박혀 있다.
````

new:

````js
// hljs 구문 강조 — 파이썬이 아닌 블록과, 아직 옮기지 않은 옛 형식 파이썬 블록이 쓴다. 세이지 주석색은 그 블록들의 주석이다.
````

- [ ] **Step 7: 규칙 문서의 예가 두 검사를 통과하는지 본다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch1"; mkdir -p "$SCRATCH"
T="$SCRATCH/guide-ex" && rm -rf "$T" && mkdir -p "$T/posts"
python3 - "$T" <<'EOF'
import re, sys
g = open('MARKDOWN_GUIDE.md', encoding='utf-8').read()
sec = g[g.index('### 파이썬 블록 쓰는 법'):g.index('### 쉽게 쓰기')]
block = re.search(r'```python\n(.*?)```', sec, re.S).group(1)
open(sys.argv[1] + '/posts/guide-example.md', 'w', encoding='utf-8').write('# 예\n\n```python\n' + block + '```\n')
EOF
node scripts/check-code-blocks.js --root "$T" && python3 scripts/check-python-outputs.py --root "$T" && node scripts/check-design.js && echo ok
````

Expected: `✓ 새 형식 블록 1개, 옛 형식 블록 0개, 문제 0건`, `✓ 통과 1, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0`, 그리고 `ok`.

- [ ] **Step 8: 커밋**

````bash
git add MARKDOWN_GUIDE.md scripts/check-design.js
git commit -F - <<'EOF'
docs: 글쓰기 규칙에 파이썬 블록 쓰는 법(하는 일, 단계, 뜻)과 상태 표시 셋, 검사 두 가지를 더함

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 10: 첫 묶음 확인과 올리기

**Files:** 없음 (확인과 push)

**Interfaces:**
- Consumes: Task 1~9 의 커밋
- Produces: 사용자 확인, 그 뒤 main 에 올린 첫 묶음

- [ ] **Step 1: CI 가 돌리는 검사를 로컬에서 모두 돌린다**

Run:

````bash
node scripts/validate-posts.js && node scripts/test-long-sentences.js && node scripts/check-design.js \
  && node scripts/check-wording.js && node scripts/check-course-data.js && node scripts/test-course-logic.js \
  && node scripts/check-course-pages.js && node scripts/check-code-blocks.js && node scripts/test-code-steps.js \
  && python3 scripts/test-python-outputs.py && python3 scripts/check-python-outputs.py && echo ALL-OK
````

Expected: 마지막 줄 `ALL-OK`. `check-python-outputs.py` 는 `✓ 통과 11, 건너뜀 0 …` 이다(torch 가 없으면 `통과 10, 건너뜀 1`).

- [ ] **Step 2: 사용자에게 보일 그림을 찍는다**

서버를 띄우고(백그라운드, 저장소 루트에서 `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch1"; mkdir -p "$SCRATCH"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8770`) 세 편을 1440 과 390 폭, 라이트와 다크로 찍는다. 그림은 `.playwright-mcp/` 에 둔다.

| 글 | 볼 블록 |
|---|---|
| two-tower-training | 접는 절 안 셋째 블록 (시안의 블록) |
| algorithm-complexity-array | 첫 블록 (출력 머리의 「시간은 돌릴 때마다 다르다」) |
| offpolicy-evaluation | 둘째 블록 (머리의 「앞 블록에 이어서」, 넓은 출력이라 뜻이 아래) |

- [ ] **Step 3: 사용자 확인을 받는다**

그림과 함께 바뀐 것을 짧게 알린다. 고칠 곳을 말하면 그 태스크로 돌아가 고치고 Step 1 부터 다시 한다. 사용자가 올려도 된다고 하기 전에는 push 하지 않는다.

- [ ] **Step 4: 올리고 CI 를 본다** (사용자 확인 뒤)

Run: `git fetch origin && git rebase origin/main && git push origin main`
Run: `gh run list --workflow validate.yml --limit 1` 로 run id 를 찾고 `gh run watch <id> --exit-status`
Expected: Validate posts 가 통과한다. `actions/setup-python` 이 3.9 를 받지 못해 실패하면 그 사실을 알리고, CI 기본 파이썬으로 바꿀지 사용자와 정한다(spec 7-2).
