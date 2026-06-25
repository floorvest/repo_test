/**
 * open-google.test.js
 * Tests for open-google.js
 *
 * NOTE: These tests verify that the script handles edge cases gracefully,
 * though the feature itself is not recommended for production.
 */

describe('open-google.js', () => {
  let originalReadyState;
  let originalLocalStorage;

  beforeEach(() => {
    // Reset Node.js require cache so the IIFE executes fresh each test
    jest.resetModules();
    
    // Store original readyState descriptor for restoration
    originalReadyState = Object.getOwnPropertyDescriptor(document, 'readyState');
    
    // Store original localStorage for restoration
    originalLocalStorage = global.localStorage;
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Restore readyState to its original state
    if (originalReadyState) {
      Object.defineProperty(document, 'readyState', originalReadyState);
    } else {
      // If there was no original descriptor, delete the property
      delete document.readyState;
    }
    
    // Restore localStorage
    if (originalLocalStorage) {
      global.localStorage = originalLocalStorage;
    }
  });

  test('should open google.com on first visit', () => {
    localStorage.clear();
    
    // Mock window.open
    const openSpy = jest.fn();
    window.open = openSpy;

    // Load the script - jest.resetModules() in beforeEach ensures fresh execution
    require('./open-google.js');

    expect(openSpy).toHaveBeenCalledWith(
      'https://www.google.com',
      '_blank',
      'noopener,noreferrer'
    );
  });

  test('should not open google.com on subsequent visits', () => {
    localStorage.setItem('has_visited', '1');
    
    const openSpy = jest.fn();
    window.open = openSpy;

    require('./open-google.js');

    expect(openSpy).not.toHaveBeenCalled();
  });

  test('should handle localStorage being unavailable gracefully', () => {
    // Mock localStorage.getItem to throw an error
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    // Mock window.open to verify it's called despite storage errors
    const openSpy = jest.fn();
    window.open = openSpy;

    // Suppress console warnings for this test
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Should NOT throw - graceful error handling
    expect(() => {
      require('./open-google.js');
    }).not.toThrow();

    // Verify that a warning was logged
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[open-google]'),
      expect.any(String)
    );

    getItemSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('should handle localStorage.setItem errors gracefully', () => {
    // Mock localStorage.setItem to throw an error
    const setItemSpy = jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const openSpy = jest.fn();
    window.open = openSpy;

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Should NOT throw - graceful error handling
    expect(() => {
      require('./open-google.js');
    }).not.toThrow();

    // Should still attempt to open the window despite setItem failure
    expect(openSpy).toHaveBeenCalledWith(
      'https://www.google.com',
      '_blank',
      'noopener,noreferrer'
    );

    setItemSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('should mark user as visited when successful', () => {
    localStorage.clear();

    const openSpy = jest.fn();
    window.open = openSpy;

    require('./open-google.js');

    expect(localStorage.getItem('has_visited')).toBe('1');
  });

  test('should use noopener,noreferrer for security', () => {
    localStorage.clear();

    const openSpy = jest.fn();
    window.open = openSpy;

    require('./open-google.js');

    // Verify the third parameter includes security attributes
    const callArgs = openSpy.mock.calls[0];
    expect(callArgs[2]).toContain('noopener');
    expect(callArgs[2]).toContain('noreferrer');
  });

  test('should handle window.open errors gracefully', () => {
    localStorage.clear();

    const openSpy = jest.fn().mockImplementation(() => {
      throw new Error('Popup blocked');
    });
    window.open = openSpy;

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Should NOT throw - graceful error handling
    expect(() => {
      require('./open-google.js');
    }).not.toThrow();

    consoleWarnSpy.mockRestore();
  });
});
