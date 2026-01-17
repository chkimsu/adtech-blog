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
    button.textContent = theme === 'dark' ? '☀️' : '🌙';
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
    <div class="post-meta">
      <span class="post-date">📅 ${formatDate(post.date)}</span>
      <span class="post-read-time">⏱️ ${post.readTime}</span>
    </div>
    <h3>${post.title}</h3>
    <p class="post-excerpt">${post.excerpt}</p>
    <div class="post-tags">
      ${post.tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('')}
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
      <div class="filter-tag active" data-category="">All</div>
      ${categories.map(cat =>
      `<div class="filter-tag" data-category="${cat}">${cat}</div>`
    ).join('')}
    `;

    categoriesContainer.querySelectorAll('.filter-tag').forEach(tag => {
      tag.addEventListener('click', () => filterByCategory(tag.dataset.category));
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

  // Update active state
  document.querySelectorAll('#category-filters .filter-tag').forEach(tag => {
    tag.classList.toggle('active', tag.dataset.category === category);
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
// Post Detail Page
// ========================================

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
        <span class="post-date">📅 ${formatDate(post.date)}</span>
        <!-- Read time calculation would need content first, skipping for now or estimating -->
      </div>
      <h1>${post.title}</h1>
      <div class="post-categories">
        ${post.categories.map(cat =>
      `<span class="category-badge">${cat}</span>`
    ).join('')}
      </div>
      <div class="post-tags" style="margin-top: 1rem;">
        ${post.tags.map(tag =>
      `<span class="tag" data-tag="${tag}">${tag}</span>`
    ).join('')}
      </div>
    `;

    // Add click handlers to tags - navigate to index with filter
    const tagElements = headerContainer.querySelectorAll('.tag');
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
        contentContainer.innerHTML = marked.parse(content);
      } else {
        contentContainer.innerHTML = content;
      }

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

  // Initialize comments
  initializeComments(postId, post.title);
}

function initializeComments(postId, postTitle) {
  const commentsContainer = document.getElementById('comments');
  if (!commentsContainer) return;

  // Note: Utterances requires a GitHub repo to be set up
  commentsContainer.innerHTML = `
    <h3>Comments</h3>
    <p style="color: var(--text-muted); margin-bottom: 1rem;">
      Comments powered by GitHub Discussions. 
      <a href="https://github.com/utterances" target="_blank" rel="noopener">Learn more about utterances</a>
    </p>
    <div class="utterances-placeholder" style="
      background: var(--bg-tertiary);
      border: 1px dashed var(--border-color);
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      color: var(--text-muted);
    ">
      <p><strong>💬 Comments will appear here once you:</strong></p>
      <ol style="text-align: left; max-width: 500px; margin: 1rem auto;">
        <li>Create a public GitHub repository</li>
        <li>Install the <a href="https://github.com/apps/utterances" target="_blank">utterances app</a></li>
        <li>Update the utterances configuration in main.js</li>
      </ol>
      <p style="margin-top: 1rem;">
        <a href="#utterances-config" style="color: var(--accent-primary);">
          See setup instructions below
        </a>
      </p>
    </div>
    
    <div id="utterances-config" style="
      margin-top: 2rem;
      padding: 1.5rem;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
    ">
      <h4>Utterances Setup Instructions</h4>
      <p>To enable comments, uncomment and configure the script below in main.js:</p>
      <pre><code>// Uncomment and update with your repo name:
/*
const script = document.createElement('script');
script.src = 'https://utteranc.es/client.js';
script.setAttribute('repo', 'YOUR-USERNAME/YOUR-REPO');
script.setAttribute('issue-term', 'pathname');
script.setAttribute('theme', 'github-dark');
script.setAttribute('crossorigin', 'anonymous');
script.async = true;
commentsContainer.appendChild(script);
*/</code></pre>
    </div>
  `;

  // Uncomment the following to enable utterances after setting up your repo:
  /*
  const script = document.createElement('script');
  script.src = 'https://utteranc.es/client.js';
  script.setAttribute('repo', 'YOUR-USERNAME/YOUR-REPO'); // CHANGE THIS
  script.setAttribute('issue-term', 'pathname');
  script.setAttribute('theme', document.documentElement.getAttribute('data-theme') === 'dark' ? 'github-dark' : 'github-light');
  script.setAttribute('crossorigin', 'anonymous');
  script.async = true;
  commentsContainer.appendChild(script);
  */
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
