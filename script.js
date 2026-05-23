/* ============================================================
   SHION HOUSE — ECOMMERCE STORE  |  script.js
   ============================================================ */

"use strict";

/* ============================================================
   CART STATE  (localStorage-backed)
   ============================================================ */
const CartManager = {
  key: 'shionhouse_cart',

  get() {
    try { return JSON.parse(localStorage.getItem(this.key)) || []; }
    catch { return []; }
  },

  save(cart) {
    localStorage.setItem(this.key, JSON.stringify(cart));
  },

  add(product) {
    const cart = this.get();
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    this.save(cart);
    return this.count();
  },

  remove(id) {
    const cart = this.get().filter(i => i.id !== id);
    this.save(cart);
  },

  updateQty(id, qty) {
    const cart = this.get();
    const item = cart.find(i => i.id === id);
    if (item) { item.qty = Math.max(1, qty); this.save(cart); }
  },

  count() {
    return this.get().reduce((sum, i) => sum + i.qty, 0);
  },

  total() {
    return this.get().reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2);
  }
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
  // Mobile menu toggle
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active');
    });
  }

  // Cart badge count
  updateCartBadge();

  // Sticky shadow on scroll
  const nav = $('.site-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.style.boxShadow = window.scrollY > 10
        ? '0 4px 24px rgba(26,23,20,0.12)'
        : '0 2px 12px rgba(26,23,20,0.07)';
    }, { passive: true });
  }

  // Active link
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(currentPage)) link.classList.add('active');
  });
}

function updateCartBadge() {
  const count = CartManager.count();
  $$('.cart-badge').forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
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
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
    <span>${message}</span>
  `;
  toast.style.cssText = `
    position: fixed; bottom: 28px; right: 28px; z-index: 9999;
    background: ${type === 'success' ? '#1a1714' : '#c0392b'};
    color: #fff; padding: 14px 22px;
    border-radius: 4px; font-size: 14px;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    transform: translateY(20px); opacity: 0;
    transition: all 0.3s ease;
    font-family: 'DM Sans', sans-serif;
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}


/* ============================================================
   ADD TO CART — UNIFIED HANDLER
   ============================================================ */
function handleAddToCart(btn) {
  const card = btn.closest('[data-product-id]');
  if (!card) return;

  const product = {
    id: card.dataset.productId,
    name: card.dataset.productName,
    price: parseFloat(card.dataset.productPrice),
    category: card.dataset.productCategory || '',
    emoji: card.dataset.productEmoji || '🛍️'
  };

  CartManager.add(product);
  updateCartBadge();
  showToast(`"${product.name}" added to cart!`);

  // Button feedback
  btn.classList.add('added');
  const original = btn.textContent;
  btn.textContent = '✓ Added';
  setTimeout(() => {
    btn.classList.remove('added');
    btn.textContent = original;
  }, 1500);
}

function initProductButtons() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="add-to-cart"]');
    if (btn) {
      e.preventDefault();
      handleAddToCart(btn);
    }
  });
}


/* ============================================================
   SEARCH
   ============================================================ */
function initSearch() {
  const searchToggle = $('#searchToggle');
  const searchOverlay = $('#searchOverlay');
  const searchClose = $('#searchClose');
  const searchInput = $('#searchInput');

  if (!searchToggle || !searchOverlay) return;

  searchToggle.addEventListener('click', () => {
    searchOverlay.style.display = 'flex';
    requestAnimationFrame(() => {
      searchOverlay.style.opacity = '1';
      searchInput && setTimeout(() => searchInput.focus(), 200);
    });
  });

  const closeSearch = () => {
    searchOverlay.style.opacity = '0';
    setTimeout(() => { searchOverlay.style.display = 'none'; }, 250);
  };

  searchClose && searchClose.addEventListener('click', closeSearch);
  searchOverlay.addEventListener('click', e => {
    if (e.target === searchOverlay) closeSearch();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
  });
}


/* ============================================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================================ */
function initSmoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}


/* ============================================================
   INTERSECTION OBSERVER — Scroll Fade-In
   ============================================================ */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  $$('[data-animate]').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(22px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Add in-view style
  const style = document.createElement('style');
  style.textContent = '[data-animate].in-view { opacity: 1 !important; transform: none !important; }';
  document.head.appendChild(style);
}


/* ============================================================
   WISHLIST TOGGLE
   ============================================================ */
function initWishlist() {
  let wishlist = JSON.parse(localStorage.getItem('shionhouse_wishlist') || '[]');

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="wishlist"]');
    if (!btn) return;

    const card = btn.closest('[data-product-id]');
    if (!card) return;

    const id = card.dataset.productId;
    const idx = wishlist.indexOf(id);

    if (idx > -1) {
      wishlist.splice(idx, 1);
      btn.innerHTML = '♡';
      btn.style.color = '';
    } else {
      wishlist.push(id);
      btn.innerHTML = '♥';
      btn.style.color = '#c0392b';
      showToast('Added to wishlist!');
    }
    localStorage.setItem('shionhouse_wishlist', JSON.stringify(wishlist));
  });
}


/* ============================================================
   NEWSLETTER FORM
   ============================================================ */
function initNewsletter() {
  const forms = $$('.newsletter-form');
  forms.forEach(form => {
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
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initProductButtons();
  initSearch();
  initSmoothScroll();
  initScrollAnimations();
  initWishlist();
  initNewsletter();
});
