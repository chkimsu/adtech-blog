// ===================================================================
// 유저 문서 검색 놀이터 — js/users-as-documents-demo.js
// users-as-documents 편의 파이썬과 같은 식으로 센다. 데이터는 js/ads-users-data.js 의 가상 회원 2,000명과 키워드 120개다.
//   문서   회원마다 검색어를 검색 횟수만큼, 행동은 낱말 하나를 횟수만큼 잇는다(user_doc).
//          BM25 는 낱말이 든 횟수와 문서의 낱말 수만 보므로, 문서를 「낱말 → 횟수」 표와 길이로 둔다.
//   BM25   질의 낱말 t 마다 idf(t) × f / (f + k1 × (1 − b + b × |D| / avgdl)) 를 더한다(bm25_scores).
//          분자에 (k1 + 1) 이 없는 꼴이고, idf 는 ln(1 + (N − n + 0.5) / (n + 0.5)) 이다.
//   목록   점수가 0 보다 큰 회원을 점수 순으로 놓고, 같으면 회원 번호가 작은 쪽이 앞이다(ranked).
//   RRF    목록마다 1 / (k + 순위) 를 더하고, 같으면 번호가 작은 쪽이 앞이다(rrf).
//          더하는 차례는 STRATEGIES 차례다. 앞 셋이 글의 direct, category, co_purchase 차례와 같다.
//   질의   고른 전략마다 정답 키워드의 검색어다. 글의 QUERIES 식을 전략 일곱으로 넓혔고,
//          주제가 health, noise 인 키워드는 넣지 않는다(키워드 확장 편의 policy_filter 와 같은 기준).
//          기본 전략 셋에는 그런 키워드가 없어 글의 질의와 같다. 걸리는 것은 problem_goal 의 health 넷이다.
// 기본값(direct, category, co_purchase, k1 1.2, b 0.75, k 60, 200명)이면 고른 회원 200명, 겹침 165명,
// 구매자 41명(20.5%), 회원 A 171위다. 글의 블록 2, 3 이 찍은 값과 같다.
// ===================================================================
(function () {
  'use strict';

  // 키워드 확장 편의 STRATEGIES 차례. 체크 상자의 차례이자 RRF 가 더하는 차례다.
  const STRATEGIES = ['direct', 'category', 'co_purchase', 'problem_goal', 'persona', 'brand', 'product_line'];
  const DEFAULT = { strategies: ['direct', 'category', 'co_purchase'], k1: 1.2, b: 0.75, k: 60, cut: 200 };
  const BLOCKED_TOPICS = ['health', 'noise'];
  const MEMBER_A = 0;          // 0번이 회원 A 다
  const CUTS = [];             // 자르는 수 슬라이더의 자리. 50에서 400까지 10씩
  for (let c = 50; c <= 400; c += 10) CUTS.push(c);

  // 데이터 파일을 문서 2,000편과 전략별 질의로 바꾼다.
  // keywords 는 [id, 검색어, 주제, 하루 검색 수, 전략], members 는 [세그먼트 317, 다음 30일 구매, [[키워드 번호, 횟수]...], 행동 횟수 8개] 이다.
  function build(data) {
    const kw = data.keywords;
    const docs = data.members.map(([seg, buy, searches, counts]) => {
      const tf = new Map();
      let len = 0;
      for (const [j, n] of searches) { tf.set(kw[j][1], (tf.get(kw[j][1]) || 0) + n); len += n; }
      counts.forEach((c, f) => {
        const word = data.words[f];       // null 이면 검색어로 이미 들어간 필드다
        if (word && c) { tf.set(word, (tf.get(word) || 0) + c); len += c; }
      });
      return { tf, len, seg: seg === 1, buy };
    });
    let total = 0;
    for (const d of docs) total += d.len;
    const queries = {}, dropped = {};
    for (const s of STRATEGIES) {
      const rows = kw.filter(r => r[4] === s);
      queries[s] = rows.filter(r => !BLOCKED_TOPICS.includes(r[2])).map(r => r[1]);
      dropped[s] = rows.filter(r => BLOCKED_TOPICS.includes(r[2])).map(r => r[1]);
    }
    const segIds = [];
    docs.forEach((d, i) => { if (d.seg) segIds.push(i); });
    return {
      docs, avgdl: total / docs.length, queries, dropped,
      segSize: segIds.length, segBuyers: segIds.reduce((a, i) => a + docs[i].buy, 0),
    };
  }

  // bm25_scores 와 같은 식, 같은 차례. 질의 낱말이 하나도 없는 문서는 0점이다.
  function bm25Scores(terms, P, k1, b) {
    const n = P.docs.length;
    const scores = new Array(n).fill(0);
    for (const term of terms) {
      let df = 0;
      for (const d of P.docs) if (d.tf.has(term)) df++;
      if (df === 0) continue;
      const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
      for (let i = 0; i < n; i++) {
        const f = P.docs[i].tf.get(term);
        if (f === undefined) continue;
        const norm = 1 - b + b * P.docs[i].len / P.avgdl;
        scores[i] += idf * f / (f + k1 * norm);
      }
    }
    return scores;
  }

  // ranked 와 같다. 점수가 큰 순서, 같으면 번호가 작은 순서.
  function ranked(scores) {
    const ids = [];
    for (let i = 0; i < scores.length; i++) if (scores[i] > 0) ids.push(i);
    return ids.sort((a, c) => (scores[a] !== scores[c] ? (scores[a] > scores[c] ? -1 : 1) : a - c));
  }

  // rrf 와 같다. 목록을 받은 차례대로 1 / (k + 순위) 를 더한다.
  function rrf(lists, k) {
    const total = new Map();
    for (const one of lists) one.forEach((i, at) => total.set(i, (total.get(i) || 0) + 1 / (k + at + 1)));
    const ids = Array.from(total.keys());
    return ids.sort((a, c) => {
      const sa = total.get(a), sc = total.get(c);
      return sa !== sc ? (sa > sc ? -1 : 1) : a - c;
    });
  }

  // 파이썬의 f'{x:.1%}' 와 같은 글자. x × 100 을 소수 첫째 자리로 반올림하고, 딱 반인 값(끝이 .25 나 .75)은 짝수 쪽으로 보낸다.
  // toFixed 는 딱 반이면 큰 쪽을 고르고 파이썬은 짝수 쪽을 고른다. 둘이 다른 것은 끝이 .25 인 값뿐이다.
  function pct1(b, n) {
    const p = b / n * 100;
    if (Number.isInteger(p * 4) && !Number.isInteger(p * 2)) {
      const lo = Math.floor(p * 10);
      return ((lo % 2 === 0 ? lo : lo + 1) / 10).toFixed(1) + '%';
    }
    return p.toFixed(1) + '%';
  }

  // 놀이터의 한 상태를 센다. st 는 { strategies, k1, b, k, cut } 이다.
  function compute(P, st) {
    const active = STRATEGIES.filter(s => st.strategies.includes(s));
    const lists = {}, place = {};
    for (const s of active) {
      lists[s] = ranked(bm25Scores(P.queries[s], P, st.k1, st.b));
      place[s] = new Map(lists[s].map((i, r) => [i, r + 1]));
    }
    const merged = active.length ? rrf(active.map(s => lists[s]), st.k) : [];
    const picked = merged.slice(0, st.cut);
    const inPick = new Set(picked);
    const groups = { both: [0, 0], segOnly: [0, 0], searchOnly: [0, 0] };   // [회원 수, 구매자 수]
    P.docs.forEach((d, i) => {
      const g = d.seg && inPick.has(i) ? 'both' : d.seg ? 'segOnly' : inPick.has(i) ? 'searchOnly' : null;
      if (g) { groups[g][0]++; groups[g][1] += d.buy; }
    });
    const buyers = picked.reduce((a, i) => a + P.docs[i].buy, 0);
    const rankA = merged.indexOf(MEMBER_A) + 1;     // 0 이면 합친 목록에 없다
    // 자르는 수 슬라이더의 자리마다 앞 c 명의 구매자와 겹침. 합친 회원보다 많이 자르면 합친 회원 전부다.
    let sumBuy = 0, sumSeg = 0;
    const prefix = [[0, 0]];
    for (const i of merged) { sumBuy += P.docs[i].buy; sumSeg += P.docs[i].seg ? 1 : 0; prefix.push([sumBuy, sumSeg]); }
    const sweep = CUTS.map(c => {
      const n = Math.min(c, merged.length);
      return { cut: c, n, buyers: prefix[n][0], overlap: prefix[n][1] };
    });
    return {
      active, lists, place, merged, picked, buyers, groups, rankA, sweep,
      terms: active.reduce((a, s) => a + P.queries[s].length, 0),
      overlap: groups.both[0],
      rate: picked.length ? pct1(buyers, picked.length) : null,
      inCut: rankA > 0 && rankA <= picked.length,
    };
  }

  const num = v => v.toLocaleString('ko-KR');

  // node 에서 글의 파이썬과 대조할 수 있게 셈만 내놓는다.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { build, compute, bm25Scores, ranked, rrf, pct1, STRATEGIES, DEFAULT, CUTS };
    return;
  }

  const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function palette() {
    return {
      muted: cssVar('--text-muted') || '#697180',
      seg: cssVar('--accent-primary') || '#1F4FA3',
      search: cssVar('--accent-secondary') || '#8B1E1E',
      both: cssVar('--series-3') || '#5C6470',
      segLight: cssVar('--series-4') || '#4A72B5',
      searchLight: cssVar('--series-5') || '#A54A4A',
      surface: cssVar('--bg-secondary') || '#F5F7FA',
      grid: 'rgba(128,128,128,0.18)',
    };
  }

  const $ = id => document.getElementById(id);
  const SLIDERS = ['ua-k1', 'ua-b', 'ua-k', 'ua-cut'];
  let P = null, cutChart, groupChart;

  const boxes = () => Array.from(document.querySelectorAll('.ua-strat input'));
  const state = () => ({
    strategies: boxes().filter(c => c.checked).map(c => c.value),
    // 슬라이더 값을 소수 자리에 맞춰 둔다. 글의 1.2, 0.75 같은 값과 같은 수가 된다.
    k1: Math.round(+$('ua-k1').value * 10) / 10,
    b: Math.round(+$('ua-b').value * 100) / 100,
    k: Math.round(+$('ua-k').value),
    cut: Math.round(+$('ua-cut').value),
  });

  // 범례는 선을 선으로(점선은 점선으로), 고리를 고리로 그린다. 기본 범례는 usePointStyle 이면 모두 점으로 그린다.
  function legendLabels(chart) {
    return Chart.defaults.plugins.legend.labels.generateLabels(chart)
      .sort((a, c) => a.datasetIndex - c.datasetIndex)
      .map(it => {
        const ds = chart.data.datasets[it.datasetIndex];
        it.strokeStyle = ds.borderColor;
        if (ds.showLine === false) {
          it.pointStyle = 'circle';
          it.fillStyle = 'transparent';
        } else {
          it.pointStyle = 'line';
          it.lineDash = ds.borderDash || [];
        }
        return it;
      });
  }

  function initCharts() {
    const p = palette();
    cutChart = new Chart($('ua-cut-chart'), {
      type: 'line',
      data: {
        datasets: [
          { label: '검색으로 고른 회원', data: [], borderColor: p.search, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, order: 2 },
          { label: '세그먼트 317', data: [], borderColor: p.seg, backgroundColor: 'transparent', borderWidth: 2, borderDash: [6, 4], pointRadius: 0, pointHoverRadius: 0, order: 2 },
          { label: '지금 자르는 수', data: [], borderColor: p.search, backgroundColor: 'transparent', borderWidth: 2.5, pointRadius: 9, pointHoverRadius: 10, showLine: false, order: 0 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 180 },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        plugins: {
          legend: { display: true, labels: { color: p.muted, usePointStyle: true, generateLabels: legendLabels } },
          tooltip: {
            filter: it => it.datasetIndex === 0,
            callbacks: {
              title: items => (items.length ? '자르는 수 ' + items[0].raw.x : ''),
              label: ctx => {
                const d = ctx.raw;
                return `앞 ${num(d.n)}명: 구매자 ${d.buyers}명 (${pct1(d.buyers, d.n)}), 세그먼트 317 과 겹침 ${d.overlap}명`;
              },
            },
          },
        },
        scales: {
          x: { type: 'linear', min: 50, max: 400, title: { display: true, text: '자르는 수 (명)', color: p.muted },
            ticks: { color: p.muted, stepSize: 50 }, grid: { display: false } },
          y: { beginAtZero: true, title: { display: true, text: '다음 30일 구매자 비율 (%)', color: p.muted },
            ticks: { color: p.muted, callback: v => v + '%' }, grid: { color: p.grid } },
        },
      },
    });
    groupChart = new Chart($('ua-group-chart'), {
      type: 'bar',
      data: { labels: [], datasets: [{ label: '다음 30일 구매자 비율', data: [], backgroundColor: [] }] },
      // 막대는 애니메이션을 끈다. 처음 그리는 애니메이션이 도는 동안 update('none') 의 값이 막대에 들어가지 않는다.
      options: {
        responsive: true, maintainAspectRatio: false, animation: false, indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ctx.raw === null ? '회원 0명' : `${num(ctx.dataset.meta[ctx.dataIndex][0])}명 가운데 구매자 ${ctx.dataset.meta[ctx.dataIndex][1]}명 (${ctx.dataset.text[ctx.dataIndex]})` } },
        },
        scales: {
          x: { beginAtZero: true, title: { display: true, text: '다음 30일 구매자 비율 (%)', color: p.muted },
            ticks: { color: p.muted, callback: v => v + '%' }, grid: { color: p.grid } },
          y: { ticks: { color: p.muted }, grid: { display: false } },
        },
      },
    });
  }

  // 회원 A 가 든 목록과 그 목록의 순위. 목록이 하나면 「하나」를 붙인다. 전략을 모두 끄면 목록이 없다고만 적는다.
  function rankNote(r) {
    if (!r.active.length) return '고른 전략이 없습니다';
    if (!r.rankA) return '고른 전략의 질의 낱말이 회원 A 의 문서에 없습니다';
    const where = r.active.filter(s => r.place[s].has(MEMBER_A)).map(s => `${s} ${r.place[s].get(MEMBER_A)}위`);
    return where.join(', ') + (where.length === 1 ? ' 하나' : '') + (r.inCut ? ', 자르는 선 안' : ', 자르는 선 밖');
  }

  function render() {
    const st = state();
    const r = compute(P, st);
    const segRate = pct1(P.segBuyers, P.segSize);

    $('ua-k1-val').textContent = st.k1.toFixed(1);
    $('ua-b-val').textContent = st.b.toFixed(2);
    $('ua-k-val').textContent = String(st.k);
    $('ua-cut-val').textContent = st.cut + '명';
    document.querySelectorAll('.ua-strat').forEach(l => l.classList.toggle('is-on', l.querySelector('input').checked));
    const words = r.active.map(s => P.queries[s].join(', '));
    $('ua-query').textContent = r.active.length
      ? `질의 낱말 ${r.terms}개 — ` + words.join(' / ')
      : '고른 전략이 없어 질의 낱말이 0개입니다';

    // 지표 넷
    const n = r.picked.length;
    $('ua-picked').textContent = num(n) + '명';
    $('ua-picked-sub').textContent = !r.merged.length ? '합친 목록이 비었습니다'
      : r.merged.length <= st.cut ? `합친 ${num(r.merged.length)}명 전부`
        : `합친 ${num(r.merged.length)}명에서 앞 ${num(n)}명`;
    $('ua-overlap').textContent = r.overlap + '명';
    $('ua-overlap-sub').textContent = `세그먼트에만 ${r.groups.segOnly[0]}명, 검색에만 ${r.groups.searchOnly[0]}명`;
    $('ua-rate').textContent = r.rate || '—';
    $('ua-rate-sub').textContent = (n ? `구매자 ${r.buyers}명. ` : '') + `세그먼트 317 은 ${segRate}`;
    $('ua-rank').textContent = r.rankA ? r.rankA + '위' : '없음';
    $('ua-rank').className = 'ua-metric-value' + (r.inCut ? ' good' : '');
    $('ua-rank-sub').textContent = rankNote(r);

    // 차트 1 — 자르는 수마다 앞 몇 명의 구매자 비율
    const segY = P.segBuyers / P.segSize * 100;
    cutChart.data.datasets[0].data = r.merged.length
      ? r.sweep.map(d => ({ x: d.cut, y: d.buyers / d.n * 100, n: d.n, buyers: d.buyers, overlap: d.overlap })) : [];
    cutChart.data.datasets[1].data = [{ x: 50, y: segY }, { x: 400, y: segY }];
    cutChart.data.datasets[2].data = n ? [{ x: st.cut, y: r.buyers / n * 100 }] : [];

    // 차트 2 — 다섯 무리의 구매자 비율. 회원이 0명인 무리는 막대를 그리지 않는다.
    const p = palette();
    const rows = [
      ['세그먼트 317', [P.segSize, P.segBuyers], p.seg],
      [`검색 ${num(n)}명`, [n, r.buyers], p.search],
      ['겹친 회원', r.groups.both, p.both],
      ['세그먼트에만', r.groups.segOnly, p.segLight],
      ['검색에만', r.groups.searchOnly, p.searchLight],
    ];
    const ds = groupChart.data.datasets[0];
    groupChart.data.labels = rows.map(x => x[0]);
    ds.data = rows.map(x => (x[1][0] ? x[1][1] / x[1][0] * 100 : null));
    ds.meta = rows.map(x => x[1]);
    ds.text = rows.map(x => (x[1][0] ? pct1(x[1][1], x[1][0]) : '—'));
    ds.backgroundColor = rows.map(x => x[2]);
    cutChart.update('none');
    groupChart.update('none');

    // 한 줄 판정. 비율은 화면에 보인 소수 첫째 자리 값끼리 비교한다.
    // 해설 패널의 규칙이 읽을 수를 data- 에 둔다.
    const vd = $('ua-verdict').dataset;
    vd.terms = r.terms;
    vd.merged = r.merged.length;
    let verdict;
    if (!r.active.length) {
      verdict = '고른 전략이 없어 질의가 비었습니다. 체크 상자를 하나 이상 켭니다.';
    } else if (!n) {
      verdict = '고른 전략의 질의 낱말이 든 문서가 없어 고른 회원이 없습니다. 다른 전략을 켭니다.';
    } else {
      const mine = parseFloat(r.rate), theirs = parseFloat(segRate);
      const rateWord = mine > theirs ? ' 보다 높고' : mine < theirs ? ' 보다 낮고' : ' 와 같고';
      const countWord = r.buyers > P.segBuyers ? `${P.segBuyers}명보다 많습니다`
        : r.buyers < P.segBuyers ? `${P.segBuyers}명보다 적습니다` : '세그먼트 317 과 같습니다';
      verdict = `검색 ${num(n)}명의 구매자 비율은 ${r.rate} 로 세그먼트 317 의 ${segRate}${rateWord}, ` +
        `구매자는 ${r.buyers}명으로 ${countWord}. `;
      verdict += r.rankA
        ? `회원 A 는 ${r.rankA}위로 자르는 선 ${r.inCut ? '안' : '밖'}에 있습니다.`
        : '회원 A 는 어느 목록에도 들지 않았습니다.';
    }
    $('ua-verdict').textContent = verdict;
  }

  function applyTheme() {
    const p = palette();
    [cutChart, groupChart].forEach(ch => {
      if (!ch) return;
      if (ch.options.plugins.legend.labels) ch.options.plugins.legend.labels.color = p.muted;
      ['x', 'y'].forEach(ax => {
        const sc = ch.options.scales[ax];
        if (sc.title) sc.title.color = p.muted;
        sc.ticks.color = p.muted;
        if (sc.grid.color) sc.grid.color = p.grid;
      });
    });
    const c = cutChart.data.datasets;
    c[0].borderColor = p.search; c[1].borderColor = p.seg; c[2].borderColor = p.search;
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('ua-cut-chart') || typeof Chart === 'undefined' || !window.ADS_USERS) return;
    P = build(window.ADS_USERS);
    // 전략마다 질의 낱말 수를 데이터에서 센다. 건강 주제를 뺀 수다.
    document.querySelectorAll('.ua-strat').forEach(l => {
      const s = l.querySelector('input').value;
      l.querySelector('small').textContent = P.queries[s].length + '개';
    });
    initCharts();
    SLIDERS.forEach(id => $(id).addEventListener('input', render));
    // 체크 상자는 click 에서 다시 그린다. 체크는 click 이 문서까지 올라가기 전에 바뀌어 있고,
    // 해설 패널의 규칙(demo-edu.js 의 click)이 그다음에 새 숫자를 읽는다. change 는 click 이 끝난 뒤에 온다.
    boxes().forEach(c => c.addEventListener('click', render));
    // 프리셋은 값을 바꾼 뒤 슬라이더마다 input 을 보낸다. render 는 그 input 에서 돈다.
    // detail.preset 은 해설 패널이 설명을 쓰지 않고 이전 값만 갱신하라는 표시다. 프리셋 해설은 버튼 클릭 규칙이 한 번 쓴다.
    // data-edu-said 는 해설 규칙이 마지막으로 설명한 체크 상태다. 프리셋이 바꾼 상태로 맞춰 둬야 다음 클릭을 바로 설명한다.
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [strats, k1, b, k, cut] = btn.dataset.preset.split(',');
        const on = strats === 'all' ? STRATEGIES : strats.split('+');
        boxes().forEach(c => {
          c.checked = on.includes(c.value);
          c.closest('.ua-strat').dataset.eduSaid = c.checked ? '1' : '0';
        });
        [k1, b, k, cut].forEach((v, i) => { $(SLIDERS[i]).value = v; });
        SLIDERS.forEach(id => $(id).dispatchEvent(new CustomEvent('input', { bubbles: true, detail: { preset: true } })));
      });
    });
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    render();
  });
})();
