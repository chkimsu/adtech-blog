// ===================================================================
// 과외 BFS 데모 — 계산 모듈
//   js/lesson-bfs-model.js
//
// DOM 을 모른다. 격자 위의 너비 우선 탐색(BFS)이 어떤 순서로 칸을 보는지
// 이벤트 목록으로 돌려주고, 화면은 그 목록을 한 칸씩 재생한다.
// 시험은 scripts/test-lesson-logic.js 다.
// ===================================================================
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LessonBfs = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  // 상, 하, 좌, 우 — 대화 속 코드와 같은 순서
  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  const PRESETS = {
    'islands-3x3': { mode: 'islands', rows: ['110', '000', '011'] },
    'islands-4x5': { mode: 'islands', rows: ['11000', '11000', '00100', '00011'] },
    'open-3x3': { mode: 'layers', rows: ['111', '111', '111'], start: [0, 0] },
    'cross-5x5': {
      mode: 'layers',
      rows: ['00100', '00100', '11111', '00100', '00100'],
      start: [2, 2],
    },
    'maze-5x5': {
      mode: 'path',
      rows: ['.....', '..#..', '..#..', '..#..', '.....'],
      start: [0, 0],
      goal: [4, 4],
    },
  };

  const key = (r, c) => r + ',' + c;

  // 큐에 넣을 때 방문 표시를 한다. 꺼낼 때마다 visit 이벤트 하나를 남기고,
  // goal 이 있으면 그 칸의 visit 을 남긴 직후 멈춘다.
  function bfsTrace(rows, start, openChar, goal) {
    const R = rows.length;
    const C = R ? rows[0].length : 0;
    const seen = new Set([key(start[0], start[1])]);
    const queue = [[start[0], start[1], 0]];
    const layers = [];
    const events = [];
    const parent = {};
    let head = 0;
    while (head < queue.length) {
      const [r, c, d] = queue[head++];
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
        if (rows[nr][nc] !== openChar || seen.has(key(nr, nc))) continue;
        seen.add(key(nr, nc));
        parent[key(nr, nc)] = [r, c];
        queue.push([nr, nc, d + 1]);
      }
      (layers[d] = layers[d] || []).push([r, c]);
      events.push({
        type: 'visit', r, c, depth: d,
        queue: queue.slice(head).map((q) => q.slice()),
      });
      if (goal && r === goal[0] && c === goal[1]) break;
    }
    return { layers, events, parent };
  }

  // 행 우선으로 훑고, 새 땅을 만나면 그 섬 전체를 BFS 로 센다.
  function islandTrace(rows) {
    const counted = new Set();
    const events = [];
    const areas = [];
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        if (rows[r][c] !== '1' || counted.has(key(r, c))) {
          events.push({ type: 'scan', r, c });
          continue;
        }
        const island = areas.length + 1;
        events.push({ type: 'found', r, c, island });
        const t = bfsTrace(rows, [r, c], '1');
        let area = 0;
        for (const ev of t.events) {
          counted.add(key(ev.r, ev.c));
          area++;
          events.push(Object.assign({}, ev, { island }));
        }
        areas.push(area);
      }
    }
    return { count: areas.length, areas, events };
  }

  function pathTrace(rows, start, goal) {
    const t = bfsTrace(rows, start, '.', goal);
    const last = t.events[t.events.length - 1];
    if (!last || last.r !== goal[0] || last.c !== goal[1]) {
      return { moves: -1, path: [], events: t.events };
    }
    const path = [];
    let cur = [goal[0], goal[1]];
    while (cur) {
      path.unshift(cur);
      cur = (cur[0] === start[0] && cur[1] === start[1]) ? null : t.parent[key(cur[0], cur[1])];
    }
    return { moves: last.depth, path, events: t.events };
  }

  // path 모드에서는 (0,0) 이 시작, 맨 아래 오른쪽 칸이 출구다. 둘은 바꾸지 않는다.
  function toggleCell(rows, r, c, mode) {
    const next = rows.slice();
    if (mode === 'path') {
      if ((r === 0 && c === 0) || (r === rows.length - 1 && c === rows[0].length - 1)) return next;
      const ch = rows[r][c] === '#' ? '.' : '#';
      next[r] = rows[r].slice(0, c) + ch + rows[r].slice(c + 1);
      return next;
    }
    const ch = rows[r][c] === '1' ? '0' : '1';
    next[r] = rows[r].slice(0, c) + ch + rows[r].slice(c + 1);
    return next;
  }

  function describePreset(k) {
    const p = PRESETS[k];
    if (!p) return '';
    if (p.mode === 'islands') {
      const t = islandTrace(p.rows);
      return `이 격자에는 섬이 ${t.count}개 있고 넓이는 차례로 ${t.areas.join(', ')}칸입니다.`;
    }
    if (p.mode === 'layers') {
      const sizes = bfsTrace(p.rows, p.start, '1').layers.map((l) => l.length);
      return `시작 칸에서 한 겹씩 퍼지면 거리 0부터 ${sizes.length - 1}까지 칸 수가 차례로 ${sizes.join(', ')}개입니다.`;
    }
    const t = pathTrace(p.rows, p.start, p.goal);
    return t.moves < 0
      ? '이 미로는 출구까지 갈 수 없습니다.'
      : `이 미로는 출구까지 최소 ${t.moves}번 움직이면 도착합니다.`;
  }

  return { DIRS, PRESETS, bfsTrace, islandTrace, pathTrace, toggleCell, describePreset };
});
