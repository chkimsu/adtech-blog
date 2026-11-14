/**
 * 과외 트리와 BST 데모 — 계산
 *   js/lesson-tree-bst-model.js  (시험: scripts/test-lesson-tree-bst.js)
 *
 * 브라우저에서는 전역 LessonTreeBst, node 에서는 require 다. DOM 을 모른다.
 *
 *   buildTrace   LeetCode 배열(층별 순서, null 은 자식 없음)을 큐로 트리로 만들고 root.right.left.val 같은 경로를 따라간다.
 *   depthTrace   높이를 구하는 재귀(maxDepth)의 호출과 반환을 왼쪽 먼저 순서로 쌓는다.
 *   bstTrace     값을 차례로 BST 에 넣고(루트에서 비교하며 내려감) 중위 순회로 펼친다. k 가 있으면 k 번째 방문에서 멈춘다.
 *
 * 노드 id: 배열 입력의 노드는 배열 인덱스('0', '1', ...), None 자식은 '<부모 id>:L' 또는 '<부모 id>:R', BST 노드는 값('50').
 * 모든 trace 는 { root, nodes } 를 같이 돌려준다. nodes[id] = { val, left, right, none? }. 화면은 이것을 treeLayout 과 tree 에 넘긴다.
 *
 * 이벤트 (group 은 「다음 값」 버튼이 한 번에 넘기는 번호)
 *   build  { type: 'root', i: 0, id: '0', value, group: 0 }
 *          { type: 'attach', i, parent, side, id, value, group: 자식의 층 }
 *          { type: 'null', i, parent, side, id: '<부모>:L|R', group: 층 }
 *          { type: 'path', expr: 'root' | 'root.right' | ..., id, group: 'path' }  그리고 { type: 'val', expr: '....val', id, group: 'path' }
 *   depth  { type: 'call', id, group } / { type: 'none', id: '<부모>:L|R', group } / { type: 'return', id, value, group }
 *   bst    { type: 'compare', value, at, dir, group: i } / { type: 'place', value, id, parent, side, group: i } / { type: 'visit', id, value, rank, group: 'in-<rank>' }
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LessonTreeBst = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const K = typeof module === 'object' && module.exports
    ? require('./lesson-kit.js')
    : (typeof self !== 'undefined' ? self : globalThis).LessonKit;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);

  const NONE_ERROR = "AttributeError: 'NoneType' object has no attribute 'val'";

  const PRESETS = {
    'example-1': { values: [3, 9, 20, null, null, 15, 7], path: ['right', 'left'] },
    'example-2': { values: [1, null, 2], path: ['right', 'left'] },
    balanced: { insert: [50, 30, 70, 20, 40, 60, 80] },
    sorted: { insert: [20, 30, 40, 50, 60, 70, 80] },
    'leetcode-230': { insert: [5, 3, 6, 2, 4, 1], k: 3 },
  };
  const MODES = ['build', 'depth', 'bst'];
  const MODE_DEFAULT = { build: 'example-1', depth: 'example-1', bst: 'balanced' };
  const PRESET_MODES = {
    'example-1': ['build', 'depth'], 'example-2': ['build', 'depth'],
    balanced: ['bst'], sorted: ['bst'], 'leetcode-230': ['bst'],
  };

  const list = (a) => `[${a.map((v) => (v === null ? 'null' : v)).join(', ')}]`;

  // ---- 배열 입력을 트리로 (글의 build_tree 와 같은 큐 순서) ----
  function makeTree(values) {
    const nodes = {};
    const events = [];
    const levels = [];
    const depthOf = {};
    nodes['0'] = { val: values[0], left: null, right: null };
    depthOf['0'] = 0;
    levels.push([values[0]]);
    events.push({ type: 'root', i: 0, id: '0', value: values[0], group: 0 });
    const queue = ['0'];
    let i = 1;
    while (queue.length && i < values.length) {
      const parent = queue.shift();
      ['left', 'right'].forEach((side) => {
        if (i >= values.length) return;
        const layer = depthOf[parent] + 1;
        if (values[i] === null) {
          const id = `${parent}:${side === 'left' ? 'L' : 'R'}`;
          nodes[id] = { val: null, left: null, right: null, none: true };
          nodes[parent][side] = id;
          events.push({ type: 'null', i, parent, side, id, group: layer });
        } else {
          const id = String(i);
          nodes[id] = { val: values[i], left: null, right: null };
          nodes[parent][side] = id;
          depthOf[id] = layer;
          (levels[layer] = levels[layer] || []).push(values[i]);
          events.push({ type: 'attach', i, parent, side, id, value: values[i], group: layer });
          queue.push(id);
        }
        i++;
      });
    }
    return { nodes, events, levels };
  }

  function buildTrace(values, path) {
    const t = makeTree(values);
    const nodes = t.nodes;
    const events = t.events.slice();
    let cur = '0';
    let expr = 'root';
    events.push({ type: 'path', expr, id: cur, group: 'path' });
    path.forEach((side) => {
      const n = nodes[cur];
      let next = n && !n.none ? n[side] : null;
      if (next === null || next === undefined) {
        next = `${cur}:${side === 'left' ? 'L' : 'R'}`;
        if (!nodes[next]) nodes[next] = { val: null, left: null, right: null, none: true };
        if (n && !n.none) n[side] = next;
      }
      cur = next;
      expr += `.${side}`;
      events.push({ type: 'path', expr, id: cur, group: 'path' });
    });
    events.push({ type: 'val', expr: `${expr}.val`, id: cur, group: 'path' });
    const result = nodes[cur].none ? { ok: false, error: NONE_ERROR } : { ok: true, value: nodes[cur].val };
    return { root: '0', nodes, levels: t.levels, result, events };
  }

  // ---- 높이를 구하는 재귀 ----
  function depthTrace(values) {
    const t = makeTree(values);
    const nodes = t.nodes;
    // 자식 자리가 비어 있는 노드에는 None 자식을 채운다(재귀가 마지막에 부르는 곳)
    Object.keys(nodes).forEach((id) => {
      if (nodes[id].none) return;
      [['left', 'L'], ['right', 'R']].forEach(([side, ch]) => {
        if (nodes[id][side] === null) {
          const nid = `${id}:${ch}`;
          nodes[nid] = { val: null, left: null, right: null, none: true };
          nodes[id][side] = nid;
        }
      });
    });
    const events = [];
    let group = 0;
    function walk(id) {
      if (nodes[id].none) {
        events.push({ type: 'none', id, group });
        return 0;
      }
      events.push({ type: 'call', id, group });
      const l = walk(nodes[id].left);
      const r = walk(nodes[id].right);
      const v = 1 + Math.max(l, r);
      events.push({ type: 'return', id, value: v, group });
      group++;
      return v;
    }
    const answer = walk('0');
    return { root: '0', nodes, answer, events };
  }

  // ---- BST 와 중위 순회 ----
  function bstTrace(insert, k) {
    const nodes = {};
    const events = [];
    let root = null;
    let compares = 0;
    insert.forEach((v, i) => {
      const id = String(v);
      nodes[id] = { val: v, left: null, right: null };
      if (root === null) {
        root = id;
        events.push({ type: 'place', value: v, id, parent: null, side: null, group: i });
        return;
      }
      let at = root;
      for (;;) {
        const dir = v < nodes[at].val ? 'left' : 'right';
        compares++;
        events.push({ type: 'compare', value: v, at, dir, group: i });
        if (nodes[at][dir] === null) {
          nodes[at][dir] = id;
          events.push({ type: 'place', value: v, id, parent: at, side: dir, group: i });
          return;
        }
        at = nodes[at][dir];
      }
    });
    const inorder = [];
    let answer = null;
    let rank = 0;
    let stop = false;
    (function walk(id) {
      if (id === null || stop) return;
      walk(nodes[id].left);
      if (stop) return;
      rank++;
      inorder.push(nodes[id].val);
      events.push({ type: 'visit', id, value: nodes[id].val, rank, group: `in-${rank}` });
      if (k !== undefined && k !== null && rank === k) {
        answer = nodes[id].val;
        stop = true;
        return;
      }
      walk(nodes[id].right);
    })(root);
    let height = 0;
    (function h(id, d) {
      if (id === null) return;
      if (d > height) height = d;
      h(nodes[id].left, d + 1);
      h(nodes[id].right, d + 1);
    })(root, 1);
    const finalInorder = [];
    (function all(id) {
      if (id === null) return;
      all(nodes[id].left);
      finalInorder.push(nodes[id].val);
      all(nodes[id].right);
    })(root);
    return { root, nodes, height, compares, inorder: k === undefined || k === null ? finalInorder : inorder, answer, events };
  }

  // 다 넣은 BST 에서 target 을 찾을 때 거치는 노드 수(비교 수)
  function searchCompares(insert, target) {
    const t = bstTrace(insert);
    let at = t.root;
    let n = 0;
    while (at !== null) {
      n++;
      const v = t.nodes[at].val;
      if (v === target) return n;
      at = target < v ? t.nodes[at].left : t.nodes[at].right;
    }
    return n;
  }

  const count = (t, type) => t.events.filter((e) => e.type === type).length;

  // 해설 칸 문장 — 지금 mode 에서 그 입력이 어떻게 끝나나. mode 에서 쓸 수 없는 입력이면 ''
  function describe(mode, key) {
    const p = PRESETS[key];
    if (!p || !(PRESET_MODES[key] || []).includes(mode)) return '';
    if (mode === 'build') {
      const t = buildTrace(p.values, p.path);
      const head = `배열 ${list(p.values)} 입니다. 층별로 읽으며 트리를 만들고 null 은 자식이 없는 자리로 둡니다. 층은 ${t.levels.length}개이고 ${list(t.levels.map(list))} 입니다. `;
      // 마지막 이벤트의 expr 은 'root.right.left.val' 이다. 경로와 .val 을 나눠 None 을 만나는 곳을 경로 끝으로 적는다
      const path = t.events[t.events.length - 1].expr.replace(/\.val$/, '');
      return head + (t.result.ok
        ? `${path} 까지 따라가 .val 을 읽으면 ${t.result.value} 입니다.`
        : `${path} 의 값이 None 이라 .val 을 읽을 때 ${t.result.error} 오류가 납니다.`);
    }
    if (mode === 'depth') {
      const t = depthTrace(p.values);
      const nones = count(t, 'none');
      return `배열 ${list(p.values)} 입니다. 왼쪽 먼저 maxDepth 를 부르면 높이 ${P(t.answer, '이', '가')} 나오고, 호출은 ${count(t, 'call') + nones}번(노드 ${count(t, 'call')}개, None 자식 ${nones}개)입니다.`;
    }
    const t = bstTrace(p.insert, p.k);
    const head = `${P(list(p.insert), '을', '를')} 차례로 넣습니다. 높이 ${t.height}, 넣을 때 비교 ${t.compares}번입니다. `;
    if (p.k) return head + `중위 순회가 ${p.k}번째에서 멈추고 ${p.k}번째로 작은 값 ${P(t.answer, '이', '가')} 나옵니다.`;
    const last = p.insert[p.insert.length - 1];
    return head + `중위 순회로 펼치면 ${list(t.inorder)} 입니다. ${P(last, '을', '를')} 찾으면 비교 ${searchCompares(p.insert, last)}번입니다.`;
  }

  return { PRESETS, MODES, MODE_DEFAULT, PRESET_MODES, buildTrace, depthTrace, bstTrace, searchCompares, describe, list, count, P, NONE_ERROR };
});
