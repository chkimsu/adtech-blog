/**
 * rank-score-cards-demo.js — 위치 1 추론과 pairwise LTR 카드 12장
 *
 * 두 문제가 같은 데로 이어진다. 점수의 순서는 맞는데 크기가 틀린다. 앞 여섯 장은 pCTR 을 모든 후보에게
 * 1위로 두고 추론할 때, 뒤 여섯 장은 같은 검색 안의 쌍으로 학습할 때다.
 * 색은 css/style.css 의 카드 부품 블록이 정한다 — 파랑 광고와 맞는 값, 벽돌색 틀리거나 의심스러운 값,
 * 먹색 모델과 랭커, 회색 위치 효과와 사람이 남긴 기록. 점선 상자는 모르는 것과 짐작.
 * 숫자는 전부 posts/position1-pairwise-ltr.md 의 가상 데이터다 — 광고 A, B, C 의 1위 클릭률 5%, 4%, 3%,
 * 위치 효과 1위 1.0, 2위 0.75, 3위 0.5(앞 글 position-bias-ultr 의 가상 값과 같다), 광고 X 와 Y 의 입찰가 1,000원과 600원.
 *
 * 호스트(#rs-<key>)가 없는 카드는 건너뛴다. ?card=key 가 붙으면 그 카드만 남긴다.
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, tag, srv, list, tool, user, arrow, dots, svg, hbar, lines } = window.CardKit;
    const has = id => !!document.getElementById(id);
    const rect = (x, y, w, h, cls) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
    const line = (x1, y1, x2, y2, cls) => `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;

    // =====================================================================
    // 위치 1 추론 — 학습 때는 위치를 알고 서빙 때는 모른다
    // =====================================================================

    // ---------- 1. 학습 때는 위치를 안다 ----------
    (function () {
        const S = 'rs-p-learn'; if (!has(S)) return; let s = '';
        s += T(40, 26, '학습 로그 (노출 로그에 위치가 적혀 있습니다)', 'lbl sm');
        s += list(40, 38, 140, 40, [{ t: 'A 가 1위에', cls: 'h' }, '클릭률 5.0%']);
        s += list(40, 92, 140, 40, [{ t: 'B 가 2위에', cls: 'h' }, '클릭률 3.0%']);
        s += list(40, 146, 140, 40, [{ t: 'C 가 3위에', cls: 'h' }, '클릭률 1.5%']);
        s += srv(236, 84, { cls: 'k', label: 'pCTR 모델', sub: '광고 피처 + 위치' });
        s += arrow('pl1', 'M182,58 C210,58 214,98 234,98', 'k', { svg: S });
        s += arrow('pl2', 'M182,112 L234,112', 'k', { svg: S });
        s += arrow('pl3', 'M182,166 C210,166 214,126 234,126', 'k', { svg: S });
        s += dots('pl1', 'k', { n: 1, dur: 2.4 }) + dots('pl2', 'k', { n: 1, dur: 2.4 }) + dots('pl3', 'k', { n: 1, dur: 2.4 });
        s += T(330, 26, '모델이 나눠 배우는 것', 'lbl sm');
        s += tag(330, 64, 'B 의 품질: 1위라면 4.0%', 'a');
        s += tag(330, 132, '2위의 위치 효과: 0.75', 'c');
        s += arrow('po1', 'M282,104 C306,104 308,73 326,73', 'a', { svg: S });
        s += arrow('po2', 'M282,120 C306,120 308,141 326,141', 'c', { svg: S });
        s += dots('po1', 'a', { n: 1, dur: 2 }) + dots('po2', 'c', { n: 1, dur: 2 });
        s += lines(330, 178, ['4.0% × 0.75 = 3.0%', 'B 가 낮게 나온 것은 2위라서입니다']);
        s += T(40, 270, '위치를 넣고 학습하면 광고 품질과 위치 효과를 나눠 배웁니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 서빙 때는 위치를 모른다 ----------
    (function () {
        const S = 'rs-p-serve'; if (!has(S)) return; let s = '';
        s += user(56, 44, '검색 한 번');
        s += srv(120, 34, { cls: 'k', label: '랭커', sub: '순서를 정하는 서버' });
        s += srv(232, 34, { cls: 'k', label: 'pCTR 모델' });
        s += arrow('sv1', 'M72,58 L118,58', 'b', { svg: S }) + dots('sv1', 'b', { n: 1, dur: 1.8 });
        s += arrow('sv2', 'M166,58 L230,58', 'k', { svg: S }) + dots('sv2', 'k', { n: 1, dur: 1.8 });
        s += T(198, 50, '점수 묻기', 'lbl sm', 'middle');
        s += tag(196, 132, '모든 후보를 1위로 둡니다', 'b');
        s += T(330, 26, '1위라면의 점수', 'lbl sm');
        s += tag(330, 40, 'A 5.0%', 'a') + tag(330, 74, 'B 4.0%', 'a') + tag(330, 108, 'C 3.0%', 'a');
        s += arrow('sc1', 'M278,52 C300,52 308,49 328,49', 'a', { svg: S });
        s += arrow('sc2', 'M278,61 C300,61 308,83 328,83', 'a', { svg: S });
        s += arrow('sc3', 'M278,70 C300,70 308,117 328,117', 'a', { svg: S });
        s += T(420, 26, '정해진 순서', 'lbl sm');
        s += tag(420, 40, '1위 A', 'k') + tag(420, 74, '2위 B', 'k') + tag(420, 108, '3위 C', 'k');
        s += arrow('rs1', 'M384,49 L418,49', 'a', { svg: S }) + arrow('rs2', 'M384,83 L418,83', 'a', { svg: S }) + arrow('rs3', 'M384,117 L418,117', 'a', { svg: S });
        ['sc1', 'sc2', 'sc3'].forEach(p => { s += dots(p, 'a', { n: 1, dur: 2.2 }); });
        s += lines(40, 190, ['순서를 정해야 위치가 생기고, 순서를 정하려면 점수가 필요합니다', '그래서 모든 후보를 같은 1위로 두고 점수를 묻습니다']);
        s += T(40, 270, '모두 같은 위치를 가정하니 비교는 공평하고, 순서 A, B, C 는 맞습니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 그래서 값이 부푼다 ----------
    (function () {
        const S = 'rs-p-inflate'; if (!has(S)) return; let s = '';
        s += rect(40, 18, 12, 12, 'track') + T(58, 28, 'pCTR (1위로 두고 낸 값)', 'lbl sm');
        s += rect(230, 18, 12, 12, 'f-a') + T(248, 28, '실제 클릭률 (실제로 간 위치에서)', 'lbl sm');
        const base = 236, k = 28;
        s += line(40, base, 490, base, 'tick');
        [[115, 'A, 1위', 5.0, 5.0, ''], [265, 'B, 2위', 4.0, 3.0, '1.3배 부풂'], [415, 'C, 3위', 3.0, 1.5, '2.0배 부풂']].forEach(([cx, name, p, a, t]) => {
            const hp = p * k, ha = a * k;
            s += rect(cx - 50, base - hp, 46, hp, 'track') + T(cx - 27, base - hp - 6, p.toFixed(1) + '%', 'lbl k', 'middle');
            s += rect(cx + 4, base - ha, 46, ha, 'f-a') + T(cx + 27, base - ha - 6, a.toFixed(1) + '%', 'lbl k', 'middle');
            s += T(cx, base + 18, name, 'lbl', 'middle');
            if (t) s += tag(cx - 34, base - hp - 40, t, 'b');
        });
        s += T(40, 286, '하루 1만 번 노출이면 B 는 예상 클릭 400번, 실제 300번입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 고치는 법: 정해진 위치의 효과를 곱한다 ----------
    (function () {
        const S = 'rs-p-fix'; if (!has(S)) return; let s = '';
        s += T(40, 26, '같은 점수를 두 곳에 씁니다', 'lbl sm');
        s += tag(40, 116, 'B 의 pCTR 4.0%', 'a');
        s += tool(250, 40, 220, { label: '순서 정하기', sub: '4.0% 그대로 씁니다' });
        s += lines(250, 98, ['요청마다 후보를 줄 세울 때', '모두 같은 1위 기준이라 공평합니다']);
        s += tag(176, 200, '× 0.75 (2위 위치 효과)', 'c');
        s += tool(330, 189, 140, { label: '돈 계산', sub: '3.0% 로 셉니다' });
        s += lines(330, 246, ['예상 클릭, 예상 매출, 광고비']);
        s += arrow('fx1', 'M148,121 C200,121 214,60 248,60', 'a', { svg: S });
        s += arrow('fx2', 'M100,136 C100,180 140,209 174,209', 'c', { svg: S });
        s += arrow('fx3', 'M318,209 L328,209', 'a', { svg: S });
        s += dots('fx1', 'a', { n: 1, dur: 2.4 }) + dots('fx2', 'c', { n: 1, dur: 2.4 });
        s += T(40, 282, '위치 효과는 광고가 몇 개 나오느냐에 따라 달라 개수별로 따로 둡니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 5. 순서가 바뀌기도 한다 ----------
    (function () {
        const S = 'rs-p-swap'; if (!has(S)) return; let s = '';
        s += T(140, 30, '둘 다 1위라면', 'lbl k', 'middle') + T(380, 30, '둘 다 3위라면', 'lbl k', 'middle');
        s += line(260, 40, 260, 250, 'split');
        const base = 236, k = 28;
        s += line(50, base, 230, base, 'tick') + line(290, base, 470, base, 'tick');
        [[80, 5.0, 'A', 'f-a'], [160, 3.0, 'C', 'f-a'], [320, 2.5, 'A', 'f-a'], [400, 2.7, 'C', 'f-b']].forEach(([x, v, l, c]) => {
            const h = v * k;
            s += rect(x, base - h, 50, h, c) + T(x + 25, base - h - 6, v.toFixed(1) + '%', 'lbl k', 'middle') + T(x + 25, base + 16, l, 'lbl k', 'middle');
        });
        s += T(140, 62, 'A 가 앞섭니다', 'lbl', 'middle') + T(380, 62, 'C 가 앞섭니다', 'lbl b', 'middle');
        s += T(40, 284, 'C 는 3위에서도 잘 보이는 큰 이미지 광고라 위치 효과를 0.9 로 둡니다. A 는 0.5 입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 6. 1위에 가 본 적 없는 광고 ----------
    (function () {
        const S = 'rs-p-unseen'; if (!has(S)) return; let s = '';
        s += T(40, 26, 'D 의 노출 기록', 'lbl sm');
        ['4위', '5위', '5위', '4위'].forEach((t, i) => { s += tag(40, 38 + i * 30, t, 'c'); });
        s += srv(196, 66, { cls: 'k', label: 'pCTR 모델' });
        [47, 77, 107, 137].forEach((y, i) => {
            s += arrow('un' + i, `M72,${y} C140,${y} 160,${80 + i * 9} 194,${80 + i * 9}`, 'k', { svg: S });
            s += dots('un' + i, 'k', { n: 1, dur: 2.4 });
        });
        s += list(330, 70, 160, 44, [{ t: 'D 가 1위라면?', cls: 'b' }, '본 적 없는 경우']);
        s += arrow('ug', 'M242,93 L328,93', 'b', { svg: S, dash: true });
        s += T(285, 84, '짐작', 'lbl b', 'middle');
        s += tag(40, 196, '1위 기록이 하나도 없습니다', 'b');
        s += lines(40, 238, ['학습 데이터의 1위는 기존 랭킹이 1위로 올린 광고뿐입니다', '처음 보는 조합이라 짐작이 크게 빗나가기 쉽습니다']);
        s += T(40, 284, '위치 효과를 따로 배우는 구조(PAL)가 이 짐작을 줄입니다', 'lbl');
        svg(S, s);
    })();

    // =====================================================================
    // pairwise LTR — 같은 검색 안의 순서만 배운다
    // =====================================================================

    // ---------- 7. pointwise 와 pairwise ----------
    (function () {
        const S = 'rs-l-kinds'; if (!has(S)) return; let s = '';
        s += T(40, 26, '검색 한 번', 'lbl sm');
        s += rect(34, 32, 122, 106, 'grp');
        s += box(40, 38, 110, 26, '1위 A 클릭', 'a') + box(40, 72, 110, 26, '2위 B', 'c') + box(40, 106, 110, 26, '3위 C', 'c');
        s += T(200, 26, 'pointwise: 광고마다 한 줄', 'lbl sm');
        s += box(200, 38, 88, 26, 'A → 1', 'a') + box(296, 38, 88, 26, 'B → 0', 'c') + box(392, 38, 88, 26, 'C → 0', 'c');
        s += T(200, 120, 'pairwise: 같은 검색 안의 쌍', 'lbl sm');
        s += box(200, 132, 130, 26, 'A > B', 'a') + box(340, 132, 130, 26, 'A > C', 'a');
        s += arrow('lk1', 'M158,70 C178,70 182,51 198,51', 'k', { svg: S }) + arrow('lk2', 'M158,104 C178,104 182,145 198,145', 'k', { svg: S });
        s += dots('lk1', 'k', { n: 1, dur: 2 }) + dots('lk2', 'k', { n: 1, dur: 2 });
        s += lines(200, 190, ['pointwise 는 3줄, pairwise 는 2쌍을 배웁니다', 'pairwise 는 함께 경쟁한 광고와 비교합니다']);
        s += T(40, 270, '서빙에서는 둘 다 광고 하나씩 점수를 냅니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 8. 점수의 크기를 배우지 않는다 ----------
    (function () {
        const S = 'rs-l-scale'; if (!has(S)) return; let s = '';
        s += T(40, 26, 'pairwise 손실이 똑같은 두 모델 (점수는 로짓)', 'lbl sm');
        [150, 370].forEach(ax => {
            s += line(ax, 50, ax, 230, 'tick');
            [['+2', 80], ['0', 140], ['-2', 200]].forEach(([v, y]) => { s += line(ax - 5, y, ax + 5, y, 'tick') + T(ax - 12, y + 4, v, 'lbl sm', 'end'); });
        });
        [[150, 80, 140], [370, 140, 200]].forEach(([ax, ya, yb]) => {
            s += `<circle class="f-a" cx="${ax}" cy="${ya}" r="7"/>` + T(ax + 14, ya + 4, 'A', 'lbl k');
            s += `<circle class="f-c" cx="${ax}" cy="${yb}" r="7"/>` + T(ax + 14, yb + 4, 'B', 'lbl k');
            s += `<path class="ar b" d="M${ax + 38},${ya} h12 M${ax + 44},${ya} V${yb} M${ax + 38},${yb} h12"/>`;
            s += T(ax + 56, (ya + yb) / 2 + 4, '차이 2', 'lbl');
        });
        s += T(150, 254, '모델 갑', 'lbl k', 'middle') + T(370, 254, '모델 을', 'lbl k', 'middle');
        s += T(150, 276, '확률로 A 88%, B 50%', 'lbl b', 'middle') + T(370, 276, '확률로 A 50%, B 12%', 'lbl b', 'middle');
        svg(S, s);
    })();

    // ---------- 9. 입찰가와 곱하면 순서가 뒤집힌다 ----------
    (function () {
        const S = 'rs-l-bid'; if (!has(S)) return; let s = '';
        s += T(40, 26, '맞는 크기라면 (입찰가 × 클릭률)', 'lbl sm');
        s += T(40, 50, 'X 입찰가 1,000원 × 2%', 'lbl') + hbar(40, 56, 300, 20 / 30, 'a', 20) + T(348, 71, '20', 'lbl k');
        s += T(40, 100, 'Y 입찰가 600원 × 4%', 'lbl') + hbar(40, 106, 300, 24 / 30, 'a', 20) + T(348, 121, '24', 'lbl k') + tag(380, 107, '1위', 'a');
        s += line(40, 146, 490, 146, 'split');
        s += T(40, 170, 'pairwise 점수라면', 'lbl sm');
        s += T(40, 194, 'X 입찰가 1,000원 × 3%', 'lbl') + hbar(40, 200, 300, 1, 'b', 20) + T(348, 215, '30', 'lbl b') + tag(380, 201, '1위', 'b');
        s += T(40, 244, 'Y 입찰가 600원 × 4%', 'lbl') + hbar(40, 250, 300, 24 / 30, 'a', 20) + T(348, 265, '24', 'lbl k');
        s += T(40, 292, 'X 와 Y 는 같은 검색에 나온 적이 없어 서로 비교된 적이 없습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 10. 클릭이 난 검색만 쓸 수 있다 ----------
    (function () {
        const S = 'rs-l-clicked'; if (!has(S)) return; let s = '';
        s += T(40, 26, '검색 100번 (파란 네모가 클릭이 난 검색)', 'lbl sm');
        const hit = new Set([7, 23, 48, 66, 91]);
        for (let i = 0; i < 100; i++) s += rect(40 + (i % 10) * 18, 38 + Math.floor(i / 10) * 18, 13, 13, hit.has(i) ? 'f-a' : 'track');
        s += list(300, 52, 190, 44, [{ t: '클릭 난 검색 5번', cls: 'h' }, '쌍을 만듭니다']);
        s += list(300, 146, 190, 44, [{ t: '아무도 안 누른 95번', cls: 'b' }, '버립니다']);
        s += arrow('cl1', 'M220,90 C260,90 270,74 298,74', 'a', { svg: S }) + dots('cl1', 'a', { n: 1, dur: 2 });
        s += arrow('cl2', 'M220,170 C260,170 270,168 298,168', 'b', { svg: S, dash: true });
        s += T(40, 250, '클릭률이 낮을수록 버리는 검색이 늘어납니다', 'lbl');
        s += T(40, 280, '95번에만 나온 광고는 학습에 한 번도 안 나옵니다', 'lbl b');
        svg(S, s);
    })();

    // ---------- 11. 쌍에 위치가 섞인다 ----------
    (function () {
        const S = 'rs-l-skip'; if (!has(S)) return; let s = '';
        s += T(40, 26, '한 사람이 본 검색 결과', 'lbl sm');
        s += box(40, 40, 160, 28, '1위 A 보고 지나감', 'c');
        s += box(40, 92, 160, 28, '2위 B 클릭', 'a');
        s += list(40, 144, 160, 28, [{ t: '3위 C 봤는지 모름', cls: 'h' }]);
        s += box(320, 56, 170, 28, 'B > A 믿을 만한 쌍', 'a');
        s += list(320, 150, 170, 28, [{ t: 'B > C 의심스러운 쌍', cls: 'b' }]);
        s += arrow('sk1', 'M202,100 C260,100 270,70 318,70', 'a', { svg: S }) + dots('sk1', 'a', { n: 1, dur: 2 });
        s += arrow('sk2', 'M202,112 C260,112 270,164 318,164', 'b', { svg: S, dash: true });
        s += lines(40, 210, ['B 를 누른 사람은 위의 A 를 보고 지나갔습니다', '아래의 C 는 아예 안 봤을 수 있습니다']);
        s += T(40, 280, '클릭보다 위에서 건너뛴 광고만 음성으로 씁니다 (skip-above)', 'lbl');
        svg(S, s);
    })();

    // ---------- 12. 광고가 많은 검색이 더 세게 배운다 ----------
    (function () {
        const S = 'rs-l-depth'; if (!has(S)) return; let s = '';
        s += T(40, 26, '광고 6개 검색 (파란 네모가 클릭된 광고)', 'lbl sm');
        for (let i = 0; i < 6; i++) s += rect(40 + i * 36, 40, 28, 28, i === 1 ? 'f-a' : 'track');
        s += box(330, 40, 160, 28, '쌍 5개', 'a');
        s += arrow('dp1', 'M252,54 L328,54', 'a', { svg: S }) + dots('dp1', 'a', { n: 2, dur: 2.2 });
        s += T(40, 130, '광고 2개 검색', 'lbl sm');
        for (let i = 0; i < 2; i++) s += rect(40 + i * 36, 144, 28, 28, i === 0 ? 'f-a' : 'track');
        s += box(330, 144, 160, 28, '쌍 1개', 'a');
        s += arrow('dp2', 'M108,158 L328,158', 'a', { svg: S }) + dots('dp2', 'a', { n: 1, dur: 2.2 });
        s += lines(40, 214, ['같은 클릭 하나가 쌍 5개와 쌍 1개로 들어갑니다', '경쟁이 센 검색을 세게 배우는 장점이자, 기우는 단점입니다']);
        s += T(40, 280, '광고가 한두 개뿐인 지면에서는 검색 안 비교 자체가 어렵습니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
