'use strict';

/* ── PAGE LOAD ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('ready');
  setTimeout(() => {
    const l = document.getElementById('loader');
    if (l) l.classList.add('gone');
  }, 1050);
});

/* ── THEME ──────────────────────────────────────────────────── */
const HTML = document.documentElement;
const themeBtn        = document.getElementById('themeBtn');
const themeIcon       = document.getElementById('themeIcon');
const drawerThemeBtn  = document.getElementById('drawerThemeBtn');
const drawerThemeIcon = document.getElementById('drawerThemeIcon');
const drawerThemeLbl  = document.getElementById('drawerThemeLbl');

const stored = localStorage.getItem('cr3-theme');
let dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;

function applyTheme() {
  HTML.setAttribute('data-theme', dark ? 'dark' : 'light');
  const ic = dark ? 'ph-moon' : 'ph-sun';
  themeIcon.className = `ph ${ic}`;
  drawerThemeIcon.className = `ph ${ic}`;
  drawerThemeLbl.textContent = dark ? 'Dark Mode' : 'Light Mode';
  localStorage.setItem('cr3-theme', dark ? 'dark' : 'light');
}
function toggleTheme() { dark = !dark; applyTheme(); }
themeBtn.addEventListener('click', toggleTheme);
drawerThemeBtn.addEventListener('click', toggleTheme);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem('cr3-theme')) { dark = e.matches; applyTheme(); }
});
applyTheme();

/* ── NAVBAR SCROLL ──────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
let navTick = false;
window.addEventListener('scroll', () => {
  if (!navTick) {
    requestAnimationFrame(() => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
      navTick = false;
    });
    navTick = true;
  }
}, { passive: true });

/* ── ACTIVE NAV ─────────────────────────────────────────────── */
const allLinks = document.querySelectorAll('.nav-links a, .drawer-link');
document.querySelectorAll('section[id]').forEach(sec => {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting)
        allLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${sec.id}`));
    });
  }, { rootMargin: '-30% 0px -65% 0px' }).observe(sec);
});

/* ── DRAWER ─────────────────────────────────────────────────── */
const hamburger    = document.getElementById('hamburger');
const mobileDrawer = document.getElementById('mobileDrawer');
const drawerOvl    = document.getElementById('drawerOverlay');
let drawerOpen = false;

function openDrawer() {
  drawerOpen = true;
  hamburger.classList.add('open');
  mobileDrawer.classList.add('open');
  drawerOvl.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  setTimeout(() => mobileDrawer.querySelector('a')?.focus(), 80);
}
function closeDrawer() {
  drawerOpen = false;
  hamburger.classList.remove('open');
  mobileDrawer.classList.remove('open');
  drawerOvl.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  hamburger.focus();
}
hamburger.addEventListener('click', () => drawerOpen ? closeDrawer() : openDrawer());
hamburger.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drawerOpen ? closeDrawer() : openDrawer(); }
});
drawerOvl.addEventListener('click', closeDrawer);
document.querySelectorAll('.drawer-link').forEach(l => l.addEventListener('click', closeDrawer));

mobileDrawer.addEventListener('keydown', e => {
  if (!drawerOpen || e.key !== 'Tab') return;
  const focusable = [...mobileDrawer.querySelectorAll('a, button')];
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ── ESC ────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeDrawer();
    closeSpecsModal();
    closeWelcome();
    closeInfoPanel();
    if (mapOpen) closeMapFull();
  }
});

/* ── RESIZE ─────────────────────────────────────────────────── */
window.addEventListener('resize', () => {
  if (window.innerWidth > 960 && drawerOpen) closeDrawer();
}, { passive: true });

/* ══════════════════════════════════════════════════════════════
   CUSTOM CURSOR — REWRITTEN
   Uses transform: translate() for zero-jitter positioning.
   scale() for hover/click states so position isn't affected.
   Event delegation for hover detection (no stale element lists).
═══════════════════════════════════════════════════════════════ */
(() => {
  // Only on pointer:fine (mouse) devices
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const dot  = document.getElementById('curDot');
  const ring = document.getElementById('curRing');
  if (!dot || !ring) return;

  let mx = -400, my = -400; // off-screen until first move
  let rx = -400, ry = -400;
  let cursorVisible = false;
  let rafId = null;

  // Show cursor on first mouse move
  function showCursor() {
    if (!cursorVisible) {
      cursorVisible = true;
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    }
  }

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    showCursor();
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    if (cursorVisible) {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    }
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    // Dot snaps instantly
    dot.style.transform  = `translate(${mx}px, ${my}px) translateZ(0)`;
    // Ring lerps for trailing effect
    rx = lerp(rx, mx, 0.14);
    ry = lerp(ry, my, 0.14);
    ring.style.transform = `translate(${rx}px, ${ry}px) translateZ(0)`;
    rafId = requestAnimationFrame(tick);
  }
  tick();

  // ── Hover detection via event delegation ──────────────────
  const HOVER_SEL = [
    'a', 'button', '[role="button"]', '[tabindex="0"]',
    '.ip-card', '.strip-item', '.join-card', '.feature-card',
    '.video-card', '.modal-close', '.plugin-row', '.stat-card',
    '.info-tile', '.ipt', '.map-preview', '.cl-header', '.faq-q',
    '.back-to-top', '.map-lb-btn', '.tut-step-code', '.tut-tab',
  ].join(', ');

  document.addEventListener('mouseover', e => {
    if (e.target.closest(HOVER_SEL)) {
      dot.classList.add('h');
      ring.classList.add('h');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(HOVER_SEL)) {
      dot.classList.remove('h');
      ring.classList.remove('h');
    }
  });

  document.addEventListener('mousedown', () => { dot.classList.add('c'); ring.classList.add('c'); });
  document.addEventListener('mouseup',   () => { dot.classList.remove('c'); ring.classList.remove('c'); });
})();

/* ── PARTICLES ──────────────────────────────────────────────── */
(() => {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.style.display = 'none'; return; }
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];
  const N = window.innerWidth < 600 ? 18 : 38;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  for (let i = 0; i < N; i++) pts.push({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.4 + .4,
    dx: (Math.random() - .5) * .22,
    dy: (Math.random() - .5) * .22,
    o: Math.random() * .3 + .06,
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${p.o})`; ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── TOAST ──────────────────────────────────────────────────── */
let toastTimer = null;
function showToast(msg, type = 'success') {
  const el = document.getElementById('toast');
  const ic = document.getElementById('toastIcon');
  const tx = document.getElementById('toastMsg');
  clearTimeout(toastTimer);
  ic.className = `ph ${type === 'success' ? 'ph-check-circle' : 'ph-warning-circle'}`;
  el.className = `toast ${type}`;
  tx.textContent = msg;
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

/* ── COPY IP ────────────────────────────────────────────────── */
function copyIP() {
  const ip  = 'mc.cr3scent.asia';
  const el  = document.getElementById('ipText');
  const orig = el.textContent;
  const ok = () => {
    el.textContent = '✓ Copied!';
    showToast('IP address copied!');
    setTimeout(() => el.textContent = orig, 2200);
    if (window._launchConfetti) window._launchConfetti();
  };
  const fail = () => showToast('Salin manual: ' + ip, 'error');

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(ip).then(ok).catch(() => { try { legacyCopy(ip); ok(); } catch { fail(); } });
  } else {
    try { legacyCopy(ip); ok(); } catch { fail(); }
  }
}
function legacyCopy(text) {
  const ta = document.createElement('textarea');
  Object.assign(ta.style, { position: 'fixed', left: '-9999px', top: '-9999px', opacity: '0' });
  ta.value = text; ta.readOnly = true;
  document.body.appendChild(ta);
  ta.focus(); ta.select(); ta.setSelectionRange(0, 99999);
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  if (!ok) throw new Error('execCommand failed');
}

/* ── SERVER STATUS ──────────────────────────────────────────── */
let abortCtrl = null;
async function checkServerStatus() {
  const dot   = document.getElementById('statusDot');
  const stxt  = document.getElementById('statusText');
  const pcnt  = document.getElementById('playerCount');
  const siS   = document.getElementById('si-status');
  const siP   = document.getElementById('si-players');
  if (abortCtrl) abortCtrl.abort();
  abortCtrl = new AbortController();
  siS.classList.add('loading'); siP.classList.add('loading');
  stxt.textContent = '…'; dot.className = 'status-dot';
  try {
    const res = await fetch('https://api.mcsrvstat.us/3/mc.cr3scent.asia', {
      signal: abortCtrl.signal, cache: 'no-cache'
    });
    if (!res.ok) throw new Error();
    const d = await res.json();
    if (d.online) {
      dot.className = 'status-dot online';
      stxt.textContent = 'Online';
      pcnt.textContent = String(d.players?.online ?? 0);
    } else {
      dot.className = 'status-dot offline';
      stxt.textContent = 'Offline';
      pcnt.textContent = '0';
    }
  } catch (err) {
    if (err.name === 'AbortError') return;
    dot.className = 'status-dot';
    stxt.textContent = 'Unknown';
    pcnt.textContent = '?';
  } finally {
    siS.classList.remove('loading'); siP.classList.remove('loading');
  }
}

/* ── UPTIME ─────────────────────────────────────────────────── */
function calculateUptime() {
  const el = document.getElementById('uptimeValue');
  const launch = new Date('2026-03-19T00:00:00+07:00');
  const diff = Date.now() - launch.getTime();
  if (diff < 0) { el.textContent = 'Soon'; return; }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  el.textContent = `${d}d ${h}h`;
}

/* ── SPECS MODAL ────────────────────────────────────────────── */
const backdrop   = document.getElementById('modalBackdrop');
const specsModal = document.getElementById('specsModal');
let lastFocus = null;

function openSpecsModal() {
  lastFocus = document.activeElement;
  backdrop.classList.add('open'); backdrop.removeAttribute('aria-hidden');
  specsModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => specsModal.querySelector('.modal-close')?.focus(), 80);
  showToast('Specs loaded');
}
function closeSpecsModal() {
  backdrop.classList.remove('open'); backdrop.setAttribute('aria-hidden', 'true');
  specsModal.classList.remove('open');
  document.body.style.overflow = '';
  lastFocus?.focus();
}
backdrop.addEventListener('click', closeSpecsModal);

specsModal.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const f = [...specsModal.querySelectorAll('button, a, [tabindex="0"]')];
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ── TIKTOK / YOUTUBE ───────────────────────────────────────── */
function openTikTok() {
  window.open('https://www.tiktok.com/@cr3scentdc', '_blank', 'noopener,noreferrer');
  showToast('Opening TikTok @cr3scentdc…');
}
function openTutorialVideo() {
  window.open('https://youtube.com/shorts/IcPVN8Zms3E', '_blank', 'noopener,noreferrer');
  showToast('Opening tutorial di YouTube…');
}

/* ════════════════════════════════════════════════════════════
   INFO PANEL — replaces Features & Stats sections
   Opened via info-tile cards, nav links, or programmatically.
════════════════════════════════════════════════════════════ */
const infoPanel        = document.getElementById('infoPanel');
const infoPanelBdrop   = document.getElementById('infoPanelBackdrop');
let infoPanelOpen      = false;
let infoPanelLastFocus = null;
let statsAnimated      = false;

function openInfoPanel(tab = 'features') {
  infoPanelLastFocus = document.activeElement;
  switchInfoTab(tab);
  infoPanelBdrop.classList.add('open');
  infoPanel.classList.add('open');
  infoPanel.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
  infoPanelOpen = true;
  setTimeout(() => infoPanel.querySelector('.info-panel-close')?.focus(), 80);
  // animate stats on first open of that tab
  if (tab === 'stats' && !statsAnimated) { statsAnimated = true; animateAllCounters(); }
}

function closeInfoPanel() {
  infoPanelBdrop.classList.remove('open');
  infoPanel.classList.remove('open');
  infoPanel.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  infoPanelOpen = false;
  infoPanelLastFocus?.focus();
}

function switchInfoTab(tab) {
  document.querySelectorAll('.ipt').forEach(btn => {
    const active = btn.dataset.tab === tab;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  document.querySelectorAll('.ip-tab').forEach(panel => {
    panel.classList.toggle('active', panel.id === `iptab-${tab}`);
  });
  // trigger counter animation when stats tab opened
  if (tab === 'stats' && !statsAnimated) { statsAnimated = true; animateAllCounters(); }
}

// touch swipe to close on mobile
if (infoPanel) {
  let ipTouchY = 0;
  infoPanel.addEventListener('touchstart', e => { ipTouchY = e.touches[0].clientY; }, { passive: true });
  infoPanel.addEventListener('touchend', e => {
    if (e.changedTouches[0].clientY - ipTouchY > 90) closeInfoPanel();
  }, { passive: true });
}

/* ── WELCOME POPUP ──────────────────────────────────────────── */
const welcomeBackdrop = document.getElementById('welcomeBackdrop');
const welcomeModal    = document.getElementById('welcomeModal');
let welcomeLastFocus  = null;

function openWelcome() {
  welcomeLastFocus = document.activeElement;
  welcomeBackdrop.classList.add('open');
  welcomeModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => welcomeModal.querySelector('button')?.focus(), 100);
}

function closeWelcome() {
  const dontShow = document.getElementById('dontShowAgain');
  if (dontShow && dontShow.checked) localStorage.setItem('cr3-welcome-seen', '1');
  welcomeBackdrop.classList.remove('open');
  welcomeModal.classList.remove('open');
  document.body.style.overflow = '';
  welcomeLastFocus?.focus();
}

function switchTab(platform) {
  document.querySelectorAll('.tut-tab').forEach(t => {
    const isActive = t.id === `tab-${platform}`;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  document.querySelectorAll('.tut-panel').forEach(p => {
    p.classList.toggle('active', p.id === `panel-${platform}`);
  });
}

function copyIPPopup() {
  const ip = 'mc.cr3scent.asia';
  const ok = () => showToast('IP copied: ' + ip);
  const fail = () => showToast('Salin manual: ' + ip, 'error');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(ip).then(ok).catch(fail);
  } else { try { legacyCopy(ip); ok(); } catch { fail(); } }
}

function copyPortPopup() {
  const port = '25655';
  const ok = () => showToast('Port copied: ' + port);
  const fail = () => showToast('Port: ' + port, 'error');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(port).then(ok).catch(fail);
  } else { try { legacyCopy(port); ok(); } catch { fail(); } }
}

welcomeModal.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const f = [...welcomeModal.querySelectorAll('button, a, [tabindex="0"], input')];
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ── INIT ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  checkServerStatus();
  calculateUptime();

  const seen = localStorage.getItem('cr3-welcome-seen');
  if (!seen) setTimeout(openWelcome, 1400);

  let iStatus, iUptime;
  function start() {
    iStatus = setInterval(checkServerStatus, 30000);
    iUptime = setInterval(calculateUptime, 60000);
  }
  function stop() { clearInterval(iStatus); clearInterval(iUptime); }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else { checkServerStatus(); start(); }
  });
  start();
});

/* ── COUNTER ANIMATION ──────────────────────────────────────── */
function animateCounter(el, target, suffix, duration = 1800) {
  const start = performance.now();
  (function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target + suffix;
  })(start);
}

function animateAllCounters() {
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    if (!isNaN(target)) animateCounter(el, target, suffix);
  });
}

/* ── CONFETTI ────────────────────────────────────────────────── */
(() => {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let pieces = [], animId = null, running = false;
  const COLORS = ['#c9a84c','#e0c06a','#ffffff','#30d158','#5865F2','#ff9500'];
  const COUNT = window.innerWidth < 600 ? 60 : 120;

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  function spawn() {
    pieces = [];
    for (let i = 0; i < COUNT; i++) {
      pieces.push({
        x: Math.random() * canvas.width, y: -10 - Math.random() * 200,
        w: 6 + Math.random() * 8, h: 3 + Math.random() * 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.random() * Math.PI * 2, rotV: (Math.random() - .5) * .15,
        vx: (Math.random() - .5) * 3, vy: 2 + Math.random() * 4, opacity: 1,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach(p => {
      if (p.y > canvas.height + 20) return;
      alive = true;
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV; p.vy += .06;
      if (p.y > canvas.height * .6) p.opacity = Math.max(0, p.opacity - .015);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity; ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    });
    if (alive) animId = requestAnimationFrame(draw);
    else stop();
  }

  function stop() {
    running = false; canvas.style.opacity = '0'; cancelAnimationFrame(animId);
    setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 400);
  }

  window._launchConfetti = function() {
    if (running) return;
    running = true; canvas.style.opacity = '1'; spawn();
    animId = requestAnimationFrame(draw);
    setTimeout(stop, 3500);
  };
})();

/* ── CHANGELOG TOGGLE ───────────────────────────────────────── */
function toggleCL(header) {
  const body = header.nextElementSibling;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  header.setAttribute('aria-expanded', String(!isOpen));
}

/* ── FAQ TOGGLE ─────────────────────────────────────────────── */
function toggleFAQ(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = answer.classList.contains('open');
  document.querySelectorAll('.faq-a.open').forEach(a => {
    a.classList.remove('open');
    a.previousElementSibling.setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) { answer.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
}

/* ═══ LIVE MAP ═══════════════════════════════════════════════ */
const DYNMAP_HTTPS = 'https://map.cr3scent.asia';
const DYNMAP_HTTP  = 'http://premium3.raehost.com:19321';

let mapOpen   = false;
let mapLoaded = false;
let touchStartY = 0;
let mapWorkerReady = null;

const mapLightbox    = document.getElementById('mapLightbox');
const mapSheet       = document.getElementById('mapSheet');
const mapIframe      = document.getElementById('mapIframe');
const mapLoading     = document.getElementById('mapLoading');
const mapLoadingMsg  = document.getElementById('mapLoadingMsg');
const mapPlayerCount = document.getElementById('mapPlayerCount');
const mapExternalBtn = document.getElementById('mapExternalBtn');
const mapPlayerList  = document.getElementById('mapPlayerList');
const heroPlayersWrap = document.getElementById('heroPlayersWrap');

async function probeWorker() {
  if (mapWorkerReady !== null) return mapWorkerReady;
  try {
    const res = await fetch(`${DYNMAP_HTTPS}/up/world/world/0`, {
      signal: AbortSignal.timeout(5000), mode: 'cors'
    });
    mapWorkerReady = res.ok;
  } catch { mapWorkerReady = true; }
  return mapWorkerReady;
}

async function openMapFull() {
  mapLightbox.classList.add('open');
  mapLightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  mapOpen = true;
  setTimeout(() => mapSheet.querySelector('.map-lb-btn')?.focus(), 60);

  if (!mapLoaded) {
    mapLoaded = true;
    if (mapLoadingMsg) mapLoadingMsg.textContent = 'Memuat peta dunia…';
    mapIframe.src = DYNMAP_HTTPS;
    mapIframe.onload = () => {
      mapIframe.classList.add('loaded');
      if (mapLoading) mapLoading.classList.add('hidden');
    };
    setTimeout(() => {
      mapIframe.classList.add('loaded');
      if (mapLoading) mapLoading.classList.add('hidden');
    }, 8000);
  }
}

function closeMapFull() {
  mapLightbox.classList.remove('open');
  mapLightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  mapOpen = false;
}

if (mapSheet) {
  mapSheet.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
  mapSheet.addEventListener('touchend', e => {
    if (e.changedTouches[0].clientY - touchStartY > 80) closeMapFull();
  }, { passive: true });
}

/* ── PLAYER CHIP BUILDER ────────────────────────────────────── */
function buildPlayerChips(players) {
  if (!players.length) return '';
  return `<div class="map-players-label">Sedang Online</div>` +
    players.map(p => {
      const name = p.name || p.account || '???';
      return `<div class="map-player-chip">
        <div class="map-player-avatar">
          <img src="https://mc-heads.net/avatar/${name}/20" alt="${name}" loading="lazy" onerror="this.style.display='none'">
        </div>${name}</div>`;
    }).join('');
}

function buildHeroPlayers(players) {
  if (!players.length) return '';
  return `<div class="hero-players-inner">
    <div class="hero-players-label">Online Sekarang</div>
    ${players.map(p => {
      const name = p.name || p.account || '???';
      return `<div class="map-player-chip">
        <div class="map-player-avatar">
          <img src="https://mc-heads.net/avatar/${name}/20" alt="${name}" loading="lazy" onerror="this.style.display='none'">
        </div>${name}</div>`;
    }).join('')}
  </div>`;
}

/* ── FETCH & RENDER PLAYERS ─────────────────────────────────── */
async function fetchAndRenderPlayers() {
  try {
    const res = await fetch(`${DYNMAP_HTTPS}/up/world/world/0`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const players = data.players || [];

    // map player count label
    if (mapPlayerCount) {
      mapPlayerCount.textContent = players.length > 0
        ? `${players.length} pemain online`
        : '0 pemain online';
    }

    // map card player list (below map preview, above meta)
    if (mapPlayerList) {
      mapPlayerList.innerHTML = players.length ? buildPlayerChips(players) : '';
    }

    // hero player list (below IP card)
    if (heroPlayersWrap) {
      heroPlayersWrap.innerHTML = players.length ? buildHeroPlayers(players) : '';
    }

    mapWorkerReady = true;
    if (mapExternalBtn) mapExternalBtn.href = DYNMAP_HTTPS;
  } catch {
    if (mapPlayerCount) mapPlayerCount.textContent = '— pemain online';
    if (mapPlayerList) mapPlayerList.innerHTML = '';
    if (heroPlayersWrap) heroPlayersWrap.innerHTML = '';
  }
}

// run immediately and on interval
fetchAndRenderPlayers();
setInterval(fetchAndRenderPlayers, 15000);

/* ── MAP MINI IFRAME LOADER ─────────────────────────── */
(function() {
  const mini = document.getElementById('mapMiniIframe');
  const grid = document.getElementById('mapPreviewGrid');
  if (!mini) return;
  setTimeout(() => {
    mini.onload = () => {
      mini.classList.add('mini-loaded');
      if (grid) grid.classList.add('hidden');
    };
    setTimeout(() => {
      mini.classList.add('mini-loaded');
      if (grid) grid.classList.add('hidden');
    }, 5000);
    mini.src = 'https://map.cr3scent.asia';
  }, 2000);
})();

/* ── SCROLL PROGRESS + BACK TO TOP ─────────────────────────── */
const scrollProgress = document.getElementById('scrollProgress');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollProgress) scrollProgress.style.width = (scrolled / total * 100) + '%';
  if (backToTop) backToTop.classList.toggle('visible', scrolled > 300);
}, { passive: true });

/* ════════════════════════════════════════════════════════════
   ENGAGEMENT FEATURES v1.4
   – Live age ticker
   – Web Share API
   – Keyboard shortcuts
   – Mouse parallax hero
   – Floating quick bar
   – Mobile bottom nav active state
   – Discord member count
════════════════════════════════════════════════════════════ */

/* ── LIVE AGE TICKER ─────────────────────────────────────── */
(function initAgeTicker() {
  const LAUNCH = new Date('2026-03-19T00:00:00+07:00').getTime();
  const elDays  = document.getElementById('tickDays');
  const elHours = document.getElementById('tickHours');
  const elMins  = document.getElementById('tickMins');
  const elSecs  = document.getElementById('tickSecs');
  if (!elDays) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = Date.now() - LAUNCH;
    if (diff < 0) return;
    const totalSecs = Math.floor(diff / 1000);
    const days  = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins  = Math.floor((totalSecs % 3600) / 60);
    const secs  = totalSecs % 60;
    elDays.textContent  = days;
    elHours.textContent = pad(hours);
    elMins.textContent  = pad(mins);
    elSecs.textContent  = pad(secs);
  }
  tick();
  setInterval(tick, 1000);
})();

/* ── WEB SHARE API ───────────────────────────────────────── */
(function initShare() {
  const btn = document.getElementById('shareBtn');
  if (btn && navigator.share) {
    btn.classList.add('supported');
  }
})();

function shareServer() {
  const data = {
    title: 'Cr3scent · Minecraft Survival RPG',
    text: 'Main bareng di Cr3scent! Server Minecraft crossplay Java & Bedrock. IP: mc.cr3scent.asia',
    url: 'https://cr3scent.asia'
  };
  if (navigator.share) {
    navigator.share(data).catch(() => {});
  } else {
    // Fallback: copy URL
    const ok = () => showToast('Link copied to clipboard!');
    const fail = () => showToast('https://cr3scent.asia', 'error');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText('https://cr3scent.asia').then(ok).catch(fail);
    } else {
      try { legacyCopy('https://cr3scent.asia'); ok(); } catch { fail(); }
    }
  }
}

/* ── FLOATING QUICK BAR ──────────────────────────────────── */
(function initFloatBar() {
  const bar = document.getElementById('floatBar');
  if (!bar) return;
  let heroBottom = 0;

  function measureHero() {
    const hero = document.getElementById('home');
    if (hero) heroBottom = hero.offsetTop + hero.offsetHeight;
  }
  measureHero();
  window.addEventListener('resize', measureHero, { passive: true });

  window.addEventListener('scroll', () => {
    const visible = window.scrollY > heroBottom - 100;
    bar.classList.toggle('visible', visible);
  }, { passive: true });
})();

/* ── KEYBOARD SHORTCUTS ──────────────────────────────────── */
(function initKeyboard() {
  // Only on desktop (pointer:fine)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const hint = document.getElementById('kbHint');
  const modal = document.getElementById('kbModal');
  const backdrop = document.getElementById('kbBackdrop');

  // Show hint after 3s
  setTimeout(() => { if (hint) hint.classList.add('visible'); }, 3000);

  function openKbModal() {
    if (!modal) return;
    modal.classList.add('open');
    backdrop.classList.add('open');
    if (hint) hint.classList.remove('visible');
    setTimeout(() => modal.querySelector('button')?.focus(), 80);
  }
  function closeKbModal() {
    modal?.classList.remove('open');
    backdrop?.classList.remove('open');
  }
  window.closeKbModal = closeKbModal;

  document.addEventListener('keydown', e => {
    // Skip if user is typing
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
    // Skip if modifier key
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    switch (e.key.toLowerCase()) {
      case 'c': copyIP(); break;
      case 'd': window.open('https://discord.gg/sSEARcnb2T', '_blank', 'noopener'); showToast('Opening Discord…'); break;
      case 'm': openMapFull(); break;
      case 's': shareServer(); break;
      case 'f': openInfoPanel('features'); break;
      case 't': toggleTheme(); break;
      case '?': openKbModal(); break;
      case 'escape':
        closeKbModal();
        closeInfoPanel();
        if (mapOpen) closeMapFull();
        closeDrawer();
        closeSpecsModal();
        closeWelcome();
        break;
    }
  });
})();

/* ── MOUSE PARALLAX ON HERO ──────────────────────────────── */
(function initParallax() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const hero = document.querySelector('.hero');
  const title = document.querySelector('.hero-title');
  const sub = document.querySelector('.hero-sub');
  const eyebrow = document.querySelector('.hero-eyebrow');
  const ticker = document.querySelector('.hero-age-ticker');
  if (!hero || !title) return;

  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  let active = false;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    // -1 to 1 range
    targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    active = true;
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0;
    active = true;
  });

  (function loop() {
    const ease = 0.06;
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;

    if (Math.abs(currentX) > 0.0005 || Math.abs(currentY) > 0.0005 || active) {
      const tx = currentX * 10;
      const ty = currentY * 8;
      const tx2 = currentX * 6;
      const ty2 = currentY * 5;

      title.style.transform = `translate(${tx}px, ${ty}px)`;
      if (sub) sub.style.transform = `translate(${tx2 * .6}px, ${ty2 * .6}px)`;
      if (eyebrow) eyebrow.style.transform = `translate(${tx2 * .3}px, ${ty2 * .3}px)`;
      if (ticker) ticker.style.transform = `translate(${tx2 * .2}px, ${ty2 * .2}px)`;

      if (Math.abs(currentX - targetX) < 0.0001 && Math.abs(currentY - targetY) < 0.0001) {
        active = false;
      }
    }
    requestAnimationFrame(loop);
  })();
})();

/* ── MOBILE BOTTOM NAV ACTIVE STATE ──────────────────────── */
(function initMobileBottomNav() {
  const items = document.querySelectorAll('.mbn-item[data-section]');
  if (!items.length) return;

  const sections = document.querySelectorAll('section[id]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        items.forEach(item => {
          item.classList.toggle('active', item.dataset.section === e.target.id);
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => obs.observe(s));
})();

/* ── SCROLL-DRIVEN HERO PARALLAX ─────────────────────────── */
(function initScrollParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip mobile

  const hero = document.querySelector('.hero');
  const canvas = document.getElementById('particle-canvas');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const heroH = hero.offsetHeight;
    if (y > heroH) return;
    const ratio = y / heroH; // 0–1

    // Particles drift up
    if (canvas) canvas.style.transform = `translateY(${y * 0.3}px)`;
    // Subtle opacity fade on scroll
    hero.style.opacity = 1 - ratio * 0.4;
  }, { passive: true });
})();
