/*
  cartPage.js – renders and manages the cart.html page.
*/

import { saveCartToFirestore } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
  const cartItemsEl  = document.getElementById('cart-items');
  const cartTotalEl  = document.getElementById('cart-total');
  const emptyMsg     = document.getElementById('empty-message');
  const summary      = document.getElementById('cart-summary');
  const checkoutBtn  = document.getElementById('checkout-btn');

  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('corewellCart')) || []; }
  catch { cart = []; }

  function persist() {
    localStorage.setItem('corewellCart', JSON.stringify(cart));
    // Update header count
    const total = cart.reduce((a, b) => a + b.quantity, 0);
    document.querySelectorAll('#cart-count, #mobile-cart-count').forEach(el => {
      if (el) el.textContent = total > 0 ? total : (el.id === 'mobile-cart-count' ? '' : '0');
    });
    saveCartToFirestore(cart);
  }

  function render() {
    cartItemsEl.innerHTML = '';
    if (!cart.length) {
      emptyMsg.style.display = 'block';
      if (summary) summary.style.display = 'none';
      return;
    }
    emptyMsg.style.display = 'none';
    if (summary) summary.style.display = 'block';

    let total = 0;
    cart.forEach((item, idx) => {
      total += item.price * item.quantity;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="info">
          <h4>${item.name}</h4>
          <p>R${item.price.toFixed(2)} each</p>
        </div>
        <div class="quantity">
          <button data-idx="${idx}" data-d="-1" aria-label="Decrease">−</button>
          <span>${item.quantity}</span>
          <button data-idx="${idx}" data-d="1" aria-label="Increase">+</button>
        </div>
        <button class="remove-btn" data-remove="${idx}" aria-label="Remove item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
          </svg>
        </button>`;
      cartItemsEl.appendChild(div);
    });
    if (cartTotalEl) cartTotalEl.textContent = total.toFixed(2);
  }

  cartItemsEl.addEventListener('click', e => {
    const qBtn = e.target.closest('button[data-d]');
    const rBtn = e.target.closest('button[data-remove]');
    if (qBtn) {
      const idx   = parseInt(qBtn.dataset.idx, 10);
      const delta = parseInt(qBtn.dataset.d, 10);
      cart[idx].quantity += delta;
      if (cart[idx].quantity <= 0) cart.splice(idx, 1);
      persist(); render();
    } else if (rBtn) {
      const idx = parseInt(rBtn.dataset.remove, 10);
      cart.splice(idx, 1);
      persist(); render();
    }
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length) window.location.href = 'checkout.html';
    });
  }

  render();
});
