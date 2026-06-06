// ===================================================================
// Frequency Capping Simulator — js/frequency-capping-demo.js
// 같은 광고를 반복 노출하면 추가 반응이 체감(ad fatigue)한다. 빈도 상한(cap)은
// 도달 vs 깊이의 트레이드오프이고, 순가치를 최대화하는 최적 cap이 존재한다(역U자).
// ===================================================================
(function () {
  'use strict';

  const MAXCAP = 15;
  const caps = Array.from({ length: MAXCAP }, (_, i) => i + 1); // 1..15

  // k번째 노출의 한계반응(기하 감쇠) · n회까지 누적반응 · 유저당 순가치
  const marginal = (k, p0, r) => p0 * Math.pow(r, k - 1);
  const cumResp = (n, p0, r) => p0 * (1 - Math.pow(r, n)) / (1 - r);
  const netValue = (cap, p0, r, value, cost) => cumResp(cap, p0, r) * value - cap * cost;

  function bestCap(p0, r, value, cost) {
    let best = 1, bestV = -Infinity;
    for (const c of caps) {
      const v = netValue(c, p0, r, value, cost);
      if (v > bestV) { bestV = v; best = c; }
    }
    return { best, bestV };
  }

  const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function palette() {
    return {
      text: cssVar('--text-secondary') || '#4f4a42',
      muted: cssVar('--text-muted') || '#8a8176',
      accent: cssVar('--accent-primary') || '#b0442c',
      accent2: cssVar('--accent-secondary') || '#8a6a3a',
      grid: 'rgba(128,128,128,0.18)',
      faint: 'rgba(176,68,44,0.18)',
    };
  }

  const $ = id => document.getElementById(id);
  let margChart, netChart;

  function scaleOpts(xTitle, yTitle) {
    const p = palette();
    return {
      responsive: true, maintainAspectRatio: false, animation: { duration: 180 },
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: xTitle, color: p.muted }, ticks: { color: p.muted }, grid: { display: false } },
        y: { title: { display: true, text: yTitle, color: p.muted }, ticks: { color: p.muted }, grid: { color: p.grid } },
      },
    };
  }

  function initCharts() {
    const p = palette();
    margChart = new Chart($('fc-marg-chart'), {
      type: 'bar',
      data: { labels: caps, datasets: [{ label: '한계 반응', data: [], backgroundColor: p.faint, borderColor: p.accent, borderWidth: 1.5 }] },
      options: scaleOpts('노출 횟수 (k번째)', '한계 반응률'),
    });
    netChart = new Chart($('fc-net-chart'), {
      type: 'line',
      data: {
        labels: caps,
        datasets: [
          { label: '순가치', data: [], borderColor: p.accent, backgroundColor: 'transparent', borderWidth: 2.5, pointRadius: 2, tension: 0.2 },
          { label: '최적 cap', data: [], borderColor: p.accent2, backgroundColor: p.accent2, pointRadius: 7, pointHoverRadius: 9, showLine: false },
        ],
      },
      options: scaleOpts('빈도 상한 (cap)', '유저당 순가치'),
    });
  }

  function render() {
    const p0 = +$('fc-p0').value;
    const r = +$('fc-r').value;
    const value = +$('fc-value').value;
    const cost = +$('fc-cost').value;
    $('fc-p0-val').textContent = (p0 * 100).toFixed(1) + '%';
    $('fc-r-val').textContent = r.toFixed(2);
    $('fc-value-val').textContent = '$' + value;
    $('fc-cost-val').textContent = '$' + cost.toFixed(2);

    // 한계 반응 막대
    margChart.data.datasets[0].data = caps.map(k => +(marginal(k, p0, r) * 100).toFixed(3));
    margChart.update('none');

    // 순가치 곡선 + 최적점
    const net = caps.map(c => +netValue(c, p0, r, value, cost).toFixed(3));
    netChart.data.datasets[0].data = net;
    const { best, bestV } = bestCap(p0, r, value, cost);
    netChart.data.datasets[1].data = caps.map(c => c === best ? +bestV.toFixed(3) : null);
    netChart.update('none');

    // 지표
    $('fc-best').textContent = best + '회';
    $('fc-bestv').textContent = '$' + bestV.toFixed(2);
    // 무제한(=15)으로 깔았을 때 대비 절약(또는 손실 회피)
    const noCapV = netValue(MAXCAP, p0, r, value, cost);
    const gain = bestV - noCapV;
    $('fc-gain').textContent = (gain >= 0 ? '+$' : '-$') + Math.abs(gain).toFixed(2);
    $('fc-gain').className = 'fc-metric-value ' + (gain > 0.001 ? 'good' : 'warn');

    // 한 줄 해석
    let verdict;
    if (best >= MAXCAP) verdict = `이 조건에선 ${MAXCAP}회까지도 추가 노출이 비용보다 이득 — 피로가 약하거나 전환 가치가 큽니다.`;
    else if (best === 1) verdict = '두 번째 노출부터 비용이 반응을 넘습니다 — 한 번만 보여주는 게 최적(피로가 매우 크거나 노출이 비쌈).';
    else verdict = `최적 빈도 상한은 ${best}회 — 그 이상은 노출당 비용이 줄어든 한계 반응을 넘어 순가치가 떨어집니다.`;
    $('fc-verdict').textContent = verdict;
  }

  function applyTheme() {
    const p = palette();
    [margChart, netChart].forEach(ch => {
      if (!ch) return;
      ['x', 'y'].forEach(ax => {
        ch.options.scales[ax].title.color = p.muted;
        ch.options.scales[ax].ticks.color = p.muted;
        if (ch.options.scales[ax].grid.color) ch.options.scales[ax].grid.color = p.grid;
      });
    });
    margChart.data.datasets[0].backgroundColor = p.faint;
    margChart.data.datasets[0].borderColor = p.accent;
    netChart.data.datasets[0].borderColor = p.accent;
    netChart.data.datasets[1].borderColor = p.accent2;
    netChart.data.datasets[1].backgroundColor = p.accent2;
    margChart.update('none');
    netChart.update('none');
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('fc-marg-chart')) return;
    initCharts();
    ['fc-p0', 'fc-r', 'fc-value', 'fc-cost'].forEach(id => $(id).addEventListener('input', render));
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [p0, r, value, cost] = btn.dataset.preset.split(',').map(Number);
        $('fc-p0').value = p0; $('fc-r').value = r; $('fc-value').value = value; $('fc-cost').value = cost;
        render();
      });
    });
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    render();
  });
})();
