#!/usr/bin/env node
// 과외 투 포인터 데모(js/lesson-two-pointers-model.js)의 계산 시험.
//
//   node scripts/test-lesson-two-pointers.js
const T = require('../js/lesson-two-pointers-model.js');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}

console.log('투 포인터 — 양 끝에서 좁히기와 버린 짝');
const P = T.PRESETS;
const s = T.pointerTrace(P.sorted.nums, 10);
eq('정렬 답', s.answer, [2, 3]);
eq('정렬 합 순서', s.events.map((e) => e.sum), [12, 9, 11, 9, 10]);
eq('정렬 판정', s.events.map((e) => e.verdict), ['big', 'small', 'big', 'small', 'hit']);
eq('정렬 버린 짝 수', s.events.map((e) => e.removed.length), [5, 4, 3, 2, 0]);
eq('첫 비교에 버린 짝', s.events[0].removed, [[0, 5], [1, 5], [2, 5], [3, 5], [4, 5]]);
const u = T.pointerTrace(P.unsorted.nums, 10);
eq('정렬 안 함 답 없음', u.answer, null);
eq('정렬 안 함 실제 짝', T.pairsAll(P.unsorted.nums, 10), [[4, 5]]);
eq('정렬 안 함 첫 비교에 답을 버림', u.events[0].removed.some(([i, j]) => i === 4 && j === 5), true);
eq('167 답(0부터)', T.pointerTrace(P['leetcode-167'].nums, 9).answer, [0, 1]);

console.log('덧붙인 시험 — 버린 짝 합계, group 번호, 문장');
eq('정렬 버린 짝 합계', s.events.reduce((n, e) => n + e.removed.length, 0), 14);
eq('정렬 안 함 버린 짝 합계', u.events.reduce((n, e) => n + e.removed.length, 0), 15);
eq('group 은 이벤트 순서', s.events.map((e) => e.group), [0, 1, 2, 3, 4]);
eq('정렬 실제 짝', T.pairsAll(P.sorted.nums, 10), [[2, 3]]);
eq('describe 정렬', T.describe('sorted'), 'nums = [1, 3, 4, 6, 8, 11], target = 10 입니다. L 과 R 을 양 끝에서 좁혀 와 인덱스 2와 3(4 + 6)을 답으로 찾습니다. 모든 짝 15개 가운데 비교는 5번입니다.');
eq('describe 정렬 안 함', T.describe('unsorted'), 'nums = [11, 3, 8, 1, 6, 4], target = 10 입니다. L 과 R 이 5번 비교하고도 짝을 찾지 못합니다. 인덱스 4와 5(6 + 4)가 답인데 첫 비교에서 버렸습니다.');
eq('describe 모르는 키', T.describe('nope'), '');
// 괄호 풀이 뒤의 조사는 괄호 앞의 j 로 고른다. 괄호 안 마지막 숫자(4)로 고르면 「가」가 된다
eq('pairText 조사는 괄호 앞 낱말로', T.pairText([1, 2, 0, 4], [1, 3], '이', '가'), '인덱스 1과 3(2 + 4)이');
eq('pairText 조사 없음', T.pairText([1, 2, 0, 4], [1, 3]), '인덱스 1과 3(2 + 4)');

console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
