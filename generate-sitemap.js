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

// posts.js를 Node 모듈로 직접 require (정규식/eval 제거)
const { posts } = require('./js/posts.js');

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
urls.push(urlEntry(`${BASE_URL}/home.html`, today, '0.9', 'weekly'));
urls.push(urlEntry(`${BASE_URL}/about.html`, today, '0.6'));
urls.push(urlEntry(`${BASE_URL}/demos.html`, today, '0.7'));
urls.push(urlEntry(`${BASE_URL}/ecosystem.html`, today, '0.9', 'weekly'));
urls.push(urlEntry(`${BASE_URL}/posts-browse.html`, today, '0.7'));

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
console.log(`sitemap.xml 생성 완료 — ${posts.length}개 포스트, ${demoFiles.length}개 데모, 5개 메인 페이지`);
