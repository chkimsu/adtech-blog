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
eq('뜻 줄 아래 빈 줄만', msgs(block('# 하는 일: x.', 'print()', '# 출력:', '# 뜻: 빈 줄이다.', '#')),
  ['4:뜻 줄 아래에 빈 줄만 있습니다. 빈 줄은 앞이나 뒤 묶음에 붙입니다']);
eq('단계 줄 바로 아래의 단계 오타', msgs(block('# 하는 일: x.', '# 1단계: 하나', '#2단계: 둘', 'a = 1')),
  ['3:단계 표시는 들여쓰기 없이 `# N단계: 제목` 꼴로 씁니다']);
eq('쌍점 앞에 띄어 쓴 단계 오타', msgs(block('# 하는 일: x.', '# 1단계: 하나', '# 2단계 : 둘', 'a = 1')),
  ['3:단계 표시는 들여쓰기 없이 `# N단계: 제목` 꼴로 씁니다']);
eq('풀이 속 「2단계에서」 는 오타가 아니다', msgs(block('# 하는 일: x.', '# 1단계: 하나', '# 2단계에서 쓸 값이다.', 'a = 1')), []);
eq('띄어쓰기가 틀린 하는 일은 옛 형식으로 넘기지 않는다', [C.parse(block('#하는 일: x.', 'print(1)')).format, msgs(block('#하는 일: x.', 'print(1)'))],
  ['steps', ['1:하는 일 줄은 들여쓰기 없이 `# 하는 일: …` 꼴로 씁니다']]);
eq('「하는일」 도 잡는다', msgs(block('# 하는일: x.', 'print(1)')), ['1:하는 일 줄은 들여쓰기 없이 `# 하는 일: …` 꼴로 씁니다']);
eq('들여쓴 하는 일도 잡는다', msgs(block('if True:', '    # 하는 일: x.', '    print(1)')), ['2:하는 일 줄은 들여쓰기 없이 `# 하는 일: …` 꼴로 씁니다']);
const paren = C.parse(block('# 하는 일: x.', '# (이름, 시작, 끝)', 'print(1)'));
eq('몸통의 괄호 주석은 상태 표시가 아니라 메모', [paren.ok, paren.labels, paren.rows[0].items[0].kind], [true, [], 'note']);
const printedStep = C.parse(block('# 하는 일: x.', '# 1단계: 찍는다', 'print("  1단계 반")', '# 출력:', '# 1단계 뜻: 앞에 공백이 있는 찍힌 줄이다.', '#   1단계 반'));
eq('「1단계」 로 시작하는 찍힌 줄은 찍힌 줄', [printedStep.ok, printedStep.out.groups[0].lines], [true, ['  1단계 반']]);
eq('대문자가 든 글 id', C.parse(block('# (TS-linTS 글의 코드에 이어서 돌린다.)', '# 하는 일: 앞 글에 이어서 돈다.', 'run()')).labels,
  [{ kind: 'cont-post', post: 'TS-linTS', text: '앞 글에 이어서' }]);
eq('밑줄이 든 글 id', C.parse(block('# (ucb_ts 글의 코드에 이어서 돌린다.)', '# 하는 일: 앞 글에 이어서 돈다.', 'run()')).labels,
  [{ kind: 'cont-post', post: 'ucb_ts', text: '앞 글에 이어서' }]);
eq('쌍점 앞에 띄어 쓴 하는 일도 잡는다', msgs(block('# 하는 일 : x.', 'print(1)')), ['1:하는 일 줄은 들여쓰기 없이 `# 하는 일: …` 꼴로 씁니다']);
eq('출력 영역 안의 하는 일 줄은 자리가 틀렸다고 알린다', msgs(block('print(1)', '# 출력:', '# 뜻: 하나.', '# 1', '# 하는 일: x.')),
  ['5:하는 일 줄은 블록 맨 위, 상태 표시 바로 다음 줄에 둡니다']);
eq('문자열 속 하는 일 줄은 옛 형식 그대로', C.parse(block('s = """', '# 하는 일: 문자열 안이다.', '"""', 'print(s)')).format, 'legacy');

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
  '<span class="cb-ln" data-ln="0" style="--ind:2"><span class="cb-src"><span class="k">key</span>: 1</span></span>' +
  '<span class="cb-ln" data-ln="1" style="--ind:0"><span class="cb-src">b</span></span>');
eq('선 글자 그림', [C.hasDrawing('┌─┐'), C.hasDrawing('a -> b')], [true, false]);
eq('여러 줄 span 안의 빈 줄은 공백 하나', C.wrapLines('<span class="c">a\n\nb</span>', 'a\n\nb'),
  '<span class="cb-ln" data-ln="0" style="--ind:0"><span class="cb-src"><span class="c">a</span></span></span>' +
  '<span class="cb-ln" data-ln="1" style="--ind:0"><span class="cb-src"> </span></span>' +
  '<span class="cb-ln" data-ln="2" style="--ind:0"><span class="cb-src"><span class="c">b</span></span></span>');

console.log('\n배치 계산');
eq('메모 자리 = 가장 긴 줄 + 2', C.noteColumn(40, 86), 42);
eq('메모 자리는 cap - 22 를 넘지 않는다', C.noteColumn(80, 86), 64);
eq('메모가 들어가나', [C.fitsNote(40, 42), C.fitsNote(41, 42)], [true, false]);
eq('출력 세 열', C.outputLayout(50, 120, false), 'three');
eq('출력이 넓으면 뜻을 아래로', C.outputLayout(80, 120, false), 'stack');
eq('좁은 블록은 늘 아래로', C.outputLayout(10, 120, true), 'stack');
eq('한글 폭', C.widthCounts('손실 8.2'), { wl: 4, ww: 2 });

console.log('\n손으로 고른 글 복사 — 원문 줄 번호와 복사할 글');
const lns = h => [...h.matchAll(/data-ln="(\d+)"/g)].map(m => Number(m[1]));
eq('그린 조각의 원문 줄 번호(머리, 하는 일, 코드, 번호와 제목, 풀이 줄, 출력, 뜻, 찍힌 줄)', lns(html), [0, 0, 1, 3, 3, 4, 5, 6, 8, 8, 9, 11, 12, 13]);
eq('줄 번호는 data-src 의 줄을 가리킨다', [6, 8, 13].map(n => ok1.src.split('\n')[n]), ['a, b = 1, 2          # 가상 값', '# 2단계: 더해서 찍는다', '# 3']);
eq('상태 표시가 있으면 하는 일 줄은 그 다음', /class="cb-title" data-ln="(\d+)"/.exec(C.render(labels3))[1], '1');
eq('이어 붙인 메모는 원문 줄마다 번호', C.render(notes).match(/class="cb-note">.*?<\/span><\/div>/g).map(lns), [[3, 4], [6]]);
eq('앞뒤 빈 줄을 뺀 찍힌 줄의 번호', [...C.render(blanks).matchAll(/class="cb-oln" data-ln="(\d+)"/g)].map(m => Number(m[1])), [7, 8, 9]);
eq('파이썬이 아닌 블록은 줄마다 번호', lns(C.wrapLines('a:\n  b: 1\n  c: 2', 'a:\n  b: 1\n  c: 2')), [0, 1, 2]);

const SRC = block('def f(xs):', '    for x in xs:', '        print(x)  # 하나씩', '', '# 2단계: 부른다', '# 풀이 줄이다.', 'f([1])', '# 출력:', '# 2단계 뜻: 1 이다.', '# 1');
const spot = (line, part) => ({ line, part });
eq('여러 줄을 고르면 그 줄들을 들여쓰기째', C.copySource(SRC, [spot(0, 'code'), spot(1, 'code'), spot(2, 'code')]),
  'def f(xs):\n    for x in xs:\n        print(x)  # 하나씩');
eq('다음 단계로 넘어가면 단계 줄과 풀이 줄이 같이 온다', C.copySource(SRC, [spot(2, 'code'), spot(2, 'note'), spot(4, 'exp'), spot(5, 'exp'), spot(6, 'code')]),
  '        print(x)  # 하나씩\n\n# 2단계: 부른다\n# 풀이 줄이다.\nf([1])');
eq('설명 칸에서 시작하면 그 설명 줄부터', C.copySource(SRC, [spot(5, 'exp'), spot(6, 'code')]), '# 풀이 줄이다.\nf([1])');
eq('한 줄의 코드와 메모에 함께 닿으면 그 줄을 # 째', C.copySource(SRC, [spot(2, 'code'), spot(2, 'note')]), '        print(x)  # 하나씩');
eq('코드에서 출력 영역까지', C.copySource(SRC, [spot(6, 'code'), spot(7, 'out'), spot(8, 'out'), spot(9, 'out')]),
  'f([1])\n# 출력:\n# 2단계 뜻: 1 이다.\n# 1');
eq('한 줄의 코드 글자만, 메모만이면 브라우저에 맡긴다', [C.copySource(SRC, [spot(1, 'code')]), C.copySource(SRC, [spot(2, 'note')])], [null, null]);
eq('설명 칸, 출력 영역, 머리 안에서만 고르면 브라우저에 맡긴다',
  [C.copySource(SRC, [spot(4, 'exp'), spot(5, 'exp')]), C.copySource(SRC, [spot(8, 'out'), spot(9, 'out')]), C.copySource(SRC, [spot(0, 'head')]), C.copySource(SRC, [])],
  [null, null, null, null]);

console.log('\n복사와 배치 — 브라우저 밖에서 볼 수 있는 것');
eq('textarea 와 input 에 포커스가 있으면 복사 처리가 비켜선다',
  [C.inTextField({ tagName: 'TEXTAREA' }), C.inTextField({ tagName: 'INPUT' }), C.inTextField({ tagName: 'DIV' }), C.inTextField(null)],
  [true, true, false, false]);
{
  // 배치가 실패하는 블록 하나를 두고 두 번 배치한다. 화면에서는 글꼴과 창 크기가 바뀔 때마다 다시 배치한다.
  const warns = [];
  const realWarn = console.warn;
  console.warn = msg => warns.push(msg);
  global.document = { addEventListener() {} };
  const bad = { querySelector() { throw new Error('일부러'); }, addEventListener() {} };
  const root = { querySelectorAll: sel => (sel === '.cb' ? [bad] : []) };
  C.mount(root);
  C.mount(root);
  console.warn = realWarn;
  delete global.document;
  eq('실패한 블록은 다시 배치해도 한 번만 알린다', warns, ['코드 블록 하나를 배치하지 못했습니다']);
}

console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
