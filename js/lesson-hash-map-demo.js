/**
 * 과외 해시 맵 데모 — 화면
 *   js/lesson-hash-map-demo.js
 *
 * 계산은 js/lesson-hash-map-model.js 의 LessonHashMap, 단계 재생과 부품은 js/lesson-kit.js 의 LessonKit 이 한다.
 * 화면 상태는 「이벤트를 몇 개까지 보였나」(at) 하나이고, render(at) 가 그때마다 이벤트를 처음부터 다시 쌓아 그린다.
 *
 * 주소 약속 — demo-lesson-hash-map.html?embed=1&mode=<seen|brute|prefill>&preset=<PRESETS 키>
 *   인자가 없으면 seen 모드의 two-sum 이다. 블로그 글이 이 주소 셋을 iframe 으로 쓴다:
 *   brute + late-pair, seen + two-sum, prefill + self-pair.
 */
(function () {
  'use strict';

  const H = window.LessonHashMap;
  const K = window.LessonKit;
  if (!H || !K) return;

  const $ = (id) => document.getElementById(id);
  const { list } = H;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);

  const MODE_LABEL = { seen: 'seen 한 번 순회', brute: '이중 for 문', prefill: '먼저 다 적는 풀이' };

  const NOTE = {
    seen: '값마다 짝 target - num 이 seen 에 있나 확인하고, 없으면 num → i 를 seen 에 적습니다.',
    brute: '두 인덱스 i < j 의 조합을 앞에서부터 하나씩 골라 nums[i] + nums[j] 가 target 인지 보고, 답을 찾으면 멈춥니다.',
    prefill: '순서를 바꿉니다. 먼저 모든 값을 seen 에 적고, 그다음 값마다 짝을 확인합니다. 짝이 자기 자신이면 같은 칸을 두 번 씁니다.',
  };

  const STATE_NOTE = {
    seen: '숫자를 키로, 그 숫자가 있던 인덱스를 값으로 적습니다. 짝을 확인한 뒤에 지금 값을 적습니다.',
    prefill: '시작할 때 모든 숫자를 적습니다. 지금 값도 이미 들어 있어서 짝이 자기 자신으로 나올 수 있습니다.',
  };

  const LEGEND = {
    seen: [['is-now', '지금 보는 값'], ['is-in', 'seen 에 적힌 값'], ['is-hit', '찾은 짝']],
    brute: [['is-now', '비교하는 칸'], ['is-dim', 'i 로 끝낸 칸'], ['is-hit', '답']],
    prefill: [['is-now', '지금 보는 값'], ['is-in', 'seen 에 적힌 값'], ['is-hit', '찾은 짝'], ['is-bad', '두 번 쓴 칸']],
  };

  const SPEC = {
    modes: H.MODES,
    modeDefault: H.MODE_DEFAULT,
    presetModes: Object.keys(H.PRESETS).reduce((o, k) => { o[k] = H.MODES.slice(); return o; }, {}),
  };

  const S = { mode: 'seen', key: 'two-sum', nums: [], target: 0, trace: null, events: [], player: null };

  // 해설 칸 문장 (js/demo-edu-content.js 의 lesson-hash-map 항목이 부른다). 지금 모드로 그 입력의 결과를 적는다.
  window.lessonHashMapDescribe = (key) => H.describe(S.mode, key);

  const presetLabel = (key) => `nums ${list(H.PRESETS[key].nums)}, target ${H.PRESETS[key].target}`;

  function retrace() {
    const p = H.PRESETS[S.key];
    S.nums = p.nums;
    S.target = p.target;
    if (S.mode === 'seen') S.trace = H.seenTrace(p.nums, p.target);
    else if (S.mode === 'brute') S.trace = H.bruteTrace(p.nums, p.target);
    else S.trace = H.prefillTrace(p.nums, p.target);
    S.events = S.trace.events;
  }

  function fillPresets() {
    const sel = $('lk-preset');
    sel.replaceChildren();
    Object.keys(H.PRESETS).forEach((k) => {
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
      change();
    });
  }

  // 입력이나 모드가 바뀌면 처음부터 다시 쌓는다
  function change() {
    retrace();
    drawTabs();
    $('lk-note').textContent = NOTE[S.mode];
    K.legend($('lk-legend'), LEGEND[S.mode]);
    $('lk-state-label').textContent = S.mode === 'brute' ? '비교한 조합' : 'seen (숫자 → 인덱스)';
    S.player.restart();
  }

  // ---- 이번 단계 문장 ----
  function nowText(e) {
    if (!e) return '「한 칸」이나 「다음 값」을 누르면 시작합니다.';
    const T = S.target;
    if (e.type === 'pair') {
      const eq = `${S.nums[e.i]} + ${S.nums[e.j]} = ${e.sum}`;
      return e.hit
        ? `i = ${e.i}, j = ${e.j}. ${eq}, target ${P(T, '과', '와')} 같아 ${P(list([e.i, e.j]), '을', '를')} 돌려줍니다.`
        : `i = ${e.i}, j = ${e.j}. ${eq}, target ${P(T, '과', '와')} 다릅니다.`;
    }
    if (e.type === 'fill') return `i = ${e.i}, num = ${e.num}. seen 에 ${e.num} → ${P(e.i, '을', '를')} 적습니다.`;
    if (e.type === 'store') return `seen 에 ${e.num} → ${P(e.i, '을', '를')} 적습니다.`;
    const head = `i = ${e.i}, num = ${e.num}. 짝 ${T} - ${e.num} = `;
    if (!e.hit) return `${head}${P(e.need, '이', '가')} seen 에 없습니다.`;
    const at = e.seen.find(([k]) => k === e.need)[1];
    const self = S.mode === 'prefill' && at === e.i;
    return `${head}${P(e.need, '이', '가')} seen 에 있어 ${P(list([at, e.i]), '을', '를')} 돌려줍니다.` +
      (self ? ` ${at}번 칸의 ${P(e.num, '을', '를')} 두 번 쓴 틀린 답입니다.` : '');
  }

  // ---- 보드 ----
  function drawBoard(shown) {
    const e = shown[shown.length - 1];
    const cls = {};
    const ptr = {};
    if (S.mode === 'brute') {
      if (e) {
        for (let i = 0; i < e.i; i++) cls[i] = 'is-dim';
        cls[e.i] = 'is-now' + (e.hit ? ' is-hit' : '');
        cls[e.j] = 'is-now' + (e.hit ? ' is-hit' : '');
        ptr[e.i] = 'i';
        ptr[e.j] = 'j';
      }
    } else {
      shown.forEach((ev) => { if (ev.type === 'store' || ev.type === 'fill') cls[ev.i] = 'is-in'; });
      if (e) {
        ptr[e.i] = 'i';
        if (e.type === 'look') {
          cls[e.i] = (cls[e.i] ? cls[e.i] + ' ' : '') + 'is-now';
          if (e.hit) {
            const at = e.seen.find(([k]) => k === e.need)[1];
            if (at === e.i) cls[e.i] += ' is-bad';
            else cls[at] = (cls[at] ? cls[at] + ' ' : '') + 'is-hit';
          }
        }
      }
    }
    K.array($('lk-board'), S.nums, { cls, ptr });
  }

  // ---- 상태 칸 ----
  function drawState(shown) {
    const e = shown[shown.length - 1];
    const chipsEl = $('lk-state');
    const note = $('lk-state-note');
    if (S.mode === 'brute') {
      const row = shown.filter((ev) => e && ev.i === e.i);
      K.chips(chipsEl, row.map((ev) => ({
        text: `${S.nums[ev.i]} + ${S.nums[ev.j]} = ${ev.sum}`,
        cls: ev.hit ? 'is-hit' : '',
      })), '아직 비교하지 않았습니다');
      note.textContent = `지금까지 비교한 조합은 ${shown.length}개입니다. 칸에는 지금 i 로 만든 조합만 보입니다.`;
      return;
    }
    // 찾은 짝의 칩은 답(is-hit)이고, 먼저 다 적는 풀이에서 자기 자신을 찾았으면 틀린 답(is-bad)이다
    const at = e && e.type === 'look' && e.hit ? e.seen.find(([kk]) => kk === e.need)[1] : -1;
    const items = e ? e.seen.map(([k, v]) => {
      let c = '';
      if (e.type === 'look' && e.hit && k === e.need) c = (S.mode === 'prefill' && at === e.i) ? 'is-bad' : 'is-hit';
      else if ((e.type === 'store' || e.type === 'fill') && k === e.num) c = 'is-in';
      return { text: `${k} → ${v}`, cls: c };
    }) : [];
    K.chips(chipsEl, items, '비어 있음');
    note.textContent = STATE_NOTE[S.mode];
  }

  // ---- 결과 칸 ----
  function drawResult(shown, done) {
    const main = $('lk-result-main');
    const sub = $('lk-result-sub');
    const p = H.PRESETS[S.key];
    const sCount = H.seenTrace(p.nums, p.target).checks;
    const bCount = H.bruteTrace(p.nums, p.target).comparisons;
    if (!done) {
      K.chips(main, [], '아직 답이 없습니다');
      if (S.mode === 'brute') sub.textContent = `지금까지 이중 for 문 비교 ${shown.length}번`;
      else if (S.mode === 'seen') sub.textContent = `지금까지 seen 확인 ${shown.filter((ev) => ev.type === 'look').length}번`;
      else sub.textContent = `적은 값 ${shown.filter((ev) => ev.type === 'fill').length}개, 확인 ${shown.filter((ev) => ev.type === 'look').length}번`;
      return;
    }
    const ans = S.trace.answer;
    const counts = `seen 확인 ${sCount}번, 이중 for 문 비교 ${bCount}번`;
    if (!ans.length) {
      K.chips(main, [{ text: '[]', cls: 'is-dim' }]);
      sub.textContent = `답이 없어 빈 목록을 돌려줍니다. ${counts}`;
      return;
    }
    const self = S.mode === 'prefill' && ans[0] === ans[1];
    K.chips(main, [{ text: list(ans), cls: self ? 'is-bad' : 'is-hit' }]);
    if (S.mode !== 'prefill') { sub.textContent = counts; return; }
    const right = H.seenTrace(p.nums, p.target).answer;
    sub.textContent = self
      ? `${ans[0]}번 칸의 ${P(p.nums[ans[0]], '을', '를')} 두 번 썼으므로 틀린 답입니다. 순서대로 확인한 뒤 적으면 ${list(right)} 입니다.`
      : `서로 다른 두 칸이라 맞는 답입니다. 순서대로 확인한 뒤 적으면 ${list(right)} 입니다.`;
  }

  function render(at) {
    const shown = S.events.slice(0, at);
    const e = shown[shown.length - 1];
    drawBoard(shown);
    drawState(shown);
    drawResult(shown, at >= S.events.length && at > 0);
    $('lk-now').textContent = nowText(e);
  }

  // ==========================================
  // 시작
  // ==========================================

  const params = K.parseParams(location.search, SPEC);
  S.mode = params.mode;
  S.key = params.preset;
  fillPresets();
  S.player = K.player({ total: () => S.events.length, events: () => S.events, render });
  $('lk-preset').addEventListener('change', (ev) => {
    S.key = ev.target.value;
    change();
  });
  change();
})();
