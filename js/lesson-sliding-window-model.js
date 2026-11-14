/**
 * 과외 슬라이딩 윈도우 데모 — 계산
 *   js/lesson-sliding-window-model.js  (시험: scripts/test-lesson-sliding-window.js)
 *
 * 크기가 k 로 정해진 창의 합을 구하는 두 방식(빼고 더하기, 매번 다 더하기)과, 크기가 변하는 창으로
 * 중복 없는 가장 긴 부분 문자열을 찾는 방식을 이벤트로 쌓는다. 브라우저에서는 전역 LessonSlidingWindow,
 * node 에서는 require 다. DOM 을 모른다.
 *
 *   slideTrace    첫 창은 값 k 개를 더하고, 그다음 창부터 나간 값 하나를 빼고 들어온 값 하나를 더한다.
 *   resumTrace    창마다 k 개를 처음부터 다시 더한다.
 *   opsCount      n 개 배열, 크기 k 창의 연산 수를 식대로 센다.
 *   distinctTrace 오른쪽 r 을 늘리고, 새 글자가 창에 있으면 왼쪽 l 에서 글자를 빼 중복이 사라질 때까지 줄인다.
 *
 * 이벤트 (ops 는 그 이벤트까지의 누적 연산 수, group 은 「다음 창」 버튼이 한 번에 넘기는 묶음 번호)
 *   slideTrace   { type: 'add',  start: 0, idx, partial, ops, group: 0 }          첫 창의 값 하나를 더함(k 번)
 *                { type: 'move', start, out, in, sum, best, ops, group: start }   창을 옮김. out, in 은 값(인덱스가 아니다)
 *   resumTrace   { type: 'add',  start, idx, partial, ops, group: start }         창 하나를 처음부터 더하는 덧셈(창마다 k 번)
 *   distinctTrace
 *                { type: 'drop', l, ch, set, group: r }   l 은 뺀 글자의 인덱스, ch 는 그 글자, set 은 뺀 뒤 창 안의 글자(왼쪽부터)
 *                { type: 'add',  r, ch, l, set, best, group: r }  새 글자를 넣음. l 은 지금 창의 왼쪽 끝, set 은 넣은 뒤, best 는 그때까지의 최대 길이
 *   best 와 bestRange 는 창이 더 길 때만 바꾼다. 같은 길이는 먼저 나온 창이 남는다.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LessonSlidingWindow = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  // 조사는 공용 틀의 particle 로 고른다 (node 에서는 require, 브라우저에서는 전역 LessonKit)
  const K = typeof module === 'object' && module.exports
    ? require('./lesson-kit.js')
    : (typeof self !== 'undefined' ? self : globalThis).LessonKit;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);

  const PRESETS = {
    'max-sum': { nums: [2, 1, 5, 1, 3, 2], k: 3 },
    'leetcode-643': { nums: [1, 12, -5, -6, 50, 3], k: 4 },
    longer: { nums: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8], k: 6 },
    abcabcbb: { s: 'abcabcbb' },
    pwwkew: { s: 'pwwkew' },
  };
  const MODES = ['slide', 'resum', 'distinct'];
  const MODE_DEFAULT = { slide: 'max-sum', resum: 'max-sum', distinct: 'abcabcbb' };
  const PRESET_MODES = {
    'max-sum': ['slide', 'resum'],
    'leetcode-643': ['slide', 'resum'],
    longer: ['slide', 'resum'],
    abcabcbb: ['distinct'],
    pwwkew: ['distinct'],
  };

  const sum = (a) => a.reduce((x, y) => x + y, 0);

  // 창 합 전부와 첫 최대 창 (같은 합은 먼저 나온 창)
  function windowSums(nums, k) {
    const sums = [];
    for (let s = 0; s + k <= nums.length; s++) sums.push(sum(nums.slice(s, s + k)));
    let best = sums.length ? sums[0] : 0;
    let bestStart = sums.length ? 0 : -1;
    sums.forEach((v, s) => { if (v > best) { best = v; bestStart = s; } });
    return { sums, best, bestStart };
  }

  function slideTrace(nums, k) {
    const { sums, best, bestStart } = windowSums(nums, k);
    const events = [];
    if (!sums.length) return { best, bestStart, sums, ops: 0, events };
    let ops = 0;
    let partial = 0;
    for (let idx = 0; idx < k; idx++) {
      partial += nums[idx];
      ops++;
      events.push({ type: 'add', start: 0, idx, partial, ops, group: 0 });
    }
    let run = sums[0];
    for (let start = 1; start < sums.length; start++) {
      ops += 2;
      run = run - nums[start - 1] + nums[start + k - 1];
      events.push({ type: 'move', start, out: nums[start - 1], in: nums[start + k - 1], sum: run, best: Math.max(...sums.slice(0, start + 1)), ops, group: start });
    }
    return { best, bestStart, sums, ops, events };
  }

  function resumTrace(nums, k) {
    const { sums, best, bestStart } = windowSums(nums, k);
    const events = [];
    let ops = 0;
    sums.forEach((_, start) => {
      let partial = 0;
      for (let idx = start; idx < start + k; idx++) {
        partial += nums[idx];
        ops++;
        events.push({ type: 'add', start, idx, partial, ops, group: start });
      }
    });
    return { best, bestStart, sums, ops, events };
  }

  function opsCount(n, k) {
    return { windows: n - k + 1, resum: (n - k + 1) * k, slide: k + 2 * (n - k) };
  }

  function distinctTrace(s) {
    const events = [];
    let l = 0;
    let best = 0;
    let bestRange = [0, -1];
    for (let r = 0; r < s.length; r++) {
      while (s.slice(l, r).includes(s[r])) {
        const ch = s[l];
        l++;
        events.push({ type: 'drop', l: l - 1, ch, set: s.slice(l, r).split(''), group: r });
      }
      if (r - l + 1 > best) { best = r - l + 1; bestRange = [l, r]; }
      events.push({ type: 'add', r, ch: s[r], l, set: s.slice(l, r + 1).split(''), best, group: r });
    }
    return { best, bestRange, events };
  }

  // ---- 문장 도구 ----
  const list = (a) => `[${a.join(', ')}]`;

  // 해설 칸 문장 — 지금 mode 에서 그 입력이 어떻게 끝나나. mode 에서 쓸 수 없는 입력이면 ''
  function describe(mode, key) {
    const p = PRESETS[key];
    if (!p || !(PRESET_MODES[key] || []).includes(mode)) return '';
    if (mode === 'distinct') {
      const d = distinctTrace(p.s);
      const [l, r] = d.bestRange;
      return `s = "${p.s}" 입니다. 중복 없는 가장 긴 부분 문자열은 인덱스 ${l}부터 ${r}까지의 "${p.s.slice(l, r + 1)}" 이고 길이는 ${d.best}입니다.`;
    }
    const sl = slideTrace(p.nums, p.k);
    const rs = resumTrace(p.nums, p.k);
    const head = `nums = ${list(p.nums)}, k = ${p.k} 입니다. 창은 ${sl.sums.length}개이고 최대 합은 ${sl.best}입니다. `;
    if (mode === 'slide') return head + `빼고 더하기는 연산 ${sl.ops}번이 듭니다. 다 더하기는 ${rs.ops}번입니다.`;
    return head + `다 더하기는 연산 ${rs.ops}번이 듭니다. 빼고 더하기는 ${sl.ops}번입니다.`;
  }

  return { PRESETS, MODES, MODE_DEFAULT, PRESET_MODES, slideTrace, resumTrace, opsCount, distinctTrace, describe, list, P };
});
