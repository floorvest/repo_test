/**
 * welcome-popup.js
 * ─────────────────────────────────────────────────────────────────
 * Shows a one-time welcome popup to first-time visitors.
 *
 * HOW IT WORKS
 *  1. Fetches welcome-popups.json (same origin).
 *  2. On the very first visit a random popup index (0-7) is stored
 *     in localStorage so the same user always sees the same variant.
 *  3. If show_once = true (default) and the user has already
 *     dismissed the popup, it is never shown again.
 *  4. The popup is injected into the DOM, animated in, and removed
 *     (not just hidden) after the user closes it or clicks the CTA.
 *
 * STORAGE KEYS
 *  wp_popup_index   – integer  – which popup variant this user sees
 *  wp_popup_seen    – "1"      – set after first dismissal
 *
 * CONFIG (welcome-popups.json)
 *  show_once        – boolean  – show only on first visit (default true)
 *  popups[]         – array    – popup variant objects (see JSON file)
 */

(() => {
  'use strict';

  const CONFIG_URL        = 'welcome-popups.json';
  const LS_INDEX_KEY      = 'wp_popup_index';
  const LS_SEEN_KEY       = 'wp_popup_seen';

  /* ── Fetch config & decide whether to show ─────────────────── */
  async function init() {
    let config;

    try {
      const res = await fetch(CONFIG_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      config = await res.json();
    } catch (err) {
      console.warn('[WelcomePopup] Could not load config:', err);
      return;
    }

    const showOnce = config.show_once !== false; // default true

    /* If already seen and show_once is on → bail out */
    if (showOnce && localStorage.getItem(LS_SEEN_KEY) === '1') return;

    /* Filter to enabled variants only */
    const active = (config.popups || []).filter(p => p.enabled !== false);
    if (!active.length) return;

    /* Assign (or retrieve) a stable variant index for this user */
    let assignedIndex = parseInt(localStorage.getItem(LS_INDEX_KEY), 10);

    if (isNaN(assignedIndex) || assignedIndex >= active.length) {
      /* New user or stale index → pick a fresh random one */
      assignedIndex = Math.floor(Math.random() * active.length);
      localStorage.setItem(LS_INDEX_KEY, String(assignedIndex));
    }

    const popup = active[assignedIndex];

    renderPopup(popup, () => {
      if (showOnce) localStorage.setItem(LS_SEEN_KEY, '1');
    });
  }

  /* ── Build & inject the popup DOM ──────────────────────────── */
  function renderPopup(data, onClose) {
    const themeClass = `wp--${(data.theme || 'teal').toLowerCase()}`;

    /* Overlay */
    const overlay = document.createElement('div');
    overlay.className    = 'wp-overlay';
    overlay.role         = 'dialog';
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'wp-title');
    overlay.setAttribute('aria-describedby', 'wp-body-text');

    /* Card markup */
    overlay.innerHTML = `
      <div class="wp-card ${themeClass}" role="document">

        <button class="wp-close" aria-label="Close welcome popup" id="wp-close-btn">&#x2715;</button>

        <div class="wp-header">
          <span class="wp-badge" aria-hidden="true">${escHtml(data.badge || '👋')}</span>
          <h2  class="wp-title"    id="wp-title">${escHtml(data.title)}</h2>
          <p   class="wp-subtitle">${escHtml(data.subtitle || '')}</p>
          <div class="wp-divider"  aria-hidden="true"></div>
        </div>

        <div class="wp-body">
          <p class="wp-body-text" id="wp-body-text">${escHtml(data.body || '')}</p>
        </div>

        <div class="wp-footer">
          <a  class="wp-cta"
              href="${escAttr(data.cta_href || '#')}"
              id="wp-cta-btn"
          >${escHtml(data.cta_label || 'Let\'s Go')}</a>
          ${data.footer_note
            ? `<p class="wp-footer-note">${escHtml(data.footer_note)}</p>`
            : ''}
        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    /* Trap focus inside the modal */
    const focusable = overlay.querySelectorAll(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocus = focusable[0];
    const lastFocus  = focusable[focusable.length - 1];

    /* Auto-focus the close button */
    overlay.querySelector('#wp-close-btn').focus();

    /* Focus trap */
    overlay.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocus) {
          e.preventDefault();
          lastFocus.focus();
        }
      } else {
        if (document.activeElement === lastFocus) {
          e.preventDefault();
          firstFocus.focus();
        }
      }
    });

    /* Close on Escape */
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
    });

    /* Close button */
    overlay.querySelector('#wp-close-btn').addEventListener('click', close);

    /* CTA link also counts as "seen" */
    overlay.querySelector('#wp-cta-btn').addEventListener('click', close);

    /* Click on backdrop (outside card) closes too */
    overlay.addEventListener('click', e => {
      if (e.target === overlay) close();
    });

    /* ── Animated removal ──────────────────────────────────── */
    function close() {
      overlay.classList.add('wp-overlay--hidden');
      overlay.addEventListener('animationend', () => {
        overlay.remove();
      }, { once: true });
      onClose();
    }
  }

  /* ── Tiny HTML / attribute escape helpers ──────────────────── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escAttr(str) {
    return String(str).replace(/"/g, '&quot;');
  }

  /* ── Kick off after the DOM is ready ───────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
