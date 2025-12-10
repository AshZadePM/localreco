# Architecture Documentation

## Project Overview

This is a full-stack application for searching with location and natural language query input. The architecture uses React for the frontend with context-based state management and Express.js for the backend.

## Frontend Architecture

### Directory Structure

```
frontend/src/
├── components/
│   ├── CitySelector.tsx       # City selection dropdown component
│   ├── CitySelector.css       # City selector styles
│   ├── CitySelector.test.tsx  # City selector tests
│   ├── QueryForm.tsx          # Query input form component
│   ├── QueryForm.css          # Query form styles
│   └── QueryForm.test.tsx     # Query form tests
├── context/
│   ├── CityContext.ts         # City context type definitions
│   ├── CityContext.test.ts    # City context tests
│   ├── CityProvider.tsx       # City provider component
│   ├── CityProvider.test.tsx  # City provider tests
│   ├── QueryContext.ts        # Query context type definitions
│   ├── QueryContext.test.ts   # Query context tests
│   ├── QueryProvider.tsx      # Query provider component
│   └── QueryProvider.test.tsx # Query provider tests
├── hooks/
│   ├── useCity.ts             # City context hook
│   ├── useCity.test.ts        # useCity hook tests
│   ├── useDebounce.ts         # Debouncing utility hook
│   ├── useDebounce.test.ts    # useDebounce tests
│   ├── useQuery.ts            # Query context hook
│   └── useQuery.test.ts       # useQuery hook tests
├── App.tsx                    # Main application component
├── App.css                    # App styles
├── main.tsx                   # Entry point
├── index.ts                   # Barrel export file
└── index.css                  # Global styles
```

### Context Management

#### CityContext
- **Purpose**: Manages city selection and geolocation state
- **State**:
  - `selectedCity`: Currently selected city with coordinates
  - `geolocationState`: Browser geolocation status and coordinates
  - `isInitialized`: Whether geolocation initialization is complete
- **Methods**:
  - `setSelectedCity(city)`: Select a city
  - `clearCity()`: Clear the selected city
- **Initialization**: Automatically requests browser geolocation on mount

#### QueryContext
- **Purpose**: Manages search queries and results
- **State**:
  - `status`: Loading state ('idle', 'loading', 'success', 'error')
  - `data`: Array of search results
  - `total`: Total number of results
  - `error`: Error message if search fails
- **Methods**:
  - `searchQuery(request)`: Execute a search request
  - `clearQuery()`: Clear search results
  - `setQueryState(state)`: Manually update state (for testing)

### Key Features

#### QueryForm Component
- **Input Validation**: Ensures query is non-empty and city is selected
- **Loading Indicators**: Shows spinner during API calls
- **Error Handling**: Displays error messages when API calls fail
- **Keyboard Support**: Submits form on Enter key
- **Debouncing**: Automatically debounces text input (500ms) to prevent excessive API calls
- **Success Feedback**: Shows result count after successful search

#### CitySelector Component
- **Autocomplete**: Filters cities as user types
- **Geolocation**: Displays browser geolocation status
- **Selection Display**: Shows currently selected city

### Hooks

#### useCity
- Returns the city context
- Throws error if used outside CityProvider
- Provides access to selected city and geolocation state

#### useQuery
- Returns the query context
- Throws error if used outside QueryProvider
- Provides access to search state and search function

#### useDebounce
- Generic debouncing hook
- Returns debounced value after specified delay
- Cancels previous timeouts on rapid changes

## Backend Architecture

### Directory Structure

```
backend/src/
└── index.ts          # Express server with API endpoints
```

### API Endpoints

#### GET /api/health
- **Purpose**: Health check endpoint
- **Response**: `{ message: "Backend is running" }`

#### POST /api/search
- **Purpose**: Search endpoint
- **Request**:
  ```json
  {
    "city": "London",
    "query": "coffee shops"
  }
  ```
- **Response**:
  ```json
  {
    "results": [
      {
        "id": "1",
        "title": "Result Title",
        "description": "Result Description"
      }
    ],
    "total": 1
  }
  ```
- **Validation**: Returns 400 if city or query is missing

### Current Implementation
The backend provides mock search results. In production, this should be replaced with actual search logic (database queries, external APIs, etc.).

## Testing Strategy

### Test Coverage

1. **Component Tests**: Test UI behavior, user interactions, and props
2. **Context Tests**: Test state updates and provider initialization
3. **Hook Tests**: Test hook behavior in isolation and with providers
4. **Integration Tests**: Test components with providers together

### Testing Libraries
- **vitest**: Test runner and assertion library
- **@testing-library/react**: React component testing utilities
- **@testing-library/user-event**: User interaction simulation

### Running Tests
```bash
npm run test                 # Run all tests
npm run test:ui             # Open test UI
npm run test -- --coverage  # Run with coverage report
```

## State Flow

### Query Submission Flow

1. User selects a city (CityContext updates)
2. User enters search query (local component state)
3. Query is debounced (useDebounce hook)
4. User submits form or debounce timer expires
5. QueryForm validates inputs
6. Valid query is sent to API via `searchQuery()`
7. QueryProvider manages API call state
8. Results are stored in QueryContext
9. QueryForm displays results or error message

### Component Hierarchy

```
App
├── CityProvider (manages city state)
│   └── CitySelector (selects city)
└── QueryProvider (manages query state)
    └── QueryForm (submits queries)
```

## Extending the Application

### Adding New Filters

To extend the query form with additional filters:

1. **Update QueryContext** (`frontend/src/context/QueryContext.ts`):
   ```typescript
   export interface QueryRequest {
     city: string;
     query: string;
     category?: string;  // New filter
     radius?: number;    // New filter
   }
   ```

2. **Update QueryForm** (`frontend/src/components/QueryForm.tsx`):
   - Add new input fields
   - Include new values in the searchQuery call

3. **Update API** (`backend/src/index.ts`):
   - Accept new parameters
   - Add validation if needed
   - Process new filters in search logic

4. **Update Tests**:
   - Add tests for new input fields
   - Test validation of new filters
   - Update mock API responses

### Adding New Components

When adding new components that need city or query context:

1. Ensure the component is nested within the appropriate provider
2. Use the `useCity()` or `useQuery()` hook inside the component
3. Create corresponding test file with `.test.tsx` extension
4. Update the barrel export in `frontend/src/index.ts`

## Performance Considerations

### Debouncing
The QueryForm uses a 500ms debounce on text input to reduce API calls. This can be adjusted via the `useDebounce` hook parameter.

### Memoization
- `useCallback` is used for event handlers to prevent unnecessary re-renders
- Component state is stored in context providers to avoid prop drilling

### API Calls
- Debounced automatic search prevents excessive API calls
- Submit button is disabled during loading to prevent duplicate requests

## Type Safety

The project uses TypeScript with strict mode enabled. All API responses and context values are fully typed:

- `City`: Location with coordinates
- `QueryRequest`: API request format
- `SearchResult`: Individual search result
- `QueryState`: Current query state
- All React component props are explicitly typed

## Error Handling

### User-Facing Errors
- Validation errors: Show error messages in validation box
- API errors: Display error message in error indicator
- Loading state: Show spinner during requests

### Developer-Facing Errors
- Hook usage errors: Throw descriptive errors if used outside providers
- TypeScript: Compile-time type checking catches many errors

## Future Improvements

1. **Persistence**: Store search history using localStorage
2. **Caching**: Cache API results to reduce requests
3. **Advanced Filters**: Add date ranges, price filters, etc.
4. **Search Suggestions**: Autocomplete for search queries
5. **User Authentication**: Add user accounts and saved searches
6. **Real Database**: Replace mock backend with actual database
7. **Internationalization**: Support multiple languages
