import {
  extractRestaurantMentions,
  extractRestaurantMentionsFromPosts,
  aggregateRestaurantMentions,
} from '../restaurantExtractionService';

describe('restaurantExtractionService', () => {
  describe('extractRestaurantMentions', () => {
    it('should extract quoted restaurant names', () => {
      const text = 'I really loved "The Pasta House" for dinner last night.';
      const mentions = extractRestaurantMentions(text, 'comment', 'test-id');

      expect(mentions.length).toBeGreaterThan(0);
      expect(mentions.some(m => m.name === 'The Pasta House')).toBe(true);
    });

    it('should extract restaurant names with keywords', () => {
      const text = 'The best restaurant called Burger King serves amazing food.';
      const mentions = extractRestaurantMentions(text, 'post_title', 'test-id');

      expect(mentions.length).toBeGreaterThan(0);
    });

    it('should return empty array for empty text', () => {
      const mentions = extractRestaurantMentions('', 'comment', 'test-id');
      expect(mentions).toEqual([]);
    });

    it('should handle single quoted names', () => {
      const text = "I visited 'Pizza Palace' yesterday and loved it.";
      const mentions = extractRestaurantMentions(text, 'comment', 'test-id');

      expect(mentions.length).toBeGreaterThan(0);
      expect(mentions.some(m => m.name === 'Pizza Palace')).toBe(true);
    });

    it('should not extract very short names', () => {
      const text = '"AB" is a terrible restaurant name.';
      const mentions = extractRestaurantMentions(text, 'comment', 'test-id');

      expect(mentions.every(m => m.name.length > 2)).toBe(true);
    });
  });

  describe('extractRestaurantMentionsFromPosts', () => {
    it('should extract mentions from posts and comments', () => {
      const posts = [
        {
          id: 'post1',
          title: 'Best "Sushi Place" in town',
          selftext: 'I went to "Sushi Place" and it was amazing!',
        },
      ];
      const comments = [
        {
          id: 'comment1',
          body: 'I also love "Sushi Place"!',
        },
      ];

      const mentions = extractRestaurantMentionsFromPosts(posts, comments);

      expect(mentions.length).toBeGreaterThan(0);
      expect(mentions.some(m => m.name === 'Sushi Place')).toBe(true);
    });

    it('should track source types correctly', () => {
      const posts = [
        {
          id: 'post1',
          title: 'Best "Taco Spot" ever',
          selftext: '',
        },
      ];
      const comments: Array<{ id: string; body: string }> = [];

      const mentions = extractRestaurantMentionsFromPosts(posts, comments);

      expect(mentions.some(m => m.source === 'post_title')).toBe(true);
    });
  });

  describe('aggregateRestaurantMentions', () => {
    it('should aggregate duplicate mentions', () => {
      const mentions = [
        {
          name: 'Pizza House',
          source: 'post_title' as const,
          sourceId: 'post1',
          text: 'Pizza House is great',
          mentions: 1,
        },
        {
          name: 'Pizza House',
          source: 'comment' as const,
          sourceId: 'comment1',
          text: 'Pizza House rocks',
          mentions: 2,
        },
      ];

      const aggregated = aggregateRestaurantMentions(mentions);

      expect(aggregated.size).toBe(1);
      const entry = aggregated.get('pizza house');
      expect(entry?.count).toBe(3);
      expect(entry?.sources.length).toBe(2);
    });

    it('should handle case-insensitive aggregation', () => {
      const mentions = [
        {
          name: 'Pizza House',
          source: 'post_title' as const,
          sourceId: 'post1',
          text: 'Pizza House',
          mentions: 1,
        },
        {
          name: 'pizza house',
          source: 'comment' as const,
          sourceId: 'comment1',
          text: 'pizza house',
          mentions: 1,
        },
      ];

      const aggregated = aggregateRestaurantMentions(mentions);

      expect(aggregated.size).toBe(1);
      const entry = aggregated.get('pizza house');
      expect(entry?.count).toBe(2);
    });

    it('should preserve original name casing', () => {
      const mentions = [
        {
          name: 'The Great Pizza House',
          source: 'post_title' as const,
          sourceId: 'post1',
          text: 'The Great Pizza House',
          mentions: 1,
        },
      ];

      const aggregated = aggregateRestaurantMentions(mentions);
      const entry = aggregated.get('the great pizza house');
      expect(entry?.name).toBe('The Great Pizza House');
    });
  });
});
