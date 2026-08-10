/**
 * Cosmic Descent — page behaviors. Vanilla, no framework.
 * Everything imperative: no re-render, no scroll-driven React state.
 */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   Scroll reveal
   Hiding is applied BY THIS SCRIPT, never from the stylesheet — if the script
   fails to run the page still renders fully visible. IntersectionObserver, not
   scroll events, so it works when the scrolling box is not the window.
   ============================================================ */
(function initReveal() {
  const targets = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!targets.length) return;

  if (reduceMotion || !('IntersectionObserver' in window)) return; // stays visible

  targets.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .65s cubic-bezier(.22,.61,.36,1), transform .65s cubic-bezier(.22,.61,.36,1)';
  });

  let fired = false;
  const show = (el, step = 0) => {
    el.style.transitionDelay = `${Math.min(step, 6) * 80}ms`;
    el.style.opacity = '1';
    el.style.transform = 'none';
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      visible.forEach((entry, i) => {
        fired = true;
        show(entry.target, i);
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
  );
  targets.forEach((el) => io.observe(el));

  // Safety flush: if the observer never fired, reveal everything; otherwise only
  // what is already on screen, so below-fold blocks keep their entrance.
  window.setTimeout(() => {
    targets.forEach((el) => {
      if (el.style.opacity === '1') return;
      const r = el.getBoundingClientRect();
      if (!fired || (r.top < window.innerHeight && r.bottom > 0)) {
        show(el);
        io.unobserve(el);
      }
    });
  }, 1500);
})();

/* ============================================================
   Header glass + scroll-to-top + starfield parallax
   One passive scroll listener, writes styles straight to the nodes.
   ============================================================ */
(function initScrollChrome() {
  const header = document.querySelector('.site-header');
  const topBtn = document.querySelector('[data-scroll-top]');
  const stars = reduceMotion ? [] : Array.from(document.querySelectorAll('[data-star]'));

  let ticking = false;
  const apply = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (topBtn) topBtn.classList.toggle('is-visible', y > 640);
    stars.forEach((layer) => {
      const rate = parseFloat(layer.dataset.star) || 0;
      layer.style.transform = `translate3d(0, ${(y * -rate).toFixed(1)}px, 0)`;
    });
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(apply);
      }
    },
    { passive: true }
  );
  apply();

  if (topBtn) {
    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }
})();

/* ============================================================
   Mobile nav
   ============================================================ */
(function initMobileNav() {
  const btn = document.querySelector('.hamburger');
  const panel = document.getElementById('mobile-nav');
  if (!btn || !panel) return;

  const setOpen = (open) => {
    panel.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? btn.dataset.labelClose : btn.dataset.labelOpen);
  };

  btn.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  window.addEventListener('resize', () => { if (window.innerWidth >= 1220) setOpen(false); });
})();

/* ============================================================
   Language switcher — hash-preserving, keyboard-operable
   ============================================================ */
(function initLangSwitcher() {
  const root = document.querySelector('[data-lang]');
  if (!root) return;
  const btn = root.querySelector('.lang-btn');
  const menu = root.querySelector('.lang-menu');
  const options = Array.from(root.querySelectorAll('.lang-option'));
  if (!btn || !menu) return;

  const close = () => {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    const active = options.find((o) => o.getAttribute('aria-selected') === 'true') || options[0];
    active?.focus();
  };

  const go = (option) => {
    const locale = option.dataset.locale;
    const href = option.dataset.href;
    if (!href) return;
    try { localStorage.setItem('gufo-lang', locale); } catch {}
    // Section hash survives the switch — the six anchor ids are a frozen contract.
    window.location.href = href + window.location.hash;
  };

  btn.addEventListener('click', () => (menu.hidden ? open() : close()));

  options.forEach((option, i) => {
    option.addEventListener('click', () => go(option));
    option.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(option); }
      if (e.key === 'ArrowDown') { e.preventDefault(); options[(i + 1) % options.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); options[(i - 1 + options.length) % options.length].focus(); }
      if (e.key === 'Home') { e.preventDefault(); options[0].focus(); }
      if (e.key === 'End') { e.preventDefault(); options[options.length - 1].focus(); }
    });
  });

  document.addEventListener('click', (e) => { if (!root.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { close(); btn.focus(); }
  });

  /* First-visit suggestion — proposes, never redirects. */
  const banner = document.querySelector('[data-lang-suggest]');
  if (!banner) return;
  let stored = null;
  try { stored = localStorage.getItem('gufo-lang'); } catch {}
  let dismissed = false;
  try { dismissed = sessionStorage.getItem('gufo-lang-dismissed') === '1'; } catch {}
  if (stored || dismissed) return;

  const current = banner.dataset.current;
  const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
  const match = options.find((o) => o.dataset.locale === browser);
  if (!match || browser === current) return;

  let strings = {};
  try { strings = JSON.parse(banner.dataset.strings || '{}'); } catch {}
  const copy = strings[browser];
  if (!copy) return;

  banner.querySelector('[data-suggest-text]').textContent = copy.text;
  const yes = banner.querySelector('[data-suggest-yes]');
  yes.textContent = copy.cta;
  yes.setAttribute('lang', browser);
  yes.addEventListener('click', () => go(match));
  banner.querySelector('[data-suggest-no]').addEventListener('click', () => {
    try {
      localStorage.setItem('gufo-lang', current);
      sessionStorage.setItem('gufo-lang-dismissed', '1');
    } catch {}
    banner.hidden = true;
  });
  banner.hidden = false;
})();
