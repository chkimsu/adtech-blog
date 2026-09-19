// ===================================================================
// 카나리 배포 놀이터 — js/canary-demo.js
// 새 모델을 트래픽 1퍼센트부터 넓힌다. 단계마다 5분 창에 모이는 요청과 클릭이 다르고,
// 클릭이 적으면 COPC 가 우연으로 흔들려 읽을 수가 없다. 게이트 넷 중 하나라도 닫히면 되돌린다.
// 숫자는 전부 모델 운영 트랙의 가상 값이다 — 요청 초당 2,639건, 클릭률 1%,
// 게이트는 8ms 초과율 6% 이하, 오류율 0.1% 이하, COPC 0.95~1.05, 클릭률 차이 -2% 이상.
// ===================================================================
(function () {
  'use strict';

  const QPS = 2639;          // 초당 요청 (엔지니어링 트랙의 값)
  const CTR = 0.01;          // 클릭률
  const WINDOW_SEC = 300;    // 판정 창 5분
  const GATE = {
    over: 6.0,               // 8ms 초과율 상한 (%)
    err: 0.1,                // 오류율 상한 (%)
    copcLo: 0.95, copcHi: 1.05,
    ctrDiff: -2.0,           // 클릭률 차이 하한 (%)
  };
  const COPC_HALF = 0.05;    // 게이트 폭의 절반. 흔들림이 이보다 크면 못 읽는다
  // 단계 — 비율(%), 머무는 시간(분), 파드 수
  const STAGES = [
    { share: 1, min: 5, pods: 2 },
    { share: 10, min: 30, pods: 2 },
    { share: 50, min: 30, pods: 6 },
    { share: 100, min: 0, pods: 12 },
  ];

  const $ = id => document.getElementById(id);
  const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const fmt = n => Math.round(n).toLocaleString('en-US');

  function palette() {
    return {
      text: cssVar('--text-secondary') || '#3d434d',
      muted: cssVar('--text-muted') || '#697180',
      accent: cssVar('--accent-primary') || '#1f4fa3',
      bad: cssVar('--state-bad') || '#8b1e1e',
      good: cssVar('--state-good') || '#1f4fa3',
      faint: cssVar('--bg-tertiary') || '#eceff4',
      grid: 'rgba(128,128,128,0.18)',
    };
  }

  let share = 1;
  let stageChart, gateChart;

  // 이 단계의 5분 창에 모이는 요청과 클릭, 그리고 COPC 가 우연으로 흔들리는 폭
  function windowStats(sharePct) {
    const req = QPS * (sharePct / 100) * WINDOW_SEC;
    const clicks = req * CTR;
    const band = clicks > 0 ? 2 / Math.sqrt(clicks) : Infinity;
    return { req, clicks, band, readable: band <= COPC_HALF };
  }

  // 게이트 넷을 판정한다. ratio 는 문턱 대비 비율 — 1.0 을 넘으면 닫힌다
  function judge(vals, readable) {
    const copcDev = Math.abs(vals.copc - 1);
    return [
      { name: '8ms 초과율', cond: `${GATE.over}% 이하`, shown: vals.over.toFixed(2) + '%',
        ratio: vals.over / GATE.over, state: vals.over <= GATE.over ? 'pass' : 'fail' },
      { name: '오류율', cond: `${GATE.err}% 이하`, shown: vals.err.toFixed(2) + '%',
        ratio: vals.err / GATE.err, state: vals.err <= GATE.err ? 'pass' : 'fail' },
      { name: 'COPC (실제 ÷ 예측)', cond: `${GATE.copcLo} ~ ${GATE.copcHi}`,
        shown: readable ? vals.copc.toFixed(2) : `${vals.copc.toFixed(2)} (클릭 부족)`,
        ratio: readable ? copcDev / COPC_HALF : null,
        state: !readable ? 'skip' : (copcDev <= COPC_HALF ? 'pass' : 'fail') },
      { name: '클릭률 차이 (새 − 옛)', cond: `${GATE.ctrDiff}% 이상`,
        shown: (vals.ctr >= 0 ? '+' : '') + vals.ctr.toFixed(1) + '%',
        ratio: readable ? Math.max(0, -vals.ctr) / Math.abs(GATE.ctrDiff) : null,
        state: !readable ? 'skip' : (vals.ctr >= GATE.ctrDiff ? 'pass' : 'fail') },
    ];
  }

  function initCharts() {
    const p = palette();
    stageChart = new Chart($('cn-stage-chart'), {
      type: 'bar',
      data: {
        labels: STAGES.map(s => s.share + '%'),
        datasets: [{ label: '머무는 시간(분)', data: [], backgroundColor: [], borderColor: p.accent, borderWidth: 1.5 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 180 },
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: '트래픽 비율', color: p.muted }, ticks: { color: p.muted }, grid: { display: false } },
          y: { title: { display: true, text: '머무는 시간 (분)', color: p.muted }, ticks: { color: p.muted }, grid: { color: p.grid }, beginAtZero: true },
        },
      },
    });
    gateChart = new Chart($('cn-gate-chart'), {
      type: 'bar',
      data: {
        labels: ['초과율', '오류율', 'COPC', '클릭률 차이'],
        datasets: [{ label: '문턱 대비', data: [], backgroundColor: [], borderColor: p.accent, borderWidth: 1.5 }],
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false, animation: { duration: 180 },
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: '문턱 = 1.0', color: p.muted }, ticks: { color: p.muted }, grid: { color: p.grid }, beginAtZero: true, suggestedMax: 1.6 },
          y: { ticks: { color: p.muted }, grid: { display: false } },
        },
      },
    });
  }

  function render() {
    const p = palette();
    const vals = {
      over: +$('cn-over').value,
      err: +$('cn-err').value,
      copc: +$('cn-copc').value,
      ctr: +$('cn-ctr').value,
    };
    $('cn-over-val').textContent = vals.over.toFixed(2) + '%';
    $('cn-err-val').textContent = vals.err.toFixed(2) + '%';
    $('cn-copc-val').textContent = vals.copc.toFixed(2);
    $('cn-ctr-val').textContent = (vals.ctr >= 0 ? '+' : '') + vals.ctr.toFixed(1) + '%';

    const st = windowStats(share);
    const rows = judge(vals, st.readable);

    // 지표 카드
    $('cn-req').textContent = fmt(st.req) + '건';
    $('cn-req-sub').textContent = share + '% 를 5분 동안';
    $('cn-clicks').textContent = fmt(st.clicks) + '건';
    $('cn-clicks-sub').textContent = st.readable ? 'COPC 를 읽기에 넉넉합니다' : 'COPC 를 읽기에 모자랍니다';
    $('cn-clicks').className = 'cn-metric-value ' + (st.readable ? 'good' : 'warn');
    $('cn-band').textContent = '±' + st.band.toFixed(3);
    $('cn-band-sub').textContent = st.readable ? '게이트 폭 0.05 안입니다' : '게이트 폭 0.05 보다 넓습니다';
    $('cn-band').className = 'cn-metric-value ' + (st.readable ? 'good' : 'warn');

    // 게이트 표
    $('cn-gate-rows').innerHTML = rows.map(r => {
      const label = r.state === 'pass' ? '통과' : r.state === 'fail' ? '탈락' : '판정 안 함';
      return `<tr><td><b>${r.name}</b></td><td>${r.cond}</td><td class="num">${r.shown}</td>` +
        `<td><span class="cn-flag ${r.state}">${label}</span></td></tr>`;
    }).join('');

    // 판정 한 줄
    const failed = rows.filter(r => r.state === 'fail');
    const v = $('cn-verdict');
    if (failed.length) {
      v.className = 'cn-verdict is-bad';
      v.innerHTML = `게이트 <b>${failed.map(r => r.name).join(', ')}</b> 가 닫혔습니다. 넓히지 않고 <b>가중치를 0 으로 되돌립니다.</b> ` +
        `되돌리는 데 드는 시간은 1분이고, 그때까지 새 모델이 답한 요청은 ${fmt(st.req)}건입니다.`;
    } else if (share === 100) {
      v.className = 'cn-verdict';
      v.innerHTML = '게이트 넷이 다 열렸고 <b>100% 입니다.</b> 옛 파드는 30분 더 띄워 둡니다. 그래야 문제가 늦게 드러나도 초 단위로 돌아갑니다.';
    } else {
      const next = STAGES[STAGES.findIndex(s => s.share === share) + 1];
      v.className = 'cn-verdict';
      v.innerHTML = `게이트 넷이 다 열렸습니다. <b>${next.share}% 로 넓힙니다.</b> ` +
        (st.readable ? '이 단계에서 COPC 까지 읽었으니 모델 품질도 본 것입니다.' : '다만 이 단계는 클릭이 모자라 서버가 멀쩡한가만 본 것입니다.');
    }

    // 차트 1 — 단계별 시간
    stageChart.data.datasets[0].data = STAGES.map(s => s.min);
    stageChart.data.datasets[0].backgroundColor = STAGES.map(s => s.share === share ? p.accent : p.faint);
    stageChart.update('none');

    // 차트 2 — 문턱 대비
    gateChart.data.datasets[0].data = rows.map(r => r.ratio === null ? 0 : +r.ratio.toFixed(3));
    gateChart.data.datasets[0].backgroundColor = rows.map(r => r.state === 'fail' ? p.bad : r.state === 'skip' ? p.faint : p.accent);
    gateChart.update('none');
  }

  function applyTheme() {
    const p = palette();
    [stageChart, gateChart].forEach(ch => {
      if (!ch) return;
      ['x', 'y'].forEach(ax => {
        const sc = ch.options.scales[ax];
        if (sc.title) sc.title.color = p.muted;
        sc.ticks.color = p.muted;
        if (sc.grid && sc.grid.color) sc.grid.color = p.grid;
      });
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('cn-stage-chart')) return;
    initCharts();

    document.querySelectorAll('.cn-stage-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.cn-stage-btn').forEach(x => x.classList.remove('is-on'));
        b.classList.add('is-on');
        share = +b.dataset.share;
        render();
      });
    });
    ['cn-over', 'cn-err', 'cn-copc', 'cn-ctr'].forEach(id => $(id).addEventListener('input', render));
    document.querySelectorAll('.cn-preset-btn').forEach(b => {
      b.addEventListener('click', () => {
        const [o, e, c, t] = b.dataset.preset.split(',').map(Number);
        $('cn-over').value = o; $('cn-err').value = e; $('cn-copc').value = c; $('cn-ctr').value = t;
        render();
      });
    });

    const obs = new MutationObserver(applyTheme);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    render();
  });
})();
