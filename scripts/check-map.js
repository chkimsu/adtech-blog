#!/usr/bin/env node
// 생태계 지도(js/ecosystem.js)의 기하 점검.
//   node scripts/check-map.js
//
// 브라우저를 띄우지 않고 좌표만으로 확인한다. 눈으로 보면 "선이 상자를 관통한다"가
// 금방 보이지만, 노드를 하나 옮길 때마다 34개 엣지를 다시 훑는 건 사람이 못 한다.
//
// 노드 채움이 rgba(...,0.13)이라 뒤로 지나는 선이 그대로 보인다 → 관통은 실제 결함이다.
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'ecosystem.js'), 'utf-8');

// ecosystem.js는 IIFE라 require가 안 된다. 필요한 조각만 떼어 평가한다.
function grabBlock(startRe) {
  const i = src.search(startRe);
  if (i < 0) throw new Error('못 찾음: ' + startRe);
  const j = src.slice(i).search(/[[{]/) + i;
  const open = src[j], close = open === '{' ? '}' : ']';
  let depth = 0;
  for (let k = j; k < src.length; k++) {
    if (src[k] === open) depth++;
    else if (src[k] === close && --depth === 0) return src.slice(j, k + 1);
  }
  throw new Error('블록이 안 닫힘: ' + startRe);
}

const NODES = eval('(' + grabBlock(/const NODES = \{/) + ')');
const EDGES = eval('(' + grabBlock(/const EDGES = \[/) + ')');
const rcSrc = (src.match(/function rectCenter[\s\S]*?\n  \}/) || [''])[0];
const geoSrc = src.slice(src.indexOf('function edgeGeometry'), src.indexOf('function roundedOrthPath'));
eval(rcSrc + '\n' + geoSrc);

// 직교 선분이 사각형 내부를 지나는지. pad는 테두리를 살짝 스치는 건 봐준다.
function segHitsRect(p, q, n, pad = 4) {
  const [x1, x2] = [Math.min(p[0], q[0]), Math.max(p[0], q[0])];
  const [y1, y2] = [Math.min(p[1], q[1]), Math.max(p[1], q[1])];
  return x1 < n.x + n.w - pad && x2 > n.x + pad
      && y1 < n.y + n.h - pad && y2 > n.y + pad;
}

const hits = new Map();   // "from→to" → 관통당한 노드 집합
for (const e of EDGES) {
  const g = edgeGeometry(e);
  for (let i = 0; i < g.points.length - 1; i++) {
    for (const [id, n] of Object.entries(NODES)) {
      if (id === e.from || id === e.to) continue;
      if (!segHitsRect(g.points[i], g.points[i + 1], n)) continue;
      const key = `${e.from} → ${e.to}`;
      if (!hits.has(key)) hits.set(key, new Set());
      hits.get(key).add(id);
    }
  }
}

// 노드끼리 겹치는지도 본다 (좌표를 손으로 옮기다 흔히 나는 실수)
const ids = Object.keys(NODES);
const overlaps = [];
for (let i = 0; i < ids.length; i++) {
  for (let j = i + 1; j < ids.length; j++) {
    const a = NODES[ids[i]], b = NODES[ids[j]];
    if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) {
      overlaps.push(`${ids[i]} ⊗ ${ids[j]}`);
    }
  }
}

console.log(`노드 ${ids.length}개 · 엣지 ${EDGES.length}개`);
if (overlaps.length) console.log(`\n✗ 노드끼리 겹침 ${overlaps.length}건:\n  ` + overlaps.join('\n  '));
else console.log('✓ 노드끼리 겹침 없음');

if (hits.size) {
  const total = [...hits.values()].reduce((s, v) => s + v.size, 0);
  console.log(`\n✗ 선이 다른 노드를 관통 ${total}건 (엣지 ${hits.size}개):`);
  for (const [k, v] of hits) console.log(`  ${k.padEnd(34)} ⊗ ${[...v].join(', ')}`);
} else {
  console.log('✓ 선이 노드를 관통하는 곳 없음');
}
process.exit(overlaps.length ? 1 : 0);
