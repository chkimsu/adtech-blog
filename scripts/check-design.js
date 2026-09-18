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
  // 라이트 17색 — 신문 위의 청사진 (2026-09-18)
  '#ffffff', '#f5f7fa', '#14171c', '#3d434d', '#697180', '#d9dee7', '#eceff4',
  '#1f4fa3', '#eaf0fa', '#b9cbea', '#8b1e1e', '#f9ecec', '#e6c3c3',
  '#5c6470', '#f0f2f5', '#d3d8e0', '#98a0ac',
  // 다크 17색
  '#0e1a2f', '#142240', '#eef3fb', '#c9d5ea', '#97a8c6', '#27395c', '#1c2c48',
  '#8fb4f0', '#1a2c4c', '#2f4a78', '#f0a18f', '#3a2424', '#6b3a34',
  '#a9b4c8', '#1b2a44', '#34486b', '#7a8dae',
  // 데이터 계열 6색 × 2테마 (차트 전용 · 토큰 정의부에만 나온다)
  '#4a72b5', '#a54a4a', '#2f6b63', '#5f86c7', '#c97c6c', '#6fb3a6',
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
  // 세리프는 --font-serif 토큰 하나로만 쓴다(제목 = Noto Serif KR). 토큰 정의 한 줄과
  // @import 주소는 빼고, 규칙 안에 서체 이름을 직접 적은 곳만 잡는다.
  const serif = (css.replace(/--font-serif\s*:[^;]+;/g, '').replace(/@import[^;]+;/g, '')
    .replace(/sans-serif/g, '').replace(/--font-serif/g, '').replace(/font-serif/g, '')
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
