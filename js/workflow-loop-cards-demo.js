/**
 * workflow-loop-cards-demo.js — 워크플로와 자율 루프 카드 네 장
 *
 * 같은 입찰가 일을 자율 루프와 워크플로로 10번씩 돌린 결과를 카드 한 장씩으로 그린다.
 * 두 방식, 호출 수와 시간, 10번의 결과, 오케스트레이터와 작업 상태.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 코드가 정한 일, 벽돌색은 모델이 고른 것,
 * 먹색은 서버와 에이전트, 회색은 막힌 호출과 멈춘 run 이고, 점선 상자는 가상 값과 승인 기록이다.
 *
 * 숫자와 이름(LLM 호출 3, 4, 5 와 1, 단계 4, run 마다의 ms, 중앙값 7236.5 와 1712.5, 최종 입찰가 20000, 17000, 19000, 18000,
 * 멈춤 end_turn 3 과 repeat 7, rules 의 c1 상한 20000, tgt-1, cpy-1, tgt-2, segment 317, -32004)은
 * workflow-vs-autonomous-loop 글의 파이썬 블록 셋이 찍은 출력에서 옮겼다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, list, arrow, svg } = window.CardKit;
    const has = id => !!document.getElementById(id);
    // 블록 2 의 출력. run 1~10 의 시간(ms), 최종 c1 입찰가, 멈춘 까닭
    const LOOP_MS = [13983, 6967, 6888, 7722, 5442, 10068, 7506, 15857, 4917, 5240];
    const FLOW_MS = [5201, 5494, 1722, 1566, 1703, 1648, 1725, 1891, 1624, 1607];
    const LOOP_C1 = [20000, 17000, 19000, 17000, 20000, 20000, 19000, 17000, 20000, 20000];
    const LOOP_STOP = ['end', 'repeat', 'repeat', 'end', 'repeat', 'repeat', 'end', 'repeat', 'repeat', 'repeat'];

    // ---------- 1. 두 방식 ----------
    (function () {
        const S = 'wl-two_ways'; if (!has(S)) return; let s = '';
        s += T(40, 18, '자율 루프', 'lbl k') + T(290, 18, '워크플로', 'lbl k');
        s += '<line class="split" x1="270" y1="6" x2="270" y2="182"/>';
        s += box(40, 30, 196, 26, 'LLM 이 다음 행동을 뽑음', 'b', 10);
        s += arrow('wl-w-down', 'M138,58 L138,86', 'b', { svg: S });
        s += box(40, 90, 196, 26, 'host_call → approve → 서버', 'a', 10);
        s += arrow('wl-w-back', 'M238,103 C258,103 258,43 240,43', 'a', { svg: S });
        s += T(40, 136, '단계마다 LLM 1번, 확률표로 고름', 'lbl sm');
        s += T(40, 154, '폭: 5, 10, 15, 25, 30% 가운데 뽑음', 'lbl sm');
        s += T(40, 172, '멈춤: end_turn, 단계 상한 6, 같은 호출 반복', 'lbl sm');
        // [차례, 하는 일, 상자 색]
        const steps = [['1', 'get_campaigns', 'a'], ['2', 'get_stats c1, c2, c3', 'a'], ['3', 'set_bid 목표 아래 -10%', 'a'], ['4', 'LLM 요약 한 번', 'b']];
        steps.forEach(([n, job, c], i) => {
            const y = 30 + i * 30;
            s += T(290, y + 15, n, 'lbl k');
            s += box(304, y, 182, 22, job, c, 10);
        });
        s += T(290, 154, '순서는 코드가 정하고 난수는 없음', 'lbl sm');
        s += T(290, 172, '코드 경로의 끝에서 끝남', 'lbl sm');
        s += list(40, 196, 446, 52, [
            { t: '같은 관문 (두 방식 모두)', cls: 'h' },
            'approve: rules 에 c1 상한 20000 (광고주가 미리 승인)',
            '서버의 가드레일: 한 번에 20% 넘는 변경은 거부',
        ]);
        s += T(40, 276, 'run 마다 서버를 새로 만들어 입찰가가 처음 값에서 시작', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 호출 수와 시간 ----------
    (function () {
        const S = 'wl-calls'; if (!has(S)) return; let s = '';
        const x0 = 120, w = 360, max = 16000;
        const px = ms => x0 + Math.round(ms / max * w);
        // 가정 셋: 시간은 28주째 기록에서 빌리고, 호출 차례대로 30개를 쓴 뒤 첫 값부터 다시 쓰고, 도구 호출은 0ms 로 친다
        s += T(40, 16, 'run 하나의 시간: 28주째 기록의 호출 시간을 빌려 셈', 'lbl k');
        s += T(40, 32, '호출 차례대로 30개를 쓰고 다시 첫 값부터, 도구 호출은 0ms', 'lbl sm');
        // [이름, run 마다 ms, 표시 색, 중앙값 글자, 줄의 y]
        const rows = [['자율 루프', LOOP_MS, 'b', '중앙값 7,236.5ms', 42], ['워크플로', FLOW_MS, 'a', '중앙값 1,712.5ms', 94]];
        rows.forEach(([name, ms, c, med, y]) => {
            s += T(40, y + 16, name, 'lbl k');
            s += `<rect class="track" x="${x0}" y="${y}" width="${w}" height="22"/>`;
            ms.forEach(v => { s += `<rect class="f-${c}" x="${px(v) - 1}" y="${y + 2}" width="3" height="18"/>`; });
            s += T(x0, y + 38, med, 'lbl sm');
        });
        [0, 4000, 8000, 12000, 16000].forEach(v => {
            s += `<line class="tick" x1="${px(v)}" y1="142" x2="${px(v)}" y2="148"/>`;
            s += T(px(v), 162, v.toLocaleString('en-US'), 'lbl sm', 'middle');
        });
        s += T(x0 - 10, 162, 'ms', 'lbl sm', 'end');
        s += list(40, 172, 446, 66, [
            { t: '10번씩 돌린 결과', cls: 'h' },
            'LLM 호출 (최소, 중앙값, 최대): 자율 루프 3, 4, 5 / 워크플로 1, 1, 1',
            '단계: 자율 루프 3, 4, 5 / 워크플로 4',
            '자율 루프의 멈춤: end_turn 3, 같은 호출 반복 7, 단계 상한 0',
        ]);
        s += T(40, 258, '긴 두 값 5,201ms, 5,494ms 를 받은 run: 자율 루프 1, 8 / 워크플로 1, 2', 'lbl sm');
        s += T(40, 276, '비교는 중앙값으로: 자율 루프 run 9, 10, 5 는 워크플로 run 2 보다 짧음', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 10번의 결과 ----------
    (function () {
        const S = 'wl-variance'; if (!has(S)) return; let s = '';
        s += T(40, 18, '러닝화 c1 의 최종 입찰가, run 1~10', 'lbl k');
        s += T(40, 40, '자율 루프', 'lbl k') + T(40, 118, '워크플로', 'lbl k');
        LOOP_C1.forEach((bid, i) => {
            const x = 40 + i * 45;
            s += box(x, 48, 41, 24, String(bid), bid === 20000 ? 'c' : 'b', 9.5);
            s += T(x + 20, 86, LOOP_STOP[i], 'lbl sm', 'middle');
        });
        FLOW_MS.forEach((_, i) => { s += box(40 + i * 45, 126, 41, 24, '18000', 'a', 9.5); });
        s += T(40, 170, '최종 입찰가 가짓수: 자율 루프 3, 워크플로 1', 'lbl k');
        s += list(40, 182, 446, 66, [
            { t: '자율 루프에서 그대로인 5번과 내린 5번', cls: 'h' },
            '쓰기 없이 다시 읽다 멈춤 3 (run 5, 9, 10), 가드레일 거부 뒤 2 (run 1, 6)',
            '러닝화를 내린 폭: -15% 3번 (17000), -5% 2번 (19000)',
            'run 8 의 여행사 c2 인하는 approve 에 막혀 서버에 가지 않음',
        ]);
        s += T(40, 274, '워크플로는 폭을 코드에 10% 로 적어 10번 모두 같음', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 오케스트레이터와 상태 ----------
    (function () {
        const S = 'wl-a2a'; if (!has(S)) return; let s = '';
        s += box(40, 70, 112, 30, '오케스트레이터', 'a', 10.5);
        s += T(40, 118, 'A2A 클라이언트', 'lbl sm');
        s += box(300, 14, 186, 24, 'targeting-agent', 'k', 10);
        s += box(300, 96, 186, 24, 'copy-agent', 'k', 10);
        s += arrow('wl-a-t', 'M154,78 L296,28', 'a', { svg: S });
        s += arrow('wl-a-c', 'M154,90 L296,108', 'a', { svg: S });
        s += T(160, 34, 'SendMessage', 'lbl sm');
        s += T(176, 128, 'SendMessage, GetTask', 'lbl sm');
        s += T(300, 54, 'tgt-1 COMPLETED, segment 317', 'lbl sm');
        s += T(300, 72, '317 을 카피 에이전트의 입력에 담음', 'lbl sm');
        s += T(300, 136, 'cpy-1 WORKING → GetTask → COMPLETED', 'lbl sm');
        s += T(40, 158, '실패 길: 건강으로 사람을 고르는 요청', 'lbl k');
        s += box(40, 168, 220, 24, 'tgt-2 REJECTED', 'c', 10);
        s += T(40, 208, 'copy-agent 는 부르지 않음', 'lbl sm');
        s += box(270, 168, 216, 24, '다시 보낸 메시지 -32004', 'c', 10);
        s += T(270, 208, 'UnsupportedOperationError', 'lbl sm');
        s += list(40, 222, 446, 52, [
            { t: '에이전트 카드의 필수 칸 (A2A 명세 1.0.0)', cls: 'h' },
            'name, description, supportedInterfaces, version, capabilities',
            'defaultInputModes, defaultOutputModes, skills',
        ]);
        s += T(40, 292, '종료 상태: COMPLETED, FAILED, CANCELED, REJECTED', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
