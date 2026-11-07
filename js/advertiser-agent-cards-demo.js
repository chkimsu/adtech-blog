/**
 * advertiser-agent-cards-demo.js — 광고주 에이전트 카드 네 장
 *
 * 서연 씨가 대화로 캠페인을 손보는 에이전트를 카드 한 장씩으로 그린다.
 * 클라이언트와 서버, 읽기와 쓰기, 승인 단계, 서버의 가드레일.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 호스트와 클라이언트의 코드, 벽돌색은 모델이 고른 것,
 * 먹색은 MCP 서버, 회색은 막힌 호출이고, 점선 상자는 가상 값과 승인 기록이다.
 *
 * 숫자와 이름(버전 2026-07-28, 도구 3개와 2개, c1, toolu_03, toolu_06, 단계 4, 입찰가 20000, 18000, 13000, 16200, -35, -19, 20, -32602)은
 * advertiser-agent-mcp 글의 파이썬 블록 셋이 찍은 출력에서 옮겼다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, list, arrow, svg } = window.CardKit;
    const has = id => !!document.getElementById(id);

    // ---------- 1. 클라이언트와 서버 ----------
    (function () {
        const S = 'aa-mcp'; if (!has(S)) return; let s = '';
        s += box(40, 12, 200, 28, '호스트: 서연 씨의 도우미 앱', 'a', 10);
        s += box(326, 12, 160, 28, 'MCP 서버', 'k', 10.5);
        s += T(40, 58, '모델, approve, 클라이언트가 호스트 안에', 'lbl sm');
        s += T(326, 58, 'c1 만 보여 주고 쓰기를 켬', 'lbl sm');
        // [클라이언트가 보내는 메서드, 서버가 돌려주는 것]
        const rows = [['server/discover', '2026-07-28, tools 기능'], ['tools/list', '도구 3개, ttlMs 0'], ['tools/call', 'content, isError']];
        rows.forEach(([m, r], i) => {
            const y = 72 + i * 40;
            s += box(40, y, 150, 24, m, 'a', 10);
            s += arrow(`aa-m-${i}-q`, `M192,${y + 7} L322,${y + 7}`, 'a', { svg: S });
            s += arrow(`aa-m-${i}-r`, `M322,${y + 18} L194,${y + 18}`, 'k', { svg: S });
            s += box(326, y, 160, 24, r, 'k', 9.5);
        });
        s += list(40, 196, 446, 66, [
            { t: '요청마다 params 의 _meta (2026-07-28 버전)', cls: 'h' },
            'io.modelcontextprotocol/protocolVersion: 2026-07-28',
            'io.modelcontextprotocol/clientCapabilities: {}',
            '빠지면 -32602 로 거절',
        ]);
        s += T(40, 286, '2025-11-25 와 그 앞의 버전은 initialize 로 한 번 주고받았습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 읽기와 쓰기 ----------
    (function () {
        const S = 'aa-tools'; if (!has(S)) return; let s = '';
        s += T(40, 18, '쓰기를 켠 서버의 tools/list', 'lbl k');
        s += T(280, 18, '쓰기를 끈 서버의 tools/list', 'lbl k');
        // [도구 이름, readOnlyHint]
        const tools = [['get_campaigns', 'readOnlyHint 참'], ['get_stats', 'readOnlyHint 참'], ['set_bid', 'readOnlyHint 거짓']];
        tools.forEach(([n, h], i) => {
            const y = 28 + i * 44;
            s += box(40, y, 206, 24, n, 'k', 10) + T(40, y + 37, h, 'lbl sm');
            if (i < 2) s += box(280, y, 206, 24, n, 'k', 10) + T(280, y + 37, h, 'lbl sm');
            else s += box(280, y, 206, 24, '목록에 없음', 'c', 10) + T(280, y + 37, 'readOnlyHint 가 거짓이라 뺌', 'lbl sm');
        });
        s += list(40, 170, 446, 52, [
            { t: '보여 줄 캠페인 (서연 씨의 서버)', cls: 'h' },
            'get_campaigns → c1 running_shoes 하나',
            'get_stats c2 → isError 참, unknown_campaign',
        ]);
        s += T(40, 246, 'ttlMs 0, cacheScope private: 쓰기를 끄면 다음 요청부터 바뀜', 'lbl sm');
        s += T(40, 268, '힌트는 서버가 적은 말이라, 승인은 호스트의 데이터로 정합니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 승인 단계 ----------
    (function () {
        const S = 'aa-approval'; if (!has(S)) return; let s = '';
        s += T(40, 16, '루프의 단계 (서연 씨의 요청)', 'lbl k');
        // [단계, 모델이 고른 것, 호스트와 서버에서 일어난 일, 오른쪽 상자 색]
        const steps = [
            ['1', 'get_campaigns', 'approve 참, 바로 실행', 'a'],
            ['2', 'get_stats c1', 'approve 참, ROAS 280', 'a'],
            ['3', 'set_bid c1 18000', '서연 씨 승인 뒤 실행', 'a'],
            ['4', 'end_turn', 'c1 20000 → 18000', 'k'],
        ];
        steps.forEach(([n, call, res, c], i) => {
            const y = 26 + i * 32;
            s += T(40, y + 15, 'step ' + n, 'lbl sm');
            s += box(88, y, 180, 22, call, 'b', 9.5);
            s += box(282, y, 204, 22, res, c, 9.5);
        });
        s += list(40, 166, 446, 66, [
            { t: 'APPROVALS (승인 기록)', cls: 'h' },
            'tools: get_campaigns, get_stats (서버를 붙일 때 허락)',
            'call_ids: toolu_03 → set_bid, c1 18000 (화면에서 승인)',
            'rules: 비움 (범위를 정한 미리 승인)',
        ]);
        s += T(40, 256, '승인은 id, 이름, 입력이 모두 같은 호출에만 맞습니다', 'lbl k');
        s += T(40, 278, '대화의 글은 이 기록을 바꾸지 못합니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 서버의 가드레일 ----------
    (function () {
        const S = 'aa-guard'; if (!has(S)) return; let s = '';
        // [막힌 길, 막은 자리, 돌아온 것, 막은 자리의 상자 색]
        const rows = [
            ['승인 기록과 맞지 않는 쓰기 (toolu_06, 입력을 바꾼 toolu_03)', '호스트의 approve', '서버에 안 감, approval_required', 'a'],
            ['승인한 35% 인하 (13000)', '서버의 가드레일', 'result isError 참, change_too_large', 'k'],
            ['쓰기를 끈 서버의 set_bid', '서버의 도구 목록', 'error -32602, Unknown tool', 'k'],
        ];
        rows.forEach(([path, who, res, c], i) => {
            const y = 12 + i * 60;
            s += T(40, y + 10, path, 'lbl k');
            s += box(40, y + 18, 150, 24, who, c, 10);
            s += arrow(`aa-g-${i}`, `M192,${y + 30} L222,${y + 30}`, 'c', { svg: S });
            s += box(226, y + 18, 260, 24, res, 'c', 9.5);
        });
        s += T(40, 208, '세 길 모두 c1 입찰가는 20000원 그대로', 'lbl k');
        s += T(40, 232, 'result 의 isError: 도구 실행 오류, 모델이 읽고 고칠 수 있음', 'lbl sm');
        s += T(40, 254, 'JSON-RPC error: 프로토콜 오류, 요청 자체의 문제', 'lbl sm');
        s += T(40, 278, '크기를 보는 비교는 모든 호출이 지나는 서버에 둡니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
