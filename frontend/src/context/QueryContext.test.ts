import { describe, it, expect } from 'vitest';
import { QueryRequest, QueryState } from './QueryContext';

describe('QueryContext', () => {
  describe('QueryRequest', () => {
    it('should have required properties', () => {
      const request: QueryRequest = {
        city: 'London',
        query: 'coffee shops',
      };

      expect(request.city).toBe('London');
      expect(request.query).toBe('coffee shops');
    });
  });

  describe('QueryState', () => {
    it('should support idle state', () => {
      const state: QueryState = {
        status: 'idle',
        data: null,
        total: 0,
      };

      expect(state.status).toBe('idle');
    });

    it('should support loading state', () => {
      const state: QueryState = {
        status: 'loading',
        data: null,
        total: 0,
      };

      expect(state.status).toBe('loading');
    });

    it('should support success state with data', () => {
      const state: QueryState = {
        status: 'success',
        data: [
          {
            id: '1',
            title: 'Result 1',
            description: 'Description 1',
          },
        ],
        total: 1,
      };

      expect(state.status).toBe('success');
      expect(state.data).toHaveLength(1);
      expect(state.total).toBe(1);
    });

    it('should support error state with error message', () => {
      const state: QueryState = {
        status: 'error',
        data: null,
        total: 0,
        error: 'Search failed',
      };

      expect(state.status).toBe('error');
      expect(state.error).toBe('Search failed');
    });
  });
});
