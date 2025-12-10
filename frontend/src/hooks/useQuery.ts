import { useContext } from 'react';
import { QueryContext, QueryContextType } from '../context/QueryContext';

export const useQuery = (): QueryContextType => {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error('useQuery must be used within a QueryProvider');
  }
  return context;
};
