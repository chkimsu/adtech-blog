#!/usr/bin/env node
// 글 밖의 페이지 문장 길이 검사. 글과 같은 기준(한 문장 80자, 「」 안에서 나누지 않음)으로 잰다.
//
//   1) demos.html 의 문단(<p>) — 데모 카드 설명과 주제 설명
//   2) demo-*.html 의 description 메타
//
// 둘 다 글 검사기(check-content-standard.js)가 보지 않는 자리라서 80자 넘는 문장이 쌓였다.
// (데크 메타 27개와 카드 설명 24개를 2026-11-05 에 손으로 나눴다.) 다시 쌓이지 않게 막는다.
//
//   node scripts/check-page-sentences.js
const fs = require('fs');
const path = require('path');
const { overLong, MAX_SENTENCE } = require('./check-content-standard.js');

const root = path.join(__dirname, '..');
const problems = [];

function visible(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}
function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

// 1) demos.html 문단
const demosPath = path.join(root, 'demos.html');
const demos = fs.readFileSync(demosPath, 'utf-8');
let paragraphs = 0;
for (const m of demos.matchAll(/<p(\s[^>]*)?>([\s\S]*?)<\/p>/g)) {
  paragraphs++;
  for (const s of overLong(visible(m[2]))) {
    problems.push(`demos.html:${lineOf(demos, m.index)} ${s.length}자 · ${s.slice(0, 60)}…`);
  }
}

// 2) 데모 페이지 description 메타
let metas = 0;
for (const f of fs.readdirSync(root).filter(f => /^demo-.*\.html$/.test(f)).sort()) {
  const html = fs.readFileSync(path.join(root, f), 'utf-8');
  const m = html.match(/<meta\s+name="description"\s+content="([^"]*)"/);
  if (!m) continue;
  metas++;
  for (const s of overLong(m[1])) {
    problems.push(`${f}:${lineOf(html, m.index)} 메타 ${s.length}자 · ${s.slice(0, 60)}…`);
  }
}

if (problems.length) {
  console.log(`✗ 페이지 문장 ${MAX_SENTENCE}자 초과 ${problems.length}개`);
  for (const p of problems) console.log(`   ${p}`);
  process.exit(1);
}
console.log(`✓ 페이지 문장 검사 통과 — demos.html 문단 ${paragraphs}개, 데모 메타 ${metas}개, ${MAX_SENTENCE}자 초과 0`);
