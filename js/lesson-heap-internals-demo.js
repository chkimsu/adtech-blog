/**
 * 과외 힙의 내부 데모 — 화면
 *   js/lesson-heap-internals-demo.js
 *
 * 계산은 js/lesson-heap-internals-model.js 의 LessonHeapInternals, 단계 재생과 부품은 js/lesson-kit.js 의 LessonKit 이 한다.
 * 화면 상태는 「이벤트를 몇 개까지 보였나」(at) 하나이고, render(at) 가 그때마다 이벤트를 처음부터 다시 쌓아 그린다.
 * 트리는 처음 길이로 한 번 배치하고 줄어든 칸의 노드는 숨겨서 다른 노드가 움직이지 않는다. 빈칸(null)은 글자 없이 .is-dim 이다.
 * 「다음 쌍」, 「다음 값」, 「다음 층」 버튼(#lk-group)은 이벤트의 group 이 같은 동안을 한 번에 넘긴다(글자는 탭마다 바뀐다).
 *
 * 주소 약속 — demo-lesson-heap-internals.html?embed=1&mode=<rule|push|book|pop>&preset=<PRESETS 키>
 *   인자가 없으면 rule 모드의 loose 다.
 *   블로그 글이 이 주소를 iframe 이나 링크로 쓴다: rule + max-90, rule + loose, push + four, book + six, pop + hole, rule + not-heap, pop + twelve, book + twelve.
 */
(function () {
  'use strict';

  const H = window.LessonHeapInternals;
  const K = window.LessonKit;
  if (!H || !K) return;

  const $ = (id) => document.getElementById(id);
  const { list, J } = H;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);
  const layerOf = (i) => Math.floor(Math.log2(i + 1));

  const MODE_LABEL = { rule: '부모와 자식 규칙', push: 'heappush 의 자리 이동', book: '교과서 방식 heappop', pop: 'CPython 방식 heappop' };
  const GROUP_LABEL = { rule: '다음 쌍', push: '다음 값', book: '다음 층', pop: '다음 층' };
  const STATE_LABEL = { rule: '확인한 쌍', push: '넣은 값과 비교 수', book: '꺼낸 값과 마지막 값', pop: '꺼낸 값과 마지막 값' };
  const START = '「한 칸」이나 「다음 쌍」을 누르면 시작합니다.';

  const LEGEND = {
    rule: [['is-now', '지금 보는 칸'], ['is-bad', '규칙을 어긴 자식'], ['is-hit', '답']],
    push: [['is-in', '넣은 값'], ['is-now', '비교하는 부모']],
    book: [['is-out', '꺼낸 값'], ['is-in', '움직이는 값'], ['is-now', '비교한 자식'], ['is-dim', '빈칸']],
    pop: [['is-out', '꺼낸 값'], ['is-in', '움직이는 값'], ['is-now', '비교한 값'], ['is-dim', '빈칸']],
  };

  const SPEC = { modes: H.MODES, modeDefault: H.MODE_DEFAULT, presetModes: H.PRESET_MODES };

  const S = { mode: 'rule', key: 'loose', p: null, trace: null, events: [], player: null };

  // 해설 칸 문장 (js/demo-edu-content.js 의 lesson-heap-internals 항목이 부른다). 지금 모드로 그 입력의 결과를 적는다.
  window.lessonHeapInternalsDescribe = (key) => H.describe(S.mode, key);

  const kindOf = () => S.p.kind || 'min';
  const sign = () => (kindOf() === 'max' ? '≥' : '≤');
  // 쌍의 실제 크기 관계 — 규칙을 어긴 쌍은 최소 힙이면 부모 > 자식, 최대 힙이면 부모 < 자식이다
  const relation = (ok) => (ok ? sign() : kindOf() === 'max' ? '<' : '>');
  // 같은 부모를 둔 다른 자식 칸
  const sibling = (c) => (c % 2 ? c + 1 : c - 1);

  const presetLabel = (key) => {
    const p = H.PRESETS[key];
    if (S.mode === 'rule') return `${list(p.heap)} ${p.kind === 'max' ? '최대 힙' : '최소 힙'}으로 확인`;
    if (S.mode === 'push') return `넣는 순서 ${list(p.push)}`;
    return `heap ${list(p.heap)}`;
  };

  function note() {
    const p = S.p;
    if (S.mode === 'rule') return `힙은 리스트의 i번 칸을 트리의 한 노드로 보고, 부모 칸 (i - 1) // 2 의 값이 자식 칸 i 의 값보다 ${kindOf() === 'max' ? '작지 않은' : '크지 않은'} 규칙을 지키는 리스트입니다(힙 규칙). 쌍을 하나씩 확인해 규칙을 모두 지키는지 봅니다.`;
    if (S.mode === 'push') return `heappush 는 값을 리스트 끝(트리의 맨 아래 빈자리)에 붙이고, 부모 칸 (i - 1) // 2 의 값과 비교하며 더 작으면 자리를 바꿔 올립니다. 값 ${p.push.length}개를 하나씩 넣습니다.`;
    if (S.mode === 'book') return '교과서 방식은 맨 앞 값을 꺼내고 리스트 끝의 마지막 값을 0번 칸에 둔 뒤, 두 자식 가운데 작은 쪽과 비교해 더 작으면 바꾸며 내립니다. 층마다 자식 둘을 비교합니다.';
    return 'CPython 방식은 맨 앞 값을 꺼내고 생긴 빈칸에 마지막 값을 두지 않고, 빈칸의 작은 자식을 올리며 빈칸을 잎까지 내립니다. 잎에 닿은 빈칸을 마지막 값으로 채운 뒤 부모와 비교하며 올립니다.';
  }

  function retrace() {
    const p = H.PRESETS[S.key];
    S.p = p;
    if (S.mode === 'rule') S.trace = H.ruleTrace(p.heap, p.kind);
    else if (S.mode === 'push') S.trace = H.pushTrace(p.push);
    else if (S.mode === 'book') S.trace = H.bookTrace(p.heap);
    else S.trace = H.popTrace(p.heap);
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
    $('lk-group').textContent = GROUP_LABEL[S.mode];
    K.legend($('lk-legend'), LEGEND[S.mode]);
    $('lk-state-label').textContent = STATE_LABEL[S.mode];
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

  // ==========================================
  // 지금 리스트와 표시
  // ==========================================

  // 처음 길이 — 트리를 이 크기로 한 번 배치한다
  const fullSize = () => (S.mode === 'push' ? S.p.push.length : S.p.heap.length);

  // 지금 리스트 — 이벤트가 없으면 처음 상태(push 는 빈 리스트, 나머지는 입력 그대로)
  function current(shown) {
    for (let i = shown.length - 1; i >= 0; i--) if (shown[i].heap) return shown[i].heap;
    return S.mode === 'push' ? [] : S.p.heap;
  }

  // push 와 pop 의 올림 단계가 같은 표시: 올라가는 값은 is-in, 비교한 부모는 is-now. 표시는 바꾼 뒤 그 값이 있는 칸을 따라간다
  function markUp(e, mark, edge) {
    if (e.move) { mark(e.parent, 'is-in'); mark(e.at, 'is-now'); }
    else { mark(e.at, 'is-in'); mark(e.parent, 'is-now'); }
    edge[e.at] = 'is-now';
  }

  function marks(shown, heap) {
    const cls = {};
    const edge = {};
    const mark = (i, c) => { cls[i] = `${cls[i] || ''} ${c}`.trim(); };
    const e = shown[shown.length - 1];
    if (!e) return { cls, edge };
    if (S.mode === 'rule') {
      shown.filter((x) => x.type === 'pair' && !x.ok).forEach((x) => mark(x.child, 'is-bad'));
      if (e.type === 'pair') {
        mark(e.child, 'is-now');
        mark(e.parent, 'is-now');
        edge[e.child] = 'is-now';
      } else if (e.type === 'level') {
        mark(e.a, 'is-now');
        mark(e.b, 'is-now');
      } else {
        e.cands.forEach((c) => mark(c, 'is-now'));
        e.cands.forEach((c) => { if (S.p.heap[c] === e.value) mark(c, 'is-hit'); });
      }
    } else if (S.mode === 'push') {
      if (e.type === 'append') mark(e.at, 'is-in');
      else if (e.type === 'compare') markUp(e, mark, edge);
      else mark(e.at, 'is-in');
    } else if (S.mode === 'book') {
      if (e.type === 'root') mark(0, 'is-in');
      else if (e.type === 'swap') {
        // 비교한 자식 값이 지금 있는 칸: 올라간 작은 자식은 e.at, 다른 자식은 제자리. 내려간 마지막 값은 e.child
        mark(e.at, 'is-now');
        if (e.compared === 2) mark(sibling(e.child), 'is-now');
        mark(e.child, 'is-in');
        edge[e.child] = 'is-now';
      } else if (e.type === 'stop') {
        [2 * e.at + 1, 2 * e.at + 2].filter((c) => c < heap.length).forEach((c) => mark(c, 'is-now'));
        mark(e.at, 'is-in');
      }
    } else {
      if (e.type === 'lift') {
        // 올린 자식은 e.to 로 올라갔고 빈칸은 e.from 으로 내려갔다. 두 자식을 비교했으면 두 값이 지금 있는 칸에 is-now
        mark(e.to, 'is-in');
        if (e.compared) { mark(e.to, 'is-now'); mark(sibling(e.from), 'is-now'); }
        edge[e.from] = 'is-now';
      } else if (e.type === 'leaf') edge[e.at] = 'is-now';
      else if (e.type === 'fill') mark(e.at, 'is-in');
      else markUp(e, mark, edge);
    }
    // 빈칸(null)은 어느 칸이든 흐리게
    heap.forEach((v, i) => { if (v === null && !(cls[i] || '').includes('is-dim')) mark(i, 'is-dim'); });
    return { cls, edge };
  }

  function board(shown) {
    const heap = current(shown);
    const { cls, edge } = marks(shown, heap);
    const arr = $('hi-array');
    if (heap.length) K.array(arr, heap.map((v) => (v === null ? '' : v)), { cls });
    else {
      const empty = document.createElement('div');
      empty.className = 'lk-chips-empty';
      empty.textContent = '아직 리스트가 비어 있습니다';
      arr.replaceChildren(empty);
    }
    const size = fullSize();
    const nodes = K.arrayTree(size);
    const hidden = {};
    const sub = {};
    for (let i = 0; i < size; i++) {
      sub[i] = String(i);
      if (i >= heap.length) hidden[i] = true;
    }
    K.tree($('hi-tree'), '0', nodes, { text: (id) => (heap[Number(id)] === null ? '' : heap[Number(id)]), cls, sub, hidden, edge });
  }

  // ==========================================
  // 이번 단계 문장
  // ==========================================

  const prevHeap = (shown) => {
    for (let i = shown.length - 2; i >= 0; i--) if (shown[i].heap) return shown[i].heap;
    return S.p.heap || [];
  };

  function ruleNow(shown) {
    const e = shown[shown.length - 1];
    if (!e) return START;
    const h = S.p.heap;
    const max = kindOf() === 'max';
    if (e.type === 'pair') {
      const c = e.child, par = e.parent;
      const head = `${c}번 칸 ${h[c]}의 부모는 (${c} - 1) // 2 = ${par}번 칸 ${h[par]}입니다.`;
      if (e.ok) return `${head} ${h[par]} ${sign()} ${P(h[c], '이라', '라')} 규칙을 지킵니다.`;
      return `${head} 부모 ${h[par]}${J(h[par], '이', '가')} 자식 ${h[c]}보다 ${max ? '작아서' : '커서'} 규칙을 어깁니다.`;
    }
    if (e.type === 'level') {
      return `${layerOf(e.a) + 1}층의 ${h[e.a]}${J(h[e.a], '이', '가')} ${layerOf(e.b) + 1}층의 ${h[e.b]}보다 ${max ? '작지만' : '크지만'} 둘은 부모와 자식이 아닙니다. 규칙은 부모와 자식 사이만 정하므로 이 쌍은 괜찮습니다.`;
    }
    const v = e.cands.map((c) => h[c]);
    const which = max ? '큰' : '작은';
    return `루트의 두 자식 ${v.join(', ')} 가운데 ${which} ${e.value}${J(e.value, '이', '가')} 두 번째로 ${which} 값입니다. 두 번째 값은 루트의 두 자식 칸만 보면 됩니다.`;
  }

  function pushNow(shown) {
    const e = shown[shown.length - 1];
    if (!e) return '「한 칸」이나 「다음 값」을 누르면 시작합니다.';
    const app = shown.filter((x) => x.type === 'append' && x.group === e.group).pop();
    const v = app.value;
    if (e.type === 'append') {
      if (e.at === 0) return `${v}${J(v, '을', '를')} 0번 칸에 붙였습니다. 부모가 없어 비교하지 않습니다.`;
      const par = (e.at - 1) >> 1;
      return `${v}${J(v, '을', '를')} ${e.at}번 칸에 붙였습니다. 부모는 (${e.at} - 1) // 2 = ${par}번 칸 ${e.heap[par]}입니다.`;
    }
    if (e.type === 'compare') {
      const before = prevHeap(shown);
      const pv = before[e.parent];
      if (e.move) return `${v}${J(v, '은', '는')} 부모 ${e.parent}번 칸 ${pv}보다 작아 자리를 바꿉니다. ${list(e.heap)}${J(list(e.heap), '이', '가')} 됩니다.`;
      return `${v}${J(v, '은', '는')} 부모 ${e.parent}번 칸 ${pv}보다 작지 않아 그 자리에 둡니다.`;
    }
    const c = shown.filter((x) => x.type === 'compare' && x.group === e.group).length;
    return `${v}${J(v, '이', '가')} ${e.at}번 칸에 자리 잡았습니다. ${list(e.heap)}${J(list(e.heap), '이', '가')} 됐고 이 값의 비교는 ${c}번입니다.`;
  }

  function bookNow(shown) {
    const e = shown[shown.length - 1];
    if (!e) return '「한 칸」이나 「다음 층」을 누르면 시작합니다.';
    const n = S.p.heap.length;
    const val = shown.filter((x) => x.type === 'last')[0];
    const lv = val ? val.value : S.p.heap[n - 1];
    if (e.type === 'take') return `맨 앞 값 ${e.value}${J(e.value, '을', '를')} 꺼냅니다. 0번 칸이 빈칸이 됩니다.`;
    if (e.type === 'last') return `리스트 끝 ${n - 1}번 칸의 마지막 값 ${e.value}${J(e.value, '을', '를')} 떼어 냅니다. 리스트는 ${n - 1}칸이 됩니다.`;
    if (e.type === 'root') return `마지막 값 ${e.value}${J(e.value, '을', '를')} 0번 칸에 둡니다. ${list(e.heap)}${J(list(e.heap), '이', '가')} 됩니다. 이제 자식과 비교하며 내립니다.`;
    const prev = prevHeap(shown);
    const l = prev[2 * e.at + 1], r = prev[2 * e.at + 2];
    if (e.type === 'swap') {
      const small = e.heap[e.at];
      const pick = e.compared === 2 ? `${e.at}번 칸 ${lv}의 두 자식 ${P(l, '과', '와')} ${r} 가운데 작은 ${small}${J(small, '을', '를')} 고릅니다.` : `${e.at}번 칸 ${lv}의 자식은 ${l} 하나입니다.`;
      return `${pick} ${small}${J(small, '이', '가')} ${lv}보다 작아 두 값을 바꿉니다. ${lv}${J(lv, '은', '는')} ${e.child}번 칸으로 내려갑니다.`;
    }
    if (e.compared === 0) return `${e.at}번 칸 ${lv}에는 자식이 없습니다. 여기서 멈춥니다.`;
    const small = e.compared === 2 ? Math.min(l, r) : l;
    const pick = e.compared === 2 ? `두 자식 ${P(l, '과', '와')} ${r} 가운데 작은 ${small}` : `자식 ${small}`;
    return `${e.at}번 칸 ${lv}의 ${pick}${J(small, '이', '가')} ${lv}보다 작지 않아 여기서 멈춥니다.`;
  }

  function popNow(shown) {
    const e = shown[shown.length - 1];
    if (!e) return '「한 칸」이나 「다음 층」을 누르면 시작합니다.';
    const n = S.p.heap.length;
    const lv = S.p.heap[n - 1];
    if (e.type === 'take') return `맨 앞 값 ${e.value}${J(e.value, '을', '를')} 꺼냅니다. 0번 칸이 빈칸이 됩니다.`;
    if (e.type === 'last') return `리스트 끝 ${n - 1}번 칸의 마지막 값 ${e.value}${J(e.value, '을', '를')} 떼어 둡니다. 리스트는 ${n - 1}칸이 됩니다.`;
    if (e.type === 'lift') {
      const prev = prevHeap(shown);
      const l = prev[2 * e.to + 1], r = prev[2 * e.to + 2];
      const m = e.heap[e.to];
      if (e.compared) return `빈칸의 두 자식 ${P(l, '과', '와')} ${r} 가운데 작은 ${m}${J(m, '을', '를')} ${e.to}번 칸으로 올립니다. 빈칸은 ${e.from}번 칸으로 내려갑니다.`;
      return `빈칸의 자식은 ${m} 하나입니다. ${m}${J(m, '을', '를')} ${e.to}번 칸으로 올리고 빈칸은 ${e.from}번 칸으로 내려갑니다.`;
    }
    if (e.type === 'leaf') {
      const end = n - 2;
      if (e.at === end) return `빈칸이 ${e.at}번 칸에서 잎에 닿았습니다. 여기가 리스트 끝이라 떼어 둔 ${lv}${J(lv, '으로', '로')} 채웁니다.`;
      return `빈칸이 ${e.at}번 칸에서 잎에 닿았습니다. 리스트 끝은 ${end}번 칸이라 여기를 비워 두면 가운데가 빕니다. 떼어 둔 ${lv}${J(lv, '으로', '로')} 채웁니다.`;
    }
    if (e.type === 'fill') return `${e.at}번 칸을 ${e.value}${J(e.value, '으로', '로')} 채웠습니다. ${list(e.heap)}${J(list(e.heap), '이', '가')} 됩니다. 이제 부모와 비교하며 올립니다.`;
    const prev = prevHeap(shown);
    const pv = prev[e.parent];
    if (e.move) return `${lv}${J(lv, '은', '는')} 부모 ${e.parent}번 칸 ${pv}보다 작아 자리를 바꿔 ${e.parent}번 칸으로 올라갑니다. ${list(e.heap)}${J(list(e.heap), '이', '가')} 됩니다.`;
    return `${lv}${J(lv, '은', '는')} 부모 ${e.parent}번 칸 ${pv}보다 작지 않아 ${e.at}번 칸에 둡니다.`;
  }

  // ==========================================
  // 상태 칸과 결과 칸
  // ==========================================

  // 지금까지 센 비교 수 (book 은 층마다 비교한 자식 수, pop 은 올린 자식 쌍 비교와 부모 비교)
  function comparesSoFar(shown) {
    if (S.mode === 'push') return shown.filter((e) => e.type === 'compare').length;
    if (S.mode === 'book') return shown.reduce((a, e) => a + (e.compared || 0), 0);
    return shown.reduce((a, e) => a + (e.type === 'lift' ? e.compared : e.type === 'up' ? 1 : 0), 0);
  }

  function state(shown) {
    const note = $('lk-state-note');
    if (S.mode === 'rule') {
      const h = S.p.heap;
      const pairs = shown.filter((e) => e.type === 'pair');
      K.chips($('lk-state'), pairs.map((e) => ({ text: `${h[e.parent]} ${relation(e.ok)} ${h[e.child]}`, cls: e.ok ? '' : 'is-bad' })), '아직 확인한 쌍이 없습니다');
      note.textContent = `확인한 쌍 ${pairs.length} / ${h.length - 1}. 칩은 부모 값과 자식 값을 실제 크기 관계로 적습니다. 붉은 칩은 규칙을 어긴 쌍입니다.`;
      return;
    }
    if (S.mode === 'push') {
      const apps = shown.filter((e) => e.type === 'append');
      const items = apps.map((a, i) => ({
        text: `${a.value}, 비교 ${shown.filter((e) => e.type === 'compare' && e.group === a.group).length}번`,
        cls: i === apps.length - 1 && shown[shown.length - 1].type !== 'place' ? 'is-in' : '',
      }));
      K.chips($('lk-state'), items, '아직 넣은 값이 없습니다');
      note.textContent = `지금 리스트 길이 ${current(shown).length}, 지금까지 비교 ${comparesSoFar(shown)}번.`;
      return;
    }
    const items = [];
    const take = shown.find((e) => e.type === 'take');
    const last = shown.find((e) => e.type === 'last');
    if (take) items.push({ text: `꺼낸 값 ${take.value}`, cls: 'is-out' });
    if (last) items.push({ text: `마지막 값 ${last.value}`, cls: 'is-in' });
    K.chips($('lk-state'), items, '아직 꺼낸 값이 없습니다');
    note.textContent = shown.length ? `지금까지 비교 ${comparesSoFar(shown)}번.` : '';
  }

  function result(shown, done) {
    const main = $('lk-result-main');
    const sub = $('lk-result-sub');
    const t = S.trace;
    if (!done) {
      main.textContent = '아직 결과가 없습니다';
      if (S.mode === 'rule') lines(sub, [`지금까지 ${shown.filter((e) => e.type === 'pair').length}쌍 확인`]);
      else if (S.mode === 'push') lines(sub, [`지금까지 값 ${shown.filter((e) => e.type === 'place').length}개, 비교 ${comparesSoFar(shown)}번`]);
      else lines(sub, [`지금까지 비교 ${comparesSoFar(shown)}번`]);
      return;
    }
    const h = S.p.heap;
    if (S.mode === 'rule') {
      const pairs = h.length - 1;
      if (!t.ok) {
        const c = t.bad[0], par = (c - 1) >> 1;
        main.textContent = `${pairs}쌍 가운데 ${t.bad.length}쌍이 규칙을 어깁니다`;
        lines(sub, [`${c}번 칸 ${h[c]}${J(h[c], '이', '가')} 부모 ${par}번 칸 ${h[par]}보다 ${kindOf() === 'max' ? '큽니다' : '작습니다'}`]);
        return;
      }
      main.textContent = `부모와 자식 ${pairs}쌍 모두 부모 ${sign()} 자식`;
      const sec = t.events[t.events.length - 1];
      const out = [];
      if (t.level) out.push(`${layerOf(t.level[0]) + 1}층의 ${h[t.level[0]]}${J(h[t.level[0]], '이', '가')} ${layerOf(t.level[1]) + 1}층의 ${h[t.level[1]]}보다 ${kindOf() === 'max' ? '작지만' : '크지만'} 둘은 부모와 자식이 아닙니다`);
      out.push(`두 번째로 ${kindOf() === 'max' ? '큰' : '작은'} 값은 루트의 두 자식 ${sec.cands.map((c) => h[c]).join(', ')} 가운데 ${t.second}`);
      lines(sub, out);
      return;
    }
    if (S.mode === 'push') {
      main.textContent = list(t.heap);
      lines(sub, [`비교 ${t.compares.join(' + ')} = ${t.compares.reduce((a, b) => a + b, 0)}번`]);
      return;
    }
    main.textContent = `꺼낸 값 ${t.value}, 남은 리스트 ${list(t.heap)}`;
    const lv = h[h.length - 1];
    if (S.mode === 'book') {
      const end = t.path[t.path.length - 1];
      lines(sub, [`비교 ${t.compares}번. ` + (end === 0 ? `마지막 값 ${lv}${J(lv, '은', '는')} 0번 칸에 그대로 남았습니다` : `마지막 값 ${lv}${J(lv, '이', '가')} 0번 칸에서 ${end}번 칸으로 내려갔습니다`)]);
      return;
    }
    const fp = t.final;
    lines(sub, [`비교 ${t.compares}번. ` + (fp === t.leaf ? `빈칸이 ${t.leaf}번 칸 잎까지 내려간 뒤 ${lv}${J(lv, '으로', '로')} 채웠습니다` : `빈칸이 ${t.leaf}번 칸 잎에 닿아 ${lv}${J(lv, '으로', '로')} 채우고 ${fp}번 칸으로 올렸습니다`)]);
  }

  // ==========================================
  // 공통
  // ==========================================

  function render(at) {
    const shown = S.events.slice(0, at);
    const done = at >= S.events.length && at > 0;
    board(shown);
    state(shown);
    result(shown, done);
    const text = S.mode === 'rule' ? ruleNow(shown) : S.mode === 'push' ? pushNow(shown) : S.mode === 'book' ? bookNow(shown) : popNow(shown);
    $('lk-now').textContent = text;
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
