/*
  Authentication handlers

  This module attaches submit handlers to the login and register forms.
  It imports the Firebase authentication functions and uses them to
  authenticate users. If the forms are present on the page, the
  handlers intercept submission, validate input, perform the auth
  operation and navigate to the appropriate page. Errors from
  Firebase are surfaced via alert messages. This file should be
  included only on pages that contain authentication forms (login
  and register pages).
*/

import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      if (!email || !password) {
        alert('Please enter your email and password.');
        return;
      }
      try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Login successful!');
        window.location.href = 'index.html';
      } catch (error) {
        // Display a friendly error message from Firebase
        alert(error.message || 'Failed to log in.');
      }
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const confirm = document.getElementById('reg-confirm').value;
      if (!email || !password) {
        alert('Please enter your email and password.');
        return;
      }
      if (password !== confirm) {
        alert('Passwords do not match.');
        return;
      }
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Registration successful! You can now log in.');
        window.location.href = 'login.html';
      } catch (error) {
        alert(error.message || 'Failed to register.');
      }
    });
  }
});