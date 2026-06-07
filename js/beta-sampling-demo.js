/**
 * 베타 분포 샘플링 데모
 * "분포에서 한 번 뽑는다"를 시각화: 샘플을 반복해 뽑으면 히스토그램이 베타 곡선을 재현.
 * 수학 함수(logGamma/betaPDF/sampleBeta)는 ts-demo.js와 동일한 표준 구현.
 */

// ==========================================
// Math Helpers (표준 베타 분포 구현)
// ==========================================
const M = {
    logGamma: (z) => {
        const c = [
            76.18009172947146, -86.50532032941677, 24.01409824083091,
            -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
        ];
        let x = z, y = z, tmp = x + 5.5;
        tmp -= (x + 0.5) * Math.log(tmp);
        let ser = 1.000000000190015;
        for (let j = 0; j < 6; j++) ser += c[j] / ++y;
        return -tmp + Math.log(2.5066282746310005 * ser / x);
    },
    betaPDF: (x, a, b) => {
        if (x <= 0 || x >= 1) return 0;
        const lnB = M.logGamma(a) + M.logGamma(b) - M.logGamma(a + b);
        const lnNum = (a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x);
        return Math.exp(lnNum - lnB);
    },
    randn: () => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    },
    sampleGamma: (k) => {
        if (k < 1) return M.sampleGamma(k + 1) * Math.pow(Math.random(), 1 / k);
        const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
        while (true) {
            const x = M.randn();
            const v = 1 + c * x;
            if (v <= 0) continue;
            const v3 = v * v * v;
            const u = Math.random();
            if (u < 1 - 0.0331 * x * x * x * x) return d * v3;
            if (Math.log(u) < 0.5 * x * x + d * (1 - v3 + Math.log(v3))) return d * v3;
        }
    },
    sampleBeta: (a, b) => {
        const x = M.sampleGamma(a), y = M.sampleGamma(b);
        return x / (x + y);
    }
};

// ==========================================
// State & Config
// ==========================================
const NBINS = 40;
const BW = 1 / NBINS;
const AUTO_CAP = 5000;
const COLORS = {
    brick: 'rgba(156, 90, 68, 1)',
    brickFill: 'rgba(156, 90, 68, 0.18)',
    bronze: 'rgba(154, 125, 56, 1)',
    slate: 'rgba(90, 107, 122, 1)'
};

let alpha = 8, beta = 14;
let bins = new Array(NBINS).fill(0);
let total = 0, sumSamples = 0, last = null;
let autoTimer = null;
let chart;

// ==========================================
// Data builders
// ==========================================
function pdfData() {
    const pts = [];
    for (let i = 1; i < 200; i++) {
        const x = i / 200;
        pts.push({ x, y: M.betaPDF(x, alpha, beta) });
    }
    return pts;
}

function histogramData() {
    const pts = [];
    for (let i = 0; i < NBINS; i++) {
        const density = total > 0 ? bins[i] / (total * BW) : 0;
        pts.push({ x: i * BW, y: density });
        pts.push({ x: (i + 1) * BW, y: density });
    }
    return pts;
}

function dartData() {
    if (last === null) return [];
    return [{ x: last, y: 0 }, { x: last, y: M.betaPDF(last, alpha, beta) }];
}

// ==========================================
// Render
// ==========================================
function initChart() {
    const ctx = document.getElementById('betaChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: '뽑은 샘플 빈도',
                    data: histogramData(),
                    borderColor: COLORS.brick,
                    backgroundColor: COLORS.brickFill,
                    borderWidth: 1.5,
                    pointRadius: 0,
                    fill: 'origin',
                    stepped: false,
                    order: 2
                },
                {
                    label: '베타 분포 (믿음)',
                    data: pdfData(),
                    borderColor: COLORS.bronze,
                    borderWidth: 2.5,
                    pointRadius: 0,
                    fill: false,
                    tension: 0.3,
                    order: 1
                },
                {
                    label: '마지막 샘플',
                    data: dartData(),
                    borderColor: COLORS.slate,
                    borderWidth: 2,
                    pointRadius: [0, 5],
                    pointBackgroundColor: COLORS.slate,
                    fill: false,
                    order: 0
                }
            ]
        },
        options: {
            responsive: true,
            animation: { duration: 0 },
            interaction: { mode: 'nearest', intersect: false },
            scales: {
                x: {
                    type: 'linear', min: 0, max: 1,
                    title: { display: true, text: 'CTR (클릭 확률)' }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: '밀도 / 빈도' }
                }
            },
            plugins: {
                legend: { labels: { usePointStyle: true, boxWidth: 8 } },
                title: { display: true, text: '베타 분포에서 샘플 뽑기' },
                tooltip: { enabled: false }
            }
        }
    });
}

function updateChart() {
    chart.data.datasets[0].data = histogramData();
    chart.data.datasets[1].data = pdfData();
    chart.data.datasets[2].data = dartData();
    chart.update();
}

function updateStats() {
    document.getElementById('stat-last').textContent = last === null ? '—' : last.toFixed(3);
    document.getElementById('stat-count').textContent = total.toLocaleString();
    document.getElementById('stat-mean').textContent = total > 0 ? (sumSamples / total).toFixed(3) : '—';
    document.getElementById('stat-true').textContent = (alpha / (alpha + beta)).toFixed(3);
}

// ==========================================
// Actions
// ==========================================
function drawOne(render = true) {
    const s = M.sampleBeta(alpha, beta);
    const idx = Math.min(NBINS - 1, Math.floor(s * NBINS));
    bins[idx]++;
    total++;
    sumSamples += s;
    last = s;
    if (render) { updateChart(); updateStats(); }
}

function drawMany(n) {
    for (let i = 0; i < n; i++) drawOne(false);
    updateChart();
    updateStats();
}

function stopAuto() {
    if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
        document.getElementById('btn-auto').textContent = '자동 ▶';
        document.getElementById('btn-auto').classList.remove('primary');
    }
}

function toggleAuto() {
    if (autoTimer) { stopAuto(); return; }
    const btn = document.getElementById('btn-auto');
    btn.textContent = '자동 ⏸';
    btn.classList.add('primary');
    autoTimer = setInterval(() => {
        drawOne();
        if (total >= AUTO_CAP) stopAuto();
    }, 80);
}

function resetSamples(keepAuto = false) {
    if (!keepAuto) stopAuto();
    bins = new Array(NBINS).fill(0);
    total = 0;
    sumSamples = 0;
    last = null;
    updateChart();
    updateStats();
}

function onSliderChange() {
    stopAuto();
    alpha = parseInt(document.getElementById('slider-alpha').value, 10);
    beta = parseInt(document.getElementById('slider-beta').value, 10);
    document.getElementById('alpha-val').textContent = alpha;
    document.getElementById('beta-val').textContent = beta;
    resetSamples(true); // 분포가 바뀌면 기존 샘플은 무효 → 초기화 (updateChart 포함)
}

// ==========================================
// Wire up
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    updateStats();
    document.getElementById('btn-one').addEventListener('click', () => { stopAuto(); drawOne(); });
    document.getElementById('btn-hundred').addEventListener('click', () => { stopAuto(); drawMany(100); });
    document.getElementById('btn-auto').addEventListener('click', toggleAuto);
    document.getElementById('btn-reset').addEventListener('click', () => resetSamples());
    document.getElementById('slider-alpha').addEventListener('input', onSliderChange);
    document.getElementById('slider-beta').addEventListener('input', onSliderChange);
});
