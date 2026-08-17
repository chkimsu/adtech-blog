// ===================================================================
// 파이프라인 코스 2페이지 — 5~6절 위젯
//   js/pipeline-course-sections2.js
//
// js/pipeline-course-sections.js 가 3~4절을 갖고 있었는데 Task 11 이
// 5~6절을 더하면서 그 파일이 650줄을 넘겼다. 그 파일의 예고대로 3절/4절
// 경계에서 나눠, 5절부터는 여기로 새로 짓는다 — 5절과 6절 둘 다 rail 이나
// 다른 절과 상태를 안 주고받는 완결된 위젯이라 가르기 쉬웠다. 이 파일도
// window.CourseData 와 window.PipelineCourseModel 만 읽고, 자기 절의 DOM
// 만 건드린다. el()·reader()·theadRow() 는 pipeline-course-sections.js 에도
// 있는 것과 같은 모양이지만 그 파일의 지역 함수라 여기서 못 불러 다시 둔다
// (이 파일은 window.* 만 본다) — 그 파일이 이미 쓰는 것과 같은 관행이다.
//
// 7절은 아직 빈 채로 남아 있다. 다음 작업이 그 절을 이 파일에 이을지 세
// 번째 파일을 새로 만들지는 그때 줄 수를 보고 판단한다.
// ===================================================================
(function () {
  'use strict';

  const M = window.PipelineCourseModel;
  const CD = window.CourseData;
  const $ = (id) => document.getElementById(id);

  function reader(key) {
    return CD.CONSUMERS.filter(function (c) { return c.key === key; })[0];
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function theadRow(host, labels) {
    const thead = el('thead');
    const tr = el('tr');
    labels.forEach(function (t) { tr.appendChild(el('th', null, t)); });
    thead.appendChild(tr);
    host.appendChild(thead);
  }

  // ==========================================
  // 5절 — 기다렸다 가져가도 되나 (보존과 되감기)
  // ==========================================

  // [학습을 N일 멈췄다] 의 N. CATCHUP 의 두 점 다 같은 3일치 시나리오다
  // ("모델 학습이 4명으로 3일치를 따라잡으면…") — 새 숫자를 하나 더
  // 만들지 않고 그 시나리오 값을 그대로 재사용한다.
  const PAUSE_DAYS = M.CATCHUP[0].backlogDays;

  let retentionPaused = false;  // [학습을 N일 멈췄다] 스위치

  function highlightDiskRow(days) {
    const rows = $('plc-disk').querySelectorAll('.plc-disk-row');
    Array.prototype.forEach.call(rows, function (tr) {
      tr.setAttribute('aria-current', String(Number(tr.dataset.days) === days));
    });
  }

  // 답은 굵게, 근거 숫자(보존 일수)는 CourseData 에서 그대로 가져온다.
  function buildRetentionAnswer() {
    const host = $('plc-retention-answer');
    host.appendChild(el('strong', null, '보존 기간 안에서는 됩니다.'));
    host.appendChild(document.createTextNode(' 우리 답은 ' + CD.val.retentionDays + '일입니다.'));
  }

  // 디스크 표 — M.DISK 네 줄을 그대로 그린다. 안 들어가는 줄(percent>100)은
  // 색만이 아니라 글자 상태(× 안 들어감)로도 갈린다 — .plc-status 는 2절의
  // Logstash 끄기 효과표가 이미 쓰는 클래스라 새로 만들지 않고 그대로 쓴다.
  // totalGb·perBrokerGb 는 소수점 한 자리로 고정해서(4145.0 → "4,145.0")
  // 글의 표기와 맞춘다.
  function buildDiskTable() {
    const table = $('plc-disk');
    theadRow(table, ['보존', '합계', '브로커 한 대', '디스크 ' + M.DISK_CAPACITY_GB + 'GB 대비', '']);
    const tbody = el('tbody');
    const fmt = { minimumFractionDigits: 1, maximumFractionDigits: 1 };
    M.DISK.forEach(function (d) {
      const tr = el('tr', 'plc-disk-row');
      tr.dataset.days = String(d.days);
      tr.appendChild(el('td', null, d.days + '일'));
      tr.appendChild(el('td', null, d.totalGb.toLocaleString('en-US', fmt) + ' GB'));
      tr.appendChild(el('td', null, d.perBrokerGb.toLocaleString('en-US', fmt) + ' GB'));
      tr.appendChild(el('td', null, d.percent + '%'));
      const fitCell = el('td');
      const over = d.percent > 100;
      const status = el('span', 'plc-status', over ? '× 안 들어감' : '들어감');
      status.dataset.tone = over ? 'break' : 'mild';
      fitCell.appendChild(status);
      tr.appendChild(fitCell);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  // 되감아도 저절로 복구되지 않는다 — M.CATCHUP 두 점을 한 문단으로.
  // 공식으로 다시 계산하지 않고 두 점의 값을 그대로 문장에 끼운다.
  function buildCatchupNote() {
    const c0 = M.CATCHUP[0], c1 = M.CATCHUP[1];
    $('plc-catchup-note').textContent =
      '보존 창 안이라고 저절로 복구되지는 않습니다. 밀린 것을 읽는 동안에도 새 줄은 초당 ' +
      CD.val.perSecImp.toLocaleString('en-US') + '건씩 들어옵니다. 모델 학습을 ' + c0.consumers +
      '명이 맡으면 ' + c0.backlogDays + '일치를 따라잡는 데 ' + c0.days + '일이 걸리고, ' +
      c1.consumers + '명까지 늘리면 ' + c1.days + '일로 줄어듭니다. 사람을 늘리는 데도 한계는 있습니다.';
  }

  // 슬라이더가 움직일 때마다 표시값·디스크 표 강조·판정 문장을 다시 그린다.
  // 판정은 [학습을 N일 멈췄다] 가 켜져 있을 때만 M.retentionVerdict 를 부른다 —
  // 꺼져 있으면 아직 멈춘 적이 없다는 뜻이라 판정할 것이 없다.
  function drawRetention() {
    const days = Number($('plc-retention').value);
    $('plc-retention-value').textContent = days;
    highlightDiskRow(days);

    const verdictEl = $('plc-verdict');
    if (!retentionPaused) {
      verdictEl.textContent = '학습을 멈춰 보면 나옵니다.';
      verdictEl.dataset.tone = 'idle';
      return;
    }
    const v = M.retentionVerdict(days, PAUSE_DAYS);
    verdictEl.dataset.tone = v.safe ? 'good' : 'bad';
    verdictEl.textContent = v.safe
      ? '보존 ' + days + '일이면 ' + PAUSE_DAYS + '일 멈춰도 그대로 있습니다.'
      : '보존 ' + days + '일로는 부족합니다. 앞 ' + v.lostDays + '일치가 이미 지워졌습니다.';
  }

  function bindRetention() {
    $('plc-retention').addEventListener('input', drawRetention);
    $('plc-pause').addEventListener('click', function () {
      retentionPaused = !retentionPaused;
      $('plc-pause').setAttribute('aria-pressed', String(retentionPaused));
      drawRetention();
    });
  }

  buildRetentionAnswer();
  buildDiskTable();
  buildCatchupNote();
  $('plc-pause').textContent = '학습을 ' + PAUSE_DAYS + '일 멈췄다';
  bindRetention();
  drawRetention();

  // ==========================================
  // 6절 — 그 주기를 지키려면 무엇이 필요한가 (수단과 비용)
  // ==========================================

  // 읽는 쪽 넷을 표로 — 이름·주기·읽는 모양·제품·저장소 다섯 칸 다
  // CD.CONSUMERS 에 이미 있는 필드를 그대로 옮긴다.
  function buildToolsTable() {
    const table = $('plc-tools-table');
    theadRow(table, ['읽는 쪽', '주기', '어떻게 읽나', '흔히 쓰는 제품', '어디에 쌓나']);
    const tbody = el('tbody');
    CD.CONSUMERS.forEach(function (c) {
      const tr = el('tr');
      [c.name, c.deadline, c.how, c.product, c.store].forEach(function (t) {
        tr.appendChild(el('td', null, t));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  // 비용이 갈리는 축 — 잡이 몇 시간 떠 있나. stream 의 jobHours(24) 와
  // batch 의 dawnMinutes(20) 를 대비한다. 둘 다 model.js 에 구조 상수로
  // 주석이 달려 있다 — post 가 잰 시간이 아니라 "상시로 떠 있어야 하는 것"
  // 대 "하루 한 번 잠깐 도는 것"의 성격을 보여 주는 예시 값이다.
  function buildCostAxis() {
    const stream = M.READ_MODES.filter(function (m) { return m.key === 'stream'; })[0];
    const batch = M.READ_MODES.filter(function (m) { return m.key === 'batch'; })[0];
    const dash = reader('dash');
    const host = $('plc-cost-axis');
    host.appendChild(el('strong', null, '비용이 갈리는 축은 「잡이 몇 시간 떠 있나」입니다.'));
    host.appendChild(document.createTextNode(
      ' ' + dash.deadline + '를 고르면 ' + stream.jobHours + '시간 도는 잡과 그것을 받칠 서버가 항상 ' +
      '필요합니다. 다음 날이면 새벽에 ' + batch.dawnMinutes + '분만 돌면 됩니다.'
    ));
  }

  // 목적지 여섯 표 — data-distribution-layer 1절. CD.DESTINATIONS 를 그대로 옮긴다.
  function buildDestinations() {
    const table = $('plc-destinations');
    theadRow(table, ['목적지', '무엇을 위해', '포맷', '쓰기 방식', '재시도']);
    const tbody = el('tbody');
    CD.DESTINATIONS.forEach(function (d) {
      const tr = el('tr');
      [d.name, d.purpose, d.format, d.write, d.retry].forEach(function (t) {
        tr.appendChild(el('td', null, t));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  // 재시도 횟수도 마감이 정한 값이다 — dash.deadline 을 그대로 문장에 끼운다.
  function buildRetryNote() {
    const dash = reader('dash');
    $('plc-retry-note').textContent =
      '재시도 횟수도 마감이 정한 값입니다. ' + dash.name + '는 ' + dash.deadline +
      ' 안에 못 쓰면 포기하고, 다른 팀 Kafka 는 마감이 없어 될 때까지 재시도합니다.';
  }

  // ML 엔지니어에게 중요한 함정으로 절을 닫는다 — 늦게 온 로그 때문에
  // 실시간 쪽과 배치 쪽 숫자가 다른 것은 정상이라는 것.
  function buildMlTrap() {
    $('plc-ml-trap').textContent =
      '실시간 쪽 숫자와 배치 쪽 숫자가 안 맞는 것이 정상입니다. 늦게 온 로그 때문입니다. ' +
      '대시보드 CTR 과 학습 데이터 CTR 이 다른 이유가 이것입니다.';
  }

  buildToolsTable();
  buildCostAxis();
  buildDestinations();
  buildRetryNote();
  buildMlTrap();
})();
