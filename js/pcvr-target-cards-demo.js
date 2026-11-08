/**
 * pcvr-target-cards-demo.js — pCVR 타겟 카드 네 장
 *
 * 세그먼트 317 로 고른 사람과 pCVR 이 높은 순서로 고른 사람을 비교하는 카드 네 장이다. 317 안팎의 pCVR 분포,
 * 같은 수를 pCVR 순서로 자르기, 작게 자를 때의 전환율과 전환 수, 기저 전환과 증분.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 세그먼트 317(그 안의 회원), 벽돌색은 317 밖의 회원,
 * 먹색은 pCVR 상위로 자른 집합, 회색은 기저 전환(광고 없이도 일어났을 전환)이다.
 *
 * 숫자는 전부 pcvr-based-targeting 글의 파이썬 출력에서 옮긴 가상 값이다. 구간마다의 기대 전환, 317 밖에서 들어온 수,
 * 기대 전환과 전환율, 전체 환산과 비용 지수(세그먼트 317 = 1.00), 두 시나리오의 증분은 두 블록이 찍은 값이다.
 * 3번 카드의 「약 N00건」은 블록이 찍은 전체 환산 기대 전환을 백 단위로 반올림한 값이다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);

    // ---------- 1. pCVR 구간마다 317 안과 밖의 회원 ----------
    (function () {
        const S = 'pt-segment'; if (!has(S)) return; let s = '';
        s += T(40, 22, '막대는 각 무리의 기대 전환 가운데 그 구간의 몫이고, 글자는 기대 전환입니다', 'lbl sm');
        const rows = [
            // 구간, 317 안의 기대 전환, 317 밖의 기대 전환 (1절 표와 같은 값)
            ['0.1% 미만', '0.26', '4.80'], ['0.1~0.3%', '1.41', '10.12'], ['0.3~1%', '4.32', '9.49'],
            ['1~3%', '4.45', '2.55'], ['3% 이상', '3.30', '0.56'],
        ];
        const total = j => rows.reduce((t, r) => t + Number(r[j]), 0), x0 = 124, w = 280;
        rows.forEach((r, i) => {
            const y = 36 + i * 40;
            s += T(40, y + 17, r[0], 'lbl k');
            s += hbar(x0, y, w, Number(r[1]) / total(1), 'a', 11);
            s += T(x0 + w + 8, y + 10, `${r[1]}건`, 'lbl');
            s += hbar(x0, y + 14, w, Number(r[2]) / total(2), 'b', 11);
            s += T(x0 + w + 8, y + 24, `${r[2]}건`, 'lbl b');
        });
        s += T(40, 256, '위 막대는 317 안 2,290명 (평균 0.60%), 아래 막대는 317 밖 17,710명 (평균 0.155%)', 'lbl sm');
        s += T(40, 280, '317 안에서는 1% 넘는 341명이 기대 전환의 절반 넘게를 냅니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. pCVR 순서로 317 과 같은 수를 자르면 ----------
    (function () {
        const S = 'pt-topn'; if (!has(S)) return; let s = '';
        s += T(40, 22, 'pCVR 이 큰 순서로 정렬한 줄의 앞 2,290명. 칸마다 317 안과 밖의 사람 수', 'lbl sm');
        const x0 = 40, w = 440, y = 52, h = 18, n = 2290;
        // 줄의 순번 구간, 그 구간의 317 안, 317 밖. 상위 200명 중 밖 48명, 1,000명 중 448명, 2,290명 중 1,390명에서 뺀 값이다
        const parts = [[200, 152, 48], [800, 400, 400], [1290, 348, 942]];
        let x = x0;
        parts.forEach(p => {
            const cw = w * p[0] / n, wa = cw * p[1] / p[0];
            s += `<rect class="f-a" x="${x.toFixed(1)}" y="${y}" width="${wa.toFixed(1)}" height="${h}"/>`;
            s += `<rect class="f-b" x="${(x + wa).toFixed(1)}" y="${y}" width="${(cw - wa).toFixed(1)}" height="${h}"/>`;
            x += cw;
        });
        const marks = [[200, '상위 1%', '200명 중 317 밖 48명'], [1000, '상위 5%', '1,000명 중 448명'], [2290, '같은 크기', '2,290명 중 1,390명']];
        marks.forEach((m, i) => {
            const xm = (x0 + w * m[0] / n).toFixed(1), anchor = i === 2 ? 'end' : 'middle';
            s += `<line class="tick" x1="${xm}" y1="${y - 6}" x2="${xm}" y2="${y + h + 6}"/>`;
            s += T(xm, y - 10, m[1], 'lbl k', anchor);
            s += T(xm, y + h + 20, m[2], 'lbl sm', anchor);
        });
        const rows = [
            ['세그먼트 317 의 2,290명', [[900, 'a', '줄 안에도 든 900명'], [1390, 'a', '경계 pCVR 0.392% 아래로 빠진 1,390명']]],
            ['pCVR 상위 같은 크기 2,290명', [[900, 'a', '317 안 900명'], [1390, 'b', '317 밖에서 들어온 1,390명']]],
        ];
        rows.forEach((r, i) => {
            const yy = 132 + i * 52;
            s += T(40, yy - 7, r[0], 'lbl k');
            let xx = x0;
            r[1].forEach(([cnt, cls, label]) => {
                const ww = w * cnt / n;
                s += `<rect class="f-${cls}" x="${xx.toFixed(1)}" y="${yy}" width="${(ww - 2).toFixed(1)}" height="14"/>`;
                s += T((xx + 2).toFixed(1), yy + 27, label, 'lbl sm');
                xx += ww;
            });
        });
        s += T(40, 256, '기대 전환 13.740건 → 21.305건, 전환율 0.60% → 0.93%', 'lbl k');
        s += T(40, 280, '들어온 1,390명 중 272명은 30일 안에 운동 용품을 산 회원입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 작게 자를수록 오르는 전환율과 줄어드는 전환 수 (전체 환산) ----------
    (function () {
        const S = 'pt-tradeoff'; if (!has(S)) return; let s = '';
        s += T(40, 22, '가로는 사람 수 (전체 환산). 먹색은 pCVR 상위 셋, 파랑은 세그먼트 317', 'lbl sm');
        const N = 1603000, top = 58, bottom = 196, pw = 180;
        // 사람 (전체 환산), 전환율 %, 기대 전환 (전체 환산), 가로 눈금 글자
        const pts = [[140000, 3.29, 4612, '14만'], [700000, 1.47, 10305, '70만'], [1603000, 0.93, 14913, '160만']];
        const seg = [1603000, 0.60, 9618];
        const panel = (px, title, idx, max, labels, segLabel) => {
            const X = v => px + pw * v / N, Y = v => bottom - (bottom - top) * v / max;
            let t = T(px, 46, title, 'lbl k');
            t += `<line class="grp" x1="${px}" y1="${bottom}" x2="${px + pw}" y2="${bottom}"/>`;
            t += `<polyline class="pt-line" points="${pts.map(p => `${X(p[0]).toFixed(1)},${Y(p[idx]).toFixed(1)}`).join(' ')}"/>`;
            pts.forEach((p, i) => {
                const cx = X(p[0]), cy = Y(p[idx]), [dx, dy, anchor] = labels[i][1];
                t += `<circle class="f-k" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4"/>`;
                t += T((cx + dx).toFixed(1), (cy + dy).toFixed(1), labels[i][0], 'lbl k', anchor);
                t += T(cx.toFixed(1), bottom + 15, p[3], 'lbl sm', 'middle');
            });
            const sx = X(seg[0]), sy = Y(seg[idx]);
            t += `<circle class="f-a" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="4.5"/>`;
            t += T((sx - 8).toFixed(1), (sy + 15).toFixed(1), segLabel, 'lbl', 'end');
            return t;
        };
        s += panel(40, '전환율', 1, 3.6,
            [['3.29%', [8, 4, 'start']], ['1.47%', [8, -6, 'start']], ['0.93%', [-6, -13, 'end']]], '세그먼트 0.60%');
        s += panel(300, '기대 전환 (전체 환산)', 2, 16000,
            [['약 4,600건', [8, 4, 'start']], ['약 10,300건', [-6, -9, 'end']], ['약 14,900건', [-8, -7, 'end']]], '세그먼트 약 9,600건');
        s += T(40, 236, '세그먼트를 1.00 으로 둔 전환당 비용: 같은 크기 0.64, 상위 5% 0.41, 상위 1% 0.18', 'lbl sm');
        s += T(40, 254, '비용은 사람 수에 비례한다고 둔 가상 가정이라 원 대신 비율로 봅니다', 'lbl sm');
        s += T(40, 280, '작게 자를수록 전환율은 오르고 전환 수는 줄어듭니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 기대 전환을 기저 전환과 증분으로 ----------
    (function () {
        const S = 'pt-lift'; if (!has(S)) return; let s = '';
        s += T(40, 22, '막대 길이는 표본의 기대 전환. 위 막대는 시나리오 1, 아래 막대는 시나리오 2', 'lbl sm');
        const rows = [
            // 이름, 색, 기대 전환, 시나리오 1 증분, 시나리오 2 증분 (글자는 블록이 찍은 그대로)
            ['세그먼트 317', 'a', 13.740, ['5.496', '3.117']],
            ['pCVR 상위 같은 크기', 'k', 21.305, ['8.522', '4.567']],
            ['pCVR 상위 5%', 'k', 14.721, ['5.889', '3.042']],
            ['pCVR 상위 1%', 'k', 6.588, ['2.635', '1.327']],
        ];
        const x0 = 178, w = 230, k = w / 21.305;
        rows.forEach((r, i) => {
            const y = 40 + i * 50;
            s += T(40, y + 17, r[0], 'lbl k');
            r[3].forEach((inc, j) => {
                const yy = y + j * 15, wi = Number(inc) * k, wb = (r[2] - Number(inc)) * k;
                s += `<rect class="f-${r[1]}" x="${x0}" y="${yy}" width="${wi.toFixed(1)}" height="11"/>`;
                s += `<rect class="f-c" x="${(x0 + wi).toFixed(1)}" y="${yy}" width="${wb.toFixed(1)}" height="11"/>`;
                s += T(x0 + w + 8, yy + 9, inc, 'lbl sm');
            });
        });
        s += T(40, 256, '색 막대가 증분, 회색이 기저 전환입니다. 오른쪽 숫자는 증분입니다', 'lbl sm');
        s += T(40, 280, '시나리오 2 에서는 상위 5% 의 증분 3.042 가 세그먼트의 3.117 아래로 내려갑니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
