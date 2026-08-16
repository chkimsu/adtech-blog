// ===================================================================
// API 계약 실험실 — js/api-contract-demo.js
//
// 전환 포스트백 1,000건을 보내 놓고 여섯을 바꿔 본다.
//   호출 방향 · 인증 방식 · 멱등키 · 응답 유실률 · 재시도 횟수 · 타임아웃 상한
//
// 숫자는 posts/api-kinds-and-contracts.md 가 정한 값을 그대로 쓴다.
//   유실 150 · 25 · 5건 → 요청 합계 1,180건 → 리포트 CPA 4,237원
//   하위 호출 초당 100번 · 커넥션 풀 200개 · 상위에 약속한 예산 400ms
//
// ── 그림은 canvas 가 아니라 인라인 SVG 다 ──
// canvas 는 var(--navy) 같은 토큰을 못 읽는다. getComputedStyle 로 hex 를
// 꺼내 오는 헬퍼가 따로 필요하고, 테마가 바뀔 때마다 MutationObserver 로
// data-theme 을 지켜보다 다시 그려야 한다. SVG 는 style="fill:var(--navy)"
// 를 그대로 먹으므로 테마가 바뀌면 브라우저가 알아서 색을 다시 계산한다.
// 그래서 이 파일에는 cssVar() 헬퍼도 MutationObserver 도 없다.
//
// ── 난수를 쓰지 않는다 ──
// 회차별 유실은 글 7절이 정한 유실률 계단(15.0 → 16.7 → 20.0%)을 그대로
// 쓰는 결정론이다. 슬라이더를 한 칸 밀 때 숫자가 잡음으로 튀면 "무엇
// 때문에 바뀌었나"를 못 읽기 때문이다. 씨앗을 고정한 난수도 같은 목적을
// 이루지만, 여기서는 계단 하나로 충분하다. 유실률 슬라이더는 그 계단의
// 첫 칸을 정하고, 나머지 두 칸은 첫 칸에 10/9 와 4/3 을 곱해 나온다.
//
// 파일 구성은 셋이다.
//   1) 상수 · 모델 — DOM 을 모른다. 입력 넷을 받아 숫자 묶음을 돌려준다
//   2) 그리기 — 모델을 읽어 DOM 에 넣는다. 모델을 바꾸지 않는다
//   3) 바인딩 — 이벤트를 받아 다시 그린다
// ===================================================================
(function () {
  'use strict';

  var svgHost = document.getElementById('ac-svg');
  if (!svgHost) return;

  // ==========================================
  // 1) 글에서 가져온 상수
  // ==========================================

  var CONV = 1000;              // 광고주 한 곳의 하루 전환 (글 2절·7절)
  var AD_SPEND = 5000000;       // 그 광고주가 하루에 쓴 광고비(원)
  var TRUE_CPA = AD_SPEND / CONV;   // 5,000원

  // 회차별 유실률 계단. 첫 칸(슬라이더 값)에 곱하는 배수다.
  // 15% 로 두면 15.0 → 16.7 → 20.0% 가 되어 유실이 150 → 25 → 5건이 된다.
  // 4회차부터 0 인 것은 화면 설정 설명이 못 박은 가정이다 —
  // "4회차에는 남은 건이 전부 도착합니다". 그래서 재시도를 3회 위로 올려도
  // 표가 안 바뀐다. 그 사실 자체가 이 데모가 보여 줄 것 하나다.
  var LOSS_MULT = [1, 10 / 9, 4 / 3, 0, 0, 0];

  var TIMEOUTS = [400, 800, 1500, 3000];   // 하위 호출 타임아웃 상한 후보
  var BUDGET_MS = 400;          // 우리가 상위에 약속한 응답 예산 (글 5절)
  var DOWNSTREAM_RPS = 100;     // 우리 API 가 하위를 부르는 초당 횟수
  var POOL = 200;               // 커넥션 풀 크기

  // 글 5절 예산 표 — 400ms 를 넷과 여유로 나눈 값
  var BUDGET_PARTS = '서명 20 + 멱등 조회 50 + 전환 테이블 200 + Kafka 100 + 여유 30';

  // 인증 다섯. secret = "부르는 쪽에 우리만 아는 값을 둬야 하나" (글 6절 표)
  var AUTH = {
    hmac: {
      label: 'HMAC 서명', short: 'HMAC 서명', secret: true,
      safe: '본문과 시각을 비밀키로 해시해 헤더에 붙입니다. 본문 위변조는 걸리고 재전송은 안 걸립니다. 우리 서버 시계가 6분 어긋나면 코드가 멀쩡해도 <strong>전량 401</strong> 입니다.'
    },
    key: {
      label: 'API key', short: 'API key', secret: true,
      safe: ''
    },
    oauth: {
      label: 'OAuth2 client credentials', short: 'OAuth2', secret: true,
      safe: '토큰을 받아 쓰고 만료되면 다시 받습니다. 토큰이 새도 <strong>만료까지만</strong> 유효합니다. 대신 발급 호출 한 번이 예산에 더 붙습니다.'
    },
    jwt: {
      label: 'JWT (사용자 토큰)', short: '사용자 토큰', secret: false,
      safe: ''
    },
    mtls: {
      label: 'mTLS', short: 'mTLS', secret: true,
      safe: '양쪽이 서로의 인증서를 확인합니다. 인증서가 새면 교체로 끝납니다. 대신 본문 내용이 옳은지는 못 봅니다.'
    }
  };

  // ==========================================
  // 1-b) 모델 — 입력 넷 → 숫자 묶음
  // ==========================================

  function fmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function pct1(x) {
    return (x * 100).toFixed(1) + '%';
  }

  // 회차를 돌린다. 서버는 받은 요청을 항상 기록한다. 유실은 돌아오는
  // 응답에서만 일어나고, 답을 못 받은 건만 다음 회차에 다시 간다.
  function simulate(lossPct, retries) {
    var rows = [], sent = CONV, totalSent = 0, totalLost = 0, naive = 0;
    var maxRounds = retries + 1;
    for (var k = 0; k < maxRounds && sent > 0; k++) {
      var rate = (lossPct / 100) * (LOSS_MULT[k] || 0);
      var lost = Math.min(sent, Math.round(sent * rate));
      naive += sent;                 // 키를 안 보면 요청마다 한 줄이 늘어난다
      totalSent += sent;
      totalLost += lost;
      rows.push({ round: k + 1, sent: sent, lost: lost, rate: rate, naive: naive });
      sent = lost;
    }
    return {
      rows: rows,
      hidden: maxRounds - rows.length,   // 보낼 것이 없어 표에서 빠진 회차
      totalSent: totalSent,
      totalLost: totalLost,
      unresolved: sent                   // 끝까지 답을 못 받은 건
    };
  }

  function build(state) {
    var sim = simulate(state.loss, state.retry);
    var blocked = sim.totalSent - CONV;              // 키가 막아 준 중복 요청
    var records = state.idem ? CONV : sim.totalSent; // 전환 테이블에 남는 줄
    var dup = records - CONV;                        // 그중 중복으로 부푼 줄
    var okCount = CONV - sim.unresolved;
    var timeout = TIMEOUTS[state.tIdx];
    var conc = Math.round(DOWNSTREAM_RPS * timeout / 1000);

    return {
      state: state, sim: sim,
      blocked: blocked, records: records, dup: dup,
      inflate: records / CONV - 1,
      reportCpa: Math.round(AD_SPEND / records),
      okCount: okCount, successPct: okCount / CONV * 100,
      timeout: timeout, conc: conc,
      overBudget: timeout > BUDGET_MS,
      overPool: conc > POOL,
      secret: secretRisk(state.dir, state.auth)
    };
  }

  // 시크릿 계기. 세는 것은 "우리 서버 밖에 비밀이 놓이는 자리 수"다.
  function secretRisk(dir, authKey) {
    var a = AUTH[authKey];
    if (dir === 'c2s') {
      if (!a.secret) {
        return {
          n: 0, state: 'good', flag: '[안전]',
          note: '사용자 토큰은 그 사용자만의 것이고 서버가 언제든 무효로 만들 수 있습니다. 앱이 부르는 자리에서 <strong>남는 답이 이것</strong>입니다.'
        };
      }
      return {
        n: 1, state: 'bad', flag: '[위험]',
        note: '<strong>' + a.label + '</strong>은 부르는 쪽에 비밀이 있어야 합니다. 앱 파일에서 문자열을 뽑는 것은 명령 한 줄이고, 이미 배포된 값은 <strong>회수할 방법이 없습니다</strong>.'
      };
    }
    if (!a.secret) {
      return {
        n: 0, state: 'warn', flag: '[주체 없음]',
        note: '서버끼리 부르는 자리엔 로그인한 사용자가 없습니다. 사용자 토큰 대신 서비스 자격증명이나 서명으로 바꿉니다.'
      };
    }
    if (authKey === 'key') {
      return {
        n: 0, state: 'warn', flag: '[회전 필요]',
        note: '키를 가진 쪽이면 누구나 우리인 척할 수 있습니다. 노출 자리는 0곳이지만 <strong>만료가 없습니다</strong>. 두 키를 동시에 인정하는 기간을 두고 갈아 끼웁니다.'
      };
    }
    return { n: 0, state: 'good', flag: '[안전]', note: a.safe };
  }

  // ==========================================
  // 2) 그리기 — SVG
  // ==========================================

  var W = 760, H = 240;
  var BW = 120, BH = 70, GAP = 32, X0 = 14, BY = 68;

  var BOX = {
    // 아무 일도 없는 칸
    neutral: 'fill:var(--plate); stroke:var(--rule); stroke-width:1.4',
    // 지금 막아 주고 있는 칸 — 실선 굵게
    keep: 'fill:var(--navy-bg); stroke:var(--navy); stroke-width:2',
    // 지금 문제가 되는 칸 — 점선
    risk: 'fill:var(--oxide-bg); stroke:var(--oxide); stroke-width:1.6; stroke-dasharray:5 4',
    // 조건부 · 지켜볼 칸
    watch: 'fill:var(--plate); stroke:var(--grey); stroke-width:1.4; stroke-dasharray:4 3',
    // 지금 안 쓰는 칸
    off: 'fill:var(--plate); stroke:var(--grey-bd); stroke-width:1.2; stroke-dasharray:3 3'
  };

  var LINE_FILL = { keep: 'var(--navy)', risk: 'var(--oxide)', watch: 'var(--grey)', off: 'var(--ink3)', neutral: 'var(--ink3)' };

  function boxX(i) { return X0 + i * (BW + GAP); }
  function boxCx(i) { return boxX(i) + BW / 2; }

  function txt(x, y, s, size, fill, opt) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + ((opt && opt.anchor) || 'middle') +
      '" style="font-size:' + size + 'px; fill:' + fill +
      (opt && opt.mono ? '; font-family:var(--font-mono)' : '') + '">' + s + '</text>';
  }

  function drawBox(i, b) {
    var x = boxX(i), cx = boxCx(i);
    var out = '<rect x="' + x + '" y="' + BY + '" width="' + BW + '" height="' + BH + '" style="' + BOX[b.kind] + '"/>';
    out += txt(cx, BY + 22, b.title, 13, 'var(--ink)');
    out += txt(cx, BY + 41, b.l2, 11, 'var(--ink3)', { mono: b.mono2 });
    out += txt(cx, BY + 58, b.l3, 11, LINE_FILL[b.kind], { mono: b.mono3 });
    return out;
  }

  function drawFlow(m) {
    var s = m.state, dir = s.dir, retries = s.retry;
    var boxes = [
      {
        title: dir === 's2s' ? 'MMP 서버' : '사용자 앱',
        l2: dir === 's2s' ? 'server to server' : 'client to server',
        l3: retries > 0 ? '재시도 ' + retries + '회' : '재시도 없음',
        kind: (dir === 'c2s' && m.secret.n > 0) ? 'risk' : 'neutral'
      },
      {
        title: AUTH[s.auth].short,
        l2: dir === 's2s' ? '비밀: 우리 서버' : (m.secret.n > 0 ? '비밀: 사용자 기기' : '비밀 없음'),
        l3: m.secret.flag,
        kind: m.secret.state === 'bad' ? 'risk' : m.secret.state === 'warn' ? 'watch' : 'keep'
      },
      {
        title: '우리 수집 API',
        l2: '타임아웃 ' + fmt(m.timeout) + 'ms',
        mono2: true,
        l3: '동시 ' + fmt(m.conc) + ' / 풀 ' + POOL,
        mono3: true,
        kind: m.overPool ? 'risk' : m.overBudget ? 'watch' : 'keep'
      },
      {
        title: '멱등키 조회',
        l2: s.idem ? 'Idempotency-Key' : '조회 안 함',
        l3: s.idem ? '막은 중복 ' + fmt(m.blocked) + '건' : '요청마다 새 줄',
        kind: s.idem ? 'keep' : (m.dup > 0 ? 'risk' : 'off')
      },
      {
        title: '전환 테이블',
        l2: fmt(m.records) + '줄',
        mono2: true,
        l3: m.dup > 0 ? '+' + pct1(m.inflate) + ' 부풀었다' : '실제와 같다',
        kind: m.dup > 0 ? 'risk' : 'neutral'
      }
    ];

    var out = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H +
      '" role="img" aria-label="' + flowLabel(m) + '" style="font-family:var(--font-sans)">';

    out += '<defs>' +
      '<marker id="ac-arr-f" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto">' +
      '<path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--navy)"/></marker>' +
      '<marker id="ac-arr-b" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto">' +
      '<path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--oxide)"/></marker>' +
      '<marker id="ac-arr-g" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto">' +
      '<path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--grey)"/></marker>' +
      '</defs>';

    // 앞으로 가는 화살표 넷
    for (var i = 0; i < 4; i++) {
      var x1 = boxX(i) + BW + 4, x2 = boxX(i + 1) - 7;
      out += '<line x1="' + x1 + '" y1="' + (BY + 35) + '" x2="' + x2 + '" y2="' + (BY + 35) +
        '" style="stroke:var(--navy); stroke-width:2" marker-end="url(#ac-arr-f)"/>';
    }

    // 재시도 고리 — 부르는 쪽 위로 되돌아온다
    var loopColor = (m.dup > 0) ? 'var(--oxide)' : 'var(--navy)';
    var loopMarker = (m.dup > 0) ? 'ac-arr-b' : 'ac-arr-f';
    if (retries > 0) {
      out += '<path d="M40,' + BY + ' C40,30 108,30 108,' + (BY - 4) + '" style="fill:none; stroke:' +
        loopColor + '; stroke-width:1.8" marker-end="url(#' + loopMarker + ')"/>';
      out += txt(120, 40, '응답을 못 받으면 다시 보냄 · 재시도 ' + retries + '회', 11.5,
        'var(--ink3)', { anchor: 'start' });
    } else {
      out += txt(14, 40, '재시도 없음 — 답을 못 받은 건은 그대로 실패로 남는다', 11.5,
        'var(--ink3)', { anchor: 'start' });
    }

    for (i = 0; i < boxes.length; i++) out += drawBox(i, boxes[i]);

    // 돌아오는 응답 — 오른쪽 끝에서 왼쪽 끝으로
    var ry = 184;
    out += '<path d="M' + boxCx(4) + ',' + (BY + BH) + ' L' + boxCx(4) + ',' + ry +
      ' L' + boxCx(0) + ',' + ry + ' L' + boxCx(0) + ',' + (BY + BH + 8) +
      '" style="fill:none; stroke:var(--navy); stroke-width:1.6" marker-end="url(#ac-arr-f)"/>';

    // 응답이 사라진 자리. 회차 하나가 × 하나다
    var hitRounds = 0;
    for (i = 0; i < m.sim.rows.length; i++) if (m.sim.rows[i].lost > 0) hitRounds++;
    var xs = [570, 450, 330, 210];
    for (i = 0; i < Math.min(hitRounds, xs.length); i++) {
      var cx = xs[i];
      out += '<g style="stroke:var(--oxide); stroke-width:2">' +
        '<line x1="' + (cx - 5) + '" y1="' + (ry - 5) + '" x2="' + (cx + 5) + '" y2="' + (ry + 5) + '"/>' +
        '<line x1="' + (cx + 5) + '" y1="' + (ry - 5) + '" x2="' + (cx - 5) + '" y2="' + (ry + 5) + '"/>' +
        '</g>';
    }

    out += m.sim.totalLost > 0
      ? txt(W / 2, 208, '응답 유실 ' + fmt(m.sim.totalLost) + '건 — 서버는 이미 기록했다', 11.5, 'var(--oxide)')
      : txt(W / 2, 208, '응답 유실 0건 — 다시 보낼 것이 없다', 11.5, 'var(--navy)');

    // 괄호는 안 쓴다 — mono 글꼴에 한글이 없어 괄호가 전각으로 떨어진다
    out += txt(W / 2, 228, '요청 ' + fmt(m.sim.totalSent) + '건 · 전환 테이블 ' + fmt(m.records) + '줄' +
      (m.dup > 0 ? ' · 중복 ' + fmt(m.dup) + '줄' : ' · 실제와 같다'), 11.5, 'var(--ink2)', { mono: true });

    return out + '</svg>';
  }

  function flowLabel(m) {
    return '왼쪽부터 부르는 쪽 · 인증 · 우리 수집 API · 멱등키 조회 · 전환 테이블 다섯 칸이 화살표로 이어진 그림이다. ' +
      '지금 설정에서 요청은 ' + fmt(m.sim.totalSent) + '건, 응답 유실은 ' + fmt(m.sim.totalLost) +
      '건, 전환 테이블에 남는 줄은 ' + fmt(m.records) + '줄이다.';
  }

  // ==========================================
  // 2-b) 그리기 — 회차 표
  // ==========================================

  var rowsHost = document.getElementById('ac-rows');
  var thNaive = document.getElementById('ac-th-naive');
  var thIdem = document.getElementById('ac-th-idem');

  function drawTable(m) {
    var idem = m.state.idem;
    var out = '';
    for (var i = 0; i < m.sim.rows.length; i++) {
      var r = m.sim.rows[i];
      var naiveCls = !idem ? (r.naive > CONV ? ' class="is-hit"' : '') : ' class="is-dim"';
      var idemCls = idem ? '' : ' class="is-dim"';
      out += '<tr>' +
        '<td>' + r.round + '차</td>' +
        '<td>' + fmt(r.sent) + '</td>' +
        '<td>' + fmt(r.lost) + ' · ' + pct1(r.rate) + '</td>' +
        '<td' + naiveCls + '>' + fmt(r.naive) + '</td>' +
        '<td' + idemCls + '>' + fmt(CONV) + '</td>' +
        '</tr>';
    }
    out += '<tr class="is-total">' +
      '<td>합계 요청</td>' +
      '<td>' + fmt(m.sim.totalSent) + '</td>' +
      '<td>' + fmt(m.sim.totalLost) + '</td>' +
      '<td' + (idem ? ' class="is-dim"' : (m.dup > 0 ? ' class="is-hit"' : '')) + '>' + fmt(m.sim.totalSent) + '</td>' +
      '<td' + (idem ? '' : ' class="is-dim"') + '>' + fmt(CONV) + '</td>' +
      '</tr>';

    if (m.sim.hidden > 0) {
      out += '<tr><td colspan="5" style="font-size:0.8rem; color:var(--ink3); font-family:var(--font-sans)">' +
        '재시도 ' + m.state.retry + '회 중 ' + (m.sim.rows.length - 1) + '회만 쓰였습니다 — ' +
        '남은 ' + m.sim.hidden + '회차는 보낼 것이 없습니다.</td></tr>';
    }
    rowsHost.innerHTML = out;

    // 지금 보는 열만 진하게. 안 보는 열은 반대 설정의 가정값이다
    thNaive.className = idem ? 'is-dim' : '';
    thIdem.className = idem ? '' : 'is-dim';
  }

  // ==========================================
  // 2-c) 그리기 — 계기 넷
  // ==========================================

  var gaugeHost = document.getElementById('ac-gauges');

  function gauge(g) {
    return '<div class="ac-gauge" data-state="' + g.state + '">' +
      '<div class="ac-gauge-head">' +
      '<span class="ac-gauge-label">' + g.label + '</span>' +
      '<span class="ac-gauge-flag">' + g.flag + '</span>' +
      '</div>' +
      '<span class="ac-gauge-value">' + g.value + '<em>' + g.unit + '</em></span>' +
      '<span class="ac-gauge-note">' + g.note + '</span>' +
      '</div>';
  }

  function drawGauges(m) {
    var s = m.state;

    // (1) 성공률 — 부르는 쪽이 응답을 받아 낸 비율
    var miss = m.sim.unresolved;
    var g1 = {
      label: '성공률', unit: '%',
      value: m.successPct.toFixed(1),
      state: miss === 0 ? 'good' : (m.successPct >= 95 ? 'warn' : 'bad'),
      flag: miss === 0 ? '[전건 확인]' : '[미확인 ' + fmt(miss) + '건]',
      note: '전환 ' + fmt(CONV) + '건 중 <strong>' + fmt(m.okCount) + '건</strong>이 응답을 받았습니다.' +
        (miss > 0
          ? ' 남은 ' + fmt(miss) + '건은 서버가 기록했는지 알 수 없습니다. 안 보내면 유실, 보내면 중복입니다.'
          : ' 재시도가 남은 건을 전부 건져 올렸습니다.')
    };

    // (2) 중복 처리 건수 — 전환 테이블에 부푼 줄
    var g2;
    if (s.idem) {
      g2 = {
        label: '중복 처리 건수', unit: '건', value: '0', state: 'good', flag: '[키로 막음]',
        note: '요청은 ' + fmt(m.sim.totalSent) + '건인데 전환 테이블은 <strong>' + fmt(CONV) +
          '줄</strong>입니다. 같은 키로 온 ' + fmt(m.blocked) + '건은 저장해 둔 201 을 그대로 받았습니다.'
      };
    } else if (m.dup > 0) {
      g2 = {
        label: '중복 처리 건수', unit: '건', value: fmt(m.dup), state: 'bad', flag: '[리포트 오염]',
        note: '전환 테이블이 <strong>' + fmt(m.records) + '줄</strong>(+' + pct1(m.inflate) +
          ')입니다. 진짜 CPA ' + fmt(TRUE_CPA) + '원이 리포트에는 <strong>' + fmt(m.reportCpa) +
          '원</strong>으로 뜹니다. 전부 성공 응답이라 에러 로그에 한 줄도 안 남습니다.'
      };
    } else {
      g2 = {
        label: '중복 처리 건수', unit: '건', value: '0', state: 'warn', flag: '[막는 장치 없음]',
        note: '지금은 다시 보낸 요청이 없어 중복이 0입니다. 멱등키가 꺼져 있으니 <strong>재시도를 켜는 순간</strong> 그만큼 줄이 늘어납니다.'
      };
    }

    // (3) 커넥션 점유 시간 — 하위 호출 하나가 커넥션을 무는 상한
    var g3 = {
      label: '커넥션 점유 시간', unit: 'ms 상한', value: fmt(m.timeout),
      state: m.overPool ? 'bad' : (m.overBudget ? 'warn' : 'good'),
      flag: m.overPool ? '[풀 초과]' : (m.overBudget ? '[예산 초과]' : '[예산 안]'),
      note: '초당 ' + DOWNSTREAM_RPS + '번 × ' + (m.timeout / 1000) + '초 = 동시 <strong>' +
        fmt(m.conc) + '개</strong>. 풀은 ' + POOL + '개입니다. ' +
        (m.overPool
          ? '넘친 ' + fmt(m.conc - POOL) + '개는 대기합니다. 이 API 와 무관한 요청까지 같이 멈춥니다.'
          : m.overBudget
            ? '우리를 부르는 쪽에 약속한 ' + BUDGET_MS + 'ms 를 넘었습니다. 그 쪽이 먼저 끊고, 우리가 부르는 쪽은 아무도 안 기다리는 채로 커넥션을 뭅니다.'
            : '안쪽 합(' + BUDGET_PARTS + ')이 ' + BUDGET_MS + 'ms 에 맞습니다.')
    };

    // (4) 시크릿 노출 위험 — 우리 서버 밖에 비밀이 놓이는 자리 수
    var g4 = {
      label: '시크릿 노출 위험', unit: '곳 · 우리 서버 밖', value: String(m.secret.n),
      state: m.secret.state, flag: m.secret.flag, note: m.secret.note
    };

    gaugeHost.innerHTML = gauge(g1) + gauge(g2) + gauge(g3) + gauge(g4);
  }

  // ==========================================
  // 2-d) 그리기 — 판정
  // ==========================================

  var verdictHost = document.getElementById('ac-verdict');

  // 무엇이 먼저 터지나. 위에 있는 것이 먼저다.
  //   풀이 차면 그 순간 서비스 전체가 멈춘다 → 1순위
  //   시크릿은 몇 달 조용하지만 되돌릴 수 없다 → 2순위
  //   중복은 알람이 없고 리포트만 틀어진다 → 3순위
  function issues(m) {
    var list = [];
    if (m.overPool) {
      list.push({
        bad: true, short: '커넥션 풀',
        line: '먼저 터지는 것은 <strong>커넥션 풀</strong>입니다 — 동시 ' + fmt(m.conc) +
          '개가 필요한데 풀은 ' + POOL + '개입니다. 이 API 와 상관없는 요청까지 같이 멈춥니다.'
      });
    }
    if (m.secret.state === 'bad') {
      list.push({
        bad: true, short: '시크릿 노출',
        line: '먼저 터지는 것은 <strong>시크릿</strong>입니다 — ' + AUTH[m.state.auth].label +
          ' 의 비밀을 사용자 기기에 둬야 합니다. 배포는 성공하고, 드러나는 것은 몇 달 뒤입니다.'
      });
    }
    if (m.dup > 0) {
      list.push({
        bad: true, short: '중복 ' + fmt(m.dup) + '줄',
        line: '먼저 터지는 것은 <strong>중복</strong>입니다 — 전환 테이블 ' + fmt(m.records) +
          '줄(+' + pct1(m.inflate) + '), 리포트 CPA ' + fmt(m.reportCpa) + '원. 에러가 아니라 알람이 울릴 자리가 없습니다.'
      });
    }
    if (m.sim.unresolved > 0) {
      list.push({
        bad: m.successPct < 95, short: '미확인 ' + fmt(m.sim.unresolved) + '건',
        line: '먼저 걸리는 것은 <strong>유실</strong>입니다 — ' + fmt(m.sim.unresolved) +
          '건이 답을 못 받고 남습니다. 서버가 기록했는지 아닌지를 부르는 쪽이 구분할 수 없습니다.'
      });
    }
    if (m.overBudget && !m.overPool) {
      list.push({
        bad: false, short: '예산 초과 ' + fmt(m.timeout) + 'ms',
        line: '먼저 걸리는 것은 <strong>예산</strong>입니다 — 하위 타임아웃 ' + fmt(m.timeout) +
          'ms 가 우리를 부르는 쪽에 약속한 ' + BUDGET_MS + 'ms 를 넘습니다. 그 쪽이 먼저 끊습니다.'
      });
    }
    if (m.secret.state === 'warn') {
      list.push({
        bad: false, short: '인증 ' + m.secret.flag,
        line: '먼저 걸리는 것은 <strong>인증</strong>입니다 — ' + AUTH[m.state.auth].label +
          ' 는 이 방향에서 ' + m.secret.flag + ' 상태입니다.'
      });
    }
    return list;
  }

  function drawVerdict(m) {
    var list = issues(m);
    var html, bad;
    if (!list.length) {
      bad = false;
      html = '<strong>지금 설정에서는 먼저 터지는 것이 없습니다.</strong> 재시도 ' + m.state.retry +
        '회가 전건을 건져 오고, 멱등키가 중복 ' + fmt(m.blocked) + '건을 막고, 하위 타임아웃 ' +
        fmt(m.timeout) + 'ms 가 예산 ' + BUDGET_MS + 'ms 안에 있습니다.';
    } else {
      bad = list[0].bad;
      html = list[0].line;
      if (list.length > 1) {
        var rest = [];
        for (var i = 1; i < list.length; i++) rest.push(list[i].short);
        html += '<span class="ac-verdict-order">그다음: ' + rest.join(' · ') + '</span>';
      }
    }
    verdictHost.innerHTML = html;
    verdictHost.classList.toggle('is-bad', bad);

    // 해설 패널(js/demo-edu-content.js)이 읽어 갈 값. 전역을 만들지 않으려고
    // 판정 박스의 data-* 에 실어 둔다.
    //
    // 자릿점이 붙는 것과 안 붙는 것을 갈라 둔다.
    //   화면에 그대로 박는 값 → 자릿점 붙임 (acSent · acRows · acBlocked ·
    //     acLost · acUnresolved · acCpa)
    //   해설이 크기를 비교하는 값 → 숫자만 (acDup · acRounds · acConc ·
    //     acSecret · acTimeout). 넷 다 1,000 을 안 넘어서 +d.acDup 이 안전하다
    var d = verdictHost.dataset;
    d.acSent = fmt(m.sim.totalSent);
    d.acLost = fmt(m.sim.totalLost);
    d.acRows = fmt(m.records);
    d.acBlocked = fmt(m.blocked);
    d.acUnresolved = fmt(m.sim.unresolved);
    d.acCpa = fmt(m.reportCpa);
    d.acDup = String(m.dup);
    d.acInflate = pct1(m.inflate);
    d.acSuccess = m.successPct.toFixed(1);
    d.acConc = String(m.conc);
    d.acTimeout = String(m.timeout);
    d.acRounds = String(m.sim.rows.length);
    d.acSecret = String(m.secret.n);
    d.acSecretFlag = m.secret.flag;
  }

  // ==========================================
  // 3) 바인딩
  // ==========================================

  var dirRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="ac-dir"]'));
  var authSel = document.getElementById('ac-auth');
  var idemBox = document.getElementById('ac-idem');
  var idemLabel = document.getElementById('ac-idem-label');
  var lossIn = document.getElementById('ac-loss');
  var retryIn = document.getElementById('ac-retry');
  var timeoutIn = document.getElementById('ac-timeout');
  var lossOut = document.getElementById('ac-loss-v');
  var retryOut = document.getElementById('ac-retry-v');
  var timeoutOut = document.getElementById('ac-timeout-v');
  var resetBtn = document.getElementById('ac-reset');

  function readState() {
    var dir = 's2s';
    for (var i = 0; i < dirRadios.length; i++) if (dirRadios[i].checked) dir = dirRadios[i].value;
    return {
      dir: dir,
      auth: authSel.value,
      idem: idemBox.checked,
      loss: parseInt(lossIn.value, 10),
      retry: parseInt(retryIn.value, 10),
      tIdx: parseInt(timeoutIn.value, 10)
    };
  }

  function render() {
    var m = build(readState());

    lossOut.textContent = m.state.loss + '%';
    retryOut.textContent = m.state.retry + '회';
    timeoutOut.textContent = fmt(m.timeout) + 'ms';

    // 고른 칸을 눈에 보이게 (CSS 의 .is-on)
    for (var i = 0; i < dirRadios.length; i++) {
      var lb = dirRadios[i].closest('label');
      if (lb) lb.classList.toggle('is-on', dirRadios[i].checked);
    }
    idemLabel.classList.toggle('is-on', idemBox.checked);

    svgHost.innerHTML = drawFlow(m);
    drawTable(m);
    drawGauges(m);
    drawVerdict(m);
  }

  // 슬라이더는 끌는 동안 따라와야 해서 input, 나머지는 change 하나로 충분하다.
  [lossIn, retryIn, timeoutIn].forEach(function (n) { n.addEventListener('input', render); });
  [authSel, idemBox].forEach(function (n) { n.addEventListener('change', render); });
  dirRadios.forEach(function (n) { n.addEventListener('change', render); });

  resetBtn.addEventListener('click', function () {
    dirRadios.forEach(function (n) { n.checked = (n.value === 's2s'); });
    authSel.value = 'hmac';
    idemBox.checked = true;
    lossIn.value = '15';
    retryIn.value = '3';
    timeoutIn.value = '0';
    render();
  });

  render();

  // demo-edu.js 는 <select> 의 첫 변경을 놓친다 — 초기값을 "변경된 뒤"에 읽어
  // 이전 값과 같다고 보고 해설을 건너뛴다. 이 파일은 demo-edu.js 보다 먼저
  // 로드되므로, 리스너가 걸린 다음 tick 에 값이 안 바뀌는 input 을 한 번
  // 흘려 초기값을 등록시킨다. 화면에는 아무 변화가 없다.
  setTimeout(function () {
    authSel.dispatchEvent(new Event('input', { bubbles: true }));
  }, 0);
})();
