// ==========================================================================
// Giscus 댓글 — GitHub Discussions 기반(백엔드 없음). 글마다 별도 토론.
// repoId / categoryId 는 https://giscus.app 에서 발급받아 아래에 채운다.
// (공개값이라 클라이언트에 둬도 안전 — 비밀 아님.) 채우기 전엔 댓글 영역이 숨는다.
// 설정 방법: docs/COMMENTS_SETUP.md 참고.
// ==========================================================================
const GISCUS = {
  repo: 'chkimsu/adtech-blog',
  repoId: 'R_kgDOQzA7Ow',
  category: 'Announcements',          // Announcement 형식 — 글쓴이만 토론 생성(스팸 방지)
  categoryId: 'DIC_kwDOQzA7O84C-oFL',
};

function giscusTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function initComments(postId) {
  const box = document.getElementById('comments');
  const section = document.querySelector('.post-comments-section');
  if (!box) return;
  // 미설정이면 조용히 숨김(레이아웃 영향 0)
  if (!GISCUS.repoId || !GISCUS.categoryId) {
    if (section) section.hidden = true;
    return;
  }
  if (section) section.hidden = false;
  const s = document.createElement('script');
  s.src = 'https://giscus.app/client.js';
  Object.assign(s.dataset, {
    repo: GISCUS.repo,
    repoId: GISCUS.repoId,
    category: GISCUS.category,
    categoryId: GISCUS.categoryId,
    mapping: 'specific',      // 글 id 로 토론 매핑(글마다 분리)
    term: postId,
    strict: '1',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'top',
    theme: giscusTheme(),
    lang: 'ko',
    loading: 'lazy',
  });
  s.crossOrigin = 'anonymous';
  s.async = true;
  box.innerHTML = '';
  box.appendChild(s);
}

// 테마 토글 시 giscus iframe도 같이 전환
function setGiscusTheme(theme) {
  const frame = document.querySelector('iframe.giscus-frame');
  if (!frame) return;
  frame.contentWindow.postMessage(
    { giscus: { setConfig: { theme: theme === 'dark' ? 'dark' : 'light' } } },
    'https://giscus.app'
  );
}
