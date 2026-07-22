/* ===== SCREEN 5 — What I Noticed ===== */
(function () {
  const root = document.getElementById('screen5');
  const bgLayer = root.querySelector('#s5-bg-layer');
  const chapterHeader = root.querySelector('#s5-chapter-header');
  const frontCard = root.querySelector('#s5-front-card');
  const cardInner = root.querySelector('#s5-card-inner');
  const footerBar = root.querySelector('#s5-footer-bar');
  const progressDots = root.querySelector('#s5-progress-dots');
  const nextCardBtn = root.querySelector('#s5-next-card-btn');
  const shadow1 = root.querySelector('.shadow-1');
  const shadow2 = root.querySelector('.shadow-2');
  const starsCanvas = root.querySelector('#s5-stars-canvas');
  const particlesCanvas = root.querySelector('#s5-particles-canvas');
  const starsCtx = starsCanvas.getContext('2d');
  const particlesCtx = particlesCanvas.getContext('2d');
  const stackContainer = root.querySelector('#s5-card-stack-container');

  // NOTE: card 1 & 2 reference image files (smile.jpg / eyes.jpg).
  // Put your own images in an /assets folder and update the paths below,
  // or the circular photo frame will just render empty.
  const cardsData = [
    { type: 'crop', image: 'assets/smile.jpg', heading: 'Your smile.', subtext: 'It has a way of making everything feel lighter.', duration: 6500 },
    { type: 'crop', image: 'assets/eyes.jpg', heading: 'Your eyes.', subtext: "There's something calm about them that I can't explain.", duration: 6500 },
    { type: 'text-simple', heading: 'Your nature, kindness and the way you talk', subtext: 'I like the way you talk about yourself', duration: 6000 },
    { type: 'honesty', heading: 'And then I realized…', pauseText: "It wasn't just one thing.", subtext: 'It was everything together.', duration: 7000 },
    { type: 'honesty', heading: "I don't know you as well as I'd like to.", pauseText: 'And honestly…', subtext: "That's exactly why I'm here.", duration: 7500 },
    { type: 'simple', heading: 'Because every conversation…', subtext: 'Makes me want to know you a little more.', duration: 6500 },
    { type: 'last', heading: "Maybe I don't know every chapter of your story yet.", pauseText: "But I'd love the chance to read the next ones with you.", duration: 0 }
  ];

  let width, height;
  let currentCardIndex = 0;
  let autoTimer = null;
  let isTransitioning = false;
  let particleList = [];
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  let touchStartX = 0, touchEndX = 0;
  let rafId = null, timers = [];
  let mouseMoveHandler, resizeHandler, nextClickHandler, touchStartHandler, touchEndHandler, mouseDownHandler, mouseUpHandler;

  function setTimer(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }

  function resize() {
    width = window.innerWidth; height = window.innerHeight;
    [starsCanvas, particlesCanvas].forEach(c => {
      c.width = width * devicePixelRatio; c.height = height * devicePixelRatio;
      c.style.width = width + 'px'; c.style.height = height + 'px';
      c.getContext('2d').setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    });
  }

  function renderLoop() {
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;

    if (frontCard && !isTransitioning) {
      frontCard.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
    bgLayer.style.transform = `translate(${-currentX * 0.3}px, ${-currentY * 0.3}px) scale(1.08)`;

    if (particleList.length > 0) {
      particlesCtx.clearRect(0, 0, width, height);
      particleList.forEach((p, index) => {
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.012;
        particlesCtx.fillStyle = `rgba(255, 208, 117, ${p.alpha})`;
        particlesCtx.beginPath();
        particlesCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        particlesCtx.fill();
        if (p.alpha <= 0) particleList.splice(index, 1);
      });
    }

    rafId = requestAnimationFrame(renderLoop);
  }

  function initProgress() {
    progressDots.innerHTML = '';
    cardsData.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = `dot ${i === 0 ? 'active' : ''}`;
      progressDots.appendChild(dot);
    });
  }

  function updateProgress(index) {
    const dots = progressDots.querySelectorAll('.dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  function renderCardContent(data) {
    cardInner.innerHTML = '';

    if (data.type === 'crop') {
      const imgBox = document.createElement('div');
      imgBox.className = 'crop-image-box';
      imgBox.innerHTML = `<img src="${data.image}" alt="Memory Crop">`;
      const h = document.createElement('h3');
      h.className = 'card-heading';
      h.textContent = data.heading;
      const p = document.createElement('p');
      p.className = 'card-subtext';
      p.textContent = data.subtext;
      cardInner.appendChild(imgBox); cardInner.appendChild(h); cardInner.appendChild(p);
      setTimer(() => imgBox.classList.add('show'), 300);
      setTimer(() => h.classList.add('show-element'), 1800);
      setTimer(() => p.classList.add('show-element'), 3000);

    } else if (data.type === 'text-simple' || data.type === 'simple') {
      const h = document.createElement('h3');
      h.className = 'card-heading show-element';
      h.style.fontSize = '1.6rem';
      h.textContent = data.heading;
      const p = document.createElement('p');
      p.className = 'card-subtext';
      p.textContent = data.subtext;
      cardInner.appendChild(h); cardInner.appendChild(p);
      setTimer(() => p.classList.add('show-element'), 1500);

    } else if (data.type === 'honesty' || data.type === 'last') {
      const h = document.createElement('h3');
      h.className = 'card-heading show-element';
      h.textContent = data.heading;
      const p1 = document.createElement('p');
      p1.className = 'card-subtext';
      p1.textContent = data.pauseText;
      const p2 = document.createElement('p');
      p2.className = 'card-subtext';
      p2.style.color = 'var(--accent-gold)';
      p2.textContent = data.subtext;
      cardInner.appendChild(h); cardInner.appendChild(p1); cardInner.appendChild(p2);
      setTimer(() => p1.classList.add('show-element'), 1500);
      setTimer(() => p2.classList.add('show-element'), 3000);

      if (data.type === 'last') {
        frontCard.classList.add('last-card-style');
        nextCardBtn.style.display = 'none';
        const continueBtn = document.createElement('button');
        continueBtn.className = 'last-continue-btn';
        continueBtn.textContent = 'Continue →';
        continueBtn.style.marginTop = '18px';
        continueBtn.style.opacity = '0';
        cardInner.appendChild(continueBtn);
        setTimer(() => { continueBtn.style.opacity = '1'; }, 5000);
        continueBtn.addEventListener('click', handleLastExit);
      }
    }
  }

  function switchCard(direction = 'next') {
    if (isTransitioning) return;
    if (direction === 'next' && currentCardIndex >= cardsData.length - 1) return;
    if (direction === 'prev' && currentCardIndex <= 0) return;

    isTransitioning = true;
    clearTimeout(autoTimer);

    frontCard.classList.remove('land', 'slow-appear');
    frontCard.classList.add(direction === 'next' ? 'slide-exit-next' : 'slide-exit-prev');

    setTimer(() => {
      currentCardIndex = direction === 'next' ? currentCardIndex + 1 : currentCardIndex - 1;
      updateProgress(currentCardIndex);
      frontCard.classList.remove('slide-exit-next', 'slide-exit-prev', 'last-card-style');
      if (currentCardIndex < cardsData.length - 1) nextCardBtn.style.display = 'inline-flex';
      renderCardContent(cardsData[currentCardIndex]);
      frontCard.classList.add('land');
      isTransitioning = false;

      const card = cardsData[currentCardIndex];
      if (card.duration > 0) {
        autoTimer = setTimer(() => switchCard('next'), card.duration);
      }
    }, 600);
  }

  function handleTouchStart(e) { touchStartX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX; }
  function handleTouchEnd(e) {
    touchEndX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    if (touchEndX - touchStartX > 40) switchCard('prev');
  }

  function handleLastExit() {
    const rect = frontCard.getBoundingClientRect();
    for (let i = 0; i < 90; i++) {
      particleList.push({
        x: rect.left + Math.random() * rect.width, y: rect.top + Math.random() * rect.height,
        r: Math.random() * 2.5 + 1, vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 3 - 1, alpha: 1
      });
    }
    frontCard.style.opacity = '0';
    frontCard.style.transition = 'opacity 0.8s ease';
    setTimer(() => {
      window.dispatchEvent(new CustomEvent('screen:next', { detail: { from: 'screen5', to: 'screen6' } }));
    }, 1200);
  }

  function startTimeline() {
    setTimer(() => bgLayer.classList.add('zoomed'), 50);
    setTimer(() => starsCanvas.classList.add('heartbeat'), 800);
    setTimer(() => chapterHeader.classList.add('show'), 1200);
    setTimer(() => {
      chapterHeader.classList.add('slide-up');
      renderCardContent(cardsData[0]);
      frontCard.classList.add('slow-appear');
      shadow1.classList.add('show');
      shadow2.classList.add('show');
      footerBar.classList.add('show');
      autoTimer = setTimer(() => switchCard('next'), cardsData[0].duration);
    }, 2200);
  }

  function init() {
    currentCardIndex = 0; isTransitioning = false; particleList = [];
    frontCard.className = 'matte-card';
    frontCard.style.opacity = ''; frontCard.style.transition = '';
    frontCard.style.transform = '';
    cardInner.innerHTML = '';
    chapterHeader.classList.remove('show', 'slide-up');
    bgLayer.classList.remove('zoomed');
    starsCanvas.classList.remove('heartbeat');
    shadow1.classList.remove('show');
    shadow2.classList.remove('show');
    footerBar.classList.remove('show');
    nextCardBtn.style.display = 'inline-flex';

    mouseMoveHandler = e => { targetX = (e.clientX / width - 0.5) * 24; targetY = (e.clientY / height - 0.5) * 24; };
    resizeHandler = resize;
    nextClickHandler = () => switchCard('next');
    touchStartHandler = handleTouchStart;
    touchEndHandler = handleTouchEnd;
    mouseDownHandler = handleTouchStart;
    mouseUpHandler = handleTouchEnd;

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('resize', resizeHandler);
    nextCardBtn.addEventListener('click', nextClickHandler);
    stackContainer.addEventListener('touchstart', touchStartHandler, { passive: true });
    stackContainer.addEventListener('touchend', touchEndHandler, { passive: true });
    stackContainer.addEventListener('mousedown', mouseDownHandler);
    stackContainer.addEventListener('mouseup', mouseUpHandler);

    resize();
    initProgress();
    rafId = requestAnimationFrame(renderLoop);
    startTimeline();
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    clearTimeout(autoTimer);
    timers.forEach(clearTimeout); timers = [];
    window.removeEventListener('mousemove', mouseMoveHandler);
    window.removeEventListener('resize', resizeHandler);
    nextCardBtn.removeEventListener('click', nextClickHandler);
    stackContainer.removeEventListener('touchstart', touchStartHandler);
    stackContainer.removeEventListener('touchend', touchEndHandler);
    stackContainer.removeEventListener('mousedown', mouseDownHandler);
    stackContainer.removeEventListener('mouseup', mouseUpHandler);
  }

  window.Screens = window.Screens || {};
  window.Screens.screen5 = { init, destroy };
})();
