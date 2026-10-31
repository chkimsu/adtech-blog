// 질의 하나 따라가기 기록 — js/search-replay-data.js 에 담긴 응답을 다시 그린다.
// 그림 셋: 1 질의 하나가 BM25 와 kNN 을 거쳐 후보가 되는 길, 2 샤드 지도, 3 바로 넣기와 교체의 p99.
(function () {
    'use strict';
    const S = window.SEARCH_REPLAY;
    if (!S) return;
    const $ = (s, r) => (r || document).querySelector(s);
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fmt = (n) => Number(n).toLocaleString('ko-KR');
    const ms1 = (v) => (v >= 100 ? Math.round(v) : v >= 1 ? v.toFixed(1) : v.toFixed(2)) + 'ms';
    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const whenVisible = (node, fn) => {
        if (reduce || !('IntersectionObserver' in window)) return false;
        const io = new IntersectionObserver((es) => {
            if (es.some((e) => e.isIntersecting)) { io.disconnect(); fn(); }
        }, { threshold: 0.25 });
        io.observe(node);
        return true;
    };

    // ---------- 1. 질의 하나가 후보가 되는 길 ----------
    (function journey() {
        const Q = S.queries;
        const tabs = $('#sr-tabs'), stagesEl = $('#sr-stages'), timeEl = $('#sr-time');
        if (!Q || !tabs || !stagesEl) return;
        const goBtn = $('#sr-go'), clk = $('#sr-clock'), flow = $('#sr-flow'), drop = $('#sr-drop');
        const lb = $('#sr-l-b'), lk = $('#sr-l-k'), lf = $('#sr-l-f');
        const SLOW = 100;
        let cur = 0, raf = 0;
        tabs.innerHTML = Q.map((q, i) => `<button type="button" class="sr-btn" data-q="${i}" aria-pressed="${i === cur}">${esc(q.q)}</button>`).join('');

        function plan(q) {
            const st = q.stages, tk = q.took_ms, et = q.es_took_ms || {};
            const segs = [
                { key: 'bm25', k: '1 BM25', t: '역색인에서 글자로', ms: tk.bm25, cls: 'es', n: `맞은 문서 ${fmt(st.bm25.in)}건 → 위 ${st.bm25.out}건`, es: et.bm25 },
                { key: 'encode', k: '2 질의 벡터', t: '질의를 384차원 벡터로', ms: tk.encode, cls: 'cpu', n: '작은 임베딩 모델 한 번' },
                { key: 'knn', k: '3 kNN', t: 'HNSW 에서 가까운 벡터', ms: tk.knn, cls: 'knn', n: `${esc(String(st.knn.in))} → 위 ${st.knn.out}건`, es: et.knn },
                { key: 'rrf', k: '4 RRF', t: '순위로 합치기', ms: st.rrf.ms, cls: 'cpu', n: `${st.rrf.in}건 → 겹친 것을 합쳐 ${st.rrf.out}건` },
                { key: 'cut', k: '5 거르기', t: '꺼진 상품 빼기', ms: st.cut.ms, cls: 'cpu', n: `${st.cut.in}건 → ${st.cut.out}건` }
            ];
            let acc = 0;
            segs.forEach((s) => { s.from = acc; acc += s.ms; s.to = acc; });
            return { segs, end: acc };
        }

        const statusTag = (h) => (h.status && h.status !== 'active' ? `<span class="sr-tag off">꺼짐</span>` : '');
        const row = (r, h, sc, tags) => `<li><span class="r">${r}</span><span class="tt" title="${esc(h.title)}">${esc(h.title)}</span><span class="sc">${sc}</span>` +
            (tags ? `<span class="tags">${tags}</span>` : '') + `</li>`;
        function fillLists(q, c, p) {
            const done = (key) => c >= p.segs.find((s) => s.key === key).to;
            lb.innerHTML = !done('bm25') ? '<p class="empty">BM25 질의를 기다리는 중</p>'
                : q.bm25.hits.length ? q.bm25.hits.map((h, i) => row(i + 1, h, h.score.toFixed(2), statusTag(h))).join('')
                    : '<p class="empty">맞은 문서가 0건입니다. 질의의 토큰이 상품 이름 어디에도 없습니다.</p>';
            lk.innerHTML = !done('knn') ? '<p class="empty">kNN 질의를 기다리는 중</p>'
                : q.knn.hits.map((h, i) => row(i + 1, h, h.score.toFixed(3), statusTag(h))).join('');
            lf.innerHTML = !done('rrf') ? '<p class="empty">두 목록을 기다리는 중</p>'
                : q.hybrid.hits.map((h, i) => row(i + 1, h, h.score.toFixed(4),
                    (h.rank_bm25 ? `<span class="sr-tag b">B ${h.rank_bm25}</span>` : '') +
                    (h.rank_knn ? `<span class="sr-tag k">K ${h.rank_knn}</span>` : '') + statusTag(h))).join('');
            const st = q.stages;
            if (done('cut')) {
                flow.textContent = `BM25 ${st.bm25.out}건 + kNN ${st.knn.out}건 = ${st.rrf.in}건 → 겹친 것을 합쳐 ${st.rrf.out}건 → 꺼진 것 ${st.rrf.out - st.cut.out}건을 빼고 ${st.cut.out}건 → 랭킹 모델로. ` +
                    `API 안에서 ${ms1(p.end)}, 보내는 쪽에서 잰 왕복 ${ms1(q.round_trip_ms)}`;
                drop.innerHTML = q.dropped && q.dropped.length
                    ? `거르기에서 빠진 상품 예: ` + q.dropped.slice(0, 3).map((d) => `<span class="sr-tag off">꺼짐</span>${esc(d.title)}`).join(', ')
                    : '';
            } else { flow.textContent = ''; drop.innerHTML = ''; }
        }
        function mount(p) {
            stagesEl.innerHTML = p.segs.map((s) =>
                `<div class="sr-stage" data-stage="${s.key}"><div class="k">${s.k}</div><div class="t">${s.t}</div>` +
                `<div class="v">-</div><div class="n">${s.n}</div></div>`).join('');
            timeEl.innerHTML = p.segs.map((s) => `<span class="${s.cls}" style="flex:${Math.max(s.ms, 0.05)} 0 0"></span>`).join('') + '<i></i>';
        }
        function update(q, p, c) {
            p.segs.forEach((s, i) => {
                const box = stagesEl.children[i];
                const state = c >= s.to ? 'done' : c >= s.from ? 'run' : '';
                box.classList.toggle('done', state === 'done');
                box.classList.toggle('run', state === 'run');
                $('.v', box).textContent = state === 'done' ? ms1(s.ms) + (s.es !== undefined ? ` (ES 안 ${ms1(s.es)})` : '') : state === 'run' ? '도는 중' : '-';
            });
            $('i', timeEl).style.left = `calc(${Math.min(100, c / p.end * 100)}% - 1px)`;
            clk.textContent = '+' + ms1(Math.min(c, p.end));
            fillLists(q, c, p);
        }
        function play(animate) {
            cancelAnimationFrame(raf);
            const q = Q[cur], p = plan(q);
            mount(p);
            if (!animate || reduce) { update(q, p, p.end); return; }
            const t0 = performance.now();
            const step = (now) => {
                const c = Math.min((now - t0) / SLOW, p.end);
                update(q, p, c);
                if (c < p.end) raf = requestAnimationFrame(step);
            };
            raf = requestAnimationFrame(step);
        }
        tabs.addEventListener('click', (e) => {
            const b = e.target.closest('[data-q]');
            if (!b) return;
            cur = Number(b.dataset.q);
            tabs.querySelectorAll('[data-q]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
            play(true);
        });
        goBtn.addEventListener('click', () => play(true));
        play(false);
        whenVisible(stagesEl, () => play(true));
    })();

    // ---------- 2. 샤드 지도 ----------
    (function shards() {
        const D = S.shards, host = $('#sr-nodes'), facts = $('#sr-facts');
        if (!D || !host) return;
        const byNode = {};
        D.rows.forEach((r) => { (byNode[r.node] = byNode[r.node] || []).push(r); });
        host.innerHTML = Object.keys(byNode).sort().map((node) =>
            `<div class="sr-node"><h3>노드 ${esc(node)}</h3><div class="sr-shards">` +
            byNode[node].sort((a, b) => Number(a.shard) - Number(b.shard)).map((r) =>
                `<div class="sr-shard ${r.prirep === 'p' ? 'p' : 'r'}" data-prirep="${r.prirep}" data-shard="${esc(r.shard)}">` +
                `<div class="p">${r.prirep === 'p' ? 'PRIMARY' : 'REPLICA'}</div><div class="h">샤드 ${esc(r.shard)}</div>` +
                `<div class="m">${fmt(r.docs)}건, ${esc(r.store)}</div></div>`).join('') +
            `</div></div>`).join('');
        const idx = D.rows[0] ? D.rows[0].index : '';
        facts.innerHTML = [`인덱스 <b>${esc(idx)}</b>`, `문서 <b>${fmt(D.docs)}</b>건`, `노드 <b>${D.nodes}</b>대`,
            `세그먼트 <b>${D.segments}</b>개, 복사본마다 1개`, `클러스터 상태 <b>${esc(D.cluster)}</b>`].map((x) => `<span>${x}</span>`).join('');
    })();

    // ---------- 3. 바로 넣기와 교체 ----------
    (function swap() {
        const W0 = S.swap, chart = $('#sr-swap-chart');
        if (!W0 || !chart) return;
        const P = W0.series, N = P.length;
        const range = $('#sr-swap-range'), playBtn = $('#sr-swap-play'), fastBtn = $('#sr-swap-fast'), clk = $('#sr-swap-clock');
        const statsEl = $('#sr-swap-stats'), tbl = $('#sr-swap-tbl');
        range.max = String(N - 1);
        const tEnd = P[N - 1].t;
        const swapMark = (W0.marks || []).find((m) => m.label.indexOf('교체') >= 0);
        const tSwap = swapMark ? swapMark.t : W0.b_window[1];
        const maxY = Math.ceil(Math.max(...P.map((p) => p.p99)) / 50) * 50;
        const Wd = 760, H = 262, padL = 46, padR = 14, top = 48, padB = 26, h = H - top - padB;
        const X = (t) => padL + (t / tEnd) * (Wd - padL - padR);
        const Y = (v) => top + (1 - v / maxY) * h;
        let s = '';
        s += `<rect class="za" x="${X(W0.a_window[0]).toFixed(1)}" y="${top}" width="${(X(W0.a_window[1]) - X(W0.a_window[0])).toFixed(1)}" height="${h}"/>`;
        s += `<rect class="zb" x="${X(W0.b_window[0]).toFixed(1)}" y="${top}" width="${(X(W0.b_window[1]) - X(W0.b_window[0])).toFixed(1)}" height="${h}"/>`;
        for (let v = 50; v <= maxY; v += 50) s += `<line class="grid" x1="${padL}" y1="${Y(v).toFixed(1)}" x2="${Wd - padR}" y2="${Y(v).toFixed(1)}"/><text x="${padL - 6}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end">${v}</text>`;
        s += `<line class="ax" x1="${padL}" y1="${top + h}" x2="${Wd - padR}" y2="${top + h}"/><text x="${padL - 6}" y="${top + h + 4}" text-anchor="end">0</text>`;
        s += `<text class="lab" x="${padL - 6}" y="${top - 8}" text-anchor="end">ms</text>`;
        for (let t = 0; t <= tEnd; t += 10) s += `<text x="${X(t).toFixed(1)}" y="${H - 8}" text-anchor="middle">${t}초</text>`;
        const SHORT = (label) => label.replace('(가) 운영 인덱스에 bulk 시작', '가 시작').replace('(가) 끝', '가 끝').replace('(나) forcemerge', 'force merge')
            .replace('(나) 교체', '교체').replace(/^\(나\) /, '');
        const marks = (W0.marks || []).filter((m) => m.label.indexOf('새 인덱스 만들기 시작') < 0);
        marks.forEach((m, i) => {
            const x = X(m.t).toFixed(1);
            s += `<line class="mk" x1="${x}" y1="${top}" x2="${x}" y2="${top + h}"/>`;
            s += `<text class="lab" x="${x}" y="${top - 32 + (i % 3) * 13}" text-anchor="middle">${esc(SHORT(m.label))}</text>`;
        });
        const line = (key) => P.map((p) => `${X(p.t).toFixed(1)},${Y(p[key]).toFixed(1)}`).join(' ');
        s += `<polyline class="p50" points="${line('p50')}"/><polyline class="p99" points="${line('p99')}"/>`;
        s += `<line class="cur" id="sr-swap-cur" x1="${padL}" y1="${top}" x2="${padL}" y2="${top + h}"/>`;
        chart.innerHTML = `<svg viewBox="0 0 ${Wd} ${H}" role="img" aria-label="1초마다의 검색 p50 과 p99">${s}</svg>`;
        const curLine = $('#sr-swap-cur');

        const STATS = [['t', '기록 시각'], ['p99', 'p99'], ['p50', 'p50'], ['alias', '읽기 별칭이 가리키는 인덱스']];
        statsEl.innerHTML = STATS.map(([k, ko]) => `<div class="sr-stat"><div class="k">${ko}</div><div class="v${k === 'alias' ? ' sm' : ''}" data-k="${k}">-</div></div>`).join('');
        const st = Object.fromEntries(STATS.map(([k]) => [k, $(`[data-k="${k}"]`, statsEl)]));

        const stepMs = Object.fromEntries(((W0.steps || []).find((x) => Array.isArray(x.detail)) || { detail: [] }).detail);
        const ph = Object.fromEntries((W0.phases || []).map((r) => [r[0], r]));
        const secs = (v) => (v >= 1000 ? (v / 1000).toFixed(1) + '초' : Math.round(v) + 'ms');
        const rows = [
            ['a', 'a', `(가) 운영 인덱스에 바로 bulk, ${fmt(W0.n)}건`, W0.a_seconds + '초', W0.a_p99_avg, W0.a_p99_max],
            ['b', 'create', '(나) create, 새 인덱스 만들기 (replica 0, refresh 끔)', secs(stepMs.create || 0), ph.create && ph.create[2], ph.create && ph.create[3]],
            ['b', 'bulk', '(나) bulk, 3만 건 넣기', secs(stepMs.bulk || 0), ph.bulk && ph.bulk[2], ph.bulk && ph.bulk[3]],
            ['b', 'refresh', '(나) refresh, replica 켜고 green 기다리기', secs(stepMs.refresh || 0), ph.refresh && ph.refresh[2], ph.refresh && ph.refresh[3]],
            ['b', 'forcemerge', '(나) force merge, 세그먼트를 1개로', secs(stepMs.forcemerge || 0), ph.forcemerge && ph.forcemerge[2], ph.forcemerge && ph.forcemerge[3]],
            ['b', 'swap', '(나) 별칭 교체', secs(stepMs.swap || 0), null, null],
            ['', 'after', '교체 뒤 30초', '-', W0.after_p99_avg, null]
        ];
        const cell = (v) => (v === null || v === undefined ? '-' : v.toFixed(1) + 'ms');
        tbl.innerHTML = `<thead><tr><th>단계</th><th>걸린 시간</th><th>그동안 p99 평균</th><th>그동안 p99 최대</th></tr></thead><tbody>` +
            rows.map((r) => `<tr class="${r[0]}" data-ph="${r[1]}"><td>${esc(r[2])}</td><td class="num">${r[3]}</td><td class="num">${cell(r[4])}</td><td class="num">${cell(r[5])}</td></tr>`).join('') + `</tbody>`;

        let i = 0, timer = 0, fast = true;
        function render(k) {
            i = Math.max(0, Math.min(N - 1, k));
            const p = P[i];
            st.t.textContent = `${Math.round(p.t)}초`;
            st.p99.textContent = p.p99.toFixed(1) + 'ms';
            st.p99.classList.toggle('bad', p.p99 > 50);
            st.p50.textContent = p.p50.toFixed(1) + 'ms';
            const ra = W0.read_alias || {};
            st.alias.textContent = ((p.t >= tSwap ? ra.after : ra.before) || ['-'])[0];
            clk.textContent = `${Math.round(p.t)}초 / ${Math.round(tEnd)}초`;
            const x = X(p.t).toFixed(1);
            curLine.setAttribute('x1', x); curLine.setAttribute('x2', x);
            range.value = String(i);
            tbl.querySelectorAll('tr[data-ph]').forEach((tr) => tr.classList.remove('on'));
            const inA = p.t >= W0.a_window[0] && p.t <= W0.a_window[1];
            let on = inA ? 'a' : null;
            if (!on) {
                const order = marks.filter((m) => m.t <= p.t);
                const last = order[order.length - 1];
                if (last && p.t <= W0.b_window[1] + 0.5) {
                    const m = last.label;
                    on = m.indexOf('create') >= 0 ? 'create' : m.indexOf('bulk') >= 0 && m.indexOf('(나)') >= 0 ? 'bulk' : m.indexOf('refresh') >= 0 ? 'refresh'
                        : m.indexOf('forcemerge') >= 0 ? 'forcemerge' : m.indexOf('교체') >= 0 ? 'swap' : null;
                }
                if (!on && p.t > tSwap + 1) on = 'after';
            }
            if (on) { const tr = tbl.querySelector(`tr[data-ph="${on}"]`); if (tr) tr.classList.add('on'); }
        }
        function stop() { clearInterval(timer); timer = 0; playBtn.textContent = i >= N - 1 ? '처음부터 재생' : '재생'; }
        function start() {
            if (i >= N - 1) render(0);
            clearInterval(timer);
            playBtn.textContent = '멈춤';
            timer = setInterval(() => { if (i >= N - 1) { stop(); return; } render(i + 1); }, 1000 / (fast ? 4 : 1));
        }
        playBtn.addEventListener('click', () => (timer ? stop() : start()));
        fastBtn.addEventListener('click', () => {
            fast = !fast;
            fastBtn.setAttribute('aria-pressed', String(fast));
            if (timer) start();
        });
        range.addEventListener('input', () => { stop(); render(Number(range.value)); });
        const peak = P.reduce((b, p, k) => (p.p99 > P[b].p99 ? k : b), 0);
        render(peak);
        whenVisible(chart, () => { render(0); start(); });
    })();

    // ---------- ?fig=N — 글 안에 한 장만 넣을 때 ----------
    const fig = new URLSearchParams(location.search).get('fig');
    if (fig) document.querySelectorAll('.sr-sec').forEach((sec) => { if (sec.dataset.fig !== fig) sec.hidden = true; });
})();
