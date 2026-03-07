/*
  cart.js – helper to persist cart to Firestore.
*/

import { auth, db, doc, setDoc } from './firebase.js';

export async function saveCartToFirestore(items) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await setDoc(doc(db, 'carts', user.uid), { items });
  } catch (err) {
    console.error('Failed to save cart to Firestore:', err);
  }
}
