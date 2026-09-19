// 주제별 모아보기 — topics.html 전용.
// posts.js 의 posts / series 와 main.js 의 renderWorldBadge / topicSlug 를 재사용한다.
// 스크립트 순서: posts.js → reading-state.js → main.js → topics.js
//
// 한 주제 안은 두 층이다.
//   1) 트랙 — series 에 정의된 읽는 순서. 이 주제에 속한 글만 보이고, 번호는 트랙 전체 기준(3/7)이다.
//   2) 그 밖의 글 — 어느 트랙에도 없는 글. 새 글부터.
// 카테고리가 둘인 글(20편)은 두 주제에 다 보이고 「다른 주제에도」로 표시한다.
(function () {
  const TOPICS = [
    { id: 'Bidding & Auction',         label: '입찰과 경매',        desc: '요청 한 건이 경매를 지나 광고가 되기까지. 생태계 지도, eCPM 랭킹, 자동입찰과 페이싱, 입찰 셰이딩.' },
    { id: 'Measurement & Modeling',    label: '측정과 모델링',      desc: 'pCTR 과 pCVR 예측, 확률 보정, 어트리뷰션, 인과추론과 실험, 편향 보정. 가장 두꺼운 주제입니다.' },
    { id: 'Bandits & Personalization', label: '밴딧과 개인화',      desc: '탐색과 활용, MAB, UCB 와 톰슨 샘플링, 컨텍스추얼 밴딧.' },
    { id: 'Targeting & Audience',      label: '타겟팅과 오디언스',  desc: '세그먼트와 오디언스, 맞춤타겟, Lookalike, 리타겟팅과 빈도 상한.' },
    { id: 'ML Infrastructure',         label: 'ML 인프라',          desc: '로그 파이프라인, 피처 스토어, 후보 검색, 모델 서빙, 온라인 학습, 모니터링. 그리고 만든 모델을 매일 굴리는 학습 파이프라인, 배포와 롤백, 스트림 집계, 분산 학습.' },
    { id: 'Software Engineering',      label: '소프트웨어 엔지니어링', desc: 'Git, 아키텍처 패턴, API, 요청이 오는 길, Kafka, 데이터 파이프라인, Hadoop 과 Spark.' },
    { id: 'Interview & Algorithms',    label: '면접과 알고리즘',    desc: 'ML 엔지니어 면접 질문 셋과 코딩 테스트 알고리즘 여섯 편.' },
  ];

  // 한 주제 안에서 트랙이 놓이는 순서 — 입문, 기초, 심화, 응용(카카오) 순. 여기 없는 트랙은 정의 순서대로 뒤에 붙는다.
  const TRACK_ORDER = ['getting-started', 'advanced-bidding-track', 'modeling-track', 'ml-infra-track', 'mlops-track', 'bandits-track',
    'targeting-track', 'causal-inference-track', 'judgment-track', 'engineering-foundations', 'interview-track', 'algorithm-track', 'kakao-adtech'];

  // 순수 함수 — 브라우저와 node(시험) 둘 다에서 쓴다.
  function buildTopicsModel(allPosts, allSeries, order) {
    const byId = new Map(allPosts.map(p => [p.id, p]));
    const defined = Object.keys(allSeries);
    const seriesIds = [...TRACK_ORDER.filter(id => defined.includes(id)), ...defined.filter(id => !TRACK_ORDER.includes(id))];
    return order.map(t => {
      const inCat = allPosts.filter(p => (p.categories || []).includes(t.id));
      const inCatIds = new Set(inCat.map(p => p.id));
      const placed = new Set();
      const tracks = [];
      for (const sid of seriesIds) {
        const s = allSeries[sid];
        const items = [];
        s.posts.forEach((pid, i) => {
          if (inCatIds.has(pid) && !placed.has(pid) && byId.has(pid)) {
            items.push({ post: byId.get(pid), pos: i + 1, total: s.posts.length });
            placed.add(pid);
          }
        });
        if (items.length) tracks.push({ id: sid, title: s.title, desc: s.desc, items, total: s.posts.length });
      }
      const others = inCat.filter(p => !placed.has(p.id))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      return { id: t.id, label: t.label, desc: t.desc, count: inCat.length, tracks, others };
    });
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function ym(d) { return d ? String(d).slice(0, 7).replace('-', '.') : ''; }
  function labelOf(catId) { const t = TOPICS.find(x => x.id === catId); return t ? t.label : catId; }
  function slug(c) { return (typeof topicSlug === 'function') ? topicSlug(c) : String(c).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  function rowHtml(post, topicId, numText) {
    const read = !!(window.ReadingState && ReadingState.isRead(post.id));
    const badges = (typeof renderWorldBadge === 'function') ? renderWorldBadge(post, 'card') : '';
    const cross = (post.categories || []).filter(c => c !== topicId).map(labelOf);
    return `<li class="topic-row${read ? ' is-read' : ''}">
      <span class="topic-num">${numText}</span>
      <a class="topic-title" href="post.html?id=${encodeURIComponent(post.id)}">${esc(post.title)}</a>
      <span class="topic-meta">
        <span class="topic-date">${ym(post.date)}</span>${badges}
        ${cross.length ? `<span class="topic-cross">다른 주제에도: ${esc(cross.join(', '))}</span>` : ''}
        ${read ? '<span class="topic-read">읽음</span>' : ''}
      </span>
    </li>`;
  }

  function trackHtml(track, topicId) {
    const first = track.items[0].post;
    const partial = track.items.length < track.total;
    return `<section class="topic-track">
      <div class="topic-track-head">
        <span class="topic-kicker">트랙</span>
        <a href="post.html?id=${encodeURIComponent(first.id)}">${esc(track.title)}</a>
        <span class="topic-track-count">${partial ? `${track.total}편 중 ${track.items.length}편이 이 주제` : `${track.total}편 · 첫 글부터 순서대로`}</span>
      </div>
      <p class="topic-track-desc">${esc(track.desc)}</p>
      <ol class="topic-list">${track.items.map(it => rowHtml(it.post, topicId, `${it.pos}/${it.total}`)).join('')}</ol>
    </section>`;
  }

  function othersHtml(list, topicId, hasTracks) {
    if (!list.length) return '';
    return `<section class="topic-track topic-other">
      <div class="topic-track-head">
        <span class="topic-kicker">${hasTracks ? '그 밖의 글' : '글'}</span>
        <span class="topic-track-count">${list.length}편 · 새 글부터</span>
      </div>
      <ol class="topic-list">${list.map((p, i) => rowHtml(p, topicId, String(i + 1))).join('')}</ol>
    </section>`;
  }

  function sectionHtml(t) {
    const id = `topic-${slug(t.id)}`;
    return `<section class="topic-section" id="${id}">
      <details class="topic-details" open>
        <summary class="topic-head">
          <span class="rail-dot" data-category="${esc(t.id)}"></span>
          <h2>${esc(t.label)} <small>${esc(t.id)}</small></h2>
          <span class="topic-count">${t.count}편${t.tracks.length ? ` · 트랙 ${t.tracks.length}` : ''}</span>
          <span class="topic-toggle" aria-hidden="true"></span>
        </summary>
        <p class="topic-desc">${esc(t.desc)}</p>
        ${t.tracks.map(tr => trackHtml(tr, t.id)).join('')}
        ${othersHtml(t.others, t.id, t.tracks.length > 0)}
      </details>
    </section>`;
  }

  function jumpHtml(model) {
    return model.map(t => `<a class="topics-jump-item" href="#topic-${slug(t.id)}">
      <span class="rail-dot" data-category="${esc(t.id)}"></span>${esc(t.label)}<b>${t.count}</b></a>`).join('');
  }

  function init() {
    const root = document.getElementById('topics-root');
    if (!root || typeof posts === 'undefined' || typeof series === 'undefined') return;
    const model = buildTopicsModel(posts, series, TOPICS);
    const jump = document.getElementById('topics-jump');
    if (jump) jump.innerHTML = jumpHtml(model);
    const sub = document.getElementById('topics-hero-sub');
    if (sub) {
      const trackCount = new Set(model.flatMap(t => t.tracks.map(tr => tr.id))).size;
      sub.textContent = `글 ${posts.length}편을 주제 ${model.length}개로 묶었습니다. 트랙 ${trackCount}개는 읽는 순서대로, 나머지는 새 글부터입니다.`;
    }
    root.innerHTML = model.map(sectionHtml).join('');
    // 주소에 #topic-… 이 실려 오면 그 절로 (렌더 뒤라 여기서 한 번 더).
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ block: 'start' });
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildTopicsModel, TOPICS };
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
