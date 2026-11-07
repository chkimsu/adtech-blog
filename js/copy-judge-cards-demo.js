/**
 * copy-judge-cards-demo.js — 생성 문구 판정 카드 네 장
 *
 * 게이트를 지난 광고 카피를 모델이 판정하는 자리를 카드 한 장씩으로 그린다.
 * 판정 세 겹, 같은 카피의 점수 다섯, 좌우 바꾸기, 싼 판정자 먼저.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 코드와 사람 라벨, 벽돌색은 싼 판정자(thinking 끔)의 답,
 * 먹색은 비싼 판정자(thinking 켬)의 답, 회색은 점수가 흔들리거나 승자가 바뀐 자리이고, 점선은 채점표와 고르는 규칙이다.
 *
 * 숫자는 전부 generated-copy-judging-system 글의 파이썬 블록 셋이 찍은 출력에서 옮긴 값이다. 사람 라벨은 가상 값이고
 * scripts/gen-copy-data.py 의 HUMAN 리터럴이다. 판정자의 답은 data/llm-records/generated-copy-judging-system-*.json 이다.
 * 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, tag, list, arrow, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);

    // ---------- 1. 판정 세 겹 ----------
    (function () {
        const S = 'cj-layers'; if (!has(S)) return; let s = '';
        // [자리 이름, 줄 위쪽 y, [[상자 글, 폭, 색]...]]
        const rows = [
            ['노출 전 게이트', 14, [['카피 35개', 92, 'a'], ['게이트 넷(코드)', 116, 'a'], ['판정자의 점수', 104, 'b'], ['내보낼지', 70, 'k']]],
            ['오프라인 비교', 92, [['버전 A, B 의 카피', 116, 'a'], ['판정자의 짝비교', 116, 'b'], ['어느 버전을 쓸지', 150, 'k']]],
            ['사후 원인 귀속', 170, [['심사 거절, 신고', 104, 'c'], ['노출 로그의 카피 id', 128, 'a'], ['quote, 게이트, 점수', 120, 'a'], ['놓친 단계', 62, 'k']]],
        ];
        rows.forEach(([name, y, boxes], r) => {
            s += T(40, y + 8, name, 'lbl k');
            let x = 40;
            boxes.forEach(([txt, w, c], i) => {
                s += box(x, y + 18, w, 26, txt, c, 10);
                if (i < boxes.length - 1) s += arrow(`cj-l-${r}-${i}`, `M${x + w + 2},${y + 31} L${x + w + 16},${y + 31}`, 'k', { svg: S });
                x += w + 20;
            });
        });
        s += list(40, 236, 450, 50, [{ t: '남기는 기록', cls: 'h' }, '카피 id, 자산, quote, 게이트 결과, 판정 점수와 판정자의 버전', '앞의 두 자리가 남긴 기록이 사후 원인 귀속의 재료']);
        svg(S, s);
    })();

    // ---------- 2. 같은 카피의 점수 다섯 ----------
    (function () {
        const S = 'cj-spread'; if (!has(S)) return; let s = '';
        const X = sc => 190 + (sc - 1) * 62;   // 점수 1~5 의 가로 자리
        s += T(40, 16, '벽돌색 점은 싼 판정자의 점수 다섯, 파랑 칸은 사람 라벨', 'lbl sm');
        [1, 2, 3, 4, 5].forEach(sc => { s += T(X(sc), 34, `${sc}점`, 'lbl sm', 'middle'); });
        // [카피 id, 점수 다섯, 사람 라벨, 덧붙일 말]
        const rows = [
            ['x01-3', [5, 5, 3, 5, 5], 5, ''], ['x02-2', [4, 4, 5, 4, 4], 5, ''], ['x03-3', [4, 4, 5, 4, 4], 5, ''],
            ['x03-5', [4, 5, 5, 5, 5], 2, ''], ['x04-5', [4, 4, 3, 4, 4], 2, ''], ['x05-5', [4, 4, 5, 4, 4], 5, ''],
            ['x06-4', [5, 5, 4, 5, 5], 5, ''], ['x07-1', [4, 4, 4, 4, 4], 2, '「~하세요」'], ['x07-4', [4, 4, 4, 4, 4], 2, '「~하세요」'],
        ];
        rows.forEach(([id, five, human, note], i) => {
            const y = 50 + i * 21, width = Math.max(...five) - Math.min(...five);
            s += T(40, y + 4, id, 'lbl k') + T(84, y + 4, `사람 ${human}점`, 'lbl sm');
            if (note) s += T(128, y + 4, note, 'lbl sm');
            s += `<rect class="f-a" x="${X(human) - 13}" y="${y - 7}" width="26" height="14" opacity="0.35"/>`;
            [1, 2, 3, 4, 5].forEach(sc => {
                const n = five.filter(v => v === sc).length;
                for (let k = 0; k < n; k++) s += `<circle class="f-b" cx="${X(sc) + (k - (n - 1) / 2) * 8}" cy="${y}" r="3.4"/>`;
            });
            s += T(490, y + 4, `폭 ${width}`, width > 1 ? 'lbl b' : 'lbl sm', 'end');
        });
        s += `<line class="split" x1="40" y1="242" x2="490" y2="242"/>`;
        s += T(40, 260, '다섯 번 같은 점수 28개, 1점 흔들림 6개, 2점 흔들림 1개', 'lbl k');
        s += T(40, 278, '가운데값과 사람 라벨 16/35 같음, 우연 일치 0.46, kappa -0.00', 'lbl sm');
        s += T(40, 294, '「~하세요」 둘은 다섯 번 모두 4점, 사람 5점 카피 12개도 가운데값 4점', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 좌우 바꾸기 ----------
    (function () {
        const S = 'cj-swap'; if (!has(S)) return; let s = '';
        s += T(40, 18, 'x04-1-5 러닝 양말: 사람 4점 대 2점', 'lbl k');
        s += box(40, 28, 150, 22, 'A x04-1 / B x04-5', 'a', 10);
        s += arrow('cj-s0', 'M192,39 L230,39', 'b', { svg: S });
        s += tag(236, 30, 'winner A', 'b');
        s += T(320, 44, 'x04-1 이 이김', 'lbl sm');
        s += box(40, 60, 150, 22, 'A x04-5 / B x04-1', 'a', 10);
        s += arrow('cj-s1', 'M192,71 L230,71', 'c', { svg: S });
        s += tag(236, 62, 'winner A', 'c');
        s += T(320, 76, 'x04-5 가 이김', 'lbl sm');
        s += T(40, 104, '자리를 바꾸자 승자가 바뀌었습니다. A 자리가 두 번 이겼습니다', 'lbl');
        s += T(40, 132, '같은 자산의 카피 20쌍, 요청 40건', 'lbl k');
        // [이름, 쌍 수, 색]
        const bars = [['두 번 다 같은 카피를 고름', 14, 'b'], ['승자가 바뀜, 모두 A 두 번', 6, 'c'], ['읽지 못한 답이 든 쌍', 0, 'c']];
        bars.forEach(([t, n, c], i) => {
            const y = 142 + i * 26;
            s += T(40, y + 11, t, 'lbl sm') + (n ? hbar(200, y, 220, n / 20, c, 13) : `<rect class="track" x="200" y="${y}" width="220" height="13"/>`)
                + T(428, y + 11, n + '쌍', 'lbl sm');
        });
        s += T(40, 240, 'A 자리가 이긴 요청 26/40건', 'lbl sm');
        s += T(40, 260, '사람 승자가 있는 5쌍: 두 번 다 사람 승자 3쌍, 승자가 바뀐 쌍 2쌍', 'lbl sm');
        s += T(40, 280, '사람 점수가 같은 15쌍은 사람 라벨과의 셈에서 뺐습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 싼 판정자 먼저 ----------
    (function () {
        const S = 'cj-cascade'; if (!has(S)) return; let s = '';
        // 블록 3 이 찍은 값. 결과 두 줄과 세 방식의 걸린 시간(초)이다
        const RESULT = ['x01-3: 싼 판정자 5, 5, 3, 5, 5 → 비싼 판정자 5점, 사람 5점', '바뀐 6쌍: 4쌍은 두 번 다 1번 카피, x03-1-2 와 x02-1-3 은 다시 바뀜'];
        const TIME = [['싼 판정자만', 204.2, '204.2초', 'b'], ['캐스케이드', 3054.6, '3,054.6초', 'k'],
            ['비싼 판정자로 다 볼 때(어림)', 16444.1, '16,444.1초', 'k']];
        s += T(40, 16, '싼 판정자가 모두 보고, 흔들린 것만 비싼 판정자에게 넘깁니다', 'lbl sm');
        s += box(40, 26, 120, 26, '카피 35, 쌍 20', 'a', 10);
        s += arrow('cj-c0', 'M162,39 L178,39', 'k', { svg: S });
        s += box(182, 26, 136, 26, '싼 판정자 215건', 'b', 10);
        s += arrow('cj-c1', 'M320,39 L336,39', 'k', { svg: S });
        s += box(340, 26, 150, 26, '카피 1, 쌍 6 → 13건', 'c', 10);
        s += arrow('cj-c2', 'M415,54 L415,70', 'k', { svg: S });
        s += box(340, 74, 150, 26, '비싼 판정자 13건', 'k', 10);
        s += list(40, 64, 284, 50, [{ t: '넘기는 규칙', cls: 'h' }, '점수 다섯의 폭이 2 이상인 카피는 한 번', '좌우를 바꾸면 승자가 바뀐 쌍은 좌우 두 번']);
        RESULT.forEach((r, i) => { s += T(40, 138 + i * 18, r, 'lbl'); });
        s += T(40, 188, '걸린 시간, USAGE 의 ms 합', 'lbl k');
        const max = TIME[2][1];
        TIME.forEach(([name, v, label, c], i) => {
            const y = 198 + i * 24;
            s += T(40, y + 11, name, 'lbl sm') + hbar(200, y, 210, v / max, c, 13) + T(418, y + 11, label, 'lbl sm');
        });
        s += T(40, 290, '어림은 비싼 판정자의 항목당 평균 × 전체 항목 75개', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
