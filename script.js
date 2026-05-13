'use strict';

const $ = id => document.getElementById(id);

/* ══════════════════════════════════════════════════════════
   CLOCK
══════════════════════════════════════════════════════════ */
function tick() {
  $('clock').textContent = new Date().toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}
tick();
setInterval(tick, 1000);

/* ══════════════════════════════════════════════════════════
   PRELOADER  — orbiting text + counter + curtain reveal
══════════════════════════════════════════════════════════ */
(function runPreloader() {
  const counterEl = $('counter');
  let cur = 0, done = false;

  /* ── Size SVG to exact viewport so coordinates match ── */
  const svgEl = $('orbit-svg');
  svgEl.setAttribute('width',   window.innerWidth);
  svgEl.setAttribute('height',  window.innerHeight);
  svgEl.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);

  /* ── Build circular SVG path centred on screen ── */
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  const r  = Math.min(window.innerWidth, window.innerHeight) * 0.30;

  $('orbit-path').setAttribute('d',
    `M ${cx - r},${cy} A ${r},${r} 0 1,1 ${cx + r},${cy} A ${r},${r} 0 1,1 ${cx - r},${cy}`
  );

  /* ── Animation A: slow continuous rotation ── */
  const spinAnim = gsap.to('#orbit-spin', {
    rotation: 360,
    duration: 16,
    ease: 'none',
    repeat: -1,
    svgOrigin: `${cx} ${cy}`
  });

  /* ── Animation B: 2-second loading heartbeat ── */
  const pulseAnim = gsap.to('#orbit-pulse', {
    scale: 1.06,
    opacity: 0.55,
    duration: 1,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    svgOrigin: `${cx} ${cy}`
  });

  /* ── Counter animation helper ── */
  function animTo(target, cb) {
    gsap.to({ v: cur }, {
      v: target,
      duration: (target - cur) * 0.011,
      ease: 'power1.inOut',
      onUpdate() {
        cur = Math.round(this.targets()[0].v);
        counterEl.textContent = String(cur).padStart(2, '0');
      },
      onComplete: cb
    });
  }

  /* ── Reveal sequence (called once page + counter are ready) ── */
  function reveal() {
    spinAnim.kill();
    pulseAnim.kill();

    /* Orbiting ring: expand outward and fade */
    gsap.to('#orbit-spin', {
      scale: 3,
      opacity: 0,
      duration: 0.9,
      ease: 'power2.in',
      svgOrigin: `${cx} ${cy}`
    });

    /* Counter fade */
    gsap.to(counterEl, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in'
    });

    /* Curtain slides up after a short beat */
    gsap.to($('preloader'), {
      yPercent: -100,
      duration: 1.2,
      ease: 'expo.inOut',
      delay: 0.55,
      onComplete: () => $('preloader').remove()
    });
  }

  /* ── Drive the counter to 70 (pause), then wait for load ── */
  animTo(70, () => {
    function finish() {
      if (done) return; done = true;
      animTo(100, reveal);
    }
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
  });
})();

/* ══════════════════════════════════════════════════════════
   WINDOW SYSTEM
══════════════════════════════════════════════════════════ */
let Z = 10;
const winStates = {};

function bringFront(id) {
  document.querySelectorAll('.win').forEach(w => w.classList.remove('active'));
  const w = $('win-' + id);
  if (w) { w.style.zIndex = ++Z; w.classList.add('active'); }
}

function openWindow(id) {
  const w = $('win-' + id);
  if (!w) return;
  w.style.display = 'flex';
  bringFront(id);
  gsap.fromTo(w,
    { scale: 0.86, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.22, ease: 'back.out(1.5)' }
  );
  bindScramble(w);
}

function closeWin(id) {
  const w = $('win-' + id);
  if (!w) return;
  if (winStates[id]?.max) { winStates[id].max = false; }
  gsap.to(w, {
    scale: 0.86, opacity: 0, duration: 0.16, ease: 'power2.in',
    onComplete() { w.style.display = 'none'; gsap.set(w, { scale: 1, opacity: 1 }); }
  });
}

function minimizeWin(id) {
  const w = $('win-' + id);
  if (!w) return;
  gsap.to(w, {
    y: '+=64', opacity: 0, duration: 0.18, ease: 'power2.in',
    onComplete() { w.style.display = 'none'; gsap.set(w, { y: 0, opacity: 1 }); }
  });
}

function maximizeWin(id) {
  const w = $('win-' + id);
  if (!w) return;
  const st  = winStates[id] || (winStates[id] = { max: false });
  const btn = $('maxbtn-' + id);
  const TB  = 64;

  if (!st.max) {
    st.top = w.style.top;   st.left  = w.style.left;
    st.w   = w.style.width; st.h     = w.style.height;
    st.dx  = parseFloat(w.getAttribute('data-x')) || 0;
    st.dy  = parseFloat(w.getAttribute('data-y')) || 0;
    st.max = true;
    if (btn) btn.textContent = '❐';

    gsap.set(w, { x: 0, y: 0 });
    w.setAttribute('data-x', 0); w.setAttribute('data-y', 0);

    gsap.to(w, {
      top: 0, left: 0,
      width:  window.innerWidth,
      height: window.innerHeight - TB,
      duration: 0.32, ease: 'power3.inOut'
    });
  } else {
    st.max = false;
    if (btn) btn.textContent = '□';

    gsap.to(w, {
      top:  st.top  || 70,  left: st.left || 200,
      width: st.w  || '',   height: st.h  || '',
      duration: 0.28, ease: 'power3.inOut',
      onComplete() {
        if (!st.w) w.style.width  = '';
        if (!st.h) w.style.height = '';
        gsap.set(w, { x: st.dx, y: st.dy });
        w.setAttribute('data-x', st.dx); w.setAttribute('data-y', st.dy);
      }
    });
  }
}

/* ══════════════════════════════════════════════════════════
   DRAG + RESIZE + CURSOR  (interact.js)
══════════════════════════════════════════════════════════ */
function initWin(el) {
  const id = el.id.replace('win-', '');

  interact(el)
    .draggable({
      allowFrom: '.title-bar',
      listeners: {
        start() { bringFront(id); },
        move(e) {
          if (winStates[id]?.max) return;
          const x = (parseFloat(el.getAttribute('data-x')) || 0) + e.dx;
          const y = (parseFloat(el.getAttribute('data-y')) || 0) + e.dy;
          gsap.set(el, { x, y });
          el.setAttribute('data-x', x);
          el.setAttribute('data-y', y);
        }
      }
    })
    .resizable({
      edges: { left: true, right: true, bottom: true, top: true },
      margin: 8,
      listeners: {
        move(e) {
          if (winStates[id]?.max) return;
          let x = parseFloat(el.getAttribute('data-x')) || 0;
          let y = parseFloat(el.getAttribute('data-y')) || 0;
          el.style.width  = e.rect.width  + 'px';
          el.style.height = e.rect.height + 'px';
          x += e.deltaRect.left;
          y += e.deltaRect.top;
          gsap.set(el, { x, y });
          el.setAttribute('data-x', x);
          el.setAttribute('data-y', y);
        }
      },
      modifiers: [
        interact.modifiers.restrictSize({ min: { width: 320, height: 200 } })
      ]
    });

  el.addEventListener('mousemove', e => {
    if (winStates[id]?.max) { el.style.cursor = 'default'; return; }
    if (e.target.closest('.title-bar,.win-btn')) return;
    const r = el.getBoundingClientRect(), M = 8;
    const l = e.clientX - r.left < M, r2 = r.right  - e.clientX < M;
    const t = e.clientY - r.top  < M, b  = r.bottom - e.clientY < M;
    if      ((l && t)||(r2 && b)) el.style.cursor = 'nwse-resize';
    else if ((r2 && t)||(l && b)) el.style.cursor = 'nesw-resize';
    else if (l || r2)             el.style.cursor = 'ew-resize';
    else if (t || b)              el.style.cursor = 'ns-resize';
    else                          el.style.cursor = 'default';
  });
  el.addEventListener('mouseleave', () => { el.style.cursor = 'default'; });
  el.addEventListener('mousedown', () => bringFront(id));
}

document.querySelectorAll('.win').forEach(initWin);
['about', 'projects'].forEach(id => bringFront(id));

/* ══════════════════════════════════════════════════════════
   DESKTOP ICON GRID + DRAG  (snap-to-grid, no persistence)
══════════════════════════════════════════════════════════ */
const GRID_W  = 152;   // icon width
const GRID_H  = 172;   // icon height
const GRID_OX = 14;    // left margin
const GRID_OY = 14;    // top margin

function snapToGrid(px, py) {
  const col = Math.max(0, Math.round((px - GRID_OX) / GRID_W));
  const row = Math.max(0, Math.round((py - GRID_OY) / GRID_H));
  return { x: GRID_OX + col * GRID_W, y: GRID_OY + row * GRID_H };
}

// Rightmost grid column that fits fully within the viewport
const rightColX = GRID_OX + Math.floor((window.innerWidth - GRID_OX - GRID_W) / GRID_W) * GRID_W;

const ICON_INIT = {
  about:    { x: GRID_OX,          y: GRID_OY             },
  social:   { x: GRID_OX,          y: GRID_OY + GRID_H    },
  resume:   { x: GRID_OX,          y: GRID_OY + GRID_H * 2},
  contact:  { x: GRID_OX + GRID_W, y: GRID_OY             },
  projects: { x: GRID_OX + GRID_W, y: GRID_OY + GRID_H    },
  linkedin: { x: rightColX,        y: GRID_OY             },
  itch:     { x: rightColX,        y: GRID_OY + GRID_H    },
  github:   { x: rightColX,        y: GRID_OY + GRID_H * 2},
};

function initIconDrag(el) {
  const id = el.dataset.iconId;
  let moved = false;

  // Place at initial grid position
  const init = ICON_INIT[id] || { x: GRID_OX, y: GRID_OY };
  gsap.set(el, { x: init.x, y: init.y });
  el.setAttribute('data-x', init.x);
  el.setAttribute('data-y', init.y);

  interact(el).draggable({
    listeners: {
      start() {
        moved = false;
        el.style.zIndex = 5;
      },
      move(e) {
        moved = true;
        const x = (parseFloat(el.getAttribute('data-x')) || 0) + e.dx;
        const y = (parseFloat(el.getAttribute('data-y')) || 0) + e.dy;
        gsap.set(el, { x, y });
        el.setAttribute('data-x', x);
        el.setAttribute('data-y', y);
      },
      end() {
        el.style.zIndex = '';
        const x = parseFloat(el.getAttribute('data-x')) || 0;
        const y = parseFloat(el.getAttribute('data-y')) || 0;
        const snapped = snapToGrid(x, y);
        gsap.to(el, { x: snapped.x, y: snapped.y, duration: 0.15, ease: 'power2.out' });
        el.setAttribute('data-x', snapped.x);
        el.setAttribute('data-y', snapped.y);
      }
    }
  });

  // Suppress the onclick if the icon was actually dragged
  el.addEventListener('click', e => {
    if (moved) { e.stopImmediatePropagation(); moved = false; }
  }, true);
}

document.querySelectorAll('.icon[data-icon-id]').forEach(initIconDrag);

/* ══════════════════════════════════════════════════════════
   PDF.js VIEWER
══════════════════════════════════════════════════════════ */
let pdfDoc = null, pdfScale = 1.5;

function showPdfFallback() {
  const pages = $('pdf-pages');
  if (!pages) return;
  pages.innerHTML = `
    <div class="pdf-placeholder">
      <div class="big-icon">📄</div>
      <p>Place <strong>resume.pdf</strong> in the same folder as index.html.</p>
      <a class="dl-btn" href="resume.pdf" download>⬇ Download Resume</a>
    </div>`;
}

async function renderPdfPage(num) {
  if (!pdfDoc) return;
  const page = await pdfDoc.getPage(num);
  const viewport = page.getViewport({ scale: pdfScale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  $('pdf-pages').appendChild(canvas);
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
}

(function initPdfJs() {
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  s.onload = async () => {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    try {
      pdfDoc = await pdfjsLib.getDocument('resume.pdf').promise;
      const pages = $('pdf-pages');
      pages.innerHTML = '';
      for (let i = 1; i <= pdfDoc.numPages; i++) await renderPdfPage(i);
      const lbl = document.querySelector('#win-resume .acrobat-bar span');
      if (lbl) lbl.textContent = `Page 1 / ${pdfDoc.numPages}`;
    } catch (_) { showPdfFallback(); }
  };
  s.onerror = showPdfFallback;
  document.head.appendChild(s);
})();

/* ══════════════════════════════════════════════════════════
   GITHUB: live stats + heatmap
══════════════════════════════════════════════════════════ */
fetch('https://api.github.com/users/parygust')
  .then(r => r.json())
  .then(d => {
    if ($('gh-repos'))     $('gh-repos').textContent     = d.public_repos ?? '—';
    if ($('gh-followers')) $('gh-followers').textContent = d.followers     ?? '—';
  }).catch(() => {});

fetch('https://api.github.com/users/parygust/repos?per_page=100')
  .then(r => r.json())
  .then(repos => {
    if (!Array.isArray(repos)) return;
    const stars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
    if ($('gh-stars')) $('gh-stars').textContent = stars;
  }).catch(() => {});

(function buildHeatmap() {
  const el = $('gh-heatmap');
  if (!el) return;
  const COLORS = ['#161b22','#0e4429','#006d32','#26a641','#39d353'];
  let s = 0xdeadbeef;
  const rng = () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 0xffffffff; };

  const frag = document.createDocumentFragment();
  for (let i = 0; i < 364; i++) {
    const d = document.createElement('div');
    d.className = 'gh-cell';
    const r = rng();
    const lvl = r < .55 ? 0 : r < .70 ? 1 : r < .82 ? 2 : r < .93 ? 3 : 4;
    d.style.background = COLORS[lvl];
    d.title = lvl === 0 ? 'No contributions' : `${lvl} contribution${lvl > 1 ? 's' : ''}`;
    frag.appendChild(d);
  }
  el.appendChild(frag);
})();

/* ══════════════════════════════════════════════════════════
   TEXT SCRAMBLE
══════════════════════════════════════════════════════════ */
const SYMS = '@#$%*!?&^~≠∑π√§†‡';

function scramble(el) {
  const orig = el.dataset.orig || el.textContent.trim();
  el.dataset.orig = orig;
  if (el._st) clearInterval(el._st);
  let t = 0;
  el._st = setInterval(() => {
    t++;
    if (t >= 15) { clearInterval(el._st); el.textContent = orig; return; }
    const p = t / 15;
    el.textContent = orig.split('').map((ch, i) => {
      if (ch === ' ') return ' ';
      return i / orig.length < p ? ch : SYMS[Math.floor(Math.random() * SYMS.length)];
    }).join('');
  }, 20);
}

function bindScramble(root) {
  (root || document).querySelectorAll('[data-scramble]').forEach(el => {
    if (el.dataset.sb) return;
    el.dataset.sb = '1';
    el.addEventListener('mouseenter', () => scramble(el));
  });
}
bindScramble();

/* ══════════════════════════════════════════════════════════
   SOCIAL HUB TABS
══════════════════════════════════════════════════════════ */
function switchTab(id) {
  const hub = $('win-social');
  hub.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  hub.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  $('tab-' + id)?.classList.add('active');
  hub.querySelectorAll('.tab-btn').forEach(b => {
    if (b.getAttribute('onclick') === `switchTab('${id}')`) b.classList.add('active');
  });
  bindScramble(hub);
}

/* ══════════════════════════════════════════════════════════
   WEB AUDIO  (Win95 click beep)
══════════════════════════════════════════════════════════ */
let actx = null;
function beep() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.connect(g); g.connect(actx.destination);
    o.type = 'square';
    o.frequency.setValueAtTime(880, actx.currentTime);
    o.frequency.exponentialRampToValueAtTime(220, actx.currentTime + .12);
    g.gain.setValueAtTime(.12, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, actx.currentTime + .15);
    o.start(); o.stop(actx.currentTime + .16);
  } catch (_) {}
}

function openLink(url) {
  beep();
  setTimeout(() => window.open(url, '_blank', 'noopener,noreferrer'), 120);
}

/* ══════════════════════════════════════════════════════════
   START MENU
══════════════════════════════════════════════════════════ */
let menuOpen = false;

function toggleMenu() {
  menuOpen = !menuOpen;
  const m = $('start-menu'), b = $('start-btn');
  if (menuOpen) {
    m.style.display = 'block';
    b.classList.add('pressed');
    gsap.fromTo(m, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.16, ease: 'power2.out' });
    bindScramble(m);
  } else { closeMenu(); }
}

function closeMenu() {
  if (!menuOpen && $('start-menu').style.display === 'none') return;
  menuOpen = false;
  $('start-btn').classList.remove('pressed');
  gsap.to($('start-menu'), {
    opacity: 0, y: 12, duration: 0.12, ease: 'power2.in',
    onComplete: () => { $('start-menu').style.display = 'none'; }
  });
}

document.addEventListener('mousedown', e => {
  if (menuOpen && !$('start-menu').contains(e.target) && !$('start-btn').contains(e.target))
    closeMenu();
});

/* ══════════════════════════════════════════════════════════
   MODULAR WINDOW FACTORY
══════════════════════════════════════════════════════════ */
function addWindow({ id, title, icon = '🗂', label, content = '', top = 120, left = 280 }) {
  const ic = document.createElement('div');
  ic.className = 'icon'; ic.tabIndex = 0;
  ic.onclick = () => openWindow(id);
  ic.innerHTML = `<div class="icon-img">${icon}</div>
    <span class="icon-label" data-scramble>${label || title}</span>`;
  $('icons').appendChild(ic);
  bindScramble(ic);

  const w = document.createElement('div');
  w.className = 'win'; w.id = 'win-' + id;
  w.style.cssText = `top:${top}px;left:${left}px;`;
  w.innerHTML = `
    <div class="title-bar" data-win="${id}">
      <span class="title-icon">${icon}</span>
      <span class="title-text" data-scramble>${title}</span>
      <div class="win-btn" onclick="minimizeWin('${id}')">_</div>
      <div class="win-btn" id="maxbtn-${id}" onclick="maximizeWin('${id}')">□</div>
      <div class="win-btn" onclick="closeWin('${id}')">✕</div>
    </div>
    <div class="win-content">
      <div class="win-body" style="min-width:280px;">${content}</div>
    </div>`;
  $('desktop').appendChild(w);
  initWin(w);
  bindScramble(w);
  openWindow(id);
}
