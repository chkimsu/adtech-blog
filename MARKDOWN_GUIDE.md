# Markdown 블로그 글 작성 가이드

## ✅ Marked.js 설치 완료!

이제 Markdown 형식으로 블로그 글을 작성할 수 있습니다.

## 📝 Markdown으로 글 작성하기

### 1. `js/posts.js` 파일 열기

### 2. 새 포스트 추가

`posts` 배열에 다음과 같이 추가:

```javascript
{
  id: 'my-markdown-post',
  title: '마크다운으로 작성한 글',
  excerpt: '이 글은 Markdown으로 작성되었습니다',
  date: '2026-01-10',
  readTime: '5 min read',
  categories: ['Tutorial'],
  tags: ['markdown', 'tutorial'],
  isMarkdown: true,  // ⭐ 중요: 이 플래그 추가!
  content: `
# 제목

이것은 **Markdown**으로 작성된 내용입니다.

## 소제목

- 리스트 아이템 1
- 리스트 아이템 2
- 리스트 아이템 3

### 코드 예제

\`\`\`javascript
const greeting = 'Hello World';
console.log(greeting);
\`\`\`

### 인용구

> 이것은 인용구입니다.

### 링크와 강조

[링크 텍스트](https://example.com)

*이탤릭* 또는 _이탤릭_

**볼드** 또는 __볼드__

### 이미지

![설명](이미지URL)

### 순서 있는 리스트

1. 첫 번째
2. 두 번째
3. 세 번째
  `
}
```

### 3. 저장하고 새로고침

- `Ctrl+S` (또는 `Cmd+S`)로 저장
- 브라우저에서 `F5` 새로고침
- Markdown이 자동으로 HTML로 변환되어 표시됩니다!

## 🎯 Markdown vs HTML

### Markdown 사용 (권장)
```javascript
{
  isMarkdown: true,
  content: `
# 제목
**볼드 텍스트**
  `
}
```

### HTML 사용 (기존 방식)
```javascript
{
  // isMarkdown 없음 또는 false
  content: `
<h1>제목</h1>
<strong>볼드 텍스트</strong>
  `
}
```

## 📚 Markdown 문법 치트시트

| 기능 | Markdown | HTML 결과 |
|------|----------|-----------|
| 제목 1 | `# 제목` | `<h1>제목</h1>` |
| 제목 2 | `## 제목` | `<h2>제목</h2>` |
| 볼드 | `**텍스트**` | `<strong>텍스트</strong>` |
| 이탤릭 | `*텍스트*` | `<em>텍스트</em>` |
| 링크 | `[텍스트](URL)` | `<a href="URL">텍스트</a>` |
| 이미지 | `![alt](URL)` | `<img src="URL" alt="alt">` |
| 코드 | `` `code` `` | `<code>code</code>` |
| 리스트 | `- 항목` | `<ul><li>항목</li></ul>` |
| 인용 | `> 인용구` | `<blockquote>인용구</blockquote>` |

## 💡 팁

1. **코드 블록**: 세 개의 백틱(```)으로 감싸고 언어 지정
   ````markdown
   ```javascript
   const code = 'here';
   ```
   ````

2. **긴 글**: Markdown은 여러 줄로 자유롭게 작성 가능

3. **기존 HTML**: `isMarkdown: false`면 HTML 그대로 사용됨

4. **혼합 사용**: 각 포스트마다 선택 가능

## ⚙️ 기술 정보

- **라이브러리**: Marked.js (CDN)
- **버전**: Latest
- **변환**: 자동 (클라이언트 사이드)
- **위치**: `main.js`의 `renderPostDetail()` 함수

## 🔍 문제 해결

**Markdown이 변환되지 않음:**
1. `isMarkdown: true` 추가했는지 확인
2. 브라우저 새로고침 (F5)
3. 개발자 도구 콘솔에서 에러 확인

**코드 블록이 제대로 표시 안됨:**
- 백틱 3개(```)로 감싸는지 확인
- 언어 지정했는지 확인 (예: ```javascript)

---

이제 Markdown으로 편하게 블로그 글을 작성하세요! 🎉
