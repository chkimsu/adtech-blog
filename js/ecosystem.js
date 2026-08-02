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
      x: 250, y: 22, w: 150, h: 44, cat: 'ml',
      name: 'Feature Store', sub: '피처 저장소',
      def: '유저·지면·시간 등 광고 모델의 입력 피처를 실시간으로 공급하는 저장소. pCTR/pCVR이 매 요청마다 호출.',
      demos: [{ name: '로그→학습 루프', url: 'demo-log-to-model.html' }], posts: [{ id: 'feature-store-serving', title: 'Feature Store 서빙' }]
    },
    'training': {
      x: 425, y: 22, w: 130, h: 44, cat: 'ml',
      name: 'Training', sub: '모델 학습(오프라인)',
      def: '어제까지 쌓인 로그로 모델을 다시 학습시키는 오프라인 단계. 여기서 나온 새 모델은 오프라인 지표(AUC·LogLoss)를 통과해야 서빙으로 넘어간다.',
      demos: [{ name: '로그→학습 루프', url: 'demo-log-to-model.html' }],
      posts: [
        { id: 'negative-sampling-bias', title: 'Negative Sampling & Bias' },
        { id: 'online-learning-delayed-feedback', title: 'Online Learning & 지연 피드백' },
        { id: 'multi-task-learning', title: '멀티태스크 학습' }
      ]
    },
    'monitoring': {
      x: 595, y: 22, w: 150, h: 44, cat: 'ml',
      name: 'Monitoring', sub: '드리프트 감시',
      def: '배포한 모델이 현실에서 밀리는지 지켜보는 단계. 실제와 예측의 비(COPC), 피처 분포 변화(PSI)를 보고 이상하면 재학습을 부른다.',
      demos: [{ name: 'Calibration', url: 'demo-calibration.html' }],
      posts: [
        { id: 'calibration', title: 'pCTR Calibration' },
        { id: 'online-learning-delayed-feedback', title: 'Online Learning & 지연 피드백' }
      ]
    },
    'model-serving': {
      x: 590, y: 84, w: 160, h: 46, cat: 'ml',
      name: 'Model Serving', sub: 'Retrieval → Ranking',
      def: '수천 후보 광고를 Retrieval→Pre-Ranking→Ranking→Re-Ranking으로 좁히는 추론 파이프라인. 10ms 안에 끝나야 함.',
      demos: [{ name: '로그→학습 루프', url: 'demo-log-to-model.html' }], posts: [{ id: 'model-serving-architecture', title: 'Model Serving 아키텍처' }]
    },
    'calibration': {
      x: 1055, y: 84, w: 150, h: 46, cat: 'ml',
      name: 'Calibration', sub: '예측값 보정',
      def: '모델이 예측한 CTR을 실제 분포에 맞게 보정. 예측 평균을 실제 평균과 일치시켜 입찰가 왜곡 방지.',
      demos: [{ name: 'pCTR Impact', url: 'demo-pctr-impact.html' }, { name: '로그→학습 루프', url: 'demo-log-to-model.html' }],
      posts: [{ id: 'calibration', title: 'pCTR Calibration' }]
    },

    // ── Row 2 (y=220) ──
    'auction': {
      x: 620, y: 320, w: 150, h: 54, cat: 'exchange',
      name: 'Auction Engine', sub: '1st / 2nd Price',
      def: '여러 DSP의 입찰가 중 최고가를 결정하고 지불가를 산정. 1st Price=낙찰가 그대로, 2nd Price=차순위가만.',
      demos: [{ name: 'RTB 경매', url: 'demo-rtb.html' }, { name: 'UCB vs TS 비교', url: 'demo-compare-bandits.html' }],
      posts: [{ id: 'second-price-auction', title: '2등 가격 경매는 왜?' }, { id: 'dsp-ssp-exchange', title: 'DSP·SSP·Exchange가 각각 뭐 하나' }, { id: 'ad-network-vs-exchange', title: 'Ad Network vs Exchange' }]
    },
    'pctr-cvr': {
      x: 845, y: 76, w: 190, h: 62, cat: 'ml', heart: true,
      name: 'pCTR / pCVR', sub: '광고의 심장 — 누를·살 확률',
      def: '이 유저가 이 광고를 클릭할 확률(pCTR)과 전환할 확률(pCVR)을 예측. DeepFM·DIN 등 딥러닝 모델 활용.',
      demos: [{ name: 'pCTR Impact', url: 'demo-pctr-impact.html' }, { name: 'LinUCB', url: 'demo-linucb.html' }],
      posts: [{ id: 'pctr-prediction', title: 'pCTR이 뭐고 왜 돈이 되나' }, { id: 'deep-ctr-models', title: 'Deep CTR Models' }, { id: 'pCVR-modeling', title: 'pCVR 모델링' }, { id: 'negative-sampling-bias', title: 'Negative Sampling Bias' }]
    },
    'brand': {
      x: 1060, y: 425, w: 160, h: 54, cat: 'buy',
      name: 'Brand / Agency', sub: '브랜드·에이전시',
      def: '광고 캠페인을 의뢰하는 주체. ATD(Agency Trading Desk)를 통해 DSP에 접근하기도 함.',
      demos: [], posts: [{ id: 'adtech-30min-primer', title: '30분 입문 가이드' }]
    },

    // ── Row 3 (y=380): MAIN RTB FLOW ──
    'user': {
      x: 60, y: 210, w: 160, h: 64, cat: 'user',
      name: '사용자', sub: 'User',
      def: '광고를 보고 클릭·전환하는 최종 소비자. 모든 광고 흐름의 시작과 끝점.',
      demos: [], posts: [{ id: 'adtech-30min-primer', title: '30분 입문 가이드' }]
    },
    'publisher': {
      x: 290, y: 210, w: 130, h: 64, cat: 'sell',
      name: 'Publisher', sub: '매체·앱',
      def: '광고 지면을 제공하는 웹사이트·앱·뉴스 등. 사용자 방문 시 SSP에 광고 요청을 보냄.',
      demos: [{ name: 'Header Bidding', url: 'demo-header-bidding.html' }],
      posts: [{ id: 'walled-garden', title: 'Walled Garden' }]
    },
    'ssp': {
      x: 440, y: 210, w: 130, h: 64, cat: 'sell',
      name: 'SSP', sub: '공급 측 플랫폼',
      def: 'Publisher 대신 광고 지면을 Ad Exchange에 팔아주는 플랫폼. Floor Price·Header Bidding으로 수익 최적화.',
      demos: [{ name: 'Header Bidding', url: 'demo-header-bidding.html' }],
      posts: [{ id: 'dsp-ssp-exchange', title: 'DSP·SSP·Exchange가 각각 뭐 하나' }, { id: 'header-bidding', title: '헤더비딩 쉽게' }, { id: 'ad-serving-flow', title: '광고 서빙 플로우' }]
    },
    'exchange': {
      x: 620, y: 210, w: 150, h: 64, cat: 'exchange',
      name: 'Ad Exchange', sub: '광고 거래소',
      def: 'SSP의 광고 슬롯과 DSP들의 입찰을 100ms 안에 매칭하는 실시간 거래소. RTB 경매의 무대.',
      demos: [{ name: 'RTB 경매', url: 'demo-rtb.html' }],
      posts: [{ id: 'dsp-ssp-exchange', title: 'DSP·SSP·Exchange가 각각 뭐 하나' }, { id: 'second-price-auction', title: '2등 가격 경매는 왜?' }, { id: 'ad-network-vs-exchange', title: 'Ad Network vs Exchange' }, { id: 'ad-serving-flow', title: '광고 서빙 플로우' }]
    },
    'dsp': {
      x: 865, y: 210, w: 150, h: 64, cat: 'buy',
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
      posts: [{ id: 'dsp-ssp-exchange', title: 'DSP·SSP·Exchange가 각각 뭐 하나' }, { id: 'adtech-dev-layers', title: '광고 개발 8 레이어' }, { id: 'auto-bidding-pacing', title: 'Auto-Bidding & Pacing' }]
    },
    'advertiser': {
      x: 1060, y: 210, w: 160, h: 64, cat: 'buy',
      name: 'Advertiser', sub: '광고주',
      def: '광고 캠페인의 예산·KPI(CPA, ROAS)를 설정하는 주체. DSP에 위임해 실시간 입찰을 실행.',
      demos: [], posts: [{ id: 'adtech-30min-primer', title: '30분 입문 가이드' }, { id: 'adtech-ecosystem-map', title: '광고 생태계 지도' }]
    },

    // ── Row 4 (y=540) ──
    'mmp': {
      x: 45, y: 600, w: 200, h: 54, cat: 'measurement',
      name: 'MMP / Attribution', sub: '어트리뷰션',
      def: 'Impression·Click·Conversion 로그를 매칭해 어느 광고가 전환에 기여했는지 분석. ROAS 측정의 기반.',
      demos: [], posts: [{ id: 'attribution-basics', title: '어트리뷰션 — 누구 공인가' }, { id: 'position-bias-ultr', title: 'Position Bias' }, { id: 'walled-garden', title: 'Walled Garden' }]
    },
    'log-pipeline': {
      x: 300, y: 600, w: 170, h: 54, cat: 'measurement',
      name: 'Log Pipeline', sub: '로그 파이프라인',
      def: 'Bid·Win/Loss·Impression·Click·Conversion 10여 종 로그를 수집·조인·집계. 모델 학습과 측정의 토대.',
      demos: [{ name: 'Censored Data', url: 'demo-censored-data.html' }, { name: '로그→학습 루프', url: 'demo-log-to-model.html' }],
      posts: [{ id: 'attribution-basics', title: '어트리뷰션 — 누구 공인가' }, { id: 'ad-log-system', title: '광고 로그 시스템' }, { id: 'ad-log-pipeline', title: '광고 로그 파이프라인' }, { id: 'online-learning-delayed-feedback', title: 'Online Learning & Delayed Feedback' }]
    },
    'header-bidding': {
      x: 300, y: 320, w: 170, h: 54, cat: 'sell',
      name: 'Header Bidding', sub: 'vs Waterfall',
      def: '여러 SSP를 동시(병렬) 호출해 최고가를 뽑는 방식. Waterfall(순차 호출)보다 평균 +10~30% 수익.',
      demos: [{ name: 'Header Bidding', url: 'demo-header-bidding.html' }],
      posts: [{ id: 'header-bidding', title: '헤더비딩 쉽게' }, { id: 'ad-serving-flow', title: '광고 서빙 플로우' }]
    },
    'dco': {
      x: 865, y: 320, w: 150, h: 54, cat: 'buy',
      name: 'DCO', sub: '다이내믹 크리에이티브',
      def: '소재(이미지·텍스트)를 유저·맥락에 맞게 자동으로 조합·최적화. MAB로 베스트 조합 학습.',
      demos: [{ name: 'UCB1', url: 'demo-ucb1.html' }],
      posts: []
    },
    'dmp': {
      x: 1045, y: 320, w: 175, h: 54, cat: 'buy',
      name: 'DMP / CDP', sub: '오디언스 데이터',
      def: '쿠키·디바이스 ID·1st party 데이터를 모아 오디언스 세그먼트를 만듦. DSP의 타겟팅 입력.',
      demos: [], posts: [{ id: 'audience-segmentation', title: '오디언스 세그멘테이션' }, { id: 'lookalike-modeling', title: 'Lookalike 모델링' }]
    },

    // ── Row 5 (y=650): User & Privacy ──
    'user-journey': {
      x: 45, y: 320, w: 200, h: 54, cat: 'user',
      name: 'User Journey', sub: 'Impression → Click → Conversion',
      def: '사용자의 광고 노출 → 클릭 → 전환까지의 시간 흐름. 어트리뷰션 윈도우와 LTV 측정의 기준.',
      demos: [], posts: [{ id: 'adtech-30min-primer', title: '30분 입문 가이드' }]
    },
    'cmp': {
      x: 45, y: 425, w: 200, h: 54, cat: 'user',
      name: 'CMP / Walled Garden', sub: '동의 관리·울타리',
      def: '사용자 데이터 동의(GDPR·CCPA)를 관리하는 CMP, 그리고 자체 ID로 닫힌 생태계인 Walled Garden(구글·메타).',
      demos: [], posts: [{ id: 'walled-garden', title: 'Walled Garden' }]
    },
  };

  // 직각(metro) 라우팅 힌트:
  //  via 'top'|'bottom' = 스파인 위/아래 버스로 우회(되돌아오는 결과 분리용)
  //  channel = 평행 버스가 겹치지 않게 미세 이동(px). 없으면 자동 직각 경로.
  const EDGES = [
    // ── 메인 RTB 스파인 (좌→우, 같은 행 → 직선) ──
    { from: 'user', to: 'publisher' },
    { from: 'publisher', to: 'ssp' },
    { from: 'ssp', to: 'exchange' },
    { from: 'exchange', to: 'dsp' },
    { from: 'dsp', to: 'advertiser' },

    // ── 되돌아오는 결과(입찰가·소재·노출) — 스파인 위/아래 버스로 분리 ──
    { from: 'dsp', to: 'exchange', via: 'top', channel: 0 },
    { from: 'exchange', to: 'publisher', via: 'top', channel: 18 },
    { from: 'publisher', to: 'user', via: 'bottom', channel: 0 },
    { from: 'advertiser', to: 'dsp', via: 'top', channel: 6 },

    // ── 두뇌 층: 학습(행A) · 서빙(행B) 파이프라인 ──
    { from: 'feature-store', to: 'training' },        // 피처 → 학습셋
    { from: 'training', to: 'model-serving' },        // 학습된 모델 배포
    { from: 'model-serving', to: 'monitoring' },      // 서빙 결과 감시(직선 수직)
    { from: 'monitoring', to: 'training' },           // 드리프트 → 재학습 트리거(루프 닫힘)
    // channel -85: 자동 라우팅의 세로 버스가 기본값(x=495)이면 training 박스를 관통한다.
    // feature-store(…400)와 training(425…) 사이 틈(x≈410)으로 내려보낸다.
    { from: 'feature-store', to: 'model-serving', channel: -85 },
    { from: 'model-serving', to: 'pctr-cvr' },
    { from: 'pctr-cvr', to: 'calibration' },
    { from: 'dsp', to: 'pctr-cvr', layer: true },     // ★ 2층 연결선 — 중심 x가 같아 직선 수직으로 그려진다
    { from: 'dsp', to: 'model-serving' },     // 점수 요청
    { from: 'auction', to: 'pctr-cvr' },       // 경매 → 예측
    { from: 'exchange', to: 'auction' },       // 거래소 → 경매 엔진
    { from: 'calibration', to: 'dsp' },        // 새 모델 배포

    // ── Buy/Sell 부속 ──
    { from: 'dmp', to: 'dsp' },
    { from: 'dco', to: 'dsp' },
    // 사이에 DMP가 있어 오른쪽으로 비켜 올라간다(DMP 오른변 1220 밖).
    { from: 'brand', to: 'advertiser', detour: [[1245, 452], [1245, 242]] },
    { from: 'publisher', to: 'header-bidding' },  // HB 컨테이너 실행
    { from: 'header-bidding', to: 'ssp' },        // HB가 여러 SSP를 동시 호출

    // ── Measurement 흐름 ──
    // 아래 넷은 왼쪽 빈 통로(x 245~290)와 아래 여백(y 654~)을 타고 돈다.
    // 직선으로 두면 Header Bidding·User Journey·CMP·Auction 라벨을 뚫는다.
    { from: 'publisher', to: 'log-pipeline', detour: [[267, 242], [267, 627]] },
    { from: 'user', to: 'log-pipeline', detour: [[255, 242], [255, 627]] },
    { from: 'log-pipeline', to: 'mmp' },
    { from: 'log-pipeline', to: 'feature-store',    // 로그 → 피처
      detour: [[279, 627], [279, 90], [325, 90]] },
    // 어트리뷰션 리포트. 아래 여백 → 거래소·DSP 사이 통로(x 770~865) → 행간(y 274~320)
    { from: 'mmp', to: 'advertiser',
      detour: [[145, 682], [817, 682], [817, 295], [1140, 295]] },
    { from: 'user-journey', to: 'log-pipeline',
      detour: [[285, 347], [285, 540], [385, 540]] },

    // ── Privacy ──
    // Auction·DCO 아래(y 425~479)로 지나 DMP 왼변으로 들어간다.
    { from: 'cmp', to: 'dmp', detour: [[1030, 452], [1030, 347]] },
    { from: 'user-journey', to: 'cmp' },
  ];

  // 패킷 종류: 지금 이동 중인 것이 "무엇"인지.
  // request=요청, money=돈·입찰가, creative=광고 소재, data=데이터·로그
  const FLOWS = {
    modeler: {
      label: '모델러의 눈으로 보는 0.1초',
      summary: '모델러가 하는 일은 이 고리를 매일 돌리는 것입니다 — 0.1초 안에 확률을 찍어 입찰가를 만들고, 그 결과를 로그로 받아 다음 모델을 만들고, 배포한 뒤 다시 감시합니다. 예측이 0.1%p 정확해지는 지점이 곧 매출이 바뀌는 지점입니다.',
      steps: [
        {
          from: 'exchange', to: 'dsp',
          caption: '입찰 요청 1건 도착 — 지금부터 100ms',
          detail: '거래소가 "이 자리 살 사람?"이라고 물어 온 순간부터 시계가 돕니다. 이 안에 답을 못 내면 예측이 아무리 좋아도 버려집니다(타임아웃).',
          packet: { label: 'Bid Request', kind: 'request' },
          example: {
            story: '오후 9시 14분, 뉴스앱 320×100 한 칸에 대한 요청이 우리 DSP에 들어온다.',
            data: [['제한시간', '100ms'], ['지면', '뉴스앱 320×100'], ['남은 예산', '₩4.2M']]
          }
        },
        {
          from: 'dsp', to: 'pctr-cvr',
          caption: 'DSP가 두뇌에 묻는다 — "이 사람, 누를까?"',
          detail: '입찰가를 정하려면 딱 하나가 필요합니다 — 누를 확률. 이 세로선이 거래 층과 두뇌 층을 잇는 통로입니다. 광고 ML 엔지니어의 일은 대부분 이 선 위쪽에서 벌어집니다.',
          packet: { label: '예측 요청', kind: 'request' },
          example: {
            story: '요청 하나에 후보 광고가 800개 — "이 중 뭐가 제일 눌릴까"를 한 번에 묻는다.',
            data: [['후보 광고', '800개'], ['묻는 것', 'pCTR · pCVR']]
          }
        },
        {
          from: 'feature-store', to: 'model-serving',
          caption: '피처 조회 — 이 사람·이 자리에 대해 아는 것 긁어오기',
          detail: '모델에 넣을 재료(피처)를 Feature Store에서 꺼냅니다. 유저의 최근 행동, 지면 성격, 시간대 같은 값입니다. 이 조회가 느리면 전체가 늦어지니 보통 수 ms 안에 끝냅니다.',
          packet: { label: '피처 213개', kind: 'data' },
          example: {
            story: '"최근 7일 클릭 3회", "이 지면 평균 CTR 1.8%", "금요일 밤" 같은 값이 붙는다.',
            data: [['피처 수', '213'], ['조회', '3.1ms'], ['캐시 적중', '92%']]
          }
        },
        {
          from: 'model-serving', to: 'pctr-cvr',
          caption: '추론 — 확률을 찍는다 (아직 원값)',
          detail: '학습해 둔 모델이 후보마다 확률을 계산합니다. 여기서 나온 값은 아직 원값입니다 — 순위는 맞아도 절댓값이 살짝 틀어져 있을 수 있습니다.',
          packet: { label: 'pCTR 2.1%', kind: 'data' },
          example: {
            story: '최고 후보의 원 예측은 2.1%. 800개를 다 채점하는 데 6.2ms 걸렸다.',
            data: [['원 pCTR', '2.1%'], ['pCVR', '0.35%'], ['추론', '6.2ms']]
          }
        },
        {
          from: 'pctr-cvr', to: 'calibration',
          caption: '보정 — 예측 평균을 실제에 맞춘다',
          detail: '모델이 전체적으로 낮게(또는 높게) 보는 버릇을 실측에 맞춰 교정합니다. 실제 클릭 합을 예측 합으로 나눈 값을 COPC(Click Over Predicted Click)라 부르는데, 1보다 크면 모델이 낮게 보고 있다는 뜻입니다. 이 한 단계가 없으면 입찰가가 통째로 낮게 깔려 돈을 잃습니다.',
          packet: { label: '2.1% → 2.4%', kind: 'data' },
          example: {
            story: '최근 실측과 비교하니 모델이 12% 낮게 보고 있었다 — 2.1%를 2.4%로 올린다.',
            data: [['COPC', '1.14'], ['보정 후', '2.4%']]
          }
        },
        {
          from: 'calibration', to: 'dsp',
          caption: '보정된 확률이 돌아온다 → 입찰가 계산',
          detail: '이제 계산할 수 있습니다. 전환 하나의 가치 × 누를 확률 × 살 확률 = 이 노출 한 번의 기대 가치. 광고판은 1,000회 기준(CPM)으로 부르니 여기에 1,000을 곱하고, 예산 페이싱과 Bid Shading으로 깎아 최종 입찰가를 냅니다.',
          packet: { label: '입찰 CPM ₩1,200', kind: 'money' },
          example: {
            story: '₩30,000 × 2.4% × 0.35% = ₩2.52 (노출 1회) → CPM ₩2,520이 상한. 페이싱·셰이딩 후 ₩1,200을 부른다.',
            data: [['전환 가치', '₩30,000'], ['노출 1회 기대', '₩2.52'], ['최종 입찰 CPM', '₩1,200']]
          }
        },
        {
          from: 'dsp', to: 'exchange',
          caption: '입찰 응답 — 42ms에 도착',
          detail: '제한시간 안에 답했으니 경매에 참여합니다. 모델러가 늘 신경 쓰는 예산이 이 시간입니다 — 피처 조회 3ms, 추론 6ms, 나머지는 네트워크와 후처리입니다.',
          packet: { label: 'Bid ₩1,200', kind: 'money' },
          example: {
            story: '요청 도착부터 응답까지 42ms. 지연 상위 1%(p99)는 88ms까지 튄다.',
            data: [['총 소요', '42ms'], ['p99', '88ms'], ['타임아웃', '100ms']]
          }
        },
        {
          from: 'exchange', to: 'publisher',
          caption: '낙찰 — 이겼다 (그리고 진 경우는 안 보인다)',
          detail: '최고가를 부른 쪽이 이깁니다. 이겼을 때만 실제 가격이 보이고, 졌을 때는 남이 얼마 썼는지 못 봅니다. 이 "보이지 않음"이 모델러의 골칫거리인 Censored Data입니다.',
          packet: { label: '낙찰 소재', kind: 'creative' },
          example: {
            story: '₩1,200으로 낙찰 — 2위는 ₩1,150이었다. 졌다면 이 숫자조차 못 봤다.',
            data: [['결과', 'win'], ['지불', '₩1,150'], ['패찰 시', '가격 미관측']]
          }
        },
        {
          from: 'publisher', to: 'user',
          caption: '광고가 뜬다 (노출)',
          detail: '화면에 배너가 나타납니다. 요청부터 여기까지 0.1초. 모델러 입장에서 이 순간은 "예측을 시장에 제출한 시점"입니다 — 채점은 이제부터입니다.',
          packet: { label: '노출', kind: 'creative' },
          example: {
            story: '민지 화면에 운동화 배너가 뜬다. 우리 모델은 "2.4% 확률로 눌릴 것"이라 말했다.',
            data: [['예측', '2.4%'], ['실제', '?']]
          }
        },
        {
          from: 'user', to: 'log-pipeline',
          caption: '채점표가 쌓인다 — 봤나·눌렀나·샀나',
          detail: '예측이 맞았는지는 이 로그로만 알 수 있습니다. 한 건으로는 아무것도 판정할 수 없습니다 — 2.4%란 "100번 중 두세 번"이라는 뜻이니까요. 수억 건이 모여야 비로소 맞았는지 보입니다.',
          packet: { label: 'imp=1 click=0', kind: 'data' },
          example: {
            story: '이번엔 안 눌렸다. 하지만 이건 예측이 틀렸다는 증거가 아니다.',
            data: [['imp', '1'], ['click', '0'], ['판정', '한 건으론 불가']]
          }
        },
        {
          from: 'log-pipeline', to: 'feature-store',
          caption: '로그를 학습 데이터로 가공',
          detail: '원시 로그는 그대로 못 씁니다. 노출·클릭·전환을 이어 붙이고(조인), 그 시점에 모델이 봤던 피처를 그대로 되살려 붙입니다. 지금 값이 아니라 "그때 값"이어야 합니다 — 안 그러면 학습과 서빙이 어긋나는 학습-서빙 스큐가 생깁니다.',
          packet: { label: '학습셋 1.2억 행', kind: 'data' },
          example: {
            story: '어제 노출 1.2억 건에 클릭·전환을 붙인다. 전환은 며칠 늦게 오니 일부는 라벨이 아직 비어 있다.',
            data: [['학습셋', '120M 행'], ['라벨 미확정', '7%']]
          }
        },
        {
          from: 'feature-store', to: 'training',
          caption: '학습 — 새 모델 후보가 나온다',
          detail: '어제까지의 데이터로 다시 학습합니다. 여기서 나온 후보는 아직 실전에 못 나갑니다. 오프라인 지표(AUC·LogLoss)로 먼저 걸러야 하는데, 이 지표가 좋아졌다고 매출이 오른다는 보장은 없습니다.',
          packet: { label: '새 모델 후보', kind: 'data' },
          example: {
            story: 'AUC 0.7841 → 0.7856. 좋아 보이지만 이 차이가 돈이 될지는 아직 모른다.',
            data: [['AUC', '0.7856 (+0.0015)'], ['LogLoss', '0.1063']]
          }
        },
        {
          from: 'training', to: 'model-serving',
          caption: '배포 — 섀도 → 10% → 전량',
          detail: '새 모델을 바로 100% 켜지 않습니다. 먼저 응답만 받아 기존과 비교하고(섀도), 다음 트래픽 10%에만 태우고, 지표가 버티면 전량으로 넓힙니다. 확률 모델은 잘못 켜면 입찰가가 통째로 흔들립니다.',
          packet: { label: '모델 v237 배포', kind: 'creative' },
          example: {
            story: '10% 트래픽에서 COPC 0.99, CTR +1.8%. 이틀 지켜본 뒤 전량으로 올린다.',
            data: [['단계', 'shadow → 10% → 100%'], ['COPC', '0.99'], ['CTR', '+1.8%']]
          }
        },
        {
          from: 'model-serving', to: 'monitoring',
          caption: '감시 — 예측이 현실에서 밀리는지 본다',
          detail: '배포 후가 진짜 시작입니다. 실제와 예측의 비(COPC), 피처 분포가 얼마나 변했는지(PSI)를 계속 봅니다. 세상이 바뀌면 어제까지 맞던 모델이 오늘 틀립니다.',
          packet: { label: 'COPC · PSI 감시', kind: 'data' },
          example: {
            story: '연휴로 클릭 패턴이 바뀌자 PSI가 0.28로 튀었다 — 경보.',
            data: [['COPC', '1.09'], ['PSI', '0.28 (경보)']]
          }
        },
        {
          from: 'monitoring', to: 'training',
          caption: '드리프트 감지 → 재학습 (고리가 닫힌다)',
          detail: '이상이 보이면 다시 학습으로 돌아갑니다. 광고 ML은 한 번 만들고 끝나는 일이 아니라, 이 고리를 매일 돌리는 일입니다. 이 페이지의 두뇌 층이 곧 그 고리입니다.',
          packet: { label: '재학습 트리거', kind: 'request' },
          example: {
            story: 'PSI 경보로 야간 재학습을 앞당긴다. 내일의 입찰가가 또 조금 달라진다.',
            data: [['조치', '재학습 앞당김'], ['주기', '일 1회 → 6시간']]
          }
        },
      ]
    },
    rtb: {
      label: '100ms RTB',
      summary: '사용자가 페이지를 연 순간부터 광고가 뜨기까지 약 0.1초. 그 안에 요청 → 경매 → 예측 → 입찰 → 낙찰 → 노출이 모두 일어나고, 마지막 로그는 다시 모델 학습의 재료가 됩니다.',
      steps: [
        {
          from: 'user', to: 'publisher',
          caption: '사용자가 페이지·앱을 방문 — 광고 슬롯 발견',
          detail: '사용자가 뉴스 앱을 여는 순간, 페이지 안에 광고를 채워야 할 빈 칸(슬롯)이 생깁니다. 이 빈 칸이 지금부터 일어날 모든 일의 시작점입니다.',
          packet: { label: '페이지 방문', kind: 'request' },
          example: {
            story: "뉴스앱 '오늘의 경제'를 연 김씨 — 기사 사이 빈 배너 한 칸이 비어 있다.",
            data: [['지면', '뉴스앱 기사'], ['슬롯', '320×100'], ['시각', '오후 9:14']]
          }
        },
        {
          from: 'publisher', to: 'ssp',
          caption: 'Publisher가 SSP에 광고 요청 (Ad Request)',
          detail: 'Publisher는 "이 빈 칸 채워줘"라고 SSP에 부탁합니다. 어떤 지면인지, 어떤 사용자인지에 대한 정보가 함께 갑니다.',
          packet: { label: '광고 요청', kind: 'request' },
          example: {
            story: "앱이 SSP에 '이 자리 320×100, 한국 모바일 사용자' 라고 채움 요청을 보낸다.",
            data: [['size', '320×100'], ['geo', 'KR'], ['device', 'mobile']]
          }
        },
        {
          from: 'ssp', to: 'exchange',
          caption: 'SSP가 Ad Exchange에 Bid Request 발송',
          detail: 'SSP는 이 지면을 거래소(Ad Exchange)에 경매로 내놓습니다. "이 자리 살 사람?"이라는 입찰 요청서가 Bid Request입니다.',
          packet: { label: 'Bid Request', kind: 'request' },
          example: {
            story: "SSP가 '최저 ₩800부터, 2030 관심 세그' 조건을 붙여 거래소에 경매를 올린다.",
            data: [['floor', '₩800'], ['format', 'banner'], ['seg', '2030']]
          }
        },
        {
          from: 'exchange', to: 'dsp',
          caption: 'Ad Exchange가 여러 DSP에 동시 Bid Request 분배',
          detail: '거래소는 여러 DSP에게 한꺼번에 요청서를 뿌립니다. 지금부터 DSP들은 약 0.1초 안에 답해야 합니다.',
          packet: { label: 'Bid Request', kind: 'request' },
          example: {
            story: '같은 요청서가 입찰에 참여한 12개 DSP에게 동시에 뿌려진다.',
            data: [['DSP 수', '12곳'], ['제한시간', '100ms']]
          }
        },
        {
          from: 'dsp', to: 'model-serving',
          caption: 'DSP가 Model Serving에 점수 요청',
          detail: 'DSP는 "이 사용자가 이 광고를 클릭할까?"를 자기 모델에게 물어봅니다. 입찰가를 정하려면 이 답이 필요합니다.',
          packet: { label: '점수 계산 요청', kind: 'request' },
          example: {
            story: "DSP가 '이 사람, 이 운동화 광고 누를까?'를 자사 DeepFM 모델에 물어본다.",
            data: [['feature', '최근7일 클릭률'], ['model', 'DeepFM']]
          }
        },
        {
          from: 'model-serving', to: 'pctr-cvr',
          caption: 'pCTR / pCVR 모델이 클릭·전환 확률 예측',
          detail: '모델이 클릭 확률(예: 2.3%)을 계산합니다. 이 숫자가 곧 입찰가의 근거가 됩니다 — 확률이 높을수록 비싸게 부를 가치가 있으니까요.',
          packet: { label: 'pCTR 2.3%', kind: 'data' },
          example: {
            story: '모델이 클릭 확률 2.3%, 전환 확률 0.4%로 예측 — 평소보다 높은 편이다.',
            data: [['pCTR', '2.3%'], ['pCVR', '0.4%']]
          }
        },
        {
          from: 'dsp', to: 'exchange',
          caption: 'DSP가 Bid 응답 — Bid Shading으로 입찰가 조정',
          detail: 'DSP가 "이 노출에 1,200원 내겠다"고 응답합니다. 예상 가치보다 살짝 낮춰 부르는 기술이 Bid Shading입니다.',
          packet: { label: '입찰가 1,200원', kind: 'money' },
          example: {
            story: '예상 가치 ₩1,400을 Bid Shading으로 살짝 낮춰 ₩1,200에 응찰한다.',
            data: [['예상가치', '₩1,400'], ['입찰가', '₩1,200']]
          }
        },
        {
          from: 'exchange', to: 'publisher',
          caption: 'Auction Engine이 Winner 결정 → Publisher에 광고 전달',
          detail: '최고가를 부른 DSP가 낙찰됩니다. 이긴 광고의 이미지·문구(소재)가 Publisher 쪽으로 전달됩니다.',
          packet: { label: '낙찰 광고 소재', kind: 'creative' },
          example: {
            story: '최고가 DSP-A가 낙찰 — 2위 가격 ₩1,150만 내면 되는 2nd Price 규칙.',
            data: [['winner', 'DSP-A'], ['낙찰가', '₩1,150'], ['rule', '2nd price']]
          }
        },
        {
          from: 'publisher', to: 'user',
          caption: '사용자에게 광고 노출 (Impression)',
          detail: '사용자 화면에 광고가 뜹니다. 페이지를 연 순간부터 여기까지 걸린 시간이 약 0.1초 — 눈 깜빡할 새에 경매가 끝난 겁니다.',
          packet: { label: '광고 노출', kind: 'creative' },
          example: {
            story: '김씨 화면에 운동화 배너가 뜬다. 페이지를 연 지 약 0.1초 만이다.',
            data: [['소요', '~100ms'], ['상태', 'impression']]
          }
        },
        {
          from: 'user', to: 'log-pipeline',
          caption: '행동 로그가 Log Pipeline으로 수집',
          detail: '봤는지(Impression)·눌렀는지(Click)·샀는지(Conversion)가 전부 로그로 쌓입니다. 이 로그가 내일의 모델을 학습시키는 재료입니다.',
          packet: { label: '노출·클릭 로그', kind: 'data' },
          example: {
            story: '이번엔 봤지만 안 눌렀다 — imp=1, click=0 으로 로그에 남아 내일 모델의 재료가 된다.',
            data: [['imp', '1'], ['click', '0'], ['conv', '0']]
          }
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
          packet: { label: '행동 로그', kind: 'data' },
          example: {
            story: '어제 하루 노출 1.2억 건, 클릭 240만 건이 그대로 쌓였다.',
            data: [['imp', '120M'], ['click', '2.4M'], ['기간', '어제 24h']]
          }
        },
        {
          from: 'log-pipeline', to: 'feature-store',
          caption: '가공된 피처가 Feature Store에 갱신',
          detail: '원시 로그를 "이 유저의 최근 7일 클릭률" 같은 모델 입력값(피처)으로 가공해 저장합니다.',
          packet: { label: '가공된 피처', kind: 'data' },
          example: {
            story: "원시 로그가 '최근 7일 CTR' 같은 312개 피처로 가공돼 저장된다.",
            data: [['feature', '312개'], ['갱신', '시간당']]
          }
        },
        {
          from: 'feature-store', to: 'model-serving',
          caption: '오프라인 학습 데이터셋 구성',
          detail: '피처와 정답(클릭했나 안 했나)을 짝지어 학습용 데이터셋을 만듭니다.',
          packet: { label: '학습 데이터셋', kind: 'data' },
          example: {
            story: '피처 312개에 정답(클릭 0/1)을 붙여 8.5억 행짜리 학습셋을 만든다.',
            data: [['rows', '8.5억'], ['label', 'click 0/1']]
          }
        },
        {
          from: 'model-serving', to: 'pctr-cvr',
          caption: 'DeepFM·DIN 등 모델 학습 — pCTR·pCVR 산출',
          detail: '새 데이터로 모델을 다시 학습합니다. 어제의 트렌드가 모델 안에 반영되는 순간입니다.',
          packet: { label: '새 모델', kind: 'data' },
          example: {
            story: 'DeepFM을 재학습 — 검증 AUC가 0.781에서 0.792로 올랐다.',
            data: [['model', 'DeepFM'], ['AUC', '0.792'], ['epoch', '3']]
          }
        },
        {
          from: 'pctr-cvr', to: 'calibration',
          caption: '예측값을 실제 분포에 맞게 Calibration',
          detail: '모델 예측 평균이 실제 클릭률 평균과 같아지게 보정합니다. 안 하면 입찰가 전체가 부풀거나 쪼그라듭니다.',
          packet: { label: '보정된 예측값', kind: 'data' },
          example: {
            story: '예측 평균 2.1%를 실제 평균 2.4%에 맞춰 +0.3%p 끌어올린다.',
            data: [['예측평균', '2.1%'], ['실제', '2.4%'], ['보정', '+0.3%p']]
          }
        },
        {
          from: 'calibration', to: 'dsp',
          caption: '보정된 모델이 DSP 서빙 파이프라인에 배포',
          detail: '검증을 통과한 새 모델이 실제 트래픽을 받는 서버에 올라갑니다.',
          packet: { label: '새 모델 배포', kind: 'data' },
          example: {
            story: '검증 통과한 v240 모델을 트래픽 5%부터 카나리로 올린다.',
            data: [['version', 'v240'], ['배포', 'canary 5%']]
          }
        },
        {
          from: 'dsp', to: 'exchange',
          caption: '다음 입찰부터 새 모델 기반 점수로 입찰',
          detail: '여기부터는 RTB 흐름과 연결됩니다. 어제의 로그가 오늘의 입찰가를 바꾸는 순환 고리가 완성됐습니다.',
          packet: { label: '새 모델로 입찰', kind: 'money' },
          example: {
            story: '문제없자 100% 트래픽에 적용 — 평균 ROAS가 4% 좋아졌다.',
            data: [['적용', '100% 트래픽'], ['효과', 'ROAS +4%']]
          }
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
          packet: { label: '광고 접촉', kind: 'request' },
          example: {
            story: '김씨가 월요일에 운동화 광고를 봤다. 이날은 사지 않았다.',
            data: [['touch', 'impression'], ['요일', '월']]
          }
        },
        {
          from: 'user-journey', to: 'log-pipeline',
          caption: 'Impression·Click·Conversion 이벤트가 모두 기록',
          detail: '사용자가 거쳐간 모든 접점(본 광고, 누른 광고, 최종 구매)이 시간 순서대로 로그에 남아 있습니다.',
          packet: { label: '접점 기록', kind: 'data' },
          example: {
            story: '월에 보고, 수에 클릭하고, 목에 구매 — 세 접점이 시간순으로 남았다.',
            data: [['imp', '월'], ['click', '수'], ['conv', '목']]
          }
        },
        {
          from: 'log-pipeline', to: 'mmp',
          caption: 'MMP가 Last-Click·Multi-Touch 모델로 기여도 분배',
          detail: 'Last-Click이면 마지막 클릭이 공을 전부 가져가고, Multi-Touch면 거쳐간 광고들이 나눠 가집니다. 규칙에 따라 성과표가 완전히 달라집니다.',
          packet: { label: '매칭된 로그', kind: 'data' },
          example: {
            story: 'Last-Click 규칙이라 수요일 클릭이 전환의 공 100%를 가져간다.',
            data: [['model', 'Last-Click'], ['기여', '클릭 100%']]
          }
        },
        {
          from: 'mmp', to: 'advertiser',
          caption: 'Advertiser가 ROAS·전환 리포트를 받음',
          detail: '"광고비 100만원 → 매출 300만원 (ROAS 300%)" 같은 성적표를 받습니다.',
          packet: { label: 'ROAS 리포트', kind: 'data' },
          example: {
            story: "성적표: '광고비 ₩100만 → 매출 ₩300만, ROAS 300%'.",
            data: [['비용', '₩1.0M'], ['매출', '₩3.0M'], ['ROAS', '300%']]
          }
        },
        {
          from: 'advertiser', to: 'dsp',
          caption: '광고주가 KPI에 맞춰 캠페인 예산·입찰 전략 조정',
          detail: '성과 좋은 캠페인에 예산을 더 싣고, 나쁜 캠페인은 줄이거나 끕니다.',
          packet: { label: '예산·전략 조정', kind: 'money' },
          example: {
            story: 'ROAS 좋은 A캠페인 예산을 +50%, 부진한 B캠페인은 중단한다.',
            data: [['A캠', '예산 +50%'], ['B캠', '중단']]
          }
        },
        {
          from: 'dsp', to: 'exchange',
          caption: '조정된 전략이 다음 입찰에 반영',
          detail: '측정 결과가 다시 입찰을 바꿉니다. 광고는 한 방향 파이프가 아니라 빙글빙글 도는 피드백 루프입니다.',
          packet: { label: '조정된 입찰', kind: 'money' },
          example: {
            story: '새 예산·타겟이 페이싱에 반영돼 다음 입찰부터 곧장 적용된다.',
            data: [['pacing', '재계산'], ['target', '상위 세그']]
          }
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
          packet: { label: '페이지 방문', kind: 'request' },
          example: {
            story: '독자가 신문사 사이트를 연다 — 기사 상단에 728×90 띠배너 자리가 있다.',
            data: [['지면', '기사 상단'], ['slot', '728×90']]
          }
        },
        {
          from: 'publisher', to: 'header-bidding',
          caption: 'Header Bidding 컨테이너가 페이지 헤더에서 실행',
          detail: '페이지 머리(header)에 심어둔 자바스크립트(Prebid.js 등)가 본문보다 먼저 실행됩니다. 그래서 이름이 "Header" Bidding입니다.',
          packet: { label: 'HB 컨테이너 실행', kind: 'request' },
          example: {
            story: '헤더에 심은 Prebid.js가 본문보다 먼저 깨어나 경매를 준비한다.',
            data: [['lib', 'Prebid.js'], ['timeout', '1500ms']]
          }
        },
        {
          from: 'header-bidding', to: 'ssp',
          caption: '여러 SSP를 동시(병렬) 호출 — Waterfall이 아닌 경매',
          detail: '예전 Waterfall 방식은 SSP를 한 줄로 세워 차례로 물었습니다. 동시에 물으면 경쟁이 세져서 가격이 올라갑니다.',
          packet: { label: '동시 입찰 요청', kind: 'request' },
          example: {
            story: '5개 SSP를 한 줄로 세우지 않고 한꺼번에 부른다.',
            data: [['SSP 수', '5곳'], ['방식', '병렬']]
          }
        },
        {
          from: 'ssp', to: 'exchange',
          caption: '각 SSP가 Ad Exchange로 Bid Request 전달',
          detail: '각 SSP는 자기가 연결된 거래소로 요청을 보내 입찰을 모읍니다.',
          packet: { label: 'Bid Request', kind: 'request' },
          example: {
            story: '5개 SSP가 각자 연결된 거래소로 동시에 요청서를 보낸다.',
            data: [['exchange', '각 SSP별'], ['floor', '₩900']]
          }
        },
        {
          from: 'exchange', to: 'dsp',
          caption: 'DSP들이 병렬로 입찰 — 최고가 경쟁',
          detail: '여러 거래소의 DSP들이 같은 지면 하나를 두고 동시에 가격을 부릅니다.',
          packet: { label: '병렬 입찰', kind: 'money' },
          example: {
            story: '같은 지면 하나를 두고 ₩1,100 · ₩1,250 · ₩980이 동시에 들어온다.',
            data: [['bid1', '₩1,100'], ['bid2', '₩1,250'], ['bid3', '₩980']]
          }
        },
        {
          from: 'exchange', to: 'publisher',
          caption: '가장 비싼 Winner가 Publisher에 광고 전달',
          detail: '전부 동시에 경쟁시킨 결과, Waterfall 대비 평균 +10~30% 비싸게 팔립니다. 매체들이 HB를 쓰는 이유입니다.',
          packet: { label: '최고가 낙찰', kind: 'money' },
          example: {
            story: '최고가 ₩1,250 낙찰 — 순차 Waterfall로 팔았을 때보다 18% 더 받았다.',
            data: [['winner', '₩1,250'], ['vs waterfall', '+18%']]
          }
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
          packet: { label: '동의 여부', kind: 'data' },
          example: {
            story: "첫 방문 때 뜬 쿠키 팝업에서 김씨가 '광고 허용'을 눌렀다.",
            data: [['consent', 'yes'], ['scope', '광고']]
          }
        },
        {
          from: 'cmp', to: 'dmp',
          caption: '동의된 데이터만 DMP/CDP로 흘러감',
          detail: '동의받은 쿠키·디바이스 ID·구매 이력이 오디언스 데이터 창고(DMP/CDP)에 모입니다.',
          packet: { label: '동의된 데이터', kind: 'data' },
          example: {
            story: '동의받은 쿠키와 운동화 검색 이력만 데이터 창고로 들어간다.',
            data: [['id', 'cookie'], ['이력', '운동화 검색']]
          }
        },
        {
          from: 'dmp', to: 'dsp',
          caption: '오디언스 세그먼트가 DSP의 타겟팅 입력으로',
          detail: '"20대 · 전자제품 관심"처럼 묶음(세그먼트)으로 가공돼 DSP에 전달됩니다. 개인이 아니라 묶음 단위라는 게 포인트.',
          packet: { label: '오디언스 세그먼트', kind: 'data' },
          example: {
            story: "김씨는 '2030·스포츠 관심' 42만 명짜리 묶음의 한 명으로 DSP에 전달된다.",
            data: [['segment', '2030 스포츠'], ['크기', '42만명']]
          }
        },
        {
          from: 'dsp', to: 'exchange',
          caption: 'DSP가 세그먼트 기반으로 입찰가 결정',
          detail: '내 타겟과 맞는 사용자가 나타나면 더 비싸게 부릅니다. 데이터가 곧 입찰가 차이를 만듭니다.',
          packet: { label: '타겟 입찰', kind: 'money' },
          example: {
            story: '내 타겟과 딱 맞아 평소 ₩900짜리를 ₩1,400까지 올려 부른다.',
            data: [['기본가', '₩900'], ['타겟가', '₩1,400']]
          }
        },
        {
          from: 'exchange', to: 'publisher',
          caption: '타겟팅된 사용자에게 개인화 광고 노출',
          detail: '결과적으로 같은 지면이라도 사람마다 다른 광고를 보게 됩니다.',
          packet: { label: '개인화 광고', kind: 'creative' },
          example: {
            story: '같은 자리라도 김씨는 운동화 A 광고를, 옆 사람은 다른 광고를 본다.',
            data: [['creative', '운동화 A'], ['vs', '일반 광고']]
          }
        },
      ]
    },
  };

  const CAT_LABEL = {
    buy: 'Buy Side', exchange: 'Exchange', sell: 'Sell Side',
    ml: 'ML / Models', measurement: 'Measurement', user: 'User / Privacy'
  };

  // 가치사슬 레인(좌→우): 배경 컬럼 + 헤더 라벨로 "읽는 순서"를 만든다.
  const LANES = [
    { label: 'USER', x: 36, w: 224 },
    { label: 'SELL SIDE', x: 278, w: 304 },
    { label: 'EXCHANGE', x: 600, w: 230 },
    { label: 'BUY SIDE', x: 848, w: 396 },
  ];
  const LANE_TOP = 186, LANE_BOT = 548, LANE_LABEL_Y = 150;
  // 가로 밴드 라벨(상단 ML / 하단 측정) — 스파인 위·아래 지원 레이어 표시
  // 층·행 라벨. 두뇌 층은 2행(학습/서빙)이라 행 라벨을 왼쪽 여백(x<250)에 세로로 쌓는다.
  const BAND_LABELS = [
    { text: '두뇌 층 — 모델이 사는 곳', x: 44, y: 16, cls: 'is-layer' },
    { text: '1단계 학습 · 오프라인', x: 44, y: 44 },
    { text: '2단계 서빙 · 0.1초', x: 44, y: 106 },
    { text: '측정 · 로그 데이터', x: 44, y: 590 },
  ];
  // 두뇌 층 배경 밴드 (거래 층의 레인 컬럼과 대비되는 가로 밴드)
  const BRAIN_BAND = { x: 30, y: 6, w: 1220, h: 140 };

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

    openFlowFromUrl();
  }

  // ?flow=<이름> 으로 들어오면 그 흐름을 바로 재생한다(표지 칩 → 이 페이지 딥링크).
  // 알 수 없는 이름이면 조용히 무시한다.
  function openFlowFromUrl() {
    let name = null;
    try { name = new URLSearchParams(window.location.search).get('flow'); } catch (e) { return; }
    if (!name || !FLOWS[name]) return;
    const chip = flowChips.find(c => c.dataset.flow === name);
    startFlow(name, chip || null);
    const wrap = document.getElementById('eco-graph-wrap');
    if (wrap && wrap.scrollIntoView) wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function applyCompact() {
    const compact = wrapEl.clientWidth < 640;
    svg.classList.toggle('is-compact', compact);
    if (fs.name && fs.i >= 0) stylePacket(fs.flow.steps[fs.i]);
  }

  // ── SVG build ──
  function buildSVG() {
    svg.appendChild(createDefs());
    svg.appendChild(buildLanes());

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

  function buildLanes() {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'eco-lanes');

    // 두뇌 층 밴드 (가로) — 거래 층 레인(세로 컬럼)과 시각적으로 구분
    const band = document.createElementNS(SVG_NS, 'rect');
    band.setAttribute('class', 'eco-brain-band');
    band.setAttribute('x', BRAIN_BAND.x);
    band.setAttribute('y', BRAIN_BAND.y);
    band.setAttribute('width', BRAIN_BAND.w);
    band.setAttribute('height', BRAIN_BAND.h);
    band.setAttribute('rx', 18);
    g.appendChild(band);

    LANES.forEach(l => {
      const r = document.createElementNS(SVG_NS, 'rect');
      r.setAttribute('class', 'eco-lane-bg');
      r.setAttribute('x', l.x);
      r.setAttribute('y', LANE_TOP);
      r.setAttribute('width', l.w);
      r.setAttribute('height', LANE_BOT - LANE_TOP);
      r.setAttribute('rx', 18);
      g.appendChild(r);
      const t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('class', 'eco-lane-label');
      t.setAttribute('x', l.x + l.w / 2);
      t.setAttribute('y', LANE_LABEL_Y);
      t.textContent = l.label;
      g.appendChild(t);
    });
    BAND_LABELS.forEach(b => {
      const t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('class', b.cls ? `eco-band-label ${b.cls}` : 'eco-band-label');
      t.setAttribute('x', b.x);
      t.setAttribute('y', b.y);
      t.textContent = b.text;
      g.appendChild(t);
    });
    return g;
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
    g.setAttribute('class', n.heart ? 'eco-node is-heart' : 'eco-node');
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
    rect.setAttribute('rx', 12);
    g.appendChild(rect);

    // 카테고리 컬러 좌측 액센트 바 (코너를 피해 살짝 안쪽)
    const accent = document.createElementNS(SVG_NS, 'rect');
    accent.setAttribute('class', 'eco-node-accent');
    accent.setAttribute('x', n.x);
    accent.setAttribute('y', n.y + 11);
    accent.setAttribute('width', 5);
    accent.setAttribute('height', Math.max(8, n.h - 22));
    accent.setAttribute('rx', 2.5);
    g.appendChild(accent);

    // 심장 노드는 맥박 링을 한 겹 덧그린다(장식 — 포인터 이벤트 없음)
    if (n.heart) {
      const pulse = document.createElementNS(SVG_NS, 'rect');
      pulse.setAttribute('class', 'eco-heart-pulse');
      pulse.setAttribute('x', n.x);
      pulse.setAttribute('y', n.y);
      pulse.setAttribute('width', n.w);
      pulse.setAttribute('height', n.h);
      pulse.setAttribute('rx', 12);
      pulse.setAttribute('pointer-events', 'none');
      pulse.setAttribute('transform-origin', `${n.x + n.w / 2} ${n.y + n.h / 2}`);
      g.appendChild(pulse);
    }

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

  function rectCenter(n) { return { x: n.x + n.w / 2, y: n.y + n.h / 2 }; }
  function nodeCenter(id) { return rectCenter(NODES[id]); }

  // 직각(Manhattan) 경로의 꺾이는 점 배열을 만든다.
  //  via 'top'|'bottom' : 두 노드 바깥(위/아래)의 가로 버스로 우회 (U자)
  //  그 외             : 가로/세로 우세 방향에 맞춰 L 또는 Z 경로 자동 생성
  function edgeGeometry(e) {
    const a = NODES[e.from], b = NODES[e.to];
    const ac = rectCenter(a), bc = rectCenter(b);
    const channel = e.channel || 0;
    let pts;

    // e.detour = [[x,y], …] — 손으로 지정한 우회 경유점.
    // 자동 라우팅(아래 로직)은 두 노드만 보고 길을 내므로, 사이에 다른 노드가
    // 있으면 그 상자를 관통한다. 노드 채움이 rgba(...,0.13)이라 선이 그대로 보여
    // 라벨 위로 줄이 지나간다. 빈 통로를 아는 건 사람이므로 여기서 지정한다.
    // 고친 뒤에는 반드시 `node scripts/check-map.js` 로 새 교차가 없는지 확인한다.
    //
    // 출발·도착 변은 경유점이 알려 준다. 첫 경유점의 x가 출발 노드 중심과 같으면
    // 위/아래 변에서 나가고, 다르면 좌/우 변에서 나간다(도착도 같은 규칙).
    if (Array.isArray(e.detour) && e.detour.length) {
      const first = e.detour[0], last = e.detour[e.detour.length - 1];
      const start = Math.abs(first[0] - ac.x) < 1
        ? [ac.x, first[1] > ac.y ? a.y + a.h : a.y]
        : [first[0] > ac.x ? a.x + a.w : a.x, ac.y];
      const end = Math.abs(last[0] - bc.x) < 1
        ? [bc.x, last[1] > bc.y ? b.y + b.h : b.y]
        : [last[0] > bc.x ? b.x + b.w : b.x, bc.y];
      return { points: [start, ...e.detour, end], r: 11 };
    }

    if (e.via === 'top' || e.via === 'bottom') {
      const sign = e.via === 'bottom' ? 1 : -1;
      const ay = sign > 0 ? a.y + a.h : a.y;
      const by = sign > 0 ? b.y + b.h : b.y;
      const edgeY = sign > 0 ? Math.max(a.y + a.h, b.y + b.h) : Math.min(a.y, b.y);
      const busY = edgeY + sign * (28 + channel);
      pts = [[ac.x, ay], [ac.x, busY], [bc.x, busY], [bc.x, by]];
    } else {
      const dx = bc.x - ac.x, dy = bc.y - ac.y;
      if (Math.abs(dx) >= Math.abs(dy)) {
        // 가로 우세: 좌/우 변에서 출입, 세로 버스
        const right = dx >= 0;
        const ax = right ? a.x + a.w : a.x;
        const bx = right ? b.x : b.x + b.w;
        if (Math.abs(ac.y - bc.y) < 1) {
          pts = [[ax, ac.y], [bx, bc.y]];
        } else {
          const busX = (ax + bx) / 2 + channel;
          pts = [[ax, ac.y], [busX, ac.y], [busX, bc.y], [bx, bc.y]];
        }
      } else {
        // 세로 우세: 위/아래 변에서 출입, 가로 버스
        const down = dy >= 0;
        const ay = down ? a.y + a.h : a.y;
        const by = down ? b.y : b.y + b.h;
        if (Math.abs(ac.x - bc.x) < 1) {
          pts = [[ac.x, ay], [bc.x, by]];
        } else {
          const busY = (ay + by) / 2 + channel;
          pts = [[ac.x, ay], [ac.x, busY], [bc.x, busY], [bc.x, by]];
        }
      }
    }
    return { points: pts, r: 11 };
  }

  // 꺾이는 점들을 잇되 각 코너를 반경 r의 짧은 Q곡선으로 둥글린다.
  function roundedOrthPath(points, r) {
    if (points.length <= 2) {
      const a = points[0], z = points[points.length - 1];
      return `M ${a[0]} ${a[1]} L ${z[0]} ${z[1]}`;
    }
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length - 1; i++) {
      const [px, py] = points[i - 1], [cx, cy] = points[i], [nx, ny] = points[i + 1];
      const inLen = Math.hypot(cx - px, cy - py), outLen = Math.hypot(nx - cx, ny - cy);
      const rr = Math.max(0, Math.min(r, inLen / 2, outLen / 2));
      const sgn = (v) => (v === 0 ? 0 : v / Math.abs(v));
      const idx = sgn(cx - px), idy = sgn(cy - py);
      const odx = sgn(nx - cx), ody = sgn(ny - cy);
      d += ` L ${cx - idx * rr} ${cy - idy * rr} Q ${cx} ${cy} ${cx + odx * rr} ${cy + ody * rr}`;
    }
    const last = points[points.length - 1];
    d += ` L ${last[0]} ${last[1]}`;
    return d;
  }

  function createEdgePath(e) {
    const p = document.createElementNS(SVG_NS, 'path');
    // layer:true = 거래 층 ↔ 두뇌 층을 잇는 통로. 굵은 파선으로 따로 보이게 한다.
    p.setAttribute('class', e.layer ? 'eco-edge is-layer-link' : 'eco-edge');
    p.setAttribute('data-from', e.from);
    p.setAttribute('data-to', e.to);
    const g = edgeGeometry(e);
    p.setAttribute('d', roundedOrthPath(g.points, g.r));
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
      <a class="eco-side-easy" href="ecosystem-terms.html#${id}">쉽게 보기 →</a>
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

  function exampleHTML(ex) {
    if (!ex) return '';
    const story = ex.story ? `<p class="eco-step-story">${ex.story}</p>` : '';
    const data = (ex.data && ex.data.length)
      ? `<div class="eco-step-data">${ex.data.map(d =>
          `<span class="eco-data-chip"><b>${d[0]}</b> ${d[1]}</span>`).join('')}</div>`
      : '';
    return `
      <div class="eco-step-example">
        <span class="eco-step-example-label">예시</span>
        ${story}
        ${data}
      </div>`;
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
          ${exampleHTML(s.example)}
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
