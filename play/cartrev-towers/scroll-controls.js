const root = document.querySelector('#root');

function enhanceBattlefield() {
  if (!root || window.Capacitor?.isNativePlatform?.()) return true;

  const area = root.querySelector('.battle-area');
  const canvas = area?.querySelector(':scope > .battlefield');
  if (!area || !canvas) return false;

  area.classList.add('browser-battle-area');

  const scroller = document.createElement('div');
  scroller.id = 'battlefield-scroll';
  scroller.className = 'battlefield-scroll';
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', 'Scrollable battlefield. Use the left and right buttons.');
  area.insertBefore(scroller, canvas);
  scroller.append(canvas);

  const makeButton = (direction) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `battlefield-pan battlefield-pan-${direction}`;
    button.setAttribute('aria-label', `Scroll battlefield ${direction}`);
    button.setAttribute('aria-controls', scroller.id);
    button.textContent = direction === 'left' ? '‹' : '›';
    area.insertBefore(button, scroller.nextSibling);
    return button;
  };

  const left = makeButton('left');
  const right = makeButton('right');
  const refreshEdges = () => {
    const maximum = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    left.disabled = scroller.scrollLeft <= 2;
    right.disabled = scroller.scrollLeft >= maximum - 2;
  };
  const move = (direction) => {
    scroller.scrollBy({
      left: direction * Math.max(120, scroller.clientWidth * 0.72),
      behavior: 'smooth',
    });
  };

  left.addEventListener('click', () => move(-1));
  right.addEventListener('click', () => move(1));
  scroller.addEventListener('scroll', refreshEdges, {passive: true});
  scroller.addEventListener('wheel', (event) => {
    if (scroller.scrollWidth <= scroller.clientWidth) return;
    event.preventDefault();
    scroller.scrollLeft += Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;
  }, {passive: false});
  scroller.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  });

  new ResizeObserver(refreshEdges).observe(scroller);
  requestAnimationFrame(refreshEdges);
  return true;
}

if (!enhanceBattlefield() && root) {
  const observer = new MutationObserver(() => {
    if (!enhanceBattlefield()) return;
    observer.disconnect();
  });
  observer.observe(root, {childList: true, subtree: true});
}
