/* ============================================================
   SHION HOUSE — ECOMMERCE STORE  |  script.js  (India Edition)
   ============================================================ */

"use strict";

/* ============================================================
   PRODUCT DATA — Indian Products, Prices in ₹
   ============================================================ */
const PRODUCTS = [
  { id:'p001', name:'Khadi Cotton Kurta',          price:1299,  oldPrice:null,   category:'Ethnic Wear', emoji:'👘', badge:'new',  rating:5, reviews:148, desc:'Handwoven pure khadi cotton kurta with subtle self-stripe texture. Breathable and eco-friendly, crafted by artisans from Gujarat. Perfect for festive occasions and casual outings alike.' },
  { id:'p002', name:'Banarasi Silk Saree',          price:4599,  oldPrice:5999,   category:'Sarees',      emoji:'🥻', badge:'sale', rating:5, reviews:221, desc:'Authentic Banarasi silk saree with intricate zari work and traditional motifs. Woven on handlooms in Varanasi, this piece blends heritage craftsmanship with timeless elegance.' },
  { id:'p003', name:'Titan Raga Watch',             price:8999,  oldPrice:null,   category:'Watches',     emoji:'⌚', badge:null,   rating:5, reviews:303, desc:'Titan Raga inspired women\'s dress watch with a slim case and a delicate bracelet strap. Featuring a mother-of-pearl dial and elegant gold-tone finish.' },
  { id:'p004', name:'Palazzo Pants Set',            price:1899,  oldPrice:2499,   category:'Clothing',    emoji:'👖', badge:'hot',  rating:4, reviews:73,  desc:'Wide-leg palazzo pants with a matching top in soft georgette fabric. The floral print and flowing silhouette make it perfect for summer days and casual lunches.' },
  { id:'p005', name:'Aviator Sunglasses',           price:1499,  oldPrice:null,   category:'Eyewear',     emoji:'🕶️', badge:'new',  rating:5, reviews:97,  desc:'Classic aviator sunglasses with UV400 polarised lenses in a lightweight metal frame. Inspired by vintage Indian cinema style — timeless and bold.' },
  { id:'p006', name:'Embroidered Potli Bag',        price:1799,  oldPrice:null,   category:'Bags',        emoji:'👜', badge:null,   rating:5, reviews:165, desc:'Handcrafted potli bag adorned with intricate zardozi embroidery on silk fabric. Gold drawstring closure and tassel detailing. A stunning bridal or festive accessory.' },
  { id:'p007', name:'Pashmina Shawl',               price:3299,  oldPrice:4200,   category:'Clothing',    emoji:'🧣', badge:'sale', rating:4, reviews:82,  desc:'100% pure Pashmina from Kashmir with traditional paisley weave. Extraordinarily soft and warm, this shawl is a coveted piece of Indian textile heritage.' },
  { id:'p008', name:'Kolhapuri Chappals',           price:1199,  oldPrice:null,   category:'Shoes',       emoji:'👡', badge:null,   rating:5, reviews:109, desc:'Hand-stitched genuine leather Kolhapuri chappals made by craftsmen in Kolhapur, Maharashtra. Durable, comfortable, and authentically Indian.' },
  { id:'p009', name:'Jute Shoulder Tote',           price:999,   oldPrice:null,   category:'Bags',        emoji:'🛍️', badge:'new',  rating:4, reviews:54,  desc:'Eco-friendly jute shoulder tote with hand-block printed motifs. Spacious interior with cotton lining and inner pocket. Stylish and sustainable.' },
  { id:'p010', name:'Anarkali Kurta Set',           price:2799,  oldPrice:3499,   category:'Ethnic Wear', emoji:'👗', badge:'sale', rating:5, reviews:190, desc:'Floor-length Anarkali kurta in chiffon with matching churidar and dupatta. Delicate floral embroidery on the yoke and hem. A festive staple for every wardrobe.' },
  { id:'p011', name:'Fastrack Chronograph',         price:5499,  oldPrice:null,   category:'Watches',     emoji:'⏱️', badge:'hot',  rating:5, reviews:76,  desc:'Fastrack sport chronograph with a bold 44mm case, silicone strap, and 50m water resistance. Perfect for the active, modern Indian man.' },
  { id:'p012', name:'Rajasthani Lac Bangles Set',   price:499,   oldPrice:null,   category:'Eyewear',     emoji:'💎', badge:'new',  rating:4, reviews:39,  desc:'Set of 12 hand-painted lac bangles from Jaipur artisans. Vibrant colours, mirror work inlay, and classic Rajasthani patterns. A festive must-have.' },
];

/* ============================================================
   CART STATE  (localStorage-backed)
   ============================================================ */
const CartManager = {
  key: 'shionhouse_cart',
  get() {
    try { return JSON.parse(localStorage.getItem(this.key)) || []; }
    catch { return []; }
  },
  save(cart) { localStorage.setItem(this.key, JSON.stringify(cart)); },
  add(product, qty = 1) {
    const cart = this.get();
    const existing = cart.find(i => i.id === product.id);
    if (existing) { existing.qty += qty; }
    else { cart.push({ ...product, qty }); }
    this.save(cart);
    return this.count();
  },
  remove(id) { this.save(this.get().filter(i => i.id !== id)); },
  updateQty(id, qty) {
    const cart = this.get();
    const item = cart.find(i => i.id === id);
    if (item) { item.qty = Math.max(1, qty); this.save(cart); }
  },
  count() { return this.get().reduce((sum, i) => sum + i.qty, 0); },
  total() { return this.get().reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(0); }
};

/* ============================================================
   WISHLIST STATE
   ============================================================ */
const WishlistManager = {
  key: 'shionhouse_wishlist',
  get() { return JSON.parse(localStorage.getItem(this.key) || '[]'); },
  toggle(id) {
    const list = this.get();
    const idx = list.indexOf(id);
    if (idx > -1) { list.splice(idx, 1); }
    else { list.push(id); }
    localStorage.setItem(this.key, JSON.stringify(list));
    return idx === -1;
  },
  has(id) { return this.get().includes(id); }
};

/* ============================================================
   AUTH STATE
   ============================================================ */
const AuthManager = {
  key: 'shionhouse_user',
  getUser() {
    try { return JSON.parse(localStorage.getItem(this.key)); }
    catch { return null; }
  },
  saveUser(user) { localStorage.setItem(this.key, JSON.stringify(user)); },
  logout() { localStorage.removeItem(this.key); },
  isLoggedIn() { return !!this.getUser(); }
};

/* ============================================================
   DOM HELPERS
   ============================================================ */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

/* ============================================================
   NAVBAR
   ============================================================ */
function initNavbar() {
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active');
    });
  }
  updateCartBadge();
  const nav = $('.site-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.style.boxShadow = window.scrollY > 10
        ? '0 4px 24px rgba(26,23,20,0.12)'
        : '0 2px 12px rgba(26,23,20,0.07)';
    }, { passive: true });
  }
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(currentPage)) link.classList.add('active');
  });
  updateNavUser();
}

function updateCartBadge() {
  const count = CartManager.count();
  $$('.cart-badge').forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

function updateNavUser() {
  const user = AuthManager.getUser();
  $$('.nav-user-name').forEach(el => {
    if (user) {
      el.textContent = user.name.split(' ')[0];
      el.style.display = 'inline';
    } else {
      el.style.display = 'none';
    }
  });
  $$('.nav-auth-btn').forEach(el => {
    el.title = user ? 'My Account' : 'Login / Sign Up';
  });
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
function showToast(message, type = 'success') {
  const existing = $('.toast-notification');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span><span>${message}</span>`;
  toast.style.cssText = `
    position:fixed;bottom:28px;right:28px;z-index:9999;
    background:${type === 'success' ? '#1a1714' : '#c0392b'};
    color:#fff;padding:14px 22px;border-radius:4px;font-size:14px;
    display:flex;align-items:center;gap:10px;
    box-shadow:0 8px 24px rgba(0,0,0,0.2);
    transform:translateY(20px);opacity:0;transition:all 0.3s ease;
    font-family:'DM Sans',sans-serif;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity='1'; toast.style.transform='translateY(0)'; });
  setTimeout(() => {
    toast.style.opacity='0'; toast.style.transform='translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

/* ============================================================
   ADD TO CART
   ============================================================ */
function handleAddToCart(btn, qty = 1) {
  const card = btn.closest('[data-product-id]');
  if (!card) return;
  const product = {
    id:       card.dataset.productId,
    name:     card.dataset.productName,
    price:    parseFloat(card.dataset.productPrice),
    category: card.dataset.productCategory || '',
    emoji:    card.dataset.productEmoji || '🛍️'
  };
  CartManager.add(product, qty);
  updateCartBadge();
  showToast(`"${product.name}" added to cart!`);
  btn.classList.add('added');
  const original = btn.textContent;
  btn.textContent = '✓ Added';
  setTimeout(() => { btn.classList.remove('added'); btn.textContent = original; }, 1500);
}

function initProductButtons() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="add-to-cart"]');
    if (btn) { e.preventDefault(); handleAddToCart(btn); }
  });
}

/* ============================================================
   SEARCH OVERLAY
   ============================================================ */
function initSearch() {
  const toggle = $('#searchToggle');
  const overlay = $('#searchOverlay');
  const closeBtn = $('#searchClose');
  const input = $('#searchInput');
  if (!toggle || !overlay) return;
  const show = () => {
    overlay.style.display = 'flex';
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });
    if (input) input.focus();
  };
  const hide = () => {
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 250);
  };
  toggle.addEventListener('click', show);
  if (closeBtn) closeBtn.addEventListener('click', hide);
  overlay.addEventListener('click', e => { if (e.target === overlay) hide(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && input.value.trim()) {
        window.location.href = `products.html?q=${encodeURIComponent(input.value.trim())}`;
      }
    });
  }
}

/* ============================================================
   PRODUCT MODAL (Quick View)
   ============================================================ */
function openModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  let modal = $('#quickViewModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quickViewModal';
    modal.style.cssText = `position:fixed;inset:0;z-index:3000;background:rgba(26,23,20,0.7);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity 0.3s ease;`;
    modal.innerHTML = `<div class="modal-inner" style="background:#fff;border-radius:8px;max-width:800px;width:100%;max-height:90vh;overflow:auto;position:relative;">
      <button id="modalClose" style="position:absolute;top:16px;right:20px;background:none;border:none;font-size:28px;cursor:pointer;z-index:1;color:#999;">&times;</button>
      <div class="modal-grid" style="display:grid;grid-template-columns:1fr 1fr;">
        <div class="modal-img" style="background:var(--clr-accent2);display:flex;align-items:center;justify-content:center;border-radius:8px 0 0 8px;min-height:320px;font-size:100px;" id="modalEmoji"></div>
        <div class="modal-info" style="padding:40px 32px;" id="modalInfo"></div>
      </div>
    </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#modalClose').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  }
  modal.querySelector('#modalEmoji').textContent = product.emoji;
  modal.querySelector('#modalInfo').innerHTML = `
    <div style="font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:var(--clr-accent);margin-bottom:8px;">${product.category}</div>
    <h2 style="font-family:var(--ff-display);font-size:28px;font-weight:400;margin-bottom:12px;">${product.name}</h2>
    <div style="margin-bottom:16px;">${'★'.repeat(product.rating)}${'☆'.repeat(5-product.rating)} <span style="font-size:13px;color:var(--clr-mid);">(${product.reviews} reviews)</span></div>
    <div style="font-family:var(--ff-display);font-size:26px;font-weight:600;color:var(--clr-dark);margin-bottom:20px;">₹${product.price.toLocaleString('en-IN')}${product.oldPrice ? `<span style="font-size:16px;color:#aaa;text-decoration:line-through;margin-left:10px;">₹${product.oldPrice.toLocaleString('en-IN')}</span>` : ''}</div>
    <p style="font-size:14px;color:var(--clr-mid);line-height:1.8;margin-bottom:28px;">${product.desc}</p>
    <div data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}" data-product-category="${product.category}" data-product-emoji="${product.emoji}">
      <button data-action="add-to-cart" class="btn-primary" style="width:100%;justify-content:center;">Add to Cart <i class="bi bi-bag"></i></button>
    </div>`;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => { modal.style.opacity = '1'; });
}

function closeModal() {
  const modal = $('#quickViewModal');
  if (modal) { modal.style.opacity = '0'; setTimeout(() => { modal.style.display = 'none'; document.body.style.overflow = ''; }, 300); }
}

function initQuickView() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.action-btn');
    if (btn && btn.textContent.trim() === '⊕') {
      const card = btn.closest('[data-product-id]');
      if (card) openModal(card.dataset.productId);
    }
    const card = e.target.closest('.product-card');
    if (card && !e.target.closest('[data-action]') && !e.target.closest('.action-btn')) {
      openModal(card.dataset.productId);
    }
  });
}

/* ============================================================
   FILTER BAR  (products.html)
   ============================================================ */
function initFilterBar() {
  const filterBar = $('#filterBar');
  if (!filterBar) return;
  const searchInput  = $('#productSearch');
  const sortSelect   = $('#sortSelect');
  const pills        = $$('.filter-pill');
  const resultsCount = $('#resultsCount');
  const noResults    = $('#noResults');
  const allCards     = $$('[data-product-id]');
  let activeCategory = 'All';
  let searchQuery    = '';
  let sortBy         = 'default';
  const urlQ = new URLSearchParams(location.search).get('q');
  if (urlQ && searchInput) { searchInput.value = urlQ; searchQuery = urlQ.toLowerCase(); }

  function applyFilters() {
    let visible = 0;
    const productList = [...allCards];
    if (sortBy === 'price-asc')  productList.sort((a,b) => parseFloat(a.dataset.productPrice) - parseFloat(b.dataset.productPrice));
    else if (sortBy === 'price-desc') productList.sort((a,b) => parseFloat(b.dataset.productPrice) - parseFloat(a.dataset.productPrice));
    else if (sortBy === 'name')  productList.sort((a,b) => a.dataset.productName.localeCompare(b.dataset.productName));
    const grid = productList[0]?.closest('.row');
    if (grid) productList.forEach(card => { const col = card.closest('[class*="col-"]'); if (col) grid.appendChild(col); });
    allCards.forEach(card => {
      const col = card.closest('[class*="col-"]');
      if (!col) return;
      const name     = card.dataset.productName.toLowerCase();
      const category = card.dataset.productCategory;
      const matchCat = activeCategory === 'All' || category === activeCategory;
      const matchQ   = !searchQuery || name.includes(searchQuery) || category.toLowerCase().includes(searchQuery);
      if (matchCat && matchQ) { col.style.display = ''; visible++; }
      else { col.style.display = 'none'; }
    });
    if (resultsCount) resultsCount.textContent = `${visible} product${visible !== 1 ? 's' : ''}`;
    if (noResults) noResults.classList.toggle('visible', visible === 0);
  }

  if (searchInput) searchInput.addEventListener('input', () => { searchQuery = searchInput.value.toLowerCase(); applyFilters(); });
  if (sortSelect)  sortSelect.addEventListener('change', () => { sortBy = sortSelect.value; applyFilters(); });
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.category;
      applyFilters();
    });
  });
  applyFilters();
}

/* ============================================================
   SCROLL ANIMATIONS
   ============================================================ */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } });
  }, { threshold: 0.12 });
  $$('[data-animate]').forEach(el => {
    el.style.opacity = '0'; el.style.transform = 'translateY(22px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
  const style = document.createElement('style');
  style.textContent = '[data-animate].in-view { opacity: 1 !important; transform: none !important; }';
  document.head.appendChild(style);
}

/* ============================================================
   WISHLIST
   ============================================================ */
function initWishlist() {
  const wishlist = WishlistManager.get();
  wishlist.forEach(id => {
    $$(`[data-product-id="${id}"] [data-action="wishlist"]`).forEach(btn => {
      btn.innerHTML = '♥'; btn.style.color = '#c0392b';
    });
  });
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="wishlist"]');
    if (!btn) return;
    const card = btn.closest('[data-product-id]');
    if (!card) return;
    const added = WishlistManager.toggle(card.dataset.productId);
    btn.innerHTML = added ? '♥' : '♡';
    btn.style.color = added ? '#c0392b' : '';
    showToast(added ? 'Added to wishlist!' : 'Removed from wishlist');
  });
}

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
function initSmoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
}

/* ============================================================
   NEWSLETTER
   ============================================================ */
function initNewsletter() {
  $$('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      if (!input || !input.value.trim()) return;
      showToast('Thank you for subscribing!');
      input.value = '';
    });
  });
}

/* ============================================================
   AUTH MODAL — shown on page load if not logged in
   ============================================================ */
function initAuthModal() {
  // Don't show on auth page itself
  if (location.pathname.includes('auth.html')) return;

  const user = AuthManager.getUser();
  if (user) return; // already logged in

  // Check if dismissed this session
  if (sessionStorage.getItem('auth_dismissed')) return;

  // Inject modal HTML
  const overlay = document.createElement('div');
  overlay.id = 'authOverlay';
  overlay.innerHTML = `
  <div class="auth-modal" id="authModal">
    <button class="auth-close" id="authClose" title="Continue as guest">&times;</button>

    <!-- Tabs -->
    <div class="auth-tabs">
      <button class="auth-tab active" data-tab="login">Login</button>
      <button class="auth-tab" data-tab="signup">Sign Up</button>
    </div>

    <div class="auth-logo">Shion<span>House</span></div>

    <!-- LOGIN FORM -->
    <div class="auth-pane active" id="pane-login">
      <p class="auth-subtitle">Welcome back! Sign in to your account.</p>
      <div class="auth-field">
        <label>Email Address</label>
        <input type="email" id="login-email" placeholder="you@email.com" autocomplete="email" />
        <span class="auth-err" id="login-email-err"></span>
      </div>
      <div class="auth-field">
        <label>Password</label>
        <div class="auth-pass-wrap">
          <input type="password" id="login-pass" placeholder="Enter password" autocomplete="current-password" />
          <button type="button" class="pass-toggle" data-target="login-pass">👁</button>
        </div>
        <span class="auth-err" id="login-pass-err"></span>
      </div>
      <div class="auth-forgot"><a href="#">Forgot password?</a></div>
      <button class="auth-submit" id="loginSubmit">Login to ShionHouse</button>
      <p class="auth-switch">Don't have an account? <a href="#" data-switch="signup">Sign Up</a></p>
    </div>

    <!-- SIGNUP FORM -->
    <div class="auth-pane" id="pane-signup">
      <p class="auth-subtitle">Create your free account today.</p>
      <div class="auth-field">
        <label>Full Name</label>
        <input type="text" id="signup-name" placeholder="Riya Sharma" autocomplete="name" />
        <span class="auth-err" id="signup-name-err"></span>
      </div>
      <div class="auth-field">
        <label>Email Address</label>
        <input type="email" id="signup-email" placeholder="you@email.com" autocomplete="email" />
        <span class="auth-err" id="signup-email-err"></span>
      </div>
      <div class="auth-field">
        <label>Mobile Number</label>
        <input type="tel" id="signup-phone" placeholder="+91 98765 43210" autocomplete="tel" />
        <span class="auth-err" id="signup-phone-err"></span>
      </div>
      <div class="auth-field">
        <label>Password</label>
        <div class="auth-pass-wrap">
          <input type="password" id="signup-pass" placeholder="Min. 8 characters" autocomplete="new-password" />
          <button type="button" class="pass-toggle" data-target="signup-pass">👁</button>
        </div>
        <div class="pass-strength" id="passStrength"><div class="pass-bar" id="passBar"></div></div>
        <span class="pass-hint" id="passHint"></span>
        <span class="auth-err" id="signup-pass-err"></span>
      </div>
      <div class="auth-field">
        <label>Confirm Password</label>
        <div class="auth-pass-wrap">
          <input type="password" id="signup-confirm" placeholder="Re-enter password" autocomplete="new-password" />
          <button type="button" class="pass-toggle" data-target="signup-confirm">👁</button>
        </div>
        <span class="auth-err" id="signup-confirm-err"></span>
      </div>
      <div class="auth-check">
        <input type="checkbox" id="signup-terms" />
        <label for="signup-terms">I agree to the <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a></label>
      </div>
      <span class="auth-err" id="signup-terms-err"></span>
      <button class="auth-submit" id="signupSubmit">Create Account</button>
      <p class="auth-switch">Already have an account? <a href="#" data-switch="login">Login</a></p>
    </div>
  </div>`;

  overlay.style.cssText = `position:fixed;inset:0;z-index:5000;background:rgba(26,23,20,0.82);display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px);animation:fadeIn .3s ease both;`;

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes slideUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
    .auth-modal {
      background:#fff; border-radius:12px; width:100%; max-width:460px;
      padding:36px 40px 40px; position:relative; max-height:92vh; overflow-y:auto;
      animation:slideUp .35s ease both;
      font-family:'DM Sans',sans-serif;
    }
    .auth-close {
      position:absolute; top:14px; right:18px; background:none; border:none;
      font-size:26px; cursor:pointer; color:#aaa; line-height:1; transition:color .2s;
    }
    .auth-close:hover { color:#1a1714; }
    .auth-logo {
      font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:600;
      text-align:center; margin-bottom:6px; color:#1a1714;
    }
    .auth-logo span { color:#c8a96e; }
    .auth-subtitle { text-align:center; color:#6b6460; font-size:13.5px; margin-bottom:24px; }
    .auth-tabs {
      display:flex; border-bottom:2px solid #e6dfd6; margin-bottom:20px; gap:0;
    }
    .auth-tab {
      flex:1; padding:10px 0; background:none; border:none; font-size:14px;
      font-weight:500; letter-spacing:.06em; cursor:pointer; color:#9a9490;
      border-bottom:2px solid transparent; margin-bottom:-2px; transition:all .2s;
      font-family:'DM Sans',sans-serif;
    }
    .auth-tab.active { color:#1a1714; border-bottom-color:#c8a96e; }
    .auth-pane { display:none; }
    .auth-pane.active { display:block; }
    .auth-field { margin-bottom:16px; }
    .auth-field label { display:block; font-size:12px; font-weight:500; letter-spacing:.08em; text-transform:uppercase; color:#4a443e; margin-bottom:6px; }
    .auth-field input {
      width:100%; padding:12px 14px; border:1.5px solid #e6dfd6; border-radius:5px;
      font-size:14px; font-family:'DM Sans',sans-serif; color:#1a1714; outline:none;
      transition:border-color .2s, box-shadow .2s; background:#faf8f5;
    }
    .auth-field input:focus { border-color:#c8a96e; box-shadow:0 0 0 3px rgba(200,169,110,.15); background:#fff; }
    .auth-field input.is-error { border-color:#e74c3c; }
    .auth-field input.is-valid { border-color:#27ae60; }
    .auth-err { display:block; font-size:12px; color:#e74c3c; margin-top:4px; min-height:16px; }
    .auth-pass-wrap { position:relative; }
    .auth-pass-wrap input { padding-right:42px; }
    .pass-toggle { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:16px; opacity:.5; transition:opacity .2s; }
    .pass-toggle:hover { opacity:1; }
    .pass-strength { height:4px; background:#eee; border-radius:2px; margin-top:6px; overflow:hidden; }
    .pass-bar { height:100%; width:0; border-radius:2px; transition:width .3s, background .3s; }
    .pass-hint { font-size:11px; color:#888; margin-top:4px; display:block; }
    .auth-forgot { text-align:right; margin-top:-8px; margin-bottom:16px; }
    .auth-forgot a { font-size:12px; color:#c8a96e; }
    .auth-check { display:flex; align-items:flex-start; gap:8px; margin-bottom:4px; margin-top:4px; }
    .auth-check input { width:16px; height:16px; margin-top:2px; accent-color:#c8a96e; flex-shrink:0; }
    .auth-check label { font-size:12.5px; color:#4a443e; line-height:1.5; }
    .auth-check a { color:#c8a96e; }
    .auth-submit {
      width:100%; padding:14px; background:#1a1714; color:#fff; border:none;
      border-radius:5px; font-size:14px; font-weight:500; letter-spacing:.06em;
      cursor:pointer; margin-top:16px; transition:background .2s, transform .15s;
      font-family:'DM Sans',sans-serif;
    }
    .auth-submit:hover { background:#c8a96e; color:#1a1714; }
    .auth-submit:active { transform:scale(.98); }
    .auth-switch { text-align:center; font-size:13px; color:#888; margin-top:16px; margin-bottom:0; }
    .auth-switch a { color:#c8a96e; font-weight:500; }
    @media(max-width:480px) {
      .auth-modal { padding:28px 20px 32px; }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(overlay);

  // --- Tab switching ---
  overlay.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  overlay.querySelectorAll('[data-switch]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); switchTab(a.dataset.switch); });
  });
  function switchTab(name) {
    overlay.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    overlay.querySelectorAll('.auth-pane').forEach(p => p.classList.toggle('active', p.id === `pane-${name}`));
  }

  // --- Close ---
  overlay.querySelector('#authClose').addEventListener('click', () => {
    sessionStorage.setItem('auth_dismissed', '1');
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
  });
  overlay.style.transition = 'opacity .3s';
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      sessionStorage.setItem('auth_dismissed', '1');
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 300);
    }
  });

  // --- Password toggle ---
  overlay.querySelectorAll('.pass-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = overlay.querySelector(`#${btn.dataset.target}`);
      if (input) input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  // --- Password strength ---
  const passInput = overlay.querySelector('#signup-pass');
  if (passInput) {
    passInput.addEventListener('input', () => {
      const val = passInput.value;
      const bar = overlay.querySelector('#passBar');
      const hint = overlay.querySelector('#passHint');
      let strength = 0;
      if (val.length >= 8) strength++;
      if (/[A-Z]/.test(val)) strength++;
      if (/[0-9]/.test(val)) strength++;
      if (/[^A-Za-z0-9]/.test(val)) strength++;
      const colors = ['#e74c3c','#e67e22','#f1c40f','#27ae60'];
      const labels = ['Weak','Fair','Good','Strong'];
      const widths = ['25%','50%','75%','100%'];
      if (bar) { bar.style.width = val ? widths[strength-1]||'25%' : '0'; bar.style.background = val ? colors[strength-1]||colors[0] : ''; }
      if (hint) hint.textContent = val ? labels[strength-1]||'Weak' : '';
    });
  }

  // --- Validation helpers ---
  function setErr(id, msg) {
    const el = overlay.querySelector(`#${id}`);
    const inp = overlay.querySelector(`#${id.replace('-err','')}`) || overlay.querySelector(`input`);
    if (el) el.textContent = msg;
    return !!msg;
  }
  function clearErrs(...ids) { ids.forEach(id => { const el = overlay.querySelector(`#${id}`); if(el) el.textContent=''; }); }
  function markInput(id, isValid) {
    const input = overlay.querySelector(`#${id}`);
    if (!input) return;
    input.classList.toggle('is-error', !isValid);
    input.classList.toggle('is-valid', isValid);
  }

  // --- LOGIN SUBMIT ---
  overlay.querySelector('#loginSubmit').addEventListener('click', () => {
    clearErrs('login-email-err','login-pass-err');
    const email = overlay.querySelector('#login-email').value.trim();
    const pass  = overlay.querySelector('#login-pass').value;
    let ok = true;
    if (!email) { setErr('login-email-err','Email is required'); markInput('login-email',false); ok=false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('login-email-err','Enter a valid email address'); markInput('login-email',false); ok=false; }
    else markInput('login-email',true);
    if (!pass) { setErr('login-pass-err','Password is required'); markInput('login-pass',false); ok=false; }
    else if (pass.length < 6) { setErr('login-pass-err','Password must be at least 6 characters'); markInput('login-pass',false); ok=false; }
    else markInput('login-pass',true);
    if (!ok) return;
    // Check stored user
    const stored = AuthManager.getUser();
    if (stored && stored.email === email && stored.password === pass) {
      overlay.style.opacity='0'; setTimeout(()=>overlay.remove(),300);
      showToast(`Welcome back, ${stored.name.split(' ')[0]}! 🎉`);
      updateNavUser();
    } else if (!stored) {
      setErr('login-email-err','No account found. Please sign up.');
    } else {
      setErr('login-pass-err','Incorrect password.');
    }
  });

  // --- SIGNUP SUBMIT ---
  overlay.querySelector('#signupSubmit').addEventListener('click', () => {
    clearErrs('signup-name-err','signup-email-err','signup-phone-err','signup-pass-err','signup-confirm-err','signup-terms-err');
    const name    = overlay.querySelector('#signup-name').value.trim();
    const email   = overlay.querySelector('#signup-email').value.trim();
    const phone   = overlay.querySelector('#signup-phone').value.trim();
    const pass    = overlay.querySelector('#signup-pass').value;
    const confirm = overlay.querySelector('#signup-confirm').value;
    const terms   = overlay.querySelector('#signup-terms').checked;
    let ok = true;

    if (!name || name.length < 2) { setErr('signup-name-err','Please enter your full name'); markInput('signup-name',false); ok=false; } else markInput('signup-name',true);
    if (!email) { setErr('signup-email-err','Email is required'); markInput('signup-email',false); ok=false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('signup-email-err','Enter a valid email address'); markInput('signup-email',false); ok=false; }
    else markInput('signup-email',true);
    if (phone && !/^(\+91[\-\s]?)?[6-9]\d{9}$/.test(phone.replace(/\s/g,''))) { setErr('signup-phone-err','Enter a valid Indian mobile number'); markInput('signup-phone',false); ok=false; }
    else if (phone) markInput('signup-phone',true);
    if (!pass) { setErr('signup-pass-err','Password is required'); markInput('signup-pass',false); ok=false; }
    else if (pass.length < 8) { setErr('signup-pass-err','Password must be at least 8 characters'); markInput('signup-pass',false); ok=false; }
    else markInput('signup-pass',true);
    if (!confirm) { setErr('signup-confirm-err','Please confirm your password'); markInput('signup-confirm',false); ok=false; }
    else if (pass !== confirm) { setErr('signup-confirm-err','Passwords do not match'); markInput('signup-confirm',false); ok=false; }
    else markInput('signup-confirm',true);
    if (!terms) { setErr('signup-terms-err','You must accept the terms to continue'); ok=false; }

    if (!ok) return;
    AuthManager.saveUser({ name, email, phone, password: pass });
    overlay.style.opacity='0'; setTimeout(()=>overlay.remove(),300);
    showToast(`Welcome to ShionHouse, ${name.split(' ')[0]}! 🎉`);
    updateNavUser();
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initProductButtons();
  initSearch();
  initQuickView();
  initFilterBar();
  initSmoothScroll();
  initScrollAnimations();
  initWishlist();
  initNewsletter();
  initAuthModal();
});
