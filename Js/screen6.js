/* ===== SCREEN 6 — Things I Never Found The Right Words For ===== */
(function () {
  const root = document.getElementById('screen6');
  const bgLayer = root.querySelector('#s6-bg-layer');
  const auroraWarm = root.querySelector('#s6-aurora-warm');
  const chapterHeader = root.querySelector('#s6-chapter-header');
  const subtitleLine = root.querySelector('#s6-subtitle-line');
  const thinkingDots = root.querySelector('#s6-thinking-dots');
  const footerAction = root.querySelector('#s6-footer-action');
  const nextChapterBtn = root.querySelector('#s6-next-chapter-btn');
  const starsCanvas = root.querySelector('#s6-stars-canvas');
  const ctx = starsCanvas.getContext('2d');

  let width, height;
  let timers = [];
  let cancelled = false;
  let resizeHandler, clickHandler;

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
    for (let i = 0; i < 45; i++) {
      const x = Math.random() * width, y = Math.random() * height, radius = Math.random() * 1.2;
      ctx.globalAlpha = Math.random() * 0.5 + 0.1;
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    }
  }

  const dialogueSequence = [
    { text: "There were things…", showDots: true, thinkTime: 1800, displayTime: 3200 },
    { text: "I wanted to tell you.", showDots: false, displayTime: 3200 },
    { text: "But I wasn't sure…", showDots: false, displayTime: 3200 },
    { text: "If it was the right time.", showDots: false, displayTime: 3400 },
    { text: "Every conversation with you…", showDots: true, thinkTime: 2000, displayTime: 3500 },
    { text: "Somehow stayed in my mind\nlonger than I expected.", showDots: false, displayTime: 4000 },
    { text: "I found myself smiling…", showDots: false, displayTime: 3400 },
    { text: "Because of simple things you said.", showDots: false, displayTime: 3800 },
    { text: "And without even realizing it…", showDots: false, displayTime: 3400 },
    { text: "I started looking forward to talking to you.", showDots: false, displayTime: 4200 },
    { text: "Maybe...\nThis isn't the first time\nI've tried to tell you how I feel.", showDots: true, thinkTime: 2400, displayTime: 6000, highlight: true },
    { text: "But...\nThis is the first time\nI've shown you\nwhat those feelings actually look like.", showDots: false, displayTime: 6500, highlight: true }
  ];

  let currentStep = 0;

  async function showNextDialogue() {
    if (currentStep >= dialogueSequence.length) {
      await sleep(2000);
      footerAction.classList.add('show');
      return;
    }

    const item = dialogueSequence[currentStep];

    if (item.showDots) {
      thinkingDots.classList.add('visible');
      await sleep(item.thinkTime || 1800);
      thinkingDots.classList.remove('visible');
      await sleep(400);
    } else {
      await sleep(300);
    }

    subtitleLine.textContent = item.text;
    subtitleLine.classList.toggle('gold-highlight', !!item.highlight);
    subtitleLine.classList.add('show');

    await sleep(item.displayTime);

    subtitleLine.classList.remove('show');
    await sleep(1200);

    currentStep++;
    await showNextDialogue();
  }

  async function startScreenTimeline() {
    bgLayer.classList.add('zoomed-deep');
    auroraWarm.classList.add('active');

    await sleep(2000);
    chapterHeader.classList.add('show');

    await sleep(2500);
    chapterHeader.classList.add('shifted');

    await sleep(1800);
    await showNextDialogue();
  }

  function init() {
    cancelled = false;
    currentStep = 0;
    chapterHeader.classList.remove('show', 'shifted');
    subtitleLine.classList.remove('show', 'gold-highlight');
    thinkingDots.classList.remove('visible');
    footerAction.classList.remove('show');
    bgLayer.classList.remove('zoomed-deep');
    bgLayer.style.transform = '';
    auroraWarm.classList.remove('active');

    resizeHandler = initStars;
    clickHandler = () => {
      window.dispatchEvent(new CustomEvent('screen:next', { detail: { from: 'screen6', to: 'screen7' } }));
    };

    window.addEventListener('resize', resizeHandler);
    nextChapterBtn.addEventListener('click', clickHandler);

    initStars();
    startScreenTimeline().catch(e => { if (e.message !== 'cancelled') console.error(e); });
  }

  function destroy() {
    cancelled = true;
    timers.forEach(clearTimeout); timers = [];
    window.removeEventListener('resize', resizeHandler);
    nextChapterBtn.removeEventListener('click', clickHandler);
  }

  window.Screens = window.Screens || {};
  window.Screens.screen6 = { init, destroy };
})();
