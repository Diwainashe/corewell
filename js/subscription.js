/*
  subscription.js
  Handles subscription button clicks on any page.
  Requires login; creates a Firestore subscription document.
  Uses toast notifications instead of alerts.
*/

import { auth, db, collection, addDoc, serverTimestamp } from './firebase.js';

function toast(msg) {
  if (window.showToast) { window.showToast(msg); return; }
  const el = document.getElementById('toast');
  if (el) { el.textContent = msg; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 3200); }
}

async function handleSubscribe(planName, price) {
  const user = auth.currentUser;
  if (!user) {
    toast('Please sign in to subscribe 🌿');
    setTimeout(() => window.location.href = 'login.html', 1200);
    return;
  }
  try {
    await addDoc(collection(db, 'subscriptions'), {
      userId: user.uid,
      email: user.email,
      plan: planName,
      price: Number(price) || 0,
      status: 'active',
      createdAt: serverTimestamp(),
    });
    toast(`${planName} subscription activated! 🎉`);
  } catch (err) {
    console.error('Subscription error:', err);
    toast('Could not create subscription. Please try again.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Main subscribe button (Weekly Plan — most prominent)
  const mainBtn = document.getElementById('subscribe-btn');
  if (mainBtn) {
    mainBtn.addEventListener('click', () => {
      handleSubscribe(
        mainBtn.dataset.plan || 'Weekly Plan',
        mainBtn.dataset.price || 299
      );
    });
  }

  // All other plan buttons
  document.querySelectorAll('.sub-plan-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      handleSubscribe(
        btn.dataset.plan || 'General Subscription',
        btn.dataset.price || 0
      );
    });
  });
});
