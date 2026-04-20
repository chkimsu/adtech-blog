// Main JavaScript for Ad Tech Blog
// Handles search, filtering, theme toggle, and dynamic content rendering

// ========================================
// Theme Management
// ========================================

function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
  const button = document.getElementById('theme-toggle');
  if (button) {
    button.textContent = theme === 'dark' ? 'Light' : 'Dark';
    button.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  }
}

// ========================================
// Post Rendering
// ========================================

function renderPostCard(post) {
  const card = document.createElement('div');
  card.className = 'post-card';
  card.onclick = () => navigateToPost(post.id);

  card.innerHTML = `
    <div class="post-card-category">${post.categories[0] || ''}</div>
    <h3>${post.title}</h3>
    <div class="post-card-footer">
      <div class="post-meta">
        <span class="post-date">${formatDate(post.date)}</span>
        <span class="post-meta-sep">·</span>
        <span class="post-read-time">${post.readTime}</span>
      </div>
      <div class="post-tags">
        ${post.tags.slice(0, 3).map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('')}
      </div>
    </div>
  `;

  // Add click handlers to tags
  const tagElements = card.querySelectorAll('.tag');
  tagElements.forEach(tagEl => {
    tagEl.onclick = (e) => {
      e.stopPropagation(); // Prevent card click (navigation)
      const tagValue = tagEl.dataset.tag;
      filterByTag(tagValue);

      // Scroll to top to see filtered results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  });

  return card;
}

function renderPosts(postsToRender) {
  const grid = document.getElementById('posts-grid');
  if (!grid) return;

  if (postsToRender.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <h3>No posts found</h3>
        <p style="color: var(--text-muted);">Try adjusting your search or filters</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  postsToRender.forEach((post, index) => {
    const card = renderPostCard(post);
    card.style.animationDelay = `${index * 0.1}s`;
    grid.appendChild(card);
  });
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function navigateToPost(postId) {
  window.location.href = `post.html?id=${postId}`;
}

// ========================================
// Search and Filter
// ========================================

let currentFilters = {
  search: '',
  category: '',
  tag: ''
};

function initializeFilters() {
  // Render category filters
  const categoriesContainer = document.getElementById('category-filters');
  if (categoriesContainer) {
    const categories = getAllCategories();
    categoriesContainer.innerHTML = `
      <div class="category-tab active" data-category="">All</div>
      ${categories.map(cat =>
      `<div class="category-tab" data-category="${cat}">${cat}</div>`
    ).join('')}
    `;

    categoriesContainer.querySelectorAll('.category-tab').forEach(catEl => {
      catEl.addEventListener('click', () => filterByCategory(catEl.dataset.category));
    });
  }

  // Render tag filters
  const tagsContainer = document.getElementById('tag-filters');
  if (tagsContainer) {
    const tags = getAllTags();
    tagsContainer.innerHTML = `
      <div class="filter-tag active" data-tag="">All</div>
      ${tags.map(tag =>
      `<div class="filter-tag" data-tag="${tag}">${tag}</div>`
    ).join('')}
    `;

    tagsContainer.querySelectorAll('.filter-tag').forEach(tag => {
      tag.addEventListener('click', () => filterByTag(tag.dataset.tag));
    });
  }

  // Setup search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilters.search = e.target.value;
      applyFilters();
    });
  }
}

function filterByCategory(category) {
  currentFilters.category = category;

  document.querySelectorAll('#category-filters .category-tab').forEach(catEl => {
    catEl.classList.toggle('active', catEl.dataset.category === category);
  });

  applyFilters();
}

function filterByTag(tag) {
  currentFilters.tag = tag;

  // Update active state
  document.querySelectorAll('#tag-filters .filter-tag').forEach(tagEl => {
    tagEl.classList.toggle('active', tagEl.dataset.tag === tag);
  });

  applyFilters();
}

function applyFilters() {
  const filteredPosts = filterPosts(
    currentFilters.search,
    currentFilters.category,
    currentFilters.tag
  );
  renderPosts(filteredPosts);
}

// ========================================
// Markdown Preprocessor
// ========================================

// Math block placeholders: protect $$...$$ and $...$ from marked.js
// which would otherwise interpret _ as italic markers inside LaTeX.
const mathPlaceholders = [];

function protectMathBlocks(text) {
  mathPlaceholders.length = 0;
  // Protect display math $$...$$ first (greedy, multiline)
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
    const idx = mathPlaceholders.length;
    mathPlaceholders.push(match);
    return `%%MATH_BLOCK_${idx}%%`;
  });
  // Protect inline math $...$ (single line, non-greedy)
  text = text.replace(/\$([^\$\n]+?)\$/g, (match) => {
    const idx = mathPlaceholders.length;
    mathPlaceholders.push(match);
    return `%%MATH_BLOCK_${idx}%%`;
  });
  return text;
}

function restoreMathBlocks(html) {
  return html.replace(/%%MATH_BLOCK_(\d+)%%/g, (_, idx) => {
    return mathPlaceholders[parseInt(idx)];
  });
}

function preprocessMarkdown(text) {
  if (!text) return '';
  return text
    // Normalize 3+ consecutive blank lines to max 2
    .replace(/\n{3,}/g, '\n\n')
    // Remove lines that are only a list marker with trailing whitespace (empty list items)
    .replace(/^([*\-+]) +$/gm, '')
    // Remove <br> tags that appear on their own line (avoids double-break artifacts)
    .replace(/^<br>\s*$/gim, '')
    // Fix CommonMark flanking rule: closing ** after punctuation )/]/"/'" + Korean
    // is not recognized as right-flanking, so bold fails to render.
    // Convert these cases to HTML <strong> tags before marked.js processes them.
    .replace(/\*\*([^*\n]+?[)\]"'"\u2019\u201D])\*\*(?=[가-힣])/g, '<strong>$1</strong>');
}

// ========================================
// Post Detail Page
// ========================================

// ========================================
// Reading Progress Bar
// ========================================

function initializeReadingProgress() {
  const progressBar = document.getElementById('reading-progress');
  if (!progressBar) return;

  function updateProgress() {
    const article = document.getElementById('post-content');
    if (!article) return;
    const scrollTop = window.scrollY;
    const articleTop = article.offsetTop;
    const articleHeight = article.offsetHeight;
    const windowHeight = window.innerHeight;
    const total = articleTop + articleHeight - windowHeight;
    const progress = Math.min(Math.max((scrollTop - articleTop + windowHeight * 0.1) / (articleHeight - windowHeight * 0.8) * 100, 0), 100);
    progressBar.style.width = progress + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
}

// ========================================
// Code Block Post-Processing
// ========================================

function enhanceCodeBlocks(container) {
  const preBlocks = container.querySelectorAll('pre');
  preBlocks.forEach(pre => {
    // Skip mermaid blocks
    if (pre.classList.contains('mermaid')) return;
    const codeEl = pre.querySelector('code');
    if (!codeEl) return;

    // Detect language from class (highlight.js uses hljs + language-xxx)
    let lang = '';
    const classes = Array.from(codeEl.classList);
    const langClass = classes.find(c => c.startsWith('language-') && c !== 'language-undefined');
    if (langClass && langClass.startsWith('language-')) {
      lang = langClass.replace('language-', '');
    } else if (codeEl.dataset.highlighted) {
      // Try to get detected language from hljs result attribute
      lang = codeEl.getAttribute('data-lang') || '';
    }

    // Build wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';

    // Build header
    const header = document.createElement('div');
    header.className = 'code-header';

    const langLabel = document.createElement('span');
    langLabel.className = 'code-lang';
    const meaningfulLang = lang && lang !== 'text' && lang !== 'plaintext';
    langLabel.textContent = meaningfulLang ? lang : '';
    if (!meaningfulLang) langLabel.style.display = 'none';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => {
      const text = codeEl.innerText;
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        // Fallback for non-https
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    });

    header.appendChild(langLabel);
    header.appendChild(copyBtn);

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);
  });
}

// ========================================
// Table Post-Processing (mobile scroll)
// ========================================

function wrapTables(container) {
  const tables = container.querySelectorAll('table');
  tables.forEach(table => {
    if (table.parentElement.classList.contains('table-wrapper')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}

// ========================================
// Post TOC Sidebar
// ========================================

function buildPostTOC(contentContainer) {
  const sidebarNav = document.getElementById('sidebar-nav');
  if (!sidebarNav) return;

  const headings = contentContainer.querySelectorAll('h2, h3');
  if (headings.length === 0) return;

  // Assign IDs to headings
  const slugCount = {};
  headings.forEach(heading => {
    let slug = heading.textContent
      .trim()
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60);
    if (!slug) slug = 'section';
    slugCount[slug] = (slugCount[slug] || 0) + 1;
    if (slugCount[slug] > 1) slug += '-' + slugCount[slug];
    heading.id = slug;
  });

  // Build TOC HTML
  const backLink = `<a href="index.html" class="toc-back-link">← All Posts</a>`;
  const tocItems = Array.from(headings).map(h => {
    const level = h.tagName === 'H2' ? 'toc-h2' : 'toc-h3';
    return `<a href="#${h.id}" class="toc-item ${level}">${h.textContent}</a>`;
  }).join('');

  sidebarNav.innerHTML = `
    <div class="sidebar-header" style="border-bottom: 1px solid var(--border-color); margin-bottom: 0.5rem;">
      <h3 style="font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin: 0; padding: 0 1.5rem 1rem;">Contents</h3>
    </div>
    ${backLink}
    <div class="toc-list">${tocItems}</div>
  `;

  // Highlight active heading on scroll
  const tocLinks = sidebarNav.querySelectorAll('.toc-item');
  const headingEls = Array.from(headings);

  function updateActiveToc() {
    let current = headingEls[0];
    for (const h of headingEls) {
      if (h.getBoundingClientRect().top <= 120) {
        current = h;
      }
    }
    tocLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current.id);
    });
  }

  window.addEventListener('scroll', updateActiveToc, { passive: true });
  updateActiveToc();

  // Smooth scroll for TOC links (with header offset)
  tocLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href').replace('#', '');
      const target = document.getElementById(targetId);
      if (target) {
        const headerOffset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
        window.history.replaceState(null, '', '#' + targetId);
      }
    });
  });
}

const SITE_BASE_URL = 'https://chkimsu.github.io/adtech-blog';

function updatePostMeta(post) {
  const url = `${SITE_BASE_URL}/post.html?id=${post.id}`;
  const description = (post.excerpt || '').slice(0, 200);
  const image = `${SITE_BASE_URL}/images/rtb-flow-overview.png`;
  const category = (post.categories && post.categories[0]) || '';

  document.title = `${post.title} - Ad Tech Blog`;

  const setContent = (id, value) => {
    const el = document.getElementById(id);
    if (el && value) el.setAttribute('content', value);
  };

  setContent('meta-description', description);
  setContent('og-title', post.title);
  setContent('og-description', description);
  setContent('og-url', url);
  setContent('og-image', image);
  setContent('twitter-title', post.title);
  setContent('twitter-description', description);

  const canonical = document.getElementById('canonical-link');
  if (canonical) canonical.setAttribute('href', url);

  const ldScript = document.getElementById('ld-article');
  if (ldScript) {
    const ldData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: description,
      datePublished: post.date,
      dateModified: post.date,
      author: {
        '@type': 'Organization',
        name: 'Ad Tech Blog',
        url: SITE_BASE_URL
      },
      publisher: {
        '@type': 'Organization',
        name: 'Ad Tech Blog',
        url: SITE_BASE_URL
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      url: url,
      image: image,
      inLanguage: 'ko-KR',
      keywords: (post.tags || []).join(', '),
      articleSection: category
    };
    ldScript.textContent = JSON.stringify(ldData);
  }
}

function renderBreadcrumb(post) {
  const container = document.getElementById('breadcrumb');
  if (!container) return;
  const category = (post.categories && post.categories[0]) || '';
  const categoryLink = category
    ? `<a href="index.html?category=${encodeURIComponent(category)}">${category}</a>`
    : '';

  container.innerHTML = `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">홈</a>
      ${category ? `<span class="breadcrumb-sep">›</span>${categoryLink}` : ''}
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current" title="${post.title}">${post.title}</span>
    </nav>
  `;

  const ldBreadcrumb = document.getElementById('ld-breadcrumb');
  if (ldBreadcrumb) {
    const items = [
      { position: 1, name: '홈', item: `${SITE_BASE_URL}/` }
    ];
    if (category) {
      items.push({
        position: 2,
        name: category,
        item: `${SITE_BASE_URL}/index.html?category=${encodeURIComponent(category)}`
      });
    }
    items.push({
      position: items.length + 1,
      name: post.title,
      item: `${SITE_BASE_URL}/post.html?id=${post.id}`
    });
    ldBreadcrumb.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map(i => ({
        '@type': 'ListItem',
        position: i.position,
        name: i.name,
        item: i.item
      }))
    });
  }
}

async function renderPostDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  if (!postId) {
    window.location.href = 'index.html';
    return;
  }

  const post = getPostById(postId);

  if (!post) {
    window.location.href = 'index.html';
    return;
  }

  // Update page title and SEO meta tags
  updatePostMeta(post);

  // Render breadcrumb
  renderBreadcrumb(post);

  // Render post header
  const headerContainer = document.getElementById('post-header');
  if (headerContainer) {
    headerContainer.innerHTML = `
      <div class="post-meta">
        <span class="post-date">${formatDate(post.date)}</span>
        <span class="post-read-time">${post.readTime}</span>
      </div>
      <h1>${post.title}</h1>
      <div class="post-header-tags">
        ${post.tags.map(tag =>
      `<span class="post-header-tag" data-tag="${tag}">${tag}</span>`
    ).join('')}
      </div>
    `;

    // Add click handlers to tags - navigate to index with filter
    const tagElements = headerContainer.querySelectorAll('.post-header-tag');
    tagElements.forEach(tagEl => {
      tagEl.onclick = () => {
        const tagValue = tagEl.dataset.tag;
        window.location.href = `index.html?tag=${encodeURIComponent(tagValue)}`;
      };
    });
  }


  // Render post content
  const contentContainer = document.getElementById('post-content');
  if (contentContainer) {
    contentContainer.innerHTML = '<div class="loading">Loading content...</div>';

    try {
      let content = '';
      if (post.contentUrl) {
        const response = await fetch(post.contentUrl);
        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.statusText}`);
        }
        content = await response.text();
      } else if (post.content) {
        // Fallback for legacy posts if any
        content = post.content;
      } else {
        throw new Error('No content found for this post');
      }

      // Convert Markdown to HTML
      if (typeof marked !== 'undefined') {
        const markedExt = { breaks: false, gfm: true };

        if (typeof hljs !== 'undefined') {
          markedExt.renderer = {
            code(tokenOrText, langArg) {
              // marked v12 passes either an object {text, lang} or (text, lang) as positional args
              let text, lang;
              if (typeof tokenOrText === 'string') {
                text = tokenOrText;
                lang = langArg || '';
              } else {
                text = tokenOrText.text || tokenOrText.raw || '';
                lang = tokenOrText.lang || '';
              }
              if (!text) text = '';

              // Mermaid diagram
              if (lang === 'mermaid') {
                return `<pre class="mermaid">${text}</pre>`;
              }

              const language = lang && hljs.getLanguage(lang) ? lang : null;
              try {
                const highlighted = language
                  ? hljs.highlight(text, { language }).value
                  : text ? hljs.highlightAuto(text).value : '';
                const detectedLang = language || '';
                return `<pre><code class="hljs language-${detectedLang}" data-lang="${detectedLang}">${highlighted}</code></pre>`;
              } catch (e) {
                return `<pre><code>${text}</code></pre>`;
              }
            }
          };
        }

        marked.use(markedExt);
        const preprocessed = preprocessMarkdown(content);
        const mathProtected = protectMathBlocks(preprocessed);
        const parsed = marked.parse(mathProtected);
        contentContainer.innerHTML = restoreMathBlocks(parsed);
      } else {
        contentContainer.innerHTML = content;
      }

      // Enhance code blocks with language label + copy button
      enhanceCodeBlocks(contentContainer);

      // Wrap tables for mobile scroll
      wrapTables(contentContainer);

      // Build TOC in sidebar
      buildPostTOC(contentContainer);

      // Render LaTeX math equations with KaTeX
      const renderMath = () => {
        if (typeof renderMathInElement !== 'undefined') {
          renderMathInElement(contentContainer, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\[', right: '\\]', display: true },
              { left: '\\(', right: '\\)', display: false }
            ],
            throwOnError: false
          });
        } else {
          setTimeout(renderMath, 50);
        }
      };

      renderMath();

      // Render Chart.js charts identified by data-chart attribute
      renderChartJsCharts(contentContainer);

      // Render Mermaid diagrams
      const mermaidInstance = window.mermaidLib || (typeof mermaid !== 'undefined' ? mermaid : null);
      if (mermaidInstance) {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        mermaidInstance.initialize({
          startOnLoad: false,
          theme: currentTheme === 'dark' ? 'dark' : 'default'
        });
        mermaidInstance.run();
      }

      // Render related posts and continue-reading CTAs (Prev/Next section removed by request)
      renderRelatedPosts(post);
      renderContinueReadingTop(post);
      setupMobileNextCta(post);

    } catch (error) {
      console.error('Error loading post:', error);
      contentContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <h3>Error loading post</h3>
          <p>${error.message}</p>
          <p>If you are running this locally, please make sure you are using a local server (e.g., python -m http.server).</p>
        </div>
      `;
    }
  }

}

// ========================================
// Post Navigation (Prev / Next)
// ========================================

function renderPostNavigation(currentPostId) {
  const nav = document.getElementById('post-nav');
  if (!nav) return;

  const currentPost = getPostById(currentPostId);
  if (!currentPost) return;

  const allByDate = getAllPosts();
  const dateIdx = allByDate.findIndex(p => p.id === currentPostId);
  const dateNav = {
    prev: dateIdx < allByDate.length - 1 ? allByDate[dateIdx + 1] : null,
    next: dateIdx > 0 ? allByDate[dateIdx - 1] : null
  };

  const primaryCategory = (currentPost.categories && currentPost.categories[0]) || '';
  const categoryPosts = allByDate.filter(p =>
    p.categories && p.categories[0] === primaryCategory
  );
  const catIdx = categoryPosts.findIndex(p => p.id === currentPostId);
  const categoryNav = {
    prev: catIdx < categoryPosts.length - 1 ? categoryPosts[catIdx + 1] : null,
    next: catIdx > 0 ? categoryPosts[catIdx - 1] : null
  };

  const hasCategoryNeighbor = categoryNav.prev || categoryNav.next;
  const defaultTab = hasCategoryNeighbor ? 'category' : 'date';

  const buildGrid = (data) => `
    ${data.prev ? `<a href="post.html?id=${data.prev.id}" class="post-nav-link post-nav-prev">
      <span class="post-nav-label">← 이전 글</span>
      <span class="post-nav-title">${data.prev.title}</span>
    </a>` : '<div></div>'}
    ${data.next ? `<a href="post.html?id=${data.next.id}" class="post-nav-link post-nav-next">
      <span class="post-nav-label">다음 글 →</span>
      <span class="post-nav-title">${data.next.title}</span>
    </a>` : '<div></div>'}
  `;

  nav.innerHTML = `
    <div class="post-nav-inner">
      <div class="post-nav-tabs" role="tablist">
        <button type="button" class="post-nav-tab ${defaultTab === 'category' ? 'active' : ''}" data-nav-tab="category" role="tab" aria-selected="${defaultTab === 'category'}">
          같은 카테고리${primaryCategory ? ` · ${primaryCategory}` : ''}
        </button>
        <button type="button" class="post-nav-tab ${defaultTab === 'date' ? 'active' : ''}" data-nav-tab="date" role="tab" aria-selected="${defaultTab === 'date'}">
          시간순
        </button>
      </div>
      <div class="post-nav-grid" data-nav-panel="category"${defaultTab !== 'category' ? ' hidden' : ''}>
        ${buildGrid(categoryNav)}
      </div>
      <div class="post-nav-grid" data-nav-panel="date"${defaultTab !== 'date' ? ' hidden' : ''}>
        ${buildGrid(dateNav)}
      </div>
    </div>
  `;

  nav.querySelectorAll('.post-nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.navTab;
      nav.querySelectorAll('.post-nav-tab').forEach(b => {
        const active = b.dataset.navTab === target;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      nav.querySelectorAll('[data-nav-panel]').forEach(p => {
        p.hidden = p.dataset.navPanel !== target;
      });
    });
  });
}

// ========================================
// Related Posts
// ========================================

function renderRelatedPosts(currentPost) {
  const container = document.getElementById('related-posts');
  if (!container) return;

  // Find posts sharing tags or categories
  const scored = posts
    .filter(p => p.id !== currentPost.id)
    .map(p => {
      let score = 0;
      p.tags.forEach(t => { if (currentPost.tags.includes(t)) score += 2; });
      p.categories.forEach(c => { if (currentPost.categories.includes(c)) score += 1; });
      return { post: p, score };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored.length === 0) return;

  container.innerHTML = `
    <div class="container">
      <h3 class="related-posts-title">Related Posts</h3>
      <div class="related-posts-grid">
        ${scored.map(s => `
          <a href="post.html?id=${s.post.id}" class="related-post-card">
            <span class="related-post-date">${formatDate(s.post.date)}</span>
            <span class="related-post-name">${s.post.title}</span>
            <span class="related-post-excerpt">${s.post.excerpt}</span>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

// ========================================
// Continue Reading (top of article)
// ========================================

function renderContinueReadingTop(post) {
  const container = document.getElementById('continue-reading-top');
  if (!container) return;

  const primaryCategory = (post.categories && post.categories[0]) || '';
  const allByDate = getAllPosts();
  const categoryPosts = allByDate.filter(p =>
    p.categories && p.categories[0] === primaryCategory
  );
  const catIdx = categoryPosts.findIndex(p => p.id === post.id);
  const nextInCategory = catIdx > 0 ? categoryPosts[catIdx - 1] : null;
  const prevInCategory = catIdx < categoryPosts.length - 1 ? categoryPosts[catIdx + 1] : null;
  const categoryPick = nextInCategory || prevInCategory;
  const categoryLabel = nextInCategory
    ? `다음 · ${primaryCategory}`
    : `같은 카테고리 · ${primaryCategory}`;

  const scored = posts
    .filter(p => p.id !== post.id && (!categoryPick || p.id !== categoryPick.id))
    .map(p => {
      let score = 0;
      p.tags.forEach(t => { if (post.tags.includes(t)) score += 2; });
      p.categories.forEach(c => { if (post.categories.includes(c)) score += 1; });
      return { post: p, score };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);
  const topRelated = scored[0] ? scored[0].post : null;

  const cards = [];
  if (categoryPick) {
    cards.push({ label: categoryLabel, post: categoryPick });
  }
  if (topRelated) {
    cards.push({ label: '관련 포스트', post: topRelated });
  }

  if (cards.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="container">
      <div class="continue-reading-header">
        <span class="continue-reading-title-label">이어서 읽기</span>
      </div>
      <div class="continue-reading-grid">
        ${cards.map(item => `
          <a href="post.html?id=${item.post.id}" class="continue-reading-card">
            <span class="continue-reading-label">${item.label}</span>
            <span class="continue-reading-headline">${item.post.title}</span>
            <span class="continue-reading-excerpt">${(item.post.excerpt || '').slice(0, 120)}…</span>
            <span class="continue-reading-meta">${formatDate(item.post.date)} · ${item.post.readTime}</span>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

// ========================================
// Mobile Next-Post Floating CTA
// ========================================

function setupMobileNextCta(post) {
  const cta = document.getElementById('mobile-next-cta');
  if (!cta) return;

  const allByDate = getAllPosts();
  const primaryCategory = (post.categories && post.categories[0]) || '';
  const categoryPosts = allByDate.filter(p =>
    p.categories && p.categories[0] === primaryCategory
  );
  const catIdx = categoryPosts.findIndex(p => p.id === post.id);
  const dateIdx = allByDate.findIndex(p => p.id === post.id);

  // Priority: same-category newer > chronological newer > same-category older > chronological older
  let nextPost = null;
  let ctaLabel = '다음 글';
  if (catIdx > 0) {
    nextPost = categoryPosts[catIdx - 1];
    ctaLabel = '다음 글';
  } else if (dateIdx > 0) {
    nextPost = allByDate[dateIdx - 1];
    ctaLabel = '다음 글';
  } else if (catIdx < categoryPosts.length - 1 && catIdx !== -1) {
    nextPost = categoryPosts[catIdx + 1];
    ctaLabel = '이어서 읽기';
  } else if (dateIdx < allByDate.length - 1 && dateIdx !== -1) {
    nextPost = allByDate[dateIdx + 1];
    ctaLabel = '이어서 읽기';
  }

  if (!nextPost) {
    cta.hidden = true;
    return;
  }

  cta.href = `post.html?id=${nextPost.id}`;
  cta.innerHTML = `
    <span class="mobile-next-cta-label">${ctaLabel}</span>
    <span class="mobile-next-cta-title">${nextPost.title} →</span>
  `;

  const mq = window.matchMedia('(max-width: 768px)');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const update = () => {
    if (!mq.matches) {
      cta.hidden = true;
      if (sidebarToggle) sidebarToggle.style.display = '';
      return;
    }
    const article = document.getElementById('post-content');
    if (!article) return;
    const articleTop = article.offsetTop;
    const articleHeight = article.offsetHeight;
    const progress = (window.scrollY + window.innerHeight - articleTop) / articleHeight;
    cta.hidden = progress < 0.8;
    // Hide the sidebar toggle when the CTA is up so they don't overlap visually
    if (sidebarToggle) sidebarToggle.style.display = cta.hidden ? '' : 'none';
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

// ========================================
// Post Search Modal
// ========================================

function setupSearchModal() {
  const modal = document.getElementById('search-modal');
  const openBtn = document.getElementById('post-search-btn');
  const input = document.getElementById('search-modal-input');
  const results = document.getElementById('search-modal-results');
  if (!modal || !input || !results) return;

  let activeIndex = -1;
  let currentItems = [];

  const open = () => {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    input.value = '';
    renderResults('');
    setTimeout(() => input.focus(), 40);
  };

  const close = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
  };

  const renderResults = (query) => {
    const q = query.trim().toLowerCase();
    let items;
    if (!q) {
      items = getAllPosts().slice(0, 10);
    } else {
      items = posts
        .filter(p =>
          p.title.toLowerCase().includes(q)
          || (p.excerpt || '').toLowerCase().includes(q)
          || (p.tags || []).some(t => t.toLowerCase().includes(q))
          || (p.categories || []).some(c => c.toLowerCase().includes(q))
        )
        .slice(0, 20);
    }
    currentItems = items;
    activeIndex = items.length ? 0 : -1;

    if (items.length === 0) {
      results.innerHTML = `<div class="search-modal-empty">"${query}"에 해당하는 포스트가 없습니다.</div>`;
      return;
    }

    results.innerHTML = items.map((p, i) => `
      <a href="post.html?id=${p.id}" class="search-modal-item${i === activeIndex ? ' active' : ''}" data-index="${i}">
        <span class="search-modal-item-category">${p.categories[0] || ''}</span>
        <span class="search-modal-item-title">${p.title}</span>
        <span class="search-modal-item-excerpt">${(p.excerpt || '').slice(0, 110)}…</span>
      </a>
    `).join('');
  };

  const highlightActive = () => {
    const items = results.querySelectorAll('.search-modal-item');
    items.forEach((el, i) => {
      el.classList.toggle('active', i === activeIndex);
      if (i === activeIndex) el.scrollIntoView({ block: 'nearest' });
    });
  };

  if (openBtn) openBtn.addEventListener('click', open);
  modal.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', close);
  });

  input.addEventListener('input', (e) => renderResults(e.target.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentItems.length) {
        activeIndex = Math.min(currentItems.length - 1, activeIndex + 1);
        highlightActive();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentItems.length) {
        activeIndex = Math.max(0, activeIndex - 1);
        highlightActive();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentItems[activeIndex]) {
        window.location.href = `post.html?id=${currentItems[activeIndex].id}`;
      }
    } else if (e.key === 'Escape') {
      close();
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal.hidden) open(); else close();
    } else if (e.key === 'Escape' && !modal.hidden) {
      close();
    }
  });
}

// ========================================
// Smooth Scrolling
// ========================================

function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ========================================
// Sidebar Navigation
// ========================================



function initializeSidebar() {
  const sidebarNav = document.getElementById('sidebar-nav');
  if (!sidebarNav) return;

  // Group posts by primary category
  const postsByCategory = {};
  posts.forEach(post => {
    if (post.categories && post.categories.length > 0) {
      const primaryCategory = post.categories[0];
      if (!postsByCategory[primaryCategory]) {
        postsByCategory[primaryCategory] = [];
      }
      postsByCategory[primaryCategory].push(post);
    }
  });

  // Determine the reader's current category (only meaningful on post.html)
  const urlParams = new URLSearchParams(window.location.search);
  const currentPostId = urlParams.get('id');
  const currentPost = currentPostId ? getPostById(currentPostId) : null;
  const currentCategory = currentPost && currentPost.categories
    ? currentPost.categories[0]
    : null;

  // Sort: current category first, then alphabetical for the rest
  const sortedCategories = Object.keys(postsByCategory).sort((a, b) => {
    if (a === currentCategory) return -1;
    if (b === currentCategory) return 1;
    return a.localeCompare(b);
  });

  const categoriesHTML = sortedCategories.map(category => {
    const categoryPosts = postsByCategory[category]
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const isCurrent = category === currentCategory;
    const postsHTML = categoryPosts.map(post => `
      <a href="post.html?id=${post.id}" class="sidebar-post-link" data-post-id="${post.id}">
        ${post.title}
      </a>
    `).join('');

    return `
      <div class="sidebar-category${isCurrent ? ' is-current' : ' collapsed'}">
        <div class="category-header">
          <span class="category-icon">▼</span>
          <span>${category}${isCurrent ? ' <em class="category-current-tag">(현재)</em>' : ''}</span>
        </div>
        <div class="category-posts">
          ${postsHTML}
        </div>
      </div>
    `;
  }).join('');

  sidebarNav.innerHTML = categoriesHTML;

  // Add click handlers for collapsible categories
  document.querySelectorAll('.category-header').forEach(header => {
    header.addEventListener('click', function () {
      this.parentElement.classList.toggle('collapsed');
    });
  });

  // Highlight active post if on post detail page
  highlightActivePost();

  // Setup mobile toggle
  setupSidebarToggle();
}

function highlightActivePost() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPostId = urlParams.get('id');

  if (currentPostId) {
    const activeLink = document.querySelector(`.sidebar-post-link[data-post-id="${currentPostId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      // Expand the parent category
      const parentCategory = activeLink.closest('.sidebar-category');
      if (parentCategory) {
        parentCategory.classList.remove('collapsed');
      }
    }
  }
}

function setupSidebarToggle() {
  const toggleButton = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');

  if (!toggleButton || !sidebar) return;

  toggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('visible');

    // Add overlay for mobile when sidebar is open
    if (window.innerWidth <= 768) {
      if (sidebar.classList.contains('visible')) {
        createOverlay();
      } else {
        removeOverlay();
      }
    }
  });

  // Close sidebar when clicking outside on mobile
  function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 899;
    `;
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('visible');
      removeOverlay();
    });
    document.body.appendChild(overlay);
  }

  function removeOverlay() {
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
}

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  initializeTheme();

  // Setup theme toggle button
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Initialize sidebar navigation
  initializeSidebar();

  // Setup global post search modal (works on any page that has the modal DOM)
  setupSearchModal();

  // Check if we're on the home page or post page
  const postsGrid = document.getElementById('posts-grid');
  const postContent = document.getElementById('post-content');

  if (postsGrid) {
    // Home page
    initializeFilters();
    renderPosts(posts);
  } else if (postContent) {
    // Post detail page
    renderPostDetail();
    initializeReadingProgress();
  }

  // Initialize smooth scrolling
  initializeSmoothScroll();

  // Add animation to elements on scroll
  observeElements();
});

// ========================================
// Scroll Animations
// ========================================

function observeElements() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1
  });

  document.querySelectorAll('.post-card, .about-section').forEach(el => {
    observer.observe(el);
  });
}

// ========================================
// Search Parameters Handling
// ========================================

// Allow linking to filtered views
function applyUrlFilters() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  const tag = urlParams.get('tag');
  const search = urlParams.get('search');

  if (category) filterByCategory(category);
  if (tag) filterByTag(tag);
  if (search) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = search;
      currentFilters.search = search;
    }
  }

  if (category || tag || search) {
    applyFilters();
  }
}

// Call this after DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyUrlFilters);
} else {
  applyUrlFilters();
}

// ========================================
// Chart.js Rendering for Post Content
// ========================================

function renderChartJsCharts(container) {
  if (typeof Chart === 'undefined') return;

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const textColor = isDark ? '#b8c5d6' : '#4a5568';

  // Chart: Feature Freshness
  const freshnessCanvas = container.querySelector('#freshnessChart');
  if (freshnessCanvas) {
    new Chart(freshnessCanvas, {
      type: 'bar',
      data: {
        labels: ['디바이스/시간대', '캠페인 잔여예산', '유저 최근 클릭', '광고 CTR', '유저 7일 CTR', '유저 임베딩', '관심사 세그먼트'],
        datasets: [{
          label: '권장 갱신 주기 (분)',
          data: [0.01, 1, 5, 60, 1440, 1440, 1440],
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)', 'rgba(75, 192, 192, 0.7)',
            'rgba(255, 159, 64, 0.7)', 'rgba(255, 159, 64, 0.7)',
            'rgba(255, 206, 86, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(255, 206, 86, 0.7)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)', 'rgba(75, 192, 192, 1)',
            'rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 1)',
            'rgba(255, 206, 86, 1)', 'rgba(255, 206, 86, 1)', 'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '피처별 권장 갱신 주기 (로그 스케일)',
            color: textColor,
            font: { size: 14, weight: 600 }
          },
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                const v = ctx.raw;
                if (v < 1) return 'Real-Time (요청 시점)';
                if (v < 60) return v + '분 (Streaming)';
                if (v < 1440) return (v / 60) + '시간 (Streaming/Batch)';
                return (v / 1440) + '일 (Batch)';
              }
            }
          }
        },
        scales: {
          x: {
            type: 'logarithmic',
            title: { display: true, text: '갱신 주기 (분, 로그 스케일)', color: textColor },
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: function(v) {
                if (v === 0.01) return 'RT';
                if (v === 1) return '1분';
                if (v === 5) return '5분';
                if (v === 60) return '1시간';
                if (v === 1440) return '1일';
                return '';
              }
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: textColor, font: { size: 12 } }
          }
        }
      }
    });
  }

  // Chart: LinUCB Score Decomposition (static snapshot matching post text)
  const linucbCanvas = container.querySelector('#linucbChart');
  if (linucbCanvas) {
    new Chart(linucbCanvas, {
      type: 'bar',
      data: {
        labels: ['Ad A (Tech) ★', 'Ad B (Fashion)', 'Ad C (Food)', 'Ad D (Travel)'],
        datasets: [
          {
            label: '예측 점수 (Exploitation)',
            data: [0.45, 0.10, 0.08, 0.00],
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: '탐색 보너스 (Exploration)',
            data: [0.22, 0.35, 0.20, 0.61],
            backgroundColor: 'rgba(200, 200, 200, 0.45)',
            borderColor: 'rgba(200, 200, 200, 0.8)',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { color: textColor, font: { size: 12 } }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: { display: true, text: 'UCB Score', color: textColor },
            grid: { color: gridColor },
            ticks: { color: textColor }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'LinUCB Score Decomposition — Ad A Recommended',
            color: textColor,
            font: { size: 14, weight: 600 }
          },
          legend: {
            labels: { color: textColor }
          },
          tooltip: {
            callbacks: {
              afterBody: function(context) {
                const idx = context[0].dataIndex;
                const pred = [0.45, 0.10, 0.08, 0.00][idx];
                const unc = [0.22, 0.35, 0.20, 0.61][idx];
                return '합계 UCB: ' + (pred + unc).toFixed(2);
              }
            }
          }
        }
      }
    });
  }
}
