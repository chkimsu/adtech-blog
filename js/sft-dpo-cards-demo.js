/**
 * sft-dpo-cards-demo.js — SFT 와 DPO 카드 네 장
 *
 * 선호 쌍으로 카피를 쓰는 모델을 학습하는 자리를 카드 한 장씩으로 그린다.
 * SFT 한 걸음과 DPO 한 걸음, 선호 쌍의 출처 셋, 로그 확률 넷으로 세는 손실, 오래 학습하면 꺾이는 통과율.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 참조 모델과 선호 쌍, 벽돌색은 학습하는 정책,
 * 먹색은 손실과 기울기, 회색은 게이트에 걸린 카피이고, 점선은 게이트 조건이다.
 *
 * 숫자는 전부 sft-and-dpo 글의 파이썬 블록 셋이 찍은 출력에서 옮긴 값이다. 카피 후보와 선호 쌍은 가상 값이고
 * scripts/gen-training-data.py 의 COPY_POOL, PREF_PAIRS 리터럴이다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, list, arrow, svg } = window.CardKit;
    const has = id => !!document.getElementById(id);

    // ---------- 1. SFT 한 걸음과 DPO 한 걸음 ----------
    (function () {
        const S = 'sd-sft'; if (!has(S)) return; let s = '';
        // 블록 1 이 찍은 값. 두 카피의 토큰 다섯, 걸음마다 토큰 점수의 변화와 로그 확률이다
        const CHOSEN = ['240g', '쿠션', '폼', '입문자용', '러닝화'];
        const REJECTED = ['가장', '가벼운', '쿠션', '폼', '러닝화'];
        const SHARED = ['쿠션', '폼', '러닝화'];
        const STEPS = [
            { name: 'SFT 한 걸음, 학습률 0.5', y: 14, logp: ['-12.425 → -11.121', '-12.425 → -12.121'],
              change: { '240g': '+0.292', '쿠션': '+0.292', '폼': '+0.292', '입문자용': '+0.292', '러닝화': '+0.292', '가장': '-0.208', '가벼운': '-0.208' } },
            { name: 'DPO 한 걸음, β 0.1, 학습률 5.0', y: 142, logp: ['-12.425 → -11.977', '-12.425 → -12.977'],
              change: { '240g': '+0.250', '쿠션': '0.000', '폼': '0.000', '입문자용': '+0.250', '러닝화': '0.000', '가장': '-0.250', '가벼운': '-0.250' } },
        ];
        STEPS.forEach(st => {
            s += T(40, st.y + 4, st.name, 'lbl k');
            [['chosen', CHOSEN], ['rejected', REJECTED]].forEach(([name, toks], r) => {
                const y = st.y + 14 + r * 56;
                s += T(40, y + 15, name, 'lbl k') + T(40, y + 31, st.logp[r], 'lbl b');
                toks.forEach((t, i) => {
                    const x = 168 + i * 68;
                    s += box(x, y, 62, 22, t, r === 1 && !SHARED.includes(t) ? 'c' : 'a', 10);
                    s += T(x + 31, y + 36, st.change[t], 'lbl k', 'middle');
                });
            });
        });
        s += T(40, 274, '쿠션, 폼, 러닝화는 두 카피에 한 번씩 들고 길이가 5 로 같아, DPO 기울기가 0', 'lbl sm');
        s += T(40, 290, 'rejected 끝에 1위 를 붙여 토큰 여섯으로 늘리면 공유 토큰 셋이 +0.021', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 선호 쌍 20개의 출처 셋 ----------
    (function () {
        const S = 'sd-pairs'; if (!has(S)) return; let s = '';
        // 블록 2 가 찍은 값. [출처, 쌍 수, chosen 을 정하는 법, [예시 쌍, chosen, rejected], rejected 의 색, 글자 수 차이 평균]
        const ROWS = [
            ['게이트', 6, '통과한 카피 > 숫자나 최상급에 걸린 카피', ['d02', 'c03', 'c09'], 'c', 0.2],
            ['판정자 짝비교', 8, '둘 다 통과, 판정자가 고른 긴 카피 > 짧은 카피', ['d07', 'c04', 'c01'], 'a', 14.4],
            ['광고주 편집', 6, '광고주가 고친 카피 > 원래 카피', ['d15', 'c05', 'c12'], 'c', -3.8],
        ];
        const MID = 380, UNIT = 5;   // 글자 수 차이 1자의 막대 길이
        s += T(40, 16, '쌍 하나는 chosen > rejected 이고, 출처마다 chosen 을 정하는 법이 다릅니다', 'lbl sm');
        s += T(MID, 36, 'chosen - rejected 글자 수 평균', 'lbl sm', 'middle');
        ROWS.forEach(([name, n, rule, [pid, w, l], cl, diff], i) => {
            const y = 40 + i * 60;
            s += T(40, y + 12, `${name} ${n}쌍`, 'lbl k') + T(40, y + 28, rule, 'lbl sm');
            s += T(40, y + 49, pid, 'lbl sm') + box(66, y + 36, 40, 18, w, 'a', 10);
            s += T(114, y + 49, '>', 'lbl k', 'middle') + box(122, y + 36, 40, 18, l, cl, 10);
            const len = Math.max(2, Math.abs(diff) * UNIT);
            s += `<rect class="f-k" x="${diff >= 0 ? MID : MID - len}" y="${y + 37}" width="${len}" height="14"/>`;
            s += T(diff >= 0 ? MID + len + 6 : MID - len - 6, y + 48, `${diff > 0 ? '+' : ''}${diff.toFixed(1)}자`, 'lbl k', diff >= 0 ? 'start' : 'end');
        });
        s += `<line class="tick" x1="${MID}" y1="70" x2="${MID}" y2="218"/>`;
        s += list(40, 226, 460, 64, [{ t: '게이트 셋, 통과는 셋을 모두 지난 카피', cls: 'h' }, '길이 40자 이하',
            '카피의 숫자가 모두 자산에 있음', '근거 없는 최상급이 없음']);
        svg(S, s);
    })();

    // ---------- 3. 로그 확률 넷으로 세는 손실 ----------
    (function () {
        const S = 'sd-loss'; if (!has(S)) return; let s = '';
        // 블록 2 가 찍은 d02 의 네 값, 두 비율, margin, 손실, 무게와 쌍 20개의 margin 이다
        s += T(40, 16, 'd02 gate c03 > c09, β 0.1', 'lbl k');
        s += T(40, 41, '정책', 'lbl b') + T(40, 71, '참조 모델', 'lbl k');
        s += box(120, 26, 112, 22, 'chosen -16.4', 'b', 10) + box(242, 26, 112, 22, 'rejected -14.0', 'b', 10);
        s += box(120, 56, 112, 22, 'chosen -18.3', 'a', 10) + box(242, 56, 112, 22, 'rejected -16.7', 'a', 10);
        s += arrow('sd-l0', 'M176,80 L176,94', 'k', { svg: S }) + arrow('sd-l1', 'M298,80 L298,94', 'k', { svg: S });
        s += T(40, 111, '두 비율', 'lbl k');
        s += box(120, 98, 112, 22, '비율 +1.9', 'k', 10) + box(242, 98, 112, 22, '비율 +2.7', 'k', 10);
        s += arrow('sd-l2', 'M356,109 L372,109', 'k', { svg: S });
        s += box(376, 98, 124, 22, 'margin -0.080', 'k', 10);
        s += T(376, 136, '0.1 × (1.9 - 2.7)', 'lbl sm');
        s += T(120, 140, '손실 -log σ(margin) = 0.734', 'lbl k') + T(120, 158, '무게 σ(-margin) = 0.520', 'lbl k');
        // 쌍 20개의 margin. 음수인 넷은 벽돌색이다
        const M = { d01: 0.42, d02: -0.08, d03: 0.28, d04: 0.52, d05: -0.13, d06: 0.35, d07: 0.17, d08: -0.03, d09: 0.12, d10: 0.04,
            d11: 0.12, d12: 0.09, d13: 0.05, d14: 0.05, d15: 0.17, d16: 0.47, d17: 0.25, d18: 0.35, d19: 0.35, d20: -0.04 };
        const X = m => 60 + (m + 0.15) / 0.70 * 420, base = 246;
        s += T(40, 186, '쌍 20개의 margin', 'lbl k');
        s += `<line class="tick" x1="60" y1="${base + 8}" x2="480" y2="${base + 8}"/>`;
        s += `<line class="split" x1="${X(0)}" y1="196" x2="${X(0)}" y2="${base + 12}"/>`;
        s += T(X(0), 272, 'margin 0', 'lbl sm', 'middle') + T(X(-0.13), 272, '-0.130', 'lbl sm', 'middle') + T(X(0.52), 272, '+0.520', 'lbl sm', 'middle');
        const seen = {};
        Object.entries(M).forEach(([pid, m]) => {
            const k = (seen[m] = (seen[m] || 0) + 1) - 1;
            s += `<circle class="dot ${m < 0 ? 'b' : 'a'}" cx="${X(m).toFixed(1)}" cy="${base - k * 10}" r="4"/>`;
        });
        s += T(40, 292, 'margin 이 음수인 d02, d05, d08, d20 의 무게 평균 0.517, 나머지 16쌍 0.441', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 오래 학습하면 꺾이는 통과율 ----------
    (function () {
        const S = 'sd-overopt'; if (!has(S)) return; let s = '';
        // 블록 3 이 찍은 체크포인트 13개. [걸음, 손실, 통과율, c06+c07 확률]
        const PTS = [[0, 0.693, 0.255, 0.002], [25, 0.636, 0.449, 0.032], [50, 0.589, 0.597, 0.204], [75, 0.549, 0.473, 0.472],
            [100, 0.515, 0.299, 0.681], [125, 0.486, 0.178, 0.813], [150, 0.460, 0.106, 0.890], [175, 0.437, 0.064, 0.934],
            [200, 0.417, 0.040, 0.959], [225, 0.399, 0.026, 0.974], [250, 0.383, 0.017, 0.983], [275, 0.368, 0.012, 0.988],
            [300, 0.354, 0.008, 0.992]];
        const X = st => 60 + st / 300 * 380, Y = v => 196 - v * 160;
        const line = (idx, cls) => `<polyline class="${cls}" points="${PTS.map(p => `${X(p[0]).toFixed(1)},${Y(p[idx]).toFixed(1)}`).join(' ')}"/>`;
        s += T(40, 16, '체크포인트 13개, 확률은 후보 12개 안에서 센 기댓값', 'lbl sm');
        s += `<line class="tick" x1="60" y1="196" x2="440" y2="196"/>` + `<line class="tick" x1="60" y1="36" x2="60" y2="196"/>`;
        s += T(54, 40, '1', 'lbl sm', 'end') + T(54, 199, '0', 'lbl sm', 'end');
        [0, 50, 100, 300].forEach(st => { s += T(X(st), 210, `${st}걸음`, 'lbl sm', 'middle'); });
        s += line(3, 'ar c dash') + line(1, 'pt-line') + line(2, 'ar b');
        s += `<circle class="dot b" cx="${X(50)}" cy="${Y(0.597)}" r="4.5"/>` + `<circle class="dot b" cx="${X(300)}" cy="${Y(0.008)}" r="4"/>`;
        s += T(X(50) + 8, Y(0.597) - 8, '50걸음 통과율 0.597, 여기로 되돌린다', 'lbl b');
        s += T(X(300), Y(0.008) - 8, '0.008', 'lbl b', 'middle');
        s += T(448, Y(0.992) + 4, 'c06+c07', 'lbl sm') + T(448, Y(0.354) + 4, '손실', 'lbl k');
        s += T(448, Y(0.008) + 4, '통과율', 'lbl b');
        s += T(40, 236, '손실 0.693 → 0.354, c06+c07 0.002 → 0.992, 75걸음부터 가장 큰 후보 c06', 'lbl sm');
        s += T(40, 254, '300걸음의 θ (+7.07, +7.78, -9.01), 글자 수와 숫자 일치의 가중치가 커졌다', 'lbl sm');
        s += T(40, 272, 'c06 49자, c07 43자는 길이 게이트에만 걸리고 어느 쌍에도 나오지 않는다', 'lbl sm');
        s += T(40, 290, '300걸음에 맞힌 쌍은 20/20, 50걸음에는 18/20', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
