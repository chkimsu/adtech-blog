/**
 * LinUCB Demo Implementation
 * Ports the Python LinUCB logic to JavaScript for client-side simulation.
 */

// ==========================================
// Matrix Math Helpers (Simple implementation for demo)
// ==========================================

const Matrix = {
    // Create Identity Matrix (d x d)
    identity: (d) => {
        const m = [];
        for (let i = 0; i < d; i++) {
            m[i] = [];
            for (let j = 0; j < d; j++) {
                m[i][j] = i === j ? 1 : 0;
            }
        }
        return m;
    },

    // Create Zero Vector (d x 1)
    zeros: (d) => {
        return new Array(d).fill(0);
    },

    // Matrix x Vector multiplication
    dotMV: (M, v) => {
        const result = [];
        for (let i = 0; i < M.length; i++) {
            let sum = 0;
            for (let j = 0; j < v.length; j++) {
                sum += M[i][j] * v[j];
            }
            result.push(sum);
        }
        return result;
    },

    // Vector x Vector (Dot product)
    dotVV: (v1, v2) => {
        let sum = 0;
        for (let i = 0; i < v1.length; i++) {
            sum += v1[i] * v2[i];
        }
        return sum;
    },

    // Outer Product (v * v^T) -> Matrix
    outer: (v) => {
        const m = [];
        for (let i = 0; i < v.length; i++) {
            m[i] = [];
            for (let j = 0; j < v.length; j++) {
                m[i][j] = v[i] * v[j];
            }
        }
        return m;
    },

    // Matrix Addition
    add: (M1, M2) => {
        const m = [];
        for (let i = 0; i < M1.length; i++) {
            m[i] = [];
            for (let j = 0; j < M1[0].length; j++) {
                m[i][j] = M1[i][j] + M2[i][j];
            }
        }
        return m;
    },

    // Vector Addition
    addV: (v1, v2) => {
        return v1.map((val, i) => val + v2[i]);
    },

    // Scalar Multiplication for Vector
    scaleV: (v, s) => {
        return v.map(val => val * s);
    },

    // Matrix Inversion (Gaussian elimination)
    // Note: For production, use a library like math.js. This is for demo only.
    invert: (M) => {
        const n = M.length;
        // Create augmented matrix [M | I]
        const aug = [];
        for (let i = 0; i < n; i++) {
            aug[i] = [...M[i], ...Matrix.identity(n)[i]];
        }

        // Gaussian elimination
        for (let i = 0; i < n; i++) {
            // Pivot
            let pivot = aug[i][i];
            if (Math.abs(pivot) < 1e-10) {
                // Simple pivot swap if needed (omitted for simplicity in this specific demo context)
                // In LinUCB, A is positive definite (Ridge Regression), so it's invertible.
            }

            for (let j = 0; j < 2 * n; j++) {
                aug[i][j] /= pivot;
            }

            for (let k = 0; k < n; k++) {
                if (k !== i) {
                    const factor = aug[k][i];
                    for (let j = 0; j < 2 * n; j++) {
                        aug[k][j] -= factor * aug[i][j];
                    }
                }
            }
        }

        // Extract inverse
        const inv = [];
        for (let i = 0; i < n; i++) {
            inv[i] = aug[i].slice(n);
        }
        return inv;
    }
};

// ==========================================
// LinUCB Algorithm Class
// ==========================================

class LinUCB {
    constructor(nArms, nFeatures, alpha = 1.0) {
        this.nArms = nArms;
        this.nFeatures = nFeatures;
        this.alpha = alpha;

        // Initialize A (Identity) and b (Zeros) for each arm
        this.A = [];
        this.b = [];
        for (let i = 0; i < nArms; i++) {
            this.A.push(Matrix.identity(nFeatures));
            this.b.push(Matrix.zeros(nFeatures));
        }
    }

    selectArm(contextVectors) {
        let bestArm = -1;
        let maxUcb = -Infinity;
        const scores = [];
        const details = [];

        for (let i = 0; i < this.nArms; i++) {
            const x = contextVectors[i]; // Feature vector for arm i
            const A_inv = Matrix.invert(this.A[i]);

            // 1. Theta = A^-1 * b
            const theta = Matrix.dotMV(A_inv, this.b[i]);

            // 2. Prediction = Theta^T * x
            const prediction = Matrix.dotVV(theta, x);

            // 3. Uncertainty = alpha * sqrt(x^T * A^-1 * x)
            // x^T * A^-1
            const xT_Ainv = Matrix.dotMV(A_inv, x); // Since A is symmetric, A^-1 is symmetric, so (A^-1 * x) is same as x^T * A^-1
            // (x^T * A^-1) * x
            const variance = Matrix.dotVV(xT_Ainv, x);
            const uncertainty = this.alpha * Math.sqrt(variance);

            const ucbScore = prediction + uncertainty;

            scores.push(ucbScore);
            details.push({
                prediction: prediction,
                uncertainty: uncertainty,
                total: ucbScore,
                theta: theta // Expose learned weights
            });

            if (ucbScore > maxUcb) {
                maxUcb = ucbScore;
                bestArm = i;
            }
        }

        return { bestArm, scores, details };
    }

    update(armIdx, contextVector, reward) {
        const x = contextVector;

        // Update A: A += x * x^T
        const outer = Matrix.outer(x);
        this.A[armIdx] = Matrix.add(this.A[armIdx], outer);

        // Update b: b += reward * x
        const weightedX = Matrix.scaleV(x, reward);
        this.b[armIdx] = Matrix.addV(this.b[armIdx], weightedX);
    }
}

// ==========================================
// Demo Controller
// ==========================================

// Configuration
const N_ARMS = 4;
const N_FEATURES = 3; // [Matching Score, User Gender(M), Seasonality]
const ALPHA = 0.5;

// Initialize Model
let model = new LinUCB(N_ARMS, N_FEATURES, ALPHA);

// Define Ads (Arms) and their Contexts
// Let's assume a static context for simplicity of the demo, 
// or we can toggle contexts.
const ads = [
    { id: 0, name: "Ad A (Tech)", features: [1.0, 1.0, 0.2], color: 'rgba(255, 99, 132, 0.7)' },
    { id: 1, name: "Ad B (Fashion)", features: [0.2, 0.0, 1.0], color: 'rgba(54, 162, 235, 0.7)' },
    { id: 2, name: "Ad C (Food)", features: [0.5, 0.5, 0.5], color: 'rgba(255, 206, 86, 0.7)' },
    { id: 3, name: "Ad D (Travel)", features: [0.1, 0.8, 0.9], color: 'rgba(75, 192, 192, 0.7)' }
];

// Chart Instance
let chart;

function initDemo() {
    // Setup Chart
    const ctx = document.getElementById('ucbChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ads.map(ad => ad.name),
            datasets: [
                {
                    label: 'Prediction (Exploitation)',
                    data: [0, 0, 0, 0],
                    backgroundColor: ads.map(ad => ad.color),
                    stack: 'Stack 0',
                },
                {
                    label: 'Uncertainty (Exploration)',
                    data: [0, 0, 0, 0],
                    backgroundColor: 'rgba(200, 200, 200, 0.5)',
                    stack: 'Stack 0',
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'UCB Score' }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'LinUCB Score Decomposition'
                }
            },
            animation: {
                duration: 500
            }
        }
    });

    // Initial Render
    updateVisualization();
    renderAdCards();
}

function updateVisualization() {
    // Get current scores
    const contexts = ads.map(ad => ad.features);
    const result = model.selectArm(contexts);

    // Update Chart Data
    chart.data.datasets[0].data = result.details.map(d => d.prediction);
    chart.data.datasets[1].data = result.details.map(d => d.uncertainty);
    chart.update();

    // Highlight Best Arm
    const cards = document.querySelectorAll('.ad-card');
    cards.forEach((card, idx) => {
        if (idx === result.bestArm) {
            card.classList.add('recommended');
        } else {
            card.classList.remove('recommended');
        }
    });
}

function handleAdClick(armIdx) {
    // User clicked an ad -> Reward = 1
    const context = ads[armIdx].features;
    model.update(armIdx, context, 1.0);

    // Log to UI
    logAction(`Clicked <strong>${ads[armIdx].name}</strong>. Model updated.`);

    // Update View
    updateVisualization();
}

function renderAdCards() {
    const container = document.getElementById('ad-cards-container');
    container.innerHTML = '';

    ads.forEach((ad, idx) => {
        const card = document.createElement('div');
        card.className = 'ad-card';
        card.innerHTML = `
      <h3>${ad.name}</h3>
      <div class="features">Features: [${ad.features.join(', ')}]</div>
      <button onclick="handleAdClick(${idx})">Click (Like)</button>
    `;
        container.appendChild(card);
    });
}

function logAction(message) {
    const log = document.getElementById('demo-log');
    const entry = document.createElement('div');
    entry.innerHTML = `<span class="time">${new Date().toLocaleTimeString()}</span> ${message}`;
    log.insertBefore(entry, log.firstChild);
}

function resetDemo() {
    model = new LinUCB(N_ARMS, N_FEATURES, ALPHA);
    updateVisualization();
    logAction("Model reset to initial state.");
}

// Start
document.addEventListener('DOMContentLoaded', initDemo);
