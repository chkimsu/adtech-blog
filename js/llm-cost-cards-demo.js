/**
 * llm-cost-cards-demo.js — 비용, 캐시, 비결정성 카드 네 장
 *
 * 요청 한 건의 토큰 셋, 시스템 메시지를 캐시에서 읽는 몫, 하루 100만 요청의 값 셋,
 * 같은 입력을 temperature 0 과 0.7 로 10번씩 물은 답을 카드 한 장씩으로 그린다.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 입력 토큰과 temperature 0,
 * 벽돌색은 출력 토큰과 temperature 0.7, 먹색은 요청과 문제, 회색은 캐시에서 읽은 몫이고, 점선 상자는 가상 값(단가)이다.
 *
 * 숫자(토큰 1,000, 200, 150, 한 건 7.80원과 그 셋 4.00, 0.80, 3.00, 캐시 0, 50, 90, 100% 의 하루 값,
 * 하루 720,000원, 7,800,000원, 4,200,000원과 한 달 값, 10번 물은 답의 수)는
 * llm-cost-cache-nondeterminism 글의 파이썬 블록 셋이 찍은 출력에서 옮겼다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, list, arrow, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);

    // ---------- 1. 요청 한 건의 토큰 셋 ----------
    (function () {
        const S = 'cc-tokens'; if (!has(S)) return; let s = '';
        s += T(40, 18, '요청 한 건 (토큰 수)', 'lbl k');
        s += box(40, 28, 300, 24, '시스템 1,000', 'a', 10);
        s += box(340, 28, 60, 24, '사용자 200', 'a', 9);
        s += box(400, 28, 45, 24, '출력 150', 'b', 9);
        s += T(40, 72, '입력 1,200 토큰, 출력 150 토큰', 'lbl sm');
        s += list(40, 86, 446, 64, [
            { t: '가상 단가, 100만 토큰당', cls: 'h' },
            '작은 모델: 입력 400원, 출력 1,600원',
            '큰 모델: 입력 4,000원, 출력 20,000원',
        ]);
        s += T(40, 176, '큰 모델 한 건 7.80원 (원)', 'lbl k');
        const parts = [['시스템', 4.00, 'a'], ['사용자', 0.80, 'a'], ['출력', 3.00, 'b']];
        parts.forEach(([t, v, c], i) => {
            const y = 188 + i * 26;
            s += T(40, y + 11, t, 'lbl sm') + hbar(110, y, 300, v / 4.00, c, 13) + T(418, y + 11, v.toFixed(2), 'lbl sm');
        });
        s += T(40, 284, '작은 모델 한 건 0.72원 = 0.40 + 0.08 + 0.24', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 캐시가 깎는 몫 ----------
    (function () {
        const S = 'cc-cache'; if (!has(S)) return; let s = '';
        s += T(40, 18, '시스템 1,000 토큰 가운데 캐시에 맞은 몫', 'lbl k');
        s += box(40, 28, 150, 22, '캐시 500', 'c', 10);
        s += box(190, 28, 150, 22, '새로 500', 'a', 10);
        s += arrow('ccc0', 'M115,50 L115,70', 'a', { svg: S });
        s += T(40, 84, '캐시 토큰은 입력 단가의 0.1배로 셉니다', 'lbl sm');
        s += T(40, 112, '큰 모델의 하루 값 (원)', 'lbl k');
        const rows = [['캐시 0%', 7800000, '100%'], ['캐시 50%', 6000000, '77%'], ['캐시 90%', 4560000, '58%'], ['캐시 100%', 4200000, '54%']];
        rows.forEach(([t, v, p], i) => {
            const y = 122 + i * 28;
            s += T(40, y + 11, t, 'lbl sm') + hbar(120, y, 230, v / 7800000, i ? 'a' : 'k', 13) +
                T(358, y + 11, v.toLocaleString('en-US') + ' (' + p + ')', 'lbl sm');
        });
        s += T(40, 256, '출력 150 토큰의 하루 3,000,000원은 그대로', 'lbl sm');
        s += T(40, 278, '캐시는 앞부분이 같은 입력에만 맞습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 하루 100만 요청의 값 셋 ----------
    (function () {
        const S = 'cc-daily'; if (!has(S)) return; let s = '';
        s += T(40, 18, '하루 1,000,000건, 한 달은 30일', 'lbl k');
        const rows = [['작은 모델', 720000, 21600000, 'a'], ['큰 모델', 7800000, 234000000, 'a'], ['큰 모델 + 캐시', 4200000, 126000000, 'c']];
        rows.forEach(([t, d, m, c], i) => {
            const y = 34 + i * 52;
            s += T(40, y + 11, t, 'lbl');
            s += hbar(150, y, 260, d / 7800000, c, 13) + T(418, y + 11, d.toLocaleString('en-US'), 'lbl sm');
            s += T(150, y + 32, '한 달 ' + m.toLocaleString('en-US') + '원', 'lbl sm');
        });
        s += T(40, 206, '한 달 값은 하루 값의 30배', 'lbl k');
        s += T(40, 230, '캐시를 다 맞혀도 출력 3,000,000원은 남습니다', 'lbl sm');
        s += T(40, 254, '그때 출력은 하루 값의 71%', 'lbl sm');
        s += T(40, 280, '단가는 가상 데이터입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 같은 입력 10번의 답 ----------
    (function () {
        const S = 'cc-variance'; if (!has(S)) return; let s = '';
        s += T(40, 18, '문제마다 10번의 answer 가지 수', 'lbl k');
        s += T(150, 40, 'temperature 0', 'lbl sm', 'middle') + T(300, 40, 'temperature 0.7', 'lbl sm', 'middle');
        const rows = [['p16', 3, '12, 36, 144'], ['p17', 3, '90, 180, 894'], ['p18', 2, '720, 7,200'],
            ['p19', 3, '529,200 외 둘'], ['p20', 3, '90, 900, 1,000,000']];
        rows.forEach(([id, n, seen], i) => {
            const y = 48 + i * 24;
            s += T(40, y + 13, id, 'lbl sm');
            s += box(120, y, 60, 18, '1가지', 'a', 10) + box(270, y, 60, 18, n + '가지', 'b', 10);
            s += T(340, y + 13, seen, 'lbl sm');
        });
        s += T(40, 186, '1회차와 다른 회차 (45개 중)', 'lbl k');
        const bars = [['answer, 0.7', 21, 'b'], ['steps, 0.7', 42, 'b'], ['둘 다, 0', 0, 'a']];
        bars.forEach(([t, n, c], i) => {
            const y = 196 + i * 24;
            s += T(40, y + 11, t, 'lbl sm') + hbar(140, y, 260, n / 45, c, 13) + T(408, y + 11, n + '/45', 'lbl sm');
        });
        s += T(40, 284, '정답: temperature 0 은 40/50, 0.7 은 28/50', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
