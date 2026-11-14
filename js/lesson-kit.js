/**
 * 과외 데모 공용 틀 — 단계 재생, 탭, 배열, 표, 상태 칸, 범례
 *   js/lesson-kit.js  +  css/lesson-kit.css  (시험: scripts/test-lesson-kit.js)
 *
 * 브라우저에서는 전역 LessonKit, node 에서는 require('../js/lesson-kit.js') 다.
 * parseParams, nextGroupEnd, clamp, particle, treeLayout, arrayTree 는 DOM 을 모른다. 나머지(player, tabs, array, grid, tree, chips, legend)는
 * 브라우저 전용이고 document 를 함수 안에서만 쓴다. 글자는 모두 textContent 로 넣는다.
 *
 * 데모 한 장의 모양 — 각 페이지는 <link rel="stylesheet" href="css/lesson-kit.css"> 와
 * 이 파일을 싣고, 자기 모델(js/lesson-xxx-model.js)과 화면(js/lesson-xxx-demo.js)을 더한다.
 * 화면 상태는 「이벤트를 몇 개까지 보였나」(at) 하나이고, render(at) 가 그때마다 이벤트를 처음부터
 * 다시 쌓아 그린다(js/lesson-bfs-demo.js 와 같은 방식).
 *
 * ---- 페이지 뼈대 (id 와 클래스를 그대로 쓴다) ----
 * <div class="lk-controls">
 *   <div class="lk-toolbar"><div class="lk-tabs" id="lk-tabs" role="group" aria-label="모드"></div>
 *     <label class="lk-preset">입력 <select id="lk-preset"></select></label></div>
 *   <p class="lk-note" id="lk-note"></p>
 *   <div class="lk-actions"><button type="button" id="lk-reset">처음</button><button type="button" id="lk-step">한 칸</button>
 *     <button type="button" id="lk-group">다음 값</button><button type="button" id="lk-end">끝까지</button><span class="lk-count" id="lk-count"></span></div>
 * </div>
 * <div class="lk-stage">
 *   <div class="lk-board-col"><div class="lk-board" id="lk-board"></div><div class="lk-legend" id="lk-legend"></div></div>
 *   <div class="lk-side">
 *     <div class="lk-panel lk-result"><div class="lk-label">결과</div><div class="lk-result-main" id="lk-result-main"></div><div class="lk-result-sub" id="lk-result-sub"></div></div>
 *     <div class="lk-panel lk-now"><div class="lk-label">이번 단계</div><div id="lk-now"></div></div>
 *     <div class="lk-panel lk-state"><div class="lk-label" id="lk-state-label">상태</div><div class="lk-chips" id="lk-state"></div><p class="lk-note" id="lk-state-note"></p></div>
 *   </div>
 * </div>
 *
 * 보드에 배열과 트리를 같이 그리는 데모는 #lk-board 안에 자식 div 둘을 두고 각각에 array 와 tree 를 부른다:
 *   <div class="lk-board" id="lk-board"><div id="<접두>-array"></div><div id="<접두>-tree"></div></div>
 *
 * <head> 첫 줄에는 임베드 표시 스크립트를 둔다(demo-lesson-bfs.html 4행과 같다). 테마와 html.is-embed 를 거기서 건다.
 *
 * ---- 함수 ----
 * parseParams(search, spec) -> { embed, mode, preset }
 *     spec = { modes: [mode], modeDefault: { [mode]: preset }, presetModes: { [preset]: [쓸 수 있는 mode] } }
 *     mode 인자가 modes 에 있으면 그 mode. 없거나 모르는 값이면 preset 인자가 presetModes 에 있을 때 그 preset 의
 *     첫 mode, 아니면 modes[0]. preset 은 인자가 그 mode 에서 쓸 수 있으면 그 값, 아니면 modeDefault[mode].
 *     embed 는 embed=1 일 때만 true. 주소가 잘못돼도 항상 쓸 수 있는 값을 돌려준다.
 * nextGroupEnd(events, at) -> number
 *     at 부터 events[at].group 과 같은 group 이 이어지는 동안 나아간 다음 위치. at >= events.length 면 events.length.
 *     「다음 값」 버튼이 쓴다(한 값을 처리하는 이벤트들에 같은 group 번호를 붙인다).
 * clamp(at, total) -> number          0 과 total 사이로.
 * particle(text, withFinal, withoutFinal) -> string
 *     text 뒤에 붙일 조사를 읽은 소리의 받침으로 골라 text + 조사 를 돌려준다(사이에 공백 없음). 입력에 따라 바뀌는 값
 *     뒤에 조사가 오는 문장에 쓴다. 맨 끝의 ] ) } 따옴표 공백은 건너뛰고 그 앞 글자로 정한다. 한글은 그 글자의 받침,
 *     숫자는 읽는 소리(0 영, 1 일, 3 삼, 6 육, 7 칠, 8 팔은 받침 있음, 2 이, 4 사, 5 오, 9 구는 없음), 영문은 글자 하나(L, M, N, R 은 받침 있음)에만 쓰고 낱말에는 쓰지 않는다.
 *     쌍은 ('을','를'), ('이','가'), ('은','는'), ('과','와'), ('으로','로'). 으로/로 는 받침이 ㄹ(숫자 1, 7, 8, 영문 l, r)이면 '로'.
 *     예: particle('[6, 7]', '을', '를') = '[6, 7]을', particle('3', '으로', '로') = '3으로'.
 * player({ total, events, render }) -> { go(at), at(), restart() }
 *     total: () => 이벤트 수, events: () => [{ group }], render: (at) => void.
 *     #lk-reset, #lk-step, #lk-group(있을 때만), #lk-end 에 연결하고 #lk-count 에 「단계 n / total」을 쓴다.
 *     끝이면 한 칸, 다음 값, 끝까지가 disabled, 처음이면 처음이 disabled. 입력이나 모드를 바꾸면 페이지가 restart() 를
 *     부른다. total() 이 0 이어도 오류 없이 돈다. 버튼 글자는 페이지가 정한다.
 * tabs(el, items, current, onPick)
 *     items = [{ key, label }]. .lk-tab 버튼에 aria-pressed. items 가 하나면 el 을 비우고 아무것도 그리지 않는다.
 * array(el, values, opts)
 *     opts = { cls: { [i]: 'is-in ...' }, ptr: { [i]: '포인터 이름' }, range: [a, b] | null, head: '왼쪽 이름' }
 *     맨 위 인덱스 줄, 값 칸 줄, 맨 아래 포인터 이름 줄. range(양 끝 포함) 안의 값 칸은 .is-window 이고 첫 칸에
 *     .is-window-first, 끝 칸에 .is-window-last 도 붙는다. head 가 있으면 값 줄 왼쪽에 이름 칸이 선다.
 *     el 하나에 하나만 그린다(다시 부르면 지우고 다시 그린다).
 * grid(el, nRows, nCols, cell, opts)
 *     cell(r, c) -> { text, cls?, title? } | null (null 은 빈칸). opts = { rowHead(r), colHead(c) }, 둘 다 선택.
 * chips(el, items, emptyText)
 *     items = [{ text, cls? }]. 상태 칸(dict 항목, set 원소). 비면 emptyText 를 흐리게 보인다.
 * treeLayout(root, nodes) -> { pos: { [id]: { col, row } }, cols, rows }      (순수 함수)
 *     nodes = { [id]: { left: id | null, right: id | null } }. col 은 중위 순회 차례(0부터)라 BST 는 펼친 배열의 자리와 같고,
 *     row 는 루트에서의 층(0부터)이다. pos 의 키는 중위 순회 차례로 들어 있다. root 가 null 이면 { pos: {}, cols: 0, rows: 0 }.
 * arrayTree(n) -> nodes                (순수 함수)
 *     길이 n 인 리스트를 완전 이진 트리로 본 nodes. 키 '0' ~ String(n - 1), i 의 왼쪽 2i + 1, 오른쪽 2i + 2(n 이상이면 null).
 * tree(el, root, nodes, opts)
 *     opts = { text(id), cls: { [id]: '상태 클래스' }, sub: { [id]: '글자' }, none: { [id]: true }, hidden: { [id]: true },
 *              edge: { [childId]: '상태 클래스' } }. el 안에 .lk-tree 하나를 그린다(다시 부르면 지우고 다시 그린다).
 *     노드는 .lk-cell.lk-tnode 이고 상태 클래스가 그대로 걸린다. none 노드는 .lk-tnode.is-none(점선, 글자 None, 작게)이고 cls 의 상태 클래스(is-now, is-hit, is-bad 등)도 걸린다.
 *     sub 는 노드 아래 작은 글자 .lk-tsub(힙의 인덱스, 재귀가 돌려준 값). hidden 노드와 그 노드로 가는 선은 그리지 않지만
 *     자리는 비워 둔다. 그래서 노드가 하나씩 생겨도 다른 노드가 움직이지 않게 마지막 트리를 nodes 로 넘긴다.
 *     선은 .lk-tree-edges svg 안의 line 이고 edge 에 is-now 가 걸린 선은 --navy 다.
 *     자리는 CSS 가 --lk-cell, --lk-gap 으로 정한다(열 폭 = 칸 + 틈, 층 높이 = 칸 + 30px). JS 는 트리에 --lk-tcols, --lk-trows 를, 노드마다 --lk-tcol, --lk-trow 를 넘긴다.
 *     열이 7개 이하인 트리에는 .lk-tree-narrow 가 붙고, CSS 가 그 트리가 든 .lk-stage 를 800~1239px 에서 보드 | 옆 칸 260px 로 세운다.
 * legend(el, items)                   items = [[cls, label]]. 칸과 같은 상태 클래스로 견본을 그린다.
 *
 * ---- 상태 클래스 (칸 .lk-cell, .lk-gcell 과 범례 견본 .lk-swatch 에 같이 건다) ----
 *   .is-now     이번 단계가 보는 칸        --navy 2px 테두리
 *   .is-in      새로 넣은 값, 들어온 값    --navy-bg 바탕, --navy 글자
 *   .is-hit     답                        --navy 바탕, --paper 글자
 *   .is-out     나간 값                   --oxide-bg 바탕, --oxide 글자
 *   .is-bad     틀린 답                   --oxide 바탕, --paper 글자
 *   .is-dim     버린 칸                   --grey-bg 바탕, --grey 글자, --grey-bd 점선 테두리
 *   .is-window  윈도우 안의 칸            --navy-bd 위아래 테두리, 첫 칸과 끝 칸(.is-window-first, .is-window-last)에 좌우 테두리
 * 색은 뜻에만 쓴다. 한 칸에 둘 이상 걸어도 된다(예: is-window 와 is-in).
 *
 * ---- 주소 약속 ----
 * demo-lesson-<이름>.html?embed=1&mode=<mode>&preset=<preset>
 *   embed=1 이면 html.is-embed 가 걸려 도구 줄 위 여백이 없어진다. 글이 이 주소를 iframe 으로 쓴다.
 *   mode 와 preset 은 parseParams 가 정리한다(위 규칙).
 *
 * ---- 달라진 점 ----
 * 약속에서 벗어난 것은 노드 자리 하나다. 브리프는 left = col × 열 폭 이었으나 노드는 열 폭 안에서 틈의 절반, 층 높이 안에서 15px 띄워 놓아 노드 가운데가 선 끝 (col + 0.5, row + 0.5) 과 맞는다. 덧붙인 것: treeLayout, arrayTree, tree 와 .lk-tree 부품(트리 그림), 칸 클래스 .is-window-first, .is-window-last(윈도우 양 끝 테두리용),
 * 값 줄 왼쪽 이름 칸(head), 보드 안에 .lk-array 또는 .lk-grid 자식 하나를 그린다(보드 자체는 가로 스크롤 상자).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LessonKit = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  // ==========================================
  // 순수 함수 — DOM 을 모른다
  // ==========================================

  function parseParams(search, spec) {
    const q = new URLSearchParams(search || '');
    const modeArg = q.get('mode');
    const presetArg = q.get('preset');
    let mode;
    if (modeArg && spec.modes.includes(modeArg)) mode = modeArg;
    else if (presetArg && Object.prototype.hasOwnProperty.call(spec.presetModes, presetArg)) mode = spec.presetModes[presetArg][0];
    else mode = spec.modes[0];
    const usable = presetArg && Object.prototype.hasOwnProperty.call(spec.presetModes, presetArg) && spec.presetModes[presetArg].includes(mode);
    return { embed: q.get('embed') === '1', mode, preset: usable ? presetArg : spec.modeDefault[mode] };
  }

  function nextGroupEnd(events, at) {
    if (at >= events.length) return events.length;
    const g = events[at].group;
    let i = at;
    while (i < events.length && events[i].group === g) i++;
    return i;
  }

  function clamp(at, total) {
    return Math.max(0, Math.min(total, at));
  }

  // 조사 고르기 — 끝 글자의 받침 유무와 ㄹ 받침 여부
  function finalInfo(text) {
    const t = String(text).replace(/[\]\)\}\s'"\u2019\u201d\u300d\u300f]+$/, '');
    const ch = t.charAt(t.length - 1);
    if (!ch) return { has: false, rieul: false };
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const f = (code - 0xac00) % 28;
      return { has: f !== 0, rieul: f === 8 };
    }
    if (ch >= '0' && ch <= '9') {
      const has = '013678'.includes(ch);
      return { has, rieul: '178'.includes(ch) };
    }
    const c = ch.toLowerCase();
    return { has: 'lmnr'.includes(c), rieul: 'lr'.includes(c) };
  }

  function particle(text, withFinal, withoutFinal) {
    const f = finalInfo(text);
    const useFinal = withFinal === '으로' ? f.has && !f.rieul : f.has;
    return String(text) + (useFinal ? withFinal : withoutFinal);
  }

  // 트리 배치 — col 은 중위 순회 차례, row 는 루트에서의 층
  function treeLayout(rootId, nodes) {
    const pos = {};
    if (rootId === null || rootId === undefined) return { pos, cols: 0, rows: 0 };
    let col = 0, rows = 0;
    (function walk(id, row) {
      const n = nodes[id];
      if (n.left !== null && n.left !== undefined) walk(n.left, row + 1);
      pos[id] = { col: col++, row };
      if (row + 1 > rows) rows = row + 1;
      if (n.right !== null && n.right !== undefined) walk(n.right, row + 1);
    })(rootId, 0);
    return { pos, cols: col, rows };
  }

  // 리스트를 완전 이진 트리로 본다 — i 의 왼쪽은 2i+1, 오른쪽은 2i+2
  function arrayTree(n) {
    const nodes = {};
    for (let i = 0; i < n; i++) {
      const l = 2 * i + 1, r = 2 * i + 2;
      nodes[String(i)] = { left: l < n ? String(l) : null, right: r < n ? String(r) : null };
    }
    return nodes;
  }

  // ==========================================
  // 브라우저 전용 — document 는 함수 안에서만 쓴다
  // ==========================================

  const $ = id => document.getElementById(id);

  function node(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function player(opts) {
    let pos = 0;
    const btn = {
      reset: $('lk-reset'), step: $('lk-step'), group: $('lk-group'), end: $('lk-end'),
    };
    const count = $('lk-count');

    function go(to) {
      const total = opts.total();
      pos = clamp(to, total);
      opts.render(pos);
      const atEnd = pos >= total;
      if (btn.reset) btn.reset.disabled = pos === 0;
      if (btn.step) btn.step.disabled = atEnd;
      if (btn.group) btn.group.disabled = atEnd;
      if (btn.end) btn.end.disabled = atEnd;
      if (count) count.textContent = `단계 ${pos} / ${total}`;
    }

    if (btn.reset) btn.reset.addEventListener('click', () => go(0));
    if (btn.step) btn.step.addEventListener('click', () => go(pos + 1));
    if (btn.group) btn.group.addEventListener('click', () => go(nextGroupEnd(opts.events(), pos)));
    if (btn.end) btn.end.addEventListener('click', () => go(opts.total()));

    return { go, at: () => pos, restart: () => go(0) };
  }

  function tabs(el, items, current, onPick) {
    el.replaceChildren();
    if (items.length <= 1) return;
    items.forEach(it => {
      const b = node('button', 'lk-tab', it.label);
      b.type = 'button';
      b.dataset.key = it.key;
      b.setAttribute('aria-pressed', it.key === current ? 'true' : 'false');
      b.addEventListener('click', () => { if (it.key !== current) onPick(it.key); });
      el.appendChild(b);
    });
  }

  function array(el, values, opts) {
    opts = opts || {};
    const cls = opts.cls || {};
    const ptr = opts.ptr || {};
    const range = opts.range || null;
    const hasHead = !!opts.head;
    const wrap = node('div', 'lk-array');
    wrap.style.gridTemplateColumns = `${hasHead ? 'auto ' : ''}repeat(${values.length}, var(--lk-cell))`;

    // 인덱스 줄, 값 줄, 포인터 줄 — 줄마다 head 자리에 빈 칸이나 이름을 둔다
    if (hasHead) wrap.appendChild(node('div', 'lk-axis'));
    values.forEach((_, i) => wrap.appendChild(node('div', 'lk-axis', String(i))));

    if (hasHead) wrap.appendChild(node('div', 'lk-axis is-head', opts.head));
    values.forEach((v, i) => {
      const c = ['lk-cell'];
      if (cls[i]) c.push(cls[i]);
      if (range && i >= range[0] && i <= range[1]) {
        c.push('is-window');
        if (i === range[0]) c.push('is-window-first');
        if (i === range[1]) c.push('is-window-last');
      }
      wrap.appendChild(node('div', c.join(' '), String(v)));
    });

    if (hasHead) wrap.appendChild(node('div', 'lk-axis'));
    values.forEach((_, i) => wrap.appendChild(node('div', 'lk-ptr', ptr[i] || '')));

    el.replaceChildren(wrap);
  }

  function grid(el, nRows, nCols, cell, opts) {
    opts = opts || {};
    const hasRow = typeof opts.rowHead === 'function';
    const hasCol = typeof opts.colHead === 'function';
    const wrap = node('div', 'lk-grid');
    wrap.style.gridTemplateColumns = `${hasRow ? 'auto ' : ''}repeat(${nCols}, var(--lk-cell))`;

    if (hasCol) {
      if (hasRow) wrap.appendChild(node('div', 'lk-axis'));
      for (let c = 0; c < nCols; c++) wrap.appendChild(node('div', 'lk-axis', opts.colHead(c)));
    }
    for (let r = 0; r < nRows; r++) {
      if (hasRow) wrap.appendChild(node('div', 'lk-axis is-row', opts.rowHead(r)));
      for (let c = 0; c < nCols; c++) {
        const d = cell(r, c);
        if (!d) { wrap.appendChild(node('div', 'lk-gcell is-empty')); continue; }
        const g = node('div', 'lk-gcell' + (d.cls ? ' ' + d.cls : ''), d.text);
        if (d.title) g.title = d.title;
        wrap.appendChild(g);
      }
    }
    el.replaceChildren(wrap);
  }

  function tree(el, rootId, nodes, opts) {
    opts = opts || {};
    const cls = opts.cls || {};
    const sub = opts.sub || {};
    const none = opts.none || {};
    const hidden = opts.hidden || {};
    const edge = opts.edge || {};
    const textOf = typeof opts.text === 'function' ? opts.text : id => id;
    const L = treeLayout(rootId, nodes);
    const wrap = node('div', 'lk-tree');
    wrap.style.setProperty('--lk-tcols', String(L.cols));
    wrap.style.setProperty('--lk-trows', String(L.rows));
    if (L.cols <= 7) wrap.classList.add('lk-tree-narrow');

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'lk-tree-edges');
    svg.setAttribute('viewBox', `0 0 ${L.cols} ${L.rows}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    Object.keys(L.pos).forEach(id => {
      [nodes[id].left, nodes[id].right].forEach(child => {
        if (child === null || child === undefined || hidden[id] || hidden[child]) return;
        const a = L.pos[id], b = L.pos[child];
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('class', 'lk-tedge' + (edge[child] ? ' ' + edge[child] : ''));
        line.setAttribute('x1', String(a.col + 0.5));
        line.setAttribute('y1', String(a.row + 0.5));
        line.setAttribute('x2', String(b.col + 0.5));
        line.setAttribute('y2', String(b.row + 0.5));
        svg.appendChild(line);
      });
    });
    wrap.appendChild(svg);

    Object.keys(L.pos).forEach(id => {
      if (hidden[id]) return;
      const p = L.pos[id];
      const c = ['lk-cell', 'lk-tnode'];
      if (none[id]) c.push('is-none');
      if (cls[id]) c.push(cls[id]);
      const d = node('div', c.join(' '), none[id] ? 'None' : String(textOf(id)));
      d.style.setProperty('--lk-tcol', String(p.col));
      d.style.setProperty('--lk-trow', String(p.row));
      if (sub[id] !== undefined && sub[id] !== null && sub[id] !== '') d.appendChild(node('span', 'lk-tsub', String(sub[id])));
      wrap.appendChild(d);
    });
    el.replaceChildren(wrap);
  }

  function chips(el, items, emptyText) {
    el.replaceChildren();
    if (!items.length) {
      el.appendChild(node('span', 'lk-chips-empty', emptyText || ''));
      return;
    }
    items.forEach(it => el.appendChild(node('span', 'lk-chip' + (it.cls ? ' ' + it.cls : ''), it.text)));
  }

  function legend(el, items) {
    el.replaceChildren();
    items.forEach(([cls, label]) => {
      const item = node('span', 'lk-legend-item');
      item.appendChild(node('span', 'lk-swatch ' + cls));
      item.appendChild(node('span', null, label));
      el.appendChild(item);
    });
  }

  return { parseParams, nextGroupEnd, clamp, particle, treeLayout, arrayTree, player, tabs, array, grid, tree, chips, legend };
});
