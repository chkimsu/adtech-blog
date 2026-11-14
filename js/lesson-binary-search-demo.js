/**
 * 과외 이진 탐색 데모 — 화면
 *   js/lesson-binary-search-demo.js
 *
 * 계산은 js/lesson-binary-search-model.js 의 LessonBinarySearch, 단계 재생과 부품은 js/lesson-kit.js 의 LessonKit 이 한다.
 * 화면 상태는 「이벤트를 몇 개까지 보였나」(at) 하나이고, render(at) 가 그때마다 이벤트를 처음부터 다시 쌓아 그린다.
 * 「다음 반복」 버튼(#lk-group)은 이벤트의 group 이 같은 동안을 한 번에 넘긴다.
 *
 * 주소 약속 — demo-lesson-binary-search.html?embed=1&mode=<search|bisect|param>&preset=<PRESETS 키>
 *   인자가 없으면 search 모드의 leetcode-704 다. 입력 목록은 지금 모드에서 쓸 수 있는 입력만 보인다.
 *   블로그 글이 이 주소 넷을 iframe 으로 쓴다: search + leetcode-704, search + last-one, bisect + dup-4, param + koko-8.
 */
(function () {
  'use strict';

  const B = window.LessonBinarySearch;
  const K = window.LessonKit;
  if (!B || !K) return;

  const $ = (id) => document.getElementById(id);
  const { list } = B;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);

  const MODE_LABEL = { search: '닫힌 구간 탐색', bisect: 'bisect_left 와 bisect_right', param: '답의 범위를 좁히는 탐색' };

  const LEGEND = {
    search: [['is-window', '남은 범위'], ['is-now', '이번 mid'], ['is-dim', '버린 칸'], ['is-hit', '답']],
    bisect: [['is-window', '남은 범위 [lo, hi)'], ['is-now', 'mid'], ['is-hit', '같은 값이 놓인 칸']],
    param: [['is-now', '이번 mid 속도'], ['is-in', '답 후보'], ['is-dim', '버린 속도'], ['is-hit', '답']],
  };

  const SPEC = { modes: B.MODES, modeDefault: B.MODE_DEFAULT, presetModes: B.PRESET_MODES };

  const S = { mode: 'search', key: 'leetcode-704', p: null, trace: null, events: [], player: null };

  // 해설 칸 문장 (js/demo-edu-content.js 의 lesson-binary-search 항목이 부른다). 지금 모드로 그 입력의 결과를 적는다.
  window.lessonBinarySearchDescribe = (key) => B.describe(S.mode, key);

  const presetLabel = (key) => {
    const p = B.PRESETS[key];
    if (p.piles) return `piles ${list(p.piles)}, h ${p.h}`;
    return `nums ${list(p.nums)}, ${p.target !== undefined ? `target ${p.target}` : `x ${p.x}`}`;
  };

  const rngIdx = (a, b) => (a === b ? `${a}번 칸` : `${a}~${b}번 칸`);
  const rngSpeed = (a, b) => (a === b ? `속도 ${a}` : `속도 ${a}~${b}`);
  const addPtr = (ptr, i, label) => { ptr[i] = ptr[i] ? `${ptr[i]} ${label}` : label; };

  function note() {
    const p = S.p;
    if (S.mode === 'search') return '정렬된 배열에서 남은 범위 [left, right] 의 가운데 mid 를 봅니다. 값이 target 보다 작으면 mid 까지 왼쪽 칸을, 크면 mid 부터 오른쪽 칸을 버립니다. left 가 right 보다 커지면 반복이 끝납니다.';
    if (S.mode === 'bisect') return `반열린 구간 [lo, hi) 로 넣을 자리를 찾습니다. 인덱스 ${P(p.nums.length, '은', '는')} 배열 밖이고 hi 가 처음 가리키는 자리입니다. bisect_left 는 같은 값의 앞, bisect_right 는 같은 값의 뒤 자리를 돌려줍니다.`;
    return `속도를 이진 탐색합니다. 속도 [1, ${Math.max(...p.piles)}] 의 가운데 mid 로 다 먹는 데 걸리는 시간이 ${p.h}시간 이하면 답 후보로 두고 더 빠른 속도를 버립니다. 넘으면 mid 이하의 느린 속도를 버립니다. 찾는 것은 가장 느린 속도입니다.`;
  }

  function retrace() {
    const p = B.PRESETS[S.key];
    S.p = p;
    if (S.mode === 'search') S.trace = B.searchTrace(p.nums, p.target);
    else if (S.mode === 'bisect') S.trace = B.bisectTrace(p.nums, p.x);
    else S.trace = B.paramTrace(p.piles, p.h);
    S.events = S.trace.events;
  }

  function fillPresets() {
    const sel = $('lk-preset');
    sel.replaceChildren();
    Object.keys(B.PRESETS).filter((k) => B.PRESET_MODES[k].includes(S.mode)).forEach((k) => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = presetLabel(k);
      sel.appendChild(o);
    });
    sel.value = S.key;
  }

  function drawTabs() {
    K.tabs($('lk-tabs'), B.MODES.map((m) => ({ key: m, label: MODE_LABEL[m] })), S.mode, (m) => {
      S.mode = m;
      if (!B.PRESET_MODES[S.key].includes(m)) S.key = B.MODE_DEFAULT[m];
      change();
    });
  }

  const STATE_LABEL = { search: '남은 범위', bisect: '남은 범위 [lo, hi)', param: '더미마다 걸리는 시간' };

  // 입력이나 모드가 바뀌면 처음부터 다시 쌓는다
  function change() {
    retrace();
    fillPresets();
    drawTabs();
    $('lk-note').textContent = note();
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

  const midCount = (shown) => shown.filter((ev) => ev.type === 'mid' || ev.type === 'probe').length;

  // ==========================================
  // 닫힌 구간 탐색
  // ==========================================

  function searchRange(shown) {
    const e = shown[shown.length - 1];
    return e ? [e.left, e.right] : [0, S.p.nums.length - 1];
  }

  function searchNow(e) {
    if (!e) return '「한 칸」이나 「다음 반복」을 누르면 시작합니다.';
    const nums = S.p.nums;
    const t = S.p.target;
    if (e.type === 'mid') {
      const head = `left ${e.left}, right ${e.right}, mid ${e.mid}. nums[${e.mid}] = ${P(e.value, '이', '가')}`;
      if (e.verdict === 'hit') return `${head} ${P(t, '과', '와')} 같아 찾았습니다. 답은 인덱스 ${e.mid}입니다.`;
      if (e.verdict === 'small') return `${head} ${t}보다 작습니다. 정렬되어 있어 ${rngIdx(e.left, e.mid)}은 모두 ${t}보다 작으니 답이 될 수 없습니다.`;
      return `${head} ${t}보다 큽니다. 정렬되어 있어 ${rngIdx(e.mid, e.right)}은 모두 ${t}보다 크니 답이 될 수 없습니다.`;
    }
    const [a, b] = e.dropped;
    // 작아서 버렸으면 left 가 mid + 1 로 옮겨 가 있고, 커서 버렸으면 right 가 mid - 1 로 옮겨 가 있다
    const move = e.left === b + 1 ? `left 를 ${P(e.left, '으로', '로')}` : `right 를 ${P(e.right, '으로', '로')}`;
    const rest = e.left > e.right ? '남은 범위가 비었습니다.' : `남은 범위는 ${rngIdx(e.left, e.right)}입니다.`;
    return `${rngIdx(a, b)}을 버리고 ${move} 옮깁니다. ${rest}`;
  }

  function searchDoneText() {
    if (S.trace.answer >= 0) return ` 배열에는 답인 ${S.trace.answer}번 칸을 표시했습니다.`;
    return ` ${P(S.p.target, '은', '는')} 배열에 없어 ${P(-1, '을', '를')} 돌려줍니다.`;
  }

  function searchBoard(shown, done) {
    const e = shown[shown.length - 1];
    const n = S.p.nums.length;
    const [L, R] = searchRange(shown);
    const cls = {};
    const ptr = {};
    let range = null;
    for (let i = 0; i < n; i++) if (i < L || i > R) cls[i] = 'is-dim';
    if (done) {
      if (S.trace.answer >= 0) cls[S.trace.answer] = 'is-hit';
    } else if (e) {
      if (L <= R) range = [L, R];
      if (e.type === 'mid') {
        cls[e.mid] = `${cls[e.mid] || ''} is-now`.trim();
        addPtr(ptr, e.left, 'L');
        addPtr(ptr, e.mid, 'M');
        addPtr(ptr, e.right, 'R');
      } else {
        if (L < n) addPtr(ptr, L, 'L');
        if (R >= 0) addPtr(ptr, R, 'R');
      }
    } else {
      range = [0, n - 1];
    }
    K.array($('lk-board'), S.p.nums, { cls, ptr, range });
  }

  function searchState(shown) {
    const e = shown[shown.length - 1];
    const [L, R] = searchRange(shown);
    const items = [{ text: `left ${L}` }, { text: `right ${R}` }];
    if (e && e.type === 'mid') items.push({ text: `mid ${e.mid}`, cls: 'is-now' });
    K.chips($('lk-state'), items, '');
    $('lk-state-note').textContent = 'left 와 right 사이가 남은 범위입니다. left 가 right 보다 커지면 범위가 비어 반복이 끝납니다.';
  }

  function searchResult(shown, done) {
    const main = $('lk-result-main');
    const sub = $('lk-result-sub');
    if (!done) {
      main.textContent = '아직 답이 없습니다';
      lines(sub, [`지금까지 반복 ${midCount(shown)}번`]);
      return;
    }
    const rounds = S.events.filter((ev) => ev.type === 'mid').length;
    main.textContent = S.trace.answer >= 0 ? `인덱스 ${S.trace.answer}` : `${P(S.p.target, '은', '는')} 배열에 없어 -1`;
    lines(sub, [`반복 ${rounds}번. 앞에서부터 찾으면 비교 ${B.linearCount(S.p.nums, S.p.target)}번. 정렬된 배열이면 값이 100만 개여도 반복은 많아야 ${B.worstIterations(1000000)}번입니다.`]);
  }

  // ==========================================
  // bisect_left 와 bisect_right
  // ==========================================

  // 지금까지 보인 이벤트에서 현재 줄 (마지막 probe 의 lo, hi 와 끝난 자리)
  function bisectState(shown) {
    const st = { left: null, right: null };
    shown.forEach((ev) => { if (ev.type === 'done') st[ev.side] = ev.pos; });
    return st;
  }

  function bisectNow(e) {
    if (!e) return '「한 칸」이나 「다음 반복」을 누르면 시작합니다.';
    const x = S.p.x;
    const name = `bisect_${e.side}`;
    if (e.type === 'done') {
      const head = `lo = hi = ${e.pos}. 반복이 끝났고 ${name} 의 넣을 자리는 ${e.pos}입니다.`;
      if (e.side === 'left') return head;
      const t = S.trace;
      return head + (t.count ? ` ${x}의 개수는 ${t.right} - ${t.left} = ${t.count}입니다.` : ` ${P(x, '은', '는')} 없어 개수 0입니다.`);
    }
    const head = `${name}, lo ${e.lo}, hi ${e.hi}, mid ${e.mid}. nums[${e.mid}] = ${P(e.value, '이', '가')}`;
    if (e.side === 'left') {
      if (e.go === 'lo') return `${head} ${x}보다 작아 lo 를 ${P(e.mid + 1, '으로', '로')} 옮깁니다.`;
      if (e.value === x) return `${head} ${P(x, '과', '와')} 같아 hi 를 ${P(e.mid, '으로', '로')} 옮깁니다. 같은 값은 넣을 자리를 더 왼쪽에서 찾습니다.`;
      return `${head} ${x}보다 커 hi 를 ${P(e.mid, '으로', '로')} 옮깁니다.`;
    }
    if (e.go === 'hi') return `${head} ${x}보다 커 hi 를 ${P(e.mid, '으로', '로')} 옮깁니다.`;
    if (e.value === x) return `${head} ${P(x, '과', '와')} 같아도 lo 를 ${P(e.mid + 1, '으로', '로')} 옮깁니다. 같은 값은 넣을 자리를 더 오른쪽에서 찾습니다.`;
    return `${head} ${x}보다 작아 lo 를 ${P(e.mid + 1, '으로', '로')} 옮깁니다.`;
  }

  function bisectDoneText() {
    const t = S.trace;
    if (!t.count) return ' 두 자리가 같아 같은 값이 놓인 칸은 없습니다.';
    return ` 배열에는 같은 값이 놓인 ${rngIdx(t.left, t.right - 1)}을 표시했습니다.`;
  }

  function bisectBoard(shown, done) {
    const e = shown[shown.length - 1];
    const n = S.p.nums.length;
    const st = bisectState(shown);
    const cls = {};
    const ptr = {};
    let range = null;
    if (done) {
      for (let i = st.left; i < st.right; i++) cls[i] = 'is-hit';
      addPtr(ptr, st.left, `left ${st.left}`);
      addPtr(ptr, st.right, `right ${st.right}`);
    } else if (!e) {
      range = [0, n - 1];
      addPtr(ptr, 0, 'lo');
      addPtr(ptr, n, 'hi');
    } else if (e.type === 'probe') {
      if (e.lo < e.hi) range = [e.lo, e.hi - 1];
      cls[e.mid] = 'is-now';
      addPtr(ptr, e.lo, 'lo');
      addPtr(ptr, e.mid, 'mid');
      addPtr(ptr, e.hi, 'hi');
      if (st.left !== null) addPtr(ptr, st.left, `left ${st.left}`);
    } else {
      addPtr(ptr, e.pos, e.side === 'left' ? `left ${e.pos}` : `right ${e.pos}`);
      if (e.side === 'right' && st.left !== null) addPtr(ptr, st.left, `left ${st.left}`);
    }
    K.array($('lk-board'), S.p.nums.concat(['']), { cls, ptr, range });
    // 배열 밖 자리(인덱스 n)는 버린 칸이 아니라 상태 클래스를 걸지 않고 테두리만 점선으로 둔다. 뜻은 note() 와 페이지의 결과 읽는 법이 적는다.
    const outside = $('lk-board').querySelectorAll('.lk-cell')[n];
    if (outside) outside.style.borderStyle = 'dashed';
  }

  function bisectChips(shown) {
    const e = shown[shown.length - 1];
    const n = S.p.nums.length;
    const items = [];
    if (!e) items.push({ text: 'lo 0' }, { text: `hi ${n}` });
    else if (e.type === 'probe') items.push({ text: `lo ${e.lo}` }, { text: `hi ${e.hi}` }, { text: `mid ${e.mid}`, cls: 'is-now' });
    else items.push({ text: `lo ${e.pos}` }, { text: `hi ${e.pos}` });
    const st = bisectState(shown);
    if (st.left !== null) items.push({ text: `bisect_left ${st.left}`, cls: 'is-in' });
    if (st.right !== null) items.push({ text: `bisect_right ${st.right}`, cls: 'is-in' });
    K.chips($('lk-state'), items, '');
    $('lk-state-note').textContent = `hi 는 처음에 배열 길이 ${n}인 배열 밖 자리를 가리키고, lo 와 hi 가 같아지면 반복이 끝납니다.`;
  }

  function bisectResult(shown, done) {
    const main = $('lk-result-main');
    const sub = $('lk-result-sub');
    const st = bisectState(shown);
    if (!done) {
      main.textContent = st.left === null ? '아직 답이 없습니다' : `bisect_left ${st.left}`;
      lines(sub, [`지금까지 반복 ${midCount(shown)}번`]);
      return;
    }
    const t = S.trace;
    main.textContent = `bisect_left ${t.left}, bisect_right ${t.right}`;
    lines(sub, [t.count ? `${S.p.x}의 개수 ${t.right} - ${t.left} = ${t.count}` : `${P(S.p.x, '은', '는')} 없어 개수 0`]);
  }

  // ==========================================
  // 답의 범위를 좁히는 탐색
  // ==========================================

  // 지금까지 보인 이벤트에서 남은 범위 [left, right], 답 후보, 걸리는 시간을 본 속도
  function paramState(shown) {
    const st = { left: 1, right: Math.max(...S.p.piles), ans: null, seen: {}, mid: null };
    shown.forEach((ev) => {
      if (ev.type === 'mid') { st.seen[ev.mid] = ev.hours; st.mid = ev; }
      else { st.left = ev.left; st.right = ev.right; st.ans = ev.ans; }
    });
    return st;
  }

  const terms = (k) => S.p.piles.map((p) => Math.ceil(p / k));

  function paramNow(e) {
    if (!e) return '「한 칸」이나 「다음 반복」을 누르면 시작합니다.';
    const h = S.p.h;
    if (e.type === 'mid') {
      const tm = terms(e.mid);
      return `left ${e.left}, right ${e.right}, mid ${e.mid}. ${`속도 ${P(e.mid, '이면', '면')}`} ${tm.join(' + ')} = ${e.hours}시간이라 ${h}시간${e.ok ? ' 안입니다' : '을 넘습니다'}.`;
    }
    const [a, b] = e.dropped;
    // 시간이 안이면 right 가 mid - 1 로 옮겨 가 있고(mid + 1 = a), 넘으면 left 가 mid + 1 로 옮겨 가 있다
    if (e.right === a - 2) {
      const cut = a > b ? '버릴 속도는 더 없습니다.' : `${P(rngSpeed(a, b), '을', '를')} 버립니다.`;
      return `답 후보를 ${P(e.ans, '으로', '로')} 두고 ${cut} right 를 ${P(e.right, '으로', '로')} 옮깁니다.`;
    }
    return `${P(rngSpeed(a, b), '은', '는')} 모두 늦어 버리고 left 를 ${P(e.left, '으로', '로')} 옮깁니다.`;
  }

  function paramDoneText() {
    return ` 남은 범위가 비어 끝납니다. 열에는 답인 속도 ${P(S.trace.answer, '을', '를')} 표시했습니다.`;
  }

  function paramBoard(shown, done) {
    const e = shown[shown.length - 1];
    const n = Math.max(...S.p.piles);
    const st = paramState(shown);
    const colCls = (c) => {
      const k = c + 1;
      if (done) return k === S.trace.answer ? 'is-hit' : 'is-dim';
      const cls = [];
      if (k === st.ans) cls.push('is-in');
      else if (k < st.left || k > st.right) cls.push('is-dim');
      if (e && e.type === 'mid' && k === e.mid) cls.push('is-now');
      return cls.join(' ');
    };
    K.grid($('lk-board'), 2, n, (r, c) => {
      const k = c + 1;
      const cls = colCls(c);
      if (r === 0) return { text: String(k), cls };
      if (st.seen[k] === undefined) return null;
      return { text: String(st.seen[k]), cls, title: `속도 ${k}, ${st.seen[k]}시간` };
    }, { rowHead: (r) => (r === 0 ? '속도 k' : '걸리는 시간') });
  }

  function paramChips(shown) {
    const st = paramState(shown);
    const m = st.mid;
    const items = [];
    if (m) {
      S.p.piles.forEach((p) => items.push({ text: `${p} → ${Math.ceil(p / m.mid)}` }));
      items.push({ text: `합 ${m.hours}시간`, cls: m.ok ? 'is-in' : '' });
    }
    K.chips($('lk-state'), items, '속도를 고르기 전입니다');
    $('lk-state-note').textContent = m
      ? `속도 ${m.mid}에서 더미 하나는 올림(더미의 바나나 수 / ${m.mid})시간이 걸리고, 합이 ${S.p.h}시간 이하여야 합니다.`
      : `더미 하나는 올림(더미의 바나나 수 / 속도)시간이 걸리고, 더미 ${S.p.piles.length}개의 합이 ${S.p.h}시간 이하여야 합니다.`;
  }

  function paramResult(shown, done) {
    const main = $('lk-result-main');
    const sub = $('lk-result-sub');
    if (!done) {
      main.textContent = '아직 답이 없습니다';
      lines(sub, [`지금까지 반복 ${shown.filter((ev) => ev.type === 'mid').length}번`]);
      return;
    }
    const ans = S.trace.answer;
    const rounds = S.events.filter((ev) => ev.type === 'mid').length;
    main.textContent = `가장 느린 속도 ${ans}`;
    lines(sub, [
      `반복 ${rounds}번. 속도를 1부터 하나씩 올려 확인하면 ${ans}번째에 찾습니다.`,
      '속도가 올라도 걸리는 시간은 늘지 않아서 가운데 속도 하나로 한쪽 속도를 한꺼번에 버릴 수 있습니다.',
    ]);
  }

  // ==========================================
  // 공통
  // ==========================================

  function render(at) {
    const shown = S.events.slice(0, at);
    const e = shown[shown.length - 1];
    const done = at >= S.events.length && at > 0;
    let now;
    if (S.mode === 'search') {
      searchBoard(shown, done); searchState(shown); searchResult(shown, done);
      now = searchNow(e) + (done ? searchDoneText() : '');
    } else if (S.mode === 'bisect') {
      bisectBoard(shown, done); bisectChips(shown); bisectResult(shown, done);
      now = bisectNow(e) + (done ? bisectDoneText() : '');
    } else {
      paramBoard(shown, done); paramChips(shown); paramResult(shown, done);
      now = paramNow(e) + (done ? paramDoneText() : '');
    }
    $('lk-now').textContent = now;
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
