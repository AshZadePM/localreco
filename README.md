# City Selector

A reusable React city selector component with geolocation detection, autocomplete search, and global state management via Context API.

## Features

- **Geolocation Detection**: Automatically detects user's location on app load with permission handling
- **Global State Management**: CityContext + CityProvider for managing selected city across the app
- **City Autocomplete**: Search and select cities from a predefined list
- **Graceful Fallback**: Handles permission denial, unavailable location, and timeouts
- **Accessible UI**: ARIA-compliant component with proper labels and roles
- **Comprehensive Tests**: Unit tests for context logic, geocoding utilities, and UI components

## Project Structure

```
src/
├── context/
│   ├── CityContext.ts          # Context definition and types
│   ├── CityContext.test.ts     # Context tests
│   ├── CityProvider.tsx        # Provider component with geolocation logic
│   └── CityProvider.test.tsx   # Provider tests
├── hooks/
│   ├── useCity.ts             # Custom hook to access CityContext
│   └── useCity.test.ts        # Hook tests
├── components/
│   ├── CitySelector.tsx       # UI component (search + selection)
│   ├── CitySelector.css       # Component styles
│   └── CitySelector.test.tsx  # Component tests
└── utils/
    ├── geocoding.ts           # Geocoding and search utilities
    └── geocoding.test.ts      # Geocoding tests
```

## Installation

```bash
npm install
```

## Usage

### Setup Provider

Wrap your application with `CityProvider`:

```tsx
import { CityProvider } from './context/CityProvider';
import { CitySelector } from './components/CitySelector';

function App() {
  return (
    <CityProvider>
      <CitySelector />
      {/* Your other components */}
    </CityProvider>
  );
}
```

### Access City Context

Use the `useCity` hook to access the selected city and geolocation state:

```tsx
import { useCity } from './hooks/useCity';

function MyComponent() {
  const { selectedCity, setSelectedCity, geolocationState, isInitialized, clearCity } =
    useCity();

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {selectedCity && <p>Selected: {selectedCity.name}</p>}
      {geolocationState.status === 'error' && (
        <p>Error: {geolocationState.error}</p>
      )}
      <button onClick={() => clearCity()}>Clear Selection</button>
    </div>
  );
}
```

### Listen to City Changes

Pass a callback to `CityProvider` to react to city changes:

```tsx
<CityProvider
  onCityChange={(city) => {
    if (city) {
      console.log(`Selected: ${city.name}`);
      // Trigger downstream effects
    } else {
      console.log('City cleared');
    }
  }}
>
  {/* Your components */}
</CityProvider>
```

## API Reference

### CityContext

```typescript
interface City {
  name: string;
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  latitude?: number;
  longitude?: number;
}

interface CityContextType {
  selectedCity: City | null;
  setSelectedCity: (city: City) => void;
  geolocationState: GeolocationState;
  isInitialized: boolean;
  clearCity: () => void;
}
```

### CityProvider Props

```typescript
interface CityProviderProps {
  children: React.ReactNode;
  onCityChange?: (city: City | null) => void;
}
```

### useCity Hook

```typescript
const {
  selectedCity,      // Current selected city or null
  setSelectedCity,   // Function to update selected city
  geolocationState,  // Current geolocation state
  isInitialized,     // Whether geolocation has completed
  clearCity,         // Function to clear selection
} = useCity();
```

### Geocoding Utilities

#### geocodeCoordinates

Converts coordinates to a city name:

```typescript
const city = await geocodeCoordinates(latitude, longitude);
// Returns: { name: "New York", latitude: 40.7128, longitude: -74.006 } or null
```

**Failure Cases:**
- Invalid coordinates (out of range or NaN) → Returns `null`
- Network error → Throws error
- Geocoding service unavailable → Throws error

#### searchCities

Searches for cities by name:

```typescript
const cities = await searchCities('New');
// Returns: City[]
```

**Failure Cases:**
- Empty or whitespace-only query → Returns empty array `[]`
- No matching cities → Returns empty array `[]`
- Network error → Throws error
- Geocoding service unavailable → Throws error

## Failure Cases Documentation

### Geolocation Initialization

The `CityProvider` handles geolocation detection with the following failure scenarios:

#### 1. Location Permission Denied

**When:** User denies location permission in browser dialog

**State:**
```typescript
geolocationState = {
  status: 'error',
  error: 'Location permission was denied'
}
isInitialized = true
```

**Behavior:** User can still manually select a city using the search functionality

#### 2. Location Information Unavailable

**When:** Browser cannot determine location (e.g., no GPS, no network)

**State:**
```typescript
geolocationState = {
  status: 'error',
  error: 'Location information is unavailable'
}
isInitialized = true
```

**Behavior:** Falls back to manual city selection

#### 3. Location Request Timeout

**When:** Geolocation request exceeds timeout threshold

**State:**
```typescript
geolocationState = {
  status: 'error',
  error: 'The request to get user location timed out'
}
isInitialized = true
```

**Behavior:** User can proceed with manual selection

#### 4. Geolocation Not Supported

**When:** Browser doesn't support Geolocation API (unlikely in modern browsers)

**State:**
```typescript
geolocationState = {
  status: 'error',
  error: 'Geolocation is not supported by your browser'
}
isInitialized = true
```

**Behavior:** Falls back to manual city selection

#### 5. Successful Geolocation

**When:** Location is successfully detected

**State:**
```typescript
geolocationState = {
  status: 'success',
  latitude: 40.7128,
  longitude: -74.006
}
isInitialized = true
```

**Behavior:** Coordinates are available for downstream processing (e.g., reverse geocoding)

### Geocoding Failures

#### Invalid Coordinates

**When:** Coordinates are outside valid range or NaN

**Behavior:** `geocodeCoordinates()` returns `null`

**Valid Ranges:**
- Latitude: -90 to 90
- Longitude: -180 to 180

#### Unresolved Geocode

**When:** Geocoding service returns no results or fails

**Behavior:** Error is thrown with message "Failed to geocode coordinates"

**Handling:**
```typescript
try {
  const city = await geocodeCoordinates(latitude, longitude);
  if (!city) {
    // Handle no results
  }
} catch (error) {
  // Handle network or service error
}
```

### City Search Failures

#### No Matching Cities

**When:** Search query doesn't match any city in the database

**Behavior:** `searchCities()` returns empty array `[]`

**UI Display:** "No cities found matching '[query]'"

#### Search Service Error

**When:** Search request fails (network error, timeout, etc.)

**Behavior:** Error is thrown

**Handling:**
```typescript
try {
  const cities = await searchCities(query);
} catch (error) {
  // Display: "Search failed"
}
```

## Component Features

### CitySelector Component

The main UI component that users interact with:

- **Search Input**: Autocomplete search field with debouncing (300ms)
- **Suggestions List**: Displays matching cities with coordinates
- **Clear Button**: Clears selection and search input
- **Status Messages**: Shows initialization, success, and error states
- **Accessibility**: ARIA labels, roles, and state attributes
- **Responsive**: Works on desktop and mobile

### Status Messages

The component displays context-aware status messages:

1. **Loading**: "Initializing location services..." → "Detecting your location..."
2. **Success**: "Location detected (40.71°, -74.01°)" or "Selected: New York (40.71°, -74.01°)"
3. **Error**: "Location error: [error message]"

## Testing

Run tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

### Test Coverage

- **CityContext Tests**: Context creation and shape validation
- **CityProvider Tests**: 
  - Geolocation detection and success/error handling
  - Permission denial, timeout, and unavailability scenarios
  - City selection and clearing
  - Callback invocation
  - Hook usage validation
- **useCity Hook Tests**: Proper context access and error handling
- **Geocoding Tests**:
  - Valid and invalid coordinate handling
  - City search with various queries
  - Case-insensitive search
  - Error scenarios
- **CitySelector Component Tests**:
  - Rendering and labeling
  - Search functionality and debouncing
  - Result display and selection
  - Clear button behavior
  - Accessibility attributes
  - Error handling

## Performance Considerations

- **Search Debouncing**: Input changes are debounced by 300ms to avoid excessive search calls
- **Click Outside**: Click-outside-to-close functionality for suggestions dropdown
- **Memoization**: Callbacks are memoized using `useCallback` to prevent unnecessary re-renders

## Browser Compatibility

- Modern browsers with Geolocation API support
- Fallback handling for unsupported browsers
- CSS Grid and Flexbox for layout
- No polyfills required for core functionality

## Future Enhancements

1. **Real Geocoding Service**: Replace mock with Google Maps API or Nominatim
2. **Caching**: Cache search results and geolocation coordinates
3. **Recent Cities**: Store and display recently selected cities
4. **Favorites**: Allow users to save favorite cities
5. **Map Integration**: Show selected city on a map
6. **Internationalization**: Support multiple languages
7. **Timezone Info**: Display timezone for selected city

## License

MIT
