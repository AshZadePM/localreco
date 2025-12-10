import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCity } from './useCity';
import { CityProvider } from '../context/CityProvider';

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn((success) =>
    success({
      coords: { latitude: 51.5074, longitude: -0.1278 },
    })
  ),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CityProvider>{children}</CityProvider>
);

describe('useCity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns city context', () => {
    const { result } = renderHook(() => useCity(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.selectedCity).toBeDefined();
    expect(result.current.setSelectedCity).toBeDefined();
    expect(result.current.geolocationState).toBeDefined();
    expect(result.current.isInitialized).toBeDefined();
    expect(result.current.clearCity).toBeDefined();
  });

  it('throws error when used without provider', () => {
    expect(() => {
      renderHook(() => useCity());
    }).toThrow('useCity must be used within a CityProvider');
  });

  it('has correct initial values', () => {
    const { result } = renderHook(() => useCity(), { wrapper });

    expect(result.current.selectedCity).toBeNull();
    expect(result.current.geolocationState.status).toBe('loading');
    expect(result.current.isInitialized).toBe(false);
  });
});
