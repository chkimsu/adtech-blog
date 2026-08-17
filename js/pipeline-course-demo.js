// ===================================================================
// 파이프라인 코스 2페이지 — 화면
//   js/pipeline-course-demo.js
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

  // ==========================================
  // 0) 참조
  // ==========================================

  const M = window.PipelineCourseModel;
  const HOPS = M.HOPS;

  // ==========================================
  // 1) 상태
  // ==========================================

  let stopIndex = 0;     // 0..HOPS.length-1 — 지금 rail 이 가리키는 자리
  let playTimer = null;  // 재생 중일 때만 setInterval id, 아니면 null

  const $ = (id) => document.getElementById(id);

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  // 바이트가 늘었는지 줄었는지를 색이 아니라 부호 있는 숫자와 글리프로 말한다.
  function deltaInfo(hop) {
    const d = hop.outBytes - hop.inBytes;
    if (d === 0) return { text: '그대로 (0 B)', sign: 'same' };
    if (d > 0) return { text: '▲ +' + d + ' B', sign: 'grow' };
    return { text: '▾ ' + d + ' B', sign: 'shrink' };
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

  function draw() {
    drawRail();
    drawDetail();
    syncRailHeight();
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

  buildRail();
  buildDetail();
  bindRail();
  draw();
})();
