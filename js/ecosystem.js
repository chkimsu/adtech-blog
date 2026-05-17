/* Ecosystem Map — interactive SVG graph with flow animation */
(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  // 18 nodes (6 카테고리). 좌표는 viewBox 1200x720 기준.
  const NODES = {
    // ── Row 1 (y=120): ML / Models top ──
    'feature-store': {
      x: 450, y: 120, w: 140, h: 60, cat: 'ml',
      name: 'Feature Store', sub: '피처 저장소',
      def: '유저·지면·시간 등 광고 모델의 입력 피처를 실시간으로 공급하는 저장소. pCTR/pCVR이 매 요청마다 호출.',
      demos: [], posts: [{ id: 'feature-store-serving', title: 'Feature Store 서빙' }]
    },
    'model-serving': {
      x: 620, y: 120, w: 160, h: 60, cat: 'ml',
      name: 'Model Serving', sub: 'Retrieval → Ranking',
      def: '수천 후보 광고를 Retrieval→Pre-Ranking→Ranking→Re-Ranking으로 좁히는 추론 파이프라인. 10ms 안에 끝나야 함.',
      demos: [], posts: [{ id: 'model-serving-architecture', title: 'Model Serving 아키텍처' }]
    },
    'calibration': {
      x: 810, y: 120, w: 140, h: 60, cat: 'ml',
      name: 'Calibration', sub: '예측값 보정',
      def: '모델이 예측한 CTR을 실제 분포에 맞게 보정. 예측 평균을 실제 평균과 일치시켜 입찰가 왜곡 방지.',
      demos: [{ name: 'pCTR Impact', url: 'demo-pctr-impact.html' }],
      posts: [{ id: 'calibration', title: 'pCTR Calibration' }]
    },

    // ── Row 2 (y=220) ──
    'auction': {
      x: 450, y: 220, w: 140, h: 60, cat: 'exchange',
      name: 'Auction Engine', sub: '1st / 2nd Price',
      def: '여러 DSP의 입찰가 중 최고가를 결정하고 지불가를 산정. 1st Price=낙찰가 그대로, 2nd Price=차순위가만.',
      demos: [{ name: 'RTB 경매', url: 'demo-rtb.html' }, { name: 'UCB vs TS 비교', url: 'demo-compare-bandits.html' }],
      posts: [{ id: 'ad-network-vs-exchange', title: 'Ad Network vs Exchange' }]
    },
    'pctr-cvr': {
      x: 620, y: 220, w: 160, h: 60, cat: 'ml',
      name: 'pCTR / pCVR', sub: '예측 모델',
      def: '이 유저가 이 광고를 클릭할 확률(pCTR)과 전환할 확률(pCVR)을 예측. DeepFM·DIN 등 딥러닝 모델 활용.',
      demos: [{ name: 'pCTR Impact', url: 'demo-pctr-impact.html' }, { name: 'LinUCB', url: 'demo-linucb.html' }],
      posts: [{ id: 'deep-ctr-models', title: 'Deep CTR Models' }, { id: 'pCVR-modeling', title: 'pCVR 모델링' }, { id: 'negative-sampling-bias', title: 'Negative Sampling Bias' }]
    },
    'brand': {
      x: 1050, y: 220, w: 140, h: 60, cat: 'buy',
      name: 'Brand / Agency', sub: '브랜드·에이전시',
      def: '광고 캠페인을 의뢰하는 주체. ATD(Agency Trading Desk)를 통해 DSP에 접근하기도 함.',
      demos: [], posts: [{ id: 'adtech-30min-primer', title: '30분 입문 가이드' }]
    },

    // ── Row 3 (y=380): MAIN RTB FLOW ──
    'user': {
      x: 90, y: 380, w: 120, h: 60, cat: 'user',
      name: '사용자', sub: 'User',
      def: '광고를 보고 클릭·전환하는 최종 소비자. 모든 광고 흐름의 시작과 끝점.',
      demos: [], posts: [{ id: 'adtech-30min-primer', title: '30분 입문 가이드' }]
    },
    'publisher': {
      x: 270, y: 380, w: 130, h: 60, cat: 'sell',
      name: 'Publisher', sub: '매체·앱',
      def: '광고 지면을 제공하는 웹사이트·앱·뉴스 등. 사용자 방문 시 SSP에 광고 요청을 보냄.',
      demos: [{ name: 'Header Bidding', url: 'demo-header-bidding.html' }],
      posts: [{ id: 'walled-garden', title: 'Walled Garden' }]
    },
    'ssp': {
      x: 450, y: 380, w: 140, h: 60, cat: 'sell',
      name: 'SSP', sub: '공급 측 플랫폼',
      def: 'Publisher 대신 광고 지면을 Ad Exchange에 팔아주는 플랫폼. Floor Price·Header Bidding으로 수익 최적화.',
      demos: [{ name: 'Header Bidding', url: 'demo-header-bidding.html' }],
      posts: [{ id: 'ad-serving-flow', title: '광고 서빙 플로우' }]
    },
    'exchange': {
      x: 620, y: 380, w: 160, h: 60, cat: 'exchange',
      name: 'Ad Exchange', sub: '광고 거래소',
      def: 'SSP의 광고 슬롯과 DSP들의 입찰을 100ms 안에 매칭하는 실시간 거래소. RTB 경매의 무대.',
      demos: [{ name: 'RTB 경매', url: 'demo-rtb.html' }],
      posts: [{ id: 'ad-network-vs-exchange', title: 'Ad Network vs Exchange' }, { id: 'ad-serving-flow', title: '광고 서빙 플로우' }]
    },
    'dsp': {
      x: 810, y: 380, w: 140, h: 60, cat: 'buy',
      name: 'DSP', sub: '수요 측 플랫폼',
      def: '광고주 대신 여러 Exchange에 입찰하는 두뇌. pCTR 예측·Bid Shading·Budget Pacing의 모든 결정이 여기서.',
      demos: [
        { name: 'UCB1', url: 'demo-ucb1.html' },
        { name: 'Thompson Sampling', url: 'demo-ts.html' },
        { name: 'LinUCB', url: 'demo-linucb.html' },
        { name: 'Bid Landscape', url: 'demo-bid-landscape.html' },
        { name: 'Bid Shading', url: 'demo-bid-shading.html' },
        { name: 'pCTR Impact', url: 'demo-pctr-impact.html' },
        { name: 'Portfolio', url: 'demo-portfolio.html' }
      ],
      posts: [{ id: 'adtech-dev-layers', title: '광고 개발 8 레이어' }, { id: 'auto-bidding-pacing', title: 'Auto-Bidding & Pacing' }]
    },
    'advertiser': {
      x: 1050, y: 380, w: 140, h: 60, cat: 'buy',
      name: 'Advertiser', sub: '광고주',
      def: '광고 캠페인의 예산·KPI(CPA, ROAS)를 설정하는 주체. DSP에 위임해 실시간 입찰을 실행.',
      demos: [], posts: [{ id: 'adtech-30min-primer', title: '30분 입문 가이드' }, { id: 'adtech-ecosystem-map', title: '광고 생태계 지도' }]
    },

    // ── Row 4 (y=540) ──
    'mmp': {
      x: 90, y: 540, w: 140, h: 60, cat: 'measurement',
      name: 'MMP / Attribution', sub: '어트리뷰션',
      def: 'Impression·Click·Conversion 로그를 매칭해 어느 광고가 전환에 기여했는지 분석. ROAS 측정의 기반.',
      demos: [], posts: [{ id: 'position-bias-ultr', title: 'Position Bias' }, { id: 'walled-garden', title: 'Walled Garden' }]
    },
    'log-pipeline': {
      x: 270, y: 540, w: 140, h: 60, cat: 'measurement',
      name: 'Log Pipeline', sub: '로그 파이프라인',
      def: 'Bid·Win/Loss·Impression·Click·Conversion 10여 종 로그를 수집·조인·집계. 모델 학습과 측정의 토대.',
      demos: [{ name: 'Censored Data', url: 'demo-censored-data.html' }],
      posts: [{ id: 'ad-log-system', title: '광고 로그 시스템' }, { id: 'ad-log-pipeline', title: '광고 로그 파이프라인' }, { id: 'online-learning-delayed-feedback', title: 'Online Learning & Delayed Feedback' }]
    },
    'header-bidding': {
      x: 450, y: 540, w: 140, h: 60, cat: 'sell',
      name: 'Header Bidding', sub: 'vs Waterfall',
      def: '여러 SSP를 동시(병렬) 호출해 최고가를 뽑는 방식. Waterfall(순차 호출)보다 평균 +10~30% 수익.',
      demos: [{ name: 'Header Bidding', url: 'demo-header-bidding.html' }],
      posts: [{ id: 'ad-serving-flow', title: '광고 서빙 플로우' }]
    },
    'dco': {
      x: 810, y: 540, w: 130, h: 60, cat: 'buy',
      name: 'DCO', sub: '다이내믹 크리에이티브',
      def: '소재(이미지·텍스트)를 유저·맥락에 맞게 자동으로 조합·최적화. MAB로 베스트 조합 학습.',
      demos: [{ name: 'UCB1', url: 'demo-ucb1.html' }],
      posts: []
    },
    'dmp': {
      x: 970, y: 540, w: 140, h: 60, cat: 'buy',
      name: 'DMP / CDP', sub: '오디언스 데이터',
      def: '쿠키·디바이스 ID·1st party 데이터를 모아 오디언스 세그먼트를 만듦. DSP의 타겟팅 입력.',
      demos: [], posts: [{ id: 'audience-segmentation', title: '오디언스 세그멘테이션' }, { id: 'lookalike-modeling', title: 'Lookalike 모델링' }]
    },

    // ── Row 5 (y=650): User & Privacy ──
    'user-journey': {
      x: 90, y: 650, w: 200, h: 50, cat: 'user',
      name: 'User Journey', sub: 'Impression → Click → Conversion',
      def: '사용자의 광고 노출 → 클릭 → 전환까지의 시간 흐름. 어트리뷰션 윈도우와 LTV 측정의 기준.',
      demos: [], posts: [{ id: 'adtech-30min-primer', title: '30분 입문 가이드' }]
    },
    'cmp': {
      x: 320, y: 650, w: 200, h: 50, cat: 'user',
      name: 'CMP / Walled Garden', sub: '동의 관리·울타리',
      def: '사용자 데이터 동의(GDPR·CCPA)를 관리하는 CMP, 그리고 자체 ID로 닫힌 생태계인 Walled Garden(구글·메타).',
      demos: [], posts: [{ id: 'walled-garden', title: 'Walled Garden' }]
    },
  };

  const EDGES = [
    // ── 메인 RTB 흐름 (강조) ──
    { from: 'user', to: 'publisher' },
    { from: 'publisher', to: 'ssp' },
    { from: 'ssp', to: 'exchange' },
    { from: 'exchange', to: 'dsp' },
    { from: 'dsp', to: 'exchange' },
    { from: 'dsp', to: 'advertiser' },
    { from: 'brand', to: 'advertiser' },

    // ── ML 흐름 ──
    { from: 'feature-store', to: 'model-serving' },
    { from: 'model-serving', to: 'pctr-cvr' },
    { from: 'pctr-cvr', to: 'calibration' },
    { from: 'dsp', to: 'model-serving' },
    { from: 'exchange', to: 'auction' },
    { from: 'auction', to: 'pctr-cvr' },

    // ── Buy/Sell 부속 ──
    { from: 'dmp', to: 'dsp' },
    { from: 'dco', to: 'dsp' },
    { from: 'ssp', to: 'header-bidding' },

    // ── Measurement 흐름 ──
    { from: 'publisher', to: 'log-pipeline' },
    { from: 'log-pipeline', to: 'mmp' },
    { from: 'log-pipeline', to: 'feature-store' },
    { from: 'mmp', to: 'advertiser' },
    { from: 'user-journey', to: 'log-pipeline' },

    // ── Privacy ──
    { from: 'cmp', to: 'dmp' },

    // ── 추가 흐름용 엣지 (v2) ──
    { from: 'calibration', to: 'dsp' },          // 모델 학습 → 서빙
    { from: 'advertiser', to: 'dsp' },           // 어트리뷰션 후 KPI 조정
    { from: 'publisher', to: 'header-bidding' }, // HB 컨테이너 실행
    { from: 'header-bidding', to: 'ssp' },       // HB가 여러 SSP를 동시 호출
    { from: 'exchange', to: 'publisher' },       // Winner 광고 전달
    { from: 'user-journey', to: 'cmp' },         // 첫 방문 동의 흐름
  ];

  const FLOWS = {
    rtb: {
      label: '100ms RTB',
      steps: [
        { from: 'user', to: 'publisher', caption: '① 사용자가 페이지·앱을 방문 — 광고 슬롯 발견' },
        { from: 'publisher', to: 'ssp', caption: '② Publisher가 SSP에 광고 요청 (Ad Request)' },
        { from: 'ssp', to: 'exchange', caption: '③ SSP가 Ad Exchange에 Bid Request 발송' },
        { from: 'exchange', to: 'dsp', caption: '④ Ad Exchange가 여러 DSP에 동시 Bid Request 분배' },
        { from: 'dsp', to: 'model-serving', caption: '⑤ DSP가 Model Serving에 점수 요청' },
        { from: 'model-serving', to: 'pctr-cvr', caption: '⑥ pCTR / pCVR 모델이 클릭·전환 확률 예측' },
        { from: 'dsp', to: 'exchange', caption: '⑦ DSP가 Bid 응답 — Bid Shading으로 입찰가 조정' },
        { from: 'exchange', to: 'publisher', caption: '⑧ Auction Engine이 Winner 결정 → Publisher에 광고 전달' },
        { from: 'publisher', to: 'user', caption: '⑨ 사용자에게 광고 노출 (Impression)' },
        { from: 'user', to: 'log-pipeline', caption: '⑩ Impression·Click·Conversion → Log Pipeline → MMP' },
      ]
    },
    modeling: {
      label: '모델 학습·서빙',
      steps: [
        { from: 'user-journey', to: 'log-pipeline', caption: '① 사용자 행동(노출·클릭·전환)이 Log Pipeline에 수집' },
        { from: 'log-pipeline', to: 'feature-store', caption: '② 가공된 피처가 Feature Store에 갱신 (시간·유저·지면)' },
        { from: 'feature-store', to: 'model-serving', caption: '③ 오프라인 학습 데이터셋이 구성됨' },
        { from: 'model-serving', to: 'pctr-cvr', caption: '④ DeepFM·DIN 등 모델이 학습/배포 — pCTR·pCVR 산출' },
        { from: 'pctr-cvr', to: 'calibration', caption: '⑤ 예측값을 실제 분포에 맞게 Calibration' },
        { from: 'calibration', to: 'dsp', caption: '⑥ 보정된 모델이 DSP의 서빙 파이프라인에 배포' },
        { from: 'dsp', to: 'exchange', caption: '⑦ 다음 입찰부터 새 모델 기반 점수로 입찰가 결정' },
      ]
    },
    attribution: {
      label: '어트리뷰션',
      steps: [
        { from: 'user', to: 'publisher', caption: '① 사용자가 광고를 본 후 시간이 흐름…' },
        { from: 'user-journey', to: 'log-pipeline', caption: '② Impression·Click·Conversion 이벤트가 모두 기록' },
        { from: 'log-pipeline', to: 'mmp', caption: '③ MMP가 Last-Click·Multi-Touch 등 모델로 기여도 분배' },
        { from: 'mmp', to: 'advertiser', caption: '④ Advertiser가 ROAS·전환 리포트를 받음' },
        { from: 'advertiser', to: 'dsp', caption: '⑤ 광고주가 KPI에 맞춰 DSP 캠페인 예산·입찰 전략 조정' },
        { from: 'dsp', to: 'exchange', caption: '⑥ 조정된 전략으로 다음 입찰에 반영' },
      ]
    },
    hb: {
      label: 'Header Bidding',
      steps: [
        { from: 'user', to: 'publisher', caption: '① 사용자가 Publisher 페이지 방문' },
        { from: 'publisher', to: 'header-bidding', caption: '② Header Bidding 컨테이너가 페이지 헤더에서 실행' },
        { from: 'header-bidding', to: 'ssp', caption: '③ 여러 SSP를 동시(병렬) 호출 — Waterfall 아닌 경매' },
        { from: 'ssp', to: 'exchange', caption: '④ 각 SSP가 Ad Exchange로 Bid Request 전달' },
        { from: 'exchange', to: 'dsp', caption: '⑤ DSP들이 병렬로 입찰 — 최고가 경쟁' },
        { from: 'exchange', to: 'publisher', caption: '⑥ 가장 비싼 Winner가 Publisher에 광고 전달 (평균 +10~30% 수익)' },
      ]
    },
    targeting: {
      label: '데이터·타겟팅',
      steps: [
        { from: 'user-journey', to: 'cmp', caption: '① 사용자가 사이트 방문 → CMP가 동의(GDPR·CCPA) 처리' },
        { from: 'cmp', to: 'dmp', caption: '② 동의된 데이터만 DMP/CDP로 흘러감 (쿠키·디바이스 ID·1st party)' },
        { from: 'dmp', to: 'dsp', caption: '③ 오디언스 세그먼트(예: "20대 전자제품 관심")가 DSP의 타겟팅 입력' },
        { from: 'dsp', to: 'exchange', caption: '④ DSP가 세그먼트 기반으로 입찰가 결정 — 맞는 유저에 더 비싸게' },
        { from: 'exchange', to: 'publisher', caption: '⑤ 타겟팅된 사용자에게 개인화 광고 노출' },
      ]
    },
  };

  const CAT_LABEL = {
    buy: 'Buy Side', exchange: 'Exchange', sell: 'Sell Side',
    ml: 'ML / Models', measurement: 'Measurement', user: 'User / Privacy'
  };

  // ── state ──
  let svg, tooltip, sidePanel, captionEl, wrapEl;
  let flowChips = [];
  let isFlowing = false;

  function init() {
    svg = document.getElementById('eco-graph');
    if (!svg) return;
    tooltip = document.getElementById('eco-tooltip');
    sidePanel = document.getElementById('eco-side-panel');
    captionEl = document.getElementById('eco-flow-caption');
    wrapEl = document.getElementById('eco-graph-wrap');
    flowChips = Array.from(document.querySelectorAll('.eco-flow-chip'));

    buildSVG();
    bindInteractions();
    flowChips.forEach(chip => {
      chip.addEventListener('click', () => playFlow(chip.dataset.flow, chip));
    });
  }

  function buildSVG() {
    const edgesG = document.createElementNS(SVG_NS, 'g');
    edgesG.setAttribute('class', 'eco-edges');
    EDGES.forEach(e => edgesG.appendChild(createEdgePath(e)));
    svg.appendChild(edgesG);

    const nodesG = document.createElementNS(SVG_NS, 'g');
    nodesG.setAttribute('class', 'eco-nodes');
    Object.entries(NODES).forEach(([id, n]) => nodesG.appendChild(createNodeGroup(id, n)));
    svg.appendChild(nodesG);

    const dotsG = document.createElementNS(SVG_NS, 'g');
    dotsG.setAttribute('class', 'eco-flow-dots');
    dotsG.setAttribute('id', 'eco-flow-dots');
    svg.appendChild(dotsG);
  }

  function createNodeGroup(id, n) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'eco-node');
    g.setAttribute('data-node', id);
    g.setAttribute('data-category', n.cat);
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `${n.name} — ${n.sub}`);

    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('class', 'eco-node-rect');
    rect.setAttribute('x', n.x);
    rect.setAttribute('y', n.y);
    rect.setAttribute('width', n.w);
    rect.setAttribute('height', n.h);
    rect.setAttribute('rx', 10);
    g.appendChild(rect);

    const title = document.createElementNS(SVG_NS, 'text');
    title.setAttribute('class', 'eco-node-title');
    title.setAttribute('x', n.x + n.w / 2);
    title.setAttribute('y', n.y + n.h / 2 - 4);
    title.textContent = n.name;
    g.appendChild(title);

    if (n.sub) {
      const sub = document.createElementNS(SVG_NS, 'text');
      sub.setAttribute('class', 'eco-node-sub');
      sub.setAttribute('x', n.x + n.w / 2);
      sub.setAttribute('y', n.y + n.h / 2 + 12);
      sub.textContent = n.sub;
      g.appendChild(sub);
    }
    return g;
  }

  function nodeCenter(id) {
    const n = NODES[id];
    return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
  }

  function nodeEdge(fromId, toId) {
    // 노드 사이를 잇는 점에서 노드 경계 직전까지의 점
    const a = NODES[fromId];
    const b = NODES[toId];
    const aC = nodeCenter(fromId);
    const bC = nodeCenter(toId);
    const dx = bC.x - aC.x, dy = bC.y - aC.y;
    const len = Math.hypot(dx, dy) || 1;
    const padA = Math.min(a.w, a.h) / 2;
    const padB = Math.min(b.w, b.h) / 2;
    return {
      ax: aC.x + (dx / len) * padA,
      ay: aC.y + (dy / len) * padA,
      bx: bC.x - (dx / len) * padB,
      by: bC.y - (dy / len) * padB
    };
  }

  function createEdgePath(e) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('class', 'eco-edge');
    p.setAttribute('data-from', e.from);
    p.setAttribute('data-to', e.to);
    const pts = nodeEdge(e.from, e.to);
    p.setAttribute('d', `M ${pts.ax} ${pts.ay} L ${pts.bx} ${pts.by}`);
    return p;
  }

  function bindInteractions() {
    svg.addEventListener('mouseover', (ev) => {
      const node = ev.target.closest('.eco-node');
      if (node) showTooltip(node);
    });
    svg.addEventListener('mouseout', (ev) => {
      const node = ev.target.closest('.eco-node');
      if (node) hideTooltip();
    });
    svg.addEventListener('click', (ev) => {
      const node = ev.target.closest('.eco-node');
      if (node) activate(node.dataset.node);
    });
    svg.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      const node = ev.target.closest('.eco-node');
      if (node) { ev.preventDefault(); activate(node.dataset.node); }
    });
  }

  function showTooltip(nodeEl) {
    const id = nodeEl.dataset.node;
    const n = NODES[id];
    if (!n) return;
    const rect = nodeEl.getBoundingClientRect();
    const wrap = wrapEl.getBoundingClientRect();
    tooltip.innerHTML = `
      <strong>${n.name}</strong>
      <div>${n.def}</div>
      <div class="eco-tooltip-cat" data-category="${n.cat}">${CAT_LABEL[n.cat]}</div>
    `;
    tooltip.style.left = (rect.left - wrap.left + rect.width / 2) + 'px';
    tooltip.style.top = (rect.top - wrap.top) + 'px';
    tooltip.classList.add('is-visible');
  }

  function hideTooltip() {
    tooltip.classList.remove('is-visible');
  }

  function activate(id) {
    document.querySelectorAll('.eco-node.is-active').forEach(n => n.classList.remove('is-active'));
    document.querySelector(`.eco-node[data-node="${id}"]`)?.classList.add('is-active');
    renderSidePanel(id);
  }

  function renderSidePanel(id) {
    const n = NODES[id];
    if (!n) return;
    const demos = n.demos || [];
    const posts = n.posts || [];

    const demoChips = demos.length
      ? `<div class="eco-side-chips">${demos.map(d =>
          `<a class="eco-side-chip is-demo" href="${d.url}">${d.name}</a>`).join('')}</div>`
      : `<div class="eco-side-empty-section">관련 데모 없음</div>`;

    const postChips = posts.length
      ? `<div class="eco-side-chips">${posts.map(p =>
          `<a class="eco-side-chip is-post" href="post.html?id=${p.id}">${p.title}</a>`).join('')}</div>`
      : `<div class="eco-side-empty-section">관련 포스트 없음</div>`;

    sidePanel.innerHTML = `
      <div class="eco-side-name">${n.name}</div>
      <div class="eco-side-sub">${n.sub}</div>
      <div class="eco-side-cat-tag" data-category="${n.cat}">${CAT_LABEL[n.cat]}</div>
      <div class="eco-side-definition">${n.def}</div>
      <div class="eco-side-section">
        <div class="eco-side-section-title">관련 데모</div>
        ${demoChips}
      </div>
      <div class="eco-side-section">
        <div class="eco-side-section-title">관련 포스트</div>
        ${postChips}
      </div>
    `;
  }

  // ── Flow animation ──
  function playFlow(name, chipEl) {
    if (isFlowing) return;
    const flow = FLOWS[name] || FLOWS.rtb;
    if (!flow) return;
    isFlowing = true;
    flowChips.forEach(c => c.disabled = true);
    if (chipEl) chipEl.classList.add('is-playing');
    captionEl.classList.add('is-visible');

    document.querySelectorAll('.eco-edge.is-active').forEach(e => e.classList.remove('is-active'));
    const dotsG = document.getElementById('eco-flow-dots');
    if (dotsG) dotsG.innerHTML = '';

    const steps = flow.steps;
    let i = 0;
    function nextStep() {
      if (i >= steps.length) {
        isFlowing = false;
        flowChips.forEach(c => { c.disabled = false; c.classList.remove('is-playing'); });
        setTimeout(() => {
          captionEl.classList.remove('is-visible');
          document.querySelectorAll('.eco-edge.is-active').forEach(e => e.classList.remove('is-active'));
        }, 1500);
        return;
      }
      const step = steps[i++];
      captionEl.textContent = step.caption;
      highlightEdge(step.from, step.to);
      animateDot(step.from, step.to, () => setTimeout(nextStep, 100));
    }
    nextStep();
  }

  function highlightEdge(from, to) {
    const edge = document.querySelector(`.eco-edge[data-from="${from}"][data-to="${to}"]`)
              || document.querySelector(`.eco-edge[data-from="${to}"][data-to="${from}"]`);
    if (edge) edge.classList.add('is-active');
  }

  function animateDot(fromId, toId, done) {
    const pts = nodeEdge(fromId, toId);
    const dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('class', 'eco-flow-dot');
    dot.setAttribute('r', 7);
    dot.setAttribute('cx', pts.ax);
    dot.setAttribute('cy', pts.ay);
    document.getElementById('eco-flow-dots').appendChild(dot);

    const duration = 500;
    const start = performance.now();
    function tick(t) {
      const elapsed = t - start;
      const ratio = Math.min(elapsed / duration, 1);
      const ease = ratio * (2 - ratio); // easeOutQuad
      dot.setAttribute('cx', pts.ax + (pts.bx - pts.ax) * ease);
      dot.setAttribute('cy', pts.ay + (pts.by - pts.ay) * ease);
      if (ratio < 1) requestAnimationFrame(tick);
      else { dot.remove(); done(); }
    }
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
