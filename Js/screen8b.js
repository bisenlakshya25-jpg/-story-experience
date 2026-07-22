/* ===== SCREEN 8B — Need More Time ===== */
(function () {
  const root = document.getElementById('screen8b');
  const warmTint = root.querySelector('#s8b-warm-tint');
  const narrativeBox = root.querySelector('#s8b-narrative-box');

  let timers = [];
  let cancelled = false;

  function setTimer(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
  function sleep(ms) {
    return new Promise((resolve, reject) => {
      setTimer(() => { cancelled ? reject(new Error('cancelled')) : resolve(); }, ms);
    });
  }

  // ---------- Backend hook (not wired up yet — plug in later) ----------
  async function sendResponseToBackend() {
    const payload = {
      status: "REJECTED",
      choice: "NO",
      deviceDate: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    console.log('[screen8b] response ready to send once backend is configured:', https://script.google.com/macros/s/AKfycbykFnEhcWVscjkam0LKPj9LvG9LWsi8N7Ad1JaYDBc6PlhG4ylhuQSym4ehks1);
    // When ready: POST `payload` to your backend URL here.
  }

  function createBlock() {
    const div = document.createElement('div');
    div.className = 'text-block show';
    narrativeBox.appendChild(div);
    return div;
  }

  function appendLine(container, text, customClass = '') {
    const p = document.createElement('p');
    p.className = `line ${customClass}`;
    p.textContent = text;
    container.appendChild(p);
    setTimer(() => p.classList.add('reveal'), 60);
    return p;
  }

  function clearBlock(block) {
    block.classList.remove('show');
    block.classList.add('fade-out');
    setTimer(() => block.remove(), 1600);
  }

  async function startScreen8BTimeline() {
    sendResponseToBackend();

    await sleep(200);
    warmTint.classList.add('cool-down');
    await sleep(3500);

    const block1 = createBlock();
    appendLine(block1, "I won't pretend...");
    await sleep(1800);
    appendLine(block1, "This isn't");
    await sleep(1200);
    appendLine(block1, "the answer");
    await sleep(1400);
    appendLine(block1, "I was hoping for.");
    await sleep(2200);

    appendLine(block1, "But...");
    await sleep(1500);
    appendLine(block1, "I'm grateful");
    await sleep(1500);
    appendLine(block1, "You answered honestly.", "emphasis");

    await sleep(3000);
    clearBlock(block1);
    await sleep(1600);

    const block2 = createBlock();
    appendLine(block2, "Nothing about today");
    await sleep(1800);
    appendLine(block2, "Will make me");
    await sleep(1500);
    appendLine(block2, "Think any less of you.", "emphasis");

    await sleep(3000);
    clearBlock(block2);
    await sleep(1600);

    const block3 = createBlock();
    appendLine(block3, "Thank you...");
    await sleep(1800);
    appendLine(block3, "For giving these words");
    await sleep(1600);
    appendLine(block3, "A place");
    await sleep(1200);
    appendLine(block3, "In your time.");

    await sleep(4000);
    clearBlock(block3);
    await sleep(1600);

    const block4 = createBlock();
    appendLine(block4, "I genuinely hope...");
    await sleep(1800);
    appendLine(block4, "Life gives you");
    await sleep(1500);
    appendLine(block4, "Everything");
    await sleep(1400);
    appendLine(block4, "You're looking for.");

    await sleep(3000);
    clearBlock(block4);
    await sleep(1600);

    const block5 = createBlock();
    appendLine(block5, "Wishing you");
    await sleep(1400);
    appendLine(block5, "Nothing but happiness.", "emphasis");

    await sleep(3500);
    clearBlock(block5);
    await sleep(1600);

    const block6 = createBlock();
    appendLine(block6, "Take care.");
    await sleep(1500);
    appendLine(block6, "Always.", "final-always");
    // Website holds here permanently.
  }

  function init() {
    cancelled = false;
    narrativeBox.innerHTML = '';
    warmTint.classList.remove('cool-down');
    startScreen8BTimeline().catch(e => { if (e.message !== 'cancelled') console.error(e); });
  }

  function destroy() {
    cancelled = true;
    timers.forEach(clearTimeout); timers = [];
  }

  window.Screens = window.Screens || {};
  window.Screens.screen8b = { init, destroy };
})();
