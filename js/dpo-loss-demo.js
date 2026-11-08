// ===================================================================
// DPO 손실 놀이터 — js/dpo-loss-demo.js
// sft-and-dpo 편 블록 2 의 dpo_numbers 와 같은 식으로 센다. 데이터는 js/training-dpo-pairs.js 의 가상 선호 쌍 20개다.
//   margin = β × ((정책 chosen − 참조 chosen) − (정책 rejected − 참조 rejected))
//   손실   = −log σ(margin) = softplus(−margin)
//   무게   = σ(−margin)
//   push   = β × 무게. 손실을 정책 chosen 과 정책 rejected 의 로그 확률로 미분한 값의 크기다.
//            경사 하강은 정책 chosen 의 로그 확률을 올리고 정책 rejected 를 내린다. 참조 둘은 학습하지 않는다.
// 기본값(d02, β 0.1)이면 margin -0.080, 손실 0.734, 무게 0.520 이다. sft-and-dpo 편 블록 2 의 d02 줄과 같다.
// ===================================================================

// 쌍 하나의 네 값. 글의 dpo_numbers(pol_w, pol_l, ref_w, ref_l, beta) 와 인자 차례가 같다.
// sigmoid 와 softplus 는 글 블록 1 의 식을 옮겼다. 큰 |x| 에서 넘치지 않게 부호에 따라 식을 고른다.
function dpoNumbers(pw, pl, rw, rl, beta) {
  function sigmoid(x) {
    if (x >= 0) return 1 / (1 + Math.exp(-x));
    const e = Math.exp(x);
    return e / (1 + e);
  }
  function softplus(x) {
    return x > 0 ? x + Math.log1p(Math.exp(-x)) : Math.log1p(Math.exp(x));
  }
  const margin = beta * ((pw - rw) - (pl - rl));
  const weight = sigmoid(-margin);
  return { margin, loss: softplus(-margin), weight, push: beta * weight };
}

if (typeof document !== 'undefined') {
  (function () {
    'use strict';

    // β 슬라이더의 일곱 칸. 슬라이더 값은 이 목록의 자리다.
    const BETAS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0];
    const BETA_TEXT = ['0.01', '0.02', '0.05', '0.1', '0.2', '0.5', '1.0'];
    // 슬라이더 넷의 차례는 dpoNumbers 의 인자 차례다. 데이터 줄에서는 6, 7, 8, 9번 자리다.
    // 데이터 줄은 [id, 출처, chosen id, rejected id, chosen 카피, rejected 카피, 정책 chosen, 정책 rejected, 참조 chosen, 참조 rejected] 이다.
    const SLIDERS = ['dl-pw', 'dl-pl', 'dl-rw', 'dl-rl'];
    const SOURCE_NAME = { gate: '게이트', judge: '판정자 짝비교', edit: '광고주 편집' };
    const CURVE_HALF = 3;      // 손실 곡선의 가로 범위는 기본 -3 ~ 3 이다
    const CURVE_STEPS = 120;   // 곡선은 그 범위를 120칸으로 나눈 점 121개로 그린다

    const $ = id => document.getElementById(id);
    // 슬라이더 값을 소수 첫째 자리에 맞춘다. 데이터의 -16.4 같은 값과 같은 수가 되어야 쌍을 찾는다.
    const round1 = v => Math.round(v * 10) / 10;
    const fmt3 = v => v.toFixed(3);
    // margin 처럼 부호를 붙여 적는 값. 셋째 자리까지 적어 0 이 되면 부호 없이 0.000 이다(글 블록 1 의 change 와 같은 규칙).
    const signed3 = v => {
      const s = v.toFixed(3);
      return /^-?0\.000$/.test(s) ? '0.000' : (v > 0 ? '+' : '') + s;
    };
    // 숫자 뒤의 조사. 끝 숫자를 읽은 소리가 받침으로 끝나면(0 영, 3 삼, 6 육) 「으로」, 아니면 「로」다. 1, 7, 8 의 ㄹ 받침은 「로」다.
    const ro = s => (/[036]$/.test(s) ? '으로' : '로');

    let D = null, lossChart, weightChart;

    const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    function palette() {
      return {
        muted: cssVar('--text-muted') || '#697180',
        loss: cssVar('--accent-primary') || '#1F4FA3',
        weight: cssVar('--series-3') || '#5C6470',
        now: cssVar('--accent-secondary') || '#8B1E1E',
        bar: cssVar('--series-4') || '#4A72B5',
        half: cssVar('--series-3') || '#5C6470',
        grid: 'rgba(128,128,128,0.18)',
      };
    }

    const state = () => ({
      pw: round1(+$('dl-pw').value),
      pl: round1(+$('dl-pl').value),
      rw: round1(+$('dl-rw').value),
      rl: round1(+$('dl-rl').value),
      bi: Math.round(+$('dl-beta').value),
    });

    // 슬라이더 넷이 가리키는 쌍. 네 값이 모두 같은 쌍이 없으면 null 이다.
    const pairOf = st => D.pairs.find(p => p[6] === st.pw && p[7] === st.pl && p[8] === st.rw && p[9] === st.rl) || null;

    // 범례는 선을 선으로(점선은 점선으로), 고리를 고리로, 막대를 네모로 그린다. 기본 범례는 usePointStyle 이면 모두 점으로 그린다.
    function legendLabels(chart) {
      return Chart.defaults.plugins.legend.labels.generateLabels(chart)
        .sort((a, c) => a.datasetIndex - c.datasetIndex)
        .map(it => {
          const ds = chart.data.datasets[it.datasetIndex];
          if ((ds.type || chart.config.type) === 'bar') {
            it.pointStyle = 'rect';
            it.fillStyle = ds.legendColor;
            it.strokeStyle = ds.legendColor;
          } else if (ds.showLine === false) {
            it.pointStyle = 'circle';
            it.fillStyle = 'transparent';
            it.strokeStyle = ds.borderColor;
          } else {
            it.pointStyle = 'line';
            it.strokeStyle = ds.borderColor;
            it.lineDash = ds.borderDash || [];
          }
          return it;
        });
    }

    function initCharts() {
      const p = palette();
      lossChart = new Chart($('dl-loss-chart'), {
        type: 'line',
        data: {
          datasets: [
            { label: '손실 -log σ(x)', data: [], borderColor: p.loss, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, order: 2 },
            { label: '무게 σ(-x)', data: [], borderColor: p.weight, backgroundColor: 'transparent', borderWidth: 2, borderDash: [6, 4], pointRadius: 0, pointHoverRadius: 4, order: 2 },
            { label: '지금 margin 과 손실', data: [], borderColor: p.now, backgroundColor: 'transparent', borderWidth: 2.5, pointRadius: 9, pointHoverRadius: 10, showLine: false, order: 0 },
          ],
        },
        // 애니메이션을 끈다. 처음 그리는 애니메이션이 도는 동안 update('none') 의 값이 그림에 들어가지 않는다.
        options: {
          responsive: true, maintainAspectRatio: false, animation: false,
          interaction: { mode: 'nearest', axis: 'x', intersect: false },
          plugins: {
            legend: { display: true, labels: { color: p.muted, usePointStyle: true, generateLabels: legendLabels } },
            tooltip: {
              callbacks: {
                title: items => (items.length ? 'margin ' + signed3(items[0].raw.x) : ''),
                label: ctx => (ctx.datasetIndex === 1 ? `무게 ${fmt3(ctx.raw.y)}` : `손실 ${fmt3(ctx.raw.y)}`),
              },
            },
          },
          scales: {
            x: { type: 'linear', min: -CURVE_HALF, max: CURVE_HALF, title: { display: true, text: 'margin', color: p.muted },
              ticks: { color: p.muted }, grid: { display: false } },
            y: { beginAtZero: true, title: { display: true, text: '손실과 무게', color: p.muted },
              ticks: { color: p.muted }, grid: { color: p.grid } },
          },
        },
      });
      weightChart = new Chart($('dl-weight-chart'), {
        type: 'bar',
        data: {
          labels: D.pairs.map(x => x[0]),
          datasets: [
            { type: 'bar', label: '쌍마다의 무게', data: [], backgroundColor: [], legendColor: p.bar, order: 2 },
            { type: 'line', label: '무게 0.5 (margin 0)', data: D.pairs.map(() => 0.5), borderColor: p.half, backgroundColor: 'transparent',
              borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0, pointHoverRadius: 0, order: 1 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false, animation: false,
          plugins: {
            legend: { display: true, labels: { color: p.muted, usePointStyle: true, generateLabels: legendLabels } },
            tooltip: {
              filter: it => it.datasetIndex === 0,
              callbacks: {
                title: items => {
                  if (!items.length) return '';
                  const x = D.pairs[items[0].dataIndex];
                  return `${x[0]} ${x[1]} (${x[2]} > ${x[3]})`;
                },
                label: ctx => `margin ${ctx.dataset.margins[ctx.dataIndex]}, 무게 ${fmt3(ctx.raw)}`,
              },
            },
          },
          scales: {
            x: { ticks: { color: p.muted, autoSkip: false, maxRotation: 90, minRotation: 0 }, grid: { display: false } },
            y: { min: 0, max: 1, title: { display: true, text: '무게 σ(-margin)', color: p.muted },
              // 기본 글자 꼴은 눈금 간격으로 자릿수를 정해 0.25 를 「0.3」으로 적는다. 둘째 자리까지 적는다.
              ticks: { color: p.muted, stepSize: 0.25, callback: v => v.toFixed(2) }, grid: { color: p.grid } },
          },
        },
      });
    }

    // 한 줄 판정. margin 은 화면에 적은 셋째 자리 값으로 나눈다.
    // 0.005 보다 작은 칸, 음수, 양수의 셋이다. 0.005 를 넘나드는 값도 화면의 숫자와 판정이 같게 하려는 것이다.
    function verdictOf(r) {
      const m3 = Math.round(parseFloat(signed3(r.margin)) * 1000);
      const L = fmt3(r.loss), W = fmt3(r.weight);
      if (Math.abs(m3) < 5) {
        return m3 === 0
          ? `두 카피의 로그 비율이 같아 margin 이 0 이고, 손실은 ${L} 입니다.`
          : `margin 이 0 에 가까워 손실은 ${L} 입니다.`;
      }
      return m3 < 0
        ? `정책이 참조보다 rejected 쪽으로 더 기울어 무게 ${W} ${ro(W)} 세게 밉니다.`
        : `정책이 참조보다 chosen 쪽으로 더 기울어 무게 ${W} ${ro(W)} 덜 밉니다.`;
    }

    function render() {
      const st = state();
      const beta = BETAS[st.bi];
      const r = dpoNumbers(st.pw, st.pl, st.rw, st.rl, beta);
      const cur = pairOf(st);

      SLIDERS.forEach(id => { $(id + '-val').textContent = st[id.slice(3)].toFixed(1); });
      $('dl-beta-val').textContent = BETA_TEXT[st.bi];
      $('dl-beta').setAttribute('aria-valuetext', 'β ' + BETA_TEXT[st.bi]);   // 화면 읽기가 자리 번호 대신 β 를 읽게 한다

      // 지금 쌍. 버튼은 지금 쌍 하나만 눌린 모양이다.
      document.querySelectorAll('.dl-preset-btn').forEach(b => b.setAttribute('aria-pressed', String(!!cur && b.dataset.pair === cur[0])));
      // 쌍 이름, chosen, rejected 를 한 줄씩 적는다. 카피 둘을 한 줄에 이으면 80자를 넘는 쌍이 많다.
      const pairLines = cur
        ? [`${cur[0]}, ${SOURCE_NAME[cur[1]]} 쌍`, `chosen ${cur[2]} 「${cur[4]}」`, `rejected ${cur[3]} 「${cur[5]}」`]
        : ['지금 로그 확률 넷과 같은 쌍은 20개 가운데 없습니다.', '쌍 버튼을 누르면 그 쌍의 값을 불러옵니다.'];
      $('dl-pair').replaceChildren(...pairLines.map(t => {
        const line = document.createElement('div');
        line.textContent = t;
        return line;
      }));

      // 지표 넷
      const push4 = r.push.toFixed(4);
      $('dl-loss').textContent = fmt3(r.loss);
      $('dl-margin').textContent = signed3(r.margin);
      $('dl-margin-sub').innerHTML = `r<sub>w</sub> = β(정책 chosen − 참조 chosen) = ${signed3(beta * (st.pw - st.rw))}<br>` +
        `r<sub>l</sub> = ${signed3(beta * (st.pl - st.rl))} (rejected 로 같은 식)`;
      $('dl-weight').textContent = fmt3(r.weight);
      $('dl-push').textContent = push4;
      $('dl-push-sub').innerHTML = `정책 chosen ↑ ${push4}, 정책 rejected ↓ ${push4}<br>참조 둘은 학습하지 않음`;

      // 차트 1 — 손실 곡선과 무게 곡선, 지금 점. margin 이 -3 ~ 3 밖이면 가로를 그 자리까지 넓힌다.
      const half = Math.max(CURVE_HALF, Math.ceil(Math.abs(r.margin)));
      const loss = [], weight = [];
      for (let i = 0; i <= CURVE_STEPS; i++) {
        const x = -half + 2 * half * i / CURVE_STEPS;
        const c = dpoNumbers(x, 0, 0, 0, 1);        // β 1 에 로그 비율 x 하나면 margin 이 x 다
        loss.push({ x, y: c.loss });
        weight.push({ x, y: c.weight });
      }
      lossChart.options.scales.x.min = -half;
      lossChart.options.scales.x.max = half;
      lossChart.data.datasets[0].data = loss;
      lossChart.data.datasets[1].data = weight;
      lossChart.data.datasets[2].data = [{ x: r.margin, y: r.loss }];
      $('dl-curve-range').textContent = half > CURVE_HALF
        ? `지금 margin 이 -3 ~ 3 밖이라 가로를 -${half} ~ ${half} ${ro(String(half))} 넓혔습니다.` : '';

      // 차트 2 — 지금 β 에서 쌍 20개의 무게. 지금 쌍은 벽돌색이다.
      const p = palette();
      const all = D.pairs.map(x => dpoNumbers(x[6], x[7], x[8], x[9], beta));
      const bars = weightChart.data.datasets[0];
      bars.data = all.map(v => v.weight);
      bars.margins = all.map(v => signed3(v.margin));
      bars.backgroundColor = D.pairs.map(x => (cur && x[0] === cur[0] ? p.now : p.bar));
      bars.legendColor = p.bar;
      $('dl-weight-beta').textContent = BETA_TEXT[st.bi];
      lossChart.update('none');
      weightChart.update('none');

      $('dl-verdict').textContent = verdictOf(r);
    }

    function applyTheme() {
      const p = palette();
      [lossChart, weightChart].forEach(ch => {
        if (!ch) return;
        ch.options.plugins.legend.labels.color = p.muted;
        ['x', 'y'].forEach(ax => {
          const sc = ch.options.scales[ax];
          if (sc.title) sc.title.color = p.muted;
          sc.ticks.color = p.muted;
          if (sc.grid.color) sc.grid.color = p.grid;
        });
      });
      const l = lossChart.data.datasets;
      l[0].borderColor = p.loss; l[1].borderColor = p.weight; l[2].borderColor = p.now;
      weightChart.data.datasets[1].borderColor = p.half;
      render();   // 막대 색은 지금 쌍에 따라 render 가 다시 칠한다
    }

    // 슬라이더 넷을 쌍 하나의 값으로 옮긴다. initial 이면 처음 값으로도 적어, 해설 패널이 처음 값에서 바뀐 양을 읽게 한다.
    function setPair(row, initial) {
      SLIDERS.forEach((id, i) => {
        $(id).value = row[6 + i];
        if (initial) $(id).defaultValue = String(row[6 + i]);
      });
    }

    document.addEventListener('DOMContentLoaded', () => {
      if (!$('dl-loss-chart') || typeof Chart === 'undefined' || !window.DPO_PAIRS) return;
      D = window.DPO_PAIRS;
      // 쌍 버튼 20개는 데이터 파일의 차례대로 만든다. 글자는 「d01 gate」 꼴이다.
      const row = $('dl-pair-btns');
      D.pairs.forEach(x => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'dl-preset-btn';
        b.dataset.pair = x[0];
        b.textContent = `${x[0]} ${x[1]}`;
        b.setAttribute('aria-pressed', 'false');
        row.appendChild(b);
      });
      // 처음 값은 데이터 파일의 default 쌍과 beta 다.
      setPair(D.pairs.find(x => x[0] === D.default), true);
      const bi = BETAS.indexOf(D.beta);
      $('dl-beta').value = bi;
      $('dl-beta').defaultValue = String(bi);
      initCharts();
      SLIDERS.concat('dl-beta').forEach(id => $(id).addEventListener('input', render));
      // 쌍 버튼은 값을 바꾼 뒤 슬라이더 넷마다 input 을 보낸다. render 는 그 input 에서 돈다. β 는 그대로 둔다.
      // detail.preset 은 해설 패널이 설명을 쓰지 않고 이전 값만 갱신하라는 표시다. 쌍 버튼의 해설은 버튼 클릭 규칙이 한 번 쓴다.
      document.querySelectorAll('.dl-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          setPair(D.pairs.find(x => x[0] === btn.dataset.pair), false);
          SLIDERS.forEach(id => $(id).dispatchEvent(new CustomEvent('input', { bubbles: true, detail: { preset: true } })));
        });
      });
      new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      render();
    });
  })();
}

if (typeof module !== 'undefined' && module.exports) module.exports = { dpoNumbers };
