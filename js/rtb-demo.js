/**
 * RTB Auction Simulator Demo Implementation
 * Visualizes First Price vs Second Price auctions with DSP bidding strategies
 */

// ==========================================
// DSP Configuration
// ==========================================

const DSPS = [
    {
        id: 0,
        name: 'DSP A (Aggressive)',
        color: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        strategy: 'aggressive',
        basePCTR: 0.08,
        conversionValue: 25
    },
    {
        id: 1,
        name: 'DSP B (Conservative)',
        color: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        strategy: 'conservative',
        basePCTR: 0.04,
        conversionValue: 15
    },
    {
        id: 2,
        name: 'DSP C (Smart)',
        color: 'rgba(255, 206, 86, 0.8)',
        borderColor: 'rgba(255, 206, 86, 1)',
        strategy: 'smart',
        basePCTR: 0.06,
        conversionValue: 20
    },
    {
        id: 3,
        name: 'DSP D (Random)',
        color: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        strategy: 'random',
        basePCTR: 0.03,
        conversionValue: 10
    }
];

// ==========================================
// State
// ==========================================

let auctionType = 'first'; // 'first' or 'second'
let floorPrice = 1.5;
let chart = null;
let roundNumber = 0;
let autoRunInterval = null;
let autoRunCount = 0;

// Per-DSP statistics
let stats = {};

function initStats() {
    stats = {};
    DSPS.forEach(dsp => {
        stats[dsp.id] = {
            wins: 0,
            totalSpend: 0,
            auctionsParticipated: 0
        };
    });
}

// ==========================================
// Bid Generation
// ==========================================

function generateBid(dsp, currentAuctionType, currentFloorPrice) {
    const base = dsp.basePCTR * dsp.conversionValue;
    let bid = 0;

    switch (dsp.strategy) {
        case 'aggressive':
            bid = base * (0.9 + Math.random() * 0.1);
            break;
        case 'conservative':
            bid = base * (0.6 + Math.random() * 0.15);
            break;
        case 'smart':
            if (currentAuctionType === 'first') {
                // Bid shading in first price auctions
                bid = base * (0.5 + Math.random() * 0.15);
            } else {
                // Truthful bidding in second price auctions
                bid = base * (0.85 + Math.random() * 0.1);
            }
            break;
        case 'random':
            bid = base * (0.3 + Math.random() * 0.8);
            break;
    }

    return Math.round(bid * 100) / 100;
}

// ==========================================
// Auction Logic
// ==========================================

function runAuction() {
    roundNumber++;

    // 1. All DSPs generate bids
    const bids = DSPS.map(dsp => ({
        dsp: dsp,
        bid: generateBid(dsp, auctionType, floorPrice)
    }));

    // 2. Filter bids below floor price
    const validBids = bids.filter(b => b.bid >= floorPrice);
    const invalidBids = bids.filter(b => b.bid < floorPrice);

    // Track participation
    validBids.forEach(b => {
        stats[b.dsp.id].auctionsParticipated++;
    });

    let winner = null;
    let clearingPrice = 0;

    if (validBids.length > 0) {
        // 3. Sort descending by bid
        validBids.sort((a, b) => b.bid - a.bid);

        winner = validBids[0];

        if (auctionType === 'first') {
            // First Price: winner pays own bid
            clearingPrice = winner.bid;
        } else {
            // Second Price: winner pays 2nd highest bid + 0.01 (or floor if only 1 bidder)
            if (validBids.length > 1) {
                clearingPrice = Math.round((validBids[1].bid + 0.01) * 100) / 100;
            } else {
                clearingPrice = floorPrice;
            }
        }

        // Update winner stats
        stats[winner.dsp.id].wins++;
        stats[winner.dsp.id].totalSpend += clearingPrice;
    }

    // Update chart with this round's bids
    updateChart(bids, winner);

    // Update stats table
    renderStats();

    // Log the result
    logAuctionResult(bids, validBids, invalidBids, winner, clearingPrice);
}

// ==========================================
// Chart Management
// ==========================================

function initChart() {
    const ctx = document.getElementById('auctionChart').getContext('2d');

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: DSPS.map(d => d.name.split(' (')[0]),
            datasets: [
                ...DSPS.map(dsp => ({
                    label: dsp.name,
                    data: [0, 0, 0, 0],
                    backgroundColor: dsp.color,
                    borderColor: dsp.borderColor,
                    borderWidth: 1,
                    borderRadius: 4
                })),
                {
                    label: 'Floor Price',
                    data: new Array(4).fill(floorPrice),
                    type: 'line',
                    borderColor: 'rgba(255, 71, 87, 0.8)',
                    borderDash: [6, 4],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    order: -1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Bid Amount ($)',
                        color: 'rgba(255, 255, 255, 0.7)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: function (value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'DSP Bid Amounts (Round 0)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    font: { size: 14, weight: '600' }
                },
                legend: {
                    display: true,
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                        filter: function (item) {
                            // Show all datasets in legend
                            return true;
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            if (context.dataset.label === 'Floor Price') {
                                return 'Floor: $' + context.parsed.y.toFixed(2);
                            }
                            return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            animation: {
                duration: 400
            }
        }
    });
}

function updateChart(bids, winner) {
    // Each DSP dataset shows its bid only at its own index, 0 elsewhere
    DSPS.forEach((dsp, i) => {
        const bidEntry = bids.find(b => b.dsp.id === dsp.id);
        const bidValue = bidEntry ? bidEntry.bid : 0;
        const data = new Array(4).fill(0);
        data[i] = bidValue;
        chart.data.datasets[i].data = data;

        // Highlight winner with thicker border
        if (winner && winner.dsp.id === dsp.id) {
            chart.data.datasets[i].borderWidth = 3;
            chart.data.datasets[i].borderColor = '#ffffff';
        } else {
            chart.data.datasets[i].borderWidth = 1;
            chart.data.datasets[i].borderColor = dsp.borderColor;
        }

        // Dim bids below floor price
        if (bidValue < floorPrice) {
            chart.data.datasets[i].backgroundColor = dsp.color.replace('0.8', '0.25');
        } else {
            chart.data.datasets[i].backgroundColor = dsp.color;
        }
    });

    // Update floor price line
    const floorDatasetIndex = DSPS.length;
    chart.data.datasets[floorDatasetIndex].data = new Array(4).fill(floorPrice);

    // Update title
    chart.options.plugins.title.text = 'DSP Bid Amounts (Round ' + roundNumber + ')';

    chart.update();
}

// ==========================================
// Stats Table
// ==========================================

function renderStats() {
    const container = document.getElementById('stats-container');
    let html = `
        <table class="stats-table">
            <thead>
                <tr>
                    <th>DSP</th>
                    <th>Wins</th>
                    <th>Avg Spend</th>
                    <th>Total Cost</th>
                </tr>
            </thead>
            <tbody>
    `;

    DSPS.forEach(dsp => {
        const s = stats[dsp.id];
        const avgSpend = s.wins > 0 ? (s.totalSpend / s.wins) : 0;

        html += `
            <tr>
                <td style="color: ${dsp.borderColor}; font-weight: 600;">${dsp.name.split(' (')[0]}</td>
                <td>${s.wins}</td>
                <td>$${avgSpend.toFixed(2)}</td>
                <td>$${s.totalSpend.toFixed(2)}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// ==========================================
// Logging
// ==========================================

function logAuctionResult(bids, validBids, invalidBids, winner, clearingPrice) {
    const log = document.getElementById('demo-log');
    const typeLabel = auctionType === 'first' ? '1st Price' : '2nd Price';

    let message = '';

    if (winner) {
        const bidSummary = bids
            .map(b => b.dsp.name.split(' ')[0] + ' ' + b.dsp.name.split(' ')[1] + ': $' + b.bid.toFixed(2))
            .join(' | ');

        message = `<strong>Round ${roundNumber}</strong> [${typeLabel}] `
            + bidSummary
            + ` -- <span class="log-winner">Winner: ${winner.dsp.name.split(' (')[0]}, Paid: $${clearingPrice.toFixed(2)}</span>`;

        if (invalidBids.length > 0) {
            const belowFloor = invalidBids.map(b => b.dsp.name.split(' ')[0] + ' ' + b.dsp.name.split(' ')[1]).join(', ');
            message += ` (below floor: ${belowFloor})`;
        }
    } else {
        message = `<strong>Round ${roundNumber}</strong> [${typeLabel}] `
            + `<span class="log-no-winner">No winner -- all bids below floor price ($${floorPrice.toFixed(2)})</span>`;
    }

    const entry = document.createElement('div');
    entry.innerHTML = `<span class="time">${new Date().toLocaleTimeString()}</span> ${message}`;
    log.insertBefore(entry, log.firstChild);
}

function logAction(message) {
    const log = document.getElementById('demo-log');
    const entry = document.createElement('div');
    entry.innerHTML = `<span class="time">${new Date().toLocaleTimeString()}</span> ${message}`;
    log.insertBefore(entry, log.firstChild);
}

// ==========================================
// Controls
// ==========================================

function setAuctionType(type) {
    auctionType = type;

    const btnFirst = document.getElementById('btn-first-price');
    const btnSecond = document.getElementById('btn-second-price');

    if (type === 'first') {
        btnFirst.classList.add('active');
        btnSecond.classList.remove('active');
    } else {
        btnFirst.classList.remove('active');
        btnSecond.classList.add('active');
    }

    logAction(`Auction type changed to <strong>${type === 'first' ? 'First Price' : 'Second Price'}</strong>.`);
}

function updateFloorPrice(value) {
    floorPrice = parseFloat(value);
    document.getElementById('floor-value').textContent = '$' + floorPrice.toFixed(2);

    // Update floor line on chart if it exists
    if (chart) {
        const floorDatasetIndex = DSPS.length;
        chart.data.datasets[floorDatasetIndex].data = new Array(4).fill(floorPrice);
        chart.update();
    }
}

function autoRun() {
    if (autoRunInterval) return;

    autoRunCount = 0;
    const totalRounds = 10;

    // Disable buttons during auto run
    setButtonsDisabled(true);

    logAction(`Auto Run started (${totalRounds} rounds)...`);

    autoRunInterval = setInterval(() => {
        autoRunCount++;
        runAuction();

        if (autoRunCount >= totalRounds) {
            clearInterval(autoRunInterval);
            autoRunInterval = null;
            setButtonsDisabled(false);
            logAction(`Auto Run completed (${totalRounds} rounds).`);
        }
    }, 600);
}

function setButtonsDisabled(disabled) {
    document.getElementById('btn-run').disabled = disabled;
    document.getElementById('btn-auto').disabled = disabled;
}

function resetDemo() {
    // Stop auto run if active
    if (autoRunInterval) {
        clearInterval(autoRunInterval);
        autoRunInterval = null;
        setButtonsDisabled(false);
    }

    roundNumber = 0;
    initStats();

    // Reset chart data
    DSPS.forEach((dsp, i) => {
        chart.data.datasets[i].data = new Array(4).fill(0);
        chart.data.datasets[i].borderWidth = 1;
        chart.data.datasets[i].borderColor = dsp.borderColor;
        chart.data.datasets[i].backgroundColor = dsp.color;
    });
    chart.options.plugins.title.text = 'DSP Bid Amounts (Round 0)';
    chart.update();

    // Reset stats
    renderStats();

    // Clear log
    const log = document.getElementById('demo-log');
    log.innerHTML = '';

    logAction('Simulator reset to initial state.');
}

// ==========================================
// Initialization
// ==========================================

function initDemo() {
    initStats();
    initChart();
    renderStats();
    logAction('RTB Auction Simulator initialized. Select auction type and run an auction.');
}

document.addEventListener('DOMContentLoaded', initDemo);
