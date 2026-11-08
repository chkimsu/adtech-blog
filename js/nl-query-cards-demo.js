/**
 * nl-query-cards-demo.js — 자연어 → 타겟 조건 카드 네 장
 *
 * 광고주가 쓴 요청 한 문장이 판정, 조건 추출, 쿼리, 명단 크기를 지나 고정 답이 되는 자리를 카드 한 장씩으로 그린다.
 * 요청 하나가 지나는 네 단계, 판정 셋의 혼동표 둘, 코드가 허용 목록으로 확인하고 쓴 쿼리와 회원 수, 판정과 reason_code 의
 * 짝마다 정해 둔 템플릿. 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 벽돌색은 LLM 이 쓴 답, 파랑은 코드가 하는 일과
 * 회원 표본, 회색은 명단을 만들지 않는 답과 쓰지 않은 조건이고, 점선 상자는 사람이 미리 적어 둔 글(템플릿)이다.
 *
 * 숫자와 조건은 전부 nl-to-targeting-query 글의 파이썬 출력에서 옮긴 값이다. 회원 표본과 정답은 가상 값이고, LLM 의 판정과
 * 조건은 data/llm-records/nl-to-targeting-query-oneshot.json, -verdict.json, -extract.json 의 기록이다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, tw, box, tag, arrow, svg, hbar, esc } = window.CardKit;
    const has = id => !!document.getElementById(id);
    const line = (x, y, str, cls = 'list-t') => `<text class="${cls}" x="${x}" y="${y}">${esc(str)}</text>`;
    // 광고주가 쓴 문장. 채우지 않은 테두리 상자에 먹색 글자다
    const piece = (x, y, str) => `<rect class="grp" x="${x}" y="${y}" width="${tw(str) + 14}" height="18"/>` + T(x + 7, y + 13, str, 'lbl k');

    // ---------- 1. 요청 하나가 지나는 네 단계 ----------
    (function () {
        const S = 'nq-steps'; if (!has(S)) return; let s = '';
        s += T(40, 20, '요청 n22 한 문장이 지나는 네 단계와 답. 위 둘은 LLM, 아래는 코드입니다', 'lbl sm');
        s += piece(40, 30, '자동차가 있는 40대 여행 글 독자');
        const step = (y, label, cls, rows) => box(40, y, 104, 26, label, cls) +
            rows.map((t, i) => T(160, y + 11 + i * 13, t, i ? 'lbl sm' : 'lbl')).join('');
        s += step(62, '판정', 'b', ['verdict partial, reason_code unknown_field', '「자동차가 있는」은 필드에 없습니다']);
        s += step(100, '조건 추출', 'b', ['age >= 40, age <= 49, travel_posts >= 1', '판정은 묻지 않고 필드, 비교, 값만 받습니다']);
        s += step(138, '쿼리', 'a', ['SELECT COUNT(*) FROM members WHERE', 'age >= 40 AND age <= 49 AND travel_posts >= 1']);
        s += step(176, '명단 크기', 'a', ['표본 163명', '1,400만 명으로 늘리면 1,141,000명']);
        s += `<rect class="list" x="40" y="214" width="104" height="26"/>` + line(50, 231, '답: 템플릿', 'list-t h');
        s += T(160, 225, '이 짝의 템플릿 문장. 회원 수 자리만 코드가 채웁니다', 'lbl');
        [[48, 62], [88, 100], [126, 138], [164, 176], [202, 214]].forEach(([y1, y2], i) => {
            s += arrow(`nqs${i}`, `M92,${y1 + 2} L92,${y2 - 3}`, 'k', { svg: S });
        });
        s += T(40, 268, 'oneshot 은 판정과 조건을 호출 한 번에 받았습니다', 'lbl');
        s += T(40, 288, '판정이 불가면 조건 단계를 부르지 않고 템플릿 한 문장으로 끝납니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 판정 셋의 혼동표 둘 ----------
    (function () {
        const S = 'nq-verdict'; if (!has(S)) return; let s = '';
        s += T(40, 20, '줄은 정답 판정, 칸은 답의 판정. 지원 supported, 일부 partial, 불가 unsupported', 'lbl sm');
        const names = ['지원', '일부', '불가'];
        const grid = (x0, title, rows, ok) => {
            let g = T(x0, 48, title, 'lbl k');
            names.forEach((n, j) => { g += T(x0 + 60 + j * 44, 66, n, 'lbl sm', 'middle'); });
            rows.forEach((row, i) => {
                const y = 74 + i * 32;
                g += T(x0, y + 19, names[i], 'lbl sm');
                row.forEach((n, j) => {
                    const x = x0 + 40 + j * 44;
                    g += n === 0 ? `<rect class="track" x="${x}" y="${y}" width="40" height="28"/>` + T(x + 20, y + 18, '0', 'lbl sm', 'middle')
                        : box(x, y, 40, 28, String(n), i === j ? 'b' : 'c', 11);
                });
            });
            return g + T(x0, 192, `판정 맞음 ${ok}/30`, 'lbl k');
        };
        s += grid(52, 'oneshot, 판정과 조건을 한 번에', [[12, 0, 0], [0, 5, 5], [0, 0, 8]], 25);
        s += grid(292, 'verdict, 판정만', [[12, 0, 0], [0, 4, 6], [0, 0, 8]], 24);
        s += T(40, 226, '틀린 칸은 정답 일부 지원, 답 불가 하나뿐입니다. 5에서 6이 되었습니다', 'lbl');
        s += T(40, 248, '늘어난 하나는 n12 「태블릿으로 접속하는 여행 글 독자」입니다', 'lbl sm');
        s += T(40, 270, '두 기록 모두 정답보다 더 받은 답은 0개입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 허용 목록으로 확인하고 쓴 쿼리와 회원 수 ----------
    (function () {
        const S = 'nq-query'; if (!has(S)) return; let s = '';
        s += T(40, 20, '「러닝화 살 사람」의 조건 단계 답을 코드가 확인하고 쿼리로 써서 표본에서 셉니다', 'lbl sm');
        s += T(40, 44, '조건 단계의 답', 'lbl k');
        s += tag(40, 52, 'search_running_shoes >= 1', 'b');
        s += tag(40 + tw('search_running_shoes >= 1') + 22, 52, 'sports_goods_buy >= 1', 'b');
        s += T(40, 92, '코드가 확인하는 것', 'lbl k');
        s += box(40, 100, 122, 22, '필드가 FIELDS 에 있다', 'a', 10) + box(168, 100, 104, 22, '비교가 OPS 에 있다', 'a', 10) +
            box(278, 100, 64, 22, '값이 숫자다', 'a', 10) + box(348, 100, 128, 22, '지역은 이름 9개 중 하나', 'a', 10);
        s += `<rect class="grp" x="34" y="132" width="452" height="38"/>`;
        s += line(44, 148, 'SELECT COUNT(*) FROM members WHERE', 'list-t h');
        s += line(44, 162, 'search_running_shoes >= 1 AND sports_goods_buy >= 1');
        const bar = (y, label, n, note) => T(40, y + 10, label, 'lbl') + hbar(250, y, 120, n / 63, 'a', 12) + T(378, y + 10, note, 'lbl k');
        s += bar(184, '정답 조건 하나', 63, '63명, 441,000명');
        s += bar(206, '워크플로의 조건 둘', 12, '12명, 84,000명');
        s += tag(40, 236, "region == seoul' OR '1'='1", 'c');
        s += T(40 + tw("region == seoul' OR '1'='1") + 22, 249, '지역 이름 9개 밖이라 쿼리를 쓰지 않고 멈춥니다', 'lbl sm');
        s += T(40, 284, '조건 하나가 명단을 441,000명에서 84,000명으로 줄였습니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 판정과 reason_code 의 짝마다 정해 둔 템플릿 ----------
    (function () {
        const S = 'nq-reply'; if (!has(S)) return; let s = '';
        s += T(40, 20, '답 30개가 받은 템플릿. 막대는 그 템플릿을 받은 요청 수입니다', 'lbl sm');
        s += T(40, 40, 'reason_code', 'lbl k') + T(226, 40, '판정', 'lbl k');
        const rows = [
            ['none', 'supported', 12, 'a'], ['unknown_field', 'partial', 4, 'a'], ['unknown_field', 'unsupported', 4, 'c'],
            ['exposure_history_unavailable', 'partial', 0, 'c'], ['exposure_history_unavailable', 'unsupported', 8, 'c'],
            ['sensitive_attribute', 'unsupported', 2, 'c'],
        ];
        rows.forEach(([reason, verdict, n, cls], i) => {
            const y = 50 + i * 24;
            s += T(40, y + 11, reason, 'lbl') + T(226, y + 11, verdict, 'lbl');
            s += n ? hbar(304, y, 110, n / 30, cls, 12) : `<rect class="track" x="304" y="${y}" width="110" height="12"/>`;
            s += T(422, y + 11, `${n}개`, 'lbl k');
        });
        s += `<rect class="list" x="34" y="202" width="452" height="44"/>`;
        s += line(44, 218, 'sensitive_attribute, unsupported 의 문장', 'list-t h');
        s += line(44, 234, '요청에 건강 상태처럼 민감한 정보로 고르는 조건이 있어 만들 수 없습니다.');
        s += T(40, 270, '담당자에게 넘긴 답 0개. 판정이 틀린 6개는 불가 문장을 받았습니다', 'lbl');
        s += T(40, 290, '노출 이력의 일부 지원 문장은 판정이 그 짝을 내지 않아 쓰이지 않았습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
