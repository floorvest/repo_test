/**
 * open-google.js
 * ─────────────────────────────────────────────────────────────────
 * Opens https://www.google.com in a new browser tab exactly once
 * per page load when the visitor lands on the homepage (index.html
 * or the bare root path "/").
 *
 * HOW IT WORKS
 *  • Runs after the DOM is ready.
 *  • Guards against pop-up blockers by calling window.open() only
 *    inside the DOMContentLoaded callback (still a browser-trusted
 *    execution context on page load).
 *  • Restricts to the homepage only: pathname must be "/",
 *    "/index.html", or empty so it never fires on other pages
 *    (e.g. about.html) that might also include this script.
 *
 * BROWSER BEHAVIOUR
 *  Modern browsers may block window.open() if the user has
 *  pop-ups blocked for the site. The console.info() message
 *  below helps with debugging in that case.
 */

(() => {
  'use strict';

  /** Pathnames that are considered the "homepage". */
  const HOME_PATHS = new Set(['/', '/index.html', '']);

  function openGoogle() {
    const path = window.location.pathname.replace(/\/{2,}/g, '/'); // normalise

    if (!HOME_PATHS.has(path)) return; // not the homepage – do nothing

    const tab = window.open('https://www.google.com', '_blank', 'noopener,noreferrer');

    if (tab) {
      tab.focus();
      console.info('[open-google] Opened https://www.google.com in a new tab.');
    } else {
      console.warn(
        '[open-google] Pop-up was blocked by the browser. ' +
        'Allow pop-ups for this site and reload to open Google.'
      );
    }
  }

  /* Run after DOM is fully parsed (the safest moment for window.open). */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', openGoogle);
  } else {
    openGoogle();
  }
})();
