/**
 * 과외 트리와 BST 데모 — 화면
 *   js/lesson-tree-bst-demo.js
 *
 * 계산은 js/lesson-tree-bst-model.js 의 LessonTreeBst, 단계 재생과 부품은 js/lesson-kit.js 의 LessonKit 이 한다.
 * 화면 상태는 「이벤트를 몇 개까지 보였나」(at) 하나이고, render(at) 가 그때마다 이벤트를 처음부터 다시 쌓아 그린다.
 * 트리는 마지막 모양으로 한 번 배치하고(treeLayout) 아직 생기지 않은 노드는 hidden 으로 숨긴다. 그래서 노드가 생겨도 다른 노드가 움직이지 않는다.
 * 「다음 값」 버튼(#lk-group)은 모드마다 글자가 바뀐다(build 다음 층, depth 다음 반환, bst 다음 값).
 *
 * 주소 약속 — demo-lesson-tree-bst.html?embed=1&mode=<build|depth|bst>&preset=<PRESETS 키>
 *   인자가 없으면 build 모드의 example-1 이다.
 *   블로그 글이 이 주소를 iframe 으로 쓴다: build + example-1, build + example-2, depth + example-1, bst + balanced, bst + sorted.
 */
(function () {
  'use strict';

  const T = window.LessonTreeBst;
  const K = window.LessonKit;
  if (!T || !K) return;

  const $ = (id) => document.getElementById(id);
  const { list } = T;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);

  const MODE_LABEL = { build: '배열 입력과 None', depth: '높이를 구하는 재귀', bst: 'BST 와 중위 순회' };
  const GROUP_LABEL = { build: '다음 층', depth: '다음 반환', bst: '다음 값' };
  const STATE_LABEL = { build: '층', depth: '호출 중', bst: '넣은 값' };
  const SIDE = { left: '왼쪽', right: '오른쪽', L: '왼쪽', R: '오른쪽' };

  const LEGEND = {
    build: [['is-now', '읽는 칸, 따라가는 노드'], ['is-in', '방금 붙인 노드'], ['is-hit', '찾은 값'], ['is-bad', 'None 에서 난 오류']],
    depth: [['is-now', '지금 부르거나 돌려주는 노드'], ['is-hit', '높이를 돌려준 루트']],
    bst: [['is-now', '비교 중인 노드'], ['is-in', '방금 넣은 노드'], ['is-hit', '방문한 노드']],
    bstK: [['is-now', '비교 중인 노드'], ['is-in', '방금 넣은 노드, 지나간 방문'], ['is-hit', 'k 번째 방문']],
  };

  const SPEC = { modes: T.MODES, modeDefault: T.MODE_DEFAULT, presetModes: T.PRESET_MODES };

  const S = { mode: 'build', key: 'example-1', p: null, trace: null, events: [], player: null };

  // 해설 칸 문장 (js/demo-edu-content.js 의 lesson-tree-bst 항목이 부른다). 지금 모드로 그 입력의 결과를 적는다.
  window.lessonTreeBstDescribe = (key) => T.describe(S.mode, key);

  const presetLabel = (key) => {
    const p = T.PRESETS[key];
    if (p.values) return `배열 ${list(p.values)}`;
    return `넣는 값 ${list(p.insert)}${p.k ? `, k = ${p.k}` : ''}`;
  };

  function note() {
    if (S.mode === 'build') return 'LeetCode 는 트리를 층별 순서의 배열로 주고, null 은 그 자리에 자식이 없다는 뜻입니다. 큐에서 부모를 하나 꺼내 배열의 다음 두 칸을 왼쪽, 오른쪽 자식으로 붙이는 일을 되풀이하면 한 층씩 트리가 자랍니다. 다 만든 뒤에는 root.right.left.val 같은 경로를 따라갑니다. 점선 노드는 None 자식입니다.';
    if (S.mode === 'depth') return '높이는 루트에서 가장 먼 잎까지의 층 수이고 LeetCode 104 의 maximum depth 입니다. maxDepth 는 왼쪽 자식을 먼저, 그다음 오른쪽 자식을 부르고 1 + max(왼쪽, 오른쪽)을 돌려줍니다. None 은 0을 돌려줍니다. 노드 아래 작은 숫자가 그 노드가 돌려준 값입니다.';
    if (S.p.k) return '값을 차례로 넣을 때마다 루트에서 비교하며 내려가 빈자리(None 자식)에 둡니다. 다 넣은 뒤 중위 순회(왼쪽, 자기, 오른쪽)는 BST 를 작은 값부터 읽는 순서라, k 번째로 방문한 값이 k 번째로 작은 값입니다(LeetCode 230). k 번째에서 멈춥니다.';
    return '값을 차례로 넣을 때마다 루트에서 비교하며 내려가 빈자리(None 자식)에 둡니다. 다 넣은 뒤 중위 순회(왼쪽, 자기, 오른쪽)로 읽으면 BST 가 정렬된 배열로 펼쳐집니다. 트리 밑의 칸이 펼친 배열이고 노드와 같은 열에 놓입니다.';
  }

  function retrace() {
    const p = T.PRESETS[S.key];
    S.p = p;
    if (S.mode === 'build') S.trace = T.buildTrace(p.values, p.path);
    else if (S.mode === 'depth') S.trace = T.depthTrace(p.values);
    else S.trace = T.bstTrace(p.insert, p.k);
    S.events = S.trace.events;
  }

  function fillPresets() {
    const sel = $('lk-preset');
    sel.replaceChildren();
    Object.keys(T.PRESETS).filter((k) => T.PRESET_MODES[k].includes(S.mode)).forEach((k) => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = presetLabel(k);
      sel.appendChild(o);
    });
    sel.value = S.key;
  }

  function drawTabs() {
    K.tabs($('lk-tabs'), T.MODES.map((m) => ({ key: m, label: MODE_LABEL[m] })), S.mode, (m) => {
      S.mode = m;
      if (!T.PRESET_MODES[S.key].includes(m)) S.key = T.MODE_DEFAULT[m];
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
    K.legend($('lk-legend'), LEGEND[S.mode === 'bst' && S.p.k ? 'bstK' : S.mode]);
    $('lk-state-label').textContent = STATE_LABEL[S.mode];
    S.player.restart();
  }

  function lines(el, texts) {
    el.replaceChildren();
    texts.forEach((t) => {
      const d = document.createElement('div');
      d.textContent = t;
      el.appendChild(d);
    });
  }

  const addCls = (map, id, c) => { map[id] = `${map[id] || ''} ${c}`.trim(); };
  const sameGroup = (shown) => {
    const e = shown[shown.length - 1];
    return e ? shown.filter((ev) => ev.group === e.group) : [];
  };

  // ==========================================
  // 보드 — 위쪽 배열(#tb-top), 트리(#tb-tree), 아래쪽 배열(#tb-bottom)
  // ==========================================

  function drawTree(shown, o) {
    const t = S.trace;
    K.tree($('tb-tree'), t.root, t.nodes, {
      text: (id) => t.nodes[id].val,
      cls: o.cls, sub: o.sub || {}, none: o.none, hidden: o.hidden, edge: o.edge || {},
    });
  }

  function clearEl(id) { $(id).replaceChildren(); }

  function boardBuild(shown, done) {
    const t = S.trace;
    const e = shown[shown.length - 1];
    const cls = {};
    const arrCls = {};
    const edge = {};
    const hidden = {};
    const none = {};
    Object.keys(t.nodes).forEach((id) => {
      hidden[id] = true;
      if (t.nodes[id].none) none[id] = true;
    });
    shown.forEach((ev) => {
      if (ev.type === 'root' || ev.type === 'attach' || ev.type === 'null') hidden[ev.id] = false;
    });
    shown.filter((ev) => ev.type === 'path').forEach((ev) => { hidden[ev.id] = false; });
    delete hidden[undefined];
    Object.keys(hidden).forEach((id) => { if (!hidden[id]) delete hidden[id]; });
    if (e && e.group !== 'path') {
      sameGroup(shown).forEach((ev) => {
        arrCls[ev.i] = 'is-now';
        if (ev.type === 'attach' || ev.type === 'root') addCls(cls, ev.id, 'is-in');
      });
    } else if (e) {
      shown.filter((ev) => ev.type === 'path').forEach((ev) => { if (ev.id !== '0') edge[ev.id] = 'is-now'; });
      const last = e.id;
      if (e.type === 'val') addCls(cls, last, t.result.ok ? 'is-hit' : 'is-bad');
      else addCls(cls, last, 'is-now');
    }
    K.array($('tb-top'), S.p.values.map((v) => (v === null ? 'null' : v)), { cls: arrCls });
    clearEl('tb-bottom');
    drawTree(shown, { cls, edge, hidden, none });
  }

  function boardDepth(shown, done) {
    const t = S.trace;
    const cls = {};
    const sub = {};
    const edge = {};
    const none = {};
    Object.keys(t.nodes).forEach((id) => { if (t.nodes[id].none) none[id] = true; });
    shown.forEach((ev) => { if (ev.type === 'return') sub[ev.id] = String(ev.value); });
    const e = shown[shown.length - 1];
    if (e) {
      addCls(cls, e.id, done ? 'is-hit' : 'is-now');
      if (e.id !== t.root) edge[e.id] = 'is-now';
    }
    clearEl('tb-top');
    clearEl('tb-bottom');
    drawTree(shown, { cls, sub, edge, none, hidden: {} });
  }

  function boardBst(shown, done) {
    const t = S.trace;
    const k = S.p.k;
    const cls = {};
    const arrCls = {};
    const hidden = {};
    Object.keys(t.nodes).forEach((id) => { hidden[id] = true; });
    shown.forEach((ev) => { if (ev.type === 'place') delete hidden[ev.id]; });
    const e = shown[shown.length - 1];
    if (e && e.type !== 'visit') {
      sameGroup(shown).forEach((ev) => {
        if (ev.type === 'compare') addCls(cls, ev.at, 'is-now');
        else if (ev.type === 'place') addCls(cls, ev.id, 'is-in');
      });
    }
    const visits = shown.filter((ev) => ev.type === 'visit');
    const n = Object.keys(t.nodes).length;
    const unfolded = [];
    for (let i = 0; i < n; i++) unfolded.push('');
    visits.forEach((v, j) => {
      unfolded[v.rank - 1] = v.value;
      const isLast = j === visits.length - 1;
      const finalHit = k ? v.rank === k : true;
      const c = finalHit ? 'is-hit' : 'is-in';
      addCls(cls, v.id, c);
      arrCls[v.rank - 1] = c;
      if (isLast) { addCls(cls, v.id, 'is-now'); arrCls[v.rank - 1] += ' is-now'; }
    });
    clearEl('tb-top');
    drawTree(shown, { cls, hidden });
    drawUnfolded(unfolded, arrCls);
  }

  // 트리 밑의 펼친 배열. 칸 i 가 col i 의 노드와 같은 열에 서야 한다.
  // 줄 이름을 배열 왼쪽(head)에 두면 이름 칸 폭만큼 칸이 오른쪽으로 밀리므로 이름은 배열 위 줄에 둔다.
  // 노드는 열 폭 안에서 틈의 절반만큼 오른쪽에 앉으므로(공용 틀 .lk-tnode) 배열도 왼쪽을 틈의 절반만큼 띄운다.
  function drawUnfolded(values, arrCls) {
    const label = document.createElement('div');
    label.className = 'lk-label';
    label.textContent = '펼친 배열';
    const row = document.createElement('div');
    row.style.paddingLeft = 'calc(var(--lk-gap) / 2)';
    K.array(row, values, { cls: arrCls });
    $('tb-bottom').replaceChildren(label, row);
  }

  // ==========================================
  // 이번 단계 문장
  // ==========================================

  const START = '「한 칸」이나 「다음 층」을 누르면 시작합니다.';

  function buildLine(ev, nodes) {
    if (ev.type === 'root') return `배열 0번 칸 ${P(ev.value, '으로', '로')} 루트를 만듭니다.`;
    const pv = nodes[ev.parent] ? nodes[ev.parent].val : '';
    if (ev.type === 'attach') return `배열 ${ev.i}번 칸 ${P(ev.value, '은', '는')} ${pv}의 ${SIDE[ev.side]} 자식이 됩니다.`;
    if (ev.type === 'null') return `배열 ${ev.i}번 칸은 null 이라 ${pv}의 ${SIDE[ev.side]} 자식이 없습니다.`;
    const node = S.trace.nodes[ev.id];
    if (ev.type === 'path') return node.none ? `${ev.expr} 의 값은 None 입니다.` : `${ev.expr} 의 값은 ${node.val}입니다.`;
    return S.trace.result.ok
      ? `${ev.expr} 의 값은 ${S.trace.result.value}입니다.`
      : `${ev.expr.replace(/\.val$/, '')} 의 값이 None 이라 .val 을 읽을 수 없습니다. ${S.trace.result.error} 오류가 납니다.`;
  }

  function buildNow(shown, done) {
    const e = shown[shown.length - 1];
    if (!e) return [START];
    const evs = e.group === 'path' ? [e] : sameGroup(shown);
    const out = evs.map((ev) => buildLine(ev, S.trace.nodes));
    return out;
  }

  function depthNow(shown, done) {
    const e = shown[shown.length - 1];
    if (!e) return ['「한 칸」이나 「다음 반환」을 누르면 시작합니다.'];
    const nodes = S.trace.nodes;
    const val = (id) => nodes[id].val;
    let text;
    if (e.type === 'call') text = `${val(e.id)}의 maxDepth 를 부릅니다. 왼쪽 자식부터 부르고 그다음 오른쪽 자식을 부릅니다.`;
    else if (e.type === 'none') {
      const parent = e.id.slice(0, e.id.lastIndexOf(':'));
      text = `${val(parent)}의 ${SIDE[e.id.slice(-1)]} 자식이 None 이라 0을 돌려줍니다.`;
    } else {
      const returned = {};
      shown.forEach((ev) => { if (ev.type === 'return') returned[ev.id] = ev.value; });
      const n = nodes[e.id];
      const l = nodes[n.left].none ? 0 : returned[n.left];
      const r = nodes[n.right].none ? 0 : returned[n.right];
      const both = nodes[n.left].none && nodes[n.right].none;
      const who = both ? `${val(e.id)}의 두 자식이 None 이라 ` : `${val(e.id)}의 왼쪽 자식에서 ${l}, 오른쪽 자식에서 `;
      text = `${who}${both ? `${l}, ` : ''}${P(r, '을', '를')} 받아 1 + max(${l}, ${r}) = ${P(e.value, '을', '를')} 돌려줍니다.`;
    }
    if (done) text += ` 루트가 ${P(e.value, '을', '를')} 돌려주므로 높이는 ${e.value}입니다.`;
    return [text];
  }

  function bstNow(shown, done) {
    const e = shown[shown.length - 1];
    if (!e) return ['「한 칸」이나 「다음 값」을 누르면 시작합니다.'];
    if (e.type === 'visit') {
      let text = `중위 순회로 ${e.rank}번째 ${P(e.value, '을', '를')} 방문해 펼친 배열의 ${e.rank}번째 칸에 적습니다.`;
      if (S.p.k && e.rank === S.p.k) text += ` k = ${P(S.p.k, '이라', '라')} ${S.p.k}번째에서 멈춥니다.`;
      else if (done) text += ' 모두 방문했습니다. 작은 값부터 차례로 나왔습니다.';
      return [text];
    }
    const evs = sameGroup(shown);
    const v = evs[0].value;
    const compares = evs.filter((ev) => ev.type === 'compare');
    const placed = evs.some((ev) => ev.type === 'place');
    const parts = compares.map((c) => `${c.at}보다 ${c.dir === 'left' ? '작아 왼쪽' : '커서 오른쪽'}`);
    if (!compares.length) return [`${P(v, '을', '를')} 넣습니다. 트리가 비어 있어 루트가 됩니다.`];
    return [`${P(v, '을', '를')} 넣습니다. ${parts.join(', ')}${placed ? ' 빈자리에 둡니다.' : ' 내려가는 중입니다.'}`];
  }

  // ==========================================
  // 상태 칸과 결과 칸
  // ==========================================

  function state(shown, done) {
    const nodes = S.trace.nodes;
    let items = [];
    let text = '';
    if (S.mode === 'build') {
      const levels = [];
      shown.forEach((ev) => {
        if (ev.type === 'root' || ev.type === 'attach') (levels[ev.group] = levels[ev.group] || []).push(ev.value);
      });
      items = levels.map((lv, i) => ({ text: `${i}층 ${list(lv)}`, cls: 'is-in' }));
      K.chips($('lk-state'), items, '아직 읽은 층이 없습니다');
      text = `지금까지 ${levels.length}개 층을 만들었습니다.`;
    } else if (S.mode === 'depth') {
      const stack = [];
      shown.forEach((ev) => {
        if (ev.type === 'call') stack.push(ev.id);
        else if (ev.type === 'return') stack.pop();
      });
      items = stack.map((id, i) => ({ text: String(nodes[id].val), cls: i === stack.length - 1 ? 'is-now' : '' }));
      K.chips($('lk-state'), items, done ? '호출이 모두 끝났습니다' : '아직 호출이 없습니다');
      const calls = shown.filter((ev) => ev.type === 'call' || ev.type === 'none').length;
      text = `지금 쌓인 호출 ${stack.length}개, 지금까지 maxDepth 를 부른 횟수 ${calls}번.`;
    } else {
      const placed = shown.filter((ev) => ev.type === 'place');
      items = placed.map((ev) => ({ text: String(ev.value), cls: 'is-in' }));
      K.chips($('lk-state'), items, '아직 넣은 값이 없습니다');
      const cmp = shown.filter((ev) => ev.type === 'compare').length;
      text = `지금까지 넣은 값 ${placed.length}개, 비교 ${cmp}번.`;
    }
    $('lk-state-note').textContent = text;
  }

  function result(shown, done) {
    const main = $('lk-result-main');
    const sub = $('lk-result-sub');
    const t = S.trace;
    main.classList.remove('is-bad');
    if (S.mode === 'build') {
      const levels = [];
      shown.forEach((ev) => {
        if (ev.type === 'root' || ev.type === 'attach') (levels[ev.group] = levels[ev.group] || []).push(ev.value);
      });
      const val = shown.find((ev) => ev.type === 'val');
      if (!val) main.textContent = '아직 결과가 없습니다';
      else if (t.result.ok) main.textContent = `${val.expr} = ${t.result.value}`;
      else { main.textContent = t.result.error; main.classList.add('is-bad'); }
      lines(sub, [`층별 값 ${levels.length ? list(levels.map(list)) : '[]'}`]);
      return;
    }
    if (S.mode === 'depth') {
      const calls = shown.filter((ev) => ev.type === 'call').length;
      const nones = shown.filter((ev) => ev.type === 'none').length;
      if (!done) {
        main.textContent = '아직 높이가 없습니다';
        lines(sub, [`지금까지 maxDepth 호출 ${calls + nones}번`]);
        return;
      }
      main.textContent = `높이 ${t.answer}`;
      lines(sub, [`maxDepth 호출 ${calls + nones}번(노드 ${calls}개, None 자식 ${nones}개)`]);
      return;
    }
    const p = S.p;
    const last = p.insert[p.insert.length - 1];
    if (!done) {
      main.textContent = '아직 펼치지 않았습니다';
      lines(sub, [`지금까지 비교 ${shown.filter((ev) => ev.type === 'compare').length}번`]);
      return;
    }
    if (p.k) {
      main.textContent = `${p.k}번째로 작은 값 ${t.answer}`;
      lines(sub, [`높이 ${t.height}, 중위 순회 ${p.k}번째에서 멈춤`]);
      return;
    }
    main.textContent = `펼친 배열 ${list(t.inorder)}`;
    lines(sub, [`높이 ${t.height}, 넣을 때 비교 ${t.compares}번, ${P(last, '을', '를')} 찾으면 비교 ${T.searchCompares(p.insert, last)}번`]);
  }

  // ==========================================
  // 공통
  // ==========================================

  function render(at) {
    const shown = S.events.slice(0, at);
    const done = at >= S.events.length && at > 0;
    if (S.mode === 'build') boardBuild(shown, done);
    else if (S.mode === 'depth') boardDepth(shown, done);
    else boardBst(shown, done);
    state(shown, done);
    result(shown, done);
    const texts = S.mode === 'build' ? buildNow(shown, done) : S.mode === 'depth' ? depthNow(shown, done) : bstNow(shown, done);
    lines($('lk-now'), texts);
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
