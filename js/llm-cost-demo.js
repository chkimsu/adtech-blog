// ===================================================================
// LLM 비용 놀이터 — js/llm-cost-demo.js
// 요청 한 건의 값은 llm-model-selection 편의 cost_won 과 같은 식으로 센다.
//   cost = ((N_in - N_cache) × p_in + 0.1 × N_cache × p_in + N_out × p_out) ÷ 10^6
// N_in 은 시스템 + 사용자 토큰, N_cache 는 시스템 토큰 × 캐시 적중 비율이다.
// 단가는 100만 토큰당 원이고, 두 모델 모두 설명을 위한 가상 값이다.
// 기본값(시스템 1,000, 사용자 200, 출력 150, 하루 100만)에서 하루 값은
//   작은 모델 캐시 0% 720,000원, 큰 모델 캐시 0% 7,800,000원, 큰 모델 캐시 100% 4,200,000원이다.
// ===================================================================
(function () {
  'use strict';

  const MODELS = {
    small: { name: '작은 모델', pin: 400, pout: 1600 },
    large: { name: '큰 모델', pin: 4000, pout: 20000 },
  };
  const CACHE_RATE = 0.1;  // 캐시에서 읽은 토큰은 입력 단가의 0.1배
  const DAYS = 30;         // 한 달은 30일로 센다
  // 하루 요청 수 슬라이더의 열 칸. 1만에서 1,000만까지 1, 2, 5 배씩 오른다.
  const DAILY = [10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000];

  // cost_won 을 그대로 옮긴다. in_tokens 는 캐시에서 읽은 토큰까지 센 입력 토큰 전부다.
  function costWon(inTokens, outTokens, pin, pout, cachedTokens) {
    const fresh = inTokens - cachedTokens;
    return (fresh * pin + cachedTokens * pin * CACHE_RATE + outTokens * pout) / 1000000;
  }

  // 놀이터의 한 상태를 센다. 하루 값은 글의 블록처럼 토큰에 하루 요청 수를 먼저 곱하고 반올림한다.
  function model(st) {
    const m = MODELS[st.model];
    const cached = Math.floor(st.system * st.cache / 100);
    const inTok = st.system + st.user;
    const one = costWon(inTok, st.out, m.pin, m.pout, cached);
    const day = Math.round(costWon(inTok * st.daily, st.out * st.daily, m.pin, m.pout, cached * st.daily));
    const dayNoCache = Math.round(costWon(inTok * st.daily, st.out * st.daily, m.pin, m.pout, 0));
    const parts = {
      sysFresh: (st.system - cached) * m.pin / 1000000,
      sysCached: cached * m.pin * CACHE_RATE / 1000000,
      user: st.user * m.pin / 1000000,
      out: st.out * m.pout / 1000000,
    };
    return { m, cached, one, day, month: day * DAYS, saved: dayNoCache - day, dayNoCache, parts,
      outDay: Math.round(st.out * st.daily * m.pout / 1000000) };
  }

  const num = v => Math.round(v).toLocaleString('ko-KR');
  const won = v => num(v) + '원';
  const won2 = v => v.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '원';
  const count = v => v >= 10000 ? (v / 10000).toLocaleString('ko-KR') + '만' : v.toLocaleString('ko-KR');
  const pct = (a, b) => (b > 0 ? Math.round(a / b * 100) : 0) + '%';

  const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function palette() {
    return {
      muted: cssVar('--text-muted') || '#697180',
      input: cssVar('--accent-primary') || '#1F4FA3',
      output: cssVar('--accent-secondary') || '#8B1E1E',
      cached: cssVar('--series-3') || '#5C6470',
      user: cssVar('--series-4') || '#4A72B5',
      surface: cssVar('--bg-secondary') || '#F5F7FA',
      grid: 'rgba(128,128,128,0.18)',
    };
  }

  const $ = id => document.getElementById(id);
  const IDS = ['lc-system', 'lc-user', 'lc-out', 'lc-cache', 'lc-daily'];
  let currentModel = 'large';
  let cacheChart, partChart;

  const state = () => ({
    model: currentModel,
    system: +$('lc-system').value,
    user: +$('lc-user').value,
    out: +$('lc-out').value,
    cache: +$('lc-cache').value,
    daily: DAILY[+$('lc-daily').value],
  });

  function setModel(key) {
    currentModel = key;
    document.querySelectorAll('.lc-model-btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.model === key)));
  }

  function initCharts() {
    const p = palette();
    const common = {
      responsive: true, maintainAspectRatio: false, animation: { duration: 180 },
      plugins: { legend: { display: true, labels: { color: p.muted, usePointStyle: true } } },
    };
    cacheChart = new Chart($('lc-cache-chart'), {
      type: 'line',
      data: {
        datasets: [
          { label: '하루 값', data: [], borderColor: p.input, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, order: 2 },
          { label: '출력의 하루 값', data: [], borderColor: p.output, backgroundColor: 'transparent', borderWidth: 2, borderDash: [6, 4], pointRadius: 0, pointHoverRadius: 0, order: 2 },
          { label: '지금 고른 비율', data: [], borderColor: p.input, backgroundColor: 'transparent', borderWidth: 2.5, pointRadius: 9, pointHoverRadius: 10, showLine: false, order: 0 },
        ],
      },
      options: Object.assign({}, common, {
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        plugins: Object.assign({}, common.plugins, {
          tooltip: {
            filter: it => it.datasetIndex !== 2,
            callbacks: { title: items => (items.length ? '캐시 적중 ' + items[0].raw.x + '%' : ''), label: ctx => `${ctx.dataset.label} ${won(ctx.raw.y)}` },
          },
        }),
        scales: {
          x: { type: 'linear', min: 0, max: 100, title: { display: true, text: '캐시 적중 비율 (%)', color: p.muted },
            ticks: { color: p.muted, stepSize: 25, callback: v => v + '%' }, grid: { display: false } },
          y: { beginAtZero: true, title: { display: true, text: '하루 값 (원)', color: p.muted },
            ticks: { color: p.muted, callback: v => v >= 10000 ? (v / 10000).toLocaleString('ko-KR') + '만' : v }, grid: { color: p.grid } },
        },
      }),
    });
    partChart = new Chart($('lc-part-chart'), {
      type: 'bar',
      data: {
        labels: ['요청 한 건'],
        datasets: [
          { label: '시스템, 새로 읽음', data: [0], backgroundColor: p.input },
          { label: '시스템, 캐시에서 읽음', data: [0], backgroundColor: p.cached },
          { label: '사용자', data: [0], backgroundColor: p.user },
          { label: '출력', data: [0], backgroundColor: p.output },
        ],
      },
      // 막대는 애니메이션을 끈다. 처음 그리는 애니메이션이 도는 동안 update('none') 의 값이 막대에 들어가지 않는다.
      options: Object.assign({}, common, {
        animation: false,
        indexAxis: 'y',
        plugins: Object.assign({}, common.plugins, {
          legend: { display: true, labels: { color: p.muted } },
          tooltip: { callbacks: { label: ctx => `${ctx.dataset.label} ${won2(ctx.raw)}` } },
        }),
        scales: {
          x: { stacked: true, beginAtZero: true, title: { display: true, text: '한 건의 값 (원)', color: p.muted },
            ticks: { color: p.muted, callback: v => v.toLocaleString('ko-KR') }, grid: { color: p.grid } },
          y: { stacked: true, ticks: { color: p.muted }, grid: { display: false } },
        },
      }),
    });
  }

  function render() {
    const st = state();
    const r = model(st);

    $('lc-system-val').textContent = num(st.system);
    $('lc-user-val').textContent = num(st.user);
    $('lc-out-val').textContent = num(st.out);
    $('lc-cache-val').textContent = st.cache + '%';
    $('lc-daily-val').textContent = count(st.daily);
    $('lc-daily').setAttribute('aria-valuetext', count(st.daily));   // 화면 읽기가 위치 번호 대신 표시 글자를 읽게 한다

    // 지표 넷
    const inPart = r.parts.sysFresh + r.parts.sysCached + r.parts.user;
    $('lc-one').textContent = won2(r.one);
    $('lc-one-sub').textContent = `입력 ${won2(inPart)}, 출력 ${won2(r.parts.out)}`;
    $('lc-day').textContent = won(r.day);
    $('lc-day-sub').textContent = `한 건 × 하루 ${count(st.daily)}건, ${r.m.name}`;
    $('lc-month').textContent = won(r.month);
    $('lc-month-sub').textContent = `하루 × ${DAYS}일`;
    $('lc-saved').textContent = won(r.saved);
    $('lc-saved').className = 'lc-metric-value' + (r.saved > 0 ? ' good' : '');
    $('lc-saved-sub').textContent = `캐시 0% 의 ${won(r.dayNoCache)}에서 ${pct(r.saved, r.dayNoCache)}`;

    // 차트 — 캐시 적중 비율 0..100 을 순회한다
    const rows = [];
    for (let c = 0; c <= 100; c += 5) rows.push({ x: c, y: model(Object.assign({}, st, { cache: c })).day });
    cacheChart.data.datasets[0].data = rows;
    cacheChart.data.datasets[1].data = [{ x: 0, y: r.outDay }, { x: 100, y: r.outDay }];
    cacheChart.data.datasets[2].data = [{ x: st.cache, y: r.day }];
    const pv = r.parts;
    [pv.sysFresh, pv.sysCached, pv.user, pv.out].forEach((v, i) => { partChart.data.datasets[i].data = [v]; });
    cacheChart.update('none');
    partChart.update('none');

    // 한 줄 판정
    let verdict = `캐시가 하루 ${won(r.saved)}을 깎습니다.`;
    if (st.cache === 0 || st.system === 0) {
      verdict += ' 캐시에서 읽는 시스템 토큰이 없어 하루 값이 그대로입니다.';
    } else {
      verdict += ` 하루 ${won(r.dayNoCache)}이 ${won(r.day)}이 되어 원래의 ${pct(r.day, r.dayNoCache)} 입니다.`;
    }
    if (r.day > 0) verdict += ` 출력이 하루 값의 ${pct(r.outDay, r.day)} 입니다.`;
    $('lc-verdict').textContent = verdict;
  }

  function applyTheme() {
    const p = palette();
    [cacheChart, partChart].forEach(ch => {
      if (!ch) return;
      ch.options.plugins.legend.labels.color = p.muted;
      ['x', 'y'].forEach(ax => {
        if (ch.options.scales[ax].title) ch.options.scales[ax].title.color = p.muted;
        ch.options.scales[ax].ticks.color = p.muted;
        if (ch.options.scales[ax].grid.color) ch.options.scales[ax].grid.color = p.grid;
      });
    });
    const c = cacheChart.data.datasets, b = partChart.data.datasets;
    c[0].borderColor = p.input; c[1].borderColor = p.output; c[2].borderColor = p.input;
    b[0].backgroundColor = p.input; b[1].backgroundColor = p.cached; b[2].backgroundColor = p.user; b[3].backgroundColor = p.output;
    cacheChart.update('none');
    partChart.update('none');
  }

  // node 에서 기본값 셋을 다시 셀 수 있게 셈만 내놓는다.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { costWon, model, MODELS, DAILY };
    return;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('lc-cache-chart') || typeof Chart === 'undefined') return;
    initCharts();
    IDS.forEach(id => $(id).addEventListener('input', render));
    document.querySelectorAll('.lc-model-btn').forEach(btn => {
      btn.addEventListener('click', () => { setModel(btn.dataset.model); render(); });
    });
    // 프리셋은 값을 바꾼 뒤 슬라이더마다 input 을 보낸다.
    // detail.preset 은 해설 패널이 설명을 쓰지 않고 이전 값만 갱신하라는 표시다. 프리셋 해설은 버튼 클릭 규칙이 한 번 쓴다.
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.preset.split(',');
        setModel(v[0]);
        IDS.forEach((id, i) => { $(id).value = Number(v[i + 1]); });
        IDS.forEach(id => $(id).dispatchEvent(new CustomEvent('input', { bubbles: true, detail: { preset: true } })));
        render();
      });
    });
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    render();
  });
})();
