/**
 * reward-loop-cards-demo.js — 보상 루프 카드 네 장
 *
 * 판정자의 점수를 보상으로 써서 카피를 쓰는 모델을 학습하는 자리를 카드 한 장씩으로 그린다.
 * 선호 쌍으로 배우는 보상 모델, KL 세기와 보상 해킹, GRPO 의 묶음 이점, 학습 도중의 판정자 교체.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 선호 쌍, 참조 정책, 게이트를 지난 카피이고,
 * 벽돌색은 학습하는 정책, 먹색은 보상 모델(판정자 A, B), 회색은 게이트에 걸린 카피다.
 * 점선은 KL 항, 고정할 판정자 버전, 묶음 평균이다.
 *
 * 숫자는 전부 rlhf-rlaif-grpo-reward-model 글의 파이썬 블록 셋이 찍은 출력에서 옮긴 값이다. 카피 후보와 선호 쌍은
 * 가상 값이고 scripts/gen-training-data.py 의 COPY_POOL, PREF_PAIRS 리터럴이다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, list, arrow, svg } = window.CardKit;
    const has = id => !!document.getElementById(id);
    const signed = v => `${v > 0 ? '+' : ''}${v.toFixed(2)}`;

    // ---------- 1. 선호 쌍 → 보상 모델 → 정책 ----------
    (function () {
        const S = 'rw-loop'; if (!has(S)) return; let s = '';
        // 블록 1 이 찍은 값. 출처별 글자 수 차이, 두 보상 모델의 w 와 맞힌 쌍
        s += T(40, 16, '판정자 A 는 쌍 20개로, B 는 판정자 쌍 8개를 뺀 12쌍으로 배운 보상 모델', 'lbl sm');
        s += box(40, 28, 124, 26, '선호 쌍 20개', 'a', 11);
        s += arrow('rw-l0', 'M166,41 L194,41', 'k', { svg: S });
        s += box(198, 28, 124, 26, '보상 모델 A, B', 'k', 11);
        s += arrow('rw-l1', 'M324,41 L352,41', 'k', { svg: S });
        s += box(356, 28, 124, 26, '정책', 'b', 11);
        [['gate 6쌍, +0.2자', 'lbl sm'], ['judge 8쌍, +14.4자', 'lbl k'], ['edit 6쌍, -3.8자', 'lbl sm']]
            .forEach(([t, c], i) => { s += T(40, 72 + i * 14, t, c); });
        s += T(40, 114, 'chosen - rejected 글자 수 평균', 'lbl sm');
        s += T(198, 72, 'A: 20쌍, 맞힌 쌍 20/20', 'lbl k') + T(198, 86, 'B: 12쌍, 맞힌 쌍 12/12', 'lbl k');
        s += T(198, 100, '판정자 쌍 8개를 B 로 재면 0개', 'lbl sm');
        s += list(356, 62, 124, 50, [{ t: 'KL 항', cls: 'h' }, 'E[r] - β KL 을 올림', '3절 β 다섯, 5절 β 0.5']);
        // w 의 가중치 셋. 0 을 가운데에 두고 A 와 B 를 위아래 막대로
        const W = [['글자 수 / 10', 2.79, -0.32], ['숫자 일치', 4.11, 4.17], ['최상급', -5.51, -4.42]];
        const MID = 300, U = 18;
        s += T(40, 142, 'w 의 가중치 셋, A 와 B', 'lbl k');
        s += `<line class="tick" x1="${MID}" y1="150" x2="${MID}" y2="280"/>`;
        W.forEach(([name, a, b], i) => {
            const y = 154 + i * 42;
            s += T(40, y + 21, name, 'lbl k');
            [['A', a], ['B', b]].forEach(([who, v], j) => {
                const yy = y + j * 18, len = Math.max(2, Math.abs(v) * U);
                s += `<rect class="f-k" x="${(v >= 0 ? MID : MID - len).toFixed(1)}" y="${yy}" width="${len.toFixed(1)}" height="14"/>`;
                s += v >= 0 ? T(MID + len + 6, yy + 11, `${who} ${signed(v)}`, 'lbl k')
                    : T(MID - len - 6, yy + 11, `${who} ${signed(v)}`, 'lbl k', 'end');
            });
        });
        s += T(40, 294, '판정자 쌍 8개를 빼자 글자 수 가중치의 부호가 바뀌었다 (+2.79 → -0.32)', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. KL 을 약하게 걸수록 ----------
    (function () {
        const S = 'rw-hack'; if (!has(S)) return; let s = '';
        // 블록 2 가 찍은 β 다섯의 최적 정책. [β, E[r_A], KL, 통과율, 평균 글자 수, 가장 큰 후보, 그 후보가 통과하나]
        const ROWS = [[4, 8.76, 0.29, 0.522, 24.9, 'c09', false], [2, 11.63, 1.37, 0.732, 29.9, 'c03', true],
            [1, 15.56, 4.17, 0.506, 41.2, 'c06', false], [0.5, 17.54, 6.83, 0.042, 48.2, 'c06', false],
            [0.25, 17.77, 7.38, 0.000, 49.0, 'c06', false]];
        const X = i => 150 + i * 75, YR = v => 116 - v / 20 * 76, YP = v => 200 - v * 56;
        s += T(40, 16, '목적 E[r_A] - β KL 의 최적 정책, β 를 4 에서 0.25 로 내린다', 'lbl sm');
        s += T(40, 40, 'E[r_A]', 'lbl k') + T(40, 140, '통과율', 'lbl b');
        s += `<line class="tick" x1="120" y1="116" x2="480" y2="116"/>` + `<line class="tick" x1="120" y1="200" x2="480" y2="200"/>`;
        s += `<polyline class="pt-line" points="${ROWS.map((r, i) => `${X(i)},${YR(r[1]).toFixed(1)}`).join(' ')}"/>`;
        s += `<polyline class="ar b" points="${ROWS.map((r, i) => `${X(i)},${YP(r[3]).toFixed(1)}`).join(' ')}"/>`;
        ROWS.forEach((r, i) => {
            s += `<circle class="f-k" cx="${X(i)}" cy="${YR(r[1]).toFixed(1)}" r="3.5"/>` + T(X(i), YR(r[1]) - 8, r[1].toFixed(2), 'lbl k', 'middle');
            s += `<circle class="f-b" cx="${X(i)}" cy="${YP(r[3]).toFixed(1)}" r="3.5"/>` + T(X(i), YP(r[3]) - 8, r[3].toFixed(3), 'lbl b', 'middle');
            s += T(X(i), 220, `β ${r[0]}`, 'lbl k', 'middle');
            s += box(X(i) - 20, 228, 40, 18, r[5], r[6] ? 'a' : 'c', 10);
            s += T(X(i), 262, `${r[4].toFixed(1)}자`, 'lbl sm', 'middle') + T(X(i), 278, `KL ${r[2].toFixed(2)}`, 'lbl sm', 'middle');
        });
        s += T(40, 241, '가장 큰 후보', 'lbl sm') + T(40, 262, '평균 글자 수', 'lbl sm');
        s += T(40, 294, 'c06 은 r_A 가 17.78 로 가장 크고, 49자라 길이 게이트에 걸린다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 묶음 평균을 기준으로 ----------
    (function () {
        const S = 'rw-grpo'; if (!has(S)) return; let s = '';
        // 블록 2 가 찍은 0걸음 묶음 8개. [카피, r_A, 이점, 통과하나]
        const BATCH = [['c08', 7.53, 0.24, false], ['c03', 10.52, 1.75, true], ['c09', 4.74, -1.16, false], ['c01', 8.29, 0.63, true],
            ['c09', 4.74, -1.16, false], ['c08', 7.53, 0.24, false], ['c01', 8.29, 0.63, true], ['c09', 4.74, -1.16, false]];
        const MEAN = 7.05, BASE = 150, Y = v => BASE - v / 12 * 100, X = i => 72 + i * 46;
        s += T(40, 16, '0걸음, 정책에서 뽑은 카피 8개와 보상 r_A', 'lbl sm');
        s += `<line class="tick" x1="64" y1="${BASE}" x2="432" y2="${BASE}"/>`;
        BATCH.forEach(([cid, r, a, ok], i) => {
            s += `<rect class="${ok ? 'f-a' : 'f-c'}" x="${X(i)}" y="${Y(r).toFixed(1)}" width="28" height="${(BASE - Y(r)).toFixed(1)}"/>`;
            s += T(X(i) + 14, Y(r) - 5, r.toFixed(2), 'lbl sm', 'middle');
            s += T(X(i) + 14, 164, cid, 'lbl k', 'middle');
            s += T(X(i) + 14, 179, signed(a), a > 0 ? 'lbl b' : 'lbl sm', 'middle');
        });
        s += `<line class="split" x1="64" y1="${Y(MEAN).toFixed(1)}" x2="432" y2="${Y(MEAN).toFixed(1)}"/>`;
        s += T(440, Y(MEAN) + 4, '평균 7.05', 'lbl k');
        s += T(40, 164, '카피', 'lbl sm') + T(40, 179, '이점', 'lbl sm');
        // 블록 2 가 찍은 20걸음마다의 값. [걸음, 통과율, E[r_A], 평균 글자 수, 가장 큰 후보]
        const STEPS = [[0, 0.255, 6.58, 23.3, 'c09'], [20, 0.481, 9.81, 28.3, 'c08'], [40, 0.146, 16.73, 46.5, 'c06'], [60, 0.031, 17.38, 48.3, 'c06']];
        const C = i => 170 + i * 84;
        s += T(40, 204, '걸음', 'lbl k');
        STEPS.forEach(([st, p, er, ch, top], i) => {
            s += T(C(i), 204, `${st}`, 'lbl k', 'middle');
            s += T(C(i), 222, p.toFixed(3), 'lbl b', 'middle') + T(C(i), 238, er.toFixed(2), 'lbl k', 'middle');
            s += T(C(i), 254, ch.toFixed(1), 'lbl sm', 'middle') + T(C(i), 270, top, 'lbl sm', 'middle');
        });
        s += T(40, 222, '통과율', 'lbl b') + T(40, 238, 'E[r_A]', 'lbl k') + T(40, 254, '평균 글자 수', 'lbl sm') + T(40, 270, '가장 큰 후보', 'lbl sm');
        s += T(40, 292, 'GRPO 이점 = (보상 - 묶음 평균) / 모표준편차, KL 계수 0.04', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 학습 도중 판정자를 바꾸면 ----------
    (function () {
        const S = 'rw-switch'; if (!has(S)) return; let s = '';
        // 블록 3 이 찍은 적힌 보상. 20걸음마다, 그 걸음에 쓰는 판정자로 잰 값이다
        const STEPS = [0, 20, 40, 60, 80, 100, 120];
        const A_ONLY = [6.58, 7.74, 9.45, 14.95, 16.13, 16.51, 16.71];
        const SWITCH = [6.58, 7.74, 9.45, 2.34, 2.24, 2.25, 2.40];   // 60걸음부터 B 로 잰 값
        const B_ONLY = [-0.05, 0.95, 1.94, 2.57, 2.90, 3.08, 3.19];
        const X = st => 60 + st / 120 * 360, Y = v => 186 - (v + 1) / 18 * 146;
        const pts = vals => STEPS.map((st, i) => `${X(st)},${Y(vals[i]).toFixed(1)}`);
        s += T(40, 16, '적힌 보상, 그 걸음에 쓰는 판정자로 잰 보상의 기댓값', 'lbl sm');
        s += `<line class="tick" x1="60" y1="188" x2="420" y2="188"/>`;
        s += `<line class="split" x1="${X(60)}" y1="30" x2="${X(60)}" y2="188"/>`;
        s += T(X(60) + 6, 38, '60걸음, 판정자 A → B', 'lbl k');
        s += `<polyline class="ar k" points="${pts(A_ONLY).join(' ')}"/>`;
        s += `<polyline class="ar k" points="${pts(B_ONLY).join(' ')}"/>`;
        const sw = pts(SWITCH);
        sw.splice(3, 0, `${X(60)},${Y(14.95).toFixed(1)}`);   // 60걸음의 같은 정책을 A 로 잰 값에서 B 로 잰 값으로 떨어진다
        s += `<polyline class="ar b" points="${sw.join(' ')}"/>`;
        s += `<circle class="f-b" cx="${X(60)}" cy="${Y(14.95).toFixed(1)}" r="3.5"/>` + `<circle class="f-b" cx="${X(60)}" cy="${Y(2.34).toFixed(1)}" r="3.5"/>`;
        s += T(X(60) - 8, Y(14.95) - 6, 'A 로 14.95', 'lbl b', 'end');
        s += T(X(60) + 8, Y(2.34) - 18, 'B 로 2.34, θ 는 그대로', 'lbl b');
        s += T(428, Y(16.71) + 4, 'A 만 16.71', 'lbl k') + T(428, Y(3.19) - 2, 'B 만 3.19', 'lbl k') + T(428, Y(2.40) + 12, 'A 뒤 B 2.40', 'lbl b');
        [0, 60, 120].forEach(st => { s += T(X(st), 202, `${st}걸음`, 'lbl sm', 'middle'); });
        s += T(40, 226, '120걸음을 B 로 재면 A 뒤 B 2.40, B 만 3.19, A 만 2.47', 'lbl k');
        s += T(40, 244, 'A 뒤 B 를 A 로 재면 60걸음 14.95 → 120걸음 10.70', 'lbl sm');
        s += T(40, 262, '같은 사이 통과율 0.423 → 0.745, KL 3.81 → 0.96', 'lbl sm');
        s += T(40, 280, '판정자 B 는 판정자 쌍 8개를 뺀 12쌍으로 배운 보상 모델로 흉내 냈다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
