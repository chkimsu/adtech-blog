// ===================================================================
// 증분 4분면 — js/uplift-quadrant-demo.js
//
// 가상 유저 2,000명을 네 부류로 섞어 (pCVR, uplift) 평면에 뿌리고,
// pCVR 순으로 고른 경우와 uplift 순으로 고른 경우의 Qini 곡선을 겹쳐 그린다.
//
// 그림은 전부 인라인 SVG 다. canvas 가 아니므로 var(--...) 가 그대로 먹고
// hex 폴백 상수가 하나도 없다. 그래도 테마가 바뀌면 다시 그리게 해 뒀다
// (브라우저가 계산값을 붙들고 있는 경우를 대비한 안전장치. 비용은 1프레임).
//
// 난수를 쓰지 않는다. 층화(u) + 서로소 걸음 순열(v) 로 좌표를 만들어
// 같은 슬라이더 값이면 언제나 같은 그림이 나오고, 부류별 평균이 딱 맞는다.
// 그래서 기본값에서 노출군 CVR 3.00% · 대조군 2.50% · 증분 +0.50%p 로
// 글(posts/uplift-incrementality.md)의 값과 소수점까지 같다.
// ===================================================================
(function () {
  'use strict';

  // ---------- 고정 상수 ----------
  const N = 2000;      // 화면의 점 개수
  const RATIO = 200;   // 점 1개 = 실제 200명 → 2,000점 = 40만 명(글의 노출군)
  const COST = 120;    // 도달 1명당 광고비(원)

  // 부류별 확률 구간. p0 = 광고를 안 봤을 때 구매 확률, tau = 증분(uplift).
  // 기본 비율 12 / 22 / 4 / 62 에서 평균 p0 = 2.50%, 평균 tau = +0.50%p 가 되도록 맞췄다.
  const PROFILE = {
    per: { p0: [0.00300, 0.01700], tau: [0.02550, 0.07750] },   // 설득 가능
    sure: { p0: [0.05000, 0.14000], tau: [-0.00400, 0.00400] },  // 확실 구매
    dog: { p0: [0.03500, 0.06500], tau: [-0.04900, -0.01000] },  // 청개구리
    lost: { p0: [0.00030, 0.00260323], tau: [-0.00250, 0.00250] } // 무관심
  };
  // 증분이 p0 보다 크게 음수면 p1 = p0 + tau 가 음수가 된다 — 확률이 아니게 된다.
  // 청개구리와 무관심은 그래서 tau 를 p0 과 거꾸로 묶는다(아래 w). 그 상태에서
  // 네 부류 모두 p1 이 0 보다 크다는 것을 격자로 확인했다.
  const FLIP = { dog: 1, lost: 1 };
  const KINDS = ['per', 'sure', 'dog', 'lost'];

  // 축 범위는 슬라이더를 움직여도 안 바꾼다. 그래야 앞뒤 그림을 눈으로 비교할 수 있다.
  const X_MAX = 0.16;          // pCVR 축 최대 (제곱근 눈금)
  const Y_HI = 0.088, Y_LO = -0.062;  // uplift 축 — 위아래로 칸 이름 자리를 남긴다

  // ---------- 작은 도구 ----------
  const $ = (id) => document.getElementById(id);
  const comma = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const won = (n) => '₩' + comma(n);
  const pct = (x, d) => (x * 100).toFixed(d == null ? 2 : d) + '%';
  // -0.00%p 가 찍히지 않게 반올림 뒤에 부호를 붙인다
  const pp = (x) => {
    const v = Math.abs(x * 100) < 0.005 ? 0 : x * 100;
    return (v >= 0 ? '+' : '') + v.toFixed(2) + '%p';
  };
  const r1 = (v) => Math.round(v * 10) / 10;

  // 0..n-1 을 한 번씩 쓰는 순열. 난수가 아니라 고정된 식으로 정렬하므로
  // 같은 n 이면 언제나 같은 순서가 나온다. 순열이라 평균이 정확히 0.5 다.
  // 걸음 폭(i·step mod n) 방식도 평균은 맞지만 점이 격자 무늬로 줄지어 보인다.
  function shuffled(n) {
    const key = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
    const idx = Array.from({ length: n }, (_, i) => i);
    idx.sort((a, b) => key(a) - key(b) || a - b);
    return idx;
  }

  // ---------- 좌표 변환 ----------
  const SC = { w: 620, h: 432, l: 58, r: 16, t: 28, b: 56 };
  const SC_W = SC.w - SC.l - SC.r, SC_H = SC.h - SC.t - SC.b;
  const SQ_MAX = Math.sqrt(X_MAX);
  const sx = (p1) => SC.l + SC_W * Math.sqrt(Math.max(0, p1)) / SQ_MAX;
  const sy = (tau) => SC.t + SC_H * (Y_HI - tau) / (Y_HI - Y_LO);

  const QC = { w: 620, h: 432, l: 66, r: 16, t: 28, b: 56 };
  const QC_W = QC.w - QC.l - QC.r, QC_H = QC.h - QC.t - QC.b;

  // 점 모양 — 색만으로 부류를 가르지 않는다(원·네모·삼각·작은네모)
  const MARK = {
    per: (x, y) => 'M' + r1(x - 2.5) + ' ' + r1(y) + 'a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0',
    sure: (x, y) => 'M' + r1(x - 2.2) + ' ' + r1(y - 2.2) + 'h4.4v4.4h-4.4z',
    dog: (x, y) => 'M' + r1(x) + ' ' + r1(y + 2.7) + 'l2.8-4.7h-5.6z',
    lost: (x, y) => 'M' + r1(x - 1.2) + ' ' + r1(y - 1.2) + 'h2.4v2.4h-2.4z'
  };
  const KIND_COLOR = {
    per: 'var(--series-1)', sure: 'var(--series-6)',
    dog: 'var(--series-2)', lost: 'var(--series-3)'
  };

  // ---------- 상태 ----------
  let pop = null;    // { users, counts, byPcvr, byUplift, sumP0, sumP1, sumTau }
  let mode = 'uplift';
  let frame = 0;

  // ---------- 모집단 만들기 ----------
  function buildPopulation(sPer, sSure, sDog) {
    const counts = {
      per: Math.round(N * sPer),
      sure: Math.round(N * sSure),
      dog: Math.round(N * sDog),
      lost: 0
    };
    counts.lost = N - counts.per - counts.sure - counts.dog;

    const users = [];
    for (const kind of KINDS) {
      const n = counts[kind];
      if (n <= 0) continue;
      const perm = shuffled(n);
      const P = PROFILE[kind];
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n;                    // 층화 — 평균이 정확히 0.5
        const v = (perm[i] + 0.5) / n;              // 순열 — 평균이 정확히 0.5, u 와 어긋남
        const p0 = P.p0[0] + (P.p0[1] - P.p0[0]) * u;
        // 원래 살 마음이 컸던 사람일수록(p0 큼) 광고를 봤을 때 잃는 것도 크게.
        // u·v 둘 다 평균이 정확히 0.5 라 1 에서 빼도 평균은 0.5 — 합계가 안 어긋난다.
        const w = FLIP[kind] ? 1 - (0.45 * u + 0.55 * v) : v;
        const tau = P.tau[0] + (P.tau[1] - P.tau[0]) * w;
        const p1 = p0 + tau;
        users.push({
          kind: kind, p0: p0, tau: tau, p1: p1,
          d: MARK[kind](sx(p1), sy(tau))
        });
      }
    }

    let sumP0 = 0, sumP1 = 0, sumTau = 0;
    for (const u of users) { sumP0 += u.p0; sumP1 += u.p1; sumTau += u.tau; }

    const order = (key) => {
      const idx = users.map((_, i) => i);
      idx.sort((a, b) => users[b][key] - users[a][key] || a - b);
      const inc = [0], rep = [0];
      let ci = 0, cr = 0;
      for (const i of idx) { ci += users[i].tau; cr += users[i].p1; inc.push(ci); rep.push(cr); }
      return { idx: idx, inc: inc, rep: rep };
    };

    pop = {
      users: users, counts: counts,
      byPcvr: order('p1'), byUplift: order('tau'),
      sumP0: sumP0, sumP1: sumP1, sumTau: sumTau
    };
  }

  // 정규화 AUUC — 글 7절과 같은 식(사다리꼴 넓이 ÷ (전체 인원 × 전체 증분)). 랜덤이 0.5000.
  function auuc(cum) {
    const total = cum[cum.length - 1];
    if (Math.abs(total) < 1e-12) return null;
    let area = 0;
    for (let i = 0; i < cum.length - 1; i++) area += (cum[i] + cum[i + 1]) / 2;
    return area / (N * total);
  }

  // ---------- 산점도 ----------
  function drawScatter(k, meanP1) {
    const sel = mode === 'pcvr' ? pop.byPcvr : pop.byUplift;
    const picked = new Uint8Array(N);
    for (let i = 0; i < k; i++) picked[sel.idx[i]] = 1;

    const on = { per: [], sure: [], dog: [], lost: [] };
    const off = { per: [], sure: [], dog: [], lost: [] };
    for (let i = 0; i < pop.users.length; i++) {
      const u = pop.users[i];
      (picked[i] ? on : off)[u.kind].push(u.d);
    }

    const px0 = SC.l, px1 = SC.w - SC.r, py0 = SC.t, py1 = SC.h - SC.b;
    const zeroY = sy(0), avgX = sx(meanP1);
    let s = '';

    // 우하 칸(pCVR 높은데 증분 0 이하)만 옅게 칠해 "돈이 새는 칸"을 표시
    s += '<rect x="' + r1(avgX) + '" y="' + r1(zeroY) + '" width="' + r1(px1 - avgX) +
      '" height="' + r1(py1 - zeroY) + '" style="fill:var(--oxide-bg)"/>';

    // 눈금선
    const xt = [0.002, 0.01, 0.03, 0.06, 0.10, 0.14];
    const xtLabel = ['0.2%', '1%', '3%', '6%', '10%', '14%'];
    for (let i = 0; i < xt.length; i++) {
      const x = r1(sx(xt[i]));
      s += '<line x1="' + x + '" y1="' + py0 + '" x2="' + x + '" y2="' + py1 +
        '" style="stroke:var(--rule2); stroke-width:1"/>';
      s += '<text x="' + x + '" y="' + (py1 + 18) + '" text-anchor="middle" class="uq-tick">' + xtLabel[i] + '</text>';
    }
    const yt = [-0.06, -0.04, -0.02, 0, 0.02, 0.04, 0.06, 0.08];
    for (const t of yt) {
      const y = r1(sy(t));
      s += '<line x1="' + px0 + '" y1="' + y + '" x2="' + px1 + '" y2="' + y +
        '" style="stroke:' + (t === 0 ? 'var(--rule)' : 'var(--rule2)') + '; stroke-width:' + (t === 0 ? 1.6 : 1) + '"/>';
      s += '<text x="' + (px0 - 8) + '" y="' + (y + 4) + '" text-anchor="end" class="uq-tick">' +
        (t > 0 ? '+' : '') + (t * 100).toFixed(0) + '</text>';
    }

    // 평균 pCVR 세로선 = 4분면을 가르는 축
    s += '<line x1="' + r1(avgX) + '" y1="' + py0 + '" x2="' + r1(avgX) + '" y2="' + py1 +
      '" style="stroke:var(--rule); stroke-width:1.6"/>';

    // 점 — 안 뽑힌 것 먼저, 뽑힌 것을 위에
    for (const kind of KINDS) {
      if (off[kind].length) {
        s += '<path d="' + off[kind].join('') + '" style="fill:' + KIND_COLOR[kind] +
          '; fill-opacity:0.22"/>';
      }
    }
    for (const kind of KINDS) {
      if (on[kind].length) {
        s += '<path d="' + on[kind].join('') + '" style="fill:' + KIND_COLOR[kind] + '"/>';
      }
    }

    // 칸 이름 — 점이 안 닿는 위·아래 띠에 둔다
    s += '<text x="' + (px1 - 6) + '" y="' + (py0 + 14) + '" text-anchor="end" class="uq-quad">' +
      'pCVR 높고 증분도 + · 설득 가능</text>';
    s += '<text x="' + (px1 - 6) + '" y="' + (py1 - 7) + '" text-anchor="end" class="uq-quad is-bad">' +
      'pCVR 높은데 증분 0 이하 · 확실 구매 · 여기 쓴 돈이 샌다</text>';
    s += '<text x="' + (px0 + 6) + '" y="' + (py0 + 14) + '" class="uq-quad">' +
      'pCVR 낮은데 증분 + · pCVR 순이 놓치는 칸</text>';
    s += '<text x="' + (px0 + 6) + '" y="' + (py1 - 7) + '" class="uq-quad">무관심 · 청개구리</text>';

    // 컷 선 — pCVR 순이면 세로, uplift 순이면 가로.
    // 글자에는 바탕색 테두리를 둘러(paint-order) 점 위에 겹쳐도 읽힌다.
    const cutIdx = sel.idx[Math.max(0, k - 1)];
    if (k > 0 && cutIdx != null) {
      const cu = pop.users[cutIdx];
      if (mode === 'pcvr') {
        const x = r1(sx(cu.p1));
        const right = x > px1 - 200;
        s += '<line x1="' + x + '" y1="' + py0 + '" x2="' + x + '" y2="' + py1 +
          '" style="stroke:var(--accent-primary); stroke-width:2; stroke-dasharray:7 4"/>';
        s += '<text x="' + r1(x + (right ? -8 : 8)) + '" y="' + (py1 - 28) +
          '" text-anchor="' + (right ? 'end' : 'start') + '" class="uq-cut">' +
          '이 선 오른쪽을 전부 산다 · pCVR ' + pct(cu.p1) + ' 위</text>';
      } else {
        const y = r1(sy(cu.tau));
        const high = y < py0 + 32;
        s += '<line x1="' + px0 + '" y1="' + y + '" x2="' + px1 + '" y2="' + y +
          '" style="stroke:var(--accent-secondary); stroke-width:2; stroke-dasharray:7 4"/>';
        s += '<text x="' + (px0 + 8) + '" y="' + r1(high ? y + 17 : y - 9) + '" class="uq-cut is-navy">' +
          '이 선 위쪽을 전부 산다 · 증분 ' + pp(cu.tau) + ' 위</text>';
      }
    }

    // 테두리·축 이름
    s += '<rect x="' + px0 + '" y="' + py0 + '" width="' + (px1 - px0) + '" height="' + (py1 - py0) +
      '" style="fill:none; stroke:var(--rule); stroke-width:1.5"/>';
    s += '<text x="' + ((px0 + px1) / 2) + '" y="' + (SC.h - 12) + '" text-anchor="middle" class="uq-axis">' +
      'pCVR — 광고를 봤을 때 살 확률 (제곱근 눈금, 세로선이 전체 평균 ' + pct(meanP1) + ')</text>';
    s += '<text x="16" y="' + ((py0 + py1) / 2) + '" text-anchor="middle" class="uq-axis" transform="rotate(-90 16 ' +
      ((py0 + py1) / 2) + ')">uplift — 광고가 늘린 확률 (%p)</text>';

    const svg = $('uq-scatter');
    svg.innerHTML = s;
    svg.setAttribute('aria-label',
      '가로축 pCVR, 세로축 uplift 인 산점도. 점 2,000개가 설득 가능 ' + pop.counts.per +
      '개, 확실 구매 ' + pop.counts.sure + '개, 청개구리 ' + pop.counts.dog +
      '개, 무관심 ' + pop.counts.lost + '개로 나뉘어 있고, 지금 고른 기준은 ' +
      (mode === 'pcvr' ? 'pCVR 순' : 'uplift 순') + '이다.');
  }

  // ---------- Qini 곡선 ----------
  function drawQini(k) {
    const cU = pop.byUplift.inc, cP = pop.byPcvr.inc;
    const total = pop.sumTau;

    let hi = 0, lo = 0;
    for (let i = 0; i <= N; i++) {
      if (cU[i] > hi) hi = cU[i];
      if (cP[i] > hi) hi = cP[i];
      if (cU[i] < lo) lo = cU[i];
      if (cP[i] < lo) lo = cP[i];
    }
    if (total > hi) hi = total;
    if (hi <= 0) hi = 1e-6;
    const pad = (hi - lo) * 0.08;
    const yTop = hi + pad, yBot = Math.min(0, lo - pad);

    const qx = (i) => QC.l + QC_W * i / N;
    const qy = (v) => QC.t + QC_H * (yTop - v) / (yTop - yBot);

    const px0 = QC.l, px1 = QC.w - QC.r, py0 = QC.t, py1 = QC.h - QC.b;
    let s = '';

    // 세로 눈금 — 10만 명 단위
    for (let m = 0; m <= 4; m++) {
      const x = r1(qx(N * m / 4));
      s += '<line x1="' + x + '" y1="' + py0 + '" x2="' + x + '" y2="' + py1 +
        '" style="stroke:var(--rule2); stroke-width:1"/>';
      s += '<text x="' + x + '" y="' + (py1 + 18) + '" text-anchor="middle" class="uq-tick">' +
        (m === 0 ? '0' : (m * 10) + '만') + '</text>';
    }
    // 가로 눈금 — 아래 목록에서 칸이 8개를 넘지 않는 가장 촘촘한 것을 고른다
    const span = (yTop - yBot) * RATIO;
    const STEPS = [50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 20000, 50000];
    let stepCnt = STEPS[STEPS.length - 1];
    for (const c of STEPS) { if (span / c <= 8) { stepCnt = c; break; } }
    const first = Math.ceil(yBot * RATIO / stepCnt);
    const last = Math.floor(yTop * RATIO / stepCnt);
    for (let n = first; n <= last; n++) {
      const t = n * stepCnt;
      const y = r1(qy(t / RATIO));
      s += '<line x1="' + px0 + '" y1="' + y + '" x2="' + px1 + '" y2="' + y +
        '" style="stroke:' + (Math.abs(t) < 1e-9 ? 'var(--rule)' : 'var(--rule2)') +
        '; stroke-width:' + (Math.abs(t) < 1e-9 ? 1.6 : 1) + '"/>';
      s += '<text x="' + (px0 - 8) + '" y="' + (y + 4) + '" text-anchor="end" class="uq-tick">' + comma(t) + '</text>';
    }

    // 곡선 — 240점으로 줄여 그린다(모양은 그대로, 문자열은 8분의 1)
    const stride = Math.max(1, Math.floor(N / 240));
    const line = (cum) => {
      const pts = [];
      for (let i = 0; i <= N; i += stride) pts.push(r1(qx(i)) + ',' + r1(qy(cum[i])));
      pts.push(r1(qx(N)) + ',' + r1(qy(cum[N])));
      return pts.join(' ');
    };

    s += '<polyline points="' + r1(qx(0)) + ',' + r1(qy(0)) + ' ' + r1(qx(N)) + ',' + r1(qy(total)) +
      '" style="fill:none; stroke:var(--series-3); stroke-width:1.6; stroke-dasharray:6 5"/>';
    s += '<polyline points="' + line(cP) +
      '" style="fill:none; stroke:var(--accent-primary); stroke-width:2.2; stroke-dasharray:9 4"/>';
    s += '<polyline points="' + line(cU) +
      '" style="fill:none; stroke:var(--accent-secondary); stroke-width:2.6"/>';

    // uplift 곡선 최고점 — 광고를 멈출 자리
    let peakI = 0;
    for (let i = 0; i <= N; i++) if (cU[i] > cU[peakI]) peakI = i;
    if (peakI > 0 && peakI < N) {
      s += '<circle cx="' + r1(qx(peakI)) + '" cy="' + r1(qy(cU[peakI])) +
        '" r="4.5" style="fill:var(--accent-secondary)"/>';
      const anchor = peakI > N * 0.62 ? 'end' : 'start';
      const dx = anchor === 'end' ? -9 : 9;
      s += '<text x="' + r1(qx(peakI) + dx) + '" y="' + r1(qy(cU[peakI]) - 9) +
        '" text-anchor="' + anchor + '" class="uq-cut is-navy">최고점 ' + comma(cU[peakI] * RATIO) +
        '건 · 도달 ' + comma(peakI * RATIO) + '명</text>';
    }

    // 예산 자리
    if (k > 0) {
      const bx = r1(qx(k));
      s += '<line x1="' + bx + '" y1="' + py0 + '" x2="' + bx + '" y2="' + py1 +
        '" style="stroke:var(--ink3); stroke-width:1.2; stroke-dasharray:3 4"/>';
      s += '<line x1="' + bx + '" y1="' + r1(qy(cP[k])) + '" x2="' + bx + '" y2="' + r1(qy(cU[k])) +
        '" style="stroke:var(--ink2); stroke-width:1.4"/>';
      s += '<circle cx="' + bx + '" cy="' + r1(qy(cU[k])) + '" r="4" style="fill:var(--accent-secondary)"/>';
      s += '<circle cx="' + bx + '" cy="' + r1(qy(cP[k])) + '" r="4" style="fill:var(--accent-primary)"/>';
      const side = k > N * 0.6 ? 'end' : 'start';
      const dx = side === 'end' ? -8 : 8;
      s += '<text x="' + r1(bx + dx) + '" y="' + r1((qy(cU[k]) + qy(cP[k])) / 2 + 4) +
        '" text-anchor="' + side + '" class="uq-cut">' + comma(cU[k] * RATIO) + '건 대 ' +
        comma(cP[k] * RATIO) + '건</text>';
    }

    s += '<rect x="' + px0 + '" y="' + py0 + '" width="' + (px1 - px0) + '" height="' + (py1 - py0) +
      '" style="fill:none; stroke:var(--rule); stroke-width:1.5"/>';
    s += '<text x="' + ((px0 + px1) / 2) + '" y="' + (QC.h - 12) + '" text-anchor="middle" class="uq-axis">' +
      '누적 도달 인원 (명)</text>';
    s += '<text x="16" y="' + ((py0 + py1) / 2) + '" text-anchor="middle" class="uq-axis" transform="rotate(-90 16 ' +
      ((py0 + py1) / 2) + ')">누적 증분 전환 (건)</text>';

    const svg = $('uq-qini');
    svg.innerHTML = s;
    svg.setAttribute('aria-label',
      'Qini 곡선 두 개. uplift 순은 ' + comma(cU[k] * RATIO) + '건, pCVR 순은 ' +
      comma(cP[k] * RATIO) + '건에서 만난다. 최고점은 ' + comma(cU[peakI] * RATIO) + '건이다.');

    return { peakI: peakI, peakV: cU[peakI] };
  }

  // ---------- 표·지표 ----------
  function fillRow(pre, cum, k) {
    const reach = k * RATIO;
    const spend = reach * COST;
    const report = cum.rep[k] * RATIO;
    const inc = cum.inc[k] * RATIO;
    $(pre + '-reach').textContent = comma(reach) + '명';
    $(pre + '-report').textContent = comma(report) + '건';
    $(pre + '-inc').textContent = comma(inc) + '건';
    $(pre + '-cpa').textContent = report > 0.5 ? won(spend / report) : '—';
    const icell = $(pre + '-icpa');
    if (inc > 0.5) { icell.textContent = won(spend / inc); icell.classList.remove('is-bad'); }
    else { icell.textContent = '잴 수 없음'; icell.classList.add('is-bad'); }
    return { reach: reach, spend: spend, report: report, inc: inc };
  }

  // ---------- 전체 그리기 ----------
  function render() {
    const sPer = +$('uq-per').value / 100;
    const sSure = +$('uq-sure').value / 100;
    const sDog = +$('uq-dog').value / 100;
    const budget = +$('uq-budget').value / 100;

    $('uq-per-val').textContent = (+$('uq-per').value).toFixed(1) + '%';
    $('uq-sure-val').textContent = (+$('uq-sure').value).toFixed(1) + '%';
    $('uq-dog-val').textContent = (+$('uq-dog').value).toFixed(1) + '%';
    $('uq-budget-val').textContent = (+$('uq-budget').value).toFixed(0) + '%';

    buildPopulation(sPer, sSure, sDog);

    const meanP0 = pop.sumP0 / N, meanP1 = pop.sumP1 / N, meanTau = pop.sumTau / N;
    $('uq-lost-val').textContent = (pop.counts.lost / N * 100).toFixed(1) + '%';
    $('uq-mix').textContent = '설득 가능 ' + comma(pop.counts.per * RATIO) + '명 · 확실 구매 ' +
      comma(pop.counts.sure * RATIO) + '명 · 청개구리 ' + comma(pop.counts.dog * RATIO) +
      '명 · 무관심 ' + comma(pop.counts.lost * RATIO) + '명';

    $('uq-cvr-t').textContent = pct(meanP1);
    $('uq-cvr-c').textContent = pct(meanP0);
    $('uq-cvr-lift').textContent = pp(meanTau);
    $('uq-inc-total').textContent = comma(pop.sumTau * RATIO) + '건';
    $('uq-report-total').textContent = comma(pop.sumP1 * RATIO) + '건';
    $('uq-icpa-total').textContent = pop.sumTau > 0
      ? won(N * RATIO * COST / (pop.sumTau * RATIO)) : '잴 수 없음';

    const k = Math.max(1, Math.round(N * budget));
    $('uq-spend').textContent = comma(k * RATIO) + '명 · 광고비 ' + won(k * RATIO * COST);

    const mP = fillRow('uq-p', pop.byPcvr, k);
    const mU = fillRow('uq-u', pop.byUplift, k);

    document.querySelectorAll('.uq-mode-btn').forEach((b) => {
      b.classList.toggle('is-on', b.dataset.mode === mode);
      b.setAttribute('aria-pressed', b.dataset.mode === mode ? 'true' : 'false');
    });
    $('uq-row-pcvr').classList.toggle('is-on', mode === 'pcvr');
    $('uq-row-uplift').classList.toggle('is-on', mode === 'uplift');

    drawScatter(k, meanP1);
    const q = drawQini(k);

    const aP = auuc(pop.byPcvr.inc), aU = auuc(pop.byUplift.inc);
    $('uq-auuc').textContent = (aU == null ? '—' : 'uplift 순 AUUC ' + aU.toFixed(4) +
      ' (Qini ' + (aU - 0.5 >= 0 ? '+' : '') + (aU - 0.5).toFixed(4) + ')') +
      (aP == null ? '' : ' · pCVR 순 AUUC ' + aP.toFixed(4) +
        ' (Qini ' + (aP - 0.5 >= 0 ? '+' : '') + (aP - 0.5).toFixed(4) + ') · 랜덤 0.5000');

    // 한 줄 판정
    let v;
    if (mU.inc <= 0.5 && mP.inc <= 0.5) {
      v = '이 예산에서는 어느 순서로 골라도 증분이 0 이하입니다. 설득 가능 비율을 올려 보세요.';
    } else if (Math.abs(mP.inc - mU.inc) < 0.5 && Math.abs(mP.report - mU.report) < 0.5) {
      v = '두 계획이 같은 사람을 다 샀습니다. 리포트 전환도 ' + comma(mU.report) + '건, 증분도 ' +
        comma(mU.inc) + '건으로 같습니다. 예산이 전체를 덮으면 순서를 아무리 잘 매겨도 결과가 같습니다 — ' +
        '증분 모델의 값은 "어디서 멈출까"와 짝일 때만 생깁니다.';
    } else if (mP.inc <= 0.5) {
      v = 'pCVR 순으로 고르면 증분이 사실상 0입니다. 뽑힌 ' + comma(mP.reach) +
        '명이 거의 다 확실 구매라 리포트에는 ' + comma(mP.report) + '건이 찍히지만 매출은 안 늡니다.';
    } else {
      const ratio = mP.inc / mU.inc;
      const repGap = mU.report > 0.5 ? (mP.report / mU.report - 1) * 100 : 0;
      const incGap = (mU.inc / mP.inc - 1) * 100;
      v = '같은 ' + comma(mP.reach) + '명, 같은 ' + won(mP.spend) + '. pCVR 순은 리포트 전환이 ' +
        (repGap >= 0 ? repGap.toFixed(1) + '% 많은데' : (-repGap).toFixed(1) + '% 적은데') +
        ' 증분은 uplift 순의 ' + (ratio * 100).toFixed(0) + '%뿐입니다.' +
        (ratio < 0.5 ? ' 절반도 안 됩니다.' : '') +
        ' uplift 순으로 바꾸면 같은 돈으로 증분 전환이 ' + incGap.toFixed(1) + '% 늘어납니다.';
    }
    if (q.peakI > 0 && q.peakI < N) {
      v += ' uplift 곡선은 ' + comma(q.peakI * RATIO) + '명에서 ' + comma(q.peakV * RATIO) +
        '건으로 정점입니다. 그 뒤로는 광고를 더 할수록 증분이 줄어듭니다.';
    }
    $('uq-verdict').textContent = v;
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; render(); });
  }

  // 세 비율의 합이 95%를 넘지 않게 — 무관심을 최소 5%는 남긴다
  function clampShares(changed) {
    const ids = ['uq-per', 'uq-sure', 'uq-dog'];
    let sum = ids.reduce((s, id) => s + +$(id).value, 0);
    if (sum <= 95) return;
    let over = sum - 95;
    for (const id of ids) {
      if (id === changed) continue;
      const cur = +$(id).value;
      const cut = Math.min(cur, over);
      $(id).value = (cur - cut).toFixed(1);
      over -= cut;
      if (over <= 0) break;
    }
    if (over > 0) $(changed).value = (+$(changed).value - over).toFixed(1);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('uq-scatter')) return;

    ['uq-per', 'uq-sure', 'uq-dog'].forEach((id) => {
      $(id).addEventListener('input', () => { clampShares(id); schedule(); });
    });
    $('uq-budget').addEventListener('input', schedule);

    // 버튼은 바로 그린다(rAF 로 미루지 않는다). demo-edu.js 의 해설이 같은 클릭에서
    // 표 값을 읽어 가므로, 미루면 한 박자 전 숫자를 읽어 말한다.
    document.querySelectorAll('.uq-mode-btn').forEach((b) => {
      b.addEventListener('click', () => { mode = b.dataset.mode; render(); });
    });

    document.querySelectorAll('.uq-preset-btn').forEach((b) => {
      b.addEventListener('click', () => {
        const v = b.dataset.preset.split(',').map(Number);
        $('uq-per').value = v[0];
        $('uq-sure').value = v[1];
        $('uq-dog').value = v[2];
        $('uq-budget').value = v[3];
        if (v[4] != null) mode = v[4] === 1 ? 'uplift' : 'pcvr';
        render();
      });
    });

    // 테마가 바뀌면 다시 그린다. SVG 라 var() 가 알아서 따라오지만,
    // 계산값을 붙들고 있는 브라우저를 대비한 안전장치다.
    new MutationObserver(schedule).observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme']
    });

    render();
  });
})();
