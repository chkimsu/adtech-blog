/**
 * 과외 힙과 Top K 데모 — 계산
 *   js/lesson-heap-top-k-model.js  (시험: scripts/test-lesson-heap-top-k.js)
 *
 * CPython 3.9 Lib/heapq.py 의 heappush, heappop, heapify 를 그대로 옮긴 최소 힙과, 그 위의 세 풀이를 이벤트로 쌓는다.
 * 브라우저에서는 전역 LessonHeapTopK, node 에서는 require 다. DOM 을 모른다.
 *
 *   topkTrace    값마다 push 하고 길이가 k 를 넘으면 pop 한다. 끝의 heap[0] 이 k 번째로 큰 수다(크기 K 최소 힙).
 *   negateTrace  부호를 뒤집어 heapify 하고 k 번 pop 한다(최대 힙처럼 쓰는 풀이). 마지막으로 꺼낸 값이 답이다.
 *   dropTrace    리스트 전체를 heapify 하고 N - k 번 pop 해 작은 값을 버린다. 끝의 heap[0] 이 답이다.
 *
 * 이벤트 (group 은 「다음 값」 버튼이 한 번에 넘기는 번호. heap 은 그 단계 뒤 리스트의 복사본)
 *   { type: 'push', value, heap, group: i }            topk. 넣은 뒤의 리스트
 *   { type: 'pop', value, heap, group }                꺼낸 값과 꺼낸 뒤의 리스트. negate 의 value 는 부호를 되돌린 값
 *   { type: 'negate', heap, group: 'build' }           negate. 부호를 뒤집은 리스트(아직 heapify 전)
 *   { type: 'heapify', heap, group: 'build' }          negate, drop. heapify 한 뒤의 리스트
 * 결과는 { answer, heap, maxSize, events }. heap 은 끝의 리스트, maxSize 는 리스트가 가장 길었을 때의 길이.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LessonHeapTopK = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const K = typeof module === 'object' && module.exports
    ? require('./lesson-kit.js')
    : (typeof self !== 'undefined' ? self : globalThis).LessonKit;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);

  // ---- heapq.py (CPython 3.9) ----
  function siftdown(heap, startpos, pos) {
    const newitem = heap[pos];
    while (pos > startpos) {
      const parentpos = (pos - 1) >> 1;
      const parent = heap[parentpos];
      if (newitem < parent) {
        heap[pos] = parent;
        pos = parentpos;
        continue;
      }
      break;
    }
    heap[pos] = newitem;
  }

  function siftup(heap, pos) {
    const endpos = heap.length;
    const startpos = pos;
    const newitem = heap[pos];
    let childpos = 2 * pos + 1;
    while (childpos < endpos) {
      const rightpos = childpos + 1;
      if (rightpos < endpos && !(heap[childpos] < heap[rightpos])) childpos = rightpos;
      heap[pos] = heap[childpos];
      pos = childpos;
      childpos = 2 * pos + 1;
    }
    heap[pos] = newitem;
    siftdown(heap, startpos, pos);
  }

  function heappush(heap, x) {
    heap.push(x);
    siftdown(heap, 0, heap.length - 1);
  }

  function heappop(heap) {
    const lastelt = heap.pop();
    if (heap.length) {
      const returnitem = heap[0];
      heap[0] = lastelt;
      siftup(heap, 0);
      return returnitem;
    }
    return lastelt;
  }

  function heapify(x) {
    for (let i = (x.length >> 1) - 1; i >= 0; i--) siftup(x, i);
  }

  // ---- 입력 ----
  const PRESETS = {
    'leetcode-215': { nums: [3, 2, 1, 5, 6, 4], k: 2 },
    scores: { nums: [10, 5, 20, 1, 15, 30], k: 2 },
    twelve: { nums: [7, 2, 9, 4, 12, 1, 8, 15, 3, 10, 6, 11], k: 3 },
  };
  const MODES = ['topk', 'negate', 'drop'];
  const MODE_DEFAULT = { topk: 'leetcode-215', negate: 'leetcode-215', drop: 'leetcode-215' };
  const PRESET_MODES = {
    'leetcode-215': ['topk', 'negate', 'drop'],
    scores: ['topk', 'negate', 'drop'],
    twelve: ['topk', 'negate', 'drop'],
  };

  const maxLen = (events) => events.reduce((m, e) => Math.max(m, e.heap.length), 0);

  function topkTrace(nums, k) {
    const heap = [];
    const events = [];
    nums.forEach((v, i) => {
      heappush(heap, v);
      events.push({ type: 'push', value: v, heap: heap.slice(), group: i });
      if (heap.length > k) {
        const out = heappop(heap);
        events.push({ type: 'pop', value: out, heap: heap.slice(), group: i });
      }
    });
    return { answer: heap[0], heap: heap.slice(), maxSize: maxLen(events), events };
  }

  function negateTrace(nums, k) {
    const heap = nums.map((v) => -v);
    const events = [{ type: 'negate', heap: heap.slice(), group: 'build' }];
    heapify(heap);
    events.push({ type: 'heapify', heap: heap.slice(), group: 'build' });
    let answer;
    for (let j = 0; j < k; j++) {
      answer = -heappop(heap);
      events.push({ type: 'pop', value: answer, heap: heap.slice(), group: j });
    }
    return { answer, heap: heap.slice(), maxSize: maxLen(events), events };
  }

  function dropTrace(nums, k) {
    const heap = nums.slice();
    heapify(heap);
    const events = [{ type: 'heapify', heap: heap.slice(), group: 'build' }];
    for (let j = 0; j < nums.length - k; j++) {
      const out = heappop(heap);
      events.push({ type: 'pop', value: out, heap: heap.slice(), group: j });
    }
    return { answer: heap[0], heap: heap.slice(), maxSize: maxLen(events), events };
  }

  const list = (a) => `[${a.join(', ')}]`;
  const count = (t, type) => t.events.filter((e) => e.type === type).length;

  // 해설 칸 문장 — 지금 mode 에서 그 입력이 어떻게 끝나나. mode 에서 쓸 수 없는 입력이면 ''
  function describe(mode, key) {
    const p = PRESETS[key];
    if (!p || !(PRESET_MODES[key] || []).includes(mode)) return '';
    const head = `nums = ${list(p.nums)}, K = ${p.k} 입니다. `;
    if (mode === 'topk') {
      const t = topkTrace(p.nums, p.k);
      return head + `값을 하나씩 넣고 길이가 K 를 넘으면 맨 앞 값을 꺼냅니다. 끝에 ${P(list(t.heap), '이', '가')} 남고 맨 앞 값 ${P(t.answer, '이', '가')} ${p.k}번째로 큰 수입니다. heappush ${count(t, 'push')}번, heappop ${count(t, 'pop')}번이고 리스트는 많아야 ${t.maxSize}칸입니다.`;
    }
    if (mode === 'negate') {
      const t = negateTrace(p.nums, p.k);
      return head + `부호를 뒤집어 heapify 한 뒤 ${p.k}번 꺼냅니다. 마지막에 꺼낸 값 ${P(t.answer, '이', '가')} ${p.k}번째로 큰 수입니다. heapify 1번, heappop ${count(t, 'pop')}번이고 리스트는 ${t.maxSize}칸입니다.`;
    }
    const t = dropTrace(p.nums, p.k);
    return head + `리스트 전체를 heapify 한 뒤 작은 값 ${p.nums.length - p.k}개를 꺼내 버립니다. 끝에 ${P(list(t.heap), '이', '가')} 남고 맨 앞 값 ${P(t.answer, '이', '가')} ${p.k}번째로 큰 수입니다. heapify 1번, heappop ${count(t, 'pop')}번이고 리스트는 ${t.maxSize}칸입니다.`;
  }

  return { heappush, heappop, heapify, PRESETS, MODES, MODE_DEFAULT, PRESET_MODES, topkTrace, negateTrace, dropTrace, describe, list, count, P };
});
