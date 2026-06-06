#!/usr/bin/env node
// Atom 1.0 feed.xml 생성 — posts.js(getAllPosts)에서 최신 20개.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const { getAllPosts } = require(path.join(root, 'js', 'posts.js'));
const BASE = 'https://chkimsu.github.io/adtech-blog';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const list = getAllPosts().slice(0, 20);
const updated = list.length ? `${list[0].date}T00:00:00Z` : '1970-01-01T00:00:00Z';
const entries = list.map(p => `  <entry>
    <title>${esc(p.title)}</title>
    <link href="${BASE}/post.html?id=${p.id}"/>
    <id>${BASE}/post.html?id=${p.id}</id>
    <updated>${p.date}T00:00:00Z</updated>
    <summary>${esc(p.excerpt)}</summary>
${(p.categories || []).map(c => `    <category term="${esc(c)}"/>`).join('\n')}
  </entry>`).join('\n');

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Ad Tech Blog</title>
  <subtitle>한국어로 읽는 애드테크 기술 블로그</subtitle>
  <link href="${BASE}/"/>
  <link rel="self" href="${BASE}/feed.xml"/>
  <id>${BASE}/</id>
  <updated>${updated}</updated>
  <author><name>chkimsu</name></author>
${entries}
</feed>
`;

fs.writeFileSync(path.join(root, 'feed.xml'), feed);
console.log(`✓ feed.xml 생성 — ${list.length}개 entry, updated ${updated}`);
