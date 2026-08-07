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

  // 지금 구성에서 사람이 관리해야 하는 것의 개수.
  // 반환: [{label, value, unit, note}] — 화면에 그대로 찍는 표기까지 여기서 정한다.
  // 이 글의 입찰 경로는 같은 데이터센터 안 전용 회선 위 평문(10.0.x.x)이라
  // 공인 IP도 TLS 인증서도 세지 않는다.
  function burden(cfg) {
    var perService = cfg.ingress ? 1 : cfg.services;   // Ingress가 없으면 서비스 수만큼 늘어난다
    var policy = cfg.gateway ? 1 : cfg.services;       // Gateway가 없으면 서비스마다 각자 구현
    var hops = Math.max(Math.min(cfg.services - 1, 3), 0);
    var sidecar = cfg.mesh ? +(0.5 * 2 * hops).toFixed(1) : 0;

    var meshNote;
    if (!cfg.mesh) meshNote = '메시를 안 쓰면 사이드카가 없다';
    else if (hops === 0) meshNote = '서비스가 1개라 서비스 간 홉이 없다';
    else meshNote = '서비스 간 홉 ' + hops + '번 × 사이드카 2번 × 0.5ms — 12ms 예산에서 깎인다';

    return [
      {
        label: '매체가 아는 주소', value: perService, unit: '개',
        note: cfg.ingress
          ? '이름 하나로 끝난다. 뒤에서 규칙표가 갈라 준다'
          : '서비스마다 대표 주소를 세우고, 그 목록을 매체가 들고 있어야 한다'
      },
      {
        label: '대상 그룹 설정', value: perService, unit: '벌',
        note: cfg.ingress
          ? 'LB 하나에 대상 그룹·헬스체크 한 벌'
          : 'LB를 서비스 수만큼 세우면 대상 그룹·헬스체크도 그만큼 늘어난다'
      },
      {
        label: '정책 구현 벌수', value: policy, unit: '벌',
        note: cfg.gateway
          ? '인증·쿼터·버전 분기를 게이트웨이 한 곳에서 고친다'
          : '서비스마다 각자 구현하고, 정책이 바뀌면 그 수만큼 따로 고친다'
      },
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

  var MARK = { pass: '✓', skip: '–', stop: '✕', ghost: '·' };

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
      text = '<strong>✕ 요청은 ' + last.name.replace(/ 없음$/, '') + ' 자리에서 멈춘다.</strong> ' + last.note + '.';
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
    var html = '<h3>사람이 관리해야 하는 것</h3>' +
      '<p class="rp-cost-sub">부품을 빼면 그 일이 사라지는 게 아니라 사람 쪽으로 옮겨온다. 1보다 큰 값에 ▲ 가 붙는다.</p>';
    html += rows.map(function (r) {
      var many = r.unit === 'ms' ? r.value > 0 : r.value > 1;
      return '<div class="rp-cost-row">' +
        '<span class="rp-cost-label">' + r.label + '</span>' +
        '<span class="rp-cost-value' + (many ? ' is-many' : '') + '">' + r.value + '<em>' + r.unit + '</em></span>' +
        '<span class="rp-cost-note">' + r.note + '</span>' +
        '</div>';
    }).join('');
    $('rp-cost').innerHTML = html;
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
