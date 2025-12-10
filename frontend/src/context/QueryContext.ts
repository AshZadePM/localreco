import React from 'react';

export interface QueryRequest {
  city: string;
  query: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
}

export interface QueryState {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: SearchResult[] | null;
  total: number;
  error?: string;
}

export interface QueryContextType {
  queryState: QueryState;
  setQueryState: (state: QueryState) => void;
  searchQuery: (request: QueryRequest) => Promise<void>;
  clearQuery: () => void;
}

export const QueryContext = React.createContext<QueryContextType | undefined>(undefined);
