import { describe, it, expect } from 'vitest';
import { CityContext } from './CityContext';

describe('CityContext', () => {
  it('should create a context with the correct shape', () => {
    expect(CityContext).toBeDefined();
    expect(CityContext.Consumer).toBeDefined();
    expect(CityContext.Provider).toBeDefined();
  });

  it('should have undefined default value', () => {
    expect(CityContext._currentValue).toBeUndefined();
  });
});
