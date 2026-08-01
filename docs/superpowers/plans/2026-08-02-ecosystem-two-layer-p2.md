# 블로그 개편 P2 (생태계 2층) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 스펙(`docs/superpowers/specs/2026-08-01-blog-redesign-design.md`) §5 구현 — 생태계 지도를 **거래 층 + 두뇌 층 2층 구조**로 재구성하고, pCTR/pCVR을 심장으로 크게 세우고, 새 대표 흐름 "모델러의 눈으로 보는 0.1초"를 기본 흐름으로 넣는다. P1에서 P2로 이관된 2건(표지 세로연결선 위치, 흐름 칩 딥링크)도 함께 닫는다.

**Architecture:** 기존 SVG 엔진(`js/ecosystem.js`, 메트로 라우팅 + 패킷 애니메이션 + 흐름 상태머신)은 **그대로 두고 데이터만 바꾼다** — `NODES` 좌표 재배치 + 2노드 신설, `EDGES` 5개 추가, `FLOWS`에 흐름 1개 추가, 밴드 배경/라벨. viewBox(1280×700)는 유지.

**핵심 설계 축:** `edgeGeometry()`는 두 노드의 중심 x가 같으면(`Math.abs(ac.x - bc.x) < 1`) **직선 수직 경로**를 만든다. 그래서 `pctr-cvr`의 중심 x를 `dsp`의 중심 x(940)와 정확히 맞춰, "DSP가 두뇌에 묻는다"는 연결선이 곧게 선 한 줄로 그려지게 한다. 이게 2층 문법의 시각적 뼈대다.

**Tech Stack:** vanilla JS · SVG(직접 생성) · CSS 변수 테마 · 빌드 없음

---

## ⚠ 전역 주의사항 (모든 태스크 공통)

1. **`js/main.js`에는 리터럴 NUL 4개**가 있다(preprocessMarkdown 스태시). 이 계획은 main.js를 건드리지 않지만, 검색은 항상 `grep -a`.
2. 편집 후 매번: `node --check js/ecosystem.js` (해당 파일). 
3. 로컬 서버: `python3 -m http.server 8931` (없으면 기동). **캐시 함정**: python http.server는 캐시 헤더가 없어 크롬이 `js/*.js`를 stale로 서빙한다. 페이지 URL에 `?v=N`을 붙이는 것만으로는 **하위 스크립트가 갱신되지 않는다** — Playwright/CDP로 캐시 무효화하거나, 새 브라우저 컨텍스트에서 열거나, 페이지에서 `fetch('js/ecosystem.js',{cache:'reload'})` 후 재탐색할 것.
4. 커밋 identity는 repo-local `chkimsu`. **push는 하지 않는다** (사용자 요청 시에만).
5. 색은 전부 CSS 변수. **액센트 배경 위 텍스트는 `var(--bg-primary)`**, `#fdf9f0` 같은 고정 크림 금지(다크에서 명암비 미달). rgba 합성은 `rgba(var(--accent-primary-rgb), α)`.
6. 애니메이션 추가 시 `@media (prefers-reduced-motion: reduce)`에 `animation: none` 반드시 함께.
7. 좌표를 조정했다면 **최종 좌표를 코드 주석에 남긴다**(다음 사람이 근거를 알 수 있게).

---

## 좌표 설계표 (T1에서 사용)

viewBox `0 0 1280 700` 유지. 두뇌 층은 **2행**, 거래 층은 손대지 않는다.

**두뇌 층 (신규 배치)**

| id | x | y | w | h | 비고 |
|---|---|---|---|---|---|
| `feature-store` | 250 | 22 | 150 | 44 | 행A |
| `training` | 425 | 22 | 130 | 44 | **신규**, 행A |
| `monitoring` | 595 | 22 | 150 | 44 | **신규**, 행A (중심 670) |
| `model-serving` | 590 | 84 | 160 | 46 | 행B (중심 670 — monitoring과 같은 x → 직선 수직) |
| `pctr-cvr` | 845 | 76 | 190 | 62 | **심장** (중심 940 = dsp 중심 → 직선 수직) |
| `calibration` | 1055 | 84 | 150 | 46 | 행B |

**거래 층 (변경 없음 — 참고용)**: `user`(60,210) `publisher`(290,210) `ssp`(440,210) `exchange`(620,210) `dsp`(865,210,150×64 → 중심 940) `advertiser`(1060,210) / `user-journey`(45,320) `header-bidding`(300,320) `auction`(620,320) `dco`(865,320) `dmp`(1045,320) / `cmp`(45,425) `brand`(1060,425) / `mmp`(45,600) `log-pipeline`(300,600)

**충돌 제약 (반드시 지킬 것)**
- 심장 아래끝 138 < `LANE_LABEL_Y` 150 → 12px 여유. 레인 라벨 'BUY SIDE'는 x=1046이라 심장(845–1035) 오른쪽 밖 ✓
- `via:'top'` 리턴 버스는 y ≈ 164–182 구간을 쓴다(spine y=210 기준 `210-28-channel`). 두뇌 층 노드는 **y ≤ 140** 안에 있어야 한다.
- 행A 아래끝 66, 행B 위끝 76(심장)/84 → 최소 10px 간격.

---

### Task 1: 두뇌 층 재구성 — 노드·엣지·밴드

**Files:**
- Modify: `js/ecosystem.js` (NODES 좌표·2노드 추가, EDGES 5개 추가, BAND_LABELS, buildLanes에 밴드 배경, createNodeGroup에 heart 클래스)
- Modify: `css/style.css` (맨 끝에 P2 섹션)

- [ ] **Step 1.1: 두뇌 층 6노드 좌표 교체 + 2노드 신설**

`js/ecosystem.js`의 `NODES`에서 아래 4개 항목의 `x, y, w, h`를 표대로 바꾸고, `training`·`monitoring`을 추가한다. **정의·데모·포스트 배열은 기존 것을 유지**(feature-store/model-serving/calibration/pctr-cvr).

`feature-store` — old: `x: 300, y: 70, w: 150, h: 56, cat: 'ml',` → new: `x: 250, y: 22, w: 150, h: 44, cat: 'ml',`

`model-serving` — old: `x: 475, y: 70, w: 160, h: 56, cat: 'ml',` → new: `x: 590, y: 84, w: 160, h: 46, cat: 'ml',`

`calibration` — old: `x: 870, y: 70, w: 150, h: 56, cat: 'ml',` → new: `x: 1055, y: 84, w: 150, h: 46, cat: 'ml',`

`pctr-cvr` — old: `x: 655, y: 70, w: 160, h: 56, cat: 'ml',` → new (심장 플래그 포함):
```js
      x: 845, y: 76, w: 190, h: 62, cat: 'ml', heart: true,
```
그리고 `pctr-cvr`의 `sub`를 `'예측 모델'` → `'광고의 심장 — 누를·살 확률'`로 바꾼다.

`training`·`monitoring` 신설 — `feature-store` 항목 **바로 뒤**에 삽입:
```js
    'training': {
      x: 425, y: 22, w: 130, h: 44, cat: 'ml',
      name: 'Training', sub: '모델 학습(오프라인)',
      def: '어제까지 쌓인 로그로 모델을 다시 학습시키는 오프라인 단계. 여기서 나온 새 모델은 오프라인 지표(AUC·LogLoss)를 통과해야 서빙으로 넘어간다.',
      demos: [{ name: '로그→학습 루프', url: 'demo-log-to-model.html' }],
      posts: [
        { id: 'negative-sampling-bias', title: 'Negative Sampling & Bias' },
        { id: 'online-learning-delayed-feedback', title: 'Online Learning & 지연 피드백' },
        { id: 'multi-task-learning', title: '멀티태스크 학습' }
      ]
    },
    'monitoring': {
      x: 595, y: 22, w: 150, h: 44, cat: 'ml',
      name: 'Monitoring', sub: '드리프트 감시',
      def: '배포한 모델이 현실에서 밀리는지 지켜보는 단계. 예측 평균과 실제의 비(COPC), 피처 분포 변화(PSI)를 보고 이상하면 재학습을 부른다.',
      demos: [{ name: 'Calibration', url: 'demo-calibration.html' }],
      posts: [
        { id: 'calibration', title: 'pCTR Calibration' },
        { id: 'online-learning-delayed-feedback', title: 'Online Learning & 지연 피드백' }
      ]
    },
```

- [ ] **Step 1.2: 두뇌 층 배선 5개 추가**

`EDGES`의 `// ── ML 파이프라인 (상단 밴드, 좌→우) ──` 블록을 아래로 교체 (기존 7줄은 유지하고 5줄 추가 + 주석 갱신):

old:
```js
    // ── ML 파이프라인 (상단 밴드, 좌→우) ──
    { from: 'feature-store', to: 'model-serving' },
    { from: 'model-serving', to: 'pctr-cvr' },
    { from: 'pctr-cvr', to: 'calibration' },
    { from: 'dsp', to: 'model-serving' },     // 점수 요청
    { from: 'auction', to: 'pctr-cvr' },       // 경매 → 예측
    { from: 'exchange', to: 'auction' },       // 거래소 → 경매 엔진
    { from: 'calibration', to: 'dsp' },        // 새 모델 배포
```
new:
```js
    // ── 두뇌 층: 학습(행A) · 서빙(행B) 파이프라인 ──
    { from: 'feature-store', to: 'training' },        // 피처 → 학습셋
    { from: 'training', to: 'model-serving' },        // 학습된 모델 배포
    { from: 'model-serving', to: 'monitoring' },      // 서빙 결과 감시(직선 수직)
    { from: 'monitoring', to: 'training' },           // 드리프트 → 재학습 트리거(루프 닫힘)
    { from: 'feature-store', to: 'model-serving' },
    { from: 'model-serving', to: 'pctr-cvr' },
    { from: 'pctr-cvr', to: 'calibration' },
    { from: 'dsp', to: 'pctr-cvr', layer: true },     // ★ 2층 연결선 — 중심 x가 같아 직선 수직으로 그려진다
    { from: 'dsp', to: 'model-serving' },     // 점수 요청
    { from: 'auction', to: 'pctr-cvr' },       // 경매 → 예측
    { from: 'exchange', to: 'auction' },       // 거래소 → 경매 엔진
    { from: 'calibration', to: 'dsp' },        // 새 모델 배포
```

- [ ] **Step 1.3: 2층 연결선에 클래스 부여**

`createEdgePath`에서 `layer: true` 엣지에 클래스를 추가한다 — Edit:

old:
```js
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('class', 'eco-edge');
```
new:
```js
    const p = document.createElementNS(SVG_NS, 'path');
    // layer:true = 거래 층 ↔ 두뇌 층을 잇는 통로. 굵은 파선으로 따로 보이게 한다.
    p.setAttribute('class', e.layer ? 'eco-edge is-layer-link' : 'eco-edge');
```

- [ ] **Step 1.4: 심장 노드에 클래스 부여**

`createNodeGroup`에서 — Edit:

old:
```js
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'eco-node');
    g.setAttribute('data-node', id);
```
new:
```js
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', n.heart ? 'eco-node is-heart' : 'eco-node');
    g.setAttribute('data-node', id);
```

- [ ] **Step 1.5: 층 밴드 배경 + 라벨**

`BAND_LABELS`를 층 라벨로 교체 — old:
```js
  const BAND_LABELS = [
    { text: 'ML · 모델 레이어', x: 44, y: 52 },
    { text: '측정 · 로그 데이터', x: 44, y: 590 },
  ];
```
new:
```js
  // 층·행 라벨. 두뇌 층은 2행(학습/서빙)이라 행 라벨을 왼쪽 여백(x<250)에 세로로 쌓는다.
  const BAND_LABELS = [
    { text: '두뇌 층 — 모델이 사는 곳', x: 44, y: 16, cls: 'is-layer' },
    { text: '① 학습 · 오프라인', x: 44, y: 44 },
    { text: '② 서빙 · 0.1초', x: 44, y: 106 },
    { text: '측정 · 로그 데이터', x: 44, y: 590 },
  ];
  // 두뇌 층 배경 밴드 (거래 층의 레인 컬럼과 대비되는 가로 밴드)
  const BRAIN_BAND = { x: 30, y: 6, w: 1220, h: 140 };
```

`buildLanes()`에 밴드 배경을 추가 — Edit:

old:
```js
  function buildLanes() {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'eco-lanes');
    LANES.forEach(l => {
```
new:
```js
  function buildLanes() {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'eco-lanes');

    // 두뇌 층 밴드 (가로) — 거래 층 레인(세로 컬럼)과 시각적으로 구분
    const band = document.createElementNS(SVG_NS, 'rect');
    band.setAttribute('class', 'eco-brain-band');
    band.setAttribute('x', BRAIN_BAND.x);
    band.setAttribute('y', BRAIN_BAND.y);
    band.setAttribute('width', BRAIN_BAND.w);
    band.setAttribute('height', BRAIN_BAND.h);
    band.setAttribute('rx', 18);
    g.appendChild(band);

    LANES.forEach(l => {
```

그리고 밴드 라벨 렌더에 클래스 지원 추가 — old:
```js
    BAND_LABELS.forEach(b => {
      const t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('class', 'eco-band-label');
```
new:
```js
    BAND_LABELS.forEach(b => {
      const t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('class', b.cls ? `eco-band-label ${b.cls}` : 'eco-band-label');
```

- [ ] **Step 1.6: CSS — 심장·밴드·2층 연결선**

`css/style.css` 맨 끝에 추가 (앞에 빈 줄 하나):
```css
/* ========================================
   P2 — 생태계 2층 구조 (두뇌 층 · 심장 · 층 연결선)
   ======================================== */
.eco-brain-band { fill: var(--bg-tertiary); opacity: 0.55; stroke: var(--border-color); stroke-width: 1; }
[data-theme="dark"] .eco-brain-band { opacity: 0.38; }
.eco-band-label.is-layer { font-weight: 700; letter-spacing: 0.06em; fill: var(--accent-secondary); }

/* 심장 — pCTR/pCVR */
.eco-node.is-heart .eco-node-rect { stroke: var(--accent-primary); stroke-width: 2.5; fill: var(--bg-secondary); }
.eco-node.is-heart .eco-node-title { font-size: 15px; font-weight: 700; fill: var(--accent-primary); }
.eco-node.is-heart .eco-node-sub { fill: var(--text-secondary); }
.eco-node.is-heart .eco-node-accent { width: 7px; }
.eco-heart-pulse { fill: none; stroke: var(--accent-primary); stroke-width: 2; opacity: 0; animation: eco-heart 2.4s ease-out infinite; }
@keyframes eco-heart {
  0%   { opacity: 0.45; transform: scale(1); }
  70%  { opacity: 0;    transform: scale(1.06); }
  100% { opacity: 0;    transform: scale(1.06); }
}

/* 거래 층 ↔ 두뇌 층 통로 */
.eco-edge.is-layer-link { stroke: var(--accent-primary); stroke-width: 2.4; stroke-dasharray: 7 5; opacity: 0.85; }
.eco-edge.is-layer-link.is-active { stroke-width: 3.2; opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .eco-heart-pulse { animation: none; opacity: 0.3; }
}
```

- [ ] **Step 1.7: 심장 맥박 링 요소 추가**

`createNodeGroup`의 `accent` 추가 직후에 삽입 — Edit:

old:
```js
    accent.setAttribute('rx', 2.5);
    g.appendChild(accent);

    const title = document.createElementNS(SVG_NS, 'text');
```
new:
```js
    accent.setAttribute('rx', 2.5);
    g.appendChild(accent);

    // 심장 노드는 맥박 링을 한 겹 덧그린다(장식 — 포인터 이벤트 없음)
    if (n.heart) {
      const pulse = document.createElementNS(SVG_NS, 'rect');
      pulse.setAttribute('class', 'eco-heart-pulse');
      pulse.setAttribute('x', n.x);
      pulse.setAttribute('y', n.y);
      pulse.setAttribute('width', n.w);
      pulse.setAttribute('height', n.h);
      pulse.setAttribute('rx', 12);
      pulse.setAttribute('pointer-events', 'none');
      pulse.setAttribute('transform-origin', `${n.x + n.w / 2} ${n.y + n.h / 2}`);
      g.appendChild(pulse);
    }

    const title = document.createElementNS(SVG_NS, 'text');
```

- [ ] **Step 1.8: 검증 — 겹침 없는지 눈으로 확인**

```bash
cd /Users/user/Downloads/adtech-blog
node --check js/ecosystem.js
```
캐시를 무효화한 새 컨텍스트로 `ecosystem.html`을 열고 스크린샷(최소 1440×1400) → Read로 육안 확인. **합격 기준:**
1. 두뇌 층 6노드가 2행으로, 서로 겹치지 않고 라벨이 잘림 없이 보인다
2. `pctr-cvr`이 가장 크고 벽돌 테두리 + 맥박, `DSP` **정확히 위**에 있다
3. `DSP ↔ pCTR/pCVR` 연결선이 **곧은 수직 파선** (꺾임 없음)
4. `model-serving ↔ monitoring`도 곧은 수직선
5. 두뇌 층 노드가 레인 라벨(USER/SELL SIDE/EXCHANGE/BUY SIDE)이나 리턴 버스 선과 겹치지 않는다
6. 두뇌 층 밴드 배경이 거래 층 레인과 시각적으로 구분된다

겹침이 있으면 **표의 좌표를 ±20px 범위에서 조정**해도 된다. 단 (a) `pctr-cvr` 중심 x = 940, (b) `monitoring`·`model-serving` 중심 x 동일, (c) 두뇌 층 전체 y ≤ 140 — 이 세 제약은 반드시 유지. 조정했다면 최종 좌표를 `NODES` 위 주석에 한 줄로 남긴다.

- [ ] **Step 1.9: Commit**

```bash
git add -A && git commit -m "feat(eco): 두뇌 층 2행 재구성 — Training·Monitoring 신설, pCTR 심장 강조, DSP↔두뇌 수직 통로

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: 새 대표 흐름 "모델러의 눈으로 보는 0.1초"

**Files:**
- Modify: `js/ecosystem.js` (`FLOWS`에 `modeler` 추가)
- Modify: `ecosystem.html` (흐름 칩 추가 — 첫 번째 자리)

- [ ] **Step 2.1: FLOWS에 `modeler` 추가**

`const FLOWS = {` 바로 다음(=`rtb:` 앞)에 아래를 삽입한다. 각 스텝의 `from|to`는 T1까지 정의된 엣지에 모두 존재한다(`findEdgeAny`가 역방향도 찾으므로 방향은 무관).

```js
    modeler: {
      label: '모델러의 눈으로 보는 0.1초',
      summary: '모델러가 하는 일은 이 고리를 매일 돌리는 것입니다 — 0.1초 안에 확률을 찍어 입찰가를 만들고, 그 결과를 로그로 받아 다음 모델을 만들고, 배포한 뒤 다시 감시합니다. 예측이 0.1%p 정확해지는 지점이 곧 매출이 바뀌는 지점입니다.',
      steps: [
        {
          from: 'exchange', to: 'dsp',
          caption: '입찰 요청 1건 도착 — 지금부터 100ms',
          detail: '거래소가 "이 자리 살 사람?"이라고 물어 온 순간부터 시계가 돕니다. 이 안에 답을 못 내면 예측이 아무리 좋아도 버려집니다(타임아웃).',
          packet: { label: 'Bid Request', kind: 'request' },
          example: {
            story: '오후 9시 14분, 뉴스앱 320×100 한 칸에 대한 요청이 우리 DSP에 들어온다.',
            data: [['제한시간', '100ms'], ['지면', '뉴스앱 320×100'], ['남은 예산', '₩4.2M']]
          }
        },
        {
          from: 'dsp', to: 'pctr-cvr',
          caption: 'DSP가 두뇌에 묻는다 — "이 사람, 누를까?"',
          detail: '입찰가를 정하려면 딱 하나가 필요합니다 — 누를 확률. 이 세로선이 거래 층과 두뇌 층을 잇는 통로입니다. 광고 ML 엔지니어의 일은 대부분 이 선 위쪽에서 벌어집니다.',
          packet: { label: '예측 요청', kind: 'request' },
          example: {
            story: '요청 하나에 후보 광고가 800개 — "이 중 뭐가 제일 눌릴까"를 한 번에 묻는다.',
            data: [['후보 광고', '800개'], ['묻는 것', 'pCTR · pCVR']]
          }
        },
        {
          from: 'feature-store', to: 'model-serving',
          caption: '피처 조회 — 이 사람·이 자리에 대해 아는 것 긁어오기',
          detail: '모델에 넣을 재료(피처)를 Feature Store에서 꺼냅니다. 유저의 최근 행동, 지면 성격, 시간대 같은 값입니다. 이 조회가 느리면 전체가 늦어지니 보통 수 ms 안에 끝냅니다.',
          packet: { label: '피처 213개', kind: 'data' },
          example: {
            story: '"최근 7일 클릭 3회", "이 지면 평균 CTR 1.8%", "금요일 밤" 같은 값이 붙는다.',
            data: [['피처 수', '213'], ['조회', '3.1ms'], ['캐시 적중', '92%']]
          }
        },
        {
          from: 'model-serving', to: 'pctr-cvr',
          caption: '추론 — 확률을 찍는다 (아직 원값)',
          detail: '학습해 둔 모델이 후보마다 확률을 계산합니다. 여기서 나온 값은 아직 원값입니다 — 순위는 맞아도 절댓값이 살짝 틀어져 있을 수 있습니다.',
          packet: { label: 'pCTR 2.1%', kind: 'data' },
          example: {
            story: '최고 후보의 원 예측은 2.1%. 800개를 다 채점하는 데 6.2ms 걸렸다.',
            data: [['원 pCTR', '2.1%'], ['pCVR', '0.35%'], ['추론', '6.2ms']]
          }
        },
        {
          from: 'pctr-cvr', to: 'calibration',
          caption: '보정 — 예측 평균을 실제에 맞춘다',
          detail: '모델이 전체적으로 낮게(또는 높게) 보는 버릇을 실측에 맞춰 교정합니다. 예측 합을 실제 합으로 나눈 값을 COPC라 부르는데, 1보다 작으면 낮게 보고 있다는 뜻입니다. 이 한 단계가 없으면 입찰가가 통째로 낮게 깔려 돈을 잃습니다.',
          packet: { label: '2.1% → 2.4%', kind: 'data' },
          example: {
            story: '최근 실측과 비교하니 모델이 12% 낮게 보고 있었다 — 2.1%를 2.4%로 올린다.',
            data: [['COPC', '0.88'], ['보정 후', '2.4%']]
          }
        },
        {
          from: 'calibration', to: 'dsp',
          caption: '보정된 확률이 돌아온다 → 입찰가 계산',
          detail: '이제 계산할 수 있습니다. 전환 하나의 가치 × 누를 확률 × 살 확률 = 이 노출 한 번의 기대 가치. 광고판은 1,000회 기준(CPM)으로 부르니 여기에 1,000을 곱하고, 예산 페이싱과 Bid Shading으로 깎아 최종 입찰가를 냅니다.',
          packet: { label: '입찰 CPM ₩1,200', kind: 'money' },
          example: {
            story: '₩30,000 × 2.4% × 0.35% ≈ ₩2.5 (노출 1회) → CPM ₩2,520이 상한. 페이싱·셰이딩 후 ₩1,200을 부른다.',
            data: [['전환 가치', '₩30,000'], ['노출 1회 기대', '₩2.5'], ['최종 입찰 CPM', '₩1,200']]
          }
        },
        {
          from: 'dsp', to: 'exchange',
          caption: '입찰 응답 — 42ms에 도착',
          detail: '제한시간 안에 답했으니 경매에 참여합니다. 모델러가 늘 신경 쓰는 예산이 이 시간입니다 — 피처 조회 3ms, 추론 6ms, 나머지는 네트워크와 후처리입니다.',
          packet: { label: 'Bid ₩1,200', kind: 'money' },
          example: {
            story: '요청 도착부터 응답까지 42ms. 지연 상위 1%(p99)는 88ms까지 튄다.',
            data: [['총 소요', '42ms'], ['p99', '88ms'], ['타임아웃', '100ms']]
          }
        },
        {
          from: 'exchange', to: 'publisher',
          caption: '낙찰 — 이겼다 (그리고 진 경우는 안 보인다)',
          detail: '최고가를 부른 쪽이 이깁니다. 이겼을 때만 실제 가격이 보이고, 졌을 때는 남이 얼마 썼는지 못 봅니다. 이 "보이지 않음"이 모델러의 골칫거리인 Censored Data입니다.',
          packet: { label: '낙찰 소재', kind: 'creative' },
          example: {
            story: '₩1,200으로 낙찰 — 2위는 ₩1,150이었다. 졌다면 이 숫자조차 못 봤다.',
            data: [['결과', 'win'], ['지불', '₩1,150'], ['패찰 시', '가격 미관측']]
          }
        },
        {
          from: 'publisher', to: 'user',
          caption: '광고가 뜬다 (노출)',
          detail: '화면에 배너가 나타납니다. 요청부터 여기까지 0.1초. 모델러 입장에서 이 순간은 "예측을 시장에 제출한 시점"입니다 — 채점은 이제부터입니다.',
          packet: { label: '노출', kind: 'creative' },
          example: {
            story: '민지 화면에 운동화 배너가 뜬다. 우리 모델은 "2.4% 확률로 눌릴 것"이라 말했다.',
            data: [['예측', '2.4%'], ['실제', '?']]
          }
        },
        {
          from: 'user', to: 'log-pipeline',
          caption: '채점표가 쌓인다 — 봤나·눌렀나·샀나',
          detail: '예측이 맞았는지는 이 로그로만 알 수 있습니다. 한 건으로는 아무것도 판정할 수 없습니다 — 2.4%란 "100번 중 두세 번"이라는 뜻이니까요. 수억 건이 모여야 비로소 맞았는지 보입니다.',
          packet: { label: 'imp=1 click=0', kind: 'data' },
          example: {
            story: '이번엔 안 눌렸다. 하지만 이건 예측이 틀렸다는 증거가 아니다.',
            data: [['imp', '1'], ['click', '0'], ['판정', '한 건으론 불가']]
          }
        },
        {
          from: 'log-pipeline', to: 'feature-store',
          caption: '로그를 학습 데이터로 가공',
          detail: '원시 로그는 그대로 못 씁니다. 노출·클릭·전환을 이어 붙이고(조인), 그 시점에 모델이 봤던 피처를 그대로 되살려 붙입니다. 지금 값이 아니라 "그때 값"이어야 합니다 — 안 그러면 학습과 서빙이 어긋나는 학습-서빙 스큐가 생깁니다.',
          packet: { label: '학습셋 1.2억 행', kind: 'data' },
          example: {
            story: '어제 노출 1.2억 건에 클릭·전환을 붙인다. 전환은 며칠 늦게 오니 일부는 라벨이 아직 비어 있다.',
            data: [['학습셋', '120M 행'], ['라벨 미확정', '7%']]
          }
        },
        {
          from: 'feature-store', to: 'training',
          caption: '학습 — 새 모델 후보가 나온다',
          detail: '어제까지의 데이터로 다시 학습합니다. 여기서 나온 후보는 아직 실전에 못 나갑니다. 오프라인 지표(AUC·LogLoss)로 먼저 걸러야 하는데, 이 지표가 좋아졌다고 매출이 오른다는 보장은 없습니다.',
          packet: { label: '새 모델 후보', kind: 'data' },
          example: {
            story: 'AUC 0.7841 → 0.7856. 좋아 보이지만 이 차이가 돈이 될지는 아직 모른다.',
            data: [['AUC', '0.7856 (+0.0015)'], ['LogLoss', '0.0412']]
          }
        },
        {
          from: 'training', to: 'model-serving',
          caption: '배포 — 섀도 → 10% → 전량',
          detail: '새 모델을 바로 100% 켜지 않습니다. 먼저 응답만 받아 기존과 비교하고(섀도), 다음 트래픽 10%에만 태우고, 지표가 버티면 전량으로 넓힙니다. 확률 모델은 잘못 켜면 입찰가가 통째로 흔들립니다.',
          packet: { label: '모델 v237 배포', kind: 'creative' },
          example: {
            story: '10% 트래픽에서 COPC 0.99, CTR +1.8%. 이틀 지켜본 뒤 전량으로 올린다.',
            data: [['단계', 'shadow → 10% → 100%'], ['COPC', '0.99'], ['CTR', '+1.8%']]
          }
        },
        {
          from: 'model-serving', to: 'monitoring',
          caption: '감시 — 예측이 현실에서 밀리는지 본다',
          detail: '배포 후가 진짜 시작입니다. 예측 평균과 실제의 비(COPC), 피처 분포가 얼마나 변했는지(PSI)를 계속 봅니다. 세상이 바뀌면 어제까지 맞던 모델이 오늘 틀립니다.',
          packet: { label: 'COPC · PSI 감시', kind: 'data' },
          example: {
            story: '연휴로 클릭 패턴이 바뀌자 PSI가 0.28로 튀었다 — 경보.',
            data: [['COPC', '1.09'], ['PSI', '0.28 (경보)']]
          }
        },
        {
          from: 'monitoring', to: 'training',
          caption: '드리프트 감지 → 재학습 (고리가 닫힌다)',
          detail: '이상이 보이면 다시 학습으로 돌아갑니다. 광고 ML은 한 번 만들고 끝나는 일이 아니라, 이 고리를 매일 돌리는 일입니다. 이 페이지의 두뇌 층이 곧 그 고리입니다.',
          packet: { label: '재학습 트리거', kind: 'request' },
          example: {
            story: 'PSI 경보로 야간 재학습을 앞당긴다. 내일의 입찰가가 또 조금 달라진다.',
            data: [['조치', '재학습 앞당김'], ['주기', '일 1회 → 6시간']]
          }
        },
      ]
    },
```

- [ ] **Step 2.2: 흐름 칩 추가 (첫 번째 자리)**

`ecosystem.html`의 `eco-flow-chips` 안, `data-flow="rtb"` 버튼 **앞**에 삽입 — Edit:

old:
```html
        <button type="button" class="eco-flow-chip" data-flow="rtb">
```
new:
```html
        <button type="button" class="eco-flow-chip is-featured" data-flow="modeler">
          <span class="eco-flow-chip-label">▶ 모델러의 눈으로 보는 0.1초</span>
          <span class="eco-flow-chip-desc">입찰 요청 1건이 두뇌를 거쳐 입찰가가 되고, 로그로 돌아와 다음 모델이 되기까지</span>
        </button>
        <button type="button" class="eco-flow-chip" data-flow="rtb">
```

- [ ] **Step 2.3: 대표 흐름 칩 강조 CSS**

`css/style.css`의 P2 섹션 끝에 추가:
```css
/* 대표 흐름 칩 — 나머지보다 한 단계 앞선 것으로 보이게 */
.eco-flow-chip.is-featured { border-color: var(--accent-primary); box-shadow: inset 3px 0 0 var(--accent-primary); }
.eco-flow-chip.is-featured .eco-flow-chip-label { color: var(--accent-primary); font-weight: 700; }
```

- [ ] **Step 2.4: 검증 — 15스텝 전부 재생**

캐시 무효화 후 `ecosystem.html`에서 새 칩을 눌러 **끝까지 재생**하고 확인:
1. 15개 스텝 모두 패킷이 실제로 이동한다(엣지를 못 찾아 제자리에 머무는 스텝이 없다)
2. 2번째 스텝(DSP→두뇌)에서 수직 파선이 활성 색으로 강조된다
3. 콘솔 에러 0
4. 기존 5개 흐름(rtb·modeling·attribution·hb·targeting)도 각각 끝까지 재생 — **T1의 좌표 변경으로 깨진 스텝이 없는지 반드시 확인**

스텝별 패킷 이동은 "다음 →" 버튼으로 넘기며 확인해도 된다. 진행 표시(N/15)가 맞는지도 함께 본다.

- [ ] **Step 2.5: Commit**

```bash
git add -A && git commit -m "feat(eco): 대표 흐름 '모델러의 눈으로 보는 0.1초' 15스텝 추가

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: 흐름 딥링크 `?flow=` + 표지 연결 (P1 이관 2건 정리)

**Files:**
- Modify: `js/ecosystem.js` (init에서 URL 파라미터 처리)
- Modify: `index.html` (표지 흐름 칩을 링크로 — `.cover-flows`를 지도 앵커 밖으로, 세로 연결선을 DSP에 고정)
- Modify: `css/style.css` (표지 칩 링크·세로선 위치)

- [ ] **Step 3.1: `?flow=` 딥링크 처리**

`js/ecosystem.js`의 `init()` 마지막(resize 리스너 등록 뒤)에 추가 — Edit:

old:
```js
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(applyCompact, 150);
    });
  }
```
new:
```js
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(applyCompact, 150);
    });

    openFlowFromUrl();
  }

  // ?flow=<이름> 으로 들어오면 그 흐름을 바로 재생한다(표지 칩 → 이 페이지 딥링크).
  // 알 수 없는 이름이면 조용히 무시한다.
  function openFlowFromUrl() {
    let name = null;
    try { name = new URLSearchParams(window.location.search).get('flow'); } catch (e) { return; }
    if (!name || !FLOWS[name]) return;
    const chip = flowChips.find(c => c.dataset.flow === name);
    startFlow(name, chip || null);
    const wrap = document.getElementById('eco-graph-wrap');
    if (wrap && wrap.scrollIntoView) wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
```

- [ ] **Step 3.2: 표지 흐름 칩을 실제 링크로 (중첩 링크 제거)**

`index.html`에서 `.cover-flows` 블록을 지도 앵커(`</a>`) **밖으로 빼고** 각 칩을 링크로 바꾼다 — Edit:

old:
```html
          <div class="cover-flows" aria-hidden="true">
            <span class="cover-flow is-on">▶ 100ms RTB</span>
            <span class="cover-flow">▶ 모델 학습·서빙</span>
            <span class="cover-flow">▶ 어트리뷰션</span>
            <span class="cover-flow">▶ Header Bidding</span>
            <span class="cover-flow">▶ 데이터·타겟팅</span>
          </div>
        </a>
```
new:
```html
        </a>
        <!-- 흐름 칩은 지도 앵커 '밖'에 둔다 (중첩 링크 방지) — 각각 해당 흐름으로 딥링크 -->
        <div class="cover-flows">
          <a class="cover-flow is-on" href="ecosystem.html?flow=modeler">▶ 모델러의 눈으로 보는 0.1초</a>
          <a class="cover-flow" href="ecosystem.html?flow=rtb">▶ 100ms RTB</a>
          <a class="cover-flow" href="ecosystem.html?flow=modeling">▶ 모델 학습·서빙</a>
          <a class="cover-flow" href="ecosystem.html?flow=attribution">▶ 어트리뷰션</a>
          <a class="cover-flow" href="ecosystem.html?flow=hb">▶ Header Bidding</a>
          <a class="cover-flow" href="ecosystem.html?flow=targeting">▶ 데이터·타겟팅</a>
        </div>
```

- [ ] **Step 3.3: 표지 세로 연결선을 DSP에 고정**

`index.html`에서 독립 `.cover-vlink` div를 없애고 DSP 노드 안에 붙인다 — 두 Edit:

old:
```html
          <div class="cover-vlink" aria-hidden="true"><i></i><span class="cover-vdot"></span></div>
          <div class="cover-lane" aria-hidden="true">
```
new:
```html
          <div class="cover-lane" aria-hidden="true">
```

old:
```html
            <div class="cover-node cover-dsp">DSP<small>입찰 — 두뇌에 질문</small></div>
```
new:
```html
            <div class="cover-node cover-dsp">DSP<small>입찰 — 두뇌에 질문</small><span class="cover-vlink-up"></span></div>
```

- [ ] **Step 3.4: CSS — 세로선 재배치 + 칩 링크화**

`css/style.css`의 기존 표지 규칙 3개를 교체한다.

old:
```css
.cover-vlink { display: flex; justify-content: center; height: 24px; position: relative; }
.cover-vlink i { border-left: 2px dashed rgba(var(--accent-primary-rgb), 0.5); }
.cover-vdot { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: var(--accent-primary); left: calc(50% - 3px); animation: cover-updown 1.6s ease-in-out infinite; }
@keyframes cover-updown { 0%, 100% { top: 2px; } 50% { top: 16px; } }
```
new:
```css
/* 두뇌 층 ↔ DSP 통로 — DSP 노드에 붙여 두어 어떤 폭에서도 정확히 그 위에 선다 */
.cover-vlink-up { position: absolute; left: calc(50% - 1px); bottom: 100%; width: 0; height: 26px;
  border-left: 2px dashed rgba(var(--accent-primary-rgb), 0.55); }
.cover-vlink-up::after { content: ''; position: absolute; left: -4px; top: 2px; width: 6px; height: 6px;
  border-radius: 50%; background: var(--accent-primary); animation: cover-updown 1.6s ease-in-out infinite; }
@keyframes cover-updown { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(16px); } }
```

old:
```css
.cover-flows { display: flex; gap: 0.5rem; margin-top: 0.9rem; flex-wrap: wrap; }
.cover-flow { font-size: 0.74rem; border: 1px solid var(--border-color); background: var(--bg-primary); padding: 0.32rem 0.75rem; border-radius: 999px; color: var(--text-secondary); }
```
new:
```css
.cover-flows { display: flex; gap: 0.5rem; margin-top: 0.8rem; flex-wrap: wrap; }
.cover-flow { font-size: 0.74rem; border: 1px solid var(--border-color); background: var(--bg-secondary);
  padding: 0.32rem 0.75rem; border-radius: 999px; color: var(--text-secondary); text-decoration: none; }
.cover-flow:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
```

그리고 `.cover-brain`의 아래 여백을 늘려 세로선 자리를 만든다 — old:
```css
.cover-brain { position: relative; display: flex; justify-content: center; gap: 0.7rem; margin: 1rem 0 0.3rem; }
```
new:
```css
.cover-brain { position: relative; display: flex; justify-content: center; gap: 0.7rem; margin: 1rem 0 1.9rem; }
```

`@media (prefers-reduced-motion: reduce)` 블록의 `.cover-vdot`를 새 선택자로 교체 — old:
```css
  .cover-dot, .cover-vdot, .cover-heart { animation: none; }
```
new:
```css
  .cover-dot, .cover-vlink-up::after, .cover-heart { animation: none; }
```

- [ ] **Step 3.5: 검증**

1. `index.html` 1440px 스크린샷: 세로 파선이 **DSP 노드 정확히 위**에 있고, 흐름 칩 6개가 지도 아래 별도 줄에 있다
2. 브라우저에서 "▶ 모델러의 눈으로…" 칩 클릭 → `ecosystem.html?flow=modeler`로 이동해 **자동 재생**되고 지도로 스크롤된다
3. `ecosystem.html?flow=hb`도 동작, `?flow=없는이름`은 조용히 무시(에러 없음)
4. 표지 지도 앵커 안에 `<a>`가 없다(중첩 링크 해소): `node -e "const s=require('fs').readFileSync('index.html','utf8');const m=s.match(/<a class=\"cover-map\"[\s\S]*?<\/a>/);console.log('nested a:', (m[0].match(/<a /g)||[]).length - 1)"` → `nested a: 0`
5. 600px 폭에서 칩이 줄바꿈되고 세로선이 여전히 DSP 위에 있다

- [ ] **Step 3.6: Commit**

```bash
git add -A && git commit -m "feat(eco): 흐름 딥링크 ?flow= + 표지 칩 링크화·세로 통로를 DSP에 고정 (P1 이관 정리)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: 카테고리 카드·히어로·메타 갱신

**Files:**
- Modify: `ecosystem.html` (히어로 문구, aria-label, meta description, 카테고리 카드)

- [ ] **Step 4.1: 히어로 문구 — 표지와 중복 해소**

표지가 "0.1초 안에 벌어지는 광고 한 편의 여정"을 가져갔으므로, 생태계 히어로는 **지도 조작**에 초점을 둔다 — Edit:

old:
```html
        <span class="eco-hero-kicker">AD TECH · 한 장으로 읽는 지도</span>
        <h1 class="eco-hero-title">0.1초 안에 벌어지는<br>광고 한 편의 여정</h1>
        <p class="eco-hero-dek">사용자가 페이지를 연 순간부터 광고가 뜨기까지 — 요청·입찰가·소재·데이터가 어디로 흐르는지,
          19개 모듈을 <strong>왼쪽(사용자)에서 오른쪽(광고주)으로</strong> 읽는 순서대로 따라가 봅니다.</p>
```
new:
```html
        <span class="eco-hero-kicker">AD TECH · 한 장으로 읽는 지도</span>
        <h1 class="eco-hero-title">광고 생태계 한 장 지도<br>흐름을 직접 재생하며 따라가기</h1>
        <p class="eco-hero-dek">21개 모듈을 <strong>두 층</strong>으로 놓았습니다 —
          위는 모델이 사는 <strong>두뇌 층</strong>(피처→학습→서빙→예측→보정→감시),
          아래는 돈과 소재가 흐르는 <strong>거래 층</strong>(사용자→매체→거래소→DSP→광고주).
          두 층은 <strong>DSP와 pCTR/pCVR을 잇는 세로선</strong> 하나로 연결됩니다.</p>
```

- [ ] **Step 4.2: aria-label · meta description 갱신** — 두 Edit:

old: `             aria-label="광고 생태계 지도 — 사용자·판매·거래소·구매 레인으로 배치한 19개 모듈과 그 연결">`
new: `             aria-label="광고 생태계 지도 — 위쪽 두뇌 층(ML 파이프라인)과 아래쪽 거래 층으로 나눈 21개 모듈과 그 연결">`

old:
```html
    content="광고 생태계 한 장 지도 — DSP, SSP, Ad Exchange, DMP, pCTR, Feature Store, Attribution까지 18개 핵심 모듈을 인터랙티브 그래프로 한눈에. 100ms RTB 흐름 애니메이션도 함께.">
```
new:
```html
    content="광고 생태계 한 장 지도 — 거래 층(SSP·Exchange·DSP)과 두뇌 층(Feature Store·학습·서빙·pCTR/pCVR·보정·감시) 21개 모듈을 인터랙티브 그래프로. '모델러의 눈으로 보는 0.1초' 흐름 애니메이션 포함.">
```

- [ ] **Step 4.3: ML 카테고리 카드 갱신 + 2층 안내 문구** — Edit:

old:
```html
        <div class="eco-cat-card" data-category="ml">
          <h3>ML / Models · 4개 모듈</h3>
          <p>예측·랭킹의 두뇌. Feature Store가 피처를 공급하고 Model Serving이 수천 후보를 좁힌다.
            pCTR/pCVR이 확률을 예측, Calibration이 절댓값을 보정한다.</p>
        </div>
```
new:
```html
        <div class="eco-cat-card" data-category="ml">
          <h3>ML / Models · 6개 모듈 (두뇌 층)</h3>
          <p>예측·랭킹의 두뇌이자 이 지도의 위층. Feature Store가 피처를 공급하고 Training이 어제 로그로 모델을 만들며,
            Model Serving이 수천 후보를 좁힌다. <strong>pCTR/pCVR</strong>이 확률을 찍고 Calibration이 절댓값을 바로잡고,
            Monitoring이 예측이 현실에서 밀리는지 지켜본다.</p>
        </div>
```

그리고 섹션 제목/부제 — Edit:

old:
```html
      <h2>6 카테고리로 묶은 광고 생태계</h2>
      <p class="eco-categories-sub">각 카테고리는 광고 거래의 한 축을 담당합니다. 위 그래프의 색과 동일.</p>
```
new:
```html
      <h2>6 카테고리 · 21개 모듈</h2>
      <p class="eco-categories-sub">각 카테고리는 광고 거래의 한 축을 담당합니다. 위 그래프의 색과 동일 —
        ML / Models가 지도의 <strong>두뇌 층</strong>, 나머지가 <strong>거래 층</strong>입니다.</p>
```

- [ ] **Step 4.4: 검증**

`grep -n "19개\|18개\|4개 모듈" ecosystem.html` → 0줄. 스크린샷으로 히어로·카테고리 카드 육안 확인.

- [ ] **Step 4.5: Commit**

```bash
git add -A && git commit -m "docs(eco): 히어로·메타·카테고리 카드를 2층 21모듈 기준으로 갱신

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: 쉬운 버전 · 용어 사전 반영

**Files:**
- Modify: `js/ecosystem-easy.js` (modeling 장면에 감시·재학습 비트 2개 추가)
- Modify: `js/ecosystem-terms.js` (용어 2개 추가)

- [ ] **Step 5.1: 기존 구조 확인**

```bash
cd /Users/user/Downloads/adtech-blog
grep -a -n "id: 'modeling'" -A 60 js/ecosystem-easy.js | head -70
grep -a -n "id:\|term:\|title:" js/ecosystem-terms.js | head -20
```
두 파일의 **객체 형태를 그대로 따라** 아래 내용을 넣는다(키 이름·순서를 새로 발명하지 말 것).

- [ ] **Step 5.2: 쉬운 버전 — modeling 장면 끝에 비트 2개 추가**

`js/ecosystem-easy.js`의 `id: 'modeling'` 장면 `beats`(또는 동등한 배열)의 **마지막 항목 뒤**에, 그 파일의 기존 항목과 같은 키 구성으로 추가한다. 내용:

1번 — title: `새 모델을 켠 다음이 진짜 시작이다`
   본문: `모델을 바꿨다고 끝이 아닙니다. 예측이 실제보다 자꾸 낮거나 높아지지 않는지, 사람들의 행동이 갑자기 달라지지 않았는지 계속 지켜봅니다. 연휴 하나만 지나도 어제까지 맞던 모델이 오늘 틀립니다.`

2번 — title: `이상하면 다시 공부시킨다 — 고리가 닫힌다`
   본문: `감시하다 신호가 이상해지면 학습을 앞당겨 다시 돌립니다. 광고의 예측 모델은 한 번 만들고 두는 게 아니라, 매일 이 고리를 한 바퀴씩 도는 일입니다.`

기존 항목에 아이콘·이미지·데이터 같은 필드가 있으면 **그 장면의 다른 항목에서 쓰인 값 중 어울리는 것을 재사용**한다(새 에셋을 만들지 말 것).

- [ ] **Step 5.3: 용어 사전 — 2개 추가**

`js/ecosystem-terms.js`에 기존 항목과 같은 형태로 두 개 추가(anchor/id는 파일 관례에 맞춰 `monitoring`, `train-serve-skew` 사용):

- **모니터링 (COPC·PSI)** — 뜻: `배포한 예측 모델이 현실에서 밀리는지 지켜보는 일. COPC(Click Over Predicted Click)는 '실제 클릭 합 ÷ 예측 합'이라, 1보다 크면 모델이 낮게 보고 있다는 뜻이다. (이 블로그의 Calibration 글은 뒤집은 비율인 P/O Ratio = 예측÷실제로 설명하니, 어느 쪽인지 늘 확인하고 읽어야 한다.) PSI는 입력 데이터 분포가 얼마나 변했는지를 재는 값으로, 0.1 미만은 안정, 0.25를 넘으면 유의 신호다. 이 숫자가 튀면 다시 학습시킨다.`
- **학습-서빙 스큐** — 뜻: `모델을 학습시킬 때 쓴 값과 실제 서비스에서 넣는 값이 어긋나는 문제. 예를 들어 학습에는 '지금 시점'의 값을 넣었는데 실제로는 '그때 시점'의 값이 들어오면, 시험 문제와 교재가 다른 셈이 되어 성능이 떨어진다.`

- [ ] **Step 5.4: 검증**

```bash
node --check js/ecosystem-easy.js && node --check js/ecosystem-terms.js
```
`ecosystem-easy.html`·`ecosystem-terms.html`을 열어 새 항목이 렌더되고 콘솔 에러가 없는지 스크린샷으로 확인.

- [ ] **Step 5.5: Commit**

```bash
git add -A && git commit -m "docs(eco): 쉬운 버전에 감시·재학습 비트, 용어 사전에 모니터링·학습-서빙 스큐 추가

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: 전체 검증 + 마무리

**Files:** (검증 중 발견한 것만 수정)

- [ ] **Step 6.1: 스크립트·문법 검증**

```bash
cd /Users/user/Downloads/adtech-blog
node --check js/ecosystem.js && node --check js/ecosystem-easy.js && node --check js/ecosystem-terms.js
node scripts/validate-posts.js
node generate-sitemap.js && node scripts/generate-feed.js && node scripts/build-search-index.js
git status --short   # 산출물이 바뀌었으면 그대로 커밋(정상), 의도 밖 파일이 있으면 조사
```

- [ ] **Step 6.2: 6개 흐름 전수 재생**

캐시 무효화한 컨텍스트에서 `ecosystem.html`을 열고 **modeler·rtb·modeling·attribution·hb·targeting 6개 모두** 끝까지 재생. 각 흐름에서:
- 모든 스텝에 패킷이 이동(제자리 스텝 없음)
- 진행 표시(N/총계) 정확
- 콘솔 에러 0

- [ ] **Step 6.3: 반응형·다크 확인 (스크린샷 6장, 각각 Read로 육안)**

| 화면 | 폭 | 확인 |
|---|---|---|
| ecosystem 라이트 | 1440 | 2층 구조·심장·수직 통로 |
| ecosystem 다크 | 1440 | 밴드/심장/파선 색이 잉크 톤과 조화 |
| ecosystem 모바일 | 600 | 지도 축소(is-compact) 시 라벨 겹침 없음 |
| index 라이트 | 1440 | 세로선이 DSP 위, 칩 6개 |
| ecosystem-easy | 1440 | 새 비트 2개 |
| ecosystem-terms | 1440 | 새 용어 2개 |

다크 확인은 새 컨텍스트에서 `localStorage.setItem('theme','dark')` → 재로드.

- [ ] **Step 6.4: 접근성·회귀 스윕**

```bash
grep -c "aria-label" ecosystem.html          # 지도 aria-label 존재
grep -n "cover-vdot\|cover-vlink\b" css/style.css index.html   # 구 선택자 잔존 0
```
그리고 지도에서 Tab 키로 노드 포커스 이동 → Enter로 패널 열림이 여전히 동작하는지 1회 확인(신규 노드 training·monitoring 포함).

- [ ] **Step 6.5: Commit**

```bash
git add -A && git commit -m "chore(eco): P2 전체 검증 — 6개 흐름·반응형·다크·산출물 재생성

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Self-Review 결과 (스펙 §5 대조)

| 스펙 §5 | 태스크 | 비고 |
|---|---|---|
| ① 지도 2층 재구성 (두뇌 층 4→7모듈) | T1 | 밴드 6개 + log-pipeline(아래에서 올라옴) = 7모듈. Training·Monitoring 신설 |
| ① pCTR/pCVR 심장 = 가장 크게 | T1 | 190×62 + 벽돌 테두리 + 맥박 |
| ① DSP ↔ pCTR 세로 연결선 | T1 | 중심 x 940 일치 → 직선 수직 파선(`is-layer-link`) |
| ② 새 대표 흐름 "모델러의 눈으로 보는 0.1초" | T2 | 15스텝, 칩 첫 자리·강조 |
| ② 기존 5개 흐름 유지 | T2-Step 2.4 | 전수 재생으로 회귀 확인 |
| ③ ML 모듈 클릭 = 정의+글+데모 | T1 | 신규 2노드에 def·posts·demos 채움(기존 패턴) |
| ④ easy·terms 가벼운 업데이트 | T5 | 비트 2개 + 용어 2개 |
| ⑤ 히어로 문구 중복 해소 | T4 | 표지=여정, 생태계=지도 조작 |
| P1 이관: 표지 vlink 위치 | T3 | DSP 노드에 고정 |
| P1 이관: 흐름 칩 딥링크 | T3 | `?flow=` + 표지 칩 6개 링크화 |

**placeholder 없음.** 타입/식별자 태스크 간 일치 확인: `heart`(NODES 플래그) · `layer`(EDGES 플래그) · `is-heart`/`is-layer-link`/`eco-brain-band`/`eco-heart-pulse`(CSS) · `BRAIN_BAND` · `openFlowFromUrl` · `cover-vlink-up` · 흐름 키 `modeler`.

**P2 진행 중 발견 (후속 폴리시 후보, 이번 스코프 아님):** 거래 층에 **기존부터** 있던 엣지-노드 관통이 13건 있다(T1 전후 동일 — 새 좌표 때문에 생긴 게 아님). 노드 배경이 반투명(`rgba(...,0.13)`)이라 선이 박스 안으로 비쳐 보인다. 가장 눈에 띄는 건 `mmp→advertiser`(log-pipeline·auction·exchange·dsp 4개 관통)와 `log-pipeline→feature-store`(publisher·header-bidding). 지도 가독성 폴리시를 따로 잡을 때 `channel`/`via`로 정리할 것. 전수 검사 스니펫은 이 계획의 T1 검증 기록 참고(경로를 4px 간격으로 샘플링해 노드 rect와 교차 판정).

**P3 이관 메모:** 신규 노드의 `posts` 배열이 가리키는 글(negative-sampling-bias, online-learning-delayed-feedback, multi-task-learning, calibration)은 P3/P4 콘텐츠 보강 대상이다. 신규 글 12편(P5) 중 4·5번(지표·모니터링)이 나오면 `monitoring` 노드의 `posts`에 추가할 것.
