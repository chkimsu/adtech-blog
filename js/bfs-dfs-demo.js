/**
 * DFS · BFS 단계별 시각화
 *
 * 두 탐색의 코드 차이는 "스택이냐 큐냐" 하나뿐이다. 그래서 엔진도 하나로 두고
 * 꺼내는 자리만 바꾼다 — 두 벌로 짜면 그 하나뿐인 차이가 코드에서 안 보인다.
 *
 * 그래프는 글(algorithm-graph-search)의 것과 같고 이웃 순서도 알파벳순으로 맞췄다.
 * 글에 적어 둔 방문 순서와 데모가 어긋나면 둘 중 하나는 거짓말이 된다.
 */

const NODES = {
    A: { x: 70,  y: 100 },
    B: { x: 160, y: 52  },
    C: { x: 160, y: 148 },
    D: { x: 250, y: 52  },
    E: { x: 250, y: 148 },
    F: { x: 340, y: 100 },
    G: { x: 430, y: 100 },
};

const EDGES = [['A','B'], ['A','C'], ['B','D'], ['C','D'], ['C','E'], ['D','F'], ['E','F'], ['F','G']];

const ADJ = (() => {
    const a = {};
    Object.keys(NODES).forEach(n => a[n] = []);
    EDGES.forEach(([u, v]) => { a[u].push(v); a[v].push(u); });
    Object.keys(a).forEach(n => a[n].sort());
    return a;
})();

// ==========================================
// 엔진
// ==========================================

class SearchEngine {
    /**
     * @param {'dfs'|'bfs'} mode
     * @param {boolean} markOnPush BFS 에서 방문 표시를 넣을 때 하나 꺼낼 때 하나.
     *   글 6절의 그 선택이다. DFS 는 원래 꺼낸 뒤에 거르므로 이 값을 안 쓴다.
     */
    init(mode, start, markOnPush) {
        this.mode = mode;
        this.markOnPush = markOnPush;
        this.frontier = [start];
        this.visited = mode === 'bfs' && markOnPush ? new Set([start]) : new Set();
        this.order = [];
        this.dist = { [start]: 0 };
        this.parent = {};
        this.current = null;
        this.pushCount = 0;
        this.popCount = 0;
        this.done = false;
        this.log = [];
    }

    step() {
        if (this.done) return false;
        if (!this.frontier.length) { this.done = true; this.current = null; return false; }

        // 스택은 뒤에서, 큐는 앞에서 꺼낸다 — 두 탐색의 유일한 차이
        const n = this.mode === 'dfs' ? this.frontier.pop() : this.frontier.shift();
        this.popCount++;

        // 넣을 때 표시하는 BFS 는 통에 중복이 없으므로 꺼낼 때 거르지 않는다.
        // 거르면 시작 마디부터 "이미 봤다"로 걸려 첫 회차에 끝나 버린다.
        const 꺼낼때거름 = !(this.mode === 'bfs' && this.markOnPush);
        if (꺼낼때거름 && this.visited.has(n)) {
            this.current = null;
            this.log.push({ node: n, skipped: true, frontier: [...this.frontier] });
            if (!this.frontier.length) this.done = true;
            return !this.done;
        }
        this.visited.add(n);
        this.order.push(n);
        this.current = n;

        const 넣은것 = [];
        // DFS 는 뒤집어 넣어야 알파벳 순으로 나온다(스택은 마지막 것부터 꺼내므로)
        const 이웃들 = this.mode === 'dfs' ? [...ADJ[n]].reverse() : ADJ[n];
        for (const m of 이웃들) {
            if (this.visited.has(m)) continue;
            if (this.mode === 'bfs' && this.markOnPush) {
                if (this.frontier.includes(m)) continue;
                this.visited.add(m);
            }
            if (this.dist[m] === undefined) {
                this.dist[m] = this.dist[n] + 1;
                this.parent[m] = n;
            }
            this.frontier.push(m);
            this.pushCount++;
            넣은것.push(m);
        }

        this.log.push({ node: n, pushed: 넣은것, frontier: [...this.frontier], order: [...this.order] });
        if (!this.frontier.length) this.done = true;
        return !this.done;
    }

    runToEnd() {
        let guard = 0;
        while (!this.done && guard++ < 500) this.step();
    }

    /** G 까지의 경로 — BFS 에서만 최단이 보장된다 */
    pathTo(t) {
        if (this.dist[t] === undefined) return null;
        const p = [t];
        while (this.parent[p[p.length - 1]]) p.push(this.parent[p[p.length - 1]]);
        return p.reverse();
    }
}

// ==========================================
// 화면
// ==========================================

const engine = new SearchEngine();
let playTimer = null;
const $ = id => document.getElementById(id);

function state() {
    return {
        mode: document.querySelector('input[name="bd-mode"]:checked').value,
        markOnPush: $('bd-mark').value === 'push',
    };
}

function reset() {
    stopPlay();
    const { mode, markOnPush } = state();
    engine.init(mode, 'A', markOnPush);
    render();
}

function nodeMarkup() {
    const { current, visited, frontier, mode } = engine;
    const inFrontier = new Set(frontier);
    return Object.entries(NODES).map(([n, p]) => {
        let cls = 'bd-node';
        if (n === current) cls += ' is-current';
        else if (visited.has(n)) cls += ' is-visited';
        else if (inFrontier.has(n)) cls += ' is-frontier';
        const d = engine.dist[n];
        const 거리표시 = mode === 'bfs' && d !== undefined
            ? `<text class="bd-dist" x="${p.x}" y="${p.y - 24}">${d}</text>` : '';
        return `<g class="${cls}"><circle cx="${p.x}" cy="${p.y}" r="17"/>` +
               `<text x="${p.x}" y="${p.y + 5}">${n}</text></g>${거리표시}`;
    }).join('');
}

function edgeMarkup() {
    const path = engine.done && engine.mode === 'bfs' ? engine.pathTo('G') : null;
    const onPath = new Set();
    if (path) for (let i = 0; i + 1 < path.length; i++) onPath.add([path[i], path[i+1]].sort().join(''));
    return EDGES.map(([u, v]) => {
        const 굵게 = onPath.has([u, v].sort().join('')) ? ' is-path' : '';
        return `<line class="bd-edge${굵게}" x1="${NODES[u].x}" y1="${NODES[u].y}" x2="${NODES[v].x}" y2="${NODES[v].y}"/>`;
    }).join('');
}

function render() {
    const { mode, frontier, order, done } = engine;
    const 통이름 = mode === 'dfs' ? '스택' : '큐';

    $('bd-graph').innerHTML = edgeMarkup() + nodeMarkup();
    $('bd-frontier-label').textContent = `${통이름} (${mode === 'dfs' ? '뒤에서 꺼낸다' : '앞에서 꺼낸다'})`;
    $('bd-frontier').innerHTML = frontier.length
        ? frontier.map((n, i) => {
            const 다음 = mode === 'dfs' ? i === frontier.length - 1 : i === 0;
            return `<span class="bd-chip${다음 ? ' is-next' : ''}">${n}</span>`;
          }).join('')
        : '<span class="bd-empty">비었다</span>';
    $('bd-order').innerHTML = order.length
        ? order.map(n => `<span class="bd-chip is-done">${n}</span>`).join('')
        : '<span class="bd-empty">아직 없음</span>';

    $('bd-push').textContent = engine.pushCount;
    $('bd-pop').textContent = engine.popCount;

    // 마지막 회차 설명
    const last = engine.log[engine.log.length - 1];
    const v = $('bd-verdict');
    if (!last) {
        v.classList.remove('is-done');
        v.innerHTML = `<code>Step</code> 을 눌러 한 회차씩 보세요. ${통이름}에서 하나 꺼내 이웃을 넣습니다.`;
    } else if (last.skipped) {
        v.classList.remove('is-done');
        v.innerHTML = `<strong>${last.node}</strong> 를 꺼냈지만 <strong>이미 본 마디</strong>라 버렸습니다. ` +
            `${통이름}에 같은 마디가 여러 번 들어갈 수 있어서 꺼낸 뒤에도 한 번 더 거릅니다.`;
    } else if (done) {
        v.classList.add('is-done');
        if (mode === 'bfs') {
            const p = engine.pathTo('G');
            v.innerHTML = `끝났습니다. <strong>A 에서 G 까지 ${engine.dist.G}칸</strong>이고 경로는 ` +
                `<strong>${p.join(' → ')}</strong> 입니다. 굵은 선이 그 길이고, BFS 라서 <strong>최단</strong>이 보장됩니다.`;
        } else {
            v.innerHTML = `끝났습니다. 방문 순서는 <strong>${engine.order.join(' → ')}</strong> 입니다. ` +
                `DFS 는 한 갈래를 끝까지 파고들었다 돌아오므로 <strong>이 순서가 최단 경로를 뜻하지 않습니다.</strong>`;
        }
    } else {
        v.classList.remove('is-done');
        const 넣은 = last.pushed.length ? `이웃 <strong>${last.pushed.join(', ')}</strong> 를 넣었습니다.`
                                        : '넣을 이웃이 없습니다 — 모두 이미 봤습니다.';
        v.innerHTML = `<strong>${last.node}</strong> 를 꺼내 방문했습니다. ${넣은}`;
    }

    $('bd-mark-row').style.display = mode === 'bfs' ? '' : 'none';
}

function stepOnce() { if (!engine.done) { engine.step(); render(); } }
function stopPlay() { if (playTimer) { clearInterval(playTimer); playTimer = null; } const b = $('bd-play'); if (b) b.textContent = 'Play'; }
function togglePlay() {
    if (playTimer) { stopPlay(); return; }
    if (engine.done) return;
    $('bd-play').textContent = 'Pause';
    playTimer = setInterval(() => { engine.step(); render(); if (engine.done) stopPlay(); }, 800);
}

function init() {
    if (!$('bd-graph')) return;
    document.querySelectorAll('input[name="bd-mode"]').forEach(r => r.addEventListener('change', reset));
    $('bd-mark').addEventListener('change', reset);
    $('bd-step').addEventListener('click', stepOnce);
    $('bd-play').addEventListener('click', togglePlay);
    $('bd-reset').addEventListener('click', reset);
    reset();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
