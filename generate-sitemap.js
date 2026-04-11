#!/usr/bin/env node

/**
 * sitemap.xml 자동 생성 스크립트
 *
 * 사용법: node generate-sitemap.js
 *
 * posts.js의 포스트 목록 + demo/메인 페이지를 기반으로
 * sitemap.xml을 자동 생성합니다.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://chkimsu.github.io/adtech-blog';

// posts.js에서 posts 배열 추출
const postsFile = fs.readFileSync(path.join(__dirname, 'js', 'posts.js'), 'utf-8');
const match = postsFile.match(/const posts = \[([\s\S]*?)\];/);
if (!match) {
  console.error('posts.js에서 posts 배열을 찾을 수 없습니다.');
  process.exit(1);
}

// posts 배열 파싱
const posts = eval('[' + match[1] + ']');

// demo 페이지 자동 탐색
const demoFiles = fs.readdirSync(__dirname)
  .filter(f => f.startsWith('demo-') && f.endsWith('.html'))
  .sort();

const today = new Date().toISOString().split('T')[0];

// URL 항목 생성 함수
function urlEntry(loc, lastmod, priority, changefreq = 'monthly') {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// sitemap 조립
const urls = [];

// 메인 페이지
urls.push(urlEntry(`${BASE_URL}/`, today, '1.0', 'weekly'));
urls.push(urlEntry(`${BASE_URL}/about.html`, today, '0.6'));
urls.push(urlEntry(`${BASE_URL}/demos.html`, today, '0.7'));

// 블로그 포스트
posts.forEach(post => {
  urls.push(urlEntry(`${BASE_URL}/post.html?id=${post.id}`, post.date, '0.8'));
});

// 데모 페이지
demoFiles.forEach(file => {
  urls.push(urlEntry(`${BASE_URL}/${file}`, today, '0.7'));
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
console.log(`sitemap.xml 생성 완료 — ${posts.length}개 포스트, ${demoFiles.length}개 데모, 3개 메인 페이지`);
