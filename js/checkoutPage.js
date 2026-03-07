/*
  checkoutPage.js
  Renders order summary, handles checkout form submission.
  On submit: saves order to Firestore, redirects to PayFast.
  Replace PAYFAST_CONFIG values with your real credentials.
*/

import { auth, db, collection, addDoc, serverTimestamp, doc, setDoc } from './firebase.js';

// ── PAYFAST CONFIG ────────────────────────────────────────────────
// For testing use sandbox URL. For live, switch to payfast.co.za
const PAYFAST = {
  merchant_id:  'YOUR_MERCHANT_ID',   // e.g. '10000100'
  merchant_key: 'YOUR_MERCHANT_KEY',  // e.g. '46f0cd694581a'
  return_url:   `${location.origin}/index.html`,
  cancel_url:   `${location.origin}/cart.html`,
  notify_url:   'https://yourdomain.co.za/api/payfast-notify', // your ITN endpoint
  url: 'https://sandbox.payfast.co.za/eng/process', // ← switch to live when ready
};

function toast(msg) {
  if (window.showToast) { window.showToast(msg); return; }
  const el = document.getElementById('toast');
  if (el) { el.textContent = msg; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 3200); }
}

document.addEventListener('DOMContentLoaded', () => {
  const orderItemsEl = document.getElementById('order-items');
  const orderTotalEl = document.getElementById('order-total');
  const form         = document.getElementById('checkout-form');

  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('corewellCart')) || []; }
  catch { cart = []; }

  // Render order summary
  if (!cart.length) {
    if (orderItemsEl) orderItemsEl.innerHTML = '<p style="color:var(--text-muted)">Your cart is empty.</p>';
    if (form) form.style.display = 'none';
    return;
  }
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
    const p = document.createElement('p');
    p.textContent = `${item.name} × ${item.quantity}  —  R${(item.price * item.quantity).toFixed(2)}`;
    if (orderItemsEl) orderItemsEl.appendChild(p);
  });
  if (orderTotalEl) orderTotalEl.textContent = total.toFixed(2);

  // Form submit
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const user = auth.currentUser;
    const btn  = form.querySelector('button[type="submit"]');
    btn.textContent = 'Processing…'; btn.disabled = true;

    const shipping = {
      fullname: document.getElementById('fullname').value.trim(),
      address:  document.getElementById('address').value.trim(),
      phone:    document.getElementById('phone').value.trim(),
      email:    document.getElementById('checkout-email').value.trim(),
    };

    try {
      // Save order to Firestore
      const orderId = 'CW_' + Date.now();
      await addDoc(collection(db, 'orders'), {
        orderId,
        userId: user?.uid || 'guest',
        email:  shipping.email,
        items: cart,
        total,
        shipping,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // Clear cart
      if (user) await setDoc(doc(db, 'carts', user.uid), { items: [] });
      localStorage.removeItem('corewellCart');

      // Build PayFast POST form
      const itemName = cart.length === 1
        ? `${cart[0].name} x${cart[0].quantity}`
        : `CoreWell Wellness Shots (${cart.length} products)`;

      const fields = {
        merchant_id:  PAYFAST.merchant_id,
        merchant_key: PAYFAST.merchant_key,
        return_url:   PAYFAST.return_url,
        cancel_url:   PAYFAST.cancel_url,
        notify_url:   PAYFAST.notify_url,
        name_first:   shipping.fullname.split(' ')[0],
        name_last:    shipping.fullname.split(' ').slice(1).join(' ') || '',
        email_address: shipping.email,
        m_payment_id: orderId,
        amount:       total.toFixed(2),
        item_name:    itemName,
        custom_str1:  user?.uid || 'guest',
      };

      const pf = document.createElement('form');
      pf.method = 'POST';
      pf.action = PAYFAST.url;
      pf.style.display = 'none';
      for (const [k, v] of Object.entries(fields)) {
        if (!v) continue;
        const inp = document.createElement('input');
        inp.type = 'hidden'; inp.name = k; inp.value = v;
        pf.appendChild(inp);
      }
      document.body.appendChild(pf);
      pf.submit();

    } catch (err) {
      console.error('Checkout error:', err);
      toast('Could not process your order. Please try again.');
      btn.textContent = 'Pay Securely with PayFast'; btn.disabled = false;
    }
  });
});
