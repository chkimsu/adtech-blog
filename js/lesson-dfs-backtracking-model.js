/**
 * 과외 DFS와 백트래킹 데모 — 계산
 *   js/lesson-dfs-backtracking-model.js  (시험: scripts/test-lesson-dfs-backtracking.js)
 *
 * LeetCode 79(단어 찾기)와 494(목표 합)의 재귀 호출을 이벤트로 쌓는다. 브라우저에서는 전역 LessonDfsBacktracking, node 에서는 require 다. DOM 을 모른다.
 *
 *   wordTrace    글의 79 코드와 같은 순서. 판을 왼쪽 위부터 돌며 첫 글자와 같은 칸에서 dfs(r, c, 0). dfs 는 k == len(word) 를 먼저,
 *                판 밖과 다른 글자를 다음에 본다. 방향은 위, 아래, 왼쪽, 오른쪽이고 or 라 찾으면 멈춘다.
 *   targetTrace  글의 494 코드와 같다. 호출마다 + 와 - 를 고르고, prune 이면 |target - sum| > rest[i] 인 노드에서 더 들어가지 않는다.
 *
 * 이벤트 (group 은 「다음 칸」, 「다음 반환」 버튼이 한 번에 넘기는 번호)
 *   wordTrace    { type: 'probe', r, c, k, depth, result: 'out' | 'miss', letter: 그 칸의 지금 글자(# 일 수 있다) | null, group },
 *                { type: 'mark', r, c, k, depth, letter, group }, { type: 'done', r, c, k, depth, group }, { type: 'restore', r, c, k, depth, letter, found, group }
 *                depth 는 그 이벤트를 낸 호출까지 한 번에 쌓인 dfs 호출 수(재귀 깊이)다. 시작 칸의 호출이 1 이다.
 *                group 은 mark, done, restore 마다 1 씩 오른다. probe 는 다음 mark 나 restore 와 한 그룹이다.
 *   targetTrace  { type: 'call', id, i, sum, group }, { type: 'leaf', id, sum, hit, count, group },
 *                { type: 'prune', id, i, sum, rest, count: 0, group }, { type: 'return', id, count, group }
 *                노드 id 는 루트 'r', + 를 고르면 id 뒤에 '+', - 면 '-'. group 은 leaf, prune, return 마다 1 씩 오른다.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LessonDfsBacktracking = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const K = typeof module === 'object' && module.exports
    ? require('./lesson-kit.js')
    : (typeof self !== 'undefined' ? self : globalThis).LessonKit;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);
  const J = (text, withFinal, withoutFinal) => P(text, withFinal, withoutFinal).slice(String(text).length);
  const list = (a) => `[${a.join(', ')}]`;

  // ---- 입력 ----
  const BOARD = [['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']];
  const PRESETS = {
    abcced: { board: BOARD, word: 'ABCCED' },
    see: { board: BOARD, word: 'SEE' },
    abcb: { board: BOARD, word: 'ABCB' },
    t1: { nums: [1, 1, 1], target: 1 },
    t3: { nums: [1, 1, 1], target: 3 },
  };
  const MODES = ['word', 'target', 'prune'];
  const MODE_DEFAULT = { word: 'see', target: 't1', prune: 't3' };
  const PRESET_MODES = {
    abcced: ['word'], see: ['word'], abcb: ['word'],
    t1: ['target', 'prune'], t3: ['target', 'prune'],
  };

  // ---- 79 ----
  function wordTrace(boardIn, word) {
    const board = boardIn.map((r) => r.slice());
    const rows = board.length, cols = board[0].length;
    const events = [];
    const starts = [];
    let g = 0, calls = 0;
    const sig = (e) => { events.push(Object.assign(e, { group: g })); g++; };
    function dfs(r, c, k, depth) {
      calls++;
      if (k === word.length) { sig({ type: 'done', r, c, k, depth }); return true; }
      if (r < 0 || r >= rows || c < 0 || c >= cols) { events.push({ type: 'probe', r, c, k, depth, result: 'out', letter: null, group: g }); return false; }
      if (board[r][c] !== word[k]) { events.push({ type: 'probe', r, c, k, depth, result: 'miss', letter: board[r][c], group: g }); return false; }
      const letter = board[r][c];
      board[r][c] = '#';
      sig({ type: 'mark', r, c, k, depth, letter });
      const d = depth + 1;
      const found = dfs(r - 1, c, k + 1, d) || dfs(r + 1, c, k + 1, d) || dfs(r, c - 1, k + 1, d) || dfs(r, c + 1, k + 1, d);
      board[r][c] = letter;
      sig({ type: 'restore', r, c, k, depth, letter, found });
      return found;
    }
    let found = false;
    outer: for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c] === word[0]) {
          starts.push([r, c]);
          if (dfs(r, c, 0, 1)) { found = true; break outer; }
        }
      }
    }
    return { found, calls, starts, events };
  }

  // ---- 494 ----
  function targetTrace(nums, target, prune) {
    const n = nums.length;
    const rest = new Array(n + 1).fill(0);
    for (let i = n - 1; i >= 0; i--) rest[i] = rest[i + 1] + nums[i];
    const nodes = {};
    const events = [];
    let g = 0, calls = 0, leaves = 0, pruned = 0;
    function dfs(id, i, s) {
      calls++;
      nodes[id] = { i, sum: s, left: null, right: null };
      events.push({ type: 'call', id, i, sum: s, group: g });
      if (i === n) {
        leaves++;
        const hit = s === target;
        events.push({ type: 'leaf', id, sum: s, hit, count: hit ? 1 : 0, group: g });
        g++;
        return hit ? 1 : 0;
      }
      if (prune && Math.abs(target - s) > rest[i]) {
        pruned++;
        nodes[id].pruned = true;
        events.push({ type: 'prune', id, i, sum: s, rest: rest[i], count: 0, group: g });
        g++;
        return 0;
      }
      nodes[id].left = id + '+';
      const a = dfs(id + '+', i + 1, s + nums[i]);
      nodes[id].right = id + '-';
      const b = dfs(id + '-', i + 1, s - nums[i]);
      events.push({ type: 'return', id, count: a + b, group: g });
      g++;
      return a + b;
    }
    const ways = dfs('r', 0, 0);
    return { ways, calls, leaves, pruned, rest, root: 'r', nodes, events };
  }

  // ---- 해설 칸 문장 ----
  function describe(mode, key) {
    const p = PRESETS[key];
    if (!p) return '';
    if (mode === 'word') {
      const t = wordTrace(p.board, p.word);
      const marks = t.events.filter((e) => e.type === 'mark').length;
      const blocked = t.events.filter((e) => e.type === 'probe').length;
      return `판에서 ${p.word}${J(p.word, '을', '를')} 찾으면 ${t.found ? '있음(True)' : '없음(False)'}입니다. dfs 호출은 ${t.calls}번이고 막힌 시도 ${blocked}번, 표시 ${marks}번, 되돌리기 ${marks}번입니다.`;
    }
    const plain = targetTrace(p.nums, p.target, false);
    const t = targetTrace(p.nums, p.target, mode === 'prune');
    if (mode === 'target') return `${list(p.nums)}에서 합이 ${p.target}${J(p.target, '이', '가')} 되는 방법은 ${t.ways}가지입니다. 호출은 ${t.calls}번이고 끝까지 간 잎은 ${t.leaves}개입니다.`;
    return `${list(p.nums)}에서 합이 ${p.target}${J(p.target, '이', '가')} 되는 방법은 ${t.ways}가지입니다. 가지치기로 호출은 ${t.calls}번이고(가지치기 없이 ${plain.calls}번) 잘린 노드는 ${t.pruned}개입니다.`;
  }

  return { J, list, BOARD, PRESETS, MODES, MODE_DEFAULT, PRESET_MODES, wordTrace, targetTrace, describe };
});
