/* PixelForge — main.js */
const API = 'https://blockmines.page.gd/api/index.php';

let state = {
  bookmarks: JSON.parse(localStorage.getItem('pf-bm') || '[]'),
  filter:    'all',
  page:      1,
  pages:     1,
  settings:  {},
};

const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ── API CALL ─────────────────────────────────────────────── */
async function api(action, params = {}) {
  const url = new URL(API);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
  try {
    const r = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const text = await r.text();
    // Strip any InfinityFree injected HTML before the JSON
    const jsonStart = text.indexOf('{');
    if (jsonStart < 0) throw new Error('No JSON in response');
    return JSON.parse(text.slice(jsonStart));
  } catch (e) {
    console.error('[API] ' + action, e.message);
    return { error: e.message };
  }
}

/* ── THEME ────────────────────────────────────────────────── */
function initTheme() {
  const t = localStorage.getItem('pf-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
  if ($('#themeToggle')) $('#themeToggle').textContent = t === 'dark' ? '☀️' : '🌙';
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('pf-theme', next);
  if ($('#themeToggle')) $('#themeToggle').textContent = next === 'dark' ? '☀️' : '🌙';
}

/* ── NAV ──────────────────────────────────────────────────── */
function initNav() {
  window.addEventListener('scroll', () => {
    const nb = $('#navbar');
    if (nb) nb.classList.toggle('scrolled', window.scrollY > 50);
    const btt = $('#backToTop');
    if (btt) btt.classList.toggle('visible', window.scrollY > 500);
    const pb = $('#progressBar');
    if (pb) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      pb.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0%';
    }
  }, { passive: true });

  const mt = $('#mobileToggle');
  const nl = $('#navLinks');
  if (mt && nl) {
    mt.addEventListener('click', () => {
      nl.classList.toggle('active');
      mt.classList.toggle('active');
    });
    // Close menu when clicking a link
    nl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nl.classList.remove('active');
      mt.classList.remove('active');
    }));
  }

  // Active nav link
  const path = window.location.pathname;
  $$('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === path || (href !== '/' && path.startsWith(href.replace('.html',''))))
      a.classList.add('active');
  });
}

/* ── SEARCH ───────────────────────────────────────────────── */
function toggleSearch() {
  const o = $('#searchOverlay');
  if (!o) return;
  o.classList.toggle('active');
  if (o.classList.contains('active'))
    setTimeout(() => $('#searchInput')?.focus(), 200);
}
function setSearchQuery(q) {
  const i = $('#searchInput');
  if (i) { i.value = q; handleSearch(q); }
}
let searchTimer;
async function handleSearch(q) {
  clearTimeout(searchTimer);
  const r = $('#searchResults');
  if (!r) return;
  if (!q.trim()) { r.innerHTML = ''; return; }
  r.innerHTML = '<p style="color:var(--text-muted);padding:1rem;text-align:center">Searching…</p>';
  searchTimer = setTimeout(async () => {
    const d = await api('search', { q });
    if (d.posts && d.posts.length) {
      r.innerHTML = d.posts.map(p =>
        `<a href="/article/${p.slug}" class="search-result-item">
           <img src="${p.featured_image || '/assets/images/placeholder.jpg'}" alt="${esc(p.title)}" loading="lazy">
           <div class="search-result-info">
             <h4>${esc(p.title)}</h4>
             <p>${esc(p.category)} · ${p.published_at ? new Date(p.published_at).toLocaleDateString() : ''}</p>
           </div>
         </a>`
      ).join('');
    } else {
      r.innerHTML = '<p style="color:var(--text-muted);padding:2rem;text-align:center">No results found.</p>';
    }
  }, 300);
}

/* ── BOOKMARKS ────────────────────────────────────────────── */
function toggleBookmark(slug) {
  const i = state.bookmarks.indexOf(slug);
  if (i > -1) {
    state.bookmarks.splice(i, 1);
    showToast('Removed from bookmarks', 'info');
  } else {
    state.bookmarks.push(slug);
    showToast('Saved to bookmarks! 🔖', 'success');
  }
  localStorage.setItem('pf-bm', JSON.stringify(state.bookmarks));
  // Update all bookmark buttons for this slug
  $$(`[data-bookmark="${slug}"]`).forEach(btn => {
    btn.classList.toggle('bookmarked', state.bookmarks.includes(slug));
    btn.textContent = state.bookmarks.includes(slug) ? '★' : '☆';
  });
  renderBookmarks();
}
function isBookmarked(slug) { return state.bookmarks.includes(slug); }
function toggleBookmarksModal() {
  $('#bookmarksModal')?.classList.toggle('active');
  renderBookmarks();
}
function renderBookmarks() {
  const l = $('#bookmarksList');
  if (!l) return;
  if (!state.bookmarks.length) {
    l.innerHTML = '<div class="empty-state"><div class="icon">🔖</div><p>No saved articles yet.</p></div>';
    return;
  }
  l.innerHTML = state.bookmarks.map(slug =>
    `<a href="/article/${slug}" class="bookmark-item">
       <div style="flex:1"><strong>${slug.replace(/-/g,' ')}</strong></div>
     </a>`
  ).join('');
}

/* ── RENDER CARDS ─────────────────────────────────────────── */
function renderCards(posts) {
  if (!posts || !posts.length) {
    return `<div style="grid-column:1/-1;text-align:center;padding:5rem 1rem;color:var(--text-muted)">
      <div style="font-size:2.5rem;margin-bottom:1rem">🎮</div>
      <h3 style="margin-bottom:.5rem;color:var(--text-primary)">No articles yet</h3>
      <p>Check back soon — we're writing!</p>
    </div>`;
  }
  return posts.map(p => {
    const d = p.published_at ? new Date(p.published_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';
    const tags = (p.tags || '').split(',').map(t=>t.trim()).filter(Boolean).slice(0,2)
      .map(t=>`<span class="card-tag">${esc(t)}</span>`).join('');
    const bm = isBookmarked(p.slug);
    return `<article class="blog-card fade-in" itemscope itemtype="https://schema.org/BlogPosting">
  <div class="card-image">
    <a href="/article/${p.slug}">
      <img src="${p.featured_image || '/assets/images/placeholder.jpg'}" alt="${esc(p.title)}" loading="lazy" itemprop="image">
    </a>
    <div class="card-overlay"></div>
    <div class="card-actions">
      <button class="card-action-btn ${bm?'bookmarked':''}" data-bookmark="${p.slug}"
        onclick="event.preventDefault();event.stopPropagation();toggleBookmark('${p.slug}')" title="${bm?'Remove bookmark':'Bookmark'}">${bm?'★':'☆'}</button>
      <button class="card-action-btn" onclick="event.preventDefault();event.stopPropagation();sharePost('${esc(p.title)}','${p.slug}')" title="Share">↗</button>
    </div>
  </div>
  <div class="card-body">
    <div class="card-tags">
      <span class="badge ${p.category}">${p.category.replace(/-/g,' ').toUpperCase()}</span>
      ${tags}
    </div>
    <h3 itemprop="headline"><a href="/article/${p.slug}">${esc(p.title)}</a></h3>
    <p class="card-excerpt" itemprop="description">${esc(p.excerpt||'')}</p>
    <div class="card-footer">
      <div class="card-author">
        <img src="${p.author_avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%231a1a25'/%3E%3Ctext y='.9em' x='50%25' text-anchor='middle' font-size='24' dy='0.1em'%3E👤%3C/text%3E%3C/svg%3E"}" alt="${esc(p.author_name||'')}" loading="lazy">
        <div>
          <div class="card-author-name" itemprop="author">${esc(p.author_name||'Staff')}</div>
          <div class="card-author-date"><time itemprop="datePublished">${d}</time></div>
        </div>
      </div>
      <div class="card-stats">
        <span>👁️ ${fmtNum(p.views||0)}</span>
        <span>💬 ${p.comment_count||0}</span>
      </div>
    </div>
  </div>
</article>`;
  }).join('');
}

/* ── FEATURED ────────────────────────────────────────────── */
function renderFeatured(post) {
  if (!post) return '';
  const d = post.published_at ? new Date(post.published_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : '';
  return `<a href="/article/${post.slug}" class="featured-post fade-in" itemscope itemtype="https://schema.org/BlogPosting">
  <div class="featured-image">
    <img src="${post.featured_image||'/assets/images/placeholder.jpg'}" alt="${esc(post.title)}" loading="eager" itemprop="image">
    <span class="featured-badge">⭐ Featured</span>
  </div>
  <div class="featured-content">
    <div class="post-meta">
      <span class="badge ${post.category}">${post.category.replace(/-/g,' ').toUpperCase()}</span>
      <span class="meta-item">📅 ${d}</span>
      <span class="meta-item">👁️ ${fmtNum(post.views||0)}</span>
    </div>
    <h2 itemprop="headline">${esc(post.title)}</h2>
    <p itemprop="description">${esc(post.excerpt||'')}</p>
    <div class="author-row">
      <img src="${post.author_avatar||''}" alt="${esc(post.author_name||'')}" class="author-avatar" loading="lazy">
      <div class="author-info">
        <div class="author-name" itemprop="author">${esc(post.author_name||'Staff')}</div>
        <div class="author-role" style="color:var(--text-muted);font-size:.8rem">PixelForge Writer</div>
      </div>
    </div>
  </div>
</a>`;
}

/* ── LOAD POSTS ───────────────────────────────────────────── */
async function loadPosts(container, showFeatured = false) {
  // Show skeleton
  container.innerHTML = skeletonGrid(showFeatured ? 3 : 9);
  const params = { page: state.page };
  if (state.filter && state.filter !== 'all') params.category = state.filter;
  const d = await api('get_posts', params);
  if (d.error || !d.posts) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--text-muted)">
      <div style="font-size:2rem;margin-bottom:1rem">⚠️</div>
      <h3>Could not load articles</h3>
      <p style="margin-top:.5rem">Please try again later.</p>
    </div>`;
    return;
  }
  state.pages = d.pages || 1;

  if (showFeatured && d.posts.length) {
    const featured = d.posts[0];
    const rest = d.posts.slice(1);
    container.innerHTML = `
      <section style="margin-bottom:3rem">${renderFeatured(featured)}</section>
      <div class="blog-grid">${renderCards(rest)}</div>`;
  } else {
    container.innerHTML = renderCards(d.posts);
  }

  renderPagination(d.pages || 1);
  animate(container);
}

/* ── PAGINATION ──────────────────────────────────────────── */
function renderPagination(pages) {
  const c = $('#pagination');
  if (!c) return;
  if (pages <= 1) { c.innerHTML = ''; return; }
  const cur = state.page;
  let h = `<button class="pagination-btn" onclick="goTo(${cur-1})" ${cur===1?'disabled':''} aria-label="Previous">←</button>`;
  const delta = 2;
  for (let i = 1; i <= pages; i++) {
    if (i===1||i===pages||Math.abs(i-cur)<=delta) {
      h += `<button class="pagination-btn ${i===cur?'active':''}" onclick="goTo(${i})">${i}</button>`;
    } else if (Math.abs(i-cur)===delta+1) {
      h += `<span style="color:var(--text-muted);padding:0 .25rem">…</span>`;
    }
  }
  h += `<button class="pagination-btn" onclick="goTo(${cur+1})" ${cur===pages?'disabled':''} aria-label="Next">→</button>`;
  c.innerHTML = h;
}
function goTo(p) {
  if (p < 1 || p > state.pages) return;
  state.page = p;
  const g = $('#blogGrid') || $('#postsContainer');
  if (g) { loadPosts(g, false); window.scrollTo({top:g.offsetTop-100,behavior:'smooth'}); }
}

/* ── FILTERS ─────────────────────────────────────────────── */
function initFilters() {
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      state.filter = btn.dataset.category || 'all';
      state.page = 1;
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const g = $('#blogGrid') || $('#postsContainer');
      if (g) loadPosts(g, false);
    });
  });
}

/* ── NEWSLETTER ──────────────────────────────────────────── */
function initNewsletter() {
  const f = $('#newsletterForm');
  if (!f) return;
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const em = f.querySelector('input[type="email"]')?.value;
    if (!em) return;
    const btn = f.querySelector('button');
    if (btn) btn.textContent = 'Subscribing…';
    const d = await api('subscribe', { email: em });
    f.style.display = 'none';
    $('#newsletterSuccess')?.classList.add('show');
    showToast(d.message || 'Subscribed!', 'success');
  });
}
function scrollToNewsletter() { $('#newsletter')?.scrollIntoView({behavior:'smooth'}); }

/* ── SHARE ────────────────────────────────────────────────── */
function sharePost(title, slug) {
  const url = window.location.origin + '/article/' + slug;
  if (navigator.share) {
    navigator.share({title, url}).catch(()=>{});
  } else {
    navigator.clipboard.writeText(url).then(() => showToast('Link copied! 🔗', 'success'));
  }
}
function shareArticle(title) {
  if (navigator.share) {
    navigator.share({title, url: window.location.href}).catch(()=>{});
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => showToast('Link copied! 🔗', 'success'));
  }
}
function shareToX(title)    { window.open('https://x.com/intent/tweet?text='+encodeURIComponent(title)+'&url='+encodeURIComponent(window.location.href),'_blank'); }
function shareToLinkedIn()  { window.open('https://linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(window.location.href),'_blank'); }
function shareToFacebook()  { window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(window.location.href),'_blank'); }
function shareToReddit()    { window.open('https://reddit.com/submit?url='+encodeURIComponent(window.location.href)+'&title='+encodeURIComponent(document.title),'_blank'); }

/* ── REACTIONS ────────────────────────────────────────────── */
function initReactions() {
  $$('.reaction-btn').forEach(btn => {
    const key = 'pf-react-' + (window.postSlug || window.location.pathname);
    const stored = JSON.parse(localStorage.getItem(key) || '{}');
    const emoji = btn.querySelector('span:first-child')?.textContent || btn.textContent[0];
    if (stored[emoji]) btn.classList.add('active');
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const s = btn.querySelector('span:last-child');
      if (s) {
        let c = parseInt(s.textContent) || 0;
        s.textContent = btn.classList.contains('active') ? c+1 : Math.max(0,c-1);
      }
      stored[emoji] = btn.classList.contains('active');
      localStorage.setItem(key, JSON.stringify(stored));
    });
  });
}

/* ── COMMENTS ────────────────────────────────────────────────*/
function initComments() {
  const f = $('#commentForm');
  if (!f) return;
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const name    = f.querySelector('#commentName')?.value?.trim();
    const email   = f.querySelector('#commentEmail')?.value?.trim();
    const content = f.querySelector('#commentText')?.value?.trim();
    if (!name || !content) { showToast('Please fill in name and comment', 'warning'); return; }
    const btn = f.querySelector('button[type="submit"]');
    if (btn) btn.textContent = 'Submitting…';
    const d = await api('add_comment', { post_id: window.postId || 0, name, email: email||'', content });
    if (btn) btn.textContent = 'Post Comment';
    if (d.success) {
      showToast(d.message, 'success');
      f.querySelector('#commentText').value = '';
    } else {
      showToast(d.error || 'Failed to submit', 'error');
    }
  });
}

/* ── SETTINGS & ADSENSE ──────────────────────────────────── */
async function loadSettings() {
  const d = await api('get_settings');
  if (d.settings) {
    state.settings = d.settings;
    applyAdsense(d.settings);
  }
}
function applyAdsense(s) {
  if (!s || !s.adsense_client) return;
  // Load the AdSense script once
  if (!document.querySelector('script[src*="adsbygoogle"]')) {
    const sc = document.createElement('script');
    sc.async = true;
    sc.src   = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + s.adsense_client;
    sc.crossOrigin = 'anonymous';
    document.head.appendChild(sc);
  }
  // Inject ad slots
  const slots = [
    { key:'adsense_header',    sel:'nav.navbar',  pos:'after',  cls:'ad-header' },
    { key:'adsense_inarticle', sel:'.ad-inarticle',pos:'replace',cls:'ad-inarticle-inner' },
    { key:'adsense_sidebar',   sel:'.ad-sidebar', pos:'replace',cls:'ad-sidebar-inner' },
    { key:'adsense_footer',    sel:'footer.footer',pos:'before', cls:'ad-footer' },
  ];
  slots.forEach(({ key, sel, pos, cls }) => {
    if (!s[key]) return;
    const ins = `<ins class="adsbygoogle" style="display:block" data-ad-client="${s.adsense_client}" data-ad-slot="${s[key]}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
    const target = document.querySelector(sel);
    if (!target) return;
    if (pos === 'replace') { target.innerHTML = ins; }
    else {
      const div = document.createElement('div');
      div.className = cls;
      div.style.cssText = 'text-align:center;padding:.5rem 0;';
      div.innerHTML = ins;
      pos === 'after' ? target.after(div) : target.before(div);
    }
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(_) {}
  });
}

/* ── TRENDING SIDEBAR ────────────────────────────────────── */
async function loadTrending() {
  const c = $('#trendingList');
  if (!c) return;
  const d = await api('get_trending');
  if (!d.posts?.length) return;
  c.innerHTML = d.posts.map((p, i) =>
    `<a href="/article/${p.slug}" class="trending-item">
       <span class="trending-num">${i+1}</span>
       <div class="trending-info">
         <h4>${esc(p.title)}</h4>
         <p>${esc(p.category)} · ${fmtNum(p.views||0)} views</p>
       </div>
     </a>`
  ).join('');
}

/* ── TOAST ────────────────────────────────────────────────── */
function showToast(msg, type = 'info') {
  const c = $('#toastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  const icons = { success:'✅', warning:'⚠️', error:'❌', info:'ℹ️' };
  t.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 4500);
}

/* ── SCROLL ANIMATIONS ───────────────────────────────────── */
function animate(root = document) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }});
  }, { threshold: 0.08 });
  root.querySelectorAll('.fade-in:not(.visible)').forEach(el => obs.observe(el));
}

/* ── HELPERS ─────────────────────────────────────────────── */
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmtNum(n) { return n >= 1000 ? (n/1000).toFixed(1)+'k' : String(n); }
function scrollToTop() { window.scrollTo({top:0,behavior:'smooth'}); }

function skeletonGrid(n) {
  const cards = Array.from({length:n}, () => `
    <div class="loading-card">
      <div class="skeleton loading-img"></div>
      <div class="loading-body">
        <div class="skeleton loading-title"></div>
        <div class="skeleton loading-text"></div>
        <div class="skeleton loading-text sm"></div>
      </div>
    </div>`).join('');
  return `<div class="loading-grid">${cards}</div>`;
}

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initNewsletter();
  initReactions();
  initComments();
  initFilters();
  animate();
  loadSettings();
  renderBookmarks();

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); toggleSearch(); }
    if (e.key === 'Escape') {
      $('#searchOverlay')?.classList.remove('active');
      $('#bookmarksModal')?.classList.remove('active');
    }
  });

  // Close overlays on backdrop click
  $('#searchOverlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) toggleSearch(); });
  $('#bookmarksModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) toggleBookmarksModal(); });

  // Set current year
  $$('#currentYear, .current-year').forEach(el => el.textContent = new Date().getFullYear());
});
