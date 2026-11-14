#!/usr/bin/env node
// 과외 이진 탐색 데모(js/lesson-binary-search-model.js)의 계산 시험.
//
//   node scripts/test-lesson-binary-search.js
const B = require('../js/lesson-binary-search-model.js');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}

console.log('이진 탐색 — 닫힌 구간 탐색, bisect 의 두 자리, 답의 범위');
const P = B.PRESETS;
const mids = (t) => t.events.filter((e) => e.type === 'mid').map((e) => e.mid);
const am = (t) => [t.answer, mids(t)];
const a = B.searchTrace(P['leetcode-704'].nums, 9);
eq('704 답', a.answer, 4);
eq('704 mid 순서', mids(a), [2, 4]);
eq('704 판정', a.events.filter((e) => e.type === 'mid').map((e) => e.verdict), ['small', 'hit']);
eq('704 이벤트와 그룹', a.events.map((e) => [e.type, e.group]), [['mid', 0], ['move', 0], ['mid', 1]]);
eq('704 첫 이동에 버린 칸', a.events[1].dropped, [0, 2]);
const b = B.searchTrace(P['last-one'].nums, 12);
eq('마지막 한 칸 답과 mid', [b.answer, mids(b)], [5, [2, 4, 5]]);
eq('마지막 한 칸 범위', [b.events[b.events.length - 1].left, b.events[b.events.length - 1].right], [5, 5]);
const c = B.searchTrace(P.missing.nums, 2);
eq('없는 값 답과 mid', [c.answer, mids(c)], [-1, [2, 0, 1]]);
eq('없는 값 마지막 범위', [c.events[c.events.length - 1].left, c.events[c.events.length - 1].right], [2, 1]);
eq('앞에서부터 비교 수', B.linearCount(P['leetcode-704'].nums, 9), 5);
eq('반복 상한', [6, 1000000, 1000000000].map(B.worstIterations), [3, 20, 30]);
const d = B.bisectTrace(P['dup-4'].nums, 4);
eq('bisect 두 자리와 개수', [d.left, d.right, d.count], [2, 5, 3]);
eq('bisect_left mid', d.events.filter((e) => e.type === 'probe' && e.side === 'left').map((e) => e.mid), [3, 1, 2]);
eq('bisect_right mid', d.events.filter((e) => e.type === 'probe' && e.side === 'right').map((e) => e.mid), [3, 5, 4]);
const e3 = B.bisectTrace(P['dup-3'].nums, 3);
eq('없는 값 bisect', [e3.left, e3.right, e3.count], [2, 2, 0]);
const k8 = B.paramTrace(P['koko-8'].piles, 8);
eq('875 답과 mid', [k8.answer, mids(k8)], [4, [6, 3, 4]]);
eq('875 걸리는 시간', k8.events.filter((e) => e.type === 'mid').map((e) => e.hours), [6, 10, 8]);
eq('h 5', am(B.paramTrace(P['koko-5'].piles, 5)), [7, [6, 9, 7]]);
eq('h 4', am(B.paramTrace(P['koko-4'].piles, 4)), [11, [6, 9, 10, 11]]);
eq('속도 4 의 걸리는 시간', B.hours([3, 6, 7, 11], 4), 8);

console.log('덧붙인 시험 — 이벤트 모양, 그룹, 문장');
eq('bisect 그룹과 done', d.events.filter((e) => e.side === 'left').map((e) => [e.type, e.group]), [['probe', 'left-0'], ['probe', 'left-1'], ['probe', 'left-2'], ['done', 'left-2']]);
eq('bisect done 자리', d.events.filter((e) => e.type === 'done').map((e) => [e.side, e.pos]), [['left', 2], ['right', 5]]);
eq('bisect probe 이동 방향', d.events.filter((e) => e.type === 'probe' && e.side === 'left').map((e) => e.go), ['hi', 'lo', 'hi']);
eq('bisect 첫 probe', d.events[0], { type: 'probe', side: 'left', lo: 0, hi: 7, mid: 3, value: 4, go: 'hi', group: 'left-0' });
eq('704 hit 은 이동이 없다', a.events[a.events.length - 1].type, 'mid');
eq('없는 값 이동의 버린 칸', c.events.filter((e) => e.type === 'move').map((e) => e.dropped), [[2, 5], [0, 0], [1, 1]]);
eq('875 이동과 답 후보', k8.events.filter((e) => e.type === 'move').map((e) => [e.left, e.right, e.ans, e.dropped]), [[1, 5, 6, [7, 11]], [4, 5, 6, [1, 3]], [4, 3, 4, [5, 5]]]);
eq('875 그룹', k8.events.map((e) => e.group), [0, 0, 1, 1, 2, 2]);
eq('PRESET_MODES 가 MODE_DEFAULT 를 포함', B.MODES.every((m) => B.PRESET_MODES[B.MODE_DEFAULT[m]].includes(m)), true);
eq('describe 704', B.describe('search', 'leetcode-704'), 'nums = [-1, 0, 3, 5, 9, 12], target = 9 입니다. 반복 2번에 인덱스 4에서 찾습니다. 앞에서부터 찾으면 비교 5번입니다.');
eq('describe 쓸 수 없는 입력', B.describe('search', 'koko-8'), '');
eq('describe bisect', B.describe('bisect', 'dup-4'), 'nums = [1, 2, 4, 4, 4, 5, 8], x = 4 입니다. 넣을 자리는 bisect_left 2, bisect_right 5이고 4의 개수는 5 - 2 = 3입니다.');
eq('describe 개수 0', B.describe('bisect', 'dup-3'), 'nums = [1, 2, 4, 4, 4, 5, 8], x = 3 입니다. 넣을 자리는 bisect_left 2, bisect_right 2이고 3은 없어 개수 0입니다.');
eq('describe 875', B.describe('param', 'koko-8'), 'piles = [3, 6, 7, 11], h = 8 입니다. 가장 느린 속도는 4이고 반복은 3번입니다. 속도 4에서 걸리는 시간은 8시간입니다.');

console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
