/**
 * Bid Landscape Explorer Demo Implementation
 * Visualizes Win Rate, Expected Cost, and Expected Profit curves
 * as a function of bid price in RTB environments.
 */

// ==========================================
// Math Functions
// ==========================================

function winRate(bid, median, k) {
    return 1 / (1 + Math.exp(-k * (bid - median)));
}

function expectedCost(bid, median) {
    return median * (1 - Math.exp(-bid / median));
}

function expectedRevenue(bid, pCTR, convValue, median, k) {
    return pCTR * convValue * winRate(bid, median, k);
}

function expectedProfit(bid, pCTR, convValue, median, k) {
    const revenue = expectedRevenue(bid, pCTR, convValue, median, k);
    const cost = expectedCost(bid, median);
    return revenue - cost;
}

// ==========================================
// Data Generation
// ==========================================

function generateData(median, k, pCTR, convValue) {
    const points = [];
    for (let i = 0; i <= 100; i++) {
        const bid = i * 0.05; // 0 to 5.0, step 0.05
        points.push({
            bid: bid,
            winRate: winRate(bid, median, k) * 100, // percentage
            cost: expectedCost(bid, median),
            revenue: expectedRevenue(bid, pCTR, convValue, median, k),
            profit: expectedProfit(bid, pCTR, convValue, median, k)
        });
    }
    return points;
}

function findOptimalBid(data) {
    let maxProfit = -Infinity;
    let optimalBid = 0;
    for (let i = 0; i < data.length; i++) {
        if (data[i].profit > maxProfit) {
            maxProfit = data[i].profit;
            optimalBid = data[i].bid;
        }
    }
    return optimalBid;
}

// ==========================================
// Chart Setup
// ==========================================

let chart;
let currentData = [];

const currentBidLinePlugin = {
    id: 'currentBidLine',
    afterDraw(chart) {
        const bidSlider = document.getElementById('slider-bid');
        if (!bidSlider) return;

        const currentBid = parseFloat(bidSlider.value);
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;
        const ctx = chart.ctx;

        const xPixel = xScale.getPixelForValue(currentBid);

        if (xPixel < xScale.left || xPixel > xScale.right) return;

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.moveTo(xPixel, yScale.top);
        ctx.lineTo(xPixel, yScale.bottom);
        ctx.stroke();

        // Label
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '11px Fira Code, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('$' + currentBid.toFixed(2), xPixel, yScale.top - 6);
        ctx.restore();
    }
};

function createChart() {
    const ctx = document.getElementById('bidLandscapeChart').getContext('2d');

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Win Rate (%)',
                    data: [],
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: false,
                    yAxisID: 'y'
                },
                {
                    label: 'Expected Cost ($)',
                    data: [],
                    borderColor: '#FF6384',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: false,
                    yAxisID: 'y1'
                },
                {
                    label: 'Expected Profit ($)',
                    data: [],
                    borderColor: '#4BC0C0',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: 'origin',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    type: 'linear',
                    min: 0,
                    max: 5,
                    title: {
                        display: true,
                        text: 'Bid Price ($)'
                    }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Win Rate (%)'
                    },
                    grid: {
                        drawOnChartArea: true
                    }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Bid Landscape: Win Rate, Cost & Profit'
                }
            },
            animation: {
                duration: 200
            }
        },
        plugins: [currentBidLinePlugin]
    });
}

// ==========================================
// Update Functions
// ==========================================

function getSliderValues() {
    return {
        bid: parseFloat(document.getElementById('slider-bid').value),
        median: parseFloat(document.getElementById('slider-median').value),
        competition: parseFloat(document.getElementById('slider-competition').value),
        pCTR: parseFloat(document.getElementById('slider-pctr').value),
        convValue: parseFloat(document.getElementById('slider-convvalue').value)
    };
}

function updateChart(data) {
    // Win Rate dataset
    chart.data.datasets[0].data = data.map(function (d) {
        return { x: d.bid, y: d.winRate };
    });

    // Expected Cost dataset
    chart.data.datasets[1].data = data.map(function (d) {
        return { x: d.bid, y: d.cost };
    });

    // Expected Profit dataset
    chart.data.datasets[2].data = data.map(function (d) {
        return { x: d.bid, y: d.profit };
    });

    chart.update();
}

function updateStats(params, data) {
    var bid = params.bid;
    var median = params.median;
    var k = params.competition;
    var pCTR = params.pCTR;
    var convValue = params.convValue;

    var wr = winRate(bid, median, k) * 100;
    var cost = expectedCost(bid, median);
    var revenue = expectedRevenue(bid, pCTR, convValue, median, k);
    var profit = expectedProfit(bid, pCTR, convValue, median, k);
    var optimalBid = findOptimalBid(data);

    document.getElementById('stat-bid').textContent = '$' + bid.toFixed(2);
    document.getElementById('stat-winrate').textContent = wr.toFixed(1) + '%';
    document.getElementById('stat-cost').textContent = '$' + cost.toFixed(2);
    document.getElementById('stat-revenue').textContent = '$' + revenue.toFixed(2);

    var profitEl = document.getElementById('stat-profit');
    profitEl.textContent = '$' + profit.toFixed(2);
    if (profit >= 0) {
        profitEl.style.color = '#4BC0C0';
    } else {
        profitEl.style.color = '#FF6384';
    }

    document.getElementById('stat-optimal').textContent = '$' + optimalBid.toFixed(2);
}

function updateDisplayValues(params) {
    document.getElementById('val-bid').textContent = params.bid.toFixed(2);
    document.getElementById('val-median').textContent = params.median.toFixed(2);
    document.getElementById('val-competition').textContent = params.competition.toFixed(1);
    document.getElementById('val-pctr').textContent = params.pCTR.toFixed(2);
    document.getElementById('val-convvalue').textContent = params.convValue;
}

function refresh() {
    var params = getSliderValues();
    updateDisplayValues(params);
    currentData = generateData(params.median, params.competition, params.pCTR, params.convValue);
    updateChart(currentData);
    updateStats(params, currentData);
}

// ==========================================
// Event Listeners
// ==========================================

function setupListeners() {
    var sliderIds = [
        'slider-bid',
        'slider-median',
        'slider-competition',
        'slider-pctr',
        'slider-convvalue'
    ];

    sliderIds.forEach(function (id) {
        document.getElementById(id).addEventListener('input', refresh);
    });
}

// ==========================================
// Initialization
// ==========================================

function initDemo() {
    createChart();
    setupListeners();
    refresh();
}

document.addEventListener('DOMContentLoaded', initDemo);
