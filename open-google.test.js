/**
 * open-google.test.js
 *
 * Tests for open-google.js
 */

import { openGoogle, DEFAULT_TARGET_URL, DEFAULT_STORAGE_KEY } from './open-google.js';

describe('openGoogle', () => {
  let originalWindow;
  let mockWindow;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Mock window.open
    mockWindow = { name: '_blank' };
    originalWindow = window.open;
    window.open = jest.fn(() => mockWindow);

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    window.open = originalWindow;
    console.log.mockRestore();
    console.warn.mockRestore();
    localStorage.clear();
  });

  describe('basic functionality', () => {
    it('should open the default URL with security flags', () => {
      openGoogle();
      expect(window.open).toHaveBeenCalledWith(
        DEFAULT_TARGET_URL,
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should open a custom URL when provided', () => {
      const customUrl = 'https://example.com';
      openGoogle({ url: customUrl });
      expect(window.open).toHaveBeenCalledWith(
        customUrl,
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should return the window object on success', () => {
      const result = openGoogle();
      expect(result).toBe(mockWindow);
    });
  });

  describe('visit tracking', () => {
    it('should record a visit in localStorage by default', () => {
      openGoogle();
      expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe('true');
    });

    it('should use a custom storage key when provided', () => {
      const customKey = 'my-custom-key';
      openGoogle({ storageKey: customKey });
      expect(localStorage.getItem(customKey)).toBe('true');
    });

    it('should skip opening if already visited (default behavior)', () => {
      localStorage.setItem(DEFAULT_STORAGE_KEY, 'true');
      const result = openGoogle();
      expect(window.open).not.toHaveBeenCalled();
      expect(result).toBeNull();
      expect(console.log).toHaveBeenCalledWith('Already visited; skipping open-google');
    });

    it('should not track visit when trackVisit is false', () => {
      openGoogle({ trackVisit: false });
      expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).toBeNull();
      expect(window.open).toHaveBeenCalled();
    });

    it('should open even if already visited when trackVisit is false', () => {
      localStorage.setItem(DEFAULT_STORAGE_KEY, 'true');
      const result = openGoogle({ trackVisit: false });
      expect(window.open).toHaveBeenCalled();
      expect(result).toBe(mockWindow);
    });
  });

  describe('error handling', () => {
    it('should handle window.open errors gracefully', () => {
      window.open = jest.fn(() => {
        throw new Error('Popup blocked');
      });
      const result = openGoogle();
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to open external URL',
        expect.any(Error)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      const storageError = new Error('QuotaExceededError');
      localStorage.setItem = jest.fn(() => {
        throw storageError;
      });

      const result = openGoogle();
      expect(result).toBe(mockWindow);
      expect(window.open).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        'localStorage not available; visit tracking skipped',
        storageError
      );
    });

    it('should handle localStorage.getItem errors gracefully', () => {
      localStorage.getItem = jest.fn(() => {
        throw new Error('Storage access denied');
      });

      // When getItem throws, openGoogle catches the error and logs a warning
      const result = openGoogle();
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to open external URL',
        expect.any(Error)
      );
    });
  });

  describe('configuration', () => {
    it('should accept all configuration options together', () => {
      const customUrl = 'https://custom.example.com';
      const customKey = 'custom-storage-key';

      openGoogle({
        url: customUrl,
        storageKey: customKey,
        trackVisit: true,
      });

      expect(window.open).toHaveBeenCalledWith(
        customUrl,
        '_blank',
        'noopener,noreferrer'
      );
      expect(localStorage.getItem(customKey)).toBe('true');
    });

    it('should use default options when none are provided', () => {
      openGoogle();
      expect(window.open).toHaveBeenCalledWith(
        DEFAULT_TARGET_URL,
        '_blank',
        'noopener,noreferrer'
      );
      expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe('true');
    });
  });

  describe('exports', () => {
    it('should export DEFAULT_TARGET_URL', () => {
      expect(DEFAULT_TARGET_URL).toBe('https://www.google.com');
    });

    it('should export DEFAULT_STORAGE_KEY', () => {
      expect(DEFAULT_STORAGE_KEY).toBe('open-google:has_visited');
    });
  });
});
