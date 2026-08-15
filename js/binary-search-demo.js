/**
 * 이분 탐색 단계별 시각화
 *
 * 세 가지 변형(정확히 찾기 · 왼쪽 경계 · 오른쪽 경계)을 같은 배열 위에서 돌린다.
 * 세 변형은 while 조건과 hi 초기값이 다르고, 그 차이가 답을 가른다 —
 * 그래서 셋을 따로 구현하지 않고 한 엔진의 mode 로 두어 나란히 비교되게 했다.
 *
 * 배열은 난수를 쓰지 않는다. 같은 칸 수면 언제나 같은 배열이 나와야
 * 글에 적어 둔 회차 수와 데모가 어긋나지 않는다.
 */

// ==========================================
// 배열 만들기 — 같은 n 이면 항상 같은 값
// ==========================================

function makeArray(n) {
    const out = [];
    let v = 2;
    for (let i = 0; i < n; i++) {
        out.push(v);
        // 3칸에 한 번은 값을 올리지 않아 중복을 만든다.
        // 중복이 없으면 왼쪽 경계와 오른쪽 경계가 항상 같은 답을 내서
        // 두 변형의 차이를 보여줄 수 없다.
        if (i % 3 !== 1) v += 1 + ((i * 7) % 5);
    }
    return out;
}

// ==========================================
// 엔진
// ==========================================

const MODES = {
    exact: {
        label: '정확히 찾기',
        desc: '값 자체를 찾는다. 없으면 -1.',
        code: 'lo, hi = 0, n - 1   ·   while lo &lt;= hi   ·   mid = (lo + hi) // 2',
    },
    left: {
        label: '왼쪽 경계',
        desc: '찾는 값 이상이 처음 나오는 자리. bisect_left 와 같다.',
        code: 'lo, hi = 0, n   ·   while lo &lt; hi   ·   a[mid] &lt; t 이면 lo = mid + 1',
    },
    right: {
        label: '오른쪽 경계',
        desc: '찾는 값 초과가 처음 나오는 자리. bisect_right 와 같다.',
        code: 'lo, hi = 0, n   ·   while lo &lt; hi   ·   a[mid] &lt;= t 이면 lo = mid + 1',
    },
};

class BinarySearchEngine {
    init(arr, target, mode) {
        this.arr = arr;
        this.target = target;
        this.mode = mode;
        this.lo = 0;
        this.hi = mode === 'exact' ? arr.length - 1 : arr.length;
        this.iteration = 0;
        this.done = false;
        this.answer = null;
        this.history = [];
        this._record(null, '시작');
    }

    _remaining() {
        return this.mode === 'exact'
            ? Math.max(0, this.hi - this.lo + 1)
            : Math.max(0, this.hi - this.lo);
    }

    _record(mid, verdict) {
        this.history.push({
            iter: this.iteration,
            lo: this.lo,
            hi: this.hi,
            mid,
            midVal: mid === null ? null : this.arr[mid],
            remaining: this._remaining(),
            verdict,
        });
    }

    step() {
        if (this.done) return false;

        const cond = this.mode === 'exact' ? this.lo <= this.hi : this.lo < this.hi;
        if (!cond) {
            this.done = true;
            this.answer = this.mode === 'exact' ? -1 : this.lo;
            this._record(null, '구간이 비었다');
            return false;
        }

        this.iteration++;
        const mid = Math.floor((this.lo + this.hi) / 2);
        const v = this.arr[mid];
        let verdict;

        if (this.mode === 'exact') {
            if (v === this.target) {
                this.answer = mid;
                this.done = true;
                verdict = `${v} = ${this.target} → 찾았다`;
            } else if (v < this.target) {
                this.lo = mid + 1;
                verdict = `${v} &lt; ${this.target} → 오른쪽만 남긴다`;
            } else {
                this.hi = mid - 1;
                verdict = `${v} &gt; ${this.target} → 왼쪽만 남긴다`;
            }
        } else {
            const goRight = this.mode === 'left' ? v < this.target : v <= this.target;
            if (goRight) {
                this.lo = mid + 1;
                verdict = this.mode === 'left'
                    ? `${v} &lt; ${this.target} → 경계는 오른쪽`
                    : `${v} &lt;= ${this.target} → 경계는 오른쪽`;
            } else {
                this.hi = mid;
                verdict = this.mode === 'left'
                    ? `${v} &gt;= ${this.target} → 여기일 수도 있다`
                    : `${v} &gt; ${this.target} → 여기일 수도 있다`;
            }
        }

        this._record(mid, verdict);

        if (!this.done) {
            const still = this.mode === 'exact' ? this.lo <= this.hi : this.lo < this.hi;
            if (!still) {
                this.done = true;
                this.answer = this.mode === 'exact' ? -1 : this.lo;
            }
        }
        return !this.done;
    }

    runToEnd() {
        let guard = 0;
        while (!this.done && guard++ < 200) this.step();
    }

    /** 앞에서부터 훑었다면 몇 번 비교했을까 */
    linearSteps() {
        for (let i = 0; i < this.arr.length; i++) {
            if (this.mode === 'exact' && this.arr[i] === this.target) return i + 1;
            if (this.mode === 'left' && this.arr[i] >= this.target) return i + 1;
            if (this.mode === 'right' && this.arr[i] > this.target) return i + 1;
        }
        return this.arr.length;
    }
}

// ==========================================
// 화면
// ==========================================

const engine = new BinarySearchEngine();
let playTimer = null;

const $ = id => document.getElementById(id);

function state() {
    return {
        n: parseInt($('bs-size').value, 10),
        target: parseInt($('bs-target').value, 10),
        mode: $('bs-mode').value,
    };
}

function reset() {
    stopPlay();
    const { n, target, mode } = state();
    const arr = makeArray(n);

    // 찾는 값 슬라이더 범위는 배열이 바뀔 때마다 다시 잡는다.
    const lastMax = arr[arr.length - 1] + 2;
    const slider = $('bs-target');
    slider.min = 0;
    slider.max = lastMax;
    if (target > lastMax) slider.value = lastMax;

    engine.init(arr, parseInt(slider.value, 10), mode);
    render();
}

function render() {
    const { arr, lo, hi, mode, target, done, answer } = engine;
    const last = engine.history[engine.history.length - 1];

    $('bs-size-val').textContent = `${arr.length}칸`;
    $('bs-target-val').textContent = target;
    $('bs-mode-desc').textContent = MODES[mode].desc;
    $('bs-mode-code').innerHTML = MODES[mode].code;

    // --- 배열 칸 ---
    const hiCell = mode === 'exact' ? hi : hi - 1;
    const cells = arr.map((v, i) => {
        const alive = i >= lo && i <= hiCell;
        const cls = ['bs-cell'];
        if (!alive) cls.push('is-out');
        if (last.mid === i) cls.push('is-mid');
        if (done && answer === i && mode === 'exact') cls.push('is-hit');
        if (done && mode !== 'exact' && answer === i) cls.push('is-hit');
        return `<div class="${cls.join(' ')}"><span class="bs-cell-idx">${i}</span><span class="bs-cell-val">${v}</span></div>`;
    }).join('');
    $('bs-array').innerHTML = cells;

    // --- 표시자 ---
    $('bs-lo').textContent = lo;
    $('bs-hi').textContent = hi;
    $('bs-mid').textContent = last.mid === null ? '—' : last.mid;
    $('bs-remaining').textContent = `${last.remaining}칸`;

    // --- 판정 한 줄 ---
    const verdict = $('bs-verdict');
    if (done) {
        verdict.classList.add('is-done');
        if (mode === 'exact') {
            verdict.innerHTML = answer === -1
                ? `<strong>${target} 은 배열에 없다.</strong> ${engine.iteration}회 만에 후보가 다 사라졌다.`
                : `<strong>${target} 을 ${answer}번 칸에서 찾았다.</strong> ${engine.iteration}회 걸렸다.`;
        } else {
            const 개수 = arr.filter(x => x === target).length;
            verdict.innerHTML = `<strong>답은 ${answer}번 칸.</strong> ` +
                (개수 ? `${target} 이 ${개수}개 있고, 왼쪽 경계와 오른쪽 경계의 차가 그 개수다.`
                      : `${target} 은 없지만 <strong>넣을 자리</strong>는 알려 준다.`);
        }
    } else {
        verdict.classList.remove('is-done');
        verdict.innerHTML = last.mid === null
            ? '<code>Step</code> 을 눌러 한 회차씩 보세요.'
            : `${engine.iteration}회차 — ${last.verdict}`;
    }

    // --- 기록 ---
    const rows = engine.history.filter(h => h.mid !== null).map(h => `
        <tr>
          <td>${h.iter}</td><td>${h.lo}</td><td>${h.hi}</td>
          <td>${h.mid}</td><td>${h.midVal}</td>
          <td class="bs-log-verdict">${h.verdict}</td>
          <td>${h.remaining}</td>
        </tr>`).join('');
    $('bs-log-body').innerHTML = rows ||
        '<tr><td colspan="7" class="bs-log-empty">아직 한 회차도 안 돌았습니다</td></tr>';

    // --- 훑기와 비교 ---
    const lin = engine.linearSteps();
    const bin = Math.ceil(Math.log2(arr.length + 1));
    $('bs-cmp-linear').textContent = `${lin}회`;
    $('bs-cmp-binary').textContent = `${engine.iteration}회`;
    $('bs-cmp-bound').textContent = `${bin}회`;
}

function stepOnce() {
    if (engine.done) return;
    engine.step();
    render();
}

function stopPlay() {
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    const btn = $('bs-play');
    if (btn) btn.textContent = 'Play';
}

function togglePlay() {
    if (playTimer) { stopPlay(); return; }
    if (engine.done) return;
    $('bs-play').textContent = 'Pause';
    playTimer = setInterval(() => {
        engine.step();
        render();
        if (engine.done) stopPlay();
    }, 700);
}

function init() {
    if (!$('bs-array')) return;
    ['bs-size', 'bs-target', 'bs-mode'].forEach(id => {
        $(id).addEventListener('input', reset);
    });
    $('bs-step').addEventListener('click', stepOnce);
    $('bs-play').addEventListener('click', togglePlay);
    $('bs-reset').addEventListener('click', reset);
    reset();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
