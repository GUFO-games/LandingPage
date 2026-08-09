/* Page-based carousels ported from the legacy main.js: team (N cards per page) + video (1 per page). */

/* ===== Team carousel: page-based (cards-per-view from CSS custom property) ===== */
(function teamCarousel() {
  const root = document.querySelector('.team-carousel');
  if (!root) return;

  const viewport = root.querySelector('.viewport');
  const track = root.querySelector('.track');
  const prev = root.querySelector('.carousel-arrow.prev');
  const next = root.querySelector('.carousel-arrow.next');
  const dotsWrap = root.querySelector('.carousel-dots');
  const dotLabel = dotsWrap?.dataset.label || 'Go to page';

  const originalItems = Array.from(track.querySelectorAll('.team-member'));
  let currentPerView = cardsPerView();
  let page = 0;

  function cardsPerView() {
    const cs = getComputedStyle(root);
    return parseInt(cs.getPropertyValue('--cards-per-view')) || 3;
  }
  function pageCount() {
    return Math.max(1, Math.ceil(originalItems.length / currentPerView));
  }
  function clampPage(p) {
    return Math.max(0, Math.min(pageCount() - 1, p));
  }

  function buildPages() {
    const pages = [];
    for (let i = 0; i < originalItems.length; i += currentPerView) {
      const pageEl = document.createElement('li');
      pageEl.className = 'page';
      const grid = document.createElement('div');
      grid.className = 'page-grid';
      for (let j = i; j < i + currentPerView && j < originalItems.length; j++) {
        grid.appendChild(originalItems[j]);
      }
      pageEl.appendChild(grid);
      pages.push(pageEl);
    }
    track.replaceChildren(...pages);
  }

  function buildDots() {
    if (!dotsWrap) return;
    const dots = [];
    for (let i = 0; i < pageCount(); i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dot';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `${dotLabel} ${i + 1}`);
      btn.addEventListener('click', () => goToPage(i));
      dots.push(btn);
    }
    dotsWrap.replaceChildren(...dots);
    updateDots();
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('.dot').forEach((b, i) => {
      const active = i === page;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', active ? 'true' : 'false');
      b.tabIndex = active ? 0 : -1;
    });
  }

  function updateButtons() {
    prev.disabled = page <= 0;
    next.disabled = page >= pageCount() - 1;
  }

  function goToPage(p) {
    page = clampPage(p);
    viewport.scrollTo({ left: page * viewport.clientWidth, behavior: 'smooth' });
    updateButtons();
    updateDots();
  }

  buildPages();
  buildDots();
  goToPage(0);

  prev.addEventListener('click', () => goToPage(page - 1));
  next.addEventListener('click', () => goToPage(page + 1));

  let t;
  viewport.addEventListener('scroll', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      page = clampPage(Math.round(viewport.scrollLeft / viewport.clientWidth));
      updateButtons();
      updateDots();
    }, 80);
  });

  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goToPage(page + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goToPage(page - 1); }
  });

  window.addEventListener('resize', () => {
    const pv = cardsPerView();
    if (pv !== currentPerView) {
      currentPerView = pv;
      originalItems.forEach((el) => el.remove());
      buildPages();
      buildDots();
      goToPage(0);
    } else {
      goToPage(page);
    }
  });
})();

/* ===== Video carousel (1 slide per page) ===== */
(function videoCarousel() {
  const root = document.querySelector('.vc');
  if (!root) return;

  const viewport = root.querySelector('.vc-viewport');
  const slides = Array.from(root.querySelectorAll('.vc-slide'));
  const prev = root.querySelector('.vc-arrow-prev');
  const next = root.querySelector('.vc-arrow-next');
  const dotsWrap = root.querySelector('.vc-dots');
  const dotLabel = dotsWrap?.dataset.label || 'Go to video';

  let page = 0;
  const pageCount = () => slides.length;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function buildDots() {
    const dots = [];
    for (let i = 0; i < pageCount(); i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'vc-dot';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `${dotLabel} ${i + 1}`);
      b.addEventListener('click', () => goToPage(i));
      dots.push(b);
    }
    dotsWrap.replaceChildren(...dots);
    updateDots();
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.vc-dot').forEach((btn, i) => {
      const active = i === page;
      btn.classList.toggle('vc-dot-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      btn.tabIndex = active ? 0 : -1;
    });
  }

  function updateButtons() {
    prev.disabled = page <= 0;
    next.disabled = page >= pageCount() - 1;
  }

  function goToPage(p) {
    page = clamp(p, 0, pageCount() - 1);
    viewport.scrollTo({ left: page * viewport.clientWidth, behavior: 'smooth' });
    updateButtons();
    updateDots();
  }

  prev.addEventListener('click', () => goToPage(page - 1));
  next.addEventListener('click', () => goToPage(page + 1));

  let t;
  viewport.addEventListener('scroll', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      page = clamp(Math.round(viewport.scrollLeft / viewport.clientWidth), 0, pageCount() - 1);
      updateButtons();
      updateDots();
    }, 80);
  });

  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goToPage(page + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goToPage(page - 1); }
  });

  buildDots();
  updateButtons();
  goToPage(0);

  window.addEventListener('resize', () => goToPage(page));
})();
