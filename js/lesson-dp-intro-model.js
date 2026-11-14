/**
 * 과외 DP 입문 데모 — 계산
 *   js/lesson-dp-intro-model.js  (시험: scripts/test-lesson-dp-intro.js)
 *
 * LeetCode 70(계단 오르기)과 198(집 털기)의 풀이를 이벤트로 쌓는다. 브라우저에서는 전역 LessonDpIntro, node 에서는 require 다. DOM 을 모른다.
 *
 *   callTrace   글의 dfs(step) 와 같다. step <= 2 면 step 을 돌려주고(기저 조건), useMemo 면 그다음에 메모를 보고,
 *               아니면 dfs(step - 1) + dfs(step - 2). 호출 id 는 부른 차례로 'c0', 'c1', ... 이고 nodes[id] = { step, left, right }
 *               (left 는 step - 1 호출, right 는 step - 2 호출). 메모에서 꺼낸 호출과 기저 호출은 자식이 없다.
 *   tableClimb  dp[1] = 1, dp[2] = 2 에서 i = 3 부터 dp[i] = dp[i - 1] + dp[i - 2]. dp[0] 은 null.
 *   tableRob    dp[0] = nums[0], dp[1] = max(nums[0], nums[1]), i >= 2 마다 dp[i] = max(nums[i] + dp[i - 2], dp[i - 1]).
 *
 * 이벤트 (group 은 「다음 반환」, 「다음 칸」 버튼이 한 번에 넘기는 번호)
 *   callTrace   { type: 'call', id, step, group } 뒤에 { type: 'base' | 'hit' | 'return', id, step, value, group } 하나.
 *               group 은 base, hit, return 마다 1 씩 오른다.
 *   tableClimb  { type: 'base', i, value, group: 'base' } 둘, 그다음 { type: 'fill', i, value, from: [i - 1, i - 2], prev: [dp[i - 1], dp[i]], group: i }
 *   tableRob    base 둘은 같고, fill 은 { type: 'fill', i, take, skip, value, pick: 'take' | 'skip', prev: [dp[i - 2], dp[i - 1]], group: i }
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LessonDpIntro = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const K = typeof module === 'object' && module.exports
    ? require('./lesson-kit.js')
    : (typeof self !== 'undefined' ? self : globalThis).LessonKit;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);
  const J = (text, withFinal, withoutFinal) => P(text, withFinal, withoutFinal).slice(String(text).length);
  const list = (a) => `[${a.join(', ')}]`;

  // ---- 입력 ----
  const PRESETS = {
    'climb-5': { n: 5 },
    'climb-6': { n: 6 },
    'rob-5': { nums: [2, 7, 9, 3, 1] },
    'rob-4': { nums: [1, 2, 3, 1] },
  };
  const MODES = ['calls', 'memo', 'table'];
  const MODE_DEFAULT = { calls: 'climb-5', memo: 'climb-5', table: 'climb-5' };
  const PRESET_MODES = {
    'climb-5': ['calls', 'memo', 'table'],
    'climb-6': ['calls', 'memo', 'table'],
    'rob-5': ['table'],
    'rob-4': ['table'],
  };

  // ---- 70, 재귀 ----
  function callTrace(n, useMemo) {
    const nodes = {};
    const events = [];
    const memo = {};
    let g = 0, calls = 0;
    function dfs(step) {
      const id = `c${calls}`;
      calls++;
      nodes[id] = { step, left: null, right: null };
      events.push({ type: 'call', id, step, group: g });
      if (step <= 2) {
        events.push({ type: 'base', id, step, value: step, group: g });
        g++;
        return step;
      }
      if (useMemo && Object.prototype.hasOwnProperty.call(memo, step)) {
        events.push({ type: 'hit', id, step, value: memo[step], group: g });
        g++;
        return memo[step];
      }
      nodes[id].left = `c${calls}`;
      const a = dfs(step - 1);
      nodes[id].right = `c${calls}`;
      const b = dfs(step - 2);
      const v = a + b;
      if (useMemo) memo[step] = v;
      events.push({ type: 'return', id, step, value: v, group: g });
      g++;
      return v;
    }
    const answer = dfs(n);
    return { answer, calls, memo, root: 'c0', nodes, events };
  }

  // ---- 70, 표 ----
  function tableClimb(n) {
    const dp = [null, 1, 2];
    const events = [
      { type: 'base', i: 1, value: 1, group: 'base' },
      { type: 'base', i: 2, value: 2, group: 'base' },
    ];
    for (let i = 3; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
      events.push({ type: 'fill', i, value: dp[i], from: [i - 1, i - 2], prev: [dp[i - 1], dp[i]], group: i });
    }
    return { answer: dp[n], dp, events };
  }

  // ---- 198, 표 ----
  function tableRob(nums) {
    const n = nums.length;
    const dp = [nums[0], Math.max(nums[0], nums[1])];
    const events = [
      { type: 'base', i: 0, value: dp[0], group: 'base' },
      { type: 'base', i: 1, value: dp[1], group: 'base' },
    ];
    const picks = [];
    for (let i = 2; i < n; i++) {
      const take = nums[i] + dp[i - 2];
      const skip = dp[i - 1];
      const pick = take > skip ? 'take' : 'skip';
      dp[i] = Math.max(take, skip);
      picks.push(pick);
      events.push({ type: 'fill', i, take, skip, value: dp[i], pick, prev: [dp[i - 2], dp[i - 1]], group: i });
    }
    // 답에서 거꾸로 따라가며 턴 집을 찾는다
    const houses = [];
    let i = n - 1;
    while (i >= 2) {
      if (picks[i - 2] === 'take') { houses.push(i); i -= 2; } else i -= 1;
    }
    houses.push(i === 1 && nums[1] > nums[0] ? 1 : 0);
    houses.sort((x, y) => x - y);
    return { answer: dp[n - 1], dp, picks, houses, events };
  }

  // ---- 해설 칸 문장 ----
  function describe(mode, key) {
    const p = PRESETS[key];
    if (!p) return '';
    if (mode === 'table') {
      if (p.n) {
        const t = tableClimb(p.n);
        return `계단 ${p.n}칸을 오르는 방법은 ${t.answer}가지입니다. dp[1] 과 dp[2] 에서 시작해 칸 ${p.n - 2}개를 한 번씩 채웁니다.`;
      }
      const t = tableRob(p.nums);
      const sum = t.houses.map((h) => p.nums[h]).join(' + ');
      return `nums ${list(p.nums)}에서 훔칠 수 있는 최대 금액은 ${t.answer}입니다. 턴 집은 ${t.houses.join(', ')}번(${sum})입니다.`;
    }
    const plain = callTrace(p.n, false);
    if (mode === 'calls') return `계단 ${p.n}칸을 오르는 방법은 ${plain.answer}가지이고 dfs 호출은 ${plain.calls}번입니다.`;
    const t = callTrace(p.n, true);
    return `계단 ${p.n}칸을 오르는 방법은 ${t.answer}가지이고 메모를 쓰면 dfs 호출은 ${t.calls}번입니다(그냥 재귀는 ${plain.calls}번).`;
  }

  return { J, P, list, PRESETS, MODES, MODE_DEFAULT, PRESET_MODES, callTrace, tableClimb, tableRob, describe };
});
