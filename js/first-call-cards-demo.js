/**
 * first-call-cards-demo.js — LLM 호출 한 번 카드 네 장
 *
 * 노트북의 Ollama 에 보낸 요청 하나가 토큰이 되어 들어가고 답이 돌아오는 자리를 카드 한 장씩으로 그린다.
 * 요청 JSON 의 맨 위 필드 다섯, 두 메시지를 역할 표시로 이은 프롬프트, 응답 JSON 의 필드와 기록 도구가 옮기는 다섯 값,
 * thinking 을 끈 답과 켠 답의 출력 토큰과 시간.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 벽돌색은 이번 요청과 답, 먹색은 모델과 서버와 서버가 붙이는 표시,
 * 파랑은 기록에 남은 값, 회색은 기록에 옮기지 않는 응답 필드이고, 점선 상자는 사람이 미리 적어 둔 시스템 메시지다.
 *
 * 기록에서 온 숫자(토큰 수, 시간, 글자 수, 배수)는 전부 llm-first-call 글 4절 파이썬 블록의 출력에서 옮긴 값이다.
 * 그 블록은 data/llm-records/llm-first-call.json 의 기록을 읽는다. 요청 카드의 주소와 options 값은 글 3절의 요청 코드와 같다.
 * 사용자 문장을 자른 조각 경계는 그림일 뿐이다(토큰 경계는 기록에 없다). 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { esc, T, tw, tag, arrow, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);
    const line = (x, y, str, cls = 'list-t') => `<text class="${cls}" x="${x}" y="${y}">${esc(str)}</text>`;
    // 토큰 조각 하나. 채운 상자에 모노 글자다
    const chip = (x, y, str, cls) => `<rect class="tok ${cls}" x="${x}" y="${y}" width="${tw(str) + 10}" height="18"/>` +
        `<text class="tok-t" x="${x + 5}" y="${y + 12.5}">${esc(str)}</text>`;
    // 값이 0 이면 채운 몫 없이 눈금 상자만 그린다 (hbar 는 0 도 3px 로 채운다)
    const bar = (x, y, w, frac, cls) => (frac > 0 ? hbar(x, y, w, frac, cls, 12) : `<rect class="track" x="${x}" y="${y}" width="${w}" height="12"/>`);

    // ---------- 1. 요청 JSON 의 필드 다섯 ----------
    (function () {
        const S = 'fc-request'; if (!has(S)) return; let s = '';
        s += T(40, 22, '지훈 씨가 보낸 요청의 본문입니다. 오른쪽은 필드마다 하는 일입니다', 'lbl sm');
        s += `<rect class="grp" x="34" y="32" width="310" height="192"/>`;
        s += line(44, 50, 'POST http://localhost:11434/api/chat', 'list-t h');
        s += line(44, 72, '"model": "qwen3.5:27b",');
        s += line(44, 94, '"messages": [');
        // 시스템 메시지는 사람이 미리 적어 둔 글이라 점선 상자, 사용자 메시지는 이번 요청이라 벽돌색 글자다
        s += `<rect class="list" x="50" y="102" width="288" height="20"/>`;
        s += line(58, 116, '{"role": "system", "content": "광고 캠페인 …"},');
        s += line(58, 140, '{"role": "user", "content": "러닝화 신상품 …"}],', 'list-t b');
        s += line(44, 164, '"stream": false,');
        s += line(44, 186, '"think": false,');
        s += line(44, 208, '"options": {"temperature": 0, "seed": 7}');
        s += tag(356, 59, '답할 모델', 'k');
        s += T(356, 108, '할 일 두 문장', 'lbl k') + T(356, 121, '요청마다 같은 글', 'lbl sm');
        s += tag(356, 127, '이번에 물을 것', 'b');
        s += T(356, 168, '답을 다 쓴 뒤 한 번에', 'lbl sm');
        s += T(356, 190, '풀이를 먼저 쓸지', 'lbl sm');
        s += T(356, 212, '다음 토큰을 뽑는 방식', 'lbl sm');
        s += T(40, 254, '두 요청은 think 하나만 다릅니다. 켠 요청은 true 로 보냈습니다', 'lbl');
        s += T(40, 276, 'qwen3.5:27b 는 think 를 빼면 thinking 을 켠 채로 답합니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 두 메시지가 이어진 프롬프트와 토큰 수 ----------
    (function () {
        const S = 'fc-tokens'; if (!has(S)) return; let s = '';
        s += T(40, 22, '서버가 두 메시지를 역할 표시와 함께 이은 프롬프트입니다', 'lbl sm');
        s += chip(40, 30, '<|im_start|>system', 'k');
        s += `<rect class="list" x="40" y="54" width="446" height="46"/>`;
        s += line(48, 68, '광고 캠페인 설명을 읽고 목표를 enum 에서 하나 골라');
        s += line(48, 81, 'JSON {"objective": "<목표>"} 으로만 답한다.');
        s += line(48, 94, 'enum 은 awareness, traffic, conversion, retention 넷이다.');
        // 서버가 붙이는 표시는 먹색, 사용자 문장의 조각은 벽돌색이다. 조각 경계는 그림일 뿐이다
        const pieces = ['러닝', '화', '신', '상품', '출시', '.', '첫', '구매', '를', '늘리', '고', '싶다', '.', '하루', '300', '만', '원'];
        const items = [['<|im_end|>', 'k'], ['<|im_start|>user', 'k'], ...pieces.map(p => [p, 'b']),
            ['<|im_end|>', 'k'], ['<|im_start|>assistant', 'k'], ['<think>', 'k'], ['</think>', 'k']];
        let x = 40, y = 106;
        items.forEach(([t, cls]) => {
            const w = tw(t) + 10;                  // chip() 의 폭과 같다
            if (x + w > 486) { x = 40; y += 22; }
            s += chip(x, y, t, cls);
            x += w + 4;
        });
        s += T(x + 4, y + 13, '끈 요청의 끝', 'lbl sm');
        s += T(40, y + 38, '끈 요청은 빈 풀이 자리로, 켠 요청은 <think> 하나로 끝납니다', 'lbl sm');
        s += T(40, 220, 'prompt_tokens, 프롬프트 전체의 토큰 수', 'lbl k');
        s += T(40, 240, 'thinking 끔', 'lbl') + bar(130, 230, 290, 1, 'a') + T(428, 240, '78개', 'lbl k');
        s += T(40, 260, 'thinking 켬', 'lbl') + bar(130, 250, 290, 76 / 78, 'a') + T(428, 260, '76개', 'lbl k');
        s += T(40, 286, '사용자 문장의 조각 경계는 그림일 뿐입니다. 센 값은 프롬프트 전체의 토큰 수뿐입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 응답 JSON 의 필드와 기록 도구가 옮기는 다섯 값 ----------
    (function () {
        const S = 'fc-response'; if (!has(S)) return; let s = '';
        s += T(40, 22, 'thinking 을 끈 응답의 필드와, 기록 도구가 옮겨 적는 다섯 값입니다', 'lbl sm');
        s += T(40, 42, 'Ollama 응답 필드', 'lbl k') + T(250, 42, '기록 필드와 값', 'lbl k');
        const rows = [
            ['message.content', 'output {"objective": "conversion"}', ''],
            ['prompt_eval_count', 'prompt_tokens 78', ''],
            ['eval_count', 'output_tokens 6', ''],
            ['total_duration', 'elapsed_ms 1,114', '나노초를 ms 로'],
            ['message.thinking', 'thinking_chars 0', '끈 응답에는 없어 0자'],
        ];
        rows.forEach(([from, to, note], i) => {
            const y = 50 + i * 24;
            s += tag(40, y, from, 'k');
            s += arrow('fcr' + i, `M${40 + tw(from) + 18},${y + 9} L246,${y + 9}`, 'a', { svg: S });
            s += tag(250, y, to, 'a');
            if (note) s += T(250 + tw(to) + 22, y + 13, note, 'lbl sm');
        });
        s += tag(40, 170, 'done_reason', 'k') + T(250, 183, 'stop 인지만 보고 적지 않음', 'lbl sm');
        s += T(40, 210, '옮기지 않는 필드', 'lbl k');
        const rest = ['model', 'created_at', 'message.role', 'done', 'load_duration',
            'prompt_eval_cached_count', 'prompt_eval_duration', 'eval_duration'];
        let x = 40, y = 218;
        rest.forEach(t => {
            const w = tw(t) + 14;                  // tag() 의 폭과 같다
            if (x + w > 486) { x = 40; y += 22; }
            s += tag(x, y, t, 'c');
            x += w + 4;
        });
        s += T(40, 278, '시간 필드는 모두 나노초입니다. 기록 도구는 total_duration 만 ms 로 바꿔 적습니다', 'lbl sm');
        s += T(40, 294, '이 버전이 돌려준 필드 가운데 기록에 남는 값은 다섯입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. thinking 을 끈 답과 켠 답 ----------
    (function () {
        const S = 'fc-think'; if (!has(S)) return; let s = '';
        s += T(40, 22, '같은 요청을 thinking 을 끄고 한 번, 켜고 한 번 보낸 두 응답입니다', 'lbl sm');
        const ans = '{"objective": "conversion"}';
        s += T(40, 47, '답', 'lbl k') + tag(130, 34, ans, 'b') + T(130 + tw(ans) + 22, 47, '두 응답 모두 같은 한 줄', 'lbl sm');
        // 지표마다 켠 답의 값을 눈금 끝으로 둔다
        const group = (y, title, off, on, offText, onText) =>
            T(40, y, title, 'lbl k') +
            T(40, y + 18, 'thinking 끔', 'lbl') + bar(130, y + 8, 230, off / on, 'a') + T(368, y + 18, offText, 'lbl k') +
            T(40, y + 36, 'thinking 켬', 'lbl') + bar(130, y + 26, 230, 1, 'a') + T(368, y + 36, onText, 'lbl k');
        s += group(80, 'output_tokens, 풀이가 든 출력 토큰 수', 6, 505, '6개', '505개');
        s += group(138, 'elapsed_ms, 응답을 만드는 데 든 시간', 1114, 31979, '1,114ms, 1.1초', '31,979ms, 32.0초');
        s += group(196, 'thinking_chars, 풀이의 글자 수', 0, 1905, '0자', '1,905자');
        s += T(40, 270, '답은 같고 출력 토큰은 84.2배, 시간은 28.7배가 되었습니다', 'lbl');
        s += T(40, 290, '출력 토큰에는 풀이의 토큰이 들어 있고, 풀이 글은 답과 따로 옵니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
