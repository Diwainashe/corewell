/*
  CoreWell app.js
  - Scroll reveal animations
  - Sticky nav
  - Mobile nav toggle
  - Cart (localStorage + Firestore sync)
  - Auth state (login/logout link)
  - Toast notifications
  - Testimonials carousel
  - Footer year
*/

import { auth, onAuthStateChanged, signOut, db, doc, getDoc, setDoc } from './firebase.js';

// ─── PRODUCTS CATALOGUE ──────────────────────────────────────────
const PRODUCTS = [
  { id: 'glow-boost',    name: 'Glow Boost',    price: 89 },
  { id: 'colon-cleanse', name: 'Colon Cleanse', price: 89 },
  { id: 'iron-boost',    name: 'Iron Boost',    price: 89 },
];

// ─── CART STATE ───────────────────────────────────────────────────
let cart = [];
try { cart = JSON.parse(localStorage.getItem('corewellCart')) || []; }
catch { cart = []; }

// ─── TOAST ────────────────────────────────────────────────────────
let toastTimer;
window.showToast = function(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
};

// ─── CART COUNT ───────────────────────────────────────────────────
function updateCartCount() {
  const total = cart.reduce((a, b) => a + b.quantity, 0);
  document.querySelectorAll('#cart-count, #mobile-cart-count').forEach(el => {
    if (el) el.textContent = total > 0 ? total : (el.id === 'mobile-cart-count' ? '' : '0');
  });
}

// ─── FIRESTORE SYNC ───────────────────────────────────────────────
async function syncCartToFirestore() {
  const user = auth.currentUser;
  if (!user) return;
  try { await setDoc(doc(db, 'carts', user.uid), { items: cart }); }
  catch (e) { console.error('Cart sync failed:', e); }
}

async function loadUserCart(user) {
  try {
    const snap = await getDoc(doc(db, 'carts', user.uid));
    if (snap.exists()) {
      const data = snap.data();
      cart = Array.isArray(data.items) ? data.items : [];
    } else {
      await setDoc(doc(db, 'carts', user.uid), { items: [] });
      cart = [];
    }
    localStorage.setItem('corewellCart', JSON.stringify(cart));
    updateCartCount();
  } catch (e) { console.error('Cart load failed:', e); }
}

// ─── ADD TO CART ──────────────────────────────────────────────────
function bindAddToCart() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const product = PRODUCTS.find(p => p.id === id);
      if (!product) return;
      const existing = cart.find(i => i.id === id);
      if (existing) { existing.quantity += 1; }
      else { cart.push({ ...product, quantity: 1 }); }
      localStorage.setItem('corewellCart', JSON.stringify(cart));
      updateCartCount();
      showToast(`${product.name} added to cart 🛒`);
      syncCartToFirestore();
    });
  });
}

// ─── AUTH STATE ───────────────────────────────────────────────────
function updateAuthLink(user) {
  const links = document.querySelectorAll('#auth-link, #mobile-auth-link');
  links.forEach(link => {
    if (!link) return;
    if (user) {
      link.textContent = 'Logout';
      link.setAttribute('href', '#logout');
    } else {
      link.textContent = 'Login';
      link.setAttribute('href', 'login.html');
    }
  });
}

// ─── SCROLL REVEAL ────────────────────────────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('vis'), i * 55);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ─── STICKY NAV ───────────────────────────────────────────────────
function initNav() {
  const header = document.getElementById('site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 16);
  }, { passive: true });

  // Mobile toggle
  const toggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      const spans = toggle.querySelectorAll('span');
      if (mobileNav.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(4px,4px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(4px,-4px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });
  }

  // Active link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('#')[0];
    a.classList.toggle('active', href === path);
  });
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────
let tIdx = 0;
window.scrollTestimonials = function(dir) {
  const inner = document.getElementById('testimonialsInner');
  if (!inner) return;
  const cards = inner.querySelectorAll('.testimonial');
  if (!cards.length) return;
  tIdx = Math.max(0, Math.min(tIdx + dir, cards.length - 1));
  const w = cards[0].offsetWidth + 22;
  inner.style.transform = `translateX(-${tIdx * w}px)`;
};

// ─── FOOTER YEAR ─────────────────────────────────────────────────
function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

// ─── INIT ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // These run immediately; header/footer load async via components.js
  updateCartCount();
  setYear();
  initScrollReveal();

  // Re-run bindings after header is injected
  const headerPlaceholder = document.getElementById('header');
  if (headerPlaceholder) {
    new MutationObserver(() => {
      initNav();
      updateCartCount();
      updateAuthLink(auth.currentUser);
      bindAddToCart();
    }).observe(headerPlaceholder, { childList: true });
  }

  // Also bind add-to-cart on page products (not in header)
  bindAddToCart();

  // Auth
  onAuthStateChanged(auth, user => {
    updateAuthLink(user);
    if (user) loadUserCart(user);
  });

  // Logout delegation
  document.addEventListener('click', async e => {
    const target = e.target.closest('a[href="#logout"]');
    if (!target) return;
    e.preventDefault();
    try {
      await signOut(auth);
      showToast('You have been signed out.');
    } catch { showToast('Error signing out.'); }
  });
});
