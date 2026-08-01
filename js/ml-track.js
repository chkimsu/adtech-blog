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
