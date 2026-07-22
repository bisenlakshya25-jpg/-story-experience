/* ===== SCREEN 4 — First Memory ===== */
(function () {
  const root = document.getElementById('screen4');

  // Modular date config
  const MEMORY_DATE = { day: "10", month: "July", year: "2026" };

  const centerGlow = root.querySelector('#s4-center-glow');
  const penLine = root.querySelector('#s4-pen-line');
  const memoryTitle = root.querySelector('#s4-memory-title');
  const inkText = root.querySelector('#s4-ink-text');
  const calendarWrapper = root.querySelector('#s4-calendar-wrapper');
  const slotDay = root.querySelector('#s4-slot-day');
  const slotMonth = root.querySelector('#s4-slot-month');
  const slotYear = root.querySelector('#s4-slot-year');
  const actionWrapper = root.querySelector('#s4-action-wrapper');
  const nextBtn = root.querySelector('#s4-next-btn');
  const starsCanvas = root.querySelector('#s4-stars-canvas');
  const shootingCanvas = root.querySelector('#s4-shooting-star-canvas');
  const starsCtx = starsCanvas.getContext('2d');
  const shootingCtx = shootingCanvas.getContext('2d');

  let width, height, isStill = true, shootingStar = null;
  let rafId = null, timers = [];
  let resizeHandler, clickHandler;

  function setTimer(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }

  function resize() {
    width = window.innerWidth; height = window.innerHeight;
    [starsCanvas, shootingCanvas].forEach(c => {
      c.width = width * devicePixelRatio; c.height = height * devicePixelRatio;
      c.style.width = width + 'px'; c.style.height = height + 'px';
      c.getContext('2d').setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    });
  }

  function triggerShootingStar() {
    shootingStar = { x: width * 0.75, y: height * 0.15, length: 120, speedX: -3.5, speedY: 2.2, opacity: 1, life: 0 };
  }

  function drawShootingStar() {
    shootingCtx.clearRect(0, 0, width, height);
    if (!shootingStar) return;
    shootingStar.x += shootingStar.speedX;
    shootingStar.y += shootingStar.speedY;
    shootingStar.life++;
    shootingStar.opacity -= 0.012;
    if (shootingStar.opacity > 0) {
      shootingCtx.beginPath();
      const grad = shootingCtx.createLinearGradient(shootingStar.x, shootingStar.y, shootingStar.x - shootingStar.speedX * 15, shootingStar.y - shootingStar.speedY * 15);
      grad.addColorStop(0, `rgba(255, 208, 117, ${shootingStar.opacity})`);
      grad.addColorStop(1, 'rgba(255, 208, 117, 0)');
      shootingCtx.strokeStyle = grad;
      shootingCtx.lineWidth = 2;
      shootingCtx.moveTo(shootingStar.x, shootingStar.y);
      shootingCtx.lineTo(shootingStar.x - shootingStar.speedX * 12, shootingStar.y - shootingStar.speedY * 12);
      shootingCtx.stroke();
    } else {
      shootingStar = null;
    }
  }

  function loop() {
    if (!isStill) {
      starsCtx.clearRect(0, 0, width, height);
      starsCtx.fillStyle = "rgba(234, 240, 255, 0.4)";
      starsCtx.fillRect(width * 0.2, height * 0.2, 1.5, 1.5);
      starsCtx.fillRect(width * 0.8, height * 0.3, 2, 2);
    }
    drawShootingStar();
    rafId = requestAnimationFrame(loop);
  }

  function playPageTurnSound() {
    const ctx = window.getAudioCtx && window.getAudioCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      noise.connect(filter).connect(gain).connect(ctx.destination);
      noise.start(now);
    } catch (e) {}
  }

  function startTimeline() {
    setTimer(() => { isStill = false; playPageTurnSound(); }, 1000);
    setTimer(() => penLine.classList.add('draw'), 1200);
    setTimer(() => { memoryTitle.classList.add('show'); triggerShootingStar(); }, 2200);
    setTimer(() => {
      memoryTitle.classList.add('slide-up');
      centerGlow.classList.add('active');
      inkText.classList.add('show');
    }, 5000);
    setTimer(() => {
      calendarWrapper.classList.add('show');
      setTimer(() => slotMonth.classList.add('flip-anim'), 100);
      setTimer(() => slotDay.classList.add('flip-anim'), 400);
      setTimer(() => slotYear.classList.add('flip-anim'), 700);
    }, 6200);
    setTimer(() => actionWrapper.classList.add('show'), 8500);
  }

  function init() {
    isStill = true; shootingStar = null;
    [penLine, memoryTitle, calendarWrapper, actionWrapper, inkText, centerGlow].forEach(el => {
      el.classList.remove('show', 'draw', 'active', 'slide-up');
    });
    [slotMonth, slotDay, slotYear].forEach(el => el.classList.remove('flip-anim'));

    slotDay.querySelector('.flip-card').textContent = MEMORY_DATE.day;
    slotMonth.querySelector('.flip-card').textContent = MEMORY_DATE.month;
    slotYear.querySelector('.flip-card').textContent = MEMORY_DATE.year;

    resizeHandler = resize;
    clickHandler = () => {
      window.dispatchEvent(new CustomEvent('screen:next', { detail: { from: 'screen4', to: 'screen5' } }));
    };

    window.addEventListener('resize', resizeHandler);
    nextBtn.addEventListener('click', clickHandler);

    resize();
    rafId = requestAnimationFrame(loop);
    startTimeline();
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    timers.forEach(clearTimeout); timers = [];
    window.removeEventListener('resize', resizeHandler);
    nextBtn.removeEventListener('click', clickHandler);
  }

  window.Screens = window.Screens || {};
  window.Screens.screen4 = { init, destroy };
})();
