#!/usr/bin/env node
// 코스 두 장의 구조 검사.
//
// 페이지의 알맹이를 JS 가 그리므로 check-design.js 는 본문 절반만 본다.
// 여기서는 「있어야 할 앵커와 라벨이 있나」를 HTML 원본과 JS 원본 양쪽에서
// 찾는다. 절을 지우거나 위젯 id 를 바꾸면 걸린다.
//
//   node scripts/check-course-pages.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// 파일 여럿에 흩어져 있어도 되게, 페이지마다 볼 파일을 묶어 둔다
const PAGES = [
  {
    name: 'demo-api-course.html',
    // js/course-data.js 는 안 본다 — 그 파일은 두 코스 페이지가 같이 쓰는 공용
    // 데이터라, 넣으면 "공용 데이터에 문구가 있나"만 보게 되고 "1페이지가 실제로
    // 그 문구를 그리나"는 못 본다. 3절의 C-모드 설정 노출 블록을 통째로 지워도
    // js/course-data.js 만 보고 있으면 이 검사는 못 잡는다.
    files: ['demo-api-course.html', 'js/api-course-server.js', 'js/api-course-demo.js'],
    must: [
      'apc-sec1', 'apc-sec2', 'apc-sec3', 'apc-sec4', 'apc-sec5', 'apc-sec6',
      '골라 읽는 법',
      'apc-controls', 'apc-req', 'apc-serverstate', 'apc-send',
      'apc-res', 'apc-verdict', 'apc-codes', 'apc-fake200',
      'apc-layers', 'apc-modes', 'apc-logs', 'apc-axes',
      'nginx 워커 프로세스가 남김', '우리가 짠 핸들러 함수가 남김',
      // 그냥 'apc-logformat' 은 안 쓴다 — demo-api-course.html 의 <style> 이
      // .apc-logformat-caption 등 형제 클래스로 이미 그 부분 문자열을 갖고
      // 있어서, buildLogs() 의 블록을 통째로 지워도 CSS 만으로 통과해 버린다
      // (실제로 겪은 구멍). el 을 지어 id 를 붙이는 코드 줄 자체를 봐야 한다 —
      // js/api-course-demo.js 에만 있고 HTML 에는 없는 문자열이다.
      "fmt.id = 'apc-logformat';",
      'apc-caller', 'apc-compare', 'apc-retry', 'apc-idem',
      'Idempotency-Key',
    ],
  },
  {
    name: 'demo-pipeline-course.html',
    files: ['demo-pipeline-course.html', 'js/pipeline-course-model.js', 'js/pipeline-course-demo.js'],
    must: [
      'plc-sec1', 'plc-sec2', 'plc-sec3', 'plc-sec4', 'plc-sec5', 'plc-sec6', 'plc-sec7',
      '골라 읽는 법',
    ],
  },
];

const fails = [];
let checked = 0;

for (const page of PAGES) {
  const present = page.files.filter(f => fs.existsSync(path.join(root, f)));
  if (!present.length) { fails.push(`${page.name} — 파일이 하나도 없습니다`); continue; }
  const blob = present.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
  for (const needle of page.must) {
    checked++;
    if (!blob.includes(needle)) fails.push(`${page.name} — 「${needle}」 가 없습니다`);
  }
}

for (const line of fails) console.log(`✗ ${line}`);
console.log(fails.length
  ? `\n${fails.length} 건 빠짐 / ${checked} 개 검사`
  : `✓ ${checked}개 앵커 전부 있음`);
process.exit(fails.length ? 1 : 0);
