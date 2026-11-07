/**
 * user-docs-cards-demo.js — 유저를 문서로 카드 네 장
 *
 * 회원 한 명의 30일 행동을 글 한 편으로 적고, 광고 키워드로 그 글을 검색해 사람을 고르는 자리를 카드 한 장씩으로 그린다.
 * 회원 A 의 행동이 낱말이 되는 그림, direct 질의 낱말의 idf 와 회원 셋의 BM25 점수, 세 목록을 순위로 합치는 RRF,
 * 앞 200명과 세그먼트 317 의 겹침. 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 세그먼트 317 쪽(규칙으로
 * 고른 회원), 벽돌색은 광고 키워드 쪽(질의, 질의에 맞는 낱말, 검색이 찾은 회원), 회색은 질의에 맞지 않는 행동 낱말과 목록 밖이고,
 * 점선 상자는 회원 한 명의 문서 원문이다.
 *
 * 숫자는 전부 users-as-documents 글의 파이썬 출력에서 옮긴 값이다. 회원, 행동, 키워드, 구매는 가상 값이고
 * scripts/gen-ads-data.py 가 만든다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, tw, box, tag, arrow, svg, hbar, esc } = window.CardKit;
    const has = id => !!document.getElementById(id);
    const line = (x, y, str, cls = 'list-t') => `<text class="${cls}" x="${x}" y="${y}">${esc(str)}</text>`;
    // 순위 칸 하나. 목록에 없으면 빈 칸에 줄표
    const cell = (x, y, rank) => rank ? box(x, y, 52, 20, `${rank}위`, 'b', 10)
        : `<rect class="track" x="${x}" y="${y}" width="52" height="20"/>` + T(x + 26, y + 14, '없음', 'lbl sm', 'middle');

    // ---------- 1. 회원 A 의 30일이 글 한 편이 된다 ----------
    (function () {
        const S = 'ud-doc'; if (!has(S)) return; let s = '';
        s += T(40, 20, '회원 A 의 30일 행동 여섯 줄이 낱말 37개의 글 한 편이 됩니다', 'lbl sm');
        s += T(40, 42, '30일 행동', 'lbl k') + T(300, 42, '문서에 쓰는 낱말과 횟수', 'lbl k');
        const rows = [
            ['검색어 러닝화', '12번', '러닝화', 12, 'b'], ['러닝 글', '9편', '러닝글', 9, 'c'],
            ['운동 앱을 켠 날', '8일', '운동앱', 8, 'c'], ['여행 글', '4편', '여행글', 4, 'c'],
            ['카페 글', '3편', '카페글', 3, 'c'], ['운동 용품 구매', '1번', '운동용품구매', 1, 'c'],
        ];
        rows.forEach(([what, n, word, k, cls], i) => {
            const y = 52 + i * 24;
            s += T(40, y + 13, what, 'lbl') + T(206, y + 13, n, 'lbl k', 'end');
            s += arrow(`udd${i}`, `M218,${y + 9} L286,${y + 9}`, 'k', { svg: S });
            s += tag(300, y, word, cls) + T(300 + tw(word) + 22, y + 13, `× ${k}`, 'lbl k');
        });
        s += `<rect class="list" x="34" y="202" width="452" height="44"/>`;
        s += line(44, 218, '회원 A 의 문서, 37낱말', 'list-t h');
        s += line(44, 234, '러닝화 러닝화 러닝화 러닝화 러닝화 러닝화 … 여행글 카페글 카페글 카페글');
        s += T(40, 270, '문서 2,000편의 길이는 평균 15.7낱말이고, 가장 긴 문서는 60낱말입니다', 'lbl');
        s += T(40, 290, '벽돌색 낱말만 광고 키워드와 맞을 수 있고, 회색 행동 낱말은 길이만 늘립니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. direct 질의 낱말의 idf 와 회원 셋의 점수 ----------
    (function () {
        const S = 'ud-bm25'; if (!has(S)) return; let s = '';
        s += T(40, 20, 'direct 질의 7낱말의 idf 와, 같은 질의로 매긴 회원 셋의 BM25 점수', 'lbl sm');
        s += T(40, 40, '질의 낱말', 'lbl k') + T(176, 40, '든 문서', 'lbl k', 'end') + T(190, 40, 'idf, 드문 낱말일수록 크다', 'lbl k');
        const idf = [['러닝화', 63, 3.45], ['조깅화', 13, 5.00], ['런닝화', 53, 3.62], ['런닝슈즈', 6, 5.73],
            ['러닝슈즈', 21, 4.53], ['달리기신발', 3, 6.35], ['마라톤화', 12, 5.08]];
        idf.forEach(([w, n, v], i) => {
            const y = 48 + i * 16;
            s += T(40, y + 10, w, 'lbl') + T(176, y + 10, `${n}편`, 'lbl', 'end');
            s += hbar(190, y, 160, v / 6.5, 'b', 11) + T(358, y + 10, v.toFixed(2), 'lbl k');
        });
        s += T(40, 182, '회원', 'lbl k') + T(300, 182, 'direct 점수', 'lbl k');
        const who = [
            ['회원 1051, 1위', '러닝화 12, 조깅화 1, 런닝슈즈 1. 문서 38낱말', 5.95],
            ['회원 201', '러닝화 7. 문서 19낱말', 2.88],
            ['회원 A, 49위', '러닝화 12. 문서 37낱말', 2.87],
        ];
        who.forEach(([name, sub, v], i) => {
            const y = 190 + i * 28;
            s += T(40, y + 10, name, 'lbl k') + T(40, y + 23, sub, 'lbl sm');
            s += hbar(300, y + 2, 140, v / 6, 'b', 12) + T(448, y + 12, v.toFixed(2), 'lbl k');
        });
        s += T(40, 290, '7번 검색한 회원 201 이 12번 검색한 회원 A 보다 앞섭니다. 문서가 짧아서입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 세 목록을 순위로 합친다 ----------
    (function () {
        const S = 'ud-rrf'; if (!has(S)) return; let s = '';
        s += T(40, 20, '회원마다 목록별로 1 ÷ (60 + 순위) 를 더합니다. 목록에 없으면 0 을 더합니다', 'lbl sm');
        s += T(40, 42, '회원', 'lbl k');
        ['direct', 'category', 'co_purchase'].forEach((n, j) => { s += T(148 + j * 62, 42, n, 'lbl sm', 'middle'); });
        s += T(310, 42, 'RRF 점수', 'lbl k') + T(490, 42, '합친 순위', 'lbl k', 'end');
        const rows = [
            ['회원 1339', [142, 4, 10], 0.0349, '1위'], ['회원 1711', [110, 19, 19], 0.0312, '2위'],
            ['회원 1311', [7, 75, 71], 0.0300, '4위'], ['회원 181', [0, 3, 21], 0.0282, '5위'],
            ['회원 A', [49, 0, 0], 0.0092, '171위'],
        ];
        rows.forEach(([name, ranks, v, place], i) => {
            const y = 52 + i * 28 + (i === 4 ? 10 : 0);
            s += T(40, y + 14, name, i === 4 ? 'lbl k' : 'lbl');
            ranks.forEach((r, j) => { s += cell(122 + j * 62, y, r); });
            s += hbar(310, y + 4, 78, v / 0.035, 'b', 12) + T(396, y + 14, v.toFixed(4), 'lbl k');
            s += T(490, y + 14, place, 'lbl k', 'end');
        });
        s += `<line class="split" x1="40" y1="${52 + 4 * 28 + 2}" x2="490" y2="${52 + 4 * 28 + 2}"/>`;
        s += T(40, 230, '앞 200명: 목록 셋에 든 23명, 둘에 든 81명, 하나뿐인 96명', 'lbl');
        s += T(40, 250, '목록 하나뿐인 회원은 그 목록의 75위까지 200명 안에 듭니다', 'lbl sm');
        s += T(40, 278, '회원 A 는 같은 점수인 회원 126 보다 번호가 작아 한 자리 앞입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 앞 200명과 세그먼트 317 의 겹침 ----------
    (function () {
        const S = 'ud-cut'; if (!has(S)) return; let s = '';
        s += T(40, 20, '막대 한 칸이 회원 한 명입니다. 두 막대가 위아래로 같은 자리면 같은 회원입니다', 'lbl sm');
        const u = 1.4, x0 = 46, segEnd = x0 + 229 * u, srchStart = x0 + 64 * u, srchEnd = srchStart + 200 * u;
        s += T(x0, 50, '세그먼트 317, 229명', 'lbl k');
        s += `<rect class="f-a" x="${x0}" y="58" width="${229 * u}" height="22"/>`;
        s += `<rect class="f-b" x="${srchStart}" y="88" width="${200 * u}" height="22"/>`;
        s += T(srchEnd, 128, '검색 200명', 'lbl k', 'end');
        [x0, srchStart, segEnd, srchEnd].forEach(x => { s += `<line class="split" x1="${x}" y1="136" x2="${x}" y2="144"/>`; });
        const part = (a, b, title, n, buy) => {
            const cx = (a + b) / 2;
            return T(cx, 160, title, 'lbl k', 'middle') + T(cx, 176, n, 'lbl', 'middle') + T(cx, 192, buy, 'lbl sm', 'middle');
        };
        s += part(x0, srchStart, '세그먼트에만', '64명', '구매자 6명, 9.4%');
        s += part(srchStart, segEnd, '겹친 회원', '165명', '구매자 40명, 24.2%');
        s += part(segEnd - 6, srchEnd + 40, '검색에만', '35명', '구매자 1명, 2.9%');
        s += T(40, 226, '다음 30일 구매자: 세그먼트 317 은 46명(20.1%), 검색 200명은 41명(20.5%)', 'lbl');
        s += T(40, 254, '세그먼트에만 있는 64명 가운데 17명은 질의 낱말을 검색한 적이 없어', 'lbl sm');
        s += T(40, 270, '세 목록 어디에도 없습니다. 그 17명의 구매자는 0명입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
