/**
 * data-handoff-demo.js — 데이터 건네기 카드 여덟 장
 *
 * 팀에서 팀으로 데이터를 옮기는 방법 하나가 카드 한 장. 점이 흐르는 방향이 데이터가 가는 방향이다.
 * 색은 css/style.css 토큰만 — 파랑(navy) 놓여 있는 것(테이블, 파일, DB), 벽돌색(oxide) 흐르는 것(토픽, 변경 로그),
 * 먹색 부르는 것(서비스, API), 회색 옮기는 도구(배치 작업, 수집기).
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
    function labelUnder(cx, y, label, cls) {
        const w = Math.max(40, tw(label) + 12);
        return box(cx - w / 2, y, w, 17, label, cls, 10);
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
    // 테이블 아이콘 56x44 — 머리줄 + 줄 셋
    function table(x, y, o = {}) {
        let s = `<g class="tbl"><rect class="tbl-body" x="${x}" y="${y}" width="56" height="44"/><rect class="f-a" x="${x}" y="${y}" width="56" height="10"/>`;
        for (let i = 1; i <= 3; i++) s += `<line class="tbl-ln" x1="${x}" y1="${y + 10 + i * 11}" x2="${x + 56}" y2="${y + 10 + i * 11}"/>`;
        s += `<line class="tbl-ln" x1="${x + 20}" y1="${y + 10}" x2="${x + 20}" y2="${y + 44}"/></g>`;
        if (o.label) s += labelUnder(x + 28, y + 50, o.label, 'a');
        if (o.sub) s += T(x + 28, y + 50 + 30, o.sub, 'lbl sm', 'middle');
        return s;
    }
    // DB 원통
    function db(x, y, o = {}) {
        let s = `<ellipse class="db" cx="${x}" cy="${y}" rx="18" ry="6"/><path class="db" d="M${x - 18},${y} v28 a18,6 0 0 0 36,0 v-28"/>`;
        if (o.label) s += labelUnder(x, y + 40, o.label, 'a');
        if (o.sub) s += T(x, y + 40 + 30, o.sub, 'lbl sm', 'middle');
        return s;
    }
    // Kafka 토픽 — 칸 여섯의 긴 상자
    function topic(x, y, o = {}) {
        const w = o.w || 96;
        let s = `<rect class="tp" x="${x}" y="${y}" width="${w}" height="20"/>`;
        for (let i = 1; i < 6; i++) s += `<line class="tp-ln" x1="${x + (w / 6) * i}" y1="${y}" x2="${x + (w / 6) * i}" y2="${y + 20}"/>`;
        if (o.label) s += labelUnder(x + w / 2, y + 26, o.label, 'b');
        if (o.sub) s += T(x + w / 2, y + 26 + 30, o.sub, 'lbl sm', 'middle');
        return s;
    }
    // 파일 (접힌 귀)
    function file(x, y, o = {}) {
        let s = `<path class="file" d="M${x},${y} h30 l12,12 v34 h-42 z"/><path class="file" d="M${x + 30},${y} v12 h12"/>`;
        if (o.label) s += labelUnder(x + 21, y + 52, o.label, 'a');
        return s;
    }
    // 폴더 (버킷)
    function folder(x, y, o = {}) {
        let s = `<path class="fold" d="M${x},${y + 6} h22 l6,-6 h30 v40 h-58 z"/><rect class="fold-tab" x="${x}" y="${y + 12}" width="58" height="28"/>`;
        if (o.label) s += labelUnder(x + 29, y + 46, o.label, 'a');
        if (o.sub) s += T(x + 29, y + 46 + 30, o.sub, 'lbl sm', 'middle');
        return s;
    }
    // 옮기는 도구 (회색 상자) + 시계
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
    function list(x, y, w, h, lines) {
        let s = `<rect class="list" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
        lines.forEach((ln, i) => {
            const t = typeof ln === 'string' ? ln : ln.t, cls = typeof ln === 'string' ? '' : ln.cls || '';
            s += `<text class="list-t ${cls}" x="${x + 9}" y="${y + 15 + i * 14}">${esc(t)}</text>`;
        });
        return s;
    }
    function chip(x, y, str, cls = 'k') {
        const w = Math.round(str.length * 6 + 16);
        return `<rect class="tok ${cls}" x="${x}" y="${y}" width="${w}" height="22"/><text class="tok-t ${cls === 'n' ? 'dark' : ''}" x="${x + 8}" y="${y + 15}">${esc(str)}</text>`;
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

    // ---------- 1. 같은 창고, 권한만 ----------
    (function () {
        const S = 'dh-grant'; let s = '';
        s += T(40, 26, '팀 A 의 창고 테이블', 'lbl sm');
        s += table(40, 40, { label: 'adlog.ad_click', sub: '하루 228만 줄' });
        s += chip(150, 52, 'GRANT SELECT ON adlog.ad_click TO team_b', 'c');
        s += T(150, 90, '권한 한 줄만 간다. 데이터는 그 자리에 있다', 'lbl sm');
        s += user(420, 60, '팀 B 분석가');
        s += list(300, 170, 200, 44, [{ t: 'SELECT count(*)', cls: 'mono' }, { t: 'FROM adlog.ad_click …', cls: 'mono' }]);
        s += arrow('g1', 'M420,102 L420,166', 'k', { svg: S });
        s += arrow('g2', 'M296,190 C200,190 120,150 96,90', 'a', { svg: S, dash: true });
        s += dots('g1', 'k', { n: 1, dur: 3 }) + dots('g2', 'a', { n: 2, dur: 3 });
        s += T(190, 236, '읽기만 창고 안에서 일어난다', 'lbl sm');
        s += T(40, 270, '같은 Hive, 같은 웨어하우스를 쓸 때. 가장 싸고 가장 빠르다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 남의 DB 를 배치로 끌어오기 ----------
    (function () {
        const S = 'dh-batch'; let s = '';
        s += T(40, 26, '팀 A 운영 DB', 'lbl sm');
        s += db(80, 70, { label: 'orders (MySQL)' });
        s += tool(190, 60, 140, { label: '배치 작업', sub: 'Spark JDBC, Airbyte', clock: true });
        s += T(190, 118, '매일 03:00 한 번', 'lbl sm');
        s += T(190, 132, 'Sqoop 은 2021 년 은퇴', 'lbl sm');
        s += T(400, 26, '우리 창고', 'lbl sm');
        s += table(400, 40, { label: 'dw.orders', sub: '어제까지' });
        s += arrow('b1', 'M102,76 L186,76', 'a', { svg: S });
        s += arrow('b2', 'M334,76 L396,60', 'a', { svg: S });
        s += burst('b1', 'a', 0.05, 0.35, 8) + burst('b2', 'a', 0.2, 0.5, 8);
        s += list(40, 180, 300, 58, [{ t: '전체 복사: 매일 표 전체를 다시', cls: '' }, { t: '증분 복사: updated_at > 어제 03:00 인 행만', cls: '' }, { t: '조건: 운영 DB 에 읽기 계정과 시각 컬럼이 있어야', cls: '' }]);
        s += T(40, 270, '하루 한 번이면 충분하고, 상대 DB 를 직접 읽어도 될 때', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. CDC — 바뀐 것만 흘려보내기 ----------
    (function () {
        const S = 'dh-cdc'; let s = '';
        s += T(40, 26, '팀 A 운영 DB', 'lbl sm');
        s += db(70, 70, { label: 'orders' });
        s += `<rect class="tp" x="40" y="132" width="60" height="14"/>` + T(70, 160, '변경 로그(binlog)', 'lbl sm', 'middle');
        s += tool(150, 60, 96, { label: 'Debezium', sub: '변경을 읽어 보냄' });
        s += topic(290, 68, { label: 'topic orders.cdc' });
        s += table(430, 44, { label: 'dw.orders', sub: '초 단위로 따라감' });
        s += arrow('c1', 'M100,139 C120,139 130,80 146,80', 'b', { svg: S });
        s += arrow('c2', 'M250,78 L286,78', 'b', { svg: S });
        s += arrow('c3', 'M390,78 L426,66', 'b', { svg: S });
        s += dots('c1', 'b', { n: 2, dur: 2.4 }) + dots('c2', 'b', { n: 1, dur: 1.6 }) + dots('c3', 'b', { n: 1, dur: 1.6 });
        s += list(40, 190, 320, 44, ['INSERT, UPDATE, DELETE 한 건마다 메시지 한 개', '배치와 달리 「지금 상태」를 몇 초 뒤에 볼 수 있다']);
        s += T(40, 270, '운영 DB 의 변경을 거의 실시간으로 받아야 할 때', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 파일 놓고 경로 알려 주기 ----------
    (function () {
        const S = 'dh-file'; let s = '';
        s += T(40, 26, '팀 A', 'lbl sm');
        s += tool(40, 50, 110, { label: '배치 작업', sub: '매일 04:00', clock: true });
        s += folder(220, 46, { label: 's3://adlog/ad_click/' });
        s += list(200, 130, 220, 44, [{ t: 'dt=2026-09-17/part-0001.parquet', cls: 'mono' }, { t: 'dt=2026-09-17/part-0002.parquet', cls: 'mono' }]);
        s += user(440, 60, '팀 B');
        s += arrow('f1', 'M154,70 L216,70', 'a', { svg: S });
        s += arrow('f2', 'M282,70 L424,70', 'a', { svg: S, dash: true });
        s += burst('f1', 'a', 0.05, 0.3, 8, 3) + burst('f2', 'a', 0.5, 0.75, 8, 3);
        s += T(340, 60, '경로만 알려 준다', 'lbl sm', 'middle');
        s += T(40, 200, '705 MB 파일 하나가 하루치. 받는 쪽은 자기 시간에 읽는다', 'lbl sm');
        s += T(40, 216, '어제 파일은 그대로 남아 다시 읽을 수 있다', 'lbl sm');
        s += T(40, 270, '하루 한 번, 대량. 팀 간에 가장 흔한 방법', 'lbl');
        svg(S, s);
    })();

    // ---------- 5. 토픽에 넣어 두고 구독 ----------
    (function () {
        const S = 'dh-topic'; let s = '';
        s += T(40, 26, '팀 A 서비스', 'lbl sm');
        s += srv(50, 44, { cls: 'k', label: 'producer' });
        s += topic(170, 60, { label: 'topic ad.click', w: 110 });
        s += T(225, 122, '초당 26.4 건', 'lbl sm', 'middle');
        const cons = [['팀 B 대시보드', 40], ['팀 C 예산 소진', 130], ['팀 D 모델 학습', 220]];
        cons.forEach((c, i) => { s += srv(400, c[1], { cls: 'k', scale: 0.7, label: c[0] }); });
        s += arrow('t0', 'M98,70 L166,70', 'b', { svg: S });
        s += arrow('t1', 'M284,70 C340,70 350,58 396,58', 'b', { svg: S });
        s += arrow('t2', 'M284,70 C340,70 350,148 396,148', 'b', { svg: S });
        s += arrow('t3', 'M284,70 C340,70 350,238 396,238', 'b', { svg: S });
        s += dots('t0', 'b', { n: 2, dur: 2 }) + dots('t1', 'b', { n: 1, dur: 2.2 }) + dots('t2', 'b', { n: 1, dur: 2.2 }) + dots('t3', 'b', { n: 1, dur: 2.2 });
        s += T(170, 152, '같은 메시지를 세 팀이', 'lbl sm') + T(170, 166, '각자 속도로 받는다', 'lbl sm');
        s += T(40, 270, '실시간이고 받는 팀이 여럿일 때. 7일 보존이면 늦게 와도 된다', 'lbl');
        svg(S, s);
    })();

    // ---------- 6. API 건별 조회 ----------
    (function () {
        const S = 'dh-api'; let s = '';
        s += T(40, 26, '팀 B 서비스', 'lbl sm');
        s += srv(50, 44, { cls: 'k', label: '리포트 화면' });
        s += T(400, 26, '팀 A API', 'lbl sm');
        s += srv(420, 44, { cls: 'k', label: 'ads API' });
        s += chip(150, 22, 'GET /v1/ads/9931', 'k');
        s += chip(150, 100, '200  {"ad_id":9931,"status":"on"}', 'n');
        s += arrow('a1', 'M98,52 L416,52', 'k', { svg: S });
        s += arrow('a2', 'M416,90 L98,90', 'k', { svg: S, dash: true });
        s += dots('a1', 'k', { n: 1, dur: 2 }) + dots('a2', 'k', { n: 1, dur: 2 });
        s += list(40, 170, 330, 58, ['건 하나 = 요청 하나. 지금 상태가 온다', '228만 건을 받으려면 요청 228만 번', '그래서 대량 전달이 아니라 조회에 쓴다']);
        s += T(40, 270, '소량, 건별, 지금 값이 중요할 때', 'lbl');
        svg(S, s);
    })();

    // ---------- 7. 로그 파이프라인 ----------
    (function () {
        const S = 'dh-log'; let s = '';
        s += T(40, 26, '앱, 웹서버', 'lbl sm');
        s += srv(44, 44, { cls: 'k', label: 'nginx' });
        s += file(60, 150, {});
        s += T(81, 214, 'access.log', 'lbl sm', 'middle');
        s += tool(150, 60, 90, { label: '수집기', sub: 'Filebeat' });
        s += topic(280, 68, { label: 'topic ad.click', w: 90 });
        s += table(430, 44, { label: 'adlog.ad_click' });
        s += arrow('l0', 'M66,124 L66,146', 'k', { svg: S });
        s += arrow('l1', 'M104,172 C130,172 140,84 146,80', 'k', { svg: S });
        s += arrow('l2', 'M244,78 L276,78', 'b', { svg: S });
        s += arrow('l3', 'M374,78 L426,66', 'b', { svg: S });
        s += dots('l0', 'k', { n: 1, dur: 2 }) + dots('l1', 'k', { n: 1, dur: 2 }) + dots('l2', 'b', { n: 1, dur: 1.6 }) + dots('l3', 'b', { n: 1, dur: 1.6 });
        s += list(150, 170, 300, 44, ['팀 간 요청은 「이 로그 한 줄 남겨 주세요」 형태로 온다', '한 번 남기면 뒤 자리들은 이미 깔려 있다']);
        s += T(40, 270, '서비스에서 나오는 행동 기록을 창고까지. 한 번 깔면 계속 흐른다', 'lbl');
        svg(S, s);
    })();

    // ---------- 8. 창고 결과를 서비스로 되돌리기 ----------
    (function () {
        const S = 'dh-reverse'; let s = '';
        s += T(40, 26, '우리 창고', 'lbl sm');
        s += table(40, 40, { label: 'dw.user_segment', sub: '매일 새로 계산' });
        s += tool(160, 60, 120, { label: '배치 export', sub: 'reverse ETL', clock: true });
        s += db(330, 70, { label: 'Redis, MySQL' });
        s += T(400, 26, '팀 A 서비스', 'lbl sm');
        s += srv(420, 44, { cls: 'k', label: '광고 서버' });
        s += arrow('r1', 'M100,70 L156,76', 'a', { svg: S });
        s += arrow('r2', 'M284,76 L308,76', 'a', { svg: S });
        s += arrow('r3', 'M416,70 L352,78', 'k', { svg: S, dash: true });
        s += burst('r1', 'a', 0.05, 0.3, 8, 3) + burst('r2', 'a', 0.2, 0.45, 8, 3) + dots('r3', 'k', { n: 2, dur: 1.4 });
        s += T(384, 100, '건별로 읽음', 'lbl sm', 'middle');
        s += list(40, 180, 320, 44, ['창고는 느리고 서비스는 1ms 안에 답해야 한다', '그래서 결과를 서비스 옆 DB 에 옮겨 두고 읽게 한다']);
        s += T(40, 270, '분석 결과(세그먼트, 점수)를 운영 서비스가 써야 할 때', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.dh-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
