// ===================================================================
// 서빙 비용 계산기 — js/serving-cost-demo.js
// 요청량을 받아 내는 데 서버가 몇 대 필요하고 한 달에 얼마인가를 CPU 와 GPU 로 나란히 센다.
// 대수는 두 조건 중 큰 쪽이다 — 평시에 부하율 상한을 지키는 대수, 예비가 빠져도 받아 내는 대수.
// 숫자는 batch-vs-realtime-inference 글의 가상 값이다.
// ===================================================================
(function () {
  'use strict';

  const HOURS = 720;              // 한 달 (30일 × 24시간)
  const QMIN = 500, QMAX = 20000; // 차트 가로 범위
  const STEPS = 120;              // 차트 표본 수

  // 평시 조건과 고장 조건 중 큰 쪽이 대수다.
  const machines = (qps, cap, load, spare) => {
    const normal = Math.ceil(qps / (cap * load));
    const failover = Math.ceil(qps / cap) + spare;
    return { n: Math.max(normal, failover), normal, failover };
  };
  const monthCost = (qps, cap, load, spare, won) => machines(qps, cap, load, spare).n * HOURS * won;

  // GPU 가 CPU 보다 처음 싸지는 요청량. 없으면 null.
  function flipPoint(s) {
    for (let q = QMIN; q <= QMAX; q++) {
      if (monthCost(q, s.gcap, s.load, s.spare, s.gwon) < monthCost(q, s.ccap, s.load, s.spare, s.cwon)) return q;
    }
    return null;
  }

  const won = v => v.toLocaleString('ko-KR');
  const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function palette() {
    return {
      muted: cssVar('--text-muted') || '#697180',
      cpu: cssVar('--accent-primary') || '#1F4FA3',
      gpu: cssVar('--accent-secondary') || '#8B1E1E',
      grid: 'rgba(128,128,128,0.18)',
    };
  }

  const $ = id => document.getElementById(id);
  const IDS = ['sc-qps', 'sc-load', 'sc-spare', 'sc-cpu-cap', 'sc-cpu-won', 'sc-gpu-cap', 'sc-gpu-won'];
  let costChart, countChart;

  const state = () => ({
    qps: +$('sc-qps').value, load: +$('sc-load').value, spare: +$('sc-spare').value,
    ccap: +$('sc-cpu-cap').value, cwon: +$('sc-cpu-won').value,
    gcap: +$('sc-gpu-cap').value, gwon: +$('sc-gpu-won').value,
  });

  function scaleOpts(yTitle, yTick) {
    const p = palette();
    return {
      responsive: true, maintainAspectRatio: false, animation: { duration: 180 },
      plugins: {
        legend: { display: true, labels: { color: p.muted, boxHeight: 2, filter: it => it.datasetIndex < 2 } },
      },
      scales: {
        x: {
          type: 'linear', min: QMIN, max: QMAX,
          title: { display: true, text: '요청량 (QPS)', color: p.muted },
          ticks: { color: p.muted, maxTicksLimit: 6, callback: v => v.toLocaleString('ko-KR') },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: yTitle, color: p.muted },
          ticks: { color: p.muted, callback: yTick }, grid: { color: p.grid },
        },
      },
    };
  }

  function line(label, color) {
    return { label, data: [], borderColor: color, backgroundColor: 'transparent', borderWidth: 2.4, pointRadius: 0, stepped: true };
  }
  function dot(label, color) {
    return { label, data: [], borderColor: color, backgroundColor: color, pointRadius: 6, pointHoverRadius: 8, showLine: false };
  }

  function initCharts() {
    const p = palette();
    costChart = new Chart($('sc-cost-chart'), {
      type: 'line',
      data: { datasets: [line('CPU 서버', p.cpu), line('GPU 서버', p.gpu), dot('지금 CPU', p.cpu), dot('지금 GPU', p.gpu)] },
      options: scaleOpts('한 달, 백만 원', v => (v / 1e6).toFixed(0)),
    });
    countChart = new Chart($('sc-count-chart'), {
      type: 'line',
      data: { datasets: [line('CPU 서버', p.cpu), line('GPU 서버', p.gpu), dot('지금 CPU', p.cpu), dot('지금 GPU', p.gpu)] },
      options: scaleOpts('대수', v => v),
    });
  }

  function render() {
    const s = state();
    $('sc-qps-val').textContent = won(s.qps);
    $('sc-load-val').textContent = s.load.toFixed(2);
    $('sc-spare-val').textContent = s.spare + '대';
    $('sc-cpu-cap-val').textContent = won(s.ccap);
    $('sc-cpu-won-val').textContent = won(s.cwon) + '원';
    $('sc-gpu-cap-val').textContent = won(s.gcap);
    $('sc-gpu-won-val').textContent = won(s.gwon) + '원';

    const c = machines(s.qps, s.ccap, s.load, s.spare);
    const g = machines(s.qps, s.gcap, s.load, s.spare);
    const cCost = c.n * HOURS * s.cwon, gCost = g.n * HOURS * s.gwon;

    $('sc-cpu-cost').textContent = won(cCost) + '원';
    $('sc-gpu-cost').textContent = won(gCost) + '원';
    $('sc-cpu-cost').className = 'sc-metric-value ' + (cCost <= gCost ? 'good' : 'warn');
    $('sc-gpu-cost').className = 'sc-metric-value ' + (gCost < cCost ? 'good' : 'warn');
    $('sc-cpu-sub').textContent = `${c.n}대 — 평시 ${c.normal}대, 고장 ${c.failover}대`;
    $('sc-gpu-sub').textContent = `${g.n}대 — 평시 ${g.normal}대, 고장 ${g.failover}대`;

    const flip = flipPoint(s);
    $('sc-flip').textContent = flip ? won(flip) + ' QPS' : '없음';
    $('sc-flip').className = 'sc-metric-value ' + (flip ? 'good' : 'warn');
    $('sc-flip-sub').textContent = flip
      ? '이 요청량부터 GPU 가 처음 싸집니다'
      : `${won(QMAX)} QPS 까지 CPU 가 계속 쌉니다`;

    // 차트 — 요청량을 훑으며 두 곡선을 그린다
    const step = (QMAX - QMIN) / STEPS;
    const xs = Array.from({ length: STEPS + 1 }, (_, i) => Math.round(QMIN + i * step));
    const cn = xs.map(q => ({ x: q, y: machines(q, s.ccap, s.load, s.spare).n }));
    const gn = xs.map(q => ({ x: q, y: machines(q, s.gcap, s.load, s.spare).n }));
    costChart.data.datasets[0].data = cn.map(d => ({ x: d.x, y: d.y * HOURS * s.cwon }));
    costChart.data.datasets[1].data = gn.map(d => ({ x: d.x, y: d.y * HOURS * s.gwon }));
    costChart.data.datasets[2].data = [{ x: s.qps, y: cCost }];
    costChart.data.datasets[3].data = [{ x: s.qps, y: gCost }];
    countChart.data.datasets[0].data = cn;
    countChart.data.datasets[1].data = gn;
    countChart.data.datasets[2].data = [{ x: s.qps, y: c.n }];
    countChart.data.datasets[3].data = [{ x: s.qps, y: g.n }];
    costChart.update('none');
    countChart.update('none');

    // 한 줄 판정
    const gap = Math.abs(cCost - gCost);
    let verdict;
    if (gap === 0) {
      verdict = `CPU ${c.n}대와 GPU ${g.n}대가 한 달 ${won(cCost)}원으로 같습니다. 이 자리에서는 대수가 적은 쪽이 다루기 쉽습니다.`;
    } else {
      const cheap = cCost < gCost;
      verdict = `${cheap ? 'CPU' : 'GPU'} ${cheap ? c.n : g.n}대가 한 달 ${won(cheap ? cCost : gCost)}원으로 `
        + `${cheap ? 'GPU' : 'CPU'} ${cheap ? g.n : c.n}대보다 ${won(gap)}원 쌉니다. `
        + (flip ? `요청량 ${won(flip)} QPS 부터 GPU 가 처음 싸집니다.` : `${won(QMAX)} QPS 까지 GPU 가 싸지는 자리가 없습니다.`);
    }
    if (g.failover > g.normal) verdict += ` GPU 는 예비 ${s.spare}대가 대수를 정하고 있습니다.`;
    $('sc-verdict').textContent = verdict;
  }

  function applyTheme() {
    const p = palette();
    [costChart, countChart].forEach(ch => {
      if (!ch) return;
      ch.options.plugins.legend.labels.color = p.muted;
      ['x', 'y'].forEach(ax => {
        ch.options.scales[ax].title.color = p.muted;
        ch.options.scales[ax].ticks.color = p.muted;
        if (ch.options.scales[ax].grid.color) ch.options.scales[ax].grid.color = p.grid;
      });
      [0, 2].forEach(i => { ch.data.datasets[i].borderColor = p.cpu; ch.data.datasets[i].backgroundColor = i ? p.cpu : 'transparent'; });
      [1, 3].forEach(i => { ch.data.datasets[i].borderColor = p.gpu; ch.data.datasets[i].backgroundColor = i > 2 ? p.gpu : 'transparent'; });
      ch.update('none');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('sc-cost-chart')) return;
    initCharts();
    IDS.forEach(id => $(id).addEventListener('input', render));
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.preset.split(',').map(Number);
        IDS.forEach((id, i) => { $(id).value = v[i]; });
        render();
      });
    });
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    render();
  });
})();
