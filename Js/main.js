/* ============================================
   MAIN.JS — central controller
   - Preloads fonts before showing gate (no lag on first paint)
   - Shows "Let's Begin" gate (unlocks audio via user gesture)
   - Listens for screen:next / screen:navigate events
   - Calls destroy() on the outgoing screen, init() on the incoming one
   ============================================ */

(function () {
  window.Screens = window.Screens || {};

  // ---------- Shared Audio Context (unlocked on gate click) ----------
  window.SharedAudio = null;
  window.getAudioCtx = function () {
    if (!window.SharedAudio) {
      try {
        window.SharedAudio = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        window.SharedAudio = null;
      }
    }
    if (window.SharedAudio && window.SharedAudio.state === 'suspended') {
      window.SharedAudio.resume();
    }
    return window.SharedAudio;
  };

  // ---------- Screen order / navigation ----------
  const order = [
    'screen0', 'screen1', 'screen2', 'screen3', 'screen4',
    'screen5', 'screen6', 'screen7', 'screen8a', 'screen8b'
  ];

  let current = null;

  function showScreen(id) {
    id = (id || '').toLowerCase();
    if (!order.includes(id)) {
      console.warn('Unknown screen id:', id);
      return;
    }

    const prevId = current;

    order.forEach(s => {
      const el = document.getElementById(s);
      if (!el) return;
      el.classList.toggle('active', s === id);
    });

    if (prevId && prevId !== id && window.Screens[prevId] && typeof window.Screens[prevId].destroy === 'function') {
      try { window.Screens[prevId].destroy(); } catch (e) { console.error(e); }
    }

    current = id;

    if (window.Screens[id] && typeof window.Screens[id].init === 'function') {
      try { window.Screens[id].init(); } catch (e) { console.error(e); }
    }
  }
  window.showScreen = showScreen;

  window.addEventListener('screen:next', e => {
    const to = e.detail && e.detail.to;
    if (to) showScreen(to);
  });

  window.addEventListener('screen:navigate', e => {
    const to = e.detail && e.detail.targetScreen;
    if (to) showScreen(to);
  });

  // ---------- Preload fonts, then reveal the gate ----------
  function preloadFonts() {
    if (document.fonts && document.fonts.ready) {
      return document.fonts.ready.catch(() => {});
    }
    return Promise.resolve();
  }

  function init() {
    const loader = document.getElementById('loader-screen');
    const gate = document.getElementById('gate-screen');
    const beginBtn = document.getElementById('lets-begin-btn');

    preloadFonts().then(() => {
      // small delay so the loader doesn't just flash
      setTimeout(() => {
        loader.classList.add('hide');
        gate.classList.add('show');
        setTimeout(() => { loader.style.display = 'none'; }, 650);
      }, 300);
    });

    beginBtn.addEventListener('click', () => {
      // Unlock audio context on this real user gesture —
      // this is what fixes Screen 0's notification sound.
      window.getAudioCtx();

      gate.classList.add('hide');
      setTimeout(() => {
        gate.style.display = 'none';
        showScreen('screen0');
      }, 600);
    }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
