/* Shared page behaviors: scroll-fade reveal (IntersectionObserver), mobile menu, language switcher. */

/* ===== Scroll-fade via IntersectionObserver (no scroll listeners) ===== */
(function initScrollFade() {
  const els = document.querySelectorAll('.scroll-fade');
  if (!els.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -80px 0px', threshold: 0.05 }
  );
  els.forEach((el) => io.observe(el));
})();

/* ===== Mobile menu toggle ===== */
(function initMobileMenu() {
  const btn = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  if (!btn || !nav) return;
  function toggle() {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.classList.toggle('nav-open', open);
  }
  btn.addEventListener('click', toggle);
  nav.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      if (nav.classList.contains('open')) toggle();
    })
  );
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 900) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('nav-open');
    }
  });
})();

/* ===== Language switcher (dropdown; locale routing lands with the winner phase) ===== */
(function initLangSwitcher() {
  const root = document.querySelector('[data-lang-switcher]');
  if (!root) return;
  const btn = root.querySelector('.lang-btn');
  const menu = root.querySelector('.lang-menu');
  if (!btn || !menu) return;

  function close() {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }
  btn.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Winner phase: items get real per-locale URLs. For now the active item just closes the menu,
  // preserving the current section hash, and stores the preference.
  menu.querySelectorAll('a.lang-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const locale = item.dataset.locale;
      try {
        localStorage.setItem('gufo-lang', locale);
      } catch {}
      close();
    });
  });
})();
