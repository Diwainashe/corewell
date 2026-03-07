/*
  Component loader – fetches shared header and footer fragments
  and injects them into #header and #footer placeholders.
*/

export async function loadComponent(id, file) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    el.innerHTML = await res.text();
  } catch (err) {
    console.error(`Failed to load component ${file}:`, err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadComponent('header', 'components/header.html');
  loadComponent('footer', 'components/footer.html');
});
