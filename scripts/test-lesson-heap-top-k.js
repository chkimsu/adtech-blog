#!/usr/bin/env node
// 과외 힙과 Top K 데모(js/lesson-heap-top-k-model.js)의 계산 시험.
// 기대 리스트는 모두 Python 3.9.7 heapq 로 찍은 값이다.
//
//   node scripts/test-lesson-heap-top-k.js
const H = require('../js/lesson-heap-top-k-model.js');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}
const P = H.PRESETS;
const pops = (t) => t.events.filter((e) => e.type === 'pop').map((e) => e.value);
const h = [];
[40, 10, 30, 5].forEach((v) => H.heappush(h, v));
eq('heappush 네 번', h, [5, 10, 30, 40]);
eq('heappop', [H.heappop(h), h], [5, [10, 40, 30]]);
const a = [9, 1, 5, 2, 7]; H.heapify(a);
eq('heapify', a, [1, 2, 5, 9, 7]);
const t = H.topkTrace(P['leetcode-215'].nums, 2);
eq('215 답과 남은 힙', [t.answer, t.heap], [5, [5, 6]]);
eq('215 단계마다 리스트', t.events.map((e) => e.heap), [[3], [2, 3], [1, 3, 2], [2, 3], [2, 3, 5], [3, 5], [3, 5, 6], [5, 6], [4, 6, 5], [5, 6]]);
eq('215 꺼낸 값', pops(t), [1, 2, 3, 4]);
eq('215 그룹', t.events.map((e) => e.group), [0, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
eq('215 가장 긴 리스트', t.maxSize, 3);
const s = H.topkTrace(P.scores.nums, 2);
eq('scores 1 을 넣은 뒤', s.events[4].heap, [1, 20, 10]);
eq('scores 꺼낸 값과 남은 힙', [pops(s), s.heap], [[5, 1, 10, 15], [20, 30]]);
const w = H.topkTrace(P.twelve.nums, 3);
eq('twelve 답과 남은 힙', [w.answer, w.heap], [11, [11, 12, 15]]);
eq('twelve 이벤트 수와 가장 긴 리스트', [w.events.length, w.maxSize], [21, 4]);
eq('twelve 4 를 넣은 뒤', w.events[3].heap, [2, 4, 9, 7]);
const n = H.negateTrace(P['leetcode-215'].nums, 2);
eq('부호 뒤집기 heapify', n.events[1].heap, [-6, -5, -4, -3, -2, -1]);
eq('부호 뒤집기 꺼낸 값과 답', [pops(n), n.answer, n.heap], [[6, 5], 5, [-4, -3, -2, -1]]);
eq('scores 부호 뒤집기 heapify', H.negateTrace(P.scores.nums, 2).events[1].heap, [-30, -15, -20, -1, -5, -10]);
const d = H.dropTrace(P['leetcode-215'].nums, 2);
eq('버리기 heapify', d.events[0].heap, [1, 2, 3, 5, 6, 4]);
eq('버리기 꺼낸 값과 답', [pops(d), d.answer, d.heap], [[1, 2, 3, 4], 5, [5, 6]]);
const d12 = H.dropTrace(P.twelve.nums, 3);
eq('twelve 버리기 heapify', d12.events[0].heap, [1, 2, 7, 3, 6, 9, 8, 15, 4, 10, 12, 11]);
eq('twelve 버리기 답', [d12.answer, d12.heap, d12.maxSize], [11, [11, 12, 15], 12]);

console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
