import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { CityProvider } from './CityProvider';
import { useCity } from '../hooks/useCity';

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CityProvider>{children}</CityProvider>
);

describe('CityProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides initial context values', () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) =>
      success({
        coords: { latitude: 51.5074, longitude: -0.1278 },
      })
    );

    const { result } = renderHook(() => useCity(), { wrapper });

    expect(result.current.selectedCity).toBeNull();
    expect(result.current.geolocationState.status).toBe('loading');
    expect(result.current.isInitialized).toBe(false);
  });

  it('sets selected city', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) =>
      success({
        coords: { latitude: 51.5074, longitude: -0.1278 },
      })
    );

    const { result } = renderHook(() => useCity(), { wrapper });

    act(() => {
      result.current.setSelectedCity({
        name: 'London',
        latitude: 51.5074,
        longitude: -0.1278,
      });
    });

    expect(result.current.selectedCity?.name).toBe('London');
  });

  it('clears selected city', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) =>
      success({
        coords: { latitude: 51.5074, longitude: -0.1278 },
      })
    );

    const { result } = renderHook(() => useCity(), { wrapper });

    act(() => {
      result.current.setSelectedCity({
        name: 'London',
        latitude: 51.5074,
        longitude: -0.1278,
      });
    });

    expect(result.current.selectedCity?.name).toBe('London');

    act(() => {
      result.current.clearCity();
    });

    expect(result.current.selectedCity).toBeNull();
  });

  it('initializes geolocation on mount', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) =>
      success({
        coords: { latitude: 51.5074, longitude: -0.1278 },
      })
    );

    renderHook(() => useCity(), { wrapper });

    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });
  });

  it('handles geolocation success', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) =>
      success({
        coords: { latitude: 48.8566, longitude: 2.3522 },
      })
    );

    const { result } = renderHook(() => useCity(), { wrapper });

    await waitFor(() => {
      expect(result.current.geolocationState.status).toBe('success');
      expect(result.current.geolocationState.latitude).toBe(48.8566);
      expect(result.current.geolocationState.longitude).toBe(2.3522);
      expect(result.current.isInitialized).toBe(true);
    });
  });

  it('handles geolocation permission denied', async () => {
    const mockError = new GeolocationPositionError();
    mockError.code = 1; // PERMISSION_DENIED
    mockError.message = 'Location permission was denied';

    mockGeolocation.getCurrentPosition.mockImplementation((success, error) =>
      error(mockError)
    );

    const { result } = renderHook(() => useCity(), { wrapper });

    await waitFor(() => {
      expect(result.current.geolocationState.status).toBe('error');
      expect(result.current.geolocationState.error).toContain('permission');
      expect(result.current.isInitialized).toBe(true);
    });
  });

  it('handles geolocation not supported', async () => {
    const originalGeolocation = global.navigator.geolocation;
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true,
    });

    const { result } = renderHook(() => useCity(), { wrapper });

    await waitFor(() => {
      expect(result.current.geolocationState.status).toBe('error');
      expect(result.current.geolocationState.error).toContain('not supported');
      expect(result.current.isInitialized).toBe(true);
    });

    // Restore
    Object.defineProperty(global.navigator, 'geolocation', {
      value: originalGeolocation,
      writable: true,
    });
  });

  it('calls onCityChange callback when city is set', async () => {
    const onCityChange = vi.fn();
    mockGeolocation.getCurrentPosition.mockImplementation((success) =>
      success({
        coords: { latitude: 51.5074, longitude: -0.1278 },
      })
    );

    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <CityProvider onCityChange={onCityChange}>{children}</CityProvider>
    );

    const { result } = renderHook(() => useCity(), { wrapper: customWrapper });

    const city = {
      name: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
    };

    act(() => {
      result.current.setSelectedCity(city);
    });

    expect(onCityChange).toHaveBeenCalledWith(city);
  });

  it('calls onCityChange with null when city is cleared', async () => {
    const onCityChange = vi.fn();
    mockGeolocation.getCurrentPosition.mockImplementation((success) =>
      success({
        coords: { latitude: 51.5074, longitude: -0.1278 },
      })
    );

    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <CityProvider onCityChange={onCityChange}>{children}</CityProvider>
    );

    const { result } = renderHook(() => useCity(), { wrapper: customWrapper });

    act(() => {
      result.current.setSelectedCity({
        name: 'London',
        latitude: 51.5074,
        longitude: -0.1278,
      });
    });

    vi.clearAllMocks();

    act(() => {
      result.current.clearCity();
    });

    expect(onCityChange).toHaveBeenCalledWith(null);
  });
});
