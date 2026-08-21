/**
 * Trailer theater: 3 videos, center stage + flanking thumbs, lite-embed.
 * Thumbnails are background-image on a div, never <img src>, so a swap never
 * requests an unresolved value. Playing resets whenever the active video changes.
 */
(function initTheater() {
  const root = document.querySelector('[data-theater]');
  if (!root) return;

  const ids = (root.dataset.ids || '').split(',').filter(Boolean);
  if (!ids.length) return;
  const total = ids.length;
  // Self-hosted poster frames, emitted by the build alongside the video ids.
  const posters = (root.dataset.posters || '').split(',').filter(Boolean);

  const stage = root.querySelector('[data-stage]');
  const prevBtn = root.querySelector('[data-prev]');
  const nextBtn = root.querySelector('[data-next]');
  const counter = root.querySelector('[data-counter]');
  const prevThumb = prevBtn.querySelector('.thumb-img');
  const nextThumb = nextBtn.querySelector('.thumb-img');

  const L = {
    prev: root.dataset.prevLabel || 'Previous trailer',
    next: root.dataset.nextLabel || 'Next trailer',
    play: root.dataset.playLabel || 'Play trailer',
    title: root.dataset.iframeTitle || 'Trailer',
  };

  const pad = (n) => String(n).padStart(2, '0');
  const at = (i) => (i + total) % total;
  const thumbUrl = (i) => posters[i] || `https://i.ytimg.com/vi/${ids[i]}/hqdefault.jpg`;

  let index = 0;
  let playing = false;

  function renderStage() {
    if (playing) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${ids[index]}?autoplay=1&rel=0`;
      iframe.title = L.title;
      iframe.allow = 'accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture';
      iframe.allowFullscreen = true;
      stage.replaceChildren(iframe);
      return;
    }

    const poster = document.createElement('button');
    poster.type = 'button';
    poster.className = 'stage-poster';
    poster.setAttribute('data-play', '');
    poster.setAttribute('aria-label', `${L.play} ${index + 1} / ${total}`);

    const img = document.createElement('span');
    img.className = 'thumb-img';
    img.setAttribute('aria-hidden', 'true');
    img.style.backgroundImage = `url('${thumbUrl(index)}')`;

    const vignette = document.createElement('span');
    vignette.className = 'stage-vignette';
    vignette.setAttribute('aria-hidden', 'true');

    const ring = document.createElement('span');
    ring.className = 'play-ring';
    ring.setAttribute('aria-hidden', 'true');
    const tri = document.createElement('span');
    tri.className = 'play-tri';
    ring.appendChild(tri);

    poster.append(img, vignette, ring);
    poster.addEventListener('click', () => { playing = true; renderStage(); });
    stage.replaceChildren(poster);
  }

  function render() {
    renderStage();
    prevThumb.style.backgroundImage = `url('${thumbUrl(at(index - 1))}')`;
    nextThumb.style.backgroundImage = `url('${thumbUrl(at(index + 1))}')`;
    prevBtn.setAttribute('aria-label', `${L.prev}, ${at(index - 1) + 1} / ${total}`);
    nextBtn.setAttribute('aria-label', `${L.next}, ${at(index + 1) + 1} / ${total}`);
    counter.textContent = `${pad(index + 1)} / ${pad(total)}`;
  }

  function step(delta) {
    index = at(index + delta);
    playing = false; // a new video always starts from its poster
    render();
  }

  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'Home') { e.preventDefault(); index = 0; playing = false; render(); }
    if (e.key === 'End') { e.preventDefault(); index = total - 1; playing = false; render(); }
  });

  // Touch swipe
  let x0 = null;
  root.addEventListener('touchstart', (e) => { x0 = e.changedTouches[0].clientX; }, { passive: true });
  root.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
    x0 = null;
  }, { passive: true });

  render();
})();
