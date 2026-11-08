/**
 * kd-methods-cards-demo.js — 지식 증류 카드 네 장
 *
 * 큰 모델의 답을 작은 모델에 옮기는 세 방법(라벨 증류, 로짓 증류, 임베딩 증류)을 카드 한 장씩으로 그린다.
 * 교사에게 받는 것 셋, 온도가 펼친 확률, 쌍 50개로 배울 때의 일치율, 서빙 100만 건의 값.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 교사의 출력, 벽돌색은 학생의 답,
 * 먹색은 서버와 값, 회색은 학생이 못 보는 피처다. 점선은 온도와 손실이다.
 *
 * 숫자는 전부 knowledge-distillation 글의 파이썬 블록 셋이 찍은 출력에서 옮긴 값이다. 질의와 광고 쌍과
 * 가상 교사는 블록이 random.Random(7) 로 만든 가상 값이다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, list, arrow, svg, srv } = window.CardKit;
    const has = id => !!document.getElementById(id);
    const LABELS = ['상', '중', '하', '무관'];

    // ---------- 1. 교사에게 받는 것 셋 ----------
    (function () {
        const S = 'kd-three'; if (!has(S)) return; let s = '';
        // 블록 1 의 2단계가 찍은 학습 쌍 7번. 교사 라벨 중, T 2 의 확률 넷, 교사 벡터 h 8개
        const PROB_T2 = [0.135, 0.441, 0.354, 0.070];
        const H = [0.20, -0.04, -0.03, 0.02, -0.39, -0.40, 0.13, -0.30];
        s += T(20, 16, '학습 쌍 7번 하나에서 교사가 내는 것 셋과, 그것을 맞히는 학생 셋', 'lbl sm');
        // 피처 여덟. 여섯은 학생도 보고, 둘은 교사만 본다
        for (let i = 0; i < 8; i++) s += `<rect class="${i < 6 ? 'track' : 'f-c'}" x="${20 + i * 16}" y="30" width="13" height="13"/>`;
        s += T(20, 58, '학생도 보는 피처 여섯', 'lbl sm') + T(116, 72, '교사만 봄', 'lbl sm');
        s += arrow('kd-t0', 'M76,78 L76,94', 'k', { svg: S });
        // 가상 교사
        s += `<rect class="track" x="20" y="98" width="136" height="88"/>`;
        s += T(30, 116, '가상 교사', 'lbl k');
        s += T(30, 134, 'h = tanh(A x), 8개', 'lbl sm') + T(30, 150, 's = dot(V, h)', 'lbl sm');
        s += T(30, 166, '로짓 = ALPHA × s + BETA', 'lbl sm') + T(30, 180, '라벨 = 가장 큰 로짓', 'lbl sm');
        s += arrow('kd-t1', 'M158,120 C168,120 166,62 178,62', 'a', { svg: S });
        s += arrow('kd-t2', 'M158,142 L176,142', 'a', { svg: S });
        s += arrow('kd-t3', 'M158,164 C168,164 166,236 178,236', 'a', { svg: S });
        // 라벨 증류: 라벨 하나
        s += T(182, 44, '라벨 증류: 가장 큰 라벨 하나', 'lbl k');
        s += box(182, 51, 44, 22, '중', 'a', 11);
        // 로짓 증류: T 2 로 펼친 확률 넷. 점선은 온도
        s += T(182, 98, '로짓 증류: T=2 로 펼친 확률 넷', 'lbl k');
        s += `<rect class="list" x="178" y="104" width="160" height="76"/>`;
        PROB_T2.forEach((p, i) => {
            const x = 188 + i * 37, h = p * 100;
            s += `<rect class="f-a" x="${x}" y="${(162 - h).toFixed(1)}" width="26" height="${h.toFixed(1)}"/>`;
            s += T(x + 13, 158 - h, p.toFixed(3), 'lbl sm', 'middle') + T(x + 13, 175, LABELS[i], 'lbl sm', 'middle');
        });
        // 임베딩 증류: 교사 벡터 h 8개
        s += T(182, 202, '임베딩 증류: 교사 벡터 h, 숫자 8개', 'lbl k');
        s += `<line class="tick" x1="182" y1="236" x2="344" y2="236"/>`;
        H.forEach((v, i) => {
            const x = 184 + i * 20, h = Math.max(1.5, Math.abs(v) * 50);
            s += `<rect class="f-a" x="${x}" y="${(v >= 0 ? 236 - h : 236).toFixed(1)}" width="15" height="${h.toFixed(1)}"/>`;
        });
        s += T(182, 270, H.map(v => `${v >= 0 ? '+' : ''}${v.toFixed(2)}`).join(' '), 'lbl sm');
        // 학생 셋
        [[62, '라벨 하나'], [142, '확률 넷'], [236, '숫자 여덟']].forEach(([y, sub], i) => {
            s += arrow(`kd-t${4 + i}`, `M${i === 0 ? 230 : 346},${y} L422,${y}`, 'b', { svg: S });
            s += box(426, y - 11, 76, 22, '학생', 'b', 11) + T(464, y + 26, sub, 'lbl sm', 'middle');
        });
        s += T(20, 292, '서빙 때 세 학생은 모두 교사 없이 학생이 보는 피처 여섯만 받는다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 온도가 펼친 확률 ----------
    (function () {
        const S = 'kd-soft'; if (!has(S)) return; let s = '';
        // 블록 1 의 2단계가 찍은 학습 쌍 7번의 확률. [T, 상, 중, 하, 무관, 가장 큰 라벨 밖의 몫]
        const ROWS = [[1, [0.053, 0.567, 0.366, 0.014], 0.433], [2, [0.135, 0.441, 0.354, 0.070], 0.559],
            [4, [0.194, 0.351, 0.315, 0.140], 0.649]];
        s += T(20, 16, '학습 쌍 7번의 교사 로짓을 온도 T 로 나눠 소프트맥스에 넣는다', 'lbl sm');
        s += list(20, 26, 480, 22, ['교사 로짓: 상 -1.54, 중 +0.82, 하 +0.38, 무관 -2.86 → 로짓 ÷ T → 소프트맥스']);
        const BASE = 200;
        ROWS.forEach(([t, probs, rest], g) => {
            const x0 = 30 + g * 170;
            s += `<line class="tick" x1="${x0 - 4}" y1="${BASE}" x2="${x0 + 136}" y2="${BASE}"/>`;
            probs.forEach((p, i) => {
                const x = x0 + i * 34, h = p * 180;
                s += `<rect class="f-a" x="${x}" y="${(BASE - h).toFixed(1)}" width="26" height="${h.toFixed(1)}"/>`;
                s += T(x + 13, BASE - h - 5, p.toFixed(3), 'lbl sm', 'middle') + T(x + 13, BASE + 14, LABELS[i], 'lbl sm', 'middle');
            });
            s += T(x0 + 64, BASE + 34, `T = ${t}`, 'lbl k', 'middle');
            s += T(x0 + 64, BASE + 52, `가장 큰 라벨 밖의 몫 ${rest.toFixed(3)}`, 'lbl sm', 'middle');
        });
        s += T(20, 274, '가장 큰 라벨은 세 온도 모두 중이고, 그 밖의 몫만 0.433 에서 0.649 로 커진다', 'lbl sm');
        s += T(20, 292, '학생도 같은 T 로 배우고, 서빙 때는 T = 1 로 답한다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 쌍 50개로 배울 때 ----------
    (function () {
        const S = 'kd-small'; if (!has(S)) return; let s = '';
        // 블록 셋이 찍은 일치율. [학생, 50쌍 벌마다 다섯, 50쌍 평균, 1,000쌍]
        const ROWS = [['라벨 증류', [0.695, 0.651, 0.667, 0.730, 0.684], 0.685, 0.783],
            ['로짓 T=1', [0.753, 0.722, 0.678, 0.777, 0.765], 0.739, 0.781],
            ['로짓 T=2', [0.760, 0.753, 0.697, 0.785, 0.782], 0.755, 0.783],
            ['로짓 T=4', [0.754, 0.755, 0.700, 0.779, 0.780], 0.754, 0.789],
            ['임베딩 증류', [0.764, 0.751, 0.709, 0.784, 0.780], 0.758, 0.771]];
        // 막대는 일치율 0 에서 시작한다. 0.60 에서 시작하면 0.07 차이가 막대 길이로는 두 배 가까이 보인다.
        const LO = 0, SPAN = 1, W = 150;
        const X1 = v => 130 + (v - LO) / SPAN * W, X2 = v => 330 + (v - LO) / SPAN * W;
        s += T(20, 16, '시험 1,000쌍에서 학생과 교사의 가장 큰 라벨이 같은 비율', 'lbl sm');
        s += T(130, 34, '50쌍', 'lbl k') + T(130, 46, '막대는 다섯 벌 평균, 점은 벌마다', 'lbl sm');
        s += T(330, 34, '1,000쌍', 'lbl k') + T(330, 46, '학습 쌍 전부로 한 번', 'lbl sm');
        ROWS.forEach(([name, sets, m50, m1000], i) => {
            const y = 56 + i * 38;
            s += T(20, y + 11, name, 'lbl k');
            s += `<rect class="f-b" x="130" y="${y}" width="${(X1(m50) - 130).toFixed(1)}" height="14"/>`;
            s += T(X1(m50) + 4, y + 11, m50.toFixed(3), 'lbl k');
            sets.forEach(v => { s += `<circle class="f-k" cx="${X1(v).toFixed(1)}" cy="${y + 22}" r="2.5"/>`; });
            s += `<rect class="f-b" x="330" y="${y}" width="${(X2(m1000) - 330).toFixed(1)}" height="14"/>`;
            s += T(X2(m1000) + 4, y + 11, m1000.toFixed(3), 'lbl k');
        });
        [[X1, 130], [X2, 330]].forEach(([X, x0]) => {
            s += `<line class="tick" x1="${x0}" y1="240" x2="${x0 + W}" y2="240"/>`;
            [0, 0.5, 1].forEach(v => {
                s += `<line class="tick" x1="${X(v).toFixed(1)}" y1="240" x2="${X(v).toFixed(1)}" y2="245"/>` + T(X(v), 256, v.toFixed(2), 'lbl sm', 'middle');
            });
        });
        s += T(20, 276, '50쌍에서 라벨 증류보다 로짓 T=2 +0.070, 임베딩 +0.073, 다섯 벌 모두 높다', 'lbl k');
        s += T(20, 292, '1,000쌍에서는 가장 낮은 임베딩 0.771, 가장 높은 로짓 T=4 0.789, 차이 0.018', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 100만 건의 값 ----------
    (function () {
        const S = 'kd-cost'; if (!has(S)) return; let s = '';
        // 블록 3 의 4단계가 찍은 100만 건의 값. [누가, 원, 색, 서버인가]
        const ROWS = [['교사, 큰 상용 모델', 7800000, 'a', false], ['교사, 작은 상용 모델', 720000, 'a', false],
            ['학생, CPU 서버', 465, 'b', true], ['학생, GPU 서버', 459, 'b', true]];
        const X = v => 140 + (Math.log10(v) - 2) / 5 * 280;
        s += T(20, 16, '서빙 100만 건의 값, 로그 눈금(눈금 하나가 10배)', 'lbl sm');
        ROWS.forEach(([name, won, cls, server], i) => {
            const y = 34 + i * 40;
            s += T(20, y + 14, name, 'lbl k');
            s += `<rect class="f-${cls}" x="140" y="${y}" width="${(X(won) - 140).toFixed(1)}" height="20"/>`;
            s += T(X(won) + 6, y + 14, `${won.toLocaleString('en-US')}원`, 'lbl k');
            if (server) s += srv(236, y - 3, { scale: 0.48 });
        });
        s += `<line class="tick" x1="140" y1="196" x2="420" y2="196"/>`;
        [['100', 2], ['1천', 3], ['1만', 4], ['10만', 5], ['100만', 6], ['1,000만', 7]].forEach(([lab, e]) => {
            const x = 140 + (e - 2) / 5 * 280;
            s += `<line class="tick" x1="${x}" y1="196" x2="${x}" y2="201"/>` + T(x, 213, lab, 'lbl sm', 'middle');
        });
        s += T(20, 236, '100만 건의 값은 작은 상용 모델 교사가 CPU 서버 학생의 1,550배', 'lbl k');
        s += T(20, 254, '100만 건은 CPU 서버 한 대가 0.97시간, 하루 2억 2,800만 건은 서버 220.67시간', 'lbl sm');
        s += T(20, 272, '학습 쌍 1,000개를 교사에게 받는 값: 작은 상용 720원, 큰 상용 7,800원', 'lbl sm');
        s += T(20, 290, '교사 요청 한 건은 입력 1,200 토큰과 출력 150 토큰, 단가는 가상 값', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
