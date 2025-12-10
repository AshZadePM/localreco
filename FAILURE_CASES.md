# City Selector - Failure Cases Documentation

This document provides detailed information about all failure scenarios and error handling in the City Selector feature.

## Table of Contents

1. [Geolocation Initialization Failures](#geolocation-initialization-failures)
2. [Geocoding Failures](#geocoding-failures)
3. [City Search Failures](#city-search-failures)
4. [UI Error States](#ui-error-states)
5. [Recovery Strategies](#recovery-strategies)

---

## Geolocation Initialization Failures

The CityProvider initializes geolocation detection when mounted. The following failure scenarios may occur:

### 1. Location Permission Denied

**Scenario:** User denies location permission in the browser's permission dialog.

**Code:**
```typescript
error.code === error.PERMISSION_DENIED // code: 1
```

**Context State After Failure:**
```typescript
{
  geolocationState: {
    status: 'error',
    error: 'Location permission was denied',
    latitude: undefined,
    longitude: undefined
  },
  isInitialized: true,
  selectedCity: null
}
```

**UI Display:**
- Status message shows: "Location error: Location permission was denied"
- Colored red with error styling
- Input field remains enabled for manual city selection

**How User Recovers:**
1. User can manually search and select a city using the autocomplete
2. User can grant permission in browser settings and refresh the page
3. Application continues to function with manual city selection

**Common Causes:**
- User clicked "Block" in browser permission dialog
- Browser has previously saved a "deny" preference for this site
- System-level location permission is disabled

---

### 2. Location Information Unavailable

**Scenario:** Browser cannot determine location (e.g., no GPS hardware, no network connectivity, indoor without WiFi triangulation).

**Code:**
```typescript
error.code === error.POSITION_UNAVAILABLE // code: 2
```

**Context State After Failure:**
```typescript
{
  geolocationState: {
    status: 'error',
    error: 'Location information is unavailable',
    latitude: undefined,
    longitude: undefined
  },
  isInitialized: true,
  selectedCity: null
}
```

**UI Display:**
- Status message shows: "Location error: Location information is unavailable"
- Colored red with error styling
- Input field enabled for manual city selection

**How User Recovers:**
1. User manually searches and selects a city
2. If on mobile, ensure location services are enabled device-wide
3. If on desktop, ensure WiFi is available for network-based geolocation
4. Try refreshing the page to retry geolocation

**Common Causes:**
- Device location services are disabled
- No network connection for IP-based geolocation
- Device in airplane mode
- GPS signal unavailable (indoors without WiFi)

---

### 3. Location Request Timeout

**Scenario:** Geolocation request exceeds the browser's timeout threshold (typically 10+ seconds).

**Code:**
```typescript
error.code === error.TIMEOUT // code: 3
```

**Context State After Failure:**
```typescript
{
  geolocationState: {
    status: 'error',
    error: 'The request to get user location timed out',
    latitude: undefined,
    longitude: undefined
  },
  isInitialized: true,
  selectedCity: null
}
```

**UI Display:**
- Status message shows: "Location error: The request to get user location timed out"
- Colored red with error styling
- Input field enabled for manual city selection

**How User Recovers:**
1. User manually searches and selects a city
2. Ensure stable internet connection
3. Try refreshing the page to retry geolocation
4. Move to a location with better WiFi/cellular signal if on mobile

**Common Causes:**
- Slow or unstable internet connection
- Poor GPS signal
- High server latency from geolocation service
- Network congestion

---

### 4. Geolocation API Not Supported

**Scenario:** Browser does not support the Geolocation API (extremely rare in modern browsers).

**Code:**
```typescript
!navigator.geolocation
```

**Context State After Failure:**
```typescript
{
  geolocationState: {
    status: 'error',
    error: 'Geolocation is not supported by your browser',
    latitude: undefined,
    longitude: undefined
  },
  isInitialized: true,
  selectedCity: null
}
```

**UI Display:**
- Status message shows: "Location error: Geolocation is not supported by your browser"
- Colored red with error styling
- Input field enabled for manual city selection

**How User Recovers:**
1. User manually searches and selects a city
2. Update to a modern browser that supports Geolocation API
3. Use an alternative browser

**Common Causes:**
- Very old browser version (pre-IE9, old Firefox, etc.)
- Browser explicitly disables geolocation feature

**Browser Support:**
- Chrome: ✅ 5+
- Firefox: ✅ 3.5+
- Safari: ✅ 5+
- Edge: ✅ All versions
- IE: ✅ 9+

---

### 5. Successful Geolocation (Not a Failure)

**Scenario:** Location is successfully detected.

**Code:**
```typescript
navigator.geolocation.getCurrentPosition(successCallback)
```

**Context State After Success:**
```typescript
{
  geolocationState: {
    status: 'success',
    error: undefined,
    latitude: 40.7128,      // User's actual latitude
    longitude: -74.006      // User's actual longitude
  },
  isInitialized: true,
  selectedCity: null        // City can be auto-populated via reverse geocoding
}
```

**UI Display:**
- Status message shows: "Location detected (40.71°, -74.01°)"
- Colored green with success styling
- Input field enabled for city selection

**What This Enables:**
- Downstream components can use coordinates for reverse geocoding
- App can pre-populate city based on location
- User can still manually search for a different city

---

## Geocoding Failures

These failures occur when converting coordinates to city names.

### Invalid Coordinates

**Scenario:** Attempting to geocode coordinates that are out of valid range or NaN.

**Valid Coordinate Ranges:**
- Latitude: -90 to 90 degrees
- Longitude: -180 to 180 degrees

**Example Invalid Values:**
```typescript
geocodeCoordinates(91, 0);      // Latitude > 90
geocodeCoordinates(0, 181);     // Longitude > 180
geocodeCoordinates(NaN, 0);     // NaN value
geocodeCoordinates(0, NaN);     // NaN value
```

**Behavior:**
```typescript
const result = await geocodeCoordinates(91, 0);
// Returns: null
```

**Handling in Code:**
```typescript
try {
  const city = await geocodeCoordinates(latitude, longitude);
  if (!city) {
    console.log('Geocoding returned no result for invalid coordinates');
    // Fall back to manual city selection
  }
} catch (error) {
  console.error('Geocoding error:', error.message);
}
```

**Common Causes:**
- Calculation error in parent code
- Corrupted or malformed data
- Data type confusion (radians vs degrees)

---

### Unresolved Geocode - No Matching Location

**Scenario:** Geocoding service returns no results for valid coordinates (rare with real services).

**Behavior:**
```typescript
const city = await geocodeCoordinates(40.1234, -100.5678);
// Returns: null (if coordinates don't match known cities)
```

**Handling:**
```typescript
const city = await geocodeCoordinates(latitude, longitude);
if (!city) {
  // Use fallback strategy:
  // 1. Show error message to user
  // 2. Ask for manual city selection
  // 3. Log coordinates for debugging
}
```

---

### Geocoding Service Error

**Scenario:** Network error or geocoding service failure when calling a real service.

**Behavior:**
```typescript
try {
  const city = await geocodeCoordinates(latitude, longitude);
} catch (error) {
  // error.message === 'Failed to geocode coordinates'
}
```

**Handling:**
```typescript
try {
  const city = await geocodeCoordinates(latitude, longitude);
} catch (error) {
  console.error('Geocoding service error:', error);
  // Fall back to manual city selection
  // Show user-friendly error message
  // Offer retry option
}
```

**Common Causes:**
- Network connectivity loss
- Geocoding service down
- Service rate limit exceeded
- Invalid API key (if using paid service)
- CORS policy violation

---

## City Search Failures

These failures occur when searching for cities by name.

### No Matching Cities

**Scenario:** Search query doesn't match any cities in the database.

**Example:**
```typescript
const results = await searchCities('XyzNotACity');
// Returns: []
```

**UI Behavior:**
- User types "XyzNotACity"
- After 300ms debounce, search is performed
- UI displays: "No cities found matching 'XyzNotACity'"
- User can continue typing to refine search
- Clear button remains available

**Handling:**
```typescript
if (results.length === 0) {
  setShowNoResultsMessage(true);
  // Suggest:
  // - Check spelling
  // - Try a partial name
  // - Try a different city
}
```

---

### Empty or Invalid Query

**Scenario:** User provides empty or whitespace-only search query.

**Behavior:**
```typescript
const results1 = await searchCities('');      // Returns []
const results2 = await searchCities('   ');   // Returns []
```

**UI Behavior:**
- No search performed
- No suggestions dropdown shown
- No error message displayed
- User can continue typing

**Implementation:**
```typescript
useEffect(() => {
  if (searchQuery.trim().length === 0) {
    setSearchResults([]);
    setShowSuggestions(false);
    return;
  }
  // Perform search...
}, [searchQuery]);
```

---

### Search Service Error

**Scenario:** Network error or search service failure.

**Behavior:**
```typescript
try {
  const results = await searchCities(query);
} catch (error) {
  // error.message === 'Failed to search cities'
}
```

**UI Display:**
- Error message appears: "Failed to search cities"
- Colored red with error styling
- Suggestions dropdown closes
- User can try again by modifying search

**Handling:**
```typescript
const [searchError, setSearchError] = useState<string | null>(null);

try {
  const results = await searchCities(query);
  setSearchResults(results);
  setSearchError(null);
} catch (error) {
  setSearchError(error instanceof Error ? error.message : 'Search failed');
  setSearchResults([]);
}
```

**Common Causes:**
- Network connectivity loss
- Search service unavailable
- Service timeout
- Rate limit exceeded
- Invalid service configuration

---

## UI Error States

The CitySelector component displays various error states to the user.

### Initialization Loading State

**When:** CityProvider is initializing geolocation on mount.

**Duration:** 0-10+ seconds depending on device and network.

**Display:**
```
Status: "Initializing location services..."
Colored: Blue (loading)
Input: Disabled
```

**User Experience:**
- User sees loading message
- Cannot interact with city selector yet
- Should see this briefly on page load

---

### Geolocation Error State

**When:** Geolocation request fails.

**Displays Error Type:**
- "Location permission was denied"
- "Location information is unavailable"
- "The request to get user location timed out"
- "Geolocation is not supported by your browser"

**Display:**
```
Status: "Location error: [error message]"
Colored: Red (error)
Input: Enabled for manual selection
```

---

### Search Error State

**When:** City search fails.

**Display:**
```
Below suggestions: "Search failed"
Colored: Red (error)
```

**User Experience:**
- Error appears below input
- Previous results cleared
- User can modify search to retry
- Input remains focused

---

### No Results State

**When:** Search completes with no matching cities.

**Display:**
```
Below suggestions: "No cities found matching '[query]'"
Colored: Gray (neutral)
```

**User Experience:**
- Suggestions dropdown is visible
- Message provides feedback
- User can refine search or try different query
- Clear button available to reset

---

## Recovery Strategies

### Complete Failure Recovery Flowchart

```
User Opens App
    ↓
Geolocation Initializes
    ├── Success → Show location coordinates
    │   └── User can manually select city from autocomplete
    │
    ├── Permission Denied → Show error message
    │   └── User manually searches for city
    │
    ├── Info Unavailable → Show error message
    │   └── User manually searches for city
    │
    ├── Timeout → Show error message
    │   └── User manually searches for city
    │
    └── Not Supported → Show error message
        └── User manually searches for city

User Searches for City
    ├── Success → Display results
    │   └── User clicks result to select
    │
    ├── No Results → Show "No cities found" message
    │   └── User refines search or tries different query
    │
    └── Service Error → Show error message
        └── User can retry by modifying search
```

### Best Practices for Error Handling in Consuming Code

```typescript
import { CityProvider, CitySelector, useCity } from 'city-selector';

function MyApp() {
  return (
    <CityProvider
      onCityChange={(city) => {
        if (city) {
          // Handle successful city selection
          fetchCityData(city);
        } else {
          // Handle city cleared
          clearCityData();
        }
      }}
    >
      <CitySelector />
      <CityInfoComponent />
    </CityProvider>
  );
}

function CityInfoComponent() {
  const { selectedCity, geolocationState, isInitialized } = useCity();

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  if (geolocationState.status === 'error') {
    console.warn('Geolocation error:', geolocationState.error);
    // App can still function with manual city selection
  }

  if (!selectedCity) {
    return <NoSelectionMessage />;
  }

  return <CityDisplay city={selectedCity} />;
}
```

### Logging and Monitoring

```typescript
const CityProvider = ({ children, onCityChange }) => {
  // ... existing code ...

  // Log initialization
  useEffect(() => {
    if (isInitialized) {
      if (geolocationState.status === 'success') {
        console.info('Geolocation successful', {
          latitude: geolocationState.latitude,
          longitude: geolocationState.longitude,
        });
      } else if (geolocationState.status === 'error') {
        console.warn('Geolocation failed', {
          error: geolocationState.error,
        });
        // Send to error tracking service
        // trackError('geolocation_failed', { error: geolocationState.error });
      }
    }
  }, [isInitialized]);

  // Log city selections
  const setSelectedCity = useCallback((city) => {
    console.info('City selected', { city });
    // trackEvent('city_selected', { city_name: city.name });
    onCityChange?.(city);
  }, [onCityChange]);
};
```

---

## Testing Failure Scenarios

See `src/context/CityProvider.test.tsx` for comprehensive test examples covering:
- Permission denied errors
- Position unavailable errors
- Timeout errors
- Missing geolocation API
- Successful geolocation

See `src/utils/geocoding.test.ts` for geocoding tests:
- Invalid coordinates
- No matching results
- Search service failures

See `src/components/CitySelector.test.tsx` for UI tests:
- Error message display
- User recovery interactions
- Accessibility with error states

---

## Summary

The City Selector feature is designed to gracefully handle all common failure scenarios:

1. **Geolocation failures** → User can manually select city
2. **Geocoding failures** → App continues with manual selection
3. **Search failures** → Error message, user can retry
4. **No results** → Helpful message, user can refine search
5. **API unavailability** → Fallback to manual selection

The application never breaks completely - it always allows manual city selection as a fallback.
