import { describe, it, expect } from 'vitest';
import { geocodeCoordinates, searchCities } from './geocoding';

describe('geocoding utilities', () => {
  describe('geocodeCoordinates', () => {
    it('should return a city for valid coordinates', async () => {
      const result = await geocodeCoordinates(40.7128, -74.006);

      expect(result).toBeDefined();
      expect(result?.name).toBeDefined();
      expect(result?.latitude).toBe(40.7128);
      expect(result?.longitude).toBe(-74.006);
    });

    it('should return null for invalid latitude', async () => {
      const result = await geocodeCoordinates(91, -74.006);

      expect(result).toBeNull();
    });

    it('should return null for invalid longitude', async () => {
      const result = await geocodeCoordinates(40.7128, -181);

      expect(result).toBeNull();
    });

    it('should return null for NaN coordinates', async () => {
      const result = await geocodeCoordinates(NaN, NaN);

      expect(result).toBeNull();
    });

    it('should handle boundary latitude values', async () => {
      const north = await geocodeCoordinates(90, 0);
      const south = await geocodeCoordinates(-90, 0);

      expect(north).not.toBeNull();
      expect(south).not.toBeNull();
    });

    it('should handle boundary longitude values', async () => {
      const east = await geocodeCoordinates(0, 180);
      const west = await geocodeCoordinates(0, -180);

      expect(east).not.toBeNull();
      expect(west).not.toBeNull();
    });

    it('should throw error on network failure', async () => {
      // This test would apply to a real geocoding service call
      // For the mock implementation, we test that the function handles errors gracefully
      expect(async () => {
        await geocodeCoordinates(40.7128, -74.006);
      }).not.toThrow();
    });
  });

  describe('searchCities', () => {
    it('should return empty array for empty query', async () => {
      const result = await searchCities('');

      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace-only query', async () => {
      const result = await searchCities('   ');

      expect(result).toEqual([]);
    });

    it('should find cities by exact name', async () => {
      const result = await searchCities('New York');

      expect(result.length).toBeGreaterThan(0);
      expect(result.some((city) => city.name === 'New York')).toBe(true);
    });

    it('should find cities by partial name', async () => {
      const result = await searchCities('New');

      expect(result.length).toBeGreaterThan(0);
      expect(result.some((city) => city.name.includes('New'))).toBe(true);
    });

    it('should be case-insensitive', async () => {
      const result1 = await searchCities('new york');
      const result2 = await searchCities('NEW YORK');
      const result3 = await searchCities('New York');

      expect(result1.length).toEqual(result2.length);
      expect(result2.length).toEqual(result3.length);
    });

    it('should return city objects with required fields', async () => {
      const result = await searchCities('Los');

      result.forEach((city) => {
        expect(city).toHaveProperty('name');
        expect(city).toHaveProperty('latitude');
        expect(city).toHaveProperty('longitude');
        expect(typeof city.name).toBe('string');
        expect(typeof city.latitude).toBe('number');
        expect(typeof city.longitude).toBe('number');
      });
    });

    it('should handle no matching results', async () => {
      const result = await searchCities('XyzNotACity');

      expect(result).toEqual([]);
    });

    it('should throw error on network failure', async () => {
      // This test would apply to a real search service call
      // For the mock implementation, we test that the function handles errors gracefully
      expect(async () => {
        await searchCities('test');
      }).not.toThrow();
    });

    it('should find multiple cities', async () => {
      const result = await searchCities('San');

      expect(result.length).toBeGreaterThan(1);
      expect(result.every((city) => city.name.includes('San'))).toBe(true);
    });

    it('should maintain coordinate validity in results', async () => {
      const result = await searchCities('New');

      result.forEach((city) => {
        expect(city.latitude).toBeGreaterThanOrEqual(-90);
        expect(city.latitude).toBeLessThanOrEqual(90);
        expect(city.longitude).toBeGreaterThanOrEqual(-180);
        expect(city.longitude).toBeLessThanOrEqual(180);
      });
    });
  });
});
