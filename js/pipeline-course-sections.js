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
// Task 10~12(4~7절)는 이 파일 끝에 같은 모양으로 절을 이어 붙인다 —
// 절마다 (상태 → 그리기/짓기 → 바인딩) 한 묶음이면 된다. 공용 rail 을
// 다시 그릴 필요가 있는 절이 생기면 그때는 window.PipelineCourseModel
// 수준으로 인터페이스를 하나 더 뽑아야 한다.
// ===================================================================
(function () {
  'use strict';

  const M = window.PipelineCourseModel;
  const CD = window.CourseData;
  const $ = (id) => document.getElementById(id);

  // ------------------------------------------------------------------
  // 한글 조사 — 완성형 한글의 마지막 글자에 받침이 있는지로 이/가, 은/는,
  // 와/과 를 고른다. 읽는 쪽 이름을 그때그때 문장에 끼워 넣어야 해서
  // (예: "예산 소진 확인이" vs "실시간 대시보드가") 고정 조사 하나로는
  // 넷 다 자연스럽게 못 쓴다. 라틴 문자(Kafka)는 이 저장소 관행대로
  // 조사 앞에 띄어쓰기를 둬 별도로 쓴다(범위 밖이면 이 함수는 안 쓴다).
  // ------------------------------------------------------------------
  function hasBatchim(w) {
    const c = w.charCodeAt(w.length - 1);
    if (c < 0xAC00 || c > 0xD7A3) return false;
    return (c - 0xAC00) % 28 !== 0;
  }
  function iGa(w) { return hasBatchim(w) ? '이' : '가'; }
  function eunNeun(w) { return hasBatchim(w) ? '은' : '는'; }
  function waGwa(w) { return hasBatchim(w) ? '과' : '와'; }

  function reader(key) {
    return CD.CONSUMERS.filter(function (c) { return c.key === key; })[0];
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
})();
