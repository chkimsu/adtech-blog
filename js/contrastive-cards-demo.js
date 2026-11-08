/**
 * contrastive-cards-demo.js — contrastive 학습 카드 네 장
 *
 * 같이 클릭된 낱말 쌍으로 23주째의 장난감 임베딩 위에 8차원 사상 W 를 학습하는 과정을 카드 한 장씩으로 그린다.
 * 묶음 10개와 양성 쌍 200개, 배치 하나의 10×10 점수표, 학습 전과 뒤의 recall@5, 온도 셋.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 낱말과 양성 쌍, 벽돌색은 배치의 점수표,
 * 먹색은 8차원 사상 W, 회색은 학습에 쓰지 않는 검증 쌍이다. 점선은 온도와 손실 식이다.
 *
 * 숫자는 전부 embedding-model-finetuning 글의 파이썬 블록 셋이 찍은 출력에서 옮긴 값이다. 낱말과 양성 쌍은
 * 가상 값이고, 검증 쌍과 W 는 블록이 random.Random(7) 로 뽑았다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다. 멈춘 점은 dot 대신 f-a 와 f-c 로 그려 움직임 줄이기에서도 보인다.
 */
(function () {
    'use strict';
    const { T, tw, box, list, arrow, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);
    const line = (x1, y1, x2, y2, cls) => `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;

    // ---------- 1. 묶음 10개와 양성 쌍 200개 ----------
    (function () {
        const S = 'ib-pairs'; if (!has(S)) return; let s = '';
        // 블록 1 의 3단계가 찍은 신발 묶음의 검증 짝 둘. 나머지 짝은 학습 짝이다
        const WORDS = ['운동화', '스니커즈', '러닝화', '조깅화', '마라톤화'];
        const HELD = [['운동화', '러닝화'], ['러닝화', '마라톤화']];
        const held = (a, b) => HELD.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
        const P = WORDS.map((w, i) => {
            const t = (-90 + 72 * i) * Math.PI / 180;
            return [138 + 80 * Math.cos(t), 140 + 80 * Math.sin(t)];
        });
        s += T(20, 16, '같은 묶음의 두 낱말이 양성 쌍이다. 신발 묶음의 짝 10개', 'lbl sm');
        for (let i = 0; i < 5; i++) {
            for (let j = i + 1; j < 5; j++) {
                const [x1, y1] = P[i], [x2, y2] = P[j];
                s += line(x1.toFixed(1), y1.toFixed(1), x2.toFixed(1), y2.toFixed(1), held(WORDS[i], WORDS[j]) ? 'ar c' : 'ar a');
            }
        }
        WORDS.forEach((w, i) => {
            const width = tw(w) + 14, [x, y] = P[i];
            s += box(Math.round((x - width / 2) * 10) / 10, Math.round((y - 11) * 10) / 10, width, 22, w, 'a', 10.5);
        });
        s += line(24, 252, 44, 252, 'ar a') + T(50, 256, '학습 짝, 양쪽 방향이 학습 쌍 16개', 'lbl sm');
        s += line(24, 270, 44, 270, 'ar c') + T(50, 274, '검증 짝 둘, 양쪽 방향이 검증 쌍 4개', 'lbl sm');
        // 블록 1 의 2단계와 3단계가 찍은 수
        s += T(286, 40, '묶음 10개, 낱말 50개', 'lbl k');
        s += T(286, 56, '양성 쌍 200개 = 묶음 안의 순서쌍 전부', 'lbl sm');
        s += box(286, 64, 176, 20, '학습 160', 'a', 10) + box(462, 64, 44, 20, '검증 40', 'c', 9.5);
        s += T(286, 110, '같은 묶음의 짝 100개', 'lbl k');
        s += hbar(286, 118, 220, 0.9, 'a') + T(286, 148, '겹친 칸이 0 인 짝 90개', 'lbl sm');
        s += T(286, 172, '검증 쌍 40개', 'lbl k');
        s += hbar(286, 180, 220, 34 / 40, 'c') + T(286, 210, '겹친 칸이 0 인 쌍 34개, 코사인 0.000', 'lbl sm');
        s += T(286, 234, '다른 묶음의 짝 1,125개 가운데', 'lbl sm');
        s += T(286, 250, '칸이 겹친 짝 17개, 해시 충돌 13개', 'lbl sm');
        s += T(20, 292, '묶음마다 짝 10개 가운데 둘을 양쪽 방향으로 떼어 검증 4쌍, 나머지 학습 16쌍', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 배치 하나의 10×10 점수표 ----------
    (function () {
        const S = 'ib-batch'; if (!has(S)) return; let s = '';
        // 블록 2 의 6단계가 찍은 첫 배치(에포크 0 의 배치 0)의 질의 열 개와, 학습 뒤 스니커즈 줄의 코사인
        const QUERY = ['텐트', '블루투스스피커', '스니커즈', '모자', '여행가방', '프라이팬', '선크림', '젖병', '트레이닝복', '모니터'];
        const ROW = [-0.09, 0.07, 0.81, -0.16, -0.33, 0.05, 0.26, -0.49, 0.32, -0.13];
        const X0 = 124, Y0 = 40, C = 16, PICK = 2;
        s += T(20, 16, '첫 배치 10쌍의 점수표. 칸은 줄의 질의와 열의 짝의 코사인', 'lbl sm');
        s += T(X0, 34, '짝 10개(줄과 같은 차례)', 'lbl sm');
        QUERY.forEach((q, i) => {
            s += T(X0 - 6, Y0 + i * C + 11.5, q, i === PICK ? 'lbl k' : 'lbl sm', 'end');
            for (let k = 0; k < 10; k++) {
                s += `<rect class="${i === k ? 'f-b' : 'track'}" x="${X0 + k * C}" y="${Y0 + i * C}" width="${C - 2}" height="${C - 2}"/>`;
            }
        });
        s += `<rect class="ar b" x="${X0 - 2}" y="${Y0 + PICK * C - 2}" width="${10 * C + 2}" height="${C + 2}"/>`;
        s += T(X0, Y0 + 10 * C + 14, '대각선 10칸이 정답, 나머지 90칸이 음성', 'lbl k');
        // 스니커즈 줄의 코사인 막대. 0 줄 위가 양수
        const BX = 300, BASE = 120, H = 64;
        s += T(BX, 48, '학습 뒤 스니커즈 줄의 코사인', 'lbl k');
        s += line(BX - 4, BASE, BX + 206, BASE, 'tick');
        ROW.forEach((v, k) => {
            const x = BX + k * 21, h = Math.max(1.5, Math.abs(v) * H);
            s += `<rect class="${k === PICK ? 'f-b' : 'track'}" x="${x}" y="${(v >= 0 ? BASE - h : BASE).toFixed(1)}" width="15" height="${h.toFixed(1)}"/>`;
        });
        s += T(BX + PICK * 21 + 7.5, (BASE - 0.81 * H - 5).toFixed(1), '+0.81', 'lbl b', 'middle');
        s += T(BX + 8 * 21 + 7.5, (BASE - 0.32 * H - 5).toFixed(1), '+0.32', 'lbl sm', 'middle');
        s += T(BX, 168, '정답 조깅화 +0.81, 다음 칸 +0.32', 'lbl sm');
        s += list(BX - 4, 176, 216, 22, ['÷ 0.05 → 소프트맥스: 정답 칸 1.000']);
        s += list(20, 222, 378, 50, ['손실 = 줄마다 정답 칸 확률에 -log, 열 줄 평균',
            '학습 전 W: τ 0.05 에서 9.293, τ 1 에서 2.246 (log 10 = 2.303)',
            '학습 뒤 W: batch_loss 0.002928 = 학습 식 0.002928']);
        // 먹색: 질의와 짝에 같이 쓰는 8차원 사상 W
        s += `<rect class="f-k" x="406" y="222" width="100" height="50"/>`;
        s += `<text class="on" x="456" y="243" text-anchor="middle" font-size="10.5">W 384 × 8</text>`;
        s += `<text class="on" x="456" y="259" text-anchor="middle" font-size="9.5">질의와 짝에 같이</text>`;
        s += T(20, 292, '묶음마다 한 쌍이라 배치 640개에서 같은 묶음 낱말이 앉은 음성 칸은 0개', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 학습 전과 뒤의 recall@5 ----------
    (function () {
        const S = 'ib-recall'; if (!has(S)) return; let s = '';
        // 블록 2 의 5단계가 8에포크마다 찍은 값. 학습 전 값은 6단계
        const EPOCH = [0, 8, 16, 24, 32, 39];
        const TRAIN5 = [0.400, 0.969, 0.994, 1.000, 1.000, 1.000];
        const VALID5 = [0.100, 0.400, 0.475, 0.575, 0.600, 0.675];
        const X = e => 84 + e * 4.2, Y = v => 200 - v * 140, BEFORE = 50;
        s += T(20, 16, '검증 쌍 40개와 학습 쌍 160개의 recall@5, 에포크마다', 'lbl sm');
        s += line(40, 200, 256, 200, 'tick');
        [[0, '0'], [0.5, '0.5'], [1, '1.0']].forEach(([v, lab]) => {
            s += line(36, Y(v), 40, Y(v), 'tick') + T(32, Y(v) + 3.5, lab, 'lbl sm', 'end');
        });
        s += T(BEFORE, 214, '학습 전', 'lbl sm', 'middle');
        EPOCH.forEach(e => { s += T(X(e).toFixed(1), 214, String(e), 'lbl sm', 'middle'); });
        s += T(256, 230, '에포크', 'lbl sm', 'end');
        s += `<polyline class="ar a" points="${EPOCH.map((e, i) => `${X(e).toFixed(1)},${Y(TRAIN5[i]).toFixed(1)}`).join(' ')}"/>`;
        s += `<polyline class="ar c" points="${[`${BEFORE},${Y(0.100)}`, ...EPOCH.map((e, i) => `${X(e).toFixed(1)},${Y(VALID5[i]).toFixed(1)}`)].join(' ')}"/>`;
        EPOCH.forEach((e, i) => {
            s += `<circle class="f-a" cx="${X(e).toFixed(1)}" cy="${Y(TRAIN5[i]).toFixed(1)}" r="3"/>`;
            s += `<circle class="f-c" cx="${X(e).toFixed(1)}" cy="${Y(VALID5[i]).toFixed(1)}" r="3"/>`;
        });
        s += `<circle class="f-c" cx="${BEFORE}" cy="${Y(0.100)}" r="3"/>`;
        s += T((X(39) - 4).toFixed(1), (Y(1.000) - 8).toFixed(1), '학습 1.000', 'lbl k', 'end');
        s += T((X(39) - 4).toFixed(1), (Y(0.675) + 28).toFixed(1), '검증 0.675', 'lbl k', 'end');
        // 학습 전과 뒤. 블록 2 의 6단계
        const RX = 286;
        s += T(RX, 36, '검증 쌍, 학습 전과 뒤', 'lbl k');
        [['recall@5', 0.100, 0.675, '4/40', '27/40'], ['recall@10', 0.200, 0.850, '8/40', '34/40']].forEach(([name, a, b, fa, fb], i) => {
            const y = 46 + i * 54;
            s += T(RX, y + 9, name, 'lbl k');
            s += T(RX, y + 24, '전', 'lbl sm') + hbar(RX + 16, y + 15, 120, a, 'c', 11) + T(RX + 142, y + 24, `${a.toFixed(3)} (${fa})`, 'lbl sm');
            s += T(RX, y + 40, '뒤', 'lbl sm') + hbar(RX + 16, y + 31, 120, b, 'c', 11) + T(RX + 142, y + 40, `${b.toFixed(3)} (${fb})`, 'lbl sm');
        });
        // 코사인 -1 ~ 1. 블록 2 의 6단계
        const CX = v => RX + 110 + v * 100;
        s += T(RX, 164, '코사인, 학습 전 → 뒤', 'lbl k');
        s += T(RX, 180, '스니커즈와 운동화(학습 쌍) -0.397 → 0.685', 'lbl sm');
        s += arrow('ib-c1', `M${CX(-0.397).toFixed(1)},189 L${(CX(0.685) - 2).toFixed(1)},189`, 'a', { svg: S });
        s += T(RX, 208, '운동화와 러닝화(검증 쌍) 0.266 → 0.465', 'lbl sm');
        s += arrow('ib-c2', `M${CX(0.266).toFixed(1)},217 L${(CX(0.465) - 2).toFixed(1)},217`, 'c', { svg: S });
        s += line(CX(-1), 232, CX(1), 232, 'tick');
        [[-1, '-1'], [0, '0'], [1, '1']].forEach(([v, lab]) => {
            s += line(CX(v), 232, CX(v), 237, 'tick') + T(CX(v), 248, lab, 'lbl sm', 'middle');
        });
        s += T(20, 292, '학습 recall@5 는 에포크 24 에 1.000, 검증 recall@5 는 에포크 39 에 0.675', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 온도 셋 ----------
    (function () {
        const S = 'ib-temp'; if (!has(S)) return; let s = '';
        // 블록 3 의 2단계가 찍은 값. [τ, 학습률, 정답 칸 확률, 검증 recall@5, 묶음 안 평균 코사인]
        const ROWS = [['0.05', '0.02', 0.991, 0.675, 0.736], ['0.2', '0.08', 0.939, 1.000, 0.957], ['1.0', '0.4', 0.250, 1.000, 1.000]];
        const CLS = ['f-b', 'f-c', 'f-k'];
        const BASE = 214, H = 140;
        s += T(20, 16, '같은 시드와 차례, 학습률 0.4τ, 40에포크', 'lbl sm');
        [['정답 칸 확률(학습 쌍)', 'f-b'], ['검증 recall@5', 'f-c'], ['묶음 안 평균 코사인(W 의 벡터)', 'f-k']].forEach(([lab, cls], i) => {
            const x = 20 + i * 166;
            s += `<rect class="${cls}" x="${x}" y="28" width="11" height="11"/>` + T(x + 16, 37, lab, 'lbl sm');
        });
        ROWS.forEach(([tau, lr, p, r5, inner], g) => {
            const x0 = 46 + g * 160;
            s += line(x0 - 8, BASE, x0 + 118, BASE, 'tick');
            [p, r5, inner].forEach((v, i) => {
                const x = x0 + i * 40, h = v * H;
                s += `<rect class="${CLS[i]}" x="${x}" y="${(BASE - h).toFixed(1)}" width="30" height="${h.toFixed(1)}"/>`;
                s += T(x + 15, (BASE - h - 5).toFixed(1), v.toFixed(3), 'lbl sm', 'middle');
            });
            s += T(x0 + 55, BASE + 16, `τ ${tau}`, 'lbl k', 'middle') + T(x0 + 55, BASE + 30, `학습률 ${lr}`, 'lbl sm', 'middle');
        });
        // τ 1.0 의 정답 칸 위 점선: 다른 9칸이 모두 -1/9 인 점수표의 정답 칸 확률 0.252 (블록 3 의 3단계)
        const yc = (BASE - 0.252 * H).toFixed(1);
        s += line(46 + 2 * 160 - 5, yc, 46 + 2 * 160 + 35, yc, 'ar k dash');
        s += T(20, 262, '점선: 다른 9칸이 모두 -1/9 인 점수표의 정답 칸 확률, τ 1.0 에서 0.252', 'lbl sm');
        s += T(20, 278, 'τ 1.0: 묶음 안 가장 작은 값 0.996, 다른 묶음 평균 -0.111', 'lbl sm');
        s += T(20, 294, 'τ 0.05: 학습 짝 평균 0.788, 검증 짝 평균 0.531', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
