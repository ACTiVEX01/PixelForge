/* PixelForge — shared-ui.js  (nav + footer injected into every page) */
(function () {
  const path = window.location.pathname;
  const isActive = href => {
    if (href === '/' && path === '/') return true;
    if (href !== '/' && path.startsWith(href)) return true;
    return false;
  };

  const navLinks = [
    { href: '/',                  label: 'Home' },
    { href: '/articles',          label: 'Articles' },
    { href: '/category/game-dev', label: 'Game Dev' },
    { href: '/category/news',     label: 'News' },
    { href: '/category/reviews',  label: 'Reviews' },
    { href: '/category/tutorials',label: 'Tutorials' },
  ];

  const navbar = `
<nav class="navbar" id="navbar" role="navigation" aria-label="Main navigation">
  <div class="nav-container">
    <a href="/" class="logo" aria-label="PixelForge Home"><div class="logo-icon" aria-hidden="true">🎮</div>PixelForge</a>
    <ul class="nav-links" id="navLinks" role="list">
      ${navLinks.map(l=>`<li><a href="${l.href}"${isActive(l.href)?' class="active"':''}>${l.label}</a></li>`).join('')}
    </ul>
    <div class="nav-actions">
      <button class="nav-btn" onclick="toggleSearch()" aria-label="Search">🔍</button>
      <button class="nav-btn" id="themeToggle" onclick="toggleTheme()" aria-label="Toggle theme">🌙</button>
      <button class="nav-btn" onclick="toggleBookmarksModal()" aria-label="Bookmarks">🔖</button>
      <button class="btn-subscribe" onclick="scrollToNewsletter()">Subscribe</button>
      <button class="mobile-toggle" id="mobileToggle" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </div>
</nav>
<div class="search-overlay" id="searchOverlay" role="dialog" aria-modal="true" aria-label="Search">
  <div class="search-container">
    <div class="search-box">
      <span aria-hidden="true">🔍</span>
      <input type="search" id="searchInput" placeholder="Search articles…" oninput="handleSearch(this.value)" autocomplete="off" aria-label="Search articles">
      <button class="search-close" onclick="toggleSearch()" aria-label="Close">✕</button>
    </div>
    <div class="search-tags">
      <button class="search-tag" onclick="setSearchQuery('GTA 6')">GTA 6</button>
      <button class="search-tag" onclick="setSearchQuery('Unity')">Unity</button>
      <button class="search-tag" onclick="setSearchQuery('Indie')">Indie</button>
      <button class="search-tag" onclick="setSearchQuery('Review')">Reviews</button>
      <button class="search-tag" onclick="setSearchQuery('Tutorial')">Tutorials</button>
    </div>
    <div class="search-results" id="searchResults" role="listbox"></div>
  </div>
</div>
<div class="modal-overlay" id="bookmarksModal" role="dialog" aria-modal="true" aria-label="Saved articles">
  <div class="modal">
    <div class="modal-header">
      <h3>🔖 Saved Articles</h3>
      <button class="modal-close" onclick="toggleBookmarksModal()" aria-label="Close">✕</button>
    </div>
    <div class="modal-body" id="bookmarksList"></div>
  </div>
</div>`;

  const footer = `
<footer class="footer" role="contentinfo">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="/" class="logo" style="margin-bottom:1rem;display:inline-flex;"><div class="logo-icon" aria-hidden="true">🎮</div>PixelForge</a>
        <p>Your ultimate destination for gaming news, game development stories, tutorials, and in-depth reviews.</p>
        <div class="social-links">
          <a href="#" class="social-link" aria-label="Twitter/X">𝕏</a>
          <a href="#" class="social-link" aria-label="YouTube">▶</a>
          <a href="#" class="social-link" aria-label="Discord">💬</a>
          <a href="#" class="social-link" aria-label="RSS">📡</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Categories</h4>
        <a href="/category/news">Gaming News</a>
        <a href="/category/reviews">Game Reviews</a>
        <a href="/category/game-dev">Game Dev</a>
        <a href="/category/tutorials">Tutorials</a>
        <a href="/category/indie-games">Indie Games</a>
      </div>
      <div class="footer-col">
        <h4>Site</h4>
        <a href="/articles">All Articles</a>
        <a href="/about">About Us</a>
        <a href="/contact">Contact</a>
        <a href="/sitemap.xml">Sitemap</a>
      </div>
      <div class="footer-col">
        <h4>Legal</h4>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Use</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© <span class="current-year"></span> PixelForge. All rights reserved.</p>
      <div class="footer-links">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/contact">Contact</a>
      </div>
    </div>
  </div>
</footer>
<button class="back-to-top" id="backToTop" onclick="scrollToTop()" aria-label="Back to top">↑</button>
<div class="toast-container" id="toastContainer" role="region" aria-live="polite"></div>`;

  // Inject navbar after body opens
  document.body.insertAdjacentHTML('afterbegin', navbar);

  // Inject footer before body closes
  const main = document.querySelector('main');
  if (main) main.insertAdjacentHTML('afterend', footer);
  else document.body.insertAdjacentHTML('beforeend', footer);
})();
