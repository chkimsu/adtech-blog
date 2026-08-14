// ===================================================================
// 파이프라인 조립기 — js/pipeline-builder-demo.js
//
// 여섯 층(수집·버퍼·처리·유통·저장·조회)에 부품을 하나씩 놓아 보고,
// 그 조합에서 소비자 넷의 마감이 지켜지는지를 센다.
// 숫자는 전부 글 "데이터 파이프라인 설계" 본문에서 가져온 값이다.
//
// 색 값은 이 파일에 하나도 없다. 그림은 인라인 SVG 이고 색은 페이지 <style> 의
// 토큰(var(--…))이 정한다. canvas 가 아니라서 data-theme 이 바뀌어도
// 다시 그릴 필요가 없다 — 브라우저가 알아서 새 토큰 값으로 칠한다.
// ===================================================================
(function () {
  'use strict';

  // ==========================================
  // 0) 상수 — 전부 글 본문의 값이다
  // ==========================================
  var TO_BUFFER = { agent: 1112, sdk: 426 };   // 탭 → 버퍼 도달 (ms). 직행은 파일 640 + 에이전트 46 을 뺀 값
  var STREAM_MS = 800;                          // 스트림 집계 창 + 처리
  var HOUR_BATCH = 4200000;                     // 1시간 배치
  var DIST_HOP = 200;                           // 유통 층을 거칠 때 붙는 topic 왕복
  var DASH_DUE = 2000;                          // 대시보드 마감 2초
  var TRAIN_DUE = 108000000;                    // 학습 마감 30시간 (가장 오래된 이벤트 기준)
  var DAY_BATCH = 88200000;                     // 하루 배치 24.5시간
  var CLICKS = 2280000;                         // 하루 클릭 (기저 CTR 1.0%)
  var STREAM_CLICKS = 2202480;                  // 스트림 5분 창이 세는 건수 (96.6%)
  var BATCH_CLICKS = 2273160;                   // 배치 D+1 이 세는 건수 (99.7%)
  var RULES = 4;                                // 연결 하나당 정해야 하는 것 — 포맷·스키마·권한·재시도
  var DETECT_MIN = 30;                          // 멈춘 것을 사람이 알아채고 붙는 데 걸리는 시간(분)

  // 처리기가 멈췄을 때 앞 층이 들고 버티는 시간
  var HOLD = {
    kafka: { text: '168시간', min: 10080, who: 'Kafka 보존 7일',
      note: 'Kafka 가 offset 을 들고 있어 처리 잡이 멈춰도 7일까지는 잃지 않는다. 고쳐서 되감아 읽으면 된다.' },
    file: { text: '61.7시간', min: 3702, who: '수집 서버 로컬 파일',
      note: '버퍼가 없어 로컬 파일이 대신 버틴다. 초당 450 KB 로 쌓아 61.7시간이다. 다만 되감아 읽을 offset 이 없다.' },
    mem: { text: '10.4분', min: 10.4, who: '수집 서버 메모리 큐',
      note: '버퍼도 파일도 없다. 메모리 큐뿐이라 10.4분이면 넘치고, 넘친 만큼 그냥 사라진다.' }
  };

  // 처리 방식마다 도는 잡. 정제·조인은 어느 쪽에도 있고, 5분 집계·이상 탐지는 스트림,
  // 시간 집계는 배치다. 둘 다 고르면 정제·조인을 한 번만 세어 다섯이 된다.
  var JOBS = {
    stream: ['정제', '노출·클릭 조인', '5분 집계', '이상 탐지'],
    batch: ['정제', '노출·클릭 조인', '시간 집계'],
    both: ['정제', '노출·클릭 조인', '5분 집계', '시간 집계', '이상 탐지']
  };

  var STORES = [
    { id: 'pb-store-lake', short: 'Iceberg', full: '오브젝트 + Iceberg', tag: 'lake' },
    { id: 'pb-store-rt', short: 'ClickHouse', full: '실시간 DB', tag: 'rt' },
    { id: 'pb-store-search', short: 'OpenSearch', full: '검색엔진', tag: 'search' }
  ];
  // 저장소 말고 결과가 가야 하는 곳. 목적지 슬라이더를 올리면 이 순서로 붙는다.
  var FIXED_DESTS = ['리포트용 관계형 DB', '다른 팀 Kafka', '피처 스토어', '광고주 API', '실험 분석 DB'];

  // ==========================================
  // 1) 표기
  // ==========================================
  var $ = function (id) { return document.getElementById(id); };
  function nf(n) { return n.toLocaleString('en-US'); }

  // 10초 아래는 ms, 2시간 아래는 분, 그 위는 시간으로 적는다.
  function dur(ms) {
    if (ms < 10000) return nf(ms) + ' ms';
    if (ms < 7200000) return (ms / 60000).toFixed(1) + '분';
    return (ms / 3600000).toFixed(1) + '시간';
  }

  // ==========================================
  // 2) 지금 고른 조합 읽기
  // ==========================================
  function readCfg() {
    var stores = STORES.filter(function (s) { return $(s.id).checked; });
    var buffer = $('pb-buf').checked;
    var proc = $('pb-proc-stream').checked ? 'stream' : ($('pb-proc-batch').checked ? 'batch' : 'both');
    return {
      collector: $('pb-col-sdk').checked ? 'sdk' : 'agent',
      buffer: buffer,
      proc: proc,
      // 유통 층은 "한 번 쓰고 여럿이 읽는" 자리 위에 선다. 버퍼가 없으면 세울 수 없다.
      dist: buffer && $('pb-dist').checked,
      stores: stores,
      has: {
        lake: stores.some(function (s) { return s.tag === 'lake'; }),
        rt: stores.some(function (s) { return s.tag === 'rt'; }),
        search: stores.some(function (s) { return s.tag === 'search'; })
      },
      dests: +$('pb-dests').value
    };
  }

  // 목적지 목록 — 고른 저장소가 앞에 서고 나머지는 고정 목록에서 채운다.
  function destList(cfg) {
    var pool = cfg.stores.map(function (s) { return s.full; }).concat(FIXED_DESTS);
    return pool.slice(0, Math.max(cfg.dests, cfg.stores.length));
  }

  // ==========================================
  // 3) 계기 넷 계산
  // ==========================================
  function model(cfg) {
    var hasStream = cfg.proc !== 'batch';
    var hasBatch = cfg.proc !== 'stream';
    var ingest = TO_BUFFER[cfg.collector];
    var procMs = hasStream ? STREAM_MS : HOUR_BATCH;
    var distMs = cfg.dist ? DIST_HOP : 0;
    var dashMs = ingest + procMs + distMs;
    var budget = DASH_DUE - ingest;                 // 마감에서 도달 시간을 뺀 나머지
    var jobs = JOBS[cfg.proc];
    var dests = destList(cfg);
    var flat = jobs.length * dests.length;          // 유통 층 없음 — 곱셈
    var hub = jobs.length + dests.length;           // 유통 층 있음 — 덧셈
    var links = cfg.dist ? hub : flat;
    var hold = cfg.buffer ? HOLD.kafka : (cfg.collector === 'agent' ? HOLD.file : HOLD.mem);

    // --- 계기 1. 대시보드가 보는 지연 ---
    var dash = {
      ms: dashMs,
      value: dur(dashMs),
      ok: dashMs <= DASH_DUE && cfg.has.rt,
      state: !cfg.has.rt ? 'bad' : (dashMs <= DASH_DUE ? 'good' : 'bad'),
      chip: !cfg.has.rt ? '읽을 곳 없음' : (dashMs <= DASH_DUE ? '마감 안' : '마감 초과 ' + dur(dashMs - DASH_DUE)),
      sub: '수집 ' + nf(ingest) + ' + ' + (hasStream ? '스트림 ' + nf(STREAM_MS) : '1시간 배치 ' + nf(HOUR_BATCH)) +
        (distMs ? ' + 유통 ' + distMs : '') + ' ms',
      note: !cfg.has.rt
        ? '집계 결과를 최근 5분 · 지면별로 꺼낼 저장소가 없다. 실시간 DB 를 켜야 이 숫자에 뜻이 생긴다.'
        : (hasStream
          ? '마감 2,000 ms 에서 도달 ' + nf(ingest) + ' ms 를 빼면 남는 예산 ' + nf(budget) + ' ms. ' +
            '지금 쓰는 것은 ' + nf(procMs + distMs) + ' ms 다.'
          : '스트림이 없어 가장 빠른 후보가 1시간 배치다. 남는 예산 ' + nf(budget) + ' ms 를 2,100배 넘긴다.')
    };
    dash.formula = '대시보드 ' + nf(ingest) + ' + ' + nf(procMs) + (distMs ? ' + ' + distMs : '') +
      ' = ' + nf(dashMs) + ' ms (마감 ' + nf(DASH_DUE) + ' ms)';

    // --- 계기 2. 학습 데이터가 준비되는 시각 ---
    var train;
    if (!cfg.has.lake) {
      train = {
        value: '없음', state: 'bad', chip: '담을 곳 없음',
        sub: '오브젝트 스토리지 + 테이블 포맷이 없다',
        note: 'raw 하루 21.9 GB · 정제 하루 9.12 GB 를 담을 자리가 없다. 학습도 정산도 원천이 없고, 지난 30일 백필도 못 한다.'
      };
    } else if (hasBatch) {
      train = {
        value: '다음 날 06:00', state: 'good', chip: '마감 안',
        sub: '가장 오래된 이벤트 24.5시간 · 마감 30시간 · 여유 5.5시간',
        note: 'D+1 배치가 클릭 ' + nf(BATCH_CLICKS) + '건(99.7%)을 세고, D+2 재집계가 ' + nf(CLICKS) + '건(100%)으로 확정한다.'
      };
    } else {
      train = {
        value: '5분 뒤', state: 'warn', chip: '라벨 96.6%',
        sub: '클릭 ' + nf(STREAM_CLICKS) + ' / ' + nf(CLICKS) + '건',
        note: '배치가 없어 스트림 5분 창이 곧 확정이 된다. 늦게 온 클릭 ' + nf(CLICKS - STREAM_CLICKS) +
          '건이 라벨에 안 붙는다. 정산의 0건 조건도 못 맞춘다.'
      };
    }

    // --- 계기 3. 한 층이 멈췄을 때 버티는 시간 ---
    var holdG = {
      value: hold.text,
      state: hold.min < DETECT_MIN ? 'bad' : (cfg.buffer ? 'good' : 'warn'),
      chip: hold.min < DETECT_MIN ? '알아채기 전에 샌다' : '버틴다',
      sub: '버티는 것은 ' + hold.who,
      note: hold.note
    };

    // --- 계기 4. 사람이 관리할 연결 수 ---
    var linkG = {
      value: nf(links),
      state: cfg.dist ? 'good' : 'warn',
      chip: cfg.dist ? '덧셈 ' + jobs.length + ' + ' + dests.length : '곱셈 ' + jobs.length + ' × ' + dests.length,
      sub: '설정 자리 ' + nf(links * RULES) + '개 (연결마다 포맷·스키마·권한·재시도)',
      note: cfg.dist
        ? '유통 층이 없으면 같은 구성이 ' + nf(flat) + '개다. 목적지를 하나 더 붙일 때 손대는 처리 잡은 0개다.'
        : '유통 층을 세우면 ' + nf(hub) + '개로 준다. 지금은 목적지를 하나 더 붙일 때 처리 잡 ' + jobs.length + '개를 고친다.'
    };

    // --- 판정: 무엇이 먼저 터지나 ---
    var problems = [];
    if (hold.min < DETECT_MIN) {
      problems.push({
        t: '멈추면 ' + hold.text + ' 뒤부터 로그가 사라진다',
        d: '멈춘 것을 사람이 알아채고 붙는 데 ' + DETECT_MIN + '분으로 잡으면, 그 전에 이미 샌다. ' +
          '버퍼를 세우거나 수집기를 파일 경유로 바꾸면 시간 단위가 된다.'
      });
    }
    if (!cfg.has.lake) {
      problems.push({
        t: '학습·정산 원천이 없다',
        d: '되돌릴 수 없는 변환을 거친 값만 남는다. 조인 창을 3시간에서 6시간으로 바꾸는 재처리도, 30일 백필도 불가능하다.'
      });
    }
    if (!cfg.has.rt) {
      problems.push({
        t: '대시보드가 읽을 저장소가 없다',
        d: '5분 집계 결과를 최근 5분 · 지면별로 꺼낼 자리가 없다. 지연을 아무리 줄여도 볼 화면이 없다.'
      });
    }
    if (dashMs > DASH_DUE) {
      problems.push({
        t: '대시보드가 마감 2초를 ' + dur(dashMs - DASH_DUE) + ' 넘긴다',
        d: hasStream
          ? '남는 예산은 ' + nf(budget) + ' ms 인데 스트림 ' + nf(STREAM_MS) + ' 에 유통 홉 ' + DIST_HOP + ' 이 붙었다. ' +
            '수집기를 직행으로 바꾸거나 대시보드 경로만 유통을 거치지 않게 빼면 들어온다.'
          : '남는 예산 ' + nf(budget) + ' ms 안에 드는 경로는 스트림 집계 하나뿐이다. 1시간 배치로는 어떤 설정으로도 못 맞춘다.'
      });
    }
    if (hasStream && !hasBatch) {
      problems.push({
        t: '라벨이 ' + nf(CLICKS - STREAM_CLICKS) + '건 모자란다',
        d: '스트림 5분 창은 클릭 ' + nf(CLICKS) + '건 중 ' + nf(STREAM_CLICKS) + '건(96.6%)만 센다. ' +
          '다시 세어 덮어쓸 배치가 없으면 그 값이 확정이 된다.'
      });
    }
    if (!cfg.buffer) {
      problems.push({
        t: '한 번 쓰고 여럿이 읽는 자리가 없다',
        d: '유통 층도 못 세운다. 소비자가 늘 때마다 수집기가 같은 것을 한 벌씩 더 보내야 하고, 되감아 읽을 offset 도 없다.'
      });
    }
    if (!cfg.dist) {
      problems.push({
        t: '목적지 하나에 처리 잡 ' + jobs.length + '개를 손댄다',
        d: '연결 ' + nf(flat) + '개 · 설정 자리 ' + nf(flat * RULES) + '개다. 유통 층을 세우면 ' +
          nf(hub) + '개 · ' + nf(hub * RULES) + '개이고, 새 목적지는 커넥터 하나로 끝난다.'
      });
    }
    if (!cfg.has.search) {
      problems.push({
        t: '운영자가 원문을 못 찾는다',
        d: 'DLQ 하루 1,800건 중 "알 수 없음" 130건은 원문을 사람이 봐야 한다. 검색엔진을 켜면 목적지가 하나 는다.'
      });
    }

    var cost;
    if (cfg.proc === 'both') cost = '마감대로 고른 조합이다 — 소비자 넷의 비용지수 합계 148.';
    else if (cfg.proc === 'stream') cost = '넷 다 스트림으로 붙이면 비용지수 400 이다. 마감대로 고른 148 의 2.7배다.';
    else cost = '배치만 두면 싸다. 대신 남는 예산 ' + nf(budget) + ' ms 짜리 소비자가 후보를 하나도 못 찾는다.';

    return {
      hasStream: hasStream, hasBatch: hasBatch, jobs: jobs, dests: dests,
      flat: flat, hub: hub, links: links, ingest: ingest, procMs: procMs, distMs: distMs,
      dash: dash, train: train, hold: holdG, link: linkG, problems: problems, cost: cost
    };
  }

  // ==========================================
  // 4) 그림 — 층 여섯 칸
  // ==========================================
  var SW = 150, SGAP = 28;   // 칸 너비 · 칸 사이

  function txt(x, y, s, cls, anchor) {
    return '<text x="' + x + '" y="' + y + '" class="' + cls + '"' +
      (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + s + '</text>';
  }

  function layerBoxes(cfg, m) {
    var agent = cfg.collector === 'agent';
    var procLines;
    if (cfg.proc === 'stream') {
      procLines = [{ t: '스트림 집계', c: 'k' }, { t: '800 ms', c: 'v' }, { t: '잡 4개 · 5분 창', c: 's' }];
    } else if (cfg.proc === 'batch') {
      procLines = [{ t: '1시간 배치', c: 'k' }, { t: '4,200,000 ms', c: 'v' }, { t: '잡 3개 · D+1', c: 's' }];
    } else {
      procLines = [{ t: '스트림 + 배치', c: 'k' }, { t: '800 ms · D+1', c: 'v' }, { t: '잡 5개', c: 's' }];
    }

    var storeLines = cfg.stores.map(function (s) { return { t: s.short, c: 'v' }; });
    if (cfg.has.lake) storeLines.push({ t: '하루 31.0 GB', c: 's' });

    return [
      {
        n: '① 수집', on: true,
        lines: agent
          ? [{ t: '에이전트 tail', c: 'k' }, { t: '1,112 ms', c: 'v' }, { t: '파일이 61.7시간 버팀', c: 's' }]
          : [{ t: 'SDK 직행', c: 'k' }, { t: '426 ms', c: 'v' }, { t: '메모리 큐 10.4분', c: 's' }]
      },
      {
        n: '② 버퍼', on: cfg.buffer,
        lines: cfg.buffer
          ? [{ t: 'Kafka', c: 'k' }, { t: '보존 7일', c: 'v' }, { t: '한 번 쓰고 여럿이', c: 's' }, { t: '읽는다', c: 's' }]
          : [{ t: '없음', c: 'k' }, { t: '여럿이 읽을', c: 's' }, { t: '자리가 없다', c: 's' }]
      },
      { n: '③ 처리', on: true, lines: procLines },
      {
        n: '④ 유통', on: cfg.dist, key: cfg.dist,
        lines: cfg.dist
          ? [{ t: '커넥터', c: 'k' }, { t: 'ad.*.clean', c: 'v' }, { t: '+200 ms · 목적지 ' + m.dests.length, c: 's' }]
          : [{ t: '없음', c: 'k' }, { t: '잡이 목적지에', c: 's' }, { t: '직접 쓴다', c: 's' }]
      },
      {
        n: '⑤ 저장', on: cfg.stores.length > 0,
        lines: cfg.stores.length ? storeLines : [{ t: '없음', c: 'k' }, { t: '담을 곳이 없다', c: 's' }]
      },
      { n: '⑥ 조회', on: true, lines: [{ t: 'Trino · SQL', c: 'k' }, { t: '소비자 4', c: 'v' }, { t: '넷이 읽는다', c: 's' }] }
    ];
  }

  function stripSVG(cfg, m) {
    var boxes = layerBoxes(cfg, m);
    var alt = '여섯 층을 왼쪽에서 오른쪽으로 늘어놓은 그림. ' +
      boxes.map(function (b) {
        return b.n.replace(/[①-⑥] /, '') + '은 ' + (b.on ? b.lines[0].t : '비어 있고 점선으로 그려져 있다');
      }).join(', ') + '. 아래에 대시보드가 보는 지연 계산식이 적혀 있다.';

    var s = '<svg viewBox="0 0 1040 196" role="img" aria-label="' + alt + '">';
    s += '<defs>' +
      '<marker id="pb-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto">' +
      '<path d="M0,0 L7.5,3 L0,6 Z" class="pb-head"/></marker>' +
      '<marker id="pb-arr-dead" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto">' +
      '<path d="M0,0 L7.5,3 L0,6 Z" class="pb-head-dead"/></marker>' +
      '</defs>';

    boxes.forEach(function (b, i) {
      var x = i * (SW + SGAP);
      var cls = 'pb-box' + (b.on ? (b.key ? ' is-key' : '') : ' is-off');
      s += txt(x + SW / 2, 22, b.n, 'pb-lyr', 'middle');
      s += '<rect x="' + x + '" y="32" width="' + SW + '" height="110" class="' + cls + '"/>';
      b.lines.forEach(function (ln, j) {
        s += txt(x + SW / 2, 60 + j * 21, ln.t, 'pb-' + ln.c + (b.on ? '' : ' is-dim'), 'middle');
      });
      if (i < boxes.length - 1) {
        var dead = !boxes[i + 1].on;
        s += '<line x1="' + (x + SW + 3) + '" y1="87" x2="' + (x + SW + SGAP - 4) + '" y2="87" ' +
          'class="pb-arrow' + (dead ? ' is-dead' : '') + '" marker-end="url(#pb-arr' + (dead ? '-dead' : '') + ')"/>';
      }
    });

    s += txt(0, 172, m.dash.formula, 'pb-s');
    s += txt(1040, 172, '버티는 시간 ' + m.hold.value + ' · 연결 ' + m.link.value + '개', 'pb-s', 'end');
    s += '</svg>';
    return s;
  }

  // ==========================================
  // 5) 그림 — 처리 잡과 목적지를 잇는 선
  // ==========================================
  function fanSVG(cfg, m) {
    var jobs = m.jobs, dests = m.dests;
    var JH = 26, JG = 10, DH = 24, DG = 9, MID = 190;
    var jTotal = jobs.length * JH + (jobs.length - 1) * JG;
    var dTotal = dests.length * DH + (dests.length - 1) * DG;
    var jTop = MID - jTotal / 2, dTop = MID - dTotal / 2;
    var jx = 6, jw = 150, dx = 844, dw = 190;
    var hx = 440, hw = 160, hy = MID - 30, hh = 60;

    var head = cfg.dist
      ? '유통 층 있음 — 잡 ' + jobs.length + ' + 목적지 ' + dests.length + ' = 연결 ' + m.hub + '개 · 설정 자리 ' + (m.hub * RULES) + '개'
      : '유통 층 없음 — 잡 ' + jobs.length + ' × 목적지 ' + dests.length + ' = 연결 ' + m.flat + '개 · 설정 자리 ' + (m.flat * RULES) + '개';
    var foot = cfg.dist
      ? '목적지를 하나 더 붙일 때 손대는 처리 잡 0개 — 커넥터 설정에 블록 하나가 는다'
      : '목적지를 하나 더 붙일 때 손대는 처리 잡 ' + jobs.length + '개 — 그만큼 코드 리뷰와 배포가 는다';

    var s = '<svg viewBox="0 0 1040 352" role="img" aria-label="' + head + '. 왼쪽에 처리 잡 ' +
      jobs.length + '개, 오른쪽에 목적지 ' + dests.length + '개가 있고 그 사이를 선이 잇는다.">';

    // 선을 먼저 그려 상자 뒤로 보낸다
    var jy = function (i) { return jTop + i * (JH + JG) + JH / 2; };
    var dy = function (i) { return dTop + i * (DH + DG) + DH / 2; };
    if (cfg.dist) {
      jobs.forEach(function (_, i) {
        s += '<line x1="' + (jx + jw) + '" y1="' + jy(i) + '" x2="' + hx + '" y2="' + MID + '" class="pb-wire is-hub"/>';
      });
      dests.forEach(function (_, i) {
        s += '<line x1="' + (hx + hw) + '" y1="' + MID + '" x2="' + dx + '" y2="' + dy(i) + '" class="pb-wire is-hub"/>';
      });
    } else {
      jobs.forEach(function (_, i) {
        dests.forEach(function (__, k) {
          s += '<line x1="' + (jx + jw) + '" y1="' + jy(i) + '" x2="' + dx + '" y2="' + dy(k) + '" class="pb-wire is-flat"/>';
        });
      });
    }

    jobs.forEach(function (name, i) {
      var y = jTop + i * (JH + JG);
      s += '<rect x="' + jx + '" y="' + y + '" width="' + jw + '" height="' + JH + '" class="pb-box"/>';
      s += txt(jx + jw / 2, y + 17, name, 'pb-v', 'middle');
    });
    dests.forEach(function (name, i) {
      var y = dTop + i * (DH + DG);
      s += '<rect x="' + dx + '" y="' + y + '" width="' + dw + '" height="' + DH + '" class="pb-box"/>';
      s += txt(dx + dw / 2, y + 16, name, 'pb-v', 'middle');
    });
    if (cfg.dist) {
      s += '<rect x="' + hx + '" y="' + hy + '" width="' + hw + '" height="' + hh + '" class="pb-box is-key"/>';
      s += txt(hx + hw / 2, hy + 25, '유통 계층', 'pb-k', 'middle');
      s += txt(hx + hw / 2, hy + 45, 'ad.*.clean', 'pb-v', 'middle');
    } else {
      s += '<rect x="' + hx + '" y="' + hy + '" width="' + hw + '" height="' + hh + '" class="pb-box is-off"/>';
      s += txt(hx + hw / 2, hy + 35, '없음', 'pb-k is-dim', 'middle');
    }

    s += txt(6, 18, head, 'pb-s');
    s += txt(6, 344, foot, 'pb-s');
    s += '</svg>';
    return s;
  }

  // ==========================================
  // 6) 계기·판정 찍기
  // ==========================================
  var GAUGES = [
    { id: 'pb-g-dash', key: 'dash' },
    { id: 'pb-g-train', key: 'train' },
    { id: 'pb-g-hold', key: 'hold' },
    { id: 'pb-g-link', key: 'link' }
  ];

  function renderGauges(m) {
    GAUGES.forEach(function (g) {
      var d = m[g.key];
      var box = $(g.id);
      box.className = 'pb-gauge is-' + d.state;
      box.querySelector('.pb-gauge-value').textContent = d.value;
      box.querySelector('.pb-gauge-chip').textContent = d.chip;
      box.querySelector('.pb-gauge-sub').textContent = d.sub;
      box.querySelector('.pb-gauge-note').textContent = d.note;
    });
  }

  function renderVerdict(m) {
    var box = $('pb-verdict');
    var html;
    if (!m.problems.length) {
      box.className = 'pb-verdict is-ok';
      html = '<p class="pb-verdict-head">터지는 것이 없다</p>' +
        '<p class="pb-verdict-lead">소비자 넷의 마감이 다 지켜지고, 목적지를 하나 더 붙일 때 손대는 처리 잡도 0개다.</p>';
    } else {
      var first = m.problems[0];
      box.className = 'pb-verdict is-bad';
      html = '<p class="pb-verdict-head">먼저 터지는 것</p>' +
        '<p class="pb-verdict-lead"><strong>' + first.t + '</strong> — ' + first.d + '</p>';
      if (m.problems.length > 1) {
        html += '<p class="pb-verdict-sub">뒤따라 터지는 것 ' + (m.problems.length - 1) + '개</p><ul class="pb-verdict-list">';
        m.problems.slice(1).forEach(function (p) {
          html += '<li><strong>' + p.t + '</strong> — ' + p.d + '</li>';
        });
        html += '</ul>';
      }
    }
    html += '<p class="pb-verdict-cost">' + m.cost + '</p>';
    box.innerHTML = html;
  }

  // ==========================================
  // 7) 컨트롤 상태 맞추기
  // ==========================================
  var SEG_INPUTS = ['pb-col-agent', 'pb-col-sdk', 'pb-buf', 'pb-proc-stream', 'pb-proc-batch',
    'pb-proc-both', 'pb-dist', 'pb-store-lake', 'pb-store-rt', 'pb-store-search'];

  function syncSeg() {
    SEG_INPUTS.forEach(function (id) {
      var input = $(id);
      var label = input.closest('label');
      if (label) label.classList.toggle('is-on', input.checked && !input.disabled);
    });
    // 버퍼가 없으면 유통 층을 세울 자리가 없다 — 고를 수 없게 잠근다.
    var buf = $('pb-buf').checked;
    var dist = $('pb-dist');
    dist.disabled = !buf;
    var distLabel = dist.closest('label');
    if (distLabel) {
      distLabel.classList.toggle('is-locked', !buf);
      distLabel.classList.toggle('is-on', buf && dist.checked);
    }
    $('pb-dist-lock').hidden = buf;
  }

  // 저장소를 켜고 끄면 목적지 수도 같이 움직인다 — 새로 세운 저장소가 목적지 하나다.
  function bumpDests(delta) {
    var slider = $('pb-dests');
    var next = Math.min(+slider.max, Math.max(+slider.min, +slider.value + delta));
    slider.value = next;
  }

  // 고른 저장소보다 목적지가 적을 수는 없다.
  function clampDests() {
    var slider = $('pb-dests');
    var stores = STORES.filter(function (s) { return $(s.id).checked; }).length;
    if (+slider.value < stores) slider.value = stores;
  }

  function render() {
    syncSeg();
    clampDests();
    var cfg = readCfg();
    var m = model(cfg);
    $('pb-dests-v').textContent = cfg.dests;
    $('pb-strip').innerHTML = stripSVG(cfg, m);
    $('pb-fan').innerHTML = fanSVG(cfg, m);
    renderGauges(m);
    renderVerdict(m);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!$('pb-strip')) return;
    SEG_INPUTS.forEach(function (id) {
      $(id).addEventListener('change', function () {
        var store = STORES.filter(function (s) { return s.id === id; })[0];
        if (store) bumpDests($(id).checked ? 1 : -1);
        render();
      });
    });
    $('pb-dests').addEventListener('input', render);
    render();
  });
})();
