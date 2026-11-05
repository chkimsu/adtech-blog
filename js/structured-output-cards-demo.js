/**
 * structured-output-cards-demo.js — 구조화 출력 카드 네 장
 *
 * 가짜 LLM 이 요청 12건에 돌려준 답을 JSON 으로 읽고 검증하는 길을 카드 한 장씩으로 그린다.
 * 자유 문장으로 받은 답의 네 꼴, 필드 넷의 스키마와 enum, 파싱과 검증 세 단계, 빠진 필드만 다시 묻기.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 코드가 하는 일, 벽돌색은 모델의 답,
 * 먹색은 필드 이름과 스키마, 회색은 review 로 가는 답이고, 점선 상자는 가상 값(요청과 답)이다.
 *
 * 건수(12, 6/2/2/2, 10, 12, 8, 다시 묻기 2, 통과 9, review 3)는 structured-output 글의
 * 파이썬 블록 둘이 찍은 출력에서 옮겼다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, tag, list, arrow, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);

    // ---------- 1. 자유 문장과 네 가지 꼴 ----------
    (function () {
        const S = 'so-freeform'; if (!has(S)) return; let s = '';
        s += list(40, 12, 446, 64, [
            { t: 'q07 의 답, wrapped', cls: 'h' },
            'Here is the answer you asked for.',
            '{"verdict": "supported", "conditions": [...], ...}',
            'Let me know if you need anything else.',
        ]);
        s += T(40, 100, '꼴', 'lbl k') + T(150, 100, '건수', 'lbl k') + T(210, 100, '글 전체를 JSON 으로', 'lbl k') + T(360, 100, '코드가 할 일', 'lbl k');
        const rows = [
            ['valid', 'a', '6건', '읽힘', '그대로 씀'],
            ['wrapped', 'b', '2건', '못 읽음', '중괄호 사이만'],
            ['missing', 'b', '2건', '읽힘', '빠진 필드만 다시'],
            ['enum', 'c', '2건', '읽힘', 'review'],
        ];
        rows.forEach(([name, cls, n, read, todo], i) => {
            const y = 110 + i * 30;
            s += tag(40, y, name, cls) + T(150, y + 13, n, 'lbl') + T(210, y + 13, read, 'lbl') + T(360, y + 13, todo, 'lbl sm');
        });
        s += T(40, 248, 'missing 과 enum 은 JSON 으로는 읽혀서 코드가 멈추지 않습니다', 'lbl');
        s += T(40, 268, 'q09 는 reason_code 가 없고, q11 은 verdict 에 full_support 를 적었습니다', 'lbl sm');
        s += T(40, 286, '요청과 답은 규칙으로 만든 가상 데이터입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 스키마와 enum ----------
    (function () {
        const S = 'so-schema'; if (!has(S)) return; let s = '';
        s += `<rect class="grp" x="30" y="12" width="300" height="168"/>`;
        s += T(42, 32, 'SCHEMA, 필드 넷', 'lbl k');
        const F = [
            ['verdict', '글자, enum 셋', 'supported, partial, unsupported'],
            ['conditions', '목록', '{field, op, value} 의 목록'],
            ['unsupported_parts', '목록', '영어 짧은 구의 목록'],
            ['reason_code', '글자, enum 넷', 'none, sensitive_attribute, ...'],
        ];
        F.forEach(([name, type, vals], i) => {
            const y = 42 + i * 34;
            s += tag(42, y, name, 'k') + T(190, y + 13, type, 'lbl sm') + T(56, y + 30, vals, 'lbl sm');
        });
        s += arrow('sos0', 'M334,60 L384,60', 'k', { svg: S });
        s += arrow('sos1', 'M334,140 L384,140', 'k', { svg: S });
        s += box(390, 46, 110, 28, '시스템 메시지', 'b', 10.5);
        s += T(390, 92, '이 꼴로 답하라', 'lbl sm');
        s += box(390, 126, 110, 28, 'validate', 'a', 10.5);
        s += T(390, 172, '이 꼴과 맞는지', 'lbl sm');
        s += T(40, 208, 'reason_code 넷: none, sensitive_attribute,', 'lbl sm');
        s += T(40, 224, 'unknown_field, exposure_history_unavailable', 'lbl sm');
        s += T(40, 254, 'enum 밖 낱말이 오면 코드는 다음 일을 고르지 못합니다', 'lbl');
        s += T(40, 274, 'full_support 는 뜻이 비슷해 보여도 코드에는 모르는 낱말입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 검증 세 단계 ----------
    (function () {
        const S = 'so-validate'; if (!has(S)) return; let s = '';
        const rows = [
            ['받은 답', 12, 'k', '12건'],
            ['글 전체를 JSON 으로', 10, 'a', '10건, q07 과 q08 못 읽음'],
            ['첫 { 부터 마지막 } 까지', 12, 'a', '12건'],
            ['필수 필드, 자료형, enum', 8, 'a', '8건 통과'],
        ];
        rows.forEach(([name, n, cls, label], i) => {
            const y = 20 + i * 44;
            s += T(40, y, name, 'lbl k') + hbar(40, y + 8, 300, n / 12, cls, 14) + T(350, y + 19, label, 'lbl');
        });
        s += T(40, 208, '검증에서 틀린 4건', 'lbl k');
        s += tag(40, 216, 'q09 missing', 'b') + tag(140, 216, 'q10 missing', 'b');
        s += tag(240, 216, 'q11 enum', 'c') + tag(320, 216, 'q12 enum', 'c');
        s += T(40, 262, '파싱은 글이 JSON 인지만 보고, 꼴은 validate 가 봅니다', 'lbl');
        s += T(40, 282, 'validate 는 틀린 자리를 글자 목록으로 돌려주고, 빈 목록이면 통과입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 빠진 필드만 다시 묻기 ----------
    (function () {
        const S = 'so-retry'; if (!has(S)) return; let s = '';
        s += T(40, 22, 'q09 를 다시 묻는 대화, 메시지 셋', 'lbl k');
        s += tag(40, 30, 'user', 'k') + T(130, 43, '요청: 서울 사는 여행 글 독자', 'lbl sm');
        s += tag(40, 54, 'assistant', 'b') + T(130, 67, '첫 답, reason_code 가 없음', 'lbl sm');
        s += tag(40, 78, 'user', 'a') + T(130, 91, 'Return only these missing fields ...: reason_code', 'lbl sm');
        s += arrow('sor0', 'M60,104 L60,124', 'k', { svg: S });
        s += tag(40, 128, '답', 'b') + T(130, 141, '{"reason_code": "none"} 을 합쳐 다시 검증, 통과', 'lbl sm');
        s += T(40, 172, 'q10 은 다시 받은 reason_code 가 religion 이라 review', 'lbl');
        s += T(40, 196, '최종 통과', 'lbl') + hbar(130, 186, 260, 9 / 12, 'a', 12) + T(398, 196, '9건', 'lbl k');
        s += T(40, 216, 'review', 'lbl') + hbar(130, 206, 260, 3 / 12, 'c', 12) + T(398, 216, '3건', 'lbl k');
        s += T(40, 242, 'review 는 q10, q11, q12 입니다', 'lbl sm');
        s += T(40, 266, '요청은 첫 요청 12건에 다시 묻기 2건, 모두 14건입니다', 'lbl');
        s += T(40, 286, '재시도와 달리 첫 답의 나머지 필드는 그대로 둡니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
