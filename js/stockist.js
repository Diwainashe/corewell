/*
  stockist.js – submits stockist enquiry to Firestore.
  Uses toast notifications instead of alerts.
*/

import { db, collection, addDoc, serverTimestamp } from './firebase.js';

function toast(msg) {
  if (window.showToast) { window.showToast(msg); return; }
  const el = document.getElementById('toast');
  if (el) { el.textContent = msg; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 3200); }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('stockist-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const company = document.getElementById('company').value.trim();
    const message = document.getElementById('message').value.trim();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Submitting…'; btn.disabled = true;
    try {
      await addDoc(collection(db, 'stockistRequests'), {
        name, email, company, message,
        createdAt: serverTimestamp(),
      });
      toast('Thank you! We\'ll be in touch within 48 hours 🌿');
      form.reset();
    } catch (err) {
      console.error('Stockist submission error:', err);
      toast('Submission failed. Please try again.');
    } finally {
      btn.textContent = 'Submit Enquiry'; btn.disabled = false;
    }
  });
});
