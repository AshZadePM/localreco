import { analyzeSentiment, analyzeSentimentBatch } from '../sentimentService';

describe('sentimentService', () => {
  describe('analyzeSentiment', () => {
    it('should detect positive sentiment', () => {
      const text = 'This restaurant is amazing! I love the food and service.';
      const result = analyzeSentiment(text);

      expect(result.score).toBeGreaterThan(0);
      expect(result.label).toBe('positive');
    });

    it('should detect negative sentiment', () => {
      const text = 'This restaurant is terrible! The food was bad and service was awful.';
      const result = analyzeSentiment(text);

      expect(result.score).toBeLessThan(0);
      expect(result.label).toBe('negative');
    });

    it('should detect neutral sentiment', () => {
      const text = 'The restaurant is located on Main Street.';
      const result = analyzeSentiment(text);

      expect(result.label).toBe('neutral');
    });

    it('should return a comparative score', () => {
      const text = 'Great restaurant!';
      const result = analyzeSentiment(text);

      expect(typeof result.comparative).toBe('number');
    });

    it('should handle empty text gracefully', () => {
      const result = analyzeSentiment('');

      expect(result.score).toBe(0);
      expect(result.comparative).toBe(0);
      expect(result.label).toBe('neutral');
    });

    it('should handle special characters', () => {
      const text = "This place is awesome!!! 😍 The pizza is *chef's kiss*";
      const result = analyzeSentiment(text);

      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('analyzeSentimentBatch', () => {
    it('should analyze multiple texts', () => {
      const texts = [
        'Amazing restaurant!',
        'Terrible experience.',
        'It was okay.',
      ];
      const results = analyzeSentimentBatch(texts);

      expect(results.length).toBe(3);
      expect(results[0].label).toBe('positive');
      expect(results[1].label).toBe('negative');
      expect(results[2].label).toBe('neutral');
    });

    it('should handle empty array', () => {
      const results = analyzeSentimentBatch([]);
      expect(results).toEqual([]);
    });

    it('should preserve order', () => {
      const texts = ['Good', 'Bad', 'Neutral'];
      const results = analyzeSentimentBatch(texts);

      expect(results[0].label).toBe('positive');
      expect(results[1].label).toBe('negative');
      expect(results[2].label).toBe('neutral');
    });
  });
});
