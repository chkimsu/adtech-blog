// ===================================================================
// 스트림 창 집계 놀이터 — js/window-demo.js
// 「광고별 최근 1시간 클릭 수」를 워터마크와 창 종류를 바꿔 가며 세어 본다.
// 클릭은 일어난 시각(이벤트 시각)과 도착한 시각이 다르다. 창은 끝나고 워터마크만큼 뒤에 닫히고,
// 그 뒤에 도착한 클릭은 그 창에서 빠진다. 워터마크를 늘리면 덜 빠지지만 값이 그만큼 묵는다.
// 숫자는 전부 가상 값이다 — 광고 9931 의 14:00~15:00 클릭 1,204건, 하루 클릭 228만 건.
// 난수는 시드 고정이라 같은 설정이면 같은 그림이 나온다. 「다시 뽑기」가 시드를 하나씩 올린다.
// ===================================================================
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const N_DAY = 2280000;            // 하루 클릭 (엔지니어링 트랙의 값)
  const PER_HOUR = 1204;            // 광고 9931 의 14:00~15:00 클릭 (배치가 세는 값)
  const T_START = 13 * 60, T_END = 16 * 60;        // 시간선: 13:00 부터 16:00 까지, 0시부터 센 분
  const WMS = [0.5, 1, 2, 5, 10, 30];               // 막대 그림의 워터마크 후보 (분)
  const BASE_SEED = 20260930;

  // 시드 고정 난수 (mulberry32)
  function rng(seed) {
    let a = seed | 0;
    return function () {
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // 도착 지연 분포 (초). 2분 안에 오는 99.9% 는 5초 안 95%, 5초~2분 4.9% 로 나뉜다.
  // 늦는 비율(pLate)이 슬라이더 값이고, 늦는 것은 2~10분, 10~30분, 30분~2시간에 6:2:2 로 퍼진다.
  function groups(pLate) {
    const base = (1 - pLate) / 0.999;
    return [
      [0.95 * base, 0, 5], [0.049 * base, 5, 120],
      [pLate * 0.6, 120, 600], [pLate * 0.2, 600, 1800], [pLate * 0.2, 1800, 7200],
    ];
  }
  // 지연이 wm 초를 넘을 확률 — 구간 안은 고르게 퍼져 있다고 본다
  function pLater(pLate, wmSec) {
    return groups(pLate).reduce((acc, [share, lo, hi]) => {
      const f = wmSec <= lo ? 1 : wmSec >= hi ? 0 : (hi - wmSec) / (hi - lo);
      return acc + share * f;
    }, 0);
  }
  function sampleDelay(r, pLate) {
    let u = r();
    for (const [share, lo, hi] of groups(pLate)) {
      if (u < share) return lo + r() * (hi - lo);
      u -= share;
    }
    return 7200;
  }

  // 클릭을 만든다 — 14:00~15:00 에는 정확히 1,204건, 나머지 두 시간에는 같은 비율로
  function gen(seed, pLate) {
    const r = rng(seed);
    const ev = [];
    for (let i = 0; i < PER_HOUR; i++) ev.push({ t: 840 + r() * 60, d: sampleDelay(r, pLate) });
    const outside = Math.round(PER_HOUR * (T_END - T_START - 60) / 60);
    for (let i = 0; i < outside; i++) {
      const u = r() * (T_END - T_START - 60);
      ev.push({ t: u < 60 ? T_START + u : 900 + (u - 60), d: sampleDelay(r, pLate) });
    }
    ev.sort((a, b) => a.t - b.t);
    return ev;
  }

  const state = { wm: 2, late: 0.1, req: 7, win: 'sliding', seed: BASE_SEED, events: [] };

  function compute() {
    const { wm, req, win, events } = state;
    const tReq = 900 + req;                       // 요청 시각 (분)
    let e;                                        // 읽을 수 있는 가장 최근 창의 끝
    if (win === 'tumbling') e = tReq - wm >= 900 ? 900 : 840;
    else e = Math.floor(tReq - wm);
    const s = e - 60;
    const inWin = events.filter(x => x.t >= s && x.t < e);
    const counted = inWin.filter(x => x.t + x.d / 60 <= e + wm);
    const pl = pLater(state.late / 100, wm * 60);
    return { s, e, tReq, truth: inWin.length, counted: counted.length, stale: tReq - e, daily: N_DAY * pl, pl };
  }

  const pad = n => String(n).padStart(2, '0');
  const hm = m => `${pad(Math.floor(m / 60))}:${pad(Math.round(m % 60))}`;
  const fmt = n => Math.round(n).toLocaleString('ko-KR');
  const fmtMin = m => (Math.round(m * 10) / 10).toLocaleString('ko-KR');

  // ---------- 그림 1: 시간선 위의 클릭 ----------
  function drawTimeline(res) {
    const W = 880, H = 330, L = 60, R = 860, TOP = 40, BOT = 270;
    const X = m => L + (m - T_START) / (T_END - T_START) * (R - L);
    const Y = sec => BOT - Math.log10(sec + 1) / Math.log10(7201) * (BOT - TOP);
    const { s, e, tReq } = res;
    const wmSec = state.wm * 60;
    let g = '';
    // 눈금 — 지연 (세로), 시각 (가로)
    [[0, '0초'], [10, '10초'], [60, '1분'], [600, '10분'], [3600, '1시간']].forEach(([sec, lb]) => {
      g += `<line class="wn-grid" x1="${L}" y1="${Y(sec)}" x2="${R}" y2="${Y(sec)}"/><text class="wn-ax" x="${L - 8}" y="${Y(sec) + 4}" text-anchor="end">${lb}</text>`;
    });
    for (let m = T_START; m <= T_END; m += 30) {
      g += `<line class="wn-grid" x1="${X(m)}" y1="${TOP}" x2="${X(m)}" y2="${BOT}"/><text class="wn-ax" x="${X(m)}" y="${BOT + 18}" text-anchor="middle">${hm(m)}</text>`;
    }
    g += `<text class="wn-ax" x="${L}" y="${TOP - 18}">도착 지연 (초, 눈금은 10배씩)</text>`;
    g += `<text class="wn-ax" x="${R}" y="${BOT + 34}" text-anchor="end">클릭이 일어난 시각</text>`;
    // 읽는 창
    g += `<rect class="wn-win" x="${X(s)}" y="${TOP}" width="${X(e) - X(s)}" height="${BOT - TOP}"/>`;
    g += `<text class="wn-lb" x="${(X(s) + X(e)) / 2}" y="${TOP + 14}" text-anchor="middle">읽는 창 ${hm(s)}~${hm(e)}</text>`;
    // 창이 닫히는 경계 — 창 끝 + 워터마크보다 늦게 도착하면 빠진다. 창 앞쪽 클릭은 그만큼 더 늦어도 된다
    let path = '';
    for (let i = 0; i <= 40; i++) {
      const t = s + (e - s) * i / 40;
      const lim = (e - t) * 60 + wmSec;
      path += (i ? 'L' : 'M') + X(t).toFixed(1) + ',' + Y(lim).toFixed(1);
    }
    g += `<path class="wn-cut" d="${path}"/>`;
    // 라벨은 창 끝 선의 왼쪽을 먼저 쓴다 — 오른쪽에는 요청 세로선이 바로 붙어 글자가 스친다
    const cutRight = X(e) - 6 - 190 >= L;
    g += `<text class="wn-lb b" x="${cutRight ? X(e) - 6 : X(e) + 6}" y="${Y(wmSec) - 7}"${cutRight ? ' text-anchor="end"' : ''}>이 선 위는 창 닫힌 뒤 도착</text>`;
    // 요청 시각
    g += `<line class="wn-req" x1="${X(tReq)}" y1="${TOP}" x2="${X(tReq)}" y2="${BOT}"/>`;
    const reqRight = X(tReq) + 5 + 80 > R;
    g += `<text class="wn-lb b" x="${reqRight ? X(tReq) - 5 : X(tReq) + 5}" y="${BOT - 6}"${reqRight ? ' text-anchor="end"' : ''}>요청 ${hm(tReq)}</text>`;
    // 점 — 창 밖, 창 안, 빠진 것 순서로 그린다
    const out = [], inn = [], late = [];
    state.events.forEach(x => {
      const c = `<circle cx="${X(x.t).toFixed(1)}" cy="${Y(x.d).toFixed(1)}" r="2.3"`;
      if (x.t < s || x.t >= e) out.push(c + ' class="wn-pt out"/>');
      else if (x.t + x.d / 60 <= e + wmSec / 60) inn.push(c + ' class="wn-pt in"/>');
      else late.push(c + ' class="wn-pt late"/>');
    });
    g += out.join('') + inn.join('') + late.join('');
    $('wn-timeline').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="클릭이 일어난 시각을 가로로, 도착 지연을 세로로 놓은 산점도. 읽는 창이 색칠돼 있고 창이 닫힌 뒤 도착한 클릭이 벽돌색으로 표시된다">${g}</svg>`;
  }

  // ---------- 그림 2: 워터마크마다 하루에 빠지는 클릭 ----------
  function drawBars() {
    const W = 880, H = 260, L = 70, R = 860, TOP = 36, BOT = 200;
    const list = WMS.includes(state.wm) ? WMS.slice() : WMS.concat([state.wm]).sort((a, b) => a - b);
    const bw = (R - L) / list.length;
    const Y = v => BOT - Math.max(0, Math.min(1, (Math.log10(Math.max(v, 1)) - 1) / 5)) * (BOT - TOP);
    let g = '';
    [[10, '10'], [100, '100'], [1000, '1천'], [10000, '1만'], [100000, '10만'], [1000000, '100만']].forEach(([v, lb]) => {
      g += `<line class="wn-grid" x1="${L}" y1="${Y(v)}" x2="${R}" y2="${Y(v)}"/><text class="wn-ax" x="${L - 8}" y="${Y(v) + 4}" text-anchor="end">${lb}</text>`;
    });
    g += `<text class="wn-ax" x="${L}" y="${TOP - 16}">하루에 워터마크보다 늦게 도착하는 클릭 (건, 눈금은 10배씩)</text>`;
    list.forEach((wm, i) => {
      const v = N_DAY * pLater(state.late / 100, wm * 60);
      const x = L + bw * i + bw * 0.2, w = bw * 0.6;
      const cur = wm === state.wm;
      g += `<rect class="wn-bar${cur ? ' cur' : ''}" x="${x}" y="${Y(v)}" width="${w}" height="${BOT - Y(v)}"/>`;
      g += `<text class="wn-lb${cur ? ' b' : ''}" x="${x + w / 2}" y="${Y(v) - 6}" text-anchor="middle">${fmt(v)}</text>`;
      g += `<text class="wn-ax" x="${x + w / 2}" y="${BOT + 18}" text-anchor="middle">${fmtMin(wm)}분</text>`;
      g += `<text class="wn-ax" x="${x + w / 2}" y="${BOT + 34}" text-anchor="middle">${fmtMin(wm)}분 뒤 확정</text>`;
    });
    $('wn-bars').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="워터마크 값마다 하루에 창에서 빠지는 클릭 수 막대. 워터마크가 길수록 막대가 낮아지고 값이 늦게 확정된다">${g}</svg>`;
  }

  function render() {
    state.wm = +$('wn-wm').value;
    state.late = +$('wn-late').value;
    state.req = +$('wn-req').value;
    $('wn-wm-val').textContent = fmtMin(state.wm) + '분';
    $('wn-late-val').textContent = state.late.toFixed(2) + '%';
    $('wn-req-val').textContent = hm(900 + state.req);
    if (!state.events.length || state.genLate !== state.late || state.genSeed !== state.seed) {
      state.events = gen(state.seed, state.late / 100);
      state.genLate = state.late; state.genSeed = state.seed;
    }
    const res = compute();
    $('wn-window').textContent = `${hm(res.s)}~${hm(res.e)}`;
    $('wn-window-sub').textContent = `요청 ${hm(res.tReq)} 보다 ${fmtMin(res.stale)}분 전 값입니다`;
    $('wn-count').textContent = `${fmt(res.counted)} / ${fmt(res.truth)}`;
    $('wn-count-sub').textContent = res.truth === res.counted ? '이 창에서는 놓친 클릭이 없습니다' : `늦게 와서 놓친 클릭 ${fmt(res.truth - res.counted)}건`;
    $('wn-daily').textContent = fmt(res.daily) + '건';
    $('wn-daily-sub').textContent = `하루 228만 건의 ${(res.pl * 100).toFixed(2)}% 가 창이 닫힌 뒤에 도착합니다`;
    $('wn-count').className = 'wn-metric-value ' + (res.truth === res.counted ? 'good' : 'warn');

    let v;
    if (state.wm === 0) v = `워터마크 0분이면 창이 끝나자마자 닫힙니다. 값은 가장 빠르지만 하루 ${fmt(res.daily)}건이 빠집니다.`;
    else v = `워터마크 ${fmtMin(state.wm)}분이면 하루 ${fmt(res.daily)}건(${(res.pl * 100).toFixed(2)}%)이 창에서 빠지고, 값은 ${fmtMin(res.stale)}분 묵습니다.`;
    v += state.win === 'tumbling'
      ? ' 텀블링 창은 요청 시각에 따라 최대 60분까지 더 묵습니다. 요청 시각 슬라이더를 15:59 로 밀어 보십시오.'
      : ' 슬라이딩 창은 1분마다 나오므로 묵는 시간이 워터마크와 1분 안입니다.';
    $('wn-verdict').textContent = v;

    document.querySelectorAll('.wn-win-btn').forEach(b => b.classList.toggle('active', b.dataset.win === state.win));
    drawTimeline(res);
    drawBars();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('wn-timeline')) return;
    ['wn-wm', 'wn-late', 'wn-req'].forEach(id => $(id).addEventListener('input', render));
    document.querySelectorAll('.wn-win-btn').forEach(b => b.addEventListener('click', () => { state.win = b.dataset.win; render(); }));
    document.querySelectorAll('.wn-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const [wm, late, req, win] = btn.dataset.preset.split(',');
        $('wn-wm').value = wm; $('wn-late').value = late; $('wn-req').value = req; state.win = win;
        render();
      });
    });
    $('wn-reseed').addEventListener('click', () => { state.seed += 1; render(); });
    render();
  });
})();
