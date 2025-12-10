import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useCity } from './useCity';
import { CityProvider } from '../context/CityProvider';

describe('useCity', () => {
  it('should throw error when used outside of CityProvider', () => {
    expect(() => {
      renderHook(() => useCity());
    }).toThrow('useCity must be used within a CityProvider');
  });

  it('should return city context when used inside CityProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(CityProvider, {}, children);

    const { result } = renderHook(() => useCity(), { wrapper });

    expect(result.current).toHaveProperty('selectedCity');
    expect(result.current).toHaveProperty('setSelectedCity');
    expect(result.current).toHaveProperty('geolocationState');
    expect(result.current).toHaveProperty('isInitialized');
    expect(result.current).toHaveProperty('clearCity');
  });
});
