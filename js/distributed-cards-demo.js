/**
 * distributed-cards-demo.js — 분산 학습 카드 네 장 (distributed-training 글)
 *
 * 학습 6시간 20분을 GPU 여러 장으로 나누는 자리 하나가 카드 한 장.
 * 색은 css/style.css 의 카드 부품 블록이 정한다 — 파랑 놓여 있는 데이터(학습 행, 임베딩 표), 벽돌색 문제가 되는 것,
 * 먹색 GPU 와 서버, 회색 만드는 작업. 숫자는 전부 그 글의 가상 값이고, 임베딩 크기 27.7GB 와 83.2GB 는
 * embedding-table-ops 글의 값이다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다. 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, tag, srv, table, arrow, dots, burst, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);
    const path = (id, d) => `<path id="${id}" d="${d}" fill="none" stroke="none"/>`;

    // ---------- 1. 데이터 병렬 ----------
    (function () {
        const S = 'dt-dataparallel'; if (!has(S)) return; let s = '';
        s += T(40, 26, '학습 데이터 30일을 넷으로 나눕니다 (각 1억 8,640만 행)', 'lbl sm');
        for (let i = 0; i < 4; i++) {
            const x = 40 + i * 120;
            s += table(x, 32, { label: `${i + 1}/4` });
            s += arrow(`dp${i}`, `M${x + 28},102 L${x + 28},118`, 'a', { svg: S });
            s += burst(`dp${i}`, 'a', 0.05 + i * 0.02, 0.4 + i * 0.02, 8, 2);
            s += srv(x + 6, 122, { cls: 'k', label: `GPU ${i + 1}` });
        }
        s += `<path class="ar a" d="M68,212 L428,212"/>`;
        s += path('dpr', 'M68,212 L428,212') + path('dpl', 'M428,212 L68,212');
        s += dots('dpr', 'a', { n: 2, dur: 3 }) + dots('dpl', 'a', { n: 2, dur: 3 });
        s += T(248, 232, '기울기 합치기(allreduce): 넷의 평균으로 같은 모델을 유지합니다', 'lbl sm', 'middle');
        s += tag(40, 240, '6시간 20분 → 1시간 50분 (3.5배, 효율 86%)', 'a');
        s += T(40, 270, '계산은 넷으로 나뉘지만 합치는 시간은 안 나뉩니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 임베딩만 따로 쪼갠다 ----------
    (function () {
        const S = 'dt-embshard'; if (!has(S)) return; let s = '';
        s += T(40, 26, 'GPU 한 장 메모리 80GB', 'lbl sm');
        s += tag(130, 32, '신경망 38MB → GPU 안에 들어갑니다', 'a');
        s += tag(130, 54, '임베딩 83.2GB (Adam) → 안 들어갑니다', 'b');
        s += srv(48, 110, { cls: 'k', label: 'GPU 80GB' });
        s += T(400, 26, '파라미터 서버 (임베딩만)', 'lbl sm');
        s += table(410, 40, { label: '서버 1: 41.6GB' });
        s += table(410, 140, { label: '서버 2: 41.6GB' });
        s += arrow('es1', 'M104,132 L406,75', 'a', { svg: S });
        s += arrow('es2', 'M104,146 L406,158', 'a', { svg: S });
        s += dots('es1', 'a', { n: 2, dur: 2.6 }) + dots('es2', 'a', { n: 2, dur: 2.6 });
        s += T(250, 210, '배치 1,024건은 유저 2억 줄 중 1,024줄 (0.0005%) 만 씁니다', 'lbl sm', 'middle');
        s += tag(130, 224, '표 전체가 아니라 건드린 줄만 오갑니다', 'k');
        s += T(40, 270, '임베딩은 파라미터 서버 두 대에 나누고 GPU 는 건드린 줄만 받습니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 동기와 비동기 ----------
    (function () {
        const S = 'dt-sync'; if (!has(S)) return; let s = '';
        s += `<line class="split" x1="260" y1="20" x2="260" y2="250"/>`;
        s += T(40, 26, '동기: 넷이 함께 갑니다', 'lbl k');
        const left = [0.72, 0.8, 1.0, 0.76];
        left.forEach((f, i) => {
            const y = 38 + i * 22;
            s += T(40, y + 11, `GPU ${i + 1}`, 'lbl sm');
            s += hbar(84, y, 150, f, 'k', 12);
        });
        s += `<line class="tick" x1="234" y1="32" x2="234" y2="128"/>`;
        s += T(160, 140, '빈 칸이 기다린 시간', 'lbl sm', 'middle');
        s += tag(40, 150, '스텝마다 늦은 장을 기다립니다', 'b');
        s += tag(40, 176, '혼자보다 13% 깁니다', 'b');
        s += T(276, 26, '비동기: 각자 갑니다', 'lbl k');
        const ticks = [[0.3, 0.62, 0.95], [0.25, 0.55, 0.88], [0.34, 0.68], [0.28, 0.6, 0.92]];
        ticks.forEach((tk, i) => {
            const y = 38 + i * 22;
            s += T(276, y + 11, `GPU ${i + 1}`, 'lbl sm');
            s += hbar(320, y, 150, 1, 'a', 12);
            tk.forEach(f => { s += `<line class="tick" x1="${320 + Math.round(150 * f)}" y1="${y - 2}" x2="${320 + Math.round(150 * f)}" y2="${y + 14}"/>`; });
        });
        s += T(395, 140, '눈금이 스텝의 경계', 'lbl sm', 'middle');
        s += tag(276, 150, '기다림 0초', 'a');
        s += tag(276, 176, '기울기가 평균 3스텝 낡습니다', 'b');
        s += T(40, 214, '느린 장 하나가 셋을 세웁니다', 'lbl sm');
        s += T(276, 214, '남이 고친 값을 모른 채 갱신합니다', 'lbl sm');
        s += T(40, 238, '실무는 섞습니다. 신경망은 동기로, 임베딩은 비동기로', 'lbl sm');
        s += T(40, 270, '기다리면 시간을 잃고, 안 기다리면 최신 값을 잃습니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 장수와 시간 ----------
    (function () {
        const S = 'dt-speedup'; if (!has(S)) return; let s = '';
        s += T(40, 26, 'GPU', 'lbl sm');
        s += T(110, 26, '학습 시간 (막대 끝이 6시간 20분)', 'lbl sm');
        s += T(480, 26, '효율', 'lbl sm', 'end');
        const rows = [['1장', 1.0, '6시간 20분', '100%'], ['2장', 0.526, '3시간 20분', '95%'], ['4장', 0.289, '1시간 50분', '86%'],
                      ['8장', 0.171, '1시간 05분', '73%'], ['16장', 0.113, '43분', '56%']];
        rows.forEach((r, i) => {
            const y = 36 + i * 32;
            s += T(40, y + 13, r[0], 'lbl k');
            s += hbar(110, y + 2, 260, r[1], i >= 3 ? 'c' : 'a');
            s += T(378, y + 13, r[2], 'lbl k');
            s += T(480, y + 13, r[3], i >= 3 ? 'lbl b' : 'lbl k', 'end');
        });
        s += tag(40, 204, '4장 → 8장은 44분 줄고, 8장 → 16장은 22분 줍니다', 'k');
        s += T(40, 240, '장이 하나 늘 때마다 합치기와 기다림이 5.3% 씩 붙습니다', 'lbl sm');
        s += T(40, 270, '장수를 두 배로 해도 시간은 절반이 안 됩니다. 효율이 내려갑니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
