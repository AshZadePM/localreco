import { CacheService } from '../cacheService';

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService(1);
  });

  afterEach(() => {
    cacheService.clear();
  });

  describe('get and set', () => {
    it('should store and retrieve values', () => {
      cacheService.set('key1', { data: 'value1' });
      const result = cacheService.get<{ data: string }>('key1');

      expect(result).toEqual({ data: 'value1' });
    });

    it('should return undefined for missing keys', () => {
      const result = cacheService.get('nonexistent');
      expect(result).toBeUndefined();
    });

    it('should respect TTL', async () => {
      const shortCache = new CacheService(0.1);
      shortCache.set('key1', { data: 'value1' });

      expect(shortCache.get('key1')).toBeDefined();

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(shortCache.get('key1')).toBeUndefined();
    });

    it('should handle different data types', () => {
      cacheService.set('string', 'value');
      cacheService.set('number', 42);
      cacheService.set('array', [1, 2, 3]);
      cacheService.set('object', { key: 'value' });

      expect(cacheService.get('string')).toBe('value');
      expect(cacheService.get('number')).toBe(42);
      expect(cacheService.get('array')).toEqual([1, 2, 3]);
      expect(cacheService.get('object')).toEqual({ key: 'value' });
    });
  });

  describe('getOrCompute', () => {
    it('should return cached value if available', async () => {
      const computeFn = jest.fn(async () => ({ computed: true }));

      cacheService.set('key1', { cached: true });
      const result1 = await cacheService.getOrCompute('key1', computeFn);

      expect(result1).toEqual({ cached: true });
      expect(computeFn).not.toHaveBeenCalled();
    });

    it('should compute and cache value if not available', async () => {
      const computeFn = jest.fn(async () => ({ computed: true }));

      const result = await cacheService.getOrCompute('key1', computeFn);

      expect(result).toEqual({ computed: true });
      expect(computeFn).toHaveBeenCalledTimes(1);
      expect(cacheService.get('key1')).toEqual({ computed: true });
    });

    it('should handle async functions', async () => {
      const computeFn = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { delayed: true };
      });

      const result = await cacheService.getOrCompute('key1', computeFn);

      expect(result).toEqual({ delayed: true });
    });
  });

  describe('withRateLimit', () => {
    it('should allow requests within limit', async () => {
      const computeFn = jest.fn(async () => 'success');

      for (let i = 0; i < 5; i++) {
        const result = await cacheService.withRateLimit('user1', computeFn);
        expect(result).toBe('success');
      }

      expect(computeFn).toHaveBeenCalledTimes(5);
    });

    it('should return null when rate limit exceeded', async () => {
      const computeFn = jest.fn(async () => 'success');

      for (let i = 0; i < 35; i++) {
        await cacheService.withRateLimit('user1', computeFn);
      }

      const result = await cacheService.withRateLimit('user1', computeFn);
      expect(result).toBeNull();
    });

    it('should track different identifiers separately', async () => {
      const computeFn = jest.fn(async () => 'success');

      for (let i = 0; i < 5; i++) {
        const result1 = await cacheService.withRateLimit('user1', computeFn);
        const result2 = await cacheService.withRateLimit('user2', computeFn);

        expect(result1).toBe('success');
        expect(result2).toBe('success');
      }

      expect(computeFn).toHaveBeenCalledTimes(10);
    });
  });

  describe('clear', () => {
    it('should clear all cached values', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');

      cacheService.clear();

      expect(cacheService.get('key1')).toBeUndefined();
      expect(cacheService.get('key2')).toBeUndefined();
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cacheService.set('key1', 'value1');
      cacheService.get('key1');

      const stats = cacheService.getStats();
      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
    });
  });
});
