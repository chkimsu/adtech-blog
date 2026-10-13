/* 파이썬 코드 블록 — 하는 일, 단계, 뜻.
 * 설계: docs/superpowers/specs/2026-10-13-python-code-blocks-design.md
 * 브라우저에서는 window.CodeSteps, node 에서는 module.exports.
 * 화면(js/main.js)과 형식 검사(scripts/check-code-blocks.js)가 이 파일 하나로 블록을 읽는다. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CodeSteps = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- 토크나이저 ----------
  const KEYWORDS = new Set(('False None True and as assert async await break class continue def del elif else ' +
    'except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield').split(' '));
  const BUILTINS = new Set(('abs all any bool dict divmod enumerate filter float format frozenset getattr hasattr ' +
    'int isinstance iter len list map max min next object open pow print range repr reversed round set ' +
    'setattr sorted str sum super tuple type zip').split(' '));
  const STR_START = /^(?:[rRbBuUfF]|[rR][bBfF]|[bBfF][rR])?('''|"""|'|")/;
  const NUMBER = /^(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?[jJ]?)/;
  const NAME = /^[A-Za-z_\u0080-￿][A-Za-z0-9_\u0080-￿]*/;
  const WIDE = /[ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿ꥠ-꥿가-힣豈-﫿︰-﹏＀-｠￠-￦]/;

  // q 로 닫히는 자리 바로 뒤. 없으면 -1. 백슬래시는 늘 다음 글자를 건너뛴다.
  function closeString(text, from, q) {
    for (let j = from; j < text.length; j++) {
      if (text[j] === '\\') { j++; continue; }
      if (text.startsWith(q, j)) return j + q.length;
    }
    return -1;
  }

  // 줄마다 { text, toks: [{ k, v }], startsInString } 를 돌려준다.
  // k: comment, string, number, keyword, def, builtin, name, op, ws
  function scan(src) {
    const out = [];
    let str = null; // 다음 줄로 이어지는 문자열 { q }
    for (const text of String(src).split('\n')) {
      const toks = [];
      const startsInString = !!str;
      let i = 0;
      let prev = null; // 공백이 아닌 바로 앞 토큰
      if (str) {
        const end = closeString(text, 0, str.q);
        if (end < 0) {
          if (text) toks.push({ k: 'string', v: text });
          if (str.q.length === 1 && !text.endsWith('\\')) str = null;
          out.push({ text, toks, startsInString });
          continue;
        }
        toks.push({ k: 'string', v: text.slice(0, end) });
        prev = toks[0];
        i = end;
        str = null;
      }
      while (i < text.length) {
        const c = text[i];
        const rest = text.slice(i);
        let m;
        if (c === ' ' || c === '\t') {
          m = /^[ \t]+/.exec(rest);
          toks.push({ k: 'ws', v: m[0] });
          i += m[0].length;
          continue;
        }
        if (c === '#') { toks.push({ k: 'comment', v: rest }); break; }
        if ((m = STR_START.exec(rest))) {
          const end = closeString(text, i + m[0].length, m[1]);
          if (end >= 0) {
            toks.push({ k: 'string', v: text.slice(i, end) });
            prev = toks[toks.length - 1];
            i = end;
            continue;
          }
          toks.push({ k: 'string', v: rest });
          if (m[1].length === 3 || text.endsWith('\\')) str = { q: m[1] };
          break;
        }
        if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(text[i + 1] || ''))) {
          m = NUMBER.exec(rest);
          toks.push({ k: 'number', v: m[0] });
          prev = toks[toks.length - 1];
          i += m[0].length;
          continue;
        }
        if ((m = NAME.exec(rest))) {
          const v = m[0];
          let k = 'name';
          if (KEYWORDS.has(v)) k = 'keyword';
          else if (prev && prev.k === 'keyword' && (prev.v === 'def' || prev.v === 'class')) k = 'def';
          else if (BUILTINS.has(v) && !(prev && prev.v === '.')) k = 'builtin';
          toks.push({ k, v });
          prev = toks[toks.length - 1];
          i += v.length;
          continue;
        }
        toks.push({ k: 'op', v: c });
        prev = toks[toks.length - 1];
        i += 1;
      }
      out.push({ text, toks, startsInString });
    }
    return out;
  }

  // ---------- 파서 ----------
  const HEAD = /^# 하는 일:(.*)$/;
  const STATUS = [
    { re: /^# \((.+?) — 그대로 실행되지 않습니다\.\)\s*$/, make: m => ({ kind: 'norun', text: m[1] }) },
    { re: /^# \(앞 블록에 이어서 돌린다\.\)\s*$/, make: () => ({ kind: 'cont', text: '앞 블록에 이어서' }) },
    { re: /^# \(([a-z0-9-]+) 글의 코드에 이어서 돌린다\.\)\s*$/, make: m => ({ kind: 'cont-post', post: m[1], text: '앞 글에 이어서' }) },
  ];
  const STEP = /^# (\d+)단계: (.*\S)\s*$/;
  const STEP_LOOSE = /^\s*#\s*\d+\s*단계\s*:/;
  const OUT_ANY = /^# 출력(?=[\s(:]|$)/;
  const OUT = /^# 출력(?: \((.+)\))?:\s*$/;
  const MEAN = /^# (?:(\d+)단계 )?뜻: (.*\S)\s*$/;
  const MEAN_LOOSE = /^#\s*(?:\d+\s*단계\s*)?뜻\s*:/;

  function parse(src) {
    const text = String(src).replace(/\r\n?/g, '\n').replace(/\s+$/, '');
    const lines = text.split('\n');
    const info = scan(text);
    const n = lines.length;
    const errors = [];
    const err = (j, msg) => errors.push({ line: j + 1, msg });
    const first = j => info[j].toks.find(t => t.k !== 'ws');
    const isComment = j => !info[j].startsInString && !!first(j) && first(j).k === 'comment';
    const isCol0 = j => isComment(j) && lines[j][0] === '#';

    let i = 0;
    const labels = [];
    for (; i < n && isCol0(i); i++) {
      const st = STATUS.find(s => s.re.test(lines[i]));
      if (!st) break;
      labels.push(st.make(st.re.exec(lines[i])));
    }
    let outAt = -1;
    for (let j = 0; j < n; j++) if (isCol0(j) && OUT_ANY.test(lines[j])) { outAt = j; break; }
    const bodyEnd = outAt < 0 ? n : outAt;

    if (!(i < n && isCol0(i) && HEAD.test(lines[i]))) {
      let stray = -1;
      for (let j = 0; j < bodyEnd; j++) if (isCol0(j) && HEAD.test(lines[j])) { stray = j; break; }
      if (stray < 0) return { format: 'legacy', ok: true, errors: [], src: text };
      if (i < n && isCol0(i) && /^# \(.*\)\s*$/.test(lines[i])) err(i, '상태 표시는 정해진 세 가지 꼴 가운데 하나로 씁니다');
      err(stray, '하는 일 줄은 블록 맨 위, 상태 표시 바로 다음 줄에 둡니다');
      return { format: 'steps', ok: false, errors, src: text };
    }
    const headAt = i;
    const head = HEAD.exec(lines[headAt])[1].trim();
    if (!head) err(headAt, '하는 일이 비어 있습니다');

    // 몸통 — 단계로 나눈다. 번호 0 은 첫 단계 앞의 줄이다.
    const raw = [];
    let cur = { n: 0, title: '', detail: [], from: headAt + 1, lines: [] };
    let expect = 1;
    for (let j = headAt + 1; j < bodyEnd; j++) {
      if (isCol0(j) && HEAD.test(lines[j])) { err(j, '하는 일 줄은 블록에 하나만 둡니다'); continue; }
      const m = isCol0(j) ? STEP.exec(lines[j]) : null;
      if (m) {
        const num = Number(m[1]);
        if (num !== expect) err(j, `단계 번호는 ${expect} 이어야 합니다`);
        expect = num + 1;
        raw.push(cur);
        cur = { n: num, title: m[2], detail: [], from: j, lines: [] };
        let para = [];
        let k = j + 1;
        for (; k < bodyEnd && isCol0(k) && !STEP.test(lines[k]) && !HEAD.test(lines[k]); k++) {
          const t = lines[k].replace(/^#\s?/, '').trim();
          if (!t) { if (para.length) cur.detail.push(para.join(' ')); para = []; } else para.push(t);
        }
        if (para.length) cur.detail.push(para.join(' '));
        j = k - 1;
        continue;
      }
      if (isComment(j) && STEP_LOOSE.test(lines[j])) err(j, '단계 표시는 들여쓰기 없이 `# N단계: 제목` 꼴로 씁니다');
      cur.lines.push(j);
    }
    raw.push(cur);

    function items(idx) {
      const out = [];
      let note = null; // 이어 붙일 수 있는 줄 사이 메모
      for (const j of idx) {
        const indent = lines[j].length - lines[j].replace(/^[ \t]+/, '').length;
        if (!info[j].startsInString && !lines[j].trim()) { out.push({ kind: 'blank' }); note = null; continue; }
        if (isComment(j)) {
          const t = lines[j].trim().replace(/^#\s?/, '').trim();
          if (!t) { note = null; continue; }
          if (note && note.ind === indent) note.text += ' ' + t;
          else { note = { kind: 'note', ind: indent, text: t }; out.push(note); }
          continue;
        }
        note = null;
        const toks = info[j].toks.slice();
        let trail = null;
        if (toks.length && toks[toks.length - 1].k === 'comment') trail = toks.pop().v.replace(/^#\s?/, '').trim() || null;
        while (toks.length && toks[toks.length - 1].k === 'ws') toks.pop();
        out.push({ kind: 'code', line: j, ind: indent, toks, note: trail });
      }
      while (out.length && out[0].kind === 'blank') out.shift();
      while (out.length && out[out.length - 1].kind === 'blank') out.pop();
      return out;
    }
    const steps = raw.filter(r => r.n > 0).map(r => r.n);
    const rows = raw.map(r => ({ n: r.n, title: r.title, detail: r.detail, from: r.from, items: items(r.lines) }))
      .filter(r => r.n > 0 || r.items.length);

    // 출력 영역 — 뜻 줄이 아래 찍힌 줄들의 머리다.
    let out = null;
    if (outAt >= 0) {
      const om = OUT.exec(lines[outAt]);
      if (!om) err(outAt, '출력 표시는 `# 출력:` 또는 `# 출력 (…):` 로 씁니다');
      const hint = om && om[1] ? om[1].trim() : '';
      out = { hint, varying: /돌릴 때마다/.test(hint), at: outAt, groups: [] };
      let g = null;
      for (let j = outAt + 1; j < n; j++) {
        const l = lines[j];
        if (!l.startsWith('#')) {
          err(j, l.trim() ? '출력 영역 뒤에는 코드 줄을 둘 수 없습니다' : '출력 영역의 빈 줄은 `#` 로 씁니다');
          continue;
        }
        const mm = MEAN.exec(l);
        if (mm) { g = { n: mm[1] ? Number(mm[1]) : null, meaning: mm[2], lines: [], from: j }; out.groups.push(g); continue; }
        if (MEAN_LOOSE.test(l)) { err(j, '뜻 줄은 `# N단계 뜻: …` 또는 `# 뜻: …` 꼴로 씁니다'); continue; }
        const t = l === '#' ? '' : l.startsWith('# ') ? l.slice(2) : l.slice(1);
        if (!g) { err(j, '찍힌 줄 앞에 뜻 줄이 있어야 합니다'); g = { n: null, meaning: '', lines: [], from: j }; out.groups.push(g); }
        g.lines.push(t.replace(/\s+$/, ''));
      }
      if (!out.groups.length) err(outAt, '출력 표시 아래에 뜻 줄과 찍힌 줄이 없습니다');
      for (const gg of out.groups) {
        if (!gg.lines.length) err(gg.from, '뜻 줄 아래에 찍힌 줄이 없습니다');
        if (steps.length && gg.n !== null && !steps.includes(gg.n)) err(gg.from, `${gg.n}단계가 이 블록에 없습니다`);
        if (!steps.length && gg.n !== null) err(gg.from, '단계 없는 블록의 뜻 줄에는 번호를 붙이지 않습니다');
      }
    }
    return {
      format: 'steps', ok: errors.length === 0, errors, labels, head, rows,
      stepLines: raw.filter(r => r.n > 0).map(r => ({ n: r.n, from: r.from })),
      codeEnd: bodyEnd, out, src: text,
    };
  }

  // ---------- 그리기 ----------
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const CLS = { keyword: 'cb-k', def: 'cb-fn', builtin: 'cb-bi', string: 'cb-s', number: 'cb-n' };

  function widthCounts(s) {
    let wl = 0, ww = 0;
    for (const ch of s) { if (WIDE.test(ch)) ww++; else wl++; }
    return { wl, ww };
  }

  // 앞의 들여쓰기 ind 글자를 토큰에서 떼어 낸다.
  function dropIndent(toks, ind) {
    const out = toks.slice();
    let left = ind;
    while (left > 0 && out.length) {
      const t = out[0];
      if (t.v.length <= left) { left -= t.v.length; out.shift(); } else { out[0] = { k: t.k, v: t.v.slice(left) }; left = 0; }
    }
    return out;
  }

  // 점, 쉼표, 여는 괄호 뒤에 접는 자리(<wbr>)를 둔다. 바로 닫히는 빈 괄호는 뺀다.
  function codeHtml(toks) {
    let h = '';
    toks.forEach((tk, t) => {
      if (tk.k === 'op') {
        const next = toks[t + 1] ? toks[t + 1].v[0] : '';
        const brk = tk.v === '.' || tk.v === ',' || ((tk.v === '(' || tk.v === '[') && next !== ')' && next !== ']');
        h += esc(tk.v) + (brk ? '<wbr>' : '');
      } else if (CLS[tk.k]) h += `<span class="${CLS[tk.k]}">${esc(tk.v)}</span>`;
      else h += esc(tk.v);
    });
    return h;
  }

  function lineHtml(it) {
    if (it.kind === 'blank') return '<div class="cb-ln cb-blank"><span class="cb-src"> </span></div>';
    if (it.kind === 'note') return `<div class="cb-ln cb-ln-note" style="--ind:${it.ind}"><span class="cb-note">${esc(it.text)}</span></div>`;
    const toks = dropIndent(it.toks, it.ind);
    const w = widthCounts(toks.map(t => t.v).join(''));
    const note = it.note ? `<span class="cb-note">${esc(it.note)}</span>` : '';
    return `<div class="cb-ln${it.note ? ' has-note' : ''}" style="--ind:${it.ind}" data-wl="${it.ind + w.wl}" data-ww="${w.ww}"` +
      `${it.note ? ' data-note="1"' : ''}><span class="cb-src"><span class="cb-t">${codeHtml(toks) || ' '}</span></span>${note}</div>`;
  }

  function outLineHtml(t) {
    const ind = t.length - t.replace(/^ +/, '').length;
    const w = widthCounts(t);
    return `<div class="cb-oln" style="--ind:${ind}" data-wl="${w.wl}" data-ww="${w.ww}"><span class="cb-src">${esc(t.slice(ind)) || ' '}</span></div>`;
  }

  // 묶음 맨 앞과 맨 끝의 빈 줄은 그리지 않는다(검사는 그대로 비교한다).
  function trimBlank(ls) {
    let a = 0, b = ls.length;
    while (a < b && !ls[a].trim()) a++;
    while (b > a && !ls[b - 1].trim()) b--;
    return ls.slice(a, b);
  }

  function render(m) {
    const nosteps = !m.rows.some(r => r.n > 0);
    const labels = m.labels.map(l => (l.kind === 'cont-post'
      ? `<a class="cb-label" href="post.html?id=${esc(l.post)}">${esc(l.text)}</a>`
      : `<span class="cb-label">${esc(l.text)}</span>`)).join('');
    const rows = m.rows.map(r => {
      const exp = r.n > 0
        ? `<div class="cb-exp"><span class="cb-num">${r.n}</span><b>${esc(r.title)}</b>${r.detail.map(p => `<p>${esc(p)}</p>`).join('')}</div>`
        : '<div class="cb-exp cb-exp0"></div>';
      return `<div class="cb-row" data-step="${r.n}">${exp}<div class="cb-code">${r.items.map(lineHtml).join('')}</div></div>`;
    }).join('');
    let out = '';
    if (m.out) {
      const groups = m.out.groups.map(g => {
        const num = g.n !== null ? `<span class="cb-num cb-num-o">${g.n}</span>` : '<span class="cb-num-none"></span>';
        return `<div class="cb-grp" data-step="${g.n !== null ? g.n : ''}">${num}` +
          `<div class="cb-out-lines">${trimBlank(g.lines).map(outLineHtml).join('')}</div>` +
          `<div class="cb-out-mean">${esc(g.meaning)}</div></div>`;
      }).join('');
      out = '<div class="cb-out" data-layout="three">' +
        `<div class="cb-out-head"><span class="cb-out-tab">출력</span>${m.out.hint ? `<span class="cb-out-hint">${esc(m.out.hint)}</span>` : ''}</div>` +
        `<div class="cb-out-cols"><span>단계</span><span>찍힌 줄</span><span>뜻</span></div>${groups}</div>`;
    }
    return `<div class="cb${nosteps ? ' cb-nosteps' : ''}" data-src="${esc(m.src)}">` +
      // 글자 폭을 재는 숨은 글자. 크기 0 인 상자 안에 둬서 페이지 폭을 늘리지 않는다.
      `<span class="cb-probes" aria-hidden="true"><span class="cb-probe">${'0'.repeat(100)}</span>` +
      `<span class="cb-probe cb-probe-w">${'가'.repeat(100)}</span></span>` +
      `<div class="cb-head"><div class="cb-meta"><span class="cb-kicker">이 코드가 하는 일</span>${labels}` +
      '<span class="cb-lang">python</span><button class="cb-copy copy-btn" type="button">Copy</button></div>' +
      `<div class="cb-title">${esc(m.head)}</div></div>` +
      `<div class="cb-rows">${rows}</div>${out}</div>`;
  }

  // ---------- 파이썬이 아닌 블록 ----------
  // hljs 가 만든 HTML 을 줄마다 나눈다. 줄 끝에서 열린 span 을 닫고 다음 줄 앞에서 다시 연다.
  function splitLines(html) {
    const out = [];
    const stack = [];
    let cur = '';
    const re = /(<span\b[^>]*>)|(<\/span>)|(\n)|([^<\n]+)|(<[^>]*>)/g;
    let m;
    while ((m = re.exec(html))) {
      if (m[1]) { stack.push(m[1]); cur += m[1]; } else if (m[2]) { stack.pop(); cur += m[2]; } else if (m[3]) {
        cur += '</span>'.repeat(stack.length);
        out.push(cur);
        cur = stack.join('');
      } else cur += m[0];
    }
    out.push(cur);
    return out;
  }

  // 선 글자(U+2500~U+259F)로 그린 그림은 접지 않는다.
  const hasDrawing = raw => /[─-▟]/.test(raw);

  function wrapLines(html, raw) {
    const parts = splitLines(String(html).replace(/\n$/, ''));
    const rawLines = String(raw).replace(/\n$/, '').split('\n');
    return parts.map((h, i) => {
      const r = rawLines[i] || '';
      const ind = r.length - r.replace(/^ +/, '').length;
      return `<span class="cb-ln" style="--ind:${ind}"><span class="cb-src">${stripIndent(h, ind) || ' '}</span></span>`;
    }).join('');
  }

  // 줄 HTML 의 앞 공백 ind 개를 뗀다(태그는 건드리지 않는다).
  function stripIndent(h, ind) {
    let left = ind;
    return h.replace(/(<[^>]*>)|( +)/g, (m, tag, sp) => {
      if (tag || left <= 0) return m;
      const cut = Math.min(left, sp.length);
      left -= cut;
      return sp.slice(cut);
    });
  }

  // ---------- 배치(브라우저) ----------
  const noteColumn = (maxw, cap) => Math.max(0, Math.min(Math.ceil(maxw) + 2, cap - 22));
  const fitsNote = (w, nc) => w + 2 <= nc;
  const outputLayout = (maxw, availCh, narrow) => (!narrow && Math.ceil(maxw) + 2 <= 0.6 * availCh ? 'three' : 'stack');

  function layout(cb) {
    const probe = cb.querySelector('.cb-probe');
    const probeW = cb.querySelector('.cb-probe-w');
    const ch = probe.getBoundingClientRect().width / 100;
    if (!ch) return;
    const wide = probeW.getBoundingClientRect().width / 100 / ch; // 한글 한 자 = 라틴 몇 자
    const width = el => Number(el.dataset.wl) + Number(el.dataset.ww) * wide;
    const narrow = cb.getBoundingClientRect().width <= 600;
    cb.querySelectorAll('.cb-code').forEach(code => {
      const cs = getComputedStyle(code);
      const avail = code.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const noted = code.querySelectorAll('.cb-ln[data-note]');
      let maxw = 0;
      noted.forEach(l => { maxw = Math.max(maxw, width(l)); });
      const nc = noteColumn(maxw, Math.floor(avail / ch));
      code.style.setProperty('--nc', nc);
      noted.forEach(l => l.classList.toggle('is-drop', narrow || !fitsNote(width(l), nc)));
    });
    const out = cb.querySelector('.cb-out');
    if (out) {
      let maxo = 0;
      out.querySelectorAll('.cb-oln').forEach(l => { maxo = Math.max(maxo, width(l)); });
      out.style.setProperty('--oc', Math.ceil(maxo) + 2);
      out.dataset.layout = outputLayout(maxo, out.clientWidth / ch, narrow);
    }
    markWrapped(cb);
  }

  // 접힌 줄에 막대를 붙인다. getClientRects 는 글자 조각마다 상자를 돌려줘서 높이로 본다.
  function markWrapped(root) {
    root.querySelectorAll('.cb-src').forEach(s => {
      const lh = parseFloat(getComputedStyle(s).lineHeight);
      s.parentElement.classList.toggle('is-wrapped', lh > 0 && s.getBoundingClientRect().height > lh * 1.5);
    });
  }

  function hover(cb) {
    const set = n => cb.querySelectorAll('[data-step]').forEach(el => {
      el.classList.toggle('is-hot', !!n && n !== '0' && el.dataset.step === n);
    });
    cb.addEventListener('mouseover', e => {
      const t = e.target.closest('[data-step]');
      set(t ? t.dataset.step : null);
    });
    cb.addEventListener('mouseleave', () => set(null));
  }

  function mount(root) {
    const blocks = [...root.querySelectorAll('.cb')];
    const wraps = [...root.querySelectorAll('pre.cb-wrap')];
    const redo = () => { blocks.forEach(layout); wraps.forEach(markWrapped); };
    blocks.forEach(hover);
    redo();
    if (typeof ResizeObserver !== 'undefined') {
      let raf = 0;
      const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(redo); });
      blocks.concat(wraps).forEach(el => ro.observe(el));
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redo);
  }

  return { scan, parse, render, splitLines, wrapLines, hasDrawing, widthCounts, noteColumn, fitsNote, outputLayout, mount };
});
