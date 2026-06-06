// 통합 탐색 인덱스 — posts-browse.html 전용.
// posts.js(filterPosts/sortPosts/getAllCategories/getAllTags/getSeriesForPost) +
// main.js(renderPostCard)를 재사용한다. (스크립트 로드 순서: posts.js → main.js → browse.js)
(function () {
  const PAGE = 12;
  const state = { search: '', categories: new Set(), tags: new Set(), sort: 'newest', shown: PAGE };
  let TAG_COLLAPSED = true;
  const $ = id => document.getElementById(id);

  function readUrl() {
    const p = new URLSearchParams(location.search);
    state.search = p.get('search') || '';
    (p.get('category') || '').split(',').filter(Boolean).forEach(c => state.categories.add(c));
    (p.get('tag') || '').split(',').filter(Boolean).forEach(t => state.tags.add(t));
    state.sort = p.get('sort') || 'newest';
  }
  function syncUrl() {
    const p = new URLSearchParams();
    if (state.search) p.set('search', state.search);
    if (state.categories.size) p.set('category', [...state.categories].join(','));
    if (state.tags.size) p.set('tag', [...state.tags].join(','));
    if (state.sort !== 'newest') p.set('sort', state.sort);
    history.replaceState(null, '', p.toString() ? `?${p}` : location.pathname);
  }

  function apply() {
    const filtered = filterPosts(state.search, [...state.categories], [...state.tags]);
    const sorted = sortPosts(filtered, state.sort);
    $('browse-count').textContent = `${sorted.length}개 글`;
    renderGrid(sorted.slice(0, state.shown));
    $('browse-more').hidden = sorted.length <= state.shown;
    $('browse-clear').hidden = !(state.search || state.categories.size || state.tags.size);
    syncUrl();
  }

  function renderGrid(items) {
    const grid = $('browse-grid');
    grid.innerHTML = '';
    if (!items.length) {
      grid.innerHTML = `<div class="browse-empty"><h3>검색 결과가 없습니다</h3>
        <p>다른 키워드나 필터를 시도해 보세요.</p>
        <button class="btn-try" id="browse-empty-clear">필터 초기화</button></div>`;
      $('browse-empty-clear').onclick = clearAll;
      return;
    }
    items.forEach((post, i) => {
      const card = renderPostCard(post);                 // main.js 재사용
      card.style.animationDelay = `${(i % PAGE) * 0.05}s`;
      // 카드 태그 클릭을 홈용 filterByTag 대신 인덱스 다중선택으로 재바인딩
      card.querySelectorAll('.tag').forEach(t => {
        t.onclick = (e) => { e.stopPropagation(); toggleTag(t.dataset.tag); window.scrollTo({ top: 0, behavior: 'smooth' }); };
      });
      // 시리즈 소속이면 작은 배지
      const s = (typeof getSeriesForPost === 'function') && getSeriesForPost(post);
      if (s) {
        const b = document.createElement('span');
        b.className = 'series-badge';
        b.textContent = `시리즈 · ${s.title}`;
        const footer = card.querySelector('.post-card-footer');
        if (footer) footer.before(b); else card.appendChild(b);
      }
      grid.appendChild(card);
    });
  }

  function renderChips() {
    const catBox = $('browse-categories');
    catBox.innerHTML = getAllCategories().map(c =>
      `<div class="category-tab${state.categories.has(c) ? ' active' : ''}" data-category="${c}">${c}</div>`).join('');
    catBox.querySelectorAll('.category-tab').forEach(el => el.onclick = () => toggleCat(el.dataset.category));

    const tagBox = $('browse-tags');
    const all = getAllTags();
    const list = TAG_COLLAPSED ? all.slice(0, 16) : all;
    tagBox.innerHTML = list.map(t =>
      `<span class="filter-tag${state.tags.has(t) ? ' active' : ''}" data-tag="${t}">${t}</span>`).join('');
    tagBox.querySelectorAll('.filter-tag').forEach(el => el.onclick = () => toggleTag(el.dataset.tag));
    $('browse-tag-toggle').textContent = TAG_COLLAPSED ? `전체 태그 보기 (${all.length})` : '태그 접기';
  }

  function toggleCat(c) { state.categories.has(c) ? state.categories.delete(c) : state.categories.add(c); state.shown = PAGE; renderChips(); apply(); }
  function toggleTag(t) { state.tags.has(t) ? state.tags.delete(t) : state.tags.add(t); state.shown = PAGE; renderChips(); apply(); }
  function clearAll() { state.search = ''; state.categories.clear(); state.tags.clear(); state.shown = PAGE; $('browse-search').value = ''; renderChips(); apply(); }

  function init() {
    if (!$('browse-grid')) return;
    readUrl();
    $('browse-search').value = state.search;
    $('browse-sort').value = state.sort;
    renderChips();
    $('browse-search').addEventListener('input', e => { state.search = e.target.value; state.shown = PAGE; apply(); });
    $('browse-sort').addEventListener('change', e => { state.sort = e.target.value; apply(); });
    $('browse-more').addEventListener('click', () => { state.shown += PAGE; apply(); });
    $('browse-clear').addEventListener('click', clearAll);
    $('browse-tag-toggle').addEventListener('click', () => { TAG_COLLAPSED = !TAG_COLLAPSED; renderChips(); });
    apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
