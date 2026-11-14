/**
 * 과외 힙의 내부 데모 — 계산
 *   js/lesson-heap-internals-model.js  (시험: scripts/test-lesson-heap-internals.js)
 *
 * 힙 리스트의 부모와 자식 규칙, heappush 의 자리 이동, heappop 의 두 방식(교과서 방식, CPython 3.9 방식)을 이벤트로 쌓는다.
 * 브라우저에서는 전역 LessonHeapInternals, node 에서는 require 다. DOM 을 모른다.
 *
 *   ruleTrace  i = 1 ... n - 1 마다 부모와 비교한다. 규칙을 모두 지키면 층이 다른 두 칸의 순서와 두 번째 값을 잇는다.
 *   pushTrace  CPython 3.9 heapq.heappush(_siftdown). 값마다 끝에 붙이고 부모와 비교하며 올린다.
 *   bookTrace  교과서 방식 heappop. 마지막 값을 0번 칸에 두고 작은 자식과 바꾸며 내린다(자식이 더 크거나 없으면 멈춘다).
 *   popTrace   CPython 3.9 heapq.heappop(_siftup 이 빈칸을 잎까지 내리고 _siftdown 이 올린다). 빈칸은 null 이다.
 * 두 heappop 방식은 값이 모두 다를 때 같은 리스트를 만든다.
 *
 * 이벤트 (group 은 「다음 값」, 「다음 쌍」, 「다음 층」 버튼이 한 번에 넘기는 번호. heap 은 그 단계 뒤 리스트의 복사본)
 *   ruleTrace  { type: 'pair', child, parent, ok, group: i - 1 }, { type: 'level', a, b, group: 'level' }, { type: 'second', cands, value, group: 'second' }
 *   pushTrace  { type: 'append', value, at, heap, group: k }, { type: 'compare', at, parent, move, heap, group: k }, { type: 'place', at, heap, group: k }
 *   bookTrace  { type: 'take', value, heap, group: 0 }, { type: 'last', value, heap, group: 0 }, { type: 'root', value, heap, group: 0 },
 *              { type: 'swap', at, child, compared, heap, group: 층 }, { type: 'stop', at, compared, heap, group: 층 }
 *   popTrace   { type: 'take' | 'last', ..., group: 0 }, { type: 'lift', from, to, compared, heap, group: 층 }, { type: 'leaf', at, group: 'up' },
 *              { type: 'fill', at, value, heap, group: 'up' }, { type: 'up', at, parent, move, heap, group: 'up' }
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LessonHeapInternals = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const K = typeof module === 'object' && module.exports
    ? require('./lesson-kit.js')
    : (typeof self !== 'undefined' ? self : globalThis).LessonKit;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);

  // 조사만 (text 는 붙이지 않는다)
  const J = (text, withFinal, withoutFinal) => P(text, withFinal, withoutFinal).slice(String(text).length);
  const list = (a) => `[${a.map((v) => (v === null ? '빈칸' : v)).join(', ')}]`;

  // ---- 입력 ----
  const PRESETS = {
    loose: { heap: [10, 50, 20, 60, 70, 25, 30], kind: 'min' },
    'max-90': { heap: [90, 80, 75, 50, 60, 70], kind: 'max' },
    'not-heap': { heap: [50, 90, 10], kind: 'min' },
    four: { push: [40, 10, 30, 5] },
    'turn-64': { push: [50, 10, 90, 30, 70] },
    negated: { push: [-50, -10, -90, -30, -70] },
    six: { heap: [10, 20, 15, 40, 50, 30] },
    hole: { heap: [10, 15, 20, 40, 50, 30] },
    twelve: { heap: [1, 2, 7, 3, 6, 9, 8, 15, 4, 10, 12, 11] },
  };
  const MODES = ['rule', 'push', 'book', 'pop'];
  const MODE_DEFAULT = { rule: 'loose', push: 'four', book: 'six', pop: 'six' };
  const PRESET_MODES = {
    loose: ['rule'], 'max-90': ['rule'], 'not-heap': ['rule'],
    four: ['push'], 'turn-64': ['push'], negated: ['push'],
    six: ['book', 'pop'], hole: ['book', 'pop'], twelve: ['book', 'pop'],
  };

  const layerOf = (i) => Math.floor(Math.log2(i + 1));

  // ---- 부모와 자식 규칙 ----
  function ruleTrace(heap, kind) {
    const n = heap.length;
    const keeps = (p, c) => (kind === 'max' ? heap[p] >= heap[c] : heap[p] <= heap[c]);
    const events = [];
    const bad = [];
    for (let i = 1; i < n; i++) {
      const parent = (i - 1) >> 1;
      const ok = keeps(parent, i);
      if (!ok) bad.push(i);
      events.push({ type: 'pair', child: i, parent, ok, group: i - 1 });
    }
    if (bad.length) return { ok: false, bad, level: null, second: null, events };
    // 층이 한 단계 다르고 부모와 자식이 아닌 두 칸 가운데 순서가 거꾸로인 첫 쌍
    let level = null;
    for (let a = 1; a < n && !level; a++) {
      for (let b = a + 1; b < n; b++) {
        if (layerOf(b) !== layerOf(a) + 1 || ((b - 1) >> 1) === a) continue;
        if (kind === 'max' ? heap[a] < heap[b] : heap[a] > heap[b]) { level = [a, b]; break; }
      }
    }
    if (level) events.push({ type: 'level', a: level[0], b: level[1], group: 'level' });
    const cands = [1, 2].filter((c) => c < n);
    const value = cands.length ? (kind === 'max' ? Math.max(...cands.map((c) => heap[c])) : Math.min(...cands.map((c) => heap[c]))) : null;
    events.push({ type: 'second', cands, value, group: 'second' });
    return { ok: true, bad, level, second: value, events };
  }

  // ---- heappush ----
  function pushTrace(values) {
    const heap = [];
    const events = [];
    const compares = [];
    values.forEach((v, k) => {
      heap.push(v);
      let pos = heap.length - 1;
      events.push({ type: 'append', value: v, at: pos, heap: heap.slice(), group: k });
      let c = 0;
      while (pos > 0) {
        const parent = (pos - 1) >> 1;
        c++;
        if (v < heap[parent]) {
          heap[pos] = heap[parent];
          heap[parent] = v;
          events.push({ type: 'compare', at: pos, parent, move: true, heap: heap.slice(), group: k });
          pos = parent;
        } else {
          events.push({ type: 'compare', at: pos, parent, move: false, heap: heap.slice(), group: k });
          break;
        }
      }
      compares.push(c);
      events.push({ type: 'place', at: pos, heap: heap.slice(), group: k });
    });
    return { heap: heap.slice(), compares, events };
  }

  // ---- heappop, 교과서 방식 ----
  function bookTrace(input) {
    const n = input.length;
    const value = input[0];
    const lastValue = input[n - 1];
    const events = [];
    events.push({ type: 'take', value, heap: [null].concat(input.slice(1)), group: 0 });
    events.push({ type: 'last', value: lastValue, heap: [null].concat(input.slice(1, n - 1)), group: 0 });
    const heap = n > 1 ? [lastValue].concat(input.slice(1, n - 1)) : [];
    events.push({ type: 'root', value: lastValue, heap: heap.slice(), group: 0 });
    let compares = 0;
    const path = [0];
    if (heap.length) {
      let pos = 0, layer = 1;
      for (;;) {
        const left = 2 * pos + 1;
        if (left >= heap.length) { events.push({ type: 'stop', at: pos, compared: 0, heap: heap.slice(), group: layer }); break; }
        const right = left + 1;
        let child = left;
        let compared = 1;
        if (right < heap.length) { compared = 2; if (heap[right] < heap[left]) child = right; }
        compares += compared;
        if (heap[child] < heap[pos]) {
          const t = heap[pos]; heap[pos] = heap[child]; heap[child] = t;
          events.push({ type: 'swap', at: pos, child, compared, heap: heap.slice(), group: layer });
          pos = child;
          path.push(pos);
          layer++;
        } else {
          events.push({ type: 'stop', at: pos, compared, heap: heap.slice(), group: layer });
          break;
        }
      }
    }
    return { value, heap: heap.slice(), compares, path, events };
  }

  // ---- heappop, CPython 3.9 방식 ----
  function popTrace(input) {
    const n = input.length;
    const value = input[0];
    const lastValue = input[n - 1];
    const events = [];
    events.push({ type: 'take', value, heap: [null].concat(input.slice(1)), group: 0 });
    events.push({ type: 'last', value: lastValue, heap: [null].concat(input.slice(1, n - 1)), group: 0 });
    const heap = [null].concat(input.slice(1, n - 1));
    const m = heap.length;
    let compares = 0;
    const lifts = [];
    if (m === 0) return { value, heap: [], compares, lifts, leaf: null, events };
    let pos = 0, layer = 1;
    for (;;) {
      let child = 2 * pos + 1;
      if (child >= m) break;
      const right = child + 1;
      let compared = 0;
      if (right < m) { compared = 1; compares++; if (!(heap[child] < heap[right])) child = right; }
      heap[pos] = heap[child];
      heap[child] = null;
      events.push({ type: 'lift', from: child, to: pos, compared, heap: heap.slice(), group: layer });
      lifts.push(child);
      pos = child;
      layer++;
    }
    const leaf = pos;
    events.push({ type: 'leaf', at: leaf, group: 'up' });
    heap[pos] = lastValue;
    events.push({ type: 'fill', at: pos, value: lastValue, heap: heap.slice(), group: 'up' });
    while (pos > 0) {
      const parent = (pos - 1) >> 1;
      compares++;
      if (lastValue < heap[parent]) {
        heap[pos] = heap[parent];
        heap[parent] = lastValue;
        events.push({ type: 'up', at: pos, parent, move: true, heap: heap.slice(), group: 'up' });
        pos = parent;
      } else {
        events.push({ type: 'up', at: pos, parent, move: false, heap: heap.slice(), group: 'up' });
        break;
      }
    }
    return { value, heap: heap.slice(), compares, lifts, leaf, events };
  }

  // 해설 칸 문장 — 지금 mode 에서 그 입력이 어떻게 끝나나. mode 에서 쓸 수 없는 입력이면 ''
  function describe(mode, key) {
    const p = PRESETS[key];
    if (!p || !(PRESET_MODES[key] || []).includes(mode)) return '';
    if (mode === 'rule') {
      const t = ruleTrace(p.heap, p.kind);
      const kindName = p.kind === 'max' ? '최대 힙' : '최소 힙';
      const sign = p.kind === 'max' ? '≥' : '≤';
      const pairs = p.heap.length - 1;
      if (!t.ok) {
        const c = t.bad[0];
        const par = (c - 1) >> 1;
        return `${list(p.heap)}에서 부모와 자식 ${pairs}쌍 가운데 ${t.bad.length}쌍이 규칙을 어깁니다. ${c}번 칸 ${p.heap[c]}${J(p.heap[c], '이', '가')} 부모 ${par}번 칸 ${p.heap[par]}보다 ${p.kind === 'max' ? '큽니다' : '작습니다'}.`;
      }
      const sec = t.events[t.events.length - 1];
      return `${list(p.heap)}${J(list(p.heap), '은', '는')} 부모와 자식 ${pairs}쌍이 모두 부모 ${sign} 자식이라 ${kindName}입니다. ${p.kind === 'max' ? '두 번째로 큰' : '두 번째로 작은'} 값은 루트의 두 자식 ${sec.cands.map((c) => p.heap[c]).join(', ')} 가운데 ${t.second}입니다.`;
    }
    if (mode === 'push') {
      const t = pushTrace(p.push);
      return `${list(p.push)} 순서로 heappush 한 결과는 ${list(t.heap)}입니다. 값마다 비교는 ${t.compares.join(' + ')} = ${t.compares.reduce((a, b) => a + b, 0)}번입니다.`;
    }
    const t = mode === 'book' ? bookTrace(p.heap) : popTrace(p.heap);
    const head = `${list(p.heap)}에서 heappop 하면 ${p.heap[0]}${J(p.heap[0], '을', '를')} 꺼내고 ${list(t.heap)}${J(list(t.heap), '이', '가')} 남습니다. `;
    if (mode === 'book') return head + `교과서 방식은 비교 ${t.compares}번이고 마지막 값 ${p.heap[p.heap.length - 1]}${J(p.heap[p.heap.length - 1], '이', '가')} 0번 칸에서 ${t.path[t.path.length - 1]}번 칸으로 내려갑니다.`;
    return head + `CPython 방식은 비교 ${t.compares}번이고 빈칸이 ${t.leaf}번 칸 잎까지 내려간 뒤 마지막 값 ${p.heap[p.heap.length - 1]}${J(p.heap[p.heap.length - 1], '으로', '로')} 채웁니다.`;
  }

  return { J, PRESETS, MODES, MODE_DEFAULT, PRESET_MODES, ruleTrace, pushTrace, bookTrace, popTrace, describe, list, P };
});
