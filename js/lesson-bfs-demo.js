/**
 * 과외 BFS 데모 — 화면
 *   js/lesson-bfs-demo.js
 *
 * 계산은 js/lesson-bfs-model.js 의 LessonBfs 가 한다. 모델이 돌려준 이벤트 목록(scan, found, visit)을
 * 「한 칸」, 「한 겹」, 「끝까지」로 재생하며 격자, 큐, 결과, 이번 단계 문장을 그린다.
 * 화면 상태는 「이벤트를 몇 개까지 보였나」(S.at) 하나이고, 그릴 때마다 이벤트를 처음부터 다시 쌓는다.
 *
 * 주소 약속 — demo-lesson-bfs.html?embed=1&mode=<islands|layers|path>&preset=<PRESETS 키>
 *   인자가 없으면 islands 모드의 islands-3x3 이다. 프리셋이 있으면 모드는 프리셋의 모드를 따르고,
 *   모드만 있으면 그 모드의 첫 격자(MODE_DEFAULT)를 고른다.
 *   블로그 글이 이 주소 셋을 iframe 으로 쓴다: islands + islands-3x3, layers + cross-5x5, path + maze-5x5.
 */
(function () {
    'use strict';

    const B = window.LessonBfs;
    if (!B) return;

    // 모드마다 처음 고르는 격자. 깊이별 확산은 겹이 가장 잘 보이는 십자 섬을 먼저 보인다.
    const MODE_DEFAULT = { islands: 'islands-3x3', layers: 'cross-5x5', path: 'maze-5x5' };

    const PRESET_NAME = {
        'islands-3x3': '섬 지도',
        'islands-4x5': '섬 지도',
        'open-3x3': '열린 땅',
        'cross-5x5': '십자 섬',
        'maze-5x5': '미로',
    };

    const NOTE = {
        islands: "땅('1') 칸이 상하좌우로 붙어 있으면 한 섬입니다. 칸을 누르면 땅과 바다('0')가 바뀝니다.",
        layers: '시작 칸에서 상하좌우로 한 칸씩 퍼집니다. 칸을 누르면 땅과 바다가 바뀝니다. 시작 칸은 바뀌지 않습니다.',
        path: '(0, 0) 에서 출발해 맨 아래 오른쪽 출구까지 갑니다. 칸을 누르면 길과 벽이 바뀝니다. 시작 칸과 출구 칸은 바뀌지 않습니다.',
    };

    // 해설 패널에 붙이는 한 문장 — 그 격자에서 무엇을 누르고 어디를 보면 되나
    const HINT = {
        islands: ' 「끝까지」를 누르면 결과 칸에 찾은 섬의 수가 나옵니다.',
        layers: ' 「한 겹」을 누를 때마다 같은 깊이의 칸이 한 겹씩 칠해집니다.',
        path: ' 「끝까지」를 누르면 출구에 적힌 깊이와 경로가 보입니다.',
    };

    const KIND_CLASS = { '1': 'is-land', '0': 'is-water', '.': 'is-road', '#': 'is-wall' };
    const KIND_NAME = { '1': '땅', '0': '바다', '.': '길', '#': '벽' };
    const TO_NAME = { '1': '땅으로', '0': '바다로', '.': '길로', '#': '벽으로' };

    const LEGEND = {
        islands: [['is-land', '땅'], ['is-water', '바다'], ['is-scan', '지금 살펴보는 칸']],
        layers: [['is-land', '땅'], ['is-water', '바다']],
        path: [['is-road', '길'], ['is-wall', '벽'], ['is-path', '경로']],
    };

    // ==========================================
    // 글자 도구
    // ==========================================

    const $ = id => document.getElementById(id);
    const cellKey = (r, c) => r + ',' + c;
    const pos = (r, c) => `(${r}, ${c})`;
    const isAt = (rc, r, c) => !!rc && rc[0] === r && rc[1] === c;
    // 깊이 색은 --series-1..6 을 깊이 순서로 되풀이한다
    const fill = d => `var(--series-${(d % 6) + 1})`;

    // 조사 — 숫자를 읽은 소리의 받침으로 고른다 (2, 4, 5, 9 로 끝나면 받침이 없다. 0 은 「영」이라 받침이 있다)
    const hasBatchim = n => ![2, 4, 5, 9].includes(Math.abs(n) % 10);
    const isRieul = n => [1, 7, 8].includes(Math.abs(n) % 10); // 일, 칠, 팔
    const 을를 = n => (hasBatchim(n) ? '을' : '를');
    const 은는 = n => (hasBatchim(n) ? '은' : '는');
    const 으로 = n => (!hasBatchim(n) || isRieul(n) ? '로' : '으로');

    // 격자 이름 — 「3×3 섬 지도, 땅 4칸」. 개수는 프리셋의 격자에서 센다.
    function presetLabel(key) {
        const p = B.PRESETS[key];
        const size = `${p.rows.length}×${p.rows[0].length}`;
        const count = ch => p.rows.join('').split(ch).length - 1;
        if (p.mode === 'islands') return `${size} ${PRESET_NAME[key]}, 땅 ${count('1')}칸`;
        if (p.mode === 'layers') return `${size} ${PRESET_NAME[key]}, 시작 ${pos(p.start[0], p.start[1])}`;
        return `${size} ${PRESET_NAME[key]}, 벽 ${count('#')}칸`;
    }

    // 격자를 고르면 해설 패널에 쓰는 문장 (js/demo-edu-content.js 의 lesson-bfs 항목이 부른다)
    window.lessonBfsDescribe = function (key) {
        const p = B.PRESETS[key];
        if (!p) return '';
        return B.describePreset(key) + HINT[p.mode];
    };

    // ==========================================
    // 상태
    // ==========================================

    const S = {
        key: '',
        mode: 'islands',
        rows: [],
        start: null,
        goal: null,
        trace: null,
        events: [],
        at: 0,        // 보인 이벤트 수. 0 이면 처음 상태
        flash: '',    // 칸을 누른 뒤 한 번만 앞에 붙이는 문장
        cells: [],
    };

    function readUrl() {
        const q = new URLSearchParams(location.search);
        const preset = q.get('preset');
        const mode = q.get('mode');
        if (B.PRESETS[preset]) return preset;
        if (MODE_DEFAULT[mode]) return MODE_DEFAULT[mode];
        return MODE_DEFAULT.islands;
    }

    function fillOptions(mode, key) {
        const keys = Object.keys(B.PRESETS).filter(k => B.PRESETS[k].mode === mode);
        keys.sort((a, b) => (b === MODE_DEFAULT[mode]) - (a === MODE_DEFAULT[mode]));
        const sel = $('lb-preset');
        sel.innerHTML = keys.map(k => `<option value="${k}">${presetLabel(k)}</option>`).join('');
        sel.value = key;
    }

    function load(key) {
        const p = B.PRESETS[key];
        S.key = key;
        S.mode = p.mode;
        S.rows = p.rows.slice();
        // 최단 거리는 (0, 0) 이 시작, 맨 아래 오른쪽 칸이 출구다. toggleCell 도 이 두 칸을 바꾸지 않는다.
        const R = S.rows.length, C = S.rows[0].length;
        S.start = p.mode === 'path' ? [0, 0] : (p.start || null);
        S.goal = p.mode === 'path' ? [R - 1, C - 1] : null;
        S.flash = '';
        document.querySelectorAll('.lb-tab').forEach(t => t.setAttribute('aria-pressed', String(t.dataset.mode === S.mode)));
        $('lb-preset-note').textContent = NOTE[S.mode];
        buildBoard();
        retrace();
        render();
    }

    function retrace() {
        if (S.mode === 'islands') S.trace = B.islandTrace(S.rows);
        else if (S.mode === 'layers') S.trace = B.bfsTrace(S.rows, S.start, '1');
        else S.trace = B.pathTrace(S.rows, S.start, S.goal);
        S.events = S.trace.events;
        S.at = 0;
    }

    // S.at 개의 이벤트를 처음부터 다시 쌓아 지금 화면에 필요한 값을 만든다.
    // before 는 마지막 이벤트 바로 전의 큐다. visit 이 새로 넣은 이웃을 셀 때 쓴다.
    function view() {
        const visited = new Map();
        const areas = [];
        const foundAt = [];
        let queue = S.mode === 'islands' ? [] : [[S.start[0], S.start[1], 0]];
        let before = queue;
        let last = null;
        let found = 0;
        for (let i = 0; i < S.at; i++) {
            const e = S.events[i];
            before = queue;
            if (e.type === 'scan') {
                queue = [];
            } else if (e.type === 'found') {
                found = e.island;
                areas[e.island - 1] = 0;
                foundAt[e.island - 1] = [e.r, e.c];
                queue = [[e.r, e.c, 0]];
            } else {
                visited.set(cellKey(e.r, e.c), { depth: e.depth, island: e.island });
                if (e.island) areas[e.island - 1] += 1;
                queue = e.queue;
            }
            last = e;
        }
        return { visited, areas, foundAt, queue, before, last, found };
    }

    // ==========================================
    // 격자
    // ==========================================

    function axis(text, cls) {
        const n = document.createElement('span');
        n.className = 'lb-axis' + (cls ? ' ' + cls : '');
        n.textContent = text;
        return n;
    }

    function buildBoard() {
        const board = $('lb-board');
        const C = S.rows[0].length;
        board.style.gridTemplateColumns = `1.4rem repeat(${C}, var(--lb-cell))`;
        board.innerHTML = '';
        board.appendChild(axis(''));
        for (let c = 0; c < C; c++) board.appendChild(axis(String(c)));
        S.cells = S.rows.map((row, r) => {
            board.appendChild(axis(String(r), 'is-row'));
            return [...row].map((ch, c) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'lb-cell';
                b.dataset.r = r;
                b.dataset.c = c;
                b.innerHTML = '<span class="lb-cell-tag"></span><span class="lb-cell-num"></span>';
                board.appendChild(b);
                return b;
            });
        });
    }

    function renderCells(v, showPath) {
        const queued = new Set(v.queue.map(q => cellKey(q[0], q[1])));
        const path = showPath ? S.trace.path : [];
        const pathIdx = new Map(path.map(([r, c], i) => [cellKey(r, c), i]));
        const last = v.last;
        S.rows.forEach((row, r) => {
            [...row].forEach((ch, c) => {
                const b = S.cells[r][c];
                const k = cellKey(r, c);
                const vis = v.visited.get(k);
                const cls = ['lb-cell', KIND_CLASS[ch]];
                let tag = isAt(S.start, r, c) ? '시작' : isAt(S.goal, r, c) ? '출구' : '';
                let text = ch === '#' ? '벽' : '';
                if (vis) {
                    cls.push('is-visited');
                    b.style.setProperty('--lb-fill', fill(vis.depth));
                    text = String(vis.depth);
                    if (vis.island) tag = `섬 ${vis.island}`;
                } else {
                    b.style.removeProperty('--lb-fill');
                }
                if (queued.has(k)) cls.push('is-queued');
                if (last && last.r === r && last.c === c) {
                    if (last.type === 'scan') cls.push('is-scan');
                    else if (!showPath) cls.push('is-current');
                    if (last.type === 'found') tag = `섬 ${last.island}`;
                }
                if (pathIdx.has(k)) {
                    cls.push('is-path');
                    // 경로에서 앞뒤 칸이 오른쪽이나 아래에 있으면 이 칸이 그쪽 연결선을 그린다
                    const i = pathIdx.get(k);
                    [path[i - 1], path[i + 1]].forEach(n => {
                        if (!n) return;
                        if (n[0] === r && n[1] === c + 1) cls.push('is-link-r');
                        if (n[0] === r + 1 && n[1] === c) cls.push('is-link-d');
                    });
                }
                b.className = cls.join(' ');
                b.firstChild.textContent = tag;
                b.lastChild.textContent = text;
                b.setAttribute('aria-label', `${pos(r, c)} ${KIND_NAME[ch]}${vis ? `, 깊이 ${vis.depth}` : ''}`);
            });
        });
    }

    function renderLegend() {
        const depths = S.events.filter(e => e.type === 'visit').map(e => e.depth);
        const maxDepth = depths.length ? Math.max(...depths) : 0;
        const chips = [0, 1, 2, 3, 4, 5].map(d => `<i class="lb-depth" style="--lb-fill:${fill(d)}">${d}</i>`).join('');
        const item = (cls, name) => `<span class="lb-legend-item"><i class="lb-swatch ${cls}"></i>${name}</span>`;
        $('lb-legend').innerHTML =
            `<span class="lb-legend-item">깊이 색 <span class="lb-depths">${chips}</span></span>` +
            item('is-current', '지금 꺼낸 칸') +
            item('is-queued', '큐에서 기다리는 칸') +
            LEGEND[S.mode].map(([cls, name]) => item(cls, name)).join('') +
            (maxDepth >= 6 ? '<p class="lb-legend-note">이 격자에는 깊이 6 이상인 칸이 있어서, 깊이 6 부터 깊이 0 의 색을 다시 씁니다.</p>' : '') +
            '<p class="lb-legend-note">칸 좌표는 (행, 열) 입니다. 위 숫자가 열, 왼쪽 숫자가 행입니다.</p>';
    }

    // ==========================================
    // 결과, 이번 단계, 큐
    // ==========================================

    function renderResult(v, ended) {
        let main;
        let sub = '';
        if (S.mode === 'islands') {
            main = `찾은 섬 ${v.found}개`;
            sub = v.areas.map((a, i) => `섬 ${i + 1} 넓이 ${a}칸`).join(', ');
            if (ended && !v.found) sub = '격자에 땅이 없습니다.';
        } else if (S.mode === 'layers') {
            const per = [];
            v.visited.forEach(({ depth }) => { per[depth] = (per[depth] || 0) + 1; });
            main = per.length
                ? per.map((k, d) => `<span class="lb-seg"><i class="lb-chip" style="--lb-fill:${fill(d)}"></i>깊이 ${d} 에 ${k}칸</span>`).join(', ')
                : '아직 꺼낸 칸이 없습니다';
            if (ended) sub = `가장 먼 칸은 깊이 ${per.length - 1} 입니다.`;
        } else if (!ended) {
            main = '아직 출구에 닿지 않았습니다';
            sub = '출구를 큐에서 꺼내는 순간의 깊이가 출구까지 이동 수입니다.';
        } else if (S.trace.moves >= 0) {
            main = `출구까지 ${S.trace.moves}번 이동`;
            sub = `경로 ${S.trace.path.length}칸, 시작 칸과 출구 칸을 포함합니다.`;
        } else {
            main = '출구에 갈 수 없습니다';
            sub = '벽이 출구로 가는 길을 모두 막았습니다.';
        }
        $('lb-result-main').innerHTML = main;
        $('lb-result-sub').textContent = sub;
    }

    function startText() {
        if (S.mode === 'islands') {
            return '처음 상태입니다. 「한 칸」을 누르면 (0, 0) 부터 오른쪽으로, 줄이 끝나면 다음 줄로 한 칸씩 살펴봅니다. ' +
                '아직 세지 않은 땅을 만나면 섬을 하나 세고 그 칸에서 BFS 로 섬 전체를 칠합니다.';
        }
        const [sr, sc] = S.start;
        const goal = S.mode === 'path' ? ` 출구는 ${pos(S.goal[0], S.goal[1])} 입니다.` : '';
        return `처음 상태입니다. 시작 칸 ${pos(sr, sc)} ${을를(sc)} 깊이 0 으로 큐에 넣었습니다.${goal} ` +
            '「한 칸」은 큐 맨 앞 칸 하나를 꺼냅니다. 「한 겹」은 깊이가 바뀔 때까지 꺼냅니다.';
    }

    function visitText(e, v) {
        const here = pos(e.r, e.c);
        if (S.mode === 'path' && isAt(S.goal, e.r, e.c)) {
            return `큐 맨 앞 ${here} ${을를(e.c)} 꺼냈습니다. 출구이고 깊이가 ${e.depth} 이므로 출구까지 최소 ${e.depth}번 움직입니다. ` +
                `여기서 탐색을 멈추고, 시작 칸부터 출구까지 지나온 ${S.trace.path.length}칸을 경로로 표시합니다.`;
        }
        let t = S.mode === 'islands'
            ? `큐 맨 앞 ${here} ${을를(e.c)} 꺼냈습니다. 섬 ${e.island} 에서 깊이 ${e.depth} 인 칸입니다.`
            : `큐 맨 앞 ${here} ${을를(e.c)} 꺼냈습니다. 깊이 ${e.depth} 인 칸입니다.`;
        // 꺼내기 전 큐에서 맨 앞 한 칸이 빠졌으니, 그보다 뒤에 붙은 칸이 이번에 넣은 이웃이다
        const added = e.queue.slice(Math.max(0, v.before.length - 1));
        if (added.length) {
            const tail = added[added.length - 1];
            t += ` 아직 방문하지 않은 이웃 ${added.map(q => pos(q[0], q[1])).join(', ')} ${을를(tail[1])} ` +
                `깊이 ${e.depth + 1} ${으로(e.depth + 1)} 큐 맨 뒤에 넣었습니다.`;
        } else {
            t += ` 새로 넣을 이웃이 없습니다. 상하좌우가 ${S.mode === 'path' ? '벽' : '바다'}이거나 격자 밖이거나 이미 큐에 들어갔던 칸입니다.`;
        }
        const next = S.events[S.at];
        const nextVisit = next && next.type === 'visit' ? next : null;
        if (S.mode === 'islands') {
            // 다음 이벤트가 같은 섬의 visit 이면 그 섬의 BFS 가 아직 이어진다
            const n = e.island;
            if (nextVisit && nextVisit.island === n) return t;
            t += ` 큐가 비어 섬 ${n} ${을를(n)} 다 칠했습니다. 섬 ${n} ${은는(n)} ${v.areas[n - 1]}칸입니다.`;
            if (next) t += ` 이제 섬 ${n} ${을를(n)} 처음 만난 칸 ${pos(...v.foundAt[n - 1])} 다음 칸부터 다시 살펴봅니다.`;
            return t;
        }
        if (nextVisit && nextVisit.depth === e.depth) return t;
        let size = 0;
        v.visited.forEach(({ depth }) => { if (depth === e.depth) size += 1; });
        t += ` 깊이 ${e.depth} 인 칸 ${size}개를 ${size > 1 ? '모두 ' : ''}꺼냈습니다.`;
        if (next) t += ` 이제 큐에는 깊이 ${e.depth + 1} 인 칸만 남았습니다.`;
        return t;
    }

    function endText(v) {
        if (S.mode === 'islands') {
            return v.found
                ? `마지막 칸까지 살펴봤습니다. 찾은 섬은 모두 ${v.found}개입니다.`
                : '마지막 칸까지 살펴봤는데 땅이 없어 찾은 섬이 없습니다.';
        }
        if (S.mode === 'layers') return '큐가 비어 탐색이 끝났습니다.';
        return S.trace.moves >= 0 ? '' : '큐가 비었는데 출구를 꺼내지 못했습니다. 출구에 갈 수 없습니다.';
    }

    function renderNow(v, ended) {
        const e = v.last;
        const parts = [S.flash];
        if (!e) {
            parts.push(startText());
        } else if (e.type === 'scan') {
            const was = v.visited.get(cellKey(e.r, e.c));
            parts.push(was
                ? `${pos(e.r, e.c)} ${은는(e.c)} 섬 ${was.island} ${을를(was.island)} 칠할 때 이미 방문한 땅이라 건너뜁니다. 같은 섬을 두 번 세지 않습니다.`
                : `${pos(e.r, e.c)} ${은는(e.c)} 바다라서 건너뜁니다.`);
        } else if (e.type === 'found') {
            parts.push(`${pos(e.r, e.c)} 에서 아직 세지 않은 땅을 만났습니다. 섬 ${e.island} ${을를(e.island)} 세고, ` +
                `${pos(e.r, e.c)} ${을를(e.c)} 깊이 0 으로 큐에 넣어 BFS 를 시작합니다.`);
        } else {
            parts.push(visitText(e, v));
        }
        if (ended && e) parts.push(endText(v));
        $('lb-now').textContent = parts.filter(Boolean).join(' ');
    }

    function renderQueue(v) {
        const q = v.queue;
        $('lb-queue-size').textContent = `${q.length}칸`;
        $('lb-queue').innerHTML = q.length
            ? '<span class="lb-q-end">맨 앞</span>' +
              q.map(([r, c, d], i) => `<span class="lb-q-item${i === 0 ? ' is-front' : ''}">` +
                  `<i class="lb-chip" style="--lb-fill:${fill(d)}"></i>${pos(r, c)} 깊이 ${d}</span>`).join('') +
              '<span class="lb-q-end">맨 뒤</span>'
            : '<span class="lb-q-empty">비어 있습니다</span>';
    }

    function render() {
        const v = view();
        const ended = S.at === S.events.length;
        renderCells(v, S.mode === 'path' && ended && S.trace.moves >= 0);
        renderLegend();
        renderResult(v, ended);
        renderNow(v, ended);
        renderQueue(v);
        $('lb-count').textContent = `${S.at} / ${S.events.length} 단계${ended ? ', 끝' : ''}`;
    }

    // ==========================================
    // 버튼과 칸
    // ==========================================

    function go(at) {
        S.at = Math.max(0, Math.min(at, S.events.length));
        S.flash = '';
        render();
    }

    // 깊이가 바뀔 때까지 넘긴다. visit 을 하나 보인 뒤 다음 이벤트가 같은 깊이(섬 개수 모드는 같은 섬)의
    // visit 이 아니면 멈춘다. 섬 개수 모드의 scan 과 found 는 깊이가 없으니 지나간다.
    function stepLayer() {
        let at = S.at;
        while (at < S.events.length) {
            const e = S.events[at++];
            const n = S.events[at];
            if (e.type === 'visit' && !(n && n.type === 'visit' && n.depth === e.depth && n.island === e.island)) break;
        }
        go(at);
    }

    function toggle(r, c) {
        let flash;
        if (S.mode === 'layers' && isAt(S.start, r, c)) {
            flash = '시작 칸은 바꾸지 않습니다. 깊이별 확산은 땅인 시작 칸에서 퍼집니다.';
        } else {
            const next = B.toggleCell(S.rows, r, c, S.mode);
            if (next[r][c] === S.rows[r][c]) {
                flash = '시작 칸과 출구 칸은 바꾸지 않습니다.';
            } else {
                flash = `${pos(r, c)} ${을를(c)} ${TO_NAME[next[r][c]]} 바꿨습니다.`;
                S.rows = next;
            }
        }
        retrace();
        S.flash = flash;
        render();
    }

    function init() {
        const board = $('lb-board');
        if (!board) return;
        const sel = $('lb-preset');
        const key = readUrl();
        fillOptions(B.PRESETS[key].mode, key);
        load(key);

        document.querySelectorAll('.lb-tab').forEach(tab => tab.addEventListener('click', () => {
            const mode = tab.dataset.mode;
            if (mode === S.mode) return;
            fillOptions(mode, MODE_DEFAULT[mode]);
            // 고르기의 input 이벤트로 넘긴다. 아래 load 와 demo-edu 해설 패널이 같은 이벤트로 돈다.
            sel.dispatchEvent(new Event('input', { bubbles: true }));
        }));
        sel.addEventListener('input', () => { if (sel.value !== S.key) load(sel.value); });
        $('lb-reset').addEventListener('click', () => go(0));
        $('lb-step').addEventListener('click', () => go(S.at + 1));
        $('lb-layer').addEventListener('click', stepLayer);
        $('lb-end').addEventListener('click', () => go(S.events.length));
        board.addEventListener('click', (ev) => {
            const cell = ev.target.closest('.lb-cell');
            if (cell) toggle(Number(cell.dataset.r), Number(cell.dataset.c));
        });

        // demo-edu 는 고르기의 첫 input 에서 바뀐 뒤의 값을 바뀌기 전 값으로 읽어 첫 해설을 건너뛴다
        // (select 에는 defaultValue 가 없다). 지금 값으로 한 번 알려 두면 첫 변경부터 해설이 나온다.
        // 이 이벤트는 값이 그대로라 위 load 도, 해설도 돌지 않는다.
        sel.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // demo-edu.js 가 이 파일 뒤에 읽힌다. 문서를 다 읽은 뒤 시작해야 위의 input 을 demo-edu 가 받는다.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
