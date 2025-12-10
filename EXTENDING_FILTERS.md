# Guide to Extending Supported Filters

This document explains how to add new filter options to the query form beyond the basic city and query parameters.

## Overview

The current query form supports two filters:
- **City** (required): Selected from a dropdown
- **Query** (required): Natural language text input

To add new filters, follow the steps below in order.

## Step-by-Step Guide

### Step 1: Update the QueryRequest Type

**File**: `frontend/src/context/QueryContext.ts`

Add new properties to the `QueryRequest` interface. Each new filter should be optional to maintain backward compatibility.

```typescript
export interface QueryRequest {
  city: string;
  query: string;
  category?: string;        // Example: add a category filter
  radius?: number;          // Example: add a radius filter (in km)
  priceRange?: {            // Example: nested object
    min?: number;
    max?: number;
  };
  sortBy?: 'relevance' | 'distance' | 'rating';  // Example: enum
}
```

### Step 2: Update the QueryForm Component

**File**: `frontend/src/components/QueryForm.tsx`

Add input fields and state management for new filters.

#### Example: Adding a Category Filter

```typescript
// Add state for new filter
const [category, setCategory] = useState('');

// Add input field in render
<div className="form-group">
  <label htmlFor="category-select" className="form-label">
    Category
  </label>
  <select
    id="category-select"
    value={category}
    onChange={(e) => {
      setCategory(e.target.value);
      setValidationErrors([]);
    }}
    className="query-input"
    data-testid="category-select"
    disabled={queryState.status === 'loading'}
  >
    <option value="">All Categories</option>
    <option value="restaurants">Restaurants</option>
    <option value="cafes">Cafes</option>
    <option value="bars">Bars</option>
  </select>
</div>

// Include new filter in searchQuery call
await searchQuery({
  city: selectedCity!.name,
  query: query.trim(),
  category: category || undefined,  // Omit if empty
});
```

#### Adding Validation for New Filters

Update the `validateInputs` function if the filter is required:

```typescript
const validateInputs = (): boolean => {
  const errors: string[] = [];

  if (!selectedCity) {
    errors.push('Please select a city');
  }

  if (!query.trim()) {
    errors.push('Please enter a search query');
  }

  if (!category) {  // If category becomes required
    errors.push('Please select a category');
  }

  setValidationErrors(errors);
  return errors.length === 0;
};
```

### Step 3: Update the Backend API

**File**: `backend/src/index.ts`

Modify the `/api/search` endpoint to accept and process new filters.

```typescript
interface SearchRequest {
  city: string;
  query: string;
  category?: string;
  radius?: number;
}

app.post('/api/search', (req: Request, res: Response) => {
  const { city, query, category, radius } = req.body as SearchRequest;

  // Validate required fields
  if (!city || !query) {
    res.status(400).json({ error: 'City and query are required' });
    return;
  }

  // Validate new filter values if needed
  if (category && !['restaurants', 'cafes', 'bars'].includes(category)) {
    res.status(400).json({ error: 'Invalid category' });
    return;
  }

  if (radius && (radius < 1 || radius > 100)) {
    res.status(400).json({ error: 'Radius must be between 1 and 100' });
    return;
  }

  // Process with filters
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: `${category ? category.substring(0, -1) + ': ' : ''}Result 1 for "${query}" in ${city}`,
      description: `${radius ? `Within ${radius}km. ` : ''}Sample result 1`,
    },
    // ... more results
  ];

  const response: SearchResponse = {
    results: mockResults,
    total: mockResults.length,
  };

  res.json(response);
});
```

### Step 4: Update Component Tests

**File**: `frontend/src/components/QueryForm.test.tsx`

Add tests for the new filter field.

```typescript
it('shows validation error when category is not selected', async () => {
  const user = userEvent.setup();
  render(<QueryFormWithProviders />);

  // Select city
  const selectCityButton = screen.getByTestId('select-city-button');
  await user.click(selectCityButton);

  // Enter query
  const queryInput = screen.getByTestId('query-input');
  await user.type(queryInput, 'test');

  // Try to submit without selecting category
  const submitButton = screen.getByTestId('submit-button');
  await user.click(submitButton);

  await waitFor(() => {
    const validationErrors = screen.getByTestId('validation-errors');
    expect(within(validationErrors).getByText(/select a category/i)).toBeInTheDocument();
  });
});

it('includes category in API call', async () => {
  const user = userEvent.setup();
  render(<QueryFormWithProviders />);

  // Select city
  const selectCityButton = screen.getByTestId('select-city-button');
  await user.click(selectCityButton);

  // Select category
  const categorySelect = screen.getByTestId('category-select');
  await user.selectOption(categorySelect, 'restaurants');

  // Enter query
  const queryInput = screen.getByTestId('query-input');
  await user.type(queryInput, 'best food');

  // Submit
  const submitButton = screen.getByTestId('submit-button');
  await user.click(submitButton);

  await waitFor(() => {
    expect(mockAxios.post).toHaveBeenCalledWith('/api/search', {
      city: 'London',
      query: 'best food',
      category: 'restaurants',
    });
  });
});

it('handles optional category filter', async () => {
  const user = userEvent.setup();
  render(<QueryFormWithProviders />);

  // Select city
  const selectCityButton = screen.getByTestId('select-city-button');
  await user.click(selectCityButton);

  // Don't select category (leave as empty/all)
  const queryInput = screen.getByTestId('query-input');
  await user.type(queryInput, 'food');

  // Submit
  const submitButton = screen.getByTestId('submit-button');
  await user.click(submitButton);

  await waitFor(() => {
    expect(mockAxios.post).toHaveBeenCalledWith('/api/search', {
      city: 'London',
      query: 'food',
      category: undefined,
    });
  });
});
```

### Step 5: Add Styling for New Filters

**File**: `frontend/src/components/QueryForm.css`

If you added new UI elements that need special styling, add CSS rules:

```css
.query-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
}

.query-select:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.query-select:disabled {
  background-color: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
}
```

### Step 6: Update Documentation

Update relevant documentation files:

1. **README.md**: Add filter description to API endpoints section
2. **ARCHITECTURE.md**: Update QueryRequest interface documentation
3. Keep this file up-to-date with new examples

## Common Filter Types

### Single Select (Dropdown)

```typescript
// TypeScript
category?: string;

// Component
<select value={category} onChange={(e) => setCategory(e.target.value)}>
  <option value="">All</option>
  <option value="cat1">Category 1</option>
</select>
```

### Multi-Select

```typescript
// TypeScript
categories?: string[];

// Component
<select multiple value={categories} onChange={(e) => 
  setCategories(Array.from(e.target.selectedOptions, opt => opt.value))
}>
  <option value="cat1">Category 1</option>
  <option value="cat2">Category 2</option>
</select>
```

### Numeric Range

```typescript
// TypeScript
radius?: number;
maxPrice?: number;

// Component
<input
  type="number"
  min="1"
  max="100"
  value={radius}
  onChange={(e) => setRadius(e.target.value ? parseInt(e.target.value) : undefined)}
/>
```

### Date Picker

```typescript
// TypeScript
date?: string;  // ISO format: YYYY-MM-DD

// Component
<input
  type="date"
  value={date}
  onChange={(e) => setDate(e.target.value)}
/>
```

### Checkbox (Boolean)

```typescript
// TypeScript
openNow?: boolean;

// Component
<label>
  <input
    type="checkbox"
    checked={openNow || false}
    onChange={(e) => setOpenNow(e.target.checked)}
  />
  Open Now
</label>
```

### Radio Buttons

```typescript
// TypeScript
sortBy?: 'relevance' | 'distance' | 'rating';

// Component
<div className="form-group">
  <label>
    <input
      type="radio"
      value="relevance"
      checked={sortBy === 'relevance'}
      onChange={(e) => setSortBy(e.target.value as any)}
    />
    Relevance
  </label>
  <label>
    <input
      type="radio"
      value="distance"
      checked={sortBy === 'distance'}
      onChange={(e) => setSortBy(e.target.value as any)}
    />
    Distance
  </label>
</div>
```

## Testing Checklist

When adding a new filter, ensure you test:

- [ ] Input field renders correctly
- [ ] Input field is disabled during loading
- [ ] Validation error shows if required filter is missing
- [ ] Validation error clears when user interacts with field
- [ ] Filter value is included in API call
- [ ] Filter value can be optional (not sent if empty)
- [ ] Multiple rapid changes are handled correctly
- [ ] Debouncing works with new filter

## Performance Tips

1. **Debounce Complex Filters**: If adding expensive filters, consider debouncing
   ```typescript
   const debouncedCategory = useDebounce(category, 300);
   ```

2. **Lazy Load Options**: For dropdowns with many options, consider lazy loading
   ```typescript
   const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
   
   useEffect(() => {
     // Load options only when needed
     fetchCategoryOptions().then(setCategoryOptions);
   }, []);
   ```

3. **Memoize Computed Values**: Use `useMemo` for expensive computations
   ```typescript
   const filteredResults = useMemo(() => {
     return queryState.data?.filter(result => {
       // Filter logic
     });
   }, [queryState.data, someFilter]);
   ```

## Backward Compatibility

When adding optional filters:
- Old API requests (without new filters) should still work
- Serialize new filters with `undefined` as omitted values
- Backend should have sensible defaults for missing filters

```typescript
// Don't send filter if undefined
const request = {
  city,
  query,
  ...(category && { category }),  // Only include if defined
};
```

## Common Mistakes to Avoid

1. **Forgetting to update tests**: Always add tests for new filters
2. **Not validating on backend**: Validate filter values on the server
3. **Tight coupling**: Keep filters modular and independent
4. **Ignoring UX**: Ensure new filters don't clutter the interface
5. **Missing error handling**: Handle invalid filter values gracefully

## Questions?

Refer to:
- Existing filter implementation in `QueryForm.tsx`
- Test examples in `QueryForm.test.tsx`
- API implementation in `backend/src/index.ts`
- Architecture overview in `ARCHITECTURE.md`
