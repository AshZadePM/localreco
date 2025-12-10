import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { CityProvider } from './CityProvider';
import { useCity } from '../hooks/useCity';

const TestComponent: React.FC = () => {
  const { selectedCity, setSelectedCity, geolocationState, isInitialized, clearCity } =
    useCity();

  return (
    <div>
      <div data-testid="initialized">{isInitialized ? 'true' : 'false'}</div>
      <div data-testid="geolocation-status">{geolocationState.status}</div>
      <div data-testid="geolocation-error">{geolocationState.error || 'none'}</div>
      <div data-testid="geolocation-latitude">{geolocationState.latitude || 'none'}</div>
      <div data-testid="selected-city">{selectedCity?.name || 'none'}</div>
      <button
        onClick={() =>
          setSelectedCity({ name: 'Test City', latitude: 40.7128, longitude: -74.006 })
        }
        data-testid="set-city-btn"
      >
        Set City
      </button>
      <button onClick={clearCity} data-testid="clear-city-btn">
        Clear City
      </button>
    </div>
  );
};

describe('CityProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization with geolocation support', () => {
    it('should initialize with idle state', () => {
      const mockGetCurrentPosition = vi.fn();
      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: mockGetCurrentPosition,
        },
        configurable: true,
      });

      render(
        <CityProvider>
          <TestComponent />
        </CityProvider>
      );

      expect(screen.getByTestId('geolocation-status')).toHaveTextContent('loading');
    });

    it('should set success state when geolocation succeeds', async () => {
      const mockGetCurrentPosition = vi.fn((successCallback) => {
        successCallback({
          coords: {
            latitude: 40.7128,
            longitude: -74.006,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition);
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: mockGetCurrentPosition,
        },
        configurable: true,
      });

      render(
        <CityProvider>
          <TestComponent />
        </CityProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('geolocation-status')).toHaveTextContent('success');
        expect(screen.getByTestId('geolocation-latitude')).toHaveTextContent('40.7128');
        expect(screen.getByTestId('initialized')).toHaveTextContent('true');
      });
    });

    it('should handle permission denied error', async () => {
      const mockGetCurrentPosition = vi.fn((_successCallback, errorCallback) => {
        const error = {
          code: 1, // PERMISSION_DENIED
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
          message: 'Permission denied',
        } as unknown as GeolocationPositionError;
        errorCallback(error);
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: mockGetCurrentPosition,
        },
        configurable: true,
      });

      render(
        <CityProvider>
          <TestComponent />
        </CityProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('geolocation-status')).toHaveTextContent('error');
        expect(screen.getByTestId('geolocation-error')).toHaveTextContent(
          'Location permission was denied'
        );
        expect(screen.getByTestId('initialized')).toHaveTextContent('true');
      });
    });

    it('should handle position unavailable error', async () => {
      const mockGetCurrentPosition = vi.fn((_successCallback, errorCallback) => {
        const error = {
          code: 2, // POSITION_UNAVAILABLE
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
          message: 'Position unavailable',
        } as unknown as GeolocationPositionError;
        errorCallback(error);
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: mockGetCurrentPosition,
        },
        configurable: true,
      });

      render(
        <CityProvider>
          <TestComponent />
        </CityProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('geolocation-status')).toHaveTextContent('error');
        expect(screen.getByTestId('geolocation-error')).toHaveTextContent(
          'Location information is unavailable'
        );
      });
    });

    it('should handle timeout error', async () => {
      const mockGetCurrentPosition = vi.fn((_successCallback, errorCallback) => {
        const error = {
          code: 3, // TIMEOUT
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
          message: 'Timeout',
        } as unknown as GeolocationPositionError;
        errorCallback(error);
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: mockGetCurrentPosition,
        },
        configurable: true,
      });

      render(
        <CityProvider>
          <TestComponent />
        </CityProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('geolocation-status')).toHaveTextContent('error');
        expect(screen.getByTestId('geolocation-error')).toHaveTextContent(
          'The request to get user location timed out'
        );
      });
    });
  });

  describe('initialization without geolocation support', () => {
    it('should handle missing geolocation API', async () => {
      Object.defineProperty(navigator, 'geolocation', {
        value: undefined,
        configurable: true,
      });

      render(
        <CityProvider>
          <TestComponent />
        </CityProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('geolocation-status')).toHaveTextContent('error');
        expect(screen.getByTestId('geolocation-error')).toHaveTextContent(
          'Geolocation is not supported by your browser'
        );
        expect(screen.getByTestId('initialized')).toHaveTextContent('true');
      });
    });
  });

  describe('city selection', () => {
    beforeEach(() => {
      const mockGetCurrentPosition = vi.fn((successCallback) => {
        successCallback({
          coords: {
            latitude: 40.7128,
            longitude: -74.006,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition);
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: mockGetCurrentPosition,
        },
        configurable: true,
      });
    });

    it('should update selected city', async () => {
      render(
        <CityProvider>
          <TestComponent />
        </CityProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent('true');
      });

      const setButton = screen.getByTestId('set-city-btn');
      setButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('selected-city')).toHaveTextContent('Test City');
      });
    });

    it('should clear selected city', async () => {
      render(
        <CityProvider>
          <TestComponent />
        </CityProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent('true');
      });

      const setButton = screen.getByTestId('set-city-btn');
      setButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('selected-city')).toHaveTextContent('Test City');
      });

      const clearButton = screen.getByTestId('clear-city-btn');
      clearButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('selected-city')).toHaveTextContent('none');
      });
    });
  });

  describe('onCityChange callback', () => {
    it('should call onCityChange when city is selected', async () => {
      const onCityChange = vi.fn();
      const mockGetCurrentPosition = vi.fn((successCallback) => {
        successCallback({
          coords: {
            latitude: 40.7128,
            longitude: -74.006,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition);
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: mockGetCurrentPosition,
        },
        configurable: true,
      });

      render(
        <CityProvider onCityChange={onCityChange}>
          <TestComponent />
        </CityProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent('true');
      });

      const setButton = screen.getByTestId('set-city-btn');
      setButton.click();

      await waitFor(() => {
        expect(onCityChange).toHaveBeenCalledWith({
          name: 'Test City',
          latitude: 40.7128,
          longitude: -74.006,
        });
      });
    });

    it('should call onCityChange with null when city is cleared', async () => {
      const onCityChange = vi.fn();
      const mockGetCurrentPosition = vi.fn((successCallback) => {
        successCallback({
          coords: {
            latitude: 40.7128,
            longitude: -74.006,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition);
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: mockGetCurrentPosition,
        },
        configurable: true,
      });

      render(
        <CityProvider onCityChange={onCityChange}>
          <TestComponent />
        </CityProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent('true');
      });

      const setButton = screen.getByTestId('set-city-btn');
      setButton.click();

      await waitFor(() => {
        expect(onCityChange).toHaveBeenCalled();
      });

      onCityChange.mockClear();

      const clearButton = screen.getByTestId('clear-city-btn');
      clearButton.click();

      await waitFor(() => {
        expect(onCityChange).toHaveBeenCalledWith(null);
      });
    });
  });

  it('should throw error when useCity is used outside of CityProvider', () => {
    const ConsumerComponent = () => {
      useCity();
      return null;
    };

    expect(() => {
      render(<ConsumerComponent />);
    }).toThrow('useCity must be used within a CityProvider');
  });
});
