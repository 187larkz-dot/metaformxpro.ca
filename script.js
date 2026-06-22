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
  initStripeModal();
  initStickyPurchaseBar();
  initContactForm();
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
    const washLitres = Math.ceil(surface / WOODWASH_COVERAGE);  // litres WoodWash
    const savings    = Math.round(surface * SAVINGS_PER_SQFT);  // $ sur 5 ans

    return { panels, litres, washLitres, savings };
  }

  const isEn = document.documentElement.lang.startsWith('en');

  function fmt(n, suffix = '') {
    return n.toLocaleString(isEn ? 'en-CA' : 'fr-CA') + (suffix ? ' ' + suffix : '');
  }

  function formatMoney(n) {
    return n.toLocaleString(isEn ? 'en-CA' : 'fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
  }

  function update() {
    const surface = parseInt(slider.value, 10);
    const { panels, litres, washLitres, savings } = calcAll(surface);

    // Update displays
    if (surfaceVal)  surfaceVal.textContent  = fmt(surface, isEn ? 'sq ft' : 'pi²');
    if (panelsNum)   panelsNum.textContent   = fmt(panels);
    if (resVolume)   resVolume.textContent   = litres + ' L';
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

/* ─────────────────────────────────────────────
   7. STRIPE PAYMENT MODAL INTEGRATION
   ───────────────────────────────────────────── */
// Stripe Checkout Links for each product
const STRIPE_PRODUCT_URLS = {
  woodshield:   'https://buy.stripe.com/bJe7sEd3l52o4W84T31B604',
  woodwash:     'https://buy.stripe.com/4gMcMY8N50M84W8adn1B603',
  biopaneloil:  'https://buy.stripe.com/9B6aEQ6EX1Qc60cdpz1B605' // Wood Release BIO
};

// Global variables for Stripe checkout state
let selectedProduct = 'woodshield';
let selectedQty = 1;

// Price mapping (in CAD)
const productPrices = {
  woodshield: 295.00,
  woodwash: 195.00,
  biopaneloil: 55.95
};

// Pre-select product in modal and update UI styling
function selectProduct(productKey) {
  selectedProduct = productKey;
  
  // Update selected class in DOM cards
  const cards = document.querySelectorAll('.smodal-product');
  cards.forEach(card => {
    const cardProd = card.getAttribute('data-product');
    if (cardProd === productKey) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
  
  // Update modal active theme attribute for dynamic brand styling
  const modal = document.getElementById('stripe-modal');
  if (modal) {
    modal.setAttribute('data-active-theme', productKey);
  }
  
  // Update subtotal
  updateSubtotal();
}

// Update quantity state and UI value
function updateQuantity(newQty) {
  if (newQty < 1) newQty = 1;
  if (newQty > 99) newQty = 99; // safety limit
  
  selectedQty = newQty;
  
  const qtyVal = document.getElementById('smodal-qty-val');
  if (qtyVal) {
    qtyVal.textContent = selectedQty;
  }
  
  // Update subtotal
  updateSubtotal();
}

// Compute and format subtotal, and update Stripe Checkout button href
function updateSubtotal() {
  const price = productPrices[selectedProduct] || 0;
  const subtotal = price * selectedQty;
  
  const isEn = document.documentElement.lang.startsWith('en');
  
  // Format subtotal based on language
  const subtotalEl = document.getElementById('smodal-subtotal');
  if (subtotalEl) {
    subtotalEl.textContent = subtotal.toLocaleString(isEn ? 'en-CA' : 'fr-CA', { 
      style: 'currency', 
      currency: 'CAD', 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }
  
  // Update checkout button href with quantity query parameter
  const checkoutBtn = document.getElementById('smodal-checkout-btn');
  if (checkoutBtn) {
    const baseUrl = STRIPE_PRODUCT_URLS[selectedProduct] || STRIPE_PRODUCT_URLS['woodshield'];
    // Append Stripe parameters. Stripe payment links support ?quantity=X
    checkoutBtn.href = `${baseUrl}?quantity=${selectedQty}`;
  }
}

// Global function to open modal (called from inline onclick attributes in products)
window.openStripeModal = function(productKey) {
  const overlay = document.getElementById('stripe-modal-overlay');
  if (!overlay) return;
  
  // Select clicked product
  selectProduct(productKey);
  
  // Reset quantity to 1
  updateQuantity(1);
  
  // Open modal with smooth transition
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
};

// Global function to close modal
window.closeStripeModal = function() {
  const overlay = document.getElementById('stripe-modal-overlay');
  if (!overlay) return;
  
  overlay.classList.remove('active');
  document.body.style.overflow = '';
};

// Initialisation inside DOMContentLoaded
function initStripeModal() {
  const overlay = document.getElementById('stripe-modal-overlay');
  const closeBtn = document.getElementById('smodal-close');
  const plusBtn = document.getElementById('smodal-qty-plus');
  const minusBtn = document.getElementById('smodal-qty-minus');
  const productCards = document.querySelectorAll('.smodal-product');
  
  if (!overlay) return;
  
  // Close button click
  if (closeBtn) {
    closeBtn.addEventListener('click', window.closeStripeModal);
  }
  
  // Overlay background click (close modal if clicked outside)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      window.closeStripeModal();
    }
  });
  
  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      window.closeStripeModal();
    }
  });
  
  // Product card click selectors in modal
  productCards.forEach(card => {
    card.addEventListener('click', () => {
      const productKey = card.getAttribute('data-product');
      selectProduct(productKey);
    });
  });
  
  // Quantity Plus button
  if (plusBtn) {
    plusBtn.addEventListener('click', () => {
      updateQuantity(selectedQty + 1);
    });
  }
  
  // Quantity Minus button
  if (minusBtn) {
    minusBtn.addEventListener('click', () => {
      updateQuantity(selectedQty - 1);
    });
  }
  
  // Initialize subtotal once on load
  updateSubtotal();
}

/* ─────────────────────────────────────────────
   8. STICKY FLOATING PURCHASE BAR
   ───────────────────────────────────────────── */
function initStickyPurchaseBar() {
  const bar = document.getElementById('sticky-purchase-bar');
  const closeBtn = document.getElementById('spb-close');
  const buyBtn = document.getElementById('spb-buy-btn');
  const prodImg = document.getElementById('spb-prod-img');
  const prodTitle = document.getElementById('spb-prod-title');
  const prodFormat = document.getElementById('spb-prod-format');
  const prodPrice = document.getElementById('spb-prod-price');

  if (!bar || !buyBtn) return;

  const isEn = document.documentElement.lang.startsWith('en');
  const products = {
    woodshield: {
      name: "WoodShield",
      format: isEn ? "Commercial 20 L Pail" : "Seau commercial 20 L",
      price: isEn ? "$295.95" : "295,95 $",
      image: "wood shield presentation good.png"
    },
    woodwash: {
      name: "WoodWash",
      format: isEn ? "1 L Sprayer" : "Vaporisateur 1 L",
      price: isEn ? "$35.95" : "35,95 $",
      image: "WoodWash descriptif Good.png"
    },
    biopaneloil: {
      name: "Wood Release BIO",
      format: isEn ? "20 L Pail" : "Seau 20 L",
      price: isEn ? "$69.95" : "69,95 $",
      image: "Wood release bio good.png"
    }
  };

  let activeProduct = 'woodshield';
  let isDismissed = false;

  // Close button click handler
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      isDismissed = true;
      bar.classList.remove('active');
    });
  }

  // Redirect to the shop page with the active product as query parameter
  buyBtn.addEventListener('click', () => {
    const page = isEn ? 'boutique-en.html' : 'boutique.html';
    window.location.href = `${page}?add=${activeProduct}`;
  });

  const sections = [
    { id: 'woodshield', key: 'woodshield' },
    { id: 'woodwash', key: 'woodwash' },
    { id: 'biopaneloil', key: 'biopaneloil' }
  ];

  function updateBarProduct() {
    if (isDismissed) return;

    const viewportHeight = window.innerHeight;

    // Find which product section is closest to the center of the viewport
    let currentActive = activeProduct;
    let minDistance = Infinity;

    sections.forEach(sec => {
      const el = document.getElementById(sec.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - viewportHeight / 2);
        if (distance < minDistance) {
          minDistance = distance;
          currentActive = sec.key;
        }
      }
    });

    // Update bar info if active product changed
    if (activeProduct !== currentActive) {
      activeProduct = currentActive;
      const pInfo = products[activeProduct];

      // Smooth content swap with a quick fade
      bar.style.transition = 'transform 0.5s var(--ease-prem), opacity 0.4s var(--ease), border-color 0.35s var(--ease), box-shadow 0.35s var(--ease)';

      if (prodImg) prodImg.src = pInfo.image;
      if (prodTitle) prodTitle.textContent = pInfo.name;
      if (prodFormat) prodFormat.textContent = pInfo.format;
      if (prodPrice) prodPrice.textContent = pInfo.price;

      bar.setAttribute('data-theme', activeProduct);
    }

    // Show the bar only when scrolled down past a threshold (e.g., 300px)
    if (window.scrollY > 300) {
      bar.classList.add('active');
    } else {
      bar.classList.remove('active');
    }
  }

  const handleScroll = () => {
    if (isDismissed) return;
    updateBarProduct();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Show immediately on page load without waiting for scroll
  updateBarProduct();
}
