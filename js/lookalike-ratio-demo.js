// ===================================================================
// Lookalike 확장 비율 놀이터 — js/lookalike-ratio-demo.js
// 회원 1,400만 명을 시드와 닮은 순서로 세운 줄에서 앞 r% 를 자른다.
// 도달은 1,400만 × r ÷ 100 이라 시드 크기와 상관이 없다.
// 정밀도와 전환율은 1% 의 값에서 비율이 오를수록 내려가는 가상 곡선이다.
// 감쇠 계수 1.0, 시드 8만 명이면 두 곡선은 두 글의 1, 5, 10% 값을 지난다.
//   전환율 3.20, 1.50, 0.90% — lookalike-basics 4절 표
//   정밀도 0.985, 0.793, 0.709 — lookalike-computation 4절 표
// ===================================================================
(function () {
  'use strict';

  const MEMBERS = 14000000;  // 회원 1,400만 명
  const RUNNERS = 1600000;   // 닮은 회원(러닝 성향) 160만 명. 세그먼트 317 과 같은 몫이고, 시드도 여기서 나온다
  const SEED0 = 80000;       // 맞춤타겟 8만 명. 이 크기에서 빠르기 배수가 1 이다
  const RMAX = 20;
  const ratios = Array.from({ length: RMAX }, (_, i) => i + 1); // 1..20 (%)

  // g(r) = r^(-a) × e^(-b (r-1)²) 는 g(1) = 1 이다. y1 × g(r) 가 5% 와 10% 의 값을 지나게 a, b 를 푼다.
  function fit(y1, y5, y10) {
    const l5 = Math.log(y1 / y5), l10 = Math.log(y1 / y10);
    const m = [[Math.log(5), 16], [Math.log(10), 81]];
    const det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
    return { y1, a: (l5 * m[1][1] - m[0][1] * l10) / det, b: (m[0][0] * l10 - m[1][0] * l5) / det };
  }
  const CVR = fit(0.032, 0.015, 0.009);   // a 0.439, b 0.00318
  const PREC = fit(0.985, 0.793, 0.709);  // a 0.1315, b 0.00032
  const ANCHOR = [1, 5, 10];

  const g = (f, r) => Math.pow(r, -f.a) * Math.exp(-f.b * (r - 1) * (r - 1));
  // 1% 의 몇 배가 남나를 s 제곱한다. s 가 1 이면 두 글의 값을 지난다.
  const curve = (f, r, s) => f.y1 * Math.pow(g(f, r), s);
  // 닮음이 옅어지는 빠르기. 시드가 절반이 될 때마다 1.1배로 둔다.
  const speed = (k, seed) => k * Math.pow(1.1, Math.log2(SEED0 / seed));

  function model(r, seed, k) {
    const s = speed(k, seed);
    const reach = MEMBERS * r / 100;
    // 시드는 줄에서 빠지므로 줄에 남은 닮은 회원은 160만 - 시드 수다. 정밀도는 그 몫을 넘지 못한다.
    const prec = Math.min(curve(PREC, r, s), (RUNNERS - seed) / reach);
    const cvr = curve(CVR, r, s);
    return { r, s, reach, prec, cvr, conv: reach * cvr };
  }
  function bestOf(seed, k) {
    let b = null;
    for (const r of ratios) {
      const m = model(r, seed, k);
      if (!b || m.conv > b.conv + 1e-6) b = m;
    }
    return b;
  }

  const num = v => Math.round(v).toLocaleString('ko-KR');
  const man = v => (v / 10000).toLocaleString('ko-KR') + '만 명';

  const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function palette() {
    return {
      muted: cssVar('--text-muted') || '#697180',
      prec: cssVar('--accent-primary') || '#1F4FA3',
      cvr: cssVar('--accent-secondary') || '#8B1E1E',
      anchor: cssVar('--text-secondary') || '#3D434D',
      surface: cssVar('--bg-secondary') || '#F5F7FA',
      grid: 'rgba(128,128,128,0.18)',
    };
  }

  const $ = id => document.getElementById(id);
  const IDS = ['lr-ratio', 'lr-seed', 'lr-k'];
  let rateChart, convChart;

  const state = () => ({ r: +$('lr-ratio').value, seed: +$('lr-seed').value, k: +$('lr-k').value });

  // 범례는 선을 선으로, 점 표시를 점으로 그린다. 점은 바탕색 테두리를 둘러서 기본 범례 상자로는 안 보인다.
  function legendLabels(chart, keep) {
    return Chart.defaults.plugins.legend.labels.generateLabels(chart)
      .filter(it => keep.includes(it.datasetIndex))
      .sort((a, b) => a.datasetIndex - b.datasetIndex)
      .map(it => {
        const ds = chart.data.datasets[it.datasetIndex];
        if (ds.showLine === false) {
          const hollow = ds.backgroundColor === 'transparent';
          it.pointStyle = 'circle';
          it.fillStyle = hollow ? 'transparent' : ds.backgroundColor;
          it.strokeStyle = hollow ? ds.borderColor : ds.backgroundColor;
        } else {
          it.pointStyle = 'line';
          it.strokeStyle = ds.borderColor;
        }
        return it;
      });
  }

  // legendKeep 은 범례에 둘 데이터셋, tipKeep 은 말풍선에 둘 데이터셋이다. 점 표시는 선과 값이 같아 말풍선에서 뺀다.
  function scaleOpts(yTitle, yTick, legendKeep, tipKeep, tipLabel) {
    const p = palette();
    return {
      responsive: true, maintainAspectRatio: false, animation: { duration: 180 },
      interaction: { mode: 'nearest', axis: 'x', intersect: false },
      plugins: {
        legend: { display: true, labels: { color: p.muted, usePointStyle: true, generateLabels: chart => legendLabels(chart, legendKeep) } },
        tooltip: {
          filter: it => tipKeep.includes(it.datasetIndex),
          callbacks: { title: items => (items.length ? '확장 비율 ' + items[0].raw.x + '%' : ''), label: tipLabel },
        },
      },
      scales: {
        x: {
          type: 'linear', min: 1, max: RMAX,
          title: { display: true, text: '확장 비율 (%)', color: p.muted },
          // 눈금은 두 글의 세 점과 끝 둘에만 둔다.
          afterBuildTicks: axis => { axis.ticks = [1, 5, 10, 15, 20].map(value => ({ value })); },
          ticks: { color: p.muted, callback: v => v + '%' },
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

  // order 가 작을수록 위에 그려진다. 선을 맨 아래에, 지금 고른 비율의 고리를 맨 위에 둔다.
  function line(label, color, dash) {
    return { label, data: [], borderColor: color, backgroundColor: 'transparent', borderWidth: 2, borderDash: dash || [], pointRadius: 0, pointHoverRadius: 4, tension: 0.2, order: 2 };
  }
  function dot(label, color, ring, radius) {
    return { label, data: [], borderColor: ring, backgroundColor: color, borderWidth: 2, pointRadius: radius || 6, pointHoverRadius: (radius || 6) + 2, showLine: false, order: 1 };
  }
  function hollow(label, color) {
    return { label, data: [], borderColor: color, backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 5, pointHoverRadius: 7, showLine: false, order: 1 };
  }
  function ring(label, color) {
    return { label, data: [], borderColor: color, backgroundColor: 'transparent', borderWidth: 2.5, pointRadius: 10, pointHoverRadius: 11, showLine: false, order: 0 };
  }

  function rateTip(ctx) {
    const d = ctx.raw;
    if (ctx.datasetIndex === 4) return `${d.name}: ${d.text}`;
    const name = ctx.datasetIndex % 2 === 0 ? '정밀도' : '전환율';
    return `${name} ${d.text} (1% 의 ${d.y.toFixed(2)}배)`;
  }
  function convTip(ctx) {
    const d = ctx.raw;
    return `${ctx.dataset.label} ${num(d.y)}건`;
  }

  function initCharts() {
    const p = palette();
    rateChart = new Chart($('lr-rate-chart'), {
      type: 'line',
      data: {
        datasets: [
          line('정밀도', p.prec), line('전환율', p.cvr, [6, 4]),
          dot('지금 정밀도', p.prec, p.surface), dot('지금 전환율', p.cvr, p.surface),
          hollow('두 글의 값', p.anchor),
        ],
      },
      options: scaleOpts('1% 를 1 로 둔 값', v => v.toFixed(1), [0, 1, 4], [0, 1, 4], rateTip),
    });
    convChart = new Chart($('lr-conv-chart'), {
      type: 'line',
      data: {
        datasets: [
          line('예상 전환 수', p.prec),
          dot('가장 많은 비율', p.cvr, p.surface, 7),
          ring('지금 고른 비율', p.prec),
        ],
      },
      options: scaleOpts('예상 전환 수 (건)', v => v.toLocaleString('ko-KR'), [0, 1, 2], [0], convTip),
    });
  }

  function render() {
    const st = state();
    const cur = model(st.r, st.seed, st.k);
    const best = bestOf(st.seed, st.k);

    $('lr-ratio-val').textContent = st.r + '%';
    $('lr-seed-val').textContent = man(st.seed);
    $('lr-k-val').textContent = st.k.toFixed(1);
    $('lr-s').textContent = cur.s.toFixed(2);
    $('lr-s-seed').textContent = (cur.s / st.k).toFixed(2);

    // 지표 넷
    $('lr-reach').textContent = man(cur.reach);
    $('lr-reach-sub').textContent = `회원 1,400만 명의 ${st.r}%, 시드 크기와 상관없음`;
    $('lr-prec').textContent = cur.prec.toFixed(3);
    $('lr-prec-sub').textContent = `시드와 닮은 회원의 몫, 1% 의 ${(cur.prec / PREC.y1).toFixed(2)}배`;
    $('lr-cvr').textContent = (cur.cvr * 100).toFixed(2) + '%';
    $('lr-cvr-sub').textContent = `전환 하나에 ${num(1 / cur.cvr)}명`;
    $('lr-conv').textContent = num(cur.conv) + '건';
    $('lr-conv').className = 'lr-metric-value' + (cur.r === best.r ? ' good' : '');
    $('lr-conv-sub').textContent = '도달 × 전환율';

    // 차트 — 비율 1..20 을 훑는다
    const rows = ratios.map(r => model(r, st.seed, st.k));
    const rate = (m, key) => ({ x: m.r, y: m[key] / (key === 'prec' ? PREC.y1 : CVR.y1), text: key === 'prec' ? m.prec.toFixed(3) : (m.cvr * 100).toFixed(2) + '%' });
    rateChart.data.datasets[0].data = rows.map(m => rate(m, 'prec'));
    rateChart.data.datasets[1].data = rows.map(m => rate(m, 'cvr'));
    rateChart.data.datasets[2].data = [rate(cur, 'prec')];
    rateChart.data.datasets[3].data = [rate(cur, 'cvr')];
    rateChart.data.datasets[4].data = ANCHOR.flatMap(r => [
      { x: r, y: model(r, SEED0, 1).prec / PREC.y1, name: 'Lookalike 계산 편의 정밀도', text: model(r, SEED0, 1).prec.toFixed(3) },
      { x: r, y: model(r, SEED0, 1).cvr / CVR.y1, name: 'Lookalike 기초 편의 전환율', text: (model(r, SEED0, 1).cvr * 100).toFixed(2) + '%' },
    ]);
    convChart.data.datasets[0].data = rows.map(m => ({ x: m.r, y: m.conv }));
    convChart.data.datasets[1].data = [{ x: best.r, y: best.conv }];
    convChart.data.datasets[2].data = [{ x: cur.r, y: cur.conv }];
    rateChart.update('none');
    convChart.update('none');

    // 한 줄 판정
    let verdict = `전환 수가 가장 많은 비율은 ${best.r}% 입니다.`;
    if (cur.r === best.r) {
      verdict += ` 지금 고른 비율이 그 자리이고, 예상 전환은 ${num(best.conv)}건입니다.`;
    } else {
      verdict += ` ${best.r}% 는 ${num(best.conv)}건이고, 지금 고른 ${cur.r}% 는 ${num(cur.conv)}건으로 ${num(best.conv - cur.conv)}건 적습니다.`;
    }
    if (best.r === RMAX) verdict += ` ${RMAX}% 까지 넓혀도 전환 수가 계속 늘어납니다.`;
    else if (best.r === 1) verdict += ' 1% 를 넘기면 전환 수가 바로 줄어듭니다.';
    $('lr-verdict').textContent = verdict;
  }

  function applyTheme() {
    const p = palette();
    [rateChart, convChart].forEach(ch => {
      if (!ch) return;
      ch.options.plugins.legend.labels.color = p.muted;
      ['x', 'y'].forEach(ax => {
        ch.options.scales[ax].title.color = p.muted;
        ch.options.scales[ax].ticks.color = p.muted;
        if (ch.options.scales[ax].grid.color) ch.options.scales[ax].grid.color = p.grid;
      });
    });
    const r = rateChart.data.datasets, c = convChart.data.datasets;
    r[0].borderColor = p.prec; r[1].borderColor = p.cvr;
    r[2].backgroundColor = p.prec; r[2].borderColor = p.surface;
    r[3].backgroundColor = p.cvr; r[3].borderColor = p.surface;
    r[4].borderColor = p.anchor;
    c[0].borderColor = p.prec;
    c[1].backgroundColor = p.cvr; c[1].borderColor = p.surface;
    c[2].borderColor = p.prec;
    rateChart.update('none');
    convChart.update('none');
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('lr-rate-chart') || typeof Chart === 'undefined') return;
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
