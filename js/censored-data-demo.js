/**
 * Censored Data in RTB — Interactive Demo
 * ML 엔지니어 관점에서 Right-Censoring 문제를 단계별로 이해하기 위한 시뮬레이션.
 *
 * 핵심 질문: "입찰에서 졌을 때, 어떤 정보를 잃어버리는가? 그 손실은 어떻게 복구하는가?"
 *
 * 5-Step Guided Flow:
 *   1) God View — 시장 전체를 본다
 *   2) Engineer View — 실제로 보이는 것
 *   3) Naive 추정 — 보이는 것만으로 추정하면?
 *   4) Censored Regression — Lose 데이터도 활용한다
 *   5) Impact — 추정 오차가 입찰에 미치는 영향
 *
 * References:
 *   - Ghosh et al. (Adobe Research, 2020): MCNet
 *   - Zhou et al. (Yahoo/Verizon Media, KDD 2021): Log-normal + DeepFM
 */

// ==========================================
// 로그노멀 분포 유틸리티
// ==========================================

const Dist = {
    randn() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },

    sampleLognormal(mu, sigma) {
        return Math.exp(mu + sigma * this.randn());
    },

    lognormalPDF(x, mu, sigma) {
        if (x <= 0) return 0;
        const coeff = 1 / (x * sigma * Math.sqrt(2 * Math.PI));
        const exponent = -Math.pow(Math.log(x) - mu, 2) / (2 * sigma * sigma);
        return coeff * Math.exp(exponent);
    },

    // Abramowitz-Stegun approximation for normal CDF
    normalCDF(x) {
        const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
        const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
        const sign = x < 0 ? -1 : 1;
        const t = 1 / (1 + p * Math.abs(x));
        const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x / 2);
        return 0.5 * (1 + sign * y);
    },

    lognormalCDF(x, mu, sigma) {
        if (x <= 0) return 0;
        return this.normalCDF((Math.log(x) - mu) / sigma);
    },

    lognormalSurvival(x, mu, sigma) {
        return 1 - this.lognormalCDF(x, mu, sigma);
    },

    lognormalMedian(mu) {
        return Math.exp(mu);
    },

    lognormalMean(mu, sigma) {
        return Math.exp(mu + sigma * sigma / 2);
    }
};

// ==========================================
// 통계 헬퍼
// ==========================================

function mean(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function median(arr) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function variance(arr) {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    return arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length;
}

// ==========================================
// 시뮬레이션 엔진
// ==========================================

class CensoredDataSimulator {
    simulate(params) {
        const { myBid, marketMu, marketSigma, nAuctions } = params;
        const auctions = [];

        for (let i = 0; i < nAuctions; i++) {
            const marketPrice = Dist.sampleLognormal(marketMu, marketSigma);
            const win = myBid >= marketPrice;
            auctions.push({
                id: i + 1,
                marketPrice,
                myBid,
                win,
                observedPrice: win ? marketPrice : null,
                revealed: false
            });
        }

        const wins = auctions.filter(a => a.win);
        const losses = auctions.filter(a => !a.win);
        const allPrices = auctions.map(a => a.marketPrice);
        const observedPrices = wins.map(a => a.marketPrice);

        const naiveFit = this.fitNaive(observedPrices);
        const censoredFit = this.fitCensored(auctions, myBid);

        return {
            auctions,
            totalCount: auctions.length,
            winCount: wins.length,
            lossCount: losses.length,
            winRate: wins.length / auctions.length,
            trueMean: mean(allPrices),
            trueMedian: median(allPrices),
            naiveMean: observedPrices.length > 0 ? mean(observedPrices) : 0,
            naiveMedian: observedPrices.length > 0 ? median(observedPrices) : 0,
            naiveFit,
            censoredFit,
            trueParams: { mu: params.marketMu, sigma: params.marketSigma },
            allPrices,
            observedPrices,
            myBid
        };
    }

    fitNaive(observedPrices) {
        if (observedPrices.length < 5) return { mu: 0, sigma: 0.5 };
        const logPrices = observedPrices.map(p => Math.log(Math.max(p, 0.001)));
        const mu = mean(logPrices);
        const sigma = Math.sqrt(variance(logPrices)) || 0.01;
        return { mu, sigma };
    }

    fitCensored(auctions, myBid) {
        // Grid search over (mu, sigma) to maximize censored log-likelihood
        // Use subsampling for large datasets to keep computation fast
        let sampleAuctions = auctions;
        if (auctions.length > 2000) {
            sampleAuctions = [];
            const step = auctions.length / 2000;
            for (let i = 0; i < auctions.length; i += step) {
                sampleAuctions.push(auctions[Math.floor(i)]);
            }
        }
        const fitAuctions = sampleAuctions;
        const muMin = -1.0, muMax = 2.5, muSteps = 50;
        const sigmaMin = 0.05, sigmaMax = 1.5, sigmaSteps = 30;

        let bestMu = 0, bestSigma = 0.5, bestLL = -Infinity;

        for (let i = 0; i <= muSteps; i++) {
            const mu = muMin + (muMax - muMin) * i / muSteps;
            for (let j = 0; j <= sigmaSteps; j++) {
                const sigma = sigmaMin + (sigmaMax - sigmaMin) * j / sigmaSteps;
                const ll = this.censoredLogLikelihood(mu, sigma, fitAuctions, myBid);
                if (ll > bestLL) {
                    bestLL = ll;
                    bestMu = mu;
                    bestSigma = sigma;
                }
            }
        }

        // Refine with smaller grid around best
        const muRange = (muMax - muMin) / muSteps * 2;
        const sigmaRange = (sigmaMax - sigmaMin) / sigmaSteps * 2;
        for (let i = 0; i <= 20; i++) {
            const mu = bestMu - muRange + 2 * muRange * i / 20;
            for (let j = 0; j <= 20; j++) {
                const sigma = Math.max(0.01, bestSigma - sigmaRange + 2 * sigmaRange * j / 20);
                const ll = this.censoredLogLikelihood(mu, sigma, fitAuctions, myBid);
                if (ll > bestLL) {
                    bestLL = ll;
                    bestMu = mu;
                    bestSigma = sigma;
                }
            }
        }

        return { mu: bestMu, sigma: bestSigma };
    }

    censoredLogLikelihood(mu, sigma, auctions, myBid) {
        let ll = 0;
        for (const a of auctions) {
            if (a.win) {
                const pdf = Dist.lognormalPDF(a.marketPrice, mu, sigma);
                ll += Math.log(Math.max(pdf, 1e-300));
            } else {
                const survival = Dist.lognormalSurvival(myBid, mu, sigma);
                ll += Math.log(Math.max(survival, 1e-300));
            }
        }
        return ll;
    }

    // Step 5: optimal bid 계산 (surplus maximization)
    findOptimalBid(trueValue, mu, sigma) {
        let bestBid = 0, bestSurplus = -Infinity;
        const steps = 200;
        for (let i = 1; i < steps; i++) {
            const b = trueValue * i / steps;
            const winProb = Dist.lognormalCDF(b, mu, sigma);
            const surplus = (trueValue - b) * winProb;
            if (surplus > bestSurplus) {
                bestSurplus = surplus;
                bestBid = b;
            }
        }
        return { bid: bestBid, surplus: bestSurplus };
    }
}

// ==========================================
// 글로벌 상태
// ==========================================

const simulator = new CensoredDataSimulator();
let currentResult = null;
let currentStep = 1;
let maxUnlockedStep = 1;
let godViewMode = true;
let distributionChart = null;
let comparisonChart = null;
let impactChart = null;

// ==========================================
// 파라미터 읽기
// ==========================================

function getParams() {
    return {
        myBid: parseFloat(document.getElementById('slider-my-bid').value),
        marketMu: parseFloat(document.getElementById('slider-mu').value),
        marketSigma: parseFloat(document.getElementById('slider-sigma').value),
        nAuctions: parseInt(document.getElementById('slider-n').value)
    };
}

function updateSliderLabels() {
    const p = getParams();
    document.getElementById('val-my-bid').textContent = '$' + p.myBid.toFixed(2);
    document.getElementById('val-mu').textContent = p.marketMu.toFixed(2);
    document.getElementById('val-sigma').textContent = p.marketSigma.toFixed(2);
    document.getElementById('val-n').textContent = p.nAuctions;
    document.getElementById('val-median').textContent = '$' + Dist.lognormalMedian(p.marketMu).toFixed(2);
}

// ==========================================
// Step Progress Bar
// ==========================================

function updateProgressBar() {
    for (let i = 1; i <= 5; i++) {
        const dot = document.getElementById('step-dot-' + i);
        if (!dot) continue;
        dot.classList.remove('active', 'completed', 'locked');
        if (i === currentStep) {
            dot.classList.add('active');
        } else if (i < currentStep) {
            dot.classList.add('completed');
        } else if (i <= maxUnlockedStep) {
            dot.classList.add('completed');
        } else {
            dot.classList.add('locked');
        }
    }
    // Connectors
    for (let i = 1; i <= 4; i++) {
        const conn = document.getElementById('step-conn-' + i);
        if (!conn) continue;
        conn.classList.toggle('completed', i < maxUnlockedStep);
    }
}

function goToStep(step) {
    if (step > maxUnlockedStep || step < 1 || step > 5) return;
    currentStep = step;
    updateProgressBar();
    showStepContent();
    updateViewForStep();
    updateChartsForStep();
}

function advanceStep() {
    if (currentStep < 5) {
        maxUnlockedStep = Math.max(maxUnlockedStep, currentStep + 1);
        goToStep(currentStep + 1);
    }
}

// ==========================================
// Step Content Display
// ==========================================

function showStepContent() {
    for (let i = 1; i <= 5; i++) {
        const section = document.getElementById('step-' + i);
        if (section) section.classList.toggle('active', i === currentStep);
    }
    // Show/hide chart containers
    const distPanel = document.getElementById('dist-chart-panel');
    const tablePanel = document.getElementById('auction-table-panel');
    const comparePanel = document.getElementById('comparison-panel');
    const impactPanel = document.getElementById('impact-panel');

    if (distPanel) distPanel.style.display = (currentStep >= 1) ? 'block' : 'none';
    if (tablePanel) tablePanel.style.display = (currentStep <= 2) ? 'block' : 'none';
    if (comparePanel) comparePanel.style.display = (currentStep >= 3 && currentStep <= 4) ? 'block' : 'none';
    if (impactPanel) impactPanel.style.display = (currentStep === 5) ? 'block' : 'none';

    // Reveal button visibility
    const revealBtn = document.getElementById('btn-reveal');
    if (revealBtn) revealBtn.style.display = (currentStep === 2 && !godViewMode) ? 'inline-block' : 'none';

    // Show next-step button if data exists
    if (currentResult) {
        for (let i = 1; i <= 4; i++) {
            const btn = document.getElementById('btn-next-' + i);
            if (btn) btn.style.display = (i === currentStep) ? 'inline-block' : 'none';
        }
    }
}

function updateViewForStep() {
    if (currentStep === 1) {
        setViewMode(true);   // Force God View
    } else if (currentStep === 2 && godViewMode) {
        setViewMode(false);  // Auto-switch to Engineer View
    }
    // Step 2+ allow toggle
    const toggleWrap = document.getElementById('view-toggle-wrap');
    if (toggleWrap) toggleWrap.style.opacity = currentStep >= 2 ? '1' : '0.4';
    const btnGod = document.getElementById('btn-god-view');
    const btnEng = document.getElementById('btn-engineer-view');
    if (btnGod) btnGod.disabled = currentStep < 2;
    if (btnEng) btnEng.disabled = currentStep < 2;
}

// ==========================================
// God View / Engineer View Toggle
// ==========================================

function setViewMode(isGod) {
    godViewMode = isGod;
    const btnGod = document.getElementById('btn-god-view');
    const btnEng = document.getElementById('btn-engineer-view');
    if (btnGod) btnGod.classList.toggle('active', isGod);
    if (btnEng) btnEng.classList.toggle('active', !isGod);

    const revealBtn = document.getElementById('btn-reveal');
    if (revealBtn) revealBtn.style.display = (currentStep === 2 && !isGod) ? 'inline-block' : 'none';

    if (currentResult) {
        updateDistributionChart();
        updateAuctionTable();
        updateStatsCards();
    }
}

// ==========================================
// Run Simulation
// ==========================================

function runSimulation() {
    const params = getParams();
    currentResult = simulator.simulate(params);

    // Ensure step 1 is available
    if (maxUnlockedStep < 1) maxUnlockedStep = 1;

    updateDistributionChart();
    updateAuctionTable();
    updateStatsCards();
    updateChartsForStep();

    // Show next-step button
    const btn = document.getElementById('btn-next-' + currentStep);
    if (btn) btn.style.display = 'inline-block';
}

// ==========================================
// Chart 1: Distribution Histogram
// ==========================================

function createCensorPattern(ctx) {
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
    pctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    pctx.font = 'bold 9px monospace';
    pctx.fillText('?', 5, 11);
    return ctx.createPattern(patternCanvas, 'repeat');
}

function createDistributionChart() {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    distributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                { // 0: Win Zone
                    label: 'Win (관측 가능)',
                    data: [],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0,
                    order: 3
                },
                { // 1: Lose Zone
                    label: 'Lose (내 입찰가 초과)',
                    data: [],
                    backgroundColor: 'rgba(255, 99, 132, 0.4)',
                    borderColor: 'rgba(255, 99, 132, 0.8)',
                    borderWidth: 1,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0,
                    order: 3
                },
                { // 2: Censored Zone (??? pattern)
                    label: '??? 관측 불가 (Right-Censored)',
                    data: [],
                    backgroundColor: createCensorPattern(ctx),
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0,
                    order: 3,
                    hidden: true
                },
                { // 3: My Bid line
                    label: 'My Bid (= Censoring Threshold)',
                    data: [],
                    type: 'line',
                    borderColor: '#00e5ff',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    fill: false,
                    order: 0
                },
                { // 4: True distribution curve (God View)
                    label: '실제 분포 (God View)',
                    data: [],
                    type: 'line',
                    borderColor: '#4BC0C0',
                    borderWidth: 2,
                    borderDash: [6, 3],
                    pointRadius: 0,
                    fill: false,
                    order: 1,
                    hidden: true
                },
                { // 5: Naive fit curve
                    label: 'Naive 추정 (Win 데이터만)',
                    data: [],
                    type: 'line',
                    borderColor: '#ff6b9d',
                    borderWidth: 2.5,
                    borderDash: [4, 4],
                    pointRadius: 0,
                    fill: false,
                    order: 1,
                    hidden: true
                },
                { // 6: Censored regression curve
                    label: 'Censored Regression 보정',
                    data: [],
                    type: 'line',
                    borderColor: '#FFD700',
                    borderWidth: 2.5,
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
                    title: { display: true, text: '시장 가격 ($)' },
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
                    text: '시장 가격 분포',
                    font: { size: 14, weight: '600' },
                    color: 'rgba(255,255,255,0.9)'
                },
                tooltip: {
                    callbacks: {
                        title: (items) => '$' + items[0].label
                    }
                }
            },
            animation: { duration: 300 }
        }
    });
}

function updateDistributionChart() {
    if (!distributionChart || !currentResult) return;
    const r = currentResult;
    const bids = r.allPrices;
    const myBid = r.myBid;

    // Histogram bins
    const maxVal = Math.min(Math.max(...bids, myBid + 1), myBid * 4);
    const binCount = 40;
    const binWidth = maxVal / binCount;
    const winBins = new Array(binCount).fill(0);
    const loseBins = new Array(binCount).fill(0);
    const censoredBins = new Array(binCount).fill(0);
    const labels = [];

    for (let i = 0; i < binCount; i++) {
        labels.push((binWidth * (i + 0.5)).toFixed(2));
    }

    bids.forEach(b => {
        const idx = Math.min(Math.floor(b / binWidth), binCount - 1);
        if (idx < 0) return;
        if (b <= myBid) {
            winBins[idx]++;
        } else {
            loseBins[idx]++;
        }
    });

    const isEngineer = !godViewMode;
    if (isEngineer) {
        for (let i = 0; i < binCount; i++) {
            censoredBins[i] = loseBins[i];
        }
    }

    // My Bid vertical line
    const maxFreq = Math.max(...winBins.map((w, i) => w + loseBins[i]));
    const bidLine = labels.map(l => {
        const val = parseFloat(l);
        return (val >= myBid - binWidth / 2 && val <= myBid + binWidth / 2) ? maxFreq * 1.15 : null;
    });

    // True distribution curve
    const trueCurve = labels.map(l => {
        const x = parseFloat(l);
        return Dist.lognormalPDF(x, r.trueParams.mu, r.trueParams.sigma) * r.totalCount * binWidth;
    });

    // Naive fit curve
    const naiveCurve = labels.map(l => {
        const x = parseFloat(l);
        return Dist.lognormalPDF(x, r.naiveFit.mu, r.naiveFit.sigma) * r.totalCount * binWidth;
    });

    // Censored regression curve
    const censoredCurve = labels.map(l => {
        const x = parseFloat(l);
        return Dist.lognormalPDF(x, r.censoredFit.mu, r.censoredFit.sigma) * r.totalCount * binWidth;
    });

    distributionChart.data.labels = labels;
    distributionChart.data.datasets[0].data = winBins;
    distributionChart.data.datasets[1].data = isEngineer ? new Array(binCount).fill(0) : loseBins;
    distributionChart.data.datasets[2].data = isEngineer ? censoredBins : new Array(binCount).fill(0);
    distributionChart.data.datasets[3].data = bidLine;

    distributionChart.data.datasets[4].data = trueCurve;
    distributionChart.data.datasets[5].data = naiveCurve;
    distributionChart.data.datasets[6].data = censoredCurve;

    // Visibility per step
    distributionChart.data.datasets[1].hidden = isEngineer;
    distributionChart.data.datasets[2].hidden = !isEngineer;
    distributionChart.data.datasets[4].hidden = (currentStep < 3);
    distributionChart.data.datasets[5].hidden = (currentStep < 3);
    distributionChart.data.datasets[6].hidden = (currentStep < 4);

    // Title
    const titles = {
        1: '시장 가격 분포 — God View (전지적 시점)',
        2: isEngineer ? '시장 가격 분포 — Engineer View (실제 DSP가 보는 것)' : '시장 가격 분포 — God View (전지적 시점)',
        3: '분포 추정: Naive Fit vs 실제',
        4: '분포 추정: Naive vs Censored Regression vs 실제',
        5: '분포 추정 최종 비교: Naive vs Censored Regression vs 실제'
    };
    distributionChart.options.plugins.title.text = titles[currentStep] || titles[1];

    distributionChart.update();
}

// ==========================================
// Auction Table
// ==========================================

function updateAuctionTable() {
    const container = document.getElementById('auction-table-body');
    if (!container || !currentResult) return;

    const auctions = currentResult.auctions.slice(0, 50); // Show first 50
    const isEngineer = !godViewMode;

    let html = '';
    auctions.forEach(a => {
        const resultClass = a.win ? 'win' : 'lose';
        const resultLabel = a.win ? 'Win' : 'Lose';
        let priceDisplay;

        if (a.win || !isEngineer) {
            priceDisplay = `<span style="color: ${a.win ? '#4BC0C0' : '#FF6384'}">$${a.marketPrice.toFixed(3)}</span>`;
        } else {
            priceDisplay = `<span class="censored-price" style="color: #FF6384;">??? (&gt; $${a.myBid.toFixed(2)})</span>`;
        }

        html += `<tr class="auction-row ${resultClass}" id="auction-row-${a.id}">
            <td>#${a.id}</td>
            <td>$${a.myBid.toFixed(2)}</td>
            <td class="price-cell">${priceDisplay}</td>
            <td><span class="result-badge ${resultClass}">${resultLabel}</span></td>
        </tr>`;
    });

    container.innerHTML = html;
}

// ==========================================
// Reveal One Censored Auction
// ==========================================

function revealOneCensored() {
    if (!currentResult) return;
    const losses = currentResult.auctions.filter(a => !a.win && !a.revealed && a.id <= 50);
    if (losses.length === 0) return;

    const auction = losses[Math.floor(Math.random() * losses.length)];
    auction.revealed = true;

    const row = document.getElementById('auction-row-' + auction.id);
    if (row) {
        row.classList.add('revealing');
        const priceCell = row.querySelector('.price-cell');
        priceCell.innerHTML = `<span style="color: #FFD700; font-weight: 700;">$${auction.marketPrice.toFixed(3)}</span>`;

        // Show tooltip
        const tooltip = document.getElementById('reveal-tooltip');
        if (tooltip) {
            tooltip.textContent = `경매 #${auction.id}의 시장가는 $${auction.marketPrice.toFixed(3)} — 실전에서는 영원히 알 수 없습니다`;
            tooltip.style.display = 'block';
        }

        setTimeout(() => {
            row.classList.remove('revealing');
            priceCell.innerHTML = `<span class="censored-price" style="color: #FF6384;">??? (&gt; $${auction.myBid.toFixed(2)})</span>`;
            auction.revealed = false;
            if (tooltip) tooltip.style.display = 'none';
        }, 3000);
    }
}

// ==========================================
// Stats Cards
// ==========================================

function updateStatsCards() {
    if (!currentResult) return;
    const r = currentResult;

    const el = (id) => document.getElementById(id);

    // Step 1 stats
    const s1Total = el('stat-total');
    const s1Mean = el('stat-true-mean');
    const s1Median = el('stat-true-median');
    if (s1Total) s1Total.textContent = r.totalCount;
    if (s1Mean) s1Mean.textContent = '$' + r.trueMean.toFixed(3);
    if (s1Median) s1Median.textContent = '$' + r.trueMedian.toFixed(3);

    // Step 2 stats
    const s2Observed = el('stat-observed');
    const s2Hidden = el('stat-hidden');
    const s2ObsPct = el('stat-obs-pct');
    if (s2Observed) s2Observed.textContent = r.winCount;
    if (s2Hidden) s2Hidden.textContent = r.lossCount;
    if (s2ObsPct) s2ObsPct.textContent = (r.winRate * 100).toFixed(1) + '%';

    // Censored bar
    const obsBar = el('censored-obs-bar');
    const hidBar = el('censored-hid-bar');
    const obsLabel = el('censored-obs-label');
    const hidLabel = el('censored-hid-label');
    if (obsBar) obsBar.style.width = (r.winRate * 100) + '%';
    if (hidBar) hidBar.style.width = ((1 - r.winRate) * 100) + '%';
    if (obsLabel) obsLabel.textContent = (r.winRate * 100).toFixed(1) + '% 관측';
    if (hidLabel) hidLabel.textContent = ((1 - r.winRate) * 100).toFixed(1) + '% ???';

    // Step 2 insight dynamic text
    const insightText = el('step2-insight-text');
    if (insightText) {
        insightText.innerHTML = `데이터의 <strong>${((1 - r.winRate) * 100).toFixed(1)}%</strong>가 사라졌습니다.
            ${r.lossCount}건의 경매 뒤에 실제 시장 가격이 있지만, 당신은 절대 볼 수 없습니다.`;
    }

    // Step 3 comparison
    updateStep3Stats();

    // Step 4 comparison
    updateStep4Stats();
}

function updateStep3Stats() {
    if (!currentResult) return;
    const r = currentResult;
    const el = (id) => document.getElementById(id);

    const naiveMean = Dist.lognormalMean(r.naiveFit.mu, r.naiveFit.sigma);
    const naiveMedian = Dist.lognormalMedian(r.naiveFit.mu);
    const trueMean = r.trueMean;
    const trueMedian = r.trueMedian;

    const meanErr = ((naiveMean - trueMean) / trueMean * 100);
    const medianErr = ((naiveMedian - trueMedian) / trueMedian * 100);

    const s3nm = el('stat-naive-mean');
    const s3tm = el('stat-true-mean-3');
    const s3me = el('stat-mean-error');
    const s3nmed = el('stat-naive-median');
    const s3tmed = el('stat-true-median-3');
    const s3mede = el('stat-median-error');

    if (s3nm) s3nm.textContent = '$' + naiveMean.toFixed(3);
    if (s3tm) s3tm.textContent = '$' + trueMean.toFixed(3);
    if (s3me) { s3me.textContent = meanErr.toFixed(1) + '%'; s3me.style.color = '#FF6384'; }
    if (s3nmed) s3nmed.textContent = '$' + naiveMedian.toFixed(3);
    if (s3tmed) s3tmed.textContent = '$' + trueMedian.toFixed(3);
    if (s3mede) { s3mede.textContent = medianErr.toFixed(1) + '%'; s3mede.style.color = '#FF6384'; }

    // Dynamic insight
    const insight = el('step3-insight-text');
    if (insight) {
        insight.innerHTML = `Naive 추정은 시장 평균을 <strong style="color:#FF6384;">${Math.abs(meanErr).toFixed(1)}%</strong> 과소추정합니다.
            이것이 <strong>Selection Bias</strong>입니다 — 관측된 데이터는 모두 "내가 이긴 경매"이므로, 경쟁자 가격이 낮은 쪽에 편향됩니다.`;
    }
}

function updateStep4Stats() {
    if (!currentResult) return;
    const r = currentResult;
    const el = (id) => document.getElementById(id);

    const naiveMean = Dist.lognormalMean(r.naiveFit.mu, r.naiveFit.sigma);
    const naiveMedian = Dist.lognormalMedian(r.naiveFit.mu);
    const censoredMean = Dist.lognormalMean(r.censoredFit.mu, r.censoredFit.sigma);
    const censoredMedian = Dist.lognormalMedian(r.censoredFit.mu);
    const trueMean = r.trueMean;
    const trueMedian = r.trueMedian;

    const naiveMeanErr = ((naiveMean - trueMean) / trueMean * 100);
    const censoredMeanErr = ((censoredMean - trueMean) / trueMean * 100);
    const naiveMedianErr = ((naiveMedian - trueMedian) / trueMedian * 100);
    const censoredMedianErr = ((censoredMedian - trueMedian) / trueMedian * 100);

    const s4 = (id, val) => { const e = el(id); if (e) e.textContent = val; };
    const s4c = (id, val, color) => { const e = el(id); if (e) { e.textContent = val; e.style.color = color; } };

    s4('stat4-true-mean', '$' + trueMean.toFixed(3));
    s4('stat4-naive-mean', '$' + naiveMean.toFixed(3));
    s4c('stat4-naive-mean-err', naiveMeanErr.toFixed(1) + '%', '#FF6384');
    s4('stat4-censored-mean', '$' + censoredMean.toFixed(3));
    s4c('stat4-censored-mean-err', censoredMeanErr.toFixed(1) + '%',
        Math.abs(censoredMeanErr) < Math.abs(naiveMeanErr) ? '#4BC0C0' : '#FF6384');

    s4('stat4-true-median', '$' + trueMedian.toFixed(3));
    s4('stat4-naive-median', '$' + naiveMedian.toFixed(3));
    s4c('stat4-naive-median-err', naiveMedianErr.toFixed(1) + '%', '#FF6384');
    s4('stat4-censored-median', '$' + censoredMedian.toFixed(3));
    s4c('stat4-censored-median-err', censoredMedianErr.toFixed(1) + '%',
        Math.abs(censoredMedianErr) < Math.abs(naiveMedianErr) ? '#4BC0C0' : '#FF6384');

    // Dynamic insight
    const insight = el('step4-insight-text');
    if (insight) {
        const improvement = Math.abs(naiveMeanErr) - Math.abs(censoredMeanErr);
        insight.innerHTML = `Censored Regression은 평균 추정 오차를
            <strong style="color:#FF6384;">${Math.abs(naiveMeanErr).toFixed(1)}%</strong>에서
            <strong style="color:#4BC0C0;">${Math.abs(censoredMeanErr).toFixed(1)}%</strong>로 줄였습니다.
            Lose 데이터의 "하한(lower bound) 정보"를 활용하여 잃어버린 정보의 대부분을 복구합니다.`;
    }
}

// ==========================================
// Comparison Chart (Steps 3-4)
// ==========================================

function createComparisonChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mean ($)', 'Median ($)'],
            datasets: [
                {
                    label: '실제 (God View)',
                    data: [0, 0],
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Naive 추정',
                    data: [0, 0],
                    backgroundColor: 'rgba(255, 107, 157, 0.7)',
                    borderColor: 'rgba(255, 107, 157, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Censored Regression',
                    data: [0, 0],
                    backgroundColor: 'rgba(255, 215, 0, 0.7)',
                    borderColor: 'rgba(255, 215, 0, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                    hidden: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: '($)' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                x: { grid: { color: 'rgba(255,255,255,0.05)' } }
            },
            plugins: {
                title: {
                    display: true,
                    text: '분포 파라미터 비교: 실제 vs 추정',
                    font: { size: 14, weight: '600' },
                    color: 'rgba(255,255,255,0.9)'
                }
            },
            animation: { duration: 300 }
        }
    });
}

function updateComparisonChart() {
    if (!comparisonChart || !currentResult) return;
    const r = currentResult;

    const trueMean = r.trueMean;
    const trueMedian = r.trueMedian;
    const naiveMean = Dist.lognormalMean(r.naiveFit.mu, r.naiveFit.sigma);
    const naiveMedian = Dist.lognormalMedian(r.naiveFit.mu);
    const censoredMean = Dist.lognormalMean(r.censoredFit.mu, r.censoredFit.sigma);
    const censoredMedian = Dist.lognormalMedian(r.censoredFit.mu);

    comparisonChart.data.datasets[0].data = [trueMean, trueMedian];
    comparisonChart.data.datasets[1].data = [naiveMean, naiveMedian];
    comparisonChart.data.datasets[2].data = [censoredMean, censoredMedian];
    comparisonChart.data.datasets[2].hidden = currentStep < 4;

    comparisonChart.options.plugins.title.text = currentStep >= 4
        ? '분포 파라미터 비교: 실제 vs Naive vs Censored'
        : '분포 파라미터 비교: 실제 vs Naive';

    comparisonChart.update();
}

// ==========================================
// Impact Chart (Step 5)
// ==========================================

function createImpactChart() {
    const ctx = document.getElementById('impactChart').getContext('2d');
    impactChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Optimal Bid ($)', 'Expected Surplus ($)', 'Win Rate (%)'],
            datasets: [
                {
                    label: 'Oracle (God View)',
                    data: [0, 0, 0],
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Naive 추정 기반',
                    data: [0, 0, 0],
                    backgroundColor: 'rgba(255, 107, 157, 0.7)',
                    borderColor: 'rgba(255, 107, 157, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Censored Regression 기반',
                    data: [0, 0, 0],
                    backgroundColor: 'rgba(255, 215, 0, 0.7)',
                    borderColor: 'rgba(255, 215, 0, 1)',
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
                y: { grid: { color: 'rgba(255,255,255,0.05)' } }
            },
            plugins: {
                title: {
                    display: true,
                    text: '추정 오차가 입찰 전략에 미치는 영향',
                    font: { size: 14, weight: '600' },
                    color: 'rgba(255,255,255,0.9)'
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ctx.dataset.label + ': ' + ctx.parsed.x.toFixed(4)
                    }
                }
            },
            animation: { duration: 300 }
        }
    });
}

function updateImpactChart() {
    if (!impactChart || !currentResult) return;
    const r = currentResult;

    // Use a fixed true value for surplus computation
    const trueValue = r.myBid * 1.5; // Assume true value is 1.5x my bid

    // Oracle: uses true params
    const oracle = simulator.findOptimalBid(trueValue, r.trueParams.mu, r.trueParams.sigma);
    const oracleWinRate = Dist.lognormalCDF(oracle.bid, r.trueParams.mu, r.trueParams.sigma) * 100;

    // Naive: uses naive fit params, but evaluate surplus against true distribution
    const naiveOpt = simulator.findOptimalBid(trueValue, r.naiveFit.mu, r.naiveFit.sigma);
    const naiveActualWinRate = Dist.lognormalCDF(naiveOpt.bid, r.trueParams.mu, r.trueParams.sigma) * 100;
    const naiveActualSurplus = (trueValue - naiveOpt.bid) * Dist.lognormalCDF(naiveOpt.bid, r.trueParams.mu, r.trueParams.sigma);

    // Censored: uses censored fit params, evaluate against true
    const censoredOpt = simulator.findOptimalBid(trueValue, r.censoredFit.mu, r.censoredFit.sigma);
    const censoredActualWinRate = Dist.lognormalCDF(censoredOpt.bid, r.trueParams.mu, r.trueParams.sigma) * 100;
    const censoredActualSurplus = (trueValue - censoredOpt.bid) * Dist.lognormalCDF(censoredOpt.bid, r.trueParams.mu, r.trueParams.sigma);

    impactChart.data.datasets[0].data = [oracle.bid, oracle.surplus, oracleWinRate];
    impactChart.data.datasets[1].data = [naiveOpt.bid, naiveActualSurplus, naiveActualWinRate];
    impactChart.data.datasets[2].data = [censoredOpt.bid, censoredActualSurplus, censoredActualWinRate];

    impactChart.update();

    // Update impact stats
    const el = (id) => document.getElementById(id);
    const surplusLossNaive = ((naiveActualSurplus - oracle.surplus) / oracle.surplus * 100);
    const surplusLossCensored = ((censoredActualSurplus - oracle.surplus) / oracle.surplus * 100);

    const s5 = el('stat5-surplus-loss-naive');
    const s5c = el('stat5-surplus-loss-censored');
    if (s5) { s5.textContent = surplusLossNaive.toFixed(1) + '%'; s5.style.color = '#FF6384'; }
    if (s5c) {
        s5c.textContent = surplusLossCensored.toFixed(1) + '%';
        s5c.style.color = Math.abs(surplusLossCensored) < Math.abs(surplusLossNaive) ? '#4BC0C0' : '#FF6384';
    }

    const insight = el('step5-insight-text');
    if (insight) {
        insight.innerHTML = `Naive 추정 기반 입찰은 Oracle 대비 Surplus를
            <strong style="color:#FF6384;">${Math.abs(surplusLossNaive).toFixed(1)}%</strong> 손실합니다.
            Censored Regression을 사용하면 손실이
            <strong style="color:#4BC0C0;">${Math.abs(surplusLossCensored).toFixed(1)}%</strong>로 줄어듭니다.
            Lose 데이터를 버리지 않는 것만으로도 대부분의 정보를 복구할 수 있습니다.`;
    }
}

// ==========================================
// Charts Update per Step
// ==========================================

function updateChartsForStep() {
    if (!currentResult) return;
    updateDistributionChart();
    updateStatsCards();
    if (currentStep >= 3) updateComparisonChart();
    if (currentStep === 5) updateImpactChart();
}

// ==========================================
// 초기화
// ==========================================

function initDemo() {
    createDistributionChart();
    createComparisonChart();
    createImpactChart();

    // Slider events
    ['slider-my-bid', 'slider-mu', 'slider-sigma', 'slider-n'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateSliderLabels);
    });

    // Run button
    document.getElementById('btn-run').addEventListener('click', () => {
        runSimulation();
    });

    // View toggle
    document.getElementById('btn-god-view').addEventListener('click', () => {
        if (currentStep >= 2) setViewMode(true);
    });
    document.getElementById('btn-engineer-view').addEventListener('click', () => {
        if (currentStep >= 2) setViewMode(false);
    });

    // Reveal button
    document.getElementById('btn-reveal').addEventListener('click', revealOneCensored);

    // Next step buttons
    for (let i = 1; i <= 4; i++) {
        const btn = document.getElementById('btn-next-' + i);
        if (btn) btn.addEventListener('click', advanceStep);
    }

    // Step dots clickable
    for (let i = 1; i <= 5; i++) {
        const dot = document.getElementById('step-dot-' + i);
        if (dot) dot.addEventListener('click', () => goToStep(i));
    }

    updateSliderLabels();
    updateProgressBar();
    showStepContent();

    // Auto-run on load
    runSimulation();
}

document.addEventListener('DOMContentLoaded', initDemo);
