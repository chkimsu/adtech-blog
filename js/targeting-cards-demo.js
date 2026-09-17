/**
 * targeting-cards-demo.js — 타겟팅 카드 아홉 장
 *
 * 누구에게 광고를 보여 줄지가 정해지는 자리 하나가 카드 한 장. 점이 흐르는 방향이 데이터가 가는 방향이다.
 * 색은 css/style.css 토큰만 — 파랑(navy) 놓여 있는 목록(세그먼트, 프로필, 카운터), 벽돌색(oxide) 지금 오는 것(광고 요청, 행동 기록),
 * 먹색 정하는 서버(광고 서버), 회색 만드는 작업(배치, 매칭, 닮음 계산). 점선 상자는 광고주가 적어 둔 조건.
 * 이름과 숫자는 전부 설명용 예시다. 후보 12만 → 4,200 → 2,310 → 1,155 → 800 은 ad-serving-flow 글의 값이고,
 * 타겟 방식별 도달(500만, 160만, 140만, 70만, 14만, 8만)은 kakao-ads-prediction-targeting 글의 값이고, 1% 만 분모 1,400만에 맞춰 14만으로 두었다.
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

    // ---------- 1. 조건과 유저 정보가 만나는 자리 ----------
    (function () {
        const S = 'tg-meet'; let s = '';
        s += T(40, 26, '광고주가 캠페인에 적어 둔 조건', 'lbl sm');
        s += list(40, 36, 160, 58, [{ t: '나이 25~39', cls: 'h' }, '지역 서울, 경기', '관심사 러닝']);
        s += srv(238, 56, { cls: 'k', label: '광고 서버' });
        s += T(470, 26, '광고 자리를 연 사람', 'lbl sm', 'middle');
        s += user(470, 44, '회원 A');
        s += list(400, 100, 110, 58, [{ t: '32세 여성', cls: 'h' }, '서울', '관심사 러닝, 여행']);
        s += T(455, 172, '요청과 함께 오는 정보', 'lbl sm', 'middle');
        s += arrow('mt1', 'M200,64 L234,72', 'a', { svg: S, dash: true });
        s += arrow('mt2', 'M398,128 C350,128 320,92 286,86', 'b', { svg: S });
        s += dots('mt1', 'a', { n: 1, dur: 3 }) + dots('mt2', 'b', { n: 2, dur: 2.4 });
        s += tag(198, 130, '세 조건이 다 맞음. 후보에 남습니다', 'a');
        s += T(40, 200, '조건은 캠페인에 놓여 있고, 정보는 요청과 함께 옵니다', 'lbl sm');
        s += T(40, 214, '둘을 대 보는 자리가 광고 서버입니다', 'lbl sm');
        s += T(40, 270, '요청 한 건마다 캠페인 12만 개의 조건을 이 자리에서 대 봅니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 후보가 줄어드는 순서 ----------
    (function () {
        const S = 'tg-funnel'; let s = '';
        const rows = [
            ['시작 (이 지면 후보 전부)', '120,000건', 1.0, 'c', '100%'],
            ['타겟 조건에 맞는 것만', '4,200건', 0.035, 'b', '3.5%'],
            ['오늘 예산이 남은 것만', '2,310건', 0.55, 'a', '55%'],
            ['빈도 상한을 안 넘은 것만', '1,155건', 0.50, 'a', '50%'],
            ['지면과 어울리는 것만', '800건', 0.693, 'a', '69%'],
        ];
        s += T(230, 26, '앞 단계에서 얼마나 남았나', 'lbl sm');
        s += T(480, 26, '남은 수', 'lbl sm', 'end');
        rows.forEach((r, i) => {
            const y = 38 + i * 40;
            s += T(40, y + 13, r[0], i === 1 ? 'lbl b' : 'lbl k');
            s += `<rect class="track" x="230" y="${y + 2}" width="150" height="16"/>`;
            s += `<rect class="f-${r[3]}" x="230" y="${y + 2}" width="${Math.max(4, Math.round(150 * r[2]))}" height="16"/>`;
            s += T(386, y + 13, r[4], i === 1 ? 'lbl b' : 'lbl sm');
            s += T(480, y + 13, r[1], i === 1 ? 'lbl b' : 'lbl k', 'end');
        });
        s += arrow('fn1', 'M28,42 L28,236', 'b', { svg: S });
        s += dots('fn1', 'b', { n: 1, dur: 4 });
        s += tag(40, 232, '800건에 점수를 매겨 1건이 나갑니다', 'k');
        s += T(40, 270, '타겟 조건이 가장 크게 줄입니다. 나머지 셋은 절반쯤씩 남깁니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 타겟 방식 여덟 가지 ----------
    (function () {
        const S = 'tg-types'; let s = '';
        const groups = [
            ['이 사람이 누구인가', 40, ['데모그래픽', '관심사', '행동 (최근에 한 일)']],
            ['광고주가 아는 사람인가', 200, ['맞춤타겟 (올린 목록)', '유사타겟 (닮은 사람)', '리타겟팅 (만난 사람)']],
            ['어디에 뜨나, 누구는 빼나', 360, ['지면 (앱, 화면 위치)', '제외 (이미 산 사람 등)']],
        ];
        groups.forEach(g => {
            s += T(g[1], 34, g[0], 'lbl k');
            s += `<rect class="grp" x="${g[1] - 6}" y="42" width="148" height="122"/>`;
            g[2].forEach((c, i) => { s += dashChip(g[1], 52 + i * 36, c); });
        });
        s += arrow('ty1', 'M40,190 L484,190', 'b', { svg: S });
        s += dots('ty1', 'b', { n: 1, dur: 4 });
        s += T(40, 214, '요청 한 건이 세 묶음의 조건을 차례로 지납니다', 'lbl sm');
        s += T(40, 236, '여덟 방식 전부 「이런 사람에게」라는 조건입니다. 도구 이름만 다릅니다', 'lbl sm');
        s += T(40, 270, '조건이 많아질수록 맞는 사람은 줄고 맞는 정도는 올라갑니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 조건 한 벌이 사람 목록이 된다 ----------
    (function () {
        const S = 'tg-segment'; let s = '';
        s += T(40, 26, '적어 둔 조건 한 벌', 'lbl sm');
        s += list(40, 36, 140, 44, [{ t: '관심사 = 러닝', cls: 'h' }, '최근 30일 앱을 켠 사람']);
        s += tool(214, 46, 110, { label: '배치 작업', sub: '매일 04:00 한 번', clock: true });
        s += T(418, 26, '만들어진 목록', 'lbl sm', 'middle');
        s += table(390, 40, { label: '세그먼트 317', sub: '회원 ID 160만 개' });
        s += arrow('sg1', 'M180,58 L210,64', 'a', { svg: S, dash: true });
        s += arrow('sg2', 'M328,66 L386,60', 'a', { svg: S });
        s += dots('sg1', 'a', { n: 1, dur: 3 }) + burst('sg2', 'a', 0.05, 0.35, 8);
        s += db(130, 180, { label: '광고 서버 옆 저장소' });
        s += srv(300, 160, { cls: 'k', label: '광고 서버' });
        s += arrow('sg3', 'M418,126 C418,168 200,168 150,178', 'a', { svg: S });
        s += arrow('sg4', 'M150,196 L296,190', 'k', { svg: S, dash: true });
        s += burst('sg3', 'a', 0.4, 0.75, 8, 3) + dots('sg4', 'k', { n: 2, dur: 1.6 });
        s += T(222, 182, '요청마다 읽습니다', 'lbl sm', 'middle');
        s += T(40, 132, '조건은 사람이 적고, 목록은 배치가 만듭니다', 'lbl sm');
        s += T(40, 270, '세그먼트는 조건이고 오디언스는 그 조건으로 만든 목록입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 5. 광고주가 올린 목록을 회원과 맞춘다 ----------
    (function () {
        const S = 'tg-custom'; let s = '';
        s += T(40, 26, '광고주가 올린 파일', 'lbl sm');
        s += file(58, 40, { label: '구매 고객 8만 8천 명', sub: '이메일을 해시로 바꾼 것' });
        s += tool(200, 52, 110, { label: '매칭 작업', sub: '같은 해시를 찾습니다' });
        s += T(420, 26, '플랫폼 회원 표', 'lbl sm', 'middle');
        s += table(392, 40, { label: '회원 ID, 이메일 해시' });
        s += arrow('cu1', 'M102,66 L196,72', 'a', { svg: S });
        s += arrow('cu2', 'M388,66 L314,72', 'a', { svg: S, dash: true });
        s += arrow('cu3', 'M255,92 L255,150', 'a', { svg: S });
        s += burst('cu1', 'a', 0.05, 0.3, 8, 3) + dots('cu2', 'a', { n: 1, dur: 2.5 }) + burst('cu3', 'a', 0.4, 0.6, 8, 3);
        s += table(227, 154, { label: '맞춤타겟 (세그먼트 5051)', sub: '8만 명 맞음. 8천 명은 회원이 아님' });
        s += T(40, 200, '광고주는 회원 ID 를 모르고', 'lbl sm');
        s += T(40, 214, '플랫폼은 이메일 원문을 모릅니다', 'lbl sm');
        s += T(40, 270, '광고주가 아는 사람을 플랫폼 회원과 맞춘 목록입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 6. 씨앗에서 닮은 사람으로 ----------
    (function () {
        const S = 'tg-lookalike'; let s = '';
        s += T(40, 26, '씨앗 (맞춤타겟)', 'lbl sm');
        s += table(40, 36, { label: '8만 명' });
        s += T(40, 140, '전체 회원', 'lbl sm');
        s += table(40, 150, { label: '수천만 명' });
        s += tool(160, 90, 130, { label: '닮음 계산', sub: '사람마다 숫자 묶음의 거리' });
        s += arrow('la1', 'M98,62 C130,62 140,100 156,104', 'a', { svg: S });
        s += arrow('la2', 'M98,176 C130,176 140,118 156,114', 'a', { svg: S });
        s += arrow('la3', 'M294,110 L326,110', 'k', { svg: S });
        s += dots('la1', 'a', { n: 2, dur: 2.6 }) + dots('la2', 'a', { n: 2, dur: 2.6 }) + dots('la3', 'k', { n: 1, dur: 2 });
        s += T(330, 60, '닮은 순서로 세운 줄', 'lbl k');
        s += `<rect class="track" x="330" y="102" width="160" height="16"/>`;
        s += `<rect class="f-a" x="330" y="102" width="16" height="16"/>`;
        [[346, '1%', '14만 명'], [410, '5%', '70만 명'], [490, '10%', '140만 명']].forEach(m => {
            s += `<line class="tick" x1="${m[0]}" y1="96" x2="${m[0]}" y2="124"/>`;
            s += T(m[0], 88, m[1], 'lbl k', 'middle');
            s += T(m[0], 138, m[2], 'lbl sm', 'middle');
        });
        s += T(330, 160, '가까운 쪽 ← → 먼 쪽', 'lbl sm');
        s += T(330, 186, '비율을 올리면 도달은 늘고', 'lbl sm');
        s += T(330, 200, '씨앗과의 닮음은 옅어집니다', 'lbl sm');
        s += T(40, 270, '씨앗 8만 명에서 10% 확장이면 140만 명입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 7. 이미 만난 사람의 목록 ----------
    (function () {
        const S = 'tg-retarget'; let s = '';
        s += T(40, 26, '브랜드 사이트', 'lbl sm');
        s += srv(44, 40, { cls: 'k', label: '사이트 서버' });
        s += user(130, 50, '회원 A');
        s += tag(96, 100, '장바구니에 담음 14:02', 'b');
        s += T(96, 132, '사이트에 심어 둔 픽셀이 보냅니다', 'lbl sm');
        s += tool(250, 52, 96, { label: '수집', sub: '기록을 받아 모음' });
        s += table(392, 40, { label: '장바구니 목록 (7일)', sub: '3만 1천 명. 10분마다 새로' });
        s += arrow('re1', 'M226,109 C240,109 240,76 246,72', 'b', { svg: S });
        s += arrow('re2', 'M350,72 L388,62', 'b', { svg: S });
        s += dots('re1', 'b', { n: 2, dur: 2 }) + dots('re2', 'b', { n: 1, dur: 1.6 });
        s += srv(300, 170, { cls: 'k', label: '광고 서버' });
        s += arrow('re3', 'M420,126 C420,170 372,176 348,186', 'a', { svg: S, dash: true });
        s += dots('re3', 'a', { n: 1, dur: 2 });
        s += T(40, 190, '사이트에서 한 행동이', 'lbl sm');
        s += T(40, 204, '몇 분 뒤 목록이 됩니다', 'lbl sm');
        s += T(40, 218, '광고 서버는 그 목록을 요청마다 읽습니다', 'lbl sm');
        s += T(40, 270, '이미 만난 사람 목록은 행동 세그먼트의 한 종류입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 8. 한 사람에게 하루 3회까지만 ----------
    (function () {
        const S = 'tg-freqcap'; let s = '';
        s += user(60, 50, '회원 A');
        s += srv(160, 44, { cls: 'k', label: '광고 서버' });
        s += arrow('fc1', 'M82,70 L156,70', 'b', { svg: S });
        s += dots('fc1', 'b', { n: 1, dur: 2 });
        s += T(300, 26, '오늘 몇 번 봤나 (회원 A 의 카운터)', 'lbl sm');
        s += list(300, 36, 200, 58, [{ t: '광고 9931   오늘 2회', cls: 'h' }, { t: '광고 7720   오늘 3회   [가득]', cls: 'b' }, '자정이 되면 0 으로 돌아갑니다']);
        s += arrow('fc2', 'M208,66 L296,60', 'k', { svg: S, dash: true });
        s += dots('fc2', 'k', { n: 1, dur: 2 });
        s += tag(214, 120, '9931 은 2회. 보여도 됩니다', 'a');
        s += tag(214, 146, '7720 은 3회. 오늘은 뺍니다', 'b');
        s += T(40, 200, '노출 한 번마다 카운터가 1 오릅니다', 'lbl sm');
        s += T(40, 214, '3 이 되면 그 광고는 오늘 이 사람에게 안 나갑니다', 'lbl sm');
        s += T(40, 270, '후보 2,310건 중 절반이 이 자리에서 빠집니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 9. 유저 정보가 오는 길 두 가지 ----------
    (function () {
        const S = 'tg-signal'; let s = '';
        s += `<line class="split" x1="260" y1="20" x2="260" y2="250"/>`;
        s += T(40, 26, '담장 안: 로그인한 회원', 'lbl k');
        s += user(70, 52, '회원 ID 1042');
        s += srv(150, 40, { cls: 'k', label: '광고 서버' });
        s += table(80, 140, { label: '프로필 표', sub: 'ID → 세그먼트 목록' });
        s += arrow('si1', 'M90,66 L146,66', 'b', { svg: S });
        s += arrow('si2', 'M172,118 C172,132 110,128 108,136', 'a', { svg: S, dash: true });
        s += dots('si1', 'b', { n: 1, dur: 2 }) + dots('si2', 'a', { n: 1, dur: 2 });
        s += T(40, 246, 'ID 하나로 목록을 바로 찾습니다', 'lbl sm');
        s += T(276, 26, '열린 RTB: 쿠키를 가진 방문자', 'lbl k');
        s += user(306, 52, '쿠키 ID c7f2');
        s += srv(390, 40, { cls: 'k', label: '외부 DSP 서버' });
        s += table(320, 140, { label: 'DSP 의 목록', sub: '쿠키 → 세그먼트, 있으면' });
        s += arrow('si3', 'M326,66 L386,66', 'b', { svg: S });
        s += arrow('si4', 'M412,118 C412,132 350,128 348,136', 'a', { svg: S, dash: true });
        s += dots('si3', 'b', { n: 1, dur: 2 }) + dots('si4', 'a', { n: 1, dur: 2 });
        s += T(276, 246, '쿠키가 바뀌면 같은 사람을 못 알아봅니다', 'lbl sm');
        s += T(40, 270, '같은 타겟팅이라도 유저 정보가 오는 길이 다릅니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
