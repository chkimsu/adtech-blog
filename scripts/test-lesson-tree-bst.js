#!/usr/bin/env node
// 과외 트리와 BST 데모(js/lesson-tree-bst-model.js)의 계산 시험.
// 기대값은 Python 3.9.7 로 같은 순서를 돌려 확인한 값이다.
//
//   node scripts/test-lesson-tree-bst.js
const T = require('../js/lesson-tree-bst-model.js');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}
const P = T.PRESETS;
const b1 = T.buildTrace(P['example-1'].values, P['example-1'].path);
eq('예제 1 이벤트', b1.events.map((e) => e.type), ['root', 'attach', 'attach', 'null', 'null', 'attach', 'attach', 'path', 'path', 'path', 'val']);
eq('예제 1 그룹', b1.events.map((e) => e.group), [0, 1, 1, 2, 2, 2, 2, 'path', 'path', 'path', 'path']);
eq('예제 1 null 자리', [b1.events[3].parent, b1.events[3].side, b1.events[3].id], ['1', 'left', '1:L']);
eq('예제 1 층', b1.levels, [[3], [9, 20], [15, 7]]);
eq('예제 1 root.right.left.val', b1.result, { ok: true, value: 15 });
const b2 = T.buildTrace(P['example-2'].values, P['example-2'].path);
eq('예제 2 이벤트', b2.events.map((e) => e.type), ['root', 'null', 'attach', 'path', 'path', 'path', 'val']);
eq('예제 2 오류', b2.result, { ok: false, error: "AttributeError: 'NoneType' object has no attribute 'val'" });
eq('예제 2 따라간 None', [b2.events[5].id, b2.nodes[b2.events[5].id].none], ['2:L', true]);
const d1 = T.depthTrace(P['example-1'].values);
eq('예제 1 높이와 이벤트 수', [d1.answer, d1.events.length], [3, 16]);
eq('예제 1 돌려준 값', d1.events.filter((e) => e.type === 'return').map((e) => [e.id, e.value]), [['1', 1], ['5', 1], ['6', 1], ['2', 2], ['0', 3]]);
eq('예제 1 None 호출', d1.events.filter((e) => e.type === 'none').length, 6);
eq('예제 1 그룹', d1.events.map((e) => e.group), [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 4]);
const d2 = T.depthTrace(P['example-2'].values);
eq('예제 2 높이와 그룹', [d2.answer, d2.events.map((e) => e.group)], [2, [0, 0, 0, 0, 0, 0, 1]]);
eq('예제 2 None 자식', d2.events.filter((e) => e.type === 'none').map((e) => e.id), ['0:L', '2:L', '2:R']);
const s1 = T.bstTrace(P.balanced.insert);
eq('균형 순서', [s1.height, s1.compares, s1.inorder, s1.answer], [3, 10, [20, 30, 40, 50, 60, 70, 80], null]);
eq('균형 이벤트 수', s1.events.length, 24);
const s2 = T.bstTrace(P.sorted.insert);
eq('정렬 순서', [s2.height, s2.compares, s2.inorder], [7, 21, [20, 30, 40, 50, 60, 70, 80]]);
eq('80 찾기 비교', [T.searchCompares(P.balanced.insert, 80), T.searchCompares(P.sorted.insert, 80)], [3, 7]);
const s3 = T.bstTrace(P['leetcode-230'].insert, P['leetcode-230'].k);
eq('230 높이, 비교, 답', [s3.height, s3.compares, s3.answer], [4, 9, 3]);
eq('230 중위 순회는 k 번째에서 멈춤', s3.events.filter((e) => e.type === 'visit').map((e) => e.value), [1, 2, 3]);

console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
