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

  // Update page title
  document.title = `${post.title} - Ad Tech Blog`;

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

      // Render post navigation and related posts
      renderPostNavigation(post.id);
      renderRelatedPosts(post);

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

  const sorted = getAllPosts();
  const idx = sorted.findIndex(p => p.id === currentPostId);
  if (idx === -1) return;

  const prev = idx < sorted.length - 1 ? sorted[idx + 1] : null;
  const next = idx > 0 ? sorted[idx - 1] : null;

  nav.innerHTML = `
    ${prev ? `<a href="post.html?id=${prev.id}" class="post-nav-link post-nav-prev">
      <span class="post-nav-label">Previous</span>
      <span class="post-nav-title">${prev.title}</span>
    </a>` : '<div></div>'}
    ${next ? `<a href="post.html?id=${next.id}" class="post-nav-link post-nav-next">
      <span class="post-nav-label">Next</span>
      <span class="post-nav-title">${next.title}</span>
    </a>` : '<div></div>'}
  `;
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

  // Group posts by categories
  const postsByCategory = {};

  posts.forEach(post => {
    // Use only the first category as the primary category for the sidebar
    // to prevent duplicate entries
    if (post.categories && post.categories.length > 0) {
      const primaryCategory = post.categories[0];
      if (!postsByCategory[primaryCategory]) {
        postsByCategory[primaryCategory] = [];
      }
      postsByCategory[primaryCategory].push(post);
    }
  });

  // Render sidebar categories and posts
  const categoriesHTML = Object.keys(postsByCategory).sort().map(category => {
    const categoryPosts = postsByCategory[category];
    const postsHTML = categoryPosts.map(post => `
      <a href="post.html?id=${post.id}" class="sidebar-post-link" data-post-id="${post.id}">
        ${post.title}
      </a>
    `).join('');

    return `
      <div class="sidebar-category">
        <div class="category-header">
          <span class="category-icon">▼</span>
          <span>${category}</span>
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
}
