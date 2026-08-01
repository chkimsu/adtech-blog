# 블로그 개편 P1 (프레임) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 스펙(`docs/superpowers/specs/2026-08-01-blog-redesign-design.md`) §1~§3·§6① 구현 — 읽기시간 제거, 네비 개편, 카테고리 레일, '살아있는 지도' 표지, 무대 카드·배지, `:::deep` 접이, 주석 색, ml-track.html.

**Architecture:** 순수 정적 사이트(HTML/CSS/vanilla JS, 빌드 없음). 글 메타 단일 소스 `js/posts.js`, 렌더는 `js/main.js`, 단일 스타일시트 `css/style.css`. 새 CSS는 **style.css 맨 끝에 섹션 추가**(cascade로 안전), JS는 기존 함수 옆에 추가.

**Tech Stack:** vanilla JS · marked v12 · highlight.js(atom-one-light CDN) · KaTeX · mermaid · Node(zero-dep 스크립트)

---

## ⚠ 전역 주의사항 (모든 태스크 공통)

1. **`js/main.js`에 리터럴 NUL(\x00) 바이트가 있다** — `preprocessMarkdown`의 586·599행 스태시 구분자. 절대 파일 전체 재작성 금지, Edit(정확한 문자열 치환)만 사용. **586행·599행은 old_string에 포함하지 말 것** (NUL은 타이핑 불가). 검색은 `grep -a`.
2. main.js·posts.js 수정 후 매번: `node --check js/main.js && node --check js/posts.js` → 에러 없어야 함.
3. 검증 서버: `python3 -m http.server 8931` (이미 떠 있으면 재사용). 스크린샷:
   ```bash
   CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
   "$CHROME" --headless --disable-gpu --window-size=1440,2400 --hide-scrollbars \
     --virtual-time-budget=9000 --screenshot=/tmp/check.png "http://localhost:8931/<페이지>"
   ```
   스크린샷은 Read 툴로 열어 육안 확인.
4. 커밋 identity는 repo-local로 `chkimsu <37789148+chkimsu@users.noreply.github.com>` 설정돼 있음. **push는 하지 않는다** (사용자 요청 시에만; push 전 `git fetch && git rebase origin/main` — CI가 sitemap/feed를 되커밋함).
5. 색 토큰: 무대 색은 기존 `--world-dot` 패턴 재사용 (`data-world` 속성: open-rtb→`--accent-primary`, walled-garden→`--accent-secondary`, both→`--text-secondary`). 카테고리 색은 style.css 697~710행 매핑 재사용.

---

### Task 1: 읽기시간 전면 제거

**Files:**
- Modify: `js/posts.js` (readTime 필드 46개 + `readMinutes` + `sortPosts` + exports)
- Modify: `js/main.js:322-327, 936-940, 1309`
- Modify: `posts-browse.html:69` (정렬 옵션)
- Modify: `scripts/validate-posts.js:13`, `scripts/new-post.js:93-117`
- Delete: `scripts/compute-read-time.js`
- Modify: `README.md`, `MARKDOWN_GUIDE.md` (절차·메타 목록)

- [ ] **Step 1.1: posts.js의 readTime 필드 일괄 제거 (codemod)**

```bash
cd /Users/user/Downloads/adtech-blog
node -e "
const fs=require('fs');
let s=fs.readFileSync('js/posts.js','utf8');
const n=(s.match(/^\s*readTime: '[^']*',?$/gm)||[]).length;
s=s.replace(/^\s*readTime: '[^']*',?\n/gm,'');
fs.writeFileSync('js/posts.js',s);
console.log('removed:',n);
"
```
Expected: `removed: 46` (± 현재 글 수). 객체 마지막 프로퍼티였던 경우 앞 줄의 trailing comma는 JS에서 유효하므로 그대로 둔다.

- [ ] **Step 1.2: posts.js의 readMinutes·정렬 모드 제거** — Edit로 아래 치환:

old:
```js
function readMinutes(p) { const m = String(p.readTime || '').match(/\d+/); return m ? parseInt(m[0], 10) : 0; }
function sortPosts(list, mode) {
  const arr = list.slice();
  if (mode === 'oldest')   return arr.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (mode === 'readtime') return arr.sort((a, b) => readMinutes(a) - readMinutes(b));
  return arr.sort((a, b) => new Date(b.date) - new Date(a.date)); // newest 기본
}
```
new:
```js
function sortPosts(list, mode) {
  const arr = list.slice();
  if (mode === 'oldest')   return arr.sort((a, b) => new Date(a.date) - new Date(b.date));
  return arr.sort((a, b) => new Date(b.date) - new Date(a.date)); // newest 기본
}
```
그리고 exports에서 old: `    sortPosts, readMinutes, getFeaturedPosts,` → new: `    sortPosts, getFeaturedPosts,`

- [ ] **Step 1.3: main.js 카드 메타에서 시간 제거** — Edit:

old:
```js
      <div class="post-meta">
        <span class="post-date">${formatDate(post.date)}</span>
        <span class="post-meta-sep">·</span>
        <span class="post-read-time">${post.readTime}</span>
      </div>
```
new:
```js
      <div class="post-meta">
        <span class="post-date">${formatDate(post.date)}</span>
      </div>
```

- [ ] **Step 1.4: main.js 글 헤더에서 시간 제거** — Edit:

old:
```js
        <span class="post-date">${formatDate(post.date)}</span>
        <span class="post-read-time">${post.readTime}</span>
        <button id="bookmark-btn" class="bookmark-btn" type="button" aria-pressed="false">♢ 저장</button>
```
new:
```js
        <span class="post-date">${formatDate(post.date)}</span>
        <button id="bookmark-btn" class="bookmark-btn" type="button" aria-pressed="false">♢ 저장</button>
```

- [ ] **Step 1.5: main.js 이어읽기 메타에서 시간 제거** — Edit:

old: `<span class="continue-reading-meta">${formatDate(item.post.date)} · ${item.post.readTime}</span>`
new: `<span class="continue-reading-meta">${formatDate(item.post.date)}</span>`

- [ ] **Step 1.6: posts-browse.html 정렬 옵션 제거** — Edit로 아래 한 줄 삭제:

```html
                <option value="readtime">읽기 시간순</option>
```

- [ ] **Step 1.7: 스크립트 정리**

`scripts/validate-posts.js` — old: `const REQUIRED = ['id', 'title', 'excerpt', 'date', 'categories', 'tags', 'contentUrl', 'readTime', 'world'];` → new: `const REQUIRED = ['id', 'title', 'excerpt', 'date', 'categories', 'tags', 'contentUrl', 'world'];`

`scripts/new-post.js` — 3곳:
- 주석 old: `// 8) posts.js 첫 요소로 엔트리 삽입 (excerpt 빈값 → 검증기가 작성 리마인드, readTime은 compute가 교정)` → new: `// 8) posts.js 첫 요소로 엔트리 삽입 (excerpt 빈값 → 검증기가 작성 리마인드)`
- 엔트리 템플릿 old:
```js
    contentUrl: 'posts/${slug}.md',
    readTime: '1 min read'
  },
```
  new:
```js
    contentUrl: 'posts/${slug}.md'
  },
```
- 안내 old:
```js
  console.log('  2) node scripts/compute-read-time.js');
  console.log('  3) node scripts/validate-posts.js');
  console.log('  4) chkimsu 계정으로 커밋 (회사 이메일 금지)');
```
  new:
```js
  console.log('  2) node scripts/validate-posts.js');
  console.log('  3) chkimsu 계정으로 커밋 (회사 이메일 금지)');
```

삭제: `git rm scripts/compute-read-time.js`

- [ ] **Step 1.8: 문서 갱신**

`README.md` — "새 글 추가" 코드 블록에서 `# 3) 읽기시간 자동 계산...` + `node scripts/compute-read-time.js` 두 줄 삭제, 이후 단계 번호 3)·4)로 당김. 프로젝트 구조 트리의 `compute-read-time.js` 줄 삭제.
`MARKDOWN_GUIDE.md` — "새 글 추가 — 한 흐름" 블록에서 3) compute-read-time 단계 삭제·번호 당김. 메타데이터 목록 old: `` `id`(=slug), `title`, `excerpt`, `date`, `categories`, `tags`, `contentUrl`, `readTime`. `` → new: `` `id`(=slug), `title`, `excerpt`, `date`, `categories`, `tags`, `contentUrl`. ``

- [ ] **Step 1.9: 검증**

```bash
node --check js/posts.js && node --check js/main.js
node scripts/validate-posts.js          # → "✓ 46개 글 검증 통과 ..."
grep -a -rn "readTime\|min read\|readMinutes" js/ scripts/ *.html README.md MARKDOWN_GUIDE.md | grep -v Binary
```
Expected: grep 결과 0줄.

- [ ] **Step 1.10: Commit**

```bash
git add -A && git commit -m "feat(frame): 읽기시간 전면 제거 — 필드·표기·정렬·스크립트 일괄

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: 네비·푸터 개편 + about 리다이렉트 + sitemap

**Files:**
- Modify: 26개 HTML (about 제외 전부 — nav `<ul class="nav-links">` 제거, ML 트랙 링크 추가, 푸터 교체)
- Rewrite: `about.html` (리다이렉트 전용)
- Modify: `generate-sitemap.js`
- Create(임시): `/private/tmp/claude-501/.../scratchpad/nav-migrate.js` — 커밋하지 않음

- [ ] **Step 2.1: 코드모드 스크립트 작성** (스크래치패드에, repo 밖):

```js
#!/usr/bin/env node
// 일회성: 전 HTML 네비·푸터 개편. repo 루트에서 실행.
const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
let touched = 0;
for (const f of files) {
  if (f === 'about.html') continue; // 리다이렉트로 별도 재작성
  let s = fs.readFileSync(f, 'utf8');
  const orig = s;
  s = s.replace(/[ \t]*<ul class="nav-links">[\s\S]*?<\/ul>\n/, '');
  if (!s.includes('ml-track.html')) {
    s = s.replace(/(<a href="demos.html" class="btn-demo[^"]*">데모<\/a>)/,
      '$1\n          <a href="ml-track.html" class="btn-demo btn-ml">▸ ML 트랙</a>');
  }
  s = s.replace(/<a href="about.html">소개<\/a>/,
    '<a href="posts-browse.html">Posts</a>\n        <a href="ml-track.html">ML 트랙</a>');
  if (s !== orig) { fs.writeFileSync(f, s); touched++; }
}
console.log('updated files:', touched);
```

- [ ] **Step 2.2: 실행 + 확인**

```bash
cd /Users/user/Downloads/adtech-blog && node <scratchpad>/nav-migrate.js
grep -l 'nav-links' *.html               # → about.html 만 (다음 스텝에서 재작성)
grep -L 'ml-track.html' *.html           # → about.html 만
grep -l 'about.html' *.html              # → about.html 만
```

- [ ] **Step 2.3: about.html을 리다이렉트 페이지로 재작성** (Write로 전체 교체):

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="0; url=index.html">
  <link rel="canonical" href="https://chkimsu.github.io/adtech-blog/">
  <title>Ad Tech Blog</title>
</head>
<body>
  <p>이 페이지는 표지로 이동했습니다. <a href="index.html">바로 가기 →</a></p>
</body>
</html>
```

- [ ] **Step 2.4: generate-sitemap.js에서 about 제외 + ml-track 추가** — Edit:

old: `urls.push(urlEntry(\`${BASE_URL}/about.html\`, today, '0.6'));`
new: `urls.push(urlEntry(\`${BASE_URL}/ml-track.html\`, today, '0.8', 'weekly'));`

- [ ] **Step 2.5: 검증** — 스크린샷으로 home.html 상단 네비 확인: '홈·소개' 텍스트 링크 없음, `Posts · Ecosystem · 데모 · ▸ ML 트랙` 순. (ml-track.html은 Task 9에서 생성 — 링크 404는 지금 단계에선 정상)

- [ ] **Step 2.6: Commit**

```bash
git add -A && git commit -m "feat(frame): 네비·푸터 개편 — 홈·소개 메뉴 제거, ML 트랙 진입 추가, about 리다이렉트

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: 좌측 카테고리 레일 (CSS + 렌더러 + 3페이지 적용)

**Files:**
- Modify: `css/style.css` (맨 끝에 레일 섹션 + Software Engineering 색)
- Modify: `js/main.js` (`renderCategoryRail` 추가 + DOMContentLoaded 호출)
- Modify: `home.html`, `posts-browse.html` (rail-layout 래핑, 중복 legend 제거)

- [ ] **Step 3.1: style.css 맨 끝에 추가** — Software Engineering 카테고리 색(기존 매핑에 빠져 있음) + 레일:

```css
/* ========================================
   P1 — Software Engineering 카테고리 색 (기존 매핑 보완)
   ======================================== */
.post-card-category[data-category="Software Engineering"] { background: #6a7891; }
.post-card[data-category="Software Engineering"] { border-left: 3px solid #6a7891; }

/* ========================================
   P1 — 네비 ML 트랙 버튼 강조 (T2에서 마크업만 먼저 들어감)
   ======================================== */
.btn-ml { background: var(--accent-primary); border-color: var(--accent-primary); color: var(--bg-primary) !important; font-weight: 700; }
.btn-ml:hover { filter: brightness(1.08); }

/* ========================================
   P1 — 좌측 카테고리 레일 (목록성 페이지)
   ======================================== */
.rail-layout { display: grid; grid-template-columns: 232px minmax(0, 1fr); max-width: 1400px; margin: 0 auto; }
.category-rail { border-right: 1px solid var(--border-color); padding: 1.6rem 1.1rem 2rem; }
.category-rail-inner { position: sticky; top: 84px; }
.rail-title { font-size: 0.68rem; letter-spacing: 0.15em; color: var(--text-muted); text-transform: uppercase; margin: 0 0 0.6rem; font-weight: 600; }
.rail-cat { display: flex; align-items: center; gap: 0.5rem; padding: 0.42rem 0; font-size: 0.86rem; color: var(--text-primary); text-decoration: none; border-bottom: 1px dotted var(--border-color); }
.rail-cat:hover { color: var(--accent-primary); }
.rail-dot { width: 8px; height: 8px; border-radius: 2px; background: var(--text-muted); flex: 0 0 auto; }
.rail-dot[data-category="Bandits & Personalization"] { background: #9c5a44; }
.rail-dot[data-category="Bidding & Auction"]         { background: #5a6b7a; }
.rail-dot[data-category="ML Infrastructure"]         { background: #a8783a; }
.rail-dot[data-category="Measurement & Modeling"]    { background: #5f7a63; }
.rail-dot[data-category="DevOps & Tooling"]          { background: #7d5e72; }
.rail-dot[data-category="Targeting & Audience"]      { background: #9a7d38; }
.rail-dot[data-category="Software Engineering"]      { background: #6a7891; }
.rail-count { margin-left: auto; font-size: 0.74rem; color: var(--text-muted); }
.rail-ml { display: block; margin-top: 1rem; background: var(--accent-primary); color: var(--bg-primary); border-radius: 8px; padding: 0.8rem 0.85rem; text-decoration: none; }
.rail-ml:hover { filter: brightness(1.06); }
.rail-ml b { display: block; font-size: 0.88rem; margin-bottom: 0.15rem; }
.rail-ml span { font-size: 0.74rem; opacity: 0.85; line-height: 1.5; display: block; }
.rail-stage { margin-top: 1.2rem; padding-top: 0.9rem; border-top: 1px solid var(--border-color); }
.rail-stage .world-legend-item { display: flex; align-items: center; gap: 0.45rem; font-size: 0.76rem; color: var(--text-secondary); padding: 0.18rem 0; }
@media (max-width: 1023px) {
  .rail-layout { display: block; }
  .category-rail { border-right: none; border-bottom: 1px solid var(--border-color); padding: 0.8rem 1rem; }
  .category-rail-inner { position: static; display: flex; gap: 0.55rem; overflow-x: auto; align-items: center; -webkit-overflow-scrolling: touch; }
  .rail-title, .rail-count, .rail-stage { display: none; }
  .rail-cat { border: 1px solid var(--border-color); border-radius: 999px; padding: 0.3rem 0.7rem; white-space: nowrap; }
  .rail-ml { margin-top: 0; padding: 0.32rem 0.7rem; border-radius: 999px; white-space: nowrap; }
  .rail-ml b { display: inline; font-size: 0.8rem; margin: 0; }
  .rail-ml span { display: none; }
}
```

- [ ] **Step 3.2: main.js에 renderCategoryRail 추가** — `renderWorldLegend` 함수 끝(`}` 다음 빈 줄, `function renderPostCard(post) {` 바로 앞)에 삽입:

```js
// 좌측 카테고리 레일 — #category-rail 컨테이너가 있는 목록성 페이지에서 렌더 (없으면 no-op)
function renderCategoryRail() {
  const el = document.getElementById('category-rail');
  if (!el || typeof posts === 'undefined') return;
  const counts = {};
  posts.forEach(p => (p.categories || []).forEach(c => { counts[c] = (counts[c] || 0) + 1; }));
  const cats = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const catItems = cats.map(c =>
    `<a class="rail-cat" href="posts-browse.html?category=${encodeURIComponent(c)}">
      <span class="rail-dot" data-category="${c}"></span>${c}<span class="rail-count">${counts[c]}</span></a>`).join('');
  const legend = (typeof WORLD_META !== 'undefined') ? Object.keys(WORLD_META).map(id => {
    const m = WORLD_META[id];
    return `<span class="world-legend-item"><span class="world-dot" data-world="${id}"></span>${m.label} · ${m.short}</span>`;
  }).join('') : '';
  el.innerHTML = `<div class="category-rail-inner">
    <div class="rail-title">주제로 찾기</div>
    ${catItems}
    <a class="rail-ml" href="ml-track.html"><b>▸ ML 엔지니어 트랙</b><span>pCTR/pCVR 실무 커리큘럼 — 입문→실무→심화</span></a>
    <div class="rail-stage"><div class="rail-title">무대 — 이 글이 노는 곳</div>${legend}</div>
  </div>`;
}
```

호출 연결 — Edit:
old:
```js
  // 무대 범례(목록 페이지에 #world-legend 컨테이너가 있으면 채움)
  renderWorldLegend();
```
new:
```js
  // 무대 범례(목록 페이지에 #world-legend 컨테이너가 있으면 채움)
  renderWorldLegend();

  // 좌측 카테고리 레일(#category-rail 있는 페이지)
  renderCategoryRail();
```

- [ ] **Step 3.3: home.html에 레일 적용** — 두 Edit:

old: `  <!-- Main Content Wrapper -->\n  <div id="main-content">`
new: `  <!-- Main Content Wrapper (레일 + 본문) -->\n  <div class="rail-layout">\n  <aside id="category-rail" class="category-rail" aria-label="카테고리"></aside>\n  <div id="main-content">`

old: `  </div><!-- End of main content wrapper -->`
new: `  </div><!-- End of main content wrapper -->\n  </div><!-- End of rail-layout -->`

그리고 중복 범례 제거 — old: `        <div id="world-legend" class="world-legend"></div>\n` → new: (빈 문자열)

- [ ] **Step 3.4: posts-browse.html에 레일 적용** — 두 Edit:

old: `  <main>`
new: `  <div class="rail-layout">\n  <aside id="category-rail" class="category-rail" aria-label="카테고리"></aside>\n  <main>`

old: `  </main>`
new: `  </main>\n  </div><!-- End of rail-layout -->`

그리고 old: `        <div id="world-legend" class="world-legend"></div>\n` → new: (빈 문자열)

- [ ] **Step 3.5: 검증** — `node --check js/main.js` 통과. home.html·posts-browse.html 스크린샷: 좌측에 카테고리 7개 + 글 수 + ML 트랙 블록 + 무대 범례. `--window-size=800,1400`으로 한 장 더: 레일이 상단 가로 칩으로 접힘.

- [ ] **Step 3.6: Commit**

```bash
git add -A && git commit -m "feat(frame): 좌측 카테고리 레일 — home·browse 적용, SE 카테고리 색 보완

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: 표지 전면 교체 — '살아있는 지도'

**Files:**
- Rewrite: `index.html` (head 메타·테마 스크립트는 기존 것 유지, body 전면 교체)
- Modify: `css/style.css` (맨 끝에 cover 섹션)
- Modify: `js/main.js` (`renderCover` 단순화)

참조: 승인 목업 `docs/superpowers/specs/2026-08-01-cover-mockup-approved.html` (클래스명만 `cvB-*`→`cover-*`로 정리해 이식)

- [ ] **Step 4.1: index.html body 교체** — `<body>`~`</body>`를 아래로 (head는 기존 유지, KaTeX 불필요):

```html
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

  <div class="rail-layout">
  <aside id="category-rail" class="category-rail" aria-label="카테고리"></aside>
  <div id="main-content">
    <section class="cover-hero" id="cover-root">
      <div class="container">
        <div class="cover-kicker">한국어로 읽는 애드테크</div>
        <h1 class="cover-head">0.1초 안에 벌어지는<br>광고 한 편의 여정</h1>
        <p class="cover-dek">페이지가 뜨는 사이 경매가 열리고, 모델이 '누를 확률'을 찍고, 낙찰이 끝납니다.
        그 안쪽을 그림·데모·코드로 풀어 쓴 글 — 심장은 pCTR/pCVR입니다.</p>
        <div class="cover-cta-row">
          <a href="post.html?id=adtech-30min-primer" class="btn-try cover-cta-primary">30분 입문 가이드 →</a>
          <a href="posts-browse.html" class="btn-try">글 전체 둘러보기 →</a>
        </div>

        <a class="cover-map" href="ecosystem.html" aria-label="광고 생태계 지도로 이동">
          <div class="cover-map-tag"><span>LIVE — 광고 생태계 미니 지도</span><b>클릭하면 전체 지도로 →</b></div>
          <div class="cover-brain">
            <span class="cover-layer-label">두뇌 층</span>
            <div class="cover-bnode">Feature Store<small>피처 공급</small></div>
            <div class="cover-bnode cover-heart">pCTR / pCVR<small>누를·살 확률 예측</small></div>
            <div class="cover-bnode">Calibration<small>확률 보정</small></div>
          </div>
          <div class="cover-vlink"><i></i><span class="cover-vdot"></span></div>
          <div class="cover-lane">
            <span class="cover-layer-label">거래 층</span>
            <div class="cover-wire"></div>
            <div class="cover-dot"></div><div class="cover-dot d2"></div><div class="cover-dot d3"></div>
            <div class="cover-node">사용자<small>페이지 열림</small></div>
            <div class="cover-node">Publisher · SSP<small>지면 판매</small></div>
            <div class="cover-node">Ad Exchange<small>경매장</small></div>
            <div class="cover-node cover-dsp">DSP<small>입찰 — 두뇌에 질문</small></div>
            <div class="cover-node">광고주<small>낙찰·집행</small></div>
          </div>
          <div class="cover-flows">
            <span class="cover-flow is-on">▶ 100ms RTB</span>
            <span class="cover-flow">▶ 모델 학습·서빙</span>
            <span class="cover-flow">▶ 어트리뷰션</span>
            <span class="cover-flow">▶ Header Bidding</span>
            <span class="cover-flow">▶ 데이터·타겟팅</span>
          </div>
        </a>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="home-section-head"><h2>지금 읽을거리</h2><a href="home.html">큐레이션 홈 →</a></div>
        <div id="cover-featured" class="posts-grid"></div>
        <div class="home-browse-cta"><a href="demos.html" class="btn-try">인터랙티브 데모 둘러보기 →</a></div>
      </div>
    </section>
  </div><!-- End of main content wrapper -->
  </div><!-- End of rail-layout -->

  <footer>
    <div class="footer-content">
      <div class="footer-links">
        <a href="index.html">홈</a>
        <a href="posts-browse.html">Posts</a>
        <a href="ml-track.html">ML 트랙</a>
        <a href="ecosystem.html">Ecosystem</a>
        <a href="https://github.com/chkimsu/adtech-blog" target="_blank" rel="noopener">GitHub</a>
      </div>
      <p class="footer-text">
        &copy; 2026 Ad Tech Blog. 한국어로 읽는 애드테크 기술 블로그.
      </p>
    </div>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="js/posts.js"></script>
  <script src="js/reading-state.js"></script>
  <script src="js/main.js"></script>
</body>
```

- [ ] **Step 4.2: style.css 맨 끝에 cover 섹션 추가**:

```css
/* ========================================
   P1 — 표지 '살아있는 지도' (index.html)
   ======================================== */
.cover-hero { padding: 3.2rem 0 2.2rem; }
.cover-kicker { font-size: 0.72rem; letter-spacing: 0.18em; color: var(--accent-primary); font-weight: 700; margin-bottom: 0.7rem; }
.cover-head { font-family: var(--font-serif); font-size: clamp(2.2rem, 4.6vw, 3.4rem); line-height: 1.12; font-weight: 900; margin: 0 0 0.8rem; }
.cover-dek { font-size: 1.02rem; color: var(--text-secondary); line-height: 1.65; max-width: 620px; margin-bottom: 1.1rem; }
.cover-cta-primary { background: var(--accent-primary); color: var(--bg-primary); border-color: var(--accent-primary); }

.cover-map { display: block; margin-top: 1.6rem; background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 10px; padding: 1.3rem 1.4rem 1rem; box-shadow: var(--shadow-md); text-decoration: none; color: var(--text-primary); }
.cover-map:hover { border-color: var(--accent-primary); }
.cover-map-tag { display: flex; justify-content: space-between; font-size: 0.66rem; letter-spacing: 0.14em; color: var(--text-muted); margin-bottom: 1.1rem; }
.cover-map-tag b { color: var(--accent-primary); }
.cover-layer-label { position: absolute; left: 0; top: -1rem; font-size: 0.6rem; letter-spacing: 0.12em; color: var(--text-muted); }
.cover-brain { position: relative; display: flex; justify-content: center; gap: 0.7rem; margin: 1rem 0 0.3rem; }
.cover-bnode { background: var(--bg-tertiary); border: 1px solid var(--accent-secondary); font-size: 0.74rem; padding: 0.45rem 0.7rem;
  border-radius: 5px; text-align: center; color: var(--text-secondary); line-height: 1.35; }
.cover-bnode small { display: block; font-size: 0.6rem; color: var(--text-muted); }
.cover-heart { background: var(--accent-primary); border-color: var(--accent-primary); color: var(--bg-primary); font-weight: 700; animation: cover-pulse 2s infinite; }
.cover-heart small { color: var(--bg-primary); opacity: 0.78; }
@keyframes cover-pulse { 0%, 100% { box-shadow: 0 0 0 3px rgba(176, 68, 44, 0.10); } 50% { box-shadow: 0 0 0 8px rgba(176, 68, 44, 0.18); } }
.cover-vlink { display: flex; justify-content: center; height: 24px; position: relative; }
.cover-vlink i { border-left: 2px dashed rgba(176, 68, 44, 0.5); }
.cover-vdot { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: var(--accent-primary); left: calc(50% - 3px); animation: cover-updown 1.6s ease-in-out infinite; }
@keyframes cover-updown { 0%, 100% { top: 2px; } 50% { top: 16px; } }
.cover-lane { position: relative; display: flex; justify-content: space-between; align-items: center; padding: 1rem 0 0.3rem; }
.cover-wire { position: absolute; top: 55%; left: 3%; right: 3%; height: 1px; background: var(--border-color); }
.cover-node { position: relative; z-index: 2; background: var(--bg-tertiary); border: 1px solid var(--border-color); font-size: 0.78rem;
  padding: 0.55rem 0.75rem; border-radius: 6px; text-align: center; line-height: 1.35; }
.cover-node small { display: block; font-size: 0.62rem; color: var(--text-muted); }
.cover-dsp { border-color: var(--accent-primary); border-width: 2px; }
.cover-dot { position: absolute; top: calc(55% - 4px); width: 8px; height: 8px; border-radius: 50%; background: var(--accent-primary); z-index: 3; animation: cover-run 3.4s linear infinite; }
.cover-dot.d2 { animation-delay: 1.1s; background: var(--accent-secondary); }
.cover-dot.d3 { animation-delay: 2.2s; background: #5f7a63; }
@keyframes cover-run { 0% { left: 3%; opacity: 0; } 6% { opacity: 1; } 94% { opacity: 1; } 100% { left: 94%; opacity: 0; } }
.cover-flows { display: flex; gap: 0.5rem; margin-top: 0.9rem; flex-wrap: wrap; }
.cover-flow { font-size: 0.74rem; border: 1px solid var(--border-color); background: var(--bg-primary); padding: 0.32rem 0.75rem; border-radius: 999px; color: var(--text-secondary); }
.cover-flow.is-on { background: var(--accent-primary); border-color: var(--accent-primary); color: var(--bg-primary); font-weight: 600; }
@media (max-width: 768px) {
  .cover-lane { flex-wrap: wrap; gap: 0.4rem; }
  .cover-node { font-size: 0.7rem; padding: 0.4rem 0.5rem; }
  .cover-wire, .cover-dot { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .cover-dot, .cover-vdot, .cover-heart { animation: none; }
}
```

- [ ] **Step 4.3: renderCover 단순화** — Edit:

old:
```js
// 표지(랜딩) — 통계 + 최근 글 미리보기 (#cover-root 가드)
function renderCover() {
  const stats = document.getElementById('cover-stats');
  if (stats && typeof posts !== 'undefined') {
    const seriesCount = (typeof series !== 'undefined') ? Object.keys(series).length : 0;
    stats.textContent = `글 ${posts.length}편 · 시리즈 ${seriesCount}개 · 인터랙티브 데모 12개`;
  }
  const featured = document.getElementById('cover-featured');
  if (featured && typeof getAllPosts === 'function') {
    featured.innerHTML = '';
    getAllPosts().slice(0, 3).forEach(p => featured.appendChild(renderPostCard(p)));
  }
}
```
new:
```js
// 표지(랜딩) — 살아있는 미니 지도 아래 '지금 읽을거리' 채움 (#cover-root 가드)
function renderCover() {
  const featured = document.getElementById('cover-featured');
  if (featured && typeof getAllPosts === 'function') {
    featured.innerHTML = '';
    getAllPosts().slice(0, 3).forEach(p => featured.appendChild(renderPostCard(p)));
  }
}
```

- [ ] **Step 4.4: 검증** — `node --check js/main.js`. index.html 스크린샷(라이트+다크: 다크는 `--virtual-time-budget` 전에 localStorage 설정이 어려우므로 스크린샷은 라이트만, 다크는 Task 10에서 브라우저로 육안): 레일 + 히어로 + 2층 지도 + 읽을거리 3카드. 모바일 폭(800px) 스크린샷 1장.

- [ ] **Step 4.5: Commit**

```bash
git add -A && git commit -m "feat(frame): 표지 전면 교체 — '살아있는 지도' 히어로 (2층 미니 지도 + CSS 애니메이션)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: 글 상단 '무대 카드'

**Files:**
- Modify: `js/main.js` (renderStageCard 추가, 글 헤더 교체)
- Modify: `css/style.css` (맨 끝 stage-card 섹션)
- Modify: `scripts/validate-posts.js` (worldPractical 타입 체크)

- [ ] **Step 5.1: main.js에 renderStageCard 추가** — `renderWorldBadge` 함수 위(`function renderWorldBadge(post, context) {` 바로 앞)에 삽입:

```js
// 무대 카드 — 글 상단: 세 무대 중 어디 이야기인지 칩으로 + 이유 + (선택) 실무 안내.
// world가 없거나 'na'면 빈 문자열(카드 없음).
function renderStageCard(post) {
  const list = (typeof getWorldList === 'function') ? getWorldList(post) : [];
  if (!list.length) return '';
  const chips = Object.keys(WORLD_META).map(id => {
    const m = WORLD_META[id];
    const on = list.includes(id);
    return `<span class="stage-chip${on ? ' is-on' : ''}" data-world="${id}" title="${String(m.tip).replace(/"/g, '&quot;')}">${on ? '✓ ' : ''}${m.label}<em>${m.short}</em></span>`;
  }).join('');
  return `<div class="stage-card">
    <div class="stage-card-label">이 글의 무대</div>
    <div class="stage-card-chips">${chips}</div>
    ${post.worldNote ? `<p class="stage-card-note">${post.worldNote}</p>` : ''}
    ${post.worldPractical ? `<p class="stage-card-practical"><b>담장 안(네이버·카카오)에서 일한다면</b> — ${post.worldPractical}</p>` : ''}
  </div>`;
}
```

- [ ] **Step 5.2: 글 헤더 교체** — Edit (Task 1 이후의 현재 상태 기준):

old:
```js
    const worldBadges = renderWorldBadge(post, 'detail');
    headerContainer.innerHTML = `
      <div class="post-meta">
        <span class="post-date">${formatDate(post.date)}</span>
        <button id="bookmark-btn" class="bookmark-btn" type="button" aria-pressed="false">♢ 저장</button>
      </div>
      ${worldBadges ? `<div class="world-badge-row">${worldBadges}</div>` : ''}
      <h1>${post.title}</h1>
      ${post.worldNote ? `<p class="post-world-note">${post.worldNote}</p>` : ''}
```
new:
```js
    headerContainer.innerHTML = `
      <div class="post-meta">
        <span class="post-date">${formatDate(post.date)}</span>
        <button id="bookmark-btn" class="bookmark-btn" type="button" aria-pressed="false">♢ 저장</button>
      </div>
      <h1>${post.title}</h1>
      ${renderStageCard(post)}
```

- [ ] **Step 5.3: style.css 맨 끝에 추가**:

```css
/* ========================================
   P1 — 무대 카드 (글 상단)
   ======================================== */
.stage-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-left: 3px solid var(--accent-primary);
  border-radius: 8px; padding: 0.95rem 1.1rem; margin: 1.1rem auto 0; max-width: 760px; text-align: left; }
.stage-card-label { font-size: 0.66rem; letter-spacing: 0.14em; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 0.55rem; }
.stage-card-chips { display: flex; gap: 0.45rem; flex-wrap: wrap; margin-bottom: 0.6rem; }
.stage-chip { font-size: 0.76rem; border: 1px solid var(--border-color); border-radius: 999px; padding: 0.26rem 0.7rem; color: var(--text-muted); opacity: 0.55; }
.stage-chip em { font-style: normal; margin-left: 0.3rem; font-size: 0.68rem; opacity: 0.8; }
.stage-chip.is-on { opacity: 1; color: var(--bg-primary); background: var(--world-dot, var(--text-secondary)); border-color: transparent; font-weight: 600; }
.stage-chip[data-world="open-rtb"]      { --world-dot: var(--accent-primary); }
.stage-chip[data-world="walled-garden"] { --world-dot: var(--accent-secondary); }
.stage-chip[data-world="both"]          { --world-dot: #5f7a63; }
[data-theme="dark"] .stage-chip[data-world="both"] { --world-dot: #7d9a80; } /* 다크 잉크 텍스트 대비 확보(세이지 고정 hex는 다크에서 ~3.5:1) */
.stage-card-note { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin: 0; }
.stage-card-practical { font-size: 0.84rem; color: var(--text-secondary); line-height: 1.6; margin: 0.5rem 0 0; padding-top: 0.5rem; border-top: 1px dotted var(--border-color); }
.stage-card-practical b { color: var(--accent-primary); }
```

- [ ] **Step 5.4: validate-posts.js에 worldPractical 타입 체크** — Edit:

old: `  if (p.worldNote != null && typeof p.worldNote !== 'string') errors.push(\`${where}: worldNote는 문자열이어야 함\`);`
new:
```js
  if (p.worldNote != null && typeof p.worldNote !== 'string') errors.push(`${where}: worldNote는 문자열이어야 함`);
  if (p.worldPractical != null && typeof p.worldPractical !== 'string') errors.push(`${where}: worldPractical은 문자열이어야 함`);
```

- [ ] **Step 5.5: 검증** — `node --check js/main.js && node scripts/validate-posts.js`. 스크린샷 `post.html?id=attribution-basics`: 제목 아래 무대 카드(공통 활성, 나머지 흐림 + worldNote 문장). `post.html?id=software-architecture-patterns`(world:'na'): 카드 없음 확인.

- [ ] **Step 5.6: Commit**

```bash
git add -A && git commit -m "feat(frame): 글 상단 무대 카드 — 3무대 칩 + 이유 + worldPractical 필드

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: 본문 '무대 전환 배지' (`[무대: …]` 헤딩 마커)

**Files:**
- Modify: `js/main.js` (applyStageMarkers 추가·호출, buildPostTOC 마커 제외)
- Modify: `css/style.css` (stage-inline-badge)
- Modify: `scripts/build-search-index.js` (마커 색인 제외)
- Modify: `MARKDOWN_GUIDE.md` (문법 문서화)

- [ ] **Step 6.1: main.js에 applyStageMarkers 추가** — `enhanceCodeBlocks` 함수 위(주석 블록 `// Code Block Post-Processing` 시작 `// ========================================` 바로 앞)에 삽입:

```js
// ========================================
// 섹션 무대 배지 — 헤딩 끝 '[무대: 열린 RTB]' 마커를 색 배지로 치환.
// TOC·슬러그가 마커를 포함하지 않도록 dataset.tocText에 깨끗한 제목을 남긴다.
// ========================================

const STAGE_MARKER_WORLDS = { '열린 RTB': 'open-rtb', '닫힌 생태계': 'walled-garden', '공통': 'both' };

function applyStageMarkers(container) {
  container.querySelectorAll('h2, h3').forEach(h => {
    const m = h.textContent.match(/\s*\[무대:\s*(열린 RTB|닫힌 생태계|공통)\]\s*$/);
    if (!m) return;
    const clean = h.textContent.replace(m[0], '').trim();
    h.textContent = clean;
    h.dataset.tocText = clean;
    const badge = document.createElement('span');
    badge.className = 'stage-inline-badge';
    badge.dataset.world = STAGE_MARKER_WORLDS[m[1]];
    badge.textContent = m[1];
    h.appendChild(badge);
  });
}
```

- [ ] **Step 6.2: 렌더 파이프라인에 호출 삽입** — Edit:

old:
```js
      // Enhance code blocks with language label + copy button
      enhanceCodeBlocks(contentContainer);
```
new:
```js
      // 섹션 무대 배지 — [무대: …] 마커를 배지로 (TOC 생성보다 먼저)
      applyStageMarkers(contentContainer);

      // Enhance code blocks with language label + copy button
      enhanceCodeBlocks(contentContainer);
```

- [ ] **Step 6.3: buildPostTOC가 깨끗한 제목을 쓰도록** — 두 Edit:

old:
```js
  headings.forEach(heading => {
    let slug = heading.textContent
      .trim()
```
new:
```js
  headings.forEach(heading => {
    let slug = (heading.dataset.tocText || heading.textContent)
      .trim()
```

old:
```js
      <span class="toc-text">${h.textContent}</span>
```
new:
```js
      <span class="toc-text">${h.dataset.tocText || h.textContent}</span>
```

- [ ] **Step 6.4: style.css 맨 끝에 추가**:

```css
/* ========================================
   P1 — 본문 무대 전환 배지 (헤딩 옆)
   ======================================== */
.stage-inline-badge { display: inline-block; vertical-align: middle; margin-left: 0.55rem; font-family: var(--font-sans);
  font-size: 0.62em; font-weight: 600; letter-spacing: 0.02em; color: var(--bg-primary); background: var(--world-dot, var(--text-secondary));
  border-radius: 999px; padding: 0.18em 0.75em; white-space: nowrap; }
.stage-inline-badge[data-world="open-rtb"]      { --world-dot: var(--accent-primary); }
.stage-inline-badge[data-world="walled-garden"] { --world-dot: var(--accent-secondary); }
.stage-inline-badge[data-world="both"]          { --world-dot: #5f7a63; }
[data-theme="dark"] .stage-inline-badge[data-world="both"] { --world-dot: #7d9a80; } /* T5와 동일한 다크 대비 확보 */
```

- [ ] **Step 6.5: 검색 색인에서 마커 제외** — `scripts/build-search-index.js` Edit:

old:
```js
const strip = md => md
  .replace(/```[\s\S]*?```/g, ' ')           // 코드 펜스
```
new:
```js
const strip = md => md
  .replace(/\[무대:\s*[^\]]*\]/g, ' ')       // 무대 전환 마커 (렌더 전용 — 색인 제외)
  .replace(/```[\s\S]*?```/g, ' ')           // 코드 펜스
```

- [ ] **Step 6.6: MARKDOWN_GUIDE.md에 문법 추가** — "메타데이터 & 분류 (중요)" 섹션 앞에 삽입:

```markdown
## 무대 전환 배지 (본문 안)

글 전체 무대는 `posts.js`의 `world`/`worldNote`가 담당하지만, **본문 중간에 무대가 바뀌는 섹션**은
헤딩 끝에 마커를 붙이면 제목 옆 색 배지로 렌더됩니다:

​```markdown
## 3. 헤더비딩의 원리 [무대: 열린 RTB]
### 담장 안에선 어떻게 다른가 [무대: 닫힌 생태계]
​```

- 허용 값: `열린 RTB` / `닫힌 생태계` / `공통` (그 외는 마커가 일반 텍스트로 노출됨)
- 목차(TOC)·검색 색인에는 마커가 나타나지 않습니다.
```

(위 코드 펜스의 제로폭 문자는 실제 파일에서는 제거하고 일반 ``` 펜스로 작성)

- [ ] **Step 6.7: 실물 검증 (임시 마커 주입 → 확인 → 원복)**

```bash
cd /Users/user/Downloads/adtech-blog
# 임시: attribution-basics의 '4. 실제로 누가 재나' 헤딩에 마커 부착
perl -pi -e 's/^## 4\. 실제로 누가 재나$/## 4. 실제로 누가 재나 [무대: 공통]/' posts/attribution-basics.md
```
스크린샷 `post.html?id=attribution-basics`: 해당 헤딩 옆 세이지 배지, 좌측 TOC에는 `[무대:` 텍스트 없음.
```bash
git checkout -- posts/attribution-basics.md   # 원복 (본문 변경은 P3 몫)
node --check js/main.js
```

- [ ] **Step 6.8: Commit**

```bash
git add -A && git commit -m "feat(frame): 본문 무대 전환 배지 — [무대: …] 헤딩 마커 렌더 + TOC·색인 제외

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: `:::deep` 접이식 심화 블록

**Files:**
- Modify: `js/main.js` (`preprocessMarkdown` 확장 — ⚠ NUL 라인 회피)
- Modify: `css/style.css` (deep-dive)
- Modify: `MARKDOWN_GUIDE.md`

- [ ] **Step 7.1: preprocessMarkdown에 변환 추가** — Edit. **anchor는 아래 한 줄만** (이 줄엔 NUL 없음; 두 줄 아래 599행은 NUL 포함이므로 건드리지 않는다):

old:
```js
  text = text.replace(/\*\*(?!\s)([^\n]+?)(?<!\s)\*\*/g, '<strong>$1</strong>');
```
new:
```js
  text = text.replace(/\*\*(?!\s)([^\n]+?)(?<!\s)\*\*/g, '<strong>$1</strong>');

  // ':::deep 제목' ~ ':::' → 접이식 심화 블록 (초심자는 건너뛰고, 실무자는 펼쳐 본다)
  // 코드 펜스는 위에서 스태시로 보호된 뒤라 코드 안의 :::는 안전하다.
  text = text.replace(/^:::deep[ \t]*(.*)\n([\s\S]*?)^:::[ \t]*$/gm,
    (_, title, body) => `<details class="deep-dive"><summary>${(title || '').trim() || '더 깊이'}</summary>\n\n${body}\n</details>\n`);
```

- [ ] **Step 7.2: style.css 맨 끝에 추가**:

```css
/* ========================================
   P1 — :::deep 접이식 심화 블록
   ======================================== */
.post-content .deep-dive { margin: 1.4rem 0; border: 1px solid var(--border-color); border-left: 3px solid var(--accent-secondary);
  border-radius: 8px; background: var(--bg-secondary); }
.post-content .deep-dive > summary { cursor: pointer; padding: 0.85rem 1.1rem; font-weight: 600; color: var(--text-primary);
  list-style: none; position: relative; }
.post-content .deep-dive > summary::before { content: '▸'; color: var(--accent-secondary); margin-right: 0.5rem; display: inline-block; transition: transform var(--transition-fast); }
.post-content .deep-dive[open] > summary::before { transform: rotate(90deg); }
.post-content .deep-dive > summary::-webkit-details-marker { display: none; }
.post-content .deep-dive > summary::after { content: '펼쳐서 더 깊이'; float: right; font-size: 0.72rem; font-weight: 400; color: var(--text-muted); }
.post-content .deep-dive[open] > summary::after { content: '접기'; }
.post-content .deep-dive > *:not(summary) { margin-left: 1.1rem; margin-right: 1.1rem; }
.post-content .deep-dive > *:last-child { margin-bottom: 1rem; }
```

- [ ] **Step 7.3: MARKDOWN_GUIDE.md에 문법 추가** — Task 6.6에서 넣은 "무대 전환 배지" 섹션 바로 뒤에:

```markdown
## 접이식 심화 블록 (:::deep)

수식 유도·구현 디테일·논문 같은 심화 내용은 접이 블록으로 감싸면
초심자는 건너뛰고 실무자만 펼쳐 봅니다:

​```markdown
:::deep 더 깊이 — Shapley value 기반 기여 배분
여기에 마크다운 본문 (코드·수식·표 모두 사용 가능)
:::
​```

제목을 생략하면 '더 깊이'가 기본값. 블록은 중첩할 수 없습니다.
```

- [ ] **Step 7.4: 실물 검증 (임시 블록 주입 → 확인 → 원복)**

```bash
cd /Users/user/Downloads/adtech-blog
cat >> posts/attribution-basics.md <<'EOF'

:::deep 렌더 테스트 (임시)
**굵게**와 `코드`, 그리고 표:

| a | b |
|---|---|
| 1 | 2 |
:::
EOF
```
스크린샷 `post.html?id=attribution-basics` 페이지 하단: 접힌 summary 박스 → (수동 확인 어려우므로) 스크린샷에서 summary 렌더만 확인, 펼침 동작은 Task 10 육안에서.
```bash
git checkout -- posts/attribution-basics.md
node --check js/main.js
```

- [ ] **Step 7.5: Commit**

```bash
git add -A && git commit -m "feat(frame): :::deep 접이식 심화 블록 — 마크다운 전처리 + 스타일

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: 코드 주석 세이지 그린

**Files:**
- Modify: `css/style.css:1052` (라이트 주석 색 교체) + 맨 끝 (다크 주석 색)

- [ ] **Step 8.1: 라이트 테마 주석 색 교체** — Edit:

old: `[data-theme="light"] .post-content .hljs-comment { color: #a0a1a7; }`
new: `[data-theme="light"] .post-content .hljs-comment { color: #4e6b47; font-style: italic; } /* 세이지 — 주석이 본문 설명 역할을 하므로 잘 읽혀야 한다 */`

- [ ] **Step 8.2: style.css 맨 끝에 다크 규칙 추가**:

```css
/* ========================================
   P1 — 코드 주석 색 (다크) — 주석이 설명 역할, 뚜렷하게
   ======================================== */
[data-theme="dark"] .post-content .hljs-comment,
[data-theme="dark"] .post-content .hljs-quote { color: #93b58a; font-style: italic; }
```

- [ ] **Step 8.3: 검증** — 스크린샷 `post.html?id=bid-shading-censored` (코드 많은 글): 파이썬 주석이 세이지 이탤릭으로 표시. Copy 버튼·언어 라벨은 기존 `enhanceCodeBlocks`가 이미 처리 — 그대로 있는지 함께 확인.

- [ ] **Step 8.4: Commit**

```bash
git add -A && git commit -m "style(frame): 코드 주석을 세이지 그린 이탤릭으로 — 라이트·다크 모두

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: ml-track.html + 커리큘럼 데이터

**Files:**
- Modify: `js/posts.js` (mlTrack 상수 + export)
- Create: `js/ml-track.js`
- Create: `ml-track.html`
- Modify: `css/style.css` (맨 끝 track 섹션)
- Modify: `scripts/validate-posts.js` (mlTrack id 존재 검증)

- [ ] **Step 9.1: posts.js에 mlTrack 추가** — `const WORLD_META = {` 블록 위에 삽입:

```js
// ML 엔지니어 트랙 — pCTR/pCVR 실무 커리큘럼 (ml-track.html 렌더용).
// posts의 id만 참조한다(검증기가 존재 여부 확인). 3단계는 신규 글이 늘며 채워진다.
// 주의: pCVR 글의 id는 레거시 'my-markdown-post' (URL 안정성 때문에 유지 — P3에서 별칭 처리 검토).
const mlTrack = {
  title: 'ML 엔지니어 트랙',
  subtitle: 'pCTR/pCVR 실무 커리큘럼 — 광고 ML의 심장을 입문부터 심화까지. 일반 독자도 지도처럼 훑어보세요.',
  stages: [
    {
      id: 'stage-1',
      title: '1단계 · 입문 — 예측이 돈이 되는 원리',
      goal: '이 단계를 마치면: pCTR/pCVR이 무엇이고, 왜 절대값(보정)이 중요하며, 어떤 모델로 맞히는지 큰 그림이 잡힙니다.',
      posts: ['pctr-prediction', 'ecpm-ranking', 'calibration', 'my-markdown-post', 'deep-ctr-models'],
    },
    {
      id: 'stage-2',
      title: '2단계 · 실무 — 데이터에서 서빙까지',
      goal: '이 단계를 마치면: 로그가 모델이 되기까지의 파이프라인과, 실서비스의 편향·지연 문제를 다룰 수 있습니다.',
      posts: ['ad-log-pipeline', 'feature-store-serving', 'model-serving-architecture', 'negative-sampling-bias',
        'online-learning-delayed-feedback', 'position-bias-ultr', 'multi-task-learning', 'two-tower-retrieval'],
    },
    {
      id: 'stage-3',
      title: '3단계 · 심화 — 탐색과 확장',
      goal: '이 단계를 마치면: 탐색-활용부터 피처 실전·지표 운영·랭킹 캐스케이드까지 실무 전체가 이어집니다. (신규 글 12편이 이 단계를 채워갑니다)',
      posts: ['exploration-exploitation'],
    },
  ],
};
```

export 갱신 — old:
```js
    WORLD_META, getWorldMeta, getWorldList };
```
new:
```js
    WORLD_META, getWorldMeta, getWorldList, mlTrack };
```

- [ ] **Step 9.2: js/ml-track.js 생성**:

```js
// ML 엔지니어 트랙 페이지 — mlTrack(posts.js) 커리큘럼 렌더 + 읽음 체크(ReadingState, localStorage)
(function () {
  function render() {
    const root = document.getElementById('ml-track-root');
    if (!root || typeof mlTrack === 'undefined') return;

    const head = document.getElementById('ml-track-head');
    if (head) {
      head.innerHTML = `<h1 class="track-title">${mlTrack.title}</h1><p class="track-subtitle">${mlTrack.subtitle}</p>`;
    }

    root.innerHTML = mlTrack.stages.map(stage => {
      const items = stage.posts.map(getPostById).filter(Boolean).map((p, i) => {
        const read = window.ReadingState && ReadingState.isRead(p.id);
        return `<a class="track-item${read ? ' is-read' : ''}" href="post.html?id=${p.id}">
          <span class="track-num">${i + 1}</span>
          <span class="track-body"><b>${p.title}</b><span>${p.excerpt || ''}</span></span>
          <span class="track-read">${read ? '✓ 읽음' : ''}</span>
        </a>`;
      }).join('');
      return `<section class="track-stage">
        <h2 class="track-stage-title">${stage.title}</h2>
        <p class="track-stage-goal">${stage.goal}</p>
        <div class="track-list">${items}</div>
      </section>`;
    }).join('');
  }
  document.addEventListener('DOMContentLoaded', render);
})();
```

- [ ] **Step 9.3: ml-track.html 생성** (전체 파일):

```html
<!DOCTYPE html>
<html lang="ko" data-theme="light">

<head><script>(function(){try{var d=document.documentElement,t=localStorage.getItem('theme')||'light',p=localStorage.getItem('palette')||'cream';d.setAttribute('data-theme',t);d.setAttribute('data-palette',p);}catch(e){}})();</script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="pCTR/pCVR 실무 커리큘럼 — 광고 ML 엔지니어를 위한 읽기 트랙. 입문(예측이 돈이 되는 원리)부터 실무(피처·서빙·편향)와 심화까지.">
  <title>ML 엔지니어 트랙 — Ad Tech Blog</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="stylesheet" href="css/style.css">
  <link rel="alternate" type="application/atom+xml" title="Ad Tech Blog Feed" href="/adtech-blog/feed.xml">
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
          <a href="ml-track.html" class="btn-demo btn-ml btn-demo-active">▸ ML 트랙</a>
          <button id="theme-toggle" class="theme-toggle" aria-label="테마 선택"></button>
        </div>
      </div>
    </nav>
  </header>

  <div class="rail-layout">
  <aside id="category-rail" class="category-rail" aria-label="카테고리"></aside>
  <main>
    <section class="hero">
      <div class="container" id="ml-track-head"></div>
    </section>
    <section class="section">
      <div class="container" id="ml-track-root"></div>
    </section>
  </main>
  </div><!-- End of rail-layout -->

  <footer>
    <div class="footer-content">
      <div class="footer-links">
        <a href="index.html">홈</a>
        <a href="posts-browse.html">Posts</a>
        <a href="ml-track.html">ML 트랙</a>
        <a href="ecosystem.html">Ecosystem</a>
        <a href="https://github.com/chkimsu/adtech-blog" target="_blank" rel="noopener">GitHub</a>
      </div>
      <p class="footer-text">&copy; 2026 Ad Tech Blog. 한국어로 읽는 애드테크 기술 블로그.</p>
    </div>
  </footer>

  <script src="js/posts.js"></script>
  <script src="js/reading-state.js"></script>
  <script src="js/main.js"></script>
  <script src="js/ml-track.js"></script>
</body>

</html>
```

- [ ] **Step 9.4: style.css 맨 끝에 track 섹션 추가**:

```css
/* ========================================
   P1 — ML 엔지니어 트랙 (ml-track.html)
   ======================================== */
.track-title { font-family: var(--font-serif); font-size: clamp(1.9rem, 3.6vw, 2.6rem); font-weight: 900; margin: 0 0 0.5rem; }
.track-subtitle { color: var(--text-secondary); max-width: 640px; margin: 0 auto; }
.track-stage { margin-bottom: 2.4rem; }
.track-stage-title { font-family: var(--font-serif); font-size: 1.35rem; font-weight: 800; margin: 0 0 0.35rem; }
.track-stage-goal { font-size: 0.9rem; color: var(--text-secondary); background: var(--bg-tertiary); border-radius: 6px;
  padding: 0.6rem 0.9rem; margin: 0 0 1rem; }
.track-list { display: flex; flex-direction: column; gap: 0.55rem; }
.track-item { display: flex; align-items: center; gap: 0.9rem; background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 8px; padding: 0.8rem 1rem; text-decoration: none; color: var(--text-primary); transition: border-color var(--transition-fast); }
.track-item:hover { border-color: var(--accent-primary); }
.track-num { flex: 0 0 auto; width: 1.7rem; height: 1.7rem; border-radius: 50%; border: 1px solid var(--accent-primary);
  color: var(--accent-primary); font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; }
.track-item.is-read .track-num { background: var(--accent-primary); color: var(--bg-primary); }
.track-body { min-width: 0; }
.track-body b { display: block; font-size: 0.95rem; line-height: 1.45; margin-bottom: 0.15rem; }
.track-body span { display: block; font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.track-read { margin-left: auto; flex: 0 0 auto; font-size: 0.74rem; color: var(--accent-primary); font-weight: 600; }
```

- [ ] **Step 9.5: validate-posts.js에 mlTrack id 검증 추가** — 고아 .md 경고 블록 앞에 삽입:

old:
```js
// 비치명 경고: posts/ 안에 contentUrl로 참조되지 않는 고아 .md
```
new:
```js
// mlTrack 커리큘럼이 참조하는 글 id가 실제로 존재하는지
const { mlTrack } = require(path.join(root, 'js', 'posts.js'));
const postIds = new Set(posts.map(p => p.id));
(mlTrack && mlTrack.stages ? mlTrack.stages : []).forEach(s =>
  (s.posts || []).forEach(id => { if (!postIds.has(id)) errors.push(`mlTrack "${s.id}": 존재하지 않는 글 id "${id}"`); }));

// 비치명 경고: posts/ 안에 contentUrl로 참조되지 않는 고아 .md
```

- [ ] **Step 9.6: 검증**

```bash
node --check js/posts.js && node --check js/ml-track.js && node scripts/validate-posts.js
```
스크린샷 `ml-track.html`: 3단계 섹션, 단계별 목표 박스, 번호 달린 글 카드 (1단계 5·2단계 8·3단계 1편).

- [ ] **Step 9.7: Commit**

```bash
git add -A && git commit -m "feat(frame): ML 엔지니어 트랙 페이지 — 3단계 커리큘럼 + 읽음 체크 + id 검증

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: home 정리 + 전체 검증

**Files:**
- Modify: `home.html` (eco-showcase 배너 제거)
- Regenerate: `search-index.json`
- Modify: `README.md` (구조 트리에 ml-track 반영)

- [ ] **Step 10.1: home.html의 생태계 배너 제거** — 표지가 같은 역할을 더 크게 수행하므로 삭제. Edit:

old (블록 전체 — home.html 69~106행, `<!-- 시작하기 -->` 직전까지):
```html
    <!-- Ecosystem Showcase -->
    <section class="eco-showcase">
      <div class="container">
        <div class="eco-showcase-inner">
          <div class="eco-showcase-label">처음 보시나요?</div>
          <h2 class="eco-showcase-title">광고는 이렇게 생겼습니다.</h2>
          <p class="eco-showcase-desc">
            18개 핵심 모듈 · 6개 카테고리 · 5가지 흐름 애니메이션(100ms RTB · 모델 학습 · 어트리뷰션 · Header Bidding · 데이터 타겟팅)을
            한 화면에서 인터랙티브하게 살펴보세요.
          </p>

          <div class="eco-showcase-nodes" aria-label="18개 모듈 미리보기">
            <span class="eco-showcase-chip" data-category="user">사용자</span>
            <span class="eco-showcase-chip" data-category="sell">Publisher</span>
            <span class="eco-showcase-chip" data-category="sell">SSP</span>
            <span class="eco-showcase-chip" data-category="sell">Header Bidding</span>
            <span class="eco-showcase-chip" data-category="exchange">Ad Exchange</span>
            <span class="eco-showcase-chip" data-category="exchange">Auction</span>
            <span class="eco-showcase-chip" data-category="buy">DSP</span>
            <span class="eco-showcase-chip" data-category="buy">Advertiser</span>
            <span class="eco-showcase-chip" data-category="buy">Brand</span>
            <span class="eco-showcase-chip" data-category="buy">DMP/CDP</span>
            <span class="eco-showcase-chip" data-category="buy">DCO</span>
            <span class="eco-showcase-chip" data-category="ml">Feature Store</span>
            <span class="eco-showcase-chip" data-category="ml">Model Serving</span>
            <span class="eco-showcase-chip" data-category="ml">pCTR/pCVR</span>
            <span class="eco-showcase-chip" data-category="ml">Calibration</span>
            <span class="eco-showcase-chip" data-category="measurement">Log Pipeline</span>
            <span class="eco-showcase-chip" data-category="measurement">MMP</span>
            <span class="eco-showcase-chip" data-category="user">CMP/WG</span>
          </div>

          <a href="ecosystem.html" class="eco-showcase-cta">
            광고 생태계 한 장 지도 + 5가지 흐름 보기 →
          </a>
        </div>
      </div>
    </section>

```

new: (빈 문자열 — 블록과 뒤따르는 빈 줄 하나까지 삭제)

- [ ] **Step 10.2: README 구조 트리 갱신** — 트리에서 `about.html / demos.html / ecosystem.html` 줄을 `demos.html / ecosystem.html / ml-track.html`로 수정.

- [ ] **Step 10.2b: T1·T2 잔여 정리 — 고아 CSS 제거** (T1·T2 코드 리뷰 지적 반영):
  - `css/style.css`의 `.post-meta-sep { ... }` 규칙 블록 삭제 (~737행)
  - `.post-date,` 와 선택자를 공유하는 `.post-read-time`을 선택자 목록에서만 제거 (`.post-date` 규칙은 유지)
  - `.nav-links` 참조 규칙 7곳(258·265·274·279·286·337·1911행 부근) 삭제 — T2에서 ul이 사라져 고아됨. 모바일 네비(setupMobileNav)는 `.nav-content`만 쓰므로 무관함을 grep으로 재확인 후 삭제
  - `js/main.js`의 `renderWorldLegend` 함수와 DOMContentLoaded의 호출 제거 — T3에서 마지막 `#world-legend` 컨테이너가 사라져 전 사이트 dead code (레일이 같은 범례를 자체 렌더). ⚠ NUL 주의: Edit로만.
  - (T5 잔여) `.world-badge-row`(~5106행)·`.post-world-note`(~5120행) 규칙 삭제 — 무대 카드로 대체돼 참조 0. `.world-badge-detail`은 renderWorldBadge 'detail' 분기가 더는 호출되지 않아 사실상 dead — CSS만 삭제(JS 분기는 유지).
  - (T5·T6 잔여) 라이트 테마 'both' 세이지 대비 미세 미달(4.446:1): `.stage-chip[data-world="both"]`·`.stage-inline-badge[data-world="both"]`의 `--world-dot: #5f7a63` → `#59745d` (4.5:1 확보, 다크 오버라이드 #7d9a80은 유지)
  - 검증: `grep -n "post-meta-sep\|post-read-time\|nav-links" css/style.css` → 0줄, `grep -a -c "renderWorldLegend" js/main.js` → 0

- [ ] **Step 10.3: 검색 색인 재생성**

```bash
node scripts/build-search-index.js   # → "✓ 46개 글 본문 색인"
```

- [ ] **Step 10.4: 전 페이지 최종 검증**

```bash
node scripts/validate-posts.js && node --check js/main.js && node --check js/posts.js
grep -a -rn "readTime\|min read" js/ *.html | grep -v Binary   # → 0줄
grep -rn "about.html" *.html | grep -v "^about.html"           # → 0줄
```
스크린샷 6장 (index / home / posts-browse / post.html?id=attribution-basics / post.html?id=bid-shading-censored / ml-track) 라이트 테마로 촬영해 Read로 확인. 다크 테마는 Playwright MCP로: `browser_navigate(index)` → `browser_evaluate("localStorage.setItem('theme','dark')")` → `browser_navigate(index)`(재로드) → `browser_take_screenshot` — index·글 상세 2장이면 충분. 확인 항목:
- 네비에 홈·소개 없음, ▸ML 트랙 있음
- 레일: index·home·browse·ml-track 4곳
- 표지: 2층 지도 + 읽을거리, 시간 표기 없음
- 글: 무대 카드, 세이지 주석
- 콘솔 에러 없음(스크린샷에 깨진 레이아웃 없음으로 갈음)

- [ ] **Step 10.5: Commit**

```bash
git add -A && git commit -m "feat(frame): home 배너 정리 + 검색 색인 재생성 — P1 프레임 완료

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Self-Review 결과 (스펙 대조)

| 스펙 | 태스크 | 비고 |
|---|---|---|
| §1-① 네비 | T2 | 코드모드 |
| §1-② 표지 | T4 | |
| §1-③ 레일 | T3 (+T4·T9에 마크업) | taxonomy 7개 동적 |
| §1-④ home 정리 | T3·T10 | |
| §1-⑤ about 제거 | T2 | 리다이렉트+sitemap |
| §1-⑥ 읽기시간 | T1 | |
| §3-① 무대 카드 | T5 | worldPractical 포함 |
| §3-② 무대 배지 | T6 | TOC·색인 제외 |
| §3-③ 주석 색 | T8 | 라벨·복사 버튼은 기존 구현 확인만 |
| §3-④ :::deep | T7 | NUL 라인 회피 명시 |
| §3-⑤ 데모 임베드 | — | P6 후순위 (스펙 §7) |
| §3-⑥ 헤더 메타 | T1·T5 | |
| §6-① ml-track | T9 | 신규 12편은 P5 |
| §5 생태계 | — | P2 별도 계획 |
| §4 콘텐츠 | — | P3~P4 별도 계획 |

placeholder 없음 · 타입/함수명 태스크 간 일치(renderStageCard·applyStageMarkers·renderCategoryRail·mlTrack) 확인.

## P2 이관 메모 (P1 리뷰에서 나온 설계 판단 보류 항목)

- **표지 세로 연결선(cover-vlink) 위치**: 스펙 §2는 "두뇌층 ↔ DSP 연결"이나, 구현(및 사용자 승인 목업)은 컨테이너 중앙(≈Ad Exchange 위)에 고정. 승인 목업과 동일 기하라 P1에서는 유지 — P2 생태계 2층 지도가 두 층의 연결 시각 문법을 확정할 때 표지도 함께 정렬할 것.
- **표지 흐름 칩 딥링크**: 칩 5개가 현재 전부 ecosystem.html로만 이동(개별 흐름 지정 없음). P2에서 ecosystem이 URL 파라미터(?flow=)를 지원하게 되면 칩별 딥링크 연결.
