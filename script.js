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

// Focus trap inside drawer
mobileDrawer.addEventListener('keydown', e => {
  if (!drawerOpen || e.key !== 'Tab') return;
  const focusable = [...mobileDrawer.querySelectorAll('a, button')];
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ── ESC ────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeDrawer(); closeSpecsModal(); closeWelcome(); }
});

/* ── RESIZE ─────────────────────────────────────────────────── */
window.addEventListener('resize', () => {
  if (window.innerWidth > 960 && drawerOpen) closeDrawer();
}, { passive: true });

/* ── SCROLL REVEAL ──────────────────────────────────────────── */
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      e.target._revealObs?.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' })
.observe && (() => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
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

/* ── CUSTOM CURSOR ──────────────────────────────────────────── */
(() => {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const dot = document.getElementById('curDot');
  const ring = document.getElementById('curRing');
  let mx = -200, my = -200, rx = -200, ry = -200;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function lerp(a, b, t) { return a + (b - a) * t; }
  (function tick() {
    rx = lerp(rx, mx, .15); ry = lerp(ry, my, .15);
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(tick);
  })();

  const hoverSel = 'a, button, [role="button"], [tabindex="0"], .ip-card, .strip-item, .join-card, .feature-card, .video-box, .modal-close, .plugin-row, .stat-card';
  document.querySelectorAll(hoverSel).forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('h'); ring.classList.add('h'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('h'); ring.classList.remove('h'); });
  });
  document.addEventListener('mousedown', () => dot.classList.add('c'));
  document.addEventListener('mouseup',   () => dot.classList.remove('c'));
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
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
  const ok = () => { el.textContent = '✓ Copied!'; showToast('IP address copied!'); setTimeout(() => el.textContent = orig, 2200); if (window._launchConfetti) window._launchConfetti(); };
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
  stxt.textContent = '\u2026'; dot.className = 'status-dot';
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

// Focus trap
specsModal.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const f = [...specsModal.querySelectorAll('button, a, [tabindex="0"]')];
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ── TIKTOK ─────────────────────────────────────────────────── */
function openTikTok() {
  window.open('https://www.tiktok.com/@cr3scentdc', '_blank', 'noopener,noreferrer');
  showToast('Opening TikTok @cr3scentdc\u2026');
}

function openTutorialVideo() {
  window.open('https://youtube.com/shorts/IcPVN8Zms3E', '_blank', 'noopener,noreferrer');
  showToast('Opening tutorial di YouTube\u2026');
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
  if (dontShow && dontShow.checked) {
    localStorage.setItem('cr3-welcome-seen', '1');
  }
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
  } else {
    try { legacyCopy(ip); ok(); } catch { fail(); }
  }
}

function copyPortPopup() {
  const port = '25655';
  const ok = () => showToast('Port copied: ' + port);
  const fail = () => showToast('Port: ' + port, 'error');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(port).then(ok).catch(fail);
  } else {
    try { legacyCopy(port); ok(); } catch { fail(); }
  }
}

// Focus trap inside welcome modal
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

  // Show welcome popup — only once (localStorage gate)
  const seen = localStorage.getItem('cr3-welcome-seen');
  if (!seen) {
    // Small delay so page loader finishes first
    setTimeout(openWelcome, 1400);
  }

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
/* ── COUNTER ANIMASI ────────────────────────────────────────── */
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

// Trigger counters when stats section scrolls into view
(() => {
  const stats = document.querySelectorAll('.stat-num[data-target]');
  if (!stats.length) return;
  let triggered = false;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !triggered) {
        triggered = true;
        stats.forEach(el => {
          const target = parseFloat(el.dataset.target);
          const suffix = el.dataset.suffix || '';
          if (!isNaN(target)) animateCounter(el, target, suffix);
        });
        obs.disconnect();
      }
    });
  }, { threshold: 0.5 });
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) obs.observe(statsSection);
})();

/* ── CONFETTI ────────────────────────────────────────────────── */
(() => {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let pieces = [], animId = null, running = false;

  const COLORS = ['#c9a84c','#e0c06a','#ffffff','#30d158','#5865F2','#ff9500'];
  const COUNT = window.innerWidth < 600 ? 60 : 120;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  function spawn() {
    pieces = [];
    for (let i = 0; i < COUNT; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 200,
        w: 6 + Math.random() * 8,
        h: 3 + Math.random() * 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - .5) * .15,
        vx: (Math.random() - .5) * 3,
        vy: 2 + Math.random() * 4,
        opacity: 1,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach(p => {
      if (p.y > canvas.height + 20) return;
      alive = true;
      p.x += p.vx; p.y += p.vy;
      p.rot += p.rotV;
      p.vy += .06; // gravity
      if (p.y > canvas.height * .6) p.opacity = Math.max(0, p.opacity - .015);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (alive) { animId = requestAnimationFrame(draw); }
    else { stop(); }
  }

  function stop() {
    running = false;
    canvas.style.opacity = '0';
    cancelAnimationFrame(animId);
    setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 400);
  }

  window._launchConfetti = function() {
    if (running) return;
    running = true;
    canvas.style.opacity = '1';
    spawn();
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
  // Close all other open FAQs
  document.querySelectorAll('.faq-a.open').forEach(a => {
    a.classList.remove('open');
    a.previousElementSibling.setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) {
    answer.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

/* ═══ LIVE MAP ═══════════════════════════════════════════════ */
// Primary: HTTPS subdomain via Cloudflare Worker (no mixed content)
// Fallback: direct HTTP (works only if user opens in new tab)
const DYNMAP_HTTPS = 'https://map.cr3scent.asia';
const DYNMAP_HTTP  = 'http://premium3.raehost.com:19321';

let mapOpen   = false;
let mapLoaded = false;
let touchStartY = 0;
let mapWorkerReady = null; // null = unknown, true/false after probe

const mapLightbox    = document.getElementById('mapLightbox');
const mapSheet       = document.getElementById('mapSheet');
const mapIframe      = document.getElementById('mapIframe');
const mapLoading     = document.getElementById('mapLoading');
const mapLoadingMsg  = document.getElementById('mapLoadingMsg');
const mapPlayerCount = document.getElementById('mapPlayerCount');
const mapExternalBtn = document.getElementById('mapExternalBtn');

// Worker confirmed live at map.cr3scent.asia — always use HTTPS
async function probeWorker() {
  if (mapWorkerReady !== null) return mapWorkerReady;
  try {
    const res = await fetch(`${DYNMAP_HTTPS}/up/world/world/0`, {
      signal: AbortSignal.timeout(5000),
      mode: 'cors'
    });
    mapWorkerReady = res.ok;
  } catch {
    // If fetch fails (CORS etc), still try embedding — worker is confirmed live
    mapWorkerReady = true;
  }
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

    // Always load HTTPS worker iframe directly
    mapIframe.src = DYNMAP_HTTPS;
    mapIframe.onload = () => {
      mapIframe.classList.add('loaded');
      if (mapLoading) mapLoading.classList.add('hidden');
    };
    // Fallback hide loader after 8s regardless
    setTimeout(() => {
      mapIframe.classList.add('loaded');
      if (mapLoading) mapLoading.classList.add('hidden');
    }, 8000);
  }
}

function showMapFallback() {
  if (mapLoading) {
    mapLoading.innerHTML = `
      <div class="map-loading-inner">
        <div style="font-size:2.4rem;line-height:1">🗺️</div>
        <div style="color:var(--gold);font-weight:600;font-size:.95rem">Peta belum bisa di-embed</div>
        <div style="color:var(--muted);font-size:.8rem;text-align:center;max-width:260px;line-height:1.5">
          Cloudflare Worker belum aktif.<br>Buka peta di tab baru untuk sementara.
        </div>
        <a href="${DYNMAP_HTTP}" target="_blank" rel="noopener noreferrer"
           class="btn btn-gold" style="margin-top:6px;font-size:.82rem;padding:10px 20px;text-decoration:none;display:inline-flex;align-items:center;gap:8px;border-radius:12px">
          <i class="ph ph-arrow-square-out"></i> Buka Peta Sekarang
        </a>
      </div>`;
  }
}

function closeMapFull() {
  mapLightbox.classList.remove('open');
  mapLightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  mapOpen = false;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mapOpen) closeMapFull();
});

if (mapSheet) {
  mapSheet.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  mapSheet.addEventListener('touchend', e => {
    if (e.changedTouches[0].clientY - touchStartY > 80) closeMapFull();
  }, { passive: true });
}

// Live player count from Dynmap JSON API
async function fetchMapPlayers() {
  if (!mapPlayerCount) return;
  try {
    // Try HTTPS worker first, fall back to HTTP (CORS-friendly for JSON)
    const base = (await probeWorker()) ? DYNMAP_HTTPS : DYNMAP_HTTP;
    const res = await fetch(`${base}/up/world/world/0`, {
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const count = (data.players || []).length;
    mapPlayerCount.textContent = `${count} pemain online`;
  } catch {
    mapPlayerCount.textContent = '— pemain online';
  }
}

// Update external button href based on worker availability
async function updateExternalBtn() {
  if (!mapExternalBtn) return;
  const ok = await probeWorker();
  mapExternalBtn.href = ok ? DYNMAP_HTTPS : DYNMAP_HTTP;
}

// Init — fetch players immediately using HTTPS
async function fetchAndRenderPlayersDirect() {
  if (!mapPlayerCount && !mapPlayerList) return;
  try {
    const res = await fetch(`${DYNMAP_HTTPS}/up/world/world/0`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const players = data.players || [];

    if (mapPlayerCount) {
      mapPlayerCount.textContent = players.length > 0
        ? `${players.length} pemain online`
        : '0 pemain online';
    }
    if (mapPlayerList) {
      if (players.length === 0) { mapPlayerList.innerHTML = ''; return; }
      mapPlayerList.innerHTML = `<div class="map-players-label">Sedang Online</div>` +
        players.map(p => {
          const name = p.name || p.account || '???';
          return `<div class="map-player-chip">
            <div class="map-player-avatar">
              <img src="https://mc-heads.net/avatar/${name}/20" alt="${name}" loading="lazy" onerror="this.style.display='none'">
            </div>${name}</div>`;
        }).join('');
    }
    mapWorkerReady = true;
    if (mapExternalBtn) mapExternalBtn.href = DYNMAP_HTTPS;
  } catch {
    if (mapPlayerCount) mapPlayerCount.textContent = '— pemain online';
  }
}

fetchAndRenderPlayersDirect();
setInterval(fetchAndRenderPlayersDirect, 15000);

/* ── MAP MINI IFRAME LOADER ─────────────────────────── */
(function() {
  const mini = document.getElementById('mapMiniIframe');
  const grid = document.getElementById('mapPreviewGrid');
  if (!mini) return;

  // Load mini iframe after page settles (don't block main content)
  setTimeout(() => {
    mini.onload = () => {
      mini.classList.add('mini-loaded');
      if (grid) grid.classList.add('hidden');
    };
    // Cross-origin iframe won't fire onload reliably — fallback
    setTimeout(() => {
      mini.classList.add('mini-loaded');
      if (grid) grid.classList.add('hidden');
    }, 5000);
    mini.src = 'https://map.cr3scent.asia';
  }, 2000);
})();

/* ═══ SCROLL PROGRESS + BACK TO TOP ════════════════════════ */
const scrollProgress = document.getElementById('scrollProgress');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollProgress) scrollProgress.style.width = (scrolled / total * 100) + '%';
  if (backToTop) backToTop.classList.toggle('visible', scrolled > 300);
}, { passive: true });

/* ═══ ONLINE PLAYER LIST ════════════════════════════════════ */
const mapPlayerList = document.getElementById('mapPlayerList');

async function fetchAndRenderPlayers() {
  if (!mapPlayerCount && !mapPlayerList) return;
  try {
    const base = (await probeWorker()) ? DYNMAP_HTTPS : DYNMAP_HTTP;
    const res = await fetch(`${base}/up/world/world/0`, {
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const players = data.players || [];

    // Update count
    if (mapPlayerCount) {
      mapPlayerCount.textContent = players.length > 0
        ? `${players.length} pemain online`
        : '0 pemain online';
    }

    // Render player chips
    if (mapPlayerList) {
      if (players.length === 0) {
        mapPlayerList.innerHTML = '';
        return;
      }
      mapPlayerList.innerHTML = `<div class="map-players-label">Sedang Online</div>` +
        players.map(p => {
          const name = p.name || p.account || '???';
          const avatarUrl = `https://mc-heads.net/avatar/${name}/20`;
          return `<div class="map-player-chip">
            <div class="map-player-avatar">
              <img src="${avatarUrl}" alt="${name}" loading="lazy"
                   onerror="this.style.display='none'">
            </div>
            ${name}
          </div>`;
        }).join('');
    }
  } catch {
    if (mapPlayerCount) mapPlayerCount.textContent = '— pemain online';
    if (mapPlayerList) mapPlayerList.innerHTML = '';
  }
}

// Override fetchMapPlayers with the new combined function
probeWorker().then(() => {
  updateExternalBtn();
  fetchAndRenderPlayers();
});
setInterval(fetchAndRenderPlayers, 15000);
