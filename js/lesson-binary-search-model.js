/**
 * 과외 이진 탐색 데모 — 계산
 *   js/lesson-binary-search-model.js  (시험: scripts/test-lesson-binary-search.js)
 *
 * 정렬된 배열의 닫힌 구간 탐색, CPython bisect.py 와 같은 반열린 구간의 bisect_left 와 bisect_right,
 * 답의 범위를 좁히는 탐색(속도 1 ~ 가장 큰 더미)을 이벤트로 쌓는다. 브라우저에서는 전역 LessonBinarySearch,
 * node 에서는 require 다. DOM 을 모른다.
 *
 *   searchTrace   닫힌 구간 [left, right], while left <= right, mid = left + (right - left) // 2.
 *   bisectTrace   반열린 구간 [lo, hi), bisect_left 와 bisect_right 를 차례로 돈다. count = right - left.
 *   paramTrace    속도 [1, max(piles)] 의 닫힌 구간. 걸리는 시간이 h 이하면 답 후보를 mid 로 두고 right = mid - 1.
 *
 * 이벤트 (group 은 「다음 반복」 버튼이 한 번에 넘기는 번호)
 *   searchTrace  { type: 'mid', left, right, mid, value, verdict: 'hit' | 'small' | 'big', group: n }
 *                { type: 'move', left, right, dropped: [a, b], group: n }   left, right 는 옮긴 뒤, dropped 는 이번에 버린 인덱스(양 끝 포함).
 *                value 가 target 보다 작으면 small(왼쪽을 버림), 크면 big(오른쪽을 버림), 같으면 hit(move 없음)
 *   bisectTrace  { type: 'probe', side: 'left' | 'right', lo, hi, mid, value, go: 'lo' | 'hi', group: '<side>-<n>' }
 *                go 는 이번에 움직이는 쪽(lo = mid + 1 이면 'lo', hi = mid 이면 'hi')
 *                { type: 'done', side, pos, group: 그 side 의 마지막 probe 와 같은 group }
 *   paramTrace   { type: 'mid', left, right, mid, hours, ok, group: n }
 *                { type: 'move', left, right, ans, dropped: [a, b], group: n }   dropped 는 속도 값(양 끝 포함), ans 는 답 후보(없으면 null)
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LessonBinarySearch = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  // 조사는 공용 틀의 particle 로 고른다 (node 에서는 require, 브라우저에서는 전역 LessonKit)
  const K = typeof module === 'object' && module.exports
    ? require('./lesson-kit.js')
    : (typeof self !== 'undefined' ? self : globalThis).LessonKit;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);

  const PRESETS = {
    'leetcode-704': { nums: [-1, 0, 3, 5, 9, 12], target: 9 },
    'last-one': { nums: [-1, 0, 3, 5, 9, 12], target: 12 },
    missing: { nums: [-1, 0, 3, 5, 9, 12], target: 2 },
    'dup-4': { nums: [1, 2, 4, 4, 4, 5, 8], x: 4 },
    'dup-3': { nums: [1, 2, 4, 4, 4, 5, 8], x: 3 },
    'koko-8': { piles: [3, 6, 7, 11], h: 8 },
    'koko-5': { piles: [3, 6, 7, 11], h: 5 },
    'koko-4': { piles: [3, 6, 7, 11], h: 4 },
  };
  const MODES = ['search', 'bisect', 'param'];
  const MODE_DEFAULT = { search: 'leetcode-704', bisect: 'dup-4', param: 'koko-8' };
  const PRESET_MODES = {
    'leetcode-704': ['search'],
    'last-one': ['search'],
    missing: ['search'],
    'dup-4': ['bisect'],
    'dup-3': ['bisect'],
    'koko-8': ['param'],
    'koko-5': ['param'],
    'koko-4': ['param'],
  };

  function searchTrace(nums, target) {
    const events = [];
    let left = 0;
    let right = nums.length - 1;
    let answer = -1;
    let n = 0;
    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);
      const value = nums[mid];
      const verdict = value === target ? 'hit' : (value < target ? 'small' : 'big');
      events.push({ type: 'mid', left, right, mid, value, verdict, group: n });
      if (verdict === 'hit') { answer = mid; break; }
      let dropped;
      if (verdict === 'small') { dropped = [left, mid]; left = mid + 1; } else { dropped = [mid, right]; right = mid - 1; }
      events.push({ type: 'move', left, right, dropped, group: n });
      n++;
    }
    return { answer, events };
  }

  function bisectSide(nums, x, side, events) {
    let lo = 0;
    let hi = nums.length;
    let n = 0;
    let last = `${side}-0`;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const value = nums[mid];
      // bisect_left: nums[mid] < x 이면 lo 를 올린다. bisect_right: x < nums[mid] 이면 hi 를 내린다.
      const goLo = side === 'left' ? value < x : !(x < value);
      last = `${side}-${n}`;
      events.push({ type: 'probe', side, lo, hi, mid, value, go: goLo ? 'lo' : 'hi', group: last });
      if (goLo) lo = mid + 1; else hi = mid;
      n++;
    }
    events.push({ type: 'done', side, pos: lo, group: last });
    return lo;
  }

  function bisectTrace(nums, x) {
    const events = [];
    const left = bisectSide(nums, x, 'left', events);
    const right = bisectSide(nums, x, 'right', events);
    return { left, right, count: right - left, events };
  }

  const hours = (piles, k) => piles.reduce((s, p) => s + Math.ceil(p / k), 0);

  function paramTrace(piles, h) {
    const events = [];
    let left = 1;
    let right = Math.max(...piles);
    let ans = null;
    let n = 0;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const hr = hours(piles, mid);
      const ok = hr <= h;
      events.push({ type: 'mid', left, right, mid, hours: hr, ok, group: n });
      let dropped;
      if (ok) { ans = mid; dropped = [mid + 1, right]; right = mid - 1; } else { dropped = [left, mid]; left = mid + 1; }
      events.push({ type: 'move', left, right, ans, dropped, group: n });
      n++;
    }
    return { answer: ans, events };
  }

  const linearCount = (nums, target) => {
    const i = nums.indexOf(target);
    return i < 0 ? nums.length : i + 1;
  };
  const worstIterations = (n) => Math.floor(Math.log2(n)) + 1;

  // ---- 문장 도구 ----
  const list = (a) => `[${a.join(', ')}]`;

  // 해설 칸 문장 — 지금 mode 에서 그 입력이 어떻게 끝나나. mode 에서 쓸 수 없는 입력이면 ''
  function describe(mode, key) {
    const p = PRESETS[key];
    if (!p || !(PRESET_MODES[key] || []).includes(mode)) return '';
    if (mode === 'search') {
      const t = searchTrace(p.nums, p.target);
      const rounds = t.events.filter((e) => e.type === 'mid').length;
      const head = `nums = ${list(p.nums)}, target = ${p.target} 입니다. `;
      const lin = `앞에서부터 찾으면 비교 ${linearCount(p.nums, p.target)}번입니다.`;
      if (t.answer < 0) return head + `반복 ${rounds}번 만에 남은 범위가 비어 ${P(-1, '을', '를')} 돌려줍니다. ` + lin;
      return head + `반복 ${rounds}번에 인덱스 ${t.answer}에서 찾습니다. ` + lin;
    }
    if (mode === 'bisect') {
      const t = bisectTrace(p.nums, p.x);
      const head = `nums = ${list(p.nums)}, x = ${p.x} 입니다. 넣을 자리는 bisect_left ${t.left}, bisect_right ${t.right}`;
      return head + (t.count ? `이고 ${p.x}의 개수는 ${t.right} - ${t.left} = ${t.count}입니다.` : `이고 ${P(p.x, '은', '는')} 없어 개수 0입니다.`);
    }
    const t = paramTrace(p.piles, p.h);
    const rounds = t.events.filter((e) => e.type === 'mid').length;
    return `piles = ${list(p.piles)}, h = ${p.h} 입니다. 가장 느린 속도는 ${t.answer}이고 반복은 ${rounds}번입니다. 속도 ${t.answer}에서 걸리는 시간은 ${hours(p.piles, t.answer)}시간입니다.`;
  }

  return { PRESETS, MODES, MODE_DEFAULT, PRESET_MODES, searchTrace, bisectTrace, paramTrace, hours, linearCount, worstIterations, describe, list, P };
});
