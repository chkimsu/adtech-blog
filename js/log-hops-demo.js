// ===================================================================
// 로그 여섯 층 내려가기 — js/log-hops-demo.js
//
// 클릭 한 건이 앱 SDK 에서 Kafka 까지 여섯 층을 내려간다. 층마다 모양이
// 바뀌고 크기가 바뀌고 머무는 시간이 다르다. 그리고 어느 층을 멈춰 세우면
// 어디에 쌓이는지가 층의 성질(디스크냐 메모리냐)로 갈린다.
//
// 값은 전부 posts/log-hops-to-kafka.md 에서 가져왔다. 바이트는 지어내지 않고
// 그 글이 적어 둔 문자열을 그대로 세어 쓴다(아래 b() · reqBytes()).
//
// 색 값은 이 파일에 하나도 없다. 상태는 CSS 클래스로만 표시한다
// (팔레트 2종 × 테마 2종 = 4가지 조합에서 전부 살아 있어야 하므로).
// canvas 를 안 써서 cssVar() 헬퍼도 필요 없다 — 전부 DOM 이다.
//
// 파일 구성은 셋이다.
//   1) 상태 — 시뮬레이션 값만 든다. DOM 을 모른다
//   2) 그리기 — state 를 읽어 DOM 에 반영한다. state 를 바꾸지 않는다
//   3) 바인딩 — 이벤트를 받아 state 를 바꾸고 draw* 를 부른다
// ===================================================================
(function () {
  'use strict';

  // ==========================================
  // 0) 글에서 가져온 상수
  // ==========================================

  // bytes 는 "클릭 한 건" 기준이다 — 글 9절 표의 ①③④⑤⑥⑦⑧ 값이다.
  // ms 도 클릭 한 건이 그 층에서 기다린 시간이다. kafka 만 null 인데,
  // 7일은 "다음 자리로 가려고 기다린 시간"이 아니라 "놓인 뒤 안 지워지는 기한"이라
  // 나머지 다섯과 같은 축에 못 올린다(글 9절이 짚은 그 구분이다).
  //
  // collector 의 642 ms 는 글 표의 ③ 수집 서버 2 ms + ④ 로컬 파일 640 ms 다.
  // 이 데모는 그 둘을 한 층으로 합쳐 여섯 층으로 그린다. 화면의 축척 상자에 적어 뒀다.
  var HOPS = [
    { key: 'sdk', label: '앱 SDK', bytes: 102, ms: 0, cap: 30 },
    { key: 'collector', label: '수집 서버 + 로컬 파일', bytes: 169, ms: 642, cap: 60 },
    { key: 'agent', label: '수집 에이전트', bytes: 169, ms: 46, cap: 10 },
    { key: 'transform', label: '변환기', bytes: 308, ms: 220, cap: 10 },
    { key: 'kafka', label: 'Kafka 브로커', bytes: 36.6, ms: null, cap: 40 },
    { key: 'consumer', label: 'consumer', bytes: 308, ms: 900, cap: 30 }
  ];
  var LAST = HOPS.length - 1;

  // 글 3절·5절이 적어 둔 문자열 그대로. 바이트는 여기서 세어 쓴다.
  var CLICK_HEAD = '10.2.31.7 2026-08-06T16:48:21+09:00 POST /v1/e 204 0.002 "MyApp/3.2.1 (iPhone; iOS 19.2)" ';
  var CLICK_BODY = '{"t":"clk","rid":"r-8f21","ad":9931,"s":"main_top","ts":1786002501234,"seq":47}';
  var IMP_HEAD = '10.2.31.7 2026-08-06T16:08:26+09:00 POST /v1/e 204 0.004 "MyApp/3.2.1 (iPhone; iOS 19.2)" ';
  // 글 5절의 노출 배치 한 줄에 실제로 들어 있던 네 건. 배치를 늘리면 이 넷을 돌려 쓴다.
  var IMP_ELS = [
    '{"rid":"r-8f21","ad":9931,"s":"main_top","ts":1786000101118,"seq":11}',
    '{"rid":"r-9d55","ad":8820,"s":"feed_2","ts":1786000101173,"seq":12}',
    '{"rid":"r-4a17","ad":7715,"s":"feed_7","ts":1786000101241,"seq":13}',
    '{"rid":"r-2e93","ad":6604,"s":"feed_12","ts":1786000101305,"seq":14}'
  ];
  // 액세스 로그 줄에서 서버가 앞에 붙이는 부분. 90 B 다(글 3절).
  // 에이전트가 배치를 건별로 쪼개면 이 90 B 가 건마다 다시 붙는다.
  var LOG_PREFIX_BYTES = 90;

  var REAL_EVENTS_PER_SEC = 2665;   // 글 3절 표 — Kafka 로 흘러 들어가는 이벤트
  var REAL_CLICK_EVERY = 101;       // 하루 이벤트 2억 3,028만 ÷ 클릭 228만

  // 화면 축척 — 실제 초당 2,665건을 다 그릴 수 없다.
  var EVENT_INTERVAL = 60;          // 애니메이션 ms 마다 이벤트 하나
  var CLICK_EVERY = 6;              // 6이벤트에 하나가 클릭 (실제는 101에 하나)

  // 애니메이션 시간 — 실제 ms 를 그대로 쓰면 0 ms 층이 안 보인다.
  // 그래서 층마다 최소 통과 시간을 얹는다. 누적 시간 표시는 이 값이 아니라
  // 언제나 실제 ms 로 환산해서 쓴다(realRate 참고).
  var BASE_ANIM = 80;
  var MS_SCALE = 0.8;
  var KAFKA_ANIM = 420;             // 7일을 그릴 수 없어 고정으로 둔 통과 시간

  var DOT_CAP = 9;                  // 한 층에 그리는 점의 최대 수. 넘으면 "+N"

  // 본문 안 iframe 인가. demo-edu.js 와 같은 방식으로 본다.
  // 글자 수를 여기서만 가른다 — 나머지 접는 일은 전부 CSS(html.is-embed)가 한다.
  var IS_EMBED = /[?&]embed=1/.test(location.search);

  // ==========================================
  // 1) 상태 — 시뮬레이션 값만. DOM 을 모른다
  // ==========================================

  var state = {
    playing: true,
    speed: 1,
    batch: 4,                       // 노출 한 요청에 묶이는 건수. 글 5절 표의 값이 4
    stopped: { agent: false, kafka: false },
    packets: [],                    // {id, kind, n, hop, age, spent[], retired}
    selected: null,
    userPicked: false,              // 사람이 점을 고른 적이 있나 (자동 추적을 멈추는 기준)
    sdkQueue: 0,                    // SDK 큐에 모이는 중인 노출 건수
    emitAcc: 0,
    eventSeq: 0,
    dropped: 0,                     // 앞이 다 차서 못 받은 이벤트 수
    nextId: 1
  };

  // ---- 순수 계산 ----

  function b(s) {                   // UTF-8 바이트 수
    var n = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      n += c < 0x80 ? 1 : c < 0x800 ? 2 : 3;
    }
    return n;
  }

  function impEls(n) {
    var a = [];
    for (var i = 0; i < n; i++) a.push(IMP_ELS[i % IMP_ELS.length]);
    return a;
  }

  function impBody(n) { return '{"t":"imp","e":[' + impEls(n).join(',') + ']}'; }

  // 요청 하나가 그 층에서 차지하는 바이트.
  // 클릭은 글이 확정한 값을 그대로 쓴다. 노출은 묶인 건수에 따라 달라져서 세어 쓴다.
  function reqBytes(kind, hopIdx, n) {
    if (kind === 'click') return HOPS[hopIdx].bytes;
    switch (HOPS[hopIdx].key) {
      case 'sdk': return 102 * n;
      case 'collector': return b(IMP_HEAD + impBody(n));
      // 에이전트가 건별로 쪼갠 뒤라 앞부분 90 B 가 건마다 다시 붙는다
      case 'agent': return impEls(n).reduce(function (s, e) { return s + LOG_PREFIX_BYTES + b(e); }, 0);
      case 'transform': return 308 * n;
      case 'kafka': return 36.6 * n;
      default: return 308 * n;
    }
  }

  function animDwell(i) {
    if (HOPS[i].key === 'kafka') return KAFKA_ANIM;
    return BASE_ANIM + HOPS[i].ms * MS_SCALE;
  }

  // 애니메이션 1 ms 가 그 층의 실제 몇 ms 인가.
  // Kafka 는 0 이다 — 7일을 누적에 더하면 안 되기 때문이다.
  function realRate(i) {
    if (HOPS[i].key === 'kafka') return 0;
    return HOPS[i].ms / animDwell(i);
  }

  function isStopped(i) {
    var k = HOPS[i].key;
    return k === 'agent' ? state.stopped.agent : k === 'kafka' ? state.stopped.kafka : false;
  }

  function groupByHop() {
    var g = HOPS.map(function () { return []; });
    state.packets.forEach(function (p) { g[p.hop].push(p); });
    // 오래 있은 것이 앞(= 화면 오른쪽)
    g.forEach(function (list) { list.sort(function (x, y) { return y.age - x.age; }); });
    return g;
  }

  function makePacket(kind, n) {
    return {
      id: state.nextId++,
      kind: kind,
      n: n,
      hop: 0,
      age: 0,          // 이 층에 들어온 뒤 흐른 애니메이션 ms
      blocked: 0,      // 그중 "정상 체류를 이미 채웠는데 앞이 막혀 못 간" 애니메이션 ms
      spent: HOPS.map(function () { return 0; }),   // 떠난 층의 실제 ms (확정값)
      retired: false
    };
  }

  // 지금 층에서 이 건이 실제로 몇 ms 를 썼나. age 에서 바로 계산하므로
  // 프레임 오차가 쌓이지 않는다 — 글의 642 ms 가 649 ms 로 불어나지 않게 하는 부분이다.
  // Kafka 는 0 이다. 7일은 다른 시계라 누적에 안 더한다.
  function liveSpent(p) {
    var i = p.hop, ms = HOPS[i].ms;
    if (ms === null) return 0;
    var d = animDwell(i);
    if (p.age <= d) return (p.age / d) * ms;
    return ms + (p.age - d) * realRate(i);      // 정상값을 넘긴 만큼은 붙잡혀 있던 시간
  }

  // 한 틱. dt 는 이미 속도가 곱해진 애니메이션 밀리초다.
  function step(dt) {
    var i, k;

    // (1) 시간을 흘린다 — 멈춰 세운 층에서도 시간은 흐른다
    for (i = 0; i < state.packets.length; i++) state.packets[i].age += dt;

    // (2) 이동 — 하류부터 훑어야 앞칸이 비면서 뒤칸이 따라 들어온다
    var byHop = groupByHop();
    var counts = byHop.map(function (l) { return l.length; });
    var retire = [];
    for (i = LAST; i >= 0; i--) {
      if (isStopped(i)) continue;                       // 멈춘 층은 아무것도 안 내보낸다
      var q = byHop[i];
      var d = animDwell(i);
      for (k = 0; k < q.length; k++) {
        var pk = q[k];
        if (pk.age < d) break;                          // FIFO — 앞이 안 익었으면 뒤도 못 간다
        if (i !== LAST && (isStopped(i + 1) || counts[i + 1] >= HOPS[i + 1].cap)) {
          pk.blocked = pk.age - d;                      // 여기부터는 붙잡혀 있는 시간이다
          break;
        }
        // 떠나는 순간의 실제 체류를 확정한다. 막힌 적이 없으면 정확히 글의 값이다.
        pk.spent[i] = (HOPS[i].ms === null ? 0 : HOPS[i].ms) + pk.blocked * realRate(i);
        counts[i]--;
        if (i === LAST) { retire.push(pk); continue; }
        // 남은 자투리 시간은 다음 층으로 넘긴다 — 프레임 경계에서 시간이 사라지지 않게.
        // 다음 층의 체류를 넘기게는 안 넘긴다. 16x 에서는 한 프레임이 1,600 ms 나 되는데,
        // 그것을 그대로 넘기면 막힌 적도 없는 건이 "붙잡혀 있다"고 표시된다.
        var carry = pk.age - d - pk.blocked;
        var nextD = animDwell(i + 1);
        pk.hop = i + 1;
        pk.age = carry > 0 ? Math.min(carry, nextD) : 0;
        pk.blocked = 0;
        counts[i + 1]++;
      }
    }
    if (retire.length) {
      retire.forEach(function (p) { p.retired = true; });
      state.packets = state.packets.filter(function (p) { return !p.retired; });
    }

    // (3) 새 이벤트
    state.emitAcc += dt;
    while (state.emitAcc >= EVENT_INTERVAL) {
      state.emitAcc -= EVENT_INTERVAL;
      state.eventSeq++;
      if (state.eventSeq % CLICK_EVERY === 0) {
        spawn('click', 1, counts);
      } else {
        state.sdkQueue++;
        if (state.sdkQueue >= state.batch) {
          spawn('imp', state.sdkQueue, counts);
          state.sdkQueue = 0;
        }
      }
    }

    // (4) 사람이 아직 안 골랐으면 화면이 비지 않게 따라간다
    if (!state.userPicked && (!state.selected || state.selected.retired)) {
      state.selected = state.packets.length ? state.packets[state.packets.length - 1] : state.selected;
    }
  }

  function spawn(kind, n, counts) {
    if (counts[0] >= HOPS[0].cap) { state.dropped += n; return; }   // 앞이 다 찼다
    var p = makePacket(kind, n);
    state.packets.push(p);
    counts[0]++;
  }

  function resetSim() {
    state.packets = [];
    state.selected = null;
    state.userPicked = false;
    state.sdkQueue = 0;
    state.emitAcc = 0;
    state.eventSeq = 0;
    state.dropped = 0;
  }

  // 처음 화면이 비어 보이지 않게 층마다 몇 건 미리 흘려 둔다.
  // 60 ms × 90 = 5.4초 — 여섯 층을 한 바퀴 다 돌아 안정된 상태가 된다.
  function seed() {
    for (var i = 0; i < 90; i++) step(EVENT_INTERVAL);
  }

  // ==========================================
  // 2) 그리기 — state 를 읽어 DOM 에 반영한다. state 를 바꾸지 않는다
  // ==========================================

  var $ = function (id) { return document.getElementById(id); };
  var flowEl, laneEl = [], trackEl = [], moreEl = [], queueEl = [];
  var sdkqEl = null, lossEl = null;
  var dropLaneEl = null, dropNameEl = null;   // 유실이 나는 층(앱 SDK)과 그 층의 이름 칸
  var dotNodes = Object.create(null);   // packet id -> <button>

  function cacheDom() {
    flowEl = $('lh-flow');
    if (!flowEl) return false;
    sdkqEl = flowEl.querySelector('[data-fill="sdkq"]');
    lossEl = $('lh-loss');
    for (var i = 0; i < HOPS.length; i++) {
      var lane = flowEl.querySelector('.lh-lane[data-hop="' + HOPS[i].key + '"]');
      var track = flowEl.querySelector('.lh-track[data-track="' + HOPS[i].key + '"]');
      if (!lane || !track) return false;   // HOPS 와 마크업이 어긋나면 아무것도 안 그린다
      laneEl.push(lane);
      trackEl.push(track);
      queueEl.push(lane.querySelector('[data-queue]'));
      // 유실은 첫 층에서만 난다 — spawn() 이 여기서 버린다. 배지도 그 층에 붙는다.
      if (HOPS[i].key === 'sdk') {
        dropLaneEl = lane;
        dropNameEl = lane.querySelector('.lh-lane-name');
      }
      var more = document.createElement('span');
      more.className = 'lh-more';
      more.hidden = true;
      track.appendChild(more);
      moreEl.push(more);
    }
    return true;
  }

  function dotFor(p) {
    var node = dotNodes[p.id];
    if (!node) {
      node = document.createElement('button');
      node.type = 'button';
      node.className = 'lh-dot';
      node.dataset.id = String(p.id);
      dotNodes[p.id] = node;
    }
    return node;
  }

  function drawFlow() {
    var byHop = groupByHop();
    var alive = Object.create(null);

    for (var i = 0; i < HOPS.length; i++) {
      var list = byHop[i];
      var track = trackEl[i];
      var limit = 96;
      var shown = 0;

      laneEl[i].classList.toggle('is-stopped', isStopped(i));

      for (var k = 0; k < list.length; k++) {
        var p = list[k];
        var x = Math.min((p.age / animDwell(i)) * 96, limit);
        if (x < 2) x = 2;
        limit = Math.max(2, x - 6);
        if (shown >= DOT_CAP) continue;                 // 넘친 것은 안 그리고 "+N" 으로 센다
        shown++;
        alive[p.id] = true;

        var node = dotFor(p);
        var cls = 'lh-dot' + (p.kind === 'click' ? ' is-click' : '') +
          (p.kind === 'imp' && p.n >= 12 ? ' is-fat2' : p.kind === 'imp' && p.n >= 5 ? ' is-fat' : '') +
          (state.selected === p ? ' is-selected' : '');
        if (node.className !== cls) node.className = cls;
        var label = (p.kind === 'click' ? '클릭 1건' : '노출 확인 ' + p.n + '건') +
          ' · ' + HOPS[i].label + ' · 눌러서 자세히';
        if (node.getAttribute('aria-label') !== label) node.setAttribute('aria-label', label);
        node.style.left = x.toFixed(2) + '%';
        if (node.parentNode !== track) track.appendChild(node);
      }

      var hidden = list.length - shown;
      moreEl[i].hidden = hidden <= 0;
      if (hidden > 0) moreEl[i].textContent = '+' + hidden;

      drawQueue(i, list.length);
    }

    // 사라진 점의 노드 정리
    for (var id in dotNodes) {
      if (!alive[id]) {
        var n = dotNodes[id];
        if (n.parentNode) n.parentNode.removeChild(n);
        delete dotNodes[id];
      }
    }

    if (sdkqEl) {
      sdkqEl.textContent = state.batch > 1
        ? '지금 모으는 중 ' + state.sdkQueue + '건'
        : '지금은 1건이라 모으지 않는다';
    }

    drawLoss();
  }

  // 유실을 두 자리에 쓴다 — 나는 자리와, 그게 무슨 일인지.
  //
  // (1) 앱 SDK 층 이름 뒤의 "⚠ 버림 N건". 유실은 이 층에서만 난다(spawn 이 버린다).
  //     그런데 이 층엔 쌓임 막대가 없어서 drawQueue 가 안 보고, 다른 층에 붙는 "⚠ 가득" 이
  //     여기엔 안 붙는다. 임베드는 막대와 아래 알림을 둘 다 접으므로, 배지가 없으면
  //     "쌓이는 중" 과 "아예 버려지는 중" 을 가르는 표시가 화면에 하나도 없다.
  //     낱말·색·점선은 CSS 가 준다(다른 층의 "⚠ 가득" 과 같은 자리·같은 모양). 여기서는 수만 넘긴다.
  // (2) #lh-loss — 무슨 일인지 문장으로. 임베드에서는 CSS 가 접는다(떴다 사라지며 높이를 흔든다).
  function drawLoss() {
    var lost = state.dropped;

    if (dropLaneEl && dropNameEl) {
      dropLaneEl.classList.toggle('is-dropping', lost > 0);
      if (lost > 0) {
        var n = lost.toLocaleString();
        if (dropNameEl.getAttribute('data-drop') !== n) dropNameEl.setAttribute('data-drop', n);
      } else if (dropNameEl.hasAttribute('data-drop')) {
        dropNameEl.removeAttribute('data-drop');
      }
    }

    if (!lossEl) return;
    lossEl.hidden = lost === 0;
    if (lost > 0) {
      lossEl.textContent = '⚠ 앞이 다 차서 못 받은 이벤트 ' + lost.toLocaleString() +
        '건. 파일이 가득 차면 쓰기가 실패해 로그가 끊긴다(글 4절).' +
        // 임베드에서는 이 알림 자체를 CSS 가 접는다. 되돌리는 방법은 전체 페이지에만 적는다.
        (IS_EMBED ? '' : ' 멈춤을 풀거나 "처음부터"를 누르면 다시 흐른다.');
    }
  }

  function drawQueue(i, count) {
    var row = queueEl[i];
    if (!row) return;
    var cap = HOPS[i].cap;
    var full = count >= cap;
    row.classList.toggle('is-full', full);
    // 층에도 같이 붙인다. 임베드에서는 아래 막대를 접으므로 이쪽이 유일한 표시가 된다.
    laneEl[i].classList.toggle('is-full', full);
    var bar = row.querySelector('.lh-queue-bar > i');
    if (bar) bar.style.width = Math.min(100, (count / cap) * 100).toFixed(1) + '%';
    var text = row.querySelector('.lh-queue-text');
    if (text) text.textContent = (full ? '⚠ 가득 ' : '') + count + ' / ' + cap;
  }

  // ---- 아래 칸: 골라둔 한 건 ----

  function fmtBytes(v) {
    if (v >= 1000) return Math.round(v).toLocaleString() + ' B';
    return (Math.round(v * 10) / 10).toLocaleString() + ' B';
  }

  function fmtMs(v) { return Math.round(v).toLocaleString() + ' ms'; }

  // 그 층에서 이 건이 실제로 어떤 글자로 있나. 글에서 그대로 가져온 것들이다.
  function shapeAt(hopIdx, kind, n) {
    var key = HOPS[hopIdx].key;
    var topic = kind === 'click' ? 'ad.click' : 'ad.impression.confirm';
    var more = n > 1 ? '\n  … 노출 ' + (n - 1) + '건 더 …' : '';

    if (kind === 'click') {
      switch (key) {
        case 'sdk':
          return 'ClickEvent(t="clk", rid="r-8f21", ad=9931, s="main_top",\n' +
            '           ts=1786002501234, seq=47, tz=540, sdk="3.2.1")';
        case 'collector':
          return CLICK_HEAD + '\n' + CLICK_BODY;
        case 'agent':
          return '{"remote":"10.2.31.7","ts":"2026-08-06T16:48:21+09:00",\n' +
            ' "method":"POST","uri":"/v1/e","status":"204","rt":"0.002",\n' +
            ' "agent":"MyApp/3.2.1 (iPhone; iOS 19.2)",\n' +
            ' "body":"{\\"t\\":\\"clk\\",\\"rid\\":\\"r-8f21\\",\\"ad\\":9931,…}"}';
        // 필드 17개다 — 글 6절 파이썬 출력의 그 17개와 하나씩 같다.
        // 층 설명("8개에서 17개로 늘고")과 이 줄이 안 맞으면 세어 본 독자가 걸린다.
        case 'transform':
          return '{"req_id":"r-8f21","event":"click","ad_id":9931,"slot":"main_top",\n' +
            ' "seq":47,"app_ver":"3.2.1","device":"iPhone","os":"iOS","os_ver":"19.2",\n' +
            ' "region":"KR-11","campaign_id":5502,"advertiser_id":311,"media":"A앱",\n' +
            ' "event_ts":1786002501234,"collect_ts":1786002501402,\n' +
            ' "process_ts":1786002502310,"schema":"click.v3"}';
        case 'kafka':
          return 'topic ' + topic + ' · partition 5 · offset 8412\n' +
            'key   b\'r-8f21\'                                   6 B\n' +
            'value 배치로 묶여 압축된 바이트 — 브로커는 안 열어 본다';
        default:
          return 'ConsumerRecord(\n' +
            '    topic=\'' + topic + '\', partition=5, offset=8412,\n' +
            '    timestamp=1786002502310, timestamp_type=0,\n' +
            '    key=b\'r-8f21\',\n' +
            '    value=b\'{"req_id":"r-8f21","event":"click",…}\',\n' +
            '    serialized_value_size=308,\n)';
      }
    }

    switch (key) {
      case 'sdk':
        return 'ImpEvent(t="imp", rid="r-8f21", ad=9931, s="main_top",\n' +
          '         ts=1786000101118, seq=11, tz=540, sdk="3.2.1")' +
          (n > 1 ? '\n… 큐에 같은 모양으로 ' + (n - 1) + '건 더 …' : '');
      case 'collector':
        return IMP_HEAD + '\n{"t":"imp","e":[\n  ' + IMP_ELS[0] + (n > 1 ? ',' : '') + more + ']}';
      case 'agent':
        return (n > 1 ? n + '건으로 갈린 뒤 첫 건 —\n' : '쪼갤 것이 없어 한 건 그대로 —\n') +
          '{"remote":"10.2.31.7","ts":"2026-08-06T16:08:26+09:00",\n' +
          ' "method":"POST","uri":"/v1/e","status":"204","rt":"0.004",\n' +
          ' "agent":"MyApp/3.2.1 (iPhone; iOS 19.2)",\n' +
          ' "body":"{\\"t\\":\\"imp\\",\\"rid\\":\\"r-8f21\\",\\"ad\\":9931,…}"}';
      // 클릭 줄과 같은 17개를 같은 순서로 채운다. 값만 노출 것이다.
      case 'transform':
        return '{"req_id":"r-8f21","event":"impression_confirm","ad_id":9931,\n' +
          ' "slot":"main_top","seq":11,"app_ver":"3.2.1","device":"iPhone",\n' +
          ' "os":"iOS","os_ver":"19.2","region":"KR-11","campaign_id":5502,\n' +
          ' "advertiser_id":311,"media":"A앱","event_ts":1786000101118,\n' +
          ' "collect_ts":1786000106402,"process_ts":1786000107310,"schema":"impression.confirm.v1"}' +
          (n > 1 ? '\n… 같은 모양으로 ' + n + '건 …' : '');
      case 'kafka':
        return 'topic ' + topic + ' · partition 5 · offset 8412\n' +
          'key   b\'r-8f21\'                                   6 B\n' +
          'value 배치로 묶여 압축된 바이트 — 브로커는 안 열어 본다' +
          (n > 1 ? '\n' + n + '건이 각자 한 레코드로 들어가 있다' : '');
      default:
        return 'ConsumerRecord(\n' +
          '    topic=\'' + topic + '\', partition=5, offset=8412,\n' +
          '    key=b\'r-8f21\',\n' +
          '    value=b\'{"req_id":"r-8f21","event":"impression_confirm",…}\',\n' +
          '    serialized_value_size=308,\n)' +
          (n > 1 ? '\npoll() 한 번에 ' + n + '건이 같이 온다' : '');
    }
  }

  var lastLive = '';
  function announce(msg) {
    var box = $('lh-status');
    if (!box || msg === lastLive) return;
    lastLive = msg;
    box.textContent = msg;
  }

  // 무거운 부분(모양·크기·지나온 층 목록)은 "어느 건이 어느 층에 있나" 가 바뀔 때만 다시 만든다.
  // 매 프레임 바뀌는 것은 지금 층의 체류 시간과 누적 두 개뿐이다.
  var detailKey = '';
  var trailNowEl = null;
  var overState = '';

  function drawDetail() {
    var p = state.selected;
    if (!p) return;
    var i = p.hop;
    var key = p.id + ':' + i + ':' + (p.retired ? 'r' : '');

    if (key !== detailKey) {
      detailKey = key;
      rebuildDetail(p, i);
    }

    // 매 프레임 갱신 — 지금 층의 체류 시간과 누적.
    // 떠난 층은 spent[] 에 확정돼 있고, 지금 층만 age 에서 계산한다.
    var here = p.retired ? p.spent[i] : liveSpent(p);
    var acc = here;
    for (var j = 0; j < i; j++) if (HOPS[j].key !== 'kafka') acc += p.spent[j];
    if (trailNowEl && HOPS[i].key !== 'kafka') trailNowEl.textContent = HOPS[i].label + ' ' + fmtMs(here);
    $('lh-time-v').textContent = fmtMs(acc);

    // 이 건이 왜 여기 있나는 같은 층에 있는 동안에도 바뀐다 — 바뀔 때만 문장을 갈아 준다
    var why = isStopped(i) ? 'stopped'
      : (HOPS[i].ms !== null && here > HOPS[i].ms + 40) ? 'over'
        : p.retired ? 'gone' : 'ok';
    if (why !== overState) {
      overState = why;
      $('lh-time-hint').textContent =
        why === 'stopped' ? '이 층을 멈춰 세워 뒀다. 이 건은 여기서 한 발도 안 움직인다.'
          : why === 'over' ? '이 층의 정상값은 ' + fmtMs(HOPS[i].ms) + '인데 그보다 오래 붙잡혀 있다. 앞이 막혀서다.'
            : why === 'gone' ? '이 건은 consumer 를 지나 화면에서 나갔다. 다른 점을 클릭하면 그 건으로 바뀐다.'
              : '';
    }
  }

  function rebuildDetail(p, i) {
    $('lh-where').textContent = (i + 1) + '. ' + HOPS[i].label + (p.retired ? ' (지나갔다)' : '');
    $('lh-id').textContent = '#' + p.id + ' · ' + (p.kind === 'click' ? '클릭 1건' : '노출 확인 ' + p.n + '건');
    $('lh-shape').textContent = shapeAt(i, p.kind, p.n);

    // 크기 — 요청 전체와 건당을 같이 적는다. 클릭(1건)이면 둘이 같다
    var total = reqBytes(p.kind, i, p.n);
    $('lh-size').innerHTML = '요청 전체 <b>' + fmtBytes(total) + '</b>' +
      (p.n > 1 ? ' · 건당 <b>' + fmtBytes(total / p.n) + '</b>' : ' (1건짜리라 건당도 같다)');

    var hint = '';
    if (p.kind === 'imp' && HOPS[i].key === 'collector' && p.n > 1) {
      hint = '앞부분 90 B 를 ' + p.n + '번이 아니라 한 번만 적어서 건당이 줄었다. 클릭 한 건짜리 줄은 169 B 다.';
    } else if (p.kind === 'imp' && HOPS[i].key === 'agent' && p.n > 1) {
      hint = '쪼개면서 그 90 B 가 건마다 다시 붙어 건당이 늘었다. 아끼는 구간은 파일 한 층뿐이다.';
    } else if (p.kind === 'imp' && (HOPS[i].key === 'transform' || HOPS[i].key === 'consumer')) {
      hint = '글은 클릭 줄만 끝까지 따라간다. 노출 줄의 필드 이름은 클릭 줄 구성을 그대로 옮긴 것이다.';
    } else if (HOPS[i].key === 'kafka') {
      hint = '가장 작아지는 자리다. 308 B 가 배치로 묶여 압축돼 건당 36.6 B 가 된다. Avro 면 30.0 B 다.';
    }
    $('lh-size-hint').textContent = hint;

    // 지나온 층 — Kafka 칸은 7일이라 누적에 안 더하고 그렇게 적는다
    var trail = $('lh-trail');
    trail.textContent = '';
    trailNowEl = null;
    for (var j = 0; j <= i; j++) {
      if (j) {
        var sep = document.createElement('span');
        sep.className = 'lh-trail-sep';
        sep.textContent = '→';
        trail.appendChild(sep);
      }
      var cell = document.createElement('span');
      cell.className = 'lh-trail-step' + (j === i ? ' is-now' : '');
      cell.textContent = HOPS[j].key === 'kafka' ? 'Kafka 7일' : HOPS[j].label + ' ' + fmtMs(p.spent[j]);
      trail.appendChild(cell);
      if (j === i) trailNowEl = cell;
    }

    $('lh-time-extra').textContent = i >= 4 ? ' + Kafka 7일(따로 센다)' : '';

    overState = '';   // 아래 drawDetail 이 이 층 기준으로 다시 판정한다
  }

  function drawScale() {
    var perSec = 1000 / EVENT_INTERVAL;                       // 화면이 초당 그리는 이벤트
    var dots = perSec * (1 / CLICK_EVERY + (CLICK_EVERY - 1) / CLICK_EVERY / state.batch);
    var ratio = REAL_EVENTS_PER_SEC / perSec;
    var rate = $('lh-rate'), rt = $('lh-ratio');
    if (rate) rate.textContent = (Math.round(dots * 10) / 10).toLocaleString();
    if (rt) rt.textContent = Math.round(ratio).toLocaleString();
    Array.prototype.forEach.call(document.querySelectorAll('[data-fill="batch"]'), function (n) {
      n.textContent = String(state.batch);
    });
    var bv = $('lh-batch-v');
    if (bv) bv.textContent = state.batch + '건';
  }

  function drawControls() {
    var play = $('lh-play');
    if (play) {
      play.textContent = state.playing ? '⏸ 정지' : '▶ 재생';
      play.setAttribute('aria-pressed', state.playing ? 'true' : 'false');
    }
    var a = $('lh-stop-agent-label'), k = $('lh-stop-kafka-label');
    if (a) a.classList.toggle('is-on', state.stopped.agent);
    if (k) k.classList.toggle('is-on', state.stopped.kafka);
  }

  // ==========================================
  // 3) 바인딩 — 이벤트를 받아 state 를 바꾸고 draw* 를 부른다
  // ==========================================

  // 멈춰 세운 동안에는 프레임 루프가 안 돈다. 그래서 컨트롤을 만졌으면
  // 여기서 한 번 다시 그려야 한다 — 안 그러면 멈춤 표시나 고른 점의 테두리가
  // 재생을 누를 때까지 안 나타난다.
  function redraw() {
    drawControls();
    drawScale();
    drawFlow();
    drawDetail();
  }

  function bindControls() {
    $('lh-play').addEventListener('click', function () {
      state.playing = !state.playing;
      redraw();
      announce(state.playing ? '흐름을 다시 시작했습니다.' : '흐름을 멈췄습니다. 점을 클릭해 자세히 볼 수 있습니다.');
    });

    $('lh-speed').addEventListener('change', function () {
      state.speed = +this.value || 1;
      announce('속도를 ' + state.speed + '배로 바꿨습니다.');
    });

    $('lh-stop-agent').addEventListener('change', function () {
      state.stopped.agent = this.checked;
      redraw();
      announce(this.checked
        ? '수집 에이전트를 멈췄습니다. 앞의 두 층은 계속 받고, 로컬 파일에 쌓이기 시작합니다.'
        : '수집 에이전트를 다시 켰습니다. 쌓인 것이 빠져나갑니다.');
    });

    $('lh-stop-kafka').addEventListener('change', function () {
      state.stopped.kafka = this.checked;
      redraw();
      announce(this.checked
        ? 'Kafka 를 멈췄습니다. 변환기와 수집 에이전트가 먼저 찹니다 — 둘 다 메모리라서입니다.'
        : 'Kafka 를 다시 켰습니다. 밀린 것이 빠져나갑니다.');
    });

    $('lh-batch').addEventListener('input', function () {
      state.batch = Math.max(1, Math.min(20, +this.value || 1));
      redraw();
    });
    $('lh-batch').addEventListener('change', function () {
      announce('노출 한 요청에 ' + state.batch + '건을 묶습니다.');
    });

    $('lh-reset').addEventListener('click', function () {
      resetSim();
      seed();
      redraw();
      announce('처음부터 다시 흘립니다.');
    });

    // 점 클릭 — 위임. 점 노드는 매 프레임 다시 만들어지지 않지만 층을 옮겨 다닌다
    flowEl.addEventListener('click', function (e) {
      var dot = e.target.closest ? e.target.closest('.lh-dot') : null;
      if (!dot) return;
      var id = +dot.dataset.id;
      var p = null;
      for (var i = 0; i < state.packets.length; i++) if (state.packets[i].id === id) p = state.packets[i];
      if (!p) return;
      state.selected = p;
      state.userPicked = true;
      redraw();
      announce((p.kind === 'click' ? '클릭 1건' : '노출 확인 ' + p.n + '건') + '을 골랐습니다. ' +
        '지금 ' + HOPS[p.hop].label + ' 에 있습니다.');
    });
  }

  // ---- 루프 ----

  var lastT = 0;
  var inView = true;

  function frame(t) {
    requestAnimationFrame(frame);
    var raw = lastT ? Math.min(t - lastT, 100) : 16;
    lastT = t;
    if (!state.playing || document.hidden || !inView) return;
    step(raw * state.speed);
    drawFlow();
    drawDetail();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!cacheDom()) return;

    bindControls();

    // 움직임을 줄여 달라고 한 사람에게는 멈춘 상태로 준다
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) state.playing = false;

    // 층이 비어 보이지 않게 미리 흘려 둔다
    seed();
    redraw();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { inView = en.isIntersecting; });
      }, { rootMargin: '120px' }).observe(flowEl);
    }

    requestAnimationFrame(frame);
  });
})();
