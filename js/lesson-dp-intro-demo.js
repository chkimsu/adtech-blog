/**
 * 과외 DP 입문 데모 — 화면
 *   js/lesson-dp-intro-demo.js
 *
 * 계산은 js/lesson-dp-intro-model.js 의 LessonDpIntro, 단계 재생과 부품은 js/lesson-kit.js 의 LessonKit 이 한다.
 * 화면 상태는 「이벤트를 몇 개까지 보였나」(at) 하나이고, render(at) 가 그때마다 이벤트를 처음부터 다시 쌓아 그린다.
 * calls 와 memo 탭은 마지막 호출 트리를 한 번 배치한 뒤 아직 부르지 않은 노드를 숨기고, table 탭은 dp 표(와 rob 의 nums)를 이벤트대로 채운다.
 * 「다음 반환」, 「다음 칸」 버튼(#lk-group)은 이벤트의 group 이 같은 동안을 한 번에 넘긴다(글자는 탭마다 바뀐다).
 *
 * 주소 약속 — demo-lesson-dp-intro.html?embed=1&mode=<calls|memo|table>&preset=<PRESETS 키>
 *   인자가 없으면 calls 모드의 climb-5 다.
 *   블로그 글이 이 주소를 iframe 이나 링크로 쓴다: calls + climb-5, memo + climb-5, table + climb-5, table + rob-5, calls + climb-6, table + rob-4.
 */
(function () {
  'use strict';

  const D = window.LessonDpIntro;
  const K = window.LessonKit;
  if (!D || !K) return;

  const $ = (id) => document.getElementById(id);
  const { list } = D;
  const P = D.P;

  const MODE_LABEL = { calls: '그냥 재귀', memo: '메모 재귀', table: '표를 채우는 풀이' };
  const GROUP_LABEL = { calls: '다음 반환', memo: '다음 반환', table: '다음 칸' };
  // 표 탭의 상태 칸은 계단이면 climb_two 의 a, b 자리(다음 칸이 읽을 두 칸), 집 털기면 털 경우와 쉴 경우다
  const STATE_LABEL = { calls: '호출 중', memo: '메모', table: '다음 칸이 읽을 두 칸', rob: '두 경우' };
  const START = {
    calls: '「한 칸」이나 「다음 반환」을 누르면 시작합니다.',
    table: '「한 칸」이나 「다음 칸」을 누르면 시작합니다.',
  };
  START.memo = START.calls;

  const LEGEND = {
    calls: [['is-now', '지금 호출']],
    memo: [['is-now', '지금 호출'], ['is-in', '메모에서 꺼낸 호출']],
  };
  const NUM = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];

  const SPEC = { modes: D.MODES, modeDefault: D.MODE_DEFAULT, presetModes: D.PRESET_MODES };

  const S = { mode: 'calls', key: 'climb-5', p: null, trace: null, events: [], player: null };

  // 해설 칸 문장 (js/demo-edu-content.js 의 lesson-dp-intro 항목이 부른다). 지금 모드로 그 입력의 결과를 적는다.
  window.lessonDpIntroDescribe = (key) => D.describe(S.mode, key);

  const isTable = () => S.mode === 'table';

  const presetLabel = (key) => {
    const p = D.PRESETS[key];
    return p.n ? `계단 ${p.n}칸` : `nums ${list(p.nums)}`;
  };

  function note() {
    if (S.mode === 'calls') return '70번처럼 계단 n 칸을 한 번에 1칸이나 2칸씩 오르는 방법의 수를 dfs(step) 으로 셉니다. dfs(step) 은 dfs(step - 1) 과 dfs(step - 2) 를 더하는데 구한 값을 적어 두지 않아 같은 호출이 여러 번 나옵니다.';
    if (S.mode === 'memo') return '같은 dfs 에 메모(dict)를 붙입니다. 계산한 값은 memo[step] 에 적고 이미 있으면 더 부르지 않고 꺼내 씁니다. 호출 수가 줄어드는 것을 그냥 재귀와 비교해 봅니다.';
    return S.p.n
      ? '작은 칸부터 dp 리스트를 채웁니다. dp[1] = 1, dp[2] = 2 에서 시작해 dp[i] = dp[i - 1] + dp[i - 2] 를 한 번씩만 계산하고 재귀 호출은 없습니다.'
      : '198번처럼 이웃한 집은 털 수 없을 때 dp[i] 는 i번 집까지 훔칠 수 있는 최대 금액입니다. i번 집을 털면 nums[i] + dp[i - 2], 쉬면 dp[i - 1] 이고 둘 중 큰 쪽을 적습니다.';
  }

  function retrace() {
    const p = D.PRESETS[S.key];
    S.p = p;
    if (S.mode === 'table') S.trace = p.n ? D.tableClimb(p.n) : D.tableRob(p.nums);
    else S.trace = D.callTrace(p.n, S.mode === 'memo');
    S.events = S.trace.events;
  }

  function fillPresets() {
    const sel = $('lk-preset');
    sel.replaceChildren();
    Object.keys(D.PRESETS).filter((k) => D.PRESET_MODES[k].includes(S.mode)).forEach((k) => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = presetLabel(k);
      sel.appendChild(o);
    });
    sel.value = S.key;
  }

  function drawTabs() {
    K.tabs($('lk-tabs'), D.MODES.map((m) => ({ key: m, label: MODE_LABEL[m] })), S.mode, (m) => {
      S.mode = m;
      if (!D.PRESET_MODES[S.key].includes(m)) S.key = D.MODE_DEFAULT[m];
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
    $('dp-hint').textContent = isTable() ? '' : '노드 안 숫자는 dfs 에 넘긴 계단 수, 아래 숫자는 돌려준 값';
    if (isTable()) $('lk-legend').replaceChildren();
    else K.legend($('lk-legend'), LEGEND[S.mode]);
    $('lk-state-label').textContent = STATE_LABEL[isTable() && !S.p.n ? 'rob' : S.mode];
    ['dp-tree', 'dp-nums', 'dp-table'].forEach((id) => $(id).replaceChildren());
    if (isTable()) {
      K.legend($('lk-legend'), S.p.n
        ? [['is-now', '지금 채우는 칸'], ['is-in', '채운 칸'], ['is-window', '직전 두 칸'], ['is-hit', '답']]
        : [['is-now', '지금 채우는 칸'], ['is-in', '채운 칸'], ['is-window', '직전 두 칸'], ['is-hit', '답과 턴 집']]);
    }
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

  const addCls = (map, key, c) => { map[key] = `${map[key] || ''} ${c}`.trim(); };

  // ==========================================
  // calls, memo 탭 — 호출과 반환
  // ==========================================

  function callView(shown) {
    const done = {};
    const memo = [];
    let calls = 0;
    shown.forEach((e) => {
      if (e.type === 'call') calls++;
      else {
        done[e.id] = e;
        if (e.type === 'return' && S.mode === 'memo') memo.push([e.step, e.value]);
      }
    });
    return { done, memo, calls };
  }

  function parentMap(nodes) {
    const par = {};
    Object.keys(nodes).forEach((id) => {
      if (nodes[id].left) par[nodes[id].left] = id;
      if (nodes[id].right) par[nodes[id].right] = id;
    });
    return par;
  }

  // 루트에서 id 까지의 호출 id (루트가 맨 앞)
  function chain(id) {
    const par = parentMap(S.trace.nodes);
    const a = [];
    for (let x = id; x; x = par[x]) a.unshift(x);
    return a;
  }

  function callBoard(shown, v) {
    const nodes = S.trace.nodes;
    const e = shown[shown.length - 1];
    const cls = {}, edge = {}, hidden = {}, sub = {};
    const called = {};
    shown.forEach((x) => { if (x.type === 'call') called[x.id] = true; });
    Object.keys(nodes).forEach((id) => { if (!called[id]) hidden[id] = true; });
    Object.keys(v.done).forEach((id) => {
      const d = v.done[id];
      sub[id] = String(d.value);
      if (d.type === 'hit') addCls(cls, id, 'is-in');
    });
    if (e) {
      const ps = chain(e.id);
      addCls(cls, e.id, 'is-now');
      ps.slice(1).forEach((id) => { edge[id] = 'is-now'; });
    }
    K.tree($('dp-tree'), S.trace.root, nodes, { layout: 'leaves', text: (id) => nodes[id].step, cls, sub, hidden, edge });
  }

  // 같은 step 의 호출이 몇 번 나왔나 (그 이벤트까지)
  const nth = (shown, e) => shown.filter((x) => x.type === 'call' && x.step === e.step).length;

  const fibVal = (step) => (step <= 2 ? step : fibVal(step - 1) + fibVal(step - 2));
  const dfsName = (s) => `dfs(${s})`;

  function callNow(shown, v) {
    const e = shown[shown.length - 1];
    if (!e) return START[S.mode];
    const nodes = S.trace.nodes;
    const nx = S.events[shown.length];
    const q = (s, a, b) => P(dfsName(s), a, b);
    if (e.type === 'call') {
      if (e.step <= 2) return `${q(e.step, '을', '를')} 부릅니다. 기저 조건 step <= 2 에 걸립니다.`;
      const k = nth(shown, e);
      const kth = ['', '', '두', '세', '네', '다섯'][k] || `${k}`;
      const kids = `${q(e.step - 1, '과', '와')} ${q(e.step - 2, '을', '를')} 부릅니다.`;
      if (S.mode === 'calls') {
        if (k >= 2) return `${q(e.step, '을', '를')} ${kth} 번째로 부릅니다. 앞에서 구한 ${P(fibVal(e.step), '을', '를')} 적어 두지 않아 다시 ${kids}`;
        return `${q(e.step, '을', '를')} 부릅니다. 기저 조건에 걸리지 않아 ${kids}`;
      }
      const head = `${q(e.step, '을', '를')} 부릅니다. 기저 조건에 걸리지 않아 메모를 먼저 봅니다. `;
      if (nx && nx.type === 'hit') return `${head}메모에 ${P(`${e.step}: ${nx.value}`, '이', '가')} 있습니다.`;
      return `${head}메모에 ${P(e.step, '이', '가')} 없어 ${kids}`;
    }
    if (e.type === 'base') return `${q(e.step, '은', '는')} 기저 조건 step <= 2 에 걸려 ${P(e.value, '을', '를')} 돌려줍니다.`;
    if (e.type === 'hit') return `메모에 ${P(`${e.step}: ${e.value}`, '이', '가')} 있어 ${q(e.step, '은', '는')} 더 부르지 않고 ${P(e.value, '을', '를')} 돌려줍니다.`;
    const n = nodes[e.id];
    const a = v.done[n.left].value, b = v.done[n.right].value;
    const sum = `${q(e.step, '은', '는')} ${q(e.step - 1, '이', '가')} 돌려준 ${P(a, '과', '와')} ${q(e.step - 2, '이', '가')} 돌려준 ${P(b, '을', '를')} 더해 ${P(e.value, '을', '를')} 돌려줍니다.`;
    return S.mode === 'memo' ? `${sum} 메모에 ${P(`${e.step}: ${e.value}`, '을', '를')} 적습니다.` : sum;
  }

  function callState(shown, v) {
    const e = shown[shown.length - 1];
    const nodes = S.trace.nodes;
    if (S.mode === 'memo') {
      K.chips($('lk-state'), v.memo.map(([s, val]) => ({ text: `${s}: ${val}` })), '메모가 비어 있습니다');
      $('lk-state-note').textContent = '칩은 메모에 적은 순서대로 step: 값입니다.';
      return;
    }
    if (!e) {
      K.chips($('lk-state'), [], '아직 부른 호출이 없습니다');
      $('lk-state-note').textContent = '';
      return;
    }
    const ps = chain(e.id);
    K.chips($('lk-state'), ps.map((id, i) => ({ text: String(nodes[id].step), cls: i === ps.length - 1 ? 'is-in' : '' })), '');
    $('lk-state-note').textContent = `재귀 깊이 ${ps.length}. 칩은 루트부터 dfs 에 넘긴 계단 수입니다.`;
  }

  function stepCounts() {
    const c = {};
    Object.keys(S.trace.nodes).forEach((id) => { const s = S.trace.nodes[id].step; c[s] = (c[s] || 0) + 1; });
    return c;
  }

  function callResult(shown, v, done) {
    const main = $('lk-result-main');
    const sub = $('lk-result-sub');
    const t = S.trace;
    const n = S.p.n;
    if (!done) {
      main.textContent = '아직 결과가 없습니다';
      lines(sub, [`지금까지 호출 ${v.calls}번`]);
      return;
    }
    main.textContent = `${dfsName(n)} = ${t.answer}`;
    if (S.mode === 'calls') {
      const c = stepCounts();
      const parts = Object.keys(c).map(Number).sort((x, y) => y - x).filter((s) => c[s] >= 2).map((s) => `${dfsName(s)} ${c[s]}번`);
      lines(sub, [`호출 ${t.calls}번. ${parts.join(', ')}`]);
      return;
    }
    const plain = D.callTrace(n, false);
    const m = `{${Object.keys(t.memo).map((s) => `${s}: ${t.memo[s]}`).join(', ')}}`;
    lines(sub, [`호출 ${t.calls}번(그냥 재귀는 ${plain.calls}번). 메모 ${m}`]);
  }

  // ==========================================
  // table 탭 — dp 표 채우기
  // ==========================================

  function tableView(shown) {
    const n = S.p.n ? S.p.n + 1 : S.p.nums.length;
    const dp = new Array(n).fill(null);
    shown.forEach((e) => { dp[e.i] = e.value; });
    return { dp, filled: dp.filter((x) => x !== null).length };
  }

  function tableBoard(shown, v, done) {
    const e = shown[shown.length - 1];
    const n = v.dp.length;
    const isClimb = !!S.p.n;
    const dcls = {};
    v.dp.forEach((x, i) => { if (x !== null) addCls(dcls, i, 'is-in'); });
    if (isClimb) addCls(dcls, 0, 'is-dim');
    let range = null;
    if (e && e.type === 'fill' && !done) {
      addCls(dcls, e.i, 'is-now');
      range = [e.i - 2, e.i - 1];
    }
    if (done) addCls(dcls, n - 1, 'is-hit');
    K.array($('dp-table'), v.dp.map((x) => (x === null ? '' : x)), { cls: dcls, range, head: 'dp' });
    if (isClimb) { $('dp-nums').replaceChildren(); return; }
    const ncls = {};
    if (e && e.type === 'fill' && !done) addCls(ncls, e.i, 'is-now');
    if (done) S.trace.houses.forEach((h) => addCls(ncls, h, 'is-hit'));
    K.array($('dp-nums'), S.p.nums, { cls: ncls, head: 'nums' });
  }

  function tableNow(shown, v) {
    const e = shown[shown.length - 1];
    if (!e) return START.table;
    // 기저 칸은 「한 칸」마다 하나씩 적힌다. 문장도 그 칸 하나만 말하고, 둘째 칸에서 두 칸을 함께 정리한다(「다음 칸」은 둘을 한 번에 넘긴다).
    if (e.type === 'base') {
      if (S.p.n) {
        if (e.i === 1) return 'dp[1] = 1을 적습니다. 계단 1칸은 1칸 한 번으로 1가지라 점화식 없이 적는 기저 칸입니다.';
        return 'dp[2] = 2를 적습니다. 계단 2칸은 1 + 1 과 2 로 2가지입니다. 기저 칸 dp[1], dp[2] 는 점화식 없이 이렇게 먼저 적습니다.';
      }
      const nums = S.p.nums;
      if (e.i === 0) return `0번 집까지만 보면 그 집을 털어 dp[0] = nums[0] = ${P(e.value, '을', '를')} 적습니다.`;
      return `1번 집까지 보면 둘 중 큰 쪽을 털어 dp[1] = max(${nums[0]}, ${nums[1]}) = ${P(e.value, '을', '를')} 적습니다. 기저 칸 dp[0], dp[1] 은 점화식 없이 이렇게 먼저 적습니다.`;
    }
    if (S.p.n) {
      const a = v.dp[e.i - 1], b = v.dp[e.i - 2];
      return `dp[${e.i}] = dp[${e.i - 1}] + dp[${e.i - 2}] = ${a} + ${b} = ${P(e.value, '을', '를')} 적습니다. 직전 두 칸만 읽고 재귀 호출은 없습니다.`;
    }
    const nums = S.p.nums;
    return `${e.i}번 집: 털면 ${nums[e.i]} + dp[${e.i - 2}] = ${e.take}, 쉬면 dp[${e.i - 1}] = ${P(e.skip, '이라', '라')} ${P(e.value, '을', '를')} 적습니다.`;
  }

  function tableState(shown, v) {
    const e = shown[shown.length - 1];
    if (!e) {
      K.chips($('lk-state'), [], '아직 채운 칸이 없습니다');
      $('lk-state-note').textContent = '';
      return;
    }
    // 기저 칸만 적은 동안 — 계단은 dp[2] 까지 적으면 dp[3] 이 읽을 두 칸이 생기고, 집 털기는 두 경우가 2번 집부터 나온다
    if (e.type === 'base') {
      const first = S.p.n ? 1 : 0;
      if (S.p.n && e.i === first + 1) {
        K.chips($('lk-state'), [{ text: `dp[i - 1] ${v.dp[1]}` }, { text: `dp[i] ${v.dp[2]}`, cls: 'is-in' }], '');
        $('lk-state-note').textContent = 'i = 2. 다음 칸은 이 두 값만 있으면 구할 수 있습니다.';
        return;
      }
      K.chips($('lk-state'), [], S.p.n ? '다음 칸 dp[2] 도 기저 칸입니다' : '2번 집부터 나옵니다');
      $('lk-state-note').textContent = e.i === first ? `기저 칸 dp[${first}] 을 적었습니다.` : `기저 칸 dp[${first}], dp[${e.i}] 을 적었습니다.`;
      return;
    }
    if (S.p.n) {
      K.chips($('lk-state'), [{ text: `dp[i - 1] ${e.prev[0]}` }, { text: `dp[i] ${e.prev[1]}`, cls: 'is-in' }], '');
      $('lk-state-note').textContent = `i = ${e.i}. 다음 칸은 이 두 값만 있으면 구할 수 있습니다.`;
      return;
    }
    K.chips($('lk-state'), [{ text: `턴 경우 ${e.take}`, cls: e.pick === 'take' ? 'is-in' : '' }, { text: `쉰 경우 ${e.skip}`, cls: e.pick === 'skip' ? 'is-in' : '' }], '');
    $('lk-state-note').textContent = `i = ${e.i}. 큰 쪽 ${P(e.value, '을', '를')} dp[${e.i}] 에 적었습니다.`;
  }

  function tableResult(shown, v, done) {
    const main = $('lk-result-main');
    const sub = $('lk-result-sub');
    const t = S.trace;
    if (!done) {
      main.textContent = '아직 결과가 없습니다';
      lines(sub, [`지금까지 채운 칸 ${v.filled}개`]);
      return;
    }
    if (S.p.n) {
      const n = S.p.n;
      main.textContent = `dp[${n}] = ${t.answer}`;
      lines(sub, [`칸 ${NUM[n]} 개(dp[1] ~ dp[${n}])를 한 번씩 채웠습니다. 직전 두 칸만 남겨도 같은 답입니다`]);
      return;
    }
    const last = S.p.nums.length - 1;
    main.textContent = `dp[${last}] = ${t.answer}`;
    lines(sub, [`턴 집 ${t.houses.join(', ')}번(${t.houses.map((h) => S.p.nums[h]).join(' + ')})`]);
  }

  // ==========================================
  // 공통
  // ==========================================

  function render(at) {
    const shown = S.events.slice(0, at);
    const done = at >= S.events.length && at > 0;
    if (isTable()) {
      const v = tableView(shown);
      tableBoard(shown, v, done);
      tableState(shown, v);
      tableResult(shown, v, done);
      $('lk-now').textContent = tableNow(shown, v);
    } else {
      const v = callView(shown);
      callBoard(shown, v);
      callState(shown, v);
      callResult(shown, v, done);
      $('lk-now').textContent = callNow(shown, v);
    }
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
