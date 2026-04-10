// Blog Posts Data Structure
// All blog posts are stored here as JavaScript objects
// Content is loaded dynamically from Markdown files in the posts/ directory

// Category taxonomy (ad-tech focused, broad groupings):
// - Bandits & Personalization  → MAB, exploration/exploitation, contextual bandits
// - Measurement & Modeling     → pCVR, attribution, conversion modeling
// - Bidding & Auction          → RTB, auction theory, bid optimization (future)
// - Privacy & Compliance       → GDPR, CCPA, cookie-less (future)
// - ML Infrastructure          → feature pipelines, serving, A/B platforms

const posts = [
  {
    id: 'position-bias-ultr',
    title: 'Position Bias & Unbiased Learning to Rank: 위치가 만드는 착각을 제거하는 법',
    excerpt: 'Examination Hypothesis, IPS(Inverse Propensity Scoring), DLA(Dual Learning Algorithm)로 Position Bias를 보정하고 광고 랭킹의 공정성을 확보하는 방법을 해부합니다.',
    date: '2026-04-10',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'Ad Ecosystem', 'MAB'],
    contentUrl: 'posts/position-bias-ultr.md',
    readTime: '18 min read'
  },
  {
    id: 'model-serving-architecture',
    title: '광고 모델 서빙 아키텍처: 10ms 안에 수백 개 광고를 스코어링하는 법',
    excerpt: 'Multi-Stage Ranking, 모델 경량화(Distillation/Quantization), Embedding 최적화, GPU/CPU 추론 전략, Canary 배포까지 — 프로덕션 광고 ML 서빙의 전체 아키텍처를 해부합니다.',
    date: '2026-04-10',
    categories: ['ML Infrastructure'],
    tags: ['Model Serving', 'ML Infra', 'pCTR'],
    contentUrl: 'posts/model-serving-architecture.md',
    readTime: '18 min read'
  },
  {
    id: 'online-learning-delayed-feedback',
    title: 'Online Learning & Delayed Feedback: 광고 모델은 왜 매일 낡아지는가',
    excerpt: 'Concept Drift, Batch vs Online Learning, Delayed Feedback 보정(FSIW, Delay Model), 프로덕션 하이브리드 아키텍처, 모델 Staleness 모니터링까지 — 광고 ML 모델을 최신 상태로 유지하는 전체 파이프라인을 해부합니다.',
    date: '2026-04-10',
    categories: ['ML Infrastructure'],
    tags: ['Online Learning', 'ML Infra', 'pCTR', 'pCVR'],
    contentUrl: 'posts/online-learning-delayed-feedback.md',
    readTime: '18 min read'
  },
  {
    id: 'auto-bidding-pacing',
    title: 'Auto-Bidding & Budget Pacing: 일 예산 제약 하에서 수십만 번 입찰을 최적화하는 법',
    excerpt: 'PID Controller, Lagrangian Dual, 강화학습(RL)으로 일 예산을 하루 전체에 걸쳐 균등하게 분배하는 Budget Pacing의 이론과 실전을 해부합니다.',
    date: '2026-04-10',
    categories: ['Bidding & Auction'],
    tags: ['Auto-Bidding', 'Bid Shading', 'RTB'],
    contentUrl: 'posts/auto-bidding-pacing.md',
    readTime: '20 min read'
  },
  {
    id: 'feature-store-serving',
    title: 'Feature Store & Real-Time Serving: 광고 ML 시스템의 데이터 공급망 전체 지도',
    excerpt: 'Batch·Streaming·Real-Time 세 갈래 파이프라인이 Feature Store로 합류하고, 10ms 안에 Feature Vector로 조합되어 모델 추론에 공급되는 전체 아키텍처를 해부합니다.',
    date: '2026-04-10',
    categories: ['ML Infrastructure'],
    tags: ['ML Infra', 'DSP', 'pCTR'],
    contentUrl: 'posts/feature-store-serving.md',
    readTime: '18 min read'
  },
  {
    id: 'walled-garden',
    title: 'Walled Garden: 네이버·카카오는 왜 DSP부터 Publisher까지 다 가지고 있는가',
    excerpt: 'Open RTB와 Walled Garden(폐쇄형 생태계)의 구조적 차이를 분석하고, pCTR 모델링·경매 구조·데이터 활용이 어떻게 달라지는지 해부합니다.',
    date: '2026-04-06',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'DSP', 'SSP', 'RTB', 'pCTR'],
    contentUrl: 'posts/walled-garden.md',
    readTime: '15 min read'
  },
  {
    id: 'adtech-ecosystem-map',
    title: 'pCTR 모델러를 위한 광고 기술 생태계 전체 지도',
    excerpt: '광고주의 캠페인 등록부터 유저의 전환까지 — DSP, SSP, Ad Exchange, pCTR, pCVR, 자동입찰, Bid Shading의 관계를 6개 다이어그램으로 완전 해부합니다.',
    date: '2026-04-06',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'pCTR', 'pCVR', 'Auto-Bidding', 'Bid Shading'],
    contentUrl: 'posts/adtech-ecosystem-map.md',
    readTime: '15 min read'
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
    readTime: '10 min read'
  },
  {
    id: 'TS-linTS',
    title: 'Standard TS vs Linear TS',
    excerpt: '개별 광고 ID를 학습하는 Standard TS와 Feature 가중치를 학습하는 Linear TS의 핵심 차이를 비교합니다.',
    date: '2026-01-03',
    categories: ['Bandits & Personalization'],
    tags: ['Thompson Sampling', 'MAB', 'Contextual Bandit'],
    contentUrl: 'posts/TS-linTS.md',
    readTime: '15 min read'
  },
  {
    id: 'mab-summary',
    title: '[Summary] AdTech MAB Algorithm Collection',
    excerpt: 'AdTech 엔지니어의 시각에서 정리한 MAB 알고리즘 총정리 (Context-Free, Contextual, Hybrid)',
    date: '2026-01-17',
    categories: ['Bandits & Personalization'],
    tags: ['MAB', 'LinUCB', 'Thompson Sampling', 'UCB'],
    contentUrl: 'posts/mab.md',
    readTime: '10 min read'
  },
  {
    id: 'ucb-vs-ts',
    title: 'UCB vs Thompson Sampling: 결정적(Deterministic) vs 확률적(Stochastic)',
    excerpt: 'UCB는 계산기, TS는 주사위? MAB의 두 거대 산맥인 UCB와 Thompson Sampling의 결정적인 차이를 직관적으로 비교합니다.',
    date: '2026-01-17',
    categories: ['Bandits & Personalization'],
    tags: ['UCB', 'Thompson Sampling', 'MAB'],
    contentUrl: 'posts/ucb_ts.md',
    readTime: '5 min read'
  },
  {
    id: 'disjoint-linucb',
    title: 'Disjoint LinUCB 모델 상세 해석',
    excerpt: 'LinUCB의 핵심 공식인 "최종 점수 = 예측(Exploitation) + 불확실성(Exploration)"을 시각화와 함께 해석합니다.',
    date: '2026-01-20',
    categories: ['Bandits & Personalization'],
    tags: ['LinUCB', 'Contextual Bandit', 'MAB'],
    contentUrl: 'posts/disjoint-LinUCB.md',
    readTime: '12 min read'
  },
  {
    id: 'ad-serving-flow',
    title: 'Ad Serving Flow: 광고가 유저에게 도달하는 전체 과정',
    excerpt: 'DSP, SSP, Ad Exchange, DMP의 역할과 RTB Auction 플로우를 도식도와 함께 정리합니다.',
    date: '2026-01-25',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'DSP', 'SSP', 'RTB'],
    contentUrl: 'posts/ad-serving-flow.md',
    readTime: '8 min read'
  },
  {
    id: 'ucb-family',
    title: 'UCB 알고리즘 패밀리: UCB1 vs LinUCB vs Hybrid LinUCB',
    excerpt: 'UCB 계열 알고리즘 3종의 수식, 작동 방식, Cold Start 대응력을 상세 비교합니다.',
    date: '2026-02-01',
    categories: ['Bandits & Personalization'],
    tags: ['UCB', 'LinUCB', 'MAB', 'Contextual Bandit'],
    contentUrl: 'posts/ucb-family.md',
    readTime: '12 min read'
  },
];

// Helper functions for data access
function getAllPosts() {
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
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

function filterPosts(searchTerm, category, tag) {
  return posts.filter(post => {
    const matchesSearch = searchTerm === '' ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = category === '' || post.categories.includes(category);
    const matchesTag = tag === '' || post.tags.includes(tag);

    return matchesSearch && matchesCategory && matchesTag;
  });
}
