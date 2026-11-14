#!/usr/bin/env node
// 과외 DP 입문 데모(js/lesson-dp-intro-model.js)의 계산 시험.
// 기대값은 Python 3.9.7 로 센 값이다.
//
//   node scripts/test-lesson-dp-intro.js
const M = require('../js/lesson-dp-intro-model.js');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}
const P = M.PRESETS;
const steps = (t, type) => t.events.filter((e) => e.type === type).map((e) => e.step);
const a = M.callTrace(P['climb-5'].n, false);
eq('n 5 그냥 재귀 답과 호출', [a.answer, a.calls], [8, 9]);
eq('n 5 그냥 재귀 호출 순서', steps(a, 'call'), [5, 4, 3, 2, 1, 2, 3, 2, 1]);
eq('n 5 그냥 재귀 바닥과 계산', [steps(a, 'base'), a.events.filter((e) => e.type === 'return').map((e) => [e.step, e.value])], [[2, 1, 2, 2, 1], [[3, 3], [4, 5], [3, 3], [5, 8]]]);
eq('n 5 그냥 재귀 그룹 수', a.events[a.events.length - 1].group + 1, 9);
eq('n 5 호출 트리', [a.nodes.c0, a.nodes.c1, a.nodes.c6], [{ step: 5, left: 'c1', right: 'c6' }, { step: 4, left: 'c2', right: 'c5' }, { step: 3, left: 'c7', right: 'c8' }]);
const m = M.callTrace(P['climb-5'].n, true);
eq('n 5 메모 재귀 답과 호출', [m.answer, m.calls, m.memo], [8, 7, { 3: 3, 4: 5, 5: 8 }]);
eq('n 5 메모 재귀 순서', m.events.map((e) => e.type), ['call', 'call', 'call', 'call', 'base', 'call', 'base', 'return', 'call', 'base', 'return', 'call', 'hit', 'return']);
eq('n 5 메모에서 꺼낸 값', m.events.filter((e) => e.type === 'hit').map((e) => [e.id, e.step, e.value]), [['c6', 3, 3]]);
eq('n 6 호출 수', [M.callTrace(6, false).calls, M.callTrace(6, true).calls], [15, 9]);
const tc = M.tableClimb(5);
eq('계단 표', [tc.answer, tc.dp, tc.events.map((e) => e.group)], [8, [null, 1, 2, 3, 5, 8], ['base', 'base', 3, 4, 5]]);
eq('계단 두 변수', tc.events.filter((e) => e.type === 'fill').map((e) => e.prev), [[2, 3], [3, 5], [5, 8]]);
const r5 = M.tableRob(P['rob-5'].nums);
eq('집 털기 표', [r5.answer, r5.dp, r5.picks, r5.houses], [12, [2, 7, 11, 11, 12], ['take', 'skip', 'take'], [0, 2, 4]]);
eq('집 털기 비교 값', r5.events.filter((e) => e.type === 'fill').map((e) => [e.i, e.take, e.skip]), [[2, 11, 7], [3, 10, 11], [4, 12, 11]]);
const r4 = M.tableRob(P['rob-4'].nums);
eq('집 털기 예제 1', [r4.answer, r4.dp, r4.picks, r4.houses], [4, [1, 2, 4, 4], ['take', 'skip'], [0, 2]]);

console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
