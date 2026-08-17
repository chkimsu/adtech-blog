# API·데이터 파이프라인 코스 2장 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ML 엔지니어가 API 한 건과 로그 한 줄의 일생을 눌러 보며 이해하는 인터랙티브 페이지 두 장을 만든다.

**Architecture:** 정적 페이지 두 장(`demo-api-course.html`, `demo-pipeline-course.html`)이다. 각 장은 「순수 로직 모듈 + DOM 렌더 모듈」 둘로 갈린다. 순수 모듈은 DOM 을 모르고 node 에서 `require` 되므로 실제로 단위 시험을 붙인다. 두 장이 쓰는 숫자는 `js/course-data.js` 한 곳에 모으고, 그 값이 출처 글과 어긋나면 `scripts/check-course-data.js` 가 CI 에서 깨뜨린다.

**Tech Stack:** 빌드 도구 없음. 브라우저 ES5+ 평문 스크립트, Node 20 (검사기·시험), 기존 `css/style.css` 한 장.

**Spec:** `docs/superpowers/specs/2026-08-17-api-pipeline-course-design.md`

## Global Constraints

스펙 8장의 값을 그대로 옮긴다. **모든 작업의 요구사항에 이 절이 암묵적으로 포함된다.**

- **모서리** — `border-radius: 0`. 예외 없음
- **그림자** — `box-shadow: none`. `inset` 만 허용
- **색** — hex 를 새로 박지 않는다. `var(--text-primary)` 같은 저장소 토큰만. 계열이 넷 이상 필요하면 `--series-1`~`--series-6`, 그 전에 채움/테두리로 가를 수 있는지 먼저 본다
- **JS 안에도 hex 금지** — `scripts/check-design.js` 는 `<style>` 과 `style=""` 만 본다. JS 는 검사 밖이므로 사람이 지킨다
- **이모지·장식 글자 금지** — `▶◀★☆※◆◇■□●○◉◎◐◑◒◓◈⇒` 와 이모지. `→ ▸ ▲ ▾ ×` 는 허용. 상태는 글자 라벨(`[문제]`)로
- **serif 금지** — `Newsreader`·`Noto Serif` 를 쓰지 않는다
- **나열 구분자는 쉼표** — 가운뎃점(`·`)을 나열에 쓰지 않는다. (이 계획서와 스펙 본문은 예외 — 기존 문서 표기를 따른다)
- **표 셀·카드는 한 줄 120자 아래**
- **넓은 것은 스크롤 상자에** — 375px 폭에서 `document.scrollWidth === document.clientWidth` 여야 한다
- **SVG `marker` id 는 페이지 안에서 유일** — 접두사 + 절 번호 (`apc3-arr`, `plc4-arr`)
- **클래스 접두사** — 1페이지 `apc-`, 2페이지 `plc-`. `.box` 라는 이름을 쓰지 않는다
- **숫자는 지어내지 않는다** — `js/course-data.js` 에 없는 값을 화면에 쓰지 않는다. 새 값이 필요하면 출처 글을 찾아 `FACTS` 에 등록부터 한다
- **사내 시스템·플랫폼 이름 금지** — 공개 제품명만 (Filebeat, Logstash, Kafka, Flink, Spark, ClickHouse, OpenSearch, Iceberg, Airflow)
- **`git add -A` 금지** — 파일을 명시해 스테이징한다

## File Structure

| 파일 | 책임 |
|---|---|
| `js/course-data.js` | 표준 데이터 한 벌. 두 장이 같이 읽는다. 출처 글과 근거 문자열을 값마다 달고 있다 |
| `js/api-course-server.js` | 1페이지 가짜 서버. 판정 8단계와 방식 A·B·C 별 로그 생성. **DOM 을 모른다** |
| `js/api-course-demo.js` | 1페이지 DOM 렌더와 이벤트 |
| `js/pipeline-course-model.js` | 2페이지 자리 7칸, topic 커서, 보존 계산. **DOM 을 모른다** |
| `js/pipeline-course-demo.js` | 2페이지 DOM 렌더와 이벤트 |
| `demo-api-course.html` | 1페이지 뼈대, 설명 산문, 페이지 전용 CSS |
| `demo-pipeline-course.html` | 2페이지 뼈대, 설명 산문, 페이지 전용 CSS |
| `scripts/check-course-data.js` | `FACTS` 의 값이 출처 글에 실제로 있나 대조 |
| `scripts/check-course-pages.js` | 두 장의 구조 검사 — 절·위젯 앵커·필수 라벨이 있나 |
| `scripts/test-course-logic.js` | 순수 모듈 두 개의 단위 시험 |
| `demos.html` | 카드 2장 + 왼쪽 목록 2줄 추가 |
| `.github/workflows/validate.yml` | 새 검사기 3개를 CI 에 붙임 |

**순수 모듈은 브라우저와 node 양쪽에서 읽힌다.** 저장소에 선례가 없으므로 아래 감싸개를 쓴다. 세 파일(`course-data`, `api-course-server`, `pipeline-course-model`)이 같은 모양을 쓴다.

```js
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;  // node — 검사기가 require 한다
  else root.CourseData = api;                                              // 브라우저 — 페이지가 읽는다
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';
  // …
  return {};
});
```

DOM 모듈 둘은 기존 데모 관행대로 평범한 IIFE 다 (`js/cart-pipeline-demo.js` 참고).

---

## Task 1: 표준 데이터 한 벌과 글 대조 검사기

두 장이 쓸 숫자를 한 곳에 모으고, 그 값이 출처 글과 어긋나면 CI 가 깨지게 한다. 이 장치를 먼저 만드는 이유는 `js/demo-edu-content.js` 가 실제로 낡았기 때문이다 — 글은 「100GB 면 237시간」인데 해설은 61.7시간으로 남아 있다.

**Files:**
- Create: `js/course-data.js`
- Create: `scripts/check-course-data.js`

**Interfaces:**
- Consumes: `posts/*.md` (읽기만)
- Produces:
  - `CourseData.FACTS` — `{ [key]: { value, src, needle } }`
  - `CourseData.CONSUMERS` — 읽는 쪽 넷의 배열
  - `CourseData.HOPS` — 자리 7칸의 배열 (Task 7 이 쓴다)
  - `CourseData.ENDPOINTS` — 주소 다섯의 배열 (Task 6 이 쓴다)

- [ ] **Step 1: 검사기를 먼저 쓴다**

Create `scripts/check-course-data.js`:

```js
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
```

- [ ] **Step 2: 돌려서 실패를 확인한다**

Run: `node scripts/check-course-data.js`
Expected: FAIL — `Cannot find module '../js/course-data.js'`

- [ ] **Step 3: 데이터 파일을 쓴다**

Create `js/course-data.js`:

```js
// ===================================================================
// API·파이프라인 코스 두 장이 같이 쓰는 표준 데이터 한 벌
//   js/course-data.js
//
// 여기 있는 값은 전부 posts/*.md 에서 가져온 것이고 지어낸 것이 없다.
// 값마다 src(출처 글)와 needle(그 글에 있어야 하는 문장)이 달려 있고,
// scripts/check-course-data.js 가 CI 에서 대조한다. 글이 바뀌면 깨진다.
//
// 새 값이 필요하면 여기에 먼저 등록한다. 페이지에 직접 숫자를 박지 않는다.
// ===================================================================
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CourseData = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  // v(값, 출처글, 근거문장) — 문자열 값은 자기 자신이 근거가 된다
  const v = (value, src, needle) => ({
    value,
    src,
    needle: needle || (typeof value === 'string' ? value : null),
  });

  const L = 'log-hops-to-kafka.md';
  const K = 'kafka-log-pipeline.md';
  const A = 'api-basics.md';
  const C = 'api-kinds-and-contracts.md';
  const G = 'gateway-ingress-router.md';
  const P = 'data-pipeline-design.md';

  const FACTS = {
    // --- 그 클릭 한 건 ---
    reqId:     v('r-8f21', L),
    adId:      v(9931, L, '"ad_id":9931'),
    slot:      v('main_top', L),
    clientIp:  v('121.130.8.24', L),
    userAgent: v('AdSDK/3.2.1 (iPhone; iOS 19.2)', L),

    // --- 바이트 사슬 ---
    byteObject:   v(110, L, '110바이트로 들어와 봉투에서 346바이트로 가장 커지고, 변환기에서 309바이트로 꺼집니다'),
    byteHttpBody: v(85,  L, '뒤쪽 중괄호 85바이트'),
    bytePrefix:   v(98,  L, '앞의 98바이트가 서버가 붙인 것'),
    byteAccess:   v(183, L, '183바이트입니다'),
    byteEnvelope: v(346, L, '봉투에 담으면 346바이트가 됩니다'),
    byteFinal:    v(309, L, '건당 309바이트'),

    // --- 볼륨과 시간 ---
    perSecFile:  v(686,  L, '686줄이 들어와 2,665건이 나갑니다'),
    perSecKafka: v(2665, L, '686줄이 들어와 2,665건이 나갑니다'),
    perSecImp:   v(2639, C, '초당 2,639건'),
    msToKafka:   v(1112, L, '탭에서 Kafka 도달까지 1,112 밀리초'),
    msInFile:    v(640,  L, '1,112 밀리초 중 640이 거기입니다'),
    fileHours:   v(237,  L, '디스크 100GB 면 237시간입니다'),
    directMins:  v(10.9, L, '512MB 가 10.9분에 찹니다'),
    nginxBufLoss: v(179, L, '없어질 수 있는 최대치는 **179줄**'),
    dailyClicks: v('하루 클릭 228만 건', P),

    // --- Kafka ---
    topicClick:    v('ad.click', K),
    partitionOf:   v(5,    K, '`partition` 은 5, `offset` 은 8,412'),
    offsetOf:      v(8412, K, '`partition` 은 5, `offset` 은 8,412'),
    partitionN:    v(12,   K, '우리는 12개로 잡습니다'),
    retentionDays: v(7,    K, '우리 답은 7일입니다'),
    joinHours:     v(3,    K, '우리 답은 3시간입니다'),
    ctr:           v('1.00%', K),

    // --- API ---
    reportInflated: v(1180, C, '리포트에 1,180건으로 잡힙니다'),
    cpaInflated:    v(4237, C, '리포트에는 ₩4,237로 뜹니다'),
    bidBudgetMs:    v(12,   G, '12ms 안에 답해야 하는 입찰 요청'),
    trackBudgetMs:  v(100,  G, '100ms 가 걸려도 됩니다'),
    deployStacked:  v(52780, K, '52,780줄이 `bidder` 메모리에 쌓입니다'),

    // --- 실물 줄 (값 자체가 근거다) ---
    accessLineStd: v('"POST /v1/events HTTP/1.1" 204 0', A),
    eventLine:     v('{"req_id":"r-8f21","event":"click","ad_id":9931,"slot":"main_top","event_ts":1786002501234,"app_ver":"3.2.1"}', A),
    collectLine:   v('121.130.8.24 2026-08-16T16:48:21+09:00 POST /v1/events 204 0.002 "AdSDK/3.2.1 (iPhone; iOS 19.2)" {"event":"click","ad_id":9931,"slot":"main_top","req_id":"r-8f21","ts":1786002501234}', L),
    finalLine:     v('{"event":"click","ad_id":9931,"slot":"main_top","req_id":"r-8f21","campaign_id":5502,"advertiser_id":311,"cost":182.4,"media":"A앱","client_ip":"121.130.8.24","device":"iPhone","os":"iOS 19.2","event_time":"2026-08-16T16:48:21+09:00","ingest_time":"2026-08-16T16:48:22.104+09:00","status":204,"latency_ms":2}', L),
    impLine:       v('{"req_id":"r-8f21","ad_id":9931,"slot":"main_top","media":"A앱","pctr":0.0213,"bid":182.4,"ts":1786000101}', K),
    labelLine:     v('{"req_id":"r-8f21","ad_id":9931,"slot":"main_top","media":"A앱","bid":182.4,"y":1}', K),
    logFormat:     v("log_format collect '$remote_addr $time_iso8601 $request_method $uri $status '", L),
  };

  // 값만 꺼내 쓰는 지름길 — 화면 코드는 이쪽을 쓴다
  const val = {};
  for (const k of Object.keys(FACTS)) val[k] = FACTS[k].value;

  // 읽는 쪽 넷. 마감은 kafka-log-pipeline 1절, consumer 수는 4절, 저장소는
  // data-distribution-layer 1절이다. why/late/faster 는 그 글들의 서술을
  // 한 줄로 줄인 것이라 FACTS 대조 대상이 아니다.
  const CONSUMERS = [
    {
      key: 'budget', name: '예산 소진 확인', deadline: '5초', deadlineSec: 5,
      consumers: 6, store: '집계 결과', product: 'Flink', mode: 'stream',
      why: '돈이 샙니다. 예산을 다 쓴 캠페인이 계속 나가면 그 광고비는 우리가 뭅니다',
      late: '5초 늦으면 노출 13,195건이 더 나갑니다',
      faster: '이득이 큽니다. 넷 중 여기가 제일 급합니다',
    },
    {
      key: 'dash', name: '실시간 대시보드', deadline: '2초', deadlineSec: 2,
      consumers: 6, store: 'ClickHouse', product: 'Flink, Kafka Streams', mode: 'stream',
      why: '운영자가 화면을 보며 지금 잘 나가는지 판단합니다',
      late: '멈춘 화면으로 보입니다',
      faster: '이득 없습니다. 사람 눈이 2초 아래를 못 가립니다',
    },
    {
      key: 'report', name: '광고주 리포트', deadline: '5분', deadlineSec: 300,
      consumers: 12, store: '리포트용 DB', product: 'Spark 마이크로배치', mode: 'micro',
      why: '그대로 청구서가 됩니다. 빠른 것보다 정확한 것이 먼저입니다',
      late: '광고주 문의가 옵니다',
      faster: '필요 없습니다',
    },
    {
      key: 'train', name: '모델 학습', deadline: '다음 날 새벽', deadlineSec: 86400,
      consumers: 4, store: 'Iceberg + 스토리지', product: 'Spark, Airflow', mode: 'batch',
      why: '하루치가 다 모여야 라벨이 확정됩니다',
      late: '어제 데이터로 오늘 모델을 못 만듭니다',
      faster: '불가능합니다. 라벨이 아직 안 왔습니다',
    },
  ];

  // 13,195 = 초당 2,639 × 5초. 위 late 문구가 이 곱셈과 맞는지 지킨다.
  const BUDGET_LATE_IMPRESSIONS = FACTS.perSecImp.value * 5;
  // 52,780 = 초당 2,639 × 20초 배포. 3절이 쓴다. 숫자를 손으로 박지 않는다.
  const DEPLOY_STACKED_ROWS = FACTS.perSecImp.value * 20;

  return { FACTS, val, CONSUMERS, BUDGET_LATE_IMPRESSIONS, DEPLOY_STACKED_ROWS };
});
```

- [ ] **Step 4: 돌려서 통과를 확인한다**

Run: `node scripts/check-course-data.js`
Expected: PASS — `✓ 39개 값 전부 출처 글과 일치`

숫자는 `FACTS` 의 항목 수를 따른다. 항목을 더하거나 빼면 그만큼 달라진다. **줄 앞에 `✗` 가 하나도 없으면 통과다.**

값 하나라도 어긋나면 **글이 정본이다.** `js/course-data.js` 쪽을 고친다.

- [ ] **Step 5: 대조가 진짜로 도는지 한 번 깨 본다**

`js/course-data.js` 의 `fileHours` 를 잠깐 `v(61.7, L, '디스크 100GB 면 237시간입니다')` 로 바꾸고 다시 돌린다.

Run: `node scripts/check-course-data.js`
Expected: FAIL — `fileHours — 근거 문장에 값 61.7 가 없습니다`

확인했으면 `237` 로 되돌리고 다시 돌려 통과시킨다. **되돌리는 것을 잊지 말 것.**

- [ ] **Step 6: 커밋**

```bash
git add js/course-data.js scripts/check-course-data.js
git commit -m "feat(course): 표준 데이터 한 벌과 글 대조 검사기

코스 두 장이 쓸 값을 한 곳에 모으고 출처 글과 대조한다. 값마다 근거
문장을 달아 두어, 글이 바뀌면 CI 가 깨진다."
```

---

## Task 2: 1페이지 뼈대와 구조 검사기

절 여섯의 빈 껍데기와 상단 내비, 골라 읽는 법을 세운다. 이 시점에 디자인 게이트를 통과시켜, 이후 작업이 색·모서리 문제를 안 물고 가게 한다.

**Files:**
- Create: `demo-api-course.html`
- Create: `scripts/check-course-pages.js`

**Interfaces:**
- Produces: 절 앵커 id `apc-sec1`~`apc-sec6`. 이후 작업이 그 안을 채운다

- [ ] **Step 1: 구조 검사기를 먼저 쓴다**

Create `scripts/check-course-pages.js`:

```js
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
    files: ['demo-api-course.html', 'js/api-course-server.js', 'js/api-course-demo.js'],
    must: [
      'apc-sec1', 'apc-sec2', 'apc-sec3', 'apc-sec4', 'apc-sec5', 'apc-sec6',
      '골라 읽는 법',
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
```

- [ ] **Step 2: 돌려서 실패를 확인한다**

Run: `node scripts/check-course-pages.js`
Expected: FAIL — `demo-api-course.html — 파일이 하나도 없습니다` 와 `demo-pipeline-course.html — 파일이 하나도 없습니다`

- [ ] **Step 3: 1페이지 뼈대를 만든다**

Create `demo-api-course.html`. `demo-cart-pipeline.html` 의 머리·내비를 그대로 따르고 알맹이만 비워 둔다.

```html
<!DOCTYPE html>
<html lang="ko" data-theme="light">

<head><script>(function(){try{var d=document.documentElement,t=localStorage.getItem('theme')||'light';d.setAttribute('data-theme',t);}catch(e){}if(location.search.indexOf('embed=1')>-1)document.documentElement.classList.add('is-embed');})();</script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description"
    content="API 한 건을 직접 조립해 보내 보고, 그 한 건이 어디에 어떤 로그로 남는지 확인하는 인터랙티브 페이지. 액세스 로그와 이벤트 로그를 각각 누가 남기는지, 앱이 부를 때와 다른 서버가 부를 때가 어떻게 다른지, 주소 이름을 왜 나누는지까지 눌러 가며 본다.">
  <title>API 한 건을 직접 만들어 보기 — Ad Tech Blog</title>

  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="stylesheet" href="css/style.css">

  <style>
    /* ===================================================================
       API 코스 — demo-api-course.html
       색 값은 이 파일에도 js/api-course-*.js 에도 hex 로 하나도 없다.
       전부 var(--...) 다. 상태는 색만이 아니라 글자 라벨로도 갈린다.
       =================================================================== */

    .apc-hero { text-align: center; padding: 2rem 1rem 1rem; }
    .apc-hero h1 { font-size: 2.05rem; margin-bottom: 0.5rem; color: var(--accent-primary); }
    .apc-hero p { color: var(--text-secondary); max-width: 760px; margin: 0 auto; font-size: 0.98rem; }

    .apc-page { max-width: 1040px; margin: 0 auto; padding: 0 1rem; }

    .apc-guide {
      max-width: 1040px; margin: 1.25rem auto 2rem; padding: 1rem 1.25rem;
      border: 1px dashed var(--border-color); background: var(--bg-secondary);
      font-size: 0.9rem; line-height: 1.75; color: var(--text-secondary);
    }
    .apc-guide strong { color: var(--accent-primary); }
    .apc-guide ul { margin: 0.6rem 0 0; padding-left: 1.1rem; }

    .apc-sec { margin: 0 0 3rem; }
    .apc-sec > h2 {
      font-size: 1.35rem; margin: 0 0 0.35rem;
      padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);
    }
    .apc-sec > .apc-lead { color: var(--text-secondary); font-size: 0.95rem; margin: 0 0 1.1rem; }

    /* 넓은 것은 제 스크롤 상자 안에서만 넘친다 — 페이지가 가로로 안 밀리게 */
    .apc-scroll { overflow-x: auto; }
  </style>
</head>

<body>
  <header>
    <nav>
      <a href="index.html" class="logo">AdTech Blog</a>
      <div class="nav-content">
        <div class="nav-actions">
          <a href="posts-browse.html" class="btn-demo">Posts</a>
          <a href="ecosystem.html" class="btn-demo">Ecosystem</a>
          <a href="demos.html" class="btn-demo">데모</a>
          <a href="ml-track.html" class="btn-demo btn-ml">▸ ML 트랙</a>
          <button id="theme-toggle" class="theme-toggle" aria-label="테마 선택"></button>
        </div>
      </div>
    </nav>
  </header>

  <main>
    <section class="apc-hero">
      <h1>API 한 건을 직접 만들어 보기</h1>
      <p>보내고, 받고, 로그가 남기까지. 값을 바꿔 가며 눌러 보면 무엇이 달라지는지 그 자리에서 보입니다.</p>
    </section>

    <div class="apc-guide">
      <strong>골라 읽는 법</strong> — 절이 6개인 긴 페이지입니다. 처음부터 다 볼 필요 없습니다.
      <ul>
        <li>API 한 건이 어떻게 생겼는지만 → 1~2절</li>
        <li>로그를 누가 남기는지만 → 3절</li>
        <li>앱이 부를 때와 서버가 부를 때의 차이만 → 4절</li>
        <li>주소 이름 짓는 법만 → 5절</li>
      </ul>
    </div>

    <div class="apc-page">
      <section class="apc-sec" id="apc-sec1">
        <h2>1. 요청 한 건은 이렇게 생겼습니다</h2>
      </section>
      <section class="apc-sec" id="apc-sec2">
        <h2>2. 받는 쪽은 무엇을 보고 무엇을 돌려줍니까</h2>
      </section>
      <section class="apc-sec" id="apc-sec3">
        <h2>3. 이 줄은 누가 남깁니까</h2>
      </section>
      <section class="apc-sec" id="apc-sec4">
        <h2>4. 부르는 쪽이 앱이냐 다른 서버냐</h2>
      </section>
      <section class="apc-sec" id="apc-sec5">
        <h2>5. 그래서 주소 이름을 나눕니까</h2>
      </section>
      <section class="apc-sec" id="apc-sec6">
        <h2>6. 이 한 건이 남긴 줄</h2>
      </section>
    </div>
  </main>

  <script src="js/main.js"></script>
  <script src="js/course-data.js"></script>
  <script src="js/api-course-server.js"></script>
  <script src="js/api-course-demo.js"></script>
</body>

</html>
```

⚠ `js/api-course-server.js` 와 `js/api-course-demo.js` 는 Task 3 에서 만든다. 이 시점에는 브라우저 콘솔에 404 두 개가 뜬다. **정상이다.** 페이지는 그려진다.

- [ ] **Step 4: 두 검사기를 돌린다**

Run: `node scripts/check-design.js demo-api-course.html`
Expected: PASS — `✓ 1개 파일 디자인 게이트 통과`

Run: `node scripts/check-course-pages.js`
Expected: FAIL — 2페이지 앵커 7개가 아직 없다. **1페이지 줄이 하나도 안 나오면 그것이 통과 신호다.**

- [ ] **Step 5: 눈으로 본다**

```bash
python3 -m http.server 8765
```

브라우저로 `http://localhost:8765/demo-api-course.html` 을 연다. 볼 것 넷.
- 상단 내비가 본문과 좌우가 맞나
- 둥근 모서리가 하나도 없나
- 테마 토글을 눌러 다크로 바꿨을 때 안 따라오는 자리가 없나
- 375px 폭으로 줄였을 때 가로 스크롤이 안 생기나

- [ ] **Step 6: 커밋**

```bash
git add demo-api-course.html scripts/check-course-pages.js
git commit -m "feat(course): API 코스 1페이지 뼈대와 구조 검사기

절 여섯의 껍데기와 골라 읽는 법을 세운다. 알맹이는 뒤 작업이 채운다."
```

---

## Task 3: 1페이지 1~2절 — 요청 조립기와 가짜 서버

판정 8단계를 순수 함수로 만들고 단위 시험을 붙인다. 이 페이지에서 가장 틀리기 쉬운 자리이므로 화면보다 로직을 먼저 굳힌다.

**Files:**
- Create: `js/api-course-server.js`
- Create: `scripts/test-course-logic.js`
- Create: `js/api-course-demo.js`
- Modify: `demo-api-course.html` (1~2절 안쪽)

**Interfaces:**
- Consumes: `CourseData.val`
- Produces:
  - `ApiCourseServer.defaultState()` → `{ caller, method, path, ctype, auth, body, server }`
  - `ApiCourseServer.evaluate(state)` → `{ status, reason, message, missing }`
  - `ApiCourseServer.appView(verdict)` → `{ ok, label }`
  - `ApiCourseServer.requestText(state)` → HTTP 요청 원문 문자열
  - `ApiCourseServer.responseText(verdict)` → HTTP 응답 원문 문자열 (`no-response` 면 `null`)
  - `ApiCourseServer.byteLen(str)` → UTF-8 바이트 수

- [ ] **Step 1: 시험을 먼저 쓴다**

Create `scripts/test-course-logic.js`:

```js
#!/usr/bin/env node
// 코스 두 장의 순수 로직 시험. DOM 이 없어도 도는 부분만 본다.
//
//   node scripts/test-course-logic.js
const S = require('../js/api-course-server.js');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}

// s(덮어쓸 것) — 통과하는 기본 상태에서 한 군데만 바꾼다
const s = (over) => Object.assign(S.defaultState(), over || {});
const sBody = (over) => {
  const st = S.defaultState();
  st.body = Object.assign({}, st.body, over);
  return st;
};

console.log('판정 8단계 — 위에서부터 먼저 걸리는 것이 이긴다');
eq('통과하면 204',                    S.evaluate(s()).status, 204);
eq('장비가 안 뜨면 응답 없음',          S.evaluate(s({ server: 'hostdown' })).status, 0);
eq('앱 프로세스가 죽으면 502',          S.evaluate(s({ server: 'appdown' })).status, 502);
eq('앱이 부르는데 API 키를 달면 401',   S.evaluate(s({ auth: 'apikey' })).status, 401);
eq('GET 이면 405',                     S.evaluate(s({ method: 'GET' })).status, 405);
eq('Content-Type 이 없으면 415',       S.evaluate(s({ ctype: false })).status, 415);
eq('req_id 가 비면 400',               S.evaluate(sBody({ req_id: '' })).status, 400);
eq('느리면 서버는 204',                 S.evaluate(s({ server: 'slow' })).status, 204);

console.log('\n순서가 지켜지나 — 두 조건이 같이 틀렸을 때 앞의 것이 이긴다');
eq('장비가 죽었으면 인증은 안 본다',     S.evaluate(s({ server: 'hostdown', auth: 'apikey' })).reason, 'no-response');
eq('인증이 틀리면 필드는 안 본다',       S.evaluate(Object.assign(sBody({ req_id: '' }), { auth: 'apikey' })).status, 401);

console.log('\n빠진 필드를 다 짚어 주나');
eq('req_id 와 ad_id 가 같이 비면 둘 다', S.evaluate(sBody({ req_id: '', ad_id: null })).missing, ['req_id', 'ad_id']);

console.log('\n앱이 아는 것과 서버가 아는 것이 갈리는 두 자리');
eq('느릴 때 앱은 실패로 안다',           S.appView(S.evaluate(s({ server: 'slow' }))), { ok: false, label: 'timeout' });
eq('장비가 죽으면 앱은 연결 실패',        S.appView(S.evaluate(s({ server: 'hostdown' }))), { ok: false, label: 'connect failed' });
eq('통과하면 앱도 성공으로 안다',         S.appView(S.evaluate(s())), { ok: true, label: 'ok' });
eq('400 이면 앱은 코드를 안다',           S.appView(S.evaluate(sBody({ req_id: '' }))).label, 'got 400');

console.log('\n서버가 부를 때는 요구 인증이 바뀐다');
eq('서버가 API 키를 달면 통과',          S.evaluate(s({ caller: 'server', auth: 'apikey' })).status, 204);
eq('서버가 인증 없이 부르면 401',        S.evaluate(s({ caller: 'server', auth: 'none' })).status, 401);

console.log('\n요청 본문 바이트가 글의 85 와 맞나');
eq('다 채운 본문은 85 B',               S.byteLen(S.bodyText(S.defaultState())), 85);

const allPass = fail === 0;
console.log(`\n${allPass ? `✓ 전부 통과 (${pass}건)` : `✗ ${fail}건 실패 / ${pass + fail}건`}`);
process.exit(allPass ? 0 : 1);
```

- [ ] **Step 2: 돌려서 실패를 확인한다**

Run: `node scripts/test-course-logic.js`
Expected: FAIL — `Cannot find module '../js/api-course-server.js'`

- [ ] **Step 3: 가짜 서버를 만든다**

Create `js/api-course-server.js`:

```js
// ===================================================================
// API 코스 1페이지 — 가짜 서버
//   js/api-course-server.js
//
// DOM 을 모른다. node 에서 require 되어 scripts/test-course-logic.js 가
// 시험한다. 화면은 js/api-course-demo.js 가 맡는다.
//
// 판정은 위에서부터 내려오고 먼저 걸리는 것이 이긴다. 순서가 곧 뜻이다 —
// 장비가 죽었으면 인증을 볼 기회조차 없다.
// ===================================================================
(function (root, factory) {
  const api = factory(
    typeof require === 'function' ? require('./course-data.js') : root.CourseData
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ApiCourseServer = api;
})(typeof self !== 'undefined' ? self : globalThis, function (CourseData) {
  'use strict';

  const V = CourseData.val;
  const REQUIRED = ['req_id', 'ad_id', 'event'];

  // 부르는 쪽마다 받는 쪽이 요구하는 자격증명이 다르다.
  // 앱은 비밀키를 못 실으므로 아예 안 받고 값을 다시 검사한다.
  const WANT_AUTH = { app: 'none', server: 'apikey' };

  // 🔴 본문의 키 이름과 순서는 posts/log-hops-to-kafka.md 60행이 정본이다.
  //    `ts` 이지 `event_ts` 가 아니다. 둘은 6바이트 차이라 85 B 가 안 나온다.
  //    (`event_ts` 와 `app_ver` 는 앱이 따로 남기는 이벤트 로그 쪽 이름이다 —
  //     api-basics 8절의 그 줄이고, 3절의 B 방식이 그것을 쓴다)
  const BODY_ORDER = ['event', 'ad_id', 'slot', 'req_id', 'ts'];

  function defaultState() {
    return {
      caller: 'app',
      method: 'POST',
      path: '/v1/events',
      ctype: true,
      auth: 'none',
      server: 'ok',
      body: {
        event: 'click',
        ad_id: V.adId,
        slot: V.slot,
        req_id: V.reqId,
        ts: 1786002501234,
      },
    };
  }

  function verdict(status, reason, message, missing) {
    return { status: status, reason: reason, message: message, missing: missing || [] };
  }

  function evaluate(s) {
    if (s.server === 'hostdown') return verdict(0, 'no-response', '서버 장비가 안 떠 있습니다. 요청이 닿지 못했습니다');
    if (s.server === 'appdown') return verdict(502, 'appdown', 'nginx 는 살아 있는데 뒤의 앱이 죽었습니다');
    if (s.auth !== WANT_AUTH[s.caller]) return verdict(401, 'auth', '자격증명이 없거나 이 주소가 원하는 것이 아닙니다');
    if (s.method !== 'POST') return verdict(405, 'method', '이 주소는 POST 만 받습니다');
    if (!s.ctype) return verdict(415, 'ctype', 'Content-Type 이 없어 본문을 어떻게 읽을지 모릅니다');

    const missing = REQUIRED.filter(function (k) {
      const v = s.body[k];
      return v === '' || v === null || v === undefined;
    });
    if (missing.length) return verdict(400, 'field', '필수 필드가 빠졌습니다', missing);

    if (s.server === 'slow') return verdict(204, 'timeout', '서버는 저장했는데 앱은 기다리다 포기했습니다');
    return verdict(204, 'ok', '받았습니다. 본문은 안 돌려줍니다');
  }

  // 같은 한 건인데 앱이 아는 것과 서버가 아는 것이 갈린다.
  // 갈리는 자리는 둘뿐이다 — 안 닿았을 때와 앱이 먼저 포기했을 때.
  function appView(v) {
    if (v.reason === 'no-response') return { ok: false, label: 'connect failed' };
    if (v.reason === 'timeout') return { ok: false, label: 'timeout' };
    if (v.status === 204) return { ok: true, label: 'ok' };
    return { ok: false, label: 'got ' + v.status };
  }

  function bodyText(s) {
    const out = {};
    BODY_ORDER.forEach(function (k) {
      const v = s.body[k];
      if (v !== '' && v !== null && v !== undefined) out[k] = v;
    });
    return JSON.stringify(out);
  }

  function requestText(s) {
    const lines = [s.method + ' ' + s.path + ' HTTP/1.1', 'Host: api.example.com'];
    if (s.ctype) lines.push('Content-Type: application/json');
    if (s.auth === 'token') lines.push('Authorization: Bearer u-9f31c0');
    if (s.auth === 'apikey') lines.push('X-Api-Key: k-7712');
    return lines.join('\n') + '\n\n' + bodyText(s);
  }

  const REASON_TEXT = {
    204: '204 No Content',
    400: '400 Bad Request',
    401: '401 Unauthorized',
    405: '405 Method Not Allowed',
    415: '415 Unsupported Media Type',
    502: '502 Bad Gateway',
  };

  function responseText(v) {
    if (v.reason === 'no-response') return null;
    const head = 'HTTP/1.1 ' + REASON_TEXT[v.status];
    if (v.status === 204) return head;
    const body = {
      error: {
        code: v.reason.toUpperCase(),
        message: v.message,
        request_id: V.reqId,
        retryable: v.status >= 500,
      },
    };
    if (v.missing.length) body.error.fields = v.missing;
    return head + '\nContent-Type: application/json\n\n' + JSON.stringify(body);
  }

  function byteLen(str) {
    if (typeof TextEncoder === 'function') return new TextEncoder().encode(str).length;
    return Buffer.byteLength(str, 'utf8');
  }

  return {
    defaultState: defaultState,
    evaluate: evaluate,
    appView: appView,
    bodyText: bodyText,
    requestText: requestText,
    responseText: responseText,
    byteLen: byteLen,
    WANT_AUTH: WANT_AUTH,
    REQUIRED: REQUIRED,
  };
});
```

- [ ] **Step 4: 시험을 돌린다**

Run: `node scripts/test-course-logic.js`
Expected: PASS — `✓ 전부 통과 (19건)`

**마지막 시험(85 B)이 틀리면 본문 필드를 고치지 말고 먼저 세어 보라.** `posts/log-hops-to-kafka.md` 60행의 본문이 정본이다. 그 줄과 `bodyText()` 의 결과가 글자 하나까지 같아야 한다.

- [ ] **Step 5: 1~2절 화면을 만든다**

Create `js/api-course-demo.js` — 기존 데모 관행대로 IIFE 로 짓고 넷으로 나눈다.

```js
// ===================================================================
// API 코스 1페이지 — 화면
//   js/api-course-demo.js
//
// 구성은 넷이다.
//   0) 참조   — CourseData 와 ApiCourseServer 를 집어 온다
//   1) 상태   — ApiCourseServer.defaultState() 하나만 들고 있다
//   2) 그리기 — state 를 읽어 DOM 에 반영한다. state 를 바꾸지 않는다
//   3) 바인딩 — 이벤트를 받아 state 를 바꾸고 draw() 를 부른다
//
// 절 1~6 이 상태 하나를 같이 본다. 4절 스위치가 caller 를 바꾸면 1~3절이
// 통째로 따라 바뀐다.
// ===================================================================
(function () {
  'use strict';

  const D = window.CourseData;
  const S = window.ApiCourseServer;
  const state = S.defaultState();
  const $ = (id) => document.getElementById(id);

  // 2) 그리기 — state 를 읽기만 한다. 절마다 draw 함수 하나씩이고
  //    draw() 가 그 전부를 순서대로 부른다. 어느 이벤트가 무엇을 바꾸든
  //    화면 전체를 다시 그린다 — 부분 갱신을 안 하면 어긋날 자리가 없다.
  function drawRequest() {
    $('apc-req').textContent = S.requestText(state);
    $('apc-req-bytes').textContent = S.byteLen(S.bodyText(state)) + ' B';
  }

  function drawResponse() {
    const v = S.evaluate(state);
    const res = S.responseText(v);
    $('apc-res').textContent = res === null ? '응답이 없습니다. 요청이 서버에 닿지 못했습니다' : res;
    $('apc-verdict').textContent = v.message;
    // 상태는 색만이 아니라 글자 라벨로도 갈린다
    $('apc-verdict').dataset.tone = v.status === 204 ? 'ok' : 'bad';
  }

  function draw() {
    drawRequest();
    drawResponse();
    // 절이 늘 때마다 여기에 한 줄씩 더한다 (drawLogs, drawCompare, …)
  }

  // 3) 바인딩 — state 를 바꾸고 draw() 를 부른다
  //
  // ⚠ 체크박스에는 이벤트를 직접 걸지 않는다. 감싸는 <label> 에 건다.
  //    라벨 글자를 누르면 click 이 두 번 오므로(라벨에 한 번, 라벨이 넘겨준
  //    체크박스에 한 번) 실제로 바뀐 뒤에만 반응하게 dataset 에 적어 둔다.
  //    기존 데모 다섯이 전부 이 함정에 걸렸다.
  function bindToggle(el, apply) {
    el.addEventListener('click', function () {
      const input = el.querySelector('input');
      const now = String(input.checked);
      if (el.dataset.applied === now) return;
      el.dataset.applied = now;
      apply(input.checked);
      draw();
    });
  }

  draw();
})();
```

`demo-api-course.html` 의 `#apc-sec1` 과 `#apc-sec2` 안에 위젯 자리를 넣는다. **id 는 아래 그대로 쓴다** — Task 4 이후가 이 id 를 참조한다.

```html
<section class="apc-sec" id="apc-sec1">
  <h2>1. 요청 한 건은 이렇게 생겼습니다</h2>
  <p class="apc-lead">
    조각은 넷뿐입니다. 무엇을 하려는지(메서드), 무엇에 대해서인지(주소),
    곁들이는 정보(헤더), 실어 보내는 내용(본문)입니다.
    아래에서 값을 바꾸면 오른쪽 원문이 그 자리에서 바뀝니다.
  </p>
  <div class="apc-build">
    <div class="apc-controls" id="apc-controls"></div>
    <div class="apc-raw apc-scroll">
      <div class="apc-raw-head">보낼 요청 원문 <span id="apc-req-bytes"></span></div>
      <pre id="apc-req"></pre>
    </div>
  </div>
</section>

<section class="apc-sec" id="apc-sec2">
  <h2>2. 받는 쪽은 무엇을 보고 무엇을 돌려줍니까</h2>
  <p class="apc-lead">
    받는 쪽은 위에서부터 하나씩 봅니다. 먼저 걸리는 것이 이기고, 거기서 멈춥니다.
    서버 상태를 바꿔 보면 같은 요청이 다른 답을 받습니다.
  </p>
  <div class="apc-serverstate" id="apc-serverstate"></div>
  <button type="button" id="apc-send" class="btn-try">보내기</button>
  <div class="apc-raw apc-scroll">
    <div class="apc-raw-head">돌아온 응답</div>
    <pre id="apc-res"></pre>
  </div>
  <div class="apc-verdict" id="apc-verdict"></div>
  <div class="apc-scroll"><table class="apc-codes" id="apc-codes"></table></div>

  <h3>실무에서 자주 보는 함정 하나</h3>
  <button type="button" id="apc-fake200" class="btn-try" aria-pressed="false">200 안에 에러 담기</button>
  <p class="apc-fake200-note" id="apc-fake200-note"></p>
</section>
```

구현할 것 일곱.
1. `#apc-controls` — 메서드 2택, `Content-Type` 켜기·끄기, 인증 3택(`없음`, `사용자 토큰`, `API 키`), 본문 필드 5개 각각 채움·비움 체크박스
2. `#apc-req` — `S.requestText(state)`, `#apc-req-bytes` 는 `S.byteLen(S.bodyText(state)) + ' B'`
3. `#apc-serverstate` — 4택 (`정상`, `앱이 죽음`, `장비가 안 뜸`, `느림`)
4. `#apc-send` — `S.evaluate(state)` 를 불러 `#apc-res` 와 `#apc-verdict` 를 채운다
5. `#apc-verdict` — 지금 응답의 뜻 한 줄
6. `#apc-codes` — 상태코드마다 「누가 고쳐야 하나, 다시 보내도 되나」. 값은 스펙 4.2 2절의 표를 그대로 옮긴다
7. `#apc-fake200` — 켜면 응답이 `200 OK` + `{"result":"fail","message":"invalid click_id"}` 로 바뀐다. `#apc-fake200-note` 에 동시에 눈이 머는 곳 셋을 적는다 — 라이브러리는 성공으로 보고 재시도에서 빼고, 실패율 그래프는 평평하고, 로드밸런서도 정상으로 봅니다. **정산 매출이 안 맞을 때까지 아무도 모릅니다**

⚠ **체크박스에 이벤트를 직접 걸지 말고 감싸는 `<label>` 에 건다.** 기존 데모 다섯이 전부 이 함정에 걸렸다 (`js/demo-edu-content.js` 의 주석 참고). 라벨 글자를 누르면 click 이 두 번 오므로, 이미 말한 상태를 `dataset` 에 적어 두고 실제로 바뀐 뒤에만 반응한다.

- [ ] **Step 6: 구조 검사기에 앵커를 더하고 검사기 셋을 돌린다**

`scripts/check-course-pages.js` 의 1페이지 `must` 배열에 더한다.

```js
      'apc-controls', 'apc-req', 'apc-serverstate', 'apc-send',
      'apc-res', 'apc-verdict', 'apc-codes', 'apc-fake200',
```

```bash
node scripts/test-course-logic.js
node scripts/check-course-data.js
node scripts/check-design.js demo-api-course.html
```
Expected: 셋 다 PASS. `check-course-pages.js` 는 2페이지가 아직 없어 실패한다 — **1페이지 줄이 하나도 안 나오면 통과 신호다**

- [ ] **Step 7: 브라우저로 눌러 본다**

`python3 -m http.server 8765` 로 띄우고 `demo-api-course.html` 을 연다. 확인할 것 넷.
- `req_id` 체크를 풀고 보내면 `400` 이 오고 빠진 필드 이름이 나온다
- 메서드를 `GET` 으로 바꾸면 `405` 가 온다
- 서버를 `장비가 안 뜸` 으로 두면 응답 칸이 비고 「응답이 없습니다」가 뜬다
- 원문 바이트가 다 채웠을 때 `85 B` 다

- [ ] **Step 8: 커밋**

```bash
git add js/api-course-server.js js/api-course-demo.js scripts/test-course-logic.js demo-api-course.html
git commit -m "feat(course): 1페이지 1~2절 — 요청 조립기와 가짜 서버

판정 8단계를 DOM 을 모르는 순수 모듈로 짜고 단위 시험 19건을 붙였다.
장비가 죽은 것과 앱이 죽은 것을 갈라 두었다 — 3절이 그 차이를 쓴다."
```

---

## Task 4: 1페이지 3절 — 이 줄은 누가 남깁니까

이 페이지의 핵심 절이다. 방식 A·B·C 를 눌러 바꾸면 같은 요청에서 나오는 줄이 통째로 바뀐다.

**Files:**
- Modify: `js/api-course-server.js` (`logsFor` 추가)
- Modify: `scripts/test-course-logic.js` (로그 시험 추가)
- Modify: `js/api-course-demo.js` (3절 렌더)
- Modify: `demo-api-course.html` (`#apc-sec3` 안쪽)
- Modify: `scripts/check-course-pages.js` (3절 앵커 추가)

**Interfaces:**
- Consumes: `ApiCourseServer.evaluate`, `ApiCourseServer.appView`
- Produces: `ApiCourseServer.logsFor(mode, state, verdict)` → `{ sdk: string, nginx: string|null, event: string|null }`
  - `mode` 는 `'A'` | `'B'` | `'C'`
  - `null` 은 「그 줄이 안 남았다」는 뜻이다. 빈 문자열과 구분한다

- [ ] **Step 1: 시험을 먼저 쓴다**

`scripts/test-course-logic.js` 의 마지막 `const allPass` 줄 **앞에** 붙인다.

```js
console.log('\n3절 — 방식마다 어느 줄이 남나');
const okV = S.evaluate(s());
const badV = S.evaluate(sBody({ req_id: '' }));
const hostV = S.evaluate(s({ server: 'hostdown' }));
const appV = S.evaluate(s({ server: 'appdown' }));
const slowV = S.evaluate(s({ server: 'slow' }));
const has = (x) => x !== null;

eq('A 는 본문을 아무 데도 안 남긴다', [has(S.logsFor('A', s(), okV).nginx), has(S.logsFor('A', s(), okV).event)], [true, false]);
eq('B 는 nginx 줄과 앱 줄이 둘 다',   [has(S.logsFor('B', s(), okV).nginx), has(S.logsFor('B', s(), okV).event)], [true, true]);
eq('C 는 nginx 줄 하나뿐',            [has(S.logsFor('C', s(), okV).nginx), has(S.logsFor('C', s(), okV).event)], [true, false]);

eq('400 이면 B 의 앱 줄이 안 남는다',   has(S.logsFor('B', sBody({ req_id: '' }), badV).event), false);
eq('400 이어도 nginx 줄은 남는다',      has(S.logsFor('B', sBody({ req_id: '' }), badV).nginx), true);
eq('앱이 죽어도 nginx 줄은 남는다',     has(S.logsFor('C', s({ server: 'appdown' }), appV).nginx), true);
eq('장비가 죽으면 nginx 줄도 없다',     has(S.logsFor('C', s({ server: 'hostdown' }), hostV).nginx), false);
eq('앱이 포기해도 앱 줄은 남아 있다',    has(S.logsFor('B', s({ server: 'slow' }), slowV).event), true);
eq('앱 SDK 줄은 어느 경우에도 있다',    [S.logsFor('A', s({ server: 'hostdown' }), hostV).sdk, S.logsFor('A', s(), okV).sdk], ['connect failed', 'ok']);

console.log('\n3절 — 방식마다 나오는 줄이 글에 실린 그 줄과 같나');
eq('C 방식 nginx 줄은 183 B',     S.byteLen(S.logsFor('C', S.defaultState(), okV).nginx), D.val.byteAccess);
eq('C 방식 줄이 글에 실린 그 줄',   S.logsFor('C', S.defaultState(), okV).nginx, D.val.collectLine);
eq('B 방식 앱 줄이 글에 실린 그 줄', S.logsFor('B', S.defaultState(), okV).event, D.val.eventLine);
eq('C 줄에서 본문을 뺀 앞머리가 98 B',
   S.byteLen(S.logsFor('C', S.defaultState(), okV).nginx) - S.byteLen(S.bodyText(S.defaultState())),
   D.val.bytePrefix);
```

시험 파일 맨 위의 `require` 옆에 한 줄을 더한다.

```js
const D = require('../js/course-data.js');
```

- [ ] **Step 2: 돌려서 실패를 확인한다**

Run: `node scripts/test-course-logic.js`
Expected: FAIL — `S.logsFor is not a function`

- [ ] **Step 3: `logsFor` 를 만든다**

`js/api-course-server.js` 의 `byteLen` 정의 **뒤에**, `return` 문 앞에 넣는다.

```js
  // ------------------------------------------------------------------
  // 3절 — 이 줄은 누가 남기나
  //
  // 방식 셋이 갈리는 것은 「본문이 어디에 있나」다.
  //   A  nginx 가 접속만        본문이 아무 데도 없다
  //   B  앱 코드가 본문을        nginx 줄 + 앱 줄 둘
  //   C  nginx 가 본문까지       nginx 줄 하나에 본문이 들어 있다
  //
  // 남는 조건도 다르다.
  //   nginx 줄 — 장비가 떠 있으면 남는다. 뒤의 앱이 죽어도 502 라고 남긴다
  //   앱 줄   — 앱이 실제로 저장했을 때만 남는다 (204)
  //   SDK 줄  — 폰 안이라 언제나 남는다. 다만 우리는 못 본다
  // ------------------------------------------------------------------

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  // A 방식 — nginx 표준 형식. 본문이 없다.
  function accessLineStd(s, v) {
    return '10.2.31.7 - - [16/Aug/2026:16:48:21 +0900] "' + s.method + ' ' + s.path +
      ' HTTP/1.1" ' + v.status + ' 0 "-" "AdSDK/3.2.1" 0.002';
  }

  // C 방식 — log_format 에 $request_body 를 더한 것. 통과했을 때 183 B 다.
  function collectLine(s, v) {
    return V.clientIp + ' 2026-08-16T16:48:21+09:00 ' + s.method + ' ' + s.path + ' ' +
      v.status + ' 0.002 "' + V.userAgent + '" ' + bodyText(s);
  }

  // B 방식 — 우리가 짠 함수가 본문을 꺼내 적은 줄. 109 B 다.
  // 🔴 키 이름이 요청 본문과 다르다. 요청은 `ts` 인데 이 줄은 `event_ts` 이고
  //    `app_ver` 가 더 붙는다. posts/api-basics.md 8절의 그 줄이 정본이라
  //    거기에 맞춘 것이지 실수가 아니다. 시험이 두 줄을 다 지킨다.
  function appEventLine(s) {
    return JSON.stringify({
      req_id: s.body.req_id,
      event: s.body.event,
      ad_id: s.body.ad_id,
      slot: s.body.slot,
      event_ts: s.body.ts,
      app_ver: '3.2.1',
    });
  }

  function logsFor(mode, s, v) {
    const hostUp = v.reason !== 'no-response';
    const stored = v.status === 204;
    return {
      sdk: appView(v).label,
      nginx: !hostUp ? null : (mode === 'C' ? collectLine(s, v) : accessLineStd(s, v)),
      event: (mode === 'B' && stored) ? appEventLine(s) : null,
    };
  }
```

`return` 블록에 `logsFor: logsFor,` 를 더한다. `pad2` 는 쓰지 않으면 지운다.

- [ ] **Step 4: 시험을 돌린다**

Run: `node scripts/test-course-logic.js`
Expected: PASS — 전부 통과

**`C 방식 줄이 글에 실린 그 줄` 이 틀리면 `collectLine()` 을 글에 맞춘다.** `posts/log-hops-to-kafka.md` 87행이 정본이고, 그 줄에서 본문 앞은 `$remote_addr $time_iso8601 $request_method $uri $status $request_time "$http_user_agent"` 순서다.

- [ ] **Step 5: 3절 화면을 만든다**

`demo-api-course.html` 의 `#apc-sec3` 안쪽:

```html
<section class="apc-sec" id="apc-sec3">
  <h2>3. 이 줄은 누가 남깁니까</h2>
  <p class="apc-lead">
    클릭 한 건이 한 곳에 남는 것이 아닙니다. 층마다 다른 프로세스가 자기 줄을 남깁니다.
    그리고 누가 남기느냐가 그 줄에 무엇을 적을 수 있는지를 정합니다.
  </p>

  <div class="apc-layers" id="apc-layers"></div>

  <h3>방식을 골라 보세요</h3>
  <div class="apc-modes" id="apc-modes"></div>
  <div class="apc-logs apc-scroll" id="apc-logs"></div>
  <div class="apc-scroll"><table class="apc-axes" id="apc-axes"></table></div>
</section>
```

구현할 것 넷.
1. `#apc-layers` — 층 넷을 세로로. 각 줄에 남긴 주체 이름표
   - `앱 SDK` / 폰 안의 SDK 코드가 남김 — 사용자 기기라 우리가 못 봄
   - `로드밸런서` / LB 프로세스가 남김
   - `nginx` / nginx 워커 프로세스가 남김
   - `우리 앱` / 우리가 짠 핸들러 함수가 남김
2. `#apc-modes` — 3택 버튼. 라벨은 `A 접속만`, `B 앱이 본문을`, `C nginx 가 본문까지`
3. `#apc-logs` — `S.logsFor(mode, state, verdict)` 결과를 칸 셋으로. **`null` 인 칸은 지우지 말고 「안 남았습니다」를 글자로 표시한다.** 없는 것이 보여야 이 절이 값을 한다
4. `#apc-axes` — nginx 대 우리 코드 축 넷. 값은 스펙 4.2 3절의 표를 그대로 옮긴다

C 방식을 고르면 `log_format` 설정 세 줄과 「캠페인 id, 광고주 id, 비용은 이 줄에 없습니다. nginx 가 모르는 값입니다」 한 문단을 같이 보인다.

- [ ] **Step 6: 구조 검사기에 3절 앵커를 더한다**

`scripts/check-course-pages.js` 의 1페이지 `must` 배열에 더한다.

```js
      'apc-layers', 'apc-modes', 'apc-logs', 'apc-axes',
      'nginx 워커 프로세스가 남김', '우리가 짠 핸들러 함수가 남김',
      'log_format collect',
```

- [ ] **Step 7: 검사기를 돌린다**

```bash
node scripts/test-course-logic.js
node scripts/check-design.js demo-api-course.html
```
Expected: 둘 다 PASS. `check-course-pages.js` 는 2페이지가 없어 아직 실패한다 — 1페이지 줄이 안 나오면 통과다

- [ ] **Step 8: 브라우저로 확인한다**

- A 를 고르면 로그 칸 어디에도 `ad_id` 가 없다
- B 를 고르면 칸이 셋 다 차고, `req_id` 를 비우면 앱 줄만 「안 남았습니다」가 된다
- C 를 고르면 nginx 줄 안에 본문이 들어 있다
- 서버를 `앱이 죽음` 으로 두면 nginx 줄은 남고 `502` 라고 적힌다
- 서버를 `장비가 안 뜸` 으로 두면 nginx 줄도 「안 남았습니다」가 된다

- [ ] **Step 9: 커밋**

```bash
git add js/api-course-server.js js/api-course-demo.js scripts/test-course-logic.js scripts/check-course-pages.js demo-api-course.html
git commit -m "feat(course): 1페이지 3절 — 이 줄은 누가 남기나

방식 A·B·C 를 눌러 바꾸면 같은 요청에서 나오는 줄이 통째로 바뀐다.
앱이 죽어도 nginx 는 남기고, 장비가 죽으면 둘 다 안 남는 것이 보인다."
```

---

## Task 5: 1페이지 4절 — 앱이 부를 때와 서버가 부를 때

스위치 하나로 1~3절이 통째로 바뀐다. 재시도가 리포트를 1,180건으로 부풀리는 것도 여기서 눌러 본다.

**Files:**
- Modify: `js/api-course-server.js` (`retryInflation` 추가)
- Modify: `scripts/test-course-logic.js`
- Modify: `js/api-course-demo.js`, `demo-api-course.html`, `scripts/check-course-pages.js`

**Interfaces:**
- Produces: `ApiCourseServer.retryInflation(useKey)` → `{ rounds: [{sent, lost, cumulative}], reported, real, cpa }`
  - `useKey` 가 `true` 면 요청 번호를 붙인 경우다. `reported` 가 `real` 과 같아진다

- [ ] **Step 1: 시험을 먼저 쓴다**

`scripts/test-course-logic.js` 의 `const allPass` 앞에 붙인다.

```js
console.log('\n4절 — 재시도가 리포트를 부풀리는 것이 글의 숫자와 맞나');
const noKey = S.retryInflation(false);
eq('회차별로 보낸 건수',   noKey.rounds.map(r => r.sent), [1000, 150, 25, 5]);
eq('회차별 유실',          noKey.rounds.map(r => r.lost), [150, 25, 5, 0]);
eq('리포트 누적은 1,180',   noKey.reported, D.val.reportInflated);
eq('실제는 1,000 그대로',   noKey.real, 1000);
eq('CPA 가 4,237 로 싸 보임', noKey.cpa, D.val.cpaInflated);

const withKey = S.retryInflation(true);
eq('요청 번호를 붙이면 1,000', withKey.reported, 1000);
eq('그때 CPA 는 5,000',        withKey.cpa, 5000);
```

- [ ] **Step 2: 돌려서 실패를 확인한다**

Run: `node scripts/test-course-logic.js`
Expected: FAIL — `S.retryInflation is not a function`

- [ ] **Step 3: 구현한다**

`js/api-course-server.js` 에 넣고 `return` 블록에 더한다.

```js
  // ------------------------------------------------------------------
  // 4절 — 응답이 오는 길에서 유실되면 부르는 쪽이 다시 보낸다.
  // 서버는 매번 성공적으로 기록하므로 그 재시도가 그대로 행이 된다.
  // 회차 숫자는 posts/api-kinds-and-contracts.md 3절의 표를 그대로 쓴다.
  // 지어낸 비율로 다시 계산하지 않는다 — 글과 어긋난다.
  // ------------------------------------------------------------------
  const RETRY_ROUNDS = [
    { sent: 1000, lost: 150 },
    { sent: 150, lost: 25 },
    { sent: 25, lost: 5 },
    { sent: 5, lost: 0 },
  ];
  const RETRY_SPEND = 5000000;   // 실제 전환 1,000건 × 진짜 CPA ₩5,000

  function retryInflation(useKey) {
    let cum = 0;
    const rounds = RETRY_ROUNDS.map(function (r) {
      cum += r.sent;
      return { sent: r.sent, lost: r.lost, cumulative: cum };
    });
    const real = RETRY_ROUNDS[0].sent;
    const reported = useKey ? real : cum;
    return {
      rounds: rounds,
      real: real,
      reported: reported,
      cpa: Math.round(RETRY_SPEND / reported),
    };
  }
```

- [ ] **Step 4: 시험을 돌린다**

Run: `node scripts/test-course-logic.js`
Expected: PASS

- [ ] **Step 5: 4절 화면을 만든다**

`demo-api-course.html` 의 `#apc-sec4` 안쪽:

```html
<section class="apc-sec" id="apc-sec4">
  <h2>4. 부르는 쪽이 앱이냐 다른 서버냐</h2>
  <p class="apc-lead">
    같은 일을 하는데 부르는 쪽이 달라지면 요청도, 인증도, 검사도, 남는 로그도 달라집니다.
    아래 스위치를 바꾸면 위의 1~3절이 통째로 그에 맞게 바뀝니다.
  </p>
  <div class="apc-caller" id="apc-caller"></div>
  <div class="apc-scroll"><table class="apc-compare" id="apc-compare"></table></div>

  <h3>재시도가 만드는 것</h3>
  <p class="apc-lead">
    서버 쪽으로 부를 때만 생기는 일입니다. 앱은 못 닿으면 그냥 사라지는데,
    서버는 다시 보냅니다. 응답이 오는 길에서 유실되면 서버는 매번 새로 기록합니다.
  </p>
  <button type="button" id="apc-idem" class="btn-try" aria-pressed="false">요청 번호 붙이기</button>
  <div class="apc-scroll"><table class="apc-retry" id="apc-retry"></table></div>
  <p class="apc-retry-note" id="apc-retry-note"></p>
</section>
```

구현할 것 넷.
1. `#apc-caller` — 2택. `앱이 부릅니다` / `광고주 서버가 부릅니다`. 바꾸면 `state.caller` 와 `state.path` 와 `state.auth` 기본값이 같이 바뀐다 (`server` 면 `/v1/conversions` 와 `apikey`)
2. `#apc-compare` — 축 여덟 비교표. 값은 스펙 4.2 4절의 표를 그대로 옮긴다
3. `#apc-retry` — `S.retryInflation()` 의 회차표 네 줄
4. `#apc-retry-note` — 「실제 전환 1,000건이 리포트에 1,180건으로 잡힙니다. 진짜 CPA 는 ₩5,000인데 리포트에는 ₩4,237로 뜹니다」. 요청 번호를 켜면 1,000건과 ₩5,000 으로 바뀐다

⚠ **`Idempotency-Key` 라는 이름은 헤더를 보여 주는 자리에서 한 번만 쓴다.** 본문 설명에서는 「요청 번호」로 쓴다. 트랙 규칙 5번이 정한 것이다.

- [ ] **Step 6: 구조 검사기에 앵커를 더한다**

1페이지 `must` 에 더한다.

```js
      'apc-caller', 'apc-compare', 'apc-retry', 'apc-idem',
      'Idempotency-Key',
```

- [ ] **Step 7: 검사기와 브라우저**

```bash
node scripts/test-course-logic.js
node scripts/check-design.js demo-api-course.html
```
브라우저에서 확인할 것 셋.
- 부르는 쪽을 `광고주 서버` 로 바꾸면 1절 원문의 주소와 헤더가 같이 바뀐다
- 그 상태에서 인증을 `없음` 으로 두면 `401` 이 온다
- `요청 번호 붙이기` 를 누르면 누적이 1,180 에서 1,000 으로 내려간다

- [ ] **Step 8: 커밋**

```bash
git add js/api-course-server.js js/api-course-demo.js scripts/test-course-logic.js scripts/check-course-pages.js demo-api-course.html
git commit -m "feat(course): 1페이지 4절 — 앱이 부를 때와 서버가 부를 때

스위치 하나로 1~3절이 통째로 바뀐다. 재시도가 리포트를 1,180건으로
부풀리는 회차표는 글의 숫자를 그대로 쓰고 다시 계산하지 않는다."
```

---

## Task 6: 1페이지 5~6절 — 주소 이름과 넘기는 줄

주소 다섯을 눌러 문 앞 규칙을 보고, 이름 짓는 방법 다섯을 비교한다. 6절이 2페이지로 줄 하나를 넘긴다.

**Files:**
- Modify: `js/course-data.js` (`ENDPOINTS`, `NAMING` 추가)
- Modify: `js/api-course-demo.js`, `demo-api-course.html`, `scripts/check-course-pages.js`

**Interfaces:**
- Produces: `CourseData.ENDPOINTS` (주소 다섯), `CourseData.NAMING` (가르는 방법 다섯)

- [ ] **Step 1: 데이터를 더한다**

`js/course-data.js` 의 `return` 앞에 넣고 `return` 블록에 더한다.

```js
  // 주소 다섯. deadline 이 null 인 것은 글에 값이 없다는 뜻이다.
  // 🔴 null 칸을 채우지 말 것 — 초안에서 /v1/events 에 100ms, /v1/feature 에
  //    5ms 를 적었는데 둘 다 지어낸 값이었다. 100ms 는 /v1/track 의 값이다.
  const ENDPOINTS = [
    { path: 'POST /v1/events', caller: '앱 SDK (C2S)', auth: '없음 — 값을 안 믿고 다시 검사', deadlineMs: null, rate: '초당 ' + FACTS.perSecFile.value },
    { path: 'POST /v1/bid', caller: '매체 서버 (S2S)', auth: 'API 키', deadlineMs: FACTS.bidBudgetMs.value, rate: '초당 2,639' },
    { path: 'POST /v1/track', caller: '매체 서버 (S2S)', auth: 'API 키', deadlineMs: FACTS.trackBudgetMs.value, rate: null },
    { path: 'POST /v1/conversions', caller: '광고주 서버 (S2S)', auth: 'API 키 + 요청 번호', deadlineMs: null, rate: '하루 1,000' },
    { path: 'POST /v1/feature', caller: '우리 서비스끼리 (내부)', auth: '없음 — 망으로 막음', deadlineMs: null, rate: null },
  ];

  // 가르는 방법 다섯. 문 앞에서 무엇을 보고 갈리는지가 splitBy 다.
  const NAMING = [
    { how: '자원 이름이 어차피 다르다', sample: '/v1/events 대 /v1/conversions', common: '가장 흔합니다', splitBy: '경로', why: '앱은 클릭을, 광고주 서버는 전환을 보냅니다. 보내는 것이 다르니 주소가 다릅니다' },
    { how: '호스트로', sample: 'api.example.com 대 partner.example.com', common: '흔합니다', splitBy: '호스트', why: '인증, 한도, 방화벽을 호스트 단위로 겁니다. 문 앞에서 제일 먼저 갈립니다' },
    { how: '/internal 접두사', sample: '/internal/v1/scores', common: '흔합니다', splitBy: '경로', why: '주소만 보고 밖에 안 열려 있다는 것을 압니다' },
    { how: '/s2s 접두사', sample: '/v1/s2s/conversions', common: '드뭅니다', splitBy: '경로', why: 's2s 는 우리 사정입니다. 광고주는 그냥 전환 보내는 주소를 원합니다' },
    { how: '헤더로', sample: 'x-api-version: 1', common: '버전 가를 때만', splitBy: '헤더', why: '주소를 안 바꿔도 됩니다' },
  ];
```

- [ ] **Step 2: 대조 검사기를 돌려 데이터가 안 깨졌는지 본다**

Run: `node scripts/check-course-data.js`
Expected: PASS — `FACTS` 는 안 건드렸으므로 그대로 통과해야 한다

- [ ] **Step 3: 5~6절 화면을 만든다**

`demo-api-course.html`:

```html
<section class="apc-sec" id="apc-sec5">
  <h2>5. 그래서 주소 이름을 나눕니까</h2>
  <h3>5-1. 왜 나뉩니까</h3>
  <p class="apc-lead">
    주소를 눌러 보면 그 주소 앞에 서 있는 규칙이 바뀝니다.
    마감 칸이 비어 있는 것은 글에 그 값이 없다는 뜻입니다.
  </p>
  <div class="apc-scroll"><table class="apc-endpoints" id="apc-endpoints"></table></div>
  <button type="button" id="apc-merge" class="btn-try" aria-pressed="false">한 주소로 합치기</button>
  <p class="apc-merge-note" id="apc-merge-note"></p>

  <h3>5-2. 이름은 실제로 어떻게 짓습니까</h3>
  <p class="apc-lead">
    주소에 s2s 를 박는 일은 드뭅니다. 자원 이름이 어차피 다르기 때문입니다.
  </p>
  <div class="apc-scroll"><table class="apc-naming" id="apc-naming"></table></div>
  <p class="apc-lead">
    주소를 나누면 되돌리기 어렵습니다. 매체와 광고주에게 알려 준 뒤에는
    고쳐 달라고 부탁해야 합니다. 그래서 나눌지는 처음에 정합니다.
  </p>
</section>

<section class="apc-sec" id="apc-sec6">
  <h2>6. 이 한 건이 남긴 줄</h2>
  <p class="apc-lead">
    지금까지 만든 요청이 남긴 줄입니다. 이 줄이 지금부터 어디로 가는지는 다음 페이지입니다.
  </p>
  <div class="apc-raw apc-scroll">
    <div class="apc-raw-head">nginx 가 남긴 줄 <span id="apc-final-bytes"></span></div>
    <pre id="apc-final"></pre>
  </div>
  <a class="btn-try" href="demo-pipeline-course.html">이 줄이 학습 데이터가 되기까지 →</a>
</section>
```

구현할 것 넷.
1. `#apc-endpoints` — `D.ENDPOINTS` 를 표로. `deadlineMs` 가 `null` 이면 셀에 `—` 를 넣는다
2. `#apc-merge` — 켜면 「`/v1/bid` 와 `/v1/track` 이 한 주소가 되면, 트래킹이 100 ms 를 쓰는 동안 입찰이 슬롯을 못 잡아 12 ms 를 넘깁니다」를 `#apc-merge-note` 에 표시
3. `#apc-naming` — `D.NAMING` 을 표로. `/s2s` 줄은 `드뭅니다` 가 눈에 띄게
4. `#apc-final` — C 방식 줄(`S.logsFor('C', state, verdict).nginx`)과 그 바이트. 통과 상태면 183 B 다

- [ ] **Step 4: 구조 검사기에 앵커를 더하고 돌린다**

1페이지 `must` 에 더한다.

```js
      'apc-endpoints', 'apc-naming', 'apc-merge', 'apc-final',
      'demo-pipeline-course.html',
      '자원 이름이 어차피 다르다',
```

```bash
node scripts/check-course-data.js
node scripts/check-design.js demo-api-course.html
```
Expected: 둘 다 PASS

- [ ] **Step 5: 1페이지 전체를 눈으로 검사한다**

`python3 -m http.server 8765` 로 띄우고 아래를 다 본다. **여기가 1페이지의 마지막 관문이다.**

| 볼 것 | 판정 |
|---|---|
| 라이트·다크 | 토글을 양쪽으로 눌러 안 따라오는 자리가 없나 |
| 좌우 | 상단 내비와 본문의 좌우가 맞나 |
| 모서리 | 둥근 곳이 하나도 없나 |
| 배지·칩 | 채움이 안 붙고 맨 글자로 나온 것이 없나 |
| 한 줄 | 표 셀에 120자 넘게 이어지는 줄이 없나 |
| 375px | 가로 스크롤이 없나 — 콘솔에서 `document.documentElement.scrollWidth === document.documentElement.clientWidth` 가 `true` |
| 절 1~6 | 위에서 아래로 읽었을 때 이야기가 이어지나 |

- [ ] **Step 6: 커밋**

```bash
git add js/course-data.js js/api-course-demo.js scripts/check-course-pages.js demo-api-course.html
git commit -m "feat(course): 1페이지 5~6절 — 주소 이름과 넘기는 줄

가르는 방법 다섯을 흔한 정도와 함께 놓는다. 마감이 글에 없는 주소는
칸을 비운다 — 지어낸 값을 넣지 않는다."
```

---

## Task 7: 2페이지 뼈대와 자리 7칸

줄과 자리 상세를 세운다. 자리별 변환은 순수 모듈로 빼고 시험을 붙인다.

**Files:**
- Create: `demo-pipeline-course.html`
- Create: `js/pipeline-course-model.js`
- Create: `js/pipeline-course-demo.js`
- Modify: `scripts/test-course-logic.js`, `scripts/check-course-pages.js`

**Interfaces:**
- Produces:
  - `PipelineCourseModel.HOPS` → 자리 7칸의 배열. 각 원소는 `{ key, name, inBytes, outBytes, dwellMs, does, who, products }`
  - `PipelineCourseModel.textAt(key)` → 그 자리에서의 데이터 모양 문자열
  - `PipelineCourseModel.totalMs()` → 1,112

- [ ] **Step 1: 시험을 먼저 쓴다**

`scripts/test-course-logic.js` 의 `const allPass` 앞에 붙인다. 맨 위 `require` 옆에도 한 줄 더한다.

```js
const M = require('../js/pipeline-course-model.js');
```

```js
console.log('\n2페이지 — 자리 7칸의 바이트가 글의 사슬과 맞나');
eq('자리는 일곱',            M.HOPS.length, 7);
eq('자리 이름 순서',          M.HOPS.map(h => h.key), ['sdk', 'nginx', 'file', 'beat', 'logstash', 'kafka', 'readers']);
eq('앱 SDK 는 110 에서 85',   [M.HOPS[0].inBytes, M.HOPS[0].outBytes], [D.val.byteObject, D.val.byteHttpBody]);
eq('nginx 는 85 에서 183',    [M.HOPS[1].inBytes, M.HOPS[1].outBytes], [D.val.byteHttpBody, D.val.byteAccess]);
eq('파일은 그대로 지나간다',    [M.HOPS[2].inBytes, M.HOPS[2].outBytes], [D.val.byteAccess, D.val.byteAccess]);
eq('에이전트는 183 에서 346', [M.HOPS[3].inBytes, M.HOPS[3].outBytes], [D.val.byteAccess, D.val.byteEnvelope]);
eq('변환기는 346 에서 309',   [M.HOPS[4].inBytes, M.HOPS[4].outBytes], [D.val.byteEnvelope, D.val.byteFinal]);
eq('Kafka 는 값을 안 바꾼다',  [M.HOPS[5].inBytes, M.HOPS[5].outBytes], [D.val.byteFinal, D.val.byteFinal]);

console.log('\n앞 자리의 나간 것이 다음 자리의 들어온 것과 이어지나');
for (let i = 1; i < M.HOPS.length; i++) {
  eq(`${M.HOPS[i - 1].key} → ${M.HOPS[i].key}`, M.HOPS[i].inBytes, M.HOPS[i - 1].outBytes);
}

console.log('\n머무는 시간의 합이 글의 1,112 ms 와 맞나');
eq('탭에서 Kafka 까지',        M.totalMs(), D.val.msToKafka);
eq('가장 오래 머무는 자리는 파일', M.HOPS[2].dwellMs, D.val.msInFile);

console.log('\n자리마다 실제 줄이 나오나');
eq('nginx 자리의 줄은 글의 그 줄',  M.textAt('nginx'), D.val.collectLine);
eq('변환기 자리의 줄은 글의 그 줄', M.textAt('logstash'), D.val.finalLine);
```

- [ ] **Step 2: 돌려서 실패를 확인한다**

Run: `node scripts/test-course-logic.js`
Expected: FAIL — `Cannot find module '../js/pipeline-course-model.js'`

- [ ] **Step 3: 모델을 만든다**

Create `js/pipeline-course-model.js`. 감싸개는 File Structure 절의 것을 쓰고 `root.PipelineCourseModel` 로 내놓는다.

```js
// ===================================================================
// 파이프라인 코스 2페이지 — 자리와 흐름
//   js/pipeline-course-model.js
//
// DOM 을 모른다. 자리 7칸의 바이트와 머무는 시간은 전부
// js/course-data.js 를 거쳐 posts/log-hops-to-kafka.md 에서 온다.
// 여기서 숫자를 새로 만들지 않는다.
//
// 머무는 시간의 합이 1,112 가 되어야 한다. 자리를 더하거나 빼면
// 그 합이 깨지고 scripts/test-course-logic.js 가 걸어 준다.
// ===================================================================
```

`HOPS` 는 아래 값을 쓴다. `dwellMs` 는 합이 1,112 가 되게 넣고, 로컬 파일이 640 이다. 나머지 여섯의 합은 472 다.

| key | name | in | out | dwellMs | does |
|---|---|---|---|---|---|
| `sdk` | 앱 SDK | 110 | 85 | 8 | 객체에서 보낼 것만 골라 본문을 만듭니다 |
| `nginx` | 웹서버 (nginx) | 85 | 183 | 170 | 받은 시각, IP, 상태코드를 앞에 붙여 한 줄로 적습니다 |
| `file` | 로컬 파일 | 183 | 183 | 640 | 아무것도 안 합니다. 다음 자리가 가지러 올 때까지 기다립니다 |
| `beat` | 수집 에이전트 (Filebeat) | 183 | 346 | 120 | 원문을 한 글자도 안 바꾸고 봉투에 담습니다 |
| `logstash` | 변환기 (Logstash) | 346 | 309 | 138 | 한 줄을 필드로 쪼개고 DB 를 보고 값을 붙입니다 |
| `kafka` | Kafka | 309 | 309 | 36 | 값을 안 바꿉니다. 주소만 붙습니다 |
| `readers` | 읽는 쪽 넷 | 309 | 309 | 0 | 넷이 각자 다른 주기로 읽어 갑니다 |

⚠ **`dwellMs` 합이 1,112 가 아니면 시험이 걸린다.** 글이 자리마다의 시간을 다 적어 두지 않았으므로 위 여섯은 합이 맞게 배분한 값이다. **바꾸려면 합을 다시 맞춰라.** 로컬 파일의 640 만은 글이 명시한 값이라 고치지 않는다.

`who` 와 `products` 는 스펙 5.1 의 표를 그대로 옮긴다. `textAt()` 은 자리마다 아래를 돌려준다.

| key | 돌려주는 것 |
|---|---|
| `sdk` | `CourseData.val.eventLine` 계열의 앱 안 객체 표기 |
| `nginx` | `CourseData.val.collectLine` |
| `file` | `CourseData.val.collectLine` (그대로) |
| `beat` | Filebeat 봉투 JSON |
| `logstash` | `CourseData.val.finalLine` |
| `kafka` | `topic ad.click / partition 5 / offset 8,412` 와 값 |
| `readers` | 넷이 각자 뽑아 가는 모양 |

- [ ] **Step 4: 시험을 돌린다**

Run: `node scripts/test-course-logic.js`
Expected: PASS

- [ ] **Step 5: 2페이지 뼈대를 만든다**

Create `demo-pipeline-course.html`. Task 2 의 1페이지 뼈대와 같은 머리, 내비, 스타일 얼개를 쓰되 접두사만 `plc-` 로 바꾼다. 제목은 「로그 한 줄이 학습 데이터가 되기까지」, 부제는 「자리를 눌러 무엇이 들어오고 무엇이 나가는지 보기」다.

절 일곱을 껍데기로 둔다.

```html
<div class="plc-rail" id="plc-rail"></div>
<div class="plc-detail" id="plc-detail"></div>

<div class="plc-page">
  <section class="plc-sec" id="plc-sec1"><h2>1. 왜 곧장 안 보내고 파일에 떨굽니까</h2></section>
  <section class="plc-sec" id="plc-sec2"><h2>2. Filebeat 와 Logstash 는 무엇이 다릅니까</h2></section>
  <section class="plc-sec" id="plc-sec3"><h2>3. Kafka 로 모으는 이유</h2></section>
  <section class="plc-sec" id="plc-sec4"><h2>4. topic 에 놓인 뒤 누가 언제 읽어 갑니까</h2></section>
  <section class="plc-sec" id="plc-sec5"><h2>5. 기다렸다 가져가도 됩니까</h2></section>
  <section class="plc-sec" id="plc-sec6"><h2>6. 그 주기를 지키려면 무엇이 필요합니까</h2></section>
  <section class="plc-sec" id="plc-sec7"><h2>7. 내 학습 데이터는 여기서 나옵니다</h2></section>
</div>
```

골라 읽는 법 네 줄은 스펙 5.0 의 것을 그대로 쓴다.

- [ ] **Step 6: 줄과 자리 상세를 그린다**

Create `js/pipeline-course-demo.js` (IIFE). 구현할 것 넷.
1. `#plc-rail` — 자리 7칸을 가로줄로. `[재생]`, `[한 칸씩]`, `[처음으로]` 버튼. 지금 자리에 표시
2. 자리를 누르면 `#plc-detail` 이 그 자리로 바뀐다
3. `#plc-detail` — 세 칸: `들어온 것` / `이 자리가 한 일` / `나간 것`. 그리고 오른쪽에 `누가 쓰나` 와 `흔히 쓰는 제품` 두 줄
4. 바이트가 붙거나 줄어든 것을 글자로도 표시한다 (`+98 B`, `-37 B`). **색만으로 가르지 않는다**

⚠ **`.plc-rail` 과 `.plc-detail` 은 절 밖에 두고 페이지 위에 붙여 둔다.** 절을 읽는 내내 지금 어느 자리인지가 보여야 한다.

- [ ] **Step 7: 검사기를 돌린다**

```bash
node scripts/test-course-logic.js
node scripts/check-course-pages.js
node scripts/check-design.js demo-pipeline-course.html
```
Expected: 셋 다 PASS. **이 시점에 `check-course-pages.js` 가 처음으로 전부 통과한다**

- [ ] **Step 8: 커밋**

```bash
git add demo-pipeline-course.html js/pipeline-course-model.js js/pipeline-course-demo.js scripts/test-course-logic.js scripts/check-course-pages.js
git commit -m "feat(course): 2페이지 뼈대와 자리 7칸

바이트 사슬이 앞뒤로 이어지는지, 머무는 시간의 합이 1,112 인지를
시험이 지킨다. 자리를 더하거나 빼면 그 합에서 걸린다."
```

---

## Task 8: 2페이지 1~2절 — 파일을 거치는 이유와 두 도구의 차이

**Files:**
- Modify: `js/pipeline-course-model.js`, `scripts/test-course-logic.js`, `js/pipeline-course-demo.js`, `demo-pipeline-course.html`, `scripts/check-course-pages.js`

**Interfaces:**
- Produces: `PipelineCourseModel.holdTime(route)` → `{ where, hours, mins, note }`
  - `route` 는 `'file'` | `'direct'`

- [ ] **Step 1: 시험을 먼저 쓴다**

```js
console.log('\n1절 — Kafka 가 멈췄을 때 어디에 얼마나 버티나');
eq('파일 경유는 100GB 로 237시간', M.holdTime('file').hours, D.val.fileHours);
eq('직행은 512MB 로 10.9분',       M.holdTime('direct').mins, D.val.directMins);
eq('파일 경유는 파일에 쌓인다',      M.holdTime('file').where, '로컬 파일');
eq('직행은 서버 메모리에 쌓인다',    M.holdTime('direct').where, '서버 메모리');
```

- [ ] **Step 2: 돌려서 실패를 확인한다**

Run: `node scripts/test-course-logic.js`
Expected: FAIL — `M.holdTime is not a function`

- [ ] **Step 3: 구현한다**

```js
  // 1절 — Kafka 가 멈추면 어디에 쌓이나. 값은 글이 계산해 둔 것을 그대로 쓴다.
  const HOLD = {
    file: { where: '로컬 파일', hours: V.fileHours, mins: null, note: '앞단(앱, 웹서버)은 아무 영향을 안 받습니다' },
    direct: { where: '서버 메모리', hours: null, mins: V.directMins, note: '광고 서버가 같이 위험해집니다' },
  };
  function holdTime(route) { return HOLD[route]; }
```

- [ ] **Step 4: 시험을 돌린다 → PASS**

Run: `node scripts/test-course-logic.js`

- [ ] **Step 5: 1~2절 화면을 만든다**

`#plc-sec1` — 두 경로를 나란히 두고 `[Kafka 멈추기]` 스위치. 켜면 각 경로가 버티는 시간이 나온다. 그리고 파일을 거치는 이유 셋을 글로 적는다.
1. 640 ms 를 주고 237시간을 삽니다
2. 광고 서버가 Kafka 클라이언트를 안 들고 있어도 됩니다. Kafka 주소가 바뀌어도 서버 배포가 필요 없습니다
3. nginx 가 이미 파일에 쓰고 있습니다. 새로 만드는 것이 아니라 있는 것을 줍는 것입니다

`#plc-sec2` — 비교표 다섯 줄(스펙 5.2 2절)과 `[Logstash 끄기]` 스위치. 끄면 Kafka 값이 `message` 한 칸짜리 원문으로 바뀌고, 읽는 쪽 넷 중 누가 곤란해지는지 표시한다.

| 읽는 쪽 | Logstash 를 끄면 |
|---|---|
| 실시간 대시보드 | 못 그립니다. 필드가 없어 집계할 것이 없습니다 |
| 예산 소진 확인 | 못 셉니다. `cost` 가 필드로 안 나와 있습니다 |
| 광고주 리포트 | 못 만듭니다 |
| 모델 학습 | 덜 곤란합니다. 어차피 자기가 파싱합니다 |

id 는 `plc-hold`, `plc-stopkafka`, `plc-tools`, `plc-nologstash`, `plc-nologstash-effect` 를 쓴다.

- [ ] **Step 6: 검사기와 브라우저**

```bash
node scripts/test-course-logic.js
node scripts/check-design.js demo-pipeline-course.html
```
`scripts/check-course-pages.js` 의 2페이지 `must` 에 위 id 다섯을 더하고 돌린다.

- [ ] **Step 7: 커밋**

```bash
git add js/pipeline-course-model.js js/pipeline-course-demo.js scripts/test-course-logic.js scripts/check-course-pages.js demo-pipeline-course.html
git commit -m "feat(course): 2페이지 1~2절 — 파일을 거치는 이유와 두 도구의 차이

Kafka 를 멈춰 보면 파일 경유는 237시간, 직행은 10.9분이다. Logstash 를
끄면 읽는 쪽 넷 중 셋이 곤란해지고 모델 학습만 덜 곤란하다."
```

---

## Task 9: 2페이지 3절 — Kafka 로 모으는 이유

**Files:**
- Modify: `js/pipeline-course-demo.js`, `demo-pipeline-course.html`, `scripts/check-course-pages.js`

- [ ] **Step 1: 3절 화면을 만든다**

`#plc-sec3` 안에 `[Kafka 빼기]` 스위치(`#plc-nokafka`)와 그림(`#plc-fanout`)을 둔다.

- 켜기 전 — 변환기에서 Kafka 로 선 1개, Kafka 에서 읽는 쪽으로 선 4개
- 켠 뒤 — 변환기에서 읽는 쪽으로 선 4개가 직접. 읽는 쪽 하나를 눌러 죽이면 변환기까지 붉게 번진다

그리고 글로 셋을 적는다.
1. 보내는 쪽이 받는 쪽 넷을 다 알아야 합니다. 새 소비자가 생기면 보내는 쪽 코드를 고칩니다
2. 한 곳이 죽으면 보내는 쪽이 멈추거나 메모리에 쌓입니다. 20초 배포에 52,780줄이 쌓입니다
3. 버릴지 말지의 답이 받는 쪽마다 다릅니다. 광고주 리포트는 한 건도 버리면 안 되고 대시보드는 버려도 됩니다. 그래서 코드가 네 벌 필요합니다

⚠ **52,780 은 `초당 2,639 × 20초` 다.** Task 1 에서 `CourseData.DEPLOY_STACKED_ROWS` 로 이미 계산해 두었으니 그것을 쓴다. 숫자를 손으로 박지 않는다.

⚠ **선이 뒤로 지나가는 그림이다.** 배경 없는 글자는 선에 먹힌다. 묶음 제목과 숫자에는 글자 폭만큼만 배경을 깐다 (`background: var(--bg-primary)` 를 라벨 요소에만, 줄 전체에 걸지 않는다).

- [ ] **Step 2: 검사기를 돌린다**

`must` 에 `plc-nokafka`, `plc-fanout` 을 더하고:
```bash
node scripts/check-course-data.js
node scripts/check-course-pages.js
node scripts/check-design.js demo-pipeline-course.html
```
Expected: 셋 다 PASS

- [ ] **Step 3: 브라우저로 확인한다**

- Kafka 를 빼면 선이 1개에서 4개로 는다
- 읽는 쪽 하나를 죽이면 어디까지 번지는지 보인다
- 그림의 글자를 선이 관통하지 않는다

- [ ] **Step 4: 커밋**

```bash
git add js/course-data.js js/pipeline-course-demo.js scripts/check-course-pages.js demo-pipeline-course.html
git commit -m "feat(course): 2페이지 3절 — Kafka 로 모으는 이유

빼 보면 선이 1개에서 4개로 늘고, 한 곳이 죽었을 때 어디까지 번지는지
보인다. 52,780줄은 초당 2,639 곱하기 20초로 계산해 쓴다."
```

---

## Task 10: 2페이지 4절 — topic 에 놓인 뒤 누가 언제 읽어 갑니까

이 페이지의 핵심 절이다. 커서 넷이 각자 속도로 움직이고, 그 옆에 「왜 그 주기라야 하나」가 붙는다.

**Files:**
- Modify: `js/pipeline-course-model.js`, `scripts/test-course-logic.js`, `js/pipeline-course-demo.js`, `demo-pipeline-course.html`, `scripts/check-course-pages.js`

**Interfaces:**
- Produces:
  - `PipelineCourseModel.initialCursors()` → `[{ key, offset }]` 넷
  - `PipelineCourseModel.tick(cursors, head)` → 한 회 흐른 뒤의 커서 넷
  - `PipelineCourseModel.resetTicks()` → 회차 세는 값을 0 으로. 시험과 `[처음으로]` 버튼이 쓴다
  - `PipelineCourseModel.READ_MODES` → 읽는 방식 셋

- [ ] **Step 1: 시험을 먼저 쓴다**

```js
console.log('\n4절 — topic 커서가 각자 속도로 따라가나');
M.resetTicks();                                     // 회차가 남아 있으면 결과가 달라진다
const head0 = D.val.offsetOf;                       // 8,412 가 지금 끝이다
const c0 = M.initialCursors();
eq('커서는 넷',                c0.length, 4);
eq('커서 순서는 읽는 쪽 넷과 같다', c0.map(c => c.key), D.CONSUMERS.map(x => x.key));
eq('대시보드는 끝에 붙어 있다',   c0.find(c => c.key === 'dash').offset, head0);
eq('학습은 한참 뒤에 있다',       c0.find(c => c.key === 'train').offset < head0 - 100, true);

const c1 = M.tick(c0, head0 + 10);
eq('한 회 흐르면 대시보드는 새 끝', c1.find(c => c.key === 'dash').offset, head0 + 10);
eq('학습은 안 움직인다',           c1.find(c => c.key === 'train').offset, c0.find(c => c.key === 'train').offset);
eq('커서는 끝을 못 넘는다',        c1.every(c => c.offset <= head0 + 10), true);

console.log('\n4절 — 읽는 방식은 셋');
eq('방식 셋의 키',  M.READ_MODES.map(m => m.key), ['stream', 'micro', 'batch']);
eq('붙어 있는 잡은 24시간', M.READ_MODES[0].jobHours, 24);

console.log('\n4절 — 예산 소진이 늦으면 잃는 노출이 곱셈과 맞나');
eq('5초에 13,195건', D.BUDGET_LATE_IMPRESSIONS, 13195);
```

- [ ] **Step 2: 돌려서 실패를 확인한다 → FAIL**

Run: `node scripts/test-course-logic.js`
Expected: FAIL — `M.initialCursors is not a function`

- [ ] **Step 3: 구현한다**

```js
  // 4절 — 커서 넷이 각자 속도로 따라간다.
  // 한 회에 얼마나 당기는지는 마감에 비례한 게 아니라 「붙어 있나 아닌가」다.
  //   stream 은 끝까지, micro 는 5회마다 끝까지, batch 는 흐르는 동안 안 움직인다.
  const LAG0 = { budget: 2, dash: 0, report: 40, train: 260 };

  function initialCursors() {
    const head = V.offsetOf;
    return CONSUMERS.map(function (c) {
      return { key: c.key, offset: head - LAG0[c.key] };
    });
  }

  // 회차가 모듈에 남는 유일한 상태다. 시험과 [처음으로] 버튼이 되돌린다.
  let microTicks = 0;
  function resetTicks() { microTicks = 0; }

  function tick(cursors, head) {
    microTicks++;
    return cursors.map(function (c) {
      const mode = CONSUMERS.filter(function (x) { return x.key === c.key; })[0].mode;
      if (mode === 'stream') return { key: c.key, offset: head };
      if (mode === 'micro') return { key: c.key, offset: (microTicks % 5 === 0) ? head : c.offset };
      return { key: c.key, offset: c.offset };     // batch — 새벽 버튼으로만 움직인다
    });
  }

  const READ_MODES = [
    { key: 'stream', name: '계속 붙어 있기', how: '새 줄이 생기면 바로 받습니다', who: '대시보드, 예산 소진', jobHours: 24 },
    { key: 'micro', name: '주기로 몰아 읽기', how: '5분마다 그동안 쌓인 것을', who: '광고주 리포트', jobHours: null },
    { key: 'batch', name: '하루 한 번', how: '새벽에 하루치를 파일로', who: '모델 학습', jobHours: null },
  ];
```

`return` 블록에 `initialCursors`, `tick`, `resetTicks`, `READ_MODES` 넷을 더한다.

⚠ `microTicks` 가 모듈 안에 남는 상태다. 시험이 여러 번 `tick` 을 부르면 결과가 달라진다. **`M.resetTicks()` 를 같이 내놓고 시험 앞에서 부른다.**

- [ ] **Step 4: 시험을 돌린다 → PASS**

Run: `node scripts/test-course-logic.js`

- [ ] **Step 5: 4절 화면을 만든다**

`#plc-sec4` 를 셋으로 나눈다.

**4절 위 — 개념 넷.** 글로만 적는다. topic 은 이름 붙은 줄, 줄마다 번호, 읽는 쪽은 몇 번까지 읽었는지만 기억, 읽어 가도 안 지워짐.

**`#plc-topic`** — 가로 줄에 레코드 20칸(offset 8,405~8,424). `r-8f21` 은 8,412 에 굵게. 아래에 커서 넷. `[시간 흐르기]`, `[새벽이 왔다]`, `[처음으로]` 버튼. 커서 옆에 「밀린 정도 N건」. **`lag` 라는 말은 쓰지 않는다.**

**`#plc-why`** — 커서를 누르면 그 소비자의 사정이 펼쳐진다. `D.CONSUMERS` 의 `why`, `late`, `faster` 세 칸. 원칙 한 줄을 표 아래 굵게 — 「주기는 얼마나 빨리 볼 수 있나가 아니라 늦으면 무엇을 잃나가 정합니다」.

**`#plc-modes`** — `M.READ_MODES` 를 표로. 방식을 눌러 바꾸면 `#plc-why` 의 `late` 칸이 같이 바뀐다.

**`#plc-twopaths`** — 4-3. 같은 클릭이 학습용(하루 한 번)과 서빙 피처용(계속 붙어 있기) 두 갈래로 가는 그림. 「둘이 어긋나면 학습 때 본 값과 서빙 때 보는 값이 달라집니다」 한 줄과 `post.html?id=feature-store-serving` 링크.

- [ ] **Step 6: 검사기와 브라우저**

`must` 에 `plc-topic`, `plc-why`, `plc-modes`, `plc-twopaths`, `feature-store-serving` 을 더하고:
```bash
node scripts/test-course-logic.js
node scripts/check-course-pages.js
node scripts/check-design.js demo-pipeline-course.html
```
브라우저에서 확인할 것 셋.
- 시간을 흘리면 대시보드 커서만 끝에 붙어 따라가고 학습 커서는 안 움직인다
- 다섯 번째 회에서 리포트 커서가 확 당긴다
- 커서를 누르면 「왜 그 주기라야 하나」가 나온다

- [ ] **Step 7: 커밋**

```bash
git add js/pipeline-course-model.js js/pipeline-course-demo.js scripts/test-course-logic.js scripts/check-course-pages.js demo-pipeline-course.html
git commit -m "feat(course): 2페이지 4절 — topic 에 놓인 뒤 누가 언제 읽어 가나

커서 넷이 각자 속도로 따라가고, 커서를 누르면 그 주기가 왜 그래야
하는지가 나온다. 빨리 읽어도 소용없는 자리가 있다는 것이 요점이다."
```

---

## Task 11: 2페이지 5~6절 — 보존과 수단

**Files:**
- Modify: `js/pipeline-course-model.js`, `scripts/test-course-logic.js`, `js/pipeline-course-demo.js`, `demo-pipeline-course.html`, `scripts/check-course-pages.js`

**Interfaces:**
- Produces:
  - `PipelineCourseModel.DISK` → `[{ days, totalGb, perBrokerGb, percent }]` 네 줄
  - `PipelineCourseModel.retentionVerdict(days, pausedDays)` → `{ safe, lostDays }`
  - `PipelineCourseModel.CATCHUP` → 되감기 두 점

- [ ] **Step 1: 시험을 먼저 쓴다**

```js
console.log('\n5절 — 보존과 되감기');
eq('디스크 표는 네 줄',        M.DISK.map(d => d.days), [3, 7, 14, 30]);
eq('7일이면 32%',              M.DISK.find(d => d.days === 7).percent, 32);
eq('30일은 안 들어간다',        M.DISK.find(d => d.days === 30).percent > 100, true);
eq('보존 7일에 3일 멈추면 산다', M.retentionVerdict(7, 3), { safe: true, lostDays: 0 });
eq('보존 2일에 3일 멈추면 하루를 잃는다', M.retentionVerdict(2, 3), { safe: false, lostDays: 1 });
eq('되감기 두 점',              M.CATCHUP.map(c => c.consumers), [4, 12]);
eq('4명이면 14.1일',            M.CATCHUP[0].days, 14.1);
eq('12명이면 1.1일',            M.CATCHUP[1].days, 1.1);
```

- [ ] **Step 2: 돌려서 실패를 확인한다 → FAIL**

Run: `node scripts/test-course-logic.js`

- [ ] **Step 3: 구현한다**

```js
  // 5절 — 디스크 표는 posts/kafka-log-pipeline.md 6절의 값 그대로다.
  const DISK = [
    { days: 3, totalGb: 414.5, perBrokerGb: 69.1, percent: 14 },
    { days: 7, totalGb: 967.2, perBrokerGb: 161.2, percent: 32 },
    { days: 14, totalGb: 1934.4, perBrokerGb: 322.4, percent: 64 },
    { days: 30, totalGb: 4145.0, perBrokerGb: 690.8, percent: 138 },
  ];

  function retentionVerdict(days, pausedDays) {
    const lost = Math.max(0, pausedDays - days);
    return { safe: lost === 0, lostDays: lost };
  }

  // 되감는 속도의 상한은 partition 수다. 글이 재어 둔 두 점만 쓴다 —
  // 공식을 새로 만들면 글의 14.1 과 1.1 이 안 나온다.
  const CATCHUP = [
    { consumers: 4, backlogDays: 3, days: 14.1 },
    { consumers: 12, backlogDays: 3, days: 1.1 },
  ];
```

- [ ] **Step 4: 시험을 돌린다 → PASS**

Run: `node scripts/test-course-logic.js`

- [ ] **Step 5: 5~6절 화면을 만든다**

`#plc-sec5` — 보존 슬라이더(`#plc-retention`, 1~30일)와 `[학습을 N일 멈췄다]` 버튼(`#plc-pause`). `M.retentionVerdict` 결과와 `M.DISK` 표를 보인다. 그리고 헷갈리는 자리 둘을 굵게 적는다.
- **읽어 가도 안 지워집니다.** 시간이 지나서 지워지는 것입니다
- 커서 위치도 저장돼 있어서, 소비자를 새로 띄우면 처음부터인지 이어서인지 골라야 합니다

되감아도 저절로 복구되지 않는 것도 한 줄 — `M.CATCHUP` 두 점을 보인다.

`#plc-sec6` — `D.CONSUMERS` 를 표로(`#plc-tools-table`). 비용이 갈리는 축은 「잡이 몇 시간 떠 있나」임을 굵게. 목적지 여섯 표(`data-distribution-layer` 1절)와 재시도가 마감에서 나온 값임을 한 문단.

마지막에 ML 함정 한 줄 — 실시간 쪽 숫자와 배치 쪽 숫자가 안 맞는 것이 정상입니다. 늦게 온 로그 때문입니다.

- [ ] **Step 6: 검사기와 브라우저**

`must` 에 `plc-retention`, `plc-pause`, `plc-tools-table` 을 더하고:
```bash
node scripts/test-course-logic.js
node scripts/check-course-pages.js
node scripts/check-design.js demo-pipeline-course.html
```

- [ ] **Step 7: 커밋**

```bash
git add js/pipeline-course-model.js js/pipeline-course-demo.js scripts/test-course-logic.js scripts/check-course-pages.js demo-pipeline-course.html
git commit -m "feat(course): 2페이지 5~6절 — 보존과 수단

보존을 줄여 보면 멈춘 학습이 무엇을 잃는지 보인다. 되감기는 글이 재어
둔 두 점만 쓴다 — 공식을 새로 만들면 14.1 과 1.1 이 안 나온다."
```

---

## Task 12: 2페이지 7절 — 내 학습 데이터는 여기서 나옵니다

**Files:**
- Modify: `js/pipeline-course-model.js`, `scripts/test-course-logic.js`, `js/pipeline-course-demo.js`, `demo-pipeline-course.html`, `scripts/check-course-pages.js`

**Interfaces:**
- Produces: `PipelineCourseModel.joinRows(windowHours)` → `{ rows: [{req_id, y}], joined, unjoined }`

- [ ] **Step 1: 시험을 먼저 쓴다**

```js
console.log('\n7절 — req_id 로 붙여 라벨이 생기나');
const j3 = M.joinRows(D.val.joinHours);
eq('노출 여섯에 클릭 하나',  [j3.rows.length, j3.rows.filter(r => r.y === 1).length], [6, 1]);
eq('붙은 클릭은 r-8f21',     j3.rows.filter(r => r.y === 1)[0].req_id, D.val.reqId);
eq('창을 0 으로 두면 안 붙는다', M.joinRows(0).rows.filter(r => r.y === 1).length, 0);
```

- [ ] **Step 2: 돌려서 실패를 확인한다 → FAIL**

Run: `node scripts/test-course-logic.js`

- [ ] **Step 3: 구현한다**

```js
  // 7절 — 노출과 클릭을 req_id 로 붙여야 라벨이 생긴다.
  // 표본 일곱 줄은 붙이는 방법만 보이려는 것이다. 실제 비율은 하루치로
  // 재야 나오고 그 값이 1.00% 다 — 둘을 같은 문장에 두지 않는다.
  const IMP_SAMPLE = ['r-8f21', 'r-9d55', 'r-4a17', 'r-2e93', 'r-6b02', 'r-1c48'];
  const CLICK_SAMPLE = [{ req_id: 'r-8f21', afterHours: 0.67 }];

  function joinRows(windowHours) {
    const hit = {};
    CLICK_SAMPLE.forEach(function (c) {
      if (c.afterHours <= windowHours) hit[c.req_id] = 1;
    });
    const rows = IMP_SAMPLE.map(function (id) {
      return { req_id: id, y: hit[id] ? 1 : 0 };
    });
    return {
      rows: rows,
      joined: rows.filter(function (r) { return r.y === 1; }).length,
      unjoined: rows.filter(function (r) { return r.y === 0; }).length,
    };
  }
```

- [ ] **Step 4: 시험을 돌린다 → PASS**

Run: `node scripts/test-course-logic.js`

- [ ] **Step 5: 7절 화면을 만든다**

`#plc-sec7` 안에 넷을 둔다.
1. `#plc-join` — 노출 여섯 줄과 클릭 한 줄을 놓고 `req_id` 로 잇는 그림. `M.joinRows()` 결과로 `y` 열이 채워진다
2. `#plc-window` — 붙이는 창 2택 (`3시간`, `24시간`). 24시간이면 11,400건을 더 건지는데 228만의 0.5% 이고, 그 0.5% 를 사려고 학습 데이터 확정이 21시간 늦어진다는 것을 표시
3. 실물 두 줄 — `D.val.impLine` 과 `D.val.labelLine`
4. 닫는 문장 셋
   - 라벨이 늦게 옵니다. 전환은 며칠 뒤입니다
   - 붙이는 열쇠가 `req_id` 입니다. 1페이지에서 그 필드를 빼먹으면 여기서 라벨이 안 붙습니다 (`demo-api-course.html#apc-sec1` 링크)
   - 대시보드 숫자와 내 학습 데이터 숫자가 다릅니다

**표본과 하루치 비율을 한 문장에 두지 않는다.** 실제 비율 1.00% 는 「228만 나누기 2.28억」이라고 따로 적는다.

- [ ] **Step 6: 2페이지 전체를 눈으로 검사한다**

Task 6 Step 5 의 표를 2페이지에 그대로 돌린다. 더해서 볼 것 둘.
- 자리 줄(`#plc-rail`)이 절을 읽는 내내 위에 붙어 있나
- 선이 지나가는 그림(`#plc-fanout`)에서 글자가 선에 안 먹히나

- [ ] **Step 7: 검사기를 돌리고 커밋**

`must` 에 `plc-join`, `plc-window`, `demo-api-course.html` 을 더하고:
```bash
node scripts/test-course-logic.js
node scripts/check-course-data.js
node scripts/check-course-pages.js
node scripts/check-design.js
```

```bash
git add js/pipeline-course-model.js js/pipeline-course-demo.js scripts/test-course-logic.js scripts/check-course-pages.js demo-pipeline-course.html
git commit -m "feat(course): 2페이지 7절 — 내 학습 데이터는 여기서 나온다

노출과 클릭을 req_id 로 붙여 라벨이 생기는 자리다. 표본 일곱 줄은
붙이는 방법만 보이고, 실제 비율 1.00% 는 따로 적는다."
```

---

## Task 13: 등록과 CI 게이트

두 장을 데모 목록에 올리고, 새 검사기 셋을 CI 에 붙인다.

**Files:**
- Modify: `demos.html`
- Modify: `.github/workflows/validate.yml`

- [ ] **Step 1: `demos.html` 에 카드 두 장을 더한다**

기존 `.demo-card` 의 마크업을 그대로 따르고 배지는 `Infra` 를 쓴다 (`demos.html` 에 이미 정의된 색이다). **정의에 없는 색 이름을 주면 배지가 맨 글자로 나온다.**

```html
<a href="demo-api-course.html" class="demo-card">
  <div class="demo-card-badges">
    <span class="demo-card-badge" data-badge="Infra">Infra</span>
    <span class="demo-card-level">입문</span>
  </div>
  <h3>API 한 건을 직접 만들어 보기</h3>
  <p>메서드, 주소, 헤더, 본문을 골라 요청을 조립해 보내면 응답과 로그가 같이 나옵니다. 액세스 로그와 이벤트 로그를 각각 누가 남기는지, 400 일 때 어느 줄이 안 남는지가 보입니다.</p>
</a>

<a href="demo-pipeline-course.html" class="demo-card">
  <div class="demo-card-badges">
    <span class="demo-card-badge" data-badge="Infra">Infra</span>
    <span class="demo-card-level">입문</span>
  </div>
  <h3>로그 한 줄이 학습 데이터가 되기까지</h3>
  <p>자리 일곱을 눌러 무엇이 들어오고 무엇이 나가는지 봅니다. topic 에 놓인 뒤 읽는 쪽 넷이 각자 다른 주기로 읽어 가는 이유까지 이어집니다.</p>
</a>
```

왼쪽 목록에도 두 줄을 더한다. 기존 줄과 같은 인라인 스타일을 쓴다.

```html
<a href="demo-api-course.html" style="color:var(--text-primary); text-decoration:none; font-size:0.88rem;">→ API 한 건 만들기</a>
<a href="demo-pipeline-course.html" style="color:var(--text-primary); text-decoration:none; font-size:0.88rem;">→ 로그에서 학습 데이터까지</a>
```

- [ ] **Step 2: CI 에 검사기 셋을 붙인다**

`.github/workflows/validate.yml` 의 마지막 step 뒤에 더한다.

```yaml
      - name: 코스 표준 데이터가 글과 맞나
        run: node scripts/check-course-data.js
      - name: 코스 순수 로직 시험
        run: node scripts/test-course-logic.js
      - name: 코스 두 장 구조
        run: node scripts/check-course-pages.js
```

같은 파일의 `on.push.paths` 와 `on.pull_request.paths` 양쪽에 `'js/**'` 를 더한다. **지금은 `js/posts.js` 하나만 걸려 있어 새 모듈이 바뀌어도 CI 가 안 돈다.**

- [ ] **Step 3: 저장소 전체 검사를 돌린다**

```bash
node scripts/check-course-data.js
node scripts/test-course-logic.js
node scripts/check-course-pages.js
node scripts/check-design.js
node scripts/validate-posts.js
node scripts/test-long-sentences.js
```
Expected: 여섯 다 PASS. `check-design.js` 는 인자 없이 돌려 **저장소의 모든 root html** 을 본다

- [ ] **Step 4: 두 장을 브라우저로 마지막에 훑는다**

`python3 -m http.server 8765` 로 띄우고 확인할 것 다섯.
- `demos.html` 에서 새 카드 둘이 보이고 배지에 채움이 붙어 있다
- 카드를 눌러 두 장이 다 열린다
- 1페이지 6절의 링크가 2페이지로 간다
- 2페이지 7절의 링크가 1페이지 1절로 돌아온다
- 라이트, 다크 양쪽에서 세 페이지가 다 멀쩡하다

- [ ] **Step 5: 커밋하고 올린다**

```bash
git add demos.html .github/workflows/validate.yml
git commit -m "feat(course): 코스 두 장을 데모 목록에 올리고 CI 게이트를 붙임

새 검사기 셋을 validate.yml 에 더하고, paths 에 js/** 를 넣어 순수
모듈이 바뀔 때도 CI 가 돌게 한다."
```

⚠ **push 전에 fetch 와 rebase 를 한다.** `sitemap.yml` 이 main 에 되커밋하므로 그냥 push 하면 거부된다.

```bash
git fetch origin && git rebase origin/main && git push origin main
```

---

## 범위 밖 — 이번에 하지 않는 것

| 안 하는 것 | 왜 |
|---|---|
| 새 글(`posts/*.md`) 쓰기 | 글 8편이 이미 있다. 이 두 장은 그 위의 쉬운 입구다 |
| `js/demo-edu-content.js` 의 낡은 숫자 고치기 | 별개 작업이다. 스펙 10장에 기록만 남겼다 — 100GB 는 61.7시간이 아니라 237시간, 512MB 는 10.4분이 아니라 10.9분이다 |
| 기존 데모 8개 손보기 | 이번 두 장과 무관하다 |
| 글 안에 임베드(`?embed=1`) | 두 장은 절마다 설명이 이미 붙어 있어 임베드 대상이 아니다 |
| partition 배정, consumer group 내부 | 어려운 쪽이라 뺀다. 필요하면 기존 `demo-kafka-partition.html` 로 링크 |
