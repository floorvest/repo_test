/**
 * open-google.js
 * ─────────────────────────────────────────────────────────────────
 * Opens https://www.google.com in a new browser tab exactly once
 * per session, the moment the page is first accessed.
 *
 * HOW IT WORKS
 *  - Uses sessionStorage so the tab is opened only on the very first
 *    page load within the browser session (refreshes & navigation to
 *    other pages on the same site will NOT re-trigger it).
 *  - The window.open() call is placed inside a DOMContentLoaded
 *    handler to ensure the page itself is ready before the tab opens.
 *  - Most modern browsers block window.open() calls that are not
 *    tied to a direct user gesture when the page loads cold. To work
 *    around this the script opens the tab as early as possible during
 *    page load while the browser still considers it a trusted context.
 *
 * STORAGE KEY
 *  og_opened  – "1"  – set after the tab has been opened this session
 */

(() => {
  'use strict';

  const SESSION_KEY = 'og_opened';

  function openGoogle() {
    /* Guard: only open once per browser session */
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;

    /* Mark as opened BEFORE calling window.open so a fast double-load
       does not trigger a second tab                                   */
    sessionStorage.setItem(SESSION_KEY, '1');

    /* Open Google in a new tab */
    const tab = window.open('https://www.google.com', '_blank', 'noopener,noreferrer');

    /* Fallback: if the browser blocked the popup, log a warning */
    if (!tab) {
      console.warn(
        '[open-google] The browser blocked the popup. ' +
        'Please allow pop-ups for this site to enable the feature.'
      );
    }
  }

  /* Run as early as possible (DOM does not need to be ready for window.open) */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', openGoogle);
  } else {
    openGoogle();
  }
})();
