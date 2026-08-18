// ===================================================================
// 파이프라인 코스 2페이지 — 화면
//   js/pipeline-course-demo.js
//
// 이 파일은 rail·detail·1~2절만 갖고 있다. 3절부터(3~7절)는
// js/pipeline-course-sections.js 에 있다.
//
// 구성은 넷이다 (js/api-course-demo.js 와 같은 얼개).
//   0) 참조   — PipelineCourseModel 을 집어 온다
//   1) 상태   — 지금 보고 있는 자리 번호(stopIndex)와 재생 타이머 하나
//   2) 그리기 — state 를 읽어 DOM 에 반영한다. state 를 바꾸지 않는다
//   3) 바인딩 — 이벤트를 받아 state 를 바꾸고 draw() 를 부른다
//
// .plc-rail 과 .plc-detail 은 절 <section> 안이 아니라 페이지 위에 한 번만
// 짓는다 — 절을 읽는 내내 지금 어느 자리인지가 보여야 하기 때문이다(CSS
// position: sticky). rail 은 top:0 에 붙고, detail 은 rail 의 실제 렌더
// 높이만큼 내려서 붙는다. 그 높이는 폭에 따라(두 줄이 되는지 한 줄인지)
// 달라지므로 고정 숫자를 쓰지 않고 이 파일이 매번 재서 CSS 변수에 넣는다.
// ===================================================================
(function () {
  'use strict';

  // 공용 DOM 조각 — js/course-dom.js. 넷이 같은 것을 각자 들고 있던 것을 모았다.
  const el = window.CourseDom.el;
  const theadRow = window.CourseDom.theadRow;
  const buildSimpleTable = window.CourseDom.buildSimpleTable;

  // ==========================================
  // 0) 참조
  // ==========================================

  const M = window.PipelineCourseModel;
  const HOPS = M.HOPS;
  // 1~2절은 CONSUMERS(읽는 쪽 이름)만 CourseData 에서 직접 가져온다. 나머지
  // 숫자는 전부 M(HOPS·holdTime·textAt)을 거친 것을 그대로 쓴다.
  const CD = window.CourseData;

  // ==========================================
  // 1) 상태
  // ==========================================

  let stopIndex = 0;     // 0..HOPS.length-1 — 지금 rail 이 가리키는 자리
  let playTimer = null;  // 재생 중일 때만 setInterval id, 아니면 null
  let stopKafkaOn = false;  // 1절 — [Kafka 멈추기] 스위치
  let logstashOff = false;  // 2절 — [Logstash 끄기] 스위치

  const $ = (id) => document.getElementById(id);


  // 바이트가 늘었는지 줄었는지를 색이 아니라 부호 있는 숫자와 글리프로 말한다.
  function deltaInfo(hop) {
    const d = hop.outBytes - hop.inBytes;
    if (d === 0) return { text: '그대로 (0 B)', sign: 'same' };
    if (d > 0) return { text: '▲ +' + d + ' B', sign: 'grow' };
    return { text: '▾ ' + d + ' B', sign: 'shrink' };
  }

  // ---- 2절 — Filebeat 대 Logstash 다섯 줄 비교. 스펙 5.2 2절을 그대로 옮긴
  // 것이라 숫자가 없다. 유일한 숫자(파싱 후 필드 수)는 여기 적지 않고
  // M.textAt('logstash') 를 실제로 파싱해서 얻는다 — 아래 fieldCount() 참고.
  const TOOL_ROWS = [
    { axis: '하는 일', beat: '파일을 읽어 그대로 보냅니다', logstash: '한 줄을 필드로 쪼개고 붙입니다' },
    { axis: '원문', beat: null, logstash: null }, // draw 시점에 채운다 — logstash 칸에 필드 수가 들어간다
    { axis: '무겁나', beat: '가볍습니다 (Go, 메모리 수십 MB)', logstash: '무겁습니다 (JVM, 수백 MB~GB)' },
    { axis: '어디에 두나', beat: '로그가 있는 서버마다', logstash: '따로 몇 대' },
    { axis: '없으면', beat: '아무도 파일을 안 줍니다', logstash: 'Kafka 에 원문 문자열만 쌓입니다' },
  ];

  // Kafka 실제 payload(M.textAt('logstash'))를 그대로 파싱해서 필드 수를 센다.
  // "15" 를 여기 손으로 적지 않는다 — 글이 바뀌면 이 값도 같이 바뀐다.
  function finalFieldCount() {
    return Object.keys(JSON.parse(M.textAt('logstash'))).length;
  }

  // ---- 2절 — [Logstash 끄기] 를 누르면 읽는 쪽 넷 중 누가 곤란해지는지.
  // 이름은 CD.CONSUMERS 에서 그대로 가져오고(중복 등록 안 함), 곤란한 이유만
  // 여기서 새로 적는다 — 브리프가 준 문장 그대로다.
  const NOLOGSTASH_ORDER = ['budget', 'dash', 'report', 'train'];
  const NOLOGSTASH_EFFECT = {
    dash:   { breaks: true,  reason: '못 그립니다. 필드가 없어 집계할 것이 없습니다' },
    budget: { breaks: true,  reason: null }, // draw 시점에 cost 를 code 로 감싼다
    report: { breaks: true,  reason: '못 만듭니다' },
    train:  { breaks: false, reason: '덜 곤란합니다. 어차피 자기가 파싱합니다' },
  };
  function consumerName(key) {
    return CD.CONSUMERS.find(function (c) { return c.key === key; }).name;
  }

  // ==========================================
  // 2) 그리기
  // ==========================================

  // rail 의 실제 렌더 높이를 재서 --plc-rail-h 에 넣는다. detail 의 sticky
  // top 이 이 값을 쓰므로, rail 이 좁은 화면에서 두 줄이 되어도 detail 이
  // rail 을 가리지 않는다.
  function syncRailHeight() {
    const h = $('plc-rail').getBoundingClientRect().height;
    if (h > 0) document.documentElement.style.setProperty('--plc-rail-h', h + 'px');
  }

  function drawRail() {
    const stops = $('plc-rail-stops').querySelectorAll('.plc-stop');
    Array.prototype.forEach.call(stops, function (b) {
      b.setAttribute('aria-current', String(Number(b.dataset.index) === stopIndex));
    });
    $('plc-rail-now-pos').textContent =
      HOPS[stopIndex].name + ' (' + (stopIndex + 1) + ' / ' + HOPS.length + ')';
    $('plc-play').textContent = playTimer ? '정지' : '재생';
    $('plc-play').setAttribute('aria-pressed', String(!!playTimer));
  }

  function drawDetail() {
    const hop = HOPS[stopIndex];
    $('plc-detail-name').textContent = hop.name;
    $('plc-detail-pos').textContent = (stopIndex + 1) + ' / ' + HOPS.length;
    $('plc-in-bytes').textContent = hop.inBytes + ' B';
    $('plc-does').textContent = hop.does;
    $('plc-out-bytes').textContent = hop.outBytes + ' B';
    const delta = deltaInfo(hop);
    $('plc-delta').textContent = delta.text;
    $('plc-delta').dataset.sign = delta.sign;
    $('plc-data-body').textContent = M.textAt(hop.key);
    $('plc-who').textContent = hop.who;
    $('plc-products').textContent = hop.products;
  }

  // 1절 — [Kafka 멈추기]. 카드 둘의 수치·문구·색조를 전부 여기서 다시 그린다.
  // 꺼져 있을 때는 두 카드 다 'idle' 이고, 켜지면 direct 는 'bad'(위험해짐),
  // file 은 'good'(버팀)이 된다 — 색만이 아니라 칸의 글자 자체도 같이 갈린다.
  function drawHold() {
    const direct = M.holdTime('direct');
    const file = M.holdTime('file');
    const costMs = HOPS[2].dwellMs; // 파일 자리(HOPS[2]='file')가 640 을 들고 있다

    $('plc-route-direct').dataset.tone = stopKafkaOn ? 'bad' : 'idle';
    $('plc-route-file').dataset.tone = stopKafkaOn ? 'good' : 'idle';
    // 시간만 보이면 그 시간이 어디서 나왔는지 안 보이므로 용량(capacity)을 앞에 같이 둔다.
    // 이 절의 논점이 「512MB 로 10.9분」 대 「100GB 로 237시간」의 대비다.
    // 버튼 뒤에 숨기면 안 눌러 본 독자는 논점을 못 본다. 값은 늘 보이고,
    // 버튼은 「그래서 그 다음 어떻게 되나」를 연다.
    $('plc-route-direct-stat').textContent = direct.capacity + ' → ' + direct.mins + '분';
    $('plc-route-file-stat').textContent = file.capacity + ' → ' + file.hours + '시간';
    $('plc-route-direct-note').textContent = stopKafkaOn ? direct.note : 'Kafka 를 멈춰 보면 나옵니다';
    $('plc-route-file-note').textContent = stopKafkaOn ? file.note : 'Kafka 를 멈춰 보면 나옵니다';
    // 대가(640 ms)는 Kafka 상태와 무관하게 항상 참인 사실이라 스위치와 상관없이 보인다.
    $('plc-route-direct-cost').textContent = '없음';
    $('plc-route-file-cost').textContent = costMs + ' ms 를 더 기다립니다';

    $('plc-stopkafka').setAttribute('aria-pressed', String(stopKafkaOn));
  }

  // 2절 — Kafka 가 실제로 받는 값. Logstash 가 켜져 있으면 파싱된 finalLine(15
  // 필드), 꺼지면 message 한 칸짜리 원문이다. 원문은 손으로 짜맞추지 않고
  // JSON.stringify 로 만든다 — 안에 든 따옴표를 직접 이스케이프하지 않기 위해서다.
  function drawKafkaValue() {
    if (logstashOff) {
      $('plc-kafka-value').textContent = JSON.stringify({ message: M.textAt('file') });
      $('plc-kafka-value-bytes').textContent = 'message 한 칸';
    } else {
      $('plc-kafka-value').textContent = M.textAt('logstash');
      $('plc-kafka-value-bytes').textContent = HOPS[4].outBytes + ' B, 필드 ' + finalFieldCount() + '개';
    }
    $('plc-nologstash').setAttribute('aria-pressed', String(logstashOff));
  }

  // 2절 — [Logstash 끄기]. 꺼졌을 때만 표와 요약 문장을 보인다. 요약은 곤란해지는
  // 이름을 CONSUMERS 에서 그때그때 모아 만든다 — 순서를 바꾸거나 이름이 바뀌어도
  // 손으로 다시 안 맞춘다.
  function drawEffect() {
    const table = $('plc-nologstash-effect');
    table.hidden = !logstashOff;
    const note = $('plc-effect-note');
    if (!logstashOff) { note.textContent = ''; return; }

    const broken = NOLOGSTASH_ORDER
      .filter(function (k) { return NOLOGSTASH_EFFECT[k].breaks; })
      .map(consumerName)
      .join(', ');
    const fine = consumerName('train');
    note.textContent = broken + '는 못 씁니다. ' + fine + '만 어차피 자기가 파싱하니 덜 곤란합니다.';
  }

  function draw() {
    drawRail();
    drawDetail();
    syncRailHeight();
    drawHold();
    drawKafkaValue();
    drawEffect();
  }

  // ==========================================
  // 짓기 — 한 번만 만든다. 내용은 draw() 가 채운다
  // ==========================================

  function buildRail() {
    const host = $('plc-rail');

    const controls = el('div', 'plc-rail-controls');
    const btns = el('div', 'plc-rail-btns');
    const playBtn = el('button', 'btn-try', '재생');
    playBtn.type = 'button'; playBtn.id = 'plc-play'; playBtn.setAttribute('aria-pressed', 'false');
    const stepBtn = el('button', 'btn-try', '한 칸씩');
    stepBtn.type = 'button'; stepBtn.id = 'plc-step';
    const resetBtn = el('button', 'btn-try', '처음으로');
    resetBtn.type = 'button'; resetBtn.id = 'plc-reset';
    btns.appendChild(playBtn);
    btns.appendChild(stepBtn);
    btns.appendChild(resetBtn);
    controls.appendChild(btns);

    const now = el('div', 'plc-rail-now');
    now.appendChild(document.createTextNode('지금 자리 '));
    const nowPos = el('strong');
    nowPos.id = 'plc-rail-now-pos';
    now.appendChild(nowPos);
    controls.appendChild(now);
    host.appendChild(controls);

    const stops = el('div', 'plc-rail-stops');
    stops.id = 'plc-rail-stops';
    HOPS.forEach(function (hop, i) {
      if (i > 0) stops.appendChild(el('span', 'plc-rail-arrow', '→'));
      const b = el('button', 'plc-stop', hop.name);
      b.type = 'button';
      b.dataset.index = String(i);
      b.setAttribute('aria-current', 'false');
      stops.appendChild(b);
    });
    host.appendChild(stops);
  }

  function buildDetail() {
    const host = $('plc-detail');
    const inner = el('div', 'plc-detail-inner');

    const head = el('div', 'plc-detail-head');
    const name = el('span', 'plc-detail-name'); name.id = 'plc-detail-name';
    const pos = el('span', 'plc-detail-pos'); pos.id = 'plc-detail-pos';
    head.appendChild(name);
    head.appendChild(pos);
    inner.appendChild(head);

    const grid = el('div', 'plc-detail-grid');

    const cellIn = el('div', 'plc-detail-cell');
    cellIn.appendChild(el('div', 'plc-detail-label', '들어온 것'));
    const inBytes = el('div', 'plc-detail-bytes'); inBytes.id = 'plc-in-bytes';
    cellIn.appendChild(inBytes);

    const cellDoes = el('div', 'plc-detail-cell');
    cellDoes.appendChild(el('div', 'plc-detail-label', '이 자리가 한 일'));
    const does = el('div', 'plc-detail-text'); does.id = 'plc-does';
    cellDoes.appendChild(does);

    const cellOut = el('div', 'plc-detail-cell');
    cellOut.appendChild(el('div', 'plc-detail-label', '나간 것'));
    const outBytes = el('div', 'plc-detail-bytes'); outBytes.id = 'plc-out-bytes';
    cellOut.appendChild(outBytes);
    const delta = el('div', 'plc-detail-delta'); delta.id = 'plc-delta';
    cellOut.appendChild(delta);

    grid.appendChild(cellIn);
    grid.appendChild(cellDoes);
    grid.appendChild(cellOut);
    inner.appendChild(grid);

    const data = el('div', 'plc-detail-data');
    data.appendChild(el('div', 'plc-detail-data-head', '이 자리의 데이터 모양'));
    const dataBody = el('pre', 'plc-detail-data-body'); dataBody.id = 'plc-data-body';
    data.appendChild(dataBody);
    inner.appendChild(data);

    // .plc-detail-meta 가 이미 flex + gap 이라 이 둘은 별도 규칙이 없어도
    // 나란히 놓인다 — 그래서 클래스 없는 평범한 span 으로 감싼다.
    const meta = el('div', 'plc-detail-meta');
    const whoItem = el('span');
    whoItem.appendChild(el('span', 'plc-detail-meta-label', '누가 쓰나'));
    const who = el('span'); who.id = 'plc-who';
    whoItem.appendChild(who);
    const productsItem = el('span');
    productsItem.appendChild(el('span', 'plc-detail-meta-label', '흔히 쓰는 제품'));
    const products = el('span'); products.id = 'plc-products';
    productsItem.appendChild(products);
    meta.appendChild(whoItem);
    meta.appendChild(productsItem);
    inner.appendChild(meta);

    host.appendChild(inner);
  }

  // 표 하나를 헤더 배열과 행 배열로 짓는다(js/api-course-demo.js 의 buildSimpleTable
  // 과 같은 모양). 셀 값은 문자열이거나 DOM 노드다.

  // 글자 사이에 code 조각 하나를 끼운 span 을 만든다 — 필드 이름(cost, message)을
  // 표시할 때 쓴다.
  function withCode(before, code, after) {
    const span = el('span');
    if (before) span.appendChild(document.createTextNode(before));
    span.appendChild(el('code', null, code));
    if (after) span.appendChild(document.createTextNode(after));
    return span;
  }

  // 1절 — 파일을 거치는 이유 셋. 640·237 은 손으로 적지 않고 HOPS·holdTime 에서 가져온다.
  function buildReasons() {
    const host = $('plc-reasons');
    const reason1 = HOPS[2].dwellMs + ' ms 를 주고 ' + M.holdTime('file').hours + '시간을 삽니다';
    [
      reason1,
      '광고 서버가 Kafka 클라이언트를 안 들고 있어도 됩니다. Kafka 주소가 바뀌어도 서버 배포가 필요 없습니다',
      'nginx 가 이미 파일에 쓰고 있습니다. 새로 만드는 것이 아니라 있는 것을 줍는 것입니다',
    ].forEach(function (text) { host.appendChild(el('li', null, text)); });
  }

  // 2절 — Filebeat 대 Logstash 다섯 줄. TOOL_ROWS 의 null 칸(원문 행의 logstash
  // 칸)만 여기서 실측 필드 수로 채운다.
  function buildTools() {
    const rows = TOOL_ROWS.map(function (r) {
      if (r.axis === '원문') {
        return [r.axis, withCode('안 건드립니다 — ', 'message', ' 칸에 통째로'),
          '파싱해서 ' + finalFieldCount() + '개 필드로'];
      }
      return [r.axis, r.beat, r.logstash];
    });
    buildSimpleTable('plc-tools', ['', 'Filebeat', 'Logstash'], rows);
  }

  // 2절 — Filebeat 봉투 실물. Logstash 상태와 무관하게 항상 같은 값이라 한 번만 짓는다.
  function buildBeatBody() {
    $('plc-beat-body').textContent = M.textAt('beat');
    $('plc-beat-bytes').textContent = HOPS[3].outBytes + ' B';
  }

  // 2절 — [Logstash 끄기] 효과표. 행은 고정이고 draw()(drawEffect)가 hidden 만 바꾼다.
  function buildEffect() {
    const rows = NOLOGSTASH_ORDER.map(function (key) {
      const info = NOLOGSTASH_EFFECT[key];
      const status = el('span', 'plc-status', info.breaks ? '× 못 씀' : '▾ 영향 적음');
      status.dataset.tone = info.breaks ? 'break' : 'mild';
      const reason = key === 'budget' ? withCode('못 셉니다. ', 'cost', ' 가 필드로 안 나와 있습니다') : info.reason;
      return [consumerName(key), status, reason];
    });
    buildSimpleTable('plc-nologstash-effect', ['읽는 쪽', '상태', 'Logstash 를 끄면'], rows);
  }

  // ==========================================
  // 3) 바인딩 — state(stopIndex, playTimer) 를 바꾸고 draw() 를 부른다
  // ==========================================

  function stopPlaying() {
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
  }

  function startPlaying() {
    if (playTimer) return;
    playTimer = setInterval(function () {
      if (stopIndex >= HOPS.length - 1) { stopPlaying(); draw(); return; }
      stopIndex++;
      draw();
    }, 900);
    draw();
  }

  function bindRail() {
    $('plc-rail-stops').addEventListener('click', function (e) {
      const btn = e.target.closest('.plc-stop');
      if (!btn) return;
      stopPlaying();
      stopIndex = Number(btn.dataset.index);
      draw();
    });

    $('plc-play').addEventListener('click', function () {
      if (playTimer) stopPlaying(); else startPlaying();
      draw();
    });

    $('plc-step').addEventListener('click', function () {
      stopPlaying();
      if (stopIndex < HOPS.length - 1) stopIndex++;
      draw();
    });

    $('plc-reset').addEventListener('click', function () {
      stopPlaying();
      stopIndex = 0;
      draw();
    });

    window.addEventListener('resize', syncRailHeight);
  }

  // 1절 — Kafka 멈추기. rail 이 보는 stopIndex 와는 무관한 절 전용 스위치다.
  function bindStopKafka() {
    $('plc-stopkafka').addEventListener('click', function () {
      stopKafkaOn = !stopKafkaOn;
      draw();
    });
  }

  // 2절 — Logstash 끄기.
  function bindNoLogstash() {
    $('plc-nologstash').addEventListener('click', function () {
      logstashOff = !logstashOff;
      draw();
    });
  }

  buildRail();
  buildDetail();
  buildReasons();
  buildTools();
  buildBeatBody();
  buildEffect();
  bindRail();
  bindStopKafka();
  bindNoLogstash();
  draw();
})();
