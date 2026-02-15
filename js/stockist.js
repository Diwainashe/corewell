/*
  Stockist form handler

  This module attaches a submit handler to the stockist request form.
  When the user submits the form, it prevents the default browser
  submission, collects the form fields and writes them to the
  Firestore “stockistRequests” collection. A timestamp is included so
  that submissions can be sorted chronologically. After saving the
  request, the form is reset and a thank-you alert is shown. If an
  error occurs during saving, the user is notified. Users do not
  need to be logged in to submit a stockist request.

  To use this module, give the form element the ID “stockist-form”
  and include this script as a module. Ensure that firebase.js is
  loaded before this script.
*/

import { db, collection, addDoc, serverTimestamp } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('stockist-form');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const company = document.getElementById('company').value;
    const message = document.getElementById('message').value;
    try {
      await addDoc(collection(db, 'stockistRequests'), {
        name,
        email,
        company,
        message,
        createdAt: serverTimestamp(),
      });
      alert('Thank you! We will contact you soon.');
      form.reset();
    } catch (error) {
      console.error('Error submitting stockist request:', error);
      alert('Failed to submit your request. Please try again later.');
    }
  });
});