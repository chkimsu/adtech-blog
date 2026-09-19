/**
 * batch-infer-cards-demo.js — 배치 추론 카드 세 장 (batch-vs-realtime-inference 글)
 *
 * 유저 벡터를 요청마다 계산하지 않고 새벽에 미리 만들어 두는 자리 하나가 카드 한 장.
 * 왼쪽에 들어오는 것, 가운데에 처리하는 자리, 오른쪽에 나오는 결과, 맨 아래 한 줄에 숫자다.
 * 색은 css/style.css 의 카드 부품 블록이 정한다 — 파랑 놓여 있는 데이터(표, 저장소), 벽돌색 지금 오는 것(요청),
 * 먹색 서버, 회색 만드는 작업(배치). 숫자는 전부 그 글의 가상 값이다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다). 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, tag, srv, table, db, tool, user, arrow, dots, burst, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);

    // ---------- 1. 새벽에 미리 만든다 ----------
    (function () {
        const S = 'bi-precompute'; if (!has(S)) return; let s = '';
        s += T(40, 26, '새벽 04:30, 하루 한 번', 'lbl sm');
        s += table(40, 34, { label: '회원 1,400만 명' });
        s += arrow('bp1', 'M100,52 L144,58', 'a', { svg: S });
        s += tool(148, 40, 120, { label: '유저 타워 계산', sub: '워커 8개, 25분', clock: true });
        s += arrow('bp2', 'M272,60 L296,60', 'a', { svg: S });
        s += table(300, 34, { label: '유저 벡터 표', sub: '64차원, 3.58GB' });
        s += arrow('bp3', 'M360,56 L416,56', 'a', { svg: S });
        s += db(440, 52, { label: '온라인 저장소' });
        s += burst('bp1', 'a', 0.05, 0.3, 8, 3) + burst('bp2', 'a', 0.35, 0.55, 8, 3) + burst('bp3', 'a', 0.6, 0.85, 8, 3);
        s += user(60, 160, '회원 A');
        s += srv(140, 146, { cls: 'k', label: '광고 서버' });
        s += arrow('bp4', 'M80,176 L136,176', 'b', { svg: S });
        s += arrow('bp5', 'M188,168 C300,168 420,150 440,114', 'a', { svg: S, dash: true });
        s += dots('bp4', 'b', { n: 2, dur: 2 }) + dots('bp5', 'a', { n: 2, dur: 2 });
        s += T(300, 150, '요청마다 조회 0.2ms', 'lbl sm', 'middle');
        s += tag(230, 200, '요청마다 계산하면 하루 126.7시간', 'b');
        s += tag(230, 226, '새벽에 한 번이면 3.3시간', 'a');
        s += T(40, 270, '같은 사람이 하루 16.3번 요청합니다. 사람마다 한 번이면 38배 덜 듭니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 활성 12% 가 요청 80% ----------
    (function () {
        const S = 'bi-cache'; if (!has(S)) return; let s = '';
        s += T(40, 26, '전체 회원 1,400만 명 중', 'lbl sm');
        s += hbar(40, 34, 300, 0.12, 'b');
        s += T(346, 46, '활성 168만 명 (12%)', 'lbl b');
        s += T(40, 74, '하루 요청 2억 2,800만 건 중', 'lbl sm');
        s += hbar(40, 82, 300, 0.80, 'b');
        s += T(346, 94, '활성 유저의 요청 (80%)', 'lbl b');
        s += T(200, 118, '요청당 평균 (막대 끝이 2.0ms)', 'lbl sm');
        const rows = [['전원 3,584MB', 'a', 0.1, '0.20ms, 적중 100%', 'lbl k'],
                      ['활성만 430MB', 'a', 0.28, '0.56ms, 적중 80%', 'lbl k'],
                      ['안 올림', 'b', 1.0, '2.00ms, 매번 계산', 'lbl b']];
        rows.forEach((r, i) => {
            const y = 126 + i * 28;
            s += tag(40, y, r[0], r[1]);
            s += hbar(200, y + 2, 160, r[2], r[1]);
            s += T(366, y + 13, r[3], r[4]);
        });
        s += T(40, 226, '못 찾은 요청은 그 자리에서 유저 타워를 돌립니다', 'lbl sm');
        s += T(40, 240, '활성 유저는 한 시간마다 다시 계산합니다', 'lbl sm');
        s += T(40, 270, '메모리 3.6GB 면 전원이 들어갑니다. 적중 100% 가 가장 쌉니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 한 달 비용 ----------
    (function () {
        const S = 'bi-cost'; if (!has(S)) return; let s = '';
        s += T(40, 26, '요청 2,639 QPS, 평시 부하율 0.77 (가상 값)', 'lbl sm');
        s += T(40, 52, 'CPU 서버', 'lbl k');
        for (let i = 0; i < 12; i++) s += srv(40 + i * 26, 58, { cls: 'k', scale: 0.5 });
        s += T(360, 76, '12대', 'lbl k');
        s += tag(392, 64, '한 달 4,147,200원', 'a');
        s += T(40, 102, '한 대 287 QPS, 시간당 480원', 'lbl sm');
        s += T(40, 136, 'GPU 서버', 'lbl k');
        for (let i = 0; i < 3; i++) s += srv(40 + i * 26, 142, { cls: 'b', scale: 0.5 });
        s += T(126, 160, '2대 + 예비 1대', 'lbl k');
        s += tag(392, 148, '한 달 8,208,000원', 'b');
        s += T(40, 186, '한 대 2,300 QPS, 시간당 3,800원', 'lbl sm');
        s += T(40, 200, '한 대가 빠지면 부하율 1.15 → 예비 1대', 'lbl sm');
        s += hbar(40, 216, 300, 4147200 / 8208000, 'a');
        s += T(346, 228, 'CPU 415만 원', 'lbl k');
        s += hbar(40, 238, 300, 1, 'b');
        s += T(346, 250, 'GPU 821만 원', 'lbl b');
        s += T(40, 270, '이 규모에서는 CPU 가 절반 값입니다. GPU 는 예비 한 대가 비용을 정합니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
