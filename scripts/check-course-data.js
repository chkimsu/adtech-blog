#!/usr/bin/env node
// 코스 두 장이 쓰는 표준 데이터가 출처 글과 어긋나면 걸린다.
//
// 값마다 needle(그 글에 있어야 하는 문자열)이 달려 있다. 검사는 둘을 본다.
//   1) 그 글에 needle 이 실제로 있나
//   2) needle 안에 값이 들어 있나 — 값과 근거가 갈리는 것을 막는다
//
// 이 검사를 두는 이유 — js/demo-edu-content.js 의 log-hops 해설이
// 2026-08-16 글 재작성을 못 따라가 「100GB 면 61.7시간」으로 남아 있었다.
// 글은 237시간이다. 같은 일을 두 번 겪지 않으려고 대조를 기계에 맡긴다.
//
//   node scripts/check-course-data.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const DATA = require('../js/course-data.js');

const cache = new Map();
function post(name) {
  if (!cache.has(name)) {
    cache.set(name, fs.readFileSync(path.join(root, 'posts', name), 'utf8'));
  }
  return cache.get(name);
}

const fails = [];
const keys = Object.keys(DATA.FACTS);

for (const key of keys) {
  const f = DATA.FACTS[key];
  if (!f.needle) {
    fails.push(`${key} — needle 이 없습니다. 숫자 값에는 근거 문장이 있어야 합니다`);
    continue;
  }
  const src = post(f.src);
  if (!src.includes(f.needle)) {
    fails.push(`${key} — posts/${f.src} 에 「${f.needle}」 가 없습니다`);
    continue;
  }
  if (typeof f.value === 'number') {
    const plain = String(f.value);
    const comma = f.value.toLocaleString('en-US');
    if (!f.needle.includes(plain) && !f.needle.includes(comma)) {
      fails.push(`${key} — 근거 문장에 값 ${f.value} 가 없습니다. 값과 근거가 갈렸습니다`);
    }
  }
}

for (const line of fails) console.log(`✗ ${line}`);
console.log(fails.length
  ? `\n${fails.length} 건 어긋남 / ${keys.length} 개 값`
  : `✓ ${keys.length}개 값 전부 출처 글과 일치`);
process.exit(fails.length ? 1 : 0);
