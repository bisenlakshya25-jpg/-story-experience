/* ===== SCREEN 7 — The Proposal ===== */
(function () {
  const root = document.getElementById('screen7');
  const evolvingBg = root.querySelector('#s7-evolving-bg');
  const morningLayer = root.querySelector('#s7-morning-layer');
  const goldenBeam = root.querySelector('#s7-golden-beam');
  const starsCanvas = root.querySelector('#s7-stars-canvas');
  const stage = root.querySelector('#s7-stage');
  const poemContainer = root.querySelector('#s7-poem-container');
  const climaxContainer = root.querySelector('#s7-climax-container');
  const decisionBox = root.querySelector('#s7-decision-box');
  const btnYes = root.querySelector('#s7-btn-yes');
  const btnTime = root.querySelector('#s7-btn-time');
  const ctx = starsCanvas.getContext('2d');

  let width, height;
  let timers = [];
  let cancelled = false;
  let resizeHandler, yesHandler, timeHandler;
  let currentZoom = 1.10, evolutionProgress = 0;

  function setTimer(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
  function sleep(ms) {
    return new Promise((resolve, reject) => {
      setTimer(() => { cancelled ? reject(new Error('cancelled')) : resolve(); }, ms);
    });
  }

  function initStars() {
    width = window.innerWidth; height = window.innerHeight;
    starsCanvas.width = width; starsCanvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#EAF0FF";
    for (let i = 0; i < 35; i++) {
      const x = Math.random() * width, y = Math.random() * height, radius = Math.random() * 1.1;
      ctx.globalAlpha = Math.random() * 0.4 + 0.1;
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    }
  }

  function bumpEvolution(totalSteps) {
    currentZoom += 0.002;
    evolutionProgress += (1 / totalSteps);
    if (evolutionProgress > 1) evolutionProgress = 1;
    evolvingBg.style.transform = `scale(${currentZoom.toFixed(4)})`;
    morningLayer.style.opacity = evolutionProgress.toFixed(2);
    goldenBeam.style.opacity = (0.2 + (evolutionProgress * 0.8)).toFixed(2);
    starsCanvas.style.opacity = (0.3 * (1 - evolutionProgress)).toFixed(2);
  }

  const paragraphSections = [
    { lines: [
      { text: "So…..", linePause: 2000 }, { text: "Here I am.", linePause: 2000 },
      { text: "After all these words...", linePause: 1800 }, { text: "There's only one thing left to say.", linePause: 2200 }
    ], holdTimeAfterGroup: 2200 },
    { lines: [
      { text: "If you'll let me...", linePause: 1800 }, { text: "I'd love", linePause: 1200 },
      { text: "To turn", linePause: 1200 }, { text: "Our conversations...", linePause: 1500 },
      { text: "Into memories.", highlight: true, linePause: 2200 }
    ], holdTimeAfterGroup: 2200 },
    { lines: [
      { text: "Those memories...", linePause: 1800 }, { text: "Into adventures.", highlight: true, linePause: 2200 }
    ], holdTimeAfterGroup: 2000 },
    { lines: [
      { text: "And those adventures...", linePause: 1800 }, { text: "Into a story", linePause: 1400 },
      { text: "Worth telling.", highlight: true, linePause: 2200 }
    ], holdTimeAfterGroup: 2200 },
    { lines: [
      { text: "Not because", linePause: 1600 }, { text: "I want to become", linePause: 1400 },
      { text: "A chapter in your life.", linePause: 2200 }
    ], holdTimeAfterGroup: 2000 },
    { lines: [
      { text: "But because...", linePause: 1800 }, { text: "I'd love", linePause: 1200 },
      { text: "To spend my life", linePause: 1400 }, { text: "Being there", linePause: 1200 },
      { text: "For yours.", highlight: true, linePause: 2200 }
    ], holdTimeAfterGroup: 2200 },
    { lines: [
      { text: "To spend my days", linePause: 1500 }, { text: "Making yours", linePause: 1400 },
      { text: "A little brighter.", highlight: true, linePause: 2200 }
    ], holdTimeAfterGroup: 2000 },
    { lines: [
      { text: "To be there", linePause: 1500 }, { text: "On ordinary days.", linePause: 1800 },
      { text: "And the unforgettable ones.", highlight: true, linePause: 2500 }
    ], holdTimeAfterGroup: 2500 }
  ];

  const climaxLines = ["If you're willing...", "I'd love", "To call this", "The beginning", "Of us."];

  async function startScreen7Timeline() {
    await sleep(2000);

    const totalLinesCount = paragraphSections.reduce((acc, sec) => acc + sec.lines.length, 0) + climaxLines.length;

    for (let s = 0; s < paragraphSections.length; s++) {
      const group = paragraphSections[s];
      const blockEl = document.createElement('div');
      blockEl.className = 'poem-block';
      stage.insertBefore(blockEl, poemContainer.nextSibling);

      await sleep(100);
      blockEl.classList.add('show');

      for (let l = 0; l < group.lines.length; l++) {
        const item = group.lines[l];
        const lineEl = document.createElement('div');
        lineEl.className = 'poem-line';
        if (item.highlight) lineEl.classList.add('highlight-text');
        lineEl.textContent = item.text;
        blockEl.appendChild(lineEl);

        await sleep(80);
        lineEl.classList.add('reveal');
        bumpEvolution(totalLinesCount);
        await sleep(item.linePause || 1800);
      }

      await sleep(group.holdTimeAfterGroup || 2000);
      blockEl.classList.remove('show');
      blockEl.classList.add('fade-out');
      await sleep(1200);
      blockEl.remove();
      await sleep(600);
    }

    climaxLines.forEach(text => {
      const p = document.createElement('p');
      p.className = 'climax-line';
      p.textContent = text;
      climaxContainer.appendChild(p);
    });

    await sleep(1000);
    climaxContainer.classList.add('show');
    bumpEvolution(totalLinesCount);

    await sleep(3000);
    climaxContainer.classList.remove('show');
    climaxContainer.classList.add('fade-out');
    await sleep(3000);

    morningLayer.style.opacity = '1';
    starsCanvas.style.opacity = '0';

    await sleep(3000);
    decisionBox.classList.add('show');
  }

  function init() {
    cancelled = false;
    currentZoom = 1.10; evolutionProgress = 0;
    evolvingBg.style.transform = 'scale(1.10)';
    morningLayer.style.opacity = '0';
    goldenBeam.style.opacity = '0.2';
    starsCanvas.style.opacity = '0.3';
    poemContainer.innerHTML = '';
    climaxContainer.innerHTML = '';
    climaxContainer.classList.remove('show', 'fade-out');
    decisionBox.classList.remove('show');
    // remove any leftover poem-blocks from a previous run
    stage.querySelectorAll('.poem-block').forEach(el => el.remove());

    resizeHandler = initStars;
    yesHandler = () => {
      window.dispatchEvent(new CustomEvent('screen:navigate', { detail: { targetScreen: 'screen8a', choice: 'YES' } }));
    };
    timeHandler = () => {
      window.dispatchEvent(new CustomEvent('screen:navigate', { detail: { targetScreen: 'screen8b', choice: 'NEED_TIME' } }));
    };

    window.addEventListener('resize', resizeHandler);
    btnYes.addEventListener('click', yesHandler);
    btnTime.addEventListener('click', timeHandler);

    initStars();
    startScreen7Timeline().catch(e => { if (e.message !== 'cancelled') console.error(e); });
  }

  function destroy() {
    cancelled = true;
    timers.forEach(clearTimeout); timers = [];
    window.removeEventListener('resize', resizeHandler);
    btnYes.removeEventListener('click', yesHandler);
    btnTime.removeEventListener('click', timeHandler);
  }

  window.Screens = window.Screens || {};
  window.Screens.screen7 = { init, destroy };
})();
