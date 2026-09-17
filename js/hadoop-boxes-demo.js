/**
 * hadoop-boxes-demo.js — 하둡 상자 그림 여섯 장
 *
 * 서버 한 대를 3차원 상자 하나로 그린다. 그림은 전부 JS 가 SVG 문자열로 조립한다.
 * 색은 css/style.css 토큰만 쓴다 — 파랑(navy)은 접속 주소가 직접 가리키는 것,
 * 회색 네모는 데이터 조각, 벽돌색(oxide) 네모는 계산 조각, 점선은 목록.
 * 주소·이름·숫자는 전부 설명용 예시다.
 *
 * ?fig=N 이 붙으면 N번 그림만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 */
(function () {
    'use strict';
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const T = (x, y, str, cls = 'lbl', anchor = 'start') =>
        `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(str)}</text>`;

    // 3차원 상자. 앞면 (x,y,w,h), 깊이 d 만큼 위와 오른쪽으로 빠진다.
    function cube(x, y, w, h, o = {}) {
        const d = o.d == null ? 14 : o.d, cls = o.cls || '';
        const top = `${x},${y} ${x + d},${y - d} ${x + w + d},${y - d} ${x + w},${y}`;
        const side = `${x + w},${y} ${x + w + d},${y - d} ${x + w + d},${y + h - d} ${x + w},${y + h}`;
        let s = `<g class="cube ${cls}"><polygon class="top" points="${top}"/><polygon class="side" points="${side}"/>` +
            `<rect class="front" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
        const cx = x + w / 2;
        if (o.label) s += `<text class="t" x="${cx}" y="${y + (o.sub ? h / 2 - 3 : h / 2 + 5)}" text-anchor="middle">${esc(o.label)}</text>`;
        if (o.sub) s += `<text class="s" x="${cx}" y="${y + h / 2 + 14}" text-anchor="middle">${esc(o.sub)}</text>`;
        return s + (o.inner || '') + '</g>';
    }
    // 워커 상자 — 안에 역할 칸 둘. data: 회색 데이터 조각, task: 벽돌색 계산 조각
    function worker(x, y, name, o = {}) {
        const w = o.w || 140, h = 92, slots = ['DataNode', 'NodeManager'];
        let inner = `<text class="t" x="${x + w / 2}" y="${y + 17}" text-anchor="middle" style="font-size:12.5px">${esc(name)}</text>`;
        slots.forEach((sl, i) => {
            const sy = y + 26 + i * 30;
            const on = !o.dim || o.dim.indexOf(sl) < 0;
            inner += `<rect class="slot ${on ? 'on' : ''}" x="${x + 8}" y="${sy}" width="${w - 16}" height="24"/>` +
                `<text class="slot-t ${on ? '' : 'dim'}" x="${x + 14}" y="${sy + 16}">${esc(sl)}</text>`;
        });
        const dn = (o.data || []).length;
        (o.data || []).forEach((b, k) => { inner += sq(x + w - 30 - (dn - 1 - k) * 22, y + 29, b, 'g', 18); });
        if (o.task) inner += sq(x + w - 30, y + 59, o.task, 'b', 18);
        return cube(x, y, w, h, { inner });
    }
    function sq(x, y, n, cls, size = 20) {
        return `<rect class="sq ${cls}" x="${x}" y="${y}" width="${size}" height="${size}"/>` +
            `<text class="sq-t" x="${x + size / 2}" y="${y + size / 2 + 4}" text-anchor="middle">${esc(n)}</text>`;
    }
    function card(x, y, w, h, lines) {
        let s = `<rect class="card" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
        lines.forEach((ln, i) => {
            const cls = typeof ln === 'string' ? 'card-t' : 'card-t ' + (ln.cls || '');
            const txt = typeof ln === 'string' ? ln : ln.t;
            s += `<text class="${cls}" x="${x + 12}" y="${y + 20 + i * 18}">${esc(txt)}</text>`;
        });
        return s;
    }
    // 화살표. via 는 꺾이는 점들 "x,y x,y". marker id 는 그림마다 다르게 (hb1-ar 처럼)
    function arrow(x1, y1, x2, y2, o = {}) {
        const id = o.id;
        let s = `<path class="ar ${o.cls || ''}" d="M${x1},${y1} ${o.via ? 'L' + o.via.split(' ').join(' L') : ''} L${x2},${y2}" marker-end="url(#${id})"/>`;
        if (o.label) {
            const lx = o.lx != null ? o.lx : (x1 + x2) / 2, ly = o.ly != null ? o.ly : (y1 + y2) / 2 - 6;
            s += T(lx, ly, o.label, 'lbl' + (o.lcls ? ' ' + o.lcls : ''), o.anchor || 'middle');
        }
        return s;
    }
    function num(x, y, n) {
        return `<rect class="num" x="${x - 10}" y="${y - 10}" width="20" height="20"/>` +
            `<text class="num-t" x="${x}" y="${y + 4}" text-anchor="middle">${n}</text>`;
    }
    function tok(x, y, str, cls = '') {
        const w = Math.round(str.length * 7.3 + 18);
        return { w, s: `<rect class="tok ${cls}" x="${x}" y="${y}" width="${w}" height="24"/><text class="tok-t" x="${x + 9}" y="${y + 16.5}">${esc(str)}</text>` };
    }
    function svg(n, w, h, inner) {
        const id = 'hb' + n + '-ar';
        const defs = `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="mk"/></marker>` +
            `<marker id="${id}a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="mk a"/></marker></defs>`;
        const host = document.getElementById('hb-fig' + n);
        if (host) host.innerHTML = `<svg viewBox="0 0 ${w} ${h}" role="img">${defs}${inner}</svg>`;
        return id;
    }

    // ---------- 1. 클러스터 = 서버 여러 대 ----------
    (function () {
        let s = '';
        s += T(60, 42, '역할이 하나씩인 서버', 'lbl grp');
        s += cube(60, 60, 160, 64, { label: 'NameNode', sub: 'HDFS 조각 목록 담당' });
        s += cube(250, 60, 190, 64, { label: 'ResourceManager', sub: 'YARN 자원 배분 담당' });
        s += T(560, 42, 'ZooKeeper 5대 (살아 있는 서버 목록을 다섯 벌 같이 든다)', 'lbl grp');
        for (let i = 0; i < 5; i++) s += cube(560 + i * 104, 68, 84, 50, { d: 10, label: 'ZooKeeper', sub: 'zk' + (i + 1) });
        s += T(60, 172, 'Hive', 'lbl grp');
        s += cube(60, 190, 160, 64, { label: 'HiveServer2', sub: 'hs2-a  SQL 을 받는다' });
        s += cube(250, 190, 160, 64, { label: 'HiveServer2', sub: 'hs2-b  SQL 을 받는다' });
        s += cube(440, 190, 170, 64, { label: 'Metastore', sub: '테이블 목록을 갖고 있다' });
        s += cube(640, 190, 150, 64, { label: 'Metastore DB', sub: 'MySQL 같은 보통 DB', cls: 'n' });
        s += T(60, 306, '워커 (실제로는 수십에서 수백 대)', 'lbl grp');
        for (let i = 0; i < 6; i++) s += worker(60 + i * 172, 324, '워커 ' + (i + 1));
        s += T(1100, 380, '…', 'lbl k');
        svg(1, 1120, 440, s);
    })();

    // ---------- 2. HDFS ----------
    (function () {
        const id = 'hb2-ar';
        let s = '';
        s += `<rect class="file" x="40" y="70" width="170" height="86"/>`;
        s += T(125, 104, 'clicks.parquet', 'lbl k', 'middle') + T(125, 126, '384 MB 파일 하나', 'lbl small', 'middle');
        s += arrow(212, 113, 262, 113, { id, label: '128 MB 씩', ly: 100 });
        [0, 1, 2].forEach(i => { s += sq(270, 70 + i * 34, i + 1, 'g', 28); s += T(306, 90 + i * 34, '조각 ' + (i + 1), 'lbl small'); });
        s += cube(500, 60, 180, 70, { label: 'NameNode', sub: '데이터는 없다. 목록만' });
        s += card(720, 46, 360, 100, [{ t: '어느 조각이 어느 상자에 있나', cls: 'h' }, '조각 1 →  워커 1, 워커 3, 워커 5', '조각 2 →  워커 2, 워커 4, 워커 6', '조각 3 →  워커 1, 워커 2, 워커 4']);
        s += arrow(682, 95, 716, 95, { id });
        s += arrow(300, 176, 300, 300, { id, label: '세 벌씩 흩어 넣는다', lx: 312, ly: 240, anchor: 'start' });
        const where = { 1: ['1', '3'], 2: ['2', '3'], 3: ['1'], 4: ['2', '3'], 5: ['1'], 6: ['2'] };
        for (let i = 0; i < 6; i++) s += worker(60 + i * 172, 314, '워커 ' + (i + 1), { dim: ['NodeManager'], data: where[i + 1] });
        svg(2, 1120, 430, s);
    })();

    // ---------- 3. YARN ----------
    (function () {
        const id = 'hb3-ar';
        let s = '';
        s += card(40, 56, 250, 76, [{ t: '내 쿼리', cls: 'h' }, { t: 'SELECT count(*) FROM ad_click', cls: 'mono' }, { t: 'tez.queue.name=analytics', cls: 'mono' }]);
        s += arrow(292, 94, 356, 94, { id, label: '자원 주세요', ly: 82 });
        const rx = 360, ry = 46;
        let inner = `<text class="t" x="${rx + 130}" y="${ry + 24}" text-anchor="middle">ResourceManager</text>`;
        [['default', 0.55, false], ['analytics', 0.75, true], ['adhoc', 0.35, false]].forEach((ln, i) => {
            const ly = ry + 40 + i * 25;
            inner += `<rect class="lane ${ln[2] ? 'on' : ''}" x="${rx + 14}" y="${ly}" width="${Math.round(230 * ln[1])}" height="18"/>` +
                `<text class="lane-t" x="${rx + 20}" y="${ly + 13}">${ln[0]}${ln[2] ? '  ← 내 쿼리가 서는 줄' : ''}</text>`;
        });
        s += cube(rx, ry, 260, 124, { inner });
        s += T(rx + 276, ry + 60, '큐 = 자원을 나누는 줄. 서버가 아니다', 'lbl small');
        s += T(700, 84, '쿼리를 계산 조각 4개로 나눈다', 'lbl');
        for (let i = 0; i < 4; i++) s += sq(700 + i * 30, 96, 'T' + (i + 1), 'b', 24);
        s += arrow(760, 128, 760, 300, { id, label: '데이터 조각이 있는 상자에 얹는다', lx: 772, ly: 220, anchor: 'start' });
        const data = { 1: ['1', '3'], 2: ['2', '3'], 3: ['1'], 4: ['2', '3'], 5: ['1'], 6: ['2'] };
        const task = { 1: 'T1', 2: 'T2', 4: 'T3', 5: 'T4' };
        for (let i = 0; i < 6; i++) s += worker(60 + i * 172, 314, '워커 ' + (i + 1), { data: data[i + 1], task: task[i + 1] });
        svg(3, 1120, 430, s);
    })();

    // ---------- 4. Hive ----------
    (function () {
        const id = 'hb4-ar';
        let s = '';
        s += `<rect class="file" x="40" y="150" width="130" height="60"/>` + T(105, 176, '내 컴퓨터', 'lbl k', 'middle') + T(105, 195, 'beeline, DBeaver', 'lbl small', 'middle');
        s += cube(240, 140, 180, 80, { label: 'HiveServer2', sub: 'SQL 을 받는 서버', cls: 'a' });
        s += arrow(172, 180, 236, 180, { id, label: 'SQL', ly: 168 });
        s += cube(560, 40, 190, 74, { label: 'Metastore', sub: '테이블 목록만. 데이터 없음' });
        s += card(780, 26, 320, 108, [{ t: 'adlog.ad_click', cls: 'h' }, '컬럼: req_id, ad_id, ts', '형식: parquet', { t: '위치: hdfs://…:8020/warehouse/adlog.db/ad_click/', cls: 'mono' }]);
        s += arrow(752, 78, 776, 78, { id });
        s += cube(575, 160, 160, 56, { label: 'Metastore DB', sub: 'MySQL 같은 보통 DB', cls: 'n' });
        s += arrow(655, 118, 655, 156, { id, label: '목록을 저장', lx: 668, ly: 142, anchor: 'start' });
        s += arrow(424, 150, 556, 80, { id, label: 'ad_click 어디 있어?', lx: 470, ly: 104 });
        s += arrow(556, 100, 424, 176, { id, label: 'hdfs://…/ad_click/  컬럼 3개', lx: 480, ly: 244 });
        s += T(780, 236, 'HDFS 워커 상자들 (조각이 여기 있다)', 'lbl grp');
        for (let i = 0; i < 3; i++) s += worker(780 + i * 112, 254, '워커 ' + (i + 1), { w: 100, data: [String(i + 1)] });
        s += arrow(330, 220, 776, 300, { id: id + 'a', cls: 'a', via: '330,300', label: '그 위치의 조각을 읽어 세라 (Tez)', lx: 560, ly: 292 });
        svg(4, 1120, 380, s);
    })();

    // ---------- 5. 주소 한 줄이 가리키는 상자 ----------
    (function () {
        const id = 'hb5-ar';
        let s = '';
        const rows = [
            [['jdbc:hive2://', ''], ['zk1.example.com:2181, … , zk5.example.com:2181', 'a'], ['/', ''], [';serviceDiscoveryMode=zooKeeper', '']],
            [[';zooKeeperNamespace=hiveserver2', ''], [';transportMode=http;httpPath=cliservice', ''], [';user=analyst;password=********', 'b']],
            [['?tez.queue.name=analytics', 'a']]
        ];
        const pos = {};
        rows.forEach((row, r) => {
            let x = r === 2 ? 860 : 40; const y = 30 + r * 34;
            row.forEach((t, i) => { const k = tok(x, y, t[0], t[1]); s += k.s; pos[r + '' + i] = { x, w: k.w, y }; x += k.w + 8; });
        });
        s += T(60, 168, 'ZooKeeper 안에 든 목록', 'lbl grp');
        s += card(60, 178, 480, 80, [{ t: '/hiveserver2', cls: 'mono' }, { t: '지금 살아 있는 HiveServer2', cls: 'h' }, 'hs2-a  …:10001      hs2-b  …:10001']);
        s += T(60, 286, 'ZooKeeper 5대 — 주소에 적힌 다섯 서버가 이것. 같은 목록을 다섯 벌 든다', 'lbl grp');
        for (let i = 0; i < 5; i++) s += cube(60 + i * 104, 304, 84, 50, { d: 10, label: 'ZooKeeper', sub: 'zk' + (i + 1), cls: 'a' });
        s += T(720, 168, 'HiveServer2 — 목록에 적힌 곳으로 간다', 'lbl grp');
        s += cube(720, 188, 170, 66, { label: 'HiveServer2', sub: 'hs2-a  http :10001/cliservice', cls: 'a' });
        s += cube(900, 188, 170, 66, { label: 'HiveServer2', sub: 'hs2-b  http :10001/cliservice', cls: 'a' });
        s += T(720, 300, 'ResourceManager — 큐 이름만 주소에 있다', 'lbl grp');
        const rx = 720, ry = 318;
        s += cube(rx, ry, 300, 62, { inner: `<text class="t" x="${rx + 12}" y="${ry + 20}">ResourceManager</text>` +
            `<rect class="lane on" x="${rx + 12}" y="${ry + 30}" width="210" height="18"/><text class="lane-t" x="${rx + 18}" y="${ry + 43}">analytics  ← 내 쿼리가 서는 줄</text>` });
        const zk = pos['01'];
        s += arrow(zk.x + 24, zk.y + 24, 56, 330, { id: id + 'a', cls: 'a', via: `${zk.x + 24},59 20,59 20,330` });
        const ns = pos['10'];
        s += arrow(ns.x + ns.w / 2, ns.y + 24, ns.x + ns.w / 2, 174, { id, label: '이 폴더의 목록을 읽는다', lx: ns.x + ns.w / 2 + 10, ly: 140, anchor: 'start' });
        const tm = pos['11'];
        s += arrow(tm.x + tm.w / 2, tm.y + 24, 790, 174, { id: id + 'a', cls: 'a', label: '말하는 방식', lx: 700, ly: 140 });
        const up = pos['12'];
        s += arrow(up.x + up.w / 2, up.y + 24, 985, 174, { id: id + 'a', cls: 'a', label: '계정', lx: 960, ly: 140 });
        const tz = pos['20'];
        s += arrow(tz.x + tz.w / 2, tz.y + 24, 1036, 350, { id: id + 'a', cls: 'a', via: `${tz.x + tz.w / 2},140 1108,140 1108,350` });
        s += arrow(540, 218, 716, 226, { id, label: '목록에 적힌 주소로', lx: 628, ly: 212 });
        svg(5, 1120, 400, s);
    })();

    // ---------- 6. 쿼리 한 건이 지나는 길 ----------
    (function () {
        const id = 'hb6-ar';
        let s = '';
        s += `<rect class="file" x="40" y="190" width="130" height="64"/>` + T(105, 218, '내 컴퓨터', 'lbl k', 'middle') + T(105, 237, 'beeline, DBeaver', 'lbl small', 'middle');
        s += T(250, 42, 'ZooKeeper', 'lbl grp');
        for (let i = 0; i < 5; i++) s += cube(250 + i * 74, 60, 62, 42, { d: 9, label: 'ZK', sub: 'zk' + (i + 1), cls: 'a' });
        s += cube(250, 190, 190, 74, { label: 'HiveServer2', sub: 'hs2-a', cls: 'a' });
        s += cube(560, 50, 180, 70, { label: 'Metastore', sub: '테이블 목록' });
        s += cube(560, 190, 200, 74, { label: 'ResourceManager', sub: '큐 analytics' });
        s += T(560, 322, '워커', 'lbl grp');
        for (let i = 0; i < 4; i++) s += worker(560 + i * 140, 340, '워커 ' + (i + 1), { w: 124, data: [String(i + 1)], task: 'T' });
        s += arrow(105, 186, 246, 80, { id, via: '105,80' }); s += num(105, 132, 1);
        s += arrow(280, 106, 150, 186, { id, via: '280,140 150,140' }); s += num(215, 140, 2);
        s += arrow(172, 222, 246, 222, { id: id + 'a', cls: 'a' }); s += num(209, 208, 3);
        s += arrow(444, 190, 556, 90, { id }); s += num(500, 140, 4);
        s += arrow(454, 227, 556, 227, { id }); s += num(505, 213, 5);
        s += arrow(660, 268, 660, 336, { id }); s += num(676, 302, 6);
        s += arrow(556, 392, 350, 268, { id, via: '350,392' }); s += num(450, 378, 7);
        s += arrow(246, 245, 172, 245, { id, cls: 'thin', label: '결과', lx: 209, ly: 262 });
        svg(6, 1120, 450, s);
    })();

    // ---------- ?fig=N — 글 안에 한 장만 넣을 때 ----------
    const fig = new URLSearchParams(location.search).get('fig');
    if (fig) document.querySelectorAll('.hb-sec').forEach(sec => { if (sec.dataset.fig !== fig) sec.hidden = true; });
})();
