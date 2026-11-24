(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const touchPointer = window.matchMedia('(hover: none), (pointer: coarse)');

  if (reducedMotion.matches) {
    return;
  }

  const trailCount = 12;
  const dots = [];
  const positions = [];

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let animationFrame = 0;

  function isMobileExperience() {
    return window.innerWidth <= 760 || touchPointer.matches;
  }

  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }, { passive: true });

  function removeTrail() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    dots.splice(0).forEach((dot) => dot.remove());
    positions.splice(0);
  }

  function animate() {
    if (isMobileExperience() || dots.length === 0) {
      removeTrail();
      return;
    }

    let x = mouseX;
    let y = mouseY;

    for (let i = 0; i < dots.length; i += 1) {
      const pos = positions[i];
      pos.x += (x - pos.x) * 0.35;
      pos.y += (y - pos.y) * 0.35;

      dots[i].style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      dots[i].style.opacity = `${1 - i / dots.length}`;

      x = pos.x;
      y = pos.y;
    }

    animationFrame = requestAnimationFrame(animate);
  }

  function createTrail() {
    if (isMobileExperience() || dots.length > 0) return;

    for (let i = 0; i < trailCount; i += 1) {
      const dot = document.createElement('div');
      dot.className = 'cursor-trail-dot';
      document.body.appendChild(dot);
      dots.push(dot);
      positions.push({ x: mouseX, y: mouseY });
    }

    animate();
  }

  function syncTrailToDevice() {
    if (isMobileExperience()) removeTrail();
    else createTrail();
  }

  if (typeof touchPointer.addEventListener === 'function') {
    touchPointer.addEventListener('change', syncTrailToDevice);
  } else {
    touchPointer.addListener(syncTrailToDevice);
  }
  window.addEventListener('resize', () => {
    requestAnimationFrame(syncTrailToDevice);
  }, { passive: true });

  syncTrailToDevice();
})();

(() => {
  if (document.querySelector('script[data-forge-analytics]')) return;
  const loader = document.currentScript;
  if (!loader || !loader.src) return;
  const script = document.createElement('script');
  script.src = new URL('site-analytics.js?v=20261117-itchio', loader.src).href;
  script.defer = true;
  script.dataset.forgeAnalytics = 'anonymous';
  document.head.appendChild(script);
})();
