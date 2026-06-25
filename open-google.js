/**
 * open-google.js
 * ─────────────────────────────────────────────────────────────────
 * Opens google.com in a new tab on the first visit to the site.
 *
 * HOW IT WORKS
 *  1. Checks if this is the first visit using localStorage
 *  2. If first visit, opens google.com in a new tab
 *  3. Marks the visit in localStorage so it only happens once
 *
 * STORAGE KEY
 *  og_first_visit   – "1"  – set after first visit
 */

(() => {
  'use strict';

  const LS_FIRST_VISIT_KEY = 'og_first_visit';

  /**
   * Initialize and check if this is the first visit
   */
  function init() {
    // Check if user has already visited
    if (localStorage.getItem(LS_FIRST_VISIT_KEY) === '1') {
      return; // Already visited, don't open google.com
    }

    // Mark this visit
    localStorage.setItem(LS_FIRST_VISIT_KEY, '1');

    // Open google.com in a new tab
    window.open('https://www.google.com', '_blank');
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
