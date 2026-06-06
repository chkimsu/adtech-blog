# 댓글(Giscus) 설정 — 1회

이 블로그의 댓글은 [Giscus](https://giscus.app)(GitHub Discussions 기반)를 씁니다. 백엔드가 없고, 광고 트래커도 없습니다. 댓글을 쓰려면 독자가 GitHub 계정으로 로그인합니다.

코드(`js/comments.js`, `post.html` `#comments`)는 이미 준비돼 있고, **아래 4단계를 마치면 켜집니다.** 그 전까지는 글 하단 댓글 영역이 조용히 숨겨집니다(레이아웃 영향 없음).

## 1) Discussions 활성화

GitHub 저장소 → **Settings → General → Features** 에서 **Discussions** 체크.
그다음 저장소 **Discussions** 탭에서 카테고리 하나를 만듭니다(예: 이름 `Comments`, 형식 *Announcement* 권장 — 글쓴이만 새 토론을 열 수 있게).

## 2) giscus 앱 설치

<https://github.com/apps/giscus> 에서 **Install** → 이 저장소(`chkimsu/adtech-blog`)에만 권한 부여.

## 3) repoId · categoryId 발급

<https://giscus.app> 접속 → "저장소"에 `chkimsu/adtech-blog` 입력 →
- Discussion 매핑: **Discussion title contains a specific term**(코드가 글 id로 매핑하므로 무엇을 골라도 됨)
- 카테고리: 1단계에서 만든 `Comments`

페이지 아래 "설정"의 `<script data-repo-id="...">`, `data-category-id="..."` 두 값을 복사합니다.

## 4) 값 채우고 커밋

`js/comments.js` 상단 `GISCUS` 객체에 붙여넣습니다:

```js
const GISCUS = {
  repo: 'chkimsu/adtech-blog',
  repoId: 'R_kgD...',        // ← 3단계에서 복사
  category: 'Comments',      // ← 1단계 카테고리 이름과 동일하게
  categoryId: 'DIC_kwD...',  // ← 3단계에서 복사
};
```

그리고 **chkimsu 계정으로** 커밋·푸시:

```bash
git add js/comments.js
git commit -m "chore(comments): Giscus repoId/categoryId 설정"
git push
```

> `repoId`·`categoryId`는 공개값이라 클라이언트 코드에 둬도 안전합니다(비밀이 아님).

## 동작

- 글마다 별도 토론(코드가 `mapping: 'specific'`, `term = 글 id`).
- 다크/라이트 토글 시 댓글 테마도 같이 전환(`setGiscusTheme`).
- 한국어 UI(`lang: 'ko'`), 지연 로딩(`loading: 'lazy'`).
