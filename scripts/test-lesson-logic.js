#!/usr/bin/env node
// 과외 BFS 데모의 순수 로직 시험. DOM 이 없어도 도는 부분만 본다.
//
//   node scripts/test-lesson-logic.js
const B = require('../js/lesson-bfs-model.js');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}

const P = B.PRESETS;
const size = (L) => L.map((l) => l.length);
console.log('BFS 겹, 섬, 미로, 칸 토글');
eq('열린 3×3 겹 크기', size(B.bfsTrace(P['open-3x3'].rows, [0,0], '1').layers), [1,2,3,2,1]);
eq('열린 3×3 첫 겹 순서', B.bfsTrace(P['open-3x3'].rows, [0,0], '1').layers[1], [[1,0],[0,1]]);
eq('십자 섬 겹 크기', size(B.bfsTrace(P['cross-5x5'].rows, [2,2], '1').layers), [1,4,4]);
eq('3×3 섬 수', B.islandTrace(P['islands-3x3'].rows).count, 2);
eq('3×3 섬 넓이', B.islandTrace(P['islands-3x3'].rows).areas, [2,2]);
eq('4×5 섬 수', B.islandTrace(P['islands-4x5'].rows).count, 3);
eq('4×5 섬 넓이', B.islandTrace(P['islands-4x5'].rows).areas, [4,1,2]);
eq('땅 없음', B.islandTrace(['00','00']).count, 0);
const m = B.pathTrace(P['maze-5x5'].rows, [0,0], [4,4]);
eq('미로 이동 수', m.moves, 8);
eq('미로 경로 칸 수', m.path.length, 9);
eq('경로 시작과 끝', [m.path[0], m.path[8]], [[0,0],[4,4]]);
eq('마지막 방문 깊이', m.events[m.events.length - 1].depth, 8);
eq('대화 미로 이동 수', B.pathTrace(['...','##.','...'], [0,0], [2,2]).moves, 4);
eq('막힌 출구', B.pathTrace(['.#','#.'], [0,0], [1,1]).moves, -1);
eq('막힌 출구 경로', B.pathTrace(['.#','#.'], [0,0], [1,1]).path, []);
eq('땅 토글', B.toggleCell(['10'], 0, 1, 'islands'), ['11']);
eq('벽 토글', B.toggleCell(['.#.'], 0, 1, 'path'), ['...']);
eq('출구 칸은 안 바뀜', B.toggleCell(P['maze-5x5'].rows, 4, 4, 'path'), P['maze-5x5'].rows);

const allPass = fail === 0;
console.log(`\n${allPass ? `✓ 전부 통과 (${pass}건)` : `✗ ${fail}건 실패 / ${pass + fail}건`}`);
process.exit(allPass ? 0 : 1);
