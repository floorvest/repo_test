/**
 * open-google.js
 * ─────────────────────────────────────────────────────────────────
 * Opens https://www.google.com in a new browser tab automatically
 * when a visitor lands on the homepage (index.html).
 *
 * HOW IT WORKS
 *  • Fires once per session (sessionStorage flag "gg_opened").
 *  • Uses window.open(), called synchronously inside the
 *    DOMContentLoaded event so it is treated as a user-initiated
 *    navigation and not blocked by most pop-up blockers.
 *
 * SESSION KEY
 *  gg_opened  – "1" – set after the tab has been opened so
 *               subsequent page reloads within the same session
 *               do not open another tab.
 */

(() => {
  'use strict';

  const SESSION_KEY = 'gg_opened';
  const TARGET_URL  = 'https://www.google.com';

  function openGoogle() {
    /* Guard: only open once per browser session */
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;

    const tab = window.open(TARGET_URL, '_blank', 'noopener,noreferrer');

    /* noopener prevents the new tab from accessing window.opener;
       noreferrer additionally suppresses the Referer header.      */

    if (tab) {
      /* Successfully opened – mark session so it does not repeat */
      sessionStorage.setItem(SESSION_KEY, '1');
    }
    /* If the browser blocked the popup, the flag is intentionally
       NOT set so the next real user interaction can retry via the
       fallback link displayed on the page (if any).              */
  }

  /* Run as early as possible while DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', openGoogle);
  } else {
    openGoogle();
  }
})();
