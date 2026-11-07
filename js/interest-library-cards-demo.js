/**
 * interest-library-cards-demo.js — 관심사 사전 카드 다섯 장
 *
 * 검색 키워드 120개를 거르고, 묶고, 이름을 붙이고, 회원 수로 크기를 재서 관심사 사전을 만드는 자리를 카드 한 장씩으로 그린다.
 * 다섯 단계, 두 번 묻는 투표, 답이 다른 것만 보는 심판, 모델이 붙인 이름과 나누는 기준, 최소 크기와 최종 사전.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 코드와 정답과 코드가 정한 것, 벽돌색은 모델의 답과
 * 정답과 다른 자리, 회색은 두 답이 같은데 정답과 다른 키워드와 어림한 값이고, 점선은 다섯 단계의 이름이다.
 *
 * 숫자는 전부 interest-audience-library 글의 파이썬 출력에서 옮긴 값이다. 키워드, 주제, 하루 검색 수, 회원은 가상 값이고
 * scripts/gen-ads-data.py 가 만든다. 모델의 답은 data/llm-records/ 의 기록 셋이다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, tw, box, tag, tool, arrow, svg, hbar, dashChip } = window.CardKit;
    const has = id => !!document.getElementById(id);
    // 글자 폭에 맞춘 라벨을 왼쪽부터 이어 놓는다. 끝난 x 를 돌려준다
    const tags = (x, y, words, cls) => {
        let s = '';
        words.forEach(([w, c]) => { s += tag(x, y, w, c || cls); x += tw(w) + 14 + 6; });
        return [s, x];
    };

    // ---------- 1. 다섯 단계와 맡는 쪽 ----------
    (function () {
        const S = 'il-filter'; if (!has(S)) return; let s = '';
        s += T(40, 20, '키워드 120개가 사전이 되기까지 다섯 단계와 맡는 쪽', 'lbl sm');
        s += T(40, 42, '단계', 'lbl k') + T(170, 42, '맡는 쪽', 'lbl k') + T(300, 42, '들어가서 나오는 것', 'lbl k');
        // [단계, 맡는 쪽, 색, 들어가서 나오는 것]
        const rows = [
            ['1 거르기', '모델 투표 둘', 'b', '120개 → keep 같음 116, 다름 4'],
            ['2 심판', '모델 thinking 켬', 'b', '다른 4개 → 최종 남김 94개'],
            ['3 묶기', '모델', 'b', '94개 → 묶음 9개, 빠짐 4개'],
            ['4 나누기와 합치기', '코드', 'a', '절반 47개, 20명 기준 → 바뀜 0'],
            ['5 최소 크기', '코드, 회원 수', 'a', '오디언스 9개, 회원 1,706명'],
        ];
        rows.forEach(([name, who, cls, io], i) => {
            const y = 54 + i * 40;
            s += dashChip(40, y, name);
            s += tag(170, y + 2, who, cls);
            s += T(300, y + 15, io, 'lbl');
        });
        s += T(40, 268, '벽돌색은 모델이 답하는 단계, 파랑은 코드가 회원 수로 정하는 단계입니다', 'lbl');
        s += T(40, 288, '모델이 답하는 단계에서도 답을 읽고 정답과 비교하는 일은 코드가 합니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 두 번 묻는 투표 ----------
    (function () {
        const S = 'il-vote'; if (!has(S)) return; let s = '';
        s += T(40, 20, '같은 6묶음을 투표자 A(temperature 0)와 투표자 B(temperature 0.7)가 받았습니다', 'lbl sm');
        const u = 440 / 120;
        s += box(40, 30, 116 * u, 20, 'keep 이 같음 116개', 'a', 10);
        s += `<rect class="f-b" x="${40 + 116 * u}" y="30" width="${4 * u}" height="20"/>`;
        s += T(480, 64, 'keep 이 다름 4개', 'lbl b', 'end');
        s += T(40, 64, '같은 116개 가운데 지도, 달력은 reason_code 만 달라 투표자 A 의 것을 씁니다', 'lbl sm');
        s += T(40, 90, 'keep 이 다른 4개는 심판에게 갑니다', 'lbl k');
        // [키워드, 투표자 A, 투표자 B]
        const rows = [['마라토너', '남김', '거름'], ['새벽러닝', '남김', '거름'], ['번역기', '남김', '거름'], ['러닝크루', '거름', '남김']];
        rows.forEach(([w, a, b], i) => {
            const y = 98 + i * 24;
            s += tag(40, y, w, 'b');
            s += T(150, y + 13, `투표자 A ${a}`, 'lbl') + T(270, y + 13, `투표자 B ${b}`, 'lbl');
        });
        s += T(40, 214, '두 답이 같은데 정답과 다른 7개는 심판에게 가지 않습니다', 'lbl k');
        s += tags(40, 222, [['런솔'], ['운동화'], ['카페추천'], ['10km완주'], ['가계부앱'], ['쿠션팩트'], ['마라톤완주']], 'c')[0];
        s += T(40, 266, '런솔, 운동화는 둘 다 too_broad, 다섯은 둘 다 no_commercial_intent', 'lbl sm');
        s += T(40, 286, '두 투표자는 따로 보면 각각 111/120 이 맞았습니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 답이 다른 것만 보는 심판 ----------
    (function () {
        const S = 'il-referee'; if (!has(S)) return; let s = '';
        s += T(40, 20, '다른 4개만 같은 시스템 메시지로 thinking 을 켠 심판에게 한 번에 보냈습니다', 'lbl sm');
        ['마라토너', '새벽러닝', '번역기', '러닝크루'].forEach((w, i) => { s += tag(40, 34 + i * 26, w, 'b'); });
        s += tool(148, 60, 112, { label: '심판', sub: 'thinking 켬, 248.4초' });
        s += arrow('il-ref-in', 'M122,80 L144,80', 'k', { svg: S });
        s += arrow('il-ref-out', 'M264,80 L286,80', 'k', { svg: S });
        // [키워드, 심판의 답, 정답과 같은가]
        const res = [['마라토너', '남김', true], ['새벽러닝', '남김', true], ['번역기', '남김', false], ['러닝크루', '남김', true]];
        res.forEach(([w, d, ok], i) => {
            const y = 34 + i * 26;
            s += T(292, y + 13, `${w} ${d}`, 'lbl k') + T(490, y + 13, ok ? '정답과 같음' : '정답은 거름', ok ? 'lbl' : 'lbl b', 'end');
        });
        s += `<line class="split" x1="40" y1="148" x2="490" y2="148"/>`;
        s += T(40, 170, '걸린 시간', 'lbl k');
        s += T(40, 194, '투표와 심판', 'lbl') + hbar(150, 184, 270, 615.3 / 7452.8, 'a', 12) + T(490, 194, '615.3초', 'lbl k', 'end');
        s += T(40, 216, '심판만 120개, 어림', 'lbl') + hbar(150, 206, 270, 1, 'c', 12) + T(490, 216, '7,452.8초', 'lbl k', 'end');
        s += T(40, 242, '출력 토큰은 투표 12번 5,432, 심판 1번 3,792, 어림 113,760 입니다', 'lbl sm');
        s += T(40, 264, '최종 결정은 정답과 112/120 이 맞았고, 남긴 키워드는 94개입니다', 'lbl');
        s += T(40, 284, '어림은 심판의 키워드당 값 × 120 이고, 기록한 값이 아닙니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 모델이 붙인 이름과 나누는 기준 ----------
    (function () {
        const S = 'il-group'; if (!has(S)) return; let s = '';
        s += T(40, 20, '묶음마다 키워드 수와 정답 주제 순도. 세로선은 나누는 기준인 절반 47개입니다', 'lbl sm');
        // [이름, 키워드 수, 순도]
        const rows = [['running_gear', 33, '33/33'], ['travel_booking', 10, '10/10'], ['camping_outdoor', 9, '9/9'],
            ['baby_care', 8, '8/8'], ['gaming_hardware', 7, '7/7'], ['coffee_bakery', 7, '7/7'],
            ['finance_investment', 7, '7/7'], ['beauty_skincare', 6, '6/6'], ['office_supplies', 3, '1/3']];
        const x0 = 172, w = 200, cap = 50;          // 키워드 50개가 막대 끝이다
        rows.forEach(([name, n, pure], i) => {
            const y = 34 + i * 23;
            const mixed = pure !== `${n}/${n}`;
            s += T(40, y + 12, name, mixed ? 'lbl b' : 'lbl k');
            s += hbar(x0, y + 2, w, n / cap, mixed ? 'b' : 'a', 12);
            s += T(490, y + 12, `${n}개, 순도 ${pure}`, mixed ? 'lbl b' : 'lbl', 'end');
        });
        const xt = x0 + w * 47 / cap;
        s += `<line class="tick" x1="${xt}" y1="32" x2="${xt}" y2="${34 + rows.length * 23}"/>`;
        s += T(xt, 256, '절반 47개', 'lbl k', 'middle');
        s += T(40, 276, '가장 큰 running_gear 33개도 47개를 넘지 않아 코드가 나누지 않았습니다', 'lbl');
        s += T(40, 294, '빠진 키워드 4개: 스포츠선글라스, 보드게임, 무릎보호대, 스포츠워치', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 5. 최소 크기와 최종 사전 ----------
    (function () {
        const S = 'il-size'; if (!has(S)) return; let s = '';
        s += T(40, 20, '묶음마다 회원 수(2,000명 가운데)와 1,400만 명으로 늘린 수', 'lbl sm');
        // [이름, 회원 수, 1,400만 명이면]
        const rows = [['office_supplies', 795, '5,565,000'], ['coffee_bakery', 612, '4,284,000'], ['travel_booking', 489, '3,423,000'],
            ['camping_outdoor', 384, '2,688,000'], ['running_gear', 271, '1,897,000'], ['finance_investment', 246, '1,722,000'],
            ['beauty_skincare', 235, '1,645,000'], ['gaming_hardware', 206, '1,442,000'], ['baby_care', 158, '1,106,000']];
        const x0 = 172, w = 200, cap = 800;         // 회원 800명이 막대 끝이다
        rows.forEach(([name, n, big], i) => {
            const y = 34 + i * 23;
            const odd = name === 'office_supplies';
            s += T(40, y + 12, name, odd ? 'lbl b' : 'lbl k');
            s += hbar(x0, y + 2, w, n / cap, odd ? 'b' : 'a', 12);
            s += T(490, y + 12, `${n}명, ${big}명`, odd ? 'lbl b' : 'lbl', 'end');
        });
        const xt = x0 + w * 20 / cap;
        s += `<line class="tick" x1="${xt}" y1="32" x2="${xt}" y2="${34 + rows.length * 23}"/>`;
        s += T(xt, 256, '최소 20명, 1,400만 명이면 14만 명', 'lbl k');
        s += T(40, 276, 'office_supplies 795명 가운데 713명은 noise 인 번역기를 검색한 회원입니다', 'lbl');
        s += T(40, 294, 'baby_care 를 합친다면 회원이 가장 많이 겹치는 office_supplies(62명)로 갑니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
