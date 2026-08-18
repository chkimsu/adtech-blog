// ===================================================================
// 파이프라인 코스 2페이지 — 5~7절 위젯
//   js/pipeline-course-sections2.js
//
// 이 파일이 담는 절 — 5절(기다렸다 가져가도 되나, 보존·되감기), 6절(그
// 주기를 지키려면 무엇이 필요한가, 수단·비용), 7절(내 학습 데이터는 여기서
// 나온다, req_id 조인). 3~4절은 js/pipeline-course-sections.js 에 있다.
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
// Task 12 가 7절을 이 파일에 이어 붙였다 — 세 번째 파일(sections3.js)을
// 새로 만들지 않는다. 이 파일이 600줄 언저리에서 끝나 굳이 또 가를 이유가
// 없었다.
// ===================================================================
(function () {
  'use strict';

  // 공용 DOM 조각 — js/course-dom.js. 넷이 같은 것을 각자 들고 있던 것을 모았다.
  const el = window.CourseDom.el;
  const theadRow = window.CourseDom.theadRow;
  const buildSimpleTable = window.CourseDom.buildSimpleTable;

  const M = window.PipelineCourseModel;
  const CD = window.CourseData;
  const $ = (id) => document.getElementById(id);

  function reader(key) {
    return CD.CONSUMERS.filter(function (c) { return c.key === key; })[0];
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
    theadRow(table, ['보존', '합계', '브로커 한 대', '디스크 ' + M.DISK_CAPACITY_GB + 'GB 대비', '들어가나']);
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
  // HTML 의 value="7" 은 정적 속성이라 retentionDays 가 바뀌면 옆 문장과
  // 갈린다. 첫 draw 전에 CourseData 값으로 맞춰 둔다.
  $('plc-retention').value = CD.val.retentionDays;
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

  // ==========================================
  // 7절 — 내 학습 데이터는 여기서 나옵니다 (req_id 조인)
  // ==========================================

  // 창 2택 상태 — 기본은 실제 답(3시간, CD.val.joinHours). 표본 조인 표와
  // 아래 트레이드오프 노트가 둘 다 이 상태를 본다.
  let joinWindowHours = CD.val.joinHours;

  function buildJoinLead() {
    $('plc-join-lead').textContent =
      '노출은 여섯 줄이 있고 그중 req_id 가 클릭과 같은 한 줄에만 y=1 이 붙습니다. ' +
      '나머지 다섯은 y=0 인 채로 남습니다. 표본은 붙이는 방법만 보여 줍니다.';
  }

  // M.joinRows() 의 결과(rows)를 그대로 표로 그린다. 붙은 행(y=1)은 다른
  // 절의 "지금 고른 행"과 같은 관행으로 갈린다 — .plc-join tr.is-joined.
  function drawJoinTable() {
    const table = $('plc-join');
    table.innerHTML = '';
    theadRow(table, ['req_id', 'y (라벨)']);
    const tbody = el('tbody');
    M.joinRows(joinWindowHours).rows.forEach(function (r) {
      const tr = el('tr');
      if (r.y === 1) tr.className = 'is-joined';
      tr.appendChild(el('td', null, r.req_id));
      tr.appendChild(el('td', null, String(r.y)));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  // 창 2택 버튼 — 3시간(실제 답, CD.val.joinHours)과 24시간(비교,
  // CD.val.joinWindowAlt). 라벨의 숫자도 손으로 안 적고 CourseData 에서 가져온다.
  function buildWindowBtns() {
    const host = $('plc-window');
    [CD.val.joinHours, CD.val.joinWindowAlt].forEach(function (hours) {
      const b = el('button', 'btn-try plc-window-btn', hours + '시간');
      b.type = 'button';
      b.dataset.hours = String(hours);
      b.setAttribute('aria-pressed', 'false');
      host.appendChild(b);
    });
  }

  // 24시간을 고르면 표본이 아니라 실제 하루 규모의 트레이드오프(11,400건 ·
  // 228만의 0.5% · 학습 데이터 확정 지연 21시간)를 보여 준다. 표본 조인
  // 표는 두 창 다 그대로 1건일 수 있다(표본이 작아서) — 그래서 이 노트가
  // 표본과 별도로, 실제 값만 갖고 설명한다.
  function drawWindowNote() {
    Array.prototype.forEach.call($('plc-window').querySelectorAll('.plc-window-btn'), function (b) {
      b.setAttribute('aria-pressed', String(Number(b.dataset.hours) === joinWindowHours));
    });
    const note = $('plc-window-note');
    if (joinWindowHours === CD.val.joinWindowAlt) {
      note.textContent =
        '창을 ' + CD.val.joinWindowAlt + '시간으로 늘리면 ' + CD.val.joinAltCatch.toLocaleString('en-US') +
        '건을 더 건지는데 ' + CD.val.ctrClicks + '의 ' + CD.val.joinAltPct + ' 이고, 그 ' + CD.val.joinAltPct +
        '를 사려고 학습 데이터 확정이 ' + CD.val.joinAltDelayHours + '시간 늦어집니다.';
    } else {
      note.textContent = '지금 창은 ' + CD.val.joinHours + '시간입니다. 우리 답이 이 창입니다.';
    }
  }

  function bindWindowBtns() {
    $('plc-window').addEventListener('click', function (e) {
      const b = e.target.closest('.plc-window-btn');
      if (!b) return;
      joinWindowHours = Number(b.dataset.hours);
      drawJoinTable();
      drawWindowNote();
    });
  }

  // 실물 두 줄 — 노출과 라벨. 손으로 짜맞추지 않고 CD.val 을 그대로 찍는다.
  function buildRealLines() {
    $('plc-imp-line').textContent = CD.val.impLine;
    $('plc-label-line').textContent = CD.val.labelLine;
  }

  // 실제 비율 — 표본과 절대 같은 문장에 두지 않는다. 표본 일곱 줄로는
  // 1.00% 를 만들 수 없으니 이 문장은 표본 얘기를 하지 않고 실제 값만 말한다.
  function buildCtrReal() {
    $('plc-ctr-real').textContent =
      '표본 여섯 줄로는 비율을 못 만듭니다. 실제 비율은 하루치로 재야 나오고 그 값이 ' +
      CD.val.ctr + '입니다 (' + CD.val.ctrClicks + ' 나누기 ' + CD.val.ctrImpressions + ').';
  }

  // 닫는 문장 셋. 둘째 항목만 DOM 으로 직접 지어 1페이지로 가는 링크를
  // 문장 안에 끼운다(js/pipeline-course-sections.js 의 buildTwoPaths 링크
  // 문단과 같은 모양) — req_id 를 1페이지에서 빼먹으면 여기서 라벨이 안
  // 붙는다는 것이 이 두 장을 잇는 핵심 연결고리다.
  function buildClosing() {
    const host = $('plc-closing');
    host.appendChild(el('li', null, '라벨이 늦게 옵니다. 전환은 며칠 뒤입니다.'));

    const li2 = el('li');
    li2.appendChild(document.createTextNode('붙이는 열쇠가 '));
    li2.appendChild(el('code', null, 'req_id'));
    li2.appendChild(document.createTextNode('입니다. 1페이지에서 그 필드를 빼먹으면 여기서 라벨이 안 붙습니다 — '));
    const link = document.createElement('a');
    link.href = 'demo-api-course.html#apc-sec1';
    link.textContent = '1페이지 1절';
    li2.appendChild(link);
    li2.appendChild(document.createTextNode('에서 다시 봅니다.'));
    host.appendChild(li2);

    host.appendChild(el('li', null, '대시보드 숫자와 내 학습 데이터 숫자가 다릅니다.'));
  }

  buildJoinLead();
  buildWindowBtns();
  drawJoinTable();
  drawWindowNote();
  bindWindowBtns();
  buildRealLines();
  buildCtrReal();
  buildClosing();
})();
