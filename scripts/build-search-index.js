#!/usr/bin/env node
// 본문 전체검색 색인 생성 — posts/*.md 를 평문으로 변환해 search-index.json 으로.
// Cmd+K 검색 모달이 제목·발췌·태그에 더해 본문까지 찾도록 한다.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const { posts } = require(path.join(root, 'js', 'posts.js'));

const strip = md => md
  .replace(/```[\s\S]*?```/g, ' ')           // 코드 펜스
  .replace(/`[^`]*`/g, ' ')                  // 인라인 코드
  .replace(/\$\$[\s\S]*?\$\$/g, ' ')         // 블록 수식
  .replace(/\$[^$\n]+?\$/g, ' ')             // 인라인 수식
  .replace(/<[^>]+>/g, ' ')                  // HTML 태그
  .replace(/[#>*_\-|=\[\]()!]/g, ' ')        // 마크다운 기호
  .replace(/\s+/g, ' ').trim().toLowerCase();

const index = {};
for (const p of posts) {
  if (!p.contentUrl) continue;
  const abs = path.join(root, p.contentUrl);
  if (!fs.existsSync(abs)) { console.warn(`⚠ ${p.id}: ${p.contentUrl} 없음 — 건너뜀`); continue; }
  index[p.id] = strip(fs.readFileSync(abs, 'utf-8')).slice(0, 6000); // 글당 상한(색인 경량화)
}

fs.writeFileSync(path.join(root, 'search-index.json'), JSON.stringify(index));
const bytes = fs.statSync(path.join(root, 'search-index.json')).size;
console.log(`✓ search-index.json — ${Object.keys(index).length}개 글 본문 색인 (${(bytes / 1024).toFixed(0)} KB)`);
