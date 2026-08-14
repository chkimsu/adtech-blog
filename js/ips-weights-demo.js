// ===================================================================
// 성향점수 가중 실험실 — js/ips-weights-demo.js
//
// 글 "새 모델을 올리기 전에 지난주 로그로 채점한다"(posts/offpolicy-evaluation.md)의
// 로그 10,000건을 그대로 다시 만든다. 글의 파이썬 코드는 random.seed(7) 로 돌았으므로,
// 같은 숫자를 내려면 CPython 의 random 모듈(MT19937 + Box-Muller)을 그대로 옮겨야 한다.
// 아래 PyRandom 이 그 이식본이다. 기본값(ε=0.10 · 정책거리 1.00)에서 나오는 값은
//   겹친 건 2,595 (25.9%) · 가중치 합 9,681 · 제곱 합 276,093 · ESS 339 ·
//   Replay 3.314% · IPS 1.669% · 진짜 값 2.807% · 최대 가중치 80
// 으로 글 2~4절의 출력과 자리 하나까지 같다.
//
// 그림은 전부 인라인 SVG 다. canvas 가 아니므로 색에 var(--...) 를 그대로 쓸 수 있고
// hex 폴백 상수가 필요 없다. 그래도 테마가 바뀌면 다시 그린다(아래 MutationObserver) —
// 글자 크기를 CSS 픽셀에 맞춰 계산하기 때문에 폭·테마 변화 뒤 한 번 더 그리는 편이 안전하다.
// ===================================================================
(function () {
  'use strict';

  // =================================================================
  // 0) CPython random 모듈 이식 (MT19937)
  // =================================================================
  function PyRandom(seed) {
    const N = 624, M = 397, MATRIX_A = 0x9908b0df, UPPER = 0x80000000, LOWER = 0x7fffffff;
    const mt = new Uint32Array(N);
    let mti = N + 1;

    function initGenrand(s) {
      mt[0] = s >>> 0;
      for (let i = 1; i < N; i++) {
        const prev = mt[i - 1] ^ (mt[i - 1] >>> 30);
        mt[i] = (Math.imul(1812433253, prev) + i) >>> 0;
      }
      mti = N;
    }
    function initByArray(key) {
      initGenrand(19650218);
      let i = 1, j = 0;
      let k = Math.max(N, key.length);
      for (; k; k--) {
        const prev = mt[i - 1] ^ (mt[i - 1] >>> 30);
        mt[i] = (((mt[i] ^ Math.imul(prev, 1664525)) >>> 0) + key[j] + j) >>> 0;
        i++; j++;
        if (i >= N) { mt[0] = mt[N - 1]; i = 1; }
        if (j >= key.length) j = 0;
      }
      for (k = N - 1; k; k--) {
        const prev = mt[i - 1] ^ (mt[i - 1] >>> 30);
        mt[i] = (((mt[i] ^ Math.imul(prev, 1566083941)) >>> 0) - i) >>> 0;
        i++;
        if (i >= N) { mt[0] = mt[N - 1]; i = 1; }
      }
      mt[0] = 0x80000000;
    }
    function genrand() {
      let y;
      if (mti >= N) {
        let kk;
        for (kk = 0; kk < N - M; kk++) {
          y = ((mt[kk] & UPPER) | (mt[kk + 1] & LOWER)) >>> 0;
          mt[kk] = (mt[kk + M] ^ (y >>> 1) ^ ((y & 1) ? MATRIX_A : 0)) >>> 0;
        }
        for (; kk < N - 1; kk++) {
          y = ((mt[kk] & UPPER) | (mt[kk + 1] & LOWER)) >>> 0;
          mt[kk] = (mt[kk + (M - N)] ^ (y >>> 1) ^ ((y & 1) ? MATRIX_A : 0)) >>> 0;
        }
        y = ((mt[N - 1] & UPPER) | (mt[0] & LOWER)) >>> 0;
        mt[N - 1] = (mt[M - 1] ^ (y >>> 1) ^ ((y & 1) ? MATRIX_A : 0)) >>> 0;
        mti = 0;
      }
      y = mt[mti++];
      y = (y ^ (y >>> 11)) >>> 0;
      y = (y ^ ((y << 7) & 0x9d2c5680)) >>> 0;
      y = (y ^ ((y << 15) & 0xefc60000)) >>> 0;
      y = (y ^ (y >>> 18)) >>> 0;
      return y;
    }

    const key = [];
    let n = Math.abs(seed);
    if (n === 0) key.push(0);
    while (n > 0) { key.push(n >>> 0); n = Math.floor(n / 4294967296); }
    initByArray(key);

    let gaussNext = null;
    const TWOPI = 2 * Math.PI;
    const api = {
      random: function () {
        const a = genrand() >>> 5, b = genrand() >>> 6;
        return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
      },
      uniform: function (lo, hi) { return lo + (hi - lo) * api.random(); },
      // CPython 의 gauss 는 Box-Muller 짝 중 하나를 캐시해 다음 호출에 쓴다.
      // 그 캐시까지 같아야 난수 소비 순서가 어긋나지 않는다.
      gauss: function (mu, sigma) {
        let z = gaussNext;
        gaussNext = null;
        if (z === null) {
          const x2pi = api.random() * TWOPI;
          const g2rad = Math.sqrt(-2.0 * Math.log(1.0 - api.random()));
          z = Math.cos(x2pi) * g2rad;
          gaussNext = Math.sin(x2pi) * g2rad;
        }
        return mu + z * sigma;
      }
    };
    return api;
  }

  // 반복 주 뽑기용 난수(빠르면 된다). 씨앗을 고정해 같은 설정이면 같은 그림이 나온다.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // =================================================================
  // 1) 글과 같은 설정
  // =================================================================
  const K = 8;                 // 요청마다 후보 광고 8개
  const TAU = 0.0014;          // 옛 정책 softmax 온도
  const SEED = 7;              // 글의 random.seed(7)
  const NREQ = 10000;          // 요청 10,000건
  const WEEKS = 400;           // 반복해서 뽑는 '지난주' 수 — 글 5절과 같다
  // (지면, 요청 수, 기저 CTR 하한, 상한, 숨은 피처 z 의 값어치)
  const SLOTS = [
    ['main_top', 2600, 0.024, 0.044, 0.000],
    ['search_top', 1400, 0.016, 0.032, 0.003],
    ['feed_mid', 3100, 0.007, 0.018, 0.010],
    ['feed_low', 2000, 0.004, 0.012, 0.014],
    ['detail_side', 900, 0.003, 0.009, 0.018]
  ];
  const BONUS = SLOTS.map(function (s) { return s[4]; });
  // 틀린 보상 모델 — 후보를 구분하지 못하고 지면 평균만 내놓는다 (글 6절)
  const QMEAN = SLOTS.map(function (s) { return (s[2] + s[3]) / 2 + 0.2 * s[4]; });

  const EPS_STEPS = [0.02, 0.05, 0.10, 0.20, 0.35, 0.50, 1.00];
  const CLIP_STEPS = [5, 10, 20, 40, 80, 160, 400, Infinity];
  const BIN_EDGES = [1, 2, 5, 10, 20, 40, 80, 160, 400, Infinity];

  // =================================================================
  // 2) 난수 재료를 한 번만 만들어 둔다
  //    컨트롤이 바뀌어도 '지난주에 일어난 우연'은 그대로여야 한다.
  //    그래서 난수는 고정하고, 그 위에서 확률과 선택만 다시 계산한다.
  // =================================================================
  const slotOf = new Uint8Array(NREQ);
  const base = new Float64Array(NREQ * K);
  const zbit = new Uint8Array(NREQ * K);
  const gOld = new Float64Array(NREQ * K);
  const gNew = new Float64Array(NREQ * K);
  const uSel = new Float64Array(NREQ);
  const uClk = new Float64Array(NREQ);

  function buildRaw() {
    const rng = PyRandom(SEED);
    let t = 0;
    for (let s = 0; s < SLOTS.length; s++) {
      const n = SLOTS[s][1], lo = SLOTS[s][2], hi = SLOTS[s][3];
      for (let k = 0; k < n; k++, t++) {
        const o = t * K;
        slotOf[t] = s;
        for (let i = 0; i < K; i++) base[o + i] = rng.uniform(lo, hi);
        for (let i = 0; i < K; i++) zbit[o + i] = rng.random() < 0.2 ? 1 : 0;
        for (let i = 0; i < K; i++) gOld[o + i] = rng.gauss(0, 0.004);
        for (let i = 0; i < K; i++) gNew[o + i] = rng.gauss(0, 0.002);
        uSel[t] = rng.random();
        uClk[t] = rng.random();
      }
    }
  }

  // 파생값 — 컨트롤이 바뀔 때마다 다시 채운다
  const pE = new Float64Array(NREQ);      // 옛 정책이 '새 정책의 선택'을 고를 확률
  const cE = new Float64Array(NREQ);      // 그 후보의 진짜 CTR
  const qE = new Float64Array(NREQ);      // 보상 모델의 예측
  const wRaw = new Float64Array(NREQ);    // 겹친 건의 가중치 1/p (안 겹치면 0)
  const isMatch = new Uint8Array(NREQ);
  const rObs = new Uint8Array(NREQ);

  const ctrBuf = new Float64Array(K), oldBuf = new Float64Array(K), exBuf = new Float64Array(K);

  function derive(eps, dist, alpha) {
    let sumTrue = 0, sumDM = 0, sumOld = 0, clicks = 0;
    for (let t = 0; t < NREQ; t++) {
      const o = t * K, b = BONUS[slotOf[t]];
      let m = -Infinity;
      for (let i = 0; i < K; i++) {
        ctrBuf[i] = base[o + i] + b * zbit[o + i];
        oldBuf[i] = base[o + i] + gOld[o + i];
        if (oldBuf[i] > m) m = oldBuf[i];
      }
      // 새 정책 = 옛 모델의 눈과 새 모델의 눈을 dist 로 섞은 것.
      // dist=1 이면 글의 새 정책 그대로, dist=0 이면 옛 정책과 같은 답을 낸다.
      let e = 0, best = -Infinity;
      for (let i = 0; i < K; i++) {
        const sc = (1 - dist) * oldBuf[i] + dist * (ctrBuf[i] + gNew[o + i]);
        if (sc > best) { best = sc; e = i; }
      }
      let Z = 0;
      for (let i = 0; i < K; i++) { exBuf[i] = Math.exp((oldBuf[i] - m) / TAU); Z += exBuf[i]; }
      let acc = 0, a = K - 1, pe = 0, vOld = 0, taken = false;
      const u = uSel[t];
      for (let i = 0; i < K; i++) {
        const pi = (1 - eps) * (exBuf[i] / Z) + eps / K;
        if (i === e) pe = pi;
        vOld += pi * ctrBuf[i];
        acc += pi;
        if (!taken && u <= acc) { a = i; taken = true; }
      }
      const r = uClk[t] < ctrBuf[a] ? 1 : 0;
      pE[t] = pe;
      cE[t] = ctrBuf[e];
      qE[t] = alpha * ctrBuf[e] + (1 - alpha) * QMEAN[slotOf[t]];
      isMatch[t] = (a === e) ? 1 : 0;
      rObs[t] = r;
      wRaw[t] = isMatch[t] ? 1 / pe : 0;
      sumTrue += ctrBuf[e];
      sumDM += qE[t];
      sumOld += vOld;
      clicks += r;
    }
    return {
      vTrue: sumTrue / NREQ,      // 새 정책의 진짜 값
      dm: sumDM / NREQ,           // 보상 모델만 쓴 추정 (Direct Method)
      vOld: sumOld / NREQ,        // 옛 정책의 진짜 값
      obs: clicks / NREQ,         // 로그 전체 실측 CTR
      obsClicks: clicks
    };
  }

  // 이번 주(로그 그대로)의 추정치 · 가중치 분포 · ESS
  function realized(clip, dm) {
    const bins = BIN_EDGES.slice(0, -1).map(function (lo, i) {
      return { lo: lo, hi: BIN_EDGES[i + 1], n: 0, w: 0, w2: 0, clicks: 0 };
    });
    let nMatch = 0, mClicks = 0, sw = 0, sw2 = 0, swr = 0, corr = 0, wMax = 0;
    for (let t = 0; t < NREQ; t++) {
      if (!isMatch[t]) continue;
      const raw = wRaw[t], w = raw < clip ? raw : clip, r = rObs[t];
      nMatch++; mClicks += r;
      sw += w; sw2 += w * w; swr += w * r;
      corr += w * (r - qE[t]);
      if (raw > wMax) wMax = raw;
      for (let i = 0; i < bins.length; i++) {
        if (raw >= bins[i].lo && raw < bins[i].hi) {
          bins[i].n++; bins[i].w += w; bins[i].w2 += w * w; bins[i].clicks += r;
          break;
        }
      }
    }
    return {
      bins: bins, nMatch: nMatch, mClicks: mClicks,
      wSum: sw, wSq: sw2, wMax: wMax,
      ess: sw2 > 0 ? (sw * sw) / sw2 : 0,
      replay: nMatch ? mClicks / nMatch : 0,
      ips: swr / NREQ,
      snips: sw > 0 ? swr / sw : 0,
      dr: dm + corr / NREQ
    };
  }

  // 같은 조건의 '지난주'를 400번 다시 뽑는다 — 글 5절과 같은 방식
  function repeats(clip, dm) {
    const acc = { replay: [], ips: [], snips: [], dr: [] };
    const rnd = mulberry32(20260814);
    for (let w = 0; w < WEEKS; w++) {
      let cnt = 0, clk = 0, sw = 0, swr = 0, corr = 0;
      for (let t = 0; t < NREQ; t++) {
        const p = pE[t];
        if (rnd() < p) {
          const r = rnd() < cE[t] ? 1 : 0;
          const raw = 1 / p, wc = raw < clip ? raw : clip;
          cnt++; clk += r; sw += wc; swr += wc * r;
          corr += wc * (r - qE[t]);
        }
      }
      acc.replay.push(cnt ? clk / cnt : 0);
      acc.ips.push(swr / NREQ);
      acc.snips.push(sw > 0 ? swr / sw : 0);
      acc.dr.push(dm + corr / NREQ);
    }
    const out = {};
    Object.keys(acc).forEach(function (k) {
      const v = acc[k];
      const mu = v.reduce(function (a, b) { return a + b; }, 0) / v.length;
      const sd = Math.sqrt(v.reduce(function (a, b) { return a + (b - mu) * (b - mu); }, 0) / (v.length - 1));
      out[k] = { mean: mu, sd: sd };
    });
    return out;
  }

  // =================================================================
  // 3) 숫자 표기
  // =================================================================
  const $ = function (id) { return document.getElementById(id); };
  function n0(v) { return Math.round(v).toLocaleString('en-US'); }
  function pct(v, d) { return (v * 100).toFixed(d == null ? 2 : d) + '%'; }
  function pp(v, d) {
    const s = (v * 100).toFixed(d == null ? 3 : d);
    return (v >= 0 ? '+' : '') + s + '%p';
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // =================================================================
  // 4) SVG 그리기 — 색은 전부 var(--...) 다
  //    폭은 담을 칸의 CSS 픽셀을 그대로 viewBox 로 쓴다. 그래야 글자가 안 늘어난다.
  // =================================================================
  function svgOpen(w, h, label) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="' + h +
      '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(label) +
      '" style="display:block; font-family:var(--font-sans)">';
  }
  function txt(x, y, s, size, fill, anchor, weight) {
    return '<text x="' + x + '" y="' + y + '" style="font-size:' + size + 'px; fill:' + fill +
      (anchor ? '; text-anchor:' + anchor : '') + (weight ? '; font-weight:' + weight : '') +
      '">' + esc(s) + '</text>';
  }
  function hostWidth(el) {
    const w = el.clientWidth;
    return Math.max(280, Math.round(w || 640));
  }

  // ---- 그림 1: 가중치가 어디에 몰려 있나 ----
  function drawWeights(host, st, eps, clip) {
    const W = hostWidth(host);
    const maxW = K / eps;
    let last = 0;
    for (let i = 0; i < BIN_EDGES.length - 1; i++) if (BIN_EDGES[i] < maxW - 1e-9) last = i;
    const bins = st.bins.slice(0, last + 1);

    // 좁은 화면에서는 오른쪽 글자를 줄인다. 막대가 이미 가중치 합을 말하고 있으므로
    // 그 숫자를 먼저 뺀다 — 안 그러면 글자가 막대 위로 올라탄다.
    const compact = W < 560;
    const labelW = compact ? 52 : 64;
    const rightW = compact ? 120 : 168;
    const x0 = labelW + 8;
    const barW = Math.max(40, W - x0 - rightW - 8);
    const rowH = 26, top = 46;
    const H = top + bins.length * rowH + 8;

    let peak = 1;
    bins.forEach(function (b) { if (b.w > peak) peak = b.w; });
    // 점선으로 짚는 구간 = 가중치를 가장 많이 쥔 구간. 다만 세 조건을 다 넘을 때만 짚는다.
    //   (1) 가중치가 실제로 몰려 있다(ESS 가 겹친 건의 절반 아래)
    //   (2) 그 구간 하나가 전체 가중치의 15% 이상
    //   (3) 그 구간이 가중치 5배 위쪽이다 — 1~2 구간이 제일 무거운 건 정상이라 안 짚는다
    let heavyIdx = -1, heavyW = 0;
    bins.forEach(function (b, i) { if (b.w > heavyW) { heavyW = b.w; heavyIdx = i; } });
    const flagged = heavyIdx >= 0 && st.ess < 0.5 * st.nMatch &&
      heavyW >= 0.15 * st.wSum && bins[heavyIdx].lo >= 5;
    const worstIdx = flagged ? heavyIdx : -1;

    let s = svgOpen(W, H, '가중치 구간별 막대 그림. 막대 길이는 그 구간이 가진 가중치 합이다. ' +
      '클릭이 하나도 없는 구간은 회색이고, 가중치가 한쪽에 몰렸을 때 그 구간을 점선으로 표시한다. ' +
      '구간별 건수와 클릭 수는 막대 오른쪽에 적혀 있고, 그림 아래 한 줄이 읽는 법을 말해 준다.');
    s += txt(2, 16, '전체 가중치 합 ' + n0(st.wSum) +
      (clip === Infinity ? '' : ' (상한 ' + clip + '로 자른 뒤)'), 12.5, 'var(--ink2)');
    s += txt(2, 34, '가중치 1/p', 12, 'var(--ink3)');
    s += txt(x0, 34, '가중치 합', 12, 'var(--ink3)');
    s += txt(W - 2, 34, compact ? '건수 · 클릭' : '합 · 건수 · 클릭', 12, 'var(--ink3)', 'end');
    s += '<line x1="0" y1="40" x2="' + W + '" y2="40" style="stroke:var(--rule); stroke-width:1"/>';

    bins.forEach(function (b, i) {
      const y = top + i * rowH;
      const len = Math.max(1, Math.round(barW * (b.w / peak)));
      const label = b.hi === Infinity ? b.lo + ' 이상' : b.lo + '~' + b.hi;
      s += txt(2, y + 14, label, 12.5, 'var(--ink2)');
      if (i === worstIdx) {
        s += '<rect x="' + x0 + '" y="' + (y + 3) + '" width="' + len + '" height="14" ' +
          'style="fill:none; stroke:var(--oxide); stroke-width:2.5; stroke-dasharray:6 3"/>';
      } else {
        s += '<rect x="' + x0 + '" y="' + (y + 3) + '" width="' + len + '" height="14" style="fill:' +
          (b.clicks > 0 ? 'var(--navy)' : 'var(--grey)') + '"/>';
      }
      const right = (compact ? '' : n0(b.w) + ' · ') + n0(b.n) + '건 · 클릭 ' + b.clicks;
      s += txt(W - 2, y + 14, right, 12, i === worstIdx ? 'var(--oxide)' : 'var(--ink2)', 'end');
    });
    s += '</svg>';
    host.innerHTML = s;

    // 마무리 한 줄은 SVG 밖에 둔다. SVG 안의 글자는 줄바꿈이 없어 좁은 화면에서 잘린다.
    const foot = $('ipw-foot-weights');
    if (foot) {
      if (worstIdx < 0) {
        foot.textContent = '가중치가 비교적 고르게 퍼져 있습니다. 한 건이 값을 통째로 흔드는 자리가 없습니다.';
      } else {
        const b = bins[worstIdx];
        const share = Math.round(b.w / st.wSum * 100);
        foot.textContent = b.clicks === 0
          ? '점선 구간이 위험한 자리입니다. 가중치의 ' + share + '%를 ' + n0(b.n) +
            '건이 쥐었는데 그 안에 클릭이 하나도 없습니다. 그중 하나에 클릭이 붙으면 추정치가 크게 뜁니다.'
          : '점선 구간이 이 추정치의 무게중심입니다. ' + n0(b.n) + '건이 가중치의 ' + share +
            '%를 쥐고 있어, 그 안에서 클릭 하나가 붙고 떨어질 때마다 값이 크게 움직입니다.';
      }
    }
  }

  // ---- 그림 2: 네 추정치와 진짜 값 ----
  const EST_ROWS = [
    ['replay', 'Replay'],
    ['ips', 'IPS'],
    ['snips', 'SNIPS'],
    ['dr', 'DR']
  ];

  function drawEstimates(host, st, bands, vTrue) {
    const W = hostWidth(host);
    const padL = Math.min(78, Math.max(54, W * 0.09));
    const padR = 16;
    const rowH = 38, top = 52;
    const H = top + EST_ROWS.length * rowH + 52;

    let lo = vTrue, hi = vTrue;
    EST_ROWS.forEach(function (row) {
      const v = st[row[0]];
      lo = Math.min(lo, v); hi = Math.max(hi, v);
      if (bands) {
        const b = bands[row[0]];
        lo = Math.min(lo, b.mean - b.sd); hi = Math.max(hi, b.mean + b.sd);
      }
    });
    const span = Math.max(hi - lo, 0.002);
    lo = Math.max(0, lo - span * 0.14);
    hi = hi + span * 0.14;
    const plotW = W - padL - padR;
    const X = function (v) { return padL + plotW * ((v - lo) / (hi - lo)); };

    let s = svgOpen(W, H, '가로축은 새 정책의 CTR 추정값이다. 추정기 네 개가 줄마다 하나씩 있고, ' +
      '줄마다 400주 평균을 가운데 둔 표준편차 구간과 이번 주 값이 함께 찍혀 있다. 진짜 값은 세로 점선이다.');

    // 눈금
    const yTop = top - 8, yBot = top + EST_ROWS.length * rowH + 2;
    for (let i = 0; i <= 4; i++) {
      const v = lo + (hi - lo) * i / 4, x = X(v);
      s += '<line x1="' + x.toFixed(1) + '" y1="' + yTop + '" x2="' + x.toFixed(1) + '" y2="' + yBot +
        '" style="stroke:var(--rule2); stroke-width:1"/>';
      s += txt(x, yBot + 18, (v * 100).toFixed(2) + '%', 12, 'var(--ink3)', 'middle');
    }

    // 진짜 값
    const xt = X(vTrue);
    s += '<line x1="' + xt.toFixed(1) + '" y1="' + (yTop - 16) + '" x2="' + xt.toFixed(1) + '" y2="' + yBot +
      '" style="stroke:var(--ink); stroke-width:1.5; stroke-dasharray:5 3"/>';
    const anchor = xt > W - 120 ? 'end' : (xt < padL + 60 ? 'start' : 'middle');
    s += txt(xt, yTop - 22, '진짜 값 ' + pct(vTrue, 3), 12.5, 'var(--ink)', anchor, 600);

    EST_ROWS.forEach(function (row, i) {
      const key = row[0], name = row[1];
      const y = top + i * rowH + rowH / 2 - 4;
      s += txt(2, y + 4, name, 13, 'var(--ink)', null, 600);
      if (bands) {
        const b = bands[key];
        const xa = X(b.mean - b.sd), xb = X(b.mean + b.sd);
        s += '<rect x="' + xa.toFixed(1) + '" y="' + (y - 7) + '" width="' + Math.max(1, xb - xa).toFixed(1) +
          '" height="14" style="fill:var(--navy-bg); stroke:var(--navy-bd); stroke-width:1"/>';
        const xm = X(b.mean);
        s += '<line x1="' + xm.toFixed(1) + '" y1="' + (y - 10) + '" x2="' + xm.toFixed(1) + '" y2="' + (y + 10) +
          '" style="stroke:var(--navy); stroke-width:2"/>';
      }
      const xr = X(st[key]);
      s += '<rect x="' + (xr - 5).toFixed(1) + '" y="' + (y - 5) + '" width="10" height="10" style="fill:var(--oxide)"/>';
    });

    // 범례
    const ly = H - 10;
    s += '<rect x="2" y="' + (ly - 9) + '" width="10" height="10" style="fill:var(--oxide)"/>';
    s += txt(17, ly, '이번 주 값', 12, 'var(--ink2)');
    s += '<rect x="92" y="' + (ly - 9) + '" width="26" height="10" style="fill:var(--navy-bg); stroke:var(--navy-bd); stroke-width:1"/>';
    s += '<line x1="105" y1="' + (ly - 12) + '" x2="105" y2="' + (ly + 3) + '" style="stroke:var(--navy); stroke-width:2"/>';
    s += txt(123, ly, WEEKS + '주 평균 ± 표준편차 1배', 12, 'var(--ink2)');
    s += '</svg>';
    host.innerHTML = s;
  }

  // ---- 그림 3: 표본이 세 번 줄어든다 ----
  function drawShrink(host, st, vTrue) {
    const W = hostWidth(host);
    const rightW = Math.min(96, Math.max(62, W * 0.17));
    const barW = Math.max(40, W - rightW - 8);
    const H = 164;   // 30 + 3줄 x 46 + 막대 두께 여유
    const rows = [
      ['로그 전체', NREQ, 'var(--grey-bg)', 'var(--grey)', 1.5],
      ['겹친 건 (Replay가 쓰는 것)', st.nMatch, 'var(--navy-bg)', 'var(--navy)', 1.5],
      ['유효표본 ESS (IPS를 받치는 것)', st.ess, 'var(--oxide-bg)', 'var(--oxide)', 2.5]
    ];
    let s = svgOpen(W, H, '가로 막대 세 개. 로그 전체 요청 수, 그중 두 정책이 같은 광고를 고른 건수, ' +
      '가중치를 반영한 유효표본크기 순으로 짧아진다.');
    s += txt(2, 15, '같은 로그를 세 가지로 세면 이렇게 줄어든다', 12.5, 'var(--ink2)');
    rows.forEach(function (r, i) {
      const y = 30 + i * 46;
      s += txt(2, y + 12, r[0], 12, 'var(--ink3)');
      const len = Math.max(2, Math.round(barW * (r[1] / NREQ)));
      s += '<rect x="0" y="' + (y + 18) + '" width="' + len + '" height="18" style="fill:' + r[2] +
        '; stroke:' + r[3] + '; stroke-width:' + r[4] + '"/>';
      s += txt(len + 6, y + 32, n0(r[1]), 12.5, i === 2 ? 'var(--oxide)' : 'var(--ink)');
    });
    s += '</svg>';
    host.innerHTML = s;

    const foot = $('ipw-foot-shrink');
    if (foot) {
      foot.textContent = '유효표본 ' + n0(st.ess) + '건에 진짜 CTR ' + pct(vTrue, 3) +
        '를 곱하면 클릭 ' + (st.ess * vTrue).toFixed(1) + '건입니다. 그만큼이 이 숫자를 받칩니다.';
    }
  }

  // =================================================================
  // 5) 화면 갱신
  // =================================================================
  const state = { eps: 0.10, dist: 1.00, clip: Infinity, alpha: 1.00 };
  let ground = null, stats = null, bands = null;
  let bandTimer = null, rafId = 0;   // rafId 는 setTimeout 손잡이다

  function clipLabel(v) { return v === Infinity ? '없음' : 'M=' + v; }

  function setMetric(id, value, sub, tone) {
    const v = $(id);
    if (v) {
      v.textContent = value;
      v.className = 'ipw-metric-value' + (tone ? ' is-' + tone : '');
    }
    const s = $(id + '-sub');
    if (s) s.textContent = sub;
  }

  function updateTable() {
    const body = $('ipw-table-body');
    if (!body) return;
    let html = '';
    EST_ROWS.forEach(function (row) {
      const key = row[0], name = row[1];
      const now = stats[key];
      const b = bands ? bands[key] : null;
      html += '<tr><th scope="row">' + name + '</th>' +
        '<td>' + pct(now, 3) + '</td>' +
        '<td>' + pp(now - ground.vTrue) + '</td>' +
        '<td>' + (b ? pct(b.mean, 3) : '—') + '</td>' +
        '<td>' + (b ? pp(b.mean - ground.vTrue) : '—') + '</td>' +
        '<td>' + (b ? (b.sd * 100).toFixed(3) + '%p' : '—') + '</td></tr>';
    });
    body.innerHTML = html;
  }

  function updateVerdict() {
    const essRatio = stats.ess / NREQ;
    const gap = stats.ips - ground.vTrue;
    const parts = [];
    parts.push('진짜 값은 ' + pct(ground.vTrue, 3) + '이고 이번 주 IPS는 ' + pct(stats.ips, 3) +
      ' — ' + pp(gap) + ' 어긋났습니다.');
    if (essRatio < 0.01) {
      parts.push('유효표본이 로그의 ' + (essRatio * 100).toFixed(1) + '%뿐입니다. 이 값은 보고서에 쓰지 않습니다.');
    } else if (essRatio < 0.05) {
      parts.push('유효표본 ' + n0(stats.ess) + '건 — 클릭 ' + (stats.ess * ground.vTrue).toFixed(1) +
        '건이 이 숫자를 받칩니다. 순위 비교까지만 씁니다.');
    } else {
      parts.push('유효표본 ' + n0(stats.ess) + '건으로 로그의 ' + (essRatio * 100).toFixed(1) +
        '%가 살아 있습니다. 구간이 좁아진 상태입니다.');
    }
    if (state.clip !== Infinity && stats.wMax > state.clip) {
      parts.push('가중치를 ' + state.clip + '에서 잘랐습니다. IPS는 아래로 밀리고 SNIPS는 분모도 같이 줄어 대부분 돌아옵니다.');
    }
    $('ipw-verdict').textContent = parts.join(' ');
  }

  function drawAll() {
    const wHost = $('ipw-chart-weights'), eHost = $('ipw-chart-est'), sHost = $('ipw-chart-shrink');
    if (wHost) drawWeights(wHost, stats, state.eps, state.clip);
    if (eHost) drawEstimates(eHost, stats, bands, ground.vTrue);
    if (sHost) drawShrink(sHost, stats, ground.vTrue);
  }

  function recompute() {
    ground = derive(state.eps, state.dist, state.alpha);
    stats = realized(state.clip, ground.dm);

    setMetric('ipw-m-match', n0(stats.nMatch) + '건',
      '요청 ' + n0(NREQ) + '건의 ' + (stats.nMatch / NREQ * 100).toFixed(1) + '% · 그중 클릭 ' + stats.mClicks + '건',
      stats.nMatch / NREQ < 0.10 ? 'bad' : 'good');

    const drift = stats.wSum / NREQ - 1;
    setMetric('ipw-m-wsum', n0(stats.wSum),
      '요청 수 ' + n0(NREQ) + '건 대비 ' + (drift * 100).toFixed(1) + '%',
      Math.abs(drift) > 0.10 ? 'bad' : 'good');

    setMetric('ipw-m-wmax', n0(stats.wMax) + '배',
      '상한 = 후보 ' + K + ' ÷ 탐색 ' + state.eps.toFixed(2) + ' = ' + n0(K / state.eps) +
      (state.clip === Infinity ? '' : ' · ' + state.clip + '에서 자름'),
      stats.wMax >= 100 ? 'bad' : (stats.wMax >= 40 ? 'warn' : 'good'));

    const essRatio = stats.ess / NREQ;
    setMetric('ipw-m-ess', n0(stats.ess) + '건',
      '로그의 ' + (essRatio * 100).toFixed(1) + '% · 클릭 ' + (stats.ess * ground.vTrue).toFixed(1) + '건 몫',
      essRatio < 0.01 ? 'bad' : (essRatio < 0.05 ? 'warn' : 'good'));

    updateVerdict();
    updateTable();
    drawAll();

    if (bandTimer) clearTimeout(bandTimer);
    bandTimer = setTimeout(function () {
      bandTimer = null;
      bands = repeats(state.clip, ground.dm);
      updateTable();
      const eHost = $('ipw-chart-est');
      if (eHost) drawEstimates(eHost, stats, bands, ground.vTrue);
    }, 90);
  }

  // 연속으로 들어오는 input 을 한 번으로 모은다.
  // requestAnimationFrame 은 화면에 안 그려지는 동안(스크롤 밖 iframe·숨은 탭) 안 불린다.
  // 이 데모는 글 안에 iframe 으로도 들어가므로 타이머로 모은다.
  function schedule() {
    if (rafId) return;
    rafId = setTimeout(function () { rafId = 0; recompute(); }, 0);
  }

  function readControls() {
    state.eps = EPS_STEPS[+$('ipw-eps').value];
    state.dist = +$('ipw-dist').value;
    state.clip = CLIP_STEPS[+$('ipw-clip').value];
    state.alpha = +$('ipw-qacc').value;
    $('ipw-eps-val').textContent = state.eps.toFixed(2);
    $('ipw-dist-val').textContent = state.dist.toFixed(2);
    $('ipw-clip-val').textContent = clipLabel(state.clip);
    $('ipw-qacc-val').textContent = state.alpha.toFixed(2);
  }

  function applyPreset(str) {
    const p = str.split(',');
    $('ipw-eps').value = EPS_STEPS.indexOf(+p[0]);
    $('ipw-dist').value = p[1];
    $('ipw-clip').value = p[2];
    $('ipw-qacc').value = p[3];
    readControls();
    schedule();
  }

  // =================================================================
  // 6) 붙이기
  // =================================================================
  document.addEventListener('DOMContentLoaded', function () {
    if (!$('ipw-controls')) return;
    buildRaw();
    readControls();
    recompute();   // 구간 막대는 90ms 뒤 타이머가 채운다

    ['ipw-eps', 'ipw-dist', 'ipw-clip', 'ipw-qacc'].forEach(function (id) {
      $(id).addEventListener('input', function () { readControls(); schedule(); });
    });
    document.querySelectorAll('[data-ipw-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () { applyPreset(btn.dataset.ipwPreset); });
    });

    // 폭이 바뀌면 다시 그린다 — viewBox 를 CSS 픽셀에 맞추기 때문에 필요하다
    let resizeTimer = null;
    const onResize = function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { resizeTimer = null; drawAll(); }, 120);
    };
    if (window.ResizeObserver) {
      new ResizeObserver(onResize).observe($('ipw-charts'));
    } else {
      window.addEventListener('resize', onResize);
    }

    // 테마 전환 — SVG 라 색은 var() 가 알아서 따라오지만, 한 번 더 그려 배치까지 맞춘다
    new MutationObserver(function () { drawAll(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  });
})();
