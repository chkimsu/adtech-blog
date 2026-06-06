// ===================================================================
// Attribution Window Playground — js/attribution-window-demo.js
// 어트리뷰션 윈도우(7/14/30/∞일)와 모델(마지막/첫/선형/위치기반)에 따라
// 같은 전환의 공로(credit)가 채널마다 어떻게 달라지는지.
// ===================================================================
(function () {
  'use strict';

  // 고정 예시 여정: day = 전환(0일) 며칠 전에 일어난 터치
  const journey = [
    { ch: 'Display', day: 20 },
    { ch: 'Search', day: 9 },
    { ch: 'Social', day: 3 },
    { ch: 'Email', day: 1 },
  ];
  const MAXD = 24;                                  // 타임라인 day 축 상한(여백 포함)
  const leftPct = day => 4 + (1 - day / MAXD) * 92; // day → 트랙 왼쪽 %(0일=오른쪽)

  const state = { window: 30, model: 'last' };
  const modelNames = { last: '마지막 터치', first: '첫 터치', linear: '선형', position: '위치 기반' };

  // 윈도우·모델별 공로 배분 (합 = 1)
  function credit(windowDays, model) {
    const tp = journey.filter(t => t.day <= windowDays).sort((a, b) => b.day - a.day); // 과거→최근
    const n = tp.length, out = {};
    tp.forEach((t, i) => {
      let w = 0;
      if (model === 'last') w = i === n - 1 ? 1 : 0;
      else if (model === 'first') w = i === 0 ? 1 : 0;
      else if (model === 'linear') w = 1 / n;
      else if (model === 'position') {
        if (n === 1) w = 1;
        else if (n === 2) w = 0.5;
        else w = (i === 0 || i === n - 1) ? 0.4 : 0.2 / (n - 2);
      }
      out[t.ch] = (out[t.ch] || 0) + w;
    });
    return out;
  }

  const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function palette() {
    return {
      text: cssVar('--text-secondary') || '#4f4a42',
      muted: cssVar('--text-muted') || '#8a8176',
      accent: cssVar('--accent-primary') || '#b0442c',
      grid: 'rgba(128,128,128,0.18)',
    };
  }

  const $ = id => document.getElementById(id);
  let creditChart;

  function buildTimeline() {
    const track = $('aw-track');
    // 전환 마커(오른쪽 끝)
    const conv = document.createElement('div');
    conv.className = 'aw-conv';
    conv.style.left = leftPct(0) + '%';
    conv.innerHTML = '<span class="aw-conv-dot">★</span><span class="aw-conv-label">전환</span>';
    track.appendChild(conv);
    // 터치포인트
    journey.forEach(t => {
      const el = document.createElement('div');
      el.className = 'aw-tp';
      el.dataset.ch = t.ch;
      el.dataset.day = t.day;
      el.style.left = leftPct(t.day) + '%';
      el.innerHTML = `<span class="aw-tp-dot"></span><span class="aw-tp-ch">${t.ch}</span><span class="aw-tp-day">D-${t.day}</span>`;
      track.appendChild(el);
    });
  }

  function initChart() {
    const p = palette();
    creditChart = new Chart($('aw-credit-chart'), {
      type: 'bar',
      data: {
        labels: journey.map(t => t.ch),
        datasets: [{ label: '공로 %', data: [], backgroundColor: p.accent, borderRadius: 4 }],
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: { duration: 220 },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.parsed.x.toFixed(0) + '%' } } },
        scales: {
          x: { min: 0, max: 100, title: { display: true, text: '공로 (%)', color: p.muted }, ticks: { color: p.muted, callback: v => v + '%' }, grid: { color: p.grid } },
          y: { ticks: { color: p.text, font: { size: 12 } }, grid: { display: false } },
        },
      },
    });
  }

  function render() {
    // 윈도우 그림자(윈도우보다 오래된 왼쪽 영역) + 경계선
    const boundary = Math.max(4, leftPct(state.window));
    $('aw-shade').style.width = (state.window >= 9999 ? 0 : boundary) + '%';
    $('aw-boundary').style.left = (state.window >= 9999 ? -10 : boundary) + '%';

    // 터치포인트 dim 처리
    document.querySelectorAll('.aw-tp').forEach(el => {
      const inWin = +el.dataset.day <= state.window;
      el.classList.toggle('out', !inWin);
    });

    // 공로 막대
    const cr = credit(state.window, state.model);
    creditChart.data.datasets[0].data = journey.map(t => +((cr[t.ch] || 0) * 100).toFixed(1));
    creditChart.update('none');

    // 버튼 active 상태
    document.querySelectorAll('[data-window]').forEach(b => b.classList.toggle('active', +b.dataset.window === state.window));
    document.querySelectorAll('[data-model]').forEach(b => b.classList.toggle('active', b.dataset.model === state.model));

    // 해석 문구
    const included = journey.filter(t => t.day <= state.window).map(t => t.ch);
    const excluded = journey.filter(t => t.day > state.window).map(t => `${t.ch}(D-${t.day})`);
    const winner = Object.entries(cr).sort((a, b) => b[1] - a[1])[0];
    const winLabel = state.window >= 9999 ? '전체 기간' : `${state.window}일`;
    let msg = `윈도우 ${winLabel} · ${modelNames[state.model]} 모델 → `;
    msg += winner ? `공로 1위 <strong>${winner[0]}</strong> (${(winner[1] * 100).toFixed(0)}%). ` : '';
    if (excluded.length) msg += `윈도우 밖이라 제외: ${excluded.join(', ')}.`;
    else msg += '모든 터치가 윈도우 안에 있습니다.';
    $('aw-verdict').innerHTML = msg;
  }

  function applyTheme() {
    if (!creditChart) return;
    const p = palette();
    creditChart.data.datasets[0].backgroundColor = p.accent;
    creditChart.options.scales.x.title.color = p.muted;
    creditChart.options.scales.x.ticks.color = p.muted;
    creditChart.options.scales.x.grid.color = p.grid;
    creditChart.options.scales.y.ticks.color = p.text;
    creditChart.update('none');
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('aw-track')) return;
    buildTimeline();
    initChart();
    document.querySelectorAll('[data-window]').forEach(b => b.addEventListener('click', () => { state.window = +b.dataset.window; render(); }));
    document.querySelectorAll('[data-model]').forEach(b => b.addEventListener('click', () => { state.model = b.dataset.model; render(); }));
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    render();
  });
})();
