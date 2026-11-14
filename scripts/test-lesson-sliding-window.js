#!/usr/bin/env node
// 과외 슬라이딩 윈도우 데모(js/lesson-sliding-window-model.js)의 계산 시험.
//
//   node scripts/test-lesson-sliding-window.js
const W = require('../js/lesson-sliding-window-model.js');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}

console.log('슬라이딩 윈도우 — 빼고 더하기, 다 더하기, 중복 없는 부분 문자열');
const P = W.PRESETS;
const a = W.slideTrace(P['max-sum'].nums, 3);
eq('창 합', a.sums, [8, 7, 9, 6]);
eq('최대 합', a.best, 9);
eq('최대 창 시작', a.bestStart, 2);
eq('빼고 더하기 연산 수', a.ops, 9);
eq('다 더하기 연산 수', W.resumTrace(P['max-sum'].nums, 3).ops, 12);
const b = W.slideTrace(P['leetcode-643'].nums, 4);
eq('643 창 합', b.sums, [2, 51, 42]);
eq('643 평균', b.best / 4, 12.75);
eq('긴 배열 빼고 더하기', W.slideTrace(P.longer.nums, 6).ops, 18);
eq('긴 배열 다 더하기', W.resumTrace(P.longer.nums, 6).ops, 42);
eq('긴 배열 최대 합', W.slideTrace(P.longer.nums, 6).best, 30);
eq('10만과 5만', W.opsCount(100000, 50000), { windows: 50001, resum: 2500050000, slide: 150000 });
eq('abcabcbb', W.distinctTrace('abcabcbb').best, 3);
eq('pwwkew 범위', W.distinctTrace('pwwkew').bestRange, [2, 4]);
eq('bbbbb', W.distinctTrace('bbbbb').best, 1);
eq('빈 문자열', W.distinctTrace('').best, 0);

console.log('덧붙인 시험 — 이벤트 모양, 묶음 번호, 문장');
eq('slide 이벤트 수와 묶음', a.events.map((e) => e.group), [0, 0, 0, 1, 2, 3]);
eq('slide 첫 창 누적', a.events.slice(0, 3).map((e) => [e.partial, e.ops]), [[2, 1], [3, 2], [8, 3]]);
eq('slide 옮김 이벤트', a.events.slice(3).map((e) => [e.out, e.in, e.sum, e.best, e.ops]), [[2, 1, 7, 8, 5], [1, 3, 9, 9, 7], [5, 2, 6, 9, 9]]);
const r = W.resumTrace(P['max-sum'].nums, 3);
eq('resum 이벤트 수', r.events.length, 12);
eq('resum 묶음', r.events.map((e) => e.group), [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3]);
eq('resum 창 합', r.events.filter((e, i) => i % 3 === 2).map((e) => e.partial), [8, 7, 9, 6]);
eq('resum 마지막 누적', r.events[11].ops, 12);
eq('긴 배열 최대 창은 먼저 나온 것', W.slideTrace(P.longer.nums, 6).bestStart, 4);
const d = W.distinctTrace('pwwkew');
eq('pwwkew 이벤트 종류', d.events.map((e) => e.type), ['add', 'add', 'drop', 'drop', 'add', 'add', 'add', 'drop', 'add']);
eq('pwwkew 뺀 글자', d.events.filter((e) => e.type === 'drop').map((e) => [e.l, e.ch]), [[0, 'p'], [1, 'w'], [2, 'w']]);
eq('pwwkew 묶음', d.events.map((e) => e.group), [0, 1, 2, 2, 2, 3, 4, 5, 5]);
eq('pwwkew 같은 길이는 안 바꿈', d.events[d.events.length - 1].best, 3);
eq('abcabcbb 범위', W.distinctTrace('abcabcbb').bestRange, [0, 2]);
eq('빈 문자열 범위', W.distinctTrace('').bestRange, [0, -1]);
eq('PRESET_MODES 가 MODE_DEFAULT 를 포함', W.MODES.every((m) => W.PRESET_MODES[W.MODE_DEFAULT[m]].includes(m)), true);
eq('describe 빼고 더하기', W.describe('slide', 'max-sum'), 'nums = [2, 1, 5, 1, 3, 2], k = 3 입니다. 창은 4개이고 최대 합은 9입니다. 빼고 더하기는 연산 9번이 듭니다. 다 더하기는 12번입니다.');
eq('describe 쓸 수 없는 입력', W.describe('slide', 'pwwkew'), '');
eq('describe 중복 없는 문자열', W.describe('distinct', 'pwwkew'), 's = "pwwkew" 입니다. 중복 없는 가장 긴 부분 문자열은 인덱스 2부터 4까지의 "wke" 이고 길이는 3입니다.');

console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
