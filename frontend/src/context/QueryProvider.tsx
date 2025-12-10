import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { QueryContext, QueryState, QueryRequest } from './QueryContext';

interface QueryProviderProps {
  children: React.ReactNode;
}

const initialState: QueryState = {
  status: 'idle',
  data: null,
  total: 0,
};

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const [queryState, setQueryState] = useState<QueryState>(initialState);

  const searchQuery = useCallback(async (request: QueryRequest) => {
    try {
      setQueryState({
        status: 'loading',
        data: null,
        total: 0,
      });

      const response = await axios.post('/api/search', {
        city: request.city,
        query: request.query,
      });

      setQueryState({
        status: 'success',
        data: response.data.results,
        total: response.data.total,
      });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : 'An unknown error occurred';

      setQueryState({
        status: 'error',
        data: null,
        total: 0,
        error: errorMessage,
      });
    }
  }, []);

  const clearQuery = useCallback(() => {
    setQueryState(initialState);
  }, []);

  const value = {
    queryState,
    setQueryState,
    searchQuery,
    clearQuery,
  };

  return <QueryContext.Provider value={value}>{children}</QueryContext.Provider>;
};
