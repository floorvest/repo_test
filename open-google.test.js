/**
 * open-google.test.js
 * Unit tests for open-google.js
 */

describe('open-google.js', () => {
  let originalLocation;
  let originalWindowOpen;
  let mockWindowOpen;
  let mockConsoleInfo;
  let mockConsoleWarn;

  beforeEach(() => {
    // Store original values
    originalLocation = window.location;
    originalWindowOpen = window.open;
    mockConsoleInfo = jest.spyOn(console, 'info').mockImplementation(() => {});
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock window.open
    mockWindowOpen = jest.fn();
    window.open = mockWindowOpen;

    // Clear the script from DOM if it exists
    const existingScript = document.querySelector('script[src="open-google.js"]');
    if (existingScript) {
      existingScript.remove();
    }
  });

  afterEach(() => {
    // Restore original values
    window.open = originalWindowOpen;
    mockConsoleInfo.mockRestore();
    mockConsoleWarn.mockRestore();
    jest.clearAllMocks();
  });

  describe('Homepage detection', () => {
    it('should open Google when pathname is "/"', () => {
      delete window.location;
      window.location = { pathname: '/' };

      mockWindowOpen.mockReturnValue({ focus: jest.fn() });

      // Load the script
      require('./open-google.js');

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.google.com',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should open Google when pathname is "/index.html"', () => {
      delete window.location;
      window.location = { pathname: '/index.html' };

      mockWindowOpen.mockReturnValue({ focus: jest.fn() });

      require('./open-google.js');

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.google.com',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should open Google when pathname is empty string', () => {
      delete window.location;
      window.location = { pathname: '' };

      mockWindowOpen.mockReturnValue({ focus: jest.fn() });

      require('./open-google.js');

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.google.com',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should not open Google when pathname is "/about.html"', () => {
      delete window.location;
      window.location = { pathname: '/about.html' };

      require('./open-google.js');

      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('should not open Google when pathname is "/some/other/page"', () => {
      delete window.location;
      window.location = { pathname: '/some/other/page' };

      require('./open-google.js');

      expect(mockWindowOpen).not.toHaveBeenCalled();
    });
  });

  describe('Path normalization', () => {
    it('should normalize multiple slashes in pathname', () => {
      delete window.location;
      window.location = { pathname: '///' };

      mockWindowOpen.mockReturnValue({ focus: jest.fn() });

      require('./open-google.js');

      expect(mockWindowOpen).toHaveBeenCalled();
    });
  });

  describe('Tab focus and logging', () => {
    it('should call focus() on the opened tab', () => {
      delete window.location;
      window.location = { pathname: '/' };

      const mockTab = { focus: jest.fn() };
      mockWindowOpen.mockReturnValue(mockTab);

      require('./open-google.js');

      expect(mockTab.focus).toHaveBeenCalled();
    });

    it('should log info message when tab is successfully opened', () => {
      delete window.location;
      window.location = { pathname: '/' };

      mockWindowOpen.mockReturnValue({ focus: jest.fn() });

      require('./open-google.js');

      expect(mockConsoleInfo).toHaveBeenCalledWith(
        '[open-google] Opened https://www.google.com in a new tab.'
      );
    });

    it('should log warning message when tab opening is blocked', () => {
      delete window.location;
      window.location = { pathname: '/' };

      mockWindowOpen.mockReturnValue(null);

      require('./open-google.js');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[open-google] Pop-up was blocked by the browser. ' +
        'Allow pop-ups for this site and reload to open Google.'
      );
    });
  });

  describe('window.open parameters', () => {
    it('should use correct URL, target, and features', () => {
      delete window.location;
      window.location = { pathname: '/' };

      mockWindowOpen.mockReturnValue({ focus: jest.fn() });

      require('./open-google.js');

      const [url, target, features] = mockWindowOpen.mock.calls[0];
      expect(url).toBe('https://www.google.com');
      expect(target).toBe('_blank');
      expect(features).toBe('noopener,noreferrer');
    });
  });

  describe('DOM ready states', () => {
    it('should execute immediately if DOM is already loaded', () => {
      delete window.location;
      window.location = { pathname: '/' };

      // Simulate DOM already loaded
      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        configurable: true
      });

      mockWindowOpen.mockReturnValue({ focus: jest.fn() });

      require('./open-google.js');

      expect(mockWindowOpen).toHaveBeenCalled();
    });
  });
});
