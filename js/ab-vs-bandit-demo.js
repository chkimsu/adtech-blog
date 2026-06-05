// A/B vs Bandit traffic simulator
// A/B = fixed 1/3 split each day. Bandit = Thompson Sampling (Beta posterior).
(function () {
  const ADS = [
    { name: '광고 A', color: '#b0442c' },
    { name: '광고 B', color: '#5a6b7a' },
    { name: '광고 C', color: '#5f7a63' }
  ];
  const INIT_CTR = [2, 6, 3];      // % (slider default) — B clearly best so the gap is visible
  const PER_DAY = 150;
  const TOTAL_DAYS = 10;

  let trueCtr = INIT_CTR.map(v => v / 100);
  let state, abClicksChart, trafficChart, autoTimer = null;

  // ---- random helpers ----
  function rnorm() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function gammaInt(k) { let s = 0; for (let i = 0; i < k; i++) s -= Math.log(Math.random() || 1e-12); return s; }
  function betaSample(a, b) {
    if (a + b > 60) { // normal approximation for stability/speed
      const m = a / (a + b);
      const va = (a * b) / ((a + b) * (a + b) * (a + b + 1));
      const s = m + Math.sqrt(va) * rnorm();
      return Math.min(1 - 1e-6, Math.max(1e-6, s));
    }
    const x = gammaInt(a), y = gammaInt(b);
    return x / (x + y);
  }

  function freshState() {
    return {
      day: 0,
      abClicks: 0,
      banditClicks: 0,
      bandit: ADS.map(() => ({ a: 1, b: 1 })),   // Beta(1,1) prior per arm
      abCum: [0],                                  // cumulative clicks by day
      banditCum: [0],
      traffic: []                                  // per-day [impr_A, impr_B, impr_C] for bandit
    };
  }

  // ---- theme-aware chart colors ----
  function colors() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      text: dark ? '#c6bdae' : '#4f4a42',
      grid: dark ? 'rgba(241,236,227,0.10)' : 'rgba(32,29,26,0.08)'
    };
  }

  // ---- one simulated day ----
  function stepDay() {
    if (state.day >= TOTAL_DAYS) return;

    // A/B: split ~1/3 each, Bernoulli clicks
    const base = Math.floor(PER_DAY / ADS.length);
    let abImpr = ADS.map(() => base);
    abImpr[0] += PER_DAY - base * ADS.length; // remainder to first
    abImpr.forEach((n, i) => {
      for (let k = 0; k < n; k++) if (Math.random() < trueCtr[i]) state.abClicks++;
    });

    // Bandit: Thompson Sampling per impression
    const dayTraffic = ADS.map(() => 0);
    for (let k = 0; k < PER_DAY; k++) {
      let best = 0, bestSample = -1;
      for (let i = 0; i < ADS.length; i++) {
        const s = betaSample(state.bandit[i].a, state.bandit[i].b);
        if (s > bestSample) { bestSample = s; best = i; }
      }
      dayTraffic[best]++;
      const clicked = Math.random() < trueCtr[best];
      if (clicked) { state.bandit[best].a++; state.banditClicks++; }
      else { state.bandit[best].b++; }
    }

    state.day++;
    state.traffic.push(dayTraffic);
    state.abCum.push(state.abClicks);
    state.banditCum.push(state.banditClicks);
    render();
  }

  // ---- render UI + charts ----
  function render() {
    document.getElementById('ab-day').innerHTML =
      state.day + '<span style="font-size:0.9rem;color:var(--text-muted)"> / ' + TOTAL_DAYS + '일</span>';
    document.getElementById('ab-impr').textContent = '노출 ' + (state.day * PER_DAY).toLocaleString() + '회';
    document.getElementById('ab-clicks-ab').textContent = state.abClicks;
    document.getElementById('ab-clicks-bandit').textContent = state.banditClicks;
    const diff = state.banditClicks - state.abClicks;
    const diffEl = document.getElementById('ab-diff');
    diffEl.textContent = state.day === 0 ? '—' : (diff >= 0 ? 'A/B보다 +' + diff + '클릭' : 'A/B보다 ' + diff + '클릭');

    // clicks chart
    const labels = state.abCum.map((_, i) => i);
    abClicksChart.data.labels = labels;
    abClicksChart.data.datasets[0].data = state.abCum;
    abClicksChart.data.datasets[1].data = state.banditCum;
    abClicksChart.update();

    // traffic chart (bandit per-day split)
    const tlabels = state.traffic.map((_, i) => (i + 1) + '일');
    trafficChart.data.labels = tlabels;
    ADS.forEach((ad, i) => { trafficChart.data.datasets[i].data = state.traffic.map(d => d[i]); });
    trafficChart.update();
  }

  function setAutoRunning(on) {
    document.getElementById('ab-step').disabled = on;
    document.getElementById('ab-auto').disabled = on;
  }

  function autoRun() {
    if (state.day >= TOTAL_DAYS) reset();
    setAutoRunning(true);
    autoTimer = setInterval(() => {
      stepDay();
      if (state.day >= TOTAL_DAYS) { clearInterval(autoTimer); autoTimer = null; setAutoRunning(false); }
    }, 550);
  }

  function reset() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; setAutoRunning(false); }
    state = freshState();
    render();
  }

  // ---- build sliders ----
  function buildControls() {
    const wrap = document.getElementById('ab-controls');
    wrap.innerHTML = ADS.map((ad, i) => `
      <div class="ab-slider-card">
        <div class="ab-slider-head">
          <span class="ab-slider-name"><span class="ab-dot" style="background:${ad.color}"></span>${ad.name}</span>
          <span class="ab-slider-val" id="ab-ctr-val-${i}">${INIT_CTR[i].toFixed(1)}%</span>
        </div>
        <input type="range" id="ab-ctr-${i}" min="0" max="12" step="0.5" value="${INIT_CTR[i]}" aria-label="${ad.name} 클릭률">
      </div>
    `).join('');
    ADS.forEach((ad, i) => {
      const input = document.getElementById('ab-ctr-' + i);
      input.addEventListener('input', () => {
        const v = parseFloat(input.value);
        trueCtr[i] = v / 100;
        document.getElementById('ab-ctr-val-' + i).textContent = v.toFixed(1) + '%';
        reset(); // changing CTR restarts the simulation
      });
    });
  }

  // ---- init charts ----
  function initCharts() {
    const c = colors();
    const clicksCanvas = document.getElementById('abClicksChart');
    abClicksChart = new Chart(clicksCanvas, {
      type: 'line',
      data: {
        labels: [0],
        datasets: [
          { label: 'A/B (고정)', data: [0], borderColor: '#b0442c', backgroundColor: 'rgba(176,68,44,0.08)', tension: 0.25, borderWidth: 2, pointRadius: 0, fill: true },
          { label: '밴딧 (적응)', data: [0], borderColor: '#5a6b7a', backgroundColor: 'rgba(90,107,122,0.10)', tension: 0.25, borderWidth: 2.5, pointRadius: 0, fill: true }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: c.text, font: { size: 12 } } } },
        scales: {
          x: { title: { display: true, text: '일', color: c.text }, grid: { color: c.grid }, ticks: { color: c.text } },
          y: { title: { display: true, text: '누적 클릭', color: c.text }, grid: { color: c.grid }, ticks: { color: c.text }, beginAtZero: true }
        }
      }
    });

    const trafficCanvas = document.getElementById('abTrafficChart');
    trafficChart = new Chart(trafficCanvas, {
      type: 'bar',
      data: {
        labels: [],
        datasets: ADS.map(ad => ({ label: ad.name, data: [], backgroundColor: ad.color, borderWidth: 0 }))
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: c.text, font: { size: 12 } } } },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { color: c.text } },
          y: { stacked: true, title: { display: true, text: '밴딧 노출 수', color: c.text }, grid: { color: c.grid }, ticks: { color: c.text }, max: PER_DAY }
        }
      }
    });
  }

  function init() {
    if (!document.getElementById('ab-controls')) return;
    buildControls();
    initCharts();
    state = freshState();
    render();
    document.getElementById('ab-step').addEventListener('click', stepDay);
    document.getElementById('ab-auto').addEventListener('click', autoRun);
    document.getElementById('ab-reset').addEventListener('click', reset);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
