// ===================================================================
// 코스 두 장이 같이 쓰는 DOM 조각
//   js/course-dom.js
//
// 화면 파일 넷이 각자 들고 있던 것을 한 곳으로 모은 것이다.
//   el()              — 네 벌이 글자 하나까지 같았다
//   buildSimpleTable() — 두 벌. 하나만 rows 를 방어하고 있어 그쪽으로 통일했다
//   theadRow()         — 두 벌이 같았다
//
// 화면 파일보다 먼저 읽혀야 한다. 두 페이지의 <script> 순서를 보라.
//
// 여기 색을 넣지 말 것. scripts/check-design.js 는 .js 를 안 본다 —
// 상태는 CSS 클래스와 data-* 로만 표시한다.
// ===================================================================
(function (root) {
  'use strict';

  // el('td', 'plc-x', '글자') — 셋 다 선택이다
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  // 머리글만 붙인다. 몸통을 손으로 만드는 자리(행마다 이벤트나 data-* 가
  // 붙는 표)가 이것을 쓴다.
  function theadRow(host, labels) {
    const thead = el('thead');
    const tr = el('tr');
    labels.forEach(function (t) { tr.appendChild(el('th', null, t)); });
    thead.appendChild(tr);
    host.appendChild(thead);
  }

  // 머리글과 몸통을 한 번에. 셀 값이 DOM 노드면 그대로 넣고 아니면 글자로 넣는다
  // — 칩이나 링크가 든 칸과 맨 글자 칸을 같은 호출로 처리하려는 것이다.
  // rows 를 안 넘기면 몸통을 비워 둔다(나중에 그리는 표가 그렇게 쓴다).
  // host 는 <table> 노드도 되고 그 id 문자열도 된다. 부르는 자리가 두 가지
  // 방식으로 이미 흩어져 있어, 호출부를 바꾸는 대신 여기서 받아 준다.
  function buildSimpleTable(host, headers, rows) {
    if (typeof host === 'string') host = document.getElementById(host);
    theadRow(host, headers);
    const tbody = el('tbody');
    (rows || []).forEach(function (cells) {
      const tr = el('tr');
      cells.forEach(function (c) {
        const td = el('td');
        if (c && c.nodeType) td.appendChild(c); else td.textContent = c;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    host.appendChild(tbody);
  }

  root.CourseDom = { el: el, theadRow: theadRow, buildSimpleTable: buildSimpleTable };
})(typeof self !== 'undefined' ? self : globalThis);
