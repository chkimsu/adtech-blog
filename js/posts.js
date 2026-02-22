// Blog Posts Data Structure
// All blog posts are stored here as JavaScript objects
// Content is loaded dynamically from Markdown files in the posts/ directory

// Category taxonomy (ad-tech focused, broad groupings):
// - Bandits & Personalization  → MAB, exploration/exploitation, contextual bandits
// - Measurement & Modeling     → pCVR, attribution, conversion modeling
// - Bidding & Auction          → RTB, auction theory, bid optimization (future)
// - Privacy & Compliance       → GDPR, CCPA, cookie-less (future)
// - ML Infrastructure          → feature pipelines, serving, A/B platforms (future)

const posts = [
  {
    id: 'my-markdown-post',
    title: 'pCVR 모델링 학습 시 주요 고려사항 및 중복 전환(Deduplication) 이슈 정리',
    excerpt: 'pCVR 모델 학습에서 발생하는 중복 전환(Deduplication) 이슈와 주요 고려사항을 정리합니다.',
    date: '2026-01-10',
    categories: ['Measurement & Modeling'],
    tags: ['pCVR', 'Conversion Modeling'],
    contentUrl: 'posts/pCVR-modeling.md',
    readTime: '10 min read'
  },
  {
    id: 'TS-linTS',
    title: 'Standard TS vs Linear TS',
    excerpt: '개별 광고 ID를 학습하는 Standard TS와 Feature 가중치를 학습하는 Linear TS의 핵심 차이를 비교합니다.',
    date: '2026-01-03',
    categories: ['Bandits & Personalization'],
    tags: ['Thompson Sampling', 'Linear TS', 'Contextual Bandit'],
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
  }
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
