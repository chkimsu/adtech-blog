/**
 * 과외 투 포인터 데모 — 계산
 *   js/lesson-two-pointers-model.js  (시험: scripts/test-lesson-two-pointers.js)
 *
 * 합이 target 인 두 값(인덱스 l < r)을 양 끝에서 좁혀 가며 찾는다. 브라우저에서는 전역 LessonTwoPointers,
 * node 에서는 require 다. DOM 을 모른다.
 *
 *   pointerTrace  L = 0, R = 끝에서 시작해 합이 target 보다 크면 R 을, 작으면 L 을 한 칸 옮긴다. 비교 하나가 이벤트 하나다.
 *   pairsAll      합이 target 인 모든 짝(i < j). 정렬하지 않은 입력에서 투 포인터가 버린 답 짝을 찾는 데 쓴다.
 *
 * 이벤트 { type: 'compare', l, r, sum, verdict, removed, group }
 *   verdict 'big' 이면 R 을 왼쪽으로 옮기며 (i, r)(i = l..r-1) 짝을 버리고,
 *   'small' 이면 L 을 오른쪽으로 옮기며 (l, j)(j = l+1..r) 짝을 버린다. 'hit' 의 removed 는 [] 다.
 *   group 은 이벤트 순서(0부터)다. 비교 하나가 한 단계라 「다음 값」 버튼은 쓰지 않는다.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LessonTwoPointers = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  // 조사는 공용 틀의 particle 로 고른다 (node 에서는 require, 브라우저에서는 전역 LessonKit)
  const K = typeof module === 'object' && module.exports
    ? require('./lesson-kit.js')
    : (typeof self !== 'undefined' ? self : globalThis).LessonKit;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);
  // 조사만 돌려준다. 괄호 풀이가 붙은 낱말은 괄호 앞 낱말로 조사를 고르려고 쓴다(「5(6 + 4)가」)
  const J = (text, withFinal, withoutFinal) => P(text, withFinal, withoutFinal).slice(String(text).length);

  const PRESETS = {
    sorted: { nums: [1, 3, 4, 6, 8, 11], target: 10 },
    unsorted: { nums: [11, 3, 8, 1, 6, 4], target: 10 },
    'leetcode-167': { nums: [2, 7, 11, 15], target: 9 },
  };
  const MODES = ['pointers'];
  const MODE_DEFAULT = { pointers: 'sorted' };

  function pointerTrace(nums, target) {
    const events = [];
    let l = 0;
    let r = nums.length - 1;
    let answer = null;
    while (l < r) {
      const sum = nums[l] + nums[r];
      const removed = [];
      let verdict;
      if (sum === target) verdict = 'hit';
      else if (sum > target) {
        verdict = 'big';
        for (let i = l; i < r; i++) removed.push([i, r]);
      } else {
        verdict = 'small';
        for (let j = l + 1; j <= r; j++) removed.push([l, j]);
      }
      events.push({ type: 'compare', l, r, sum, verdict, removed, group: events.length });
      if (verdict === 'hit') { answer = [l, r]; break; }
      if (verdict === 'big') r--;
      else l++;
    }
    return { answer, events };
  }

  function pairsAll(nums, target) {
    const out = [];
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        if (nums[i] + nums[j] === target) out.push([i, j]);
      }
    }
    return out;
  }

  // ---- 문장 도구 ----
  const list = (a) => `[${a.join(', ')}]`;
  const ordinal = (k) => (k === 0 ? '첫 비교' : `${k + 1}번째 비교`);

  // 짝 (i, j) 를 맨 처음 버린 이벤트 번호. 버리지 않았으면 -1
  function removedAt(events, i, j) {
    return events.findIndex((e) => e.removed.some(([a, b]) => a === i && b === j));
  }

  // 「인덱스 4와 5(6 + 4)」 꼴. 조사 쌍을 주면 괄호 뒤에 붙이되 괄호 앞의 j 로 고른다(「인덱스 4와 5(6 + 4)가」)
  function pairText(nums, [i, j], withFinal, withoutFinal) {
    const tail = withFinal ? J(j, withFinal, withoutFinal) : '';
    return `인덱스 ${P(i, '과', '와')} ${j}(${nums[i]} + ${nums[j]})${tail}`;
  }

  // 투 포인터가 버린 답 짝을 풀이한다. 버린 답 짝이 없으면 ''
  function missText(nums, target, trace) {
    const miss = pairsAll(nums, target).filter(([i, j]) => !trace.answer || trace.answer[0] !== i || trace.answer[1] !== j);
    if (!miss.length || trace.answer) return '';
    const [i, j] = miss[0];
    const k = removedAt(trace.events, i, j);
    const more = miss.length > 1 ? ` 이 밖에 ${miss.length - 1}쌍이 더 있습니다.` : '';
    return `${pairText(nums, [i, j], '이', '가')} 답인데 ${ordinal(k)}에서 버렸습니다.${more}`;
  }

  // 해설 칸 문장 — 그 입력에서 투 포인터가 어떻게 끝나나
  function describe(key) {
    const p = PRESETS[key];
    if (!p) return '';
    const t = pointerTrace(p.nums, p.target);
    const n = t.events.length;
    const total = p.nums.length * (p.nums.length - 1) / 2;
    const head = `nums = ${list(p.nums)}, target = ${p.target} 입니다. `;
    if (t.answer) {
      const [i, j] = t.answer;
      return head + `L 과 R 을 양 끝에서 좁혀 와 ${pairText(p.nums, [i, j], '을', '를')} 답으로 찾습니다. 모든 짝 ${total}개 가운데 비교는 ${n}번입니다.`;
    }
    return head + `L 과 R 이 ${n}번 비교하고도 짝을 찾지 못합니다. ` + (missText(p.nums, p.target, t) || '실제로도 합이 target 인 짝이 없습니다.');
  }

  return { PRESETS, MODES, MODE_DEFAULT, pointerTrace, pairsAll, describe, missText, pairText, list };
});
