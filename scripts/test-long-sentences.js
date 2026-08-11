#!/usr/bin/env node
// check-content-standard.js 의 장문 검사 시험.
//
// 이 검사는 두 번 샜다. 두 번 다 실제로 글에 실렸다가 사람이 손으로 세어 잡았다.
//   1) 인라인 코드 스팬을 '…' 한 글자로 접어서, 91자 문장이 46자로 세어졌다
//   2) 줄 필터의 `\*` 가 `**굵게**` 로 시작하는 산문 줄을 불릿으로 오인해 통째로 뺐다
// 그래서 회귀 시험을 박아 둔다. 필터·치환 순서를 건드리면 여기서 걸린다.
//
//   node scripts/test-long-sentences.js
const { longSentences, MAX_SENTENCE } = require('./check-content-standard.js');

// 실제 글자 수를 세는 기준값. 코드 스팬은 백틱을 뺀 안쪽, 링크는 표시 텍스트만,
// 굵게 표시는 별표를 뺀 안쪽을 센다 — 독자가 화면에서 읽는 글자다.
function readerLength(s) {
  return s
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim().length;
}

const CASES = [
  {
    name: '코드 스팬이 든 91자 문장 — 접으면 46자로 세어져 통과해 버린다',
    md: '설정에 `access_log /var/log/collect.log collect buffer=32k;` 를 주면 nginx 는 32KB 를 모았다가 한 번에 쓴다.',
    flagged: true,
  },
  {
    name: '굵게로 시작하는 긴 산문 줄 — 불릿으로 오인해 빼면 통과해 버린다',
    md: '**producer 는 별도 서버가 아니라 bidder 프로세스 안의 라이브러리이고 보내는 코드가 12ms 예산 위에서 도는데 그 예산은 매체가 정한다.**',
    flagged: true,
  },
  {
    // 코드 안의 콜론에서 갈리면 앞 조각도 뒤 조각도 80자를 안 넘어 둘 다 숨는다.
    // 그래서 코드 스팬을 문장 가운데에 두고, 갈렸을 때 두 조각이 다 짧게 되도록 짰다.
    name: '코드 스팬 안의 콜론이 문장을 가르면 안 된다 — 가르면 긴 문장이 조각나 숨는다',
    md: '정산팀이 한 건도 잃으면 안 되니 보내는 쪽 설정에 `acks: all` 을 적어 두고 복제본까지 받았을 때만 성공으로 치게 두었으며 그 대가로 지연을 받았다.',
    flagged: true,
    oneSentence: true,
  },
  {
    name: '코드 스팬 안의 마침표도 문장 경계가 아니다 — 같은 이유로 가운데에 둔다',
    md: '보존 기간을 며칠로 잡을지는 브로커 설정의 `retention.ms: 604800000` 을 열어 보면 알 수 있고 그 값이 이레를 뜻하며 배포판마다 다르다.',
    flagged: true,
    oneSentence: true,
  },
  {
    name: '코드 스팬이 둘이면 둘 다 세야 한다',
    md: '`log.retention.ms` 와 `log.retention.bytes` 를 같이 적어 두면 나이와 크기 둘 중에서 먼저 닿는 쪽이 이겨서 그 구간을 지운다.',
    flagged: true,
  },
  { name: '짧은 문장은 안 걸린다', md: '`acks=all` 로 둔다.', flagged: false },
  { name: '짧은 굵게 문장도 안 걸린다', md: '**partition 수가 처리량 상한이다.**', flagged: false },
  {
    name: '회귀 — 불릿 줄은 여전히 빼야 한다',
    md: '- 이 항목은 불릿이라 산문이 아니고 길이 계산에서 빠져야 하는데 일부러 여든 자를 넘겨 두었다.',
    flagged: false,
  },
  {
    name: '회귀 — 번호 목록도 빼야 한다',
    md: '1. 이 항목도 목록이라 산문이 아니고 길이 계산에서 빠져야 하는데 일부러 여든 자를 넘겨 두었다.',
    flagged: false,
  },
  {
    name: '회귀 — 링크 URL 은 길이에서 빼야 한다',
    md: '자세한 것은 [조인 창의 확대판](post.html?id=online-learning-delayed-feedback) 에서 다룬다.',
    flagged: false,
  },
  {
    name: '회귀 — 표 줄은 산문이 아니다',
    md: '| 아주 긴 표 셀인데 여든 자를 넘기도록 일부러 늘여 두었다 | 두 번째 칸도 마찬가지로 길게 늘인다 |',
    flagged: false,
  },
  {
    name: '회귀 — 코드 블록 안은 산문이 아니다',
    md: '```python\n# 이 주석은 여든 자를 넘기도록 일부러 늘여 두었지만 코드 블록 안이라 산문이 아니다.\n```',
    flagged: false,
  },
];

let pass = 0;
const fails = [];
for (const c of CASES) {
  const got = longSentences(c.md);
  // oneSentence: 코드 안에서 갈리지 않았는지. 갈렸으면 조각이 짧아 0건이 되거나 2건이 된다.
  const ok = (got.length > 0) === c.flagged && (!c.oneSentence || got.length === 1);
  if (ok) pass++;
  else fails.push({ c, got });
}

// 걸린 문장의 길이가 독자가 읽는 글자 수와 맞는지도 본다.
// 46자로 세면서 '걸렸다'고만 하면 두 번째 사고를 못 막는다.
const LEN = CASES.filter(c => c.flagged).map(c => {
  const got = longSentences(c.md)[0] || '';
  return { name: c.name, want: readerLength(c.md), got: got.length };
});

console.log(`장문 검사 시험 — ${pass}/${CASES.length} 통과\n`);
for (const f of fails) {
  console.log(`✗ ${f.c.name}`);
  console.log(`   기대: ${f.c.flagged ? '걸림' : '안 걸림'} · 실제: ${f.got.length ? `걸림(${f.got.length}건)` : '안 걸림'}`);
  console.log(`   읽는 글자 수 ${readerLength(f.c.md)}자 (기준 ${MAX_SENTENCE}자)\n`);
}

let lenPass = 0;
console.log('걸린 문장의 길이가 독자가 읽는 글자 수와 맞나');
for (const l of LEN) {
  const ok = l.got === l.want;
  if (ok) lenPass++;
  console.log(`   ${ok ? '✓' : '✗'} 기대 ${l.want}자 · 실제 ${l.got}자 — ${l.name.split(' — ')[0]}`);
}

const allPass = pass === CASES.length && lenPass === LEN.length;
console.log(`\n${allPass ? '✓ 전부 통과' : '✗ 실패 있음'}`);
process.exit(allPass ? 0 : 1);
