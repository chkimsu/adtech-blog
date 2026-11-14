#!/usr/bin/env node
// 과외 해시 맵 데모(js/lesson-hash-map-model.js)의 계산 시험.
//
//   node scripts/test-lesson-hash-map.js
const H = require('../js/lesson-hash-map-model.js');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}

console.log('해시 맵 — seen 한 번 순회, 이중 for 문, 미리 다 적기');
const P = H.PRESETS;
const s = H.seenTrace(P['two-sum'].nums, 9);
eq('two-sum 답', s.answer, [0, 2]);
eq('two-sum 확인 수', s.checks, 3);
eq('two-sum 이벤트 순서', s.events.map((e) => e.type), ['look', 'store', 'look', 'store', 'look']);
eq('짝 찾기 직전 seen', s.events[4].seen, [[2, 0], [11, 1]]);
eq('late-pair seen 확인 수', H.seenTrace(P['late-pair'].nums, 18).checks, 8);
eq('late-pair 이중 for 문 비교 수', H.bruteTrace(P['late-pair'].nums, 18).comparisons, 28);
eq('late-pair 이중 for 문 답', H.bruteTrace(P['late-pair'].nums, 18).answer, [6, 7]);
eq('two-sum 이중 for 문 비교 수', H.bruteTrace(P['two-sum'].nums, 9).comparisons, 2);
eq('미리 다 적기 답', H.prefillTrace(P['self-pair'].nums, 6).answer, [0, 0]);
eq('순서대로 적기 답', H.seenTrace(P['self-pair'].nums, 6).answer, [1, 2]);
eq('답 없음', H.seenTrace([1, 2], 10).answer, []);
eq('답 없음 확인 수', H.seenTrace([1, 2], 10).checks, 2);

console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
