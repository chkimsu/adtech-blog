/**
 * 과외 투 포인터 데모 — 화면
 *   js/lesson-two-pointers-demo.js
 *
 * 계산은 js/lesson-two-pointers-model.js 의 LessonTwoPointers, 단계 재생과 부품은 js/lesson-kit.js 의 LessonKit 이 한다.
 * 화면 상태는 「이벤트를 몇 개까지 보였나」(at) 하나이고, render(at) 가 그때마다 이벤트를 처음부터 다시 쌓아 그린다.
 * 비교 하나가 한 단계라 「다음 값」 버튼은 페이지에서 숨긴다.
 *
 * 주소 약속 — demo-lesson-two-pointers.html?embed=1&preset=<sorted|unsorted|leetcode-167>
 *   인자가 없으면 sorted 다. 블로그 글이 sorted 와 unsorted 두 주소를 iframe 으로 쓴다.
 */
(function () {
  'use strict';

  const T = window.LessonTwoPointers;
  const K = window.LessonKit;
  if (!T || !K) return;

  const $ = (id) => document.getElementById(id);
  const { list } = T;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);

  const NOTE = 'L 은 맨 왼쪽, R 은 맨 오른쪽에서 시작합니다. 두 칸의 합이 target 보다 크면 R 을 왼쪽으로, 작으면 L 을 오른쪽으로 한 칸 옮깁니다.';

  const LEGEND = [['is-now', '지금 비교하는 칸과 짝'], ['is-dim', '버린 짝'], ['is-hit', '답']];

  const SPEC = {
    modes: T.MODES,
    modeDefault: T.MODE_DEFAULT,
    presetModes: Object.keys(T.PRESETS).reduce((o, k) => { o[k] = T.MODES.slice(); return o; }, {}),
  };

  const S = { key: 'sorted', nums: [], target: 0, trace: null, events: [], player: null };

  // 해설 칸 문장 (js/demo-edu-content.js 의 lesson-two-pointers 항목이 부른다)
  window.lessonTwoPointersDescribe = (key) => T.describe(key);

  const presetLabel = (key) => `nums ${list(T.PRESETS[key].nums)}, target ${T.PRESETS[key].target}`;
  const isSorted = (a) => a.every((v, i) => i === 0 || a[i - 1] <= v);
  const totalPairs = () => S.nums.length * (S.nums.length - 1) / 2;

  function retrace() {
    const p = T.PRESETS[S.key];
    S.nums = p.nums;
    S.target = p.target;
    S.trace = T.pointerTrace(p.nums, p.target);
    S.events = S.trace.events;
  }

  function fillPresets() {
    const sel = $('lk-preset');
    sel.replaceChildren();
    Object.keys(T.PRESETS).forEach((k) => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = presetLabel(k);
      sel.appendChild(o);
    });
    sel.value = S.key;
  }

  // 입력이 바뀌면 처음부터 다시 쌓는다
  function change() {
    retrace();
    $('lk-note').textContent = NOTE;
    K.legend($('lk-legend'), LEGEND);
    $('lk-state-label').textContent = '비교한 짝';
    S.player.restart();
  }

  // ---- 이번 단계 문장 ----
  function nowText(e) {
    if (!e) return '「한 칸」을 누르면 시작합니다. 아직 비교한 짝이 없습니다.';
    const a = S.nums[e.l];
    const b = S.nums[e.r];
    const eq = `${a} + ${b} = ${e.sum}`;
    const head = `L = ${e.l}, R = ${e.r}. `;
    if (e.verdict === 'hit') {
      return `${head}${eq}, target ${P(S.target, '과', '와')} 같아 인덱스 ${P(e.l, '과', '와')} ${P(e.r, '을', '를')} 답으로 돌려줍니다.`;
    }
    const big = e.verdict === 'big';
    const last = e === S.events[S.events.length - 1];
    const gone = `${P(big ? b : a, '과', '와')} 짝이 되는 ${e.removed.length}개를 버립니다.`;
    return `${head}${P(eq, '이', '가')} ${S.target}보다 ${big ? '커서 R을 왼쪽으로' : '작아서 L을 오른쪽으로'} 옮깁니다. ${gone}` +
      (last ? ' L 과 R 이 만나 비교를 마칩니다.' : '');
  }

  // ---- 보드: 배열 ----
  function drawArray(shown) {
    const e = shown[shown.length - 1];
    const cls = {};
    const ptr = {};
    if (!e) {
      ptr[0] = 'L';
      ptr[S.nums.length - 1] = 'R';
    } else {
      const hit = e.verdict === 'hit' ? ' is-hit' : '';
      cls[e.l] = 'is-now' + hit;
      cls[e.r] = 'is-now' + hit;
      ptr[e.l] = 'L';
      ptr[e.r] = 'R';
    }
    K.array($('lk-board'), S.nums, { cls, ptr });
  }

  // ---- 보드: 짝 표 ----
  function drawGrid(shown) {
    const e = shown[shown.length - 1];
    const dim = new Set();
    shown.forEach((ev) => ev.removed.forEach(([i, j]) => dim.add(`${i},${j}`)));
    const n = S.nums.length;
    K.grid($('lk-grid'), n, n, (r, c) => {
      if (r >= c) return null;
      const c1 = [];
      if (dim.has(`${r},${c}`)) c1.push('is-dim');
      if (e && e.l === r && e.r === c) c1.push('is-now');
      if (e && e.verdict === 'hit' && e.l === r && e.r === c) c1.push('is-hit');
      return { text: String(S.nums[r] + S.nums[c]), cls: c1.join(' '), title: `인덱스 ${r}와 ${c}, ${S.nums[r]} + ${S.nums[c]}` };
    }, { rowHead: (r) => String(S.nums[r]), colHead: (c) => String(S.nums[c]) });
  }

  // ---- 상태 칸 ----
  function drawState(shown) {
    const verdictText = { big: '큼', small: '작음', hit: '같음' };
    K.chips($('lk-state'), shown.map((ev) => ({
      text: `${S.nums[ev.l]} + ${S.nums[ev.r]} = ${ev.sum} ${verdictText[ev.verdict]}`,
      cls: ev.verdict === 'hit' ? 'is-hit' : '',
    })), '아직 비교하지 않았습니다');
    const dimCount = shown.reduce((n, ev) => n + ev.removed.length, 0);
    const reason = isSorted(S.nums)
      ? '정렬돼 있어 L 보다 오른쪽 값은 모두 L 의 값 이상입니다. 합이 target 보다 큰 R 은 L 이후의 어느 값과 더해도 target 보다 커서 R 이 들어간 짝을 모두 버려도 됩니다.'
      : '정렬돼 있지 않아 L 보다 오른쪽 값이 L 의 값보다 작을 수 있습니다. 그래서 합이 크다는 사실로 R 이 들어간 짝을 모두 버리면 답까지 버릴 수 있습니다.';
    $('lk-state-note').textContent = `버린 짝은 지금까지 ${dimCount}개입니다. ${reason}`;
  }

  // ---- 결과 칸 ----
  function drawResult(shown, done) {
    const main = $('lk-result-main');
    const sub = $('lk-result-sub');
    if (!done) {
      main.textContent = '아직 답이 없습니다';
      const lost = shown.reduce((n, ev) => n + ev.removed.length, 0);
      sub.textContent = `지금까지 비교 ${shown.length}번, 버린 짝 ${lost}개`;
      return;
    }
    const ans = S.trace.answer;
    if (ans) {
      main.textContent = `${S.nums[ans[0]]} + ${S.nums[ans[1]]} = ${S.target}, 인덱스 ${P(ans[0], '과', '와')} ${ans[1]}`;
      sub.textContent = `짝 ${totalPairs()}개 가운데 비교 ${S.events.length}번`;
      return;
    }
    main.textContent = '짝을 찾지 못했습니다';
    sub.textContent = T.missText(S.nums, S.target, S.trace) || `짝 ${totalPairs()}개 가운데 비교 ${S.events.length}번, 실제로도 합이 ${P(S.target, '과', '와')} 같은 짝이 없습니다.`;
  }

  function render(at) {
    const shown = S.events.slice(0, at);
    const e = shown[shown.length - 1];
    drawArray(shown);
    drawGrid(shown);
    drawState(shown);
    drawResult(shown, at >= S.events.length && at > 0);
    $('lk-now').textContent = nowText(e);
  }

  // ==========================================
  // 시작
  // ==========================================

  const params = K.parseParams(location.search, SPEC);
  S.key = params.preset;
  fillPresets();
  S.player = K.player({ total: () => S.events.length, events: () => S.events, render });
  $('lk-preset').addEventListener('change', (ev) => {
    S.key = ev.target.value;
    change();
  });
  change();
})();
