/**
 * 과외 데모 공용 틀 — 단계 재생, 탭, 배열, 표, 상태 칸, 범례
 *   js/lesson-kit.js  +  css/lesson-kit.css  (시험: scripts/test-lesson-kit.js)
 *
 * 브라우저에서는 전역 LessonKit, node 에서는 require('../js/lesson-kit.js') 다.
 * parseParams, nextGroupEnd, clamp, particle 은 DOM 을 모른다. 나머지(player, tabs, array, grid, chips, legend)는
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
 *     뒤에 조사가 오는 문장에 쓴다. 맨 끝의 ] ) 따옴표 공백은 건너뛰고 그 앞 글자로 정한다. 한글은 그 글자의 받침,
 *     숫자는 읽는 소리(0 영, 1 일, 3 삼, 6 육, 7 칠, 8 팔은 받침 있음, 2 이, 4 사, 5 오, 9 구는 없음), 영문은 l, m, n, r 만 받침 있음.
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
 * legend(el, items)                   items = [[cls, label]]. 칸과 같은 상태 클래스로 견본을 그린다.
 *
 * ---- 상태 클래스 (칸 .lk-cell, .lk-gcell 과 범례 견본 .lk-swatch 에 같이 건다) ----
 *   .is-now     이번 단계가 보는 칸        --navy 2px 테두리
 *   .is-in      새로 넣은 값, 들어온 값    --navy-bg 바탕, --navy 글자
 *   .is-hit     답                        --navy 바탕, --paper 글자
 *   .is-out     나간 값                   --oxide-bg 바탕, --oxide 글자
 *   .is-bad     틀린 답                   --oxide 바탕, --paper 글자
 *   .is-dim     버린 칸                   --grey-bg 바탕, --grey 글자, --grey-bd 점선 테두리
 *   .is-window  창 안의 칸                --navy-bd 위아래 테두리, 첫 칸과 끝 칸(.is-window-first, .is-window-last)에 좌우 테두리
 * 색은 뜻에만 쓴다. 한 칸에 둘 이상 걸어도 된다(예: is-window 와 is-in).
 *
 * ---- 주소 약속 ----
 * demo-lesson-<이름>.html?embed=1&mode=<mode>&preset=<preset>
 *   embed=1 이면 html.is-embed 가 걸려 도구 줄 위 여백이 없어진다. 글이 이 주소를 iframe 으로 쓴다.
 *   mode 와 preset 은 parseParams 가 정리한다(위 규칙).
 *
 * ---- 달라진 점 ----
 * 약속에서 벗어난 것은 없다. 덧붙인 것만 적는다: 칸 클래스 .is-window-first, .is-window-last(창 양 끝 테두리용),
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
    const t = String(text).replace(/[\]\)\s'"\u2019\u201d\u300d\u300f]+$/, '');
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

  return { parseParams, nextGroupEnd, clamp, particle, player, tabs, array, grid, chips, legend };
});
