/**
 * open-google.js
 *
 * Provides a configurable function to open Google in a new tab.
 * IMPORTANT: This function should only be called in response to a direct user gesture
 * (e.g., click event). Modern browsers block popup windows opened without user interaction.
 *
 * To use:
 *   import { openGoogle } from './open-google.js';
 *   someElement.addEventListener('click', () => {
 *     openGoogle();
 *   });
 */

const DEFAULT_TARGET_URL = 'https://www.google.com';
const DEFAULT_STORAGE_KEY = 'open-google:has_visited';

/**
 * Opens a URL in a new tab with security flags.
 * Should only be called from a user gesture handler (click, etc.).
 *
 * @param {Object} options - Configuration object
 * @param {string} options.url - The URL to open (default: Google)
 * @param {string} options.storageKey - localStorage key for tracking visits (default: namespaced key)
 * @param {boolean} options.trackVisit - Whether to record this as a visit (default: true)
 * @returns {Window|null} The opened window, or null if blocked
 */
export function openGoogle(options = {}) {
  const {
    url = DEFAULT_TARGET_URL,
    storageKey = DEFAULT_STORAGE_KEY,
    trackVisit = true,
  } = options;

  try {
    // Check if we've already visited
    if (trackVisit && localStorage.getItem(storageKey) === 'true') {
      console.log('Already visited; skipping open-google');
      return null;
    }

    // Open the URL with security flags
    const opened = window.open(url, '_blank', 'noopener,noreferrer');

    // Track the visit after successful open
    if (trackVisit) {
      try {
        localStorage.setItem(storageKey, 'true');
      } catch (e) {
        console.warn('localStorage not available; visit tracking skipped', e);
      }
    }

    return opened;
  } catch (error) {
    console.warn('Failed to open external URL', error);
    return null;
  }
}

export { DEFAULT_TARGET_URL, DEFAULT_STORAGE_KEY };
