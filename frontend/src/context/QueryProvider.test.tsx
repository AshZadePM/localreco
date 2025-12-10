import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryProvider } from './QueryProvider';
import { useQuery } from '../hooks/useQuery';
import axios from 'axios';

vi.mock('axios');
const mockAxios = axios as any;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryProvider>{children}</QueryProvider>
);

describe('QueryProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides initial query state', () => {
    mockAxios.post.mockResolvedValue({
      data: {
        results: [],
        total: 0,
      },
    });

    const { result } = renderHook(() => useQuery(), { wrapper });

    expect(result.current.queryState.status).toBe('idle');
    expect(result.current.queryState.data).toBeNull();
    expect(result.current.queryState.total).toBe(0);
  });

  it('sets loading state when searching', async () => {
    let resolveSearch: () => void;
    const searchPromise = new Promise<void>((resolve) => {
      resolveSearch = resolve;
    });

    mockAxios.post.mockReturnValue(searchPromise);

    const { result } = renderHook(() => useQuery(), { wrapper });

    act(() => {
      result.current.searchQuery({
        city: 'London',
        query: 'coffee',
      });
    });

    await waitFor(() => {
      expect(result.current.queryState.status).toBe('loading');
    });

    resolveSearch!();
  });

  it('sets success state with results', async () => {
    const mockResults = [
      {
        id: '1',
        title: 'Result 1',
        description: 'Description 1',
      },
      {
        id: '2',
        title: 'Result 2',
        description: 'Description 2',
      },
    ];

    mockAxios.post.mockResolvedValue({
      data: {
        results: mockResults,
        total: 2,
      },
    });

    const { result } = renderHook(() => useQuery(), { wrapper });

    await act(async () => {
      await result.current.searchQuery({
        city: 'London',
        query: 'coffee',
      });
    });

    expect(result.current.queryState.status).toBe('success');
    expect(result.current.queryState.data).toEqual(mockResults);
    expect(result.current.queryState.total).toBe(2);
  });

  it('sets error state on API error', async () => {
    mockAxios.post.mockRejectedValue({
      response: {
        data: {
          error: 'Search failed',
        },
      },
    });
    mockAxios.isAxiosError.mockReturnValue(true);

    const { result } = renderHook(() => useQuery(), { wrapper });

    await act(async () => {
      await result.current.searchQuery({
        city: 'London',
        query: 'coffee',
      });
    });

    expect(result.current.queryState.status).toBe('error');
    expect(result.current.queryState.error).toBe('Search failed');
    expect(result.current.queryState.data).toBeNull();
  });

  it('handles generic error message', async () => {
    mockAxios.post.mockRejectedValue(new Error('Network error'));
    mockAxios.isAxiosError.mockReturnValue(false);

    const { result } = renderHook(() => useQuery(), { wrapper });

    await act(async () => {
      await result.current.searchQuery({
        city: 'London',
        query: 'coffee',
      });
    });

    expect(result.current.queryState.status).toBe('error');
    expect(result.current.queryState.error).toBe('An unknown error occurred');
  });

  it('calls API with correct parameters', async () => {
    mockAxios.post.mockResolvedValue({
      data: {
        results: [],
        total: 0,
      },
    });

    const { result } = renderHook(() => useQuery(), { wrapper });

    await act(async () => {
      await result.current.searchQuery({
        city: 'Paris',
        query: 'restaurants',
      });
    });

    expect(mockAxios.post).toHaveBeenCalledWith('/api/search', {
      city: 'Paris',
      query: 'restaurants',
    });
  });

  it('clears query state', async () => {
    mockAxios.post.mockResolvedValue({
      data: {
        results: [
          {
            id: '1',
            title: 'Result 1',
            description: 'Description 1',
          },
        ],
        total: 1,
      },
    });

    const { result } = renderHook(() => useQuery(), { wrapper });

    // First do a search
    await act(async () => {
      await result.current.searchQuery({
        city: 'London',
        query: 'coffee',
      });
    });

    expect(result.current.queryState.status).toBe('success');
    expect(result.current.queryState.data).toHaveLength(1);

    // Clear
    act(() => {
      result.current.clearQuery();
    });

    expect(result.current.queryState.status).toBe('idle');
    expect(result.current.queryState.data).toBeNull();
    expect(result.current.queryState.total).toBe(0);
  });

  it('handles axios error with response', async () => {
    mockAxios.post.mockRejectedValue({
      response: {
        data: {
          error: 'Invalid query',
        },
      },
    });
    mockAxios.isAxiosError.mockReturnValue(true);

    const { result } = renderHook(() => useQuery(), { wrapper });

    await act(async () => {
      await result.current.searchQuery({
        city: 'London',
        query: '',
      });
    });

    expect(result.current.queryState.error).toBe('Invalid query');
  });

  it('handles axios error without response', async () => {
    mockAxios.post.mockRejectedValue({
      message: 'Network timeout',
    });
    mockAxios.isAxiosError.mockReturnValue(true);

    const { result } = renderHook(() => useQuery(), { wrapper });

    await act(async () => {
      await result.current.searchQuery({
        city: 'London',
        query: 'test',
      });
    });

    expect(result.current.queryState.error).toBe('Network timeout');
  });

  it('allows manual state updates via setQueryState', () => {
    const { result } = renderHook(() => useQuery(), { wrapper });

    act(() => {
      result.current.setQueryState({
        status: 'success',
        data: [
          {
            id: '1',
            title: 'Manual Result',
            description: 'Manual',
          },
        ],
        total: 1,
      });
    });

    expect(result.current.queryState.status).toBe('success');
    expect(result.current.queryState.total).toBe(1);
  });
});
