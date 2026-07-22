/* ===== SCREEN 2 — Before You Continue ===== */
(function () {
  const root = document.getElementById('screen2');
  const bgLayer = root.querySelector('#s2-bg-layer');
  const glassCard = root.querySelector('#s2-glass-card');
  const cardAction = root.querySelector('#s2-card-action');
  const beginBtn = root.querySelector('#s2-begin-btn');
  const starsCanvas = root.querySelector('#s2-stars-canvas');
  const firefliesCanvas = root.querySelector('#s2-fireflies-canvas');
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
    const count = Math.floor((width * height) / 10000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width, y: Math.random() * height, r: Math.random() * 1.8 + 0.6,
      baseAlpha: Math.random() * 0.35 + 0.3, twinkleSpeed: Math.random() * 0.0003 + 0.00015,
      twinkleAmount: Math.random() * 0.06 + 0.05, phase: Math.random() * Math.PI * 2
    }));
  }

  function buildFireflies() {
    const count = Math.floor(Math.random() * 4) + 5;
    fireflies = Array.from({ length: count }, () => ({
      x: Math.random() * width, y: Math.random() * height, r: Math.random() * 2 + 1.8,
      baseAlpha: Math.random() * 0.4 + 0.4, angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.15 + 0.08, curveSpeed: (Math.random() - 0.5) * 0.008,
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
      f.y += Math.sin(f.angle) * f.speed - 0.03;
      if (f.x < -20) f.x = width + 20;
      if (f.x > width + 20) f.x = -20;
      if (f.y < -20) f.y = height + 20;
      if (f.y > height + 20) f.y = -20;
      const pulse = Math.sin(time * 0.0012 + f.pulsePhase) * 0.2;
      const alpha = Math.max(0.1, Math.min(0.8, f.baseAlpha + pulse));
      firefliesCtx.beginPath();
      firefliesCtx.arc(f.x + px, f.y + py, f.r, 0, Math.PI * 2);
      const glow = firefliesCtx.createRadialGradient(f.x + px, f.y + py, 0, f.x + px, f.y + py, f.r * 3.5);
      glow.addColorStop(0, `rgba(255, 208, 117, ${alpha})`);
      glow.addColorStop(0.4, `rgba(255, 190, 80, ${alpha * 0.4})`);
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

  function playGlassBell() {
    const ctx = window.getAudioCtx && window.getAudioCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1567.98, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.25);
    } catch (e) {}
  }

  function startTimeline() {
    const revealElements = root.querySelectorAll('.reveal-text');
    setTimer(() => glassCard.classList.add('emerge'), 800);
    setTimer(() => { if (revealElements[0]) revealElements[0].classList.add('show'); }, 1800);
    setTimer(() => { if (revealElements[1]) revealElements[1].classList.add('show'); }, 2800);
    setTimer(() => { if (revealElements[2]) revealElements[2].classList.add('show'); }, 4300);
    setTimer(() => { if (revealElements[3]) revealElements[3].classList.add('show'); }, 5800);
    setTimer(() => { if (revealElements[4]) revealElements[4].classList.add('show'); }, 7400);
    setTimer(() => cardAction.classList.add('show'), 9000);
  }

  let clicked = false;
  function handleBegin() {
    if (clicked) return;
    clicked = true;
    playGlassBell();
    glassCard.classList.add('dissolve');
    starsCanvas.classList.add('brighten');
    bgLayer.classList.add('zoom-exit');
    setTimer(() => {
      window.dispatchEvent(new CustomEvent('screen:next', { detail: { from: 'screen2', to: 'screen3' } }));
    }, 900);
  }

  function init() {
    clicked = false;
    glassCard.classList.remove('emerge', 'dissolve');
    starsCanvas.classList.remove('brighten');
    bgLayer.classList.remove('zoom-exit');
    cardAction.classList.remove('show');
    root.querySelectorAll('.reveal-text').forEach(el => el.classList.remove('show'));

    mouseHandler = e => { pointer.x = (e.clientX / width) * 2 - 1; pointer.y = (e.clientY / height) * 2 - 1; };
    resizeHandler = resize;
    clickHandler = handleBegin;

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
  window.Screens.screen2 = { init, destroy };
})();
