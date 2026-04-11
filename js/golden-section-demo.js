/**
 * Golden Section Search Interactive Demo
 * 황금 비율 탐색으로 1st Price Auction에서 최적 입찰가 b*를 찾는 과정을 시각화.
 *
 * 핵심: Surplus s(b) = (V - b) × F(b|x) 함수의 최대값을
 * O(log(1/ε)) 반복으로 수렴하는 과정을 단계별로 보여준다.
 */

// ==========================================
// 수학 유틸리티
// ==========================================

function normalCDF(x) {
    // Abramowitz-Stegun 근사 (오차 < 1.5e-7)
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);
    const t = 1.0 / (1.0 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return 0.5 * (1 + sign * y);
}

function lognormalCDF(x, mu, sigma) {
    if (x <= 0) return 0;
    return normalCDF((Math.log(x) - mu) / sigma);
}

function surplus(b, V, mu, sigma) {
    if (b <= 0 || b >= V) return 0;
    return (V - b) * lognormalCDF(b, mu, sigma);
}

// ==========================================
// Golden Section Search 엔진
// ==========================================

class GoldenSectionEngine {
    constructor() {
        this.PHI = (Math.sqrt(5) + 1) / 2;
    }

    init(V, mu, sigma, tol) {
        this.V = V;
        this.mu = mu;
        this.sigma = sigma;
        this.tol = tol;
        this.a = 1e-4;
        this.b = V - 1e-4;
        this.x1 = this.b - (this.b - this.a) / this.PHI;
        this.x2 = this.a + (this.b - this.a) / this.PHI;
        this.s1 = surplus(this.x1, V, mu, sigma);
        this.s2 = surplus(this.x2, V, mu, sigma);
        this.iteration = 0;
        this.converged = false;
        this.evalCount = 2; // 초기 x1, x2 평가
        this.history = [];
        this._record();
    }

    step() {
        if (this.converged) return false;
        if (this.s1 > this.s2) {
            this.b = this.x2;
        } else {
            this.a = this.x1;
        }
        this.x1 = this.b - (this.b - this.a) / this.PHI;
        this.x2 = this.a + (this.b - this.a) / this.PHI;
        this.s1 = surplus(this.x1, this.V, this.mu, this.sigma);
        this.s2 = surplus(this.x2, this.V, this.mu, this.sigma);
        this.iteration++;
        this.evalCount++; // 매 반복 1회 평가 (재사용)
        this.converged = (this.b - this.a) < this.tol;
        this._record();
        return !this.converged;
    }

    runToEnd() {
        while (!this.converged) this.step();
    }

    _record() {
        this.history.push({
            iter: this.iteration,
            a: this.a,
            b: this.b,
            x1: this.x1,
            x2: this.x2,
            s1: this.s1,
            s2: this.s2,
            bracket: this.b - this.a
        });
    }

    getOptimal() {
        return (this.a + this.b) / 2;
    }

    getOptimalSurplus() {
        return surplus(this.getOptimal(), this.V, this.mu, this.sigma);
    }

    gridSearchCount() {
        // Grid Search로 같은 정밀도(tol) 달성에 필요한 평가 횟수
        return Math.ceil((this.V - 1e-4) / this.tol);
    }
}

// ==========================================
// 차트 관리
// ==========================================

let surplusChart = null;
let convergenceChart = null;
let engine = new GoldenSectionEngine();
let animationTimer = null;
let isPlaying = false;

function generateSurplusCurve(V, mu, sigma, nPoints = 300) {
    const points = [];
    for (let i = 0; i <= nPoints; i++) {
        const b = (i / nPoints) * V * 0.98 + 0.01;
        points.push({ x: b, y: surplus(b, V, mu, sigma) });
    }
    return points;
}

function getChartColors() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return {
        curve: '#00e5ff',
        curveFill: 'rgba(0, 229, 255, 0.08)',
        bracketFill: 'rgba(0, 229, 255, 0.15)',
        bracketBorder: 'rgba(0, 229, 255, 0.6)',
        x1: '#ff6384',
        x2: '#ffce56',
        optimal: '#4bc0c0',
        grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
        text: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
        textMuted: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
    };
}

function initSurplusChart() {
    const ctx = document.getElementById('surplusChart').getContext('2d');
    const colors = getChartColors();
    const params = getParams();
    const curveData = generateSurplusCurve(params.V, params.mu, params.sigma);

    if (surplusChart) surplusChart.destroy();

    surplusChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Surplus s(b)',
                    data: curveData,
                    showLine: true,
                    borderColor: colors.curve,
                    backgroundColor: colors.curveFill,
                    fill: true,
                    pointRadius: 0,
                    borderWidth: 2.5,
                    tension: 0.4,
                    order: 3
                },
                {
                    label: 'Bracket [a, b]',
                    data: [],
                    showLine: true,
                    borderColor: colors.bracketBorder,
                    backgroundColor: colors.bracketFill,
                    fill: true,
                    pointRadius: 0,
                    borderWidth: 2,
                    order: 2
                },
                {
                    label: 'x₁',
                    data: [],
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    backgroundColor: colors.x1,
                    borderColor: '#fff',
                    borderWidth: 2,
                    order: 1
                },
                {
                    label: 'x₂',
                    data: [],
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    backgroundColor: colors.x2,
                    borderColor: '#fff',
                    borderWidth: 2,
                    order: 1
                },
                {
                    label: 'b* (Optimal)',
                    data: [],
                    pointRadius: 10,
                    pointHoverRadius: 12,
                    backgroundColor: colors.optimal,
                    borderColor: '#fff',
                    borderWidth: 2,
                    pointStyle: 'star',
                    order: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 250 },
            plugins: {
                legend: {
                    labels: {
                        color: colors.text,
                        font: { family: "'Inter', sans-serif", size: 11 },
                        usePointStyle: true,
                        padding: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: b=$${ctx.parsed.x.toFixed(3)}, s=$${ctx.parsed.y.toFixed(4)}`
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Bid (b)', color: colors.text, font: { family: "'Inter', sans-serif" } },
                    grid: { color: colors.grid },
                    ticks: { color: colors.textMuted, font: { family: "'Fira Code', monospace", size: 10 } },
                    min: 0
                },
                y: {
                    title: { display: true, text: 'Surplus s(b)', color: colors.text, font: { family: "'Inter', sans-serif" } },
                    grid: { color: colors.grid },
                    ticks: { color: colors.textMuted, font: { family: "'Fira Code', monospace", size: 10 } },
                    min: 0
                }
            }
        }
    });
}

function initConvergenceChart() {
    const ctx = document.getElementById('convergenceChart').getContext('2d');
    const colors = getChartColors();

    if (convergenceChart) convergenceChart.destroy();

    convergenceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Bracket Size (b - a)',
                data: [],
                borderColor: colors.curve,
                backgroundColor: 'rgba(0, 229, 255, 0.1)',
                fill: true,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: colors.curve,
                pointBorderColor: '#fff',
                pointBorderWidth: 1,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 250 },
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Iteration', color: colors.text, font: { family: "'Inter', sans-serif" } },
                    grid: { color: colors.grid },
                    ticks: { color: colors.textMuted, font: { family: "'Fira Code', monospace", size: 10 } }
                },
                y: {
                    title: { display: true, text: 'Bracket Size', color: colors.text, font: { family: "'Inter', sans-serif" } },
                    grid: { color: colors.grid },
                    ticks: { color: colors.textMuted, font: { family: "'Fira Code', monospace", size: 10 } },
                    type: 'logarithmic',
                    min: 0.001
                }
            }
        }
    });
}

// ==========================================
// UI 업데이트
// ==========================================

function getParams() {
    return {
        V: parseFloat(document.getElementById('slider-V').value),
        mu: parseFloat(document.getElementById('slider-mu').value),
        sigma: parseFloat(document.getElementById('slider-sigma').value),
        tol: parseFloat(document.getElementById('slider-tol').value)
    };
}

function updateSliderDisplays() {
    const p = getParams();
    document.getElementById('val-V').textContent = '$' + p.V.toFixed(1);
    document.getElementById('val-mu').textContent = p.mu.toFixed(2);
    document.getElementById('val-sigma').textContent = p.sigma.toFixed(2);
    document.getElementById('val-tol').textContent = '$' + p.tol.toFixed(3);
}

function updateBracketVisualization() {
    if (!engine.history.length) return;
    const state = engine.history[engine.history.length - 1];
    const params = getParams();

    // Bracket 영역 (surplus curve를 따라가는 세로 영역)
    const bracketData = [];
    const nPts = 50;
    for (let i = 0; i <= nPts; i++) {
        const b = state.a + (i / nPts) * (state.b - state.a);
        bracketData.push({ x: b, y: surplus(b, params.V, params.mu, params.sigma) });
    }
    surplusChart.data.datasets[1].data = bracketData;

    // x1, x2 포인트
    surplusChart.data.datasets[2].data = [{ x: state.x1, y: state.s1 }];
    surplusChart.data.datasets[3].data = [{ x: state.x2, y: state.s2 }];

    // Converged → b* 표시
    if (engine.converged) {
        const bStar = engine.getOptimal();
        surplusChart.data.datasets[4].data = [{
            x: bStar,
            y: surplus(bStar, params.V, params.mu, params.sigma)
        }];
    } else {
        surplusChart.data.datasets[4].data = [];
    }

    surplusChart.update();

    // Convergence chart
    const labels = engine.history.map(h => h.iter);
    const brackets = engine.history.map(h => h.bracket);
    convergenceChart.data.labels = labels;
    convergenceChart.data.datasets[0].data = brackets;
    convergenceChart.update();
}

function updateIterationInfo() {
    const state = engine.history.length ? engine.history[engine.history.length - 1] : null;
    document.getElementById('iter-num').textContent = state ? state.iter : '-';
    document.getElementById('iter-bracket').textContent = state ? '$' + state.bracket.toFixed(4) : '-';
    document.getElementById('iter-a').textContent = state ? '$' + state.a.toFixed(4) : '-';
    document.getElementById('iter-b').textContent = state ? '$' + state.b.toFixed(4) : '-';

    // 진행률 바
    if (state) {
        const initialBracket = engine.history[0].bracket;
        const pct = Math.min(100, (1 - state.bracket / initialBracket) * 100);
        document.getElementById('progress-fill').style.width = pct + '%';
    } else {
        document.getElementById('progress-fill').style.width = '0%';
    }
}

function updateIterationLog() {
    const tbody = document.getElementById('log-body');
    tbody.innerHTML = '';
    for (const h of engine.history) {
        const tr = document.createElement('tr');
        const chosen = h.iter > 0 ? (engine.history[h.iter] && h.s1 > h.s2 ? 'x₁' : 'x₂') : '-';
        tr.innerHTML = `
            <td>${h.iter}</td>
            <td>${h.a.toFixed(3)}</td>
            <td>${h.b.toFixed(3)}</td>
            <td style="color:#ff6384">${h.x1.toFixed(3)}</td>
            <td style="color:#ffce56">${h.x2.toFixed(3)}</td>
            <td>${h.bracket.toFixed(4)}</td>
        `;
        if (engine.converged && h.iter === engine.iteration) {
            tr.style.background = 'rgba(75, 192, 192, 0.15)';
        }
        tbody.appendChild(tr);
    }
    // Auto-scroll
    const container = document.getElementById('log-container');
    container.scrollTop = container.scrollHeight;
}

function updateResults() {
    if (!engine.converged) {
        document.getElementById('result-box').style.display = 'none';
        return;
    }
    document.getElementById('result-box').style.display = 'block';
    const bStar = engine.getOptimal();
    const maxSurplus = engine.getOptimalSurplus();
    const params = getParams();
    const shadingPct = ((1 - bStar / params.V) * 100).toFixed(1);
    const gridCount = engine.gridSearchCount();
    const speedup = (gridCount / engine.evalCount).toFixed(0);

    document.getElementById('res-bstar').textContent = '$' + bStar.toFixed(4);
    document.getElementById('res-shading').textContent = shadingPct + '%';
    document.getElementById('res-surplus').textContent = '$' + maxSurplus.toFixed(4);
    document.getElementById('res-iters').textContent = engine.iteration;
    document.getElementById('res-evals').textContent = engine.evalCount;
    document.getElementById('res-grid').textContent = gridCount.toLocaleString();
    document.getElementById('res-speedup').textContent = speedup + 'x';
}

function updateAll() {
    updateBracketVisualization();
    updateIterationInfo();
    updateIterationLog();
    updateResults();
}

// ==========================================
// 컨트롤 핸들러
// ==========================================

function resetDemo() {
    stopPlay();
    const params = getParams();
    engine.init(params.V, params.mu, params.sigma, params.tol);

    // Surplus 곡선 재생성
    const curveData = generateSurplusCurve(params.V, params.mu, params.sigma);
    surplusChart.data.datasets[0].data = curveData;
    surplusChart.options.scales.x.max = params.V;

    updateAll();
    document.getElementById('btn-step').disabled = false;
    document.getElementById('btn-play').disabled = false;
}

function stepDemo() {
    if (engine.converged) return;
    engine.step();
    updateAll();
    if (engine.converged) {
        document.getElementById('btn-step').disabled = true;
        stopPlay();
    }
}

function togglePlay() {
    if (isPlaying) {
        stopPlay();
    } else {
        startPlay();
    }
}

function startPlay() {
    if (engine.converged) return;
    isPlaying = true;
    document.getElementById('btn-play').textContent = 'Pause';
    document.getElementById('btn-play').classList.add('playing');
    const speed = parseInt(document.getElementById('slider-speed').value);
    const delay = 1100 - speed; // 100~1000ms
    tick();
    function tick() {
        if (!isPlaying || engine.converged) {
            stopPlay();
            return;
        }
        engine.step();
        updateAll();
        if (engine.converged) {
            stopPlay();
            return;
        }
        animationTimer = setTimeout(tick, delay);
    }
}

function stopPlay() {
    isPlaying = false;
    if (animationTimer) {
        clearTimeout(animationTimer);
        animationTimer = null;
    }
    const btn = document.getElementById('btn-play');
    if (btn) {
        btn.textContent = 'Play';
        btn.classList.remove('playing');
    }
}

function skipToEnd() {
    stopPlay();
    engine.runToEnd();
    updateAll();
    document.getElementById('btn-step').disabled = true;
}

// ==========================================
// 초기화
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    updateSliderDisplays();
    initSurplusChart();
    initConvergenceChart();
    resetDemo();

    // 슬라이더 이벤트
    ['slider-V', 'slider-mu', 'slider-sigma', 'slider-tol'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            updateSliderDisplays();
            resetDemo();
        });
    });

    document.getElementById('slider-speed').addEventListener('input', (e) => {
        document.getElementById('val-speed').textContent =
            parseInt(e.target.value) > 700 ? 'Fast' : parseInt(e.target.value) > 400 ? 'Medium' : 'Slow';
    });

    // 버튼 이벤트
    document.getElementById('btn-step').addEventListener('click', stepDemo);
    document.getElementById('btn-play').addEventListener('click', togglePlay);
    document.getElementById('btn-reset').addEventListener('click', resetDemo);
    document.getElementById('btn-skip').addEventListener('click', skipToEnd);

    // 테마 변경 감지 → 차트 색상 업데이트
    const observer = new MutationObserver(() => {
        initSurplusChart();
        initConvergenceChart();
        resetDemo();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
});
