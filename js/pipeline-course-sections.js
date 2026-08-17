// ===================================================================
// 파이프라인 코스 2페이지 — 3절 이후의 절 위젯
//   js/pipeline-course-sections.js
//
// js/pipeline-course-demo.js 는 rail·detail·1~2절을 이미 갖고 있고 434줄
// 이었다. 3절부터는 여기로 새로 짓는다 — 절마다 rail 의 stopIndex 나
// 1~2절 스위치와 상태를 주고받을 일이 없어서(각자 완결된 위젯이라) 굳이
// 같은 클로저에 있을 필요가 없기 때문이다. 이 파일은 window.CourseData 와
// window.PipelineCourseModel 만 읽고, 자기 절의 DOM 만 건드린다.
//
// Task 10 이 4절을 같은 모양(상태 → 그리기/짓기 → 바인딩)으로 이어 붙였다.
// Task 11~12(5~7절)도 같은 자리에 같은 모양으로 잇는다 — 공용 rail 을 다시
// 그릴 필요가 있는 절이 생기면 그때는 window.PipelineCourseModel 수준으로
// 인터페이스를 하나 더 뽑아야 한다. 이 파일이 600줄에 가까워지면(지금
// 4절까지 포함해 488줄) 3절/4절 경계에서 두 번째 파일로 나눈다 — 두 절
// 다 rail 과 상태를 안 주고받는 완결된 위젯이라 가르기 쉽다.
// ===================================================================
(function () {
  'use strict';

  const M = window.PipelineCourseModel;
  const CD = window.CourseData;
  const $ = (id) => document.getElementById(id);

  // 한글 조사(이/가·은/는·와/과)는 Task 10 에서 js/pipeline-course-model.js 로
  // 옮겼다 — 완성형 받침 판정이 진짜 로직이라 시험이 필요했는데, 이 파일은
  // 브라우저 전용 IIFE라 require() 가 안 됐다. M 이 이미 그 함수들을 갖고 있다.
  const iGa = M.iGa, eunNeun = M.eunNeun, waGwa = M.waGwa;

  function reader(key) {
    return CD.CONSUMERS.filter(function (c) { return c.key === key; })[0];
  }

  // 작은 DOM 빌더 — js/pipeline-course-demo.js 의 el() 과 같은 모양이지만
  // 그 파일의 지역 함수라 여기서 못 부른다(이 파일은 window.* 만 본다).
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  // ==========================================
  // 3절 — Kafka 로 모으는 이유
  // ==========================================

  // ---- 상태 ----
  let noKafkaOn = false;     // [Kafka 빼기] 스위치
  let deadReaderKey = null;  // 죽인 읽는 쪽 key, 없으면 null

  // ---- 그림 좌표 — 고정 캔버스 하나를 상태에 따라 매번 새로 그린다.
  // .plc-scroll 안에 있어 375px 에서도 페이지 자체는 안 밀리고 그림만
  // 제 상자 안에서 가로로 스크롤된다. ----
  const FO_W = 740, FO_H = 250, FO_CY = 125;
  const FO_SRC = { x: 8, y: 104, w: 150, h: 42 };
  const FO_HUB = { x: 268, y: 104, w: 110, h: 42 };
  const FO_READ_X = 520, FO_READ_W = 190, FO_READ_H = 44, FO_READ_GAP = 12;
  const FO_READ_TOP = FO_CY -
    (CD.CONSUMERS.length * FO_READ_H + (CD.CONSUMERS.length - 1) * FO_READ_GAP) / 2;

  function foReaderBox(i) {
    const y = FO_READ_TOP + i * (FO_READ_H + FO_READ_GAP);
    return { x: FO_READ_X, y: y, w: FO_READ_W, h: FO_READ_H, cy: y + FO_READ_H / 2 };
  }

  // 상자 하나 — rect 는 늘 불투명(var(--bg-secondary))이라 선의 끝이 상자
  // 밑에서 가려진다. 문제는 상자가 아니라 선 위에 홀로 뜬 배지 쪽이다(아래).
  function foBoxSVG(b, cls, lines) {
    let s = '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h +
      '" class="' + cls + '"/>';
    const cx = b.x + b.w / 2;
    const top = b.y + b.h / 2 - (lines.length - 1) * 8;
    lines.forEach(function (ln, i) {
      if (!ln.t) return;
      s += '<text x="' + cx + '" y="' + (top + i * 16 + 4) + '" text-anchor="middle" class="' +
        ln.cls + '">' + ln.t + '</text>';
    });
    return s;
  }

  function foLineSVG(x1, y1, x2, y2, dead) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
      '" class="plc-fo-line' + (dead ? ' is-dead' : '') +
      '" marker-end="url(#plc3-arr' + (dead ? '-dead' : '') + ')"/>';
  }

  // 선 개수 배지("1개"·"4개") — 선 위에 떠 있는 글자라 배경을 글자 폭만큼만
  // 깐다(고정 폭 32×18 — 이 배지에는 늘 숫자 한 자리 + "개" 두 글자만 온다).
  // 줄 전체에 배경을 깔지 않는 이유는 이 페이지 CSS 주석과 같다 — 그러면
  // 그 높이에서 선이 끊긴 것처럼 보인다.
  function foBadgeSVG(cx, cy, text) {
    const w = 32, h = 18;
    return '<rect x="' + (cx - w / 2) + '" y="' + (cy - h / 2) + '" width="' + w +
      '" height="' + h + '" class="plc-fo-badge-bg"/><text x="' + cx + '" y="' + (cy + 4) +
      '" text-anchor="middle" class="plc-fo-badge-text">' + text + '</text>';
  }

  function fanoutSVG() {
    const srcHop = M.HOPS.filter(function (h) { return h.key === 'logstash'; })[0];
    const kafkaHop = M.HOPS.filter(function (h) { return h.key === 'kafka'; })[0];
    const srcLines = srcHop.name.split(' '); // "변환기 (Logstash)" → ["변환기","(Logstash)"]
    const readers = CD.CONSUMERS;
    const n = readers.length; // 늘 4 — 읽는 쪽 배열 길이에서 그대로 온다. 손으로 안 박는다.

    // Kafka 없이 하나가 죽으면 변환기까지 번진다 — Kafka 가 있으면 안 번진다(3절의 요점).
    const srcHit = !!(noKafkaOn && deadReaderKey);
    const srcSub = srcHit
      ? CD.DEPLOY_STACKED_ROWS.toLocaleString('en-US') + '줄 쌓이는 중'
      : (srcLines[1] || '');

    let lines = '', boxes = '', badges = '';
    const srcRight = FO_SRC.x + FO_SRC.w;

    if (noKafkaOn) {
      readers.forEach(function (c, i) {
        const rb = foReaderBox(i);
        lines += foLineSVG(srcRight, FO_CY, rb.x, rb.cy, c.key === deadReaderKey);
      });
      badges += foBadgeSVG(srcRight + 28, FO_CY, n + '개');
    } else {
      lines += foLineSVG(srcRight, FO_CY, FO_HUB.x, FO_CY, false);
      // "1개" — 변환기가 Kafka 하나에만 쓰는 구조 자체를 말한다. CONSUMERS 처럼
      // 셀 배열이 없는 구조적 사실이라 여기만 직접 적는다(보고서에도 밝힌다).
      badges += foBadgeSVG((srcRight + FO_HUB.x) / 2, FO_CY, '1개');
      readers.forEach(function (c, i) {
        const rb = foReaderBox(i);
        lines += foLineSVG(FO_HUB.x + FO_HUB.w, FO_CY, rb.x, rb.cy, c.key === deadReaderKey);
      });
      badges += foBadgeSVG(FO_HUB.x + FO_HUB.w + 28, FO_CY, n + '개');
    }

    boxes += foBoxSVG(FO_SRC, 'plc-fo-box' + (srcHit ? ' is-bad' : ''), [
      { t: srcLines[0], cls: 'plc-fo-name' + (srcHit ? ' is-bad' : '') },
      { t: srcSub, cls: 'plc-fo-sub' + (srcHit ? ' is-bad' : '') },
    ]);

    if (!noKafkaOn) {
      boxes += foBoxSVG(FO_HUB, 'plc-fo-box is-hub', [{ t: kafkaHop.name, cls: 'plc-fo-name' }]);
    }

    readers.forEach(function (c, i) {
      const rb = foReaderBox(i);
      const dead = c.key === deadReaderKey;
      const aria = c.name + ', 마감 ' + c.deadline +
        (dead ? ', 지금 멈춰 있습니다. 눌러서 되살립니다.' : ', 눌러서 멈춰 봅니다.');
      boxes += '<g class="plc-fo-reader" data-reader="' + c.key + '" tabindex="0" role="button" ' +
        'aria-pressed="' + dead + '" aria-label="' + aria + '">' +
        foBoxSVG(rb, 'plc-fo-box' + (dead ? ' is-bad' : ''), [
          { t: (dead ? '× ' : '') + c.name, cls: 'plc-fo-name' + (dead ? ' is-bad' : '') },
          { t: c.deadline, cls: 'plc-fo-sub' + (dead ? ' is-bad' : '') },
        ]) + '</g>';
    });

    const state = 'Kafka ' + (noKafkaOn ? '없음' : '있음') + ' — 변환기에서 나가는 선 ' +
      (noKafkaOn ? n : 1) + '개';

    return '<svg class="plc-fanout-svg" viewBox="0 0 ' + FO_W + ' ' + FO_H + '" width="' + FO_W +
      '" height="' + FO_H + '" role="group" aria-label="' + state + '">' +
      '<defs>' +
      '<marker id="plc3-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto">' +
      '<path d="M0,0 L7.5,3 L0,6 Z" class="plc-fo-arrow"/></marker>' +
      '<marker id="plc3-arr-dead" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto">' +
      '<path d="M0,0 L7.5,3 L0,6 Z" class="plc-fo-arrow-dead"/></marker>' +
      '</defs>' + lines + boxes + badges + '</svg>';
  }

  function drawFanoutKillNote() {
    const note = $('plc-fanout-kill-note');
    if (!deadReaderKey) { note.textContent = ''; return; }
    const dead = reader(deadReaderKey);
    note.textContent = noKafkaOn
      ? dead.name + iGa(dead.name) + ' 멈추자 변환기까지 영향이 번졌습니다. ' + CD.val.deploySeconds +
        '초 배포 상황이면 ' + CD.DEPLOY_STACKED_ROWS.toLocaleString('en-US') + '줄이 쌓입니다.'
      : dead.name + '만 멈췄습니다. 변환기와 Kafka 는 영향이 없습니다.';
  }

  function drawFanout() {
    $('plc-fanout').innerHTML = fanoutSVG();
    drawFanoutKillNote();
    $('plc-nokafka').setAttribute('aria-pressed', String(noKafkaOn));
  }

  // Kafka 없이 하면 생기는 문제 셋 — kafka-log-pipeline.md 1절 그대로.
  function buildFanoutReasons() {
    const host = $('plc-fanout-reasons');
    const report = reader('report').name;
    const dash = reader('dash').name;
    [
      '보내는 쪽이 받는 쪽 넷을 다 알아야 합니다. 새 소비자가 생기면 보내는 쪽 코드를 고칩니다.',
      '한 곳이 죽으면 보내는 쪽이 멈추거나 메모리에 쌓입니다. ' + CD.val.deploySeconds + '초 배포에 ' +
        CD.DEPLOY_STACKED_ROWS.toLocaleString('en-US') + '줄이 쌓입니다.',
      '버릴지 말지의 답이 받는 쪽마다 다릅니다. ' + report + eunNeun(report) + ' 한 건도 버리면 안 되고 ' +
        dash + eunNeun(dash) + ' 버려도 됩니다. 그래서 코드가 네 벌 필요합니다.',
    ].forEach(function (text) {
      const li = document.createElement('li');
      li.textContent = text;
      host.appendChild(li);
    });
  }

  // 두 번째 이유 — 읽는 속도가 서로 달라도 된다. dash·train 의 마감을 CONSUMERS 에서
  // 그대로 가져온다(2초·다음 날 새벽을 여기서 다시 안 적는다).
  function buildFanoutSpeed() {
    const dash = reader('dash');
    const train = reader('train');
    $('plc-fanout-speed').textContent =
      '이유가 하나 더 있습니다. 읽는 속도가 서로 달라도 됩니다. ' + dash.name + '의 ' + dash.deadline +
      waGwa(dash.deadline) + ' ' + train.name + '의 ' + train.deadline + iGa(train.deadline) + ' ' +
      CD.val.topicClick + ' 위에 함께 있습니다. 받는 쪽을 직접 부르면 이렇게 서로 다른 속도로 읽어 가는 것은 어렵습니다.';
  }

  function activateReader(g) {
    const key = g.getAttribute('data-reader');
    deadReaderKey = (deadReaderKey === key) ? null : key;
    drawFanout();
  }

  function bindNoKafka() {
    $('plc-nokafka').addEventListener('click', function () {
      noKafkaOn = !noKafkaOn;
      deadReaderKey = null; // 스위치를 바꿀 때마다 깨끗하게 시작한다
      drawFanout();
    });
  }

  function bindFanoutKill() {
    const host = $('plc-fanout');
    host.addEventListener('click', function (e) {
      const g = e.target.closest('[data-reader]');
      if (g) activateReader(g);
    });
    host.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const g = e.target.closest('[data-reader]');
      if (g) { e.preventDefault(); activateReader(g); }
    });
  }

  buildFanoutReasons();
  buildFanoutSpeed();
  bindNoKafka();
  bindFanoutKill();
  drawFanout();

  // ==========================================
  // 4절 — topic 에 놓인 뒤 누가 언제 읽어 가나
  // ==========================================

  // 읽는 빈도 순서 — stream 이 가장 잦고 batch 가 가장 뜸하다. 4-2 에서
  // 방식을 눌러 보는 미리보기가 "그 방식이 지금 방식보다 잦은지 뜸한지"만
  // 알면 되므로, 그 판단에 필요한 순서만 여기서 정한다.
  const MODE_RANK = { stream: 0, micro: 1, batch: 2 };

  // ---- 상태 ----
  // head — 지금 topic 의 끝. [시간 흐르기] 마다 하나씩 는다.
  // STRIP_LEFT_PAD·STRIP_RIGHT_PAD — 왼쪽은 고정, r-8f21(V.offsetOf)이 20칸
  // 중 8번째에 오도록 7칸 앞에서 시작한다. 오른쪽은 처음에 12칸을 더
  // 보여줘서(8,405~8,424, 스펙 5.2 4절의 그 20칸) 첫 몇 번의 [시간 흐르기]가
  // 미리 그려 둔 빈 칸을 채우는 것으로 보이게 하고, head 가 그 여유를
  // 넘어서면 그때부터 줄이 실제로 길어진다 — r-8f21 칸은 왼쪽에 고정이라
  // 오른쪽이 아무리 늘어도 지워지지 않는다.
  const STRIP_LEFT_PAD = 7;
  const STRIP_RIGHT_PAD = 12;
  const STRIP_START = CD.val.offsetOf - STRIP_LEFT_PAD;

  let head = CD.val.offsetOf;
  let stripEnd = head + STRIP_RIGHT_PAD;
  let topicCursors = M.initialCursors();
  let activeReaderKey = CD.CONSUMERS[0].key;  // #plc-why 에서 굵게 볼 대상
  let activeModeKey = null;                   // #plc-modes 에서 미리 보는 방식. null = 실제 방식

  // 그 소비자의 실제 mode 와 지금 고른 방식이 다를 때만 가상의 「늦으면」을
  // 만든다 — 고른 쪽이 실제보다 뜸하면(랭크가 크면) late(실제로 늦었을 때
  // 잃는 것)를, 고른 쪽이 더 잦으면(랭크가 작으면) faster(더 빨리 해도
  // 소용없는 이유)를 그대로 재사용한다. 새 문장을 짓지 않고 CONSUMERS 에
  // 이미 있는 두 필드만 고쳐 보여 준다 — 조합마다 새 판단을 지어내지 않는다.
  function lateFor(c) {
    if (c.key !== activeReaderKey || activeModeKey === null || activeModeKey === c.mode) {
      return c.late;
    }
    return MODE_RANK[activeModeKey] > MODE_RANK[c.mode] ? c.late : c.faster;
  }

  function drawTopicStrip() {
    const host = $('plc-topic-strip');
    host.innerHTML = '';
    for (let o = STRIP_START; o <= stripEnd; o++) {
      const written = o <= head;
      const isTarget = o === CD.val.offsetOf;
      const cell = el('div', 'plc-topic-cell' + (written ? '' : ' is-pending') + (isTarget ? ' is-target' : ''));
      if (written) {
        cell.appendChild(document.createTextNode(o.toLocaleString('en-US')));
        if (isTarget) cell.appendChild(el('span', 'plc-topic-tag', CD.val.reqId));
      }
      host.appendChild(cell);
    }
  }

  function theadRow(host, labels) {
    const thead = el('thead');
    const tr = el('tr');
    labels.forEach(function (t) { tr.appendChild(el('th', null, t)); });
    thead.appendChild(tr);
    host.appendChild(thead);
  }

  // 커서 넷 — "몇 번까지 읽었나"(offset)와 "밀린 정도"(head 와의 차)만
  // 기억한다는 4절의 개념을 그대로 표로 옮긴 것. 행을 누르면 그 소비자가
  // #plc-why 에서 굵어진다.
  function drawCursorTable() {
    const table = $('plc-cursor-table');
    table.innerHTML = '';
    theadRow(table, ['읽는 쪽', '지금 읽은 곳', '밀린 정도']);
    const tbody = el('tbody');
    topicCursors.forEach(function (c) {
      const r = reader(c.key);
      const behind = head - c.offset;
      const tr = el('tr', 'plc-cursor-row');
      tr.dataset.reader = c.key;
      tr.tabIndex = 0;
      tr.setAttribute('role', 'button');
      tr.setAttribute('aria-current', String(c.key === activeReaderKey));
      tr.setAttribute('aria-label', r.name + ', 지금 읽은 곳 ' + c.offset.toLocaleString('en-US') +
        ', 밀린 정도 ' + behind.toLocaleString('en-US') + '건. 눌러서 이유를 봅니다.');
      tr.appendChild(el('td', null, r.name));
      tr.appendChild(el('td', null, c.offset.toLocaleString('en-US')));
      tr.appendChild(el('td', null, behind.toLocaleString('en-US') + '건'));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  // 4-1 — 왜 그 주기라야 하나. CONSUMERS 의 why·late·faster 세 칸을 그대로
  // 옮기고, 지금 굵게 볼 행(activeReaderKey)의 late 칸만 lateFor() 가 고른다.
  function drawWhyTable() {
    const table = $('plc-why');
    table.innerHTML = '';
    theadRow(table, ['읽는 쪽', '주기', '왜 그 주기라야 하나', '늦으면', '더 빨리 하면']);
    const tbody = el('tbody');
    CD.CONSUMERS.forEach(function (c) {
      const tr = el('tr');
      if (c.key === activeReaderKey) tr.className = 'is-active';
      [c.name, c.deadline, c.why, lateFor(c), c.faster].forEach(function (t) {
        tr.appendChild(el('td', null, t));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  // 4-2 — 읽는 방식은 셋. 행을 누르면 activeModeKey 가 바뀌고 drawWhyTable()
  // 이 그 미리보기를 반영한다.
  function drawModesTable() {
    const table = $('plc-modes');
    table.innerHTML = '';
    theadRow(table, ['방식', '어떻게', '누가', '잡이 도는 시간']);
    const tbody = el('tbody');
    M.READ_MODES.forEach(function (m) {
      const tr = el('tr', 'plc-mode-row');
      tr.dataset.mode = m.key;
      tr.tabIndex = 0;
      tr.setAttribute('role', 'button');
      tr.setAttribute('aria-current', String(m.key === activeModeKey));
      tr.setAttribute('aria-label', m.name + ' 방식. 눌러서 「늦으면」 칸에 미리 봅니다.');
      tr.appendChild(el('td', null, m.name));
      tr.appendChild(el('td', null, m.how));
      tr.appendChild(el('td', null, m.who));
      tr.appendChild(el('td', null, m.jobHours != null ? m.jobHours + '시간' : '—'));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  // 4-3 — 같은 클릭이 두 경로로 갑니다. 방식 이름은 손으로 다시 적지 않고
  // M.READ_MODES 에서 그대로 가져온다 — 이름이 바뀌면 여기도 같이 바뀐다.
  function buildTwoPaths() {
    const host = $('plc-twopaths');
    const batchMode = M.READ_MODES.filter(function (m) { return m.key === 'batch'; })[0];
    const streamMode = M.READ_MODES.filter(function (m) { return m.key === 'stream'; })[0];

    const grid = el('div', 'plc-twopaths-grid');

    const trainCard = el('div', 'plc-twopath-card');
    trainCard.appendChild(el('div', 'plc-twopath-head', '→ 학습 데이터'));
    trainCard.appendChild(el('div', 'plc-twopath-body',
      '내 학습 데이터는 「' + batchMode.name + '」에서 나옵니다.'));

    const servingCard = el('div', 'plc-twopath-card');
    servingCard.appendChild(el('div', 'plc-twopath-head', '→ 서빙 피처'));
    servingCard.appendChild(el('div', 'plc-twopath-body',
      '그런데 내 모델이 서빙될 때 쓰는 피처는 「' + streamMode.name + '」에서 나올 수 있습니다 (피처 스토어).'));

    grid.appendChild(trainCard);
    grid.appendChild(servingCard);
    host.appendChild(grid);

    host.appendChild(el('p', 'plc-lead',
      '같은 클릭 한 건이 두 갈래로 갈라져 서로 다른 주기로 흐릅니다. ' +
      '둘이 어긋나면 학습 때 본 값과 서빙 때 보는 값이 달라집니다.'));

    const linkP = el('p', 'plc-lead');
    linkP.appendChild(document.createTextNode('더 읽을거리 — '));
    const link = document.createElement('a');
    link.href = 'post.html?id=feature-store-serving';
    link.textContent = '피처 스토어와 서빙';
    linkP.appendChild(link);
    host.appendChild(linkP);
  }

  function draw4() {
    drawTopicStrip();
    drawCursorTable();
    drawWhyTable();
    drawModesTable();
  }

  function bindCursorTable() {
    const host = $('plc-cursor-table');
    function pick(e) {
      const tr = e.target.closest('.plc-cursor-row');
      if (!tr) return;
      activeReaderKey = tr.dataset.reader;
      drawCursorTable();
      drawWhyTable();
    }
    host.addEventListener('click', pick);
    host.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (!e.target.closest('.plc-cursor-row')) return;
      e.preventDefault();
      pick(e);
    });
  }

  function bindModesTable() {
    const host = $('plc-modes');
    function pick(e) {
      const tr = e.target.closest('.plc-mode-row');
      if (!tr) return;
      activeModeKey = (activeModeKey === tr.dataset.mode) ? null : tr.dataset.mode;
      drawModesTable();
      drawWhyTable();
    }
    host.addEventListener('click', pick);
    host.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (!e.target.closest('.plc-mode-row')) return;
      e.preventDefault();
      pick(e);
    });
  }

  // [시간 흐르기]·[새벽이 왔다]·[처음으로] — 셋 다 head·topicCursors 를
  // 바꾸고 draw4() 를 다시 부른다. [처음으로]는 M.resetTicks() 도 함께
  // 불러야 한다 — 안 그러면 micro 소비자가 "다섯 번째"를 세는 회차가
  // 이전 방문의 것을 이어받아 버튼을 눌러도 안 맞게 움직인다.
  function bindTopicButtons() {
    $('plc-tick').addEventListener('click', function () {
      head += 1;
      if (head > stripEnd) stripEnd = head;
      topicCursors = M.tick(topicCursors, head);
      draw4();
    });

    $('plc-dawn').addEventListener('click', function () {
      topicCursors = topicCursors.map(function (c) {
        return reader(c.key).mode === 'batch' ? { key: c.key, offset: head } : c;
      });
      draw4();
    });

    $('plc-topic-reset').addEventListener('click', function () {
      M.resetTicks();
      head = CD.val.offsetOf;
      stripEnd = head + STRIP_RIGHT_PAD;
      topicCursors = M.initialCursors();
      activeReaderKey = CD.CONSUMERS[0].key;
      activeModeKey = null;
      draw4();
    });
  }

  buildTwoPaths();
  bindCursorTable();
  bindModesTable();
  bindTopicButtons();
  draw4();
})();
