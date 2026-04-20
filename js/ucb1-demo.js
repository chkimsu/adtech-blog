/**
 * UCB1 Algorithm Demo Implementation
 * Visualizes Upper Confidence Bound arm selection
 */

// ==========================================
// Configuration
// ==========================================

const ARMS = [
    { name: "Ad A (High CTR)", trueCTR: 0.08, color: 'rgba(255, 99, 132, 0.8)' },
    { name: "Ad B (Medium)", trueCTR: 0.05, color: 'rgba(54, 162, 235, 0.8)' },
    { name: "Ad C (Low CTR)", trueCTR: 0.02, color: 'rgba(255, 206, 86, 0.8)' },
    { name: "Ad D (Hidden Gem)", trueCTR: 0.07, color: 'rgba(75, 192, 192, 0.8)' },
    { name: "Ad E (Unknown)", trueCTR: 0.06, color: 'rgba(153, 102, 255, 0.8)' }
];

// ==========================================
// UCB1 Algorithm
// ==========================================

class UCB1 {
    constructor(nArms, c = 2) {
        this.nArms = nArms;
        this.c = c; // Exploration constant — user-tunable via slider
        this.pulls = new Array(nArms).fill(0);
        this.successes = new Array(nArms).fill(0);
        this.totalPulls = 0;
    }

    getMeanReward(i) {
        return this.pulls[i] === 0 ? 0 : this.successes[i] / this.pulls[i];
    }

    getBonus(i) {
        if (this.pulls[i] === 0 || this.totalPulls === 0) return Infinity;
        return Math.sqrt(this.c * Math.log(this.totalPulls) / this.pulls[i]);
    }

    getScore(i) {
        return this.getMeanReward(i) + this.getBonus(i);
    }

    selectArm() {
        let best = -1;
        let bestScore = -Infinity;
        for (let i = 0; i < this.nArms; i++) {
            const score = this.getScore(i);
            if (score > bestScore) {
                bestScore = score;
                best = i;
            }
        }
        return best;
    }

    update(armIdx, reward) {
        this.pulls[armIdx]++;
        this.totalPulls++;
        if (reward === 1) this.successes[armIdx]++;
    }
}

// ==========================================
// Demo Controller
// ==========================================

let model = new UCB1(ARMS.length);
let chart;
let autoRunInterval = null;
let lastSelected = -1;

function initDemo() {
    const ctx = document.getElementById('ucb1Chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ARMS.map(a => a.name),
            datasets: [
                {
                    label: 'Mean Reward (Exploitation)',
                    data: new Array(ARMS.length).fill(0),
                    backgroundColor: ARMS.map(a => a.color),
                    stack: 'Stack 0'
                },
                {
                    label: 'UCB Bonus (Exploration)',
                    data: new Array(ARMS.length).fill(0),
                    backgroundColor: 'rgba(200, 200, 200, 0.5)',
                    stack: 'Stack 0'
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                    title: { display: true, text: 'UCB Score' },
                    max: 1.5
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'UCB1 Score Decomposition (Round 0)'
                }
            },
            animation: { duration: 300 }
        }
    });

    updateVisualization();
    renderStats();
    logAction('UCB1 Simulator initialized. Click "Select Best Arm" to start.');
}

function runOneRound() {
    const armIdx = model.selectArm();
    const reward = Math.random() < ARMS[armIdx].trueCTR ? 1 : 0;
    model.update(armIdx, reward);
    lastSelected = armIdx;

    const result = reward === 1 ? 'Click (Success)' : 'No Click (Fail)';
    logAction(`Round ${model.totalPulls}: Selected ${ARMS[armIdx].name} -> ${result}. Mean: ${(model.getMeanReward(armIdx) * 100).toFixed(1)}%`);

    updateVisualization();
    renderStats();
}

function autoRun(rounds) {
    if (autoRunInterval) return;

    const btns = document.querySelectorAll('.btn-action');
    btns.forEach(b => b.disabled = true);

    let count = 0;
    autoRunInterval = setInterval(() => {
        runOneRound();
        count++;
        if (count >= rounds) {
            clearInterval(autoRunInterval);
            autoRunInterval = null;
            btns.forEach(b => b.disabled = false);
            logAction(`Auto Run complete. ${rounds} rounds finished.`);
        }
    }, 150);
}

function resetDemo() {
    if (autoRunInterval) {
        clearInterval(autoRunInterval);
        autoRunInterval = null;
    }
    const c = getCurrentC();
    model = new UCB1(ARMS.length, c);
    lastSelected = -1;
    updateVisualization();
    renderStats();
    document.getElementById('demo-log').innerHTML = '';
    document.querySelectorAll('.btn-action').forEach(b => b.disabled = false);
    logAction(`Model reset (c = ${c.toFixed(1)}).`);
}

function getCurrentC() {
    const slider = document.getElementById('slider-c');
    return slider ? parseFloat(slider.value) : 2;
}

// Called by UCB1 demo slider — updates exploration constant on the fly
function onCChange(value) {
    const c = parseFloat(value);
    const valEl = document.getElementById('c-val');
    if (valEl) valEl.textContent = c.toFixed(1);
    if (model) {
        model.c = c;
        updateVisualization();
        renderStats();
    }
}

function updateVisualization() {
    const means = [];
    const bonuses = [];

    for (let i = 0; i < ARMS.length; i++) {
        const mean = model.getMeanReward(i);
        let bonus = model.getBonus(i);
        if (!isFinite(bonus)) bonus = 1.5; // cap for display
        means.push(mean);
        bonuses.push(bonus);
    }

    chart.data.datasets[0].data = means;
    chart.data.datasets[1].data = bonuses;
    chart.options.plugins.title.text = `UCB1 Score Decomposition (Round ${model.totalPulls})`;

    // Adjust x-axis max
    const maxVal = Math.max(...means.map((m, i) => m + bonuses[i]));
    chart.options.scales.x.max = Math.max(1.5, maxVal * 1.2);

    chart.update();
}

function renderStats() {
    const container = document.getElementById('stats-container');
    let html = `
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
            <thead>
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <th style="text-align: left; padding: 0.5rem;">Arm</th>
                    <th style="text-align: right; padding: 0.5rem;">Pulls</th>
                    <th style="text-align: right; padding: 0.5rem;">Wins</th>
                    <th style="text-align: right; padding: 0.5rem;">Mean</th>
                    <th style="text-align: right; padding: 0.5rem;">Bonus</th>
                    <th style="text-align: right; padding: 0.5rem;">Score</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 0; i < ARMS.length; i++) {
        const mean = model.getMeanReward(i);
        const bonus = model.getBonus(i);
        const score = model.getScore(i);
        const isSelected = i === lastSelected;
        const rowStyle = isSelected ? 'background: rgba(0, 229, 255, 0.1);' : '';

        html += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); ${rowStyle}">
                <td style="padding: 0.5rem; color: ${ARMS[i].color.replace('0.8', '1')}">${ARMS[i].name}${isSelected ? ' [Selected]' : ''}</td>
                <td style="text-align: right; padding: 0.5rem;">${model.pulls[i]}</td>
                <td style="text-align: right; padding: 0.5rem;">${model.successes[i]}</td>
                <td style="text-align: right; padding: 0.5rem;">${(mean * 100).toFixed(1)}%</td>
                <td style="text-align: right; padding: 0.5rem;">${isFinite(bonus) ? bonus.toFixed(3) : 'INF'}</td>
                <td style="text-align: right; padding: 0.5rem; font-weight: bold;">${isFinite(score) ? score.toFixed(3) : 'INF'}</td>
            </tr>
        `;
    }

    html += `</tbody></table>`;

    // Total pulls info
    html += `<div style="margin-top: 0.75rem; font-size: 0.85rem; color: var(--text-muted);">
        Total Rounds: ${model.totalPulls}
    </div>`;

    container.innerHTML = html;
}

function logAction(message) {
    const log = document.getElementById('demo-log');
    const entry = document.createElement('div');
    entry.innerHTML = `<span class="time">${new Date().toLocaleTimeString()}</span> ${message}`;
    log.insertBefore(entry, log.firstChild);
}

document.addEventListener('DOMContentLoaded', initDemo);
