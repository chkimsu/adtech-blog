/**
 * cluster-roles-demo.js — Hadoop, Hive, Spark 가 노드 위 어디에 앉나. 카드 여섯 장
 *
 * 색은 css/style.css 토큰만 — 파랑(navy) 저장(HDFS), 벽돌색(oxide) 자원(YARN), 먹색 Hive, 회색 Spark 와 그 밖의 엔진.
 * 이름·숫자는 전부 설명용 예시다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
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
    // 테두리만 있는 상자 (컨테이너, 층)
    function frame(x, y, w, h, txt, cls, o = {}) {
        let s = `<rect class="fr fr-${cls}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
        if (txt) s += `<text class="fr-t fr-t-${cls}" x="${x + (o.center ? w / 2 : 8)}" y="${y + (o.ty || 15)}" text-anchor="${o.center ? 'middle' : 'start'}">${esc(txt)}</text>`;
        if (o.sub) s += `<text class="lbl sm" x="${x + (o.center ? w / 2 : 8)}" y="${y + (o.ty || 15) + 13}" text-anchor="${o.center ? 'middle' : 'start'}">${esc(o.sub)}</text>`;
        return s;
    }
    function labelUnder(cx, y, label, cls) {
        const w = Math.max(40, tw(label) + 12);
        return box(cx - w / 2, y, w, 17, label, cls, 10);
    }
    // 서버 아이콘 44x54. cls 첫 칸, cls2 둘째 칸
    function srv(x, y, o = {}) {
        const cls = o.cls || 'k', cls2 = o.cls2 || cls, sc = o.scale || 1;
        let s = `<g transform="translate(${x},${y}) scale(${sc})"><rect class="srv-body" x="0" y="0" width="44" height="54"/>` +
            `<rect class="f-${cls}" x="6" y="8" width="32" height="11"/><rect class="f-${cls2}" x="6" y="23" width="32" height="11"/>` +
            `<rect class="f-sunk" x="6" y="38" width="32" height="8"/><circle class="led" cx="33" cy="13.5" r="1.8"/><circle class="led" cx="33" cy="28.5" r="1.8"/></g>`;
        if (o.label) s += labelUnder(x + 22 * sc, y + 54 * sc + 6, o.label, o.lcls || cls);
        if (o.sub) s += T(x + 22 * sc, y + 54 * sc + (o.label ? 36 : 18), o.sub, 'lbl sm', 'middle');
        return s;
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
    function num(x, y, n) {
        return `<rect class="num" x="${x - 8}" y="${y - 8}" width="16" height="16"/><text class="num-t" x="${x}" y="${y + 3.5}" text-anchor="middle">${n}</text>`;
    }
    function svg(id, inner, h = 300) {
        const mk = c => `<marker id="m-${c}-${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="mk ${c}"/></marker>`;
        const host = document.getElementById(id);
        if (host) host.innerHTML =
            `<svg viewBox="0 0 520 ${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img"><defs>${mk('k')}${mk('a')}${mk('b')}${mk('c')}</defs>${inner}</svg>`;
    }

    // ---------- 1. 노드는 넷 ----------
    (function () {
        const S = 'cr-nodes'; let s = '';
        s += T(14, 16, '엣지 노드 — 내가 앉는 자리', 'lbl sm');
        s += user(40, 40, '나');
        s += srv(80, 24, { cls: 'k', cls2: 'c', label: 'edge', sub: 'beeline, spark-submit' });
        s += T(200, 16, '마스터 노드 — 목록과 자원의 머리', 'lbl sm');
        s += srv(200, 24, { cls: 'a', label: 'NameNode' });
        s += srv(300, 24, { cls: 'b', label: 'ResourceManager' });
        s += T(390, 16, '서비스 노드', 'lbl sm');
        s += srv(390, 24, { cls: 'k', label: 'HiveServer2' });
        s += srv(472, 24, { cls: 'k', scale: 0.75, sub: 'Metastore' });
        s += T(14, 150, '워커 노드 — 저장(DN)과 자리 배분(NM)이 한 대에. 실제로는 수십에서 수백 대', 'lbl sm');
        for (let i = 0; i < 6; i++) {
            const x = 20 + i * 82;
            s += srv(x, 162, { cls: 'a', cls2: 'b' });
            s += box(x - 6, 222, 26, 15, 'DN', 'a', 9.5) + box(x + 24, 222, 26, 15, 'NM', 'b', 9.5);
            s += T(x + 22, 252, '워커 ' + (i + 1), 'lbl sm', 'middle');
        }
        s += arrow('n1', 'M124,50 C170,50 380,50 418,50', 'k', { svg: S, dash: true });
        s += dots('n1', 'k', { n: 1, dur: 3 });
        s += T(40, 285, 'Hadoop, Hive, Spark 는 프로그램 이름이고 노드는 그 프로그램이 도는 자리다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 워커 한 대의 단면 — 층이 셋 ----------
    (function () {
        const S = 'cr-layers'; let s = '';
        s += T(40, 18, '워커 노드 한 대를 세로로 잘라 보면', 'lbl sm');
        // 바깥 상자
        s += `<rect class="fr fr-k" x="40" y="26" width="440" height="236"/>`;
        s += T(48, 42, '워커 3', 'lbl k');
        // 3층: 실행 컨테이너
        s += T(48, 66, '3층  실행 — 자리를 받아 도는 것', 'lbl sm');
        s += frame(60, 72, 110, 48, 'Tez 컨테이너', 'k', { center: true, sub: 'Hive 쿼리 조각' });
        s += frame(180, 72, 110, 48, 'Tez 컨테이너', 'k', { center: true, sub: 'Hive 쿼리 조각' });
        s += frame(300, 72, 150, 48, 'Spark executor', 'c', { center: true, sub: 'Spark 작업 조각' });
        // 2층: NodeManager
        s += T(48, 146, '2층  자리 배분 — YARN 이 CPU 와 메모리를 칸으로 나눠 위층에 내준다', 'lbl sm');
        s += `<rect class="f-b" x="60" y="152" width="390" height="26"/>` + T(70, 170, 'NodeManager', 'on');
        // 1층: 저장
        s += T(48, 204, '1층  저장 — HDFS', 'lbl sm');
        s += `<rect class="f-a" x="60" y="210" width="390" height="40"/>` + T(70, 226, 'DataNode — 디스크의 조각들', 'on');
        for (let i = 0; i < 5; i++) s += blk(250 + i * 36, 222, String(i + 1), 'a', 16);
        // 점: 조각에서 컨테이너로
        s += arrow('l1', 'M258,222 C250,190 170,150 160,122', 'a', { svg: S });
        s += arrow('l2', 'M294,222 C290,190 280,150 278,122', 'a', { svg: S });
        s += arrow('l3', 'M366,222 C370,190 405,150 405,122', 'a', { svg: S });
        s += dots('l1', 'a', { n: 1, dur: 2.6 }) + dots('l2', 'a', { n: 1, dur: 3 }) + dots('l3', 'a', { n: 1, dur: 2.2 });
        s += T(40, 286, '같은 상자 위에서 Hive 와 Spark 가 같은 조각을 읽는다. 다른 것은 3층의 프로그램뿐', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. Hive 쿼리의 길 ----------
    (function () {
        const S = 'cr-hive'; let s = '';
        s += user(34, 60, '나');
        s += T(14, 16, '엣지', 'lbl sm');
        s += srv(110, 40, { cls: 'k', label: 'HiveServer2' });
        s += srv(230, 10, { cls: 'k', scale: 0.8, label: 'Metastore' });
        s += srv(230, 110, { cls: 'b', scale: 0.8, label: 'ResourceManager' });
        s += T(360, 16, '워커들', 'lbl sm');
        for (let i = 0; i < 3; i++) {
            const y = 26 + i * 80;
            s += srv(360, y, { cls: 'a', cls2: 'b', scale: 0.8 });
            s += frame(410, y + 6, 96, 30, 'Tez 컨테이너', 'k', { center: true, ty: 19 });
            s += blk(396, y + 26, String(i + 1), 'a', 13);
        }
        s += arrow('h1', 'M56,78 L106,78', 'k', { svg: S }); s += num(80, 66, 1);
        s += arrow('h2', 'M158,60 C190,50 210,40 226,32', 'k', { svg: S }); s += num(190, 34, 2);
        s += arrow('h3', 'M158,84 C190,96 210,120 226,130', 'b', { svg: S }); s += num(190, 118, 3);
        s += arrow('h4', 'M266,130 C300,130 320,60 356,52', 'b', { svg: S });
        s += arrow('h5', 'M266,132 C300,132 320,132 356,132', 'b', { svg: S });
        s += arrow('h6', 'M266,134 C300,134 320,200 356,212', 'b', { svg: S }); s += num(300, 178, 4);
        s += arrow('h7', 'M356,150 C330,205 230,200 152,100', 'a', { svg: S, dash: true }); s += num(262, 190, 5);
        const cyc = 9;
        s += dots('h1', 'k', { seq: [0.02, 0.12], cyc }) + dots('h2', 'k', { seq: [0.14, 0.24], cyc }) + dots('h3', 'b', { seq: [0.26, 0.36], cyc });
        s += dots('h4', 'k', { seq: [0.38, 0.5], cyc }) + dots('h5', 'k', { seq: [0.38, 0.5], cyc }) + dots('h6', 'k', { seq: [0.38, 0.5], cyc });
        s += dots('h7', 'a', { seq: [0.6, 0.78], cyc });
        s += list(14, 196, 220, 86, ['1 SQL 을 HiveServer2 에', '2 Metastore 에 테이블 위치를 묻고', '3 YARN 에 자리를 달라 해서', '4 워커에 Tez 컨테이너를 띄운다', '5 결과가 HiveServer2 로 모인다']);
        s += T(14, 292, 'SQL 을 받는 것은 늘 켜져 있는 HiveServer2. 계산은 워커의 Tez 컨테이너', 'lbl');
        svg(S, s, 310);
    })();

    // ---------- 4. Spark 작업의 길 ----------
    (function () {
        const S = 'cr-spark'; let s = '';
        s += user(34, 60, '나');
        s += T(14, 16, '엣지', 'lbl sm');
        s += frame(80, 44, 96, 44, 'driver', 'c', { center: true, sub: 'spark-submit 이 띄움' });
        s += T(128, 104, '내 작업의 계획을 세우는 프로세스', 'lbl sm', 'middle');
        s += srv(230, 10, { cls: 'k', scale: 0.8, label: 'Metastore' });
        s += srv(230, 110, { cls: 'b', scale: 0.8, label: 'ResourceManager' });
        s += T(360, 16, '워커들', 'lbl sm');
        for (let i = 0; i < 3; i++) {
            const y = 26 + i * 80;
            s += srv(360, y, { cls: 'a', cls2: 'b', scale: 0.8 });
            s += frame(410, y + 6, 96, 30, 'executor', 'c', { center: true, ty: 19 });
            s += blk(396, y + 26, String(i + 1), 'a', 13);
        }
        s += arrow('s1', 'M56,66 L76,66', 'k', { svg: S }); s += num(66, 52, 1);
        s += arrow('s2', 'M178,56 C200,46 214,38 226,32', 'k', { svg: S }); s += num(200, 32, 2);
        s += arrow('s3', 'M178,76 C200,90 214,118 226,130', 'b', { svg: S }); s += num(200, 118, 3);
        s += arrow('s4', 'M266,130 C300,130 320,60 356,52', 'b', { svg: S });
        s += arrow('s5', 'M266,132 C300,132 320,132 356,132', 'b', { svg: S });
        s += arrow('s6', 'M266,134 C300,134 320,200 356,212', 'b', { svg: S }); s += num(300, 178, 4);
        s += arrow('s7', 'M408,64 C330,100 240,96 178,76', 'c', { svg: S, dash: true }); s += num(300, 100, 5);
        const cyc = 9;
        s += dots('s1', 'k', { seq: [0.02, 0.08], cyc }) + dots('s2', 'k', { seq: [0.1, 0.2], cyc }) + dots('s3', 'b', { seq: [0.22, 0.32], cyc });
        s += dots('s4', 'c', { seq: [0.34, 0.46], cyc }) + dots('s5', 'c', { seq: [0.34, 0.46], cyc }) + dots('s6', 'c', { seq: [0.34, 0.46], cyc });
        s += dots('s7', 'c', { seq: [0.55, 0.75], cyc });
        s += list(14, 196, 220, 86, ['1 spark-submit 이 driver 를 띄운다', '2 driver 가 Metastore 에 위치를 묻고', '3 YARN 에 자리를 달라 해서', '4 워커에 executor 를 띄운다', '5 driver 가 조각을 시키고 결과를 모은다']);
        s += T(14, 292, 'SQL 서버 대신 내 작업마다 driver 하나. 계산은 워커의 executor', 'lbl');
        svg(S, s, 310);
    })();

    // ---------- 5. 셋이 만나는 자리 ----------
    (function () {
        const S = 'cr-shared'; let s = '';
        s += T(200, 16, '한 테이블, 세 엔진', 'lbl sm');
        s += srv(220, 24, { cls: 'k', label: 'Metastore' });
        s += T(200, 150, 'HDFS 의 조각들', 'lbl sm');
        for (let i = 0; i < 6; i++) s += blk(200 + i * 22, 158, String(i + 1), 'a', 16);
        s += T(14, 16, 'Hive (Tez)', 'lbl sm'); s += frame(14, 24, 110, 40, 'HiveServer2 + Tez', 'k', { center: true, sub: 'YARN 자리를 받아' });
        s += T(14, 120, 'Spark', 'lbl sm'); s += frame(14, 128, 110, 40, 'driver + executor', 'c', { center: true, sub: 'YARN 자리를 받아' });
        s += T(14, 224, 'Trino', 'lbl sm'); s += frame(14, 232, 110, 40, 'coordinator + worker', 'c', { center: true, sub: 'YARN 안 씀. 자기 워커' });
        s += arrow('m1', 'M124,40 C170,40 190,44 216,46', 'k', { svg: S });
        s += arrow('m2', 'M124,140 C170,140 190,70 216,56', 'c', { svg: S });
        s += arrow('m3', 'M124,244 C170,244 190,90 216,64', 'c', { svg: S });
        s += arrow('f1', 'M124,52 C170,60 180,150 196,160', 'a', { svg: S, dash: true });
        s += arrow('f2', 'M124,152 C160,160 180,164 196,166', 'a', { svg: S, dash: true });
        s += arrow('f3', 'M124,256 C170,250 180,180 196,172', 'a', { svg: S, dash: true });
        s += dots('m1', 'k', { n: 1, dur: 3 }) + dots('m2', 'c', { n: 1, dur: 3.3 }) + dots('m3', 'c', { n: 1, dur: 3.6 });
        s += dots('f1', 'a', { n: 1, dur: 3 }) + dots('f2', 'a', { n: 1, dur: 3.3 }) + dots('f3', 'a', { n: 1, dur: 3.6 });
        s += list(340, 40, 172, 86, ['실선: Metastore 에 목록을 묻는다', { t: 'adlog.ad_click → hdfs://…/', cls: 'mono' }, '점선: HDFS 조각을 직접 읽는다', '같은 이름, 같은 파일. 엔진만 다르다', 'Metastore 가 공통 목록']);
        s += T(14, 292, '「Hive 테이블을 Spark 로 읽는다」가 가능한 이유가 이 그림이다', 'lbl');
        svg(S, s, 310);
    })();

    // ---------- 6. 이름표 정리 — 층으로 쌓기 ----------
    (function () {
        const S = 'cr-names'; let s = '';
        // 맨 위: SQL 을 받는 층
        s += frame(40, 20, 190, 44, 'Hive', 'k', { center: true, sub: 'SQL → 계획 → 엔진에 시킴' });
        s += frame(240, 20, 200, 44, 'Spark SQL, DataFrame', 'c', { center: true, sub: '코드 → 계획 → executor' });
        s += T(450, 46, '쓰는 층', 'lbl sm');
        // 엔진 층
        s += frame(40, 80, 90, 40, 'MapReduce', 'c', { center: true, sub: '옛 엔진' });
        s += frame(140, 80, 90, 40, 'Tez', 'k', { center: true, sub: 'Hive 의 기본 엔진' });
        s += frame(240, 80, 200, 40, 'Spark 엔진', 'c', { center: true, sub: '중간 결과를 메모리에' });
        s += T(450, 104, '엔진 층', 'lbl sm');
        // Hadoop 두 층
        s += `<rect class="f-b" x="40" y="140" width="400" height="34"/>` + T(240, 162, 'YARN — 자원 배분 (ResourceManager, NodeManager)', 'on', 'middle');
        s += `<rect class="f-a" x="40" y="184" width="400" height="34"/>` + T(240, 206, 'HDFS — 저장 (NameNode, DataNode)', 'on', 'middle');
        s += `<path class="brace" d="M448,140 h8 v78 h-8"/>` + T(462, 183, 'Hadoop', 'lbl k');
        // Metastore 옆
        s += `<rect class="list" x="40" y="232" width="400" height="24"/>` + T(240, 249, 'Metastore — 테이블 목록. Hive, Spark, Trino 가 같이 읽는다', 'lbl', 'middle');
        s += T(40, 290, 'Hadoop 은 아래 두 층의 이름. Hive 와 Spark 는 그 위에서 도는 프로그램', 'lbl');
        svg(S, s, 310);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.cr-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
