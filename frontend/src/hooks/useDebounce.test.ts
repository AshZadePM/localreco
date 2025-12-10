import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('debounces value changes', async () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 500 });

    // Should still be old value
    expect(result.current).toBe('initial');

    // Advance time
    vi.advanceTimersByTime(500);

    // Now should be updated
    expect(result.current).toBe('updated');

    vi.useRealTimers();
  });

  it('respects the delay parameter', async () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 1000 },
    });

    // Change value
    rerender({ value: 'updated', delay: 1000 });

    // Advance less than delay
    vi.advanceTimersByTime(500);
    expect(result.current).toBe('initial');

    // Advance to delay time
    vi.advanceTimersByTime(500);
    expect(result.current).toBe('updated');

    vi.useRealTimers();
  });

  it('cancels previous timeout on multiple rapid changes', async () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'value1', delay: 500 },
    });

    rerender({ value: 'value2', delay: 500 });
    vi.advanceTimersByTime(200);

    rerender({ value: 'value3', delay: 500 });
    vi.advanceTimersByTime(200);

    // Still on initial value
    expect(result.current).toBe('value1');

    // Advance to full delay
    vi.advanceTimersByTime(300);

    // Should have final value
    expect(result.current).toBe('value3');

    vi.useRealTimers();
  });

  it('works with different types', async () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: { name: 'test' }, delay: 500 },
    });

    expect(result.current).toEqual({ name: 'test' });

    rerender({ value: { name: 'updated' }, delay: 500 });
    expect(result.current).toEqual({ name: 'test' });

    vi.advanceTimersByTime(500);
    expect(result.current).toEqual({ name: 'updated' });

    vi.useRealTimers();
  });
});
