/**
 * 과외 해시 맵 데모 — 계산
 *   js/lesson-hash-map-model.js  (시험: scripts/test-lesson-hash-map.js)
 *
 * Two Sum(합이 target 인 두 값의 인덱스)을 세 가지 방식으로 풀며 단계마다 이벤트를 만든다.
 * 브라우저에서는 전역 LessonHashMap, node 에서는 require 다. DOM 을 모른다.
 *
 *   seenTrace    값마다 짝(target - num)이 seen 에 있나 확인하고, 없으면 그 값을 적는다.
 *   bruteTrace   모든 짝(i < j)을 차례로 더해 본다.
 *   prefillTrace 먼저 모든 값을 seen 에 적고 나서 값마다 짝을 확인한다. 자기 자신과 짝이 되는 틀린 답이 나올 수 있다.
 *
 * 이벤트의 seen 은 [[숫자, 인덱스], ...] 이고 파이썬 dict 처럼 같은 숫자를 다시 적으면 인덱스만 바뀐다.
 * look 이벤트의 seen 은 적기 전 상태, store 와 fill 이벤트의 seen 은 적은 뒤 상태다.
 * 한 값을 처리하는 이벤트들은 같은 group(= i) 이고 prefill 의 적기 단계는 group 'fill' 하나다.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LessonHashMap = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  // 조사는 공용 틀의 particle 로 고른다 (node 에서는 require, 브라우저에서는 전역 LessonKit)
  const K = typeof module === 'object' && module.exports
    ? require('./lesson-kit.js')
    : (typeof self !== 'undefined' ? self : globalThis).LessonKit;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);

  const PRESETS = {
    'two-sum': { nums: [2, 11, 7, 15], target: 9 },
    'late-pair': { nums: [4, 9, 1, 7, 12, 3, 10, 8], target: 18 },
    'self-pair': { nums: [3, 2, 4], target: 6 },
  };
  const MODES = ['seen', 'brute', 'prefill'];
  const MODE_DEFAULT = { seen: 'two-sum', brute: 'late-pair', prefill: 'self-pair' };

  const snap = (m) => Array.from(m.entries());

  function seenTrace(nums, target) {
    const seen = new Map();
    const events = [];
    let answer = [];
    let checks = 0;
    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];
      const need = target - num;
      const hit = seen.has(need);
      checks++;
      events.push({ type: 'look', i, num, need, hit, seen: snap(seen), group: i });
      if (hit) { answer = [seen.get(need), i]; break; }
      seen.set(num, i);
      events.push({ type: 'store', i, num, seen: snap(seen), group: i });
    }
    return { answer, checks, events };
  }

  function bruteTrace(nums, target) {
    const events = [];
    let answer = [];
    let comparisons = 0;
    for (let i = 0; i < nums.length && !answer.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const sum = nums[i] + nums[j];
        const hit = sum === target;
        comparisons++;
        events.push({ type: 'pair', i, j, sum, hit, group: i });
        if (hit) { answer = [i, j]; break; }
      }
    }
    return { answer, comparisons, events };
  }

  // 먼저 모두 적고 나서 확인한다. 짝이 seen 에 있으면(자기 자신 포함) 그 look 에서 끝난다.
  function prefillTrace(nums, target) {
    const seen = new Map();
    const events = [];
    nums.forEach((num, i) => {
      seen.set(num, i);
      events.push({ type: 'fill', i, num, seen: snap(seen), group: 'fill' });
    });
    let answer = [];
    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];
      const need = target - num;
      const hit = seen.has(need);
      events.push({ type: 'look', i, num, need, hit, seen: snap(seen), group: i });
      if (hit) { answer = [seen.get(need), i]; break; }
    }
    return { answer, events };
  }

  // ---- 문장 도구 ----
  const list = (a) => `[${a.join(', ')}]`;
  const pairText = (a) => (a.length ? list(a) : '[]');

  // 해설 칸 문장 — 그 입력을 그 방식으로 풀면 어떻게 끝나나
  function describe(mode, key) {
    const p = PRESETS[key];
    if (!p) return '';
    const head = `nums = ${list(p.nums)}, target = ${p.target} 입니다. `;
    const s = seenTrace(p.nums, p.target);
    const b = bruteTrace(p.nums, p.target);
    if (mode === 'brute') {
      return head + `이중 for 문은 ${b.comparisons}번 더해 본 뒤 답은 ${pairText(b.answer)} 입니다. seen 은 값을 ${s.checks}번 확인하고 답은 ${pairText(s.answer)} 입니다.`;
    }
    if (mode === 'prefill') {
      const f = prefillTrace(p.nums, p.target);
      const self = f.answer.length === 2 && f.answer[0] === f.answer[1];
      return head + (self
        ? `먼저 모두 적고 확인하면 답은 ${pairText(f.answer)} 입니다. ${f.answer[0]}번 칸의 ${P(p.nums[f.answer[0]], '을', '를')} 두 번 쓴 틀린 답입니다. 순서대로 확인한 뒤 적으면 ${pairText(s.answer)} 입니다.`
        : `먼저 모두 적고 확인하면 답은 ${pairText(f.answer)} 입니다. 서로 다른 두 칸이라 맞는 답이고, 순서대로 확인한 뒤 적으면 ${pairText(s.answer)} 입니다.`);
    }
    return head + `seen 은 값을 ${s.checks}번 확인하고 답은 ${pairText(s.answer)} 입니다. 이중 for 문은 ${b.comparisons}번 더해 봅니다.`;
  }

  return { PRESETS, MODES, MODE_DEFAULT, seenTrace, bruteTrace, prefillTrace, describe, list };
});
