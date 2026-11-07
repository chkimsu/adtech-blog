/**
 * copy-gen-cards-demo.js — 광고 카피 생성 카드 네 장
 *
 * 광고주 자산 텍스트로 카피를 쓰고, 카피마다 기댄 구절(quote)을 옮겨 적게 한 뒤 코드 게이트 넷이 거르는 자리를 카드 한 장씩으로 그린다.
 * 자산에서 인용, 카피 후보 다섯, 게이트 넷, 생성 없음도 정상 답.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 자산 텍스트와 게이트를 지난 카피, 벽돌색은 모델의 답,
 * 회색은 게이트에 걸리거나 카피를 쓰지 않은 자리이고, 점선은 시스템 메시지와 게이트의 조건이다.
 *
 * 숫자와 카피는 전부 grounded-ad-copy-generation 글의 파이썬 블록 셋이 찍은 출력에서 옮긴 값이다. 자산 텍스트는
 * 가상 값이고 scripts/gen-copy-data.py 가 만든다. 모델의 답은 data/llm-records/grounded-ad-copy-generation.json 이다.
 * 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, tag, tool, file, list, arrow, svg } = window.CardKit;
    const has = id => !!document.getElementById(id);
    // 눈금 상자 안에 n / max 만큼 채운 막대. n 이 0 이면 채우지 않는다
    const bar = (x, y, w, n, max, cls, h = 12) =>
        `<rect class="track" x="${x}" y="${y}" width="${w}" height="${h}"/>` +
        (n > 0 ? `<rect class="f-${cls}" x="${x}" y="${y}" width="${Math.max(2, Math.round(w * n / max))}" height="${h}"/>` : '');

    // ---------- 1. 자산에서 인용 ----------
    (function () {
        const S = 'cg-quote'; if (!has(S)) return; let s = '';
        s += T(40, 20, 'x01 자산의 네 문장에서 카피 다섯이 quote 를 옮겼습니다', 'lbl sm');
        // [문장, 그 문장에 적힌 것]
        const sents = [['문장 1', '입문자용 러닝화'], ['문장 2', '쿠션 폼과 착지'], ['문장 3', '240g 과 넉넉한 앞코'], ['문장 4', '사이즈와 30일 교환']];
        sents.forEach(([name, what], i) => { s += box(40, 34 + i * 40, 170, 28, `${name}  ${what}`, 'a', 10); });
        // [카피 번호, 길이, quote 와 같은가, 문장 차례]
        const copies = [[1, 31, true, 0], [2, 39, true, 1], [3, 34, false, 2], [4, 35, false, 3], [5, 28, true, 3]];
        copies.forEach(([n, len, same, from], i) => {
            const y = 30 + i * 32;
            s += box(300, y, 190, 22, `카피 ${n}, ${len}자${same ? ', quote 와 같음' : ''}`, 'b', 10);
            s += arrow(`cg-quote-${n}`, `M212,${48 + from * 40} L296,${y + 11}`, 'k', { svg: S });
        });
        s += list(40, 204, 330, 50, [{ t: '시스템 메시지의 규칙', cls: 'h' }, 'quote 는 자산에서 글자 그대로 옮긴 구절이다.', '띄어쓰기와 문장 부호도 바꾸지 않는다.']);
        s += T(40, 274, '넷째 문장은 카피 4와 5가 앞뒤로 나눠 옮겼습니다', 'lbl');
        s += T(40, 292, '카피 1, 2, 5 는 quote 와 글자까지 같아, 자산의 문장 그대로입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 카피 후보 다섯 ----------
    (function () {
        const S = 'cg-generate'; if (!has(S)) return; let s = '';
        s += T(40, 20, '자산 하나를 받고, 카피 5개까지와 quote 를 JSON 한 줄로 돌려줍니다', 'lbl sm');
        s += file(40, 34, { label: 'x01 자산' });
        s += arrow('cg-gen-in', 'M92,57 L132,57', 'k', { svg: S });
        s += tool(136, 37, 150, { label: '모델', sub: 'thinking 끔, temperature 0' });
        s += tag(310, 32, 'status ok', 'b');
        s += tag(310, 56, 'candidates 5개', 'b');
        s += T(310, 94, '카피마다 copy 와 quote 의 짝', 'lbl sm');
        // [카피, 길이]
        const rows = [
            ['달리기를 처음 시작하는 사람을 위한 입문자용 러닝화입니다', 31],
            ['밑창 전체에 쿠션 폼을 깔아 착지할 때 발바닥에 오는 충격을 줄였습니다', 39],
            ['한 짝 무게 240g 으로 가볍고 앞코를 넉넉하게 만들었습니다', 34],
            ['사이즈는 230mm 부터 290mm 까지 5mm 단위로 있습니다', 35],
            ['받은 날부터 30일 안에 한 번 교환할 수 있습니다', 28],
        ];
        rows.forEach(([copy, len], i) => {
            const y = 118 + i * 24;
            s += tag(40, y, `${i + 1}`, 'b');
            s += T(70, y + 13, copy, 'lbl sm');
            s += T(490, y + 13, `${len}자`, 'lbl sm', 'end');
        });
        s += `<line class="split" x1="40" y1="246" x2="490" y2="246"/>`;
        s += T(40, 268, '답 10개 모두 읽음. ok 8개가 카피 40개, no_generation 2개', 'lbl k');
        s += T(40, 288, 'ok 8개 모두 상한 5개를 채웠습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 게이트 넷 ----------
    (function () {
        const S = 'cg-gates'; if (!has(S)) return; let s = '';
        const X = 190, W = 220;
        s += T(40, 20, '카피는 게이트 넷을 차례로 지나고, 처음 걸린 게이트에서 빠집니다', 'lbl sm');
        // [이름, 남은 수, 이번에 걸린 수, 오른쪽 글]
        const rows = [['들어온 카피', 40, 0, '40개'], ['1 근거', 35, 5, '5개 걸림'], ['2 길이 40자 이하', 35, 0, '0개'],
            ['3 중복 Jaccard 0.8', 35, 0, '0개'], ['4 최상급 낱말 여섯', 35, 0, '0개']];
        rows.forEach(([name, kept, cut, note], i) => {
            const y = 34 + i * 28;
            s += T(40, y + 11, name, i === 1 ? 'lbl k' : 'lbl');
            s += `<rect class="track" x="${X}" y="${y}" width="${W}" height="14"/>`;
            s += `<rect class="f-${i === 0 ? 'b' : 'a'}" x="${X}" y="${y}" width="${Math.round(W * kept / 40)}" height="14"/>`;
            if (cut) s += `<rect class="f-c" x="${X + Math.round(W * kept / 40)}" y="${y}" width="${Math.round(W * cut / 40)}" height="14"/>`;
            s += T(X + W + 10, y + 11, note, i === 1 ? 'lbl b' : 'lbl sm');
        });
        s += `<line class="split" x1="40" y1="178" x2="490" y2="178"/>`;
        s += T(40, 198, '남은 카피 35개. x08 은 5개 가운데 1개만 남았습니다', 'lbl k');
        s += T(40, 222, 'x08-1 quote', 'lbl sm') + T(124, 222, '김포에서 출발하는 제주 2 박 3 일 자유여행 상품입니다', 'lbl b');
        s += T(40, 242, '자산', 'lbl sm') + T(124, 242, '김포에서 출발하는 제주 2박 3일 자유여행 상품입니다', 'lbl');
        s += T(40, 268, '숫자는 맞았지만 숫자 뒤 공백이 달라 근거 게이트에 걸렸습니다', 'lbl sm');
        s += T(40, 288, '공백을 무시하면 걸린 5개의 quote 가 모두 자산 안에 있습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 생성 없음도 정상 답 ----------
    (function () {
        const S = 'cg-none'; if (!has(S)) return; let s = '';
        s += T(40, 20, '상품 사실이 없는 자산에는 카피 대신 no_generation 을 받습니다', 'lbl sm');
        s += file(40, 34, { label: 'x09' });
        s += file(100, 34, { label: 'x10' });
        s += arrow('cg-none-in', 'M152,57 L186,57', 'k', { svg: S });
        s += tool(190, 37, 120, { label: '모델', sub: 'thinking 끔' });
        s += tag(332, 32, 'status no_generation', 'b');
        s += tag(332, 56, 'candidates []', 'b');
        s += T(332, 94, '카피 0개, 읽은 답', 'lbl sm');
        s += list(40, 110, 450, 36, [{ t: '시스템 메시지의 규칙', cls: 'h' }, '사실이 부족해 카피를 쓸 수 없으면 status 를 no_generation 으로 둔다.']);
        s += T(40, 170, '답의 출력 토큰', 'lbl k');
        // 막대는 가장 많은 답의 263 토큰까지, 눈금은 가장 적은 답의 179 토큰 자리다
        const low = 150 + Math.round(230 * 179 / 270);
        s += T(40, 192, 'ok 8개', 'lbl') + bar(150, 182, 230, 263, 270, 'b') + `<line class="tick" x1="${low}" y1="178" x2="${low}" y2="198"/>`;
        s += T(low, 174, '179', 'lbl sm', 'middle');
        s += T(390, 192, '179~263 토큰', 'lbl');
        s += T(40, 216, 'no_generation 2개', 'lbl') + bar(150, 206, 230, 12, 270, 'c') + T(390, 216, '12 토큰', 'lbl k');
        s += T(40, 236, '걸린 시간은 ok 12.2~27.6초, no_generation 1.4~1.6초입니다', 'lbl sm');
        s += `<line class="split" x1="40" y1="250" x2="490" y2="250"/>`;
        s += T(40, 270, '사실을 적은 8개는 모두 ok, no_generation 은 얇은 자산 둘뿐입니다', 'lbl');
        s += T(40, 290, '코드는 이 답을 게이트 실패와 따로 세고, 광고주에게 안내 문장을 보입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
