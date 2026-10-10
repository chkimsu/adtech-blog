/**
 * two-tower-training-demo.js — Two-Tower 학습 그림 여덟 장
 *
 * 1, 2, 8번 그림은 SVG 를 여기서 조립하고, 3번 점수표는 버튼을 누를 때마다 다시 그린다.
 * 4~7번은 demo-two-tower-training.html 에 표로 적혀 있다.
 * ?fig=N 이 붙으면 N번 그림만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 색은 전부 css/style.css 의 토큰이고 클래스에는 tt- 를 붙여 사이트 공용 부품과 겹치지 않게 했다.
 */
(function () {
    'use strict';

    const fig = new URLSearchParams(location.search).get('fig');
    if (fig) document.querySelectorAll('.tt-sec').forEach(sec => { if (sec.dataset.fig !== fig) sec.hidden = true; });

    const XL = 'http://www.w3.org/1999/xlink';
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const T = (x, y, s, cls, anchor) => `<text class="tt-t ${cls || ''}" x="${x}" y="${y}" text-anchor="${anchor || 'start'}">${esc(s)}</text>`;
    // 13px 기준 대략 폭 — 한글 12.5, 그 밖 7.2
    const tw = s => [...s].reduce((n, ch) => n + (/[가-힣]/.test(ch) ? 12.5 : 7.2), 0);
    const mk = (id, c) => `<marker id="tt-m-${c}-${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="tt-mk ${c}"/></marker>`;
    function svg(id, w, h, label, inner) {
        const host = document.getElementById(id);
        if (!host) return;
        host.innerHTML = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="${XL}" role="img" aria-label="${esc(label)}"><defs>${mk(id, 'a')}${mk(id, 'b')}${mk(id, 'k')}${mk(id, 'c')}</defs>${inner}</svg>`;
    }
    const ar = (sid, pid, d, c) => `<path id="${pid}" class="tt-ar ${c}" d="${d}" marker-end="url(#tt-m-${c}-${sid})"/>`;
    // 한 주기(cyc) 안에서 t0~t1 구간에만 움직이는 점
    function seqDot(pid, c, t0, t1, cyc) {
        const e = 0.004;
        return `<circle class="tt-dot ${c}" r="5" opacity="0">` +
            `<animateMotion dur="${cyc}s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;${t0};${t1};1"><mpath href="#${pid}" xlink:href="#${pid}"/></animateMotion>` +
            `<animate attributeName="opacity" dur="${cyc}s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;${(t0 - e).toFixed(3)};${t0};${t1};${(t1 + e).toFixed(3)};1"/></circle>`;
    }
    // 타워 = 좁아지는 층 셋
    const bars = (x, yc, c, hs) => (hs || [88, 64, 40]).map((h, i) => `<rect class="tt-f ${c}" x="${x + i * 22}" y="${yc - h / 2}" width="14" height="${h}"/>`).join('');
    function vec(x, y, c, n, sz, gap) {
        let s = '';
        for (let i = 0; i < n; i++) s += `<rect class="tt-f ${c}" x="${x + i * (sz + gap)}" y="${y}" width="${sz}" height="${sz}"/>`;
        return s;
    }
    const box = (x, y, w, h, c) => `<rect class="tt-bx ${c}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
    function tag(cx, y, label) {
        const w = tw(label) + 18;
        return `<rect class="tt-f k" x="${cx - w / 2}" y="${y}" width="${w}" height="20"/>` + T(cx, y + 14.5, label, 'on', 'middle');
    }

    /* 1 — 두 타워 */
    (function () {
        const id = 'tt-fig1';
        let s = '';
        s += box(12, 28, 184, 100, 'a');
        s += T(26, 54, '회원 정보', 'k') + T(26, 78, '30대, 모바일, 저녁 8시') + T(26, 98, '최근 검색 러닝화 3번') + T(26, 118, '최근 클릭한 광고 5개');
        s += ar(id, 'tt-tw-a1', 'M200,78 H238', 'a');
        s += bars(246, 78, 'a') + T(275, 24, '회원 타워', 'a', 'middle');
        s += ar(id, 'tt-tw-a2', 'M310,78 H348', 'a');
        s += T(422, 58, '회원 벡터', 'a', 'middle') + vec(356, 71, 'a', 8, 14, 3) + T(422, 104, '숫자 64개', 'sm', 'middle');
        s += ar(id, 'tt-tw-a3', 'M494,78 C566,78 600,118 632,140', 'a');

        s += box(12, 172, 184, 100, 'b');
        s += T(26, 198, '광고 정보', 'k') + T(26, 222, '러닝화, 운동화 카테고리') + T(26, 242, '광고주, 소재 문구') + T(26, 262, '광고 번호');
        s += ar(id, 'tt-tw-b1', 'M200,222 H238', 'b');
        s += bars(246, 222, 'b') + T(275, 288, '광고 타워', 'b', 'middle');
        s += ar(id, 'tt-tw-b2', 'M310,222 H348', 'b');
        s += T(422, 202, '광고 벡터', 'b', 'middle') + vec(356, 215, 'b', 8, 14, 3) + T(422, 248, '숫자 64개', 'sm', 'middle');
        s += ar(id, 'tt-tw-b3', 'M494,222 C566,222 600,182 632,160', 'b');

        s += `<circle class="tt-f k" cx="656" cy="150" r="24"/>` + T(656, 155, '내적', 'on', 'middle');
        s += T(692, 142, '점수', 'sm') + T(692, 168, '0.81', 'big');
        s += T(656, 196, '두 타워가', 'sm', 'middle') + T(656, 212, '처음 만나는 곳', 'sm', 'middle');

        const C = 6;
        s += seqDot('tt-tw-a1', 'a', 0.02, 0.18, C) + seqDot('tt-tw-a2', 'a', 0.24, 0.4, C) + seqDot('tt-tw-a3', 'a', 0.46, 0.7, C);
        s += seqDot('tt-tw-b1', 'b', 0.02, 0.18, C) + seqDot('tt-tw-b2', 'b', 0.24, 0.4, C) + seqDot('tt-tw-b3', 'b', 0.46, 0.7, C);
        svg(id, 760, 300, '회원 정보와 광고 정보가 각자 타워를 지나 숫자 64개 벡터가 되고, 두 벡터의 내적이 점수 0.81 이 되는 그림', s);
    })();

    /* 2 — 요청에서 클릭까지 시간 줄 */
    (function () {
        const id = 'tt-fig2';
        let s = `<rect class="tt-track" x="30" y="80" width="700" height="12"/>`;
        const tk = (x, c, time, ev, l1, l2, dash) => {
            let o = `<line class="tt-tick ${c}${dash ? ' dash' : ''}" x1="${x}" y1="68" x2="${x}" y2="104"/>`;
            o += T(x, 38, time, 'sm mono', 'middle') + T(x, 60, ev, 'k ' + c, 'middle');
            if (l1) o += T(x, 126, l1, '', 'middle');
            if (l2) o += T(x, 145, l2, '', 'middle');
            return o;
        };
        s += tk(96, 'a', '20:14:02', '광고 요청', '회원 정보를', '이 시각 값으로 남김');
        s += tk(262, 'k', '20:14:03', '노출', '러닝화 광고가', '화면에 뜬다');
        s += tk(428, 'k', '20:14:09', '클릭', '정답 짝 한 줄', '(요청 때 값, 러닝화)');
        s += tk(620, 'c', '20:14:10', '회원 정보 갱신', '최근 클릭 수 +1', '학습 짝에는 안 씀', true);
        svg(id, 760, 160, '광고 요청, 노출, 클릭, 회원 정보 갱신이 시간순으로 놓인 줄. 학습 짝은 요청 때 값을 쓴다', s);
    })();

    /* 8 — 배포 */
    (function () {
        const id = 'tt-fig8';
        let s = '';
        s += T(12, 18, '매일 밤 한 번', 'lane');
        s += box(12, 44, 150, 76, 'b') + T(26, 72, '광고 정보', 'k') + T(26, 96, '100만 개');
        s += ar(id, 'tt-sv-b1', 'M166,82 H200', 'b');
        s += bars(208, 82, 'b', [64, 48, 32]) + tag(237, 124, '광고 타워 13판');
        s += ar(id, 'tt-sv-b2', 'M272,82 H306', 'b');
        s += vec(314, 58, 'b', 8, 12, 3) + vec(314, 74, 'b', 8, 12, 3) + vec(314, 90, 'b', 8, 12, 3);
        s += T(372, 124, '광고 벡터 100만 개', 'b', 'middle') + T(372, 142, '256MB', 'sm', 'middle');
        s += ar(id, 'tt-sv-b3', 'M440,82 H520', 'b');
        s += box(528, 44, 220, 80, 'list') + T(544, 72, '근사 검색 색인', 'k') + T(544, 94, '벡터 100만 개를 넣은 목록', 'sm') + T(544, 112, 'HNSW, IVF 같은 방식', 'sm');

        s += T(12, 186, '요청마다', 'lane');
        s += box(12, 206, 150, 70, 'a') + T(26, 234, '광고 요청', 'k') + T(26, 258, '회원 A, 저녁 8시');
        s += ar(id, 'tt-sv-a1', 'M166,242 H200', 'a');
        s += bars(208, 242, 'a', [64, 48, 32]) + tag(237, 284, '회원 타워 13판');
        s += ar(id, 'tt-sv-a2', 'M272,242 H306', 'a');
        s += vec(314, 236, 'a', 8, 12, 3) + T(372, 270, '회원 벡터', 'a', 'middle');
        s += ar(id, 'tt-sv-a3', 'M440,242 C510,242 560,190 596,130', 'a');
        s += T(560, 236, '가까운 광고 찾기', 'sm halo', 'middle');
        s += ar(id, 'tt-sv-k1', 'M690,126 V206', 'k');
        s += box(616, 210, 132, 64, 'k') + T(682, 238, '상위 500개', 'on', 'middle') + T(682, 258, 'pCTR 모델로', 'on2', 'middle');

        const C = 8;
        s += seqDot('tt-sv-b1', 'b', 0.02, 0.12, C) + seqDot('tt-sv-b2', 'b', 0.14, 0.24, C) + seqDot('tt-sv-b3', 'b', 0.26, 0.38, C);
        s += seqDot('tt-sv-a1', 'a', 0.46, 0.56, C) + seqDot('tt-sv-a2', 'a', 0.58, 0.68, C) + seqDot('tt-sv-a3', 'a', 0.7, 0.84, C) + seqDot('tt-sv-k1', 'k', 0.86, 0.96, C);
        svg(id, 760, 310, '매일 밤 광고 타워가 광고 100만 개의 벡터를 만들어 색인에 넣고, 요청마다 회원 타워가 회원 벡터를 만들어 색인에서 상위 500개를 찾는 그림', s);
    })();

    /* 3 — 점수표: 처음과 학습 뒤, 온도 셋 */
    (function () {
        const body = document.getElementById('tt-mx-body');
        if (!body) return;
        const MEM = ['회원 A', '회원 B', '회원 C', '회원 D'];
        // 설명을 위한 가상 내적 점수. 줄이 회원, 열이 광고(러닝화, 캠핑 의자, 커피 머신, 요가 매트)
        const M = {
            start: [[0.08, 0.11, -0.03, 0.05], [0.02, 0.06, 0.09, -0.04], [-0.05, 0.10, 0.04, 0.07], [0.12, -0.02, 0.01, 0.03]],
            after: [[0.81, 0.12, -0.10, 0.35], [0.15, 0.77, 0.05, -0.08], [-0.12, 0.09, 0.74, 0.02], [0.40, -0.06, 0.03, 0.79]]
        };
        const st = { m: 'after', tau: 0.1 };
        const f2 = x => (x < 0 ? '−' : '') + Math.abs(x).toFixed(2);
        const fp = v => (v >= 0.9995 && v < 1) ? v.toFixed(4) : v.toFixed(3);
        const fl = v => v < 0.001 ? v.toFixed(4) : v.toFixed(3);
        function softmax(xs) {
            const m = Math.max(...xs), e = xs.map(v => Math.exp(v - m)), s = e.reduce((a, b) => a + b, 0);
            return e.map(v => v / s);
        }
        const avg = document.getElementById('tt-mx-avg');
        const wb = document.getElementById('tt-w-body'), ws = document.getElementById('tt-w-state'), wl = document.getElementById('tt-w-loss');
        function render() {
            let h = '', tot = 0;
            M[st.m].forEach((row, i) => {
                const p = softmax(row.map(c => c / st.tau)), loss = -Math.log(p[i]);
                tot += loss;
                h += `<tr><th scope="row" class="rh">${MEM[i]}</th>`;
                row.forEach((c, j) => {
                    h += `<td class="cell${i === j ? ' ok' : ''}"><span class="v">${f2(c)}</span><span class="pb"><i style="width:${(p[j] * 100).toFixed(1)}%"></i></span><span class="pv">${fp(p[j])}</span></td>`;
                });
                h += `<td class="res">${fp(p[i])}</td><td class="res">${fl(loss)}</td></tr>`;
            });
            body.innerHTML = h;
            avg.textContent = fl(tot / 4);
            const r = M[st.m][0], lg = r.map(c => c / st.tau), p = softmax(lg);
            ws.textContent = `(${st.m === 'after' ? '학습 뒤' : '처음'}, τ = ${st.tau})`;
            wb.innerHTML =
                `<tr><th scope="row">내적 점수</th>${r.map(c => `<td>${f2(c)}</td>`).join('')}</tr>` +
                `<tr><th scope="row">÷ τ</th>${lg.map(c => `<td>${f2(c)}</td>`).join('')}</tr>` +
                `<tr><th scope="row">소프트맥스</th>${p.map((v, j) => `<td${j === 0 ? ' class="ok"' : ''}>${fp(v)}</td>`).join('')}</tr>`;
            wl.innerHTML = `손실 = −log ${fp(p[0])} = <b>${fl(-Math.log(p[0]))}</b>`;
        }
        const pick = (attr, apply) => document.querySelectorAll(`[${attr}]`).forEach(b => b.addEventListener('click', () => {
            apply(b);
            document.querySelectorAll(`[${attr}]`).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
            render();
        }));
        pick('data-tt-m', b => { st.m = b.dataset.ttM; });
        pick('data-tt-t', b => { st.tau = parseFloat(b.dataset.ttT); });
        render();
    })();
})();
