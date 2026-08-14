// ===================================================================
// 신호 소실 계단 — js/signal-loss-demo.js
//
// 짝 글: posts/privacy-signal-loss.md
// 이 파일의 숫자는 전부 그 글에서 가져왔다. 새 값을 만들지 않는다.
// 어느 절에서 왔는지는 상수 옆에 적어 뒀다.
//
// 그림은 전부 인라인 SVG 다. canvas 가 아니므로 var(--...) 가 그대로 먹고,
// 그래서 이 파일에는 hex 폴백 상수가 하나도 없다(색 값 0개).
// 그래도 테마가 바뀌면 다시 그린다 — MutationObserver 로 data-theme 을 본다.
// ===================================================================
(function () {
  'use strict';

  // =================================================================
  // 1) 글에서 그대로 가져온 값
  // =================================================================

  // 도입부 — 캠페인 c-4417 의 2026-08-12 하루
  const IMP = { total: 12000000, web: 7800000, ios: 4200000 };

  // 9절 전환 분해(웹 3,120) + 도입부 iOS 창1 포스트백 940
  const POOL = { own: 1950, pixel: 780, mmp: 270, offline: 120, ios: 940 };
  const CONV_TOTAL = POOL.own + POOL.pixel + POOL.mmp + POOL.offline + POOL.ios; // 4,060

  // 3절 — 피처군을 뺐을 때의 오프라인 AUC 변화 [열린 RTB, 담장 안]
  const AUC = {
    open: 0.762, wall: 0.771,
    cookie: [0.040, 0.007],  // 관심사 세그먼트(0.021/0.004) + 크로스 사이트 리타겟(0.019/0.003)
    idfa: [0.016, 0.003],    // 크로스 앱 최근 행동
    freq: [0.012, 0.002]     // 식별자 기반 노출빈도·최근성
    // 셋을 다 빼면 0.762 - 0.068 = 0.694 / 0.771 - 0.012 = 0.759 — 글 3절 표와 같다
  };

  // 4절 — 집계로 오면 규모가 작은 칸은 값을 못 받는다(940건 중 415건이 값 없음)
  const VALUE_RATE = 525 / 940;    // 0.5585 — 값이 오는 비율
  const NOVALUE_RATE = 415 / 940;  // 0.4415 — 건수만 오는 비율

  // 4절 조합표(값이 오는 23개 조합: 270 / 155 / 100건) × 7절 억제율(93.6 / 69.5 / 1.6%)
  // → 집계로 온 전환 중 임계 억제로 칸째 지워지는 비율
  const SUPPRESS = (270 * 0.936 + 155 * 0.695 + 100 * 0.016) / 525; // 0.6896

  // 6절 — 집계 라벨의 계수 표준편차가 3.3배, 같은 정밀도까지 데이터 11배
  const SD_MULT = 3.3;
  const DATA_MULT = 11;

  // 7절 — 라플라스 노이즈 b=20, 표준편차 28.3건, 50건 미만 억제
  const LAP_B = 20, LAP_SD = 28.3, SUPPRESS_CUT = 50;
  const DIFF_SD = 40.0;            // 두 칸의 차이에 실리는 노이즈 표준편차
  const LEVELS = [10, 40, 120, 400, 1200, 4000];
  const REL_SD = [282.8, 70.7, 23.6, 7.1, 2.4, 0.7];   // 상대SD%
  const SUP_RATE = [93.6, 69.5, 1.6, 0.0, 0.0, 0.0];   // 억제율%
  const WEEK_SD = [106.9, 26.6, 8.9, 2.7, 0.9, 0.3];   // 7일 합산 상대SD%
  const MEAN_ERR = [200.3, 50.1, 16.6, 5.1, 1.7, 0.5]; // 평균오차%

  // 8절 — iOS 앱 지면 빈도
  const FREQ = {
    imp: 4200000, uniq: 600000, avg: 7.0,
    capped: 2202000,          // 상한 5회를 걸면 남는 노출
    topUsers: 30000, topImp: 942000
  };

  // =================================================================
  // 2) 상태
  // =================================================================
  const SWITCHES = ['cookie', 'idfa', 'label', 'freq', 'noise'];
  const state = { cookie: true, idfa: true, label: true, freq: true, noise: true };
  let levelIdx = 1;            // 기본 = 하루 전환 40건

  const $ = id => document.getElementById(id);
  const num = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const pct = (x, d) => x.toFixed(d == null ? 1 : d) + '%';

  // =================================================================
  // 3) 계산 — 계기 넷
  // =================================================================
  function compute() {
    const s = state;

    // 못 봄: 3rd-party 쿠키가 끊기면 광고주 픽셀 경유 780건이 안 붙는다(9절)
    const lost = s.cookie ? 0 : POOL.pixel;
    const rest = CONV_TOTAL - lost;

    // 집계로 오는 전환
    //  - IDFA 가 끊기면 iOS 앱 940 + MMP 앱 270 이 포스트백/집계로 바뀐다
    //  - 유저 단위 라벨 자체를 끄면 남은 전환이 전부 집계가 된다
    const aggByIdfa = s.idfa ? 0 : (POOL.ios + POOL.mmp);
    const agg = s.label ? aggByIdfa : rest;
    const ind = rest - agg;                                  // 개인 라벨로 남는 건수

    const suppressed = s.noise ? 0 : agg * SUPPRESS;         // 임계 억제로 칸째 지워짐
    const survive = agg - suppressed;
    const aggValue = survive * VALUE_RATE;                   // 집계지만 값이 오는 건수
    const aggCount = survive * NOVALUE_RATE;                 // 건수만 오는 건수

    // 계기 1 — 타겟 가능 유저 비율 (크로스 신호가 붙는 노출)
    const targetable = (s.cookie ? IMP.web : 0) + (s.idfa ? IMP.ios : 0);
    const aucOpen = AUC.open
      - (s.cookie ? 0 : AUC.cookie[0]) - (s.idfa ? 0 : AUC.idfa[0]) - (s.freq ? 0 : AUC.freq[0]);
    const aucWall = AUC.wall
      - (s.cookie ? 0 : AUC.cookie[1]) - (s.idfa ? 0 : AUC.idfa[1]) - (s.freq ? 0 : AUC.freq[1]);

    // 계기 2 — 값이 오는 전환의 비율
    const observed = ind + aggValue;

    // 계기 3 — pCVR 학습의 유효 표본(개인 라벨 줄 수로 환산). 집계 한 줄은 1/11 값(6절)
    const effective = ind + survive / DATA_MULT;

    // 계기 4 — 하루 전환 n 건짜리 광고 하나의 지표 흔들림 폭(상대 표준편차)
    const n = LEVELS[levelIdx];
    const sampleRel = Math.sqrt(n) / n * (s.label ? 1 : SD_MULT); // 집계면 계수 흔들림 3.3배
    const noiseRel = s.noise ? 0 : REL_SD[levelIdx] / 100;
    const spread = Math.sqrt(sampleRel * sampleRel + noiseRel * noiseRel);

    return {
      lost, agg, ind, suppressed, survive, aggValue, aggCount,
      targetable, aucOpen, aucWall, observed, effective,
      n, sampleRel, noiseRel, spread,
      g1: targetable / IMP.total * 100,
      g2: observed / CONV_TOTAL * 100,
      g3: effective / CONV_TOTAL * 100,
      g4: spread * 100
    };
  }

  // =================================================================
  // 4) 그림 — 인라인 SVG. 색은 전부 var(--...)
  // =================================================================
  function bar(x, y, w, h, fill, dash) {
    return '<rect x="' + x.toFixed(2) + '" y="' + y + '" width="' + Math.max(0, w).toFixed(2) +
      '" height="' + h + '" style="fill:' + fill + '; stroke:var(--paper); stroke-width:1' +
      (dash ? '; stroke-dasharray:4 3' : '') + '"/>';
  }
  function txt(x, y, s, style, anchor) {
    return '<text x="' + x + '" y="' + y + '" ' + (anchor ? 'text-anchor="' + anchor + '" ' : '') +
      'style="' + style + '">' + s + '</text>';
  }
  const L12 = 'font-size:12px; fill:var(--ink3)';
  const L12B = 'font-size:12px; font-weight:700; fill:var(--ink)';
  const L13 = 'font-size:13px; fill:var(--ink2)';

  // viewBox 폭을 담는 칸의 실제 폭에 맞춘다. 그래야 배율이 1이 되고
  // SVG 안의 12px 글자가 화면에서도 12px 이다. 폭을 600 으로 박아 두면
  // 375px 화면에서 글자가 6.6px 로 줄어 안 읽힌다.
  const PANELS = ['sl-conv-svg', 'sl-spread-svg', 'sl-freq-svg'];
  const lastW = {};
  function panelW(id) {
    const el = $(id);
    const w = el ? el.clientWidth : 0;
    const v = Math.max(280, Math.min(1400, Math.round(w) || 560));
    lastW[id] = v;
    return v;
  }

  // ---- 판 A: 전환 4,060건이 어떤 모양으로 오나 ----
  function drawConv(m, W) {
    const X0 = 8, BW = W - 16, Y = 26, H = 40;
    const segs = [
      ['개인 라벨', m.ind, 'var(--navy)', false],
      ['집계 · 값 있음', m.aggValue, 'var(--series-4)', false],
      ['집계 · 건수만', m.aggCount, 'var(--grey)', true],
      ['억제로 지워짐', m.suppressed, 'var(--oxide)', true],
      ['못 봄', m.lost, 'var(--series-5)', false]
    ];
    let x = X0, out = '';
    out += txt(X0, 16, '전환 ' + num(CONV_TOTAL) + '건', L12);
    out += txt(X0 + BW, 16, '값이 오는 것 ' + num(m.observed) + '건', L12, 'end');
    // 칸 안에는 글자를 넣지 않는다. 계열 색 하나가 흰 글자로 4.5:1 을 못 넘긴다.
    // 건수와 비율은 바로 아래 범례가 숫자로 그대로 들고 있다.
    segs.forEach(function (sg) {
      const w = sg[1] / CONV_TOTAL * BW;
      out += bar(x, Y, w, H, sg[2], sg[3]);
      x += w;
    });
    out += '<rect x="' + X0 + '" y="' + Y + '" width="' + BW + '" height="' + H +
      '" style="fill:none; stroke:var(--rule); stroke-width:1"/>';
    return '<svg viewBox="0 0 ' + W + ' 76" role="img" aria-label="전환 ' + num(CONV_TOTAL) +
      '건이 개인 라벨·집계·억제·못 봄으로 갈리는 가로 막대" ' +
      'style="width:100%; height:auto; font-family:var(--font-sans)">' + out + '</svg>';
  }

  function drawConvLegend(m) {
    const rows = [
      ['개인 라벨', m.ind, 'var(--navy)', '줄마다 사람이 붙는다. 손실 함수의 정답 칸이 그대로다'],
      ['집계 · 값 있음', m.aggValue, 'var(--series-4)', '칸 합계로 온다. 같은 정밀도까지 데이터가 ' + DATA_MULT + '배 필요하다'],
      ['집계 · 건수만', m.aggCount, 'var(--grey)', '규모가 작아 값을 못 받았다. 건수는 온다'],
      ['억제로 지워짐', m.suppressed, 'var(--oxide)', '노이즈를 더한 값이 ' + SUPPRESS_CUT + '건 미만이라 칸째 사라졌다'],
      ['못 봄', m.lost, 'var(--series-5)', '광고주 픽셀이 안 붙어 아예 안 들어온다']
    ];
    let h = '';
    rows.forEach(function (r) {
      h += '<div class="sl-lg-row">' +
        '<span class="sl-lg-chip" style="background:' + r[2] + '"></span>' +
        '<span class="sl-lg-name">' + r[0] + '</span>' +
        '<span class="sl-lg-num">' + num(r[1]) + '건</span>' +
        '<span class="sl-lg-pct">' + pct(r[1] / CONV_TOTAL * 100) + '</span>' +
        '<span class="sl-lg-note">' + r[3] + '</span>' +
        '</div>';
    });
    return h;
  }

  // ---- 판 B: 광고 하나의 지표 흔들림 폭 ----
  function niceMax(v) {
    const steps = [25, 50, 100, 150, 200, 300];
    for (let i = 0; i < steps.length; i++) if (v <= steps[i] * 0.92) return steps[i];
    return 300;
  }
  function drawSpread(m, W) {
    const X0 = Math.min(120, Math.round(W * 0.30)) + 8;
    const BW = W - X0 - 12, Y0 = 30, BH = 20, GAP = 30;
    const max = niceMax(m.g4);
    const rows = [
      ['표본 오차', m.sampleRel * 100, 'var(--navy)'],
      ['리포트 노이즈', m.noiseRel * 100, 'var(--oxide)'],
      ['합쳐서', m.g4, 'var(--series-3)']
    ];
    let out = '';
    // 5% 기준선 — 이 폭보다 좁아야 5% 차이를 알아본다
    const fiveX = X0 + 5 / max * BW;
    out += '<line x1="' + fiveX.toFixed(2) + '" y1="20" x2="' + fiveX.toFixed(2) + '" y2="' + (Y0 + GAP * 3 - 4) +
      '" style="stroke:var(--ink3); stroke-width:1; stroke-dasharray:4 4"/>';
    out += txt(fiveX + 4, 16, W < 470 ? '5% 기준선' : '5% 차이를 보려면 여기보다 왼쪽', L12);
    rows.forEach(function (r, i) {
      const y = Y0 + i * GAP;
      const w = Math.min(r[1], max) / max * BW;
      out += txt(X0 - 8, y + BH - 6, r[0], L13, 'end');
      out += '<rect x="' + X0 + '" y="' + y + '" width="' + BW + '" height="' + BH +
        '" style="fill:var(--plate); stroke:var(--rule); stroke-width:1"/>';
      out += bar(X0, y, w, BH, r[2], false);
      const over = r[1] > max;
      out += txt(X0 + w + (over ? -6 : 6), y + BH - 6, (over ? '▸ ' : '') + pct(r[1]),
        'font-size:12px; font-weight:700; fill:var(--ink)', over ? 'end' : 'start');
    });
    const yAx = Y0 + GAP * 3 - 4;
    out += '<line x1="' + X0 + '" y1="' + yAx + '" x2="' + (X0 + BW) + '" y2="' + yAx +
      '" style="stroke:var(--rule); stroke-width:1"/>';
    out += txt(X0, yAx + 14, '0%', L12);
    out += txt(X0 + BW, yAx + 14, max + '%', L12, 'end');
    return '<svg viewBox="0 0 ' + W + ' ' + (yAx + 22) + '" role="img" aria-label="하루 전환 ' + m.n +
      '건 광고의 흔들림 폭을 표본 오차·리포트 노이즈·합계 세 막대로 그린 그림" ' +
      'style="width:100%; height:auto; font-family:var(--font-sans)">' + out + '</svg>';
  }

  // ---- 판 C: 3층 — 빈도 상한 ----
  function drawFreq(W) {
    const X0 = 8, BW = W - 16, BH = 30;
    const keepW = FREQ.capped / FREQ.imp * BW;
    const on = state.freq;
    const narrow = W < 470;
    let y = 14, out = '';
    // 좁은 칸에서는 머리글을 두 줄로 접는다. 한 줄로 두면 오른쪽이 잘린다.
    out += txt(X0, y, 'iOS 앱 지면 노출 ' + num(FREQ.imp) + '건' +
      (narrow ? '' : ' · 순 사용자 ' + num(FREQ.uniq) + '명 · 평균 ' + FREQ.avg.toFixed(1) + '회'), L12);
    if (narrow) {
      y += 15;
      out += txt(X0, y, '순 사용자 ' + num(FREQ.uniq) + '명 · 평균 ' + FREQ.avg.toFixed(1) + '회', L12);
    }
    const yBar = y + 8;
    out += bar(X0, yBar, keepW, BH, 'var(--navy)', false);
    out += bar(X0 + keepW, yBar, BW - keepW, BH, on ? 'var(--grey)' : 'var(--oxide)', !on);
    out += '<rect x="' + X0 + '" y="' + yBar + '" width="' + BW + '" height="' + BH +
      '" style="fill:none; stroke:var(--rule); stroke-width:1"/>';
    out += txt(X0 + keepW / 2, yBar + 20, num(FREQ.capped), 'font-size:12px; fill:var(--paper)', 'middle');
    out += txt(X0 + keepW + (BW - keepW) / 2, yBar + 20, num(FREQ.imp - FREQ.capped),
      'font-size:12px; fill:var(--paper)', 'middle');
    const yCap = yBar + BH + 16;
    out += txt(X0, yCap, '상한 5회 안쪽 ' + pct(FREQ.capped / FREQ.imp * 100), L12);
    out += txt(X0 + BW, yCap, (on ? '잘라 낸 초과분 ' : '그대로 나가는 초과분 ') +
      pct((FREQ.imp - FREQ.capped) / FREQ.imp * 100), L12, 'end');

    const topW = FREQ.topImp / FREQ.imp * BW;
    const yTop = yCap + 26;
    out += txt(X0, yTop, '사용자 상위 5% (' + num(FREQ.topUsers) + '명) 가 가져가는 노출', L12);
    out += bar(X0, yTop + 8, topW, 16, 'var(--series-5)', false);
    out += '<rect x="' + X0 + '" y="' + (yTop + 8) + '" width="' + BW + '" height="16' +
      '" style="fill:none; stroke:var(--rule); stroke-width:1"/>';
    out += txt(X0 + topW + 6, yTop + 21, num(FREQ.topImp) + '건 · ' + pct(FREQ.topImp / FREQ.imp * 100), L12B);
    return '<svg viewBox="0 0 ' + W + ' ' + (yTop + 30) + '" role="img" aria-label="iOS 노출 420만 건 중 상한 5회 안쪽과 초과분, ' +
      '그리고 상위 5% 사용자가 가져가는 몫을 그린 막대 둘" ' +
      'style="width:100%; height:auto; font-family:var(--font-sans)">' + out + '</svg>';
  }

  // ---- 스위치 계단 ----
  function drawStair() {
    const W = 300, SW = 54, SH = 13, out = [];
    SWITCHES.forEach(function (k, i) {
      const x = i * (SW + 4) + 4, y = 6 + i * 12;
      const on = state[k];
      out.push('<rect x="' + x + '" y="' + y + '" width="' + SW + '" height="' + SH +
        '" style="fill:' + (on ? 'var(--navy)' : 'var(--oxide-bg)') +
        '; stroke:' + (on ? 'var(--navy)' : 'var(--oxide)') +
        '; stroke-width:1.4' + (on ? '' : '; stroke-dasharray:4 3') + '"/>');
    });
    return '<svg viewBox="0 0 ' + W + ' 74" aria-hidden="true" ' +
      'style="width:100%; max-width:300px; height:auto">' + out.join('') + '</svg>';
  }

  // =================================================================
  // 5) 판정 — 이 조합에서 무엇이 먼저 부서지나
  // =================================================================
  function verdict(m) {
    const s = state;
    const off = SWITCHES.filter(function (k) { return !s[k]; }).length;

    if (off === 5) {
      return '<strong>다섯 개를 다 내렸다.</strong> 크로스 신호는 0이고 값이 오는 전환은 ' +
        pct(m.g2) + ' 다. 유효 표본은 ' + num(m.effective) + '줄, 기준의 ' + pct(m.g3) +
        ' 다. 이 상태에서는 지표로 성과를 판정할 수 없다. 남는 길은 무작위 실험뿐이다.';
    }
    if (!s.label) {
      return '<strong>먼저 부서진 것은 라벨이다.</strong> 계기 2·3·4 가 같이 내려갔는데 계기 1(타겟팅)은 그대로다. ' +
        '집계 라벨은 계수를 비틀지 않는다. 대신 흔들림이 ' + SD_MULT + '배라 같은 정밀도까지 데이터가 ' +
        DATA_MULT + '배 필요하다. 유효 표본이 ' + num(m.effective) + '줄로 주저앉은 것이 그 값이다.';
    }
    if (!s.cookie && !s.idfa) {
      return '<strong>크로스 신호는 0인데 계기 4는 그대로다.</strong> 라벨이 살아 있기 때문이다. ' +
        '담장 안 AUC 는 ' + m.aucWall.toFixed(3) + ' 로 ' + (AUC.wall - m.aucWall).toFixed(3) +
        ' 만 내려갔고, 열린 RTB 는 ' + m.aucOpen.toFixed(3) + ' 다. 담장 안이 덜 다치는 이유가 이 조합이다.';
    }
    if (!s.idfa) {
      return '<strong>라벨이 절반 부서졌다.</strong> iOS 앱 ' + num(POOL.ios) + '건과 MMP 앱 ' +
        num(POOL.mmp) + '건이 집계로 바뀌었다. 그중 ' + pct(NOVALUE_RATE * 100) +
        ' 는 값 없이 건수만 온다. 나머지 ' + num(m.ind) + '건은 아직 사람에 붙는다.';
    }
    if (!s.noise) {
      return '<strong>리포트에 노이즈가 붙었다.</strong> 하루 전환 ' + num(m.n) + '건짜리 칸의 흔들림이 ' +
        pct(m.sampleRel * 100) + ' 에서 ' + pct(m.g4) + ' 로 커졌다. ' +
        (m.agg > 0 ? '억제로 ' + num(m.suppressed) + '건이 칸째 지워졌다.'
          : '아직 집계로 오는 전환이 없어 지워진 칸은 없다. 흔들림만 커졌다.');
    }
    if (!s.freq) {
      return '<strong>모델 밖 규칙이 먼저 멈췄다.</strong> 상한 5회를 못 걸어 iOS 노출 ' + num(FREQ.imp) +
        '건이 그대로 나간다. ' + pct((FREQ.imp - FREQ.capped) / FREQ.imp * 100) +
        ' 는 이미 다섯 번 넘게 본 사람 몫이다. 학습은 멀쩡한데 예산이 샌다.';
    }
    if (!s.cookie) {
      return '<strong>피처만 줄었다.</strong> 열린 RTB AUC 가 ' + m.aucOpen.toFixed(3) + ' 로 ' +
        AUC.cookie[0].toFixed(3) + ' 내려갔고 광고주 픽셀 ' + num(POOL.pixel) + '건이 끊겼다. ' +
        '학습 코드는 그대로 돈다. 성능이 내려가는 문제지 학습이 성립하느냐의 문제가 아니다.';
    }
    return '<strong>아직 아무것도 안 부서졌다.</strong> 전환 ' + num(CONV_TOTAL) +
      '건이 전부 줄 단위로 사람에 붙는다. 왼쪽 스위치를 위에서부터 하나씩 내려 보라. ' +
      '세 번째(유저 단위 전환 라벨)에서 계기 셋이 한꺼번에 내려간다.';
  }

  // =================================================================
  // 6) 그리기
  // =================================================================
  function cls(base, tone) { return base + ' ' + tone; }
  function tone(v, good, warn, invert) {
    const ok = invert ? v <= good : v >= good;
    const mid = invert ? v <= warn : v >= warn;
    return ok ? 'is-good' : mid ? 'is-warn' : 'is-bad';
  }

  function render() {
    const m = compute();

    // 스위치 상태 글자
    const STATE_TEXT = {
      cookie: ['살아 있음', '끊김'],
      idfa: ['살아 있음', 'ATT 미동의로 못 읽음'],
      label: ['줄마다 사람이 붙음', '칸 합계만 옴'],
      freq: ['상한 5회를 건다', '같은 사람인지 판정 불가'],
      noise: ['원본 그대로', '라플라스 b=' + LAP_B + ' · ' + SUPPRESS_CUT + '건 미만 억제']
    };
    SWITCHES.forEach(function (k) {
      const btn = $('sl-sw-' + k);
      if (!btn) return;
      btn.setAttribute('aria-checked', state[k] ? 'true' : 'false');
      btn.classList.toggle('is-off', !state[k]);
      const st = btn.querySelector('.sl-switch-state');
      if (st) st.textContent = STATE_TEXT[k][state[k] ? 0 : 1];
    });
    const offCount = SWITCHES.filter(function (k) { return !state[k]; }).length;
    $('sl-stair').innerHTML = drawStair();
    $('sl-stair-count').textContent = '다섯 중 ' + offCount + '개 내려감';

    // 전환 건수 슬라이더
    $('sl-conv-level-val').textContent = num(m.n) + '건';

    // 계기 1
    $('sl-g1').textContent = pct(m.g1);
    $('sl-g1').className = cls('sl-gauge-value', tone(m.g1, 90, 50));
    $('sl-g1-sub').innerHTML = '노출 ' + num(IMP.total) + '건 중 ' + num(m.targetable) + '건<br>' +
      '열린 RTB AUC ' + m.aucOpen.toFixed(3) + ' · 담장 안 ' + m.aucWall.toFixed(3);

    // 계기 2
    $('sl-g2').textContent = pct(m.g2);
    $('sl-g2').className = cls('sl-gauge-value', tone(m.g2, 90, 60));
    $('sl-g2-sub').innerHTML = '전환 ' + num(CONV_TOTAL) + '건 중 값이 오는 ' + num(m.observed) + '건<br>' +
      '개인 ' + num(m.ind) + ' · 집계 ' + num(m.aggValue) + ' · 못 봄 ' + num(m.lost + m.suppressed);

    // 계기 3
    $('sl-g3').textContent = num(m.effective) + '줄';
    $('sl-g3').className = cls('sl-gauge-value', tone(m.g3, 90, 50));
    $('sl-g3-sub').innerHTML = '기준 ' + num(CONV_TOTAL) + '줄의 ' + pct(m.g3) + '<br>' +
      '개인 ' + num(m.ind) + ' + 집계 ' + num(m.survive) + ' ÷ ' + DATA_MULT;

    // 계기 4
    $('sl-g4').textContent = '±' + pct(m.g4);
    $('sl-g4').className = cls('sl-gauge-value', tone(m.g4, 20, 60, true));
    $('sl-g4-sub').innerHTML = '하루 전환 ' + num(m.n) + '건짜리 광고 하나<br>' +
      '표본 ' + pct(m.sampleRel * 100) + ' · 노이즈 ' + pct(m.noiseRel * 100) +
      ' · 억제율 ' + pct(state.noise ? 0 : SUP_RATE[levelIdx]);
    $('sl-g4-title').textContent = '하루 전환 ' + num(m.n) + '건 광고 — 지표 흔들림 폭';

    // 판정
    $('sl-verdict').innerHTML = verdict(m);

    // 판 A·B·C
    $('sl-conv-svg').innerHTML = drawConv(m, panelW('sl-conv-svg'));
    $('sl-conv-legend').innerHTML = drawConvLegend(m);
    $('sl-conv-note').innerHTML = '집계로 오면 ' + pct(NOVALUE_RATE * 100) +
      ' 는 값 없이 건수만 온다 — 글 4절의 940건 중 415건이다. ' +
      '억제로 지워지는 비율 ' + pct(SUPPRESS * 100) + ' 는 글 4절 조합표(270 · 155 · 100건)에 ' +
      '글 7절 억제율(93.6 · 69.5 · 1.6%)을 각각 곱해 얻었다.';

    $('sl-spread-svg').innerHTML = drawSpread(m, panelW('sl-spread-svg'));
    $('sl-spread-note').innerHTML = '이 광고의 평균오차는 ' + pct(state.noise ? 0 : MEAN_ERR[levelIdx]) +
      ', 7일을 합산하면 상대 흔들림이 ' + pct(state.noise ? 0 : WEEK_SD[levelIdx]) + ' 로 내려간다. ' +
      '대가는 시간 해상도다. 두 광고를 견주면 노이즈가 두 번 실려 ±' + DIFF_SD.toFixed(1) +
      '건이 된다. 전환 40건에서 5% 차이는 2건, 노이즈의 0.05배다. ' +
      '4,000건에서 5% 차이는 200건, 5.00배다.';

    $('sl-freq-svg').innerHTML = drawFreq(panelW('sl-freq-svg'));
    $('sl-freq-note').innerHTML = state.freq
      ? '상한 5회를 걸 수 있다. 초과분 ' + num(FREQ.imp - FREQ.capped) + '건을 새 사람에게 돌린다. ' +
        '도달이 늘어나는 예산이다.'
      : '같은 사람인지 모르니 상한을 못 건다. 노출 ' + num(FREQ.imp) + '건이 그대로 나가고 ' +
        pct((FREQ.imp - FREQ.capped) / FREQ.imp * 100) + ' 가 초과분이다. ' +
        '3층은 대체 신호로 못 메운다. 판정이 되거나 안 되거나 둘 중 하나다.';

    // 프리셋 버튼의 현재 여부
    const key = SWITCHES.map(function (k) { return state[k] ? '1' : '0'; }).join('');
    document.querySelectorAll('[data-preset]').forEach(function (b) {
      b.classList.toggle('is-current', b.getAttribute('data-preset') === key);
    });
  }

  // =================================================================
  // 7) 붙이기
  // =================================================================
  function applyPreset(key) {
    SWITCHES.forEach(function (k, i) { state[k] = key.charAt(i) === '1'; });
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!$('sl-verdict')) return;

    SWITCHES.forEach(function (k) {
      const btn = $('sl-sw-' + k);
      if (!btn) return;
      // 내 핸들러가 버튼에 붙어 있어서 document 로 올라가기 전에 상태가 바뀐다.
      // demo-edu.js 의 해설 규칙이 aria-checked 를 읽으면 이미 새 값이다.
      btn.addEventListener('click', function () { state[k] = !state[k]; render(); });
    });

    const lv = $('sl-conv-level');
    if (lv) lv.addEventListener('input', function () { levelIdx = +lv.value; render(); });

    document.querySelectorAll('[data-preset]').forEach(function (b) {
      b.addEventListener('click', function () { applyPreset(b.getAttribute('data-preset')); });
    });

    // 테마가 바뀌면 SVG 를 다시 그린다. 색은 var() 라 대부분 저절로 따라오지만,
    // 글자 폭에 맞춰 잘라 그리는 조각이 있어 통째로 다시 그리는 쪽이 안전하다.
    new MutationObserver(render).observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme']
    });

    // 판의 폭이 바뀌면 viewBox 를 다시 맞춘다(글자 크기를 1:1 로 유지하기 위해).
    // 창 크기뿐 아니라 임베드 모드가 옆 판 둘을 접을 때도 폭이 바뀐다 —
    // 그때는 resize 이벤트가 안 오므로 ResizeObserver 로 본다.
    // 다시 그리면 높이만 바뀌므로, 폭이 실제로 달라졌을 때만 돌려 되돌이를 막는다.
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(function () {
        const changed = PANELS.some(function (id) {
          const el = $(id);
          if (!el) return false;
          const w = Math.max(280, Math.min(1400, Math.round(el.clientWidth) || 560));
          return Math.abs(w - (lastW[id] || 0)) > 2;
        });
        if (changed) render();
      });
      PANELS.forEach(function (id) { if ($(id)) ro.observe($(id)); });
    }
    let rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(render, 150);
    });

    render();
  });
})();
