const overlayId = 'img-lightbox-overlay';

function ensureOverlay() {
  let overlay = document.getElementById(overlayId);
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = overlayId;
  overlay.innerHTML = '<div class="lightbox-backdrop"></div><img class="lightbox-image" alt="" />';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', () => overlay.classList.remove('open'));
  return overlay;
}

function openLightbox(src, alt) {
  const overlay = ensureOverlay();
  const img = overlay.querySelector('.lightbox-image');
  img.src = src;
  img.alt = alt || '';
  overlay.classList.add('open');
}

function bindLightbox() {
  const images = document.querySelectorAll('.shot img, .project-shot img');
  images.forEach((img) => {
    if (img.dataset.lightboxBound === '1') return;
    img.dataset.lightboxBound = '1';
    img.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLightbox(img.src, img.alt);
    });
  });
}

document.addEventListener('DOMContentLoaded', bindLightbox);
