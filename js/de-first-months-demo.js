/**
 * de-first-months-demo.js — 데이터 플랫폼 팀에 새로 온 사람의 첫 여섯 달. 카드 여섯 장
 *
 * 색은 css/style.css 토큰만 — 파랑(navy) 데이터가 놓인 자리, 벽돌색(oxide) 시키는 것(Airflow, DAG, workflow),
 * 먹색 사람이 쓴 정의(YAML, SQL, Java), 회색 실행 엔진(Spark, Kyuubi, Flink).
 * 숫자는 어느 팀 저장소에서 센 값이고, 이름과 경로는 전부 바꾼 것이다.
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
    // 테두리만 있는 상자. cls: k 먹색, c 회색, a 파랑, b 벽돌색
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
    // 서버 아이콘 44x54
    function srv(x, y, o = {}) {
        const cls = o.cls || 'k', cls2 = o.cls2 || cls, sc = o.scale || 1;
        let s = `<g transform="translate(${x},${y}) scale(${sc})"><rect class="srv-body" x="0" y="0" width="44" height="54"/>` +
            `<rect class="f-${cls}" x="6" y="8" width="32" height="11"/><rect class="f-${cls2}" x="6" y="23" width="32" height="11"/>` +
            `<rect class="f-sunk" x="6" y="38" width="32" height="8"/><circle class="led" cx="33" cy="13.5" r="1.8"/><circle class="led" cx="33" cy="28.5" r="1.8"/></g>`;
        if (o.label) s += labelUnder(x + 22 * sc, y + 54 * sc + 6, o.label, o.lcls || cls);
        if (o.sub) s += T(x + 22 * sc, y + 54 * sc + (o.label ? 36 : 18), o.sub, 'lbl sm', 'middle');
        return s;
    }
    // 파일 모양 — 사람이 쓴 정의 (먹색). 오른쪽 위 귀가 접혀 있다
    function doc(x, y, w, h, title, lines) {
        let s = `<path class="doc" d="M${x},${y} h${w - 12} l12,12 v${h - 12} h${-w} z"/>` +
            `<path class="doc-ear" d="M${x + w - 12},${y} v12 h12"/>` +
            `<text class="doc-t" x="${x + 8}" y="${y + 17}">${esc(title)}</text>`;
        lines.forEach((ln, i) => { s += `<text class="doc-l" x="${x + 8}" y="${y + 33 + i * 12}">${esc(ln)}</text>`; });
        return s;
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
            s += `<circle class="dot ${cls}" r="${r}"><animateMotion dur="${dur}s" begin="${(i * dur / n + (o.begin || 0)).toFixed(2)}s" repeatCount="indefinite"><mpath href="#${pid}" xlink:href="#${pid}"/></animateMotion></circle>`;
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

    // ---------- 1. 저장소는 네 층 ----------
    (function () {
        const S = 'dm-map'; let s = '';
        s += T(14, 16, '원천', 'lbl sm');
        s += srv(14, 24, { cls: 'a', scale: 0.75, label: '운영 DB' });
        s += srv(14, 104, { cls: 'a', scale: 0.75, label: 'HTTP API' });
        s += srv(14, 214, { cls: 'a', scale: 0.75, label: '토픽' });
        s += T(120, 22, '시키는 것', 'lbl sm');
        s += frame(120, 34, 130, 64, 'Airflow', 'b', { center: true, ty: 24, sub: 'DAG 수십 개 (수급, 변환)' });
        s += doc(120, 124, 130, 72, '정의 파일', ['YAML  원천 정의', 'SQL   모델 수백 장', 'Java  실시간 잡 코드']);
        s += T(290, 22, '엔진', 'lbl sm');
        s += frame(290, 34, 110, 64, 'Spark, Kyuubi', 'c', { center: true, ty: 24, sub: 'SQL 과 배치가 여기서 돈다' });
        s += T(290, 196, '실시간', 'lbl sm');
        s += frame(290, 208, 110, 50, 'Flink', 'c', { center: true, ty: 20, sub: '잡 1개, 들어오는 대로' });
        s += T(440, 16, '창고', 'lbl sm');
        s += srv(440, 24, { cls: 'a', label: '창고 테이블' });
        s += T(462, 126, 'staging', 'lbl sm', 'middle');
        s += T(462, 139, 'mart', 'lbl sm', 'middle');
        s += T(462, 152, 'serving', 'lbl sm', 'middle');
        s += arrow('mp1', 'M48,44 C90,44 100,60 116,62', 'a', { svg: S });
        s += arrow('mp2', 'M48,124 C90,124 100,72 116,68', 'a', { svg: S });
        s += arrow('mp3', 'M48,236 C120,236 200,233 286,233', 'a', { svg: S });
        s += arrow('mp4', 'M250,66 L286,66', 'b', { svg: S });
        s += arrow('mp5', 'M400,66 C420,66 424,60 436,56', 'a', { svg: S });
        s += arrow('mp6', 'M400,233 C440,233 462,196 462,168', 'a', { svg: S });
        s += arrow('mp7', 'M185,124 L185,102', 'k', { svg: S, dash: true });
        s += T(190, 116, '읽는다', 'lbl sm');
        s += dots('mp1', 'a', { n: 1, dur: 3.2 }) + dots('mp2', 'a', { n: 1, dur: 3.6 });
        s += dots('mp4', 'b', { n: 1, dur: 2.4 }) + dots('mp5', 'a', { n: 1, dur: 2.4 });
        s += dots('mp3', 'a', { n: 3, dur: 3 }) + dots('mp6', 'a', { n: 2, dur: 2.6 });
        s += T(14, 292, '폴더 넷이 층 넷. 새로 온 사람은 수급, 모델, 부품, 실시간 순서로 올라간다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 첫 달, 수급 DAG 한 장 ----------
    (function () {
        const S = 'dm-extract'; let s = '';
        s += T(14, 16, '새로 온 사람이 쓴 것 (두 파일)', 'lbl sm');
        s += doc(14, 26, 150, 58, 'category.py', ['cron  5 0 * * *', 'days=-1  (어제 날짜)']);
        s += doc(14, 110, 150, 70, 'sources.yaml', ['type: hbase', 'path: hdfs://…/raw_category', 'format: orc']);
        s += frame(180, 44, 120, 54, 'Airflow 태스크', 'b', { center: true, ty: 22, sub: '매일 00:05' });
        s += frame(340, 54, 100, 36, 'Spark 커넥터', 'c', { center: true, ty: 22 });
        s += srv(356, 150, { cls: 'a', scale: 0.8, label: 'HBase 원천' });
        s += srv(450, 150, { cls: 'a', scale: 0.8, label: 'raw_category' });
        s += arrow('ex0', 'M164,55 C170,55 172,66 176,68', 'k', { svg: S, dash: true });
        s += arrow('ex0b', 'M164,140 C172,140 172,80 176,78', 'k', { svg: S, dash: true });
        s += arrow('ex1', 'M300,71 L336,71', 'b', { svg: S }); s += num(318, 58, 1);
        s += arrow('ex2', 'M374,146 C374,130 378,110 384,94', 'a', { svg: S }); s += num(396, 122, 2);
        s += arrow('ex3', 'M440,80 C470,80 468,120 468,146', 'a', { svg: S }); s += num(484, 112, 3);
        const cyc = 8;
        s += dots('ex1', 'b', { seq: [0.02, 0.15], cyc }) + dots('ex2', 'a', { seq: [0.2, 0.4], cyc }) + dots('ex3', 'a', { seq: [0.45, 0.65], cyc });
        s += list(14, 206, 230, 72, ['1 시각이 되면 태스크가 커넥터를 부른다', '2 커넥터가 원천 표를 읽고', '3 창고 경로에 orc 로 쓴다', '첫 두 주의 커밋이 거의 다 여기 붙었다']);
        s += T(14, 292, '첫 일감은 표 하나를 매일 복사하는 것. 그 팀의 규칙을 한 번에 다 밟는다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. SQL 한 장이 표 한 개 ----------
    (function () {
        const S = 'dm-dbt'; let s = '';
        s += doc(14, 24, 164, 92, 'agg_active_user.sql', ['config: 어디에, 어떤 형식으로', '-- 옛 배치 7-1 | AppUsageStats', 'select … from source(hourly)', 'group by user, client, version']);
        s += list(14, 150, 164, 76, ['모델 수백 장, 세 층', 'staging  원본 정리', 'mart  묶은 표', 'serving  내보내는 표']);
        s += frame(210, 30, 110, 40, 'Cosmos', 'b', { center: true, ty: 17, sub: 'SQL 을 태스크로 바꾼다' });
        s += frame(210, 100, 110, 80, 'Airflow', 'b', { ty: 14 });
        s += box(222, 124, 86, 18, 'hourly 태스크', 'b', 9.5);
        s += `<path class="ar b" d="M265,142 L265,148"/>`;
        s += box(222, 152, 86, 18, 'daily 태스크', 'b', 9.5);
        s += frame(350, 60, 90, 40, 'Kyuubi (Spark)', 'c', { center: true, ty: 24 });
        s += frame(350, 140, 150, 30, 'agg_hourly_active_user', 'a', { center: true, ty: 19 });
        s += frame(350, 230, 150, 30, 'agg_active_user', 'a', { center: true, ty: 19 });
        s += arrow('db0', 'M178,47 L206,47', 'k', { svg: S, dash: true });
        s += arrow('db1', 'M265,70 L265,96', 'b', { svg: S });
        s += arrow('db2', 'M320,116 C340,116 340,80 346,80', 'b', { svg: S });
        s += arrow('db3', 'M380,140 L380,104', 'a', { svg: S });
        s += arrow('db4', 'M440,80 C480,80 480,200 470,226', 'a', { svg: S });
        s += arrow('db5', 'M360,170 L360,226', 'k', { svg: S, dash: true });
        s += T(366, 202, 'ref — 순서는 여기서 나온다', 'lbl sm');
        s += dots('db3', 'a', { n: 1, dur: 2.4 }) + dots('db4', 'a', { n: 1, dur: 3 }) + dots('db1', 'b', { n: 1, dur: 2.6 });
        s += T(14, 296, 'SQL 한 장이 표 한 개. 순서는 source 와 ref 를 보고 도구가 매긴다', 'lbl');
        svg(S, s, 310);
    })();

    // ---------- 4. Airflow 의 손, 오퍼레이터 ----------
    (function () {
        const S = 'dm-operator'; let s = '';
        s += frame(14, 116, 116, 66, 'Airflow 태스크', 'b', { center: true, ty: 28, sub: '몇 시에 무엇을' });
        s += T(160, 16, '오퍼레이터 (직접 만든 것 중 여섯)', 'lbl sm');
        s += T(330, 16, '말을 거는 상대', 'lbl sm');
        const rows = [
            ['spark', 'YARN 클러스터', 'c'],
            ['kyuubi', 'Kyuubi → Spark 에서 SQL', 'c'],
            ['distcp', '다른 클러스터의 HDFS', 'a'],
            ['hdfs sensor', 'HDFS 파일이 생겼나 기다림', 'a'],
            ['http, jdbc', '외부 API, 운영 DB', 'a'],
            ['kafka, mysql', '토픽, 운영 DB', 'a']
        ];
        rows.forEach((r, i) => {
            const y = 30 + i * 44;
            s += frame(160, y, 110, 26, r[0], 'k', { center: true, ty: 17 });
            s += frame(330, y, 176, 26, r[1], r[2], { center: true, ty: 17 });
            s += arrow('op' + i, `M130,149 C146,149 150,${y + 13} 156,${y + 13}`, 'b', { svg: S });
            s += arrow('ot' + i, `M270,${y + 13} L326,${y + 13}`, r[2], { svg: S });
            s += dots('ot' + i, r[2], { n: 1, dur: 2.4 + i * 0.3 });
        });
        s += T(14, 296, 'Airflow 는 시간표만 안다. 실제 손은 오퍼레이터이고, 없는 손은 만든다', 'lbl');
        svg(S, s, 310);
    })();

    // ---------- 5. 들어오는 대로 받아 묶는 실시간 잡 ----------
    (function () {
        const S = 'dm-flink'; let s = '';
        s += T(14, 16, '원천 저장소', 'lbl sm');
        s += srv(40, 24, { cls: 'a', scale: 0.8, label: '시청 로그 스트림' });
        s += doc(120, 34, 120, 50, '소스 커넥터', ['직접 만든 Java 클래스들']);
        s += frame(270, 24, 170, 190, 'Flink 잡', 'c', { ty: 15 });
        s += frame(282, 50, 146, 26, '워터마크: 10초 뒤에 선', 'k', { center: true, ty: 17 });
        s += frame(282, 90, 146, 26, '키: 재생 건 | 미디어 | 종류', 'k', { center: true, ty: 17 });
        s += frame(282, 130, 146, 26, '시간 창에 모아 하나로', 'k', { center: true, ty: 17 });
        s += frame(282, 170, 146, 26, '늦은 것은 10분까지', 'k', { center: true, ty: 17 });
        s += srv(462, 30, { cls: 'a', scale: 0.7, label: '토픽' });
        s += srv(462, 150, { cls: 'a', scale: 0.7, label: 'HDFS' });
        s += arrow('fl1', 'M76,50 C100,50 105,58 116,58', 'a', { svg: S });
        s += arrow('fl2', 'M240,58 L266,58', 'k', { svg: S });
        s += arrow('fl3', 'M440,60 L458,54', 'a', { svg: S });
        s += arrow('fl4', 'M440,160 L458,166', 'a', { svg: S });
        s += `<path class="ar k dash" d="M355,76 L355,88"/><path class="ar k dash" d="M355,116 L355,128"/><path class="ar k dash" d="M355,156 L355,168"/>`;
        s += arrow('fl5', 'M58,94 C58,150 150,183 278,183', 'c', { svg: S, dash: true });
        s += T(120, 176, '늦게 온 로그', 'lbl sm');
        s += dots('fl1', 'a', { n: 3, dur: 3 }) + dots('fl2', 'k', { n: 2, dur: 2 }) + dots('fl3', 'a', { n: 2, dur: 2.2 }) + dots('fl4', 'a', { n: 2, dur: 2.6 });
        s += dots('fl5', 'c', { n: 1, dur: 6 });
        s += list(14, 206, 230, 72, ['어느 하루에 커밋이 한꺼번에', '그 달 커밋은 거의 전부 Flink 폴더', 'Java 파일의 절반 넘게가 커넥터', '실시간 잡은 팀에 이것 하나']);
        s += T(14, 296, '들어오는 대로 받아 10초 기다려 묶는다. 늦은 것은 차이만 다시 낸다', 'lbl');
        svg(S, s, 310);
    })();

    // ---------- 6. 코드가 서버에 닿는 길 ----------
    (function () {
        const S = 'dm-ship'; let s = '';
        s += user(34, 40, '새로 온 사람');
        s += doc(70, 24, 90, 44, '코드', ['여섯 달의 커밋']);
        s += frame(190, 30, 80, 36, 'PR', 'b', { center: true, ty: 23 });
        s += user(312, 34, '') + user(338, 34, '');
        s += T(325, 86, '리뷰', 'lbl k', 'middle');
        s += frame(390, 30, 116, 36, 'main 에 머지', 'b', { center: true, ty: 23 });
        s += frame(14, 150, 150, 44, '로컬 pytest', 'k', { center: true, ty: 18, sub: 'DAG 가 전부 뜨나' });
        s += frame(190, 150, 200, 44, 'workflow: jar 빌드 → HDFS', 'b', { center: true, ty: 18, sub: 'main 이면 prod, 라벨이면 test' });
        s += frame(416, 150, 94, 44, 'Flink, Airflow', 'c', { center: true, ty: 18, sub: '집어 쓴다' });
        s += arrow('sh1', 'M160,48 L186,48', 'k', { svg: S });
        s += arrow('sh2', 'M270,48 L300,48', 'b', { svg: S });
        s += arrow('sh3', 'M352,48 L386,48', 'b', { svg: S });
        s += arrow('sh4', 'M325,64 C325,112 115,112 115,72', 'k', { svg: S, dash: true });
        s += T(220, 106, '리뷰 반영', 'lbl sm', 'middle');
        s += arrow('sh5', 'M448,66 C448,116 290,120 290,146', 'b', { svg: S });
        s += arrow('sh6', 'M390,172 L412,172', 'b', { svg: S });
        s += arrow('sh7', 'M100,68 C100,100 89,120 89,146', 'k', { svg: S, dash: true });
        const cyc = 10;
        s += dots('sh1', 'k', { seq: [0.02, 0.1], cyc }) + dots('sh2', 'b', { seq: [0.12, 0.2], cyc }) + dots('sh4', 'k', { seq: [0.22, 0.36], cyc });
        s += dots('sh3', 'b', { seq: [0.4, 0.5], cyc }) + dots('sh5', 'b', { seq: [0.52, 0.66], cyc }) + dots('sh6', 'b', { seq: [0.68, 0.78], cyc });
        s += list(14, 220, 330, 58, ['리뷰 반영 커밋이 여섯 달 내내 끼어 있다', '머지에는 거의 예외 없이 사람 승인이 붙는다', 'prod 는 확인 문구 deploy-prod 를 쳐야 올라간다']);
        s += T(14, 296, '고친 코드는 사람 눈과 자동 배포를 지나 서버에 닿는다', 'lbl');
        svg(S, s, 310);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.dm-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
