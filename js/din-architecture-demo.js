/**
 * din-architecture-demo.js — DIN 모델 구조 그림 다섯 장
 *
 * 1번 모델 구조와 3번 무게 그림은 버튼을 누를 때마다 다시 그린다. 나머지는 한 번 그린다.
 * ?fig=N 이 붙으면 N번 그림만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 숫자는 behavior-sequence-attention 글의 민지 씨 예시와 같다.
 * 색은 전부 css/style.css 의 토큰이고 클래스에는 din- 을 붙여 사이트 공용 부품과 겹치지 않게 했다.
 */
(function () {
    'use strict';

    const fig = new URLSearchParams(location.search).get('fig');
    if (fig) document.querySelectorAll('.din-sec').forEach(sec => { if (sec.dataset.fig !== fig) sec.hidden = true; });

    const XL = 'http://www.w3.org/1999/xlink', M = '−';
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const T = (x, y, s, c, an) => `<text class="din-t ${c || ''}" x="${x}" y="${y}" text-anchor="${an || 'start'}">${esc(s)}</text>`;
    const mk = (id, c) => `<marker id="din-m-${c}-${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="din-mk ${c}"/></marker>`;
    function put(id, w, h, label, inner) {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="${XL}" role="img" aria-label="${esc(label)}"><defs>${mk(id, 'a')}${mk(id, 'b')}${mk(id, 'k')}</defs>${inner}</svg>`;
    }
    const box = (x, y, w, h, c) => `<rect class="din-bx ${c}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
    const ar = (sid, pid, d, c) => `<path id="${sid}-${pid}" class="din-ar ${c}" d="${d}" marker-end="url(#din-m-${c}-${sid})"/>`;
    const vec = a => '[' + a.map(v => (v < 0 ? M : '') + Math.abs(v)).join(', ') + ']';
    const f = v => (v < 0 ? M : '') + Math.abs(v).toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
    function dots(pid, c, n, dur) {
        let s = '';
        for (let i = 0; i < n; i++) s += `<circle class="din-dot ${c}" r="4.5"><animateMotion dur="${dur}s" begin="${(i * dur / n).toFixed(2)}s" repeatCount="indefinite"><mpath href="#${pid}" xlink:href="#${pid}"/></animateMotion></circle>`;
        return s;
    }
    function seg(attr, draw, first) {
        document.querySelectorAll(`[${attr}]`).forEach(b => b.addEventListener('click', () => {
            document.querySelectorAll(`[${attr}]`).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
            draw(b.getAttribute(attr));
        }));
        draw(first);
    }

    /* 1번 — 모델 구조 일곱 층 */
    (function () {
        const id = 'din-fig1';
        const AD = {
            run: { n: '러닝화 광고', w: ['1.95', '1.845', '0', '2.4'], u: '[4.911, 0.804, 4.476, 2.919]' },
            cof: { n: '커피머신 광고', w: ['0', '0', '2.062', '0.413'], u: '[0.495, 1.897, ' + M + '1.196, 1.403]' }
        };
        const sq = (x, y, c) => { let o = ''; for (let i = 0; i < 4; i++) o += `<rect class="din-bx ${c}" x="${x + i * 14}" y="${y}" width="11" height="11"/>`; return o; };
        function draw(k) {
            const a = AD[k];
            let s = '';
            const lab = (y, n, t1, t2) => T(820, y, n, 'k') + T(820, y + 20, t1, 'sm') + (t2 ? T(820, y + 38, t2, 'sm') : '');
            s += box(20, 30, 130, 64, 'o') + T(34, 56, '사용자 정보', 'k') + T(34, 78, '나이대, 성별', 'sm');
            s += box(170, 30, 330, 64, 'a') + T(184, 56, '행동 기록', 'k') + T(184, 78, '러닝화 A, 러닝화 B, 커피 원두, 러닝 양말', 'sm');
            s += box(520, 30, 130, 64, 'b') + T(534, 56, '후보 광고', 'k') + T(534, 78, a.n, 'sm');
            s += box(670, 30, 110, 64, 'o') + T(684, 56, '맥락', 'k') + T(684, 78, '시간대, 지면', 'sm');
            s += lab(52, '1 입력', '번호와 값 네 묶음');
            const bx = [182, 262, 342, 422];
            s += sq(57, 150, 'o') + bx.map(x => sq(x, 150, 'a')).join('') + sq(557, 150, 'b') + sq(697, 150, 'o');
            [85, 210, 290, 370, 450, 585, 725].forEach((x, i) => { s += ar(id, 'e' + i, `M${x},96 V142`, 'k'); });
            s += T(240, 190, '행동마다 숫자 4칸', 'sm halo') + lab(150, '2 임베딩', '번호를 숫자 묶음으로');
            s += `<rect class="din-att" x="160" y="222" width="520" height="198"/>` + T(170, 240, 'attention', 'lane halo');
            bx.forEach((x, i) => {
                s += ar(id, 'b' + i, `M${x + 26},164 V250`, 'a');
                s += ar(id, 'g' + i, `M585,164 C585,210 ${x + 60},210 ${x + 58},250`, 'b');
                s += box(x - 8, 252, 72, 56, 'o') + T(x + 28, 274, '무게', 'sm', 'middle') + T(x + 28, 296, a.w[i], 'k mono', 'middle');
                s += ar(id, 'w' + i, `M${x + 28},310 V346`, 'k');
            });
            s += lab(258, '3 activation unit', '행동 하나와 광고를 함께 보고', '무게 하나를 낸다');
            s += box(200, 348, 300, 60, 'k') + T(216, 372, '무게를 곱해 더함', 'on') + T(216, 396, a.u, 'on mono');
            s += lab(358, '4 가중합', '이 광고용 관심 벡터 하나');
            s += box(20, 460, 160, 48, 'o') + T(34, 490, '사용자 정보', 'k');
            s += box(180, 460, 320, 48, 'k') + T(194, 490, '관심 벡터', 'on');
            s += box(500, 460, 160, 48, 'b') + T(514, 490, '광고 벡터', 'k');
            s += box(660, 460, 120, 48, 'o') + T(674, 490, '맥락', 'k');
            s += ar(id, 'c1', 'M85,164 V456', 'k') + ar(id, 'c2', 'M350,410 V456', 'k') + ar(id, 'c3', 'M610,164 C640,250 640,380 590,456', 'b') + ar(id, 'c4', 'M725,164 V456', 'k');
            s += lab(468, '5 이어 붙이기', '네 덩어리를 한 줄로');
            s += ar(id, 'm1', 'M400,510 V552', 'k');
            s += box(240, 554, 320, 60, 'o') + T(256, 578, 'MLP  200 → 80', 'k mono') + T(256, 600, '활성 함수 PReLU 또는 Dice', 'sm');
            s += lab(566, '6 MLP', '광고와 사람을 섞어 계산');
            s += ar(id, 'm2', 'M400,616 V656', 'k');
            s += box(300, 658, 200, 58, 'k') + T(316, 682, 'pCTR', 'on') + T(316, 704, '2칸 softmax → 클릭 확률', 'on');
            s += lab(670, '7 출력', '클릭이 정답, 이것 하나로', '모든 층을 함께 학습');
            s += dots(id + '-b3', 'a', 1, 2) + dots(id + '-g3', 'b', 1, 2) + dots(id + '-w3', 'k', 1, 1.5) + dots(id + '-c2', 'k', 1, 1.5) + dots(id + '-m1', 'k', 1, 1.5) + dots(id + '-m2', 'k', 1, 1.5);
            put(id, 1000, 730, 'DIN 모델 구조. 입력, 임베딩, 행동마다 무게를 내는 activation unit, 가중합, 이어 붙이기, MLP, 출력의 일곱 층. ' + a.n + ' 기준', s);
        }
        seg('data-din-a', draw, 'run');
    })();

    /* 2번 — activation unit 안쪽 */
    (function () {
        const id = 'din-fig2';
        let s = '';
        s += box(20, 20, 150, 50, 'a') + T(34, 50, '행동 벡터', 'k');
        s += box(20, 84, 150, 50, 'b') + T(34, 114, '광고 벡터', 'k');
        s += box(20, 148, 150, 50, 'o') + T(34, 178, '둘의 외적', 'k');
        s += ar(id, 'q0', 'M172,45 C210,45 210,105 238,108', 'a') + ar(id, 'q1', 'M172,109 H238', 'b') + ar(id, 'q2', 'M172,173 C210,173 210,113 238,110', 'k');
        const st = [['이어 붙임', ''], ['Linear 36', '칸 36개'], ['PReLU / Dice', '활성 함수'], ['Linear 1', '칸 1개']];
        st.forEach((t, i) => {
            const x = 240 + i * 170;
            s += box(x, 80, 140, 60, 'o') + T(x + 14, 106, t[0], 'k mono') + (t[1] ? T(x + 14, 128, t[1], 'sm') : '');
            s += ar(id, 'p' + i, `M${x + 142},110 H${x + 168}`, 'k');
        });
        s += box(920, 80, 70, 60, 'k') + T(934, 108, '무게', 'on') + T(934, 128, '하나', 'on');
        s += dots(id + '-p0', 'k', 1, 1.6) + dots(id + '-p2', 'k', 1, 1.6);
        put(id, 1000, 214, 'activation unit 안쪽. 행동, 광고, 외적을 이어 붙여 Linear 36, PReLU 또는 Dice, Linear 1 을 지나 무게 하나를 낸다', s);
    })();

    /* 3번 — 평균과 DIN 의 무게 */
    (function () {
        const id = 'din-fig3';
        const B = [
            { n: '러닝화 A 클릭', d: '12시간 전', v: [0.9, 0.1, 0.8, 0.2] },
            { n: '러닝화 B 클릭', d: '12시간 전', v: [0.8, 0.2, 0.8, 0.2] },
            { n: '커피 원두 구매', d: '9시간 전', v: [0.1, 0.9, -0.7, 0.5] },
            { n: '러닝 양말 클릭', d: '2시간 전', v: [0.7, 0.1, 0.6, 0.9] }
        ];
        const MODE = {
            mean: { ad: null, w: [0.25, 0.25, 0.25, 0.25], u: [0.625, 0.325, 0.375, 0.45],
                cap: '평균: 넷 모두 0.25. 어느 광고를 채점하든 같은 사용자 벡터가 나옵니다.' },
            run: { ad: '러닝화 광고', adv: [0.85, 0.15, 0.8, 0.9], w: [1.95, 1.845, 0, 2.4], u: [4.911, 0.804, 4.476, 2.919],
                cap: '러닝화 광고 앞: 러닝 행동 셋이 1.95, 1.845, 2.4 를 받고 커피 원두는 0 입니다. 합 6.20.' },
            cof: { ad: '커피머신 광고', adv: [0.15, 0.8, -0.7, 0.9], w: [0, 0, 2.062, 0.413], u: [0.495, 1.897, -1.196, 1.403],
                cap: '커피머신 광고 앞: 커피 원두가 2.062, 러닝 양말이 0.413 을 받고 러닝화 둘은 0 입니다. 합 2.48.' }
        };
        function draw(m) {
            const o = MODE[m], ys = [40, 136, 232, 328], max = 2.4;
            let s = T(20, 24, '민지 씨의 행동 넷', 'lane') + T(500, 24, '무게', 'lane', 'middle') + T(820, 24, '사용자 벡터', 'lane');
            B.forEach((b, i) => {
                const y = ys[i], w = o.w[i], zero = w === 0;
                s += box(20, y, 260, 72, 'a' + (zero ? ' dim' : '')) + T(36, y + 28, b.n, 'k') + T(36, y + 52, b.d + '   ' + vec(b.v), 'sm mono');
                const pid = `${id}-l${i}`, sw = zero ? 1.5 : (1.5 + w / max * 9).toFixed(1), cls = `din-ln${zero ? ' zero' : ''}`;
                s += `<path class="${cls}" d="M282,${y + 36} H420" style="stroke-width:${sw}"/>`;
                s += `<path id="${pid}" class="${cls}" d="M640,${y + 36} C720,${y + 36} 720,220 796,220" style="stroke-width:${sw}"/>`;
                s += `<rect class="din-trk" x="430" y="${y + 24}" width="140" height="14"/><rect class="din-wb" x="430" y="${y + 24}" width="${(Math.min(w, max) / max * 140).toFixed(1)}" height="14"/>`;
                s += T(580, y + 36, f(w), 'k mono');
                if (!zero) s += dots(pid, 'a', Math.max(1, Math.round(w * 1.5)), 3.2);
            });
            s += box(800, 150, 186, 140, 'k') + T(816, 178, '사용자 벡터', 'on') + T(816, 210, vec(o.u.slice(0, 2)), 'on mono') + T(816, 236, vec(o.u.slice(2)), 'on mono');
            s += T(816, 270, '합한 무게 ' + o.w.reduce((a, b) => a + b, 0).toFixed(2), 'on');
            if (o.ad) {
                s += box(800, 330, 186, 80, 'b') + T(816, 358, o.ad, 'k') + T(816, 384, vec(o.adv), 'sm mono');
                s += ar(id, 'ad', 'M893,328 V294', 'b') + T(884, 316, '이 광고로 무게를 매김', 'sm', 'end');
            } else {
                s += box(800, 330, 186, 80, 'o') + T(816, 358, '광고를 보지 않음', 'k') + T(816, 384, '무게는 늘 0.25 씩', 'sm');
            }
            put(id, 1000, 440, '행동 넷이 무게만큼 사용자 벡터로 더해지는 그림. ' + o.cap, s);
            const cap = document.getElementById('din-fig3-cap');
            if (cap) cap.textContent = o.cap;
        }
        seg('data-din-m', draw, 'run');
    })();

    /* 4번 — 무게 하나를 손으로 */
    (function () {
        const id = 'din-fig4';
        let s = '';
        s += box(20, 40, 230, 66, 'a') + T(36, 66, '행동: 러닝 양말 클릭', 'k') + T(36, 90, '[0.7, 0.1, 0.6, 0.9]', 'sm mono');
        s += box(20, 140, 230, 66, 'b') + T(36, 166, '광고: 러닝화 광고', 'k') + T(36, 190, '[0.85, 0.15, 0.8, 0.9]', 'sm mono');
        s += ar(id, 'u1', 'M252,73 C290,73 290,120 318,122', 'a') + ar(id, 'u2', 'M252,173 C290,173 290,126 318,124', 'b');
        s += box(320, 30, 250, 186, 'o') + T(336, 56, '16칸으로 이어 붙임', 'k');
        s += T(336, 84, '행동 4칸, 광고 4칸', 'sm') + T(336, 108, '차이 4칸 (행동 ' + M + ' 광고)', 'sm');
        s += T(336, 136, '곱 4칸 (행동 × 광고)', 'k') + T(336, 160, '[0.595, 0.015, 0.48, 0.81]', 'sm mono') + T(336, 186, '곱의 합 1.9', 'sm mono');
        s += ar(id, 'u3', 'M572,123 H618', 'k');
        s += box(620, 76, 170, 94, 'o') + T(636, 104, '작은 신경망', 'k') + T(636, 130, '(1.9 ' + M + ' 0.3) × 1.5', 'sm mono') + T(636, 154, 'activation unit', 'sm');
        s += ar(id, 'u4', 'M792,123 H838', 'k');
        s += box(840, 86, 140, 74, 'k') + T(856, 114, '무게', 'on') + T(856, 146, '2.4', 'on mono');
        s += dots(id + '-u1', 'a', 1, 2.4) + dots(id + '-u2', 'b', 1, 2.4) + dots(id + '-u3', 'k', 1, 1.6) + dots(id + '-u4', 'k', 1, 1.6);
        put(id, 1000, 236, '러닝 양말 행동과 러닝화 광고를 16칸으로 이어 붙여 작은 신경망에 넣으면 무게 2.4 가 나오는 그림', s);
    })();

    /* 5번 — 광고마다 pCTR */
    (function () {
        const id = 'din-fig5';
        let s = '';
        const row = (y, ad, u, c) => {
            let o = box(20, y, 210, 66, 'k') + T(36, y + 26, ad + '용 사용자 벡터', 'on') + T(36, y + 50, u, 'on mono');
            o += box(270, y, 180, 66, 'b') + T(286, y + 26, ad + ' 벡터', 'k') + T(286, y + 50, '광고 정보', 'sm');
            o += box(490, y, 160, 66, 'o') + T(506, y + 26, '그 밖의 정보', 'k') + T(506, y + 50, '시간대, 지면, 기기', 'sm');
            o += ar(id, 'c' + c, `M652,${y + 33} H708`, 'k');
            o += box(710, y, 130, 66, 'o') + T(726, y + 38, '신경망 (MLP)', 'k');
            o += ar(id, 'd' + c, `M842,${y + 33} H878`, 'k') + T(888, y + 38, '그 광고의 pCTR', 'k');
            o += dots(id + '-c' + c, 'k', 1, 1.8) + dots(id + '-d' + c, 'k', 1, 1.8);
            return o;
        };
        s += row(20, '러닝화 광고', '[4.911, 0.804, …]', 1);
        s += row(110, '커피머신 광고', '[0.495, 1.897, …]', 2);
        s += T(20, 200, '세 덩어리를 이어 붙여 넣습니다. 광고마다 한 번씩, 후보 수만큼 돕니다.', 'sm');
        put(id, 1000, 212, '광고마다 만든 사용자 벡터를 광고 벡터, 그 밖의 정보와 함께 신경망에 넣어 pCTR 을 내는 그림', s);
    })();
})();
