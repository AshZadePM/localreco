import { City } from '../context/CityContext';

/**
 * Mock geocoding function that converts coordinates to city name.
 * In a production app, this would call a real geocoding service like Google Maps API,
 * Open Street Map Nominatim, or similar.
 *
 * @param latitude - The latitude coordinate
 * @param longitude - The longitude coordinate
 * @returns Promise resolving to a City object or null if geocoding fails
 *
 * Failure cases:
 * - Network error: Rejected promise
 * - Invalid coordinates: Returns null
 * - Service timeout: Rejected promise
 */
export const geocodeCoordinates = async (
  latitude: number,
  longitude: number
): Promise<City | null> => {
  try {
    // This is a mock implementation. In production, you would call a real geocoding service.
    // Example using a real service:
    // const response = await fetch(
    //   `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    // );
    // const data = await response.json();
    // return {
    //   name: data.address.city || data.address.town || data.address.village,
    //   latitude,
    //   longitude,
    // };

    // For now, return a mock city based on coordinates
    if (isValidCoordinate(latitude, longitude)) {
      return {
        name: getCityNameFromCoordinates(latitude, longitude),
        latitude,
        longitude,
      };
    }
    return null;
  } catch {
    throw new Error('Failed to geocode coordinates');
  }
};

/**
 * Search for cities by name using autocomplete.
 * In production, this would call a service like Google Places API or Nominatim.
 *
 * @param query - The city name to search for
 * @returns Promise resolving to array of City objects
 *
 * Failure cases:
 * - Empty query: Returns empty array
 * - Network error: Rejected promise
 * - Service timeout: Rejected promise
 * - No matching cities: Returns empty array
 */
export const searchCities = async (query: string): Promise<City[]> => {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    // This is a mock implementation. In production, you would call a real service.
    // Example using Nominatim:
    // const response = await fetch(
    //   `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
    // );
    // const data = await response.json();
    // return data.map((result: any) => ({
    //   name: result.display_name.split(',')[0],
    //   latitude: parseFloat(result.lat),
    //   longitude: parseFloat(result.lon),
    // }));

    // Mock implementation with some predefined cities
    const mockCities: Record<string, City> = {
      'New York': { name: 'New York', latitude: 40.7128, longitude: -74.006 },
      'Los Angeles': { name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
      Chicago: { name: 'Chicago', latitude: 41.8781, longitude: -87.6298 },
      Houston: { name: 'Houston', latitude: 29.7604, longitude: -95.3698 },
      Phoenix: { name: 'Phoenix', latitude: 33.4484, longitude: -112.074 },
      Philadelphia: { name: 'Philadelphia', latitude: 39.9526, longitude: -75.1652 },
      'San Antonio': { name: 'San Antonio', latitude: 29.4241, longitude: -98.4936 },
      'San Diego': { name: 'San Diego', latitude: 32.7157, longitude: -117.1611 },
      Dallas: { name: 'Dallas', latitude: 32.7767, longitude: -96.797 },
      'San Jose': { name: 'San Jose', latitude: 37.3382, longitude: -121.8863 },
      Austin: { name: 'Austin', latitude: 30.2672, longitude: -97.7431 },
      Jacksonville: { name: 'Jacksonville', latitude: 30.3322, longitude: -81.6557 },
      'Fort Worth': { name: 'Fort Worth', latitude: 32.7555, longitude: -97.3308 },
      Columbus: { name: 'Columbus', latitude: 39.9612, longitude: -82.9988 },
      Indianapolis: { name: 'Indianapolis', latitude: 39.7684, longitude: -86.1581 },
      Charlotte: { name: 'Charlotte', latitude: 35.2271, longitude: -80.8431 },
      Denver: { name: 'Denver', latitude: 39.7392, longitude: -104.9903 },
      Seattle: { name: 'Seattle', latitude: 47.6062, longitude: -122.3321 },
      Boston: { name: 'Boston', latitude: 42.3601, longitude: -71.0589 },
      Miami: { name: 'Miami', latitude: 25.7617, longitude: -80.1918 },
    };

    const lowercaseQuery = query.toLowerCase();
    return Object.values(mockCities).filter(
      (city) =>
        city.name.toLowerCase().includes(lowercaseQuery) ||
        lowercaseQuery.includes(city.name.toLowerCase())
    );
  } catch {
    throw new Error('Failed to search cities');
  }
};

function isValidCoordinate(latitude: number, longitude: number): boolean {
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function getCityNameFromCoordinates(latitude: number, longitude: number): string {
  // Mock implementation: return a deterministic city based on proximity to known cities
  const cities: City[] = [
    { name: 'New York', latitude: 40.7128, longitude: -74.006 },
    { name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
    { name: 'Chicago', latitude: 41.8781, longitude: -87.6298 },
    { name: 'Houston', latitude: 29.7604, longitude: -95.3698 },
    { name: 'Phoenix', latitude: 33.4484, longitude: -112.074 },
  ];

  let closestCity = cities[0];
  let minDistance = Infinity;

  cities.forEach((city) => {
    const distance = Math.sqrt(
      Math.pow(city.latitude - latitude, 2) + Math.pow(city.longitude - longitude, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestCity = city;
    }
  });

  return closestCity.name;
}
