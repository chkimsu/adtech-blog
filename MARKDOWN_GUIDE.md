# 블로그 글 작성 가이드

글 본문은 `posts/<slug>.md` **마크다운 파일**로 작성하고, 메타데이터(제목·카테고리·태그 등)는 `js/posts.js`에 둡니다. 브라우저가 marked.js로 `.md`를 받아 렌더합니다. (별도 빌드 없음)

> 예전의 `isMarkdown: true` + 인라인 `content:` 방식은 더 이상 쓰지 않습니다. 본문은 항상 외부 `.md` 파일입니다.

## 새 글 추가 — 한 흐름

```bash
# 1) 스캐폴드: posts/<slug>.md stub + js/posts.js 엔트리 생성(분류 검증)
node scripts/new-post.js
#    인자 모드: node scripts/new-post.js <slug> "<제목>" "<카테고리|번호>" "<태그,콤마>"

# 2) posts/<slug>.md 본문 작성 + js/posts.js 의 excerpt 채우기

# 3) 읽기시간 자동 계산 (.md 분량 기반)
node scripts/compute-read-time.js

# 4) 표준 분류·무결성 검증 (통과해야 CI도 통과)
node scripts/validate-posts.js

# 5) chkimsu 계정으로 커밋·푸시 → sitemap·feed 자동 갱신
```

## 메타데이터 & 분류 (중요)

- 한 글의 메타데이터는 `js/posts.js`의 객체 하나입니다:
  `id`(=slug), `title`, `excerpt`, `date`, `categories`, `tags`, `contentUrl`, `readTime`.
  (`featured`, `series`는 선택)
- **`categories`·`tags`는 자유 입력이 아닙니다.** `data/taxonomy.json`의 표준 목록에 있는 값만 씁니다.
  새 분류가 필요하면 **먼저 `data/taxonomy.json`에 추가**하세요. 검증기(`scripts/validate-posts.js`)가
  표준에 없는 값(`ML Infra` ↔ `ML Infrastructure` 같은 드리프트)·빈 필드·없는 `.md`를 막습니다.
- `readTime`은 손으로 적지 말고 `scripts/compute-read-time.js`가 채우게 둡니다.
- 주제별 읽는 순서(시리즈)·"시작하기" 글은 `js/posts.js` 상단의 `series` / `startHere`에서 관리합니다.

## 마크다운 문법 치트시트

| 기능 | Markdown | 결과 |
|------|----------|------|
| 제목 | `## 소제목` | `<h2>` (TOC에 자동 수집) |
| 볼드 | `**텍스트**` | `<strong>` |
| 이탤릭 | `*텍스트*` | `<em>` |
| 링크 | `[텍스트](URL)` | `<a>` |
| 이미지 | `![alt](URL)` | `<img>` |
| 인라인 코드 | `` `code` `` | `<code>` |
| 리스트 | `- 항목` | `<ul>` |
| 인용 | `> 인용구` | `<blockquote>` |

- 같은 블로그의 다른 글로 링크: `[제목](post.html?id=<slug>)`
- 데모로 링크: `[제목](demo-xxx.html)`

## 코드 블록 · 다이어그램

- 코드: 백틱 3개 + 언어 지정 → highlight.js 하이라이팅
  ````markdown
  ```javascript
  const code = 'here';
  ```
  ````
- 다이어그램: ```` ```mermaid ```` 블록 (테마 `neutral`)

---

## 수식 작성 (KaTeX) — 한글 주의사항

수식은 `$...$` (인라인) / `$$...$$` (블록)로 작성합니다.

### ⚠ math mode 안에 한글 직접 작성 금지

KaTeX는 `$...$` 안을 LaTeX math로 파싱합니다. 한글을 그대로 넣으면 console warning이 나고
글자 간격이 깨질 수 있습니다.

**나쁜 예 (warning 발생):**
```
$E[수익] = \int 수익 \cdot p(x) dx$
```

**좋은 예 1 — 수식 밖으로 한글 빼기:**
```
$\bar{x}_a$ : arm $a$의 평균 보상 (관측된 평균 CTR)
```
(수식 안에 한글이 들어가 있지 않으므로 OK)

**좋은 예 2 — `\text{}` 사용:**
```
$E[\text{수익}] = \int \text{수익} \cdot p(x)\,dx$
```

**좋은 예 3 — `\mathrm{}` (정자체):**
```
$\mathrm{Score}_a = \bar{x}_a + \sqrt{\frac{2 \ln t}{n_a}}$
```

### 자주 쓰는 한글 처리 패턴

| 의도 | 잘못된 표기 | 권장 표기 |
|------|-------------|-----------|
| 수식 라벨 | `$수익 = ...$` | `$\text{수익} = ...$` |
| 변수 설명 | `$x$는 입력` | `$x$는 입력` (수식 밖) |
| 함수명 | `$수익(x)$` | `$\mathrm{수익}(x)$` |

> 콘솔에 `Unicode text character "X" used in math mode` 경고가 보이면, 그 수식 안에 한글이 섞여 있다는 신호입니다.

## 데모 임베드 (글 안 미니 데모)

포스트 본문 중간에 인터랙티브 데모를 iframe으로 인라인 삽입할 수 있다.
데모 페이지에 `?embed=1`을 붙이면 차트·컨트롤·해설 패널만 남는 컴팩트 모드가 된다.

```html
<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-beta-sampling.html?embed=1" height="560" loading="lazy" title="베타 분포 샘플링 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-beta-sampling.html" target="_blank" rel="noopener">↗ 전체 데모로 열기 (가이드 투어 포함)</a>
</div>
```

**규칙 (어기면 렌더가 깨진다):**

1. **블록 앞뒤로 빈 줄** 필수 — 마크다운 HTML 블록으로 인식되기 위함.
2. **블록 내부에는 빈 줄 금지** — 빈 줄이 있으면 HTML 블록이 중간에 끊긴다.
3. **블록 안에 `$`와 `**` 금지** — 수식 보호(protectMathBlocks)와 볼드 전처리(preprocessMarkdown)가
   HTML 속성/텍스트를 치환해 버린다. title 등에 필요하면 다른 표현으로.
4. `height="560"`은 JS 로드 전 폴백 — 로드 후에는 postMessage로 실제 높이에 맞게 자동 조정된다.
5. `src`는 루트 상대 경로 (`demo-*.html?embed=1`) — post.html이 루트에 있으므로 그대로 동작.

임베드 모드를 지원하려면 해당 데모가 `js/demo-edu-content.js`에 엔트리(embedKeep)를 갖고 있어야 한다.
