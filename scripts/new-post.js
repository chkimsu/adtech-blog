#!/usr/bin/env node
// 새 글 스캐폴드 — posts/<slug>.md stub + js/posts.js 엔트리 삽입(분류 검증).
// git은 절대 실행하지 않는다(커밋은 사람이 chkimsu 계정으로).
//
// 인터랙티브:  node scripts/new-post.js
// 인자 모드:   node scripts/new-post.js <slug> <title> <category(이름|번호)> <tags-csv>
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const root = path.join(__dirname, '..');
const postsPath = path.join(root, 'js', 'posts.js');
const { posts } = require(postsPath);
const taxonomy = JSON.parse(fs.readFileSync(path.join(root, 'data', 'taxonomy.json'), 'utf-8'));

const args = process.argv.slice(2);
const interactive = !!process.stdin.isTTY;
let rl = null;
function ask(q) {
  if (!rl) rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => rl.question(q, a => res(a.trim())));
}
function fail(msg) { console.error('✗ ' + msg); if (rl) rl.close(); process.exit(1); }
// idx번째 인자가 있으면 그걸, 없으면 (TTY면) 프롬프트, (아니면) 실패
async function field(idx, promptFn) {
  if (args[idx] != null && args[idx] !== '') return String(args[idx]).trim();
  if (!interactive) fail('인자 부족 — 사용법: node scripts/new-post.js <slug> <title> <category(이름|번호)> <tags-csv>');
  return (await promptFn()).trim();
}

(async () => {
  // 1) slug
  const slug = await field(0, () => ask('slug (영문 소문자·숫자·하이픈): '));
  if (!/^[a-z0-9-]+$/.test(slug)) fail(`잘못된 slug: "${slug}" (소문자·숫자·하이픈만)`);
  if (fs.existsSync(path.join(root, 'posts', slug + '.md'))) fail(`이미 존재: posts/${slug}.md`);
  if (posts.some(p => p.id === slug)) fail(`id 중복: ${slug}`);

  // 2) title
  const title = await field(1, () => ask('제목: '));
  if (!title) fail('제목은 필수');

  // 3) category — 이름 또는 1-based 번호
  const catRaw = await field(2, async () => {
    console.log('\n카테고리 선택:');
    taxonomy.categories.forEach((c, i) => console.log(`  ${i + 1}. ${c.id}`));
    return ask('번호: ');
  });
  let category;
  if (/^\d+$/.test(catRaw)) {
    const i = parseInt(catRaw, 10) - 1;
    if (!(i >= 0 && i < taxonomy.categories.length)) fail(`잘못된 카테고리 번호: ${catRaw}`);
    category = taxonomy.categories[i].id;
  } else {
    if (!taxonomy.categories.some(c => c.id === catRaw)) fail(`표준에 없는 카테고리: "${catRaw}"`);
    category = catRaw;
  }

  // 4) tags — 표준 allowlist 대조
  const validTags = new Set(taxonomy.tags);
  const tagsRaw = await field(3, () => ask('태그 (콤마 구분, data/taxonomy.json 표준만): '));
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  if (!tags.length) fail('태그를 최소 1개 입력하세요');
  for (const t of tags) {
    if (!validTags.has(t)) {
      const near = taxonomy.tags.filter(x => x.toLowerCase().includes(t.toLowerCase())).slice(0, 3);
      fail(`표준에 없는 태그 "${t}"` + (near.length ? ` — 혹시: ${near.join(', ')}?` : ' (data/taxonomy.json 확인)'));
    }
  }

  // 5) 오늘 날짜 (sitemap과 동일 방식)
  const date = new Date().toISOString().split('T')[0];

  // 6) .md stub (프론트매터 없는 콘텐츠 전용 — 기존 컨벤션)
  const stub = `# ${title}\n\n> 한 줄 요약(excerpt)을 적고 js/posts.js의 excerpt에도 복사하세요.\n> 수식 안에는 한글을 넣지 마세요(MARKDOWN_GUIDE.md). 코드 펜스는 \`\`\`언어 로 표기.\n\n## 개요\n\n(본문 시작)\n`;
  fs.writeFileSync(path.join(root, 'posts', slug + '.md'), stub);

  // 7) posts.js 첫 요소로 엔트리 삽입 (excerpt 빈값 → 검증기가 작성 리마인드, readTime은 compute가 교정)
  const entry =
`  {
    id: '${slug}',
    title: '${title.replace(/'/g, "\\'")}',
    excerpt: '',
    date: '${date}',
    categories: ['${category}'],
    tags: [${tags.map(t => `'${t}'`).join(', ')}],
    contentUrl: 'posts/${slug}.md',
    readTime: '1 min read'
  },
`;
  let file = fs.readFileSync(postsPath, 'utf-8');
  const anchor = 'const posts = [\n';
  const at = file.indexOf(anchor);
  if (at === -1) fail("posts.js에서 'const posts = [' 앵커를 못 찾음");
  file = file.slice(0, at + anchor.length) + entry + file.slice(at + anchor.length);
  fs.writeFileSync(postsPath, file);

  console.log(`\n✓ 생성됨:\n  - posts/${slug}.md\n  - js/posts.js 엔트리 (날짜 ${date}, 카테고리 ${category})\n`);
  console.log('다음 단계:');
  console.log(`  1) posts/${slug}.md 본문 작성 + js/posts.js의 excerpt 채우기`);
  console.log('  2) node scripts/compute-read-time.js');
  console.log('  3) node scripts/validate-posts.js');
  console.log('  4) chkimsu 계정으로 커밋 (회사 이메일 금지)');
  if (rl) rl.close();
})();
