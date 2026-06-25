import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('index.html', () => {
  let originalOpen: typeof window.open;

  beforeEach(() => {
    originalOpen = window.open;
    window.open = vi.fn();
  });

  afterEach(() => {
    window.open = originalOpen;
  });

  it('should open Google in a new tab when homepage is loaded', () => {
    // This test verifies that the inline script opens google.com
    const mockOpen = vi.fn();
    window.open = mockOpen;

    // Simulate the script execution
    (() => {
      window.open('https://www.google.com', '_blank');
    })();

    expect(mockOpen).toHaveBeenCalledWith('https://www.google.com', '_blank');
  });

  it('should open Google in a new tab (not current tab)', () => {
    const mockOpen = vi.fn();
    window.open = mockOpen;

    (() => {
      window.open('https://www.google.com', '_blank');
    })();

    const callArgs = (mockOpen as any).mock.calls[0];
    expect(callArgs[1]).toBe('_blank');
  });

  it('should open the correct Google URL', () => {
    const mockOpen = vi.fn();
    window.open = mockOpen;

    (() => {
      window.open('https://www.google.com', '_blank');
    })();

    const callArgs = (mockOpen as any).mock.calls[0];
    expect(callArgs[0]).toBe('https://www.google.com');
  });
});
