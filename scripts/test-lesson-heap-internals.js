#!/usr/bin/env node
// 과외 힙의 내부 데모(js/lesson-heap-internals-model.js)의 계산 시험.
// 기대 리스트는 모두 Python 3.9.7 heapq 로 찍은 값이다.
//
//   node scripts/test-lesson-heap-internals.js
const H = require('../js/lesson-heap-internals-model.js');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}
const P = H.PRESETS;
const types = (t) => t.events.map((e) => e.type);
const r1 = H.ruleTrace(P.loose.heap, 'min');
eq('loose 부모와 자식 6쌍', r1.events.filter((e) => e.type === 'pair').map((e) => [e.child, e.parent, e.ok]), [[1, 0, true], [2, 0, true], [3, 1, true], [4, 1, true], [5, 2, true], [6, 2, true]]);
eq('loose 층 비교와 두 번째 값', [r1.ok, r1.level, r1.second], [true, [1, 5], 20]);
eq('loose 이벤트', [types(r1), r1.events.map((e) => e.group)], [['pair', 'pair', 'pair', 'pair', 'pair', 'pair', 'level', 'second'], [0, 1, 2, 3, 4, 5, 'level', 'second']]);
const r2 = H.ruleTrace(P['max-90'].heap, 'max');
eq('max-90 규칙, 층, 두 번째로 큰 값', [r2.ok, r2.level, r2.second, r2.events.length], [true, null, 80, 6]);
const r3 = H.ruleTrace(P['not-heap'].heap, 'min');
eq('not-heap 어긴 쌍', [r3.ok, r3.bad, r3.second, types(r3)], [false, [2], null, ['pair', 'pair']]);
const p1 = H.pushTrace(P.four.push);
eq('four 넣은 뒤 리스트', p1.events.filter((e) => e.type === 'place').map((e) => e.heap), [[40], [10, 40], [10, 40, 30], [5, 10, 30, 40]]);
eq('four 비교 수와 이벤트 수', [p1.compares, p1.events.length], [[0, 1, 1, 2], 12]);
eq('four 5 의 길', p1.events.filter((e) => e.group === 3).map((e) => [e.type, e.at, e.heap]), [['append', 3, [10, 40, 30, 5]], ['compare', 3, [10, 5, 30, 40]], ['compare', 1, [5, 10, 30, 40]], ['place', 0, [5, 10, 30, 40]]]);
eq('turn-64 최소 힙', [H.pushTrace(P['turn-64'].push).heap, H.pushTrace(P['turn-64'].push).compares], [[10, 30, 90, 50, 70], [0, 1, 1, 2, 1]]);
eq('negated 최대 힙 흉내', [H.pushTrace(P.negated.push).heap, H.pushTrace(P.negated.push).compares], [[-90, -70, -50, -10, -30], [0, 1, 1, 2, 2]]);
const b1 = H.bookTrace(P.six.heap);
eq('six 교과서 방식', [b1.value, b1.heap, b1.compares, b1.path, types(b1)], [10, [15, 20, 30, 40, 50], 2, [0, 2], ['take', 'last', 'root', 'swap', 'stop']]);
eq('six 교과서 그룹', b1.events.map((e) => e.group), [0, 0, 0, 1, 2]);
const c1 = H.popTrace(P.six.heap);
eq('six CPython 방식', [c1.value, c1.heap, c1.compares, c1.lifts, c1.leaf, types(c1)], [10, [15, 20, 30, 40, 50], 2, [2], 2, ['take', 'last', 'lift', 'leaf', 'fill', 'up']]);
eq('six 빈칸이 내려간 리스트', c1.events.filter((e) => e.heap).map((e) => e.heap), [[null, 20, 15, 40, 50, 30], [null, 20, 15, 40, 50], [15, 20, null, 40, 50], [15, 20, 30, 40, 50], [15, 20, 30, 40, 50]]);
const c2 = H.popTrace(P.hole.heap);
eq('hole 빈칸이 3번 칸 잎에 닿음', [c2.lifts, c2.leaf, c2.events[c2.events.findIndex((e) => e.type === 'leaf') - 1].heap], [[1, 3], 3, [15, 40, 20, null, 50]]);
eq('hole 결과', [c2.heap, c2.compares, c2.events.filter((e) => e.type === 'up').map((e) => e.move)], [[15, 30, 20, 40, 50], 4, [true, false]]);
eq('hole 그룹', c2.events.map((e) => e.group), [0, 0, 1, 2, 'up', 'up', 'up', 'up']);
eq('hole 교과서', [H.bookTrace(P.hole.heap).heap, H.bookTrace(P.hole.heap).compares], [[15, 30, 20, 40, 50], 4]);
const b3 = H.bookTrace(P.twelve.heap), c3 = H.popTrace(P.twelve.heap);
eq('twelve 두 방식 같은 리스트', [b3.heap, c3.heap], [[2, 3, 7, 4, 6, 9, 8, 15, 11, 10, 12], [2, 3, 7, 4, 6, 9, 8, 15, 11, 10, 12]]);
eq('twelve 비교 수', [b3.compares, c3.compares, b3.path, c3.lifts], [6, 4, [0, 1, 3, 8], [1, 3, 8]]);

console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
