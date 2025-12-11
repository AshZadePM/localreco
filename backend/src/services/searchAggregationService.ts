import { searchReddit } from './redditService';
import { analyzeSentiment } from './sentimentService';
import { enrichRestaurantWithMapUrl } from './googleMapsService';
import {
  extractRestaurantMentionsFromPosts,
  aggregateRestaurantMentions,
} from './restaurantExtractionService';
import { CacheService } from './cacheService';

interface RestaurantResult {
  name: string;
  sentimentScore: number;
  sentimentLabel: 'positive' | 'neutral' | 'negative';
  sentimentComparative: number;
  mentionCount: number;
  mapUrl: string;
  sources: string[];
}

interface SearchResult {
  query: string;
  city: string;
  restaurants: RestaurantResult[];
  totalResults: number;
  cached: boolean;
  timestamp: number;
}

const cacheService = new CacheService(3600);

/**
 * Get subreddits to search based on city
 */
function getTargetSubreddits(city: string): string[] {
  const baseSubreddits = ['food', 'restaurants', 'foodit', 'eatingout'];
  const citySubreddit = city.toLowerCase().replace(/\s+/g, '');
  const relevantSubreddits = [`${citySubreddit}`, `${citySubreddit}food`, 'AskReddit'];

  return Array.from(new Set([...baseSubreddits, ...relevantSubreddits].filter(sub => sub.length > 0)));
}

/**
 * Analyze sentiment from Reddit content related to a restaurant
 */
function analyzeRestaurantSentiment(postText: string, comments: string[]): {
  score: number;
  comparative: number;
  label: 'positive' | 'neutral' | 'negative';
} {
  const allText = [postText, ...comments].filter(text => text && text.length > 0);

  if (allText.length === 0) {
    return {
      score: 0,
      comparative: 0,
      label: 'neutral',
    };
  }

  const sentiments = allText.map(text => analyzeSentiment(text));

  const avgScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
  const avgComparative = sentiments.reduce((sum, s) => sum + s.comparative, 0) / sentiments.length;

  let label: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (avgComparative > 0.1) {
    label = 'positive';
  } else if (avgComparative < -0.1) {
    label = 'negative';
  }

  return {
    score: Math.round(avgScore * 100) / 100,
    comparative: Math.round(avgComparative * 10000) / 10000,
    label,
  };
}

/**
 * Main search and aggregation function
 */
async function searchAndAggregate(city: string, query: string): Promise<SearchResult> {
  const cacheKey = `search:${city.toLowerCase()}:${query.toLowerCase()}`;

  try {
    const cached = cacheService.get<SearchResult>(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const subreddits = getTargetSubreddits(city);
    const searchQuery = `${query} restaurant`;

    const redditResults = await searchReddit(searchQuery, subreddits);

    const restaurantMentions = extractRestaurantMentionsFromPosts(
      redditResults.posts,
      redditResults.comments
    );

    const aggregatedMentions = aggregateRestaurantMentions(restaurantMentions);

    const restaurants: RestaurantResult[] = [];

    for (const [, mentionData] of aggregatedMentions) {
      try {
        const sentiment = analyzeRestaurantSentiment(
          redditResults.posts
            .filter(p => mentionData.sources.includes(p.id))
            .map(p => `${p.title} ${p.selftext}`)
            .join(' '),
          redditResults.comments
            .filter(c => mentionData.sources.includes(c.id))
            .map(c => c.body)
        );

        const mapData = await enrichRestaurantWithMapUrl(mentionData.name, city);

        restaurants.push({
          name: mapData.name,
          sentimentScore: sentiment.score,
          sentimentLabel: sentiment.label,
          sentimentComparative: sentiment.comparative,
          mentionCount: mentionData.count,
          mapUrl: mapData.url,
          sources: mentionData.sources,
        });
      } catch (error) {
        console.warn(`Error processing restaurant ${mentionData.name}:`, error instanceof Error ? error.message : String(error));
      }
    }

    restaurants.sort((a, b) => {
      if (a.mentionCount !== b.mentionCount) {
        return b.mentionCount - a.mentionCount;
      }
      return b.sentimentScore - a.sentimentScore;
    });

    const result: SearchResult = {
      query,
      city,
      restaurants,
      totalResults: restaurants.length,
      cached: false,
      timestamp: Date.now(),
    };

    cacheService.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error(`Search failed for city=${city}, query=${query}:`, error instanceof Error ? error.message : String(error));

    return {
      query,
      city,
      restaurants: [],
      totalResults: 0,
      cached: false,
      timestamp: Date.now(),
    };
  }
}

export { searchAndAggregate, SearchResult, RestaurantResult };
