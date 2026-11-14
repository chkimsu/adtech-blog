/**
 * 과외 DFS와 백트래킹 데모 — 화면
 *   js/lesson-dfs-backtracking-demo.js
 *
 * 계산은 js/lesson-dfs-backtracking-model.js 의 LessonDfsBacktracking, 단계 재생과 부품은 js/lesson-kit.js 의 LessonKit 이 한다.
 * 화면 상태는 「이벤트를 몇 개까지 보였나」(at) 하나이고, render(at) 가 그때마다 이벤트를 처음부터 다시 쌓아 그린다.
 * 단어 탭은 판 복사본을 이벤트대로 # 로 바꾸고 되돌리며 쌓고, 두 선택 트리 탭은 마지막 트리를 한 번 배치한 뒤 아직 부르지 않은 노드를 숨긴다.
 * 「다음 칸」, 「다음 반환」 버튼(#lk-group)은 이벤트의 group 이 같은 동안을 한 번에 넘긴다(글자는 탭마다 바뀐다).
 *
 * 주소 약속 — demo-lesson-dfs-backtracking.html?embed=1&mode=<word|target|prune>&preset=<PRESETS 키>
 *   인자가 없으면 word 모드의 see 다.
 *   블로그 글이 이 주소를 iframe 이나 링크로 쓴다: word + abcced, word + see, target + t1, prune + t3, word + abcb, prune + t1.
 */
(function () {
  'use strict';

  const D = window.LessonDfsBacktracking;
  const K = window.LessonKit;
  if (!D || !K) return;

  const $ = (id) => document.getElementById(id);
  const { list, J } = D;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);

  const MODE_LABEL = { word: '단어를 만드는 탐색', target: '부호를 고르는 탐색', prune: '가지치기한 탐색' };
  const GROUP_LABEL = { word: '다음 칸', target: '다음 반환', prune: '다음 반환' };
  const STATE_LABEL = { word: '지금 경로', target: '호출 중', prune: '호출 중' };
  const START = { word: '「한 칸」이나 「다음 칸」을 누르면 시작합니다.', target: '「한 칸」이나 「다음 반환」을 누르면 시작합니다.' };
  START.prune = START.target;

  const LEGEND = {
    word: [['is-now', '지금 칸'], ['is-in', '표시한 칸(#)'], ['is-bad', '막힌 칸'], ['is-hit', '찾은 길']],
    target: [['is-now', '지금 호출'], ['is-in', '쌓인 호출'], ['is-hit', '맞은 잎']],
    prune: [['is-now', '지금 호출'], ['is-in', '쌓인 호출'], ['is-hit', '맞은 잎'], ['is-dim', '잘린 노드']],
  };

  const SPEC = { modes: D.MODES, modeDefault: D.MODE_DEFAULT, presetModes: D.PRESET_MODES };

  const S = { mode: 'word', key: 'see', p: null, trace: null, events: [], player: null };

  // 해설 칸 문장 (js/demo-edu-content.js 의 lesson-dfs-backtracking 항목이 부른다). 지금 모드로 그 입력의 결과를 적는다.
  window.lessonDfsBacktrackingDescribe = (key) => D.describe(S.mode, key);

  const isWord = () => S.mode === 'word';

  const presetLabel = (key) => {
    const p = D.PRESETS[key];
    if (isWord()) return `단어 ${p.word}`;
    return `nums ${list(p.nums)}, 목표 ${p.target}`;
  };

  function note() {
    if (isWord()) return '79번처럼 판의 칸을 위, 아래, 왼쪽, 오른쪽 순서로 연결해 단어를 만듭니다. 쓰는 칸은 # 로 바꿔 표시하고 네 방향이 모두 막히면 원래 글자로 되돌려 다른 길에서 다시 쓸 수 있게 합니다.';
    if (S.mode === 'target') return '494번처럼 숫자마다 + 와 - 를 골라 합이 목표가 되는 방법을 셉니다. 고를 때마다 노드가 생기고 끝까지 간 잎에서 합을 목표와 비교합니다. 이 탭은 가지치기를 하지 않습니다.';
    return '같은 선택 트리에서 지금까지의 합이 남은 숫자를 모두 더하거나 빼도 목표에 닿지 않으면 그 노드에서 더 들어가지 않고 0 을 돌려줍니다(가지치기).';
  }

  function retrace() {
    const p = D.PRESETS[S.key];
    S.p = p;
    if (isWord()) S.trace = D.wordTrace(p.board, p.word);
    else S.trace = D.targetTrace(p.nums, p.target, S.mode === 'prune');
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
    K.legend($('lk-legend'), LEGEND[S.mode]);
    $('lk-state-label').textContent = STATE_LABEL[S.mode];
    ['dfs-word', 'dfs-grid', 'dfs-nums', 'dfs-tree'].forEach((id) => $(id).replaceChildren());
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
  // 단어 탭 — 이벤트를 판에 쌓는다
  // ==========================================

  function wordView(shown) {
    const board = S.p.board.map((r) => r.slice());
    const path = [];
    let hitPath = null, calls = 0, probes = 0, marks = 0, restores = 0;
    shown.forEach((e) => {
      if (e.type === 'probe') { calls++; probes++; }
      else if (e.type === 'mark') { calls++; marks++; board[e.r][e.c] = '#'; path.push({ r: e.r, c: e.c, k: e.k, letter: e.letter }); }
      else if (e.type === 'done') { calls++; hitPath = path.map((x) => ({ r: x.r, c: x.c })); }
      else { restores++; board[e.r][e.c] = e.letter; path.pop(); }
    });
    return { board, path, hitPath, calls, probes, marks, restores };
  }

  const DIRS = [[-1, 0, '위'], [1, 0, '아래'], [0, -1, '왼쪽'], [0, 1, '오른쪽']];
  const dirName = (from, e) => {
    const d = DIRS.find((x) => from && from.r + x[0] === e.r && from.c + x[1] === e.c);
    return d ? d[2] : '';
  };
  const cell = (r, c) => `(${r},${c})`;

  function wordBoard(shown, v, done) {
    const w = S.p.word;
    const e = shown[shown.length - 1];
    const top = v.path[v.path.length - 1];
    const gcls = {};
    v.path.forEach((x) => addCls(gcls, `${x.r},${x.c}`, 'is-in'));
    if (e) {
      if (e.type === 'mark' || e.type === 'restore') addCls(gcls, `${e.r},${e.c}`, 'is-now');
      else if (top) addCls(gcls, `${top.r},${top.c}`, 'is-now');
      if (e.type === 'probe' && e.result === 'miss') gcls[`${e.r},${e.c}`] = 'is-bad';
    }
    if (done && S.trace.found) v.hitPath.forEach((x) => addCls(gcls, `${x.r},${x.c}`, 'is-hit'));
    const rows = v.board.length, cols = v.board[0].length;
    K.grid($('dfs-grid'), rows, cols, (r, c) => ({ text: v.board[r][c], cls: gcls[`${r},${c}`] || '' }), {
      rowHead: (r) => String(r),
      colHead: (c) => String(c),
    });
    const m = done && S.trace.found ? w.length : v.path.length;
    const wcls = {};
    for (let i = 0; i < m; i++) wcls[i] = 'is-in';
    if (m < w.length) wcls[m] = 'is-now';
    K.array($('dfs-word'), w.split(''), { cls: wcls, head: '찾는 단어' });
  }

  function wordNow(shown, v) {
    const e = shown[shown.length - 1];
    if (!e) return START.word;
    const w = S.p.word;
    const par = top2(v);
    if (e.type === 'mark') {
      const at = cell(e.r, e.c);
      const lead = e.k === 0 ? `판을 왼쪽 위부터 돌다 첫 글자 ${P(e.letter, '과', '와')} 같은 ${at}에서 dfs 를 시작합니다. ` : '';
      const tail = e.k + 1 < w.length
        ? `${at}의 ${P(e.letter, '을', '를')} # 로 바꾸고 다음 글자 ${P(w[e.k + 1], '을', '를')} 찾습니다.`
        : `${at}의 ${P(e.letter, '을', '를')} # 로 바꿉니다. 마지막 글자까지 맞췄으니 다음 호출에서 단어가 끝납니다.`;
      return lead + tail;
    }
    if (e.type === 'probe') {
      const dir = dirName(par, e);
      const at = `${dir} ${cell(e.r, e.c)}`;
      if (e.result === 'out') return `${P(at, '은', '는')} 판 밖이라 돌아갑니다. 찾는 글자는 ${w[e.k]}입니다.`;
      if (e.letter === '#') return `${P(at, '은', '는')} 이미 표시한 칸(#)이라 찾는 글자 ${w[e.k]}${J(w[e.k], '이', '가')} 아니어서 돌아갑니다. 한 칸은 한 번만 쓸 수 있습니다.`;
      return `${at}의 ${P(e.letter, '은', '는')} 찾는 글자 ${P(w[e.k], '과', '와')} 달라 돌아갑니다.`;
    }
    if (e.type === 'done') return `다음 글자를 찾을 차례인데 k 가 단어 길이 ${P(w.length, '과', '와')} 같아 단어를 모두 찾았습니다. 이 검사가 판 밖 검사보다 먼저라 True 를 바로 돌려줍니다.`;
    const back = top2(v);
    if (e.found) return `${P(cell(e.r, e.c), '을', '를')} ${P(e.letter, '으로', '로')} 되돌립니다. 아래에서 True 가 올라와 이 호출도 True 를 돌려줍니다.`;
    // 시작 칸의 호출이 끝나면 반복문으로 돌아간다. 마지막 이벤트면 남은 시작 칸이 없어 exist 가 False 로 끝난다.
    const loop = shown.length === S.events.length
      ? '시작 칸을 도는 반복문으로 돌아갑니다. 남은 시작 칸이 없어 False 를 돌려줍니다.'
      : '시작 칸을 도는 반복문으로 돌아갑니다. 다음 시작 칸을 찾습니다.';
    return `네 방향 모두 막혀 ${P(cell(e.r, e.c), '을', '를')} ${P(e.letter, '으로', '로')} 되돌리고 ${back ? `${P(cell(back.r, back.c), '으로', '로')} 돌아갑니다. 다른 길에서 이 칸을 다시 쓸 수 있습니다.` : loop}`;
  }
  const top2 = (v) => v.path[v.path.length - 1];

  // 재귀 깊이는 글 1절의 정의대로 한 번에 쌓인 dfs 호출 수(이벤트의 depth)다. 칩은 표시한 칸이라
  // mark 에서만 칩 수와 같고 막힌 호출, 확인 호출, 되돌리는 호출에서는 칩 위에 호출 하나가 더 쌓여 있다.
  // 문장은 1440px 와 1024px 글 안에서 한 줄에 들어가는 길이로 둔다(두 줄이면 iframe 높이 폴백을 넘는다).
  const EXTRA_CALL = { probe: '막힌 호출', done: '확인 호출', restore: '되돌리는 호출' };
  function wordState(shown, v) {
    K.chips($('lk-state'), v.path.map((x, i) => ({ text: `${x.letter} ${cell(x.r, x.c)}`, cls: i === v.path.length - 1 ? 'is-in' : '' })), '표시한 칸이 없습니다');
    const e = shown[shown.length - 1];
    let text = '재귀 깊이 0. 아직 부른 dfs 호출이 없습니다.';
    if (e && e.type === 'mark') text = `재귀 깊이 ${e.depth}. 칩은 표시한 칸을 부른 순서대로 적었습니다.`;
    else if (e) {
      const extra = EXTRA_CALL[e.type];
      text = v.path.length
        ? `재귀 깊이 ${e.depth}. 칩 ${v.path.length}개 위에 ${extra}${J(extra, '이', '가')} 하나 있습니다.`
        : `재귀 깊이 ${e.depth}. ${extra} 하나만 있습니다.`;
    }
    $('lk-state-note').textContent = text;
  }

  function wordResult(shown, v, done) {
    const main = $('lk-result-main');
    const sub = $('lk-result-sub');
    const t = S.trace;
    const w = S.p.word;
    if (!done) {
      main.textContent = '아직 결과가 없습니다';
      lines(sub, [`지금까지 dfs 호출 ${v.calls}번, 표시 ${v.marks}번, 되돌리기 ${v.restores}번`]);
      return;
    }
    main.textContent = `${w} ${t.found ? '있음 (True)' : '없음 (False)'}`;
    lines(sub, [`dfs 호출 ${t.calls}번(막힌 시도 ${v.probes}번), 표시 ${v.marks}번, 되돌리기 ${v.restores}번`]);
  }

  // ==========================================
  // 선택 트리 탭 — 호출과 반환
  // ==========================================

  function targetView(shown) {
    const done = {};
    let calls = 0;
    shown.forEach((e) => {
      if (e.type === 'call') calls++;
      else done[e.id] = e;
    });
    return { done, calls };
  }

  const prefixes = (id) => { const a = []; for (let n = 1; n <= id.length; n++) a.push(id.slice(0, n)); return a; };

  function targetBoard(shown, v) {
    const nodes = S.trace.nodes;
    const e = shown[shown.length - 1];
    const cls = {}, edge = {}, hidden = {}, sub = {};
    Object.keys(nodes).forEach((id) => {
      if (!shown.some((x) => x.type === 'call' && x.id === id)) hidden[id] = true;
    });
    Object.keys(v.done).forEach((id) => {
      const d = v.done[id];
      sub[id] = String(d.count);
      if (d.type === 'leaf' && d.hit) addCls(cls, id, 'is-hit');
      if (d.type === 'prune') addCls(cls, id, 'is-dim');
    });
    let curI = -1;
    if (e) {
      const ps = prefixes(e.id);
      ps.slice(0, -1).forEach((id) => addCls(cls, id, 'is-in'));
      addCls(cls, e.id, 'is-now');
      ps.slice(1).forEach((id) => { edge[id] = 'is-now'; });
      curI = nodes[e.id].i;
    }
    K.tree($('dfs-tree'), S.trace.root, nodes, { layout: 'leaves', text: (id) => nodes[id].sum, cls, sub, hidden, edge });
    const nums = S.p.nums;
    const ncls = {};
    nums.forEach((_, i) => { if (curI >= 0 && i < curI) ncls[i] = 'is-in'; });
    if (curI >= 0 && curI < nums.length) ncls[curI] = 'is-now';
    K.array($('dfs-nums'), nums, { cls: ncls, head: 'nums' });
  }

  const sgn = (id) => (id[id.length - 1] === '+' ? '+' : '-');

  function targetNow(shown, v) {
    const e = shown[shown.length - 1];
    if (!e) return START[S.mode];
    const nums = S.p.nums, target = S.p.target, nodes = S.trace.nodes;
    if (e.type === 'call') {
      if (e.id === 'r') return `${P('dfs(0, 0)', '을', '를')} 부릅니다. 아직 숫자를 고르지 않아 합은 0입니다.`;
      const parent = nodes[e.id.slice(0, -1)];
      const pick = `${sgn(e.id)}${nums[e.i - 1]}`;
      return `합 ${parent.sum}에서 ${P(pick, '을', '를')} 골라 합이 ${e.sum}입니다. ${P(`dfs(${e.i}, ${e.sum})`, '을', '를')} 부릅니다.`;
    }
    if (e.type === 'leaf') {
      const head = `숫자를 모두 골랐고 합은 ${e.sum}입니다.`;
      return e.hit ? `${head} 목표 ${P(target, '과', '와')} 같아 ${P(1, '을', '를')} 돌려줍니다.` : `${head} 목표 ${P(target, '과', '와')} 달라 ${P(0, '을', '를')} 돌려줍니다.`;
    }
    if (e.type === 'prune') {
      const sel = sgn(e.id) === '+' ? `+${nums[e.i - 1]}` : `-${nums[e.i - 1]}`;
      const left = nums.length - e.i;
      const lead = e.id === 'r' ? '' : `${P(sel, '을', '를')} 골라 합이 ${e.sum}입니다. `;
      const reach = target > e.sum
        ? `남은 숫자 ${left}개를 모두 더해도 ${P(e.sum + e.rest, '이라', '라')} ${target}에 닿지 않아`
        : `남은 숫자 ${left}개를 모두 빼도 ${P(e.sum - e.rest, '이라', '라')} ${target}에 닿지 않아`;
      return `${lead}${reach} 더 들어가지 않고 ${P(0, '을', '를')} 돌려줍니다.`;
    }
    const n = nodes[e.id];
    const a = v.done[n.left].count, b = v.done[n.right].count;
    return `두 자식이 돌려준 ${P(a, '과', '와')} ${P(b, '을', '를')} 더해 ${P(e.count, '을', '를')} 돌려줍니다.`;
  }

  function targetState(shown, v) {
    const e = shown[shown.length - 1];
    const nodes = S.trace.nodes;
    if (!e) {
      K.chips($('lk-state'), [], '아직 부른 호출이 없습니다');
      $('lk-state-note').textContent = '';
      return;
    }
    const ps = prefixes(e.id);
    K.chips($('lk-state'), ps.map((id, i) => ({ text: String(nodes[id].sum), cls: i === ps.length - 1 ? 'is-in' : '' })), '');
    const depth = `재귀 깊이 ${ps.length}. 칩은 루트부터 합을 적었습니다.`;
    $('lk-state-note').textContent = S.mode === 'prune' ? `${depth} 남은 합 ${S.trace.rest[nodes[e.id].i]}.` : depth;
  }

  function targetResult(shown, v, done) {
    const main = $('lk-result-main');
    const sub = $('lk-result-sub');
    const t = S.trace;
    if (!done) {
      main.textContent = '아직 결과가 없습니다';
      lines(sub, [`지금까지 호출 ${v.calls}번`]);
      return;
    }
    main.textContent = `방법 ${t.ways}가지`;
    if (S.mode === 'target') { lines(sub, [`호출 ${t.calls}번, 끝까지 간 잎 ${t.leaves}개`]); return; }
    const plain = D.targetTrace(S.p.nums, S.p.target, false);
    lines(sub, [`호출 ${t.calls}번(가지치기 없이 ${plain.calls}번), 잘린 노드 ${t.pruned}개`]);
  }

  // ==========================================
  // 공통
  // ==========================================

  function render(at) {
    const shown = S.events.slice(0, at);
    const done = at >= S.events.length && at > 0;
    $('lk-board').classList.toggle('is-word', isWord());
    if (isWord()) {
      const v = wordView(shown);
      wordBoard(shown, v, done);
      wordState(shown, v);
      wordResult(shown, v, done);
      $('lk-now').textContent = wordNow(shown, v);
    } else {
      const v = targetView(shown);
      targetBoard(shown, v);
      targetState(shown, v);
      targetResult(shown, v, done);
      $('lk-now').textContent = targetNow(shown, v);
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
