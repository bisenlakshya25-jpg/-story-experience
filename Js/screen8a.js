/* ===== SCREEN 8A — Yes ===== */
(function () {
  const root = document.getElementById('screen8a');
  const sunGlow = root.querySelector('#s8a-sun-glow');
  const particlesCanvas = root.querySelector('#s8a-particles-canvas');
  const narrativeStage = root.querySelector('#s8a-narrative-stage');
  const page1 = root.querySelector('#s8a-page1');
  const page2 = root.querySelector('#s8a-page2');
  const ctx = particlesCanvas.getContext('2d');

  let width, height, particles = [];
  let rafId = null, timers = [];
  let cancelled = false;
  let resizeHandler;

  function setTimer(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
  function sleep(ms) {
    return new Promise((resolve, reject) => {
      setTimer(() => { cancelled ? reject(new Error('cancelled')) : resolve(); }, ms);
    });
  }

  // ---------- Backend: Google Apps Script Web App URL ----------
  const BACKEND_API_URL = "https://script.google.com/macros/s/AKfycbykFnEhcWVscjkam0LKPj9LvG9LWsi8N7Ad1JaYDBc6PlhG4yIhuQSym4ehks1I_giZ/exec";

  async function sendResponseToBackend() {
    const payload = {
      status: "ACCEPTED",
      choice: "YES",
      deviceDate: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    try {
      await fetch(BACKEND_API_URL, {
        method: "POST",
        
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('[screen8a] backend dispatch failed:', err);
      try { localStorage.setItem('user_response', JSON.stringify(payload)); } catch (e) {}
    }
  }

  function initParticles() {
    width = window.innerWidth; height = window.innerHeight;
    particlesCanvas.width = width; particlesCanvas.height = height;
    particles = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width, y: Math.random() * height, radius: Math.random() * 2.5 + 0.8,
        alpha: Math.random() * 0.5 + 0.2, speedY: Math.random() * -0.4 - 0.1, speedX: Math.random() * 0.3 - 0.15
      });
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.y += p.speedY; p.x += p.speedX;
      if (p.y < -10) p.y = height + 10;
      if (p.x < -10 || p.x > width + 10) p.x = Math.random() * width;
      ctx.fillStyle = `rgba(255, 240, 210, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    rafId = requestAnimationFrame(animateParticles);
  }

  function createBlock() {
    const div = document.createElement('div');
    div.className = 'text-block show';
    narrativeStage.appendChild(div);
    return div;
  }

  function appendLine(container, text, customClass = '') {
    const p = document.createElement('p');
    p.className = `line ${customClass}`;
    p.textContent = text;
    container.appendChild(p);
    setTimer(() => p.classList.add('reveal'), 50);
    return p;
  }

  function clearBlock(block) {
    block.classList.remove('show');
    block.classList.add('fade-out');
    setTimer(() => block.remove(), 1600);
  }

  async function startScreen8ATimeline() {
    sendResponseToBackend();

    await sleep(2000);
    sunGlow.classList.add('brighten');
    await sleep(1000);

    const block1 = createBlock();
    appendLine(block1, "Thank you.");
    await sleep(1500);
    appendLine(block1, "For saying yes.");
    await sleep(2000);
    appendLine(block1, "I promise...");
    await sleep(1600);
    appendLine(block1, "I'll never let this moment");
    await sleep(1400);
    appendLine(block1, "be the best part");
    await sleep(1400);
    appendLine(block1, "of our story.");

    await sleep(5000);
    clearBlock(block1);
    await sleep(1800);

    const block2 = createBlock();
    appendLine(block2, "I hope...");
    await sleep(1800);
    appendLine(block2, "Years from now...");
    await sleep(1800);
    appendLine(block2, "We'll look back");
    await sleep(1400);
    appendLine(block2, "at this page...");
    await sleep(1400);
    appendLine(block2, "And smile.");
    await sleep(2200);

    appendLine(block2, "Because...");
    await sleep(1800);
    appendLine(block2, "This wasn't meant");
    await sleep(1400);
    appendLine(block2, "To be");
    await sleep(1200);
    appendLine(block2, "The end.");
    await sleep(2000);

    appendLine(block2, "It was only...");
    await sleep(1000);

    const goldenLine = appendLine(block2, "The beginning.", "golden-climax");
    await sleep(600);
    goldenLine.classList.add('glow');

    await sleep(3000);
    clearBlock(block2);
    await sleep(1800);

    const block3 = createBlock();
    appendLine(block3, "The best part of this story was never this website… it was always the life waiting after it.", "subtle-line");

    await sleep(4000);

    const badge = document.createElement('div');
    badge.className = 'completed-badge';
    badge.innerHTML = 'Chapter One<br>✓ Completed';
    block3.appendChild(badge);

    await sleep(3500);

    page1.classList.add('turn-page');
    await sleep(600);
    page2.classList.add('show-page');
    // Website holds here permanently on Chapter Two.
  }

  function init() {
    cancelled = false;
    narrativeStage.innerHTML = '';
    page1.classList.remove('turn-page');
    page2.classList.remove('show-page');
    sunGlow.classList.remove('brighten');

    resizeHandler = initParticles;
    window.addEventListener('resize', resizeHandler);

    initParticles();
    rafId = requestAnimationFrame(animateParticles);
    startScreen8ATimeline().catch(e => { if (e.message !== 'cancelled') console.error(e); });
  }

  function destroy() {
    cancelled = true;
    if (rafId) cancelAnimationFrame(rafId);
    timers.forEach(clearTimeout); timers = [];
    window.removeEventListener('resize', resizeHandler);
  }

  window.Screens = window.Screens || {};
  window.Screens.screen8a = { init, destroy };
})();
