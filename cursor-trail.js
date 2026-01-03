(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const trailCount = 12;
  const dots = [];
  const positions = Array.from({ length: trailCount }, () => ({ x: 0, y: 0 }));

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  for (let i = 0; i < trailCount; i += 1) {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail-dot';
    document.body.appendChild(dot);
    dots.push(dot);
  }

  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }, { passive: true });

  function animate() {
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

    requestAnimationFrame(animate);
  }

  animate();
})();
