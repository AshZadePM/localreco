import axios from 'axios';

interface PlaceData {
  name: string;
  url: string;
  formattedAddress?: string;
  placeId?: string;
}

async function enrichRestaurantWithMapUrl(restaurantName: string, city: string): Promise<PlaceData> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn('Google Maps API key not configured, returning restaurant name without URL');
    return {
      name: restaurantName,
      url: `https://www.google.com/maps/search/${encodeURIComponent(`${restaurantName} ${city}`)}`,
    };
  }

  try {
    const searchQuery = `${restaurantName} restaurant ${city}`;

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: searchQuery,
        key: apiKey,
      },
      timeout: 5000,
    });

    if (response.data.results && response.data.results.length > 0) {
      const place = response.data.results[0];

      return {
        name: place.name || restaurantName,
        url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`,
        formattedAddress: place.formatted_address,
        placeId: place.place_id,
      };
    }

    return {
      name: restaurantName,
      url: `https://www.google.com/maps/search/${encodeURIComponent(`${restaurantName} ${city}`)}`,
    };
  } catch (error) {
    console.warn(
      `Failed to enrich restaurant ${restaurantName} with Google Maps data:`,
      error instanceof Error ? error.message : String(error)
    );

    return {
      name: restaurantName,
      url: `https://www.google.com/maps/search/${encodeURIComponent(`${restaurantName} ${city}`)}`,
    };
  }
}

async function enrichRestaurantsBatch(restaurantNames: string[], city: string): Promise<PlaceData[]> {
  return Promise.all(restaurantNames.map(name => enrichRestaurantWithMapUrl(name, city)));
}

export { enrichRestaurantWithMapUrl, enrichRestaurantsBatch, PlaceData };
