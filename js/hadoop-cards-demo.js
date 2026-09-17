/**
 * hadoop-cards-demo.js — 하둡 카드 여섯 장
 *
 * 카드 하나가 개념 하나. 서버 아이콘 + 색 상자 + 화살표, 화살표 위로 점이 흐른다(SMIL animateMotion).
 * 색은 css/style.css 토큰만 — 파랑(navy) 저장, 벽돌색(oxide) 계산, 먹색 Hive 서버, 회색 ZooKeeper.
 * 주소·이름·숫자는 전부 설명용 예시다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * prefers-reduced-motion 이면 CSS 가 점을 숨긴다.
 */
(function () {
    'use strict';
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const T = (x, y, str, cls = 'lbl', anchor = 'start') => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(str)}</text>`;
    const tw = str => [...str].reduce((n, ch) => n + (/[가-힣]/.test(ch) ? 10 : 6.3), 0);

    // 서버 아이콘 44x54. cls = 첫 칸 색, cls2 = 둘째 칸 색(없으면 같은 색)
    function srv(x, y, o = {}) {
        const cls = o.cls || 'k', cls2 = o.cls2 || cls, sc = o.scale || 1;
        let s = `<g transform="translate(${x},${y}) scale(${sc})"><rect class="srv-body" x="0" y="0" width="44" height="54"/>` +
            `<rect class="f-${cls}" x="6" y="8" width="32" height="11"/><rect class="f-${cls2}" x="6" y="23" width="32" height="11"/>` +
            `<rect class="f-sunk" x="6" y="38" width="32" height="8"/><circle class="led" cx="33" cy="13.5" r="1.8"/><circle class="led" cx="33" cy="28.5" r="1.8"/></g>`;
        const cx = x + 22 * sc, by = y + 54 * sc + 6;
        if (o.label) { const w = Math.max(44 * sc, tw(o.label) + 12); s += box(cx - w / 2, by, w, 17, o.label, o.lcls || cls, 10); }
        if (o.sub) s += T(cx, by + (o.label ? 30 : 12), o.sub, 'lbl sm', 'middle');
        return s;
    }
    function box(x, y, w, h, txt, cls, fs = 10.5) {
        return `<rect class="f-${cls}" x="${x}" y="${y}" width="${w}" height="${h}"/>` +
            `<text class="on" x="${x + w / 2}" y="${y + h / 2 + fs * 0.36}" text-anchor="middle" style="font-size:${fs}px">${esc(txt)}</text>`;
    }
    function blk(x, y, n, cls = 'a', size = 15) {
        return `<rect class="sq-${cls}" x="${x}" y="${y}" width="${size}" height="${size}"/>` +
            `<text class="sq-t" x="${x + size / 2}" y="${y + size / 2 + 3.3}" text-anchor="middle">${esc(n)}</text>`;
    }
    function list(x, y, w, h, lines) {
        let s = `<rect class="list" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
        lines.forEach((ln, i) => {
            const t = typeof ln === 'string' ? ln : ln.t, cls = typeof ln === 'string' ? '' : ln.cls || '';
            s += `<text class="list-t ${cls}" x="${x + 9}" y="${y + 15 + i * 14}">${esc(t)}</text>`;
        });
        return s;
    }
    function user(x, y, label) {
        return `<circle class="usr" cx="${x}" cy="${y}" r="7"/><path class="usr" d="M${x - 13},${y + 26} a13,13 0 0 1 26,0 z"/>` + (label ? T(x, y + 40, label, 'lbl k', 'middle') : '');
    }
    function arrow(id, d, cls = 'k', o = {}) {
        return `<path id="${id}" class="ar ${cls} ${o.dash ? 'dash' : ''}" d="${d}" marker-end="url(#m-${cls}-${o.svg})"/>`;
    }
    // 경로 위를 도는 점. n 개를 시간차로, 또는 seq=[t0,t1] 로 한 주기(cyc 초) 안의 구간만 움직인다
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
    function mvsq(pid, cls, o = {}) {
        const n = o.n || 1, dur = o.dur || 3;
        let s = '';
        for (let i = 0; i < n; i++) s += `<rect class="mv ${cls}" x="-6" y="-6" width="12" height="12"><animateMotion dur="${dur}s" begin="${(i * dur / n).toFixed(2)}s" repeatCount="indefinite"><mpath href="#${pid}" xlink:href="#${pid}"/></animateMotion></rect>`;
        return s;
    }
    function num(x, y, n) {
        return `<rect class="num" x="${x - 8}" y="${y - 8}" width="16" height="16"/><text class="num-t" x="${x}" y="${y + 3.5}" text-anchor="middle">${n}</text>`;
    }
    function svg(id, inner, h = 330) {
        const mk = c => `<marker id="m-${c}-${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="mk ${c}"/></marker>`;
        const host = document.getElementById(id);
        if (host) host.innerHTML =
            `<svg viewBox="0 0 520 ${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img"><defs>${mk('k')}${mk('a')}${mk('b')}${mk('c')}</defs>${inner}</svg>`;
    }

    // ---------- CLUSTER ----------
    (function () {
        let s = '';
        s += T(14, 14, '역할이 하나씩인 서버', 'lbl sm');
        s += srv(20, 22, { cls: 'a', label: 'NameNode' });
        s += srv(118, 22, { cls: 'b', label: 'ResourceManager' });
        s += srv(246, 22, { cls: 'k', label: 'Metastore' });
        s += srv(340, 22, { cls: 'k', label: 'HiveServer2' });
        s += srv(434, 22, { cls: 'k', label: 'HiveServer2' });
        s += T(14, 126, 'ZooKeeper 5대 — 같은 목록을 다섯 벌', 'lbl sm');
        for (let i = 0; i < 5; i++) s += srv(20 + i * 62, 134, { cls: 'c', scale: 0.72, label: 'ZK', sub: 'zk' + (i + 1) });
        s += T(14, 224, '워커 — 한 대에 역할 둘 (실제로는 수십에서 수백 대)', 'lbl sm');
        for (let i = 0; i < 6; i++) {
            const x = 20 + i * 82;
            s += srv(x, 232, { cls: 'a', cls2: 'b' });
            s += box(x - 6, 292, 26, 15, 'DN', 'a', 9.5) + box(x + 24, 292, 26, 15, 'NM', 'b', 9.5);
            s += T(x + 22, 322, '워커 ' + (i + 1), 'lbl sm', 'middle');
        }
        svg('hc-cluster', s);
    })();

    // ---------- HDFS ----------
    (function () {
        let s = '';
        s += `<path class="file" d="M18,112 h56 l16,16 v72 h-72 z"/><path class="file" d="M74,112 v16 h16"/>`;
        s += T(54, 152, '파일', 'lbl k', 'middle') + T(54, 168, '384 MB', 'lbl sm', 'middle');
        s += T(54, 100, '128 MB 씩 조각', 'lbl sm', 'middle');
        [0, 1, 2].forEach(i => { s += blk(104, 118 + i * 32, String(i + 1), 'a', 18); });
        s += srv(200, 10, { cls: 'a', label: 'NameNode' });
        s += list(262, 12, 160, 58, [{ t: '조각 1 →  A, C', cls: 'mono' }, { t: '조각 2 →  B, C', cls: 'mono' }, { t: '조각 3 →  A, B', cls: 'mono' }]);
        s += T(262, 84, '어디에 있나 목록만 든다', 'lbl sm');
        const ys = [96, 170, 244], names = ['A', 'B', 'C'], have = [['1', '3'], ['2', '3'], ['1', '2']];
        ys.forEach((y, i) => {
            s += srv(340, y, { cls: 'a', label: 'DataNode ' + names[i] });
            have[i].forEach((b, k) => { s += blk(398 + k * 20, y + 14, b, 'a', 16); });
        });
        const S = 'hc-hdfs';
        s += arrow('h1', 'M124,127 C220,127 260,118 336,118', 'a', { svg: S });
        s += arrow('h2', 'M124,159 C220,159 260,192 336,192', 'a', { svg: S });
        s += arrow('h3', 'M124,191 C220,191 260,266 336,266', 'a', { svg: S });
        s += dots('h1', 'a', { n: 2, dur: 3 }) + dots('h2', 'a', { n: 2, dur: 3.4 }) + dots('h3', 'a', { n: 2, dur: 3.8 });
        svg(S, s);
    })();

    // ---------- YARN ----------
    (function () {
        let s = '';
        s += T(12, 30, '내 쿼리', 'lbl sm');
        s += list(12, 40, 124, 46, [{ t: 'SELECT count(*) …', cls: 'mono' }, { t: 'queue = analytics', cls: 'mono' }]);
        s += srv(160, 28, { cls: 'b', label: 'ResourceManager' });
        s += `<rect class="list" x="250" y="22" width="180" height="82"/>` + T(259, 36, '큐 (자원을 나누는 줄)', 'lbl sm');
        const lanes = [['default', 90, false], ['analytics  ← 내 쿼리', 150, true], ['adhoc', 60, false]];
        lanes.forEach((ln, i) => {
            const ly = 44 + i * 19;
            s += `<rect class="lane ${ln[2] ? 'on' : ''}" x="259" y="${ly}" width="${ln[1]}" height="14"/>` +
                `<text class="lane-t ${ln[2] ? 'on' : ''}" x="264" y="${ly + 10.5}">${esc(ln[0])}</text>`;
        });
        const S = 'hc-yarn';
        s += arrow('y0', 'M138,63 L158,63', 'b', { svg: S }) + dots('y0', 'b', { n: 1, dur: 2 });
        s += T(12, 150, '큐에서 자원을 받아', 'lbl sm') + T(12, 164, '계산 조각(T)을 만들고', 'lbl sm') + T(12, 178, '데이터 조각이 있는 워커에 얹는다', 'lbl sm');
        const xs = [250, 340, 430];
        xs.forEach((x, i) => {
            s += srv(x, 206, { cls: 'a', cls2: 'b', label: '워커 ' + (i + 1) });
            s += blk(x + 50, 210, String(i + 1), 'a', 15);
            s += blk(x + 50, 230, 'T', 'b', 15);
            s += arrow('y' + (i + 1), `M409,70 C430,70 ${x + 22},140 ${x + 22},202`, 'b', { svg: S });
        });
        s += mvsq('y1', 'b', { dur: 3 }) + mvsq('y2', 'b', { dur: 3.5 }) + mvsq('y3', 'b', { dur: 4 });
        svg(S, s);
    })();

    // ---------- HIVE — 쿼리 한 건의 길 ----------
    (function () {
        let s = '';
        s += user(34, 136, '나');
        s += srv(110, 118, { cls: 'k', label: 'HiveServer2' });
        s += srv(300, 8, { cls: 'k', label: 'Metastore' });
        s += list(352, 10, 158, 44, [{ t: 'adlog.ad_click', cls: 'h' }, { t: '→ hdfs://…/ad_click/', cls: 'mono' }]);
        s += srv(300, 118, { cls: 'b', label: 'ResourceManager' });
        s += box(356, 134, 92, 15, 'analytics', 'b', 9.5);
        for (let i = 0; i < 3; i++) { s += srv(300 + i * 72, 240, { cls: 'a', cls2: 'b', scale: 0.85, sub: i === 1 ? '워커들' : '' }); s += blk(342 + i * 72, 246, String(i + 1), 'a', 13); s += blk(342 + i * 72, 262, 'T', 'b', 13); }
        const S = 'hc-hive';
        s += arrow('q1', 'M56,156 L106,156', 'k', { svg: S });
        s += arrow('q2', 'M154,130 C200,70 250,40 296,40', 'k', { svg: S });
        s += arrow('q2b', 'M296,52 C250,60 200,90 156,142', 'k', { svg: S, dash: true });
        s += arrow('q3', 'M156,154 L296,154', 'b', { svg: S });
        s += arrow('q4', 'M322,198 L322,236', 'b', { svg: S });
        s += arrow('q5', 'M296,270 C240,270 200,210 156,168', 'a', { svg: S, dash: true });
        s += arrow('q5b', 'M106,164 L56,164', 'k', { svg: S, dash: true });
        const cyc = 9;
        s += dots('q1', 'k', { seq: [0.02, 0.12], cyc });
        s += dots('q2', 'k', { seq: [0.14, 0.26], cyc });
        s += dots('q2b', 'k', { seq: [0.27, 0.38], cyc });
        s += dots('q3', 'b', { seq: [0.40, 0.50], cyc });
        s += dots('q4', 'b', { seq: [0.52, 0.60], cyc });
        s += dots('q5', 'a', { seq: [0.64, 0.78], cyc });
        s += dots('q5b', 'a', { seq: [0.80, 0.90], cyc });
        s += num(80, 144, 1) + T(80, 134, 'SQL', 'lbl sm', 'middle');
        s += num(206, 62, 2) + T(150, 54, '테이블 어디 있어?', 'lbl sm');
        s += num(228, 172, 3) + T(240, 176, '자원 주세요', 'lbl sm');
        s += num(340, 216, 4) + T(350, 220, '워커에서 센다', 'lbl sm');
        s += num(200, 240, 5) + T(212, 244, '결과', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ZOOKEEPER ----------
    (function () {
        let s = '';
        for (let i = 0; i < 5; i++) s += srv(36 + i * 92, 12, { cls: 'c', scale: 0.8, label: 'zk' + (i + 1) });
        s += list(120, 108, 280, 44, [{ t: '살아 있는 HiveServer2', cls: 'h' }, { t: 'hs2-a        hs2-b', cls: 'mono' }]);
        s += T(408, 132, '← 다섯 대가 같은 목록', 'lbl sm');
        s += srv(150, 236, { cls: 'k', label: 'hs2-a' });
        s += srv(300, 236, { cls: 'k', label: 'hs2-b' });
        const S = 'hc-zookeeper';
        s += arrow('z1', 'M172,232 L196,156', 'k', { svg: S });
        s += arrow('z2', 'M322,232 L300,156', 'k', { svg: S });
        s += dots('z1', 'k', { n: 1, dur: 3 }) + dots('z2', 'k', { n: 1, dur: 3.6 });
        s += T(236, 200, '켜질 때 등록', 'lbl sm', 'middle');
        s += user(40, 236, '나');
        s += arrow('z3', 'M52,224 C60,170 90,140 116,130', 'c', { svg: S });
        s += arrow('z4', 'M116,140 C96,166 80,200 62,222', 'c', { svg: S, dash: true });
        s += arrow('z5', 'M56,266 L146,266', 'k', { svg: S });
        s += dots('z3', 'c', { n: 1, dur: 3 }) + dots('z4', 'c', { n: 1, dur: 3 }) + dots('z5', 'k', { n: 1, dur: 3 });
        s += T(58, 176, '어디로 가?', 'lbl sm') + T(78, 208, 'hs2-a 로', 'lbl sm') + T(100, 280, 'SQL', 'lbl sm', 'middle');
        svg(S, s);
    })();

    // ---------- JDBC 주소 ----------
    (function () {
        let s = '';
        const chips = [
            ['zk1 … zk5 .example.com :2181', 'c'],
            ['zooKeeperNamespace=hiveserver2', 'n'],
            ['transportMode=http;httpPath=cliservice', 'k'],
            ['user=analyst;password=********', 'k'],
            ['?tez.queue.name=analytics', 'b']
        ];
        const ys = [18, 68, 118, 168, 218];
        chips.forEach((c, i) => {
            s += `<rect class="tok ${c[1]}" x="14" y="${ys[i]}" width="236" height="26"/>` +
                `<text class="tok-t ${c[1] === 'n' ? 'dark' : ''}" x="22" y="${ys[i] + 17}">${esc(c[0])}</text>`;
        });
        s += T(14, 262, ';  로 이어진 것 = 접속 조건', 'lbl sm') + T(14, 276, '?  뒤 = Hive 설정 (큐)', 'lbl sm');
        for (let i = 0; i < 5; i++) s += srv(292 + i * 44, 10, { cls: 'c', scale: 0.6 });
        s += T(292, 58, 'ZooKeeper 5대', 'lbl sm');
        s += list(292, 74, 214, 30, [{ t: 'hs2-a, hs2-b 가 살아 있음', cls: 'mono' }]);
        s += srv(330, 132, { cls: 'k', label: 'HiveServer2' });
        s += T(388, 150, 'http :10001 /cliservice', 'lbl sm') + T(388, 164, '계정 analyst 로 들어감', 'lbl sm');
        s += srv(330, 236, { cls: 'b', label: 'ResourceManager' });
        s += box(388, 252, 92, 15, 'analytics', 'b', 9.5);
        const S = 'hc-jdbc';
        s += arrow('j1', 'M250,31 L288,31', 'c', { svg: S });
        s += arrow('j2', 'M250,81 L290,89', 'k', { svg: S, dash: true });
        s += arrow('j3', 'M250,131 L326,150', 'k', { svg: S });
        s += arrow('j4', 'M250,181 L326,168', 'k', { svg: S });
        s += arrow('j5', 'M250,231 L326,258', 'b', { svg: S });
        s += dots('j1', 'c', { n: 1, dur: 2.5 }) + dots('j3', 'k', { n: 1, dur: 2.5 }) + dots('j4', 'k', { n: 1, dur: 3 }) + dots('j5', 'b', { n: 1, dur: 3.5 });
        svg(S, s);
    })();

    // ---------- ?card=key — 글 안에 한 장만 넣을 때 ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.hc-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
