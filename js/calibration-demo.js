// ===================================================================
// Calibration Explorer — js/calibration-demo.js
// 모델이 순위는 잘 매겨도(AUC 높아도) 출력 확률이 실제와 어긋나면(miscalibration)
// 입찰가(= 예측확률 × 가치)가 왜곡된다. 신뢰도 곡선 + 입찰 왜곡 + ECE를 슬라이더로.
// ===================================================================
(function () {
  'use strict';

  const V = 10;            // 전환 1건의 가치(추상 단위). 입찰가 = 확률 × V
  const N = 21;            // 곡선 해상도 (예측확률 0..1 을 20등분)
  const xs = Array.from({ length: N }, (_, i) => i / (N - 1));

  const clampP = p => Math.min(0.999, Math.max(0.001, p));
  const logit = p => Math.log(clampP(p) / (1 - clampP(p)));
  const sigmoid = z => 1 / (1 + Math.exp(-z));

  // 모델 왜곡 모델:  logit(예측) = slope · logit(실제) + bias
  // → 모델이 '예측확률 pPred'를 냈을 때 그 점의 '실제확률'을 역산
  const actualOf = (pPred, slope, bias) => sigmoid((logit(pPred) - bias) / slope);

  // 기대 보정오차(ECE): 균일 bin 가정 → 평균 |예측 − 실제|
  function ece(slope, bias) {
    let s = 0;
    for (const x of xs) s += Math.abs(x - actualOf(x, slope, bias));
    return s / xs.length;
  }

  // ---- 테마 토큰 (라이트/다크 모두 어울리게 CSS 변수에서 읽음) ----
  const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function palette() {
    return {
      text: cssVar('--text-secondary') || '#4f4a42',
      muted: cssVar('--text-muted') || '#8a8176',
      accent: cssVar('--accent-primary') || '#b0442c',
      accent2: cssVar('--accent-secondary') || '#8a6a3a',
      grid: 'rgba(128,128,128,0.18)',
    };
  }

  const $ = id => document.getElementById(id);
  let relChart, bidChart;

  function scaleOpts(xTitle, yTitle, yMax) {
    const p = palette();
    const y = { title: { display: true, text: yTitle, color: p.muted }, ticks: { color: p.muted }, grid: { color: p.grid } };
    if (yMax != null) { y.min = 0; y.max = yMax; }
    return {
      responsive: true, maintainAspectRatio: false, animation: { duration: 180 },
      plugins: { legend: { labels: { color: p.text, font: { size: 11 }, boxWidth: 18 } } },
      scales: {
        x: { title: { display: true, text: xTitle, color: p.muted }, ticks: { color: p.muted, maxTicksLimit: 6 }, grid: { color: p.grid } },
        y,
      },
    };
  }

  function initCharts() {
    const p = palette();
    const labels = xs.map(x => x.toFixed(2));

    relChart = new Chart($('cal-rel-chart'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: '완벽 보정 (y = x)', data: xs.slice(), borderColor: p.muted, borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0 },
          { label: '현재 모델', data: [], borderColor: p.accent, backgroundColor: 'transparent', borderWidth: 2.5, pointRadius: 0, tension: 0.15 },
        ],
      },
      options: scaleOpts('예측 확률 (모델 출력)', '실제 확률', 1),
    });

    bidChart = new Chart($('cal-bid-chart'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: '모델 입찰 (예측 × 가치)', data: [], borderColor: p.accent, borderWidth: 2.5, pointRadius: 0, tension: 0.15 },
          { label: '적정 입찰 (실제 × 가치)', data: [], borderColor: p.accent2, borderDash: [5, 4], borderWidth: 2, pointRadius: 0, tension: 0.15 },
        ],
      },
      options: scaleOpts('예측 확률 (모델 출력)', '입찰가 ($)', null),
    });
  }

  function fmtPct(x) { return (x * 100).toFixed(1) + '%'; }
  function signed(x) { return (x >= 0 ? '+' : '') + x.toFixed(1) + '%'; }

  function render() {
    const slope = +$('cal-slope').value;
    const bias = +$('cal-bias').value;
    $('cal-slope-val').textContent = slope.toFixed(2);
    $('cal-bias-val').textContent = (bias >= 0 ? '+' : '') + bias.toFixed(2);

    const actualCurve = xs.map(x => actualOf(x, slope, bias));

    // 신뢰도 곡선 갱신
    relChart.data.datasets[1].data = actualCurve;
    relChart.update('none');

    // 입찰 왜곡 곡선 갱신
    bidChart.data.datasets[0].data = xs.map(x => +(x * V).toFixed(3));
    bidChart.data.datasets[1].data = actualCurve.map(a => +(a * V).toFixed(3));
    bidChart.update('none');

    // 요약 지표
    const e = ece(slope, bias);
    $('cal-ece').textContent = (e * 100).toFixed(1) + '%p';
    $('cal-ece').className = 'cal-metric-value ' + (e < 0.02 ? 'good' : e < 0.08 ? 'warn' : 'bad');

    const distort = pPred => {
      const a = actualOf(pPred, slope, bias);
      return (pPred - a) / a * 100;            // 양수=과입찰, 음수=과소입찰
    };
    const d90 = distort(0.9), d10 = distort(0.1);
    const setDistort = (elId, d) => {
      const el = $(elId);
      el.textContent = signed(d);
      el.className = 'cal-metric-value ' + (Math.abs(d) < 5 ? 'good' : d > 0 ? 'bad' : 'warn');
    };
    setDistort('cal-d90', d90);
    setDistort('cal-d10', d10);

    // 한 줄 해석
    let verdict;
    if (e < 0.02) verdict = '거의 완벽하게 보정됨 — 예측 확률을 그대로 입찰에 써도 안전합니다.';
    else if (slope > 1.05 && Math.abs(bias) < 0.1) verdict = '과신(overconfident): 높은 pCTR 구간에서 과대입찰, 낮은 구간에서 과소입찰 — 비싼 트래픽에 돈을 더 씁니다.';
    else if (slope < 0.95 && Math.abs(bias) < 0.1) verdict = '과소(underconfident): 좋은 트래픽에 과소입찰해 기회를 놓치고, 나쁜 트래픽엔 과대입찰합니다.';
    else if (bias > 0.1) verdict = '전반적 과대예측: 모든 구간에서 실제보다 높게 봐 입찰가가 부풀려집니다(과지출).';
    else if (bias < -0.1) verdict = '전반적 과소예측: 모든 구간에서 보수적으로 입찰해 노출/전환을 놓칩니다.';
    else verdict = '약한 miscalibration — AUC는 그대로지만 입찰가가 조금씩 어긋납니다.';
    $('cal-verdict').textContent = verdict;
  }

  // 테마 토글 시 차트 색 갱신
  function applyTheme() {
    const p = palette();
    [relChart, bidChart].forEach(ch => {
      if (!ch) return;
      ch.options.plugins.legend.labels.color = p.text;
      ['x', 'y'].forEach(ax => {
        ch.options.scales[ax].title.color = p.muted;
        ch.options.scales[ax].ticks.color = p.muted;
        ch.options.scales[ax].grid.color = p.grid;
      });
    });
    relChart.data.datasets[0].borderColor = p.muted;
    relChart.data.datasets[1].borderColor = p.accent;
    bidChart.data.datasets[0].borderColor = p.accent;
    bidChart.data.datasets[1].borderColor = p.accent2;
    relChart.update('none');
    bidChart.update('none');
  }

  function setPreset(slope, bias) {
    $('cal-slope').value = slope;
    $('cal-bias').value = bias;
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('cal-rel-chart')) return;
    initCharts();
    ['cal-slope', 'cal-bias'].forEach(id => $(id).addEventListener('input', render));
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [s, b] = btn.dataset.preset.split(',').map(Number);
        setPreset(s, b);
      });
    });
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    render();
  });
})();
