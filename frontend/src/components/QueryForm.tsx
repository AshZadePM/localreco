import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useCity } from '../hooks/useCity';
import { useQuery } from '../hooks/useQuery';
import { useDebounce } from '../hooks/useDebounce';
import './QueryForm.css';

export const QueryForm: React.FC = () => {
  const { selectedCity } = useCity();
  const { queryState, searchQuery } = useQuery();
  const [query, setQuery] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 500);
  const submitInProgressRef = useRef(false);

  const validateInputs = (): boolean => {
    const errors: string[] = [];

    if (!selectedCity) {
      errors.push('Please select a city');
    }

    if (!query.trim()) {
      errors.push('Please enter a search query');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateInputs()) {
        return;
      }

      if (submitInProgressRef.current) {
        return;
      }

      try {
        submitInProgressRef.current = true;
        await searchQuery({
          city: selectedCity!.name,
          query: query.trim(),
        });
      } finally {
        submitInProgressRef.current = false;
      }
    },
    [selectedCity, query, searchQuery]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
      }
    },
    [handleSubmit]
  );

  // Auto-debounce search only if city is selected
  useEffect(() => {
    if (debouncedQuery.trim() && selectedCity && !submitInProgressRef.current) {
      searchQuery({
        city: selectedCity.name,
        query: debouncedQuery.trim(),
      }).catch(() => {
        // Error handling is done in QueryProvider
      });
    }
  }, [debouncedQuery, selectedCity, searchQuery]);

  return (
    <form onSubmit={handleSubmit} className="query-form" data-testid="query-form">
      <div className="form-group">
        <label htmlFor="query-input" className="form-label">
          Enter Your Search Query
        </label>
        <input
          id="query-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setValidationErrors([]);
          }}
          onKeyPress={handleKeyPress}
          placeholder="What are you looking for?"
          className={`query-input ${validationErrors.length > 0 && !query.trim() ? 'error' : ''}`}
          data-testid="query-input"
          disabled={queryState.status === 'loading'}
        />
      </div>

      {validationErrors.length > 0 && (
        <div className="validation-errors" data-testid="validation-errors">
          {validationErrors.map((error, index) => (
            <div key={index} className="error-message">
              {error}
            </div>
          ))}
        </div>
      )}

      {queryState.status === 'loading' && (
        <div className="loading-indicator" data-testid="loading-indicator">
          <span className="spinner"></span>
          Searching...
        </div>
      )}

      {queryState.status === 'error' && (
        <div className="error-indicator" data-testid="error-indicator">
          <strong>Error:</strong> {queryState.error}
        </div>
      )}

      {queryState.status === 'success' && queryState.data && (
        <div className="results-summary" data-testid="results-summary">
          Found {queryState.total} result{queryState.total !== 1 ? 's' : ''}
        </div>
      )}

      <button
        type="submit"
        disabled={queryState.status === 'loading' || !selectedCity}
        className="submit-button"
        data-testid="submit-button"
      >
        {queryState.status === 'loading' ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
};
