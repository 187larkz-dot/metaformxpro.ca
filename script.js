/* =================================================================
   MetaFormX Pro — WoodShield & WoodWash
   Script v3.0 | 2026
   ================================================================= */

'use strict';

/* ─────────────────────────────────────────────
   DOM READY
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollAnimations();
  initCalculator();
  initNavHighlight();
  initSliderGradient();
});


/* ─────────────────────────────────────────────
   1. HEADER — scroll effect
───────────────────────────────────────────── */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}


/* ─────────────────────────────────────────────
   2. MOBILE MENU
───────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('mobile-drawer');
  const overlay   = document.getElementById('drawer-overlay');
  if (!hamburger || !drawer || !overlay) return;

  const mobLinks = document.querySelectorAll('.mob-link');

  const open  = () => {
    hamburger.classList.add('open');
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
  };

  const close = () => {
    hamburger.classList.remove('open');
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  };

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? close() : open();
  });

  overlay.addEventListener('click', close);

  mobLinks.forEach(link => link.addEventListener('click', close));

  // Close on ESC
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}


/* ─────────────────────────────────────────────
   3. SCROLL-TRIGGERED ANIMATIONS (AOS-like)
───────────────────────────────────────────── */
function initScrollAnimations() {
  const els = document.querySelectorAll(
    '.aos-fade-up, .aos-fade-right, .aos-fade-left'
  );

  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  els.forEach(el => io.observe(el));
}


/* ─────────────────────────────────────────────
   4. CALCULATOR
───────────────────────────────────────────── */
function initCalculator() {
  const slider       = document.getElementById('surface-slider');
  const surfaceVal   = document.getElementById('surface-val');
  const panelsNum    = document.getElementById('panels-num');
  const resVolume    = document.getElementById('res-volume');
  const resJugs      = document.getElementById('res-jugs');
  const resSprays    = document.getElementById('res-sprays');
  const calcSavings  = document.getElementById('calc-savings');

  if (!slider) return;

  // ─── Constantes basées sur les données réelles du produit ───────────────────
  // WoodShield : 200 pi²/gallon = 52.84 pi²/L théorique
  //              Mesuré réel   : 120L pour 10 000 pi²  → 83.33 pi²/L
  //              0.20 L par panneau (2'×8'6" = 17 pi²) → 85 pi²/L  ✓ cohérent
  const COVERAGE_PER_LITRE = 83.33;  // pi²/L  (usage réel WoodShield)
  const WOODWASH_COVERAGE  = 178.57; // pi²/L  (56L pour 10 000 pi²)
  const PANEL_AREA         = 17;     // pi²    (2 pi × 8 pi 6 po = 17 pi²)
  // Économies : 10 000 pi² traités = 196 000$ sur 5 ans → 19.60$/pi²
  const SAVINGS_PER_SQFT   = 19.60;  // $/pi²  d'économie sur 5 ans

  function calcAll(surface) {
    const panels     = Math.ceil(surface / PANEL_AREA);         // nombre de panneaux
    const litres     = Math.ceil(surface / COVERAGE_PER_LITRE); // litres WoodShield
    const jugs       = Math.ceil(litres / 20);                  // seaux 20L
    const washLitres = Math.ceil(surface / WOODWASH_COVERAGE);  // litres WoodWash
    const sprays     = surface > 500 ? Math.ceil(surface / 500) : 0; // vaporisateurs 1L
    const savings    = Math.round(surface * SAVINGS_PER_SQFT);  // $ sur 5 ans

    return { panels, litres, jugs, washLitres, sprays, savings };
  }

  function fmt(n, suffix = '') {
    return n.toLocaleString('fr-CA') + (suffix ? ' ' + suffix : '');
  }

  function formatMoney(n) {
    return n.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
  }

  function update() {
    const surface = parseInt(slider.value, 10);
    const { panels, litres, jugs, washLitres, sprays, savings } = calcAll(surface);

    // Update displays
    if (surfaceVal)  surfaceVal.textContent  = fmt(surface, 'pi²');
    if (panelsNum)   panelsNum.textContent   = fmt(panels);
    if (resVolume)   resVolume.textContent   = litres + ' L';
    if (resJugs)     resJugs.textContent     = jugs + (jugs > 1 ? ' seaux' : ' seau');
    if (resSprays)   resSprays.textContent   = sprays + (sprays > 1 ? ' bouteilles' : ' bouteille');
    if (calcSavings) calcSavings.textContent = formatMoney(savings);

    // Update WoodWash display if present
    const resWash = document.getElementById('res-wash');
    if (resWash) resWash.textContent = washLitres + ' L';

    // Update slider gradient
    const pct = ((surface - +slider.min) / (+slider.max - +slider.min)) * 100;
    slider.style.background = `linear-gradient(to right, var(--orange) 0%, var(--orange) ${pct}%, rgba(255,255,255,.1) ${pct}%, rgba(255,255,255,.1) 100%)`;
  }

  slider.addEventListener('input', update);
  update(); // initial

  // Calculator CTA scrolls to contact
  const calcCta = document.getElementById('calc-cta-btn');
  if (calcCta) {
    calcCta.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}


/* ─────────────────────────────────────────────
   5. SLIDER GRADIENT (also called in update)
───────────────────────────────────────────── */
function initSliderGradient() {
  const slider = document.getElementById('surface-slider');
  if (!slider) return;

  const setGradient = () => {
    const pct = ((+slider.value - +slider.min) / (+slider.max - +slider.min)) * 100;
    slider.style.background = `linear-gradient(to right, var(--orange) 0%, var(--orange) ${pct}%, rgba(255,255,255,.1) ${pct}%, rgba(255,255,255,.1) 100%)`;
  };

  slider.addEventListener('input', setGradient);
  setGradient();
}


/* ─────────────────────────────────────────────
   6. NAV HIGHLIGHT on scroll
───────────────────────────────────────────── */
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a');
  if (!sections.length || !navLinks.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.35, rootMargin: '-80px 0px -50% 0px' }
  );

  sections.forEach(s => io.observe(s));
}
