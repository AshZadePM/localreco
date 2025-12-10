import { describe, it, expect } from 'vitest';
import { City, GeolocationState, CityContextType } from './CityContext';

describe('CityContext Types', () => {
  describe('City', () => {
    it('should have required properties', () => {
      const city: City = {
        name: 'London',
        latitude: 51.5074,
        longitude: -0.1278,
      };

      expect(city.name).toBe('London');
      expect(city.latitude).toBe(51.5074);
      expect(city.longitude).toBe(-0.1278);
    });
  });

  describe('GeolocationState', () => {
    it('should support idle status', () => {
      const state: GeolocationState = {
        status: 'idle',
      };

      expect(state.status).toBe('idle');
      expect(state.error).toBeUndefined();
    });

    it('should support loading status', () => {
      const state: GeolocationState = {
        status: 'loading',
      };

      expect(state.status).toBe('loading');
    });

    it('should support success status with coordinates', () => {
      const state: GeolocationState = {
        status: 'success',
        latitude: 51.5074,
        longitude: -0.1278,
      };

      expect(state.status).toBe('success');
      expect(state.latitude).toBe(51.5074);
      expect(state.longitude).toBe(-0.1278);
    });

    it('should support error status with error message', () => {
      const state: GeolocationState = {
        status: 'error',
        error: 'Permission denied',
      };

      expect(state.status).toBe('error');
      expect(state.error).toBe('Permission denied');
    });
  });

  describe('CityContextType', () => {
    it('should define the context interface', () => {
      const mockContext: CityContextType = {
        selectedCity: {
          name: 'Paris',
          latitude: 48.8566,
          longitude: 2.3522,
        },
        setSelectedCity: () => {},
        geolocationState: {
          status: 'success',
          latitude: 48.8566,
          longitude: 2.3522,
        },
        isInitialized: true,
        clearCity: () => {},
      };

      expect(mockContext.selectedCity?.name).toBe('Paris');
      expect(mockContext.isInitialized).toBe(true);
    });

    it('should allow null selectedCity', () => {
      const mockContext: CityContextType = {
        selectedCity: null,
        setSelectedCity: () => {},
        geolocationState: {
          status: 'idle',
        },
        isInitialized: false,
        clearCity: () => {},
      };

      expect(mockContext.selectedCity).toBeNull();
    });
  });
});
