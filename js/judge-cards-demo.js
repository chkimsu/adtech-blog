/**
 * judge-cards-demo.js — LLM-as-a-Judge 카드 네 장
 *
 * 채점표 다섯 줄과 사람 라벨 세 칸, 점수 50개와 사람 라벨의 칸별 수, 자리를 바꿔 다시 묻는 짝비교,
 * 일치율과 kappa 의 차이를 카드 한 장씩으로 그린다.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 코드가 하는 일, 벽돌색은 모델의 판정,
 * 먹색은 질의와 상품, 회색은 사람과 다른 판정이고, 점선 상자는 가상 값(사람 라벨)이다.
 *
 * 숫자(라벨 18, 15, 17, 칸별 수 15, 3, 0, 15, 17, 일치율 32/50 = 0.64, 우연 일치 0.34, kappa 0.45, 0.90, 0.00,
 * 짝비교 20쌍, 40건, A 자리 22건, 18쌍, 2쌍, c07, c19, 점수가 같은 4쌍 가운데 3쌍)는
 * llm-as-a-judge 글의 파이썬 블록 셋이 찍은 출력에서 옮겼다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, tag, list, arrow, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);

    // ---------- 1. 채점표 다섯 줄과 사람 라벨 세 칸 ----------
    (function () {
        const S = 'jd-rubric'; if (!has(S)) return; let s = '';
        s += T(40, 18, '채점표 (시스템 메시지)', 'lbl k');
        const rows = [
            ['5', '질의가 찾는 바로 그 상품', '상'],
            ['4', '질의와 같은 분류의 상품', '상'],
            ['3', '가까운 분류라 함께 살 만한 상품', '중'],
            ['2', '분류는 다르지만 조금 이어짐', '하'],
            ['1', '질의와 관련 없음', '하'],
        ];
        rows.forEach(([n, t, bin], i) => {
            const y = 28 + i * 28;
            s += box(40, y, 24, 20, n, 'b', 10) + T(74, y + 14, t, 'lbl sm');
            s += arrow('jdr' + i, `M300,${y + 10} L346,${y + 10}`, 'a', { svg: S });
            s += box(352, y, 40, 20, bin, 'a', 10);
        });
        s += list(40, 176, 446, 64, [
            { t: '사람 라벨, 가상 데이터', cls: 'h' },
            '질의와 같은 분류면 상, 정해 둔 이웃 분류면 중, 그 밖은 하',
            '이웃: 캠핑 의자는 가방, 헤드셋과 스니커즈는 잡화',
        ]);
        s += T(40, 264, '50쌍: 상 18, 중 15, 하 17', 'lbl k');
        s += T(40, 284, '모델은 이웃 분류의 목록을 받지 않았습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 점수 대 사람 라벨 ----------
    (function () {
        const S = 'jd-score'; if (!has(S)) return; let s = '';
        s += T(40, 18, '줄은 사람 라벨, 칸은 판정', 'lbl k');
        ['판정 상', '판정 중', '판정 하'].forEach((h, j) => { s += T(160 + j * 100, 40, h, 'lbl sm', 'middle'); });
        const grid = [['상 18쌍', [15, 3, 0]], ['중 15쌍', [0, 0, 15]], ['하 17쌍', [0, 0, 17]]];
        grid.forEach(([h, row], i) => {
            const y = 50 + i * 40;
            s += T(40, y + 20, h, 'lbl');
            row.forEach((n, j) => {
                const cls = i === j ? 'b' : (n ? 'c' : 'k');
                s += box(120 + j * 100, y, 80, 30, String(n), n || i === j ? cls : 'k', 11);
            });
        });
        s += T(40, 196, '일치율 32/50 = 0.64', 'lbl k');
        s += T(40, 218, '점수 1점 27개, 5점 14개로 두 끝에 몰렸습니다', 'lbl sm');
        s += T(40, 240, '캠핑 의자의 가방 5쌍은 모두 2점', 'lbl sm');
        s += T(40, 260, '헤드셋과 스니커즈의 잡화 10쌍은 모두 1점', 'lbl sm');
        s += T(40, 284, '읽지 못한 답 0개, 50개에 66.0초', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 좌우를 바꿔 다시 묻기 ----------
    (function () {
        const S = 'jd-swap'; if (!has(S)) return; let s = '';
        s += T(40, 18, 'c07 캠핑 의자: 중 상품 대 하 상품', 'lbl k');
        s += box(40, 28, 120, 22, 'A 중  B 하', 'k', 10);
        s += arrow('jds0', 'M160,39 L206,39', 'a', { svg: S });
        s += tag(212, 30, 'winner A', 'b');
        s += T(300, 44, '중 상품이 이김', 'lbl sm');
        s += box(40, 60, 120, 22, 'A 하  B 중', 'k', 10);
        s += arrow('jds1', 'M160,71 L206,71', 'a', { svg: S });
        s += tag(212, 62, 'winner A', 'c');
        s += T(300, 76, '하 상품이 이김', 'lbl sm');
        s += T(40, 104, '같은 자리가 두 번 이기면 위치 편향입니다', 'lbl');
        s += T(40, 132, '20쌍의 결과', 'lbl k');
        const rows = [['두 번 다 사람과 같은 쪽', 18, 'b'], ['승자가 바뀐 쌍', 2, 'c'], ['두 번 다 사람과 다른 쪽', 0, 'c']];
        rows.forEach(([t, n, c], i) => {
            const y = 142 + i * 28;
            s += T(40, y + 11, t, 'lbl sm') + hbar(200, y, 220, n / 20, c, 13) + T(428, y + 11, n + '쌍', 'lbl sm');
        });
        s += T(40, 244, 'A 자리가 이긴 요청 22/40건', 'lbl sm');
        s += T(40, 264, '점수가 같은 4쌍 가운데 3쌍은 짝비교가 사람과 같은 쪽', 'lbl sm');
        s += T(40, 284, '승자가 바뀐 c07, c19 는 둘 다 중 대 하', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 일치율과 kappa 의 차이 ----------
    (function () {
        const S = 'jd-kappa'; if (!has(S)) return; let s = '';
        const sets = [
            ['이 글의 판정 50쌍', 0.64, 0.34, 0.45, 'b'],
            ['모두 상이라 답하는 가상 판정', 0.90, 0.90, 0.00, 'c'],
        ];
        sets.forEach(([name, po, pe, k, c], i) => {
            const y = 16 + i * 108;
            s += T(40, y + 4, name, 'lbl k');
            [['일치율', po, c], ['우연 일치', pe, 'k'], ['kappa', k, 'a']].forEach(([lab, v, cc], j) => {
                const yy = y + 14 + j * 24;
                s += T(40, yy + 11, lab, 'lbl sm') + hbar(120, yy, 300, v, cc, 13) + T(428, yy + 11, v.toFixed(2), 'lbl sm');
            });
        });
        s += T(40, 246, 'kappa = (일치율 - 우연 일치) / (1 - 우연 일치)', 'lbl');
        s += T(40, 268, '우연 일치는 칸마다 두 쪽의 몫을 곱해 더한 값', 'lbl sm');
        s += T(40, 288, '일치율만 보면 상품을 읽지 않는 판정이 더 높습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
