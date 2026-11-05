/**
 * tool-loop-cards-demo.js — Tool use 카드 네 장
 *
 * 도구 셋을 정의하고, 가짜 LLM 이 고른 호출을 코드가 실행해 결과를 다시 넣는 한 바퀴,
 * 멈춤 조건 셋, 코드에 둔 가드레일을 카드 한 장씩으로 그린다.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 코드가 하는 일, 벽돌색은 모델이 고른 것,
 * 먹색은 도구와 캠페인, 회색은 거부되거나 멈춘 것이고, 점선 상자는 가상 값(캠페인 셋)이다.
 *
 * 숫자(ROAS 280, 360, 160, 입찰가 20000, 18000, 14000, 16000, 11200, 단계 4, 5, 6, 호출 5, 6, 8)는
 * tool-use-agent-loop 글의 파이썬 블록 셋이 찍은 출력에서 옮겼다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, tag, list, arrow, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);

    // ---------- 1. 도구 셋의 정의 ----------
    (function () {
        const S = 'tl-tools'; if (!has(S)) return; let s = '';
        s += box(40, 12, 140, 30, 'get_campaigns()', 'k', 10);
        s += box(190, 12, 140, 30, 'get_stats(campaign_id)', 'k', 10);
        s += box(340, 12, 146, 30, 'set_bid(campaign_id, new_bid)', 'k', 9.5);
        s += T(40, 62, '도구마다 name, description, input_schema 를 적는다', 'lbl sm');
        s += list(40, 74, 446, 64, [
            { t: '캠페인 셋, 가상 데이터', cls: 'h' },
            'c1 running_shoes: cpa 20000원, 목표 ROAS 400%',
            'c2 travel_agency: cpa 50000원, 목표 ROAS 300%',
            'c3 cafe: cpc 300원, 목표 없음',
        ]);
        s += T(40, 164, '어제 ROAS (get_stats 결과)', 'lbl k');
        const rows = [['c1', 280, 400, 'b'], ['c2', 360, 300, 'a'], ['c3', 160, null, 'c']];
        rows.forEach(([id, r, t, c], i) => {
            const y = 174 + i * 24;
            s += T(40, y + 11, id, 'lbl sm') + hbar(70, y, 200, r / 500, c, 13) + T(278, y + 11, r + '%', 'lbl sm');
            s += T(320, y + 11, t ? '목표 ' + t + '%' : '목표 없음', 'lbl sm');
        });
        s += T(40, 268, '목표보다 낮은 캠페인은 c1 하나입니다', 'lbl');
        s += T(40, 288, 'set_bid 설명에는 「한 번에 20% 넘으면 거부」를 적었습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 한 바퀴 ----------
    (function () {
        const S = 'tl-loop'; if (!has(S)) return; let s = '';
        s += box(40, 14, 150, 34, 'LLM 이 다음 도구를 고름', 'b', 10);
        s += box(330, 14, 156, 34, '코드가 run_tool 로 실행', 'a', 10);
        s += arrow('tlp0', 'M190,25 L326,25', 'b', { svg: S });
        s += T(206, 20, 'tool_use 블록', 'lbl sm');
        s += arrow('tlp1', 'M330,40 L194,40', 'a', { svg: S });
        s += T(206, 58, 'tool_result 블록', 'lbl sm');
        const steps = [
            ['1', 'get_campaigns', 'c1, c2, c3'],
            ['2', 'get_stats 3개', 'ROAS 280, 360, 160'],
            ['3', 'set_bid c1 18000', '20000 → 18000'],
            ['4', 'end_turn', 'text 로 끝냄'],
        ];
        steps.forEach(([n, call, res], i) => {
            const y = 82 + i * 34;
            s += T(40, y + 13, 'step ' + n, 'lbl sm');
            s += box(92, y, 170, 20, call, 'b', 9.5);
            s += box(280, y, 170, 20, res, i === 3 ? 'k' : 'a', 9.5);
        });
        s += T(40, 236, '도구 호출 5번, 단계 4, 메시지 8개', 'lbl k');
        s += T(40, 258, '2단계는 한 응답에 tool_use 블록 셋을 담았습니다', 'lbl sm');
        s += T(40, 278, '진짜 모델은 이 자리에서 대화를 읽고 스스로 고릅니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 멈춤 조건 셋 ----------
    (function () {
        const S = 'tl-stop'; if (!has(S)) return; let s = '';
        s += T(40, 20, '멈춘 단계 (단계 상한 6)', 'lbl k');
        const rows = [
            ['end_turn', '첫 과제, 모델이 끝냄', 4, 'b'],
            ['repeat', '둘째 과제, 같은 get_stats', 5, 'a'],
            ['max_steps', '반복 검사를 끈 둘째 과제', 6, 'a'],
        ];
        rows.forEach(([k, t, n, c], i) => {
            const y = 36 + i * 46;
            s += T(40, y + 10, k, 'lbl') + T(130, y + 10, t, 'lbl sm');
            s += hbar(40, y + 18, 360, n / 6, c, 13) + T(408, y + 29, n + '단계', 'lbl sm');
        });
        s += T(40, 186, '둘째 과제는 목표에 닿을 수 없습니다', 'lbl');
        s += T(40, 208, '통계는 어제 값이라 다시 물어도 ROAS 280 그대로입니다', 'lbl sm');
        s += T(40, 236, 'repeat: 호출 6번, 거부 1번, c1 16000원', 'lbl sm');
        s += T(40, 256, 'max_steps: 호출 8번, 거부 2번, c1 16000원', 'lbl sm');
        s += T(40, 280, '단계 상한은 어떤 루프든 끝내는 마지막 방어선입니다', 'lbl k');
        svg(S, s);
    })();

    // ---------- 4. 가드레일은 코드 ----------
    (function () {
        const S = 'tl-guard'; if (!has(S)) return; let s = '';
        s += tag(40, 10, 'set_bid c1 14000 (-30%)', 'b');
        s += arrow('tlg0', 'M60,30 L60,50', 'c', { svg: S });
        s += box(40, 54, 446, 26, 'tool_result is_error: change_too_large, max_change_pct 20', 'c', 10);
        s += T(40, 100, '예외가 아니라 결과라서 모델이 읽고 다시 고릅니다', 'lbl sm');
        s += tag(40, 112, 'set_bid c1 16000 (-20%)', 'b');
        s += arrow('tlg1', 'M60,132 L60,152', 'a', { svg: S });
        s += box(40, 156, 446, 26, 'tool_result: old_bid 20000, new_bid 16000', 'a', 10);
        s += T(40, 208, '막은 것은 run_tool 의 비교 한 줄입니다', 'lbl k');
        s += T(40, 230, 'abs(new - old) / old 가 0.20 을 넘으면 바꾸지 않는다', 'lbl sm');
        s += T(40, 256, '한 번의 상한은 쌓이는 인하를 막지 못합니다', 'lbl sm');
        s += T(40, 276, '실제로는 하루 누적 한도나 사람 확인을 함께 둡니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
