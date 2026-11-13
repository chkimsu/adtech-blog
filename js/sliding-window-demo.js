/**
 * 슬라이딩 윈도우 단계별 시각화
 *
 * 「코딩테스트 풀이 순서」 글(algorithm-solving-steps)의 예제를 그대로 돌린다.
 * 합이 S 이상인 가장 짧은 연속 기간을 찾는 풀이 함수를 한 동작(늘림, 기록, 줄임)씩 나눠
 * 단계 목록을 미리 만들고, Step 이 그 목록을 한 칸씩 넘긴다.
 *
 * 입력은 글의 예제와 글이 적은 경계 입력 4개뿐이다. 그래야 데모의 기록이 글의 출력과 같다.
 */

// ==========================================
// 입력 — 글 6절의 예제와 경계 입력
// ==========================================

const SW_CASES = {
    main: { clicks: [2, 3, 1, 2, 4, 3, 1, 5], s: 7 },
    empty: { clicks: [], s: 7 },
    short: { clicks: [1, 1, 1], s: 10 },
    one: { clicks: [7], s: 7 },
    one2: { clicks: [2, 10, 1], s: 7 },
};

// 글 7절의 풀이 함수와 같은 코드다. 단계마다 방금 실행한 줄을 굵게 표시한다.
const SW_CODE = [
    'def solution(clicks, s):',
    '    best, total, left = 0, 0, 0',
    '    for right in range(len(clicks)):',
    '        total += clicks[right]',
    '        while total >= s:',
    '            if best == 0 or right - left + 1 < best:',
    '                best = right - left + 1',
    '            total -= clicks[left]',
    '            left += 1',
    '    return best',
];

// ==========================================
// 조사 — 숫자를 읽은 소리의 받침으로 고른다 (2, 4, 5, 9 로 끝나면 받침이 없다)
// ==========================================

function hasBatchim(n) {
    const d = Math.abs(n) % 10;
    if (d === 0) return true; // 0(영), 10(십), 100(백)
    return ![2, 4, 5, 9].includes(d);
}

function isRieul(n) {
    const d = Math.abs(n) % 10;
    return d === 1 || d === 7 || d === 8; // 일, 칠, 팔
}

const 이가 = n => (hasBatchim(n) ? '이' : '가');
const 을를 = n => (hasBatchim(n) ? '을' : '를');
const 으로 = n => (!hasBatchim(n) || isRieul(n) ? '로' : '으로');
const 이라 = n => (hasBatchim(n) ? '이라' : '라');
const day = i => `${i + 1}일`;
// 기간 표기는 글의 trace 출력과 같은 「5~6일」 꼴이다. 하루짜리는 「1일」로 쓴다.
const period = (l, r) => (l === r ? day(l) : `${l + 1}~${r + 1}일`);

// ==========================================
// 엔진 — 글의 코드를 그대로 따라가며 단계 목록을 만든다
// ==========================================

function swSimulate(clicks, s) {
    const steps = [{ type: 'start', left: 0, right: -1, total: 0, best: 0, movesR: 0, movesL: 0, found: 0 }];
    const found = [];
    let best = 0;
    let total = 0;
    let left = 0;
    let movesR = 0;
    let movesL = 0;
    for (let right = 0; right < clicks.length; right++) {
        const prev = total;
        total += clicks[right];
        movesR++;
        steps.push({ type: 'extend', left, right, prev, value: clicks[right], total, best, movesR, movesL, found: found.length });
        while (total >= s) {
            const length = right - left + 1;
            const prevBest = best;
            const improved = best === 0 || length < best;
            if (improved) best = length;
            found.push({ from: left, to: right, total, length, best, improved });
            steps.push({ type: 'record', left, right, total, length, prevBest, improved, best, movesR, movesL, found: found.length });
            const before = total;
            const v = clicks[left];
            total -= v;
            left++;
            movesL++;
            steps.push({ type: 'shrink', left, right, prev: before, value: v, dropped: left - 1, total, best, movesR, movesL, found: found.length });
        }
    }
    steps.push({ type: 'end', left, right: clicks.length - 1, total, best, movesR, movesL, found: found.length });
    return { steps, found, best };
}

// 글 6절의 brute 함수가 total 에 더하는 횟수
function swBruteAdds(clicks, s) {
    let adds = 0;
    for (let i = 0; i < clicks.length; i++) {
        let total = 0;
        for (let j = i; j < clicks.length; j++) {
            total += clicks[j];
            adds++;
            if (total >= s) break;
        }
    }
    return adds;
}

// 입력을 고르면 해설 패널에 쓰는 문장 (js/demo-edu-content.js 의 sliding-window 항목이 부른다)
function swDescribeCase(key) {
    const c = SW_CASES[key];
    if (!c) return '';
    const { found, best } = swSimulate(c.clicks, c.s);
    const n = c.clicks.length;
    if (key === 'main') {
        return `<strong>글의 예제</strong>로 돌아왔습니다. 8일치 가상 클릭 수에서 합이 ${c.s} 이상인 가장 짧은 연속 기간을 찾습니다. ` +
            `끝까지 돌리면 기간 ${found.length}개를 글의 출력과 같은 순서로 찾고, 답은 <strong>${best}</strong> 입니다.`;
    }
    if (n === 0) {
        return '<strong>빈 배열</strong>입니다. 지문은 n 이 1 이상이라 실제로는 들어오지 않지만, 함수로 받는 문제라면 0 을 돌려주게 짜 두는 편이 안전합니다. ' +
            '<code>for</code> 문이 한 번도 돌지 않고 <code>best</code> 의 처음 값 0 이 그대로 답이 됩니다.';
    }
    if (best === 0) {
        const sum = c.clicks.reduce((a, b) => a + b, 0);
        const k = n * (n + 1) / 2;
        return `<strong>합이 S 에 못 미치는 입력</strong>입니다. ${n}일치를 다 더해도 ${sum} ${이라(sum)} S = ${c.s} 에 닿지 않습니다. ` +
            `오른쪽 끝만 ${n}번 움직이고 기록은 하나도 생기지 않아 0 을 돌려줍니다. ` +
            `같은 입력에서 브루트 포스는 구간 ${k}개의 합을 모두 구하느라 ${k}번 더합니다.`;
    }
    if (n === 1) {
        return `<strong>하루짜리 배열</strong> [${c.clicks[0]}] 입니다. 첫날 하나로 합이 ${c.s} 이상이 되어 길이 1 을 적고, ` +
            '그 날을 빼면 왼쪽 끝이 배열 끝을 지나 반복이 끝납니다. 답은 <strong>1</strong> 입니다.';
    }
    return `<strong>[${c.clicks.join(', ')}]</strong> 에 S = ${c.s} 입니다. 둘째 날 값 10 하나만으로 ${c.s} 이상이라 답이 1 입니다. ` +
        '1~2일의 길이 2 를 먼저 적고, 왼쪽 끝을 줄여 2일 하나만 남았을 때 <code>best</code> 를 1 로 바꿉니다.';
}

window.swDescribeCase = swDescribeCase;

// ==========================================
// 화면
// ==========================================

const $ = id => document.getElementById(id);
let current = null; // { key, clicks, s, steps, found, brute }
let at = 0;
let playTimer = null;

function verdictOf(st) {
    const { clicks, s } = current;
    const n = clicks.length;
    switch (st.type) {
        case 'start':
            return n === 0
                ? '시작 상태입니다. 배열이 비어 있습니다. <code>Step</code> 을 누르면 반복문이 어떻게 끝나는지 봅니다.'
                : '시작 상태입니다. <code>best</code>, <code>total</code>, <code>left</code> 가 모두 0 이고 아직 고른 날이 없습니다. <code>Step</code> 을 눌러 한 동작씩 봅니다.';
        case 'extend': {
            const head = `오른쪽 끝을 <strong>${day(st.right)}</strong>로 늘렸습니다. <code>total</code> 은 ${st.prev} + ${st.value} = <strong>${st.total}</strong> 입니다. `;
            if (st.total >= s) return head + `${s} 이상이 되었으니 다음 동작에서 이 기간의 길이를 적습니다.`;
            if (st.right === n - 1) return head + `아직 ${s} 미만인데 더 늘릴 날이 없어 반복문이 끝납니다.`;
            return head + `아직 ${s} 미만이라 오른쪽 끝을 한 칸 더 늘립니다.`;
        }
        case 'record': {
            const head = `${period(st.left, st.right)}의 합 ${st.total} ${이가(st.total)} ${s} 이상입니다. 길이 <strong>${st.length}</strong> ${을를(st.length)} 적습니다. `;
            if (st.prevBest === 0) return head + `처음 찾은 기간이라 <code>best</code> 가 ${st.length} ${이가(st.length)} 됩니다.`;
            if (st.improved) return head + `지금까지의 <code>best</code> ${st.prevBest} 보다 짧아서 <code>best</code> 를 <strong>${st.length}</strong> ${으로(st.length)} 바꿉니다.`;
            return head + `지금까지의 <code>best</code> ${st.prevBest} 보다 짧지 않아 그대로 둡니다.`;
        }
        case 'shrink': {
            const moved = st.left < n
                ? `<code>left</code> 를 ${day(st.left)}로 옮겼습니다.`
                : '<code>left</code> 가 배열 끝을 지났습니다.';
            const head = `왼쪽 끝 ${day(st.dropped)}의 값 ${st.value} ${을를(st.value)} 빼고 ${moved} <code>total</code> 은 ${st.prev} - ${st.value} = <strong>${st.total}</strong> 입니다. `;
            if (st.total >= s) return head + `아직 ${s} 이상이라 이 기간도 길이를 적습니다.`;
            if (st.right === n - 1) return head + `${s} 미만이 되었고 더 늘릴 날이 없어 반복문이 끝납니다.`;
            return head + `${s} 미만이 되었으니 다시 오른쪽 끝을 늘립니다.`;
        }
        default: {
            if (n === 0) return '배열이 비어 있어 <code>for</code> 문이 한 번도 돌지 않았습니다. <code>best</code> 가 처음 값 0 그대로라 <strong>0</strong> 을 돌려줍니다.';
            if (st.best === 0) return `오른쪽 끝이 마지막 날까지 갔지만 합이 ${s} 이상인 기간이 한 번도 없었습니다. <code>best</code> 가 0 그대로라 <strong>0</strong> 을 돌려줍니다.`;
            return `반복문이 끝났습니다. 합이 ${s} 이상인 기간을 ${st.found}번 찾았고, 그중 가장 짧은 길이 <strong>${st.best}</strong> ${이가(st.best)} 답입니다.`;
        }
    }
}

function codeLinesOf(st) {
    if (st.type === 'start') return [1];
    if (st.type === 'extend') return [2, 3];
    if (st.type === 'record') return st.improved ? [4, 5, 6] : [4, 5];
    if (st.type === 'shrink') return [7, 8];
    return [9];
}

function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function render() {
    const { clicks, s, steps, found, brute } = current;
    const st = steps[at];
    const n = clicks.length;

    // --- 코드 ---
    const on = new Set(codeLinesOf(st));
    $('sw-code').innerHTML = SW_CODE.map((line, i) =>
        `<span class="ln${on.has(i) ? ' is-on' : ''}">${esc(line)}</span>`).join('');

    // --- 날 칸 ---
    if (n === 0) {
        $('sw-array').innerHTML = '<span class="sw-array-empty">빈 배열 [] 입니다. 칸이 하나도 없습니다.</span>';
    } else {
        $('sw-array').innerHTML = clicks.map((v, i) => {
            const cls = ['sw-cell'];
            if (st.right >= 0 && i >= st.left && i <= st.right) cls.push('is-window');
            else if (i < st.left) cls.push('is-gone');
            else cls.push('is-ahead');
            if (st.type === 'extend' && i === st.right) cls.push('is-new');
            if (st.type === 'shrink' && i === st.dropped) cls.push('is-drop');
            // 칸 아래 이름표는 코드의 변수 이름 그대로다. left 는 기간이 비었을 때도 다음에 뺄 날을 가리킨다.
            const ptr = [];
            if (i === st.left) ptr.push('left');
            if (i === st.right) ptr.push('right');
            return `<div class="${cls.join(' ')}"><span class="sw-cell-day">${day(i)}</span>` +
                `<span class="sw-cell-box">${v}</span><span class="sw-cell-ptr">${ptr.join(' ')}</span></div>`;
        }).join('');
    }

    // --- 변수 ---
    $('sw-left').textContent = st.left < n ? `${st.left} (${day(st.left)})` : `${st.left} (배열 끝)`;
    $('sw-right').textContent = st.right >= 0 ? `${st.right} (${day(st.right)})` : '없음';
    $('sw-total').textContent = st.total;
    $('sw-s').textContent = s;
    $('sw-best').textContent = st.best === 0 ? '0 (아직 없음)' : st.best;

    // --- 판정 한 줄 ---
    const verdict = $('sw-verdict');
    verdict.innerHTML = verdictOf(st);
    verdict.classList.toggle('is-done', st.type === 'end');
    $('sw-step-count').textContent = `${at} / ${steps.length - 1} 단계`;

    // --- 찾은 기간 기록 ---
    const rows = found.slice(0, st.found).map((f, i) => `
        <tr>
          <td>${i + 1}</td><td>${period(f.from, f.to)}</td><td>${f.total}</td>
          <td>${f.length}</td><td class="${f.improved ? 'is-best' : ''}">${f.best}</td>
        </tr>`).join('');
    $('sw-log-body').innerHTML = rows ||
        '<tr><td colspan="5" class="sw-log-empty">아직 합이 S 이상인 기간을 찾지 못했습니다</td></tr>';

    // --- 움직인 횟수 ---
    $('sw-cmp-right').textContent = `${st.movesR}번`;
    $('sw-cmp-left').textContent = `${st.movesL}번`;
    $('sw-cmp-total').textContent = `${st.movesR + st.movesL}번`;
    $('sw-cmp-bound').textContent = `${2 * n}번`;
    $('sw-cmp-brute').textContent = `${brute}번`;
}

function caseDesc(key, c) {
    const n = c.clicks.length;
    const head = key === 'main' ? '8일치 가상 클릭 수' : '경계 입력';
    return `${head}, n = ${n}, S = ${c.s}. 단계는 시작을 빼고 모두 ${current.steps.length - 1}개입니다.`;
}

function load() {
    stopPlay();
    const key = $('sw-case').value;
    const c = SW_CASES[key] || SW_CASES.main;
    const sim = swSimulate(c.clicks, c.s);
    current = { key, clicks: c.clicks, s: c.s, steps: sim.steps, found: sim.found, brute: swBruteAdds(c.clicks, c.s) };
    at = 0;
    $('sw-case-desc').textContent = caseDesc(key, c);
    render();
}

function stepOnce() {
    if (!current || at >= current.steps.length - 1) return;
    at++;
    render();
}

function stopPlay() {
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    const btn = $('sw-play');
    if (btn) btn.textContent = 'Play';
}

function togglePlay() {
    if (playTimer) { stopPlay(); return; }
    if (at >= current.steps.length - 1) at = 0;
    $('sw-play').textContent = 'Pause';
    render();
    playTimer = setInterval(() => {
        stepOnce();
        if (at >= current.steps.length - 1) stopPlay();
    }, 900);
}

function init() {
    if (!$('sw-array')) return;
    $('sw-case').addEventListener('input', load);
    $('sw-step').addEventListener('click', () => { stopPlay(); stepOnce(); });
    $('sw-play').addEventListener('click', togglePlay);
    $('sw-reset').addEventListener('click', load);
    load();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
