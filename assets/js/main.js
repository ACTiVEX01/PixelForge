const siteConfig = {name:"PixelForge",url:window.location.origin,apiUrl:window.location.origin+"/api"};
let state = {bookmarks:JSON.parse(localStorage.getItem('pf-bookmarks'))||[],currentFilter:'all',currentPage:1,articlesPerPage:9,cachedPosts:[],cachedSettings:{}};
const $=s=>document.querySelector(s);const $$=s=>document.querySelectorAll(s);

async function api(action,params={}){
    const url=new URL(siteConfig.apiUrl+"/index.php");
    url.searchParams.set('action',action);
    Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
    try{const r=await fetch(url);return await r.json();}catch(e){return{error:'Connection failed'};}
}

// Theme
function initTheme(){const s=localStorage.getItem('pf-theme')||'dark';document.documentElement.setAttribute('data-theme',s);if($('#themeToggle'))$('#themeToggle').textContent=s==='dark'?'☀️':'🌙';}
function toggleTheme(){const c=document.documentElement.getAttribute('data-theme');const n=c==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);localStorage.setItem('pf-theme',n);if($('#themeToggle'))$('#themeToggle').textContent=n==='dark'?'☀️':'🌙';}

// Navigation
function initNavigation(){
    window.addEventListener('scroll',()=>{
        if($('#navbar'))$('#navbar').classList.toggle('scrolled',window.scrollY>50);
        const btt=$('#backToTop');if(btt)btt.classList.toggle('visible',window.scrollY>500);
        const pb=$('#progressBar');if(pb){const s=window.scrollY;const h=document.documentElement.scrollHeight-window.innerHeight;pb.style.width=h>0?(s/h*100)+'%':'0%';}
    });
    if($('#mobileToggle')){$('#mobileToggle').addEventListener('click',()=>{$('#mobileToggle').classList.toggle('active');$('#navLinks')?.classList.toggle('active');});}
}

// Search
function toggleSearch(){const o=$('#searchOverlay');if(!o)return;o.classList.toggle('active');if(o.classList.contains('active'))setTimeout(()=>$('#searchInput')?.focus(),300);}
async function handleSearch(q){const r=$('#searchResults');if(!r)return;if(!q.trim()){r.innerHTML='';return;}const d=await api('search',{q});r.innerHTML=d.posts&&d.posts.length?d.posts.map(p=>`<a href="/article/${p.slug}.html" class="search-result-item"><img src="${p.featured_image||'/assets/placeholder.jpg'}" alt="${p.title}" loading="lazy"><div class="search-result-info"><h4>${p.title}</h4><p>${p.category} • ${p.published_at?new Date(p.published_at).toLocaleDateString():'Draft'}</p></div></a>`).join(''):'<p style="color:var(--text-muted);text-align:center;padding:2rem">No results found.</p>';}
function setSearchQuery(q){const i=$('#searchInput');if(i){i.value=q;handleSearch(q);}}

// Bookmarks
function toggleBookmark(slug){const idx=state.bookmarks.indexOf(slug);if(idx>-1){state.bookmarks.splice(idx,1);showToast('Removed from bookmarks','info');}else{state.bookmarks.push(slug);showToast('Saved to bookmarks!','success');}localStorage.setItem('pf-bookmarks',JSON.stringify(state.bookmarks));updateBookmarksUI();}
function isBookmarked(slug){return state.bookmarks.includes(slug);}
function updateBookmarksUI(){const l=$('#bookmarksList');if(!l)return;l.innerHTML=state.bookmarks.length?'':'<div class="empty-bookmarks"><div class="icon">🔖</div><p>No saved articles yet.</p></div>';}
function toggleBookmarksModal(){$('#bookmarksModal')?.classList.toggle('active');}

// Render cards
function renderCards(posts){
    if(!posts||!posts.length)return '<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--text-muted)"><h3>No articles yet</h3><p>Check back soon!</p></div>';
    return posts.map(p=>`<article class="blog-card fade-in" itemscope itemtype="https://schema.org/BlogPosting">
    <div class="card-image"><a href="/article/${p.slug}.html"><img src="${p.featured_image||'/assets/placeholder.jpg'}" alt="${p.title}" loading="lazy" itemprop="image"></a><div class="card-actions"><button class="card-action-btn ${isBookmarked(p.slug)?'bookmarked':''}" onclick="event.preventDefault();event.stopPropagation();toggleBookmark('${p.slug}')" title="Bookmark">${isBookmarked(p.slug)?'★':'☆'}</button><button class="card-action-btn" onclick="event.preventDefault();event.stopPropagation();shareArticle('${p.title.replace(/'/g,"\\'")}')" title="Share">↗</button></div></div>
    <div class="card-body"><div class="card-tags"><span class="category-badge ${p.category}">${p.category.replace('-',' ').toUpperCase()}</span>${(p.tags||'').split(',').filter(t=>t.trim()).slice(0,2).map(t=>`<span class="card-tag">${t.trim()}</span>`).join('')}</div><h3 itemprop="headline"><a href="/article/${p.slug}.html">${p.title}</a></h3><p class="card-excerpt" itemprop="description">${p.excerpt||''}</p><div class="card-footer"><div class="card-author"><img src="${p.author_avatar||'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👤</text></svg>'}" alt="${p.author_name||'Author'}" loading="lazy"><div class="card-author-info"><div class="card-author-name" itemprop="author">${p.author_name||'Staff'}</div><div class="card-author-date"><time itemprop="datePublished">${p.published_at?new Date(p.published_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):''}</time></div></div></div><div class="card-stats"><span class="card-stat">👁️ ${p.views||0}</span><span class="card-stat">💬 ${p.comment_count||0}</span></div></div></div></article>`).join('');
}

// Featured post
function renderFeatured(posts,container){
    if(!posts.length)return;const f=posts[0];
    container.innerHTML=`<section class="featured-section" style="padding:0 0 4rem"><div class="section-header"><h2 class="section-title"><span class="dot"></span> Featured</h2><a href="/articles.html" class="view-all">View All →</a></div><a href="/article/${f.slug}.html" class="featured-post fade-in"><div class="featured-image"><img src="${f.featured_image||'/assets/placeholder.jpg'}" alt="${f.title}" loading="eager"><span class="featured-badge">Featured</span></div><div class="featured-content"><div class="post-meta"><span class="category-badge ${f.category}">${f.category.replace('-',' ').toUpperCase()}</span><span class="meta-item">${f.published_at?new Date(f.published_at).toLocaleDateString():''}</span></div><h2>${f.title}</h2><p>${f.excerpt||''}</p><div class="author-row"><img src="${f.author_avatar||''}" alt="${f.author_name}" class="author-avatar"><div class="author-info"><div class="author-name">${f.author_name||'Staff'}</div></div></div></div></a></section>`;
}

// Load posts
async function loadPosts(container,showFeatured=false){
    const d=await api('get_posts',{category:state.currentFilter==='all'?'':state.currentFilter,page:state.currentPage});
    if(!d.posts)return;
    state.cachedPosts=d.posts;
    if(showFeatured&&d.posts.length){renderFeatured([d.posts[0]],container);const rest=d.posts.slice(1);const g=document.createElement('div');g.id='blogGrid';g.className='blog-grid';g.innerHTML=renderCards(rest);container.appendChild(g);}
    else{container.innerHTML=renderCards(d.posts);}
    renderPagination(d.pages||1);
    setTimeout(()=>container.querySelectorAll('.fade-in').forEach(e=>e.classList.add('visible')),100);
}

// Pagination
function renderPagination(pages){const c=$('#pagination');if(!c||pages<=1){if(c)c.innerHTML='';return;}let h='';h+=`<button class="pagination-btn" onclick="goToPage(${state.currentPage-1})" ${state.currentPage===1?'disabled':''}>←</button>`;for(let i=1;i<=pages;i++)h+=`<button class="pagination-btn ${i===state.currentPage?'active':''}" onclick="goToPage(${i})">${i}</button>`;h+=`<button class="pagination-btn" onclick="goToPage(${state.currentPage+1})" ${state.currentPage===pages?'disabled':''}>→</button>`;c.innerHTML=h;}
function goToPage(p){const c=state.cachedPages||1;if(p<1||p>c)return;state.currentPage=p;const g=$('#blogGrid');if(g)loadPosts(g,false);window.scrollTo({top:$('#blogGrid')?.offsetTop-100||0,behavior:'smooth'});}

// Filters
function initFilters(){
    $$('.tab-btn').forEach(btn=>{btn.addEventListener('click',e=>{e.preventDefault();state.currentFilter=btn.dataset.category||'all';state.currentPage=1;$$('.tab-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const g=$('#blogGrid');if(g)loadPosts(g,false);});});
}

// Newsletter
function initNewsletter(){const f=$('#newsletterForm');if(!f)return;f.addEventListener('submit',async e=>{e.preventDefault();const em=f.querySelector('input[type="email"]')?.value;if(!em)return;const d=await api('subscribe',{email:em});f.style.display='none';if($('#newsletterSuccess'))$('#newsletterSuccess').classList.add('show');showToast(d.message||'Subscribed!','success');});}
function scrollToNewsletter(){$('#newsletter')?.scrollIntoView({behavior:'smooth'});}

// Share
function shareArticle(title){if(navigator.share){navigator.share({title,url:window.location.href}).catch(()=>{});}else{navigator.clipboard.writeText(window.location.href).then(()=>showToast('Link copied!','success'));}}
function shareToTwitter(title){window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(title)+'&url='+encodeURIComponent(window.location.href),'_blank');}
function shareToLinkedIn(){window.open('https://linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(window.location.href),'_blank');}

// Reactions
function initReactions(){$$('.reaction-btn').forEach(btn=>{btn.addEventListener('click',()=>{btn.classList.toggle('active');const s=btn.querySelector('span');if(s){let c=parseInt(s.textContent)||0;s.textContent=btn.classList.contains('active')?c+1:Math.max(0,c-1);}});});}

// Comments
function initComments(){const f=$('#commentForm');if(!f)return;f.addEventListener('submit',async e=>{e.preventDefault();const ta=f.querySelector('textarea');if(!ta?.value.trim()){showToast('Write a comment first!','warning');return;}await api('add_comment',{post_id:window.postId||0,content:ta.value});showToast('Comment submitted!','success');ta.value='';});}

// Toast
function showToast(msg,type='info'){const c=$('#toastContainer');if(!c)return;const t=document.createElement('div');t.className='toast '+type;t.innerHTML=`<span>${type==='success'?'✅':type==='warning'?'⚠️':'ℹ️'}</span><span>${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;c.appendChild(t);setTimeout(()=>t.remove(),4000);}

// Scroll
function scrollToTop(){window.scrollTo({top:0,behavior:'smooth'});}
function initScrollAnimations(){const o=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');o.unobserve(e.target);}});},{threshold:0.1});document.querySelectorAll('.fade-in').forEach(e=>o.observe(e));}

// Load settings
async function loadSettings(){const d=await api('get_settings');if(d.settings)state.cachedSettings=d.settings;return d.settings||{};}

// Inject AdSense
function injectAdsense(settings){
    if(!settings.adsense_client)return;
    const s=document.createElement('script');s.async=true;s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';s.crossorigin='anonymous';document.head.appendChild(s);
    if(settings.adsense_header)addAdSlot(settings.adsense_client,settings.adsense_header,'after','nav.navbar','display:block;width:100%;max-width:728px;margin:1rem auto;text-align:center;');
    if(settings.adsense_sidebar)addAdSlot(settings.adsense_client,settings.adsense_sidebar,'before','footer','.sidebar-ad{display:block;margin:1rem 0;}');
    if(settings.adsense_footer)addAdSlot(settings.adsense_client,settings.adsense_footer,'before','footer','.footer-ad{display:block;max-width:728px;margin:2rem auto;text-align:center;}');
}
function addAdSlot(client,slot,position,selector,style){
    const target=document.querySelector(selector);if(!target)return;
    const div=document.createElement('div');div.className='ad-slot';div.style=style||'text-align:center;margin:1rem 0;';
    div.innerHTML=`<ins class="adsbygoogle" style="display:block" data-ad-client="${client}" data-ad-slot="${slot}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
    position==='after'?target.after(div):target.before(div);
    try{(adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){}
}

// Init
document.addEventListener('DOMContentLoaded',()=>{
    initTheme();initNavigation();initNewsletter();initReactions();initComments();initFilters();initScrollAnimations();updateBookmarksUI();
    loadSettings().then(s=>injectAdsense(s));
    // Keyboard
    document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();toggleSearch();}if(e.key==='Escape'){const so=$('#searchOverlay');if(so)so.classList.remove('active');const bm=$('#bookmarksModal');if(bm)bm.classList.remove('active');}});
});
