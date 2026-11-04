/**
 * nl-audience-cards-demo.js — 자연어 오디언스 카드 네 장
 *
 * 광고주가 쓴 문장 하나가 판정, 조건, 쿼리, 명단 크기가 되는 자리를 카드 한 장씩으로 그린다. 세 요청의 판정,
 * 문장 조각과 그 조각이 된 조건, 조건을 하나씩 더할 때 표본에서 남는 회원, LLM 이 맡는 두 일과 코드가 맡는 네 일.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 벽돌색은 LLM 이 쓴 답, 파랑은 코드가 하는 일과 표본 회원,
 * 회색은 빠진 부분과 명단을 만들지 않는 답이고, 점선 상자는 사람이 미리 적어 둔 글(시스템 메시지, 템플릿)이다.
 *
 * 숫자와 조건은 전부 natural-language-audience 글의 파이썬 출력에서 옮긴 값이다. 표본 2,000명은 가상 값이고,
 * LLM 의 판정과 조건은 data/llm-records/natural-language-audience.json 의 기록이다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { esc, T, tw, box, tag, arrow, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);
    const line = (x, y, str, cls = 'list-t') => `<text class="${cls}" x="${x}" y="${y}">${esc(str)}</text>`;
    // 광고주가 쓴 문장 조각. 채우지 않은 테두리 상자에 먹색 글자다
    const piece = (x, y, str) => `<rect class="grp" x="${x}" y="${y}" width="${tw(str) + 14}" height="18"/>` + T(x + 7, y + 13, str, 'lbl k');

    // ---------- 1. 세 요청과 판정 ----------
    (function () {
        const S = 'na-intent'; if (!has(S)) return; let s = '';
        s += T(40, 22, '세 요청의 기준 답(thinking 끔, temperature 0)과, 캠핑 요청을 thinking 을 켜고 한 번 더 물은 답입니다', 'lbl sm');
        const rows = [
            { y: 32, h: 54, text: ['러닝화 살 사람'], expect: '지원', tags: [['', 'supported']], reason: ['reason_code none, 조건 1개'] },
            { y: 94, h: 90, text: ['최근 한 달 캠핑 용품 본 30대 중', '우리 광고 안 본 사람'], expect: '일부 지원',
                tags: [['thinking 끔', 'unsupported'], ['thinking 켬', 'partial']],
                reason: ['reason_code 는 둘 다', 'exposure_history_unavailable'] },
            { y: 192, h: 54, text: ['건강 상태로 골라 달라'], expect: '불가', tags: [['', 'unsupported']], reason: ['reason_code sensitive_attribute'] },
        ];
        rows.forEach(r => {
            s += `<rect class="grp" x="34" y="${r.y}" width="452" height="${r.h}"/>`;
            r.text.forEach((t, i) => { s += T(44, r.y + 20 + i * 16, t, 'lbl k'); });
            s += T(44, r.y + 22 + r.text.length * 16, `기대한 판정: ${r.expect}`, 'lbl sm');
            r.tags.forEach(([label, v], i) => {
                const y = r.y + 8 + i * 26;
                if (label) s += T(262, y + 13, label, 'lbl sm');
                s += tag(label ? 322 : 262, y, v, 'b');
            });
            r.reason.forEach((t, i) => { s += T(262, r.y + r.h - 10 - (r.reason.length - 1 - i) * 12, t, 'lbl sm'); });
        });
        s += T(40, 268, '캠핑 요청의 기준 답은 노출 기록이 없다는 이유를 맞게 적고도 불가로 판정했습니다', 'lbl');
        s += T(40, 288, 'thinking 을 켜고 한 번 더 물은 답은 일부 지원이고 조건이 셋입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 문장 조각과 조건 ----------
    (function () {
        const S = 'na-slots'; if (!has(S)) return; let s = '';
        s += T(40, 22, '문장 조각과 그 조각이 된 조건. 잇는 선은 이 글이 읽은 것이고, LLM 은 조건 목록만 돌려줍니다', 'lbl sm');
        const to = 236;                              // 조건 상자가 시작하는 자리
        const link = (id, x, y, cls = 'k', dash = false) => arrow(id, `M${x + 4},${y + 9} L${to - 4},${y + 9}`, cls, { svg: S, dash });
        const end = (x, str) => x + tw(str) + 14;    // piece() 상자의 오른쪽 끝
        // 러닝화 요청의 기준 답. 조건 하나가 필드와 문턱으로 나뉜다
        s += T(40, 46, '러닝화 살 사람 (기준 답)', 'lbl k');
        s += piece(40, 54, '러닝화') + link('nas1', end(40, '러닝화'), 54) + tag(to, 54, 'field search_running_shoes', 'b');
        s += piece(40, 78, '살 사람') + link('nas2', end(40, '살 사람'), 78) + tag(to, 78, 'op >=, value 1', 'b');
        s += T(to + tw('op >=, value 1') + 22, 91, 'LLM 이 고른 문턱', 'lbl sm');
        // 캠핑 요청을 thinking 을 켜고 받은 답. 조건 셋과 빠진 부분 하나
        s += T(40, 126, '최근 한 달 캠핑 용품 본 30대 중 우리 광고 안 본 사람 (thinking 을 켠 답)', 'lbl k');
        s += piece(40, 134, '최근 한 달') + T(to, 147, '조건 없음. 필드가 모두 30일 동안의 횟수입니다', 'lbl sm');
        s += piece(40, 158, '캠핑 용품 본') + link('nas3', end(40, '캠핑 용품 본'), 158) + tag(to, 158, 'camping_search >= 1', 'b');
        s += piece(40, 182, '30대') + link('nas4', end(40, '30대'), 182) + tag(to, 182, 'age >= 30', 'b');
        s += tag(to + tw('age >= 30') + 22, 182, 'age <= 39', 'b');
        s += piece(40, 206, '우리 광고 안 본') + link('nas5', end(40, '우리 광고 안 본'), 206, 'c', true);
        s += tag(to, 206, 'unsupported_parts: ad exposure history', 'c');
        s += T(40, 252, '「본」은 필드 10개 가운데 가장 가까운 「검색」으로 옮겨졌습니다', 'lbl');
        s += T(40, 272, '「우리 광고 안 본」은 노출 기록이 필드에 없어 조건이 되지 못했습니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 조건이 쿼리가 되고 남는 회원 ----------
    (function () {
        const S = 'na-query'; if (!has(S)) return; let s = '';
        s += T(40, 22, '코드가 조건 JSON 으로 쓴 쿼리와, 조건을 하나씩 더할 때 표본 2,000명에서 남는 회원', 'lbl sm');
        s += `<rect class="grp" x="34" y="30" width="452" height="40"/>`;
        s += line(44, 46, 'SELECT COUNT(*) FROM members', 'list-t h');
        s += line(44, 61, 'WHERE age >= 30 AND age <= 39 AND camping_search >= 1');
        const bar = (y, label, n) => T(40, y + 10, label, 'lbl') + hbar(236, y, 180, n / 2000, 'a', 12) + T(424, y + 10, `${n.toLocaleString('en-US')}명`, 'lbl k');
        s += T(40, 92, '캠핑 요청, thinking 을 켠 답의 조건 셋', 'lbl k');
        [['표본', 2000], ['age >= 30', 1603], ['age <= 39', 782], ['camping_search >= 1', 59]].forEach(([label, n], i) => {
            s += bar(100 + i * 22, label, n);
        });
        s += T(40, 200, '러닝화 요청, 기준 답의 조건 하나', 'lbl k');
        s += bar(208, 'search_running_shoes >= 1', 63);
        s += T(40, 250, '전체 회원 1,400만 명으로 옮기면 × 7,000. 63명은 441,000명, 59명은 413,000명입니다', 'lbl');
        s += T(40, 270, '불가인 기준 답 둘(캠핑 요청, 건강 상태 요청)은 쿼리를 만들지 않습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. LLM 이 맡는 두 일과 코드가 맡는 네 일 ----------
    (function () {
        const S = 'na-bridge'; if (!has(S)) return; let s = '';
        s += T(40, 22, '문장을 읽는 두 일은 LLM, 같은 입력에 늘 같은 답이 나와야 하는 네 일은 코드가 맡습니다', 'lbl sm');
        // 왼쪽: 사람이 적어 둔 시스템 메시지와 광고주의 문장
        s += `<rect class="list" x="34" y="36" width="150" height="30"/>` + line(44, 55, '시스템 메시지', 'list-t h');
        s += piece(34, 84, '광고주의 문장 한 줄');
        // 가운데: LLM 의 두 일
        s += box(214, 36, 110, 30, '판정', 'b') + box(214, 78, 110, 30, '조건 추출', 'b');
        s += arrow('nab1', 'M186,51 L210,51', 'k', { svg: S }) + arrow('nab2', `M${34 + tw('광고주의 문장 한 줄') + 18},93 L210,93`, 'k', { svg: S });
        s += T(214, 126, '답은 JSON 한 줄', 'lbl sm');
        // 오른쪽: 코드의 네 일과 템플릿
        s += box(360, 30, 126, 24, 'JSON 검사', 'a') + box(360, 60, 126, 24, '쿼리', 'a');
        s += box(360, 90, 126, 24, '명단 크기', 'a') + box(360, 120, 126, 24, '응답 고르기', 'a');
        s += `<rect class="list" x="360" y="152" width="126" height="22"/>` + line(370, 167, '템플릿 한 문장', 'list-t h');
        s += arrow('nab3', 'M326,72 L356,42', 'b', { svg: S });
        // 아래: 답 19개에 코드가 고른 응답
        s += T(40, 200, '기록한 답 19개에 코드가 고른 응답', 'lbl k');
        [['list', 8, 'a', '명단 크기와 조건'], ['review', 5, 'c', '명단 없이 담당자가 본다'], ['reject_template', 6, 'c', '템플릿 한 문장']].forEach(([name, n, cls, note], i) => {
            const y = 208 + i * 22;
            s += T(40, y + 10, name, 'lbl') + hbar(150, y, 190, n / 19, cls, 12) + T(348, y + 10, `${n}개, ${note}`, 'lbl sm');
        });
        s += T(40, 290, '이 기록에서 흔들린 자리는 모두 LLM 이 맡은 두 일이었습니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
