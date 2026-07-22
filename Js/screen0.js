/* ===== SCREEN 0 — Notification ===== */
(function () {
  const root = document.getElementById('screen0');
  const bgLayer = root.querySelector('#s0-bg-layer');
  const starsCanvas = root.querySelector('#s0-stars-canvas');
  const particlesCanvas = root.querySelector('#s0-particles-canvas');
  const notifCard = root.querySelector('#s0-notif-card');
  const openBtn = root.querySelector('#s0-open-btn');

  const starsCtx = starsCanvas.getContext('2d');
  const particlesCtx = particlesCanvas.getContext('2d');

  let width, height;
  let stars = [];
  let particles = [];
  let pointer = { x: 0, y: 0 };
  let smoothed = { x: 0, y: 0 };

  let rafId = null;
  let timers = [];
  let opened = false;
  let mouseHandler, touchHandler, resizeHandler;

  function setTimer(fn, ms) {
    const id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    [starsCanvas, particlesCanvas].forEach(c => {
      c.width = width * devicePixelRatio;
      c.height = height * devicePixelRatio;
      c.style.width = width + 'px';
      c.style.height = height + 'px';
      c.getContext('2d').setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    });
    buildStars();
    buildParticles();
  }

  function buildStars() {
    const count = Math.floor((width * height) / 6000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      r: Math.random() * 1.3 + 0.3,
      baseAlpha: Math.random() * 0.4 + 0.25,
      twinkleSpeed: Math.random() * 0.0005 + 0.0003,
      twinkleAmount: Math.random() * 0.08 + 0.08,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function buildParticles() {
    const count = Math.floor((width * height) / 30000);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      r: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 0.04,
      vy: -Math.random() * 0.06 - 0.02,
      alpha: Math.random() * 0.5 + 0.3
    }));
  }

  function drawStars(time) {
    starsCtx.clearRect(0, 0, width, height);
    const px = smoothed.x * 8, py = smoothed.y * 8;
    stars.forEach(s => {
      const twinkle = Math.sin(time * s.twinkleSpeed + s.phase) * s.twinkleAmount;
      const alpha = Math.max(0, Math.min(1, s.baseAlpha + twinkle));
      starsCtx.beginPath();
      starsCtx.arc(s.x + px, s.y + py, s.r, 0, Math.PI * 2);
      starsCtx.fillStyle = `rgba(255, 224, 176, ${alpha})`;
      starsCtx.fill();
    });
  }

  function drawParticles() {
    particlesCtx.clearRect(0, 0, width, height);
    const px = smoothed.x * 4, py = smoothed.y * 4;
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      particlesCtx.beginPath();
      particlesCtx.arc(p.x + px, p.y + py, p.r, 0, Math.PI * 2);
      const gradient = particlesCtx.createRadialGradient(p.x + px, p.y + py, 0, p.x + px, p.y + py, p.r);
      gradient.addColorStop(0, `rgba(110, 140, 255, ${p.alpha * 0.5})`);
      gradient.addColorStop(1, 'rgba(110, 140, 255, 0)');
      particlesCtx.fillStyle = gradient;
      particlesCtx.fill();
    });
  }

  function loop(time) {
    smoothed.x += (pointer.x - smoothed.x) * 0.04;
    smoothed.y += (pointer.y - smoothed.y) * 0.04;
    drawStars(time);
    drawParticles();
    bgLayer.style.transform = `translate(${smoothed.x * 10}px, ${smoothed.y * 10}px)`;
    rafId = requestAnimationFrame(loop);
  }

  function updatePointer(clientX, clientY) {
    pointer.x = (clientX / width) * 2 - 1;
    pointer.y = (clientY / height) * 2 - 1;
  }

  function playNotificationSound() {
    const ctx = window.getAudioCtx && window.getAudioCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      function tone(freq, start, duration, gainPeak) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(gainPeak, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + duration + 0.05);
      }
      tone(880, 0, 0.18, 0.18);
      tone(1318.5, 0.12, 0.3, 0.15);
    } catch (err) {}
  }

  function triggerVibration() {
    if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300, 100, 300]);
  }

  function startTimeline() {
    setTimer(() => {
      bgLayer.classList.add('show');
      starsCanvas.classList.add('show');
    }, 400);

    setTimer(() => {
      particlesCanvas.style.transition = 'opacity 4s ease-in';
      particlesCanvas.style.opacity = '0.6';
    }, 1000);

    setTimer(() => {
      playNotificationSound();
      triggerVibration();
    }, 1200);

    setTimer(() => {
      notifCard.classList.add('show');
    }, 1400);
  }

  function handleOpen() {
    if (opened) return;
    opened = true;
    notifCard.classList.add('hide');
    setTimer(() => {
      window.dispatchEvent(new CustomEvent('screen:next', { detail: { from: 'screen0', to: 'screen1' } }));
    }, 500);
  }

  function init() {
    // reset visual state in case of re-entry
    bgLayer.classList.remove('show');
    starsCanvas.classList.remove('show');
    notifCard.classList.remove('show', 'hide');
    particlesCanvas.style.opacity = '0';
    opened = false;

    mouseHandler = e => updatePointer(e.clientX, e.clientY);
    touchHandler = e => { if (e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY); };
    resizeHandler = resize;

    window.addEventListener('mousemove', mouseHandler);
    window.addEventListener('touchmove', touchHandler, { passive: true });
    window.addEventListener('resize', resizeHandler);
    openBtn.addEventListener('click', handleOpen);

    resize();
    rafId = requestAnimationFrame(loop);
    startTimeline();

    // Screen 0 plays on page load by design, but audio is already
    // unlocked by the "Let's Begin" gate click before this init() runs.
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    timers.forEach(clearTimeout);
    timers = [];
    window.removeEventListener('mousemove', mouseHandler);
    window.removeEventListener('touchmove', touchHandler);
    window.removeEventListener('resize', resizeHandler);
    openBtn.removeEventListener('click', handleOpen);
  }

  window.Screens = window.Screens || {};
  window.Screens.screen0 = { init, destroy };
})();
