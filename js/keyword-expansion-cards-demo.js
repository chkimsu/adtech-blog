/**
 * keyword-expansion-cards-demo.js — 키워드 확장 전략 카드 네 장
 *
 * 서연 씨 러닝화의 상품 설명 하나와 키워드 120개로 전략 일곱의 키워드를 고르는 자리를 카드 한 장씩으로 그린다.
 * 전략 일곱과 사전 속 정답의 예, 한 번에 부르기와 전략마다 부르기, 전략 사이의 겹침, 정책 거르기와 겹침 빼기.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 사전과 정답과 코드가 남긴 키워드, 벽돌색은 모델이 고른
 * 키워드와 그 답, 회색은 코드가 뺀 키워드(겹침, health, noise)이고, 점선은 시스템 메시지에 적어 둔 정의다.
 *
 * 숫자는 전부 keyword-expansion-strategies 글의 파이썬 출력에서 옮긴 값이다. 키워드, 정답 전략, 하루 검색 수는 가상 값이고
 * scripts/gen-ads-data.py 가 만든다. 모델의 답은 data/llm-records/ 의 기록 둘이다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, tw, box, tag, arrow, svg, hbar, dashChip } = window.CardKit;
    const has = id => !!document.getElementById(id);
    // 글자 폭에 맞춘 라벨을 왼쪽부터 이어 놓는다. 끝난 x 를 돌려준다
    const tags = (x, y, words, cls) => {
        let s = '';
        words.forEach(([w, c]) => { s += tag(x, y, w, c || cls); x += tw(w) + 14 + 6; });
        return [s, x];
    };

    // ---------- 1. 전략 일곱과 사전 속 정답의 예 ----------
    (function () {
        const S = 'ke-strategies'; if (!has(S)) return; let s = '';
        s += T(40, 20, '시스템 메시지에 적은 전략 일곱과, 사전에서 정답이 그 전략인 키워드의 예', 'lbl sm');
        s += T(40, 42, '전략', 'lbl k') + T(150, 42, '사전 속 정답의 예', 'lbl k') + T(490, 42, '정답 수', 'lbl k', 'end');
        const rows = [
            ['direct', [['러닝화'], ['런닝화'], ['조깅화']], 7],
            ['category', [['운동화'], ['워킹화'], ['트레일러닝화']], 6],
            ['co_purchase', [['러닝양말'], ['러닝벨트'], ['스포츠워치']], 6],
            ['problem_goal', [['무릎보호대'], ['10km완주'], ['무릎통증', 'c']], 10],
            ['persona', [['초보러너'], ['주말러너'], ['러닝크루']], 5],
            ['brand', [['런솔'], ['모노웍스러닝화'], ['숲결러닝화']], 4],
            ['product_line', [['쿠션러닝화'], ['와이드러닝화'], ['카본러닝화']], 6],
        ];
        rows.forEach(([name, words, n], i) => {
            const y = 52 + i * 28;
            s += dashChip(40, y, name);
            s += tags(150, y + 2, words, 'a')[0];
            s += T(490, y + 15, `${n}개`, 'lbl k', 'end');
        });
        s += T(40, 266, '정답이 있는 키워드는 44개입니다. 러닝 키워드 40개와 health 키워드 4개입니다', 'lbl');
        s += T(40, 286, '회색 무릎통증처럼 problem_goal 의 정답에 든 health 넷은 정책 거르기에서 코드가 뺍니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 한 번에 일곱과 전략마다 한 번씩 ----------
    (function () {
        const S = 'ke-one'; if (!has(S)) return; let s = '';
        s += T(40, 20, '같은 정의 일곱으로 한 번에 물을 때와 전략마다 따로 물을 때, 네 설정의 답', 'lbl sm');
        // [이름, 호출 수, 초, 출력 토큰, 맞음 합, 서로 다른 키워드 수]
        const rows = [
            ['한 번에, thinking 끔', 1, '34.3', '381', 27, 38],
            ['한 번에, thinking 켬', 1, '334.2', '4,691', 13, 17],
            ['전략마다, thinking 끔', 7, '52.9', '477', 30, 34],
            ['전략마다, thinking 켬', 7, '1,980.5', '30,020', 29, 30],
        ];
        rows.forEach(([name, calls, sec, out, hit, uniq], i) => {
            const y = 34 + i * 58;
            s += T(40, y + 12, name, 'lbl k') + T(490, y + 12, `호출 ${calls}번, ${sec}초, 출력 ${out} 토큰`, 'lbl', 'end');
            s += T(40, y + 31, '맞음 합', 'lbl sm') + hbar(104, y + 22, 240, hit / 44, 'b', 12) + T(352, y + 32, `${hit}/44`, 'lbl k');
            s += T(40, y + 48, '키워드', 'lbl sm') + hbar(104, y + 39, 240, uniq / 60, 'b', 12) + T(352, y + 49, `${uniq}개`, 'lbl k');
        });
        s += T(40, 286, '맞음 합은 따로 부른 30/44 가 가장 많고, 켠 일곱 번은 1,980.5초가 걸렸습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 전략 사이에 겹친 id ----------
    (function () {
        const S = 'ke-overlap'; if (!has(S)) return; let s = '';
        s += T(40, 20, '전략마다 따로, thinking 을 끈 답에서 두 전략 이상이 고른 id 14개', 'lbl sm');
        s += T(40, 44, 'direct 와 category, 7개', 'lbl k');
        s += tags(40, 52, [['러닝화'], ['조깅화'], ['런닝화'], ['트레일러닝화'], ['런닝슈즈'], ['러닝슈즈'], ['달리기신발']], 'b')[0];
        s += T(40, 94, 'category 와 product_line, 4개', 'lbl k');
        s += tags(40, 102, [['데일리러닝화'], ['경량러닝화'], ['와이드러닝화'], ['쿠션러닝화']], 'b')[0];
        s += T(40, 144, '세 전략에 든 id, 2개', 'lbl k') + T(300, 144, 'direct 와 brand, 1개', 'lbl k');
        s += tags(40, 152, [['런솔러닝화'], ['입문용러닝화']], 'b')[0] + tags(300, 152, [['런솔']], 'b')[0];
        s += T(40, 188, '런솔러닝화는 direct, category, brand, 입문용러닝화는 direct, category, product_line 입니다', 'lbl sm');
        s += `<line class="split" x1="40" y1="202" x2="490" y2="202"/>`;
        s += T(40, 224, '다른 설정의 겹친 id', 'lbl k');
        s += T(40, 244, '한 번에, thinking 끔: 2개. 런솔, 런솔러닝화가 direct 와 brand 에', 'lbl');
        s += T(40, 262, '한 번에, thinking 켬: 0개', 'lbl');
        s += T(40, 280, '전략마다, thinking 켬: 5개. 런솔, 런솔러닝화, 러닝화, 입문용러닝화, 쿠션러닝화', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 겹침을 하나로 남기고 health 와 noise 를 뺀다 ----------
    (function () {
        const S = 'ke-filter'; if (!has(S)) return; let s = '';
        s += T(40, 20, '막대 한 칸이 고른 id 하나입니다. 파랑만 최종 목록에 남습니다', 'lbl sm');
        // [이름, 고른 id, 겹침, health, 최종, 하루 검색 수 합]
        const rows = [
            ['한 번에, thinking 끔', 40, 2, 4, 34, '208,900'],
            ['한 번에, thinking 켬', 17, 0, 2, 15, '82,000'],
            ['전략마다, thinking 끔', 50, 16, 4, 30, '202,300'],
            ['전략마다, thinking 켬', 36, 6, 4, 26, '206,900'],
        ];
        const u = 8;
        rows.forEach(([name, total, dup, health, final, daily], i) => {
            const y = 34 + i * 56;
            s += T(40, y + 12, name, 'lbl k') + T(490, y + 12, `최종 ${final}개, 하루 검색 수 합 ${daily}`, 'lbl', 'end');
            s += box(40, y + 20, final * u, 16, `최종 ${final}`, 'a', 10);
            s += `<rect class="f-c" x="${40 + final * u}" y="${y + 20}" width="${health * u}" height="16"/>`;
            if (dup) s += `<rect class="track" x="${40 + (final + health) * u}" y="${y + 20}" width="${dup * u}" height="16"/>`;
            s += T(40, y + 50, `고른 id ${total} → 겹침 ${dup} 빼고 ${total - dup} → health ${health} 빼고 ${final}`, 'lbl sm');
        });
        s += T(40, 270, '파랑은 최종 목록, 회색은 health 로 빠진 id, 빈 칸은 겹쳐서 빠진 id 입니다', 'lbl sm');
        s += T(40, 288, 'noise 는 네 설정 모두 0개라 no_commercial_intent 로 빠진 id 가 없습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
