/*
  Firebase initialization and exports

  This module initializes the Firebase application using configuration
  values that you supply. It exports the Firebase authentication and
  Firestore instances as well as commonly used auth functions. To use
  Firebase, replace the placeholder configuration properties with your
  actual project values (found in your Firebase console). Because this
  module uses the modular v9 SDK with ES module imports, it can be
  consumed directly in the browser without a bundler.
*/

// Import the functions you need from the Firebase SDKs. We specify
// explicit version numbers to ensure consistent behaviour.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

// TODO: Replace the following with your app's Firebase project configuration.
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: 'AIzaSyCx44hfTIwltj8k80aRfEv-iZJJdlmrpik',
  authDomain: 'corewell-64819.firebaseapp.com',
  projectId: 'corewell-64819',
  storageBucket: 'corewell-64819.firebasestorage.app',
  messagingSenderId: '589717490620',
  appId: '1:589717490620:web:e2fbbafcc80b1f5ff279b9',
  measurementId: "G-1CDYT50Q2N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export services and helper functions
export {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  serverTimestamp,
};