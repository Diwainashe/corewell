/*
  Component loader

  This module provides a helper function to load HTML fragments into the
  current document. It is used to insert the shared header and footer
  components on every page without duplicating markup. When the page
  finishes loading, it automatically fetches the header and footer
  fragments from the components folder and injects them into elements
  with the IDs "header" and "footer" respectively.
*/

// Load an HTML fragment into the element with the given container ID
export async function loadComponent(containerId, file) {
  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const response = await fetch(file);
    const html = await response.text();
    container.innerHTML = html;
  } catch (err) {
    console.error(`Failed to load component ${file}:`, err);
  }
}

// When the document is ready, load the header and footer
document.addEventListener('DOMContentLoaded', () => {
  loadComponent('header', 'components/header.html');
  loadComponent('footer', 'components/footer.html');
});