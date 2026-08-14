// ===================================================================
// 피드백 루프 시뮬레이터 — js/feedback-loop-demo.js
//
// 어제 로그로 오늘 배분을 정하고, 오늘 배분이 오늘 로그를 만든다.
// 그 고리를 40세대 돌린다. 진짜 CTR 은 이 파일만 알고 배분 규칙은 모른다.
//
// 난수는 파이썬 random.Random 과 같은 MT19937 을 그대로 구현했다.
// 그래서 기본값(광고 8개 · 시드 37 · 탐색 0% · 세대당 20,000건)은
// posts/feedback-loop-bias.md 의 파이썬 출력과 자릿수까지 같은 값을 낸다.
//   세대 1 클릭 8/10/12/8/9/14/10/6 (합 77)
//   40세대 누적 노출 500/234500/234500/500/208500/102500/2500/500
//   40세대 누적 클릭 17,350 · 오라클 18,831 · 누적 지니 0.563
//
// 그림은 전부 인라인 SVG 다. 각진 디자인과 CSS 토큰(var(--…))이 그대로 먹는다.
// ===================================================================
(function () {
  'use strict';

  // -----------------------------------------------------------------
  // 0) 파이썬 random.Random 호환 난수 (MT19937 + genrand_res53)
  // -----------------------------------------------------------------
  function pyRandom(seed) {
    const mt = new Uint32Array(624);
    let idx = 624;

    function initGenrand(s) {
      mt[0] = s >>> 0;
      for (let i = 1; i < 624; i++) {
        const p = mt[i - 1] ^ (mt[i - 1] >>> 30);
        mt[i] = (Math.imul(1812433253, p) + i) >>> 0;
      }
      idx = 624;
    }

    function initByArray(key) {
      initGenrand(19650218);
      let i = 1, j = 0, k = Math.max(624, key.length);
      for (; k; k--) {
        const p = mt[i - 1] ^ (mt[i - 1] >>> 30);
        mt[i] = ((((mt[i] ^ Math.imul(p, 1664525)) >>> 0) + key[j] + j) >>> 0);
        i++; j++;
        if (i >= 624) { mt[0] = mt[623]; i = 1; }
        if (j >= key.length) j = 0;
      }
      for (k = 623; k; k--) {
        const p = mt[i - 1] ^ (mt[i - 1] >>> 30);
        mt[i] = ((((mt[i] ^ Math.imul(p, 1566083941)) >>> 0) - i) >>> 0);
        i++;
        if (i >= 624) { mt[0] = mt[623]; i = 1; }
      }
      mt[0] = 0x80000000;
      idx = 624;
    }

    function genrand() {
      if (idx >= 624) {
        for (let i = 0; i < 624; i++) {
          const y = ((mt[i] & 0x80000000) | (mt[(i + 1) % 624] & 0x7fffffff)) >>> 0;
          let n = (mt[(i + 397) % 624] ^ (y >>> 1)) >>> 0;
          if (y & 1) n = (n ^ 0x9908b0df) >>> 0;
          mt[i] = n;
        }
        idx = 0;
      }
      let y = mt[idx++];
      y = (y ^ (y >>> 11)) >>> 0;
      y = (y ^ ((y << 7) & 0x9d2c5680)) >>> 0;
      y = (y ^ ((y << 15) & 0xefc60000)) >>> 0;
      y = (y ^ (y >>> 18)) >>> 0;
      return y >>> 0;
    }

    let s = Math.abs(Math.floor(seed)) || 0;
    const key = [];
    if (s === 0) key.push(0);
    while (s > 0) { key.push(s >>> 0 & 0xffffffff); s = Math.floor(s / 4294967296); }
    initByArray(key);

    return function random() {
      const a = genrand() >>> 5, b = genrand() >>> 6;
      return (a * 67108864 + b) * (1.0 / 9007199254740992.0);
    };
  }

  // -----------------------------------------------------------------
  // 1) 설정값
  // -----------------------------------------------------------------
  // 진짜 CTR 사다리. 시스템(배분 규칙)은 이 값을 모른다 — 우리만 안다.
  const LADDER = [
    [9931, 0.0260], [9932, 0.0240], [9933, 0.0230], [9934, 0.0220],
    [9935, 0.0210], [9936, 0.0190], [9937, 0.0170], [9938, 0.0150],
    [9939, 0.0140], [9940, 0.0130], [9941, 0.0120], [9942, 0.0110]
  ];
  const CAP = 6000;      // 광고당 하루 노출 상한
  const FIRST = 500;     // 첫 세대 광고당 상한 (신규 광고 보호)
  const GENS = 40;       // 최대 세대 수
  const PK = 2000;       // 낙관 초기값의 의사노출 건수
  const AUTO_GENS = 30;  // "30세대 자동" 한 번에 도는 세대 수
  const AUTO_MS = 130;

  // 계열 색 토큰. 광고가 일곱 번째부터는 같은 색에 빗금을 얹어 가른다
  // (계열이 넷을 넘으면 색만으로 가르지 않는다).
  const SERIES = ['--series-1', '--series-2', '--series-3', '--series-4', '--series-5', '--series-6'];

  // canvas 폴백 상수와 같은 역할 — :root 토큰이 아직 안 붙은 첫 페인트나
  // getComputedStyle 이 빈 문자열을 줄 때만 쓰는 값이다. css/style.css 라이트 토큰 사본.
  const FALLBACK = { '--paper': '#FFFFFF' };
  const cssVar = (n, fb) =>
    getComputedStyle(document.documentElement).getPropertyValue(n).trim() || fb || FALLBACK[n] || '';

  const $ = id => document.getElementById(id);
  const fmt = n => Math.round(n).toLocaleString('ko-KR');
  const pct = (x, d) => (100 * x).toFixed(d == null ? 1 : d) + '%';

  // -----------------------------------------------------------------
  // 2) 판 상태
  // -----------------------------------------------------------------
  const S = {
    nAds: 8, seed: 37, N: 20000, epsPct: 0, mode: 'even', priorPct: 0,
    ips: false, win: 7,
    ads: [], truth: {}, imps: {}, clicks: {}, hist: [],
    gen: 0, rng: null, oracleRng: null, oracleAlloc: {}, oracleClicks: 0,
    timer: null, autoLeft: 0
  };

  function gini(vals) {
    const v = vals.slice().sort((a, b) => a - b);
    const n = v.length;
    let s = 0, acc = 0;
    for (let i = 0; i < n; i++) { s += v[i]; acc += (i + 1) * v[i]; }
    if (s === 0) return 0;
    return 2 * acc / (n * s) - (n + 1) / n;
  }

  // 추정 CTR 이 높은 광고부터 상한까지 채운다. total 이 떨어지면 끝이다.
  function allocateN(est, total) {
    const a = {};
    S.ads.forEach(ad => { a[ad] = 0; });
    let left = total;
    const order = S.ads.slice().sort((x, y) => est[y] - est[x]);   // 동점이면 광고 번호 순
    for (const ad of order) {
      a[ad] = Math.min(CAP, left);
      left -= a[ad];
      if (left === 0) break;
    }
    return a;
  }

  function estimates() {
    const est = {};
    if (S.priorPct > 0) {
      const pm = S.priorPct / 100;
      S.ads.forEach(ad => { est[ad] = (pm * PK + S.clicks[ad]) / (PK + S.imps[ad]); });
    } else {
      S.ads.forEach(ad => { est[ad] = (S.clicks[ad] + 1) / (S.imps[ad] + 2); });
    }
    return est;
  }

  function reset() {
    stopAuto();
    S.ads = LADDER.slice(0, S.nAds).map(r => r[0]);
    S.truth = {};
    LADDER.slice(0, S.nAds).forEach(r => { S.truth[r[0]] = r[1]; });
    S.imps = {}; S.clicks = {};
    S.ads.forEach(ad => { S.imps[ad] = 0; S.clicks[ad] = 0; });
    S.hist = [];
    S.gen = 0;
    S.rng = pyRandom(S.seed);
    // 오라클: 진짜 CTR 을 처음부터 알았다면 어떻게 배분했을까 — 난수열은 따로 쓴다
    S.oracleRng = pyRandom(S.seed);
    S.oracleAlloc = allocateN(S.truth, S.N);
    S.oracleClicks = 0;
    render();
  }

  function step() {
    if (S.gen >= GENS) return;
    S.gen += 1;

    let a;
    if (S.gen === 1) {
      a = {};
      S.ads.forEach(ad => { a[ad] = FIRST; });
    } else {
      const est = estimates();
      const pool = Math.floor(S.N * (S.epsPct / 100));
      if (S.mode === 'even' && pool > 0) {
        const per = Math.floor(pool / S.nAds);
        a = allocateN(est, S.N - per * S.nAds);
        S.ads.forEach(ad => { a[ad] += per; });
      } else if (S.mode === 'slot' && pool > 0) {
        a = allocateN(est, S.N - pool);
        const out = S.ads.filter(ad => a[ad] === 0);
        if (out.length) {
          const per = Math.floor(pool / out.length);
          out.forEach(ad => { a[ad] += per; });
        }
      } else {
        a = allocateN(est, S.N);
      }
    }

    // 노출 한 건마다 동전을 던진다 (근사 없이 그대로)
    const got = {};
    for (const ad of S.ads) {
      let c = 0;
      const n = a[ad], p = S.truth[ad];
      for (let i = 0; i < n; i++) if (S.rng() < p) c++;
      got[ad] = c;
    }
    S.ads.forEach(ad => { S.imps[ad] += a[ad]; S.clicks[ad] += got[ad]; });
    S.hist.push({ g: S.gen, a: a, got: got, gi: gini(S.ads.map(x => S.imps[x])) });

    // 오라클도 같은 세대를 한 번 돈다
    for (const ad of S.ads) {
      const n = S.gen === 1 ? FIRST : S.oracleAlloc[ad];
      const p = S.truth[ad];
      for (let i = 0; i < n; i++) if (S.oracleRng() < p) S.oracleClicks++;
    }
  }

  // -----------------------------------------------------------------
  // 3) 파생 지표
  // -----------------------------------------------------------------
  const slots = () => Math.min(S.nAds, Math.ceil(S.N / CAP));   // 노출 자리 개수
  const last = () => (S.hist.length ? S.hist[S.hist.length - 1] : null);

  function lockGen() {
    if (!S.hist.length) return null;
    const served = S.hist.map(h => S.ads.filter(ad => h.a[ad] > 0).join(','));
    if (served[served.length - 1].split(',').length === S.nAds) return '없음';
    let lastChange = 1;
    for (let i = 1; i < served.length; i++) if (served[i] !== served[i - 1]) lastChange = i + 1;
    return lastChange;
  }

  // 이번 세대 노출 기준 순위. 상한에 걸려 같은 건수인 광고들은
  // 배분이 실제로 쓴 순서(추정 CTR 내림차순)로 가른다.
  function impRanks() {
    const h = last();
    const est = estimates();
    const arr = S.ads.map(ad => ({ ad: ad, v: h ? h.a[ad] : 0 }));
    arr.sort((x, y) => (y.v - x.v) || (est[y.ad] - est[x.ad]));
    const r = {};
    arr.forEach((o, i) => { r[o.ad] = i + 1; });
    return r;
  }

  // 진짜 상위 k 중 이번 세대 노출 상위 k 에 못 든 광고 수
  function missedCount() {
    const h = last();
    if (!h) return 0;
    const k = slots();
    const trueTop = S.ads.slice(0, k);
    const impTop = S.ads.slice().sort((x, y) => h.a[y] - h.a[x]).slice(0, k);
    return trueTop.filter(ad => impTop.indexOf(ad) < 0).length;
  }

  // 그 광고가 마지막으로 노출을 받은 세대 (없으면 0)
  function lastServed(ad) {
    for (let i = S.hist.length - 1; i >= 0; i--) if (S.hist[i].a[ad] > 0) return S.hist[i].g;
    return 0;
  }

  // 창(window) 안의 로그만으로 "모두 똑같이 띄웠다면 나왔을 평균 CTR" 을 잰다
  function measure() {
    const win = S.win ? S.hist.slice(-S.win) : S.hist;
    if (!win.length) return null;
    const imps = {}, clk = {};
    S.ads.forEach(ad => { imps[ad] = 0; clk[ad] = 0; });
    win.forEach(h => S.ads.forEach(ad => { imps[ad] += h.a[ad]; clk[ad] += h.got[ad]; }));
    const live = S.ads.filter(ad => imps[ad] > 0);
    const tot = S.ads.reduce((s, ad) => s + imps[ad], 0);
    if (!tot) return null;
    const raw = S.ads.reduce((s, ad) => s + clk[ad], 0) / tot;
    const num = live.reduce((s, ad) => s + (tot / imps[ad]) * clk[ad], 0);
    const den = live.reduce((s, ad) => s + (tot / imps[ad]) * imps[ad], 0);
    return { raw: raw, ips: den ? num / den : 0, dead: S.nAds - live.length, gens: win.length };
  }

  const trueMean = () => S.ads.reduce((s, ad) => s + S.truth[ad], 0) / S.nAds;

  // 완전히 굳은 한 세대 배분의 지니 — 누적 지니의 상한
  function lockedGini() {
    const fake = {};
    S.ads.forEach((ad, i) => { fake[ad] = S.nAds - i; });
    const a = allocateN(fake, S.N);
    return gini(S.ads.map(ad => a[ad]));
  }

  // -----------------------------------------------------------------
  // 4) 그림 — 인라인 SVG
  // -----------------------------------------------------------------
  function fillFor(i) { return i < 6 ? 'var(' + SERIES[i] + ')' : 'url(#fb-hatch-' + (i - 6) + ')'; }

  function hatchDefs() {
    // 빗금 선은 바탕색(var(--paper))으로 긋는다 — 라이트·다크 모두 자기 계열색 위에서 읽힌다.
    // 굵기는 테마에 따라 살짝 다르게 (다크에서는 계열색이 밝아 얇아도 보인다).
    const dark = cssVar('--paper', '#FFFFFF').toUpperCase().indexOf('#F') !== 0;
    const w = dark ? 1.8 : 2.2;
    let out = '<defs>';
    for (let i = 0; i < 6; i++) {
      out += '<pattern id="fb-hatch-' + i + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
        '<rect width="6" height="6" fill="var(' + SERIES[i] + ')"/>' +
        '<line x1="0" y1="0" x2="0" y2="6" stroke="var(--paper)" stroke-width="' + w + '"/>' +
        '</pattern>';
    }
    return out + '</defs>';
  }

  function renderBands() {
    const W = 760, H = 300, ml = 88, mr = 108, mt = 24, mb = 32;
    const pw = W - ml - mr, ph = H - mt - mb, colW = pw / GENS;
    const n = S.nAds;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="세대별 노출 점유율 띠 그래프">';
    s += hatchDefs();

    s += '<rect x="' + ml + '" y="' + mt + '" width="' + pw + '" height="' + ph + '" fill="var(--paper)" stroke="var(--rule)" stroke-width="1"/>';
    [10, 20, 30].forEach(g => {
      const x = ml + g * colW;
      s += '<line x1="' + x.toFixed(1) + '" y1="' + mt + '" x2="' + x.toFixed(1) + '" y2="' + (mt + ph) + '" stroke="var(--rule2)" stroke-width="1"/>';
    });

    // 세대별 기둥
    S.hist.forEach((h, gi) => {
      const total = S.ads.reduce((t, ad) => t + h.a[ad], 0);
      if (!total) return;
      let y = mt;
      S.ads.forEach((ad, ai) => {
        const hh = ph * h.a[ad] / total;
        if (hh <= 0) return;
        s += '<rect x="' + (ml + gi * colW).toFixed(2) + '" y="' + y.toFixed(2) +
          '" width="' + (colW + 0.35).toFixed(2) + '" height="' + hh.toFixed(2) + '" fill="' + fillFor(ai) + '"/>';
        y += hh;
      });
    });

    // 왼쪽 이름표 — 1세대의 균등 배분 자리
    S.ads.forEach((ad, i) => {
      const y = mt + ph * (i + 0.5) / n;
      s += '<rect x="0" y="' + (y - 5).toFixed(1) + '" width="7" height="10" fill="' + fillFor(i) + '"/>';
      s += '<text x="12" y="' + (y + 4).toFixed(1) + '" font-size="12.5" fill="var(--text-primary)">' + ad + '</text>';
      s += '<text x="' + (ml - 6) + '" y="' + (y + 4).toFixed(1) + '" font-size="12.5" text-anchor="end" fill="var(--text-muted)">' + pct(S.truth[ad], 2) + '</text>';
    });

    // 오른쪽 이름표 — 마지막 세대에 노출을 받은 광고
    const h = last();
    if (h) {
      const total = S.ads.reduce((t, ad) => t + h.a[ad], 0);
      let y = mt;
      const xEdge = ml + S.hist.length * colW;
      S.ads.forEach((ad, i) => {
        const hh = ph * h.a[ad] / total;
        if (hh > 0) {
          const cy = y + hh / 2;
          s += '<line x1="' + xEdge.toFixed(1) + '" y1="' + cy.toFixed(1) + '" x2="' + (W - mr + 4) + '" y2="' + cy.toFixed(1) + '" stroke="var(--rule)" stroke-width="1"/>';
          s += '<text x="' + (W - mr + 8) + '" y="' + (cy + 4).toFixed(1) + '" font-size="12.5" fill="var(--text-primary)">' + ad + '</text>';
          s += '<text x="' + W + '" y="' + (cy + 4).toFixed(1) + '" font-size="12.5" text-anchor="end" fill="var(--text-muted)">' + pct(h.a[ad] / total, 1) + '</text>';
        }
        y += hh;
      });
      s += '<line x1="' + xEdge.toFixed(1) + '" y1="' + (mt - 4) + '" x2="' + xEdge.toFixed(1) + '" y2="' + (mt + ph + 4) + '" stroke="var(--text-secondary)" stroke-width="1.2" stroke-dasharray="3 3"/>';
    } else {
      s += '<text x="' + (ml + pw / 2) + '" y="' + (mt + ph / 2) + '" font-size="12.5" text-anchor="middle" fill="var(--text-muted)">아직 돌린 세대가 없습니다</text>';
    }

    // 가로축
    [1, 10, 20, 30, 40].forEach(g => {
      const x = ml + (g - 0.5) * colW;
      s += '<text x="' + x.toFixed(1) + '" y="' + (mt + ph + 16) + '" font-size="12.5" text-anchor="middle" fill="var(--text-muted)">' + g + '</text>';
    });
    s += '<text x="' + ml + '" y="' + (mt - 8) + '" font-size="12.5" fill="var(--text-muted)">세로 100% = 그 세대의 노출 ' + fmt(S.N) + '건</text>';
    s += '<text x="' + W + '" y="' + (mt + ph + 16) + '" font-size="12.5" text-anchor="end" fill="var(--text-muted)">세대</text>';
    s += '</svg>';
    $('fb-bands').innerHTML = s;
  }

  function renderBars() {
    const W = 760, rowH = 26, top = 46;
    const n = S.nAds, H = top + n * rowH + 22;
    const h = last();
    const ranks = impRanks();
    const k = slots();

    const trueMax = Math.max.apply(null, S.ads.map(ad => S.truth[ad]));
    const estMax = Math.max(trueMax, S.priorPct / 100);
    const scale = estMax * 1.08;
    const allocMax = h ? Math.max(CAP, Math.max.apply(null, S.ads.map(ad => h.a[ad]))) : CAP;
    const est = estimates();

    const BAR = 128;
    const X1 = 56, X1V = 232;      // 진짜 CTR
    const X2 = 244, X2V = 420;     // 추정 CTR
    const X3 = 432, X3V = 612;     // 이번 세대 노출
    const XCUM = 686, XRANK = W;   // 누적 노출 · 노출 순위

    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="광고별 진짜 CTR·추정 CTR·이번 세대 노출 막대">';
    s += hatchDefs();
    s += '<text x="0" y="14" font-size="12.5" fill="var(--text-muted)">광고</text>';
    s += '<text x="' + X1 + '" y="14" font-size="12.5" fill="var(--text-muted)">진짜 CTR — 시스템은 모른다</text>';
    s += '<text x="' + X2 + '" y="14" font-size="12.5" fill="var(--text-muted)">추정 CTR — 시스템이 믿는 값</text>';
    s += '<text x="' + X3 + '" y="14" font-size="12.5" fill="var(--text-muted)">이번 세대 노출</text>';
    s += '<text x="' + XCUM + '" y="14" font-size="12.5" text-anchor="end" fill="var(--text-muted)">누적 노출</text>';
    s += '<text x="' + XRANK + '" y="14" font-size="12.5" text-anchor="end" fill="var(--text-muted)">노출 순위</text>';
    s += '<line x1="0" y1="' + (top - 12) + '" x2="' + W + '" y2="' + (top - 12) + '" stroke="var(--rule)" stroke-width="1"/>';

    S.ads.forEach((ad, i) => {
      const y = top + i * rowH;
      const cy = y + rowH / 2;
      const barY = cy - 6;
      const served = h ? h.a[ad] : 0;
      const ls = lastServed(ad);
      // 이번 세대 노출이 0건이면 새 로그가 0줄이라 추정값이 그날 값에서 멈춘다
      const frozen = S.gen >= 2 && ls > 0 && ls < S.gen;

      s += '<rect x="0" y="' + (cy - 6) + '" width="6" height="12" fill="' + fillFor(i) + '"/>';
      s += '<text x="11" y="' + (cy + 4) + '" font-size="12.5" font-family="var(--font-mono)" fill="var(--text-primary)">' + ad + '</text>';

      // 진짜 CTR
      s += '<rect x="' + X1 + '" y="' + barY + '" width="' + (BAR * S.truth[ad] / scale).toFixed(1) + '" height="12" fill="var(--accent-secondary)"/>';
      s += '<text x="' + X1V + '" y="' + (cy + 4) + '" font-size="12.5" font-family="var(--font-mono)" text-anchor="end" fill="var(--text-secondary)">' + pct(S.truth[ad], 2) + '</text>';

      // 추정 CTR
      const ew = Math.min(BAR, BAR * est[ad] / scale);
      s += '<rect x="' + X2 + '" y="' + barY + '" width="' + ew.toFixed(1) + '" height="12" fill="' + (frozen ? 'var(--grey)' : 'var(--accent-primary)') + '"/>';
      s += '<text x="' + X2V + '" y="' + (cy + 4) + '" font-size="12.5" font-family="var(--font-mono)" text-anchor="end" fill="' + (frozen ? 'var(--text-muted)' : 'var(--text-secondary)') + '">' + pct(est[ad], 3) + '</text>';

      // 이번 세대 노출 — 0건인 줄은 그 자리에 "언 값 N세대째" 를 대신 적는다
      if (served > 0) {
        // 노출 막대는 그 광고의 계열색 — 왼쪽 띠 그래프의 같은 색 띠와 짝이다
        s += '<rect x="' + X3 + '" y="' + barY + '" width="' + (BAR * served / allocMax).toFixed(1) + '" height="12" fill="' + fillFor(i) + '"/>';
        s += '<text x="' + X3V + '" y="' + (cy + 4) + '" font-size="12.5" font-family="var(--font-mono)" text-anchor="end" fill="var(--text-secondary)">' + fmt(served) + '</text>';
      } else {
        s += '<line x1="' + X3 + '" y1="' + cy + '" x2="' + (X3 + 14) + '" y2="' + cy + '" stroke="var(--state-bad)" stroke-width="2"/>';
        if (frozen) {
          s += '<text x="' + (X3 + 22) + '" y="' + (cy + 4) + '" font-size="12.5" fill="var(--state-warn)">' + (S.gen - ls) + '세대째 언 값</text>';
        }
        s += '<text x="' + X3V + '" y="' + (cy + 4) + '" font-size="12.5" font-family="var(--font-mono)" text-anchor="end" fill="var(--state-bad)">0</text>';
      }

      s += '<text x="' + XCUM + '" y="' + (cy + 4) + '" font-size="12.5" font-family="var(--font-mono)" text-anchor="end" fill="var(--text-secondary)">' + fmt(S.imps[ad]) + '</text>';

      // 노출 순위 + 진짜 순위 대비 이동. 0건이면 순위 대신 "자리 밖"
      if (S.gen === 0) {
        s += '<text x="' + XRANK + '" y="' + (cy + 4) + '" font-size="12.5" text-anchor="end" fill="var(--text-muted)">—</text>';
      } else if (served === 0) {
        s += '<text x="' + XRANK + '" y="' + (cy + 4) + '" font-size="12.5" text-anchor="end" fill="var(--state-bad)">자리 밖</text>';
      } else {
        const r = ranks[ad], d = (i + 1) - r;
        const mark = d > 0 ? '▲' + d : d < 0 ? '▾' + (-d) : '—';
        const col = d < 0 ? 'var(--state-bad)' : d > 0 ? 'var(--state-good)' : 'var(--text-muted)';
        s += '<text x="' + (XRANK - 26) + '" y="' + (cy + 4) + '" font-size="12.5" font-family="var(--font-mono)" text-anchor="end" fill="var(--text-secondary)">' + r + '위</text>';
        s += '<text x="' + XRANK + '" y="' + (cy + 4) + '" font-size="12.5" text-anchor="end" fill="' + col + '">' + mark + '</text>';
      }
    });

    // 노출 자리 경계
    const cut = top + k * rowH;
    s += '<line x1="0" y1="' + cut + '" x2="' + W + '" y2="' + cut + '" stroke="var(--text-secondary)" stroke-width="1.2" stroke-dasharray="4 3"/>';
    s += '<text x="0" y="' + (H - 6) + '" font-size="12.5" fill="var(--text-muted)">점선 위 ' + k + '줄이 진짜 CTR 상위 ' + k + '개 — 자리도 ' + k + '개다</text>';
    s += '</svg>';
    $('fb-bars').innerHTML = s;
  }

  // -----------------------------------------------------------------
  // 5) 지표·해설
  // -----------------------------------------------------------------
  function tile(label, value, cls, sub) {
    return '<div class="fb-metric"><div class="fb-metric-label">' + label + '</div>' +
      '<div class="fb-metric-value' + (cls ? ' ' + cls : '') + '">' + value + '</div>' +
      '<div class="fb-metric-sub">' + sub + '</div></div>';
  }

  function renderMetrics() {
    const h = last();
    const k = slots();
    const best = S.ads[0];
    const ranks = impRanks();
    const missed = missedCount();
    const lg = lockGen();
    const totClicks = S.ads.reduce((s, ad) => s + S.clicks[ad], 0);
    const loss = S.oracleClicks ? (S.oracleClicks - totClicks) / S.oracleClicks : 0;

    let out = '';
    out += tile('세대', S.gen + ' / ' + GENS, '', '한 세대 = 하루 재학습 한 번');

    out += tile('진짜 1위 ' + best,
      h ? fmt(h.a[best]) + '건' : '—',
      h ? (h.a[best] > 0 ? 'is-good' : 'is-bad') : '',
      S.gen ? '누적 ' + fmt(S.imps[best]) + '건 · ' + (h.a[best] > 0 ? '이번 세대 노출 ' + ranks[best] + '위' : '이번 세대는 자리 밖') : '아직 돌린 세대가 없습니다');

    out += tile('1등을 놓친 광고',
      S.gen ? missed + '개' : '—',
      S.gen ? (missed ? 'is-bad' : 'is-good') : '',
      '진짜 상위 ' + k + ' 중 이번 세대 노출 상위 ' + k + '에 못 든 수');

    out += tile('누적 지니계수',
      h ? h.gi.toFixed(3) : '—', '',
      '0 = 똑같이 나눠 가짐 · 완전히 굳으면 ' + lockedGini().toFixed(3));

    if (lg === null) {
      out += tile('굳음', '—', '', '노출 집합이 마지막으로 바뀐 세대');
    } else if (lg === '없음') {
      out += tile('굳음', '없음', 'is-good', '매 세대 모든 광고가 노출을 받는 중');
    } else if (lg === S.gen) {
      out += tile('굳음', '이번 세대 변경', 'is-warn', '노출 집합이 방금 바뀌었습니다');
    } else {
      out += tile('굳음', lg + '세대', 'is-bad', '그 뒤 ' + (S.gen - lg) + '세대 동안 그대로');
    }

    out += tile('오라클 대비 클릭',
      S.gen ? (loss > 0 ? '−' : '+') + Math.abs(100 * loss).toFixed(1) + '%' : '—',
      S.gen ? (loss > 0.02 ? 'is-bad' : loss > 0.005 ? 'is-warn' : 'is-good') : '',
      S.gen ? '누적 ' + fmt(totClicks) + '건 vs 진짜 CTR 로 배분했다면 ' + fmt(S.oracleClicks) + '건' : '진짜 CTR 로 배분한 판과 비교');

    $('fb-metrics').innerHTML = out;
  }

  function renderMeasure() {
    const m = measure();
    const tm = trueMean();
    const cell = (label, value, cls, sub) =>
      '<div class="fb-mcell"><div class="fb-mcell-label">' + label + '</div>' +
      '<div class="fb-mcell-value' + (cls ? ' ' + cls : '') + '">' + value + '</div>' +
      '<div class="fb-mcell-sub">' + sub + '</div></div>';

    let out = cell('진짜 균등 평균 CTR', pct(tm, 4), '', '광고 ' + S.nAds + '개를 똑같이 띄웠다면 나올 값');
    if (!m) {
      out += cell('로그 그대로', '—', 'is-off', '아직 로그가 없습니다');
      out += cell('IPS 가중', S.ips ? '—' : '꺼짐', 'is-off', S.ips ? '아직 로그가 없습니다' : '컨트롤에서 켤 수 있습니다');
      out += cell('성향점수 0인 광고', '—', 'is-off', '창 안에서 노출 0건인 광고');
    } else {
      const winLabel = S.win ? '최근 ' + Math.min(S.win, m.gens) + '세대' : '전체 ' + m.gens + '세대';
      out += cell('로그 그대로', pct(m.raw, 3), m.raw - tm > 0.002 ? 'is-bad' : '',
        winLabel + ' · 진짜 값보다 ' + (m.raw >= tm ? '+' : '−') + Math.abs(100 * (m.raw - tm)).toFixed(3) + '%p');
      if (S.ips) {
        const gap = Math.abs(m.ips - tm);
        out += cell('IPS 가중', pct(m.ips, 3), gap < 0.0005 ? 'is-good' : gap < 0.002 ? 'is-warn' : 'is-bad',
          '진짜 값과 ' + (m.ips >= tm ? '+' : '−') + (100 * gap).toFixed(3) + '%p 차이');
      } else {
        out += cell('IPS 가중', '꺼짐', 'is-off', '켜면 1÷성향점수 로 다시 잽니다');
      }
      out += cell('성향점수 0인 광고', m.dead + '개', m.dead ? 'is-bad' : 'is-good',
        m.dead ? '1÷0 을 못 해 계산에서 통째로 빠집니다' : '모든 광고가 창 안에 노출을 남겼습니다');
    }
    $('fb-measure').innerHTML = out;
  }

  function renderVerdict() {
    const el = $('fb-verdict');
    const h = last();
    const k = slots();
    const best = S.ads[0];

    if (!h) {
      el.innerHTML = '아직 한 세대도 안 돌았습니다. <strong>한 세대 진행</strong>을 눌러 첫날 배분부터 보세요.';
      return;
    }
    if (S.gen === 1) {
      const c = S.ads.reduce((s, ad) => s + h.got[ad], 0);
      const tot = S.ads.reduce((s, ad) => s + h.a[ad], 0);
      const est = estimates();
      const top = S.ads.slice().sort((x, y) => est[y] - est[x])[0];
      el.innerHTML = '첫 세대는 광고 ' + S.nAds + '개에 ' + FIRST + '건씩 똑같이 줬습니다. 클릭 합 <strong>' + c +
        '건</strong>, 관측 CTR ' + pct(c / tot, 3) + '. 추정 1위는 <strong>' + top + '</strong> 인데 진짜 순위로는 ' +
        (S.ads.indexOf(top) + 1) + '위입니다. ' + FIRST + '건은 순위를 정하기에 너무 작은 표본인데, 이 순서가 2세대 노출을 정합니다.';
      return;
    }

    const missed = missedCount();
    const lg = lockGen();
    const bestServed = h.a[best];
    const parts = [];

    if (lg === S.gen) {
      parts.push('이번 세대에 <strong>노출을 받는 광고 집합이 바뀌었습니다</strong>.');
    } else if (lg !== '없음') {
      parts.push('<strong>' + lg + '세대 이후 ' + (S.gen - lg) + '세대 동안 노출을 받는 광고 집합이 그대로</strong>입니다.');
    } else {
      const pool = Math.floor(S.N * (S.epsPct / 100));
      const per = S.mode === 'even' ? Math.floor(pool / S.nAds) : pool;
      parts.push('탐색 예산 ' + fmt(pool) + '건 덕분에 <strong>매 세대 모든 광고가 노출을 받습니다</strong>' +
        (S.mode === 'even' ? ' (광고당 ' + fmt(per) + '건)' : '') + '.');
    }

    if (missed > 0) {
      parts.push('진짜 상위 ' + k + ' 중 <strong>' + missed + '개</strong>가 이번 세대 큰 자리를 못 받았습니다.');
    } else {
      parts.push('이번 세대 노출 상위 ' + k + '가 진짜 상위 ' + k + '와 같습니다.');
    }

    if (bestServed === 0) {
      const ls = lastServed(best);
      parts.push('진짜 1위 ' + best + ' 는 ' + (ls ? ls + '세대 이후 ' : '') + '노출이 0건이라 로그가 0줄입니다. ' +
        '새 데이터가 없으니 추정값이 ' + pct(estimates()[best], 3) + ' 에 얼어 있고, 안에 남은 광고들은 표본이 쌓일수록 진짜 값으로 수렴할 뿐이라 이 값 아래로 내려갈 이유가 없습니다.');
    } else if (S.epsPct > 0 && missed > 0) {
      parts.push('진짜 1위 ' + best + ' 가 이번 세대 ' + fmt(bestServed) + '건을 받았습니다. 표본이 쌓이면 언 값이 풀립니다.');
    } else {
      parts.push('진짜 1위 ' + best + ' 가 이번 세대 ' + fmt(bestServed) + '건을 받고 있습니다.');
    }

    el.innerHTML = parts.join(' ');
  }

  function renderRunState() {
    const done = S.gen >= GENS;
    $('fb-step').disabled = done;
    $('fb-auto').disabled = done;
    $('fb-gen-note').textContent = S.gen === 0
      ? '아직 한 세대도 안 돌았습니다.'
      : done ? '40세대를 다 돌았습니다. 처음으로 를 눌러 다시 시작하세요.'
        : S.gen + '세대까지 돌았습니다.';
  }

  function render() {
    renderBands();
    renderBars();
    renderMetrics();
    renderMeasure();
    renderVerdict();
    renderRunState();
  }

  // -----------------------------------------------------------------
  // 6) 자동 진행
  // -----------------------------------------------------------------
  function stopAuto() {
    if (S.timer) { clearInterval(S.timer); S.timer = null; }
    S.autoLeft = 0;
    const b = $('fb-auto');
    if (b) b.textContent = AUTO_GENS + '세대 자동';
  }

  function startAuto() {
    if (S.timer) { stopAuto(); render(); return; }
    S.autoLeft = AUTO_GENS;
    $('fb-auto').textContent = '멈춤';
    S.timer = setInterval(() => {
      if (S.autoLeft <= 0 || S.gen >= GENS) { stopAuto(); render(); return; }
      S.autoLeft -= 1;
      step();
      render();
    }, AUTO_MS);
  }

  // -----------------------------------------------------------------
  // 7) 컨트롤
  // -----------------------------------------------------------------
  function syncLabels() {
    $('fb-eps-val').textContent = S.epsPct + '%';
    $('fb-prior-val').textContent = S.priorPct > 0 ? S.priorPct.toFixed(1) + '%' : '끔';
  }

  function readControls(resetRun) {
    const nAds = +$('fb-ads').value;
    const seed = Math.max(1, Math.min(9999, Math.round(+$('fb-seed').value || 1)));
    if (+$('fb-seed').value !== seed) $('fb-seed').value = seed;   // 범위 밖 입력을 되돌려 적는다
    const hard = nAds !== S.nAds || seed !== S.seed;
    S.nAds = nAds; S.seed = seed;
    S.epsPct = +$('fb-eps').value;
    S.mode = $('fb-mode').value;
    S.N = +$('fb-n').value;
    S.priorPct = +$('fb-prior').value;
    S.ips = $('fb-ips').checked;
    S.win = +$('fb-win').value;
    syncLabels();
    if (hard || resetRun) { reset(); return; }
    // 세대당 노출이 바뀌면 오라클 배분도 다시 잡는다 (다음 세대부터 적용)
    S.oracleAlloc = allocateN(S.truth, S.N);
    render();
  }

  const PRESETS = {
    base: { eps: 0, mode: 'even', prior: 0 },
    eps: { eps: 5, mode: 'even', prior: 0 },
    prior: { eps: 0, mode: 'even', prior: 3.5 },
    slot: { eps: 8, mode: 'slot', prior: 0 }
  };

  function applyPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    stopAuto();
    $('fb-eps').value = p.eps;
    $('fb-mode').value = p.mode;
    $('fb-prior').value = p.prior;
    $('fb-n').value = '20000';
    readControls(true);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('fb-bands')) return;

    // demo-edu 해설 패널은 컨트롤의 defaultValue 로 "바뀌기 전 값"을 잡는데
    // <select> 에는 defaultValue 가 없어 첫 변경이 조용히 지나간다. 초기값을 박아 둔다.
    ['fb-mode', 'fb-n', 'fb-ads', 'fb-win'].forEach(id => { $(id).defaultValue = $(id).value; });

    ['fb-eps', 'fb-prior'].forEach(id => $(id).addEventListener('input', () => readControls(false)));
    ['fb-mode', 'fb-n', 'fb-win'].forEach(id => $(id).addEventListener('change', () => readControls(false)));
    ['fb-ads', 'fb-seed'].forEach(id => $(id).addEventListener('change', () => readControls(false)));
    $('fb-ips').addEventListener('change', () => readControls(false));

    $('fb-step').addEventListener('click', () => { stopAuto(); step(); render(); });
    $('fb-auto').addEventListener('click', startAuto);
    $('fb-reset').addEventListener('click', () => { readControls(true); });
    document.querySelectorAll('[data-preset]').forEach(b =>
      b.addEventListener('click', () => applyPreset(b.dataset.preset)));

    // 테마 토글 — 인라인 SVG 는 var() 가 그대로 먹지만, 빗금 굵기처럼
    // 계산으로 정하는 값이 있어 data-theme 이 바뀌면 다시 그린다.
    new MutationObserver(() => render())
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    readControls(true);
  });
})();
