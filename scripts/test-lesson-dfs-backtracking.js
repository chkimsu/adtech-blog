#!/usr/bin/env node
// 과외 DFS와 백트래킹 데모(js/lesson-dfs-backtracking-model.js)의 계산 시험.
// 기대값은 Python 3.9.7 로 센 값이다.
//
//   node scripts/test-lesson-dfs-backtracking.js
const D = require('../js/lesson-dfs-backtracking-model.js');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}
const P = D.PRESETS;
const sigs = (t) => t.events.filter((e) => e.type !== 'probe');
const w1 = D.wordTrace(P.abcced.board, P.abcced.word);
eq('ABCCED 찾음, 호출, 시작 칸', [w1.found, w1.calls, w1.starts], [true, 17, [[0, 0]]]);
eq('ABCCED 표시한 칸 순서', w1.events.filter((e) => e.type === 'mark').map((e) => [e.r, e.c]), [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1]]);
eq('ABCCED 막힌 시도', [w1.events.filter((e) => e.result === 'out').length, w1.events.filter((e) => e.result === 'miss').length], [5, 5]);
eq('ABCCED 이벤트 수와 마지막 그룹', [w1.events.length, w1.events[w1.events.length - 1].group], [23, 12]);
const w2 = D.wordTrace(P.see.board, P.see.word);
eq('SEE 찾음, 호출, 시작 칸', [w2.found, w2.calls, w2.starts], [true, 16, [[1, 0], [1, 3]]]);
eq('SEE 표시와 되돌림', sigs(w2).map((e) => [e.type, e.r, e.c]), [['mark', 1, 0], ['restore', 1, 0], ['mark', 1, 3], ['mark', 0, 3], ['restore', 0, 3], ['mark', 2, 3], ['mark', 2, 2], ['done', 1, 2], ['restore', 2, 2], ['restore', 2, 3], ['restore', 1, 3]]);
eq('SEE 막다른 0행 3열', w2.events.filter((e) => e.group === 4).map((e) => [e.type, e.r, e.c, e.result || e.found]), [['probe', -1, 3, 'out'], ['probe', 1, 3, 'miss'], ['probe', 0, 2, 'miss'], ['probe', 0, 4, 'out'], ['restore', 0, 3, false]]);
eq('SEE 표시한 칸을 # 로 읽음', w2.events.filter((e) => e.type === 'probe' && e.letter === '#').map((e) => [e.r, e.c, e.k]), [[1, 3, 2], [1, 3, 2]]);
const w3 = D.wordTrace(P.abcb.board, P.abcb.word);
eq('ABCB 못 찾음', [w3.found, w3.calls, w3.starts, sigs(w3).length], [false, 18, [[0, 0], [2, 0]], 8]);
eq('ABCB 이미 쓴 칸을 # 로 만남', w3.events.filter((e) => e.letter === '#').map((e) => [e.r, e.c, e.k]), [[0, 0, 2], [0, 1, 3]]);
const t1 = D.targetTrace(P.t1.nums, P.t1.target, false);
eq('t1 방법, 호출, 잎', [t1.ways, t1.calls, t1.leaves, t1.pruned], [3, 15, 8, 0]);
eq('t1 맞은 잎', t1.events.filter((e) => e.type === 'leaf' && e.hit).map((e) => e.id), ['r++-', 'r+-+', 'r-++']);
eq('t1 이벤트 수와 그룹 수', [t1.events.length, t1.events[t1.events.length - 1].group + 1], [30, 15]);
eq('t1 첫 반환까지', t1.events.filter((e) => e.group === 0).map((e) => [e.type, e.id]), [['call', 'r'], ['call', 'r+'], ['call', 'r++'], ['call', 'r+++'], ['leaf', 'r+++']]);
const t1p = D.targetTrace(P.t1.nums, P.t1.target, true);
eq('t1 가지치기', [t1p.ways, t1p.calls, t1p.leaves, t1p.pruned, t1p.events.filter((e) => e.type === 'prune').map((e) => e.id)], [3, 13, 6, 1, ['r--']]);
const t3 = D.targetTrace(P.t3.nums, P.t3.target, false), t3p = D.targetTrace(P.t3.nums, P.t3.target, true);
eq('t3 가지치기 전과 뒤', [t3.ways, t3.calls, t3p.ways, t3p.calls, t3p.leaves], [1, 15, 1, 7, 2]);
eq('t3 잘린 노드', t3p.events.filter((e) => e.type === 'prune').map((e) => [e.id, e.sum, e.rest]), [['r+-', 0, 1], ['r-', -1, 2]]);
eq('남은 합', t3p.rest, [3, 2, 1, 0]);
const big = D.targetTrace([1, 1, 1, 1, 1], 3, false), bigp = D.targetTrace([1, 1, 1, 1, 1], 3, true);
eq('494 예제 1 호출 수', [big.ways, big.calls, big.leaves, bigp.ways, bigp.calls], [5, 63, 32, 5, 31]);

console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
