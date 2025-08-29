// Scroll animations
function animateOnScroll() {
    const elements = document.querySelectorAll('.scroll-fade');

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementTop < windowHeight - 100) {
            element.classList.add('visible');
        }
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href*="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
        // Only handle same-page hashes
        const href = a.getAttribute('href') || "";
        if (!href.includes('#')) return;

        const url = new URL(href, window.location.href);
        const hash = url.hash.replace(/^#/, "");
        if (!hash) return;

        const target = document.getElementById(decodeURIComponent(hash));
        if (!(target instanceof Element)) return; // not found or not an Element

        e.preventDefault();

        // header height (use actual header if present, else fallback)
        const header = document.querySelector('.site-header');
        const headerOffset = header ? header.offsetHeight : 70;

        const y = target.getBoundingClientRect().top + window.scrollY - headerOffset;

        window.scrollTo({ top: y, behavior: 'smooth' });
        history.replaceState(null, '', `#${hash}`);
    });
});

// Dynamic background particles
function createParticles() {
    const particlesContainer = document.querySelector('.bg-animation');

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '2px';
        particle.style.height = '2px';
        particle.style.background = Math.random() > 0.5 ? '#663399' : '#00ffff';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.opacity = Math.random() * 0.5;
        particle.style.animation = `float ${Math.random() * 10 + 5}s linear infinite`;
        particlesContainer.appendChild(particle);
    }
}

// CSS animation for particles
const style = document.createElement('style');
style.textContent = `
            @keyframes float {
                0% {
                    transform: translateY(100vh) rotate(0deg);
                }
                100% {
                    transform: translateY(-100px) rotate(360deg);
                }
            }
        `;
document.head.appendChild(style);



/* ===== Team carousel: page-based (3 at a time on desktop) ===== */
(function teamCarousel(){
    const root = document.querySelector('.team-carousel');
    if(!root) return;

    const viewport = root.querySelector('.viewport');
    const track = root.querySelector('.track');
    const prev = root.querySelector('.carousel-arrow.prev');
    const next = root.querySelector('.carousel-arrow.next');
    const dotsWrap = root.querySelector('.carousel-dots');

    function buildDots(){
        if(!dotsWrap) return;
        dotsWrap.innerHTML = '';
        for(let i = 0; i < pageCount(); i++){
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'dot';
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-label', `Go to page ${i+1}`);
            btn.addEventListener('click', () => goToPage(i));
            dotsWrap.appendChild(btn);
        }
        updateDots();
    }

    function updateDots(){
        if(!dotsWrap) return;
        const buttons = dotsWrap.querySelectorAll('.dot');
        buttons.forEach((b, i) => {
            const active = (i === page);
            b.classList.toggle('active', active);
            b.setAttribute('aria-selected', active ? 'true' : 'false');
            b.tabIndex = active ? 0 : -1;
        });
    }

    function cardsPerView(){
        const cs = getComputedStyle(root);
        return parseInt(cs.getPropertyValue('--cards-per-view')) || 3;
    }

    // Extract original member items once
    const originalItems = Array.from(track.querySelectorAll('.team-member'));

    let currentPerView = cardsPerView();
    let page = 0;

    function buildPages(){
        // Clear track and rebuild pages based on currentPerView
        track.innerHTML = '';
        for(let i = 0; i < originalItems.length; i += currentPerView){
            const pageEl = document.createElement('li');
            pageEl.className = 'page';

            const grid = document.createElement('div');
            grid.className = 'page-grid';

            for(let j = i; j < i + currentPerView && j < originalItems.length; j++){
                grid.appendChild(originalItems[j]);
            }
            pageEl.appendChild(grid);
            track.appendChild(pageEl);
        }
    }

    function pageCount(){
        return Math.max(1, Math.ceil(originalItems.length / currentPerView));
    }

    function clampPage(p){
        return Math.max(0, Math.min(pageCount() - 1, p));
    }

    function updateButtons(){
        prev.disabled = (page <= 0);
        next.disabled = (page >= pageCount() - 1);
    }

    function goToPage(p){
        page = clampPage(p);
        const x = page * viewport.clientWidth;
        viewport.scrollTo({ left: x, behavior: 'smooth' });
        updateButtons();
        updateDots();
    }

    // Initial build
    buildPages();
    buildDots();
     goToPage(0);

    // Click handlers
    prev.addEventListener('click', () => goToPage(page - 1));
    next.addEventListener('click', () => goToPage(page + 1));

    // Sync page when user scrolls via touch/trackpad
    let t;
    viewport.addEventListener('scroll', () => {
        clearTimeout(t);
        t = setTimeout(() => {
            page = clampPage(Math.round(viewport.scrollLeft / viewport.clientWidth));
            updateButtons();
            updateDots();
        }, 80);
    });

    // Keyboard arrows when viewport is focused
    viewport.addEventListener('keydown', (e)=>{
        if(e.key === 'ArrowRight'){ e.preventDefault(); goToPage(page + 1); }
        if(e.key === 'ArrowLeft') { e.preventDefault(); goToPage(page - 1); }
    });

    function isFreeScroll(){
        return window.matchMedia('(max-width: 640px)').matches;
    }

    // Rebuild pages on responsive change (when --cards-per-view changes)
    window.addEventListener('resize', () => {
        const pv = cardsPerView();
        if(pv !== currentPerView){
            currentPerView = pv;
            // Put members back into a flat list first
            const items = Array.from(track.querySelectorAll('.team-member'));
            items.forEach(el => el.remove());
            originalItems.forEach(el => el.remove()); // detach from DOM
            originalItems.forEach(el => el.style.removeProperty('width')); // ensure no leftover widths

            // Re-append to track in original order via buildPages
            buildPages();
            buildDots();
            if(!isFreeScroll()){ goToPage(0); }
        }else{
            // Keep current page aligned after minor resizes
            goToPage(page);
            updateDots();
        }
    });
})();


/* ===== YouTube click-to-load embed ===== */
(function initYouTubeCards(){
    const cards = document.querySelectorAll('.yt-card');
    cards.forEach(card => {
        const id = card.dataset.videoId;
        if(!id) return;
        const img = card.querySelector('.yt-thumb');
        // HQ thumbnail; fallback to maxres if you prefer: `maxresdefault.jpg`
        img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

        function loadIframe(){
            if (card.dataset.loaded) return;
            card.dataset.loaded = "1";
            const src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
            const iframe = document.createElement('iframe');
            iframe.src = src;
            iframe.title = 'LABYRAINTH — Video';
            iframe.loading = 'eager';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.allowFullscreen = true;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = '0';
            card.replaceChildren(iframe);
            card.setAttribute('role', 'group');
            card.removeAttribute('tabindex');
            card.style.cursor = 'auto';
        }

        card.addEventListener('click', loadIframe);
        card.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadIframe(); } });
    });
})();

/* ===== Video Carousel (namespaced, 1 slide per page) ===== */
(function initVideoCarousel(){
    const root = document.querySelector('.vc');
    if(!root) return;

    const viewport = root.querySelector('.vc__viewport');
    const track = root.querySelector('.vc__track');
    const slides = Array.from(track.querySelectorAll('.vc__slide'));
    const prev = root.querySelector('.vc__arrow--prev');
    const next = root.querySelector('.vc__arrow--next');
    const dotsWrap = root.querySelector('.vc__dots');

    let page = 0;

    function pageCount(){ return slides.length; } // 1 slide == 1 page

    function vcIsFree(){ return window.matchMedia('(max-width: 640px)').matches; }

    function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

    function buildDots(){
        dotsWrap.innerHTML = '';
        for(let i=0;i<pageCount();i++){
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'vc__dot';
            b.setAttribute('role', 'tab');
            b.setAttribute('aria-label', `Go to video ${i+1}`);
            b.addEventListener('click', ()=> goToPage(i));
            dotsWrap.appendChild(b);
        }
        updateDots();
    }

    function updateDots(){
        const bs = dotsWrap.querySelectorAll('.vc__dot');
        bs.forEach((btn, i)=>{
            const active = (i === page);
            btn.classList.toggle('vc__dot--active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
            btn.tabIndex = active ? 0 : -1;
        });
    }

    function updateButtons(){
        prev.disabled = (page <= 0);
        next.disabled = (page >= pageCount() - 1);
    }

    function goToPage(p){
        page = clamp(p, 0, pageCount() - 1);
        const x = page * viewport.clientWidth;     // 1 page = 100% viewport width
        viewport.scrollTo({ left: x, behavior: 'smooth' });
        updateButtons();
        updateDots();
    }

    // Controls
    prev.addEventListener('click', ()=> goToPage(page - 1));
    next.addEventListener('click', ()=> goToPage(page + 1));

    // Sync if user swipes/drags
    let t;
    viewport.addEventListener('scroll', ()=>{
        clearTimeout(t);
        t = setTimeout(()=>{
            page = clamp(Math.round(viewport.scrollLeft / viewport.clientWidth), 0, pageCount()-1);
            updateButtons();
            updateDots();
        }, 80);
    });

    // Keyboard arrows on focus
    viewport.addEventListener('keydown', (e)=>{
        if(e.key === 'ArrowRight'){ e.preventDefault(); goToPage(page + 1); }
        if(e.key === 'ArrowLeft'){  e.preventDefault(); goToPage(page - 1); }
    });

    // Init
    buildDots();
    updateButtons();
    goToPage(0);

    // Keep alignment on resize
    + window.addEventListener('resize', ()=> { if(!vcIsFree()){ goToPage(page); } });
})();



// Initialize
window.addEventListener('load', () => {
    createParticles();
    animateOnScroll();
});

window.addEventListener('scroll', animateOnScroll);


/* ===== Mobile menu toggle ===== */
(function initMobileMenu(){
  const btn = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  if(!btn || !nav) return;
  function toggle(){
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.classList.toggle('nav-open', open);
  }
  btn.addEventListener('click', toggle);
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if(nav.classList.contains('open')) toggle();
  }));
  window.addEventListener('resize', () => {
    if(window.innerWidth >= 900){
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('nav-open');
    }
  });
})();
