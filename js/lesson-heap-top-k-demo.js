/**
 * 과외 힙과 Top K 데모 — 화면
 *   js/lesson-heap-top-k-demo.js
 *
 * 계산은 js/lesson-heap-top-k-model.js 의 LessonHeapTopK, 단계 재생과 부품은 js/lesson-kit.js 의 LessonKit 이 한다.
 * 화면 상태는 「이벤트를 몇 개까지 보였나」(at) 하나이고, render(at) 가 그때마다 이벤트를 처음부터 다시 쌓아 그린다.
 * 「다음 값」 버튼(#lk-group)은 이벤트의 group 이 같은 동안을 한 번에 넘긴다.
 * 트리 그림은 리스트의 i 번 칸이 트리의 어디인지만 보인다. 자리바꿈 과정은 그리지 않는다.
 *
 * 주소 약속 — demo-lesson-heap-top-k.html?embed=1&mode=<topk|negate|drop>&preset=<PRESETS 키>
 *   인자가 없으면 topk 모드의 leetcode-215 다.
 *   블로그 글이 이 주소 셋을 iframe 으로 쓴다: topk + leetcode-215, topk + scores, negate + leetcode-215.
 */
(function () {
  'use strict';

  const H = window.LessonHeapTopK;
  const K = window.LessonKit;
  if (!H || !K) return;

  const $ = (id) => document.getElementById(id);
  const { list } = H;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);

  const MODE_LABEL = { topk: '크기 K 최소 힙', negate: '부호를 뒤집는 풀이', drop: 'N - K 개를 버리는 풀이' };

  const LEGEND = {
    topk: [['is-in', '방금 넣은 값'], ['is-now', '맨 앞 값'], ['is-out', '꺼낸 값'], ['is-hit', '답']],
    negate: [['is-now', '맨 앞 값'], ['is-out', '꺼낸 값'], ['is-hit', '답']],
    drop: [['is-now', '맨 앞 값'], ['is-out', '꺼낸 값'], ['is-hit', '답']],
  };

  const SPEC = { modes: H.MODES, modeDefault: H.MODE_DEFAULT, presetModes: H.PRESET_MODES };

  const S = { mode: 'topk', key: 'leetcode-215', p: null, trace: null, events: [], player: null };

  // 해설 칸 문장 (js/demo-edu-content.js 의 lesson-heap-top-k 항목이 부른다). 지금 모드로 그 입력의 결과를 적는다.
  window.lessonHeapTopKDescribe = (key) => H.describe(S.mode, key);

  const presetLabel = (key) => {
    const p = H.PRESETS[key];
    return `nums ${list(p.nums)}, K = ${p.k}`;
  };

  function note() {
    const p = S.p;
    if (S.mode === 'topk') return `heapq 의 힙은 맨 앞 값이 가장 작은 최소 힙입니다. 값을 하나씩 heappush 로 넣고 리스트 길이가 K 를 넘으면 heappop 으로 맨 앞 값을 꺼냅니다. 큰 값 ${p.k}개만 남아서 끝의 맨 앞 값이 ${p.k}번째로 큰 수입니다. 트리는 리스트의 i번 칸이 트리의 어디인지만 보여 줍니다.`;
    if (S.mode === 'negate') return `heapq 는 최소 힙이라 부호를 뒤집은 값을 heapify 하면 원래 가장 큰 값이 맨 앞에 옵니다. ${p.k}번 꺼낸 마지막 값이 ${p.k}번째로 큰 수입니다. 리스트와 트리에는 부호를 뒤집은 값을 그대로 그립니다.`;
    return `리스트 전체를 heapify 한 뒤 맨 앞 값(가장 작은 값)을 N - K = ${p.nums.length} - ${p.k} = ${p.nums.length - p.k}번 꺼내 버립니다. 남은 ${p.k}개 가운데 맨 앞 값이 ${p.k}번째로 큰 수입니다.`;
  }

  function retrace() {
    const p = H.PRESETS[S.key];
    S.p = p;
    if (S.mode === 'topk') S.trace = H.topkTrace(p.nums, p.k);
    else if (S.mode === 'negate') S.trace = H.negateTrace(p.nums, p.k);
    else S.trace = H.dropTrace(p.nums, p.k);
    S.events = S.trace.events;
  }

  function fillPresets() {
    const sel = $('lk-preset');
    sel.replaceChildren();
    Object.keys(H.PRESETS).filter((k) => H.PRESET_MODES[k].includes(S.mode)).forEach((k) => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = presetLabel(k);
      sel.appendChild(o);
    });
    sel.value = S.key;
  }

  function drawTabs() {
    K.tabs($('lk-tabs'), H.MODES.map((m) => ({ key: m, label: MODE_LABEL[m] })), S.mode, (m) => {
      S.mode = m;
      if (!H.PRESET_MODES[S.key].includes(m)) S.key = H.MODE_DEFAULT[m];
      change();
    });
  }

  // 입력이나 모드가 바뀌면 처음부터 다시 쌓는다
  function change() {
    retrace();
    fillPresets();
    drawTabs();
    $('lk-note').textContent = note();
    K.legend($('lk-legend'), LEGEND[S.mode]);
    $('lk-state-label').textContent = '꺼낸 값';
    S.player.restart();
  }

  function lines(sub, texts) {
    sub.replaceChildren();
    texts.forEach((t) => {
      const d = document.createElement('div');
      d.textContent = t;
      sub.appendChild(d);
    });
  }

  // 지금 리스트 — 이벤트가 없으면 처음 상태(topk 는 빈 리스트, 나머지는 입력 그대로)
  function current(shown) {
    const e = shown[shown.length - 1];
    if (e) return e.heap;
    return S.mode === 'topk' ? [] : S.p.nums;
  }

  // 리스트가 힙인가 — negate 의 부호만 뒤집은 리스트와 처음 입력은 아직 힙이 아니다
  function isHeap(shown) {
    if (S.mode === 'topk') return shown.length > 0;
    return shown.some((e) => e.type === 'heapify');
  }

  const popped = (shown) => shown.filter((e) => e.type === 'pop');

  // ==========================================
  // 보드 — 리스트와 트리
  // ==========================================

  function board(shown, done) {
    const heap = current(shown);
    const e = shown[shown.length - 1];
    const cls = {};
    const treeCls = {};
    const mark = (i, c) => {
      cls[i] = `${cls[i] || ''} ${c}`.trim();
      treeCls[i] = cls[i];
    };
    if (S.mode === 'topk' && e) {
      // 같은 group 에서 방금 넣은 값 (꺼낸 뒤에는 이미 없을 수 있다)
      const pushed = shown.filter((ev) => ev.type === 'push' && ev.group === e.group).pop();
      if (pushed) {
        const idx = heap.indexOf(pushed.value);
        if (idx >= 0) mark(idx, 'is-in');
      }
    }
    if (isHeap(shown) && heap.length) {
      if (done && S.mode !== 'negate') mark(0, 'is-hit');
      else mark(0, 'is-now');
    }
    const arr = $('hp-array');
    if (heap.length) K.array(arr, heap, { cls });
    else {
      const empty = document.createElement('div');
      empty.className = 'lk-chips-empty';
      empty.textContent = '아직 리스트가 비어 있습니다';
      arr.replaceChildren(empty);
    }
    const n = S.trace.maxSize || S.p.nums.length;
    const size = Math.max(n, S.p.nums.length, heap.length);
    const nodes = K.arrayTree(size);
    const hidden = {};
    const sub = {};
    for (let i = 0; i < size; i++) {
      sub[i] = String(i);
      if (i >= heap.length) hidden[i] = true;
    }
    K.tree($('hp-tree'), '0', nodes, { text: (id) => heap[Number(id)], cls: treeCls, sub, hidden });
  }

  // ==========================================
  // 이번 단계 문장
  // ==========================================

  function topkNow(shown) {
    const e = shown[shown.length - 1];
    const k = S.p.k;
    if (!e) return '「한 칸」이나 「다음 값」을 누르면 시작합니다.';
    if (e.type === 'push') {
      const head = `${P(e.value, '을', '를')} 넣어 ${P(list(e.heap), '이', '가')} 됐습니다.`;
      if (e.heap.length > k) return `${head} 길이 ${P(e.heap.length, '이', '가')} K = ${P(k, '을', '를')} 넘어 다음 단계에서 맨 앞 값을 꺼냅니다.`;
      return `${head} 길이 ${P(e.heap.length, "은", "는")} K = ${k} 이하라 그대로 둡니다.`;
    }
    const push = shown.filter((ev) => ev.type === 'push' && ev.group === e.group).pop();
    const before = push.heap;
    const head = `${P(push.value, '을', '를')} 넣어 ${P(list(before), '이', '가')} 됐습니다. 길이 ${P(before.length, '이', '가')} K = ${P(k, '을', '를')} 넘어 맨 앞 값 ${P(e.value, '을', '를')} 꺼내고 ${P(list(e.heap), '이', '가')} 남습니다.`;
    return e.value === push.value ? `${head} 방금 넣은 값이 가장 작아 그대로 나갑니다.` : head;
  }

  function negateNow(shown) {
    const e = shown[shown.length - 1];
    if (!e) return '「한 칸」이나 「다음 값」을 누르면 시작합니다.';
    if (e.type === 'negate') {
      const m = Math.min(...e.heap);
      return `부호를 뒤집어 ${P(list(e.heap), '이', '가')} 됐습니다. 아직 힙이 아니라 입력 순서 그대로입니다. ${P(m, '은', '는')} 원래 ${-m}입니다.`;
    }
    if (e.type === 'heapify') {
      const m = e.heap[0];
      return `heapify 한 번에 ${P(list(e.heap), '이', '가')} 됐습니다. 맨 앞 값 ${P(m, '은', '는')} 가장 작고, 원래 값으로는 가장 큰 ${-m}입니다.`;
    }
    const raw = -e.value;
    return `맨 앞 값 ${P(raw, '을', '를')} 꺼냅니다. 부호를 되돌린 원래 값은 ${e.value}입니다. ${P(list(e.heap), '이', '가')} 남습니다.`;
  }

  function dropNow(shown) {
    const e = shown[shown.length - 1];
    if (!e) return '「한 칸」이나 「다음 값」을 누르면 시작합니다.';
    if (e.type === 'heapify') {
      return `heapify 한 번에 ${P(list(e.heap), '이', '가')} 됐습니다. 맨 앞 값 ${P(e.heap[0], '은', '는')} 가장 작은 값이고, 작은 값 ${S.p.nums.length - S.p.k}개를 차례로 꺼내 버립니다.`;
    }
    return `맨 앞 값 ${P(e.value, '을', '를')} 꺼내 버립니다. ${P(list(e.heap), '이', '가')} 남습니다.`;
  }

  function doneText() {
    const k = S.p.k;
    const t = S.trace;
    if (S.mode === 'negate') return ` ${k}번 꺼냈으므로 마지막으로 꺼낸 ${P(t.answer, '이', '가')} ${k}번째로 큰 수입니다.`;
    if (S.mode === 'topk') return ` 값을 모두 넣었으니 맨 앞 값 ${P(t.answer, '이', '가')} ${k}번째로 큰 수입니다.`;
    return ` 작은 값을 모두 버렸으니 맨 앞 값 ${P(t.answer, '이', '가')} ${k}번째로 큰 수입니다.`;
  }

  // ==========================================
  // 상태 칸과 결과 칸
  // ==========================================

  function state(shown, done) {
    const outs = popped(shown);
    const items = outs.map((e, i) => ({ text: String(e.value), cls: done && S.mode === 'negate' && i === outs.length - 1 ? 'is-hit' : 'is-out' }));
    K.chips($('lk-state'), items, '아직 꺼낸 값이 없습니다');
    const heap = current(shown);
    let text = `지금 리스트 길이 ${heap.length}, K = ${S.p.k}.`;
    if (S.mode === 'negate' && shown.length) {
      const m = Math.min(...heap);
      if (m < 0) text += ` 리스트의 값은 부호를 뒤집은 값이라 ${P(m, '은', '는')} 원래 ${-m}입니다.`;
    }
    $('lk-state-note').textContent = text;
  }

  function result(shown, done) {
    const main = $('lk-result-main');
    const sub = $('lk-result-sub');
    const t = S.trace;
    const k = S.p.k;
    if (!done) {
      main.textContent = '아직 답이 없습니다';
      const pushes = shown.filter((e) => e.type === 'push').length;
      const pops = popped(shown).length;
      if (S.mode === 'topk') lines(sub, [`지금까지 heappush ${pushes}번, heappop ${pops}번`]);
      else lines(sub, [`지금까지 ${shown.some((e) => e.type === 'heapify') ? 'heapify 1번, ' : ''}heappop ${pops}번`]);
      return;
    }
    main.textContent = `${k}번째로 큰 수 ${t.answer}`;
    const pushes = H.count(t, 'push');
    const pops = H.count(t, 'pop');
    if (S.mode === 'topk') lines(sub, [`heappush ${pushes}번, heappop ${pops}번, 리스트는 많아야 ${t.maxSize}칸`]);
    else lines(sub, [`heapify 1번, heappop ${pops}번, 리스트 ${t.maxSize}칸`]);
  }

  // ==========================================
  // 공통
  // ==========================================

  function render(at) {
    const shown = S.events.slice(0, at);
    const done = at >= S.events.length && at > 0;
    board(shown, done);
    state(shown, done);
    result(shown, done);
    const text = S.mode === 'topk' ? topkNow(shown) : S.mode === 'negate' ? negateNow(shown) : dropNow(shown);
    $('lk-now').textContent = text + (done ? doneText() : '');
  }

  // ==========================================
  // 시작
  // ==========================================

  const params = K.parseParams(location.search, SPEC);
  S.mode = params.mode;
  S.key = params.preset;
  S.player = K.player({ total: () => S.events.length, events: () => S.events, render });
  $('lk-preset').addEventListener('change', (ev) => {
    S.key = ev.target.value;
    change();
  });
  change();
})();
