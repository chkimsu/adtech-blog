/**
 * card-kit.js — 카드 데모 공용 그리기 부품
 *
 * 타겟팅 카드 아홉 장(targeting-cards-demo.js)에서 뽑아낸 SVG 부품이다. 학습 데이터 카드, 서빙 카드,
 * 실험 카드(model-cards-demo.js)도 같은 부품으로 그린다. 한 곳만 고치면 카드 전부가 같이 바뀐다.
 * 색은 css/style.css 의 카드 부품 블록(.f-a .tool .track …)이 토큰으로 정한다. 여기에는 hex 가 없다.
 *
 * 부품: T(글자) box tag srv(서버) table(테이블) db(저장소) file(파일) tool(회색 작업 상자) clock user
 *       list(점선 상자) dashChip arrow dots(흐르는 점) burst(몰려 지나가는 점) svg(호스트에 그리기)
 *       ML 카드용 — hbar(가로 막대) ruler(눈금 줄) lines(여러 줄 작은 글자)
 */
(function () {
    'use strict';
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const T = (x, y, str, cls = 'lbl', anchor = 'start') => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(str)}</text>`;
    const tw = str => [...str].reduce((n, ch) => n + (/[가-힣]/.test(ch) ? 10 : 6.3), 0);

    function box(x, y, w, h, txt, cls, fs = 10.5) {
        return `<rect class="f-${cls}" x="${x}" y="${y}" width="${w}" height="${h}"/>` +
            `<text class="on" x="${x + w / 2}" y="${y + h / 2 + fs * 0.36}" text-anchor="middle" style="font-size:${fs}px">${esc(txt)}</text>`;
    }
    function labelUnder(cx, y, label, cls) {
        const w = Math.max(40, tw(label) + 12);
        return box(cx - w / 2, y, w, 17, label, cls, 10);
    }
    // 글자 폭에 맞춘 채움 라벨 — 한글은 chip() 이 폭을 잘못 재므로 이것을 쓴다
    function tag(x, y, txt, cls) {
        return box(x, y, tw(txt) + 14, 18, txt, cls, 10);
    }
    // 서버 아이콘 44x54
    function srv(x, y, o = {}) {
        const cls = o.cls || 'k', sc = o.scale || 1;
        let s = `<g transform="translate(${x},${y}) scale(${sc})"><rect class="srv-body" x="0" y="0" width="44" height="54"/>` +
            `<rect class="f-${cls}" x="6" y="8" width="32" height="11"/><rect class="f-${cls}" x="6" y="23" width="32" height="11"/>` +
            `<rect class="f-sunk" x="6" y="38" width="32" height="8"/><circle class="led" cx="33" cy="13.5" r="1.8"/><circle class="led" cx="33" cy="28.5" r="1.8"/></g>`;
        if (o.label) s += labelUnder(x + 22 * sc, y + 54 * sc + 6, o.label, o.lcls || cls);
        if (o.sub) s += T(x + 22 * sc, y + 54 * sc + (o.label ? 36 : 18), o.sub, 'lbl sm', 'middle');
        return s;
    }
    // 테이블 아이콘 56x44 — 머리줄 + 줄 셋. 놓여 있는 목록
    function table(x, y, o = {}) {
        let s = `<g class="tbl"><rect class="tbl-body" x="${x}" y="${y}" width="56" height="44"/><rect class="f-a" x="${x}" y="${y}" width="56" height="10"/>`;
        for (let i = 1; i <= 3; i++) s += `<line class="tbl-ln" x1="${x}" y1="${y + 10 + i * 11}" x2="${x + 56}" y2="${y + 10 + i * 11}"/>`;
        s += `<line class="tbl-ln" x1="${x + 20}" y1="${y + 10}" x2="${x + 20}" y2="${y + 44}"/></g>`;
        if (o.label) s += labelUnder(x + 28, y + 50, o.label, 'a');
        if (o.sub) s += T(x + 28, y + 50 + 30, o.sub, 'lbl sm', 'middle');
        return s;
    }
    // DB 원통 — 서비스 옆 저장소
    function db(x, y, o = {}) {
        let s = `<ellipse class="db" cx="${x}" cy="${y}" rx="18" ry="6"/><path class="db" d="M${x - 18},${y} v28 a18,6 0 0 0 36,0 v-28"/>`;
        if (o.label) s += labelUnder(x, y + 40, o.label, 'a');
        if (o.sub) s += T(x, y + 40 + 30, o.sub, 'lbl sm', 'middle');
        return s;
    }
    // 파일 (접힌 귀) — 광고주가 올린 것
    function file(x, y, o = {}) {
        let s = `<path class="file" d="M${x},${y} h30 l12,12 v34 h-42 z"/><path class="file" d="M${x + 30},${y} v12 h12"/>`;
        if (o.label) s += labelUnder(x + 21, y + 52, o.label, 'a');
        if (o.sub) s += T(x + 21, y + 52 + 30, o.sub, 'lbl sm', 'middle');
        return s;
    }
    // 만드는 작업 (회색 상자) + 시계
    function tool(x, y, w, o = {}) {
        let s = `<rect class="tool" x="${x}" y="${y}" width="${w}" height="40"/>`;
        s += `<text class="tool-t" x="${x + w / 2}" y="${y + 17}" text-anchor="middle">${esc(o.label || '')}</text>`;
        if (o.sub) s += `<text class="tool-s" x="${x + w / 2}" y="${y + 31}" text-anchor="middle">${esc(o.sub)}</text>`;
        if (o.clock) s += clock(x + w - 12, y - 4);
        return s;
    }
    function clock(x, y) {
        return `<circle class="clk" cx="${x}" cy="${y}" r="8"/><line class="clk-h" x1="${x}" y1="${y}" x2="${x}" y2="${y - 5}"/><line class="clk-h" x1="${x}" y1="${y}" x2="${x + 4}" y2="${y}"/>`;
    }
    function user(x, y, label) {
        return `<circle class="usr" cx="${x}" cy="${y}" r="7"/><path class="usr" d="M${x - 13},${y + 26} a13,13 0 0 1 26,0 z"/>` + (label ? T(x, y + 40, label, 'lbl k', 'middle') : '');
    }
    // 점선 상자 = 적어 둔 것 (조건, 기록)
    function list(x, y, w, h, lines) {
        let s = `<rect class="list" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
        lines.forEach((ln, i) => {
            const t = typeof ln === 'string' ? ln : ln.t, cls = typeof ln === 'string' ? '' : ln.cls || '';
            s += `<text class="list-t ${cls}" x="${x + 9}" y="${y + 15 + i * 14}">${esc(t)}</text>`;
        });
        return s;
    }
    // 점선 칩 — 타겟 방식 이름 하나
    function dashChip(x, y, str) {
        const w = tw(str) + 16;
        return `<rect class="tok n" x="${x}" y="${y}" width="${w}" height="22"/><text class="tok-t dark" x="${x + 8}" y="${y + 15}" style="font-family:var(--font-sans);font-size:10.5px">${esc(str)}</text>`;
    }
    function arrow(id, d, cls = 'k', o = {}) {
        return `<path id="${id}" class="ar ${cls} ${o.dash ? 'dash' : ''}" d="${d}" marker-end="url(#m-${cls}-${o.svg})"/>`;
    }
    // 점. n 개 시간차, 또는 seq=[t0,t1] 로 한 주기(cyc) 안의 구간만
    function dots(pid, cls, o = {}) {
        const n = o.n || 2, dur = o.dur || 3, r = o.r || 4.5;
        let s = '';
        if (o.seq) {
            const [t0, t1] = o.seq, cyc = o.cyc || 8, e = 0.005;
            return `<circle class="dot ${cls}" r="${r}" opacity="0">` +
                `<animateMotion dur="${cyc}s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;${t0};${t1};1"><mpath href="#${pid}" xlink:href="#${pid}"/></animateMotion>` +
                `<animate attributeName="opacity" dur="${cyc}s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;${Math.max(0, t0 - e)};${t0};${t1};${Math.min(1, t1 + e)};1"/></circle>`;
        }
        for (let i = 0; i < n; i++) {
            s += `<circle class="dot ${cls}" r="${r}"><animateMotion dur="${dur}s" begin="${(i * dur / n).toFixed(2)}s" repeatCount="indefinite"><mpath href="#${pid}" xlink:href="#${pid}"/></animateMotion></circle>`;
        }
        return s;
    }
    // 배치 — 한 주기 안의 짧은 구간에 점 여러 개가 몰려 지나간다
    function burst(pid, cls, t0, t1, cyc, n = 4) {
        let s = '';
        const span = (t1 - t0) * 0.5;
        for (let i = 0; i < n; i++) { const off = (i / n) * span; s += dots(pid, cls, { seq: [t0 + off, t1 - span + off], cyc }); }
        return s;
    }
    function svg(id, inner, h = 300) {
        const mk = c => `<marker id="m-${c}-${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="mk ${c}"/></marker>`;
        const host = document.getElementById(id);
        if (host) host.innerHTML =
            `<svg viewBox="0 0 520 ${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img"><defs>${mk('k')}${mk('a')}${mk('b')}${mk('c')}</defs>${inner}</svg>`;
    }


    // 가로 막대 — 눈금 상자 안에 채운 몫. frac 은 0~1
    function hbar(x, y, w, frac, cls = 'a', h = 14) {
        return `<rect class="track" x="${x}" y="${y}" width="${w}" height="${h}"/>` +
            `<rect class="f-${cls}" x="${x}" y="${y}" width="${Math.max(3, Math.round(w * Math.min(1, frac)))}" height="${h}"/>`;
    }
    // 눈금 줄 — ticks = [[x, 위 라벨, 아래 라벨, cls?]]. 첫 칸은 채움
    function ruler(x, y, w, ticks, o = {}) {
        let s = `<rect class="track" x="${x}" y="${y}" width="${w}" height="${o.h || 16}"/>`;
        if (o.fill) s += `<rect class="f-${o.fillCls || 'a'}" x="${x}" y="${y}" width="${o.fill}" height="${o.h || 16}"/>`;
        ticks.forEach(t => {
            s += `<line class="tick" x1="${t[0]}" y1="${y - 6}" x2="${t[0]}" y2="${y + (o.h || 16) + 6}"/>`;
            if (t[1]) s += T(t[0], y - 10, t[1], t[3] || 'lbl k', 'middle');
            if (t[2]) s += T(t[0], y + (o.h || 16) + 18, t[2], 'lbl sm', 'middle');
        });
        return s;
    }
    // 여러 줄 작은 글자
    function lines(x, y, arr, cls = 'lbl sm', gap = 14, anchor = 'start') {
        return arr.map((t, i) => T(x, y + i * gap, t, cls, anchor)).join('');
    }

    window.CardKit = { esc, T, tw, box, labelUnder, tag, srv, table, db, file, tool, clock, user, list, dashChip, arrow, dots, burst, svg, hbar, ruler, lines };
})();
