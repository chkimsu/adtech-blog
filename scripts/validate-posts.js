#!/usr/bin/env node
// 글 메타데이터 검증 — 표준 분류(data/taxonomy.json) 준수 + 무결성.
// 에러가 하나라도 있으면 exit 1 (CI 게이트로 사용).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const { posts } = require(path.join(root, 'js', 'posts.js'));
const taxonomy = JSON.parse(fs.readFileSync(path.join(root, 'data', 'taxonomy.json'), 'utf-8'));

const validCats = new Set(taxonomy.categories.map(c => c.id));
const validTags = new Set(taxonomy.tags);
const validWorlds = new Set((taxonomy.worlds || []).map(w => w.id));
const REQUIRED = ['id', 'title', 'excerpt', 'date', 'categories', 'tags', 'contentUrl', 'world'];

const errors = [];
const seen = new Set();
for (const p of posts) {
  const where = `post "${p && p.id ? p.id : '(no id)'}"`;
  for (const f of REQUIRED) {
    const v = p[f];
    if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) errors.push(`${where}: 필수 필드 누락/빈값 "${f}"`);
  }
  if (seen.has(p.id)) errors.push(`${where}: 중복 id`); else seen.add(p.id);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date || '') || isNaN(Date.parse(p.date))) errors.push(`${where}: 잘못된 date "${p.date}"`);
  (Array.isArray(p.categories) ? p.categories : []).forEach(c => { if (!validCats.has(c)) errors.push(`${where}: 표준에 없는 category "${c}"`); });
  (Array.isArray(p.tags) ? p.tags : []).forEach(t => { if (!validTags.has(t)) errors.push(`${where}: 표준에 없는 tag "${t}"`); });
  if (p.contentUrl && !fs.existsSync(path.join(root, p.contentUrl))) errors.push(`${where}: contentUrl 파일 없음: ${p.contentUrl}`);
  if (p.series != null && typeof p.series !== 'string') errors.push(`${where}: series는 문자열이어야 함`);
  const wlist = Array.isArray(p.world) ? p.world : (p.world != null ? [p.world] : []);
  wlist.forEach(w => { if (!validWorlds.has(w)) errors.push(`${where}: 표준에 없는 world "${w}" (data/taxonomy.json worlds 확인)`); });
  if (wlist.length > 1 && wlist.some(w => w === 'na' || w === 'both')) errors.push(`${where}: 'na'·'both'는 단독으로만 사용(여러 세계 배열엔 넣지 않음)`);
  if (p.worldNote != null && typeof p.worldNote !== 'string') errors.push(`${where}: worldNote는 문자열이어야 함`);
  if (p.worldPractical != null && typeof p.worldPractical !== 'string') errors.push(`${where}: worldPractical은 문자열이어야 함`);
}
// mlTrack 커리큘럼이 참조하는 글 id가 실제로 존재하는지
const { mlTrack } = require(path.join(root, 'js', 'posts.js'));
const postIds = new Set(posts.map(p => p.id));
(mlTrack && mlTrack.stages ? mlTrack.stages : []).forEach(s =>
  (s.posts || []).forEach(id => { if (!postIds.has(id)) errors.push(`mlTrack "${s.id}": 존재하지 않는 글 id "${id}"`); }));
// series(트랙)가 가리키는 글 id 도 본다. 없는 id 는 트랙 화면이 조용히 빼서 글이 트랙에서 빠져도 알 수 없다
const { series } = require(path.join(root, 'js', 'posts.js'));
Object.entries(series || {}).forEach(([sid, s]) => (s.posts || []).forEach(id => {
  if (!postIds.has(id)) errors.push(`series "${sid}": 존재하지 않는 글 id "${id}"`); }));

// index.html 표지에 적힌 편수를 posts.js 와 견준다. 글을 더하면 이 수가 낡는데 따로 잡는 곳이 없었다.
//   - 태그 칸: <a href="posts-browse.html?tag=이름">…<b>N편</b></a>   → 그 태그를 가진 글 수(posts-browse 의 거름과 같은 셈)
//   - 전체 버튼: <a href="posts-browse.html" …>글 N편 전체</a>         → 전체 글 수
// 표지 마크업에서 수를 못 찾으면(칸이 사라졌거나 꼴이 바뀜) 그것도 오류다. 조용히 통과하면 검사가 죽은 채로 남는다.
{
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf-8');
  const coverBlock = (html.match(/<section class="cover-hero"[\s\S]*?<\/section>/) || [''])[0];
  const tagCount = {};
  posts.forEach(p => (p.tags || []).forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; }));
  const diffs = [];
  let seenTags = 0;
  for (const m of coverBlock.matchAll(/<a\b[^>]*href="posts-browse\.html\?tag=([^"&]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const tag = decodeURIComponent(m[1]);
    const n = m[2].match(/<b>\s*(\d+)\s*편\s*<\/b>/);
    if (!n) { diffs.push(`표지 태그 칸 "${tag}": <b>N편</b> 을 못 찾음`); continue; }
    seenTags++;
    const want = tagCount[tag] || 0;
    if (+n[1] !== want) diffs.push(`표지 태그 칸 "${tag}": 표지 ${n[1]}편, posts.js ${want}편 (${+n[1] - want > 0 ? '+' : ''}${+n[1] - want})`);
  }
  const all = coverBlock.match(/<a\b[^>]*href="posts-browse\.html"[^>]*>\s*글\s*(\d+)\s*편\s*전체/);
  if (!all) diffs.push('표지 전체 버튼: "글 N편 전체" 를 못 찾음');
  else if (+all[1] !== posts.length) diffs.push(`표지 전체 버튼: 표지 ${all[1]}편, posts.js ${posts.length}편 (${+all[1] - posts.length > 0 ? '+' : ''}${+all[1] - posts.length})`);
  if (!seenTags) diffs.push('표지에서 태그 칸을 하나도 못 찾음');
  diffs.forEach(d => errors.push('index.html ' + d));
  if (!diffs.length) console.log(`✓ index.html 표지 편수 ${seenTags + 1}곳(전체 1, 태그별 ${seenTags})이 posts.js 와 같음`);
}

// 비치명 경고: posts/ 안에 contentUrl로 참조되지 않는 고아 .md
const referenced = new Set(posts.map(p => p.contentUrl && path.basename(p.contentUrl)));
fs.readdirSync(path.join(root, 'posts')).filter(f => f.endsWith('.md')).forEach(f => {
  if (!referenced.has(f)) console.warn(`⚠ 경고: posts/${f} 는 어떤 글에도 연결돼 있지 않음`);
});

if (errors.length) { errors.forEach(e => console.error('✗ ' + e)); process.exit(1); }
console.log(`✓ ${posts.length}개 글 검증 통과 — 카테고리 ${validCats.size} · 태그 ${validTags.size} · 무대 ${validWorlds.size}`);
