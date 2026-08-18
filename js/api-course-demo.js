// ===================================================================
// API 코스 1페이지 — 화면
//   js/api-course-demo.js
//
// 구성은 넷이다.
//   0) 참조   — CourseData 와 ApiCourseServer 를 집어 온다
//   1) 상태   — ApiCourseServer.defaultState() 하나만 들고 있다
//   2) 그리기 — state 를 읽어 DOM 에 반영한다. state 를 바꾸지 않는다
//   3) 바인딩 — 이벤트를 받아 state 를 바꾸고 draw() 를 부른다
//
// 절 1~6 이 상태 하나를 같이 본다. 4절 스위치가 caller 를 바꾸면 1~3절이
// 통째로 따라 바뀐다.
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

  const S = window.ApiCourseServer;
  const CD = window.CourseData;

  // ==========================================
  // 1) 상태
  // ==========================================

  const state = S.defaultState();
  // 본문 체크박스를 다시 켤 때 되돌릴 값 — 처음 한 번만 떠 둔다
  const FULL_BODY = Object.assign({}, state.body);
  // 2절 전용 스위치 둘. state(=ApiCourseServer 의 상태)와는 성격이 달라 따로 둔다.
  //   sent      — 보내기를 한 번이라도 눌렀나. 누르기 전에는 응답 칸이 비지 않고
  //               "아직 안 보냈다"는 말이 뜬다.
  //   fake200On — 200 안에 에러를 담는 함정 스위치. 켜면 진짜 판정과 무관하게
  //               고정된 예시 응답을 보여 준다.
  let sent = false;
  let fake200On = false;
  // 3절 전용 상태 하나 — 어느 방식(A/B/C)을 보고 있는지. 위 둘과 마찬가지로
  // ApiCourseServer 의 state 모양이 아니라 이 화면만의 것이라 따로 둔다.
  let logMode = 'A';
  // 4절 전용 스위치 — 재시도에 요청 번호를 붙였는지. S.retryInflation(useKey) 의 인자로만 쓴다.
  let useKey = false;
  // 5-1 전용 스위치 — /v1/bid 와 /v1/track 을 한 주소로 합치면 무엇이 깨지는지 보여 준다.
  let mergeOn = false;

  const $ = (id) => document.getElementById(id);

  // ---- 컨트롤이 그릴 목록 (값은 전부 api-course-server.js 의 상태 모양을 그대로 씀) ----
  const METHOD_OPTS = [
    { v: 'POST', t: 'POST' },
    { v: 'GET', t: 'GET' },
  ];
  const AUTH_OPTS = [
    { v: 'none', t: '없음' },
    { v: 'token', t: '사용자 토큰' },
    { v: 'apikey', t: 'API 키' },
  ];
  const SERVER_OPTS = [
    { v: 'ok', t: '정상' },
    { v: 'appdown', t: '앱이 죽음' },
    { v: 'hostdown', t: '장비가 안 뜸' },
    { v: 'slow', t: '느림' },
  ];
  const BODY_FIELDS = [
    { k: 'event', t: 'event' },
    { k: 'ad_id', t: 'ad_id' },
    { k: 'slot', t: 'slot' },
    { k: 'req_id', t: 'req_id' },
    { k: 'ts', t: 'ts' },
  ];
  // 코드마다 누가 고치는지, 다시 보내면 뜻이 있는지 — posts/api-kinds-and-contracts.md
  // 2절의 표가 정본이다. 그 표는 "500 계열" 한 행이지만, evaluate() 는 그 안에서도
  // 응답 없음(0)과 502 를 갈라서 내놓으므로 일곱 행으로 나눴다(행을 쪼갠 것뿐, 판단은
  // 그대로 옮겼다). 401 은 "부르는 쪽" 이 고치는 것은 맞지만 다시 보내도 되는 쪽이다 —
  // 자격증명을 갱신한 뒤 한 번 더 보내면 되기 때문이다. 400/405/415 처럼 값 자체를
  // 다시 지어야 하는 경우와는 다르다.
  const CODE_ROWS = [
    { code: '0', status: 0, who: '받는 쪽', retry: '됩니다, 간격을 늘려 가며. 대신 중복이 생길 수 있습니다' },
    { code: '502', status: 502, who: '받는 쪽', retry: '됩니다, 간격을 늘려 가며' },
    { code: '401', status: 401, who: '부르는 쪽', retry: '예, 갱신한 뒤 한 번만' },
    { code: '405', status: 405, who: '부르는 쪽', retry: '아니요, 메서드를 바꿔야 합니다' },
    { code: '415', status: 415, who: '부르는 쪽', retry: '아니요, 헤더를 바꿔야 합니다' },
    { code: '400', status: 400, who: '부르는 쪽', retry: '아니요, 그대로 또 틀립니다' },
    { code: '204', status: 204, who: '—', retry: '—' },
  ];

  // ---- 3절 — 이 줄은 누가 남기나 ----

  // 방식 3택. 라벨은 스펙과 브리프가 정한 그대로다.
  const LOG_MODE_OPTS = [
    { v: 'A', t: 'A 접속만' },
    { v: 'B', t: 'B 앱이 본문을' },
    { v: 'C', t: 'C nginx 가 본문까지' },
  ];

  // 요청 한 건이 실제로 지나는 층 넷. 로드밸런서는 S.logsFor() 가 돌려주는
  // 칸에 없다 — 지나가지만 우리가 볼 수 있는 로그가 아니기 때문이다.
  // 그래도 "층마다 다른 프로세스가 남긴다"는 그림에서는 빠뜨리지 않는다.
  const LAYERS = [
    { tag: '앱 SDK', desc: '폰 안의 SDK 코드가 남김 — 사용자 기기라 우리가 못 봄' },
    { tag: '로드밸런서', desc: 'LB 프로세스가 남김' },
    { tag: 'nginx', desc: 'nginx 워커 프로세스가 남김' },
    { tag: '우리 앱', desc: '우리가 짠 핸들러 함수가 남김' },
  ];

  // S.logsFor() 가 돌려주는 세 칸의 순서와 이름표.
  const LOG_PANES = [
    { key: 'sdk', tag: '앱 SDK', note: '우리는 못 봅니다' },
    { key: 'nginx', tag: 'nginx', note: '액세스 로그' },
    { key: 'event', tag: '우리 앱', note: '이벤트 로그' },
  ];

  // nginx 가 남기는 것과 우리 코드가 남기는 것이 갈리는 축 넷.
  // 스펙 4.2 3절의 표를 그대로 옮긴 것이다.
  const AXES = [
    { axis: '파일에 실제로 쓰는 것', nginx: 'nginx 워커 프로세스', code: '앱 프로세스 안의 로거' },
    { axis: '끄려면', nginx: '설정 고치고 reload', code: '코드 지우고 배포' },
    { axis: '앱이 죽어 있으면', nginx: '남습니다. 502 라고 적힙니다', code: '안 남습니다' },
    { axis: '붙일 수 있는 값', nginx: 'nginx 가 아는 것만 — IP, 시각, 경로, 상태, 걸린 시간',
      code: 'DB를 뒤져 붙일 수 있습니다 — 캠페인 id, 광고주 id, 비용' },
  ];

  // ---- 4절 — 부르는 쪽이 앱이냐 다른 서버냐 ----

  // 스위치 2택. 고르면 state.caller 뿐 아니라 path, auth 기본값도 같이 바뀐다 (buildCaller 에서 처리).
  const CALLER_OPTS = [
    { v: 'app', t: '앱이 부릅니다' },
    { v: 'server', t: '광고주 서버가 부릅니다' },
  ];

  // 축 여덟 비교표. 스펙 4.2 4절의 표를 그대로 옮긴 것이다 (가운뎃점만 쉼표로 바꿨다 — 이 트랙의
  // 나열 구분자 규칙). "건수와 두께" 행의 두 숫자만 CourseData 에서 끌어온다 — 글이 바뀌면
  // check-course-data.js 가 잡아낸다. 나머지 일곱 행은 숫자가 없어 문자열 그대로 옮겼다.
  const COMPARE_ROWS = [
    { axis: '누가 부르나', app: '앱, 브라우저', server: '광고주 서버, 매체 서버' },
    { axis: '인증', app: '사용자 토큰 (사람 단위)', server: 'API 키, 서명 (회사 단위)' },
    { axis: '비밀키를 실을 수 있나', app: '못 싣습니다', server: '실을 수 있습니다' },
    { axis: '보낸 값을 믿나', app: '안 믿고 다시 검사합니다', server: '상대적으로 믿습니다' },
    { axis: '못 닿으면', app: '그냥 사라집니다', server: '재시도합니다' },
    { axis: '건수와 두께',
      app: '많고 얇습니다 (초당 ' + CD.val.perSecFile.toLocaleString('en-US') + ')',
      server: '적고 두껍습니다 (하루 ' + CD.val.convDaily.toLocaleString('en-US') + ')' },
    { axis: '오는 시각', app: '사람이 누른 그때', server: '몇 분 뒤 몰아서 올 수 있습니다' },
    { axis: '남는 IP', app: '사용자 IP', server: '서버 IP (고정)' },
  ];


  // ==========================================
  // 2) 그리기 — state 를 읽기만 한다. 절마다 draw 함수 하나씩이고
  //    draw() 가 그 전부를 순서대로 부른다. 어느 이벤트가 무엇을 바꾸든
  //    화면 전체를 다시 그린다 — 부분 갱신을 안 하면 어긋날 자리가 없다.
  // ==========================================

  function markChoiceGroup(host, current) {
    Array.prototype.forEach.call(host.children, function (b) {
      b.setAttribute('aria-pressed', b.dataset.v === current ? 'true' : 'false');
    });
  }

  function drawControls() {
    markChoiceGroup($('apc-method-pick'), state.method);
    markChoiceGroup($('apc-auth-pick'), state.auth);
    $('apc-ctype-input').checked = state.ctype;
    BODY_FIELDS.forEach(function (f) {
      $('apc-body-' + f.k).checked = state.body[f.k] !== '';
    });
  }

  function drawServerState() {
    markChoiceGroup($('apc-serverstate'), state.server);
  }

  function drawRequest() {
    $('apc-req').textContent = S.requestText(state);
    // 배지는 본문만의 바이트다 — 위에 보이는 원문 전체(헤더 포함)보다 짧다.
    // "본문"을 안 붙이면 6절의 같은 배지(그 자리는 줄 전체를 잰다)와 헷갈린다.
    $('apc-req-bytes').textContent = '본문 ' + S.byteLen(S.bodyText(state)) + ' B';
  }

  // v 는 draw() 가 미리 계산해 넘긴다 — 보내기 전에는 null 이다.
  function drawResponse(v) {
    if (fake200On) {
      $('apc-res').textContent = 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n' +
        JSON.stringify({ result: 'fail', message: 'invalid click_id' });
      $('apc-verdict').textContent = '겉보기엔 200 이지만 실제로는 실패입니다. 상태 코드만 보면 알 수 없습니다.';
      $('apc-verdict').dataset.tone = 'bad';
      return;
    }
    if (!v) {
      $('apc-res').textContent = '아직 보내지 않았습니다. 보내기를 눌러 보세요.';
      $('apc-verdict').textContent = '아직 보내지 않았습니다.';
      delete $('apc-verdict').dataset.tone;
      return;
    }
    const res = S.responseText(v);
    // 상태는 색만이 아니라 글자로도 갈린다 — 응답이 없을 때도 빈 칸이 아니라 말이 뜬다
    $('apc-res').textContent = res === null ? '응답이 없습니다. 요청이 서버에 닿지 못했습니다.' : res;
    $('apc-verdict').textContent = v.message;
    $('apc-verdict').dataset.tone = v.status === 204 ? 'ok' : 'bad';
  }

  function drawCodes(v) {
    const activeStatus = v ? String(v.status) : null;
    const rows = $('apc-codes').querySelectorAll('tbody tr');
    Array.prototype.forEach.call(rows, function (tr) {
      tr.classList.toggle('is-now', tr.dataset.status === activeStatus);
    });
  }

  // 3절 — 방식 버튼 상태와 로그 칸 셋을 갱신한다. 1~2절과 달리 "보내기"를
  // 기다리지 않는다 — 방식을 눌러 보는 것 자체가 이 절의 시연이라, state 가
  // 바뀌는 즉시 판정을 다시 돌린다.
  function drawLogs() {
    markChoiceGroup($('apc-modes'), logMode);
    const v3 = S.evaluate(state);
    const logs = S.logsFor(logMode, state, v3);
    LOG_PANES.forEach(function (p) {
      const pane = $('apc-logpane-' + p.key);
      const body = pane.querySelector('.apc-logpane-body');
      const line = logs[p.key];
      const missing = line === null;
      pane.dataset.missing = String(missing);
      // null 인 칸도 지우지 않는다 — 「안 남았습니다」 글자가 이 절의 답이다.
      body.textContent = missing ? '안 남았습니다' : line;
    });
    // C 방식일 때만 nginx 설정을 같이 보인다.
    $('apc-logformat').hidden = logMode !== 'C';
  }

  // 4절 — 캡션 버튼(앱/서버) 눌림 표시만 한다. 비교표는 상태와 무관해 여기서 안 만진다.
  function drawCaller() {
    markChoiceGroup($('apc-caller'), state.caller);
  }

  // 4절 — 회차표와 note 를 다시 그린다. ideal 은 항상 요청 번호를 붙였다고 가정한 참값
  // 기준(real=1000, cpa=5000)이고, r 은 지금 스위치(useKey) 를 반영한 값이다. 회차별
  // sent/lost/cumulative 는 useKey 와 무관하게 항상 같다 — 실제로 몇 번 다시 보냈는지는
  // 바뀌지 않고, 그것을 리포트가 몇 건으로 세느냐만 바뀐다.
  function drawRetry() {
    const ideal = S.retryInflation(true);
    const r = S.retryInflation(useKey);

    const tbody = $('apc-retry').querySelector('tbody');
    tbody.innerHTML = '';
    r.rounds.forEach(function (row, i) {
      const tr = el('tr');
      tr.appendChild(el('td', null, String(i + 1)));
      tr.appendChild(el('td', null, row.sent.toLocaleString('en-US')));
      tr.appendChild(el('td', null, row.lost.toLocaleString('en-US')));
      tr.appendChild(el('td', null, row.cumulative.toLocaleString('en-US')));
      tbody.appendChild(tr);
    });

    $('apc-idem').setAttribute('aria-pressed', String(useKey));
    $('apc-retry-note').textContent =
      '실제 전환 ' + ideal.real.toLocaleString('en-US') + '건이 리포트에 ' +
      r.reported.toLocaleString('en-US') + '건으로 잡힙니다. 진짜 CPA 는 ₩' +
      ideal.cpa.toLocaleString('en-US') + '인데 리포트에는 ₩' +
      r.cpa.toLocaleString('en-US') + '로 뜹니다.';
  }

  function drawFake200() {
    $('apc-fake200').setAttribute('aria-pressed', String(fake200On));
    const note = $('apc-fake200-note');
    note.textContent = '';
    if (!fake200On) return;
    note.appendChild(document.createTextNode(
      '라이브러리는 성공으로 보고 재시도 대상에서 뺍니다. 실패율 그래프는 평평합니다. 로드밸런서도 정상으로 봅니다. '
    ));
    note.appendChild(el('strong', null, '정산 매출이 안 맞을 때까지 아무도 모릅니다.'));
  }

  // 5-1 — 합치기 스위치와 note 를 다시 그린다. 12ms·100ms 는 CD.val 에서 그대로
  // 끌어온다 — 여기서 새로 박지 않는다.
  function drawMerge() {
    $('apc-merge').setAttribute('aria-pressed', String(mergeOn));
    const note = $('apc-merge-note');
    note.textContent = '';
    if (!mergeOn) return;
    note.appendChild(el('code', null, '/v1/bid'));
    note.appendChild(document.createTextNode('와 '));
    note.appendChild(el('code', null, '/v1/track'));
    note.appendChild(document.createTextNode(
      '이 한 주소가 되면, 트래킹이 ' + CD.val.trackBudgetMs + ' ms 를 쓰는 동안 입찰이 슬롯을 못 잡아 ' +
      CD.val.bidBudgetMs + ' ms 를 넘깁니다.'
    ));
  }

  // 6절 — 1~4절이 같이 보는 그 state 가 지금 이 순간 C 방식에서 남기는 nginx 줄이다.
  // 장비가 안 떠 있으면(hostdown) 줄 자체가 없을 수 있어 null 도 다룬다.
  function drawFinal() {
    const v = S.evaluate(state);
    const line = S.logsFor('C', state, v).nginx;
    $('apc-final').textContent = line === null ? '안 남았습니다. 요청이 서버에 닿지 못했습니다.' : line;
    $('apc-final-bytes').textContent = line === null ? '—' : S.byteLen(line) + ' B';
  }

  function draw() {
    drawCaller();
    drawControls();
    drawServerState();
    drawRequest();
    // 보낸 적이 있고 함정 스위치가 꺼져 있을 때만 실제 판정을 계산한다.
    // 이 한 번의 계산 결과를 응답 칸과 코드표가 같이 나눠 쓴다.
    const v = (!fake200On && sent) ? S.evaluate(state) : null;
    drawResponse(v);
    drawCodes(v);
    drawFake200();
    drawLogs();
    drawRetry();
    drawMerge();
    drawFinal();
    // 절이 늘 때마다 여기에 한 줄씩 더한다
  }

  // ==========================================
  // 3) 바인딩 — state 를 바꾸고 draw() 를 부른다
  // ==========================================

  // ⚠ 체크박스에는 이벤트를 직접 걸지 않는다. 감싸는 <label> 에 건다.
  //    라벨 글자를 누르면 click 이 두 번 오므로(라벨에 한 번, 라벨이 넘겨준
  //    체크박스에 한 번) 실제로 바뀐 뒤에만 반응하게 dataset 에 적어 둔다.
  //    기존 데모 다섯이 전부 이 함정에 걸렸다.
  function bindToggle(el, apply) {
    el.addEventListener('click', function () {
      const input = el.querySelector('input');
      const now = String(input.checked);
      if (el.dataset.applied === now) return;
      el.dataset.applied = now;
      apply(input.checked);
      draw();
    });
  }

  // 메서드, 인증, 서버 상태는 라벨이 감싼 라디오가 아니라 그냥 버튼이다.
  // 버튼은 다른 input 을 감싸지 않으니 위 함정 자체가 없다 — click 이 한 번만 온다.
  function bindPick(container, apply) {
    container.addEventListener('click', function (e) {
      const btn = e.target.closest('.apc-btn-pick');
      if (!btn) return;
      apply(btn.dataset.v);
      draw();
    });
  }

  function buildChoiceGroup(host, opts) {
    opts.forEach(function (o) {
      const b = el('button', 'apc-btn-pick', o.t);
      b.type = 'button';
      b.dataset.v = o.v;
      b.setAttribute('aria-pressed', 'false');
      host.appendChild(b);
    });
  }

  function buildControls() {
    const host = $('apc-controls');

    // 메서드
    const rowM = el('div', 'apc-ctrl-row');
    rowM.appendChild(el('div', 'apc-ctrl-name', '메서드'));
    const pickM = el('div', 'apc-pick');
    pickM.id = 'apc-method-pick';
    rowM.appendChild(pickM);
    host.appendChild(rowM);

    // Content-Type
    const rowC = el('div', 'apc-ctrl-row');
    rowC.appendChild(el('div', 'apc-ctrl-name', 'Content-Type'));
    const labelC = el('label', 'apc-check');
    const inputC = el('input');
    inputC.type = 'checkbox';
    inputC.id = 'apc-ctype-input';
    inputC.checked = state.ctype;
    // dataset.applied 를 지금 checked 값으로 미리 채워 둔다. 안 채우면 첫 클릭 때
    // (아직 안 바뀐) 옛 값으로 한 번 헛불이 나간다 — apply() 가 지금은 단순 대입이라
    // 안 드러나지만, 나중에 부작용이 생기는 순간 진짜 버그가 된다.
    labelC.dataset.applied = String(state.ctype);
    labelC.appendChild(inputC);
    labelC.appendChild(el('span', null, 'application/json 붙이기'));
    rowC.appendChild(labelC);
    host.appendChild(rowC);

    // 인증
    const rowA = el('div', 'apc-ctrl-row');
    rowA.appendChild(el('div', 'apc-ctrl-name', '인증'));
    const pickA = el('div', 'apc-pick');
    pickA.id = 'apc-auth-pick';
    rowA.appendChild(pickA);
    host.appendChild(rowA);

    // 본문 필드
    const rowB = el('div', 'apc-ctrl-row');
    rowB.appendChild(el('div', 'apc-ctrl-name', '본문 필드'));
    const wrapB = el('div', 'apc-body-fields');
    BODY_FIELDS.forEach(function (f) {
      const lb = el('label', 'apc-check');
      const ip = el('input');
      ip.type = 'checkbox';
      ip.id = 'apc-body-' + f.k;
      ip.checked = state.body[f.k] !== '';
      // 위 Content-Type 과 같은 이유로 첫 클릭의 헛불을 막는다
      lb.dataset.applied = String(ip.checked);
      lb.appendChild(ip);
      lb.appendChild(el('span', null, f.t));
      wrapB.appendChild(lb);
      bindToggle(lb, function (checked) {
        state.body[f.k] = checked ? FULL_BODY[f.k] : '';
      });
    });
    rowB.appendChild(wrapB);
    host.appendChild(rowB);

    buildChoiceGroup(pickM, METHOD_OPTS);
    buildChoiceGroup(pickA, AUTH_OPTS);

    bindPick(pickM, function (v) { state.method = v; });
    bindPick(pickA, function (v) { state.auth = v; });
    bindToggle(labelC, function (checked) { state.ctype = checked; });
  }

  function buildServerState() {
    const host = $('apc-serverstate');
    buildChoiceGroup(host, SERVER_OPTS);
    bindPick(host, function (v) { state.server = v; });
  }

  function buildCodes() {
    const host = $('apc-codes');
    const thead = el('thead');
    const trh = el('tr');
    ['코드', '누가 고치나', '다시 보내도 되나'].forEach(function (t) { trh.appendChild(el('th', null, t)); });
    thead.appendChild(trh);
    host.appendChild(thead);

    const tbody = el('tbody');
    CODE_ROWS.forEach(function (r) {
      const tr = el('tr');
      tr.dataset.status = String(r.status);
      const tdCode = el('td', 'apc-codes-code');
      tdCode.appendChild(document.createTextNode(r.code + ' '));
      tdCode.appendChild(el('span', 'apc-codes-now', '지금'));
      tr.appendChild(tdCode);
      tr.appendChild(el('td', null, r.who));
      tr.appendChild(el('td', null, r.retry));
      tbody.appendChild(tr);
    });
    host.appendChild(tbody);
  }

  // 3절 — 층 넷은 상태와 무관한 고정 설명이라 한 번만 짓는다.
  function buildLayers() {
    const host = $('apc-layers');
    LAYERS.forEach(function (l) {
      const row = el('div', 'apc-layer');
      row.appendChild(el('span', 'apc-layer-tag', l.tag));
      row.appendChild(el('span', 'apc-layer-desc', l.desc));
      host.appendChild(row);
    });
  }

  function buildModes() {
    const host = $('apc-modes');
    buildChoiceGroup(host, LOG_MODE_OPTS);
    bindPick(host, function (v) { logMode = v; });
  }

  // 로그 칸 셋 + C 방식일 때만 보이는 nginx 설정 블록을 한 번만 짓는다.
  // 내용은 draw() 가 매번 다시 채운다.
  function buildLogs() {
    const host = $('apc-logs');
    const panes = el('div', 'apc-logpanes');
    LOG_PANES.forEach(function (p) {
      const pane = el('div', 'apc-logpane');
      pane.id = 'apc-logpane-' + p.key;
      const head = el('div', 'apc-logpane-head');
      head.appendChild(el('span', null, p.tag));
      head.appendChild(el('span', 'apc-logpane-note', p.note));
      pane.appendChild(head);
      pane.appendChild(el('pre', 'apc-logpane-body'));
      panes.appendChild(pane);
    });
    host.appendChild(panes);

    const fmt = el('div', 'apc-logformat');
    fmt.id = 'apc-logformat';
    fmt.appendChild(el('p', 'apc-logformat-caption', '이 설정이 본문을 접속 로그 줄에 그대로 붙입니다.'));
    // CourseData.val.logFormat 은 posts/log-hops-to-kafka.md 의 두 줄을 개행으로
    // 이은 값이다. 여기서 다시 박지 않는다 — 글이 바뀌면 check-course-data.js 가
    // 잡아낸다. <pre> 가 그 개행을 그대로 줄바꿈으로 보여 준다.
    fmt.appendChild(el('pre', 'apc-logformat-code', CD.val.logFormat));
    fmt.appendChild(el('p', 'apc-logformat-note',
      '캠페인 id, 광고주 id, 비용은 이 줄에 없습니다. nginx 가 모르는 값입니다.'));
    host.appendChild(fmt);
  }

  // 표 하나를 헤더 배열과 행 배열로 짓는다. thead·tbody 를 손으로 매번 짜던
  // buildAxes/buildCompare/buildRetry 세 벌을 여기로 합쳤다 — 5절에서 표가
  // 둘 더 늘어 다섯 벌이 되기 전에 정리한다.
  // rows 를 안 주면(undefined) tbody 를 빈 채로 남긴다 — 회차표처럼 내용을
  // draw() 가 매번 새로 채우는 표를 위해서다. 셀 값은 문자열이거나 DOM
  // 노드(예: 5-2 의 흔한가 칩)다.

  function buildAxes() {
    buildSimpleTable('apc-axes', ['축', 'nginx (A, C)', '우리 코드 (B)'],
      AXES.map(function (r) { return [r.axis, r.nginx, r.code]; }));
  }

  // 4절 — 앱/서버 2택. 고르면 state.caller 와 함께 path, auth 기본값도 같이 바꾼다.
  // (`server` 면 /v1/conversions 와 apikey, `app` 이면 /v1/events 와 none으로 되돌아간다.)
  function buildCaller() {
    const host = $('apc-caller');
    buildChoiceGroup(host, CALLER_OPTS);
    bindPick(host, function (v) {
      state.caller = v;
      if (v === 'server') {
        state.path = '/v1/conversions';
        state.auth = 'apikey';
      } else {
        state.path = '/v1/events';
        state.auth = 'none';
      }
    });
  }

  // 4절 — 비교표는 state 와 무관한 고정 내용이라 한 번만 짓는다.
  function buildCompare() {
    buildSimpleTable('apc-compare', ['축', '앱이 부를 때', '서버가 부를 때'],
      COMPARE_ROWS.map(function (r) { return [r.axis, r.app, r.server]; }));
  }

  // 4절 — 회차표의 머리글만 한 번 짓는다. tbody 내용은 drawRetry() 가 매번 채운다.
  // "누적" 이 아니라 "보낸 누적"이다 — 이 칸은 요청 번호 스위치와 무관하게
  // 항상 실제로 보낸 건수를 센다(rounds 는 useKey 와 무관). 리포트가 세는
  // 건수(apc-retry-note 의 문구)와는 다른 숫자라 헷갈리지 않게 이름을 갈랐다.
  function buildRetry() {
    buildSimpleTable('apc-retry', ['회차', '보낸 건수', '응답 유실', '보낸 누적']);
  }

  // 5-1 — 주소 다섯을 표로. deadlineMs·rate 가 null 인 칸은 지어내지 않고 '—' 로 비운다.
  function buildEndpoints() {
    const rows = CD.ENDPOINTS.map(function (r) {
      return [
        r.path, r.caller, r.auth,
        r.deadlineMs === null ? '—' : r.deadlineMs + ' ms',
        r.rate === null ? '—' : r.rate,
      ];
    });
    buildSimpleTable('apc-endpoints', ['주소', '부르는 쪽', '인증', '마감', '유량'], rows);
  }

  // 5-2 — 흔한가 칸을 칩으로 감싼다. '드뭅니다' 만 색을 다르게 해 눈에 띄게 한다 —
  // 글자(드뭅니다/흔합니다 자체)가 이미 다르므로 색은 구분을 보태는 것이지 유일한 단서가 아니다.
  function commonChip(text) {
    const span = el('span', 'apc-chip', text);
    span.dataset.tone = text.indexOf('드뭅니다') > -1 ? 'rare' : 'plain';
    return span;
  }

  // 5-2 — 가르는 방법 다섯을 표로.
  function buildNaming() {
    const rows = CD.NAMING.map(function (r) {
      return [r.how, r.sample, commonChip(r.common), r.splitBy, r.why];
    });
    buildSimpleTable('apc-naming',
      ['가르는 방법', '예', '흔한가', '문 앞에서 갈리는 기준', '왜'], rows);
  }

  function bindSend() {
    $('apc-send').addEventListener('click', function () {
      sent = true;
      draw();
    });
  }

  function bindFake200() {
    $('apc-fake200').addEventListener('click', function () {
      fake200On = !fake200On;
      draw();
    });
  }

  // 4절 — 요청 번호 붙이기. 실제 서버 상태는 안 건드리고 리포트 집계 방식(useKey)만 뒤집는다.
  function bindIdem() {
    $('apc-idem').addEventListener('click', function () {
      useKey = !useKey;
      draw();
    });
  }

  // 5-1 — 한 주소로 합치기. 실제 state 는 안 건드리고 note 표시 여부만 뒤집는다.
  function bindMerge() {
    $('apc-merge').addEventListener('click', function () {
      mergeOn = !mergeOn;
      draw();
    });
  }

  buildControls();
  buildServerState();
  buildCodes();
  buildLayers();
  buildModes();
  buildLogs();
  buildAxes();
  buildCaller();
  buildCompare();
  buildRetry();
  buildEndpoints();
  buildNaming();
  bindSend();
  bindFake200();
  bindIdem();
  bindMerge();
  draw();
})();
