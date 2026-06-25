/**
 * open-google.js
 * ─────────────────────────────────────────────────────────────────
 * DEPRECATED: This module is NOT RECOMMENDED for production use.
 * 
 * Opening external sites without explicit user consent (via a click) 
 * is considered malicious behavior by browsers and users. This causes:
 *  - Browser popup blocker interference
 *  - Potential security warnings
 *  - SEO penalties
 *  - TOS violations with ad networks/hosting
 *  - Loss of user trust
 *
 * If you must open a URL, wait for a user click (a gesture) to bypass
 * popup blockers and maintain user trust.
 */

(() => {
  'use strict';

  const LS_VISITED_KEY = 'has_visited';

  /**
   * Safely checks localStorage and opens a URL on first visit.
   * IMPORTANT: This function will NOT work as intended for most users
   * due to popup blocker restrictions. Modern browsers block popup
   * window.open() calls that are not triggered by user interaction.
   */
  function tryOpenGoogleOnFirstVisit() {
    let hasVisited;
    
    try {
      hasVisited = localStorage.getItem(LS_VISITED_KEY);
    } catch (err) {
      // localStorage may be unavailable in private/incognito mode
      // or when storage quota is exceeded. Fail gracefully.
      console.warn('[open-google] Could not access localStorage:', err.message);
      return;
    }

    if (!hasVisited) {
      try {
        localStorage.setItem(LS_VISITED_KEY, '1');
      } catch (err) {
        // Even if getItem worked, setItem might fail due to quota
        console.warn('[open-google] Could not write to localStorage:', err.message);
        // Continue anyway - we'll still attempt to open the window
      }
      
      // Attempt to open with noopener/noreferrer for security
      // NOTE: This will likely be blocked by popup blockers since
      // there is no user gesture. Consider requiring a click instead.
      try {
        window.open('https://www.google.com', '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.warn('[open-google] Could not open window:', err.message);
      }
    }
  }

  // Only attempt to execute if in a browser environment
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    tryOpenGoogleOnFirstVisit();
  }
})();
