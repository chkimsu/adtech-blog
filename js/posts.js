// Blog Posts Data Structure
// All blog posts are stored here as JavaScript objects
// Content is loaded dynamically from Markdown files in the posts/ directory

// Category/tag 표준 목록은 data/taxonomy.json 이 단일 소스다.
// 새 글은 `node scripts/new-post.js` 로 추가하고, 추가 후
// `node scripts/compute-read-time.js && node scripts/validate-posts.js` 를 돌린다.

const posts = [
  {
    id: 'difference-in-differences',
    title: '이중차분법(DiD) 쉽게 이해하기: 차이를 두 번 빼서 \'진짜 효과\'만 남기는 법',
    excerpt: '광고를 켠 뒤 매출이 올랐다 — 광고 덕분일까, 그냥 성수기일까? 단순 전후 비교는 시간 효과에, 단순 그룹 비교는 원래 차이에 속는다. 광고를 안 한 옆 동네를 \'대역 배우\'로 세워 (처치군 변화)−(대조군 변화)로 자연 증가를 걷어내는 이중차분의 직관을, 서울/부산 숫자와 평행추세 그림으로 풀어낸다. 교차항 회귀식의 β₃가 왜 곧 효과인지, 그리고 A/B를 못 돌릴 때 증분효과(incrementality)를 재는 도구로서의 DiD까지.',
    date: '2026-06-07',
    categories: ['Measurement & Modeling'],
    tags: ['Causal Inference', 'Incrementality', 'A/B Testing'],
    contentUrl: 'posts/difference-in-differences.md',
    readTime: '9 min read'
  },
  {
    id: 'ab-test-vs-mab',
    title: 'A/B 테스트 vs 멀티암드 밴딧: 고정 트래픽과 적응형 트래픽, 그리고 Contextual은 왜 필요한가',
    excerpt: '50:50으로 나눠 기다리는 A/B 테스트와, 데이터가 쌓이는 대로 트래픽을 옮기는 밴딧은 무엇이 다른가? 광고 3개·하루 100노출·10일이라는 구체적 숫자와 일상 비유로 고정 트래픽 vs 적응형, 그리고 같은 광고라도 사람마다 다르게 보여주는 Contextual Bandit까지 쉽게 풀어냅니다.',
    date: '2026-06-05',
    categories: ['Bandits & Personalization'],
    tags: ['MAB', 'A/B Testing', 'Contextual Bandit', 'Exploration', 'Online Learning'],
    contentUrl: 'posts/ab-test-vs-mab.md',
    readTime: '7 min read',
    featured: true,
    series: 'bandits-track'
  },
  {
    id: 'adtech-30min-primer',
    title: '30분만에 이해하는 광고 시스템: 생태계·경매·랭킹·측정 전체 지도 (입문 가이드)',
    excerpt: '완전 초보자를 위한 올인원 입문서. 생태계(DSP/SSP/Ad Exchange), 1st Price 경매와 Bid Shading, eCPM·pCTR·pCVR·Calibration, Attribution과 iOS ATT, 타겟팅·인프라까지 — 수식 없이 비유와 숫자로 한 번에 훑고, 이 블로그의 30편 포스트로 연결해 주는 허브입니다.',
    date: '2026-04-20',
    categories: ['Bidding & Auction'],
    tags: ['입문', 'Ad Ecosystem', 'RTB', 'DSP', 'SSP', 'pCTR', 'pCVR', 'Attribution', 'eCPM'],
    contentUrl: 'posts/adtech-30min-primer.md',
    readTime: '13 min read',
    featured: true,
    series: 'getting-started'
  },
  {
    id: 'audience-segmentation',
    title: '오디언스 세그멘테이션: 광고 타겟팅의 첫 번째 질문 — 누구에게 보여줄 것인가',
    excerpt: 'Demographic, Behavioral, RFM, Lifecycle 세그멘트 분류 체계부터 Rule-based SQL, ML Clustering(K-Means, GMM), 실시간 스트리밍 할당, Feature Store 연동, DMP vs CDP, GDPR/CCPA까지 — 세그멘테이션 전체를 해부합니다.',
    date: '2026-04-13',
    categories: ['Targeting & Audience'],
    tags: ['Segmentation', 'Targeting', 'Ad Ecosystem', 'DMP', 'CDP', 'ML Infra'],
    contentUrl: 'posts/audience-segmentation.md',
    readTime: '39 min read'
  },
  {
    id: 'lookalike-modeling',
    title: 'Lookalike Modeling: 전환 유저 100명에서 100만 유사 유저를 발굴하는 법',
    excerpt: 'Seed Audience 선정부터 Embedding 유사도, Propensity Score, Graph Expansion까지 — 3대 접근법과 Expansion Ratio 트레이드오프, 멀티 플랫폼 비교, 프로덕션 아키텍처를 해부합니다.',
    date: '2026-04-13',
    categories: ['Targeting & Audience'],
    tags: ['Lookalike', 'Targeting', 'Ad Ecosystem', 'ML Infra', 'Two-Tower'],
    contentUrl: 'posts/lookalike-modeling.md',
    readTime: '36 min read'
  },
  {
    id: 'git-practical-guide',
    title: '실무에서 바로 쓰는 Git 완전 가이드: 시각적으로 이해하는 fetch, merge, rebase, stash',
    excerpt: 'Working Directory → Staging → Local Repo → Remote Repo 멘탈 모델부터 fetch vs pull, merge vs rebase 비교, stash 활용, 충돌 해결, 실무 브랜치 전략까지 — 다이어그램으로 완전 해부합니다.',
    date: '2026-04-12',
    categories: ['DevOps & Tooling'],
    tags: ['Git', 'DevOps', 'Workflow', 'Collaboration'],
    contentUrl: 'posts/git-practical-guide.md',
    readTime: '21 min read'
  },
  {
    id: 'ad-log-pipeline',
    title: '광고 시스템 로그 파이프라인: 한 번의 입찰에서 10개의 로그가 만들어지는 구조',
    excerpt: 'Request Log부터 Attribution Log까지 — 광고 시스템의 10가지 핵심 로그가 언제, 어디서, 무엇을 기록하고, ML 학습 데이터로 어떻게 합류하는지 전체 파이프라인을 해부합니다.',
    date: '2026-04-12',
    categories: ['ML Infrastructure'],
    tags: ['ML Infra', 'pCTR', 'Ad Ecosystem', 'DSP'],
    contentUrl: 'posts/ad-log-pipeline.md',
    readTime: '21 min read'
  },
  {
    id: 'ltv-ad-ranking',
    title: 'LTV(Long Term Value): eCPM 너머, 광고 랭킹의 진짜 기준',
    excerpt: 'eCPM만으로 광고를 정렬하면 왜 위험한가? 사용자 비용(β), Squashing Function까지 — 광고 플랫폼이 "돈"과 "경험"을 동시에 최적화하는 LTV 랭킹의 원리를 해부합니다.',
    date: '2026-04-11',
    categories: ['Bidding & Auction'],
    tags: ['eCPM', 'Ad Ranking', 'Ad Ecosystem', 'pCTR'],
    contentUrl: 'posts/ltv-ad-ranking.md',
    readTime: '9 min read'
  },
  {
    id: 'ad-log-system',
    title: '광고 로그 시스템 완전 해부: Request Log에서 Candidate Log까지',
    excerpt: 'Request, Impression, Click, Conversion, Candidate Log의 역할과 차이를 정리하고, 실시간 피처 파이프라인(Redis), Candidate Log 유무에 따른 모델 품질 차이, 멀티슬롯 rank=1 추론 문제까지 해부합니다.',
    date: '2026-04-11',
    categories: ['ML Infrastructure'],
    tags: ['ML Infra', 'pCTR', 'pCVR', 'Ad Ecosystem', 'Online Learning'],
    contentUrl: 'posts/ad-log-system.md',
    readTime: '12 min read'
  },
  {
    id: 'adtech-dev-layers',
    title: 'Ad Tech 개발 레이어 맵: 광고 요청 하나가 유저에게 도달하기까지',
    excerpt: '타겟팅, 서빙, 예측 모델링, 입찰 최적화, 소재 최적화, 측정까지 — 광고 시스템을 구성하는 8개 레이어의 역할과 요청 흐름을 전체 지도로 해부합니다.',
    date: '2026-04-11',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'pCTR', 'Auto-Bidding', 'ML Infra', 'RTB'],
    contentUrl: 'posts/adtech-dev-layers.md',
    readTime: '9 min read'
  },
  {
    id: 'negative-sampling-bias',
    title: 'Negative Sampling & Sample Selection Bias: 광고 CTR 모델의 학습 데이터는 처음부터 편향되어 있다',
    excerpt: 'Class Imbalance, Negative Downsampling, Log-odds Correction, IPS, Doubly Robust Estimator까지 — 광고 CTR 모델 학습 데이터의 구조적 편향과 보정 기법을 해부합니다.',
    date: '2026-04-11',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'Ad Ecosystem', 'ML Infra'],
    contentUrl: 'posts/negative-sampling-bias.md',
    readTime: '13 min read'
  },
  {
    id: 'two-tower-retrieval',
    title: 'Two-Tower Model & 광고 후보 생성: 수백만 광고에서 10ms 안에 후보를 추리는 법',
    excerpt: 'Rule-based Retrieval의 한계부터 Two-Tower(DSSM) 아키텍처, Negative Sampling 전략, ANN 인덱스 비교, Multi-Interest Model까지 — 수백만 광고 후보에서 10ms 이내에 개인화된 후보를 추리는 Retrieval 시스템을 해부합니다.',
    date: '2026-04-11',
    categories: ['ML Infrastructure'],
    tags: ['Model Serving', 'ML Infra', 'pCTR'],
    contentUrl: 'posts/two-tower-retrieval.md',
    readTime: '14 min read'
  },
  {
    id: 'multi-task-learning',
    title: 'Multi-Task Learning: pCTR과 pCVR을 동시에 학습하면 왜 더 좋은가',
    excerpt: 'Sample Selection Bias를 해결하는 ESMM, Negative Transfer를 완화하는 MMoE, Seesaw 현상을 해소하는 PLE까지 — 광고 시스템 Multi-Task Learning 아키텍처의 진화와 실무 선택 가이드를 해부합니다.',
    date: '2026-04-11',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'pCVR', 'Model Serving'],
    contentUrl: 'posts/multi-task-learning.md',
    readTime: '14 min read'
  },
  {
    id: 'exploration-exploitation',
    title: '탐색과 활용(Exploration & Exploitation): 광고 시스템의 근본적 딜레마',
    excerpt: 'Epsilon-Greedy, UCB, Thompson Sampling, Contextual Bandit의 탐색 전략을 비교하고, 새 광고·새 유저의 Cold-Start 문제 해법과 프로덕션 탐색 시스템 설계까지 다룹니다.',
    date: '2026-04-11',
    categories: ['Bandits & Personalization'],
    tags: ['MAB', 'Contextual Bandit', 'UCB', 'Thompson Sampling'],
    contentUrl: 'posts/exploration-exploitation.md',
    readTime: '12 min read'
  },
  {
    id: 'deep-ctr-models',
    title: 'Deep CTR 모델의 진화: LR에서 DIN까지, 광고 클릭률 예측의 핵심 아키텍처',
    excerpt: 'LR, FM, Wide&Deep, DeepFM, DCN-v2, DIN, DIEN — CTR 예측 모델이 "어떤 문제를 풀려고 했는가" 관점으로 진화 과정을 추적하고, 프로덕션 선택 가이드까지 제시합니다.',
    date: '2026-04-11',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'Model Serving', 'ML Infra'],
    contentUrl: 'posts/deep-ctr-models.md',
    readTime: '16 min read'
  },
  {
    id: 'calibration',
    title: 'Calibration: AUC가 높아도 돈을 잃는 이유 — 광고 모델의 확률 보정',
    excerpt: 'AUC는 순서만 평가하고 확률값의 정확도는 평가하지 않습니다. Platt Scaling, Isotonic Regression, Temperature Scaling으로 pCTR을 보정하고, 프로덕션 Calibration 파이프라인을 구축하는 방법을 해부합니다.',
    date: '2026-04-11',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'Bid Shading', 'Auto-Bidding'],
    contentUrl: 'posts/calibration.md',
    readTime: '15 min read'
  },
  {
    id: 'ad-network-vs-exchange',
    title: 'Ad Network vs Ad Exchange: 디지털 광고 유통 구조의 진화',
    excerpt: 'Waterfall에서 RTB, Header Bidding까지 — Ad Network과 Ad Exchange의 구조적 차이, 기술 아키텍처, 진화 과정을 해부합니다.',
    date: '2026-04-11',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'RTB', 'SSP', 'DSP'],
    contentUrl: 'posts/ad-network-vs-exchange.md',
    readTime: '10 min read'
  },
  {
    id: 'position-bias-ultr',
    title: 'Position Bias & Unbiased Learning to Rank: 위치가 만드는 착각을 제거하는 법',
    excerpt: 'Examination Hypothesis, IPS(Inverse Propensity Scoring), DLA(Dual Learning Algorithm)로 Position Bias를 보정하고 광고 랭킹의 공정성을 확보하는 방법을 해부합니다.',
    date: '2026-04-10',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'Ad Ecosystem', 'MAB'],
    contentUrl: 'posts/position-bias-ultr.md',
    readTime: '8 min read'
  },
  {
    id: 'model-serving-architecture',
    title: '광고 모델 서빙 아키텍처: 10ms 안에 수백 개 광고를 스코어링하는 법',
    excerpt: 'Multi-Stage Ranking, 모델 경량화(Distillation/Quantization), Embedding 최적화, GPU/CPU 추론 전략, Canary 배포까지 — 프로덕션 광고 ML 서빙의 전체 아키텍처를 해부합니다.',
    date: '2026-04-10',
    categories: ['ML Infrastructure'],
    tags: ['Model Serving', 'ML Infra', 'pCTR'],
    contentUrl: 'posts/model-serving-architecture.md',
    readTime: '9 min read'
  },
  {
    id: 'online-learning-delayed-feedback',
    title: 'Online Learning & Delayed Feedback: 광고 모델은 왜 매일 낡아지는가',
    excerpt: 'Concept Drift, Batch vs Online Learning, Delayed Feedback 보정(FSIW, Delay Model), 프로덕션 하이브리드 아키텍처, 모델 Staleness 모니터링까지 — 광고 ML 모델을 최신 상태로 유지하는 전체 파이프라인을 해부합니다.',
    date: '2026-04-10',
    categories: ['ML Infrastructure'],
    tags: ['Online Learning', 'ML Infra', 'pCTR', 'pCVR'],
    contentUrl: 'posts/online-learning-delayed-feedback.md',
    readTime: '12 min read'
  },
  {
    id: 'auto-bidding-pacing',
    title: 'Auto-Bidding & Budget Pacing: 일 예산 제약 하에서 수십만 번 입찰을 최적화하는 법',
    excerpt: 'PID Controller, Lagrangian Dual, 강화학습(RL)으로 일 예산을 하루 전체에 걸쳐 균등하게 분배하는 Budget Pacing의 이론과 실전을 해부합니다.',
    date: '2026-04-10',
    categories: ['Bidding & Auction'],
    tags: ['Auto-Bidding', 'Bid Shading', 'RTB'],
    contentUrl: 'posts/auto-bidding-pacing.md',
    readTime: '13 min read'
  },
  {
    id: 'feature-store-serving',
    title: 'Feature Store & Real-Time Serving: 광고 ML 시스템의 데이터 공급망 전체 지도',
    excerpt: 'Batch·Streaming·Real-Time 세 갈래 파이프라인이 Feature Store로 합류하고, 10ms 안에 Feature Vector로 조합되어 모델 추론에 공급되는 전체 아키텍처를 해부합니다.',
    date: '2026-04-10',
    categories: ['ML Infrastructure'],
    tags: ['ML Infra', 'DSP', 'pCTR'],
    contentUrl: 'posts/feature-store-serving.md',
    readTime: '21 min read'
  },
  {
    id: 'ecpm-ranking',
    title: 'eCPM과 광고 랭킹: 서로 다른 시장에서 1등을 결정하는 기준',
    excerpt: 'eCPM의 정의와 계산법을 정리하고, Open RTB·CPC Exchange·Walled Garden 세 가지 시장에서 광고 랭킹이 어떻게 달라지는지 구체적 시나리오로 비교합니다.',
    date: '2026-04-11',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'pCTR', 'RTB'],
    contentUrl: 'posts/ecpm-ranking.md',
    readTime: '14 min read'
  },
  {
    id: 'walled-garden',
    title: 'Walled Garden: 네이버·카카오는 왜 DSP부터 Publisher까지 다 가지고 있는가',
    excerpt: 'Open RTB와 Walled Garden(폐쇄형 생태계)의 구조적 차이를 분석하고, pCTR 모델링·경매 구조·데이터 활용이 어떻게 달라지는지 해부합니다.',
    date: '2026-04-06',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'DSP', 'SSP', 'RTB', 'pCTR'],
    contentUrl: 'posts/walled-garden.md',
    readTime: '11 min read'
  },
  {
    id: 'adtech-ecosystem-map',
    title: 'pCTR 모델러를 위한 광고 기술 생태계 전체 지도',
    excerpt: '광고주의 캠페인 등록부터 유저의 전환까지 — DSP, SSP, Ad Exchange, pCTR, pCVR, 자동입찰, Bid Shading의 관계를 6개 다이어그램으로 완전 해부합니다.',
    date: '2026-04-06',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'pCTR', 'pCVR', 'Auto-Bidding', 'Bid Shading'],
    contentUrl: 'posts/adtech-ecosystem-map.md',
    readTime: '13 min read',
    featured: true
  },
  {
    id: 'bid-shading-censored',
    title: 'Bid Shading & Censored Data: 1st Price Auction에서 최적 입찰가를 찾는 법',
    excerpt: 'Right-Censored 데이터에서 시장 분포를 추정하고, Surplus를 극대화하는 최적 입찰가를 실시간으로 계산하는 End-to-End 파이프라인을 두 편의 논문과 함께 해부합니다.',
    date: '2026-04-06',
    categories: ['Bidding & Auction'],
    tags: ['Bid Shading', 'RTB', 'pCTR'],
    contentUrl: 'posts/bid-shading-censored.md',
    readTime: '18 min read'
  },
  {
    id: 'my-markdown-post',
    title: 'pCVR 모델링 학습 시 주요 고려사항 및 중복 전환(Deduplication) 이슈 정리',
    excerpt: 'pCVR 모델 학습에서 발생하는 중복 전환(Deduplication) 이슈와 주요 고려사항을 정리합니다.',
    date: '2026-01-10',
    categories: ['Measurement & Modeling'],
    tags: ['pCVR', 'pCTR'],
    contentUrl: 'posts/pCVR-modeling.md',
    readTime: '5 min read'
  },
  {
    id: 'TS-linTS',
    title: 'Standard TS vs Linear TS',
    excerpt: '개별 광고 ID를 학습하는 Standard TS와 Feature 가중치를 학습하는 Linear TS의 핵심 차이를 비교합니다.',
    date: '2026-01-03',
    categories: ['Bandits & Personalization'],
    tags: ['Thompson Sampling', 'MAB', 'Contextual Bandit'],
    contentUrl: 'posts/TS-linTS.md',
    readTime: '3 min read'
  },
  {
    id: 'mab-summary',
    title: '[Summary] AdTech MAB Algorithm Collection',
    excerpt: 'AdTech 엔지니어의 시각에서 정리한 MAB 알고리즘 총정리 (Context-Free, Contextual, Hybrid)',
    date: '2026-01-17',
    categories: ['Bandits & Personalization'],
    tags: ['MAB', 'LinUCB', 'Thompson Sampling', 'UCB'],
    contentUrl: 'posts/mab.md',
    readTime: '3 min read'
  },
  {
    id: 'ucb-vs-ts',
    title: 'UCB vs Thompson Sampling: 결정적(Deterministic) vs 확률적(Stochastic)',
    excerpt: 'UCB는 계산기, TS는 주사위? MAB의 두 거대 산맥인 UCB와 Thompson Sampling의 결정적인 차이를 직관적으로 비교합니다.',
    date: '2026-01-17',
    categories: ['Bandits & Personalization'],
    tags: ['UCB', 'Thompson Sampling', 'MAB'],
    contentUrl: 'posts/ucb_ts.md',
    readTime: '2 min read'
  },
  {
    id: 'disjoint-linucb',
    title: 'Disjoint LinUCB 모델 상세 해석',
    excerpt: 'LinUCB의 핵심 공식인 "최종 점수 = 예측(Exploitation) + 불확실성(Exploration)"을 시각화와 함께 해석합니다.',
    date: '2026-01-20',
    categories: ['Bandits & Personalization'],
    tags: ['LinUCB', 'Contextual Bandit', 'MAB'],
    contentUrl: 'posts/disjoint-LinUCB.md',
    readTime: '4 min read'
  },
  {
    id: 'ad-serving-flow',
    title: 'Ad Serving Flow: 광고가 유저에게 도달하는 전체 과정',
    excerpt: 'DSP, SSP, Ad Exchange, DMP의 역할과 RTB Auction 플로우를 도식도와 함께 정리합니다.',
    date: '2026-01-25',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'DSP', 'SSP', 'RTB'],
    contentUrl: 'posts/ad-serving-flow.md',
    readTime: '3 min read',
    series: 'getting-started'
  },
  {
    id: 'ucb-family',
    title: 'UCB 알고리즘 패밀리: UCB1 vs LinUCB vs Hybrid LinUCB',
    excerpt: 'UCB 계열 알고리즘 3종의 수식, 작동 방식, Cold Start 대응력을 상세 비교합니다.',
    date: '2026-02-01',
    categories: ['Bandits & Personalization'],
    tags: ['UCB', 'LinUCB', 'MAB', 'Contextual Bandit'],
    contentUrl: 'posts/ucb-family.md',
    readTime: '4 min read'
  },
];

// 읽는 순서(시리즈). 순서는 여기 한 곳에서만 관리한다(데모 learning-path와 동일 사상).
const series = {
  'getting-started': {
    title: '광고 시스템 입문 경로',
    desc: '배경지식 없이 시작해 광고 생태계 전체를 한 바퀴',
    posts: ['adtech-30min-primer', 'ad-serving-flow', 'ad-network-vs-exchange', 'ecpm-ranking', 'ltv-ad-ranking'],
  },
  'bandits-track': {
    title: '밴딧 & 개인화 트랙',
    desc: 'A/B vs 밴딧 → MAB 기초 → UCB/TS → Contextual',
    posts: ['ab-test-vs-mab', 'mab-summary', 'exploration-exploitation', 'ucb-vs-ts', 'ucb-family', 'TS-linTS', 'disjoint-linucb'],
  },
  'modeling-track': {
    title: '예측 모델링 트랙',
    desc: 'CTR 모델 진화 → 보정 → 멀티태스크 → 편향 보정',
    posts: ['deep-ctr-models', 'calibration', 'multi-task-learning', 'negative-sampling-bias', 'position-bias-ultr'],
  },
  'ml-infra-track': {
    title: 'ML 인프라 트랙',
    desc: '로그 수집 → 피처스토어 → 검색 → 서빙 → 온라인 학습, 데이터에서 모델까지',
    posts: ['ad-log-pipeline', 'ad-log-system', 'feature-store-serving', 'two-tower-retrieval', 'model-serving-architecture', 'online-learning-delayed-feedback'],
  },
  'targeting-track': {
    title: '타겟팅 & 오디언스 트랙',
    desc: '세그멘테이션에서 룩얼라이크 확장까지',
    posts: ['audience-segmentation', 'lookalike-modeling'],
  },
  'advanced-bidding-track': {
    title: '입찰·생태계 심화 트랙',
    desc: '생태계 구조 → 개발 레이어 → 자동입찰·페이싱 → 입찰 셰이딩',
    posts: ['walled-garden', 'adtech-dev-layers', 'auto-bidding-pacing', 'bid-shading-censored'],
  },
};

// 홈 "시작하기" 레일 순서(큐레이션). featured와 독립적으로 시퀀스를 정한다.
const startHere = ['adtech-30min-primer', 'adtech-ecosystem-map', 'ad-serving-flow'];

// Helper functions for data access
function getAllPosts() {
  return posts.slice().sort((a, b) => new Date(b.date) - new Date(a.date)); // slice로 원본 보존
}

function getPostById(id) {
  return posts.find(post => post.id === id);
}

function getAllCategories() {
  const categories = new Set();
  posts.forEach(post => {
    post.categories.forEach(category => categories.add(category));
  });
  return Array.from(categories).sort();
}

function getAllTags() {
  const tags = new Set();
  posts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

function toList(v) { return !v ? [] : (Array.isArray(v) ? v.filter(Boolean) : [v]); }

// searchTerm + category/tag(문자열 또는 배열). facet 안에서는 OR, facet 사이에서는 AND.
function filterPosts(searchTerm, category, tag) {
  const cats = toList(category);
  const tags = toList(tag);
  const q = (searchTerm || '').toLowerCase();
  return posts.filter(post => {
    const matchesSearch = !q
      || post.title.toLowerCase().includes(q)
      || (post.excerpt || '').toLowerCase().includes(q)
      || (post.tags || []).some(t => t.toLowerCase().includes(q));
    const matchesCategory = cats.length === 0 || cats.some(c => post.categories.includes(c));
    const matchesTag      = tags.length === 0 || tags.some(t => post.tags.includes(t));
    return matchesSearch && matchesCategory && matchesTag;
  });
}

function readMinutes(p) { const m = String(p.readTime || '').match(/\d+/); return m ? parseInt(m[0], 10) : 0; }
function sortPosts(list, mode) {
  const arr = list.slice();
  if (mode === 'oldest')   return arr.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (mode === 'readtime') return arr.sort((a, b) => readMinutes(a) - readMinutes(b));
  return arr.sort((a, b) => new Date(b.date) - new Date(a.date)); // newest 기본
}

function getFeaturedPosts() { return posts.filter(p => p.featured); }

function getStartHerePosts() {
  const ordered = (typeof startHere !== 'undefined' ? startHere : []).map(getPostById).filter(Boolean);
  return ordered.length ? ordered : getFeaturedPosts();
}

function getSeries(id) {
  const s = series[id];
  if (!s) return null;
  return { id, ...s, posts: s.posts.map(getPostById).filter(Boolean) };
}

function getSeriesForPost(post) {
  if (!post) return null;
  const id = post.series || Object.keys(series).find(k => series[k].posts.includes(post.id));
  if (!id) return null;
  const r = getSeries(id);
  const i = r.posts.findIndex(p => p.id === post.id);
  if (i === -1) return null;
  return { ...r, index: i, position: i + 1, total: r.posts.length,
    prev: i > 0 ? r.posts[i - 1] : null, next: i < r.posts.length - 1 ? r.posts[i + 1] : null };
}

// Node(tooling) interop — 브라우저에선 module이 undefined라 no-op.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { posts, getAllPosts, getPostById, getAllCategories, getAllTags, filterPosts,
    sortPosts, readMinutes, getFeaturedPosts, getStartHerePosts, getSeries, getSeriesForPost, series, startHere };
}
