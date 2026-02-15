/*
  Cart page controller

  This module replaces the inline script in cart.html. It manages
  rendering the cart items, handling quantity changes, removal and
  checkout redirection. It synchronises updates to Firestore for
  authenticated users via the saveCartToFirestore helper.
*/

import { saveCartToFirestore } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  const emptyMsg = document.getElementById('empty-message');
  const checkoutBtn = document.getElementById('checkout-btn');

  // Load cart from localStorage
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem('corewellCart')) || [];
  } catch (err) {
    cart = [];
  }

  function updateHeaderCount() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
      const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
      countEl.textContent = totalCount;
    }
  }

  function renderCart() {
    cartItemsEl.innerHTML = '';
    if (cart.length === 0) {
      emptyMsg.style.display = 'block';
      checkoutBtn.style.display = 'none';
      cartTotalEl.textContent = '0.00';
      updateHeaderCount();
      return;
    }
    emptyMsg.style.display = 'none';
    checkoutBtn.style.display = 'inline-block';
    let total = 0;
    cart.forEach((item, index) => {
      total += item.price * item.quantity;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div>
            <h4>${item.name}</h4>
            <p>R${item.price.toFixed(2)}</p>
        </div>
        <div class="quantity">
            <button aria-label="Decrease quantity" data-index="${index}" data-delta="-1">-</button>
            <span>${item.quantity}</span>
            <button aria-label="Increase quantity" data-index="${index}" data-delta="1">+</button>
        </div>
        <button aria-label="Remove item" data-index="${index}" class="remove-btn"><i class="fas fa-trash"></i></button>
      `;
      cartItemsEl.appendChild(div);
    });
    cartTotalEl.textContent = total.toFixed(2);
    updateHeaderCount();
  }

  function updateQuantity(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    localStorage.setItem('corewellCart', JSON.stringify(cart));
    renderCart();
    saveCartToFirestore(cart);
  }

  function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('corewellCart', JSON.stringify(cart));
    renderCart();
    saveCartToFirestore(cart);
  }

  // Delegate quantity and remove actions
  cartItemsEl.addEventListener('click', (e) => {
    const decButton = e.target.closest('button[data-delta]');
    const removeButton = e.target.closest('button.remove-btn');
    if (decButton) {
      const idx = parseInt(decButton.getAttribute('data-index'), 10);
      const delta = parseInt(decButton.getAttribute('data-delta'), 10);
      updateQuantity(idx, delta);
    } else if (removeButton) {
      const idx = parseInt(removeButton.getAttribute('data-index'), 10);
      removeItem(idx);
    }
  });

  renderCart();

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    // redirect to checkout page
    window.location.href = 'checkout.html';
  });
});