/**
 * profile-cards-demo.js — 유저 프로파일 카드 네 장
 *
 * 회원 한 명의 30일 행동이 숫자가 되는 자리 하나가 카드 한 장이다. 행동 로그, 최근성 가중, 표준화한 벡터, 세그먼트 317 의 규칙.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 회원 A, 벽돌색은 회원 B, 회색은 날짜만 옮겨 본 가정,
 * 점선 상자는 적어 둔 조건, 점은 지금 쌓이는 사건이다.
 *
 * 숫자는 전부 user-profile-features 글의 파이썬 출력에서 옮긴 가상 값이다. 회원 A 의 경과일 목록은 글의 1단계 표와 같고,
 * 가중합 7.21 과 1.80, 벡터 16개, 표본 2,000명 중 229명은 두 블록이 찍은 값이다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, tag, user, arrow, dots, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);

    const NAMES = ['검색어 러닝화', '운동 앱 실행 일수', '러닝 글', '운동 용품 구매', '여행 글', '카페 글', '캠핑 글', '캠핑 용품 검색'];
    // 회원 A 의 30일. 행동마다 사건의 경과일(0 이 오늘)
    const A_DAYS = [
        [0, 1, 2, 3, 5, 7, 9, 12, 15, 18, 22, 27],
        [0, 2, 4, 6, 9, 11, 13, 16],
        [0, 0, 1, 1, 2, 3, 4, 5, 6],
        [5],
        [17, 19, 22, 26],
        [1, 10, 20],
        [],
        [],
    ];
    const UNITS = ['회', '일', '편', '회', '편', '편', '편', '회'];

    // 사건 네모. 같은 날의 둘째 사건은 아래에 쌓는다
    function marks(days, xOf, y, cls, size, gap) {
        const seen = {};
        return days.map(d => {
            const k = seen[d] = (seen[d] || 0) + 1;
            return `<rect class="f-${cls}" x="${(xOf(d) - size / 2).toFixed(1)}" y="${y + (k - 1) * gap}" width="${size}" height="${size}"/>`;
        }).join('');
    }

    // ---------- 1. 회원 A 의 30일이 날짜별로 쌓인 표 ----------
    (function () {
        const S = 'pf-logs'; if (!has(S)) return; let s = '';
        const x0 = 140, cw = 9.6, top = 44, rh = 22;
        const colX = d => x0 + (29 - d) * cw + cw / 2;
        s += T(40, 22, '회원 A 의 30일. 칸 하나가 하루이고 네모 하나가 사건 하나입니다', 'lbl sm');
        [['21~29일 전', 25], ['14~20일 전', 17], ['7~13일 전', 10], ['0~6일 전', 3]].forEach(b => {
            s += T(colX(b[1]), 38, b[0], 'lbl sm', 'middle');
        });
        s += `<rect class="grp" x="${x0}" y="${top - 2}" width="${30 * cw}" height="${8 * rh + 2}"/>`;
        [21, 14, 7].forEach(d => {
            const x = x0 + (29 - d + 1) * cw;
            s += `<line class="split" x1="${x}" y1="${top - 2}" x2="${x}" y2="${top + 8 * rh}"/>`;
        });
        s += T(470, 38, '30일 합계', 'lbl sm', 'middle');
        NAMES.forEach((name, r) => {
            const y = top + r * rh;
            s += T(40, y + 14, name, 'lbl');
            s += marks(A_DAYS[r], colX, y + 4, 'a', 6, 7);
            s += T(470, y + 15, `${A_DAYS[r].length}${UNITS[r]}`, A_DAYS[r].length ? 'lbl k' : 'lbl sm', 'middle');
        });
        s += T(x0, top + 8 * rh + 14, '29일 전', 'lbl sm');
        s += T(x0 + 30 * cw, top + 8 * rh + 14, '오늘', 'lbl sm', 'end');
        // 오늘 한 일이 맨 오른쪽 칸에 쌓인다
        s += `<path id="pfl1" d="M${colX(0)},14 L${colX(0)},${top + 2 * rh + 6}" fill="none" stroke="none"/>`;
        s += dots('pfl1', 'k', { n: 1, dur: 2.6, r: 3.5 });
        s += T(40, 252, '같은 칸에 네모가 둘이면 그날 두 번 한 것입니다. 운동 앱 줄은 켠 날만 셉니다', 'lbl sm');
        s += T(40, 276, '줄마다 더하면 30일 합계이고, 합계에는 날짜가 남지 않습니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 같은 9편이 언제 읽혔나에 따라 7.21 과 1.80 ----------
    (function () {
        const S = 'pf-agg'; if (!has(S)) return; let s = '';
        const x0 = 40, x1 = 360, base = 120, H = 76;
        const xOf = d => x1 - d * (x1 - x0) / 29;
        const yOf = wt => base - wt * H;
        s += T(40, 22, '가중치는 0.5 를 (경과일 ÷ 7) 번 곱한 값입니다. 7일마다 절반이 됩니다', 'lbl sm');
        [7, 14, 21].forEach(d => {
            s += `<line class="split" x1="${xOf(d)}" y1="${yOf(1)}" x2="${xOf(d)}" y2="222"/>`;
        });
        s += `<line class="grp" x1="${x0}" y1="${base}" x2="${x1}" y2="${base}"/>`;
        let d = '';
        for (let k = 29; k >= 0; k--) d += `${k === 29 ? 'M' : 'L'}${xOf(k).toFixed(1)},${yOf(Math.pow(0.5, k / 7)).toFixed(1)} `;
        s += `<path class="ar k" d="${d.trim()}"/>`;
        [[0, '1'], [7, '0.5'], [14, '0.25'], [29, '0.06']].forEach(p => {
            s += `<circle class="dot k" cx="${xOf(p[0])}" cy="${yOf(Math.pow(0.5, p[0] / 7))}" r="3"/>`;
            s += T(xOf(p[0]) + (p[0] === 0 ? -6 : 6), yOf(Math.pow(0.5, p[0] / 7)) - 6, p[1], 'lbl k', p[0] === 0 ? 'end' : 'start');
        });
        [[29, '29일 전'], [14, '14일 전'], [7, '7일 전'], [0, '오늘']].forEach(p => {
            s += T(xOf(p[0]), base + 14, p[1], 'lbl sm', 'middle');
        });
        const now = [0, 0, 1, 1, 2, 3, 4, 5, 6];
        const old = now.map(v => v + 14);
        s += marks(now, xOf, 150, 'a', 7, 9);
        s += T(378, 157, '회원 A 의 9편 (이번 주)', 'lbl k');
        s += T(378, 172, '합계 9, 가중합 7.21', 'lbl');
        s += marks(old, xOf, 198, 'c', 7, 9);
        s += T(378, 205, '모두 14일 전이었다면', 'lbl k');
        s += T(378, 220, '합계 9, 가중합 1.80', 'lbl');
        // 같은 9편을 14일 앞으로 옮긴다
        s += arrow('pfa1', `M${xOf(3)},172 C${xOf(3) - 30},192 ${xOf(17) + 40},180 ${xOf(17)},194`, 'c', { svg: S, dash: true });
        s += dots('pfa1', 'c', { n: 1, dur: 2.4, r: 3.5 });
        s += T(40, 252, '모두 7일 전이었다면 3.60 으로, 이번 주의 꼭 절반입니다', 'lbl sm');
        s += T(40, 276, '날짜를 지운 합계는 같고, 날짜를 남긴 가중합은 4배 다릅니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 회원 A 와 B 의 8차원 벡터 ----------
    (function () {
        const S = 'pf-vector'; if (!has(S)) return; let s = '';
        const A = [8.65, 5.36, 8.44, 2.85, 0.22, 1.09, -0.34, -0.26];
        const B = [-0.17, -0.38, -0.36, -0.24, -0.51, -0.64, 6.91, 5.43];
        const zero = 200, k = 30, top = 48, rh = 24;
        s += T(40, 22, '0 이 표본 2,000명의 평균입니다. 오른쪽은 평균보다 많고 왼쪽은 적습니다', 'lbl sm');
        s += `<rect class="f-a" x="380" y="30" width="10" height="8"/>` + T(395, 38, '회원 A', 'lbl sm');
        s += `<rect class="f-b" x="440" y="30" width="10" height="8"/>` + T(455, 38, '회원 B', 'lbl sm');
        s += `<line class="split" x1="${zero + 5 * k}" y1="${top - 2}" x2="${zero + 5 * k}" y2="${top + 8 * rh}"/>`;
        const bar = (v, y, cls) => {
            const w = Math.max(2, Math.abs(v) * k), x = v >= 0 ? zero : zero - w;
            const lx = v >= 0 ? zero + w + 4 : zero + 4;
            return `<rect class="f-${cls}" x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="8"/>` + T(lx.toFixed(1), y + 7.5, v.toFixed(2), 'lbl sm');
        };
        NAMES.forEach((name, r) => {
            const y = top + r * rh;
            s += T(40, y + 13, name, 'lbl');
            s += bar(A[r], y + 2, 'a') + bar(B[r], y + 11, 'b');
        });
        s += `<line class="tick" x1="${zero}" y1="${top - 4}" x2="${zero}" y2="${top + 8 * rh + 2}"/>`;
        s += T(zero, top + 8 * rh + 14, '0', 'lbl sm', 'middle') + T(zero + 5 * k, top + 8 * rh + 14, '5', 'lbl sm', 'middle');
        s += T(40, 276, '안 한 행동은 0 이 아니라 평균보다 조금 아래로 나옵니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 조건 셋 중 하나라도 맞으면 번호가 붙는다 ----------
    (function () {
        const S = 'pf-rule'; if (!has(S)) return; let s = '';
        s += T(40, 22, '세그먼트 317 의 조건 셋. 오디언스와 세그먼트 편에 적힌 그대로입니다', 'lbl sm');
        s += user(306, 36, '회원 A') + user(440, 36, '회원 B');
        s += `<rect class="list" x="34" y="88" width="212" height="90"/>`;
        const rows = [
            ['러닝 글 3편 이상', '9편, 맞음', '0편, 안 맞음'],
            ['운동 앱 켠 날 5일 이상', '8일, 맞음', '0일, 안 맞음'],
            ['러닝화 검색 1회 이상', '12회, 맞음', '0회, 안 맞음'],
        ];
        rows.forEach((r, i) => {
            const y = 108 + i * 28;
            s += T(46, y + 4, r[0], 'lbl k');
            s += tag(270, y - 9, r[1], 'a');
            s += tag(400, y - 9, r[2], 'b');
        });
        s += T(46, 206, '하나라도 맞으면 317', 'lbl k');
        s += tag(270, 193, '317 이 붙음', 'a');
        s += tag(400, 193, '안 붙음', 'b');
        s += T(40, 236, '표본 2,000명에 같은 조건을 대 보면', 'lbl sm');
        s += hbar(40, 244, 300, 0.1145, 'a', 12);
        s += T(350, 254, '229명 (11.4%)', 'lbl k');
        s += T(40, 280, '번호는 맞나 안 맞나 하나만 남기고, 몇 편인지는 남기지 않습니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
