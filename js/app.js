/*
  CoreWell JavaScript

  This script handles common behaviours across the CoreWell site:
  - toggling the mobile navigation on small screens
  - updating the year in the footer
  - keeping track of the cart using localStorage and updating the cart counter
  - handling Add to Cart interactions on product cards
  - switching between login and logout depending on user authentication status

  Note: In a production environment authentication and cart management should
  happen on a secure server. This implementation is only intended for
  demonstration and local development purposes.
*/

// Use an ES module to allow imports. This script manages global site
// behaviours including navigation toggling, updating the year, cart
// interactions and authentication state via Firebase.

import { auth, onAuthStateChanged, signOut, db, doc, getDoc, setDoc } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Mobile navigation toggling
  const menuToggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.main-nav ul');
  if (menuToggle && navList) {
    menuToggle.addEventListener('click', () => {
      navList.classList.toggle('active');
    });
  }

  // Product definitions. In a real application this would be fetched
  // from an API or database. Prices are placeholders.
  const products = [
    { id: 'glow-boost', name: 'Glow Boost', price: 59.99 },
    { id: 'colon-cleanse', name: 'Colon Cleanse', price: 59.99 },
    { id: 'iron-boost', name: 'Iron Boost', price: 59.99 },
  ];

  // Retrieve cart from localStorage or initialize empty
  let cart = [];
  try {
    const stored = localStorage.getItem('corewellCart');
    cart = stored ? JSON.parse(stored) : [];
  } catch (err) {
    cart = [];
  }

  /**
   * Load the authenticated user’s cart from Firestore. When a user
   * logs in, this will replace the local cart with the server version.
   * If no cart exists in Firestore for the user, one will be created.
   */
  async function loadUserCart(user) {
    try {
      const cartDocRef = doc(db, 'carts', user.uid);
      const snap = await getDoc(cartDocRef);
      if (snap.exists()) {
        const data = snap.data();
        // Replace local cart with Firestore cart
        cart = Array.isArray(data.items) ? data.items : [];
      } else {
        // Create an empty cart document for new users
        await setDoc(cartDocRef, { items: [] });
        cart = [];
      }
      // Save to localStorage for offline persistence
      localStorage.setItem('corewellCart', JSON.stringify(cart));
      updateCartCount();
    } catch (error) {
      console.error('Failed to load cart from Firestore:', error);
    }
  }

  /**
   * Synchronise the current cart to Firestore for the authenticated user.
   * This writes the array of items to the user’s cart document.
   */
  async function syncCartToFirestore() {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, 'carts', user.uid), { items: cart });
    } catch (error) {
      console.error('Failed to sync cart to Firestore:', error);
    }
  }

  // Update cart count indicator
  const cartCountEl = document.getElementById('cart-count');
  function updateCartCount() {
    if (!cartCountEl) return;
    const total = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCountEl.textContent = total;
  }
  updateCartCount();

  // Bind add to cart buttons
  document.querySelectorAll('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const id = event.currentTarget.dataset.id;
      const product = products.find((p) => p.id === id);
      if (!product) return;
      const existing = cart.find((item) => item.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      localStorage.setItem('corewellCart', JSON.stringify(cart));
      updateCartCount();
      alert(`${product.name} added to cart.`);

      // Persist cart to Firestore if user is logged in
      syncCartToFirestore();
    });
  });

  // Authentication: update the login/logout link based on Firebase auth state
  // Helper to update the login/logout link. Because the header is loaded
  // asynchronously, always query for the link when updating state.
  function setLoggedOut() {
    const link = document.querySelector('.main-nav a[href="login.html"], .main-nav a[href="#logout"]');
    if (link) {
      link.textContent = 'Login';
      link.setAttribute('href', 'login.html');
    }
  }
  function setLoggedIn() {
    const link = document.querySelector('.main-nav a[href="login.html"], .main-nav a[href="#logout"]');
    if (link) {
      link.textContent = 'Logout';
      link.setAttribute('href', '#logout');
    }
  }

  // Listen for auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setLoggedIn();
      // Load the user’s cart from Firestore on login
      loadUserCart(user);
    } else {
      setLoggedOut();
    }
  });

  document.addEventListener('click', async (e) => {
    // Delegate logout click handler: if the user clicks on a link with href="#logout"
    const target = e.target.closest('a[href="#logout"]');
    if (!target) return;
    e.preventDefault();
    try {
      await signOut(auth);
      alert('You have been logged out.');
    } catch (err) {
      alert('Error logging out.');
    }
  });

  // Highlight the active navigation link based on the current pathname
  function highlightActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      // Compare file names (ignore hash fragments)
      const page = href.split('#')[0];
      if (page === path) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  highlightActiveNav();
});
