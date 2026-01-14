// Mouse Trail Effects for Different Pages
// Marion running after cursor on PC Purifier
// Shark chasing cursor on Ship Studio  
// Fading footprints on Homepage
// Surprise effect on other pages

(function() {
  const trailType = document.body.dataset.trail || 'default';
  let trails = [];
  const maxTrails = 20;

  // Little T-Rex dino for PC Purifier
  function createDino(x, y) {
    const dino = document.createElement('div');
    dino.style.position = 'fixed';
    dino.style.left = x + 'px';
    dino.style.top = y + 'px';
    dino.style.width = '24px';
    dino.style.height = '24px';
    dino.style.pointerEvents = 'none';
    dino.style.zIndex = '9999';
    dino.style.transition = 'all 0.15s ease-out';
    
    // T-Rex body and head
    dino.innerHTML = `
      <div style="position:absolute;width:12px;height:14px;
        background:#ff6b35;border-radius:30% 30% 40% 40%;
        left:6px;top:8px;"></div>
      <div style="position:absolute;width:10px;height:10px;
        background:#ff6b35;border-radius:50%;
        left:2px;top:2px;"></div>
      <div style="position:absolute;width:2px;height:2px;
        background:#000;border-radius:50%;
        left:4px;top:5px;"></div>
      <div style="position:absolute;width:0;height:0;
        border-left:4px solid #ff6b35;
        border-top:2px solid transparent;
        border-bottom:2px solid transparent;
        left:0px;top:6px;"></div>
      <div style="position:absolute;width:3px;height:6px;
        background:#ff6b35;left:15px;top:16px;"></div>
      <div style="position:absolute;width:3px;height:6px;
        background:#ff6b35;left:10px;top:16px;"></div>
      <div style="position:absolute;width:4px;height:2px;
        background:#d4491a;left:16px;top:10px;border-radius:2px;"></div>
    `;
    
    document.body.appendChild(dino);
    
    setTimeout(() => {
      dino.style.opacity = '0';
      dino.style.transform = 'scale(0.5)';
    }, 100);
    
    setTimeout(() => dino.remove(), 400);
  }

  // Shark chasing cursor for Ship Studio
  function createShark(x, y) {
    const shark = document.createElement('div');
    shark.style.position = 'fixed';
    shark.style.left = x + 'px';
    shark.style.top = y + 'px';
    shark.style.width = '40px';
    shark.style.height = '20px';
    shark.style.pointerEvents = 'none';
    shark.style.zIndex = '9999';
    shark.style.transition = 'all 0.2s ease-out';
    
    // More realistic shark shape
    shark.innerHTML = `
      <div style="position:absolute;width:25px;height:14px;
        background:linear-gradient(to bottom, #5a6c7d 0%, #3d4f5e 50%, #5a6c7d 100%);
        border-radius:50% 0 0 50%;left:0;top:3px;"></div>
      <div style="position:absolute;width:0;height:0;
        border-left:12px solid #3d4f5e;
        border-top:7px solid transparent;
        border-bottom:7px solid transparent;
        right:0;top:3px;"></div>
      <div style="position:absolute;width:0;height:0;
        border-left:8px solid #3d4f5e;
        border-top:10px solid transparent;
        border-bottom:2px solid transparent;
        top:-5px;left:8px;"></div>
      <div style="position:absolute;width:3px;height:3px;
        background:#000;border-radius:50%;top:7px;left:6px;opacity:0.8;"></div>
    `;
    
    document.body.appendChild(shark);
    
    setTimeout(() => {
      shark.style.opacity = '0';
      shark.style.transform = 'translateX(-20px) scale(0.8)';
    }, 150);
  function createFootprint(x, y) {
    const isLeft = Math.random() > 0.5;
    const footprint = document.createElement('div');
    footprint.style.position = 'fixed';
    footprint.style.left = (x + (isLeft ? -8 : 8)) + 'px';
    footprint.style.top = y + 'px';
    footprint.style.width = '14px';
    footprint.style.height = '18px';
    footprint.style.pointerEvents = 'none';
    footprint.style.zIndex = '9999';
    footprint.style.opacity = '0.6';
    
    // Actual footprint shape (heel + toes)
    footprint.innerHTML = `
      <div style="position:absolute;width:10px;height:6px;
        background:#ff6b35;border-radius:40% 40% 50% 50%;bottom:0;left:2px;"></div>
      <div style="position:absolute;width:2px;height:2px;
        background:#ff6b35;border-radius:50%;top:1px;left:${isLeft ? '2px' : '10px'};"></div>
      <div style="position:absolute;width:2.5px;height:2.5px;
        background:#ff6b35;border-radius:50%;top:0px;left:${isLeft ? '5px' : '7px'};"></div>
      <div style="position:absolute;width:2px;height:2px;
        background:#ff6b35;border-radius:50%;top:1px;left:${isLeft ? '8px' : '4px'};"></div>
      <div style="position:absolute;width:1.5px;height:1.5px;
        background:#ff6b35;border-radius:50%;top:2px;left:${isLeft ? '10
        background:#ff6b35;border-radius:50%;top:0;left:${isLeft ? '1px' : '8px'};"></div>
      <div style="position:absolute;width:3px;height:3px;
        background:#ff6b35;border-radius:50%;top:2px;left:${isLeft ? '4px' : '5px'};"></div>
      <div style="position:absolute;width:3px;height:3px;
        background:#ff6b35;border-radius:50%;top:3px;left:${isLeft ? '7px' : '2px'};"></div>
    `;
    
    document.body.appendChild(footprint);
    
    setTimeout(() => {
      footprint.style.transition = 'opacity 1.5s ease-out';
      footprint.style.opacity = '0';
    }, 100);
    
    setTimeout(() => footprint.remove(), 1600);
  }

  // Sparkle trail (surprise for other pages)
  function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.style.position = 'fixed';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    sparkle.style.width = '8px';
    sparkle.style.height = '8px';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '9999';
    
    const colors = ['#ff6b35', '#ffd700', '#00ffff', '#ff1493'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    sparkle.innerHTML = `
      <div style="position:absolute;width:8px;height:2px;background:${color};
        top:3px;box-shadow:0 0 4px ${color};"></div>
      <div style="position:absolute;width:2px;height:8px;background:${color};
        left:3px;box-shadow:0 0 4px ${color};"></div>
      <div style="position:absolute;width:6px;height:1px;background:${color};
        transform:rotate(45deg);top:3px;left:1px;box-shadow:0 0 3px ${color};"></div>
      <div style="position:absolute;width:6px;height:1px;background:${color};
        transform:rotate(-45deg);top:3px;left:1px;box-shadow:0 0 3px ${color};"></div>
    `;
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
      sparkle.style.transition = 'all 0.6s ease-out';
      sparkle.style.opacity = '0';
      sparkle.style.transform = 'scale(2) rotate(180deg)';
    }, 50);
    
    setTimeout(() => sparkle.remove(), 650);
  }

  // Fire trail (for games page - surprise #2)
  function createFire(x, y) {
    const fire = document.createElement('div');
    fire.style.position = 'fixed';
    fire.style.left = x + 'px';
    fire.style.top = y + 'px';
    fire.style.width = '15px';
    fire.style.height = '20px';
    fire.style.pointerEvents = 'none';
    fire.style.zIndex = '9999';
    fire.style.background = 'linear-gradient(to top, #ff6b35 0%, #ffa500 50%, #ffff00 100%)';
    fire.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%';
    fire.style.boxShadow = '0 0 10px #ff6b35, 0 0 20px #ffa500';
    fire.style.animation = 'flicker 0.2s infinite';
    
    document.body.appendChild(fire);
    
    setTimeout(() => {
      fire.style.transition = 'all 0.4s ease-out';
      fire.style.opacity = '0';
      fire.style.transform = 'translateY(-30px) scale(0.5)';
    }, 100);
    
    setTimeout(() => fire.remove(), 500);
  }

  // Idle alien Easter egg
  let idleTimeout;
  let alienElement = null;
  
  function showAlien(x, y) {
    if (alienElement) return;
    
    alienElement = document.createElement('div');
    alienElement.style.position = 'fixed';
    alienElement.style.left = (x - 30) + 'px';
    alienElement.style.top = (y - 40) + 'px';
    alienElement.style.width = '60px';
    alienElement.style.height = '80px';
    alienElement.style.pointerEvents = 'none';
    alienElement.style.zIndex = '10000';
    alienElement.style.animation = 'alienBounce 1s ease-in-out infinite';
    
    // Xenomorph-style alien (simple silhouette)
    alienElement.innerHTML = `
      <div style="position:absolute;width:20px;height:30px;
        background:#1a1a1a;border-radius:50% 50% 0 0;
        left:20px;top:0;transform:skewX(-10deg);"></div>
      <div style="position:absolute;width:0;height:0;
        border-left:15px solid transparent;
        border-right:15px solid transparent;
        border-bottom:25px solid #1a1a1a;
        left:15px;top:-5px;transform:rotate(-20deg);"></div>
      <div style="position:absolute;width:18px;height:25px;
        background:#2a2a2a;border-radius:50%;
        left:21px;top:28px;"></div>
      <div style="position:absolute;width:22px;height:35px;
        background:#1a1a1a;border-radius:40% 40% 50% 50%;
        left:19px;top:50px;"></div>
      <div style="position:absolute;width:6px;height:20px;
        background:#1a1a1a;left:12px;top:60px;border-radius:3px;"></div>
      <div style="position:absolute;width:6px;height:20px;
        banimations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes flicker {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
    @keyframes alienBounce {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes alienFadeOut {
      0% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(0.5)on:absolute;width:20px;height:8px;
        background:#1a1a1a;border-radius:50%;
        left:8px;top:55px;transform:rotate(-30deg);"></div>
      <div style="position:absolute;width:20px;height:8px;
        background:#1a1a1a;border-radius:50%;
        right:8px;top:55px;transform:rotate(30deg);"></div>
    `;
    
    document.body.appendChild(alienElement);
  }
  
  function hideAlien() {
    if (alienElement) {
      alienElement.style.animation = 'alienFadeOut 0.3s ease-out';
      setTimeout(() => {
        if (alienElement) {
          alienElement.remove();
          alienElement = null;
        }
      }, 300);
    }
  }

  // Mouse move handler
  let lastX = 0, lastY = 0;
  let throttle = 0;
  
  document.addEventListener('mousemove', (e) => {
    // Hide alien when mouse moves
    clearTimeout(idleTimeout);
    hideAlien();
    
    // Show alien after 3 seconds of no movement
    idleTimeout = setTimeout(() => {
      showAlien(e.clientX, e.clientY);
    }, 3000);
    const distance = Math.sqrt(Math.pow(e.clientX - lastX, 2) + Math.pow(e.clientY - lastY, 2));
    
    // Only dino':
        createDino(e.clientX - 12, e.clientY - 12
    
    lastX = e.clientX;
    lastY = e.clientY;
    
    // Throttle trail creation
    if (throttle++ % 2 !== 0) return;
    
    switch(trailType) {
      case 'marion':
        createMarion(e.clientX - 10, e.clientY - 10);
        break;
      case 'shark':
        createShark(e.clientX - 15, e.clientY - 7);
        break;
      case 'footprints':
        createFootprint(e.clientX, e.clientY);
        break;
      case 'fire':
        createFire(e.clientX - 7, e.clientY - 10);
        break;
      case 'sparkle':
      default:
        createSparkle(e.clientX - 4, e.clientY - 4);
        break;
    }
  });

  // Add flicker animation for fire
  const style = document.createElement('style');
  style.textContent = `
    @keyframes flicker {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
  `;
  document.head.appendChild(style);
})();
