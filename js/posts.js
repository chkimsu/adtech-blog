// Blog Posts Data Structure
// All blog posts are stored here as JavaScript objects
// Content is loaded dynamically from Markdown files in the posts/ directory

const posts = [
  {
    id: 'my-markdown-post',
    title: 'pCVR 모델링 학습 시 주요 고려사항 및 중복 전환(Deduplication) 이슈 정리',
    excerpt: '이 글은 Markdown으로 작성되었습니다',
    date: '2026-01-10',
    categories: ['Tutorial'],
    tags: ['markdown', 'tutorial'],
    contentUrl: 'posts/pCVR-modeling.md'
  },
  {
    id: 'TS-linTS',
    title: 'Standard TS vs Linear TS',
    excerpt: 'Standard TS vs Linear TS',
    date: '2026-01-03',
    categories: ['Basics', 'Machine Learning', 'Recommender System'],
    tags: ['auction', 'Linear TS', 'Thompson Sampling', 'Contextual Thompson Sampling'],
    contentUrl: 'posts/TS-linTS.md'
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
