#!/usr/bin/env node
// mermaid 다이어그램의 하드코딩 색을 사이트 팔레트로 바꾼다.
//   node scripts/recolor-mermaid.js --dry     변경 내역만 보기
//   node scripts/recolor-mermaid.js           실제 적용
//
// 왜 필요했나: 글 안 mermaid에 Chart.js 기본색 + 네온(#ff6384·#36a2eb·#00e5ff)이
// 하드코딩돼 있었다. P1에서 사이트를 크림·잉크 에디토리얼로 바꾼 뒤에도 이 색은
// 그대로여서, 차분한 지면 위에 남색 상자와 네온 테두리가 얹히는 상태였다.
// mermaid 테마(neutral/dark)를 써도 하드코딩 fill이 테마를 덮어써서 안 먹는다.
//
// 두 갈래로 처리한다.
//  (A) 노드 채움 → 에디토리얼 색으로 치환. 글 본문이 "빨간색(pCTR)" 처럼
//      색을 지칭하는 경우가 있어, 색상 계열은 유지하고 채도만 낮춘다.
//  (B) 어두운 서브그래프 배경 → 채움을 아예 없애고 윤곽선만 남긴다.
//      선으로만 구분하는 게 에디토리얼 미감에 맞고, 라이트·다크 양쪽에서
//      테마 기본 배경을 따라가므로 저절로 맞는다.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// (A) 밝은 노드 채움 → 에디토리얼 톤. 값은 css/style.css 팔레트와 같은 계열.
const FILL = {
  '#ff6384': '#b0442c',  // 형광 핑크레드 → 벽돌(--accent-primary). pCTR/pCVR 심장
  '#36a2eb': '#4a6b8a',  // 형광 블루 → 슬레이트 블루. 경매·거래소
  '#4bc0c0': '#5b7d6a',  // 형광 틸 → 세이지. 유저·매체
  '#ff9f40': '#8f6231',  // 형광 오렌지 → 앰버브라운. 광고주
  '#9966ff': '#8a6a3a',  // 형광 퍼플 → 브론즈(--accent-secondary)
  '#b026ff': '#7a5a30',  // 네온 바이올렛 → 짙은 브론즈
  '#00e5ff': '#54736f',  // 네온 시안 → 차분한 틸
  '#2979ff': '#3f5c78',  // 밝은 블루 → 짙은 슬레이트
  '#1565c0': '#3f5c78',
  '#26a69a': '#4f6f5f',  // 틸 → 짙은 세이지
  '#ffce56': '#c9a961',  // 형광 옐로 → 밀색(글자는 잉크)
  '#9a7d38': '#8a6a3a',
  '#4fc3f7': '#b8cdc4',  // 하늘 → 연한 세이지(글자 잉크)
  '#80deea': '#b8cdc4',
  '#ffab91': '#dcc0ae',  // 피치 → 연한 점토(글자 잉크)
  '#5f7a63': '#5b7d6a',
};

// 채움을 바꾼 뒤 글자색을 무엇으로 둘지. 밝은 채움엔 잉크, 짙은 채움엔 흰색.
const LIGHT_FILLS = new Set(['#c9a961', '#b8cdc4', '#dcc0ae']);

// (B) 어두운 배경색(서브그래프용) — 만나면 fill을 제거한다.
const DARK_FILLS = new Set([
  '#0d1a2d', '#1a1a3e', '#172554', '#0d4f4f', '#2e1065', '#064e3b',
  '#1a1230', '#5c1a2a', '#4d3800', '#1a3a5c', '#500724', '#450a0a',
  '#0c4a6e', '#0a1f1a', '#1e293b', '#1c1917', '#1a0a2e', '#0a1a2e', '#083344',
]);

// 테두리색도 같은 매핑을 쓴다. 매핑에 없는 것(#2563eb 등)은 계열별로 처리.
const STROKE_EXTRA = {
  '#2563eb': '#4a6b8a', '#7c3aed': '#8a6a3a', '#059669': '#5b7d6a',
  '#2196f3': '#4a6b8a', '#ff8f00': '#8f6231', '#dc2626': '#b0442c',
  '#db2777': '#b0442c', '#0ea5e9': '#4a6b8a', '#00bcd4': '#54736f',
  '#ffc107': '#c9a961', '#ff8a65': '#8f6231', '#0d47a1': '#3f5c78',
  '#2962ff': '#3f5c78', '#9c27b0': '#7a5a30', '#009688': '#4f6f5f',
  '#29b6f6': '#b8cdc4', '#4dd0e1': '#b8cdc4',
  '#d97706': '#8f6231', '#475569': '#4a6b8a', '#0891b2': '#54736f',
  '#7a8ba3': '#4a6b8a',
};

const dry = process.argv.includes('--dry');
let filesTouched = 0, linesChanged = 0, fillsDropped = 0;

for (const file of fs.readdirSync(path.join(root, 'posts')).filter(f => f.endsWith('.md'))) {
  const abs = path.join(root, 'posts', file);
  const orig = fs.readFileSync(abs, 'utf-8');
  const changes = [];

  // mermaid의 색 지정 줄만 건드린다. style(노드) 외에 linkStyle(연결선)·classDef도 있다 —
  // 처음엔 style만 잡아서 linkStyle에 네온이 남았다.
  const next = orig.replace(/^(\s*(?:style|linkStyle|classDef)\s+\S+\s+)(.+)$/gm, (whole, head, decls) => {
    const parts = decls.split(',').map(s => s.trim()).filter(Boolean);
    let dropped = false;
    const out = [];
    for (const part of parts) {
      const m = /^(fill|stroke|color)\s*:\s*(#[0-9a-fA-F]{3,6})$/.exec(part);
      if (!m) { out.push(part); continue; }          // stroke-width 등은 그대로
      const [, prop, hex] = m;
      const key = hex.toLowerCase();
      if (prop === 'fill') {
        if (DARK_FILLS.has(key)) { dropped = true; continue; }   // (B) 채움 제거
        if (FILL[key]) { out.push(`fill:${FILL[key]}`); continue; }
        out.push(part); continue;
      }
      if (prop === 'stroke') {
        const to = FILL[key] || STROKE_EXTRA[key];
        out.push(to ? `stroke:${to}` : part);
        continue;
      }
      out.push(part);   // color 는 아래에서 채움에 맞춰 다시 정한다
    }

    // 채움을 없앤 줄은 글자색도 테마에 맡긴다(흰 글자가 크림 배경에서 안 보임).
    let result = dropped ? out.filter(p => !/^color\s*:/.test(p)) : out;

    // 채움을 바꾼 줄은 대비를 맞춘다.
    const fillPart = result.find(p => /^fill:/.test(p));
    if (fillPart) {
      const hex = fillPart.slice(5).toLowerCase();
      const want = LIGHT_FILLS.has(hex) ? '#201d1a' : '#fff';
      const ci = result.findIndex(p => /^color\s*:/.test(p));
      if (ci >= 0) result[ci] = `color:${want}`;
      else result.push(`color:${want}`);
    }

    const rebuilt = head + result.join(',');
    if (rebuilt !== whole) {
      changes.push({ from: whole.trim(), to: rebuilt.trim() });
      if (dropped) fillsDropped++;
    }
    return rebuilt;
  });

  if (next !== orig) {
    filesTouched++;
    linesChanged += changes.length;
    if (dry) {
      console.log(`\n── ${file}  (${changes.length}줄)`);
      changes.slice(0, 4).forEach(c => console.log(`   - ${c.from}\n   + ${c.to}`));
      if (changes.length > 4) console.log(`   … ${changes.length - 4}줄 더`);
    } else {
      fs.writeFileSync(abs, next);
    }
  }
}

console.log(`\n${dry ? '[미리보기] ' : ''}글 ${filesTouched}편 · 스타일 ${linesChanged}줄 변경 · 어두운 배경 채움 제거 ${fillsDropped}건`);
