#!/usr/bin/env node
// 글 내용 표준(MARKDOWN_GUIDE '글 내용 표준' 절) 자동 점검.
//   node scripts/check-content-standard.js            → 전체 요약표
//   node scripts/check-content-standard.js <slug> ...  → 지정한 글만 상세
//
// 사람이 읽어야 판단되는 것(설명이 쉬운가, 비유가 적절한가)은 검사하지 않는다.
// 여기서 잡는 건 "기계로 셀 수 있는데 사람이 자꾸 놓치는 것"뿐이다.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const { posts } = require(path.join(root, 'js', 'posts.js'));

const MIN_BYTES = 15000;      // 표준 8: 얇은 글은 15KB 이상
const MIN_SECTION_CHARS = 300; // 표준 2: 한두 줄로 끝나는 섹션 금지
const MAX_SENTENCE = 80;       // 표준 7: 한 문장 = 한 생각

// 코드블록·표·임베드 HTML을 걷어낸 '산문'만 남긴다 — 길이 계산의 분모.
function prose(md) {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\$\$[\s\S]*?\$\$/g, '')   // 블록 수식은 '문장'이 아니다 — 길이 계산에서 뺀다
    .replace(/^:::.*$/gm, '')
    .replace(/^\|.*$/gm, '')
    // chart-* 위젯(다이어그램·비교 카드) 안의 글자는 산문이 아니라 도표 라벨이다.
    // 태그만 벗기면 라벨 여러 개가 한 문장으로 이어붙어 '장문'으로 잡히고,
    // 그걸 통과시키려고 라벨마다 마침표를 붙이는 엉뚱한 수정이 유발된다.
    .replace(/<([a-zA-Z]+)[^>]*class="[^"]*\bchart-[^"]*"[^>]*>([^<]*)/g, '<$1>')
    // 진짜 HTML 태그만 지운다. 수식의 맨 '<'(예: $b < v$)를 태그 시작으로 오인하면
    // 다음 '>'까지 본문을 통째로 삼켜 섹션 길이가 잘못 나온다.
    .replace(/<\/?[a-zA-Z][^>]*>/g, '')
    .replace(/^>\s?/gm, '');
}

// '## '로 시작하는 섹션별로 산문 길이를 잰다. '더 깊이 보기'는 링크 목록이라 제외.
function shortSections(md) {
  const parts = md.split(/^## /m).slice(1);
  return parts
    .map(p => {
      const title = p.split('\n')[0].trim();
      const body = prose(p.slice(title.length)).replace(/\s+/g, ' ').trim();
      return { title, len: body.length };
    })
    .filter(s => s.len < MIN_SECTION_CHARS && !/더 깊이 보기|한눈 정리|참고문헌/.test(s.title));
}

// 문장 분리는 완벽할 수 없다. 볼드·헤딩 경계에서 오탐이 나므로
// 헤딩·리스트·인용은 잘라내고, 마침표+공백만 경계로 쓴다.
function longSentences(md) {
  const text = prose(md)
    .split('\n')
    .filter(l => !/^\s*(#|-|\d+\.|\*)/.test(l))
    .join(' ')
    // 강조 표시를 먼저 걷어낸다. '…이다.**' 처럼 마침표가 ** 안에 있으면
    // 문장 경계를 못 찾아 두세 문장이 하나로 합쳐져 오탐이 난다.
    .replace(/\*\*/g, '')
    .replace(/`[^`]*`/g, '…');
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(s => s.length > MAX_SENTENCE);
}

// 글이 가리키는 내부 주소가 실제로 존재하는지. 파일명(pCVR-modeling)과 id(pcvr-modeling)를
// 헷갈려 죽은 링크를 심는 일이 반복돼서 기계가 잡게 했다.
const POST_IDS = new Set(posts.map(p => p.id));
const PAGES = new Set(fs.readdirSync(root).filter(f => f.endsWith('.html')));
function deadLinks(md) {
  const out = [];
  for (const m of md.matchAll(/post\.html\?id=([A-Za-z0-9_-]+)/g)) {
    if (!POST_IDS.has(m[1])) out.push(`?id=${m[1]}`);
  }
  for (const m of md.matchAll(/(?:\]\(|src=")(?!https?:|post\.html|#)([a-zA-Z0-9_-]+\.html)/g)) {
    if (!PAGES.has(m[1])) out.push(m[1]);
  }
  return [...new Set(out)];
}

function check(post) {
  const abs = path.join(root, post.contentUrl);
  if (!fs.existsSync(abs)) return null;
  const md = fs.readFileSync(abs, 'utf-8');
  const badges = (md.match(/\[무대:\s*[^\]]*\]/g) || []);
  const badBadge = badges.filter(b => !/\[무대: (열린 RTB|닫힌 생태계|공통)\]/.test(b));
  // (물결표 취소선 오파싱은 preprocessMarkdown이 범위 기호를 엔티티로 바꿔 해결했다 — 여기서 안 본다)
  const tildeTrap = [];
  // 수식 안 한글 → KaTeX 경고. 통화 표기($2.50)가 짝지어지는 오탐을 막으려고
  // LaTeX 명령(\)이 실제로 들어 있는 스팬만 본다.
  const mathKorean = (md.match(/\$\$?[^$]+\$\$?/g) || [])
    .filter(m => /\\[a-zA-Z]/.test(m) && /[가-힣]/.test(m.replace(/\\text\{[^}]*\}/g, '')));

  return {
    id: post.id,
    bytes: Buffer.byteLength(md),
    h2: (md.match(/^## /gm) || []).length,
    python: (md.match(/^```python/gm) || []).length,
    tables: (md.match(/^\|---/gm) || []).length,
    deep: (md.match(/^:::deep/gm) || []).length,
    demo: (md.match(/demo-embed-wrap/g) || []).length,
    badges: badges.length,
    world: Array.isArray(post.world) ? post.world.join('+') : post.world,
    hasPractical: !!post.worldPractical,
    short: shortSections(md),
    long: longSentences(md),
    badBadge,
    tildeTrap,
    mathKorean,
    dead: deadLinks(md),
  };
}

const args = process.argv.slice(2);
const targets = args.length ? posts.filter(p => args.includes(p.id)) : posts;
const rows = targets.map(check).filter(Boolean);

if (args.length) {
  for (const r of rows) {
    console.log(`\n── ${r.id}  ${(r.bytes / 1024).toFixed(1)}KB  (world: ${r.world})`);
    console.log(`   h2 ${r.h2} · python ${r.python} · 표 ${r.tables} · deep ${r.deep} · 데모 ${r.demo} · 무대배지 ${r.badges} · worldPractical ${r.hasPractical ? 'O' : 'X'}`);
    if (r.short.length) console.log(`   ⚠ 짧은 섹션 ${r.short.length}개: ${r.short.map(s => `${s.title}(${s.len}자)`).join(', ')}`);
    if (r.long.length) console.log(`   ⚠ ${MAX_SENTENCE}자 초과 문장 ${r.long.length}개:\n${r.long.map(s => `      ${s.length}자 · ${s.slice(0, 60)}…`).join('\n')}`);
    if (r.badBadge.length) console.log(`   ✗ 잘못된 무대 마커: ${r.badBadge.join(', ')}`);
    if (r.tildeTrap.length) console.log(`   ✗ 물결표 2개 문장(취소선 오파싱): ${r.tildeTrap.length}개`);
    if (r.mathKorean.length) console.log(`   ✗ 수식 안 한글: ${r.mathKorean.length}개`);
    if (r.dead.length) console.log(`   ✗ 죽은 링크: ${r.dead.join(', ')}`);
  }
} else {
  const flag = r => [
    r.bytes < MIN_BYTES ? '분량' : '',
    r.short.length ? `짧은섹션${r.short.length}` : '',
    r.long.length > 6 ? `장문${r.long.length}` : '',
    r.python === 0 ? '코드없음' : '',
    r.tables === 0 ? '표없음' : '',
    r.world !== 'na' && !r.hasPractical ? 'practical없음' : '',
    r.badBadge.length ? '✗마커' : '',
    r.tildeTrap.length ? '✗물결표' : '',
    r.mathKorean.length ? '✗수식한글' : '',
    r.dead.length ? `✗죽은링크${r.dead.length}` : '',
  ].filter(Boolean).join(' ');

  rows.sort((a, b) => a.bytes - b.bytes);
  console.log('KB     h2 py 표 deep 데모 배지  글'.padEnd(52) + '점검 필요');
  for (const r of rows) {
    const head = `${(r.bytes / 1024).toFixed(1).padStart(5)}  ${String(r.h2).padStart(3)} ${String(r.python).padStart(2)} ${String(r.tables).padStart(2)} ${String(r.deep).padStart(4)} ${String(r.demo).padStart(4)} ${String(r.badges).padStart(4)}  ${r.id}`;
    console.log(head.padEnd(52) + flag(r));
  }
  const clean = rows.filter(r => !flag(r)).length;
  console.log(`\n표준 충족 ${clean} / ${rows.length}편`);
}
