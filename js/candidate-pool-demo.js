/**
 * candidate-pool-demo.js — 후보풀 그림 다섯 장
 *
 * 광고 서버가 후보를 꺼내는 풀이 무엇이고 어디에 놓여 있나를 그림 한 장씩으로 그린다.
 * 그리기 부품은 card-kit.js 를 쓰고(서버, 테이블, 저장소, 파일, 작업 상자, 점선 상자, 화살표, 흐르는 점),
 * 그림이 카드보다 넓어서 svg 틀만 여기서 따로 만든다 (viewBox 820 × 높이).
 * 색은 css/style.css 토큰만 — 파랑(navy) 놓여 있는 목록(캠페인, 색인, 세그먼트, 프로필), 벽돌색(oxide) 지금 오는 것(광고 요청, 변경 알림),
 * 먹색 정하는 서버(광고 서버, DSP, 거래소), 회색 만드는 작업(배치, 닮음 계산). 점선 상자는 광고주가 적어 둔 조건.
 * 숫자는 타겟팅 트랙과 같은 설명용 가상 값이다. 후보 12만 건, 세그먼트 317 러닝 160만 명, 회원 1,400만 명, 씨앗 8만 명,
 * 유사타겟 10% 140만 명. 새로 둔 번호는 Lookalike 세그먼트 6001 과 그림 3 의 예시 후보 수(2,900건, 1,100건)뿐이다.
 *
 * ?fig=N 이 붙으면 N번 그림만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 */
(function () {
    'use strict';
    const { esc, T, tw, box, tag, srv, table, db, file, tool, user, arrow, dots } = window.CardKit;

    // 한 줄 안에서 일부만 색을 바꿀 때 — parts = [[글자, 클래스?], ...]. 글자 하나만 넘겨도 된다
    const Tm = (x, y, parts, cls = 'lbl', anchor = 'start') =>
        `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">` +
        parts.map(p => Array.isArray(p) ? p : [p])
            .map(p => p[1] ? `<tspan class="${p[1]}">${esc(p[0])}</tspan>` : esc(p[0])).join('') + `</text>`;
    // 점선 상자 = 광고주가 적어 둔 조건. 줄 하나가 배열이면 Tm 으로 그린다
    function list(x, y, w, h, lines) {
        let s = `<rect class="list" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
        lines.forEach((ln, i) => {
            if (Array.isArray(ln)) { s += Tm(x + 9, y + 15 + i * 14, ln, 'list-t'); return; }
            const t = typeof ln === 'string' ? ln : ln.t, cls = typeof ln === 'string' ? '' : ln.cls || '';
            s += `<text class="list-t ${cls}" x="${x + 9}" y="${y + 15 + i * 14}">${esc(t)}</text>`;
        });
        return s;
    }
    // 묶음 바탕 (눌린 판) + 작은 라벨
    function zone(x, y, w, h, label) {
        return `<rect class="zone" x="${x}" y="${y}" width="${w}" height="${h}"/>` + (label ? T(x + 12, y + 16, label, 'lbl zone') : '');
    }
    // 그림 틀 — card-kit 의 svg() 는 폭이 520 으로 고정이라 넓은 그림용으로 따로 둔다. marker id 는 그림마다 다르다
    function svg(id, inner, w, h) {
        const mk = c => `<marker id="m-${c}-${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="mk ${c}"/></marker>`;
        const host = document.getElementById(id);
        if (host) host.innerHTML =
            `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img"><defs>${mk('k')}${mk('a')}${mk('b')}${mk('c')}</defs>${inner}</svg>`;
    }

    // ---------- 1. 풀은 켜져 있는 캠페인 전부 ----------
    (function () {
        const S = 'cp-fig1'; let s = '';
        s += user(60, 62, '서연 씨 (운동화)');
        s += user(60, 142, '여행사');
        s += user(60, 222, '카페');
        s += table(210, 150, { label: '캠페인 저장소', sub: '등록된 캠페인 전부' });
        s += arrow('cp1a', 'M80,77 C150,77 150,160 208,165', 'k', { svg: S });
        s += arrow('cp1b', 'M80,157 L208,170', 'k', { svg: S });
        s += arrow('cp1c', 'M80,237 C150,237 150,180 208,176', 'k', { svg: S });
        s += dots('cp1a', 'a', { n: 1, dur: 4 }); s += dots('cp1b', 'a', { n: 1, dur: 3.3 }); s += dots('cp1c', 'a', { n: 1, dur: 3.7 });
        s += list(270, 22, 210, 100, [
            { t: '캠페인 한 줄 (서연 씨)', cls: 'h' },
            '조건: 나이 25~39, 서울 경기, 세그먼트 317',
            '예산: 하루 300만 원, 입찰가',
            '소재: 러닝화 이미지',
            ['상태: ', ['ON', 'b']],
        ]);
        s += `<path class="conn" d="M266,122 L250,146"/>`;
        s += zone(530, 50, 270, 215, '광고 서버 한 대의 메모리');
        s += srv(745, 60, { scale: 0.7 });
        s += table(600, 125, { label: '색인 = 풀', sub: '이 지면 상품에 걸 수 있는 12만 건' });
        s += arrow('cp1d', 'M266,172 L597,150', 'a', { svg: S });
        s += dots('cp1d', 'a', { n: 2, dur: 4 });
        s += T(430, 142, '켜진 것만', 'lbl k', 'middle');
        s += T(430, 156, 'ON, 기간 안, 예산 남음', 'lbl sm', 'middle');
        s += T(60, 290, '광고주마다 한 줄씩 적습니다. 꺼진 줄, 기간이 지난 줄은 풀에 들어오지 않습니다', 'lbl');
        svg(S, s, 820, 300);
    })();

    // ---------- 2. 바뀌는 순간 바뀐다. 색인은 메모리 안 ----------
    (function () {
        const S = 'cp-fig2'; let s = '';
        const ev = [['서연 씨: 캠페인 켬', 62], ['여행사: 오늘 예산 소진', 152], ['카페: 기간 종료', 242]];
        ev.forEach((e, i) => {
            s += tag(14, e[1], e[0], 'b');
            s += arrow(`cp2e${i}`, `M${14 + tw(e[0]) + 16},${e[1] + 9} C120,${e[1] + 9} 150,160 196,${165 + i * 4}`, 'b', { svg: S });
            s += dots(`cp2e${i}`, 'b', { seq: [0.05 + i * 0.1, 0.3 + i * 0.1], cyc: 8 });
        });
        s += table(198, 150, { label: '캠페인 저장소', sub: '바뀐 한 줄만 알린다' });
        const sy = [40, 130, 220];
        sy.forEach((y, i) => {
            s += srv(520, y, {});
            s += T(576, y + 24, `광고 서버 ${i + 1}`, 'lbl k');
            s += T(576, y + 40, '메모리에 색인 복사본', 'lbl sm');
            s += arrow(`cp2s${i}`, `M254,172 C330,172 420,${y + 27} 518,${y + 27}`, 'a', { svg: S });
            s += dots(`cp2s${i}`, 'a', { seq: [0.4, 0.62], cyc: 8 });
            s += `<path class="conn" d="M564,${y + 48} C620,${y + 48} 640,${y > 130 ? y - 40 : y + 60} 686,165"/>`;
        });
        s += T(446, 58, '변경 알림', 'lbl k', 'middle');
        s += T(446, 72, '몇 초 안에 전부에게', 'lbl sm', 'middle');
        s += list(688, 108, 120, 100, [
            { t: '색인 (셋 다 같음)', cls: 'h' },
            '317 → c01 c07 c42',
            '6001 → c01 c15',
            '서울 → c01 c07 c99',
            '배너 → c01 c42 c88',
            '없음 → c23 c51',
        ]);
        s += T(14, 300, '하루 중 아무 때나 일어나는 일 셋. 그때마다 그 줄 하나를 고칩니다', 'lbl');
        s += T(14, 316, '12만 건 × 1KB = 120MB. 서버 한 대 메모리에 다 들어가서 저마다 통째로 듭니다', 'lbl sm');
        svg(S, s, 820, 330);
    })();

    // ---------- 3. 수억 명, 같은 풀 ----------
    (function () {
        const S = 'cp-fig3'; let s = '';
        const req = [
            ['회원 A', ['세그먼트 317, 402', '서울, 모바일 배너'], '후보 4,200건', '317 과 서울과 배너가 다 맞는 것'],
            ['회원 B', ['세그먼트 77 캠핑', '부산, 모바일 배너'], '후보 2,900건', '77 과 부산과 배너가 다 맞는 것'],
            ['비로그인 C', ['쿠키만, 세그먼트 없음', 'PC, 배너'], '후보 1,100건', '조건 없는 캠페인 + 배너'],
        ];
        s += T(130, 24, '요청에 실린 키', 'lbl sm');
        s += T(330, 24, '부하 분산', 'lbl sm', 'middle');
        s += T(445, 24, '서버 (셋 다 같은 색인)', 'lbl sm', 'middle');
        s += T(600, 24, '꺼낸 조각', 'lbl sm');
        req.forEach((r, i) => {
            const y = 56 + i * 90;
            s += user(50, y, r[0]);
            s += T(80, y + 6, r[1][0], 'lbl k');
            s += T(80, y + 21, r[1][1], 'lbl');
            s += arrow(`cp3r${i}`, `M232,${y + 14} L316,${y + 14}`, 'b', { svg: S });
            s += dots(`cp3r${i}`, 'b', { n: 1, dur: 3 + i * 0.4 });
            s += arrow(`cp3l${i}`, `M344,${y + 14} L392,${y + 14}`, 'b', { svg: S });
            s += srv(395, y - 14, {});
            s += `<rect class="tbl-body" x="447" y="${y - 2}" width="34" height="28"/><rect class="f-a" x="447" y="${y - 2}" width="34" height="7"/>` +
                `<line class="tbl-ln" x1="447" y1="${y + 12}" x2="481" y2="${y + 12}"/><line class="tbl-ln" x1="447" y1="${y + 19}" x2="481" y2="${y + 19}"/>`;
            s += T(495, y + 27, `서버 ${i + 1}`, 'lbl sm');
            s += arrow(`cp3o${i}`, `M486,${y + 12} L596,${y + 12}`, 'a', { svg: S });
            s += dots(`cp3o${i}`, 'a', { n: 1, dur: 3 + i * 0.4 });
            s += tag(600, y + 3, r[2], i === 0 ? 'k' : 'c');
            s += T(600, y + 36, r[3], 'lbl sm');
        });
        s += box(318, 36, 26, 250, '', 'k');
        s += T(14, 318, '같은 색인에서 다른 조각을 꺼냅니다. 풀이 나뉜 것이 아닙니다. B 와 C 의 수는 예시 값입니다', 'lbl');
        svg(S, s, 820, 330);
    })();

    // ---------- 4. 열린 RTB — DSP 수만큼의 풀 ----------
    (function () {
        const S = 'cp-fig4'; let s = '';
        s += user(36, 120, '민지');
        s += srv(90, 92, { label: '매체 (뉴스앱)' });
        s += `<rect class="tbl-body" x="98" y="190" width="28" height="22"/><rect class="f-a" x="98" y="190" width="28" height="6"/>`;
        s += T(134, 206, '직판 풀 (작다)', 'lbl sm');
        s += srv(230, 92, { label: 'SSP' });
        s += srv(370, 92, { label: '거래소', sub: '30곳에 동시에 묻는다' });
        s += arrow('cp4r0', 'M56,128 L88,124', 'b', { svg: S });
        s += arrow('cp4r1', 'M134,112 L228,112', 'b', { svg: S });
        s += arrow('cp4r2', 'M274,112 L368,112', 'b', { svg: S });
        s += dots('cp4r1', 'b', { seq: [0.0, 0.1], cyc: 8 }); s += dots('cp4r2', 'b', { seq: [0.1, 0.2], cyc: 8 });
        s += arrow('cp4b1', 'M368,132 L276,132', 'k', { svg: S });
        s += arrow('cp4b2', 'M228,132 L136,132', 'k', { svg: S });
        s += dots('cp4b1', 'k', { seq: [0.72, 0.82], cyc: 8 }); s += dots('cp4b2', 'k', { seq: [0.82, 0.92], cyc: 8 });
        s += T(181, 150, '1등 광고', 'lbl sm', 'middle');
        const dy = [16, 126, 236];
        dy.forEach((y, i) => {
            s += zone(520, y, 290, 98, `DSP ${i + 1} — 자기 광고주의 풀`);
            s += srv(535, y + 30, { scale: 0.8 });
            s += table(590, y + 32, {});
            s += T(618, y + 90, '자기 색인', 'lbl sm', 'middle');
            s += arrow(`cp4i${i}`, `M648,${y + 54} L686,${y + 54}`, 'k', { svg: S });
            s += tag(690, y + 45, '입찰 1건', 'k');
            s += T(735, y + 80, '색인 → 필터 → 랭킹', 'lbl sm', 'middle');
            s += arrow(`cp4d${i}`, `M414,112 C470,112 470,${y + 44} 518,${y + 44}`, 'b', { svg: S });
            s += arrow(`cp4u${i}`, `M518,${y + 64} C460,${y + 64} 460,132 416,132`, 'k', { svg: S });
            s += dots(`cp4d${i}`, 'b', { seq: [0.2, 0.32], cyc: 8 });
            s += dots(`cp4u${i}`, 'k', { seq: [0.58, 0.72], cyc: 8 });
        });
        s += T(14, 318, '거래소가 받은 입찰 3건 중 1등이 매체로 갑니다. 「후보」가 DSP 안과 거래소 위, 두 층입니다', 'lbl');
        svg(S, s, 820, 340);
    })();

    // ---------- 5. Lookalike — 사람 목록을 만든다 ----------
    (function () {
        const S = 'cp-fig5'; let s = '';
        s += zone(10, 10, 800, 190, '어제 새벽 04:00 — 배치 작업');
        s += file(44, 48, { label: '씨앗 8만 명', sub: '구매자 목록' });
        s += table(175, 52, { label: '회원 1,400만 명', sub: '사람마다 숫자 묶음' });
        s += tool(300, 68, 130, { label: '닮음 계산', sub: '줄 세우고 앞 10% 자름', clock: true });
        s += arrow('cp5a', 'M90,80 C140,80 250,88 298,88', 'c', { svg: S });
        s += arrow('cp5b', 'M233,74 L298,82', 'c', { svg: S });
        s += dots('cp5a', 'a', { seq: [0.0, 0.18], cyc: 10 }); s += dots('cp5b', 'a', { seq: [0.05, 0.18], cyc: 10 });
        s += table(480, 52, { label: '세그먼트 6001', sub: '140만 명', lcls: 'b' });
        s += arrow('cp5c', 'M432,88 L476,80', 'c', { svg: S });
        s += dots('cp5c', 'a', { seq: [0.2, 0.3], cyc: 10 });
        s += db(690, 60, { label: '프로필 저장소' });
        s += Tm(690, 130, [['회원 A: 317, 402, '], ['6001', 'b']], 'lbl sm', 'middle');
        s += arrow('cp5d', 'M538,72 L668,72', 'a', { svg: S });
        s += dots('cp5d', 'a', { seq: [0.32, 0.45], cyc: 10 });
        s += T(603, 64, '회원별로 번호를 적어 둔다', 'lbl sm', 'middle');
        s += zone(10, 215, 800, 200, '지금 — 요청 한 건');
        s += list(40, 245, 200, 72, [
            { t: '서연 캠페인 조건 (캠페인 쪽)', cls: 'h' },
            ['세그먼트 ', ['6001', 'b'], ' (유사타겟 10%)'],
            '지역 서울 경기',
            ['상태 ', ['ON', 'b']],
        ]);
        s += table(300, 258, { label: '색인', sub: '6001 → 서연 캠페인' });
        s += arrow('cp5e', 'M244,281 L296,281', 'k', { svg: S });
        s += T(270, 273, '등록', 'lbl sm', 'middle');
        s += srv(560, 238, { label: '광고 서버' });
        s += user(470, 340, '회원 A');
        s += arrow('cp5f', 'M490,345 C520,345 530,300 558,282', 'b', { svg: S });
        s += dots('cp5f', 'b', { seq: [0.5, 0.6], cyc: 10 });
        s += T(515, 332, '요청', 'lbl sm', 'middle');
        s += arrow('cp5g', 'M582,236 C582,170 600,80 668,80', 'a', { svg: S, dash: true });
        s += dots('cp5g', 'a', { seq: [0.6, 0.7], cyc: 10 });
        s += Tm(600, 186, [['어제 만든 줄을 읽는다 → '], ['6001', 'b'], [' 있음']], 'lbl sm');
        s += arrow('cp5h', 'M558,268 L360,268', 'k', { svg: S });
        s += dots('cp5h', 'k', { seq: [0.7, 0.8], cyc: 10 });
        s += T(460, 260, '6001 로 색인 조회', 'lbl sm', 'middle');
        s += arrow('cp5i', 'M604,265 L640,265', 'a', { svg: S });
        s += dots('cp5i', 'a', { seq: [0.82, 0.9], cyc: 10 });
        s += tag(642, 256, '후보에 서연 캠페인 등장', 'a');
        s += T(642, 292, '풀 12만 건은 그대로입니다', 'lbl sm');
        s += T(642, 306, '바뀐 것은 조건 칸의 번호 하나', 'lbl sm');
        s += T(14, 402, '같은 번호 6001 이 두 군데 적힙니다. 사람 쪽 프로필과 캠페인 쪽 조건. 색인이 그 둘을 잇습니다', 'lbl');
        svg(S, s, 820, 420);
    })();

    // ---------- ?fig=N — 글 안에 한 장만 넣을 때 ----------
    const fig = new URLSearchParams(location.search).get('fig');
    if (fig) document.querySelectorAll('.cp-sec').forEach(sec => { if (sec.dataset.fig !== fig) sec.hidden = true; });
})();
