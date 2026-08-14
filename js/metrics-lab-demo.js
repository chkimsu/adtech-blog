// ===================================================================
// 지표 실험실 — js/metrics-lab-demo.js
//
// 같은 표본 하나에서 AUC · GAUC · LogLoss · NE · COPC 를 동시에 낸다.
// 슬라이더 넷이 표본과 모델을 바꾼다:
//   분별력      — 모델이 한 요청 안에서 광고를 얼마나 잘 가르나
//   보정 배수   — 예측 확률에 곱하는 수. 순위는 안 건드리고 크기만 민다
//   요청당 광고 — 한 요청이 만드는 노출 수
//   요청 간 편차— 요청마다 기저 CTR 이 얼마나 다른가 (모델이 아니라 데이터 쪽)
//
// 색은 이 파일에 하나도 없다. 그림은 전부 인라인 SVG 이고 채움·선은
// var(--...) 를 그대로 쓴다. 그래서 canvas 처럼 폴백 hex 상수를 둘 자리가 없다.
// (canvas·Chart.js 였다면 var() 가 조용히 실패하므로 cssVar 헬퍼 + 폴백이 필요하다.)
// 테마가 바뀌면 var() 가 알아서 따라오지만, 눈금 글자처럼 JS 가 넣은 조각도
// 같이 다시 그리도록 data-theme 을 MutationObserver 로 지켜본다.
// ===================================================================
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  if (!$('mx-controls')) return;      // 이 데모 페이지가 아니면 아무것도 안 한다

  // ---------------------------------------------------------------
  // 0. 표본을 만드는 규칙
  // ---------------------------------------------------------------
  // 요청 R 건 × 자리 KMAX 개까지 미리 난수를 뽑아 둔다. 슬라이더는 그 난수를
  // 다시 뽑지 않고 해석만 바꾼다 — 그래야 슬라이더를 미는 동안 숫자가
  // 잡음으로 튀지 않고 한 방향으로 움직인다.
  const R = 12000;          // 요청 수
  const KMAX = 8;           // 한 요청의 자리 최대치
  const BASE = 0.025;       // 기저 CTR 2.5% — 글 3절이 쓰는 자리당 CTR 과 같다
  const SW = 0.9;           // 요청 안 진짜 편차 — 글 5절 뉴스피드 표본의 spread 와 같다
  const PMAX = 0.99;        // 확률 상한
  const PMIN = 1e-6;        // 확률 하한 (log 가 터지지 않게)
  const SEED = 20260814;    // 글 5절 코드와 같은 씨앗

  const DEF = { d: 0.494, sb: 0.915, m: 1, K: 5 };

  // 오른쪽 카드에 띄우는 요청 여섯 — 미리 고른 표본 색인이다.
  // 글 3절의 r-8f21 같은 번호는 그 절 데이터 전용이라 여기서는 안 쓴다.
  const SHOW = [
    { i: 32, id: 'r-1e57', place: 'feed_mid' },
    { i: 10384, id: 'r-4b12', place: 'main_top' },
    { i: 5, id: 'r-8a90', place: 'feed_mid' },
    { i: 37, id: 'r-6d33', place: 'main_top' },
    { i: 179, id: 'r-2f44', place: 'search_top' },
    { i: 28, id: 'r-7c08', place: 'search_top' },
  ];
  const AD_IDS = ['5514', '4827', '3963', '3308', '2740', '2156', '1682', '1194'];

  // ---------------------------------------------------------------
  // 1. 난수 사전 추출
  // ---------------------------------------------------------------
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const zb = new Float64Array(R);              // 요청 수준 (난이도)
  const zw = new Float64Array(R * KMAX);       // 요청 안 광고 수준 (진짜)
  const ze = new Float64Array(R * KMAX);       // 모델이 못 본 몫
  const un = new Float64Array(R * KMAX);       // 클릭 뽑기
  (function drawRandoms() {
    const rnd = mulberry32(SEED);
    const gauss = () => {
      let u = 0, v = 0;
      while (u === 0) u = rnd();
      while (v === 0) v = rnd();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    for (let r = 0; r < R; r++) {
      zb[r] = gauss();
      for (let j = 0; j < KMAX; j++) {
        const i = r * KMAX + j;
        zw[i] = gauss(); ze[i] = gauss(); un[i] = rnd();
      }
    }
  })();

  // ---------------------------------------------------------------
  // 2. 표본 만들기 — (분별력 d, 요청 간 편차 sb, 자리 수 K) 에만 달렸다
  //    보정 배수 m 은 여기 안 들어간다. 그래야 배수만 밀 때 다시 안 만든다.
  // ---------------------------------------------------------------
  let sample = null;
  let sampleKey = '';

  function buildSample(d, sb, K) {
    const key = d + '|' + sb + '|' + K;
    if (sampleKey === key) return sample;

    const corr = (sb * sb + SW * SW) / 2;       // 평균이 BASE 로 남게 하는 보정항
    const dd = Math.sqrt(Math.max(0, 1 - d * d));
    const n = R * K;
    const raw = new Float64Array(n);
    const lab = new Uint8Array(n);
    let clicks = 0, rawSum = 0, k = 0;

    for (let r = 0; r < R; r++) {
      const u = sb * zb[r];
      for (let j = 0; j < K; j++) {
        const i = r * KMAX + j;
        const v = SW * zw[i];
        let pt = BASE * Math.exp(u + v - corr);       // 진짜 확률
        if (pt > PMAX) pt = PMAX;
        const y = un[i] < pt ? 1 : 0;
        // 모델은 요청 수준 u 는 그대로 보고, 요청 안 차이 v 는 d 만큼만 본다
        raw[k] = BASE * Math.exp(u + d * v + dd * SW * ze[i] - corr);
        lab[k] = y; rawSum += raw[k]; clicks += y; k++;
      }
    }

    // 평균은 맞게 학습됐다고 둔다 — 배수 1.00 에서 예측 총합 = 실제 클릭 수
    const norm = rawSum > 0 ? clicks / rawSum : 1;

    sampleKey = key;
    sample = { d, sb, K, n, raw, lab, clicks, norm };
    return sample;
  }

  // ---------------------------------------------------------------
  // 3. 지표 — 표본과 보정 배수로 다섯 숫자를 낸다
  // ---------------------------------------------------------------
  const GRID = 100;   // ROC 를 그릴 가로 눈금 수

  function score(s, m) {
    const n = s.n, lab = s.lab, K = s.K;
    const pred = new Float64Array(n);
    let predSum = 0, clipped = 0;
    for (let a = 0; a < n; a++) {
      let p = m * s.norm * s.raw[a];
      if (p > PMAX) { p = PMAX; clipped++; } else if (p < PMIN) p = PMIN;
      pred[a] = p; predSum += p;
    }

    const P = s.clicks, N = n - P;

    // --- 전체 AUC — 순위 합 (동점은 평균 순위) ---
    const idx = new Array(n);
    for (let a = 0; a < n; a++) idx[a] = a;
    idx.sort((a, b) => pred[a] - pred[b]);
    let rankSumPos = 0, i = 0;
    while (i < n) {
      let j = i;
      while (j + 1 < n && pred[idx[j + 1]] === pred[idx[i]]) j++;
      const avg = (i + j) / 2 + 1;
      for (let t = i; t <= j; t++) if (lab[idx[t]] === 1) rankSumPos += avg;
      i = j + 1;
    }
    const auc = P && N ? (rankSumPos - P * (P + 1) / 2) / (P * N) : 0.5;

    // --- 전체 ROC 를 눈금 위에서 읽는다 (아래 계단) ---
    const rocAll = new Float64Array(GRID + 1);
    if (P && N) {
      let tp = 0, fp = 0, g = 0;
      for (let a = n - 1; a >= 0; a--) {
        if (lab[idx[a]] === 1) { tp++; continue; }
        fp++;
        while (g < GRID && Math.floor((g / GRID) * N) + 1 === fp) { rocAll[g] = tp / P; g++; }
      }
      while (g <= GRID) { rocAll[g] = 1; g++; }
    }
    rocAll[GRID] = 1;

    // --- GAUC 와 요청 안 평균 ROC ---
    let gWin = 0, gPair = 0, gSum = 0, used = 0, dropped = 0;
    const rocIn = new Float64Array(GRID + 1);
    let wSum = 0;
    const ord = new Array(K);
    for (let r = 0; r < R; r++) {
      const s0 = r * K;
      let pr = 0;
      for (let a = 0; a < K; a++) if (lab[s0 + a] === 1) pr++;
      const nr = K - pr;
      if (pr === 0 || nr === 0) { dropped++; continue; }

      let win = 0;
      for (let a = 0; a < K; a++) {
        if (lab[s0 + a] !== 1) continue;
        for (let b = 0; b < K; b++) {
          if (lab[s0 + b] !== 0) continue;
          const pa = pred[s0 + a], pb = pred[s0 + b];
          win += pa > pb ? 1 : pa === pb ? 0.5 : 0;
        }
      }
      const pairs = pr * nr;
      gWin += win; gPair += pairs; gSum += win / pairs; used++;

      // 이 요청의 ROC 계단을 눈금 위에 얹는다
      for (let a = 0; a < K; a++) ord[a] = s0 + a;
      ord.sort((a, b) => pred[b] - pred[a]);
      let tp = 0, fp = 0, g = 0;
      for (let a = 0; a < K; a++) {
        if (lab[ord[a]] === 1) { tp++; continue; }
        fp++;
        while (g < GRID && Math.floor((g / GRID) * nr) + 1 === fp) { rocIn[g] += pairs * (tp / pr); g++; }
      }
      while (g < GRID) { rocIn[g] += pairs; g++; }
      wSum += pairs;
    }
    if (wSum > 0) for (let g = 0; g < GRID; g++) rocIn[g] /= wSum;
    rocIn[GRID] = 1;

    const gauc = gPair ? gWin / gPair : 0.5;
    const gaucMean = used ? gSum / used : 0.5;

    // --- LogLoss · NE · COPC ---
    let ll = 0;
    for (let a = 0; a < n; a++) ll += lab[a] ? -Math.log(pred[a]) : -Math.log(1 - pred[a]);
    ll /= n;
    const ybar = P / n;
    const H = ybar > 0 && ybar < 1
      ? -(ybar * Math.log(ybar) + (1 - ybar) * Math.log(1 - ybar))
      : 1;

    return {
      pred, auc, gauc, gaucMean, ll, ne: ll / H, entropy: H,
      copc: predSum > 0 ? P / predSum : 0,
      predMean: predSum / n, ctr: ybar,
      n, clicks: P, used, dropped, pairsIn: gPair, pairsAll: P * N,
      clipped, rocAll, rocIn,
    };
  }

  // ---------------------------------------------------------------
  // 4. ROC 그림 (인라인 SVG)
  // ---------------------------------------------------------------
  // 아래 네 값은 HTML 안 SVG 의 눈금·축과 같은 좌표여야 한다
  const PL = { x0: 58, x1: 384, y0: 16, y1: 244 };
  const px = (x) => PL.x0 + x * (PL.x1 - PL.x0);
  const py = (y) => PL.y1 - y * (PL.y1 - PL.y0);

  function curvePath(arr) {
    let s = '';
    for (let g = 0; g <= GRID; g++) {
      s += (g ? 'L' : 'M') + px(g / GRID).toFixed(2) + ' ' + py(arr[g]).toFixed(2) + ' ';
    }
    return s.trim();
  }

  function gapPath(top, bottom) {
    let s = 'M' + px(0).toFixed(2) + ' ' + py(top[0]).toFixed(2) + ' ';
    for (let g = 1; g <= GRID; g++) s += 'L' + px(g / GRID).toFixed(2) + ' ' + py(top[g]).toFixed(2) + ' ';
    for (let g = GRID; g >= 0; g--) s += 'L' + px(g / GRID).toFixed(2) + ' ' + py(bottom[g]).toFixed(2) + ' ';
    return s + 'Z';
  }

  function drawRoc(res) {
    $('mx-roc-gap').setAttribute('d', gapPath(res.rocAll, res.rocIn));
    $('mx-roc-all').setAttribute('d', curvePath(res.rocAll));
    $('mx-roc-in').setAttribute('d', curvePath(res.rocIn));

    // 값 이름표는 오른쪽 아래에 못 박아 둔다. 곡선 위에 붙이면 어느 자리에 두든
    // 슬라이더에 따라 곡선이 그 자리로 올라와 글자를 가로지른다. 오른쪽 아래
    // (FPR 0.6 위·TPR 0.2 아래)는 어떤 ROC 도 지나가지 않는 칸이다.
    $('mx-roc-tag-all').textContent = '전체 AUC ' + res.auc.toFixed(4);
    $('mx-roc-tag-in').textContent = 'GAUC ' + res.gauc.toFixed(4);
  }

  // ---------------------------------------------------------------
  // 5. 화면 채우기
  // ---------------------------------------------------------------
  const fmt4 = (x) => x.toFixed(4);
  const fmtPct = (x, n) => (x * 100).toFixed(n == null ? 2 : n) + '%';
  // 넷째 자리 아래는 화면에 안 뜨는 자리다 — 부호만 붙으면 안 움직인 것이 움직인 것처럼 보인다
  const sign4 = (x) => (Math.abs(x) < 5e-5 ? '±' : x > 0 ? '+' : '−') + Math.abs(x).toFixed(4);
  const signPct = (x) => (x >= 0 ? '+' : '−') + Math.abs(x * 100).toFixed(1) + '%';
  const grp = (x) => Math.round(x).toLocaleString('en-US');

  let baseline = null;      // 기본값 상태의 지표 — 게이트가 견주는 자리
  let showAt = 0;           // 오른쪽에 띄운 요청

  function setCard(id, valueText, subText, state) {
    const v = $('mx-' + id + '-v');
    v.textContent = valueText;
    v.className = 'mx-metric-value' + (state ? ' is-' + state : '');
    $('mx-' + id + '-s').innerHTML = subText;
  }

  function gateBadge(id, text, state) {
    const b = $('mx-' + id + '-g');
    b.textContent = text;
    b.className = 'mx-gate is-' + state;
  }

  function render() {
    const d = +$('mx-skill').value;
    const sb = +$('mx-spread').value;
    const m = +$('mx-slope').value;
    const K = +$('mx-slots').value;

    $('mx-skill-v').textContent = (d * 100).toFixed(1);
    $('mx-spread-v').textContent = sb.toFixed(2);
    $('mx-slope-v').textContent = m.toFixed(2) + '×';
    $('mx-slots-v').textContent = K + '개';

    const s = buildSample(d, sb, K);
    const res = score(s, m);
    if (!baseline) baseline = res;

    // 요청 간 편차와 자리 수는 데이터를 바꾼다 — 평가 표본 자체가 달라진다.
    // 그러면 "기존 모델 대비" 문턱(GAUC -0.001 · NE +0.5%)은 견줄 자리가 없다.
    // 절대 문턱(NE 1.0 · COPC 0.97~1.03)만 표본이 달라도 그대로 유효하다.
    const sameSample = (sb === DEF.sb && K === DEF.K);
    const NOCMP = '기준과 <b>다른 표본</b>이라 견줄 수 없다';

    // --- 지표 다섯 칸 ---
    const dAuc = res.auc - baseline.auc;
    setCard('auc', fmt4(res.auc),
      (sameSample ? '기준 대비 <b>' + sign4(dAuc) + '</b>' : NOCMP) +
      ' · 전체 짝 ' + grp(res.pairsAll) + '개', 'plain');
    gateBadge('auc', '기록만', 'note');

    const dGauc = res.gauc - baseline.gauc;
    setCard('gauc', fmt4(res.gauc),
      (sameSample ? '기준 대비 <b>' + sign4(dGauc) + '</b>' : NOCMP) +
      ' · 요청 안 짝 ' + grp(res.pairsIn) + '개', 'plain');
    gateBadge('gauc',
      !sameSample ? '표본이 다름' : dGauc <= -0.001 ? '중단' : '통과',
      !sameSample ? 'note' : dGauc <= -0.001 ? 'bad' : 'good');

    setCard('ll', res.ll.toFixed(5),
      (sameSample ? '기저엔트로피 ' + res.entropy.toFixed(5) : '기저 CTR 이 달라져 <b>비교 자체가 안 된다</b>') +
      ' · 실제 CTR ' + fmtPct(res.ctr, 3), 'plain');
    gateBadge('ll', sameSample ? '문턱 없음' : '비교 불가', 'note');

    const dNe = baseline.ne > 0 ? (res.ne - baseline.ne) / baseline.ne : 0;
    const neBad = res.ne >= 1.0;
    setCard('ne', fmt4(res.ne),
      (sameSample ? '기준 대비 <b>' + signPct(dNe) + '</b>' : '표본이 달라도 <b>NE 는 견줄 수 있다</b>') +
      ' · 1.0 은 상수 모델과 같다', neBad ? 'bad' : 'plain');
    gateBadge('ne',
      neBad ? '즉시 중단' : !sameSample ? '절댓값만' : dNe >= 0.005 ? '중단' : '통과',
      neBad ? 'bad' : !sameSample ? 'note' : dNe >= 0.005 ? 'bad' : 'good');

    const copcBad = res.copc < 0.97 || res.copc > 1.03;
    const meanOff = res.ctr > 0 ? (res.predMean - res.ctr) / res.ctr : 0;
    setCard('copc', res.copc.toFixed(3),
      '예측 평균 ' + fmtPct(res.predMean, 3) + ' (실제 대비 <b>' + signPct(meanOff) + '</b>)',
      copcBad ? 'bad' : 'plain');
    gateBadge('copc', copcBad ? '중단' : Math.abs(meanOff) > 0.03 ? '즉시 중단' : '통과',
      copcBad || Math.abs(meanOff) > 0.03 ? 'bad' : 'good');

    // --- 표본 한 줄 ---
    $('mx-shape').innerHTML =
      '요청 <b>' + grp(R) + '</b>건 × 자리 <b>' + K + '</b>개 = 노출 <b>' + grp(res.n) + '</b>건 · ' +
      '클릭 <b>' + grp(res.clicks) + '</b>건 · ' +
      'GAUC 가 쓰는 요청 <b>' + grp(res.used) + '</b>건 / 버리는 요청 <b>' + grp(res.dropped) + '</b>건 (' +
      (res.dropped / R * 100).toFixed(1) + '%)';

    // --- 한 줄 해석 ---
    $('mx-verdict').innerHTML = verdict(res, d, sb, m, K);

    drawRoc(res);
    drawRequest(res, K, m);
  }

  function verdict(res, d, sb, m, K) {
    // 화면에 뜬 두 값을 빼서 나온 수와 같아야 한다 — 원값끼리 빼면 넷째 자리가 어긋난다
    const gap = +res.auc.toFixed(4) - +res.gauc.toFixed(4);
    if (m >= 1.5 || m <= 0.7) {
      return '예측을 <b>' + m.toFixed(2) + '배</b>로 밀었습니다. 순위 지표는 제자리인데 ' +
        'NE 가 <b>' + fmt4(res.ne) + '</b>, COPC 가 <b>' + res.copc.toFixed(3) + '</b> 입니다 — ' +
        '크기를 재는 지표만 무너집니다.';
    }
    if (sb >= 1.2) {
      return '요청 간 편차가 큽니다. 전체 AUC 와 GAUC 의 간격이 <b>' + gap.toFixed(4) + '</b> 입니다. ' +
        '그 간격은 요청을 가로지른 짝 ' + grp(res.pairsAll - res.pairsIn) + '개가 만든 몫입니다.';
    }
    if (sb <= 0.3) {
      return '요청 간 편차가 거의 없습니다. 전체 AUC <b>' + fmt4(res.auc) + '</b> 와 GAUC <b>' +
        fmt4(res.gauc) + '</b> 이 붙습니다 — 요청을 가로지른 짝도 요청 안 짝만큼 어려워졌기 때문입니다.';
    }
    if (d >= 0.75) {
      return '요청 안 분별력이 높습니다. AUC 와 GAUC 가 <b>같이</b> 올랐습니다 — ' +
        '경매가 실제로 쓰는 능력이 좋아진 경우가 이 모습입니다.';
    }
    if (d <= 0.2) {
      return '요청 안에서는 거의 못 가릅니다. GAUC 가 <b>' + fmt4(res.gauc) + '</b> 로 0.5 에 가까운데 ' +
        '전체 AUC 는 <b>' + fmt4(res.auc) + '</b> 입니다 — 그 차이는 전부 지면·요청 구분에서 왔습니다.';
    }
    return '자리 <b>' + K + '</b>개 기준입니다. 전체 AUC <b>' + fmt4(res.auc) + '</b> 와 GAUC <b>' +
      fmt4(res.gauc) + '</b> 의 간격은 <b>' + gap.toFixed(4) + '</b> 입니다. ' +
      '게이트는 GAUC · NE · COPC 셋만 봅니다.';
  }

  // ---------------------------------------------------------------
  // 6. 오른쪽 카드 — 요청 하나 안의 순위
  // ---------------------------------------------------------------
  function drawRequest(res, K, m) {
    const show = SHOW[showAt];
    $('mx-req-id').textContent = show.id;
    $('mx-req-place').textContent = show.place;

    const s0 = show.i * K;
    const rows = [];
    for (let j = 0; j < K; j++) {
      rows.push({ ad: AD_IDS[j], p: res.pred[s0 + j], y: sample.lab[s0 + j] });
    }
    rows.sort((a, b) => b.p - a.p);
    const top = rows[0].p || 1;

    let pos = 0, neg = 0, win = 0;
    for (const a of rows) { if (a.y) pos++; else neg++; }
    for (const a of rows) {
      if (!a.y) continue;
      for (const b of rows) {
        if (b.y) continue;
        win += a.p > b.p ? 1 : a.p === b.p ? 0.5 : 0;
      }
    }

    let html = '';
    rows.forEach((a, k) => {
      const w = Math.max(2, (a.p / top) * 100);
      html += '<li class="mx-ad' + (a.y ? ' is-click' : '') + '">' +
        '<span class="mx-ad-rank">' + (k + 1) + '</span>' +
        '<span class="mx-ad-id">' + a.ad + '</span>' +
        '<span class="mx-ad-bar"><i style="width:' + w.toFixed(1) + '%"></i></span>' +
        '<span class="mx-ad-p">' + (a.p * 100).toFixed(2) + '%</span>' +
        '<span class="mx-ad-y">' + (a.y ? '클릭' : '—') + '</span>' +
        '</li>';
    });
    $('mx-req-list').innerHTML = html;

    const pairs = pos * neg;
    $('mx-req-foot').innerHTML = pairs === 0
      ? '<b>클릭 ' + pos + '건</b> — 짝을 하나도 못 만듭니다. 이 요청은 GAUC 계산에서 버립니다. ' +
        '이 표본에서 그런 요청이 <b>' + (res.dropped / R * 100).toFixed(1) + '%</b> 입니다.'
      : '이 요청 안 짝 <b>' + win.toFixed(win % 1 ? 1 : 0) + ' / ' + pairs + '</b> → 요청 안 AUC <b>' +
        (win / pairs).toFixed(3) + '</b>. GAUC 는 이런 요청 ' + grp(res.used) + '건의 짝을 다 더해서 냅니다.';

    $('mx-req-note').innerHTML = m === 1
      ? '예측 내림차순입니다. 자리 배정은 이 순서가 정합니다.'
      : '예측에 <b>' + m.toFixed(2) + '배</b>를 곱한 값입니다. 숫자는 바뀌었는데 <b>순서는 그대로</b>입니다.';
  }

  // ---------------------------------------------------------------
  // 7. 글의 숫자로 검산 — 글 3절 데이터 (요청 6건 × 자리 5개)
  // ---------------------------------------------------------------
  const POST3 = [
    ['r-8f21', 'main_top', [[3.52, 0], [3.04, 1], [2.60, 1], [2.20, 0], [1.84, 0]]],
    ['r-9c04', 'main_top', [[2.88, 1], [2.44, 0], [2.08, 0], [1.76, 1], [1.48, 0]]],
    ['r-3ab7', 'feed_mid', [[2.32, 0], [2.00, 0], [1.52, 1], [1.40, 0], [1.16, 0]]],
    ['r-5d18', 'feed_mid', [[1.92, 0], [1.64, 0], [1.44, 1], [1.16, 0], [0.96, 0]]],
    ['r-7e60', 'search_top', [[1.56, 0], [1.32, 0], [1.12, 0], [0.92, 0], [0.76, 0]]],
    ['r-2c95', 'search_top', [[1.24, 0], [1.04, 0], [0.88, 0], [0.72, 0], [0.60, 0]]],
  ];

  function pairWins(rows) {
    let w = 0, t = 0;
    for (const [pa, ya] of rows) {
      if (ya !== 1) continue;
      for (const [pb, yb] of rows) {
        if (yb !== 0) continue;
        t++; w += pa > pb ? 1 : pa === pb ? 0.5 : 0;
      }
    }
    return [w, t];
  }

  function fillCheck() {
    const flat = [];
    POST3.forEach(([, , rows]) => rows.forEach((x) => flat.push(x)));
    const [W, T] = pairWins(flat);

    let gw = 0, gt = 0, sum = 0, used = 0;
    let body = '';
    POST3.forEach(([id, place, rows]) => {
      const [w, t] = pairWins(rows);
      if (t) { gw += w; gt += t; sum += w / t; used++; }
      body += '<tr><td class="mx-mono">' + id + '</td><td class="mx-mono">' + place + '</td>' +
        rows.map(([p, y]) => '<td class="mx-num' + (y ? ' is-click' : '') + '">' +
          p.toFixed(2) + '</td>').join('') +
        '<td class="mx-num">' + (t ? w + ' / ' + t : '—') + '</td>' +
        '<td class="mx-num">' + (t ? (w / t).toFixed(3) : '정의 불가') + '</td></tr>';
    });
    $('mx-check-body').innerHTML = body;

    $('mx-check-out').innerHTML =
      '<li>전체 AUC — 짝 <b>' + W + ' / ' + T + '</b> = <b>' + (W / T).toFixed(4) + '</b></li>' +
      '<li>GAUC(짝 가중) — 짝 <b>' + gw + ' / ' + gt + '</b> = <b>' + (gw / gt).toFixed(4) + '</b></li>' +
      '<li>GAUC(단순 평균) — 요청 ' + used + '건의 평균 = <b>' + (sum / used).toFixed(4) + '</b></li>' +
      '<li>같은 요청 짝 <b>' + gt + '</b>개 · 요청을 가로지른 짝 <b>' + (T - gt) + '</b>개</li>';
  }

  // ---------------------------------------------------------------
  // 8. 이벤트
  // ---------------------------------------------------------------
  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; render(); });
  }

  ['mx-skill', 'mx-spread', 'mx-slope', 'mx-slots'].forEach((id) => {
    $(id).addEventListener('input', schedule);
  });

  $('mx-req-next').addEventListener('click', () => {
    showAt = (showAt + 1) % SHOW.length;
    schedule();
  });

  document.querySelectorAll('[data-mx-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.mxPreset.split(',').map(Number);
      $('mx-skill').value = p[0];
      $('mx-spread').value = p[1];
      $('mx-slope').value = p[2];
      $('mx-slots').value = p[3];
      schedule();
    });
  });

  // 테마가 바뀌면 다시 그린다. 그림 자체는 var(--...) 라 색이 알아서 따라오지만,
  // JS 가 붙인 이름표 위치까지 같은 상태로 맞춰 두려고 한 번 더 돌린다.
  new MutationObserver(schedule).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme'],
  });

  // ---------------------------------------------------------------
  // 9. 시작
  // ---------------------------------------------------------------
  $('mx-skill').value = DEF.d;
  $('mx-spread').value = DEF.sb;
  $('mx-slope').value = DEF.m;
  $('mx-slots').value = DEF.K;
  fillCheck();
  render();
})();
