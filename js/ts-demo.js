/**
 * Thompson Sampling Demo Implementation
 * Visualizes Beta Distributions for Bernoulli Bandit
 */

// ==========================================
// Math Helpers
// ==========================================

const MathUtils = {
    // Log Gamma function (Lanczos approximation) for non-integer support if needed,
    // but for this demo we'll stick to integer alpha/beta for simplicity or use a simple approximation.
    // Actually, for visualization, we need to compute x^(a-1) * (1-x)^(b-1) / B(a,b).
    // B(a,b) can be large, so we work in log space to avoid overflow.

    logGamma: (z) => {
        const c = [
            76.18009172947146, -86.50532032941677, 24.01409824083091,
            -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
        ];
        let x = z;
        let y = z;
        let tmp = x + 5.5;
        tmp -= (x + 0.5) * Math.log(tmp);
        let ser = 1.000000000190015;
        for (let j = 0; j < 6; j++) ser += c[j] / ++y;
        return -tmp + Math.log(2.5066282746310005 * ser / x);
    },

    // Beta Probability Density Function
    betaPDF: (x, alpha, beta) => {
        if (x <= 0 || x >= 1) return 0;
        // ln(PDF) = (alpha-1)ln(x) + (beta-1)ln(1-x) - ln(B(alpha,beta))
        // ln(B(alpha,beta)) = ln(Gamma(alpha)) + ln(Gamma(beta)) - ln(Gamma(alpha+beta))
        
        const lnB = MathUtils.logGamma(alpha) + MathUtils.logGamma(beta) - MathUtils.logGamma(alpha + beta);
        const lnNum = (alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x);
        
        return Math.exp(lnNum - lnB);
    },

    // Sample from Beta distribution (using Jöhnk's algorithm or simple approximation)
    // For integer alpha/beta, we can simulate by drawing from Uniform.
    // But standard way for JS is usually a library. 
    // For this demo, we can use the "sum of logarithms" method for integer alpha/beta
    // or a simple rejection sampling.
    // Since alpha/beta grow, let's use a standard approximation or just use the mean for the "best arm" selection in the demo
    // strictly speaking TS requires random sampling.
    // Let's use a simple Gamma sampling method since Beta(a,b) ~ Gamma(a,1) / (Gamma(a,1) + Gamma(b,1))
    
    sampleGamma: (k) => {
        // Marsaglia and Tsang's method for k > 1
        if (k < 1) {
            return MathUtils.sampleGamma(k + 1) * Math.pow(Math.random(), 1 / k);
        }
        const d = k - 1 / 3;
        const c = 1 / Math.sqrt(9 * d);
        while (true) {
            const x = MathUtils.randn();
            const v = 1 + c * x;
            if (v <= 0) continue;
            const v3 = v * v * v;
            const u = Math.random();
            if (u < 1 - 0.0331 * x * x * x * x) return d * v3;
            if (Math.log(u) < 0.5 * x * x + d * (1 - v3 + Math.log(v3))) return d * v3;
        }
    },

    randn: () => {
        // Box-Muller transform
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    },

    sampleBeta: (alpha, beta) => {
        const x = MathUtils.sampleGamma(alpha);
        const y = MathUtils.sampleGamma(beta);
        return x / (x + y);
    }
};

// ==========================================
// Thompson Sampling Algorithm Class
// ==========================================

class ThompsonSampling {
    constructor(nArms) {
        this.nArms = nArms;
        // Initialize alpha=1, beta=1 (Uniform Prior)
        this.alphas = new Array(nArms).fill(1);
        this.betas = new Array(nArms).fill(1);
    }

    selectArm() {
        let bestArm = -1;
        let maxSample = -1;
        const samples = [];

        for (let i = 0; i < this.nArms; i++) {
            const sample = MathUtils.sampleBeta(this.alphas[i], this.betas[i]);
            samples.push(sample);
            if (sample > maxSample) {
                maxSample = sample;
                bestArm = i;
            }
        }

        return { bestArm, samples };
    }

    update(armIdx, reward) {
        // Bernoulli TS: 
        // Reward = 1 (Success) -> alpha++
        // Reward = 0 (Failure) -> beta++
        if (reward === 1) {
            this.alphas[armIdx]++;
        } else {
            this.betas[armIdx]++;
        }
    }
    
    getDistributions() {
        // Generate points for plotting PDF
        const points = 100;
        const data = [];
        
        for (let i = 0; i < this.nArms; i++) {
            const armData = [];
            for (let j = 0; j <= points; j++) {
                const x = j / points;
                // Avoid 0 and 1 singularities for alpha/beta < 1 (though we start at 1)
                const safeX = Math.max(0.001, Math.min(0.999, x)); 
                const y = MathUtils.betaPDF(safeX, this.alphas[i], this.betas[i]);
                armData.push({x: x, y: y});
            }
            data.push(armData);
        }
        return data;
    }
}

// ==========================================
// Demo Controller
// ==========================================

// Configuration
const N_ARMS = 3;
const ADS = [
    { id: 0, name: "Ad A (Classic)", color: 'rgba(255, 99, 132, 1)', bgColor: 'rgba(255, 99, 132, 0.2)' },
    { id: 1, name: "Ad B (Modern)", color: 'rgba(54, 162, 235, 1)', bgColor: 'rgba(54, 162, 235, 0.2)' },
    { id: 2, name: "Ad C (Bold)", color: 'rgba(255, 206, 86, 1)', bgColor: 'rgba(255, 206, 86, 0.2)' }
];

let model = new ThompsonSampling(N_ARMS);
let chart;

function initDemo() {
    // Setup Chart
    const ctx = document.getElementById('tsChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: ADS.map((ad, i) => ({
                label: ad.name,
                data: [],
                borderColor: ad.color,
                backgroundColor: ad.bgColor,
                borderWidth: 2,
                pointRadius: 0, // Smooth lines
                fill: true,
                tension: 0.4
            }))
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    type: 'linear',
                    min: 0,
                    max: 1,
                    title: { display: true, text: 'Probability of Click (CTR)' }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Density (Confidence)' }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Beta Distributions (Beliefs)'
                },
                tooltip: {
                    enabled: false // Disable tooltips for cleaner view of distributions
                }
            },
            animation: {
                duration: 300
            }
        }
    });

    updateVisualization();
    renderControls();
}

function updateVisualization() {
    const distributions = model.getDistributions();
    
    // Update Chart
    distributions.forEach((data, i) => {
        chart.data.datasets[i].data = data;
    });
    chart.update();

    // Update Stats Table
    renderStats();
}

function handleFeedback(armIdx, reward) {
    model.update(armIdx, reward);
    
    const action = reward === 1 ? "Clicked (Success)" : "Ignored (Failure)";
    logAction(`User <strong>${action}</strong> on <strong>${ADS[armIdx].name}</strong>.`);
    
    updateVisualization();
}

function renderControls() {
    const container = document.getElementById('controls-container');
    container.innerHTML = '';

    ADS.forEach((ad, idx) => {
        const div = document.createElement('div');
        div.className = 'control-card';
        div.style.borderTop = `3px solid ${ad.color}`;
        div.innerHTML = `
            <h3>${ad.name}</h3>
            <div class="btn-group">
                <button class="btn-success" onclick="handleFeedback(${idx}, 1)">👍 Click</button>
                <button class="btn-fail" onclick="handleFeedback(${idx}, 0)">👎 Ignore</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderStats() {
    const container = document.getElementById('stats-container');
    let html = `
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <th style="text-align: left; padding: 0.5rem;">Ad</th>
                    <th style="text-align: right; padding: 0.5rem;">Alpha (Success)</th>
                    <th style="text-align: right; padding: 0.5rem;">Beta (Fail)</th>
                    <th style="text-align: right; padding: 0.5rem;">Mean CTR</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    for(let i=0; i<N_ARMS; i++) {
        const alpha = model.alphas[i];
        const beta = model.betas[i];
        const mean = alpha / (alpha + beta);
        
        html += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 0.5rem; color: ${ADS[i].color}"><strong>${ADS[i].name}</strong></td>
                <td style="text-align: right; padding: 0.5rem;">${alpha}</td>
                <td style="text-align: right; padding: 0.5rem;">${beta}</td>
                <td style="text-align: right; padding: 0.5rem;">${(mean * 100).toFixed(1)}%</td>
            </tr>
        `;
    }
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function logAction(message) {
    const log = document.getElementById('demo-log');
    const entry = document.createElement('div');
    entry.innerHTML = `<span class="time">${new Date().toLocaleTimeString()}</span> ${message}`;
    log.insertBefore(entry, log.firstChild);
}

document.addEventListener('DOMContentLoaded', initDemo);
