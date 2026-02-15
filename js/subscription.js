/*
  Subscription handlers

  This module attaches an event handler to the “Subscribe Now” button
  on the shop page. When the button is clicked, it checks if the user
  is authenticated via Firebase. If not, the user is redirected to
  the login page. If the user is logged in, a new subscription document
  is created in the Firestore “subscriptions” collection with the
  user’s ID and a generic plan name. In a real application you would
  capture the specific plan selected by the user, but for this demo
  the plan is fixed. After the document is created, a confirmation
  alert is displayed. Error messages are surfaced via alert.

  To use this module, include it on pages with a subscription button
  after including firebase.js and auth handling. Ensure the button
  has the ID “subscribe-btn”.
*/

import { auth, db, collection, addDoc, serverTimestamp } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const subscribeBtn = document.getElementById('subscribe-btn');
  if (!subscribeBtn) return;
  subscribeBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    // If no user is logged in, redirect to login page
    if (!user) {
      alert('Please log in to subscribe.');
      window.location.href = 'login.html';
      return;
    }
    try {
      // Create a new subscription document. For demo purposes the plan
      // name is hard coded. In a full implementation you would capture
      // the specific plan selected by the user.
      await addDoc(collection(db, 'subscriptions'), {
        userId: user.uid,
        plan: 'General Subscription',
        createdAt: serverTimestamp(),
      });
      alert('Subscription created! Thank you for subscribing.');
    } catch (error) {
      console.error('Failed to create subscription:', error);
      alert('Failed to create subscription. Please try again later.');
    }
  });
});