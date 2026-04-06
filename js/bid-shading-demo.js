/**
 * Bid Shading Interactive Demo
 * pCTR 모델러 관점에서 bid shading 개념을 직관적으로 이해하기 위한 시뮬레이션.
 *
 * 핵심 질문: "1st price 경매에서 내 진짜 가치(true value) 그대로 입찰하면 왜 손해인가?"
 *
 * 시각화:
 *   1) 시장 입찰 분포 + 내 입찰가 위치 → win/lose 영역
 *   2) 1st vs 2nd price 비교 바 차트
 *   3) Shading factor별 기대이익 곡선 → 최적점 탐색
 */

// ==========================================
// 로그노멀 분포 유틸리티
// ==========================================

const Dist = {
    // Box-Muller 정규분포 난수
    randn() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },

    // 로그노멀 난수: 실제 RTB 시장 입찰 분포에 가장 가까운 모델
    sampleLognormal(mu, sigma) {
        return Math.exp(mu + sigma * this.randn());
    },

    // 로그노멀 PDF
    lognormalPDF(x, mu, sigma) {
        if (x <= 0) return 0;
        const coeff = 1 / (x * sigma * Math.sqrt(2 * Math.PI));
        const exponent = -Math.pow(Math.log(x) - mu, 2) / (2 * sigma * sigma);
        return coeff * Math.exp(exponent);
    },

    // 로그노멀 중앙값 (= e^mu)
    lognormalMedian(mu) {
        return Math.exp(mu);
    },

    // 로그노멀 평균 (= e^{mu + sigma^2/2})
    lognormalMean(mu, sigma) {
        return Math.exp(mu + sigma * sigma / 2);
    }
};

// ==========================================
// 시뮬레이션 엔진
// ==========================================

class BidShadingSimulator {
    constructor() {
        this.N_SIMULATIONS = 2000;
    }

    /**
     * N회 경매를 시뮬레이션하여 1st/2nd price 결과를 비교한다.
     */
    simulate(params) {
        const { trueValue, shadingFactor, marketMu, marketSigma } = params;
        const myBid = trueValue * (1 - shadingFactor);

        let fp = { wins: 0, totalPaid: 0, totalProfit: 0 };   // First Price
        let sp = { wins: 0, totalPaid: 0, totalProfit: 0 };    // Second Price
        let noShade = { wins: 0, totalPaid: 0, totalProfit: 0 }; // No shading (1st price)

        const marketBids = [];

        for (let i = 0; i < this.N_SIMULATIONS; i++) {
            // 시장 최고 입찰가 (경쟁자 중 최고가) — 여러 경쟁자의 max를 로그노멀로 근사
            const competitorBid = Dist.sampleLognormal(marketMu, marketSigma);
            marketBids.push(competitorBid);

            // --- First Price (with shading) ---
            if (myBid >= competitorBid) {
                fp.wins++;
                fp.totalPaid += myBid;            // 내 입찰가 그대로 지불
                fp.totalProfit += (trueValue - myBid);
            }

            // --- First Price (NO shading, bid = trueValue) ---
            if (trueValue >= competitorBid) {
                noShade.wins++;
                noShade.totalPaid += trueValue;
                noShade.totalProfit += 0;          // trueValue - trueValue = 0 항상!
            }

            // --- Second Price ---
            if (trueValue >= competitorBid) {
                sp.wins++;
                const paidPrice = competitorBid;   // 2nd price = 경쟁자 입찰가
                sp.totalPaid += paidPrice;
                sp.totalProfit += (trueValue - paidPrice);
            }
        }

        const n = this.N_SIMULATIONS;
        return {
            myBid,
            trueValue,
            shadingFactor,
            n,
            marketBids,
            firstPrice: {
                winRate: fp.wins / n,
                avgPaid: fp.wins > 0 ? fp.totalPaid / fp.wins : 0,
                avgProfit: fp.wins > 0 ? fp.totalProfit / fp.wins : 0,
                totalProfit: fp.totalProfit,
                expectedProfit: fp.totalProfit / n,
                wins: fp.wins
            },
            noShade: {
                winRate: noShade.wins / n,
                avgPaid: noShade.wins > 0 ? noShade.totalPaid / noShade.wins : 0,
                avgProfit: 0,
                totalProfit: 0,
                expectedProfit: 0,
                wins: noShade.wins
            },
            secondPrice: {
                winRate: sp.wins / n,
                avgPaid: sp.wins > 0 ? sp.totalPaid / sp.wins : 0,
                avgProfit: sp.wins > 0 ? sp.totalProfit / sp.wins : 0,
                totalProfit: sp.totalProfit,
                expectedProfit: sp.totalProfit / n,
                wins: sp.wins
            }
        };
    }

    /**
     * Shading factor를 0~0.8까지 sweep하여 최적점을 찾는다.
     */
    sweepShading(params) {
        const steps = 41;
        const results = [];
        for (let i = 0; i < steps; i++) {
            const sf = i / (steps - 1) * 0.8;    // 0 ~ 0.8
            const r = this.simulate({ ...params, shadingFactor: sf });
            results.push({
                shadingFactor: sf,
                shadingPct: sf * 100,
                expectedProfit: r.firstPrice.expectedProfit,
                winRate: r.firstPrice.winRate * 100,
                avgPaid: r.firstPrice.avgPaid
            });
        }
        return results;
    }
}

// ==========================================
// Demo Controller
// ==========================================

let simulator = new BidShadingSimulator();
let distChart, compareChart, sweepChart;
let currentResult = null;
let censoredMode = false;   // false = God View, true = Censored View

// --- 파라미터 읽기 ---
function getParams() {
    return {
        trueValue: parseFloat(document.getElementById('slider-truevalue').value),
        shadingFactor: parseFloat(document.getElementById('slider-shading').value) / 100,
        marketMu: parseFloat(document.getElementById('slider-market-mu').value),
        marketSigma: parseFloat(document.getElementById('slider-market-sigma').value)
    };
}

// --- 슬라이더 값 표시 업데이트 ---
function updateSliderLabels(params) {
    document.getElementById('val-truevalue').textContent = '$' + params.trueValue.toFixed(2);
    document.getElementById('val-shading').textContent = (params.shadingFactor * 100).toFixed(0) + '%';
    document.getElementById('val-shaded-bid').textContent = '$' + (params.trueValue * (1 - params.shadingFactor)).toFixed(2);
    document.getElementById('val-market-mu').textContent = params.marketMu.toFixed(2);
    document.getElementById('val-market-sigma').textContent = params.marketSigma.toFixed(2);
    document.getElementById('val-market-median').textContent = '$' + Dist.lognormalMedian(params.marketMu).toFixed(2);
}

// ==========================================
// Chart 1: 시장 분포 + 내 입찰가 위치
// ==========================================

function createDistChart() {
    const ctx = document.getElementById('distChart').getContext('2d');
    distChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {   // 0: Win Zone
                    label: 'Win Zone (관측 가능: 낙찰한 경매)',
                    data: [],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0,
                    order: 2
                },
                {   // 1: Lose Zone
                    label: 'Lose Zone (내 입찰가 초과)',
                    data: [],
                    backgroundColor: 'rgba(255, 99, 132, 0.4)',
                    borderColor: 'rgba(255, 99, 132, 0.8)',
                    borderWidth: 1,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0,
                    order: 2
                },
                {   // 2: Censored Zone (??? 표시용)
                    label: '??? 관측 불가 (Right-Censored)',
                    data: [],
                    backgroundColor: createCensorPattern(),
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0,
                    order: 2,
                    hidden: true    // 초기에는 숨김
                },
                {   // 3: True Value line
                    label: 'True Value (pCTR × ConvValue)',
                    data: [],
                    type: 'line',
                    borderColor: '#FFD700',
                    borderWidth: 2.5,
                    borderDash: [8, 4],
                    pointRadius: 0,
                    fill: false,
                    order: 0
                },
                {   // 4: Shaded Bid line
                    label: 'Shaded Bid (실제 입찰가)',
                    data: [],
                    type: 'line',
                    borderColor: '#00e5ff',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    fill: false,
                    order: 0
                },
                {   // 5: Censored 추정 분포 (naive estimate from observed data)
                    label: '잘못된 추정 분포 (관측 데이터만 사용)',
                    data: [],
                    type: 'line',
                    borderColor: '#ff6b9d',
                    borderWidth: 2,
                    borderDash: [4, 4],
                    pointRadius: 0,
                    fill: false,
                    order: 0,
                    hidden: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    title: { display: true, text: '경쟁자 최고 입찰가 ($)' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                y: {
                    title: { display: true, text: '빈도 (경매 수)' },
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '시장 입찰 분포와 내 입찰 위치',
                    font: { size: 14, weight: '600' },
                    color: 'rgba(255,255,255,0.9)'
                },
                tooltip: {
                    callbacks: {
                        title: (items) => '$' + items[0].label
                    }
                }
            },
            animation: { duration: 250 }
        }
    });
}

// Censored 영역에 사선 패턴을 그리기 위한 캔버스 패턴
function createCensorPattern() {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 16;
    patternCanvas.height = 16;
    const pctx = patternCanvas.getContext('2d');
    pctx.fillStyle = 'rgba(120, 120, 120, 0.15)';
    pctx.fillRect(0, 0, 16, 16);
    pctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    pctx.lineWidth = 1.5;
    pctx.beginPath();
    pctx.moveTo(0, 16);
    pctx.lineTo(16, 0);
    pctx.stroke();
    pctx.beginPath();
    pctx.moveTo(-4, 4);
    pctx.lineTo(4, -4);
    pctx.stroke();
    pctx.beginPath();
    pctx.moveTo(12, 20);
    pctx.lineTo(20, 12);
    pctx.stroke();
    // "?" 마크
    pctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    pctx.font = 'bold 9px monospace';
    pctx.fillText('?', 5, 11);
    return document.getElementById('distChart').getContext('2d').createPattern(patternCanvas, 'repeat');
}

function updateDistChart(result) {
    const bids = result.marketBids;
    const myBid = result.myBid;
    const trueVal = result.trueValue;

    // 히스토그램 빈 생성
    const maxBid = Math.max(...bids, trueVal + 0.5);
    const binCount = 40;
    const binWidth = maxBid / binCount;
    const winBins = new Array(binCount).fill(0);
    const loseBins = new Array(binCount).fill(0);
    const censoredBins = new Array(binCount).fill(0);
    const labels = [];

    for (let i = 0; i < binCount; i++) {
        labels.push((binWidth * (i + 0.5)).toFixed(2));
    }

    bids.forEach(b => {
        const idx = Math.min(Math.floor(b / binWidth), binCount - 1);
        if (b <= myBid) {
            winBins[idx]++;
        } else {
            loseBins[idx]++;
        }
    });

    // Censored 모드: lose zone을 "???" 패턴으로 교체
    if (censoredMode) {
        for (let i = 0; i < binCount; i++) {
            censoredBins[i] = loseBins[i];
            loseBins[i] = 0;
        }
    } else {
        for (let i = 0; i < binCount; i++) {
            censoredBins[i] = 0;
        }
    }

    // True Value & Shaded Bid 수직선
    const maxFreq = Math.max(...winBins.map((w, i) => w + (censoredMode ? censoredBins[i] : loseBins[i])));
    const trueValueLine = labels.map(l => parseFloat(l) >= trueVal - binWidth / 2 && parseFloat(l) <= trueVal + binWidth / 2 ? maxFreq * 1.1 : null);
    const shadedBidLine = labels.map(l => parseFloat(l) >= myBid - binWidth / 2 && parseFloat(l) <= myBid + binWidth / 2 ? maxFreq * 1.1 : null);

    // Naive 추정 분포 (관측된 win 데이터만으로 분포를 추정했을 때)
    // → 오른쪽 꼬리가 잘려있어 시장가를 과소추정하게 됨
    let naiveEstLine = new Array(binCount).fill(null);
    if (censoredMode) {
        const observedBids = bids.filter(b => b <= myBid);
        if (observedBids.length > 10) {
            // 관측된 데이터의 mean, std로 로그노멀 피팅 (naive)
            const logObs = observedBids.map(b => Math.log(Math.max(b, 0.001)));
            const naiveMu = logObs.reduce((s, v) => s + v, 0) / logObs.length;
            const naiveVar = logObs.reduce((s, v) => s + (v - naiveMu) ** 2, 0) / logObs.length;
            const naiveSigma = Math.sqrt(naiveVar);
            // 추정 PDF를 빈도 스케일로 변환
            const totalN = result.n;
            for (let i = 0; i < binCount; i++) {
                const x = parseFloat(labels[i]);
                const pdf = Dist.lognormalPDF(x, naiveMu, naiveSigma || 0.01);
                naiveEstLine[i] = pdf * totalN * binWidth;
            }
        }
    }

    distChart.data.labels = labels;
    distChart.data.datasets[0].data = winBins;
    distChart.data.datasets[1].data = loseBins;
    distChart.data.datasets[2].data = censoredBins;
    distChart.data.datasets[3].data = trueValueLine;
    distChart.data.datasets[4].data = shadedBidLine;
    distChart.data.datasets[5].data = naiveEstLine;

    // Censored 모드 시 데이터셋 표시/숨김
    distChart.data.datasets[1].hidden = censoredMode;    // Lose Zone (실제)
    distChart.data.datasets[2].hidden = !censoredMode;   // ??? 패턴
    distChart.data.datasets[5].hidden = !censoredMode;   // Naive 추정선

    // 타이틀 업데이트
    distChart.options.plugins.title.text = censoredMode
        ? '시장 입찰 분포 — Censored View (실제 DSP가 보는 것)'
        : '시장 입찰 분포 — God View (이론적 전지적 시점)';

    distChart.update();

    // Censored 통계 업데이트
    updateCensoredStats(result, bids);
}

// ==========================================
// Chart 2: 1st vs 2nd Price 비교 바 차트
// ==========================================

function createCompareChart() {
    const ctx = document.getElementById('compareChart').getContext('2d');
    compareChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Win Rate (%)', 'Avg Paid ($)', 'Avg Profit / Win ($)', 'E[Profit] / Auction ($)'],
            datasets: [
                {
                    label: '1st Price (No Shade)',
                    data: [0, 0, 0, 0],
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: '1st Price (Shaded)',
                    data: [0, 0, 0, 0],
                    backgroundColor: 'rgba(0, 229, 255, 0.7)',
                    borderColor: 'rgba(0, 229, 255, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: '2nd Price (Truthful)',
                    data: [0, 0, 0, 0],
                    backgroundColor: 'rgba(255, 206, 86, 0.7)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '입찰 전략 비교: No Shade vs Shaded vs 2nd Price',
                    font: { size: 14, weight: '600' },
                    color: 'rgba(255,255,255,0.9)'
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ctx.dataset.label + ': ' + ctx.parsed.x.toFixed(3)
                    }
                }
            },
            animation: { duration: 250 }
        }
    });
}

function updateCompareChart(result) {
    const ns = result.noShade;
    const fp = result.firstPrice;
    const sp = result.secondPrice;

    compareChart.data.datasets[0].data = [
        ns.winRate * 100,
        ns.avgPaid,
        ns.avgProfit,
        ns.expectedProfit
    ];
    compareChart.data.datasets[1].data = [
        fp.winRate * 100,
        fp.avgPaid,
        fp.avgProfit,
        fp.expectedProfit
    ];
    compareChart.data.datasets[2].data = [
        sp.winRate * 100,
        sp.avgPaid,
        sp.avgProfit,
        sp.expectedProfit
    ];
    compareChart.update();
}

// ==========================================
// Chart 3: Shading Factor Sweep
// ==========================================

function createSweepChart() {
    const ctx = document.getElementById('sweepChart').getContext('2d');
    sweepChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'E[Profit] / Auction ($)',
                    data: [],
                    borderColor: '#4BC0C0',
                    backgroundColor: 'rgba(75, 192, 192, 0.15)',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: 'Win Rate (%)',
                    data: [],
                    borderColor: 'rgba(255, 206, 86, 0.8)',
                    borderWidth: 2,
                    borderDash: [6, 3],
                    pointRadius: 0,
                    fill: false,
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    type: 'linear',
                    min: 0,
                    max: 80,
                    title: { display: true, text: 'Shading Factor (%)' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                y: {
                    position: 'left',
                    title: { display: true, text: 'E[Profit] / Auction ($)' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                y1: {
                    position: 'right',
                    min: 0,
                    max: 100,
                    title: { display: true, text: 'Win Rate (%)' },
                    grid: { drawOnChartArea: false }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Shading Factor별 기대이익 & 낙찰률',
                    font: { size: 14, weight: '600' },
                    color: 'rgba(255,255,255,0.9)'
                }
            },
            animation: { duration: 250 }
        },
        plugins: [{
            id: 'currentShadingLine',
            afterDraw(chart) {
                const slider = document.getElementById('slider-shading');
                if (!slider) return;
                const val = parseFloat(slider.value);
                const xScale = chart.scales.x;
                const yScale = chart.scales.y;
                const xPx = xScale.getPixelForValue(val);
                if (xPx < xScale.left || xPx > xScale.right) return;
                const ctx = chart.ctx;
                ctx.save();
                ctx.beginPath();
                ctx.setLineDash([6, 4]);
                ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
                ctx.lineWidth = 1.5;
                ctx.moveTo(xPx, yScale.top);
                ctx.lineTo(xPx, yScale.bottom);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = 'rgba(0, 229, 255, 0.9)';
                ctx.font = '11px Fira Code, monospace';
                ctx.textAlign = 'center';
                ctx.fillText(val + '%', xPx, yScale.top - 6);
                ctx.restore();
            }
        }]
    });
}

function updateSweepChart(params) {
    const sweepData = simulator.sweepShading(params);
    sweepChart.data.datasets[0].data = sweepData.map(d => ({ x: d.shadingPct, y: d.expectedProfit }));
    sweepChart.data.datasets[1].data = sweepData.map(d => ({ x: d.shadingPct, y: d.winRate }));

    // 최적점 찾기
    let bestIdx = 0;
    let bestProfit = -Infinity;
    sweepData.forEach((d, i) => {
        if (d.expectedProfit > bestProfit) {
            bestProfit = d.expectedProfit;
            bestIdx = i;
        }
    });
    const optimalSF = sweepData[bestIdx].shadingPct;
    document.getElementById('stat-optimal-sf').textContent = optimalSF.toFixed(0) + '%';
    document.getElementById('stat-optimal-bid').textContent = '$' + (params.trueValue * (1 - optimalSF / 100)).toFixed(2);
    document.getElementById('stat-optimal-profit').textContent = '$' + bestProfit.toFixed(4);

    sweepChart.update();
}

// ==========================================
// Stats Panel 업데이트
// ==========================================

function updateStats(result) {
    const fp = result.firstPrice;
    const ns = result.noShade;
    const sp = result.secondPrice;

    // Shaded 1st price stats
    document.getElementById('stat-fp-winrate').textContent = (fp.winRate * 100).toFixed(1) + '%';
    document.getElementById('stat-fp-avgpaid').textContent = '$' + fp.avgPaid.toFixed(3);
    document.getElementById('stat-fp-profit').textContent = '$' + fp.expectedProfit.toFixed(4);

    // No-shade 1st price stats
    document.getElementById('stat-ns-winrate').textContent = (ns.winRate * 100).toFixed(1) + '%';
    document.getElementById('stat-ns-avgpaid').textContent = '$' + ns.avgPaid.toFixed(3);
    document.getElementById('stat-ns-profit').textContent = '$' + ns.expectedProfit.toFixed(4);

    // 2nd price stats
    document.getElementById('stat-sp-winrate').textContent = (sp.winRate * 100).toFixed(1) + '%';
    document.getElementById('stat-sp-avgpaid').textContent = '$' + sp.avgPaid.toFixed(3);
    document.getElementById('stat-sp-profit').textContent = '$' + sp.expectedProfit.toFixed(4);

    // Savings highlight
    const savings = fp.expectedProfit - ns.expectedProfit;
    const savingsEl = document.getElementById('stat-savings');
    savingsEl.textContent = (savings >= 0 ? '+$' : '-$') + Math.abs(savings).toFixed(4);
    savingsEl.style.color = savings >= 0 ? '#4BC0C0' : '#FF6384';
}

// ==========================================
// Censored Data 통계
// ==========================================

function updateCensoredStats(result, allBids) {
    const container = document.getElementById('censored-stats');
    if (!container) return;

    const myBid = result.myBid;
    const observedBids = allBids.filter(b => b <= myBid);
    const hiddenBids = allBids.filter(b => b > myBid);

    const totalAuctions = result.n;
    const observedCount = observedBids.length;
    const hiddenCount = hiddenBids.length;
    const observedPct = (observedCount / totalAuctions * 100).toFixed(1);
    const hiddenPct = (hiddenCount / totalAuctions * 100).toFixed(1);

    // 관측 데이터의 naive 통계
    let naiveMean = 0, naiveMedian = 0;
    if (observedBids.length > 0) {
        naiveMean = observedBids.reduce((s, v) => s + v, 0) / observedBids.length;
        const sorted = [...observedBids].sort((a, b) => a - b);
        naiveMedian = sorted[Math.floor(sorted.length / 2)];
    }

    // 실제 전체 통계
    const trueMean = allBids.reduce((s, v) => s + v, 0) / allBids.length;
    const sortedAll = [...allBids].sort((a, b) => a - b);
    const trueMedian = sortedAll[Math.floor(sortedAll.length / 2)];

    if (censoredMode) {
        container.style.display = 'block';
        container.innerHTML = `
            <div class="censored-header">
                <div class="censored-bar">
                    <div class="censored-observed" style="width: ${observedPct}%">
                        <span>${observedPct}% 관측</span>
                    </div>
                    <div class="censored-hidden" style="width: ${hiddenPct}%">
                        <span>${hiddenPct}% ???</span>
                    </div>
                </div>
            </div>
            <table class="stats-table" style="margin-top: 0.75rem;">
                <thead>
                    <tr>
                        <th></th>
                        <th>Naive 추정<br><span style="font-weight:400;font-size:0.7rem;">(관측 데이터만)</span></th>
                        <th>실제 값<br><span style="font-weight:400;font-size:0.7rem;">(God View)</span></th>
                        <th>오차</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Mean</td>
                        <td>$${naiveMean.toFixed(3)}</td>
                        <td>$${trueMean.toFixed(3)}</td>
                        <td style="color: #FF6384;">${((naiveMean - trueMean) / trueMean * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td>Median</td>
                        <td>$${naiveMedian.toFixed(3)}</td>
                        <td>$${trueMedian.toFixed(3)}</td>
                        <td style="color: #FF6384;">${((naiveMedian - trueMedian) / trueMedian * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td>관측 건수</td>
                        <td>${observedCount} / ${totalAuctions}</td>
                        <td>${totalAuctions} / ${totalAuctions}</td>
                        <td style="color: var(--text-muted);">-${hiddenCount}건 누락</td>
                    </tr>
                </tbody>
            </table>
            <div style="margin-top: 0.75rem; font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">
                Naive 추정은 시장가를 <strong style="color: #FF6384;">과소추정</strong>합니다.
                관측 가능한 데이터는 모두 "내가 이긴 경매"이므로, 시장가가 낮은 쪽에 편향됩니다.
                이 편향을 보정하지 않으면 bid shading을 과도하게 적용하여 낙찰 기회를 놓칩니다.
            </div>
        `;
    } else {
        container.style.display = 'none';
    }
}

// ==========================================
// Censored Mode 토글
// ==========================================

function toggleCensoredMode() {
    censoredMode = !censoredMode;

    const btn = document.getElementById('btn-censored-toggle');
    const indicator = document.getElementById('censored-mode-indicator');

    if (censoredMode) {
        btn.textContent = 'God View로 전환';
        btn.classList.add('active');
        indicator.textContent = 'Censored View 활성';
        indicator.style.color = '#FF6384';
    } else {
        btn.textContent = 'Censored View로 전환';
        btn.classList.remove('active');
        indicator.textContent = 'God View 활성';
        indicator.style.color = '#4BC0C0';
    }

    // 차트만 다시 그리기 (시뮬레이션 재실행 불필요)
    if (currentResult) {
        updateDistChart(currentResult);
    }
}

// ==========================================
// 전체 Refresh
// ==========================================

function refresh() {
    const params = getParams();
    updateSliderLabels(params);

    currentResult = simulator.simulate(params);
    updateDistChart(currentResult);
    updateCompareChart(currentResult);
    updateStats(currentResult);
    updateSweepChart(params);
}

// ==========================================
// 초기화
// ==========================================

function initDemo() {
    createDistChart();
    createCompareChart();
    createSweepChart();

    // 슬라이더 이벤트
    const sliderIds = ['slider-truevalue', 'slider-shading', 'slider-market-mu', 'slider-market-sigma'];
    sliderIds.forEach(id => {
        document.getElementById(id).addEventListener('input', refresh);
    });

    // Censored mode toggle
    const toggleBtn = document.getElementById('btn-censored-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleCensoredMode);
    }

    refresh();
}

document.addEventListener('DOMContentLoaded', initDemo);
