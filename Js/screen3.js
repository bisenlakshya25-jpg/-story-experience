/* ===== SCREEN 3 — Chapter One ===== */
(function () {
  const root = document.getElementById('screen3');
  const bgLayer = root.querySelector('#s3-bg-layer');
  const chapterHeader = root.querySelector('#s3-chapter-header');
  const readyText = root.querySelector('#s3-ready-text');
  const actionWrapper = root.querySelector('#s3-action-wrapper');
  const beginBtn = root.querySelector('#s3-begin-btn');
  const starsCanvas = root.querySelector('#s3-stars-canvas');
  const firefliesCanvas = root.querySelector('#s3-fireflies-canvas');
  const starsCtx = starsCanvas.getContext('2d');
  const firefliesCtx = firefliesCanvas.getContext('2d');

  let width, height, stars = [], fireflies = [];
  let pointer = { x: 0, y: 0 }, smoothed = { x: 0, y: 0 };
  let rafId = null, timers = [];
  let mouseHandler, resizeHandler, clickHandler;

  function setTimer(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }

  function resize() {
    width = window.innerWidth; height = window.innerHeight;
    [starsCanvas, firefliesCanvas].forEach(c => {
      c.width = width * devicePixelRatio; c.height = height * devicePixelRatio;
      c.style.width = width + 'px'; c.style.height = height + 'px';
      c.getContext('2d').setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    });
    buildStars(); buildFireflies();
  }

  function buildStars() {
    const count = Math.floor((width * height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width, y: Math.random() * height, r: Math.random() * 1.5 + 0.4,
      baseAlpha: Math.random() * 0.35 + 0.25, twinkleSpeed: Math.random() * 0.0004 + 0.0002,
      twinkleAmount: Math.random() * 0.06 + 0.05, phase: Math.random() * Math.PI * 2
    }));
  }

  function buildFireflies() {
    fireflies = Array.from({ length: 7 }, () => ({
      x: Math.random() * width, y: Math.random() * height, r: Math.random() * 2 + 1.5,
      baseAlpha: Math.random() * 0.4 + 0.3, angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.12 + 0.06, curveSpeed: (Math.random() - 0.5) * 0.006,
      pulsePhase: Math.random() * Math.PI * 2
    }));
  }

  function drawStars(time) {
    starsCtx.clearRect(0, 0, width, height);
    const px = smoothed.x * 6, py = smoothed.y * 6;
    stars.forEach(s => {
      const twinkle = Math.sin(time * s.twinkleSpeed + s.phase) * s.twinkleAmount;
      const alpha = Math.max(0, Math.min(1, s.baseAlpha + twinkle));
      starsCtx.beginPath();
      starsCtx.arc(s.x + px, s.y + py, s.r, 0, Math.PI * 2);
      starsCtx.fillStyle = `rgba(234, 240, 255, ${alpha})`;
      starsCtx.fill();
    });
  }

  function drawFireflies(time) {
    firefliesCtx.clearRect(0, 0, width, height);
    const px = smoothed.x * 4, py = smoothed.y * 4;
    fireflies.forEach(f => {
      f.angle += f.curveSpeed;
      f.x += Math.cos(f.angle) * f.speed;
      f.y += Math.sin(f.angle) * f.speed - 0.02;
      if (f.x < -20) f.x = width + 20;
      if (f.x > width + 20) f.x = -20;
      if (f.y < -20) f.y = height + 20;
      if (f.y > height + 20) f.y = -20;
      const pulse = Math.sin(time * 0.001 + f.pulsePhase) * 0.2;
      const alpha = Math.max(0.1, Math.min(0.8, f.baseAlpha + pulse));
      firefliesCtx.beginPath();
      firefliesCtx.arc(f.x + px, f.y + py, f.r, 0, Math.PI * 2);
      const glow = firefliesCtx.createRadialGradient(f.x + px, f.y + py, 0, f.x + px, f.y + py, f.r * 3);
      glow.addColorStop(0, `rgba(255, 208, 117, ${alpha})`);
      glow.addColorStop(1, 'rgba(255, 208, 117, 0)');
      firefliesCtx.fillStyle = glow;
      firefliesCtx.fill();
    });
  }

  function loop(time) {
    smoothed.x += (pointer.x - smoothed.x) * 0.03;
    smoothed.y += (pointer.y - smoothed.y) * 0.03;
    drawStars(time);
    drawFireflies(time);
    rafId = requestAnimationFrame(loop);
  }

  function startTimeline() {
    setTimer(() => bgLayer.classList.add('scaled'), 50);
    setTimer(() => chapterHeader.classList.add('show'), 800);
    setTimer(() => readyText.classList.add('show'), 4500);
    setTimer(() => actionWrapper.classList.add('show'), 6000);
  }

  function init() {
    bgLayer.classList.remove('scaled');
    chapterHeader.classList.remove('show');
    readyText.classList.remove('show');
    actionWrapper.classList.remove('show');

    mouseHandler = e => { pointer.x = (e.clientX / width) * 2 - 1; pointer.y = (e.clientY / height) * 2 - 1; };
    resizeHandler = resize;
    clickHandler = () => {
      window.dispatchEvent(new CustomEvent('screen:next', { detail: { from: 'screen3', to: 'screen4' } }));
    };

    window.addEventListener('mousemove', mouseHandler);
    window.addEventListener('resize', resizeHandler);
    beginBtn.addEventListener('click', clickHandler);

    resize();
    rafId = requestAnimationFrame(loop);
    startTimeline();
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    timers.forEach(clearTimeout); timers = [];
    window.removeEventListener('mousemove', mouseHandler);
    window.removeEventListener('resize', resizeHandler);
    beginBtn.removeEventListener('click', clickHandler);
  }

  window.Screens = window.Screens || {};
  window.Screens.screen3 = { init, destroy };
})();
