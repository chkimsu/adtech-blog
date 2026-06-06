// ==========================================================================
// 개인 읽기 상태 — localStorage 기반(프라이버시 안전, 네트워크 0, 계정 없음)
// 읽은 글 / 북마크 / 최근 본 글. 이 브라우저에만 저장된다.
// ==========================================================================
(function () {
  const READ = 'rs:read';        // { id: timestamp }
  const MARK = 'rs:bookmarks';   // [id, ...]  (최근 저장이 앞)

  const get = (k, d) => {
    try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; }
    catch (e) { return d; }
  };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  window.ReadingState = {
    markRead(id) { const r = get(READ, {}); r[id] = Date.now(); set(READ, r); },
    isRead(id) { return id in get(READ, {}); },
    readIds() { return Object.keys(get(READ, {})); },
    recent(n) { const r = get(READ, {}); return Object.keys(r).sort((a, b) => r[b] - r[a]).slice(0, n); },
    seriesRead(postIds) { const r = get(READ, {}); return postIds.filter(id => id in r).length; },
    isBookmarked(id) { return get(MARK, []).includes(id); },
    toggleBookmark(id) {
      let m = get(MARK, []);
      m = m.includes(id) ? m.filter(x => x !== id) : [id, ...m];
      set(MARK, m);
      return m.includes(id);
    },
    bookmarks() { return get(MARK, []); },
  };
})();
