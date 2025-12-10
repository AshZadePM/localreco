# Query Interface

A full-stack application featuring city selection and natural language query search with debouncing and state management.

## Project Structure

```
├── frontend/          # React TypeScript frontend
└── backend/          # Node.js/Express backend
```

## Setup

```bash
npm install
npm run dev
```

## Features

### Query Form
- Natural language text input bound to city selection
- Input validation (non-empty query, city required)
- Loading and error indicators
- Keyboard submission (Enter key)
- API integration with `/api/search` endpoint
- Debounced API calls to prevent excessive requests
- Global state management for query results

### Testing
- Component tests using vitest and React Testing Library
- Form validation tests
- API integration tests
- State management tests

## Extending Supported Filters

To add new filters to the query form:

1. **Update Query Context** (`src/context/QueryContext.ts`):
   - Extend `QueryRequest` interface with new filter fields
   - Update `QueryState` if needed

2. **Update Query Form** (`src/components/QueryForm.tsx`):
   - Add new input fields or selectors
   - Include new filters in the API request object

3. **Update API Endpoint**:
   - Modify `/api/search` on the backend to accept new filter parameters
   - Update request validation and processing logic

4. **Update Tests** (`src/components/QueryForm.test.tsx`):
   - Add tests for new filter fields
   - Test validation of new filters
   - Update mock API responses as needed

5. **Update Documentation**:
   - Document new filters in code comments
   - Update this README with new filter descriptions

### Example: Adding a Date Range Filter

```typescript
// 1. Update QueryContext
export interface QueryRequest {
  city: string;
  query: string;
  startDate?: string;  // New filter
  endDate?: string;    // New filter
}

// 2. Update QueryForm component to add date inputs
// 3. Update API call in useQuery hook
// 4. Update tests to cover date validation
```

## API Endpoints

### POST /api/search
Request:
```json
{
  "city": "London",
  "query": "best coffee shops"
}
```

Response:
```json
{
  "results": [
    {
      "id": "1",
      "title": "...",
      "description": "..."
    }
  ],
  "total": 10
}
```

## Development

### Run tests
```bash
npm run test
```

### Run linter
```bash
npm run lint
```

### Format code
```bash
npm run format
```
