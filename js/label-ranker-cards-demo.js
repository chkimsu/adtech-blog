/**
 * label-ranker-cards-demo.js — LLM 라벨과 코드 랭커 카드 네 장
 *
 * 「러닝화 추천」의 광고 후보 30개를 모델이 하나씩 판정하고, 순위는 코드가 상업 가치와 섞어 정하는 자리를 카드 한 장씩으로 그린다.
 * 후보 하나에 라벨 하나, 순위는 코드가 섞는다, 근거는 노출된 것에만, 한 번에 다 맡기면 잘리는 자리.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 코드와 정답과 코드가 정한 점수, 벽돌색은 모델의 답,
 * 회색은 노출되지 않거나 읽지 못한 자리이고, 점선은 시스템 메시지의 정의다.
 *
 * 숫자는 전부 llm-labels-code-ranker 글의 파이썬 블록 셋이 찍은 출력에서 옮긴 값이다. 후보의 문장, pCTR, 입찰가, 정답은
 * 가상 값이고 scripts/gen-ranker-data.py 가 만든다. 모델의 답은 data/llm-records/ 의 기록 둘이다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, tag, tool, list, arrow, svg } = window.CardKit;
    const has = id => !!document.getElementById(id);
    // 눈금 상자 안에 n / max 만큼 채운 막대. n 이 0 이면 채우지 않는다
    const bar = (x, y, w, n, max, cls, h = 12) =>
        `<rect class="track" x="${x}" y="${y}" width="${w}" height="${h}"/>` +
        (n > 0 ? `<rect class="f-${cls}" x="${x}" y="${y}" width="${Math.max(2, Math.round(w * n / max))}" height="${h}"/>` : '');

    // ---------- 1. 후보 하나에 라벨 하나 ----------
    (function () {
        const S = 'lr-label'; if (!has(S)) return; let s = '';
        s += T(40, 20, '후보 하나를 한 번씩 보여 주고 답 하나를 받습니다. 30번 묻습니다', 'lbl sm');
        s += tag(40, 30, 'a04', 'k');
        s += T(40, 64, 's1 가볍고 반발력이 좋은 러닝화입니다.', 'lbl sm');
        s += T(40, 82, 's2 평생 달려도 밑창이 닳지 않습니다.', 'lbl b');
        s += T(40, 100, 's3 사이즈는 240mm 부터 280mm 까지 있습니다.', 'lbl sm');
        s += arrow('lr-label-in', 'M268,64 L326,64', 'k', { svg: S });
        s += tool(330, 44, 160, { label: '모델', sub: 'thinking 끔, temperature 0' });
        s += tag(330, 94, 'label exclude', 'b');
        s += tag(330, 116, 'reason_code policy_risk', 'b');
        s += tag(330, 138, 'evidence s2', 'b');
        s += list(40, 114, 272, 52, [{ t: '시스템 메시지의 정의', cls: 'h' }, 'policy_risk: 근거 없이 성능, 가격,', '인기를 내세운다. label 은 exclude 다.']);
        s += T(40, 188, '라벨 넷의 수. 파랑은 정답, 벽돌색은 모델의 답입니다', 'lbl k');
        // [라벨, 정답 수, 모델 수]
        const rows = [['high', 6, 5], ['mid', 8, 7], ['low', 10, 0], ['exclude', 6, 18]];
        rows.forEach(([name, gold, model], i) => {
            const y = 196 + i * 22;
            s += T(40, y + 11, name, name === 'low' ? 'lbl b' : 'lbl');
            s += bar(104, y + 1, 130, gold, 18, 'a') + T(240, y + 11, `정답 ${gold}`, 'lbl sm');
            s += bar(300, y + 1, 130, model, 18, 'b') + T(436, y + 11, `모델 ${model}`, name === 'low' ? 'lbl b' : 'lbl sm');
        });
        s += T(40, 294, '모델은 low 를 한 번도 고르지 않았고, 정답 low 10개는 모두 exclude 로 왔습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 순위는 코드가 섞는다 ----------
    (function () {
        const S = 'lr-rank'; if (!has(S)) return; let s = '';
        s += T(40, 20, '점수 = 라벨 가중치 × pCTR × 입찰가. 노출은 위 5개입니다', 'lbl sm');
        s += T(40, 42, '라벨 없이 (pCTR × 입찰가)', 'lbl k') + T(282, 42, 'LLM 라벨을 섞으면', 'lbl k');
        // [후보, pCTR × 입찰가, LLM 라벨]
        const plain = [['a04', 14.0, 'exclude'], ['a02', 13.5, 'exclude'], ['a13', 13.2, 'exclude'], ['a07', 11.2, 'exclude'], ['a20', 11.0, 'high']];
        // [후보, 점수]
        const mixed = [['a20', 11.0], ['a10', 8.1], ['a01', 7.2], ['a05', 7.0], ['a26', 3.5]];
        plain.forEach(([id, v, label], i) => {
            const y = 52 + i * 26;
            const out = label === 'exclude';
            s += tag(40, y, id, out ? 'c' : 'a');
            s += bar(82, y + 4, 110, v, 14, out ? 'c' : 'a', 10);
            s += T(250, y + 13, out ? `${v.toFixed(2)} → 0` : v.toFixed(2), out ? 'lbl sm' : 'lbl', 'end');
        });
        mixed.forEach(([id, v], i) => {
            const y = 52 + i * 26;
            s += tag(282, y, id, 'a');
            s += bar(324, y + 4, 110, v, 14, 'a', 10);
            s += T(490, y + 13, v.toFixed(2), id === 'a01' ? 'lbl k' : 'lbl', 'end');
        });
        s += `<line class="split" x1="40" y1="190" x2="490" y2="190"/>`;
        s += T(40, 212, '왼쪽의 넷은 모델이 exclude 로 보아 점수가 0 이 됩니다', 'lbl');
        s += T(40, 234, '상위 5개 가운데 바뀐 후보 4개', 'lbl k');
        s += T(40, 256, '서연 씨의 a01 은 라벨 없이 9위, LLM 라벨을 섞으면 3위입니다', 'lbl');
        s += T(40, 280, '정답 라벨로 섞으면 a26 대신 mid 인 a07 이 5.60 으로 5위에 듭니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 근거는 노출된 것에만 ----------
    (function () {
        const S = 'lr-evidence'; if (!has(S)) return; let s = '';
        s += T(40, 20, '노출되는 5개의 근거 id 를 그 후보의 문장으로 바꿔 붙입니다', 'lbl sm');
        // [후보, 근거 id 와 문장]
        const rows = [
            ['a20', 's1 밑창 안에 카본 판을 넣은 러닝화입니다.'],
            ['a10', 's1 대회에서 기록을 재는 사람을 위한 레이싱 러닝화입니다.'],
            ['a01', 's1 런솔 라이트는 달리기를 처음 시작하는 사람을 위한 입문자용 러닝화입니다.'],
            ['a05', 's1 모노웍스 데일리는 매일 달리는 사람을 위한 러닝화입니다.'],
            ['a26', 's1 앞코를 넓게 만든 와이드 러닝화입니다.'],
        ];
        rows.forEach(([id, line], i) => {
            const y = 30 + i * 24;
            s += tag(40, y, id, 'a');
            s += T(82, y + 13, line, 'lbl sm');
        });
        s += box(40, 154, 450, 22, '나머지 25개는 노출되지 않아 근거를 붙이지 않습니다', 'c', 10);
        s += T(40, 196, '코드가 붙이는 근거 문장', 'lbl k');
        s += T(40, 216, '30개 모두', 'lbl') + bar(120, 206, 200, 771, 771, 'c') + T(330, 216, '32문장 771자', 'lbl');
        s += T(40, 236, '노출 5개', 'lbl k') + bar(120, 226, 200, 144, 771, 'a') + T(330, 236, '5문장 144자', 'lbl k');
        s += T(40, 258, '모델은 30개 모두에 근거 id 를 적었고, 답 30개의 출력은 671 토큰입니다', 'lbl sm');
        s += T(40, 276, '5개에만 붙여 줄어드는 것은 붙이는 문장이고, 모델의 출력은 줄지 않습니다', 'lbl sm');
        s += T(40, 294, '근거 id 는 27개 답이 s1 하나였고, 노출된 5개도 모두 s1 입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 한 번에 다 맡기면 잘리는 자리 ----------
    (function () {
        const S = 'lr-listwise'; if (!has(S)) return; let s = '';
        const u = 15;                                 // 항목 하나의 폭
        s += T(40, 20, '30개를 한 번에 주고, 맞는 차례로 정렬한 목록을 받았습니다', 'lbl sm');
        s += T(40, 44, 'run 1, 상한 없음: 693 토큰, 56.7초, 읽음', 'lbl k');
        // 목록 차례의 라벨 덩어리. [라벨, 수]
        let x = 40;
        [['high', 5], ['mid', 4], ['low', 6], ['exclude', 15]].forEach(([name, n]) => {
            s += box(x, 52, n * u - 2, 20, `${name} ${n}`, 'b', 10);
            x += n * u;
        });
        s += T(40 + 2.5 * u, 88, 'a13', 'lbl b', 'middle');
        s += T(40 + 5 * u + 6, 88, '3번째 a13 은 포인트와이즈가 policy_risk 로 거른 광고', 'lbl sm');
        s += T(40, 120, 'run 2, num_predict 400: 400 토큰, 27.8초', 'lbl k');
        for (let i = 0; i < 30; i++) {
            s += i < 17 ? `<rect class="f-c" x="${40 + i * u}" y="128" width="${u - 2}" height="20"/>`
                : `<rect class="track" x="${40 + i * u}" y="128" width="${u - 2}" height="20"/>`;
        }
        const cut = 40 + 17 * u - 1;
        s += `<line class="tick" x1="${cut}" y1="122" x2="${cut}" y2="156"/>`;
        s += T(cut + 6, 170, '다음 항목의 id 를 쓰다 잘림, 907자', 'lbl b');
        s += T(40, 170, '끝까지 적힌 항목 17개', 'lbl sm');
        s += `<line class="split" x1="40" y1="186" x2="490" y2="186"/>`;
        s += T(40, 208, '잘린 JSON 은 읽지 못해 30개 모두 틀린 답으로 셉니다', 'lbl');
        s += T(40, 230, '정답과 맞은 라벨: 목록 run 1 10/30, 포인트와이즈 17/30', 'lbl k');
        s += T(40, 252, '목록 라벨로 순위를 정하면 a13 이 1위, mid 인 a04 가 4위입니다', 'lbl');
        s += T(40, 276, 'num_predict 만 다른 run 2 는 앞 14개 항목만 run 1 과 같았습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
