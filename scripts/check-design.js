#!/usr/bin/env node
// 디자인 정합 게이트 (2026-08-14 개편분). html-wiki-style 스킬 2번의 8원칙을
// 이 저장소에 맞게 옮긴 것이다.
//   node scripts/check-design.js          → 전체 요약
//   node scripts/check-design.js <파일…>   → 지정 파일만
//
// 데이터 시각화 계열색(--series-1..6)과 코드 구문 강조(hljs)는 3색조 밖이지만
// 의도한 예외다. 아래 ALLOWED_HEX 에 적어 두고, 그 밖의 hex 만 잡는다.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const PALETTE = [
  // 라이트 17색
  '#ffffff', '#fafaf9', '#17181a', '#3f3f46', '#71717a', '#e4e4e7', '#f0f0f1',
  '#20406b', '#eef2f8', '#c7d4e6', '#9b3a21', '#fbede9', '#ebc9be',
  '#67696c', '#f4f4f5', '#d9d9de', '#9a9aa2',
  // 다크 17색
  '#1f2023', '#d4d4d8', '#a1a1aa', '#34343a', '#26262a',
  '#8ab0e0', '#1b2733', '#2e4664', '#e59275', '#301f19', '#5a3427',
  '#232327', '#3a3a40',
  // 데이터 계열 6색 × 2테마 (차트 전용 · 토큰 정의부에만 나온다)
  '#4e7bb5', '#c2653f', '#2b5f58', '#5b87be', '#b96a4c', '#6fb3a6',
  // 무채색 축약형
  '#fff', '#000',
];
// hljs 구문 강조 — 코드 가독성 때문에 남긴 예외. 세이지 주석색은 표기 규칙에 박혀 있다.
const HLJS = ['#383a42', '#a626a4', '#50a14f', '#986801', '#4e6b47', '#4078f2'];
const ALLOWED = new Set([...PALETTE, ...HLJS]);

const BAD_GLYPH = /[▶◀★☆※◆◇■□●○◉◎◐◑◒◓◈⇒]/g;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}⚠✅❌⬜⬛]/gu;

function cssOf(src, isCss) {
  // 주석은 렌더되지 않는다 — "serif 는 쓰지 않는다" 같은 설명이 걸리지 않게 먼저 걷어낸다.
  const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '');
  if (isCss) return strip(src);
  src = strip(src);
  const blocks = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]);
  const attrs = [...src.matchAll(/style="([^"]*)"/g)].map(m => m[1]);
  return blocks.concat(attrs).join('\n');
}

function check(file) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  const isCss = file.endsWith('.css');
  const css = cssOf(src, isCss);
  // 렌더되는 본문만 본다 — <style>·<script> 안의 글자는 화면에 안 나온다.
  const body = isCss ? '' : src.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>|<!--[\s\S]*?-->/g, '');

  const radius = (css.match(/border-radius\s*:\s*([^;}"']+)/g) || [])
    .filter(v => v.split(':')[1].trim() !== '0');
  const shadow = (css.match(/box-shadow\s*:\s*([^;}"']+)/g) || [])
    .map(v => v.split(':').slice(1).join(':').trim())
    .filter(v => v !== 'none' && !v.startsWith('inset') && !v.startsWith('var(--shadow'));
  const hex = [...new Set((css.match(/#[0-9A-Fa-f]{3,6}\b/g) || []).map(h => h.toLowerCase()))]
    .filter(h => !ALLOWED.has(h));
  // serif 는 sans-serif 의 꼬리와 --font-serif 토큰 이름을 빼고 센다.
  // 토큰 이름은 옛 규칙 20여 곳이 아직 참조해서 남겨 뒀고, 값은 sans 로 접혀 있다.
  const serif = (css.replace(/sans-serif/g, '').replace(/--font-serif/g, '').replace(/font-serif/g, '')
    .match(/\bserif\b|Noto Serif|Newsreader/g) || []).length;
  const glyph = [...new Set(body.match(BAD_GLYPH) || [])];
  const emoji = [...new Set(body.match(EMOJI) || [])];

  return { file, radius, shadow, hex, serif, glyph, emoji };
}

const targets = process.argv.slice(2).length
  ? process.argv.slice(2).map(f => path.relative(root, path.resolve(f)))
  : ['css/style.css', ...fs.readdirSync(root).filter(f => f.endsWith('.html')).sort()];

let fail = 0;
const rows = targets.map(check);
for (const r of rows) {
  const bad = [
    r.radius.length ? `둥근모서리 ${r.radius.length}` : '',
    r.shadow.length ? `그림자 ${r.shadow.length}` : '',
    r.hex.length ? `팔레트밖 hex ${r.hex.length} (${r.hex.slice(0, 4).join(' ')})` : '',
    r.serif ? `serif ${r.serif}` : '',
    r.glyph.length ? `장식글자 ${r.glyph.join('')}` : '',
    r.emoji.length ? `이모지 ${r.emoji.join('')}` : '',
  ].filter(Boolean);
  if (bad.length) { fail++; console.log(`✗ ${r.file.padEnd(32)} ${bad.join(' · ')}`); }
}
console.log(fail ? `\n${fail} / ${rows.length} 개 파일에 지적` : `✓ ${rows.length}개 파일 디자인 게이트 통과`);
process.exit(fail ? 1 : 0);
