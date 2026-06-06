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
const REQUIRED = ['id', 'title', 'excerpt', 'date', 'categories', 'tags', 'contentUrl', 'readTime'];

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
}
// 비치명 경고: posts/ 안에 contentUrl로 참조되지 않는 고아 .md
const referenced = new Set(posts.map(p => p.contentUrl && path.basename(p.contentUrl)));
fs.readdirSync(path.join(root, 'posts')).filter(f => f.endsWith('.md')).forEach(f => {
  if (!referenced.has(f)) console.warn(`⚠ 경고: posts/${f} 는 어떤 글에도 연결돼 있지 않음`);
});

if (errors.length) { errors.forEach(e => console.error('✗ ' + e)); process.exit(1); }
console.log(`✓ ${posts.length}개 글 검증 통과 — 카테고리 ${validCats.size} · 태그 ${validTags.size}`);
