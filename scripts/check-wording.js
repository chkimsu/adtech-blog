#!/usr/bin/env node
// 말투와 낱말 게이트. MARKDOWN_GUIDE 「말투와 낱말」 절 가운데 기계로 셀 수 있는 일곱 가지를 센다.
//   node scripts/check-wording.js                → 기준표보다 늘어난 곳만 알린다 (CI)
//   node scripts/check-wording.js --list [범주]   → 걸린 자리를 전부 보인다
//   node scripts/check-wording.js --update       → 지금 수를 기준표로 다시 적는다
//
// 2026-10-12 에 블로그 전체를 고쳤지만 고치지 않은 자리가 남아 있다. 그 수를 파일마다
// scripts/wording-baseline.json 에 적어 두고, 그보다 늘면 실패한다. 기준표에 없는 새 파일은
// 0건이어야 한다. 남은 자리를 고쳤으면 --update 로 기준표를 줄인다.
//
// 이야기 속 대사는 그 사람의 말투 그대로 둔다. 「」, “”, 『』, ‘’ 안과, 글 산문의 "" 안은 세지 않는다.
// 사람이 읽어야 판단되는 것(같은 틀의 되풀이, 「칸」 「판」처럼 뜻이 여럿인 낱말)은 세지 않는다.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const BASELINE = path.join(__dirname, 'wording-baseline.json');

const RULES = [
  {
    key: 'haeyo', label: '해요체',
    // 「요」나 「죠」 뒤에 문장 끝이 오는 자리. 「~할까요?」는 남기기로 했다. 「~니까요」는 센다.
    re: /[가-힣]+(?:요|죠)(?=[.!?|*)\]:(]|\s*['"`<]|\s*$|\s+[—-]|\s*\$\{|\s*\+)/gm,
    skip: w => /(필요|중요|주요|개요|수요|요요|강요|소요)$/.test(w) || (/까요$/.test(w) && !/니까요$/.test(w)),
    fix: '~입니다, ~합니다. 안내는 ~해 봅니다, 물음은 ~할까요?',
  },
  {
    key: 'we', label: '「저희」',
    re: /저희/g,
    fix: '저, 제가. 팀을 가리키면 팀 이름',
  },
  {
    key: 'banned', label: '쓰지 않는 낱말',
    // 「헷갈리다」와 「갈라지다」(나무가 아래로 갈라진다)는 다른 낱말이다.
    re: /실측|실체|가른다|가르는|가르면|가르고|가릅니다|갈라(?![지져졌진])|(?<!헷)갈(?:린|리는|리고|리면|립|렸|려)/g,
    fix: '잰 값, 실제 값, 구분한다, 다르다, 나뉜다',
  },
  {
    key: 'middot', label: '가운뎃점',
    re: /·|&middot;|&#183;|\\u00[bB]7/g,
    fix: '나열은 쉼표, 이어 붙이는 표기는 슬래시',
  },
  {
    key: 'analogy', label: '비유 이름표',
    // 비유 자체는 기계가 못 센다. 비유를 불러들이는 이름표와 말머리만 센다.
    re: /한 줄 비유|비유하자면|에 비유하면/g,
    fix: '한 줄 요약. 비유 대신 그 데모의 실제 값과 이름',
  },
  {
    key: 'wordnum', label: '말로 쓴 숫자',
    // 열하나부터. 「한 번」 「두 배」 「열 번」처럼 작은 수는 말로 써도 된다.
    re: /(?<![가-힣])(?:스무|(?:스물|서른|마흔|쉰|예순|일흔|여든|아흔)(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|열(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉))\s?(?:건|개|명|번|곳|편|장|줄|가지|대|살|쪽|칸|째|시간|분|초|주|달|해|단계|차례|층|종|권)|\d할(?![가-힣])/g,
    fix: '40건, 32개, 40%',
  },
  {
    key: 'coined', label: '지어낸 말과 꾸민 동사',
    // MARKDOWN_GUIDE 표기 규칙의 바꿀 말 목록 가운데 다른 뜻이 없는 것만 둔다.
    re: /굳히기|모아 ?보내기|몸풀기|몸을 푼|준비 신호|창구|검문|되먹임|데이터 창고|피처 창고|파일 창고|피처 저장소|메시지 봉투|구워 ?[두둔놓]|후보 추리기|추려내기|판 번호|(?<![\d,])\d+판(?=[\s,.)을이은의에과와도]|$)|배우는 칸|쓰이는 칸|DIN 칸|출력 칸|(?<![가-힣])(?:조인다|조이면|조였)|(?<![가-힣])무너[지진집져졌뜨]|(?<![가-힣])터[지진집져졌]|(?<![가-힣])썩[는어은다]/g,
    fix: '버전, 빌드, readiness probe, 엔드포인트. 떨어진다, 낮춘다, 바닥난다',
  },
];

// 지운 자리를 같은 길이의 공백으로 채운다 — 위치와 줄 번호가 원문과 그대로 맞는다.
const blank = s => s.replace(/[^\n]/g, ' ');
const QUOTES = /“[^”\n]*”|「[^」\n]*」|『[^』\n]*』|‘[^’\n]*’/g;

function stripJs(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/(^|[^:'"\\\w])(\/\/.*)$/gm, (m, p, c) => p + blank(c));
}

function textOf(file, src) {
  if (file.endsWith('.md')) {
    let fence = false;
    return src.split('\n').map(line => {
      if (/^\s*```/.test(line)) { fence = !fence; return blank(line); }
      if (fence) return line;            // 코드 블록의 주석과 출력도 독자가 읽는다
      return line.replace(/`[^`]*`/g, blank)
        .replace(/\]\([^)]*\)/g, m => '](' + blank(m.slice(2)))
        .replace(QUOTES, blank)
        .replace(/"[^"]*"/g, blank);
    }).join('\n');
  }
  if (file.endsWith('.html')) {
    src = src.replace(/<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, blank)
      .replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/g, (m, a, b, c) => a + stripJs(b) + c);
    return src.replace(QUOTES, blank);
  }
  return stripJs(src).replace(QUOTES, blank);
}

function targets() {
  const ls = (dir, ext) => fs.readdirSync(path.join(root, dir)).filter(f => f.endsWith(ext))
    .map(f => (dir === '.' ? f : `${dir}/${f}`));
  return [...ls('posts', '.md'), ...ls('.', '.html'), ...ls('js', '.js')].sort();
}

function scan(file) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  const text = textOf(file, src);
  const out = {};
  for (const r of RULES) {
    out[r.key] = [...text.matchAll(r.re)].filter(m => !(r.skip && r.skip(m[0]))).map(m => {
      const line = src.slice(0, m.index).split('\n').length;
      const from = src.lastIndexOf('\n', m.index) + 1;
      const eol = src.indexOf('\n', m.index);
      const to = Math.min(eol < 0 ? src.length : eol, m.index + m[0].length + 12);
      const ctx = src.slice(Math.max(from, m.index - 36), to).replace(/\s+/g, ' ').trim();
      return { line, ctx };
    });
  }
  return out;
}

const args = process.argv.slice(2);
const files = targets();
const found = Object.fromEntries(files.map(f => [f, scan(f)]));

if (args[0] === '--update') {
  const base = {};
  for (const r of RULES) {
    base[r.key] = {};
    for (const f of files) if (found[f][r.key].length) base[r.key][f] = found[f][r.key].length;
  }
  fs.writeFileSync(BASELINE, JSON.stringify(base, null, 2) + '\n');
  console.log('기준표를 다시 적었습니다 — ' + RULES.map(r =>
    `${r.label} ${Object.values(base[r.key]).reduce((a, b) => a + b, 0)}`).join(', '));
  process.exit(0);
}

if (args[0] === '--list') {
  const only = args[1];
  for (const r of RULES) {
    if (only && only !== r.key) continue;
    console.log(`\n# ${r.label} (${r.key}) — ${r.fix}`);
    for (const f of files) for (const h of found[f][r.key]) console.log(`${f}:${h.line}  ${h.ctx}`);
  }
  process.exit(0);
}

const base = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : {};
let fail = 0, shrunk = 0;
const left = {};
for (const r of RULES) {
  left[r.key] = 0;
  for (const f of files) {
    const hits = found[f][r.key];
    const allowed = (base[r.key] || {})[f] || 0;
    left[r.key] += hits.length;
    if (hits.length > allowed) {
      fail += hits.length - allowed;
      console.log(`✗ ${f} — ${r.label} ${allowed} → ${hits.length}곳 (${r.fix})`);
      for (const h of hits.slice(0, 12)) console.log(`    ${h.line}행  ${h.ctx}`);
      if (hits.length > 12) console.log(`    … ${hits.length - 12}곳 더 — node scripts/check-wording.js --list ${r.key}`);
    } else if (hits.length < allowed) shrunk++;
  }
}
const summary = RULES.map(r => `${r.label} ${left[r.key]}`).join(', ');
if (fail) {
  console.log(`\n기준표보다 ${fail}곳 늘었습니다. 새로 쓴 문장을 고치십시오. 대사라면 「」나 “” 안에 넣습니다.`);
} else {
  console.log(`✓ ${files.length}개 파일 말투와 낱말 검사 통과 — 남은 자리 ${summary}`);
}
if (shrunk) console.log(`  기준표보다 줄어든 자리가 ${shrunk}건 있습니다. node scripts/check-wording.js --update 로 기준표를 줄이십시오.`);
process.exit(fail ? 1 : 0);
