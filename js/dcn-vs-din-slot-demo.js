/**
 * dcn-vs-din-slot-demo.js — DCN 과 DIN 모듈 그림 네 장
 *
 * 1번 세 자리 그림은 버튼을 누를 때마다 다시 그린다. 나머지는 한 번 그린다.
 * ?fig=N 이 붙으면 N번 그림만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 숫자는 din-architecture 글의 민지 씨 예시와 같다. 800, 50 은 설명용 값이다.
 * 색은 전부 css/style.css 의 토큰이고 클래스에는 dvd- 를 붙여 사이트 공용 부품과 겹치지 않게 했다.
 */
(function () {
    'use strict';

    const fig = new URLSearchParams(location.search).get('fig');
    if (fig) document.querySelectorAll('.dvd-sec').forEach(sec => { if (sec.dataset.fig !== fig) sec.hidden = true; });

    const XL = 'http://www.w3.org/1999/xlink';
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const T = (x, y, s, c, an) => `<text class="dvd-t ${c || ''}" x="${x}" y="${y}" text-anchor="${an || 'start'}">${esc(s)}</text>`;
    const mk = (id, c) => `<marker id="dvd-m-${c}-${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dvd-mk ${c}"/></marker>`;
    function put(id, w, h, label, inner) {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="${XL}" role="img" aria-label="${esc(label)}"><defs>${mk(id, 'a')}${mk(id, 'b')}${mk(id, 'k')}${mk(id, 'c')}</defs>${inner}</svg>`;
    }
    const box = (x, y, w, h, c) => `<rect class="dvd-bx ${c}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
    const band = (x, y, w, h, c) => `<rect class="dvd-band ${c}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
    const ar = (sid, pid, d, c) => `<path id="${sid}-${pid}" class="dvd-ar ${c}" d="${d}" marker-end="url(#dvd-m-${c}-${sid})"/>`;
    const dot = (pid, c, dur) => `<circle class="dvd-dot ${c}" r="4.5"><animateMotion dur="${dur}s" repeatCount="indefinite"><mpath href="#${pid}" xlink:href="#${pid}"/></animateMotion></circle>`;

    /* 1번 — 세 자리 */
    (function () {
        const id = 'dvd-fig1';
        const st = { s1: 'din', s3: 'one' };
        function draw() {
            let s = '';
            const din = st.s1 === 'din', mtl = st.s3 === 'mtl';
            s += box(20, 20, 300, 64, 'a') + T(36, 46, '행동 기록', 'k') + T(36, 68, '러닝화 A, 러닝화 B, 커피 원두, 러닝 양말', 'sm');
            s += box(360, 20, 260, 64, 'o') + T(376, 46, '그 밖의 피처', 'k') + T(376, 68, '30대, 아이폰, 주말 저녁', 'sm');
            s += box(660, 20, 320, 64, 'b') + T(676, 46, '후보 광고', 'k') + T(676, 68, '러닝화 광고 (후보 800개 중 하나)', 'sm');
            // ① 자리
            s += band(10, 104, 980, 128, 'a') + T(22, 124, '① 행동 기록 정리', 'lane la');
            s += box(40, 140, 380, 70, 'a') + T(56, 168, din ? 'DIN: 광고를 보고 행동마다 가중치' : '평균: 넷에 똑같이 0.25', 'k') +
                T(56, 192, din ? '가중치 1.95, 1.845, 0, 2.4' : '광고를 보지 않습니다', 'sm mono');
            s += ar(id, 'p1', 'M170,86 V138', 'a');
            if (din) s += ar(id, 'p2', 'M820,86 C820,124 330,108 330,138', 'b');
            s += ar(id, 'p3', 'M422,175 H498', 'a');
            s += box(500, 140, 250, 70, 'k') + T(516, 168, '관심 벡터 하나', 'on') + T(516, 192, din ? '[4.911, 0.804, 4.476, 2.919]' : '[0.625, 0.325, 0.375, 0.45]', 'on mono');
            s += T(766, 168, din ? '광고가 바뀌면 값도 바뀝니다' : '어느 광고 앞에서나 같습니다', 'sm');
            // ② 자리
            s += band(10, 252, 980, 150, 'c') + T(22, 272, '② 피처 섞기', 'lane lc');
            s += box(40, 286, 300, 44, 'k') + T(56, 313, '관심 벡터', 'on');
            s += box(340, 286, 300, 44, 'o') + T(356, 313, '그 밖의 피처', 'k');
            s += box(640, 286, 320, 44, 'b') + T(656, 313, '광고 벡터', 'k');
            s += ar(id, 'p4', 'M625,212 C625,250 190,250 190,284', 'k') + ar(id, 'p5', 'M465,86 V284', 'k') + ar(id, 'p6', 'M940,86 V284', 'b');
            s += ar(id, 'p7', 'M500,332 V346', 'k');
            s += box(320, 348, 360, 44, 'c') + T(336, 375, '이어 붙여 섞는 신경망: MLP, DeepFM, DCN', 'k');
            // ③ 자리
            s += band(10, 422, 980, 150, 'b') + T(22, 442, '③ 답 내기', 'lane lb');
            if (!mtl) {
                s += ar(id, 'p8', 'M500,394 V474', 'k');
                s += box(400, 476, 200, 64, 'b') + T(416, 502, '출력 헤드 하나', 'k') + T(416, 526, 'pCTR', 'sm mono');
                s += T(620, 512, '정답은 클릭 하나', 'sm');
            } else {
                s += ar(id, 'p8', 'M440,394 C440,430 260,440 260,474', 'k') + ar(id, 'p9', 'M560,394 C560,430 740,440 740,474', 'k');
                s += box(150, 476, 220, 64, 'b') + T(166, 502, '클릭 헤드', 'k') + T(166, 526, 'pCTR, 정답은 클릭', 'sm');
                s += box(630, 476, 220, 64, 'b') + T(646, 502, '전환 헤드', 'k') + T(646, 526, 'pCVR, 정답은 전환', 'sm');
                s += T(500, 512, '②까지 함께 씀', 'sm halo', 'middle');
            }
            s += dot(id + '-p1', 'a', 1.6) + (din ? dot(id + '-p2', 'b', 2.2) : '') + dot(id + '-p3', 'a', 1.4) + dot(id + '-p4', 'k', 2) +
                dot(id + '-p7', 'k', 1) + dot(id + '-p8', 'k', 1.6) + (mtl ? dot(id + '-p9', 'k', 1.6) : '');
            put(id, 1000, 590, '요청 한 건이 행동 기록 정리, 피처 섞기, 답 내기의 세 자리를 차례로 지나는 그림', s);
            const cap = document.getElementById('dvd-fig1-cap');
            if (cap) cap.textContent = `지금 그림: ①에 ${din ? 'DIN' : '평균'}, ②에 섞는 신경망, ③에 ${mtl ? '클릭 헤드와 전환 헤드' : '출력 헤드 하나'}. ①이나 ③을 바꿔도 ②는 그대로입니다.`;
        }
        const bind = (attr, key) => document.querySelectorAll(`[${attr}]`).forEach(b => b.addEventListener('click', () => {
            document.querySelectorAll(`[${attr}]`).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
            st[key] = b.getAttribute(attr);
            draw();
        }));
        bind('data-dvd-s1', 's1');
        bind('data-dvd-s3', 's3');
        draw();
    })();

    /* 2번 — DCN 만 대 DIN 모듈 + DCN */
    (function () {
        const id = 'dvd-fig2';
        let s = '';
        const col = (x, title, cls, inLine, embLine, slot, dcnNote, outNote) => {
            let o = T(x, 22, title, 'lane ' + cls);
            o += box(x, 34, 450, 70, 'o') + T(x + 16, 60, '입력: 성별, 나이대, 시간대, 지면, 광고', 'k') + T(x + 16, 86, inLine, 'sm');
            o += ar(id, 'x1' + x, `M${x + 225},106 V128`, 'k');
            o += box(x, 130, 450, 44, 'o') + T(x + 16, 157, embLine, 'k');
            o += ar(id, 'x2' + x, `M${x + 225},176 V198`, 'k');
            o += slot;
            o += ar(id, 'x3' + x, `M${x + 225},266 V288`, 'k');
            o += box(x, 290, 450, 48, 'c') + T(x + 16, 319, 'DCN-V2 (피처 섞기)' + dcnNote, 'k');
            o += ar(id, 'x4' + x, `M${x + 225},340 V362`, 'k');
            o += box(x, 364, 450, 48, 'k') + T(x + 16, 393, 'pCTR' + outNote, 'on');
            return o;
        };
        const noSlot = box(20, 200, 450, 64, 'none') + T(36, 226, '모델 안에는 행동 기록을 줄이는 모듈이 없습니다', 'sm') + T(36, 250, '행동은 모델 밖에서 미리 센 숫자로 들어옵니다', 'sm');
        const dinSlot = box(530, 200, 450, 64, 'a2') + T(546, 226, '더한 모듈: 광고를 보고 행동마다 가중치', 'k la') + T(546, 250, '→ 관심 벡터 하나 (광고마다 다름)', 'sm');
        s += col(20, 'DCN 만', 'lc', '+ 행동을 미리 센 숫자: 행동 4회, 러닝 3회, 커피 1회', '임베딩', noSlot, '', '');
        s += col(530, 'DIN 모듈 + DCN', 'la', '+ 행동 기록 원본: 최근 50개까지 하나씩', '임베딩 (행동마다 벡터 하나)', dinSlot, ', 그대로', ', 그대로');
        s += T(500, 440, '다른 모듈은 파란 칸 하나뿐입니다. DCN 과 출력 헤드, 손실은 그대로입니다.', 'sm', 'middle');
        put(id, 1000, 456, '왼쪽은 DCN 만 쓰는 구조, 오른쪽은 앞에 DIN 모듈을 더한 구조. 파란 칸 하나만 다르다', s);
    })();

    /* 3번 — ①을 붙이는 두 방법 */
    (function () {
        const id = 'dvd-fig3';
        let s = '';
        s += T(20, 22, '모델 안의 층', 'lane la') + T(520, 22, '미리 뽑아 피처로', 'lane lc');
        s += box(20, 40, 160, 56, 'o') + T(36, 74, '광고 요청', 'k');
        s += ar(id, 'q1', 'M182,68 H228', 'k');
        s += box(230, 36, 230, 140, 'o') + band(240, 46, 210, 36, 'a') + T(252, 70, '① DIN', 'k') + band(240, 88, 210, 36, 'c') + T(252, 112, '② 섞기', 'k') + band(240, 130, 210, 36, 'b') + T(252, 154, '③ 출력', 'k');
        s += T(230, 200, '광고 하나마다 ①부터 다시. 후보 800개면 800번', 'sm');
        s += box(520, 40, 200, 56, 'c') + T(536, 64, '사용자 임베딩 모델', 'k') + T(536, 84, '정해 둔 주기로 따로 실행', 'sm');
        s += ar(id, 'q2', 'M722,68 H778', 'c');
        s += box(780, 40, 200, 56, 'list') + T(796, 64, '저장소', 'k') + T(796, 84, '사용자마다 벡터 하나', 'sm');
        s += box(520, 130, 200, 56, 'o') + T(536, 164, '광고 요청', 'k');
        s += ar(id, 'q3', 'M722,158 H778', 'k');
        s += box(780, 130, 200, 56, 'o') + T(796, 154, '랭킹 모델 ② ③', 'k') + T(796, 174, '벡터를 피처로 읽기만', 'sm');
        s += ar(id, 'q4', 'M880,98 V128', 'c');
        s += dot(id + '-q1', 'k', 1.4) + dot(id + '-q2', 'k', 2) + dot(id + '-q3', 'k', 1.4) + dot(id + '-q4', 'k', 1.2);
        put(id, 1000, 214, '왼쪽은 요청 때 모델 안에서 1번 자리를 계산하고, 오른쪽은 사용자 벡터를 미리 계산해 저장소에서 읽는다', s);
    })();

    /* 4번 — 자리별 모델 연표 */
    (function () {
        const id = 'dvd-fig4';
        let s = '';
        const X = y => 150 + (y - 2016) * 160;
        for (let y = 2016; y <= 2021; y++) s += `<line class="dvd-yr" x1="${X(y)}" y1="30" x2="${X(y)}" y2="270"/>` + T(X(y), 22, String(y), 'sm mono', 'middle');
        const lane = (y, name, c) => T(20, y + 5, name, 'lane ' + c);
        const pt = (yr, y, c, label, dy) => `<circle class="dvd-pm ${c}" cx="${X(yr)}" cy="${y}" r="7"/>` + T(X(yr), y + (dy || -14), label, 'k halo', 'middle');
        const link = (pid, a, b, y1, y2, c) => ar(id, pid, `M${X(a) + 10},${y1} L${X(b) - 10},${y2}`, c);
        s += lane(80, '① 행동 기록', 'la') + pt(2018, 80, 'a', 'DIN') + pt(2019, 80, 'a', 'DIEN') + pt(2019, 110, 'a', 'BST', 22);
        s += link('h1', 2018, 2019, 80, 80, 'a') + link('h2', 2018, 2019, 84, 106, 'a');
        s += lane(160, '② 피처 섞기', 'lc') + pt(2016, 160, 'c', 'Wide & Deep') + pt(2017, 145, 'c', 'DeepFM') + pt(2017, 185, 'c', 'DCN', 24) + pt(2021, 185, 'c', 'DCN-V2', 24);
        s += link('h3', 2016, 2017, 157, 147, 'c') + link('h4', 2016, 2017, 163, 183, 'c') + link('h5', 2017, 2021, 185, 185, 'c');
        s += lane(240, '③ 답 내기', 'lb') + pt(2018, 225, 'b', 'ESMM') + pt(2018, 255, 'b', 'MMoE', 24) + pt(2020, 255, 'b', 'PLE', 24);
        s += link('h6', 2018, 2020, 255, 255, 'b');
        put(id, 1000, 290, '자리별 모델 연표. 1번 DIN 2018, DIEN 2019, BST 2019. 2번 Wide and Deep 2016, DeepFM 2017, DCN 2017, DCN-V2 2021. 3번 ESMM 2018, MMoE 2018, PLE 2020', s);
    })();
})();
