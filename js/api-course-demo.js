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

  // ==========================================
  // 0) 참조
  // ==========================================

  const S = window.ApiCourseServer;

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
  // 코드마다 누가 고치는지, 다시 보내면 뜻이 있는지. api-course-server.js 의
  // evaluate() 가 실제로 내놓는 상태값 일곱 그대로다 — 표를 따로 지어내지 않는다.
  // "다시 보내도 되나"는 responseText() 의 retryable(= status >= 500) 판단과
  // posts/log-hops-to-kafka.md 2절의 "재전송이 있는 곳에는 중복이 있다"를 그대로 옮겼다.
  const CODE_ROWS = [
    { code: '0', status: 0, who: '서버 담당자', retry: '예. 대신 중복이 생깁니다' },
    { code: '502', status: 502, who: '서버 담당자', retry: '예' },
    { code: '401', status: 401, who: '부르는 쪽', retry: '아니요. 자격증명을 바꿔야 합니다' },
    { code: '405', status: 405, who: '부르는 쪽', retry: '아니요. 메서드를 바꿔야 합니다' },
    { code: '415', status: 415, who: '부르는 쪽', retry: '아니요. 헤더를 바꿔야 합니다' },
    { code: '400', status: 400, who: '부르는 쪽', retry: '아니요. 필드를 채워야 합니다' },
    { code: '204', status: 204, who: '—', retry: '필요 없습니다. 이미 받았습니다' },
  ];

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

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
    $('apc-req-bytes').textContent = S.byteLen(S.bodyText(state)) + ' B';
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

  function draw() {
    drawControls();
    drawServerState();
    drawRequest();
    // 보낸 적이 있고 함정 스위치가 꺼져 있을 때만 실제 판정을 계산한다.
    // 이 한 번의 계산 결과를 응답 칸과 코드표가 같이 나눠 쓴다.
    const v = (!fake200On && sent) ? S.evaluate(state) : null;
    drawResponse(v);
    drawCodes(v);
    drawFake200();
    // 절이 늘 때마다 여기에 한 줄씩 더한다 (drawLogs, drawCompare, …)
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

  buildControls();
  buildServerState();
  buildCodes();
  bindSend();
  bindFake200();
  draw();
})();
