/*
  Cart page handlers

  This module extends the functionality of the cart page to keep the
  authenticated user’s cart in sync with Firestore. It imports the
  Firebase auth and Firestore helpers and defines a helper to write
  the cart to the user’s cart document. The cart array is passed in
  from the inline script in cart.html via window scope.
*/

import { auth, db, doc, setDoc } from './firebase.js';

/**
 * Persist the provided cart array to Firestore for the current user.
 * If no user is logged in, this function does nothing.
 * @param {Array} cartItems
 */
export async function saveCartToFirestore(cartItems) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await setDoc(doc(db, 'carts', user.uid), { items: cartItems });
  } catch (error) {
    console.error('Failed to save cart to Firestore:', error);
  }
}