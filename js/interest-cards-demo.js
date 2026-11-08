/**
 * interest-cards-demo.js — 관심사 분류 카드 네 장
 *
 * 같은 글 200건에 관심사 라벨을 붙이는 방법 하나가 카드 한 장이다. 키워드 규칙, 단어 가방 분류 모델, LLM 라벨,
 * 평가 40건에서 셋을 나란히 놓은 막대.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 회색은 규칙, 파랑은 분류 모델, 벽돌색은 LLM 이고,
 * 점선 상자는 사람이 미리 적어 둔 글(키워드 사전, 시스템 메시지)이다.
 *
 * 숫자는 전부 interest-classification 글의 파이썬 출력에서 옮긴 값이다. 글 200건과 단가는 가상 값이고,
 * LLM 의 답과 토큰 수는 data/llm-records/interest-classification.json 의 기록이다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { esc, T, tw, tag, arrow, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);
    const line = (x, y, str, cls = 'list-t') => `<text class="${cls}" x="${x}" y="${y}">${esc(str)}</text>`;

    // ---------- 1. 키워드 사전과 첫 매칭 ----------
    (function () {
        const S = 'ic-rule'; if (!has(S)) return; let s = '';
        s += T(40, 22, '키워드 25개. 위에서부터 살펴보고 처음 맞는 관심사를 붙입니다', 'lbl sm');
        const dict = [
            ['1 running', '러닝 마라톤 조깅'], ['2 camping', '캠핑 텐트 글램핑'], ['3 travel', '여행 항공권 호텔'],
            ['4 cafe', '카페 커피 디저트'], ['5 parenting', '육아 아기 이유식'], ['6 finance', '재테크 적금 주식 ETF'],
            ['7 gaming', '게임 콘솔 공략'], ['8 beauty', '화장품 스킨케어 메이크업'],
        ];
        s += `<rect class="list" x="34" y="32" width="208" height="142"/>`;
        s += T(44, 49, '키워드 사전', 'lbl k');
        dict.forEach((d, i) => {
            const y = 67 + i * 14;
            s += line(44, y, d[0], 'list-t h') + line(116, y, d[1]);
        });
        s += arrow('icr1', 'M244,103 L256,103', 'c', { svg: S });
        // 글 넷. 앞은 제목(과 첫 문장의 명사), 뒤는 규칙의 답
        const ex = [
            ['마라톤 접수, 이번 달에 알게 된 것', 'running', '맞음'],
            ['심박수 구간 한 달 기록 / 케이던스', '', '라벨 없음. 사전의 낱말이 없다'],
            ['요즘 빠진 키즈카페 이야기', 'cafe', '틀림. 사람은 parenting'],
            ['요즘 빠진 캠핑 의자 이야기 / 마라톤 접수', 'running', '틀림. 사람은 camping'],
        ];
        ex.forEach((e, i) => {
            const y = 46 + i * 38;
            s += T(262, y, e[0], 'lbl');
            if (e[1]) s += tag(262, y + 6, e[1], 'c') + T(262 + tw(e[1]) + 22, y + 19, e[2], 'lbl sm');
            else s += T(262, y + 19, e[2], 'lbl k');
        });
        s += T(40, 196, '200건에 대 보면', 'lbl sm');
        [['맞힘', 114], ['틀림', 7], ['라벨 없음', 79]].forEach((r, i) => {
            const y = 204 + i * 16;
            s += T(40, y + 9, r[0], 'lbl');
            s += hbar(110, y, 300, r[1] / 200, 'c', 10);
            s += T(418, y + 9, `${r[1]}건`, 'lbl k');
        });
        s += T(40, 276, '라벨을 붙인 121건 중 114건이 맞고, 사전의 낱말이 없는 글은 비어 있습니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 단어 가방이 가중치를 지나 점수 8개가 된다 ----------
    (function () {
        const S = 'ic-model'; if (!has(S)) return; let s = '';
        s += T(40, 22, '심박수 구간 글. 규칙은 라벨을 비워 둔 글입니다', 'lbl sm');
        // 낱말 11개. 앞의 셋은 명사이고 나머지는 틀의 낱말이다
        const bag = ['심박수', '구간', '케이던스', '한', '달', '기록', '처음에는', '하나만', '보다가', '범위를', '넓혔다'];
        bag.forEach((wd, i) => {
            const x = 40 + (i % 2) * 76, y = 34 + Math.floor(i / 2) * 23;
            s += `<rect class="track" x="${x}" y="${y}" width="70" height="17"/>` + T(x + 6, y + 12.5, wd, i < 3 ? 'lbl k' : 'lbl');
        });
        s += T(40, 186, '단어 가방: 낱말 11개, 순서는 버린다', 'lbl sm');
        s += arrow('icm1', 'M194,100 L218,100', 'a', { svg: S });
        s += `<rect class="f-a" x="220" y="66" width="104" height="68"/>`;
        [['running 모델', 82], ['절편 + 가중치 11개', 98], ['= 0.41', 112], ['시그모이드 → 0.60', 126]].forEach(t => {
            s += `<text class="on ic-sm" x="272" y="${t[1]}" text-anchor="middle">${esc(t[0])}</text>`;
        });
        s += T(272, 150, '관심사마다 이런 모델이 8개', 'lbl sm', 'middle');
        s += arrow('icm2', 'M326,100 L338,100', 'a', { svg: S });
        const sc = [['running', 0.60], ['camping', 0.07], ['travel', 0.03], ['cafe', 0.02],
            ['parenting', 0.03], ['finance', 0.01], ['gaming', 0.03], ['beauty', 0.01]];
        sc.forEach((r, i) => {
            const y = 34 + i * 18, top = i === 0;
            s += T(342, y + 9, r[0], top ? 'lbl k' : 'lbl sm');
            s += hbar(402, y, 80, r[1], 'a', 10);
            s += T(488, y + 9, r[1].toFixed(2), top ? 'lbl k' : 'lbl sm');
        });
        s += T(342, 186, '가장 높은 running 을 고른다', 'lbl sm');
        s += T(40, 236, '평가 40건 중 38건을 맞힙니다. 틀린 글은 쿠션 팩트 글과 그림책 글입니다', 'lbl sm');
        s += T(40, 254, '학습 160건에 없던 낱말은 점수에 아무것도 더하지 않아서,', 'lbl sm');
        s += T(40, 276, '두 글의 가장 높은 점수는 0.06 과 0.08 에 그칩니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 시스템 메시지 한 장과 JSON 답 한 줄 ----------
    (function () {
        const S = 'ic-llm'; if (!has(S)) return; let s = '';
        s += T(40, 22, '모든 요청에 같이 가는 시스템 메시지와 글 한 건을 보냅니다', 'lbl sm');
        s += `<rect class="list" x="34" y="30" width="452" height="82"/>`;
        s += T(44, 46, '시스템 메시지', 'lbl k');
        ['너는 글 분류기다. 사용자가 보낸 글의 제목과 첫 문장을 읽고 관심사 하나를 고른다.',
            '라벨은 running(러닝), camping(캠핑), travel(여행), cafe(카페), parenting(육아),',
            'finance(재테크), gaming(게임), beauty(뷰티) 가운데 하나다.',
            '답은 {"label": "<라벨>"} 꼴의 JSON 한 줄로만 쓴다. 설명이나 다른 글은 붙이지 않는다.',
        ].forEach((t, i) => { s += line(44, 62 + i * 13, t); });
        s += `<rect class="grp" x="34" y="122" width="452" height="50"/>`;
        s += T(44, 138, '사용자 메시지 (글 한 건)', 'lbl k');
        s += line(44, 153, '제목: 그림책 처음이라면 먼저 볼 것');
        s += line(44, 166, '첫 문장: 지난달부터 젖병 소독 생각에 정보를 모으고 있다.');
        s += arrow('icl1', 'M60,174 L60,188', 'b', { svg: S });
        s += tag(34, 190, '{"label": "parenting"}', 'b');
        s += T(200, 203, 'LLM 의 답. 사람 라벨과 같고, 모델은 cafe 0.08 로 틀렸다', 'lbl sm');
        s += T(40, 236, '건당 입력 147.5 토큰과 출력 6.64 토큰. 가상 단가로 0.070원, 이 맥에서 0.86초', 'lbl sm');
        s += T(40, 254, '헷갈리지 않는 글 180건은 모두 맞고, 헷갈리는 글 20건 중 16건은 첫 문장을 따른다', 'lbl sm');
        s += T(40, 276, 'temperature 0.7 로 3번 더 물은 평가 40건에서 바뀐 답은 0건입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 정밀도, 재현율, 건당 비용 막대 셋 ----------
    (function () {
        const S = 'ic-compare'; if (!has(S)) return; let s = '';
        s += T(40, 22, '평가 40건. 같은 글에 셋을 붙인 결과입니다', 'lbl sm');
        s += `<rect class="f-c" x="300" y="14" width="10" height="8"/>` + T(314, 22, '규칙', 'lbl sm');
        s += `<rect class="f-a" x="350" y="14" width="10" height="8"/>` + T(364, 22, '분류 모델', 'lbl sm');
        s += `<rect class="f-b" x="426" y="14" width="10" height="8"/>` + T(440, 22, 'LLM', 'lbl sm');
        const who = [['규칙', 'c'], ['분류 모델', 'a'], ['LLM', 'b']];
        const groups = [
            ['정밀도', [1, 0.95, 0.96], ['1.00', '0.95', '0.96']],
            ['재현율', [0.575, 0.95, 0.95], ['0.57 (23/40)', '0.95', '0.95']],
            ['건당 비용', [0, 0, 1], ['거의 0원', '거의 0원', '0.070원']],
        ];
        groups.forEach((g, gi) => {
            const y0 = 36 + gi * 66;
            s += T(40, y0 + 10, g[0], 'lbl k');
            who.forEach((w, i) => {
                const y = y0 + 18 + i * 14;
                s += T(120, y + 9, w[0], 'lbl sm');
                s += hbar(190, y, 250, g[1][i], w[1], 10);
                s += T(448, y + 9, g[2][i], 'lbl sm');
            });
        });
        s += T(40, 254, '규칙은 붙인 라벨이 다 맞지만 17건을 비워 둡니다', 'lbl sm');
        s += T(40, 276, '모델과 LLM 은 둘 다 38건을 맞히고, 틀린 글이 서로 다릅니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
