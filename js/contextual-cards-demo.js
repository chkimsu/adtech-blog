/**
 * contextual-cards-demo.js — 컨텍스추얼 타겟팅 카드 네 장
 *
 * 회원 번호가 없는 요청에 지면의 글만으로 카테고리를 붙이는 자리를 카드 한 장씩으로 그린다. 지면 글 한 편과 뽑힌 낱말,
 * 키워드 사전의 첫 매칭, TF-IDF 벡터와 카테고리 중심 벡터의 각도, 시스템 메시지와 JSON 라벨과 thinking 을 켰을 때의 토큰.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 회색은 키워드 사전과 틀의 낱말, 파랑은 TF-IDF 와 지면의 명사,
 * 벽돌색은 LLM 이고, 점선 상자는 사람이 미리 적어 둔 글(키워드 사전, 시스템 메시지)이다.
 *
 * 숫자는 전부 contextual-targeting 글의 파이썬 출력에서 옮긴 값이다. 지면 50개는 가상 값이고, LLM 의 답과 토큰 수와 시간은
 * data/llm-records/contextual-targeting.json 의 기록이다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { esc, T, tw, tag, arrow, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);
    const line = (x, y, str, cls = 'list-t') => `<text class="${cls}" x="${x}" y="${y}">${esc(str)}</text>`;

    // ---------- 1. 지면 글 한 편과 뽑힌 낱말 ----------
    (function () {
        const S = 'cx-page'; if (!has(S)) return; let s = '';
        s += T(40, 22, '비로그인 C 가 읽던 지면 p014. 제목 한 줄과 첫 문단 두 문장입니다', 'lbl sm');
        s += `<rect class="grp" x="34" y="30" width="452" height="66"/>`;
        s += T(44, 50, '10km 완주, 처음이라면 먼저 볼 것', 'lbl k');
        s += T(44, 70, '지난주부터 스포츠 워치, 농구 결승 정보를 모아 읽고 있다.', 'lbl');
        s += T(44, 86, '읽은 사람이 많이 물은 인터벌 훈련 내용도 넣었다.', 'lbl');
        s += arrow('cxp1', 'M60,98 L60,112', 'k', { svg: S });
        s += T(72, 109, '띄어쓰기로 자르고 쉼표와 마침표를 뗀다', 'lbl sm');
        // 낱말 23개. 명사에서 온 낱말은 파랑, 틀의 낱말은 회색이다
        const toks = [['10km', 1], ['완주', 1], ['처음이라면', 0], ['먼저', 0], ['볼', 0], ['것', 0], ['지난주부터', 0],
            ['스포츠', 1], ['워치', 1], ['농구', 1], ['결승', 1], ['정보를', 0], ['모아', 0], ['읽고', 0], ['있다', 0],
            ['읽은', 0], ['사람이', 0], ['많이', 0], ['물은', 0], ['인터벌', 1], ['훈련', 1], ['내용도', 0], ['넣었다', 0]];
        let x = 40, y = 120;
        toks.forEach(([w, noun]) => {
            const cw = tw(w) + 14;                 // tag() 의 폭과 같다
            if (x + cw > 486) { x = 40; y += 24; }
            s += tag(x, y, w, noun ? 'a' : 'c');
            x += cw + 5;
        });
        s += tag(40, 226, '파랑', 'a') + T(80, 239, '명사에서 온 낱말. 이 지면이 러닝과 스포츠 이야기임을 말한다', 'lbl sm');
        s += tag(40, 246, '회색', 'c') + T(80, 259, '틀의 낱말. 다른 카테고리 지면에도 똑같이 나온다', 'lbl sm');
        s += T(40, 286, '사람 라벨은 sports 입니다. 사전과 TF-IDF 는 이 낱말 23개를, LLM 은 글 그대로를 받습니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 키워드 사전과 첫 매칭 ----------
    (function () {
        const S = 'cx-keyword'; if (!has(S)) return; let s = '';
        s += T(40, 22, '낱말 40개. 위에서부터 살펴보고 처음 맞는 카테고리를 붙입니다', 'lbl sm');
        const dict = [
            ['automotive', '자동차 차량 운전 주차'], ['business', '경제 주식 창업 금리'], ['education', '교육 수능 학원 강의'],
            ['family', '육아 아이 가족 부모'], ['food', '요리 맛집 레시피 카페'], ['health', '건강 병원 다이어트 통증'],
            ['hobbies', '취미 사진 공방 악기'], ['sports', '러닝 마라톤 축구 야구'], ['style', '패션 화장품 코디 스킨케어'],
            ['travel', '여행 항공권 호텔 숙소'],
        ];
        s += `<rect class="list" x="34" y="30" width="214" height="166"/>`;
        s += T(44, 47, '키워드 사전', 'lbl k');
        dict.forEach((d, i) => {
            const y = 63 + i * 13.5;
            s += line(44, y, `${i + 1} ${d[0]}`, 'list-t h') + line(128, y, d[1]);
        });
        s += arrow('cxk1', 'M250,110 L262,110', 'c', { svg: S });
        // 지면 넷. 앞은 제목의 명사, 뒤는 사전의 답
        const ex = [
            ['러닝화 (p037)', 'sports', '맞음. 「러닝화」 안의 「러닝」'],
            ['10km 완주 (p014)', '', '라벨 없음. 사전의 낱말이 하나도 없다'],
            ['부모 교육 (p018)', 'education', '틀림. 「교육」이 family 보다 위'],
            ['여권 사진 (p008)', 'hobbies', '틀림. 「여권 사진」 안의 「사진」'],
        ];
        ex.forEach((e, i) => {
            const y = 46 + i * 40;
            s += T(268, y, e[0], 'lbl');
            if (e[1]) s += tag(268, y + 6, e[1], 'c') + T(268 + tw(e[1]) + 22, y + 19, e[2], 'lbl sm');
            else s += T(268, y + 19, e[2], 'lbl k');
        });
        s += T(40, 214, '지면 50개에 대 보면', 'lbl sm');
        [['맞힘', 33], ['틀림', 7], ['라벨 없음', 10]].forEach((r, i) => {
            const y = 222 + i * 16;
            s += T(40, y + 9, r[0], 'lbl');
            s += hbar(110, y, 300, r[1] / 50, 'c', 10);
            s += T(418, y + 9, `${r[1]}개`, 'lbl k');
        });
        s += T(40, 290, '라벨이 빈 10개에는 러닝 지면 p014 도 들어 있습니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. TF-IDF 벡터와 중심 벡터의 각도 ----------
    (function () {
        const S = 'cx-embedding'; if (!has(S)) return; let s = '';
        s += T(40, 22, '지면 p014 의 벡터와 카테고리 중심 둘. 지면과 각 중심 사이의 각도만 맞춰 그렸습니다', 'lbl sm');
        // 원점에서 지면 벡터는 10도에 두고, 두 중심은 같은 쪽으로 지면에서 68도와 77도에 둔다.
        // TF-IDF 벡터는 값이 모두 0 이상이라 어느 둘도 90도를 넘지 않는다. 두 중심 사이의 각도는 측정하지 않았다
        const ox = 92, oy = 250, len = 170, rad = d => d * Math.PI / 180;
        const at = (d, r) => [ox + r * Math.cos(rad(d)), oy - r * Math.sin(rad(d))];
        const ray = (id, d, cls) => {
            const [x, y] = at(d, len);
            return arrow(id, `M${ox},${oy} L${x.toFixed(1)},${y.toFixed(1)}`, cls, { svg: S });
        };
        const arc = (d0, d1, r) => {
            const [x0, y0] = at(d0, r), [x1, y1] = at(d1, r);
            return `<path class="cx-arc" d="M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 0 0 ${x1.toFixed(1)},${y1.toFixed(1)}"/>`;
        };
        s += arc(10, 78, 46) + arc(10, 87, 66);
        s += ray('cxe1', 78, 'a') + ray('cxe2', 87, 'a') + ray('cxe3', 10, 'k');
        s += T(136, 82, 'sports 중심', 'lbl k') + T(136, 96, '코사인 0.373, 68도', 'lbl');
        s += T(40, 48, 'style 중심', 'lbl k') + T(40, 62, '코사인 0.231, 77도', 'lbl');
        s += T(204, 206, '지면 p014', 'lbl k');
        // 오른쪽: 결과
        s += T(300, 52, '코사인은 방향이 같으면 1,', 'lbl sm');
        s += T(300, 66, '겹치는 낱말이 없으면 0 입니다', 'lbl sm');
        s += T(300, 92, '셋째 hobbies 는 0.192, 79도', 'lbl');
        s += T(300, 124, 'TF-IDF 50개', 'lbl k');
        [['맞힘', 34], ['틀림', 16], ['라벨 없음', 0]].forEach((r, i) => {
            const y = 132 + i * 16;
            s += T(300, y + 9, r[0], 'lbl');
            s += hbar(360, y, 100, r[1] / 50, 'a', 10);
            s += T(466, y + 9, `${r[1]}개`, 'lbl k');
        });
        s += T(300, 198, '사전이 비워 둔 10개 가운데 7개를 맞힙니다', 'lbl sm');
        s += T(300, 222, '자동차 지면 p031 은 health 0.203 이', 'lbl sm');
        s += T(300, 236, 'automotive 0.185 보다 큽니다. 코사인을', 'lbl sm');
        s += T(300, 250, '가장 많이 올린 낱말 넷이 모두 틀의 낱말입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 시스템 메시지와 JSON 라벨, thinking 을 켰을 때의 토큰 ----------
    (function () {
        const S = 'cx-llm'; if (!has(S)) return; let s = '';
        s += T(40, 22, '모든 요청에 같이 가는 시스템 메시지와 지면 한 개를 보냅니다', 'lbl sm');
        s += `<rect class="list" x="34" y="30" width="452" height="84"/>`;
        s += T(44, 46, '시스템 메시지 (줄여 적음)', 'lbl k');
        ['너는 지면 분류기다. 웹 지면의 제목과 첫 문단을 읽고 카테고리 하나를 고른다.',
            '제목과 첫 문단이 서로 다른 주제를 말하면 제목의 주제를 고른다.',
            'automotive: 자동차, 운전, 정비 부터 travel: 여행, 숙소, 항공 까지 10줄',
            '답은 {"label": "<카테고리>"} 꼴의 JSON 한 줄로만 쓴다.',
        ].forEach((t, i) => { s += line(44, 61 + i * 13, t, i === 1 ? 'list-t h' : 'list-t'); });
        s += `<rect class="grp" x="34" y="120" width="452" height="48"/>`;
        s += T(44, 136, '사용자 메시지 (p008, 헷갈리는 지면)', 'lbl k');
        s += line(44, 150, '제목: 여권 사진, 처음이라면 먼저 볼 것');
        s += line(44, 162, '첫 문단: 수영 대회, 10km 완주 이야기가 나오면 질문이 꼭 따라온다. 오늘은 인터벌 훈련 …');
        s += T(40, 189, 'thinking 끔', 'lbl k') + tag(116, 177, '{"label": "sports"}', 'b') + T(262, 190, '첫 문단을 따랐다', 'lbl sm');
        s += T(40, 213, 'thinking 켬', 'lbl k') + tag(116, 201, '{"label": "travel"}', 'b') + T(262, 214, '제목을 따랐다. 사람 라벨과 같다', 'lbl sm');
        s += T(40, 238, '헷갈리는 10개의 출력 토큰 합', 'lbl sm');
        [['thinking 끔', 61, '61'], ['thinking 켬', 6476, '6,476']].forEach((r, i) => {
            const y = 245 + i * 15;
            s += T(40, y + 9, r[0], 'lbl');
            s += hbar(116, y, 300, r[1] / 6476, 'b', 10);
            s += T(424, y + 9, r[2], 'lbl k');
        });
        s += T(40, 290, '켜면 10개 모두 제목을 따르고, 출력 토큰은 106배, 시간은 10.6초에서 488.2초로 46배입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
