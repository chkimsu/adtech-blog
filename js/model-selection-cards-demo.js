/**
 * model-selection-cards-demo.js — LLM 모델 고르기 카드 네 장
 *
 * 모델을 고를 때 보는 네 가지를 카드 한 장씩으로 그린다. 상용 API 와 공개 가중치 두 갈래,
 * 전체 파라미터와 활성 파라미터와 메모리와 컨텍스트 길이, hard 10개에 thinking 을 끄고 켠 답, 요청 한 건의 값.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 먹색은 모델과 서버와 모델 계열 이름,
 * 파랑은 thinking 을 끈 답과 입력 토큰과 활성 파라미터, 벽돌색은 thinking 을 켠 답과 출력 토큰이다.
 * 회색은 문서에 없는 값이고, 점선 상자는 가상 값(단가와 요청 크기)이다.
 *
 * 모델 크기, 활성 파라미터, 메모리, 컨텍스트 길이는 llm-model-selection 글 1절과 2절의 표에서 옮긴 문서 값이다.
 * 맞힘, 토큰, 시간, 배수는 그 글 4절 파이썬 블록의 출력에서 옮겼다(기록 data/llm-records/llm-model-selection.json).
 * 단가, 요청 크기, 요청 한 건과 하루의 값은 5절 파이썬 블록의 출력에서 옮겼다. 글의 표나 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, tw, box, labelUnder, tag, srv, file, user, list, arrow, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);
    // 이름표를 한 줄에 늘어놓고 right 를 넘으면 다음 줄로 내린다 (tag() 의 폭과 같다)
    const chips = (x0, y0, names, cls, right) => {
        let x = x0, y = y0, out = '';
        names.forEach(n => {
            const w = tw(n) + 14;
            if (x + w > right) { x = x0; y += 22; }
            out += tag(x, y, n, cls);
            x += w + 4;
        });
        return out;
    };

    // ---------- 1. 상용 API 와 공개 가중치 ----------
    (function () {
        const S = 'ms-landscape'; if (!has(S)) return; let s = '';
        s += T(40, 22, '요청이 어디서 처리되는지, 가중치를 받는지로 두 갈래입니다', 'lbl sm');
        // 왼쪽: 만든 회사의 서버로만 부르는 상용 API
        s += `<rect class="grp" x="30" y="32" width="226" height="210"/>`;
        s += T(42, 52, '상용 API', 'lbl k');
        s += chips(42, 60, ['Claude', 'GPT', 'Gemini'], 'k', 244);
        s += user(62, 106, '서비스 코드');
        s += arrow('msl0', 'M82,118 L176,118', 'k', { svg: S });
        s += T(98, 110, '요청과 글', 'lbl sm');
        s += srv(184, 92, { label: '회사의 서버', cls: 'k' });
        s += T(42, 192, '가중치: 받지 않음', 'lbl');
        s += tag(42, 200, '크기: 문서에 없음', 'c');
        s += T(42, 236, '컨텍스트 길이: 100만 토큰 안팎', 'lbl sm');
        // 오른쪽: 가중치를 받아 직접 운영하는 서버에서 돌리는 공개 가중치
        s += `<rect class="grp" x="264" y="32" width="226" height="210"/>`;
        s += T(276, 52, '공개 가중치', 'lbl k');
        s += chips(276, 60, ['Qwen3.5', 'Llama 4', 'Gemma 4', 'DeepSeek-V4'], 'k', 478);
        s += file(284, 106) + labelUnder(305, 158, '가중치 파일', 'k');
        s += arrow('msl1', 'M334,128 L410,128', 'k', { svg: S });
        s += T(346, 120, '내려받음', 'lbl sm');
        s += srv(418, 100, { label: '회사 안 서버', cls: 'k' });
        s += T(276, 192, '가중치: 받음, 라이선스를 따름', 'lbl');
        s += T(276, 212, '크기와 활성 파라미터: 모델 카드에 있음', 'lbl sm');
        s += T(276, 236, '요청이 회사 밖으로 나가지 않음', 'lbl sm');
        s += T(40, 264, 'Qwen 과 DeepSeek 은 가중치를 공개하면서 만든 회사의 API 로도 엽니다', 'lbl');
        s += T(40, 284, '이 글의 기록은 노트북의 qwen3.5:27b 로 했습니다. 받은 파일은 19GB 입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 크기, 활성 파라미터, 메모리, 컨텍스트 길이 ----------
    (function () {
        const S = 'ms-size'; if (!has(S)) return; let s = '';
        s += T(40, 22, '막대 전체가 전체 파라미터, 채운 몫이 토큰 하나에 계산하는 활성 파라미터입니다', 'lbl sm');
        const rows = [
            ['Gemma 4 31B', 30.7, 30.7, '30.7B 전부'],
            ['qwen3.5:27b', 27.4, 27.4, '27.4B 전부'],
            ['Gemma 4 26B A4B', 25.2, 3.8, '25.2B 중 3.8B'],
            ['Qwen3.5-35B-A3B', 35, 3, '35B 중 3B'],
            ['Llama 4 Scout', 109, 17, '109B 중 17B'],
            ['DeepSeek-V4-Pro', 1600, 49, '1.6T 중 49B'],
        ];
        rows.forEach(([name, total, active, text], i) => {
            const y = 34 + i * 24;
            s += T(40, y + 11, name, 'lbl k') + hbar(150, y, 220, active / total, 'a', 12) + T(378, y + 11, text, 'lbl');
        });
        // 메모리는 전체 파라미터를 따라간다. Gemma 문서의 4비트 값이다
        s += T(40, 192, '4비트로 올릴 때 메모리, Gemma 문서의 값', 'lbl k');
        s += T(40, 211, 'Gemma 4 31B', 'lbl') + hbar(150, 201, 220, 1, 'k', 12) + T(378, 211, '17.5GB', 'lbl k');
        s += T(40, 229, 'Gemma 4 26B A4B', 'lbl') + hbar(150, 219, 220, 14.4 / 17.5, 'k', 12) + T(378, 229, '14.4GB', 'lbl k');
        s += T(40, 256, '컨텍스트 길이: Gemma 4 E2B, E4B 는 128K, 나머지 셋 256K, qwen3.5 262,144 토큰', 'lbl sm');
        s += T(40, 274, 'Claude, GPT, Gemini 는 100만 토큰 안팎, Llama 4 Scout 은 10M 토큰입니다', 'lbl sm');
        s += T(40, 292, 'K 는 약 1,000, M 은 약 100만입니다. 상용 셋은 크기를 문서에 적지 않았습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. hard 10개의 thinking 끔과 켬 ----------
    (function () {
        const S = 'ms-thinking'; if (!has(S)) return; let s = '';
        s += T(40, 22, 'hard 10개를 thinking 을 끄고 한 번, 켜고 한 번 물은 답입니다', 'lbl sm');
        // 4절 블록 3단계가 찍은 맞음과 틀림이다. 켠 답은 10개 모두 맞았다
        const ids = ['p11', 'p12', 'p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19', 'p20'];
        const off = [true, false, false, false, false, true, true, false, false, true];
        const cell = (x, y, ok, cls) => (ok ? box(x, y, 30, 18, '맞음', cls, 9.5)
            : `<rect class="track" x="${x}" y="${y}" width="30" height="18"/>` + T(x + 15, y + 12.5, '틀림', 'lbl sm', 'middle'));
        ids.forEach((id, k) => {
            const x = 128 + k * 36;
            s += T(x + 15, 42, id, 'lbl sm', 'middle') + cell(x, 48, off[k], 'a') + cell(x, 72, true, 'b');
        });
        s += T(40, 61, 'thinking 끔', 'lbl') + T(40, 85, 'thinking 켬', 'lbl');
        s += T(40, 114, '맞힘: thinking 끔 4개, 켬 10개', 'lbl k');
        // 지표마다 켠 답의 값을 눈금 끝으로 둔다
        const group = (y, title, offVal, onVal, offText, onText) =>
            T(40, y, title, 'lbl k') +
            T(40, y + 18, 'thinking 끔', 'lbl') + hbar(128, y + 8, 240, offVal / onVal, 'a', 12) + T(376, y + 18, offText, 'lbl k') +
            T(40, y + 36, 'thinking 켬', 'lbl') + hbar(128, y + 26, 240, 1, 'b', 12) + T(376, y + 36, onText, 'lbl k');
        s += group(138, '출력 토큰 합, 풀이 토큰이 들어 있음', 83, 7713, '83개', '7,713개');
        s += group(196, '걸린 시간 합', 11.3, 493.4, '11.3초', '493.4초');
        s += T(40, 266, '켜면 출력 토큰 92.9배, 시간 43.6배가 되었습니다', 'lbl');
        s += T(40, 286, '더 맞힌 6개에 출력 토큰 7,630개를 더 썼습니다. 하나에 1,272개입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 요청 한 건과 하루 100만 요청의 값 ----------
    (function () {
        const S = 'ms-cost'; if (!has(S)) return; let s = '';
        s += list(40, 12, 446, 50, [
            { t: '가상 단가, 100만 토큰당', cls: 'h' },
            '작은 모델 입력 400원, 출력 1,600원 / 큰 모델 입력 4,000원, 출력 20,000원',
            '요청 한 건: 입력 1,200 토큰 (시스템 1,000 + 사용자 200), 출력 150 토큰',
        ]);
        // 막대 길이는 큰 모델 한 건 7.80원을 300px 로 둔다. 파랑이 입력, 벽돌색이 출력이다
        const scale = 300 / 7.80;
        const rows = [
            ['작은 모델', 0.48, 0.24, '한 건 0.72원, 하루 720,000원'],
            ['큰 모델', 4.80, 3.00, '한 건 7.80원, 하루 7,800,000원'],
            ['큰 모델 + 시스템 캐시', 1.20, 3.00, '한 건 4.20원, 하루 4,200,000원'],
        ];
        rows.forEach(([name, inp, out, text], i) => {
            const y = 86 + i * 48;
            const wi = Math.max(3, Math.round(inp * scale)), wo = Math.max(3, Math.round(out * scale));
            s += T(40, y, name, 'lbl k') + T(196, y, text, 'lbl');
            s += `<rect class="f-a" x="40" y="${y + 8}" width="${wi}" height="14"/>`;
            s += `<rect class="f-b" x="${40 + wi}" y="${y + 8}" width="${wo}" height="14"/>`;
            s += T(48 + wi + wo, y + 19, `입력 ${inp.toFixed(2)}원, 출력 ${out.toFixed(2)}원`, 'lbl sm');
        });
        s += T(40, 242, '큰 모델은 작은 모델의 10.8배입니다. 캐시를 쓰면 큰 모델이 54% 가 됩니다', 'lbl');
        s += T(40, 262, '캐시를 쓴 경우는 시스템 메시지 1,000 토큰을 입력 단가의 0.1배로 읽습니다', 'lbl sm');
        s += T(40, 280, '큰 모델에서 출력은 토큰 수의 11% 인데 값의 38% 입니다', 'lbl sm');
        s += T(40, 296, '실제 단가는 각 회사의 가격 문서에 있습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
