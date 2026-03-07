/*
  auth.js – handles login and register form submissions via Firebase Auth.
  Uses toast notifications instead of browser alerts.
*/

import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  db,
  doc,
  setDoc,
  serverTimestamp,
} from './firebase.js';

function toast(msg) {
  if (window.showToast) { window.showToast(msg); return; }
  // fallback if app.js not loaded yet
  const el = document.getElementById('toast');
  if (el) { el.textContent = msg; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 3000); }
}

document.addEventListener('DOMContentLoaded', () => {

  // ── LOGIN FORM ────────────────────────────────────────────────
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email    = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      if (!email || !password) { toast('Please enter your email and password.'); return; }
      const btn = loginForm.querySelector('button[type="submit"]');
      btn.textContent = 'Signing in…'; btn.disabled = true;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast('Welcome back! 🌿');
        setTimeout(() => window.location.href = 'index.html', 800);
      } catch (err) {
        toast(friendlyError(err.code));
        btn.textContent = 'Sign In'; btn.disabled = false;
      }
    });
  }

  // ── REGISTER FORM ─────────────────────────────────────────────
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name     = document.getElementById('reg-name')?.value.trim() || '';
      const email    = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirm  = document.getElementById('reg-confirm').value;
      if (!email || !password) { toast('Please fill in all fields.'); return; }
      if (password.length < 6) { toast('Password must be at least 6 characters.'); return; }
      if (password !== confirm) { toast('Passwords do not match.'); return; }
      const btn = registerForm.querySelector('button[type="submit"]');
      btn.textContent = 'Creating account…'; btn.disabled = true;
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Save user profile to Firestore
        await setDoc(doc(db, 'users', cred.user.uid), {
          name, email,
          createdAt: serverTimestamp(),
          source: 'website_register',
        });
        toast(`Welcome to CoreWell${name ? ', ' + name : ''}! 🌿`);
        setTimeout(() => window.location.href = 'index.html', 900);
      } catch (err) {
        toast(friendlyError(err.code));
        btn.textContent = 'Create Account'; btn.disabled = false;
      }
    });
  }
});

function friendlyError(code) {
  const map = {
    'auth/user-not-found':     'No account found with that email.',
    'auth/wrong-password':     'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email':      'Please enter a valid email address.',
    'auth/weak-password':      'Password is too weak. Use at least 6 characters.',
    'auth/too-many-requests':  'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'Network error. Check your connection and retry.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}
