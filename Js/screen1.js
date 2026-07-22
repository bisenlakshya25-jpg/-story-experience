/* ===== SCREEN 1 — Message ===== */
(function () {
  const root = document.getElementById('screen1');
  const linesConfig = [
    "This page wasn't made for everyone",
    "It was made for exactly one person ",
    "And if you're reading this…",
    "You're the reason it exists"
  ];

  const DISPLAY_TIME = 4200;
  const INITIAL_SILENCE = 1000;

  const textStage = root.querySelector('#s1-text-stage');
  const actionWrapper = root.querySelector('#s1-action-wrapper');
  const continueBtn = root.querySelector('#s1-continue-btn');
  const starsCanvas = root.querySelector('#s1-stars-canvas');
  const particlesCanvas = root.querySelector('#s1-particles-canvas');
  const starsCtx = starsCanvas.getContext('2d');
  const particlesCtx = particlesCanvas.getContext('2d');

  let width, height, stars = [], particles = [];
  let pointer = { x: 0, y: 0 }, smoothed = { x: 0, y: 0 };
  let rafId = null, timers = [], lineElements = [];
  let mouseHandler, resizeHandler, clickHandler;

  function setTimer(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }

  function initCanvas() {
    width = window.innerWidth; height = window.innerHeight;
    [starsCanvas, particlesCanvas].forEach(c => {
      c.width = width * devicePixelRatio; c.height = height * devicePixelRatio;
      c.style.width = width + 'px'; c.style.height = height + 'px';
      c.getContext('2d').setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    });
    stars = Array.from({ length: Math.floor((width * height) / 6000) }, () => ({
      x: Math.random() * width, y: Math.random() * height, r: Math.random() * 1.3 + 0.3,
      baseAlpha: Math.random() * 0.4 + 0.25, twinkleSpeed: Math.random() * 0.0005 + 0.0003,
      twinkleAmount: Math.random() * 0.08 + 0.08, phase: Math.random() * Math.PI * 2
    }));
    particles = Array.from({ length: Math.floor((width * height) / 30000) }, () => ({
      x: Math.random() * width, y: Math.random() * height, r: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 0.04, vy: -Math.random() * 0.06 - 0.02, alpha: Math.random() * 0.5 + 0.3
    }));
  }

  function loop(time) {
    smoothed.x += (pointer.x - smoothed.x) * 0.04;
    smoothed.y += (pointer.y - smoothed.y) * 0.04;

    starsCtx.clearRect(0, 0, width, height);
    stars.forEach(s => {
      const twinkle = Math.sin(time * s.twinkleSpeed + s.phase) * s.twinkleAmount;
      starsCtx.beginPath();
      starsCtx.arc(s.x + smoothed.x * 8, s.y + smoothed.y * 8, s.r, 0, Math.PI * 2);
      starsCtx.fillStyle = `rgba(255, 224, 176, ${Math.max(0, s.baseAlpha + twinkle)})`;
      starsCtx.fill();
    });

    particlesCtx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) p.y = height + 10;
      particlesCtx.beginPath();
      particlesCtx.arc(p.x + smoothed.x * 4, p.y + smoothed.y * 4, p.r, 0, Math.PI * 2);
      const g = particlesCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(110, 140, 255, ${p.alpha * 0.5})`);
      g.addColorStop(1, 'rgba(110, 140, 255, 0)');
      particlesCtx.fillStyle = g;
      particlesCtx.fill();
    });

    rafId = requestAnimationFrame(loop);
  }

  function renderLinesMarkup() {
    textStage.innerHTML = '';
    lineElements = linesConfig.map((text, index) => {
      const p = document.createElement('p');
      p.className = 'line';
      if (index === linesConfig.length - 1) p.classList.add('last-line');
      p.textContent = text;
      textStage.appendChild(p);
      return p;
    });
  }

  function startLineSequence() {
    let currentIndex = 0;
    function step() {
      if (currentIndex < lineElements.length) {
        const current = lineElements[currentIndex];
        const prev = lineElements[currentIndex - 1];
        if (prev) { prev.classList.remove('active'); prev.classList.add('out'); }
        current.classList.add('active');
        currentIndex++;
        if (currentIndex < lineElements.length) {
          setTimer(step, DISPLAY_TIME);
        } else {
          setTimer(() => actionWrapper.classList.add('show'), 1800);
        }
      }
    }
    setTimer(step, INITIAL_SILENCE);
  }

  function init() {
    actionWrapper.classList.remove('show');
    mouseHandler = e => { pointer.x = (e.clientX / width) * 2 - 1; pointer.y = (e.clientY / height) * 2 - 1; };
    resizeHandler = initCanvas;
    clickHandler = () => {
      window.dispatchEvent(new CustomEvent('screen:next', { detail: { from: 'screen1', to: 'screen2' } }));
    };

    window.addEventListener('mousemove', mouseHandler);
    window.addEventListener('resize', resizeHandler);
    continueBtn.addEventListener('click', clickHandler);

    initCanvas();
    renderLinesMarkup();
    rafId = requestAnimationFrame(loop);
    startLineSequence();
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    timers.forEach(clearTimeout); timers = [];
    window.removeEventListener('mousemove', mouseHandler);
    window.removeEventListener('resize', resizeHandler);
    continueBtn.removeEventListener('click', clickHandler);
  }

  window.Screens = window.Screens || {};
  window.Screens.screen1 = { init, destroy };
})();
