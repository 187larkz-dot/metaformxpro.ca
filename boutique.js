/* =================================================================
   MetaFormX Pro — Shopping Cart & Boutique Logic
   Script v1.0 | 2026
   ================================================================= */

'use strict';

// 1. PRODUCT METADATA AND STRIPE CHECKOUT LINKS
const PRODUCTS_DATA = {
    woodshield: {
        id: 'woodshield',
        nameFR: 'WoodShield',
        nameEN: 'WoodShield',
        formatFR: 'Seau commercial 20 L',
        formatEN: 'Commercial 20 L Pail',
        price: 1495.00,
        image: 'wood shield presentation good.png',
        stripeUrl: 'https://buy.stripe.com/14A28kaVd52o4W899j1B600',
        theme: 'woodshield'
    },
    woodwash: {
        id: 'woodwash',
        nameFR: 'WoodWash',
        nameEN: 'WoodWash',
        formatFR: 'Vaporisateur 1 L',
        formatEN: '1 L Sprayer Bottle',
        price: 35.95,
        image: 'WoodWash_under_2MB.jpg',
        stripeUrl: 'https://buy.stripe.com/9B64gse7pgL69coadn1B601',
        theme: 'woodwash'
    },
    biopaneloil: {
        id: 'biopaneloil',
        nameFR: 'Wood Release BIO',
        nameEN: 'Wood Release BIO',
        formatFR: 'Seau 20 L',
        formatEN: '20 L Pail',
        price: 69.95,
        image: 'Wood_release_bio_under_2MB.jpg',
        stripeUrl: 'https://buy.stripe.com/28E8wI9R952oewI4T31B602',
        theme: 'biopaneloil'
    }
};

// 2. SHOP PAGE STATE
let cart = [];
let isEn = false;

// 3. INITIALIZE BOUTIQUE STATE
document.addEventListener('DOMContentLoaded', () => {
    // Detect Language
    isEn = document.documentElement.lang.startsWith('en');

    // Load Cart from localStorage
    loadCartFromStorage();

    // Init UI Listeners
    initCartUiListeners();

    // Render Initial Cart UI
    updateCartUI();

    // Check URL parameters for auto-add
    handleUrlParams();
});

// 4. STORAGE LOGIC
function loadCartFromStorage() {
    try {
        const stored = localStorage.getItem('metaformx_cart');
        if (stored) {
            cart = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error loading cart from localStorage', e);
        cart = [];
    }
}

function saveCartToStorage() {
    try {
        localStorage.setItem('metaformx_cart', JSON.stringify(cart));
    } catch (e) {
        console.error('Error saving cart to localStorage', e);
    }
}

// 5. CARD QUANTITY SELECTORS
window.incrementQty = function(prodId) {
    const qtyEl = document.getElementById(`qty-${prodId}`);
    if (qtyEl) {
        let qty = parseInt(qtyEl.textContent, 10) || 1;
        if (qty < 99) {
            qty++;
            qtyEl.textContent = qty;
        }
    }
};

window.decrementQty = function(prodId) {
    const qtyEl = document.getElementById(`qty-${prodId}`);
    if (qtyEl) {
        let qty = parseInt(qtyEl.textContent, 10) || 1;
        if (qty > 1) {
            qty--;
            qtyEl.textContent = qty;
        }
    }
};

// Reset quantity counter on a card
function resetCardQty(prodId) {
    const qtyEl = document.getElementById(`qty-${prodId}`);
    if (qtyEl) {
        qtyEl.textContent = '1';
    }
}

// 6. CART CORE ACTIONS
window.addToCart = function(prodId) {
    const product = PRODUCTS_DATA[prodId];
    if (!product) return;

    const qtyEl = document.getElementById(`qty-${prodId}`);
    const addQty = qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1;

    // Check if product already in cart
    const existingIndex = cart.findIndex(item => item.id === prodId);
    if (existingIndex > -1) {
        cart[existingIndex].qty += addQty;
        if (cart[existingIndex].qty > 99) cart[existingIndex].qty = 99;
    } else {
        cart.push({
            id: prodId,
            qty: addQty
        });
    }

    // Save state
    saveCartToStorage();

    // Update UI
    updateCartUI();

    // Reset card selector back to 1
    resetCardQty(prodId);

    // Show confirmation Toast
    const message = isEn ? `Added ${addQty}x ${product.nameEN} to cart!` : `${addQty}x ${product.nameFR} ajouté au panier !`;
    showToast(message);

    // Auto open cart drawer to show the user the result
    setTimeout(window.openCart, 300);
};

window.changeCartItemQty = function(prodId, newQty) {
    newQty = parseInt(newQty, 10);
    if (isNaN(newQty) || newQty < 1) newQty = 1;
    if (newQty > 99) newQty = 99;

    const index = cart.findIndex(item => item.id === prodId);
    if (index > -1) {
        cart[index].qty = newQty;
        saveCartToStorage();
        updateCartUI();
    }
};

window.removeCartItem = function(prodId) {
    cart = cart.filter(item => item.id !== prodId);
    saveCartToStorage();
    updateCartUI();
};

window.clearCart = function() {
    cart = [];
    saveCartToStorage();
    updateCartUI();
};

// 7. TOAST NOTIFICATION
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    if (toast && toastMsg) {
        toastMsg.textContent = message;
        toast.classList.add('show');
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// 8. RENDER CART UI ELEMENTS
function updateCartUI() {
    const cartCountEl = document.getElementById('cart-badge');
    const container = document.getElementById('cart-items-container');
    const footer = document.getElementById('cart-panel-footer');
    const subtotalEl = document.getElementById('cart-subtotal');
    const checkoutActions = document.getElementById('cart-checkout-actions');

    if (!container) return;

    // A. Update navbar badge count
    let totalItems = 0;
    cart.forEach(item => totalItems += item.qty);
    if (cartCountEl) {
        cartCountEl.textContent = totalItems;
        cartCountEl.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    // B. If cart is empty
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty-message">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>${isEn ? 'Your cart is empty' : 'Votre panier est vide'}</p>
                <button class="btn btn-ghost" onclick="closeCart()">${isEn ? 'Return to shop' : 'Retourner à la boutique'}</button>
            </div>
        `;
        if (footer) footer.style.display = 'none';
        return;
    }

    // C. Render Cart Items
    if (footer) footer.style.display = 'block';
    
    let html = '<div class="cart-items-list">';
    let subtotal = 0;

    cart.forEach(item => {
        const prod = PRODUCTS_DATA[item.id];
        if (!prod) return;

        const itemTotal = prod.price * item.qty;
        subtotal += itemTotal;

        const name = isEn ? prod.nameEN : prod.nameFR;
        const format = isEn ? prod.formatEN : prod.formatFR;
        const formattedPrice = formatCurrency(prod.price);
        const formattedTotal = formatCurrency(itemTotal);

        html += `
            <div class="cart-item" data-theme="${prod.theme}">
                <div class="cart-item-img-wrap">
                    <img src="${prod.image}" alt="${name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-header">
                        <span class="cart-item-name">${name}</span>
                        <button class="cart-item-remove" aria-label="Supprimer" onclick="removeCartItem('${prod.id}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                    <span class="cart-item-format">${format}</span>
                    <div class="cart-item-price-row">
                        <span class="cart-item-unit-price">${formattedPrice}</span>
                        <div class="cart-item-qty-controls">
                            <button class="cart-item-qty-btn" aria-label="Decrease" onclick="changeCartItemQty('${prod.id}', ${item.qty - 1})">−</button>
                            <span class="cart-item-qty-val">${item.qty}</span>
                            <button class="cart-item-qty-btn" aria-label="Increase" onclick="changeCartItemQty('${prod.id}', ${item.qty + 1})">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;

    // D. Update subtotal
    if (subtotalEl) {
        subtotalEl.textContent = formatCurrency(subtotal);
    }

    // E. Render checkout buttons (individual checkout for each item due to static limitations)
    if (checkoutActions) {
        let checkoutHtml = '';
        cart.forEach(item => {
            const prod = PRODUCTS_DATA[item.id];
            if (!prod) return;

            const name = isEn ? prod.nameEN : prod.nameFR;
            const checkoutUrl = `${prod.stripeUrl}?quantity=${item.qty}`;
            const btnText = isEn 
                ? `<i class="fa-solid fa-lock"></i> Buy ${name} (${item.qty}) <i class="fa-solid fa-arrow-right"></i>`
                : `<i class="fa-solid fa-lock"></i> Payer ${name} (${item.qty}) <i class="fa-solid fa-arrow-right"></i>`;

            checkoutHtml += `
                <a href="${checkoutUrl}" target="_blank" rel="noopener" class="cart-checkout-btn checkout-btn-${prod.theme}">
                    ${btnText}
                </a>
            `;
        });
        checkoutActions.innerHTML = checkoutHtml;
    }
}

// 9. HELPER: CURRENCY FORMATTING
function formatCurrency(amount) {
    if (isEn) {
        return amount.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
    } else {
        // French format: 1 495,00 $
        return amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })
            .replace(/\u00a0/g, ' '); // replace non-breaking spaces with standard ones
    }
}

// 10. UI DRAWER TOGGLES & INTERACTION
window.openCart = function() {
    const overlay = document.getElementById('cart-panel-overlay');
    const panel = document.getElementById('cart-panel');
    if (overlay && panel) {
        overlay.classList.add('active');
        panel.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent background scroll
    }
};

window.closeCart = function() {
    const overlay = document.getElementById('cart-panel-overlay');
    const panel = document.getElementById('cart-panel');
    if (overlay && panel) {
        overlay.classList.remove('active');
        panel.classList.remove('active');
        document.body.style.overflow = ''; // restore background scroll
    }
};

function initCartUiListeners() {
    const trigger = document.getElementById('cart-trigger');
    const closeBtn = document.getElementById('cart-panel-close');
    const overlay = document.getElementById('cart-panel-overlay');

    if (trigger) {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            window.openCart();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', window.closeCart);
    }

    if (overlay) {
        overlay.addEventListener('click', window.closeCart);
    }

    // Close cart on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeCart();
        }
    });
}

// 11. HANDLE URL PARAMETERS (AUTO ADD TO CART)
function handleUrlParams() {
    try {
        const params = new URLSearchParams(window.location.search);
        const addProduct = params.get('add');
        if (addProduct && PRODUCTS_DATA[addProduct]) {
            // Automatically add product to cart
            window.addToCart(addProduct);
            
            // Clean up the URL parameters so a refresh doesn't add the item again
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        }
    } catch (e) {
        console.error('Error handling URL params', e);
    }
}
