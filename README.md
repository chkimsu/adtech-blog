**https://chkimsu.github.io/adtech-blog/**

# Ad Tech Blog

A calm, editorial blog about Ad Tech, built with vanilla HTML, CSS, and JavaScript. Covers programmatic advertising, RTB & auctions, pCTR/pCVR modeling, bandits, and ML serving infrastructure — written in approachable Korean.

![Ad Tech Blog](https://img.shields.io/badge/Built%20with-HTML%2FCSS%2FJS-blue)
![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-green)

##  Features

-  **Calm Editorial Design** - Cream/ink/brick palette, serif headings, restrained typography
-  **Real-time Search** - Instantly filter posts by title, content, or keywords
-  **Category & Tag Filtering** - Organize and discover content easily
-  **Theme Toggle** - Switch between dark and light modes (persisted in localStorage)
-  **GitHub Comments** - Utterances integration for privacy-friendly discussions
-  **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
-  **Fast & Lightweight** - No frameworks, pure vanilla JavaScript
-  **Privacy-First** - No tracking, no analytics by default

##  Project Structure

```
adtech-blog/
├── index.html              # 홈 — 시작하기·최신·시리즈 큐레이션 랜딩
├── posts-browse.html       # 전체 글 탐색 (카테고리·태그 다중필터·정렬·검색·더보기)
├── post.html               # 글 상세 템플릿 (TOC·시리즈 박스·관련 글)
├── about.html / demos.html / ecosystem.html
├── css/
│   └── style.css           # 단일 스타일시트 (차분한 에디토리얼 토큰)
├── js/
│   ├── posts.js            # 글 데이터 단일 소스 + series/startHere + 헬퍼
│   ├── main.js             # 렌더·테마·검색·홈·시리즈 박스
│   └── browse.js           # 통합 탐색 페이지 로직
├── data/
│   └── taxonomy.json       # 카테고리·태그 표준 목록 (단일 소스)
├── scripts/
│   ├── new-post.js         # 새 글 스캐폴드
│   ├── compute-read-time.js# 읽기시간 자동 계산 (.md 분량 기반)
│   ├── validate-posts.js   # 분류·무결성 검증 (CI 게이트)
│   └── generate-feed.js    # Atom feed.xml 생성
├── generate-sitemap.js     # sitemap.xml 생성
├── posts/                  # 글 본문 마크다운(.md)
├── feed.xml / sitemap.xml  # 생성 산출물 (GitHub Actions 자동 갱신)
└── .github/workflows/      # validate.yml(검증) · sitemap.yml(sitemap+feed)
```

##  Quick Start

### Local Development

1. Clone this repository:
```bash
git clone https://github.com/yourusername/adtech-blog.git
cd adtech-blog
```

2. Start a local server:
```bash
# Using Python 3
python3 -m http.server 8000

# Or using Python 2
python -m SimpleHTTPServer 8000

# Or using Node.js http-server
npx http-server -p 8000
```

3. Open your browser to `http://localhost:8000`

### Deploy to GitHub Pages

1. **Create a new GitHub repository** (e.g., `adtech-blog`)

2. **Initialize and push your code:**
```bash
cd adtech-blog
git init
git add .
git commit -m "Initial commit: Ad Tech Blog"
git branch -M main
git remote add origin https://github.com/yourusername/adtech-blog.git
git push -u origin main
```

3. **Enable GitHub Pages:**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Under "Source", select `main` branch and `/ (root)` folder
   - Click "Save"

4. **Your site will be live at:** `https://yourusername.github.io/adtech-blog/`

##  Setting Up Comments

This blog uses [Utterances](https://utteranc.es/) for GitHub-based comments.

1. **Install the Utterances app:**
   - Visit https://github.com/apps/utterances
   - Click "Install"
   - Select your `adtech-blog` repository

2. **Update the configuration in `js/main.js`:**
   - Open `js/main.js`
   - Find the `initializeComments` function
   - Uncomment and update the utterances script:
   ```javascript
   script.setAttribute('repo', 'yourusername/adtech-blog'); // Change this
   ```

3. **Comments will now appear at the bottom of each blog post!**

##  새 글 추가

스캐폴드 스크립트가 파일 생성·메타데이터 입력·분류 검증을 도와줍니다. (빌드 도구 없음 — 모두 zero-dependency Node)

```bash
# 1) 새 글 생성 (대화형, 또는 인자 모드)
node scripts/new-post.js
#   인자 모드: node scripts/new-post.js <slug> "<제목>" "<카테고리|번호>" "<태그,콤마>"

# 2) posts/<slug>.md 본문 작성 + js/posts.js 의 excerpt 채우기

# 3) 읽기시간 자동 계산 (.md 분량 기반, 손으로 적지 않음)
node scripts/compute-read-time.js

# 4) 표준 분류·무결성 검증 (이게 통과해야 CI도 통과)
node scripts/validate-posts.js

# 5) chkimsu 계정으로 커밋·푸시 → GitHub Actions가 sitemap·feed·검색색인 자동 갱신
```

- **카테고리·태그는 자유 입력이 아니라 `data/taxonomy.json` 표준 목록**에서만 씁니다. 새 분류가 필요하면 먼저 `taxonomy.json`에 추가하세요 — 검증기가 어긋난 값(`ML Infra` vs `ML Infrastructure` 같은 드리프트)을 막습니다.
- 글 본문은 `posts/<slug>.md` 마크다운입니다. 작성 규칙(KaTeX·코드 펜스·다이어그램)은 `MARKDOWN_GUIDE.md` 참고.
- 주제별 읽는 순서(시리즈)·시작하기 글은 `js/posts.js` 상단의 `series` / `startHere` 에서 관리합니다.
- **전체 본문 검색**(Cmd+K 모달)은 `scripts/build-search-index.js`가 만든 `search-index.json`을 씁니다. 본문 변경 시 CI가 자동 재생성하지만, 로컬에서 미리 확인하려면 `node scripts/build-search-index.js`.

##  Customization

### Change Colors

Edit CSS variables in `css/style.css`:

```css
:root {
  --bg-primary: #faf8f3;          /* cream */
  --accent-primary: #b0442c;      /* brick */
  --accent-secondary: #8a6a3a;    /* bronze/ochre */
  --text-primary: #201d1a;        /* ink */
  /* ... more variables (see css/style.css :root) */
}
```

### Modify Typography

Update Google Fonts import in `css/style.css`:

```css
/* Actual fonts are imported in css/style.css (lines 6-7):
   Pretendard (body) · Newsreader + Noto Serif KR (serif headings) · Fira Code (code).
   Swap them there, then reference via the CSS variables: */

body {
  font-family: var(--font-sans);
}
```

### Update Blog Title

Edit the logo in HTML files:

```html
<div class="logo">Your Blog Name</div>
```

And update the hero section in `index.html`:

```html
<h1>Your Blog Title</h1>
<p>Your blog description</p>
```

##  Responsive Breakpoints

The design is mobile-first with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

##  Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

##  Content

The blog contains ~32 posts across 6 categories:
- **Bidding & Auction** — RTB, eCPM, bid shading, auto-bidding, walled gardens
- **Bandits & Personalization** — MAB, UCB, Thompson Sampling, contextual bandits
- **Measurement & Modeling** — pCTR/pCVR, calibration, attribution, debiasing
- **ML Infrastructure** — log pipelines, feature stores, model serving, online learning
- **Targeting & Audience** — segmentation, lookalike modeling
- **DevOps & Tooling** — Git, workflows

Curated reading paths (`series`) and a "start here" rail are defined in `js/posts.js`. Add a post with `node scripts/new-post.js` (see 새 글 추가 below).

##  Contributing

This is a personal blog template, but suggestions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is open source and available under the [MIT License](LICENSE).

##  Acknowledgments

- Design inspired by modern web design trends
- Built with  for the Ad Tech community
- Hosted on GitHub Pages (free!)

##  Support

If you have questions or need help:
- Open an issue on GitHub
- Check existing issues for solutions
- Read the documentation in code comments

---

**Happy Blogging! **

Made with  for Ad Tech professionals
