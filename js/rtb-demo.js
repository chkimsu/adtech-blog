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

// Last auction result for chart plugin
let lastAuctionResult = { winnerIndex: -1, winnerBid: 0, clearingPrice: 0, auctionType: 'first' };

// Comparison snapshots (max 2)
let comparisonSnapshots = [];

// Per-DSP statistics
let stats = {};

function initStats() {
    stats = {};
    DSPS.forEach(dsp => {
        stats[dsp.id] = {
            wins: 0,
            totalSpend: 0,
            totalBidWhenWon: 0,
            totalValueWhenWon: 0,
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
        stats[winner.dsp.id].totalBidWhenWon += winner.bid;
        stats[winner.dsp.id].totalValueWhenWon += winner.dsp.basePCTR * winner.dsp.conversionValue;

        // Store for chart plugin
        lastAuctionResult = {
            winnerIndex: DSPS.findIndex(d => d.id === winner.dsp.id),
            winnerBid: winner.bid,
            clearingPrice: clearingPrice,
            auctionType: auctionType
        };
    } else {
        lastAuctionResult = { winnerIndex: -1, winnerBid: 0, clearingPrice: 0, auctionType: auctionType };
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

const clearingPricePlugin = {
    id: 'clearingPriceLine',
    afterDraw(chart) {
        if (lastAuctionResult.winnerIndex === -1) return;

        const { ctx, scales: { y }, chartArea } = chart;
        const cp = lastAuctionResult.clearingPrice;
        const yPixel = y.getPixelForValue(cp);

        ctx.save();

        // Draw clearing price horizontal line
        ctx.beginPath();
        ctx.strokeStyle = '#4bc0c0';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.moveTo(chartArea.left, yPixel);
        ctx.lineTo(chartArea.right, yPixel);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.fillStyle = '#4bc0c0';
        ctx.font = 'bold 11px "Fira Code", monospace';
        ctx.textAlign = 'right';
        ctx.fillText('Paid: $' + cp.toFixed(2), chartArea.right - 4, yPixel - 6);

        // Savings band on winner bar in 2nd price
        if (lastAuctionResult.auctionType === 'second' && lastAuctionResult.winnerBid > cp) {
            const winIdx = lastAuctionResult.winnerIndex;
            const meta = chart.getDatasetMeta(winIdx);
            const bar = meta.data[winIdx];

            if (bar) {
                const bidY = y.getPixelForValue(lastAuctionResult.winnerBid);
                const barX = bar.x - bar.width / 2;
                const barW = bar.width;

                // Semi-transparent savings overlay
                ctx.fillStyle = 'rgba(0, 229, 255, 0.18)';
                ctx.fillRect(barX, bidY, barW, yPixel - bidY);

                // Diagonal stripes pattern
                ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
                ctx.lineWidth = 1;
                const step = 6;
                ctx.beginPath();
                for (let sy = bidY; sy < yPixel; sy += step) {
                    ctx.moveTo(barX, sy);
                    ctx.lineTo(barX + barW, sy + step);
                }
                ctx.stroke();

                // Savings label
                const savings = (lastAuctionResult.winnerBid - cp).toFixed(2);
                ctx.fillStyle = '#00e5ff';
                ctx.font = 'bold 10px "Fira Code", monospace';
                ctx.textAlign = 'center';
                const midY = (bidY + yPixel) / 2;
                if (yPixel - bidY > 18) {
                    ctx.fillText('-$' + savings, bar.x, midY + 4);
                }
            }
        }

        ctx.restore();
    }
};

function initChart() {
    const ctx = document.getElementById('auctionChart').getContext('2d');

    chart = new Chart(ctx, {
        type: 'bar',
        plugins: [clearingPricePlugin],
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

    // Update DSP C label based on auction type
    chart.data.labels[2] = auctionType === 'first' ? 'DSP C (Shading)' : 'DSP C (Truthful)';

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
                    <th title="Avg (Bid - Paid) per win. Always $0 in 1st Price.">Avg Savings</th>
                    <th title="Cumulative (Value - Paid). Higher = more profit.">Surplus</th>
                </tr>
            </thead>
            <tbody>
    `;

    DSPS.forEach(dsp => {
        const s = stats[dsp.id];
        const avgSpend = s.wins > 0 ? (s.totalSpend / s.wins) : 0;
        const avgSavings = s.wins > 0 ? ((s.totalBidWhenWon - s.totalSpend) / s.wins) : 0;
        const surplus = s.totalValueWhenWon - s.totalSpend;
        const savingsColor = avgSavings > 0.005 ? '#4bc0c0' : 'inherit';

        html += `
            <tr>
                <td style="color: ${dsp.borderColor}; font-weight: 600;">${dsp.name.split(' (')[0]}</td>
                <td>${s.wins}</td>
                <td>$${avgSpend.toFixed(2)}</td>
                <td style="color: ${savingsColor}; font-weight: ${avgSavings > 0.005 ? '600' : '400'};">$${avgSavings.toFixed(2)}</td>
                <td>$${surplus.toFixed(2)}</td>
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

        const winnerName = winner.dsp.name.split(' (')[0];
        const winnerBid = winner.bid;
        const savings = Math.round((winnerBid - clearingPrice) * 100) / 100;

        let winnerMsg;
        if (auctionType === 'first') {
            winnerMsg = `<span class="log-winner">Winner: ${winnerName}, Bid $${winnerBid.toFixed(2)} = Paid $${clearingPrice.toFixed(2)}</span>`;
        } else {
            winnerMsg = `<span class="log-winner">Winner: ${winnerName}, Bid $${winnerBid.toFixed(2)} &rarr; Paid $${clearingPrice.toFixed(2)}</span>`
                + ` <span class="log-savings">(Saved $${savings.toFixed(2)})</span>`;
        }

        message = `<strong>Round ${roundNumber}</strong> [${typeLabel}] `
            + bidSummary
            + ` -- ` + winnerMsg;

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

    // Update DSP C strategy badge
    const modeEl = document.getElementById('strategy-mode');
    if (modeEl) {
        if (type === 'first') {
            modeEl.textContent = 'Bid Shading (50-65%)';
            modeEl.className = 'strategy-mode shading';
        } else {
            modeEl.textContent = 'Truthful Bidding (85-95%)';
            modeEl.className = 'strategy-mode truthful';
        }
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

    // Snapshot before clearing if there were rounds
    if (roundNumber > 0) {
        comparisonSnapshots.push({
            type: auctionType === 'first' ? '1st Price' : '2nd Price',
            rounds: roundNumber,
            stats: JSON.parse(JSON.stringify(stats)),
            timestamp: new Date().toLocaleTimeString()
        });
        if (comparisonSnapshots.length > 2) {
            comparisonSnapshots.shift();
        }
        renderComparison();
    }

    roundNumber = 0;
    lastAuctionResult = { winnerIndex: -1, winnerBid: 0, clearingPrice: 0, auctionType: auctionType };
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
// Comparison Panel
// ==========================================

function renderComparison() {
    const panel = document.getElementById('comparison-panel');
    const content = document.getElementById('comparison-content');
    if (!panel || !content) return;

    if (comparisonSnapshots.length === 0) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';

    if (comparisonSnapshots.length === 1) {
        const snap = comparisonSnapshots[0];
        let html = `<p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            <strong>${snap.type}</strong> ${snap.rounds} rounds saved. Run the other auction type and Reset to compare.
        </p>`;
        html += buildSnapshotTable(snap);
        content.innerHTML = html;
        return;
    }

    // Two snapshots: side-by-side comparison
    const s1 = comparisonSnapshots[0];
    const s2 = comparisonSnapshots[1];

    let html = `<table class="stats-table comparison-table">
        <thead><tr>
            <th>Metric</th>
            <th>${s1.type} (${s1.rounds} rds)</th>
            <th>${s2.type} (${s2.rounds} rds)</th>
            <th>Delta</th>
        </tr></thead><tbody>`;

    DSPS.forEach(dsp => {
        const st1 = s1.stats[dsp.id];
        const st2 = s2.stats[dsp.id];
        const avg1 = st1.wins > 0 ? st1.totalSpend / st1.wins : 0;
        const avg2 = st2.wins > 0 ? st2.totalSpend / st2.wins : 0;
        const sav1 = st1.wins > 0 ? (st1.totalBidWhenWon - st1.totalSpend) / st1.wins : 0;
        const sav2 = st2.wins > 0 ? (st2.totalBidWhenWon - st2.totalSpend) / st2.wins : 0;

        const winDelta = st2.wins - st1.wins;
        const spendDelta = avg2 - avg1;
        const savDelta = sav2 - sav1;

        html += `<tr><td colspan="4" style="color: ${dsp.borderColor}; font-weight: 600; font-size: 0.8rem; padding-top: 0.6rem;">${dsp.name}</td></tr>`;
        html += deltaRow('Wins', st1.wins, st2.wins, winDelta, '', false);
        html += deltaRow('Avg Spend', avg1, avg2, spendDelta, '$', true);
        html += deltaRow('Avg Savings', sav1, sav2, savDelta, '$', false);
    });

    // Publisher Revenue
    let rev1 = 0, rev2 = 0;
    DSPS.forEach(dsp => { rev1 += s1.stats[dsp.id].totalSpend; rev2 += s2.stats[dsp.id].totalSpend; });
    html += `<tr><td colspan="4" style="font-weight: 600; font-size: 0.8rem; padding-top: 0.6rem; color: var(--accent-primary);">Publisher</td></tr>`;
    html += deltaRow('Total Revenue', rev1, rev2, rev2 - rev1, '$', true);

    html += '</tbody></table>';
    content.innerHTML = html;
}

function deltaRow(label, v1, v2, delta, prefix, lowerIsBetter) {
    const fmt = (v) => prefix + (typeof v === 'number' ? v.toFixed(2) : v);
    const sign = delta > 0.005 ? '+' : (delta < -0.005 ? '' : '');
    const color = Math.abs(delta) < 0.005 ? 'var(--text-muted)' :
        (lowerIsBetter ? (delta < 0 ? '#4bc0c0' : '#ff6384') : (delta > 0 ? '#4bc0c0' : '#ff6384'));
    return `<tr>
        <td style="padding-left: 1rem; font-size: 0.8rem;">${label}</td>
        <td>${fmt(v1)}</td>
        <td>${fmt(v2)}</td>
        <td style="color: ${color}; font-weight: 600;">${sign}${fmt(delta)}</td>
    </tr>`;
}

function buildSnapshotTable(snap) {
    let html = `<table class="stats-table"><thead><tr><th>DSP</th><th>Wins</th><th>Avg Spend</th><th>Avg Savings</th></tr></thead><tbody>`;
    DSPS.forEach(dsp => {
        const s = snap.stats[dsp.id];
        const avg = s.wins > 0 ? s.totalSpend / s.wins : 0;
        const sav = s.wins > 0 ? (s.totalBidWhenWon - s.totalSpend) / s.wins : 0;
        html += `<tr>
            <td style="color: ${dsp.borderColor}; font-weight: 600;">${dsp.name.split(' (')[0]}</td>
            <td>${s.wins}</td><td>$${avg.toFixed(2)}</td><td>$${sav.toFixed(2)}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    return html;
}

function clearComparison() {
    comparisonSnapshots = [];
    const panel = document.getElementById('comparison-panel');
    if (panel) panel.style.display = 'none';
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
