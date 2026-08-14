// ===================================================================
// 요청 경로 시뮬레이터 — js/request-path-demo.js
// LB · Ingress · API Gateway · 서비스 메시는 한꺼번에 설계된 것이 아니다.
// 부품을 하나 끄면 요청이 어디서 멈추는지, 그리고 사람이 관리해야 하는 것이
// 몇 개로 늘어나는지를 본다.
//
// 색 값은 이 파일에 하나도 없다. 상태는 CSS 클래스로만 표시한다
// (팔레트 2종 × 테마 2종 = 4가지 조합에서 전부 살아 있어야 하므로).
// ===================================================================
(function () {
  'use strict';

  // ==========================================
  // 1) 판정 — 요청이 어디까지 가나
  // ==========================================

  // 부품 구성에서 요청이 어디까지 가는지 정한다.
  // 반환: [{name, ok, note}] — ok:false 인 첫 칸에서 요청이 멈춘다.
  function tracePath(cfg) {
    var steps = [];
    steps.push({ name: '매체', ok: true, note: cfg.media + '곳' });

    if (cfg.lb) {
      steps.push({ name: 'LB', ok: true, note: '살아 있는 대상만 고름' });
    } else {
      steps.push({
        name: 'LB 없음', ok: false,
        note: '매체가 서버 IP를 직접 안다. 배포하면 그 사이 요청이 실패한다'
      });
      return steps;
    }

    if (cfg.ingress) {
      steps.push({ name: 'Ingress', ok: true, note: '호스트·경로로 서비스를 고름' });
    } else if (cfg.services > 1) {
      steps.push({
        name: 'Ingress 없음', ok: false,
        note: '서비스가 ' + cfg.services + '개인데 경로로 나눌 수단이 없다. 서비스마다 LB를 따로 붙여야 한다'
      });
      return steps;
    } else {
      steps.push({ name: 'Ingress 없음', ok: true, note: '서비스가 1개라 아직 필요 없다' });
    }

    if (cfg.gateway) {
      steps.push({ name: 'API Gateway', ok: true, note: '매체 키 확인 · 쿼터 차감 · 버전 분기' });
    } else if (cfg.media > 1) {
      steps.push({
        name: 'API Gateway 없음', ok: false,
        note: '매체가 ' + cfg.media + '곳인데 인증·쿼터를 서비스 ' + cfg.services + '곳이 각자 구현해야 한다'
      });
      return steps;
    } else {
      steps.push({ name: 'API Gateway 없음', ok: true, note: '매체가 1곳이라 아직 필요 없다' });
    }

    steps.push({ name: 'bidder', ok: true, note: '입찰가 계산' });
    return steps;
  }

  // 입찰 경로의 서비스 간 호출은 bidder → pctr 과 bidder → feature-store 두 개다.
  // log-collector 는 입찰 경로 밖이라 세지 않는다. 그래서 서비스를 12개로 쪼개도
  // 요청 하나가 지나는 홉은 2번에서 멈춘다.
  var HOP_CAP = 2;
  // 사이드카 1회 통과 비용. 잘 튜닝된 Envoy의 p50 수준으로 잡은 가정이다(벤더 공표값은
  // 프록시 한 쌍 기준 P90뿐이라 그 절반으로 뒀다). 한 홉에서 나갈 때·들어올 때 두 번 지난다.
  // 홉 2번 × 통과 2회 × 0.3 = 1.2ms — 글 5절이 "안쪽 호출 2개 × 양 끝 = 4회" 로 센 값과 같다.
  var SIDECAR_MS = 0.3;

  // 지금 구성에서 사람이 관리해야 하는 것의 개수.
  // 반환: [{label, value, unit, note}] — 화면에 그대로 찍는 표기까지 여기서 정한다.
  // 이 글의 입찰 경로는 같은 데이터센터 안 전용 회선 위 평문(10.0.x.x)이라
  // 공인 IP도 TLS 인증서도 세지 않는다.
  function burden(cfg) {
    // LB가 없으면 대표 주소라는 게 아예 없다 — 매체가 서버 주소를 직접 든다.
    // LB가 있으면 Ingress 유무가 대표 주소 개수를 정한다.
    var addresses = !cfg.lb ? cfg.services : (cfg.ingress ? 1 : cfg.services);
    // 대상 그룹·헬스체크는 LB의 설정이다. LB가 없으면 설정할 것도 없다.
    var targets = !cfg.lb ? 0 : (cfg.ingress ? 1 : cfg.services);
    var policy = cfg.gateway ? 1 : cfg.services;   // Gateway가 없으면 서비스마다 각자 구현
    // 매체별 인증키·쿼터·버전 분기를 거는 자리. 게이트웨이가 없으면 그 자리가 아예 없다.
    var quota = cfg.gateway ? 1 : 0;
    var quotaLost = !cfg.gateway && cfg.media > 1;
    var hops = Math.max(Math.min(cfg.services - 1, HOP_CAP), 0);
    var sidecar = cfg.mesh ? +(SIDECAR_MS * 2 * hops).toFixed(1) : 0;

    var addrNote;
    if (!cfg.lb) addrNote = '묶어 줄 LB가 없다. 매체가 서버 주소를 하나씩 직접 들고 있어야 하고, 서버가 바뀔 때마다 매체 설정을 고쳐야 한다';
    else if (cfg.ingress) addrNote = '이름 하나로 끝난다. 뒤에서 규칙표가 갈라 준다';
    else if (cfg.services === 1) addrNote = '서비스가 1개라 대표 주소도 하나로 끝난다';
    else addrNote = '서비스마다 대표 주소를 하나씩 세워야 한다. 그중 매체가 직접 부르는 것은 일부다';

    var targetNote;
    if (!cfg.lb) targetNote = '설정할 것이 없는 대신, 죽은 서버를 빼 주는 것도 없다';
    else if (cfg.ingress) targetNote = 'LB 하나에 대상 그룹·헬스체크 한 벌';
    else if (cfg.services === 1) targetNote = '서비스가 1개라 LB도 하나, 대상 그룹도 한 벌이다';
    else targetNote = 'LB를 서비스 수만큼 세우면 대상 그룹·헬스체크도 그만큼 늘어난다';

    var quotaNote;
    if (cfg.gateway) quotaNote = '게이트웨이 한 곳에서 매체 ' + cfg.media + '곳의 인증키·초당 허용량을 건다';
    else if (quotaLost) quotaNote = '걸 자리가 없다. 규칙표에는 누가 보냈는지 적을 칸이 없어, 한 매체가 몰아쳐도 막지 못한다';
    else quotaNote = '매체가 1곳이라 나눠 걸 일이 없다';

    var meshNote;
    if (!cfg.mesh) meshNote = '메시를 안 쓰면 사이드카가 없다';
    else if (hops === 0) meshNote = '서비스가 1개라 서비스 간 홉이 없다';
    else if (hops < HOP_CAP) meshNote = '서비스 간 홉 ' + hops + '번 × 사이드카 2번 × ' + SIDECAR_MS + 'ms — 12ms 예산에서 깎인다';
    else meshNote = '홉 ' + HOP_CAP + '번 × 사이드카 2번 × ' + SIDECAR_MS + 'ms — 한 요청이 지나는 홉은 ' + HOP_CAP +
      '번까지로 본다. 더 쪼개도 나머지는 입찰 경로 밖이라 늘지 않는다';

    return [
      { label: '관리할 대표 주소', value: addresses, unit: '개', note: addrNote },
      { label: '대상 그룹 설정', value: targets, unit: '벌', lost: !cfg.lb, note: targetNote },
      {
        label: '정책 구현 벌수', value: policy, unit: '벌',
        note: cfg.gateway
          ? '인증·쿼터·버전 분기를 게이트웨이 한 곳에서 고친다'
          : '서비스마다 각자 구현하고, 정책이 바뀌면 그 수만큼 따로 고친다'
      },
      { label: '매체별 쿼터', value: quota, unit: '벌', lost: quotaLost, note: quotaNote },
      { label: '사이드카 지연', value: sidecar, unit: 'ms', note: meshNote }
    ];
  }

  // ==========================================
  // 2) 그리기 — 위 두 함수의 결과를 렌더할 뿐이다
  // ==========================================

  var $ = function (id) { return document.getElementById(id); };
  var TOGGLES = ['rp-lb', 'rp-ingress', 'rp-gateway', 'rp-mesh'];
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var runId = 0;   // 진행 중인 애니메이션 취소용

  function readCfg() {
    return {
      lb: $('rp-lb').checked,
      ingress: $('rp-ingress').checked,
      gateway: $('rp-gateway').checked,
      mesh: $('rp-mesh').checked,
      services: +$('rp-svc').value,
      media: +$('rp-media').value
    };
  }

  // ok:true 라도 이름이 '…없음' 이면 "지금은 없어도 되는 칸"이라 다르게 그린다.
  function stateOf(step) {
    if (!step.ok) return 'stop';
    return /없음$/.test(step.name) ? 'skip' : 'pass';
  }

  var MARK = { pass: '✓', skip: '–', stop: '×', ghost: '·' };

  function stepHTML(name, note, state, extra) {
    return '<div class="rp-step is-' + state + '">' +
      '<div class="rp-step-head">' +
        '<span class="rp-step-mark" aria-hidden="true">' + MARK[state] + '</span>' +
        '<span class="rp-step-name">' + name + '</span>' +
        (extra || '') +
      '</div>' +
      '<span class="rp-step-note">' + note + '</span>' +
      '</div>';
  }

  // 화살표는 뒤따르는 칸과 한 묶음(.rp-link)으로 싼다.
  // 줄바꿈이 일어나도 화살표만 줄 끝에 덩그러니 남지 않게 하기 위해서다.
  function linked(box, dead) {
    return '<div class="rp-link">' +
      '<span class="rp-arrow' + (dead ? ' is-dead' : '') + '" aria-hidden="true"></span>' +
      box + '</div>';
  }

  function renderPath(steps, stopped) {
    var html = steps.map(function (s, i) {
      var st = stateOf(s);
      var chip = st === 'stop' ? '<span class="rp-step-stop">여기서 멈춘다</span>' : '';
      var box = stepHTML(s.name, s.note, st, chip);
      return i === 0 ? box : linked(box, false);
    }).join('');

    if (stopped) {
      html += linked(stepHTML('bidder', '요청이 여기까지 오지 못한다', 'ghost'), true);
    }
    $('rp-path').innerHTML = html;
  }

  function renderVerdict(cfg, steps, stopped, rows) {
    var box = $('rp-verdict');
    var text;
    if (stopped) {
      var last = steps[steps.length - 1];
      text = '<strong>× 요청은 ' + last.name.replace(/ 없음$/, '') + ' 자리에서 멈춘다.</strong> ' + last.note + '.';
    } else {
      var why = [];
      if (!cfg.ingress) why.push('서비스가 1개라 Ingress');
      if (!cfg.gateway) why.push('매체가 1곳이라 API Gateway');
      text = '<strong>✓ 요청이 bidder까지 도착한다.</strong>';
      if (why.length) text += ' 지금은 ' + why.join(', 그리고 ') + '가 없어도 된다. 숫자가 하나만 늘면 그 순간 필요해진다.';
      var sidecar = rows[rows.length - 1].value;
      if (sidecar > 0) text += ' 메시는 요청을 막지 않는다. 대신 12ms 예산에서 ' + sidecar + 'ms를 가져간다.';
    }
    box.className = 'rp-verdict ' + (stopped ? 'is-stop' : 'is-pass');
    box.innerHTML = text;
  }

  function renderCost(rows) {
    // 제목·설명문은 HTML에 고정으로 두고 여기서는 줄만 다시 그린다.
    // (aria-live 영역이 안 바뀌는 문구까지 매번 다시 읽지 않게)
    var html = rows.map(function (r) {
      // 기본값은 개수 항목이 1, 시간 항목이 0이다
      var many = r.unit === 'ms' ? r.value > 0 : r.value > 1;
      var cls = r.lost ? ' is-lost' : (many ? ' is-many' : '');
      // 표시는 글자가 아니라 모양으로 — 색만으로는 알리지 않는다.
      // 글자로는 뜻이 안 통하므로 읽기에서는 빼고, 뜻은 오른쪽 설명문이 그대로 담는다.
      var flag = r.lost ? '×' : (many ? '▲' : '');
      return '<div class="rp-cost-row">' +
        '<span class="rp-cost-label">' + r.label + '</span>' +
        '<span class="rp-cost-value' + cls + '">' + r.value + '<em>' + r.unit + '</em>' +
          (flag ? '<span class="rp-cost-flag" aria-hidden="true">' + flag + '</span>' : '') +
        '</span>' +
        '<span class="rp-cost-note">' + r.note + '</span>' +
        '</div>';
    }).join('');
    $('rp-cost-rows').innerHTML = html;
  }

  function syncToggles() {
    TOGGLES.forEach(function (id) {
      var input = $(id);
      var label = input.closest('label');
      if (label) label.classList.toggle('is-on', input.checked);
    });
  }

  function render() {
    runId += 1;              // 이전 애니메이션 취소
    var cfg = readCfg();
    $('rp-svc-v').textContent = cfg.services;
    $('rp-media-v').textContent = cfg.media;
    syncToggles();

    var steps = tracePath(cfg);
    var stopped = !steps[steps.length - 1].ok;
    var rows = burden(cfg);

    renderPath(steps, stopped);
    renderVerdict(cfg, steps, stopped, rows);
    renderCost(rows);
  }

  // 요청 한 건이 칸을 하나씩 지나가는 것을 보여준다. 멈추는 칸이 마지막으로 켜진다.
  function fire() {
    var nodes = Array.prototype.slice.call(
      document.querySelectorAll('#rp-path .rp-step:not(.is-ghost)')
    );
    var my = ++runId;
    nodes.forEach(function (n) { n.classList.remove('is-lit'); });
    if (reduceMotion) {
      nodes.forEach(function (n) { n.classList.add('is-lit'); });
      return;
    }
    var i = 0;
    (function next() {
      if (my !== runId || i >= nodes.length) return;
      nodes[i].classList.add('is-lit');
      i += 1;
      setTimeout(next, 240);
    })();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!$('rp-path')) return;
    TOGGLES.concat(['rp-svc', 'rp-media']).forEach(function (id) {
      $(id).addEventListener('input', render);
    });
    $('rp-fire').addEventListener('click', fire);
    render();
  });
})();
