/**
 * http-methods-demo.js — 메서드별 요청과 응답 보기
 *
 * 이 페이지 안에서만 도는 가짜 서버 하나와, 그 서버에 요청을 보내는 화면입니다.
 * 자원은 /v1/posts 하나. 메서드는 GET, POST, PUT, PATCH, DELETE.
 * 응답 모양(상태 줄, 헤더, 본문)은 실제 HTTP 가 내는 형식을 그대로 따릅니다.
 */
(function () {
    'use strict';

    // ==========================================
    // 가짜 서버 — 데이터와 처리 규칙
    // ==========================================
    const HOST = 'api.example.com';
    const INITIAL = [
        { id: 11, title: '광고 로그는 어디에 남나', author: 'sooyeon', likes: 4 },
        { id: 12, title: '첫 글', author: 'jihoon', likes: 2 },
        { id: 13, title: 'pCTR 이 뭔가요', author: 'minho', likes: 7 }
    ];
    const REASON = {
        200: 'OK', 201: 'Created', 204: 'No Content',
        400: 'Bad Request', 404: 'Not Found', 405: 'Method Not Allowed'
    };

    let posts = [];
    let nextId = 14;
    let reqSeq = 0;

    function resetServer() {
        posts = INITIAL.map(p => ({ ...p }));
        nextId = 14;
    }

    function clone(p) { return { ...p }; }
    function find(id) { return posts.find(p => p.id === id); }

    // 요청 하나를 받아 응답 하나를 돌려준다. 서버 데이터가 어떻게 바뀌었는지도 함께 준다.
    function handle(req) {
        const diff = { added: [], changed: {}, removed: [] };
        const m = req.path.match(/^\/v1\/posts(?:\/(\d+))?$/);
        if (!m) return respond(404, { error: 'not_found', message: '그런 주소는 없습니다' }, {}, diff);
        const id = m[1] ? parseInt(m[1], 10) : null;

        // 본문이 필요한 메서드는 먼저 JSON 을 읽어 본다
        let body = null;
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            if (!req.body || !req.body.trim()) {
                return respond(400, { error: 'empty_body', message: '본문이 비어 있습니다' }, {}, diff);
            }
            try { body = JSON.parse(req.body); }
            catch (e) { return respond(400, { error: 'invalid_json', message: '본문이 JSON 모양이 아닙니다' }, {}, diff); }
            if (body === null || typeof body !== 'object' || Array.isArray(body)) {
                return respond(400, { error: 'invalid_json', message: '본문은 { } 로 감싼 객체여야 합니다' }, {}, diff);
            }
        }

        if (id === null) {
            // 목록 주소 /v1/posts
            switch (req.method) {
                case 'GET':
                    return respond(200, { items: posts.map(clone), count: posts.length }, {}, diff);
                case 'POST': {
                    if (typeof body.title !== 'string' || !body.title.trim()) {
                        return respond(400, { error: 'missing_field', field: 'title', message: 'title 이 필요합니다' }, {}, diff);
                    }
                    const created = {
                        id: nextId++,
                        title: body.title,
                        author: typeof body.author === 'string' && body.author ? body.author : 'anonymous',
                        likes: 0
                    };
                    posts.push(created);
                    diff.added.push(created.id);
                    return respond(201, clone(created), { Location: '/v1/posts/' + created.id }, diff);
                }
                default:
                    return respond(405, { error: 'method_not_allowed', message: '목록 주소에는 GET 과 POST 만 됩니다' }, { Allow: 'GET, POST' }, diff);
            }
        }

        // 하나 주소 /v1/posts/{id}
        const cur = find(id);
        if (req.method === 'POST') {
            return respond(405, { error: 'method_not_allowed', message: '글 하나 주소에는 POST 를 받지 않습니다' }, { Allow: 'GET, PUT, PATCH, DELETE' }, diff);
        }
        if (!cur) {
            return respond(404, { error: 'not_found', message: id + '번 글이 없습니다' }, {}, diff);
        }
        switch (req.method) {
            case 'GET':
                return respond(200, clone(cur), {}, diff);
            case 'PUT': {
                if (typeof body.title !== 'string' || !body.title.trim()) {
                    return respond(400, { error: 'missing_field', field: 'title', message: 'PUT 은 전체를 보내야 합니다. title 이 없습니다' }, {}, diff);
                }
                const before = clone(cur);
                cur.title = body.title;
                cur.author = typeof body.author === 'string' && body.author ? body.author : 'anonymous';
                cur.likes = Number.isInteger(body.likes) ? body.likes : 0;
                diff.changed[cur.id] = changedFields(before, cur);
                return respond(200, clone(cur), {}, diff);
            }
            case 'PATCH': {
                const before = clone(cur);
                if (typeof body.title === 'string' && body.title.trim()) cur.title = body.title;
                if (typeof body.author === 'string' && body.author) cur.author = body.author;
                if (Number.isInteger(body.likes)) cur.likes = body.likes;
                diff.changed[cur.id] = changedFields(before, cur);
                return respond(200, clone(cur), {}, diff);
            }
            case 'DELETE': {
                posts = posts.filter(p => p.id !== id);
                diff.removed.push(clone(cur));
                return respond(204, null, {}, diff);
            }
        }
        return respond(405, { error: 'method_not_allowed' }, { Allow: 'GET, PUT, PATCH, DELETE' }, diff);
    }

    function changedFields(a, b) {
        return ['title', 'author', 'likes'].filter(k => a[k] !== b[k]);
    }

    function respond(status, obj, extraHeaders, diff) {
        reqSeq += 1;
        const bodyText = obj === null ? '' : JSON.stringify(obj, null, 2);
        const headers = { Date: new Date().toUTCString(), 'X-Request-Id': 'req-' + String(reqSeq).padStart(4, '0') };
        if (obj !== null) {
            headers['Content-Type'] = 'application/json; charset=utf-8';
            headers['Content-Length'] = String(utf8Len(bodyText));
        }
        Object.assign(headers, extraHeaders);
        return { status, reason: REASON[status] || '', headers, body: bodyText, diff, seq: reqSeq };
    }

    function utf8Len(s) { return new TextEncoder().encode(s).length; }

    // ==========================================
    // 화면
    // ==========================================
    const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    const HAS_BODY = { GET: false, POST: true, PUT: true, PATCH: true, DELETE: false };
    const DEFAULT_BODY = {
        POST: '{"title": "지훈 씨의 첫 글", "author": "jihoon"}',
        PUT: '{"title": "통째로 바꿨습니다", "author": "jihoon"}',
        PATCH: '{"title": "제목만 바꿨습니다"}'
    };
    const SCENARIOS = [
        { n: '1', label: '목록 받기', method: 'GET', target: 'list' },
        { n: '2', label: '12번 글 하나 받기', method: 'GET', target: 'one', id: 12 },
        { n: '3', label: '새 글 만들기', method: 'POST', target: 'list', body: DEFAULT_BODY.POST },
        { n: '4', label: '12번 제목만 고치기', method: 'PATCH', target: 'one', id: 12, body: DEFAULT_BODY.PATCH },
        { n: '5', label: '12번 통째로 바꾸기', method: 'PUT', target: 'one', id: 12, body: DEFAULT_BODY.PUT },
        { n: '6', label: '13번 지우기', method: 'DELETE', target: 'one', id: 13 },
        { n: '7', label: '13번 다시 지우기', method: 'DELETE', target: 'one', id: 13 },
        { n: '8', label: '본문 모양이 틀린 요청', method: 'POST', target: 'list', body: '{"title": "따옴표가 빠진 글}' }
    ];

    const $ = id => document.getElementById(id);
    const el = {
        chips: $('hm-chips'), methods: $('hm-methods'), target: $('hm-target'), id: $('hm-id'), idWrap: $('hm-id-wrap'),
        pathNote: $('hm-path-note'), body: $('hm-body'), bodyNote: $('hm-body-note'), send: $('hm-send'), reset: $('hm-reset'),
        reqParts: $('hm-req-parts'), reqBytes: $('hm-req-bytes'), resParts: $('hm-res-parts'), resBytes: $('hm-res-bytes'),
        verdict: $('hm-verdict'), serverBody: $('hm-server-table').querySelector('tbody'), serverCount: $('hm-server-count'),
        logBody: $('hm-log-table').querySelector('tbody')
    };
    if (!el.send) return;

    let method = 'GET';
    let lastDiff = null;      // 마지막 요청이 서버 데이터에 남긴 변화
    let savedBody = { ...DEFAULT_BODY };
    const log = [];

    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ---- 메서드 버튼 ----
    METHODS.forEach(m => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'hm-m'; b.textContent = m; b.dataset.method = m;
        b.addEventListener('click', () => setMethod(m));
        el.methods.appendChild(b);
    });

    function setMethod(m) {
        if (HAS_BODY[method] && el.body.value !== '') savedBody[method] = el.body.value;
        method = m;
        el.methods.querySelectorAll('.hm-m').forEach(b => b.classList.toggle('is-on', b.dataset.method === m));
        if (HAS_BODY[m]) {
            el.body.disabled = false;
            el.body.value = savedBody[m] != null ? savedBody[m] : (DEFAULT_BODY[m] || '');
        } else {
            el.body.disabled = true;
            el.body.value = '';
        }
        // 메서드에 맞는 자연스러운 주소로 옮겨 준다 (사용자가 다시 바꿀 수 있다)
        if (m === 'POST') el.target.value = 'list';
        if (m === 'PUT' || m === 'PATCH' || m === 'DELETE') el.target.value = 'one';
        syncPath();
        renderRequestPreview();
    }

    // ---- 주소 ----
    el.target.addEventListener('change', () => { syncPath(); renderRequestPreview(); });
    el.id.addEventListener('input', renderRequestPreview);
    el.body.addEventListener('input', () => { savedBody[method] = el.body.value; renderRequestPreview(); });

    function syncPath() {
        const one = el.target.value === 'one';
        el.id.disabled = !one;
        el.idWrap.style.opacity = one ? '1' : '0.45';
        el.pathNote.textContent = one ? '글 하나를 가리킵니다' : '글 전체(목록)를 가리킵니다';
    }

    function currentPath() {
        if (el.target.value === 'list') return '/v1/posts';
        const id = parseInt(el.id.value, 10);
        return '/v1/posts/' + (Number.isFinite(id) && id > 0 ? id : 12);
    }

    function buildRequest() {
        const path = currentPath();
        const headers = { Host: HOST, Accept: 'application/json' };
        let body = '';
        if (HAS_BODY[method]) {
            body = el.body.value;
            headers['Content-Type'] = 'application/json';
            headers['Content-Length'] = String(utf8Len(body));
        }
        return { method, path, headers, body };
    }

    // ---- 원문 그리기 ----
    function part(label, html) {
        return '<div class="hm-part"><div class="hm-part-l">' + label + '</div><pre>' + html + '</pre></div>';
    }
    function headerLines(h) {
        return Object.keys(h).map(k => esc(k) + ': ' + esc(h[k])).join('\n');
    }

    function renderRequestPreview() {
        const req = buildRequest();
        const bodyHtml = HAS_BODY[method]
            ? (req.body.trim() ? esc(req.body) : '<span class="dim">(비어 있습니다 — 보내면 400 이 옵니다)</span>')
            : '<span class="dim">(없음 — ' + method + ' 은 본문을 보내지 않습니다)</span>';
        el.reqParts.innerHTML =
            part('메서드와 주소', esc(req.method + ' ' + req.path + ' HTTP/1.1')) +
            part('헤더', headerLines(req.headers)) +
            part('본문', bodyHtml);
        const total = utf8Len(req.method + ' ' + req.path + ' HTTP/1.1\r\n' + headerLines(req.headers) + '\r\n\r\n' + req.body);
        el.reqBytes.textContent = total + ' 바이트';

        el.bodyNote.classList.remove('is-warn');
        if (!HAS_BODY[method]) {
            el.bodyNote.textContent = method + ' 은 본문 없이 주소만으로 뜻이 다 전해집니다. 칸을 잠갔습니다.';
        } else if (!req.body.trim()) {
            el.bodyNote.textContent = '본문이 비어 있습니다.';
        } else {
            try { JSON.parse(req.body); el.bodyNote.textContent = 'JSON 모양이 맞습니다. 값을 고쳐서 보내 봐도 됩니다.'; }
            catch (e) { el.bodyNote.textContent = 'JSON 모양이 아닙니다. 그대로 보내면 서버가 400 으로 돌려보냅니다.'; el.bodyNote.classList.add('is-warn'); }
        }
    }

    function renderResponse(res) {
        const ok = res.status < 400;
        const statusHtml = '<span class="' + (ok ? 'st-ok' : 'st-bad') + '">' + esc('HTTP/1.1 ' + res.status + ' ' + res.reason) + '</span>';
        const bodyHtml = res.body ? esc(res.body) : '<span class="dim">(없음 — 204 는 본문을 싣지 않습니다)</span>';
        el.resParts.innerHTML =
            part('상태 줄', statusHtml) +
            part('헤더', headerLines(res.headers)) +
            part('본문', bodyHtml);
        const total = utf8Len('HTTP/1.1 ' + res.status + ' ' + res.reason + '\r\n' + headerLines(res.headers) + '\r\n\r\n' + res.body);
        el.resBytes.textContent = total + ' 바이트';
    }

    function verdictText(req, res) {
        const d = res.diff;
        const changedIds = Object.keys(d.changed).filter(k => d.changed[k].length);
        let what;
        if (d.added.length) what = '서버 데이터에 <b>' + d.added.join(', ') + '번 글이 새로 생겼습니다.</b> 새 글의 주소가 Location 헤더에 실려 왔습니다.';
        else if (changedIds.length) {
            const id = changedIds[0];
            what = '<b>' + id + '번 글의 ' + d.changed[id].join(', ') + ' 칸이 바뀌었습니다.</b>' +
                (req.method === 'PUT' ? ' PUT 은 통째로 바꾸므로 본문에 없던 칸은 기본값으로 돌아갑니다.' : ' PATCH 는 보낸 칸만 건드립니다.');
        }
        else if (d.removed.length) what = '<b>' + d.removed[0].id + '번 글이 지워졌습니다.</b> 지운 뒤에는 돌려줄 것이 없어 본문 없는 204 가 옵니다.';
        else if (res.status === 200 && req.method === 'GET') what = '<b>서버 데이터는 그대로입니다.</b> GET 은 읽기만 하므로 몇 번을 보내도 같은 답이 옵니다.';
        else if (res.status === 200 && (req.method === 'PUT' || req.method === 'PATCH')) what = '<b>바뀐 칸이 없습니다.</b> 이미 같은 값이라 서버 데이터가 그대로입니다. ' + req.method + ' 은 같은 요청을 두 번 보내도 결과가 같습니다.';
        else if (res.status === 404) what = '<b>그런 글이 없어서 404 가 왔습니다.</b> 서버 데이터는 그대로입니다.';
        else if (res.status === 400) what = '<b>요청 모양이 틀려서 400 이 왔습니다.</b> 서버는 본문을 읽어 보고 처리 전에 돌려보냈습니다. 데이터는 그대로입니다.';
        else if (res.status === 405) what = '<b>이 주소가 받지 않는 메서드라 405 가 왔습니다.</b> 받는 메서드는 Allow 헤더에 적혀 있습니다.';
        else what = '서버 데이터는 그대로입니다.';
        return '<b>' + esc(req.method + ' ' + req.path) + '</b> → ' + esc(res.status + ' ' + res.reason) + '. ' + what;
    }

    // ---- 서버 표 ----
    function renderServer() {
        const d = lastDiff || { added: [], changed: {}, removed: [] };
        const rows = [];
        posts.forEach(p => {
            const cls = d.added.includes(p.id) ? 'added' : (d.changed[p.id] && d.changed[p.id].length ? 'changed' : '');
            const ch = d.changed[p.id] || [];
            const tag = cls === 'added' ? '<span class="hm-tag a">새로 생김</span>'
                : cls === 'changed' ? '<span class="hm-tag a">바뀜</span>' : '';
            rows.push('<tr class="' + cls + '">' +
                '<td class="mono">' + p.id + '</td>' +
                '<td class="' + (ch.includes('title') ? 'diff' : '') + '">' + esc(p.title) + '</td>' +
                '<td class="mono ' + (ch.includes('author') ? 'diff' : '') + '">' + esc(p.author) + '</td>' +
                '<td class="num ' + (ch.includes('likes') ? 'diff' : '') + '">' + p.likes + '</td>' +
                '<td class="tag">' + tag + '</td></tr>');
        });
        d.removed.forEach(p => {
            rows.push('<tr class="removed">' +
                '<td class="mono">' + p.id + '</td><td>' + esc(p.title) + '</td><td class="mono">' + esc(p.author) + '</td>' +
                '<td class="num">' + p.likes + '</td><td class="tag"><span class="hm-tag b">지워짐</span></td></tr>');
        });
        if (!rows.length) rows.push('<tr class="hm-empty"><td colspan="5">글이 하나도 없습니다. POST 로 만들어 보세요.</td></tr>');
        el.serverBody.innerHTML = rows.join('');
        el.serverCount.textContent = posts.length + '건';
    }

    // ---- 기록 표 ----
    function renderLog() {
        if (!log.length) {
            el.logBody.innerHTML = '<tr class="hm-empty"><td colspan="5">아직 보낸 요청이 없습니다.</td></tr>';
            return;
        }
        el.logBody.innerHTML = log.slice().reverse().map(e => {
            const ok = e.status < 400;
            const bodyCell = e.bodyBytes === null ? '<span class="dim">없음</span>' : e.bodyBytes + ' 바이트';
            return '<tr>' +
                '<td class="mono">' + esc(e.reqId) + '</td>' +
                '<td class="mono"><b>' + esc(e.method) + '</b> ' + esc(e.path) + '</td>' +
                '<td><span class="hm-status ' + (ok ? 'ok' : 'bad') + '">' + e.status + ' ' + esc(e.reason) + '</span></td>' +
                '<td class="num">' + bodyCell + '</td>' +
                '<td>' + esc(e.effect) + '</td></tr>';
        }).join('');
    }

    function effectText(res) {
        const d = res.diff;
        const changedIds = Object.keys(d.changed).filter(k => d.changed[k].length);
        if (d.added.length) return d.added.join(', ') + '번 생김';
        if (changedIds.length) return changedIds.join(', ') + '번 바뀜 (' + changedIds.map(k => d.changed[k].join(', ')).join('; ') + ')';
        if (d.removed.length) return d.removed.map(p => p.id).join(', ') + '번 지워짐';
        return '그대로';
    }

    // ---- 보내기 ----
    function send() {
        const req = buildRequest();
        const res = handle(req);
        lastDiff = res.diff;
        log.push({
            reqId: res.headers['X-Request-Id'], method: req.method, path: req.path,
            status: res.status, reason: res.reason,
            bodyBytes: res.body ? utf8Len(res.body) : null, effect: effectText(res)
        });
        if (log.length > 30) log.shift();
        renderRequestPreview();
        renderResponse(res);
        el.verdict.innerHTML = verdictText(req, res);
        renderServer();
        renderLog();
    }

    el.send.addEventListener('click', send);
    el.reset.addEventListener('click', () => {
        resetServer();
        lastDiff = null;
        renderServer();
        el.verdict.innerHTML = '서버 데이터를 처음 상태로 돌렸습니다. 보낸 요청 기록은 그대로 둡니다.';
    });

    // ---- 따라 해 보기 칩 ----
    SCENARIOS.forEach((sc, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'hm-chip';
        b.innerHTML = '<b>' + sc.n + '</b>' + esc(sc.label);
        b.addEventListener('click', () => {
            el.chips.querySelectorAll('.hm-chip').forEach(c => c.classList.remove('is-on'));
            b.classList.add('is-on');
            if (sc.body != null) savedBody[sc.method] = sc.body;
            setMethod(sc.method);
            el.target.value = sc.target;
            if (sc.id != null) el.id.value = sc.id;
            syncPath();
            if (sc.body != null) el.body.value = sc.body;
            send();
        });
        el.chips.appendChild(b);
    });

    // ---- 처음 상태 — 목록을 한 번 받아 둔다 ----
    resetServer();
    setMethod('GET');
    el.target.value = 'list';
    syncPath();
    renderRequestPreview();
    send();
    el.chips.querySelector('.hm-chip').classList.add('is-on');
})();
