#!/usr/bin/env node
// 각 글의 .md 본문 글자 수로 읽기시간을 계산해 js/posts.js의 readTime을 갱신한다.
// CJK(한글·한자·가나)는 글자 단위, 영문은 단어 단위로 센다. 코드 블록은 제외.
// 멱등: 값이 같으면 그대로 둔다. id 블록 내 readTime을 정확히 1개 못 찾으면 중단.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const { posts } = require(path.join(root, 'js', 'posts.js'));
const UNITS_PER_MIN = 350;   // 첫 실행 후 눈으로 보고 조정 가능한 단일 상수
const CJK = /[ㄱ-힝一-鿿぀-ヿ]/g;

let file = fs.readFileSync(path.join(root, 'js', 'posts.js'), 'utf-8');
const changes = [];
for (const p of posts) {
  const md = fs.readFileSync(path.join(root, p.contentUrl), 'utf-8')
    .replace(/```[\s\S]*?```/g, ' ')   // 펜스 코드 제외
    .replace(/`[^`]*`/g, ' ');         // 인라인 코드 제외
  const cjk = (md.match(CJK) || []).length;
  const words = (md.replace(CJK, ' ').match(/\b[A-Za-z0-9]+\b/g) || []).length;
  const minutes = Math.max(1, Math.round((cjk + words) / UNITS_PER_MIN));
  const next = `${minutes} min read`;
  if (next !== p.readTime) changes.push(`${p.id}: '${p.readTime}' → '${next}'`);

  const idIdx = file.indexOf(`id: '${p.id}'`);
  if (idIdx === -1) { console.error(`✗ ${p.id}: id 위치를 못 찾음 — 중단`); process.exit(1); }
  const rtRe = /readTime:\s*'([^']*)'/g; rtRe.lastIndex = idIdx;
  const m = rtRe.exec(file);
  if (!m) { console.error(`✗ ${p.id}: readTime 위치를 못 찾음 — 중단`); process.exit(1); }
  file = file.slice(0, m.index) + `readTime: '${next}'` + file.slice(m.index + m[0].length);
}
fs.writeFileSync(path.join(root, 'js', 'posts.js'), file);
console.log(changes.length ? changes.join('\n') : '변경 없음');
console.log(`✓ ${posts.length}개 readTime 갱신 (기준 ${UNITS_PER_MIN} units/min)`);
