// 이벤트 한 건 따라가기 기록 — js/pipeline-replay-data.js 에 담긴 응답을 시간 순서대로 다시 그린다.
// 그림 셋: 1 한 건이 다섯 자리를 지나는 기록, 2 처리기를 멈췄다 켠 동안의 lag, 3 추천 요청 한 건의 구간별 ms.
(function () {
    'use strict';
    const R = window.PIPELINE_REPLAY;
    if (!R) return;
    const $ = (s, r) => (r || document).querySelector(s);
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fmt = (n) => Number(n).toLocaleString('ko-KR');
    const fmtMs = (v) => {
        if (v === null || v === undefined || isNaN(v)) return '-';
        if (v >= 100) return fmt(Math.round(v)) + 'ms';
        if (v >= 10) return Math.round(v) + 'ms';
        return v.toFixed(1) + 'ms';
    };
    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const pretty = (o) => `<pre>${esc(JSON.stringify(o, null, 2))}</pre>`;
    const whenVisible = (node, fn) => {
        if (reduce || !('IntersectionObserver' in window)) return false;
        const io = new IntersectionObserver((es) => {
            if (es.some((e) => e.isIntersecting)) { io.disconnect(); fn(); }
        }, { threshold: 0.25 });
        io.observe(node);
        return true;
    };

    // ---------- 1. 한 건이 다섯 자리를 지나는 기록 ----------
    (function trace() {
        const T = R.trace;
        const tabs = $('#pr-tabs'), trail = $('#pr-trail');
        if (!T || !tabs || !trail) return;
        const replayBtn = $('#pr-replay'), slowBtn = $('#pr-slow'), clk = $('#pr-clock'), sum = $('#pr-sum');
        const HOLD = ((R.lab && R.lab.hold_sec) || 2) * 1000;
        const NOTE = {
            start: '세션 시작. 열려 있던 PLAY 가 있으면 버림',
            open: 'PLAY 열림. 재생 구간 시작',
            already_open: '이미 재생 중이라 그대로',
            close: '구간 닫음. 그동안의 초를 더함',
            no_open_play: '열린 PLAY 가 없어 무시',
            dup_dropped: '같은 event_id 라 버림',
            late_dropped: '이미 지난 시각이라 버림'
        };
        const FIELDS = [['playtime_sec', '누적 재생 초'], ['completed', '완주. 1 이면 END 까지 봄'], ['open_play_ts', '열린 PLAY 의 시각'],
            ['last_ts', '마지막으로 적용한 이벤트 시각'], ['events', '적용한 이벤트 수']];
        const show = (v) => (v === undefined || v === null || v === '') ? '(없음)' : String(v);
        let cur = 2, slow = false, raf = 0, nodes = [];

        tabs.innerHTML = T.events.map((e, i) =>
            `<button type="button" class="pr-btn" data-ev="${i}" data-action="${esc(e.action)}" aria-pressed="${i === cur}">${i + 1}. ${esc(e.action)}</button>`).join('');

        function build(e) {
            const s = e.send, ev = s.event, k = e.kafka, a = e.applied, r = e.status.redis, f = e.features, t = e.t_ms;
            const before = s.before || {}, after = r.hash || {};
            return [
                {
                    t: 0, title: 'API 에 보냅니다', sub: 'POST /events',
                    body: `<div>요청 본문</div>${pretty({ user_id: ev.user_id, video_id: ev.video_id, action: ev.action, ts: ev.ts })}` +
                        `<p>API 가 Kafka 에 넣고 돌려준 답은 partition <b>${s.partition}</b>, offset <b>${s.offset}</b> 입니다. ` +
                        `브로커가 받았다고 답하기까지 <b>${fmtMs(s.produce_ms)}</b>, 보내는 쪽에서 잰 왕복은 ${fmtMs(s.rtt_ms)} 였습니다.</p>` +
                        `<p>API 가 붙인 event_id 는 <code>${esc(ev.event_id)}</code> 입니다. 같은 번호가 또 오면 처리기가 중복으로 버립니다.</p>`
                },
                {
                    t: s.produce_ms, title: 'Kafka 의 한 자리에 앉습니다', sub: `topic ${esc(R.lab.topic)}, partition ${s.partition}`,
                    body: `<div class="pr-tw"><table><thead><tr><th>partition</th><th>offset</th><th>key</th></tr></thead><tbody>` +
                        `<tr><td class="num">${k.partition}</td><td class="num">${k.offset}</td><td class="mono">${esc(k.key)}</td></tr></tbody></table></div>` +
                        `<div style="margin-top:.5rem">값 (메시지 본문)</div>${pretty(k.value)}` +
                        `<p>key 가 사용자 번호라 ${esc(ev.user_id)} 의 이벤트 다섯 건은 모두 partition ${s.partition} 에 차례로 앉았습니다. ` +
                        `처리기가 읽어 가도 이 메시지는 보관 기간 동안 그 자리에 남습니다.</p>`
                },
                {
                    t: t.applied, hold: true, title: '처리기가 들고 있다가 적용합니다', sub: `consumer group ${esc(R.lab.group)}`,
                    body: `<div class="pr-tw"><table><thead><tr><th>읽은 자리</th><th>동작</th><th>결과</th><th>더한 초</th><th>누적 재생 초</th><th>완주</th></tr></thead><tbody>` +
                        `<tr><td class="num">p${a.partition} #${a.offset}</td><td>${esc(a.action)}</td><td>${esc(NOTE[a.note] || a.note)}</td>` +
                        `<td class="num${a.added ? ' chg' : ''}">${a.added}</td><td class="num">${a.playtime_sec}</td><td class="num">${a.completed}</td></tr></tbody></table></div>` +
                        `<p>보낸 지 <b>${fmtMs(t.applied)}</b> 만에 적용됐습니다. 그중 ${HOLD / 1000}초는 일부러 들고 있는 시간입니다. ` +
                        `순서가 뒤바뀌어 온 이벤트를 이벤트 시각 순서로 세우려고 둡니다.</p>`
                },
                {
                    t: t.redis, title: 'Redis 의 값이 바뀝니다', sub: `Hash ${esc(r.key)}`,
                    body: `<div class="pr-tw"><table><thead><tr><th>필드</th><th>뜻</th><th>보내기 전</th><th>보낸 뒤</th></tr></thead><tbody>` +
                        FIELDS.map(([fk, ko]) => {
                            const b = show(before[fk]), af = show(after[fk]);
                            return `<tr><td class="mono">${fk}</td><td>${ko}</td><td class="num">${esc(b)}</td><td class="num${b !== af ? ' chg' : ''}">${esc(af)}</td></tr>`;
                        }).join('') + `</tbody></table></div>` +
                        `<p>파란 글자가 바뀐 필드입니다. 같이 바뀌는 키도 있습니다. <code>${esc(r.viewers.key)}</code> Set 은 이 영상을 본 사용자 ${r.viewers.count}명, ` +
                        `<code>${esc(r.rank.key)}</code> ZSet 은 영상별 누적 재생 초 순위, <code>dedupe:</code> 로 시작하는 String 은 TTL ${show(r.dedupe.ttl)}초짜리 중복 표시입니다.</p>`
                },
                {
                    t: t.api, title: 'API 로 읽으면 그 값이 옵니다', sub: `GET /features/${esc(ev.user_id)}/${esc(ev.video_id)}`,
                    body: `${pretty(f.response)}<p>API 는 위 Hash 를 읽어 숫자로 바꿔 돌려줍니다. 보내는 쪽에서 잰 왕복은 ${fmtMs(f.ms)}, ` +
                        `그중 Redis 를 읽은 시간은 ${fmtMs(f.response.redis_ms)} 입니다.</p>`
                }
            ];
        }

        function lastPoll(e, c) {
            let p = null;
            for (const x of e.polls) { if (x.t * 1000 <= c) p = x; else break; }
            return p;
        }

        function mount(stops) {
            trail.innerHTML = stops.map((s, i) =>
                `<li class="pr-stop" data-stop="${i + 1}"><div class="pr-stop-h"><span class="pr-stop-n">${i + 1}</span>` +
                `<span class="pr-stop-t">${s.title}</span><span class="pr-stop-s">${s.sub}</span><span class="pr-when">아직</span></div>` +
                `<div class="pr-body"><p class="empty">아직 오지 않았습니다</p></div></li>`).join('');
            nodes = [...trail.children].map((li) => ({ li, when: $('.pr-when', li), body: $('.pr-body', li), state: '' }));
        }

        function update(e, stops, c, end) {
            stops.forEach((s, i) => {
                const n = nodes[i];
                const state = c >= s.t ? 'done' : (s.hold && c >= stops[1].t ? 'wait' : '');
                if (state !== n.state) {
                    n.li.classList.remove('done', 'wait');
                    if (state) n.li.classList.add(state);
                    n.when.textContent = state === 'done' ? '+' + fmtMs(s.t) : state === 'wait' ? '들고 있는 중' : '아직';
                    if (state === 'done') n.body.innerHTML = s.body;
                    else if (state === 'wait') n.body.innerHTML = '<div class="pr-hold"><i></i></div><div class="pr-hold-t"></div><p class="pr-hold-p"></p>';
                    else n.body.innerHTML = '<p class="empty">아직 오지 않았습니다</p>';
                    n.state = state;
                }
                if (state === 'wait') {
                    $('.pr-hold i', n.body).style.width = Math.min(100, c / HOLD * 100) + '%';
                    $('.pr-hold-t', n.body).textContent = `${(c / 1000).toFixed(1)}초 지남. hold ${HOLD / 1000}초`;
                    const p = lastPoll(e, c);
                    $('.pr-hold-p', n.body).textContent = p
                        ? `커밋 자리 ${p.committed}, 이 메시지의 자리 ${e.send.offset}, 아직 커밋 안 된 것 ${p.lag}건. 처리기는 이 메시지를 이미 읽어 들고 있습니다.`
                        : '';
                }
            });
            clk.textContent = '+' + fmtMs(Math.min(c, stops[4].t));
            const t = e.t_ms;
            sum.innerHTML = c >= end
                ? `보냄 0ms → Kafka ${fmtMs(e.send.produce_ms)} → 처리기 적용 ${fmtMs(t.applied)} → Redis 값 확인 ${fmtMs(t.redis)} → API 응답 ${fmtMs(t.api)}. 거의 전부가 hold ${HOLD / 1000}초입니다.`
                : '';
        }

        function play(animate) {
            cancelAnimationFrame(raf);
            const e = T.events[cur], stops = build(e);
            const end = stops[4].t + 1;
            mount(stops);
            if (!animate || reduce) { update(e, stops, end, end); return; }
            const t0 = performance.now();
            const step = (now) => {
                const c = Math.min((now - t0) * (slow ? 0.25 : 1), end);
                update(e, stops, c, end);
                if (c < end) raf = requestAnimationFrame(step);
            };
            raf = requestAnimationFrame(step);
        }

        tabs.addEventListener('click', (ev) => {
            const b = ev.target.closest('[data-ev]');
            if (!b) return;
            cur = Number(b.dataset.ev);
            tabs.querySelectorAll('[data-ev]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
            play(true);
        });
        replayBtn.addEventListener('click', () => play(true));
        slowBtn.addEventListener('click', () => {
            slow = !slow;
            slowBtn.setAttribute('aria-pressed', String(slow));
            play(true);
        });
        play(false);
        whenVisible(trail, () => play(true));
    })();

    // ---------- 2. 처리기를 멈췄다 켠 동안의 lag ----------
    (function lag() {
        const L = R.lag;
        const lanes = $('#pr-lanes'), stats = $('#pr-stats'), chart = $('#pr-lag-chart');
        if (!L || !lanes || !stats || !chart) return;
        const F = L.frames, N = F.length;
        const range = $('#pr-lag-range'), playBtn = $('#pr-lag-play'), fastBtn = $('#pr-lag-fast'), stateEl = $('#pr-lag-state'), clk = $('#pr-lag-clock');
        range.max = String(N - 1);
        const maxEnd = Math.max(...F.map((f) => Math.max(...f.parts.map((p) => p[1])))) || 1;
        const maxLag = Math.max(...F.map((f) => f.lag)) || 1;
        const maxWatch = Math.max(...F.map((f) => f.watch_total || 0)) || 1;
        const peak = F.reduce((b, f, i) => (f.lag > F[b].lag ? i : b), 0);

        lanes.innerHTML = F[0].parts.map((p) =>
            `<div class="pr-lane"><b>p${p[0]}</b><div class="pr-bar"><span class="rd"></span><span class="ur"></span></div><span class="nums"></span></div>`).join('');
        const laneEls = [...lanes.children].map((d) => ({ rd: $('.rd', d), ur: $('.ur', d), nums: $('.nums', d) }));
        const STATS = [['sent', '보낸 이벤트'], ['processed', '적용한 이벤트'], ['lag', 'lag, 안 읽은 메시지'], ['buffered', '처리기가 들고 있는 수'], ['watch', '영상 v11 누적 재생 초']];
        stats.innerHTML = STATS.map(([k, ko]) => `<div class="pr-stat"><div class="k">${ko}</div><div class="v" data-k="${k}">-</div></div>`).join('');
        const statEl = Object.fromEntries(STATS.map(([k]) => [k, $(`[data-k="${k}"]`, stats)]));

        // 그림 — 위는 lag, 아래는 영상 v11 의 누적 재생 초. 가로축은 기록 시각(초)
        const W = 760, padL = 46, padR = 16, top1 = 16, h1 = 110, gap = 34, h2 = 70, padB = 26;
        const H = top1 + h1 + gap + h2 + padB;
        const X = (t) => padL + (t / L.end_at) * (W - padL - padR);
        const Y1 = (v) => top1 + (1 - v / maxLag) * h1;
        const top2 = top1 + h1 + gap;
        const Y2 = (v) => top2 + (1 - v / maxWatch) * h2;
        const pts1 = F.map((f) => `${X(f.t).toFixed(1)},${Y1(f.lag).toFixed(1)}`).join(' ');
        const pts2 = F.filter((f) => f.watch_total !== null).map((f) => `${X(f.t).toFixed(1)},${Y2(f.watch_total).toFixed(1)}`).join(' ');
        let s = '';
        s += `<rect class="zone" x="${X(L.pause_at).toFixed(1)}" y="${top1}" width="${(X(L.resume_at) - X(L.pause_at)).toFixed(1)}" height="${top2 + h2 - top1}"/>`;
        s += `<line class="ax" x1="${padL}" y1="${top1 + h1}" x2="${W - padR}" y2="${top1 + h1}"/><line class="ax" x1="${padL}" y1="${top2 + h2}" x2="${W - padR}" y2="${top2 + h2}"/>`;
        s += `<text x="${padL - 6}" y="${Y1(maxLag) + 4}" text-anchor="end">${maxLag}</text><text x="${padL - 6}" y="${top1 + h1 + 4}" text-anchor="end">0</text>`;
        s += `<text x="${padL - 6}" y="${Y2(maxWatch) + 4}" text-anchor="end">${maxWatch}</text><text x="${padL - 6}" y="${top2 + h2 + 4}" text-anchor="end">0</text>`;
        s += `<text class="lab" x="${padL + 4}" y="${top1 + 11}">lag</text><text class="lab" x="${padL + 4}" y="${top2 - 6}">v11 누적 재생 초</text>`;
        for (let t = 0; t <= L.end_at; t += 4) s += `<text x="${X(t).toFixed(1)}" y="${H - 8}" text-anchor="middle">${t}초</text>`;
        (L.marks || []).forEach((m) => {
            s += `<line class="mk" x1="${X(m.t).toFixed(1)}" y1="${top1}" x2="${X(m.t).toFixed(1)}" y2="${top2 + h2}"/>`;
        });
        s += `<text class="lab" x="${((X(L.pause_at) + X(L.resume_at)) / 2).toFixed(1)}" y="${top1 + h1 + 20}" text-anchor="middle">처리기 멈춘 12초</text>`;
        s += `<polyline class="ln" points="${pts1}"/><polyline class="ln2" points="${pts2}"/>`;
        s += `<line class="cur" id="pr-lag-cur" x1="${padL}" y1="${top1}" x2="${padL}" y2="${top2 + h2}"/>`;
        chart.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="기록 시각에 따른 lag 과 영상 v11 의 누적 재생 초">${s}</svg>`;
        const cur = $('#pr-lag-cur');

        let i = 0, timer = 0, fast = false;
        function render(k) {
            i = Math.max(0, Math.min(N - 1, k));
            const f = F[i];
            f.parts.forEach((p, j) => {
                const end = p[1], com = p[2];
                laneEls[j].rd.style.width = (com / maxEnd * 100) + '%';
                laneEls[j].ur.style.left = (com / maxEnd * 100) + '%';
                laneEls[j].ur.style.width = (Math.max(0, end - com) / maxEnd * 100) + '%';
                laneEls[j].nums.textContent = `끝 ${end}, 커밋 ${com}, lag ${p[3]}`;
            });
            statEl.sent.textContent = fmt(f.sent);
            statEl.processed.textContent = fmt(f.processed);
            statEl.lag.textContent = fmt(f.lag);
            statEl.lag.classList.toggle('bad', f.lag > 100);
            statEl.buffered.textContent = fmt(f.buffered);
            statEl.watch.textContent = f.watch_total === null ? '없음' : fmt(f.watch_total);
            stateEl.textContent = f.paused ? '처리기 멈춤' : '처리기 도는 중';
            stateEl.classList.toggle('off', f.paused);
            clk.textContent = `${f.t.toFixed(1)}초 / ${L.end_at}초`;
            const x = X(f.t).toFixed(1);
            cur.setAttribute('x1', x); cur.setAttribute('x2', x);
            range.value = String(i);
        }
        function stop() { clearInterval(timer); timer = 0; playBtn.textContent = i >= N - 1 ? '처음부터 재생' : '재생'; }
        function start() {
            if (i >= N - 1) render(0);
            clearInterval(timer);
            playBtn.textContent = '멈춤';
            timer = setInterval(() => { if (i >= N - 1) { stop(); return; } render(i + 1); }, (L.dt || 0.5) * 1000 / (fast ? 2 : 1));
        }
        playBtn.addEventListener('click', () => (timer ? stop() : start()));
        fastBtn.addEventListener('click', () => {
            fast = !fast;
            fastBtn.setAttribute('aria-pressed', String(fast));
            if (timer) start();
        });
        range.addEventListener('input', () => { stop(); render(Number(range.value)); });
        render(peak);
        whenVisible(chart, () => { render(0); start(); });
    })();

    // ---------- 3. 추천 요청 한 건의 구간별 ms ----------
    (function anatomy() {
        const A = R.anatomy;
        const stack = $('#pr-stack'), tbl = $('#pr-anat'), tot = $('#pr-tot');
        if (!A || !stack || !tbl) return;
        const sumMs = A.steps.reduce((a, s) => a + s.wall_ms, 0);
        stack.innerHTML = A.steps.map((s) => {
            const label = `${esc(s.what)} ${s.wall_ms.toFixed(2)}ms`;
            const parts = [];
            if (s.cpu_ms > 0) parts.push(`<button type="button" class="cpu" style="flex:${s.cpu_ms} 0 0" data-key="${s.key}" aria-pressed="false" aria-label="${label}, CPU" title="${label}"></button>`);
            if (s.wait_ms > 0) parts.push(`<button type="button" class="io" style="flex:${s.wait_ms} 0 0" data-key="${s.key}" aria-pressed="false" aria-label="${label}, 기다림" title="${label}"></button>`);
            return parts.join('');
        }).join('');
        tbl.innerHTML = `<thead><tr><th>구간</th><th>종류</th><th>걸린 시간</th><th>CPU</th><th>기다림</th><th>p99</th></tr></thead><tbody>` +
            A.steps.map((s) => `<tr data-key="${s.key}"><td>${esc(s.what)}</td><td>${esc(s.kind)}</td><td class="num">${s.wall_ms.toFixed(2)}ms</td>` +
                `<td class="num">${s.cpu_ms.toFixed(2)}ms</td><td class="num">${s.wait_ms.toFixed(2)}ms</td><td class="num">${s.p99_ms.toFixed(2)}ms</td></tr>`).join('') + `</tbody>`;
        const model = A.steps.find((s) => s.key === 'model_http');
        tot.textContent = `합 ${A.sum_ms.toFixed(2)}ms = CPU ${A.cpu_sum_ms.toFixed(2)}ms + 기다림 ${A.wait_sum_ms.toFixed(2)}ms` +
            (model ? `. 모델 서버 왕복 ${model.wall_ms.toFixed(2)}ms 가 ${Math.round(model.wall_ms / sumMs * 100)}% 입니다` : '');
        function pick(key) {
            stack.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.key === key)));
            tbl.querySelectorAll('tr[data-key]').forEach((tr) => tr.classList.toggle('on', tr.dataset.key === key));
        }
        stack.addEventListener('click', (e) => { const b = e.target.closest('button[data-key]'); if (b) pick(b.dataset.key); });
        tbl.addEventListener('click', (e) => { const tr = e.target.closest('tr[data-key]'); if (tr) pick(tr.dataset.key); });
    })();

    // ---------- ?fig=N — 글 안에 한 장만 넣을 때 ----------
    const fig = new URLSearchParams(location.search).get('fig');
    if (fig) document.querySelectorAll('.pr-sec').forEach((sec) => { if (sec.dataset.fig !== fig) sec.hidden = true; });
})();
