/**
 * prompting-cards-demo.js — 프롬프트 카드 네 장
 *
 * 같은 문제 20개를 세 벌의 프롬프트로 물은 기록을 카드 한 장씩으로 그린다. 시스템 메시지의 자리와 바꾼 세 자리,
 * 예시 셋이 들어간 시스템 메시지와 입력 토큰, 단계를 먼저 쓴 답과 문제만 보낸 답, 세 벌의 맞힘과 토큰과 시간.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 plain, 먹색은 fewshot 과 모델,
 * 벽돌색은 steps 다. 회색은 틀린 답이고, 점선 상자는 가상 값(문제와 예시)이다.
 *
 * 맞힘, 토큰, 시간, 배수, 단계 수는 prompting-chain-of-thought 글의 파이썬 블록 셋이 찍은 출력에서 옮겼다
 * (기록 data/llm-records/prompting-chain-of-thought-{plain,fewshot,steps}.json). 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, tag, srv, list, arrow, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);

    // ---------- 1. 시스템 메시지의 자리와 세 자리 ----------
    (function () {
        const S = 'pc-system'; if (!has(S)) return; let s = '';
        s += T(40, 22, '요청 한 건에는 메시지 둘이 들어갑니다. 바꾼 것은 시스템 메시지뿐입니다', 'lbl sm');
        s += `<rect class="grp" x="30" y="32" width="300" height="150"/>`;
        s += T(42, 52, '시스템 메시지, 할 일 설명', 'lbl k');
        s += tag(42, 60, '① 할 일 설명', 'a') + tag(138, 60, '② 예시', 'k') + tag(206, 60, '③ 지시 한 줄', 'b');
        s += T(42, 100, '①: 정수 답 하나를 JSON 으로만 답한다', 'lbl sm');
        s += T(42, 116, '②: 20개 밖의 문제 셋과 답 300, 80, 2000', 'lbl sm');
        s += T(42, 132, '③: steps 를 먼저 적고(최대 5개) answer', 'lbl sm');
        s += T(42, 160, '사용자 메시지', 'lbl k') + T(130, 160, '「문제: 」 + 문제 한 줄, 세 벌 모두 같음', 'lbl sm');
        s += arrow('pcs0', 'M334,108 L390,108', 'k', { svg: S });
        s += srv(400, 80, { label: 'qwen3.5:27b', cls: 'k' });
        s += T(40, 206, '세 벌이 쓰는 자리', 'lbl k');
        const rows = [['plain', 'a', '① 만'], ['fewshot', 'k', '① + ②'], ['steps', 'b', '③ 이 ① 을 대신함']];
        rows.forEach(([name, cls, text], i) => {
            const y = 216 + i * 24;
            s += tag(40, y, name, cls) + T(130, y + 13, text, 'lbl');
        });
        s += T(300, 230, 'thinking 끔', 'lbl sm') + T(300, 246, 'temperature 0, seed 7', 'lbl sm') + T(300, 262, '문제마다 한 번씩', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 예시 셋과 입력 토큰 ----------
    (function () {
        const S = 'pc-fewshot'; if (!has(S)) return; let s = '';
        s += list(40, 12, 446, 92, [
            { t: 'fewshot 의 시스템 메시지', cls: 'h' },
            'plain 의 두 문장, 그다음 「예시 셋:」',
            '문제: 광고비 450,000원으로 클릭 1,500건… → {"answer": 300}',
            '문제: 노출 400,000건에서 클릭률 0.5%, 전환율 4%… → {"answer": 80}',
            '문제: 하루 예산 200만 원 중 40%를 저녁에… → {"answer": 2000}',
        ]);
        s += T(40, 130, '입력 토큰 합, 20개', 'lbl k');
        s += T(40, 150, 'plain', 'lbl') + hbar(110, 140, 280, 1671 / 4451, 'a', 12) + T(398, 150, '1,671개', 'lbl k');
        s += T(40, 170, 'fewshot', 'lbl') + hbar(110, 160, 280, 1, 'k', 12) + T(398, 170, '4,451개', 'lbl k');
        s += T(40, 192, '예시 셋이 문제마다 입력 토큰 139개, 20개에서 2,780개를 더했습니다', 'lbl sm');
        s += T(40, 218, '맞힘', 'lbl k');
        s += tag(40, 226, 'plain 14개', 'a') + tag(130, 226, 'fewshot 13개', 'k');
        s += T(40, 266, '출력 토큰 합은 두 벌 모두 163개, 시간 합은 22.7초에서 29.8초', 'lbl');
        s += T(40, 286, 'p16 은 plain 이 맞힌 144 가 3 으로 바뀌었습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 단계를 먼저 쓴 답 ----------
    (function () {
        const S = 'pc-cot'; if (!has(S)) return; let s = '';
        s += T(40, 22, 'p12: 노출 384,000건, 클릭률 0.75%, 클릭당 비용 320원, 정답 921,600', 'lbl sm');
        s += `<rect class="grp" x="30" y="32" width="460" height="52"/>`;
        s += tag(42, 40, 'plain', 'a') + T(110, 53, '{"answer": 9216}', 'lbl k');
        s += tag(42, 60, '틀림', 'c') + T(110, 73, '출력 토큰 9개, 풀이 없이 답 한 줄', 'lbl sm');
        s += `<rect class="grp" x="30" y="92" width="460" height="132"/>`;
        s += tag(42, 100, 'steps', 'b') + T(110, 113, '{"steps": [', 'lbl k');
        s += T(122, 131, '"Calculate clicks by multiplying impressions', 'lbl sm');
        s += T(122, 145, ' 384000 by click-through rate 0.0075",', 'lbl sm');
        s += T(122, 163, '"Calculate total cost by multiplying clicks', 'lbl sm');
        s += T(122, 177, ' by cost per click 320"],', 'lbl sm');
        s += T(110, 195, '"answer": 921600}', 'lbl k');
        s += box(42, 200, 46, 18, '맞음', 'b', 9.5) + T(110, 213, '출력 토큰 64개, 단계 둘이 답 앞에 옴', 'lbl sm');
        s += T(40, 248, 'steps 20개의 단계는 2개에서 5개, 평균 3.00개였습니다', 'lbl');
        s += T(40, 268, '출력 토큰은 문제마다 33개에서 131개였습니다', 'lbl sm');
        s += T(40, 286, '단계는 답 안의 글이라 thinking 과 다른 자리입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 세 벌의 맞힘, 출력 토큰, 시간 ----------
    (function () {
        const S = 'pc-result'; if (!has(S)) return; let s = '';
        const V = [['plain', 'a', 14, 4, 163, 22.7], ['fewshot', 'k', 13, 3, 163, 29.8], ['steps', 'b', 17, 7, 1223, 95.6]];
        const group = (y, title, idx, max, fmt) => {
            let g = T(40, y, title, 'lbl k');
            V.forEach((v, i) => {
                const yy = y + 8 + i * 18;
                g += T(40, yy + 10, v[0], 'lbl') + hbar(110, yy, 280, v[idx] / max, v[1], 12) + T(398, yy + 10, fmt(v[idx]), 'lbl k');
            });
            return g;
        };
        s += group(22, '맞힘, 20개 중', 2, 20, n => `${n}개`);
        s += group(98, 'hard 10개 중 맞힘', 3, 10, n => `${n}개`);
        s += group(174, '출력 토큰 합', 4, 1223, n => `${n.toLocaleString('en-US')}개`);
        s += T(40, 254, '시간 합은 22.7초, 29.8초, 95.6초입니다. steps 는 plain 의 4.2배입니다', 'lbl');
        s += T(40, 274, 'steps 가 더 맞힌 3개에 출력 토큰 1,060개를 더 썼습니다. 하나에 353개입니다', 'lbl sm');
        s += T(40, 292, 'easy 10개는 세 벌 모두 맞혔습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
