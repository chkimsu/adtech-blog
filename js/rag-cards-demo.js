/**
 * rag-cards-demo.js — RAG 카드 네 장
 *
 * 상품 문서를 조각내고, 질문과 가까운 조각 셋을 찾고, 조각을 넣어 답하게 한 뒤 답과 조각을 대조하기까지를
 * 카드 한 장씩으로 그린다.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 코드가 하는 일, 벽돌색은 질문과 모델의 답,
 * 먹색은 문서와 조각, 회색은 검색이 놓친 것이고, 점선 상자는 가상 값(상품 문서)이다.
 *
 * 숫자(문서 100건, 문장 348개, 조각 200개, 코사인, Context Recall 과 Precision, 토큰, 맞힌 수)는
 * rag-basics 글의 파이썬 블록 셋이 찍은 출력과 USAGE 에서 옮겼다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, tag, list, arrow, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);

    // ---------- 1. 문서가 조각 둘이 된다 ----------
    (function () {
        const S = 'rg-chunk'; if (!has(S)) return; let s = '';
        s += list(40, 12, 446, 78, [
            { t: '문서 d002, 가상 데이터', cls: 'h' },
            '상품 별랩 슬림 블랙 헤드폰 FL159 의 분류는 음향 이다.',
            'FL159 의 색은 black 이고, 소재는 plastic 이다.',
            'FL159 의 무게는 120g 이고, 가격은 356300원이다.',
            'FL159 의 포장에는 설명서가 들어 있다.',
        ]);
        s += arrow('rgc0', 'M60,96 L60,118', 'a', { svg: S });
        s += T(80, 112, '문장 두 개씩 묶어 조각을 만들고 조각마다 벡터를 붙인다', 'lbl sm');
        s += box(40, 124, 210, 40, '조각 1: 이름, 분류, 색, 소재', 'k', 10);
        s += box(270, 124, 216, 40, '조각 2: 무게, 가격, 포장', 'k', 10);
        s += T(40, 186, '두 조각 모두 앞에 문서 id [d002] 를 단다', 'lbl');
        s += T(40, 212, '문서 100건, 문장 348개, 조각 200개', 'lbl k');
        s += T(40, 236, '세 문장 문서 52건은 둘째 조각이 한 문장입니다', 'lbl sm');
        s += T(40, 260, '벡터는 임베딩 편의 장난감 embed 그대로입니다', 'lbl sm');
        s += T(40, 280, '모델 번호가 모든 문장에 들어 있어 두 조각 다 번호로 찾힙니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 질문과 가까운 조각 셋 ----------
    (function () {
        const S = 'rg-retrieve'; if (!has(S)) return; let s = '';
        s += tag(40, 10, 'q01 HH820 의 가격은 몇 원인가?', 'b');
        const hit = [[0.430, '[d068] 무게, 가격 조각', 'a'], [0.377, '[d068] 이름, 색, 소재 조각', 'a'], [0.294, '[d011] 다른 상품', 'c']];
        hit.forEach(([v, t, c], i) => {
            const y = 38 + i * 22;
            s += hbar(40, y, 150, v, c, 13) + T(196, y + 11, v.toFixed(3), 'lbl sm') + T(240, y + 11, t, 'lbl sm');
        });
        s += tag(40, 112, 'q05 윤라이프 캐리어의 무게는 몇 g 인가?', 'b');
        const miss = [[0.308, '[d050] 다른 상품'], [0.300, '[d011] 다른 상품'], [0.300, '[d042] 다른 상품']];
        miss.forEach(([v, t], i) => {
            const y = 140 + i * 22;
            s += hbar(40, y, 150, v, 'c', 13) + T(196, y + 11, v.toFixed(3), 'lbl sm') + T(240, y + 11, t, 'lbl sm');
        });
        s += T(40, 226, '정답 문서 d077 은 상위 3 에 없습니다', 'lbl');
        s += T(40, 252, '상위 3: Context Recall 15/20 = 0.75', 'lbl k');
        s += T(40, 274, 'Context Precision 0.47 (상위 1 은 0.75, 상위 5 는 0.29)', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 조각 셋을 넣은 프롬프트 ----------
    (function () {
        const S = 'rg-prompt'; if (!has(S)) return; let s = '';
        s += list(40, 10, 446, 64, [
            { t: '시스템 메시지', cls: 'h' },
            '문서 조각에 적힌 값만으로 답한다. JSON 한 줄로만 쓴다.',
            'value 는 숫자나 영어 낱말. 답이 없으면 not_found.',
            '{"value": "<값>", "doc_ids": ["<문서 id>"]}',
        ]);
        s += list(40, 82, 446, 78, [
            { t: '사용자 메시지, 검색 상위 3 과 질문', cls: 'h' },
            '[d068] HH820 의 무게는 170g 이고, 가격은 85000원이다. …',
            '[d068] 상품 하이라이프 방수 그레이 모자 HH820 의 …',
            '[d011] KH996 의 무게는 460g 이고, 가격은 141600원이다.',
            '질문: HH820 의 가격은 몇 원인가?',
        ]);
        s += arrow('rgp0', 'M60,166 L60,188', 'b', { svg: S });
        s += box(80, 182, 300, 26, '{"value": "85000", "doc_ids": ["d068"]}', 'b', 10);
        s += T(40, 236, 'qwen3.5:27b, thinking 끔, temperature 0', 'lbl k');
        s += T(40, 258, '입력 262~304 토큰, 출력 13~21 토큰', 'lbl sm');
        s += T(40, 278, '20개를 받는 데 모두 44.2초가 걸렸습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 답과 조각의 대조 ----------
    (function () {
        const S = 'rg-grounding'; if (!has(S)) return; let s = '';
        s += T(40, 20, '검색 품질', 'lbl k') + T(280, 20, '답 품질', 'lbl k');
        s += T(40, 44, 'Context Recall', 'lbl sm') + hbar(40, 50, 180, 0.75, 'a', 13) + T(226, 61, '15/20', 'lbl sm');
        s += T(40, 86, 'Context Precision', 'lbl sm') + hbar(40, 92, 180, 0.47, 'a', 13) + T(226, 103, '0.47', 'lbl sm');
        const rows = [
            ['찾은 15개, 정답과 같은 값', 15, 15],
            ['근거 대조 통과', 15, 15],
            ['근거 없는 답', 0, 15],
            ['놓친 5개, not_found', 5, 5],
        ];
        rows.forEach(([t, n, d], i) => {
            const y = 34 + i * 30;
            s += T(280, y + 6, t, 'lbl sm') + hbar(280, y + 12, 160, n / d, 'b', 11) + T(446, y + 22, n + '/' + d, 'lbl sm');
        });
        s += T(40, 176, 'grounded: doc_ids 가 가리킨 조각에 value 가 있으면 참', 'lbl');
        s += T(40, 200, '손으로 만든 답 99999 는 거짓, 다른 id 를 적은 답도 거짓', 'lbl sm');
        s += T(40, 232, '읽지 못한 답 0개, 맞힌 답 20/20', 'lbl k');
        s += T(40, 256, 'Recall 0.75 는 검색 값이고, 20/20 은 답의 값입니다', 'lbl sm');
        s += T(40, 276, '놓친 5개는 not_found 가 맞는 답으로 셉니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
