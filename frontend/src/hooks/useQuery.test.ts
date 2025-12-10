import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuery } from './useQuery';
import { QueryProvider } from '../context/QueryProvider';

vi.mock('axios');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryProvider>{children}</QueryProvider>
);

describe('useQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns query context', () => {
    const { result } = renderHook(() => useQuery(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.queryState).toBeDefined();
    expect(result.current.setQueryState).toBeDefined();
    expect(result.current.searchQuery).toBeDefined();
    expect(result.current.clearQuery).toBeDefined();
  });

  it('throws error when used without provider', () => {
    expect(() => {
      renderHook(() => useQuery());
    }).toThrow('useQuery must be used within a QueryProvider');
  });

  it('has correct initial state', () => {
    const { result } = renderHook(() => useQuery(), { wrapper });

    expect(result.current.queryState.status).toBe('idle');
    expect(result.current.queryState.data).toBeNull();
    expect(result.current.queryState.total).toBe(0);
  });
});
