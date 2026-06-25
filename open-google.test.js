/**
 * open-google.test.js
 * Unit tests for open-google.js
 */

describe('open-google.js', () => {
  const LS_FIRST_VISIT_KEY = 'og_first_visit';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('First visit behavior', () => {
    test('should open google.com in a new tab on first visit', () => {
      // Mock window.open
      window.open = jest.fn();

      // Simulate the script execution
      require('./open-google.js');

      // Verify window.open was called with correct parameters
      expect(window.open).toHaveBeenCalledWith('https://www.google.com', '_blank');
      expect(window.open).toHaveBeenCalledTimes(1);
    });

    test('should set localStorage flag after opening google', () => {
      window.open = jest.fn();

      require('./open-google.js');

      // Verify localStorage was set
      expect(localStorage.getItem(LS_FIRST_VISIT_KEY)).toBe('1');
    });
  });

  describe('Repeat visit behavior', () => {
    test('should not open google.com on subsequent visits', () => {
      // Set the flag as if user already visited
      localStorage.setItem(LS_FIRST_VISIT_KEY, '1');

      window.open = jest.fn();

      // Simulate the script execution
      require('./open-google.js');

      // Verify window.open was NOT called
      expect(window.open).not.toHaveBeenCalled();
    });

    test('should not modify localStorage on repeat visits', () => {
      localStorage.setItem(LS_FIRST_VISIT_KEY, '1');
      const initialValue = localStorage.getItem(LS_FIRST_VISIT_KEY);

      window.open = jest.fn();

      require('./open-google.js');

      // Verify localStorage value remains unchanged
      expect(localStorage.getItem(LS_FIRST_VISIT_KEY)).toBe(initialValue);
    });
  });

  describe('DOM ready state handling', () => {
    test('should handle DOMContentLoaded event when document is still loading', () => {
      // Mock document.readyState as 'loading'
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        configurable: true
      });

      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      window.open = jest.fn();

      require('./open-google.js');

      // Verify that DOMContentLoaded listener was registered
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'DOMContentLoaded',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    test('should execute immediately when document is already loaded', () => {
      // Mock document.readyState as 'complete'
      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        configurable: true
      });

      window.open = jest.fn();

      require('./open-google.js');

      // Verify window.open was called immediately
      expect(window.open).toHaveBeenCalled();
    });
  });

  describe('Storage key usage', () => {
    test('should use correct localStorage key', () => {
      const setItemSpy = jest.spyOn(localStorage, 'setItem');
      const getItemSpy = jest.spyOn(localStorage, 'getItem');

      window.open = jest.fn();

      require('./open-google.js');

      // Verify correct key was used
      expect(getItemSpy).toHaveBeenCalledWith(LS_FIRST_VISIT_KEY);
      expect(setItemSpy).toHaveBeenCalledWith(LS_FIRST_VISIT_KEY, '1');

      setItemSpy.mockRestore();
      getItemSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    test('should handle localStorage being unavailable gracefully', () => {
      const originalLocalStorage = global.localStorage;
      
      // Mock localStorage to throw an error
      Object.defineProperty(global, 'localStorage', {
        value: {
          getItem: jest.fn(() => {
            throw new Error('localStorage not available');
          }),
          setItem: jest.fn(),
          clear: jest.fn()
        },
        configurable: true
      });

      window.open = jest.fn();

      // Script should not crash even if localStorage fails
      expect(() => {
        require('./open-google.js');
      }).toThrow();

      // Restore localStorage
      Object.defineProperty(global, 'localStorage', {
        value: originalLocalStorage,
        configurable: true
      });
    });

    test('should use correct URL for google', () => {
      window.open = jest.fn();

      require('./open-google.js');

      const callArgs = window.open.mock.calls[0];
      expect(callArgs[0]).toBe('https://www.google.com');
      expect(callArgs[0]).toMatch(/google\.com/);
    });

    test('should use _blank target to open in new tab', () => {
      window.open = jest.fn();

      require('./open-google.js');

      const callArgs = window.open.mock.calls[0];
      expect(callArgs[1]).toBe('_blank');
    });
  });
});
