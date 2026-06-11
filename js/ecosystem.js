/* Ecosystem Map — interactive SVG graph with guided flow playback (v4) */
(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOVE_MS = 900;   // 패킷이 한 엣지를 이동하는 시간
  const READ_MS = 1700;  // 자동재생 시 각 스텝 후 읽기 시간

  // 18 nodes (6 카테고리). 좌표는 viewBox 1240x720 기준.
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

  // bend: 곡선 휨 정도(px). 진행 방향 기준 왼쪽 법선으로 제어점이 이동 —
  // 같은 노드쌍의 왕복 엣지는 같은 양수 bend로 서로 반대편에 분리됨.
  const EDGES = [
    // ── 메인 RTB 흐름 ──
    { from: 'user', to: 'publisher', bend: 22 },
    { from: 'publisher', to: 'user', bend: 22 },          // 광고 노출 (RTB ⑨)
    { from: 'publisher', to: 'ssp' },
    { from: 'ssp', to: 'exchange' },
    { from: 'exchange', to: 'dsp', bend: 26 },
    { from: 'dsp', to: 'exchange', bend: 26 },
    { from: 'dsp', to: 'advertiser', bend: 26 },
    { from: 'brand', to: 'advertiser' },

    // ── ML 흐름 ──
    { from: 'feature-store', to: 'model-serving' },
    { from: 'model-serving', to: 'pctr-cvr' },
    { from: 'pctr-cvr', to: 'calibration' },
    { from: 'dsp', to: 'model-serving', bend: -40 },      // pCTR/pCVR 박스 우회
    { from: 'exchange', to: 'auction' },
    { from: 'auction', to: 'pctr-cvr' },

    // ── Buy/Sell 부속 ──
    { from: 'dmp', to: 'dsp' },
    { from: 'dco', to: 'dsp' },
    { from: 'ssp', to: 'header-bidding', bend: 26 },

    // ── Measurement 흐름 ──
    { from: 'publisher', to: 'log-pipeline' },
    { from: 'user', to: 'log-pipeline' },                 // 행동 로그 (RTB ⑩)
    { from: 'log-pipeline', to: 'mmp' },
    { from: 'log-pipeline', to: 'feature-store', bend: -40 }, // Publisher 박스 우회
    { from: 'mmp', to: 'advertiser', bend: 70 },          // Log Pipeline 박스 우회
    { from: 'user-journey', to: 'log-pipeline' },

    // ── Privacy ──
    { from: 'cmp', to: 'dmp', bend: -45 },                // DCO 박스 우회
    { from: 'user-journey', to: 'cmp' },

    // ── 추가 흐름용 엣지 ──
    { from: 'calibration', to: 'dsp' },                   // 새 모델 배포
    { from: 'advertiser', to: 'dsp', bend: 26 },          // 어트리뷰션 후 KPI 조정
    { from: 'publisher', to: 'header-bidding' },          // HB 컨테이너 실행
    { from: 'header-bidding', to: 'ssp', bend: 26 },      // HB가 여러 SSP를 동시 호출
    { from: 'exchange', to: 'publisher', bend: 80 },      // Winner 광고 전달 (SSP 아래로 우회)
  ];

  // 패킷 종류: 지금 이동 중인 것이 "무엇"인지.
  // request=요청, money=돈·입찰가, creative=광고 소재, data=데이터·로그
  const FLOWS = {
    rtb: {
      label: '100ms RTB',
      summary: '사용자가 페이지를 연 순간부터 광고가 뜨기까지 약 0.1초. 그 안에 요청 → 경매 → 예측 → 입찰 → 낙찰 → 노출이 모두 일어나고, 마지막 로그는 다시 모델 학습의 재료가 됩니다.',
      steps: [
        {
          from: 'user', to: 'publisher',
          caption: '사용자가 페이지·앱을 방문 — 광고 슬롯 발견',
          detail: '사용자가 뉴스 앱을 여는 순간, 페이지 안에 광고를 채워야 할 빈 칸(슬롯)이 생깁니다. 이 빈 칸이 지금부터 일어날 모든 일의 시작점입니다.',
          packet: { label: '페이지 방문', kind: 'request' }
        },
        {
          from: 'publisher', to: 'ssp',
          caption: 'Publisher가 SSP에 광고 요청 (Ad Request)',
          detail: 'Publisher는 "이 빈 칸 채워줘"라고 SSP에 부탁합니다. 어떤 지면인지, 어떤 사용자인지에 대한 정보가 함께 갑니다.',
          packet: { label: '광고 요청', kind: 'request' }
        },
        {
          from: 'ssp', to: 'exchange',
          caption: 'SSP가 Ad Exchange에 Bid Request 발송',
          detail: 'SSP는 이 지면을 거래소(Ad Exchange)에 경매로 내놓습니다. "이 자리 살 사람?"이라는 입찰 요청서가 Bid Request입니다.',
          packet: { label: 'Bid Request', kind: 'request' }
        },
        {
          from: 'exchange', to: 'dsp',
          caption: 'Ad Exchange가 여러 DSP에 동시 Bid Request 분배',
          detail: '거래소는 여러 DSP에게 한꺼번에 요청서를 뿌립니다. 지금부터 DSP들은 약 0.1초 안에 답해야 합니다.',
          packet: { label: 'Bid Request', kind: 'request' }
        },
        {
          from: 'dsp', to: 'model-serving',
          caption: 'DSP가 Model Serving에 점수 요청',
          detail: 'DSP는 "이 사용자가 이 광고를 클릭할까?"를 자기 모델에게 물어봅니다. 입찰가를 정하려면 이 답이 필요합니다.',
          packet: { label: '점수 계산 요청', kind: 'request' }
        },
        {
          from: 'model-serving', to: 'pctr-cvr',
          caption: 'pCTR / pCVR 모델이 클릭·전환 확률 예측',
          detail: '모델이 클릭 확률(예: 2.3%)을 계산합니다. 이 숫자가 곧 입찰가의 근거가 됩니다 — 확률이 높을수록 비싸게 부를 가치가 있으니까요.',
          packet: { label: 'pCTR 2.3%', kind: 'data' }
        },
        {
          from: 'dsp', to: 'exchange',
          caption: 'DSP가 Bid 응답 — Bid Shading으로 입찰가 조정',
          detail: 'DSP가 "이 노출에 1,200원 내겠다"고 응답합니다. 예상 가치보다 살짝 낮춰 부르는 기술이 Bid Shading입니다.',
          packet: { label: '입찰가 1,200원', kind: 'money' }
        },
        {
          from: 'exchange', to: 'publisher',
          caption: 'Auction Engine이 Winner 결정 → Publisher에 광고 전달',
          detail: '최고가를 부른 DSP가 낙찰됩니다. 이긴 광고의 이미지·문구(소재)가 Publisher 쪽으로 전달됩니다.',
          packet: { label: '낙찰 광고 소재', kind: 'creative' }
        },
        {
          from: 'publisher', to: 'user',
          caption: '사용자에게 광고 노출 (Impression)',
          detail: '사용자 화면에 광고가 뜹니다. 페이지를 연 순간부터 여기까지 걸린 시간이 약 0.1초 — 눈 깜빡할 새에 경매가 끝난 겁니다.',
          packet: { label: '광고 노출', kind: 'creative' }
        },
        {
          from: 'user', to: 'log-pipeline',
          caption: '행동 로그가 Log Pipeline으로 수집',
          detail: '봤는지(Impression)·눌렀는지(Click)·샀는지(Conversion)가 전부 로그로 쌓입니다. 이 로그가 내일의 모델을 학습시키는 재료입니다.',
          packet: { label: '노출·클릭 로그', kind: 'data' }
        },
      ]
    },
    modeling: {
      label: '모델 학습·서빙',
      summary: '어제의 클릭 로그가 가공 → 학습 → 보정 → 배포를 거쳐 오늘의 입찰가를 바꿉니다. 광고 ML은 이 순환을 매일 돌리는 일입니다.',
      steps: [
        {
          from: 'user-journey', to: 'log-pipeline',
          caption: '사용자 행동(노출·클릭·전환)이 Log Pipeline에 수집',
          detail: '어제 하루 동안 쌓인 노출·클릭·전환 기록이 전부 모입니다. 모델 학습의 원재료입니다.',
          packet: { label: '행동 로그', kind: 'data' }
        },
        {
          from: 'log-pipeline', to: 'feature-store',
          caption: '가공된 피처가 Feature Store에 갱신',
          detail: '원시 로그를 "이 유저의 최근 7일 클릭률" 같은 모델 입력값(피처)으로 가공해 저장합니다.',
          packet: { label: '가공된 피처', kind: 'data' }
        },
        {
          from: 'feature-store', to: 'model-serving',
          caption: '오프라인 학습 데이터셋 구성',
          detail: '피처와 정답(클릭했나 안 했나)을 짝지어 학습용 데이터셋을 만듭니다.',
          packet: { label: '학습 데이터셋', kind: 'data' }
        },
        {
          from: 'model-serving', to: 'pctr-cvr',
          caption: 'DeepFM·DIN 등 모델 학습 — pCTR·pCVR 산출',
          detail: '새 데이터로 모델을 다시 학습합니다. 어제의 트렌드가 모델 안에 반영되는 순간입니다.',
          packet: { label: '새 모델', kind: 'data' }
        },
        {
          from: 'pctr-cvr', to: 'calibration',
          caption: '예측값을 실제 분포에 맞게 Calibration',
          detail: '모델 예측 평균이 실제 클릭률 평균과 같아지게 보정합니다. 안 하면 입찰가 전체가 부풀거나 쪼그라듭니다.',
          packet: { label: '보정된 예측값', kind: 'data' }
        },
        {
          from: 'calibration', to: 'dsp',
          caption: '보정된 모델이 DSP 서빙 파이프라인에 배포',
          detail: '검증을 통과한 새 모델이 실제 트래픽을 받는 서버에 올라갑니다.',
          packet: { label: '새 모델 배포', kind: 'data' }
        },
        {
          from: 'dsp', to: 'exchange',
          caption: '다음 입찰부터 새 모델 기반 점수로 입찰',
          detail: '여기부터는 RTB 흐름과 연결됩니다. 어제의 로그가 오늘의 입찰가를 바꾸는 순환 고리가 완성됐습니다.',
          packet: { label: '새 모델로 입찰', kind: 'money' }
        },
      ]
    },
    attribution: {
      label: '어트리뷰션',
      summary: '전환 하나가 일어나면 로그 매칭 → 기여도 판정 → 리포트 → 예산 조정으로 이어집니다. 측정이 다시 입찰을 바꾸는 성과 피드백 루프입니다.',
      steps: [
        {
          from: 'user', to: 'publisher',
          caption: '사용자가 광고를 본 후 시간이 흐름…',
          detail: '광고를 보고 바로 사지 않아도, 며칠 뒤의 구매가 그 광고 덕분일 수 있습니다. 그래서 "누구 공인지 따지는" 절차가 필요합니다.',
          packet: { label: '광고 접촉', kind: 'request' }
        },
        {
          from: 'user-journey', to: 'log-pipeline',
          caption: 'Impression·Click·Conversion 이벤트가 모두 기록',
          detail: '사용자가 거쳐간 모든 접점(본 광고, 누른 광고, 최종 구매)이 시간 순서대로 로그에 남아 있습니다.',
          packet: { label: '접점 기록', kind: 'data' }
        },
        {
          from: 'log-pipeline', to: 'mmp',
          caption: 'MMP가 Last-Click·Multi-Touch 모델로 기여도 분배',
          detail: 'Last-Click이면 마지막 클릭이 공을 전부 가져가고, Multi-Touch면 거쳐간 광고들이 나눠 가집니다. 규칙에 따라 성과표가 완전히 달라집니다.',
          packet: { label: '매칭된 로그', kind: 'data' }
        },
        {
          from: 'mmp', to: 'advertiser',
          caption: 'Advertiser가 ROAS·전환 리포트를 받음',
          detail: '"광고비 100만원 → 매출 300만원 (ROAS 300%)" 같은 성적표를 받습니다.',
          packet: { label: 'ROAS 리포트', kind: 'data' }
        },
        {
          from: 'advertiser', to: 'dsp',
          caption: '광고주가 KPI에 맞춰 캠페인 예산·입찰 전략 조정',
          detail: '성과 좋은 캠페인에 예산을 더 싣고, 나쁜 캠페인은 줄이거나 끕니다.',
          packet: { label: '예산·전략 조정', kind: 'money' }
        },
        {
          from: 'dsp', to: 'exchange',
          caption: '조정된 전략이 다음 입찰에 반영',
          detail: '측정 결과가 다시 입찰을 바꿉니다. 광고는 한 방향 파이프가 아니라 빙글빙글 도는 피드백 루프입니다.',
          packet: { label: '조정된 입찰', kind: 'money' }
        },
      ]
    },
    hb: {
      label: 'Header Bidding',
      summary: 'SSP들을 한 줄로 세우지 않고 동시에 경쟁시키는 것만으로 매체 수익이 평균 +10~30% 오릅니다. "병렬 경쟁 = 더 비싼 가격"이 핵심입니다.',
      steps: [
        {
          from: 'user', to: 'publisher',
          caption: '사용자가 Publisher 페이지 방문',
          detail: '페이지가 로딩되는 그 짧은 순간에 모든 일이 벌어집니다.',
          packet: { label: '페이지 방문', kind: 'request' }
        },
        {
          from: 'publisher', to: 'header-bidding',
          caption: 'Header Bidding 컨테이너가 페이지 헤더에서 실행',
          detail: '페이지 머리(header)에 심어둔 자바스크립트(Prebid.js 등)가 본문보다 먼저 실행됩니다. 그래서 이름이 "Header" Bidding입니다.',
          packet: { label: 'HB 컨테이너 실행', kind: 'request' }
        },
        {
          from: 'header-bidding', to: 'ssp',
          caption: '여러 SSP를 동시(병렬) 호출 — Waterfall이 아닌 경매',
          detail: '예전 Waterfall 방식은 SSP를 한 줄로 세워 차례로 물었습니다. 동시에 물으면 경쟁이 세져서 가격이 올라갑니다.',
          packet: { label: '동시 입찰 요청', kind: 'request' }
        },
        {
          from: 'ssp', to: 'exchange',
          caption: '각 SSP가 Ad Exchange로 Bid Request 전달',
          detail: '각 SSP는 자기가 연결된 거래소로 요청을 보내 입찰을 모읍니다.',
          packet: { label: 'Bid Request', kind: 'request' }
        },
        {
          from: 'exchange', to: 'dsp',
          caption: 'DSP들이 병렬로 입찰 — 최고가 경쟁',
          detail: '여러 거래소의 DSP들이 같은 지면 하나를 두고 동시에 가격을 부릅니다.',
          packet: { label: '병렬 입찰', kind: 'money' }
        },
        {
          from: 'exchange', to: 'publisher',
          caption: '가장 비싼 Winner가 Publisher에 광고 전달',
          detail: '전부 동시에 경쟁시킨 결과, Waterfall 대비 평균 +10~30% 비싸게 팔립니다. 매체들이 HB를 쓰는 이유입니다.',
          packet: { label: '최고가 낙찰', kind: 'money' }
        },
      ]
    },
    targeting: {
      label: '데이터·타겟팅',
      summary: '동의 → 수집 → 세그먼트 → 입찰 가중 → 개인화 노출. 동의받은 데이터가 광고 가격과 내용을 바꾸는 길입니다.',
      steps: [
        {
          from: 'user-journey', to: 'cmp',
          caption: '사용자가 사이트 방문 → CMP가 동의(GDPR·CCPA) 처리',
          detail: '사이트 첫 방문 때 뜨는 "쿠키를 허용하시겠습니까?" 팝업이 CMP입니다. 여기서 허락된 데이터만 쓸 수 있습니다.',
          packet: { label: '동의 여부', kind: 'data' }
        },
        {
          from: 'cmp', to: 'dmp',
          caption: '동의된 데이터만 DMP/CDP로 흘러감',
          detail: '동의받은 쿠키·디바이스 ID·구매 이력이 오디언스 데이터 창고(DMP/CDP)에 모입니다.',
          packet: { label: '동의된 데이터', kind: 'data' }
        },
        {
          from: 'dmp', to: 'dsp',
          caption: '오디언스 세그먼트가 DSP의 타겟팅 입력으로',
          detail: '"20대 · 전자제품 관심"처럼 묶음(세그먼트)으로 가공돼 DSP에 전달됩니다. 개인이 아니라 묶음 단위라는 게 포인트.',
          packet: { label: '오디언스 세그먼트', kind: 'data' }
        },
        {
          from: 'dsp', to: 'exchange',
          caption: 'DSP가 세그먼트 기반으로 입찰가 결정',
          detail: '내 타겟과 맞는 사용자가 나타나면 더 비싸게 부릅니다. 데이터가 곧 입찰가 차이를 만듭니다.',
          packet: { label: '타겟 입찰', kind: 'money' }
        },
        {
          from: 'exchange', to: 'publisher',
          caption: '타겟팅된 사용자에게 개인화 광고 노출',
          detail: '결과적으로 같은 지면이라도 사람마다 다른 광고를 보게 됩니다.',
          packet: { label: '개인화 광고', kind: 'creative' }
        },
      ]
    },
  };

  const CAT_LABEL = {
    buy: 'Buy Side', exchange: 'Exchange', sell: 'Sell Side',
    ml: 'ML / Models', measurement: 'Measurement', user: 'User / Privacy'
  };

  // ── state ──
  let svg, tooltip, captionEl, progressEl, wrapEl;
  let nodePanel, flowPanel, flowPanelTitle, stepsOl, summaryEl, sidePanelEl;
  let flowBar, playBtn, returnStrip, returnBtn;
  let flowChips = [];
  let packetG, packetRect, packetText;
  let stepLis = [];
  const edgeMap = new Map();   // 'from|to' → <path>
  const nodeElMap = new Map(); // id → <g>

  // flow state machine
  const fs = { name: null, flow: null, i: -1, playing: false, ended: false, timer: null, raf: null };

  function init() {
    svg = document.getElementById('eco-graph');
    if (!svg) return;
    tooltip = document.getElementById('eco-tooltip');
    wrapEl = document.getElementById('eco-graph-wrap');
    captionEl = document.getElementById('eco-flow-caption');
    progressEl = document.getElementById('eco-flow-progress');
    flowBar = document.getElementById('eco-flow-bar');
    playBtn = document.getElementById('eco-playpause');
    nodePanel = document.getElementById('eco-node-panel');
    flowPanel = document.getElementById('eco-flow-panel');
    flowPanelTitle = document.getElementById('eco-flow-panel-title');
    stepsOl = document.getElementById('eco-steps');
    summaryEl = document.getElementById('eco-flow-summary');
    sidePanelEl = document.getElementById('eco-side-panel');
    returnStrip = document.getElementById('eco-flow-return');
    returnBtn = document.getElementById('eco-flow-return-btn');
    flowChips = Array.from(document.querySelectorAll('.eco-flow-chip'));

    buildSVG();
    bindInteractions();
    bindFlowControls();
    applyCompact();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(applyCompact, 150);
    });
  }

  function applyCompact() {
    const compact = wrapEl.clientWidth < 640;
    svg.classList.toggle('is-compact', compact);
    if (fs.name && fs.i >= 0) stylePacket(fs.flow.steps[fs.i]);
  }

  // ── SVG build ──
  function buildSVG() {
    svg.appendChild(createDefs());

    const edgesG = document.createElementNS(SVG_NS, 'g');
    edgesG.setAttribute('class', 'eco-edges');
    EDGES.forEach(e => edgesG.appendChild(createEdgePath(e)));
    svg.appendChild(edgesG);

    const nodesG = document.createElementNS(SVG_NS, 'g');
    nodesG.setAttribute('class', 'eco-nodes');
    Object.entries(NODES).forEach(([id, n]) => {
      const g = createNodeGroup(id, n);
      nodeElMap.set(id, g);
      nodesG.appendChild(g);
    });
    svg.appendChild(nodesG);

    svg.appendChild(createPacket());
  }

  function createDefs() {
    const defs = document.createElementNS(SVG_NS, 'defs');
    [
      ['eco-arrow', 'eco-arrow-head'],
      ['eco-arrow-done', 'eco-arrow-head-done'],
      ['eco-arrow-active', 'eco-arrow-head-active'],
    ].forEach(([id, cls]) => {
      const m = document.createElementNS(SVG_NS, 'marker');
      m.setAttribute('id', id);
      m.setAttribute('viewBox', '0 0 10 10');
      m.setAttribute('refX', '8.5');
      m.setAttribute('refY', '5');
      m.setAttribute('markerWidth', '9');
      m.setAttribute('markerHeight', '9');
      m.setAttribute('markerUnits', 'userSpaceOnUse');
      m.setAttribute('orient', 'auto');
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', 'M 0 1 L 9 5 L 0 9 Z');
      p.setAttribute('class', cls);
      m.appendChild(p);
      defs.appendChild(m);
    });
    return defs;
  }

  function createPacket() {
    packetG = document.createElementNS(SVG_NS, 'g');
    packetG.setAttribute('class', 'eco-packet');
    packetG.style.display = 'none';
    packetRect = document.createElementNS(SVG_NS, 'rect');
    packetText = document.createElementNS(SVG_NS, 'text');
    packetText.setAttribute('x', '0');
    packetText.setAttribute('y', '0');
    packetText.setAttribute('dy', '0.36em');
    packetG.appendChild(packetRect);
    packetG.appendChild(packetText);
    return packetG;
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

  // 곡선(quadratic bezier) 기하: 제어점은 코드 중점에서 법선 방향으로 bend만큼,
  // 양 끝점은 노드 중심에서 제어점을 향해 노드 반경만큼 나간 지점.
  function edgeGeometry(e) {
    const a = NODES[e.from];
    const b = NODES[e.to];
    const aC = nodeCenter(e.from);
    const bC = nodeCenter(e.to);
    const dx = bC.x - aC.x, dy = bC.y - aC.y;
    const len = Math.hypot(dx, dy) || 1;
    const bend = e.bend || 0;
    const cx = (aC.x + bC.x) / 2 + (dy / len) * bend;
    const cy = (aC.y + bC.y) / 2 - (dx / len) * bend;
    const padA = Math.min(a.w, a.h) / 2;
    const padB = Math.min(b.w, b.h) / 2;
    const aLen = Math.hypot(cx - aC.x, cy - aC.y) || 1;
    const bLen = Math.hypot(cx - bC.x, cy - bC.y) || 1;
    return {
      bend, cx, cy,
      ax: aC.x + (cx - aC.x) / aLen * padA,
      ay: aC.y + (cy - aC.y) / aLen * padA,
      bx: bC.x + (cx - bC.x) / bLen * padB,
      by: bC.y + (cy - bC.y) / bLen * padB
    };
  }

  function createEdgePath(e) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('class', 'eco-edge');
    p.setAttribute('data-from', e.from);
    p.setAttribute('data-to', e.to);
    const g = edgeGeometry(e);
    p.setAttribute('d', g.bend
      ? `M ${g.ax} ${g.ay} Q ${g.cx} ${g.cy} ${g.bx} ${g.by}`
      : `M ${g.ax} ${g.ay} L ${g.bx} ${g.by}`);
    p.setAttribute('marker-end', 'url(#eco-arrow)');
    edgeMap.set(e.from + '|' + e.to, p);
    return p;
  }

  function findEdgeAny(from, to) {
    const fwd = edgeMap.get(from + '|' + to);
    if (fwd) return { el: fwd, reversed: false };
    const rev = edgeMap.get(to + '|' + from);
    return rev ? { el: rev, reversed: true } : null;
  }

  // 상태: '' | 'done' | 'active' — 클래스와 화살표 마커를 함께 전환
  function setEdgeFlowState(el, state) {
    el.classList.toggle('is-done', state === 'done');
    el.classList.toggle('is-active', state === 'active');
    const marker = state === 'active' ? 'eco-arrow-active' : state === 'done' ? 'eco-arrow-done' : 'eco-arrow';
    el.setAttribute('marker-end', `url(#${marker})`);
  }

  // ── node interactions (tooltip / side panel) ──
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
    nodeElMap.get(id)?.classList.add('is-active');
    renderSidePanel(id);

    // 흐름 재생 중 노드를 클릭하면: 일시정지하고 노드 상세로 전환 + 복귀 스트립 표시
    if (fs.name) {
      pause();
      flowPanel.hidden = true;
      nodePanel.hidden = false;
      returnBtn.textContent = `◀ 흐름 패널로 돌아가기 (${fs.i + 1}/${fs.flow.steps.length} 단계)`;
      returnStrip.hidden = false;
    }
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

    nodePanel.innerHTML = `
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

  // ── flow engine (state machine) ──
  function bindFlowControls() {
    flowChips.forEach(chip => {
      chip.addEventListener('click', () => {
        if (fs.name === chip.dataset.flow) { exitFlow(); return; } // 같은 칩 재클릭 = 정지
        startFlow(chip.dataset.flow, chip);
      });
    });
    playBtn.addEventListener('click', () => { fs.playing ? pause() : play(); });
    document.getElementById('eco-prev').addEventListener('click', prev);
    document.getElementById('eco-next').addEventListener('click', next);
    document.getElementById('eco-flow-exit').addEventListener('click', exitFlow);
    returnBtn.addEventListener('click', () => {
      returnStrip.hidden = true;
      nodePanel.hidden = true;
      flowPanel.hidden = false;
    });
    stepsOl.addEventListener('click', (ev) => {
      const li = ev.target.closest('.eco-step');
      if (li) jumpTo(parseInt(li.dataset.step, 10));
    });
  }

  function startFlow(name, chip) {
    if (fs.name) exitFlow();
    const flow = FLOWS[name];
    if (!flow) return;

    fs.name = name;
    fs.flow = flow;
    fs.ended = false;
    fs.playing = !REDUCED;

    flowChips.forEach(c => c.classList.toggle('is-selected', c === chip));
    svg.classList.add('is-flowing');
    flowBar.hidden = false;
    buildStepList(flow);
    flowPanelTitle.textContent = `▶ ${flow.label} — 단계별 설명`;
    summaryEl.hidden = true;
    nodePanel.hidden = true;
    returnStrip.hidden = true;
    flowPanel.hidden = false;
    packetG.style.display = '';
    updatePlayBtn();

    goToStep(0, { animate: !REDUCED });
  }

  function buildStepList(flow) {
    stepsOl.innerHTML = flow.steps.map((s, idx) => `
      <li class="eco-step" data-step="${idx}">
        <button type="button" class="eco-step-btn">
          <span class="eco-step-num">${idx + 1}</span>
          <span class="eco-step-caption">${s.caption}</span>
        </button>
        <div class="eco-step-detail">
          <span class="eco-step-packet" data-kind="${s.packet.kind}">${s.packet.label}</span>
          ${s.detail}
        </div>
      </li>`).join('');
    stepLis = Array.from(stepsOl.querySelectorAll('.eco-step'));
  }

  function clearTimers() {
    if (fs.timer) { clearTimeout(fs.timer); fs.timer = null; }
    if (fs.raf) { cancelAnimationFrame(fs.raf); fs.raf = null; }
  }

  function markNodeFlow(id, cls) {
    const el = nodeElMap.get(id);
    if (!el) return;
    if (cls === 'is-step-active') el.classList.remove('is-step-done');
    if (cls === 'is-step-done' && el.classList.contains('is-step-active')) return;
    el.classList.add(cls);
  }

  // 멱등 렌더: 0..i-1은 done, i는 active로 전체를 다시 그림
  function renderStep(i) {
    const steps = fs.flow.steps;
    edgeMap.forEach(el => setEdgeFlowState(el, ''));
    nodeElMap.forEach(el => el.classList.remove('is-step-done', 'is-step-active'));

    for (let k = 0; k < i; k++) {
      const s = steps[k];
      const e = findEdgeAny(s.from, s.to);
      if (e) setEdgeFlowState(e.el, 'done');
      markNodeFlow(s.from, 'is-step-done');
      markNodeFlow(s.to, 'is-step-done');
    }

    const cur = steps[i];
    const ce = findEdgeAny(cur.from, cur.to);
    if (ce) setEdgeFlowState(ce.el, 'active');
    markNodeFlow(cur.from, 'is-step-active');
    markNodeFlow(cur.to, 'is-step-active');

    captionEl.innerHTML =
      `<span class="eco-step-packet" data-kind="${cur.packet.kind}">${cur.packet.label}</span>` +
      `<span class="eco-flow-caption-text">${cur.caption}</span>`;
    progressEl.textContent = `${i + 1} / ${steps.length}`;
    summaryEl.hidden = true;

    stepLis.forEach((li, k) => {
      li.classList.toggle('is-done', k < i);
      li.classList.toggle('is-current', k === i);
      if (k === i) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    const curLi = stepLis[i];
    // 패널 자체에 스크롤이 있을 때만 (모바일에서 페이지가 튀지 않도록)
    if (curLi && sidePanelEl.scrollHeight > sidePanelEl.clientHeight + 4) {
      curLi.scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' });
    }

    stylePacket(cur);
  }

  function stylePacket(step) {
    const pk = step.packet || { label: '', kind: 'request' };
    packetG.setAttribute('data-kind', pk.kind);
    if (svg.classList.contains('is-compact')) {
      packetText.textContent = '';
      packetRect.setAttribute('width', 26);
      packetRect.setAttribute('height', 14);
      packetRect.setAttribute('x', -13);
      packetRect.setAttribute('y', -7);
      packetRect.setAttribute('rx', 7);
    } else {
      packetText.textContent = pk.label;
      let w = 44;
      try { w = Math.max(44, packetText.getComputedTextLength() + 18); } catch (e) { /* 비표시 상태 등 */ }
      packetRect.setAttribute('width', w);
      packetRect.setAttribute('height', 22);
      packetRect.setAttribute('x', -w / 2);
      packetRect.setAttribute('y', -11);
      packetRect.setAttribute('rx', 11);
    }
  }

  function placePacket(x, y) {
    packetG.setAttribute('transform', `translate(${x} ${y})`);
  }

  function stepPathInfo(i) {
    const s = fs.flow.steps[i];
    return findEdgeAny(s.from, s.to);
  }

  function snapPacketToStepEnd() {
    const info = stepPathInfo(fs.i);
    if (!info) return;
    const total = info.el.getTotalLength();
    const pt = info.el.getPointAtLength(info.reversed ? 0 : total);
    placePacket(pt.x, pt.y);
  }

  function goToStep(i, opts) {
    clearTimers();
    const steps = fs.flow.steps;
    if (i >= steps.length) { endFlow(); return; }
    fs.i = Math.max(0, i);
    fs.ended = false;
    renderStep(fs.i);

    const info = stepPathInfo(fs.i);
    const animate = !!(opts && opts.animate) && !REDUCED && info;

    if (animate) {
      const total = info.el.getTotalLength();
      const startT = performance.now();
      const tick = (t) => {
        const ratio = Math.min((t - startT) / MOVE_MS, 1);
        const ease = ratio * (2 - ratio); // easeOutQuad
        const at = info.reversed ? (1 - ease) * total : ease * total;
        const pt = info.el.getPointAtLength(at);
        placePacket(pt.x, pt.y);
        if (ratio < 1) {
          fs.raf = requestAnimationFrame(tick);
        } else {
          fs.raf = null;
          if (fs.playing) fs.timer = setTimeout(() => goToStep(fs.i + 1, { animate: true }), READ_MS);
        }
      };
      fs.raf = requestAnimationFrame(tick);
    } else {
      if (info) snapPacketToStepEnd();
      if (fs.playing) fs.timer = setTimeout(() => goToStep(fs.i + 1, { animate: !REDUCED }), READ_MS);
    }
  }

  function endFlow() {
    clearTimers();
    fs.ended = true;
    fs.playing = false;
    updatePlayBtn();
    summaryEl.textContent = '방금 본 것 — ' + fs.flow.summary;
    summaryEl.hidden = false;
    captionEl.innerHTML = `<span class="eco-flow-caption-text"><strong>끝!</strong> ${fs.flow.summary}</span>`;
    progressEl.textContent = `${fs.flow.steps.length} / ${fs.flow.steps.length}`;
  }

  function play() {
    if (!fs.name) return;
    if (fs.ended) {
      fs.ended = false;
      summaryEl.hidden = true;
      fs.playing = true;
      updatePlayBtn();
      goToStep(0, { animate: !REDUCED });
      return;
    }
    fs.playing = true;
    updatePlayBtn();
    fs.timer = setTimeout(() => goToStep(fs.i + 1, { animate: !REDUCED }), 350);
  }

  function pause() {
    if (!fs.name) return;
    fs.playing = false;
    clearTimers();
    snapPacketToStepEnd();
    updatePlayBtn();
  }

  function next() {
    if (!fs.name || fs.ended) return;
    fs.playing = false;
    clearTimers();
    updatePlayBtn();
    goToStep(fs.i + 1, { animate: !REDUCED });
  }

  function prev() {
    if (!fs.name || fs.i <= 0) return;
    fs.playing = false;
    fs.ended = false;
    clearTimers();
    updatePlayBtn();
    goToStep(fs.i - 1, { animate: false });
  }

  function jumpTo(i) {
    if (!fs.name) return;
    fs.playing = false;
    fs.ended = false;
    clearTimers();
    updatePlayBtn();
    goToStep(i, { animate: false });
  }

  function updatePlayBtn() {
    playBtn.textContent = fs.ended ? '▶ 다시 보기' : (fs.playing ? '⏸ 일시정지' : '▶ 재생');
  }

  function exitFlow() {
    clearTimers();
    fs.name = null;
    fs.flow = null;
    fs.i = -1;
    fs.playing = false;
    fs.ended = false;

    svg.classList.remove('is-flowing');
    edgeMap.forEach(el => setEdgeFlowState(el, ''));
    nodeElMap.forEach(el => el.classList.remove('is-step-done', 'is-step-active'));
    packetG.style.display = 'none';
    flowBar.hidden = true;
    flowPanel.hidden = true;
    returnStrip.hidden = true;
    nodePanel.hidden = false;
    flowChips.forEach(c => c.classList.remove('is-selected'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
