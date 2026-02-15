/*
  Checkout page controller

  This module handles the checkout flow. It reads the cart from
  localStorage, displays the summary, and when the user submits
  their shipping details, it creates an order document in Firestore
  if the user is authenticated. After creating the order, it clears
  the cart both locally and in Firestore and redirects the user
  back to the homepage. In a production system this is where you
  would integrate with a payment gateway (e.g. PayFast). For now
  it simply simulates the payment step.
*/

import { auth, db, collection, addDoc, serverTimestamp, doc, setDoc } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const orderItemsEl = document.getElementById('order-items');
  const orderTotalEl = document.getElementById('order-total');
  const checkoutForm = document.getElementById('checkout-form');

  // Load cart from localStorage
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem('corewellCart')) || [];
  } catch (err) {
    cart = [];
  }

  // Render order summary
  if (cart.length === 0) {
    orderItemsEl.innerHTML = '<p>Your cart is empty.</p>';
    if (checkoutForm) checkoutForm.style.display = 'none';
  } else {
    let total = 0;
    cart.forEach((item) => {
      total += item.price * item.quantity;
      const p = document.createElement('p');
      p.textContent = `${item.name} × ${item.quantity} – R${(item.price * item.quantity).toFixed(2)}`;
      orderItemsEl.appendChild(p);
    });
    orderTotalEl.textContent = total.toFixed(2);
  }

  async function saveOrder(shipping) {
    const user = auth.currentUser;
    if (!user) {
      // For now, require login to place order
      alert('Please log in before completing your order.');
      return;
    }
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        shipping,
        createdAt: serverTimestamp(),
      });
      // Clear cart in Firestore and localStorage
      await setDoc(doc(db, 'carts', user.uid), { items: [] });
      localStorage.removeItem('corewellCart');
      alert('Thank you for your order! Redirecting to homepage.');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to process your order. Please try again.');
    }
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (cart.length === 0) return;
      const shipping = {
        fullname: document.getElementById('fullname').value,
        address: document.getElementById('address').value,
      };
      saveOrder(shipping);
    });
  }
});