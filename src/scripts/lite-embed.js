/* YouTube click-to-load lite embed (youtube-nocookie), ported verbatim in behavior from legacy main.js. */
(function initYouTubeCards() {
  const cards = document.querySelectorAll('.yt-card');
  cards.forEach((card) => {
    const id = card.dataset.videoId;
    if (!id) return;
    const img = card.querySelector('.yt-thumb');
    if (img) img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

    function loadIframe() {
      if (card.dataset.loaded) return;
      card.dataset.loaded = '1';
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
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
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadIframe(); }
    });
  });
})();
