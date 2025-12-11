import { Router, Request, Response } from 'express';
import { searchAndAggregate } from '../services/searchAggregationService';

const router = Router();

/**
 * POST /api/search
 * Search for restaurants in a city with a given query
 *
 * Query Parameters:
 * - city: string (required) - The city to search in
 * - query: string (required) - Search query (e.g., "pizza", "sushi")
 *
 * Response:
 * {
 *   query: string,
 *   city: string,
 *   restaurants: Array<{
 *     name: string,
 *     sentimentScore: number,
 *     sentimentLabel: 'positive' | 'neutral' | 'negative',
 *     sentimentComparative: number,
 *     mentionCount: number,
 *     mapUrl: string,
 *     sources: string[]
 *   }>,
 *   totalResults: number,
 *   cached: boolean,
 *   timestamp: number
 * }
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { city, query } = req.body;

    if (!city || !query) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both "city" and "query" are required in request body',
        code: 'INVALID_REQUEST',
      });
    }

    if (typeof city !== 'string' || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Invalid parameter types',
        message: 'city and query must be strings',
        code: 'INVALID_TYPE',
      });
    }

    if (city.trim().length === 0 || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Empty parameters',
        message: 'city and query cannot be empty strings',
        code: 'EMPTY_PARAMS',
      });
    }

    const cleanCity = city.trim();
    const cleanQuery = query.trim();

    const result = await searchAndAggregate(cleanCity, cleanQuery);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Search endpoint error:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process search request. Please try again later.',
      code: 'SEARCH_ERROR',
      cached: false,
      restaurants: [],
      totalResults: 0,
    });
  }
});

/**
 * GET /api/search
 * Alternative GET endpoint for search (for compatibility)
 *
 * Query Parameters:
 * - city: string (required) - The city to search in
 * - query: string (required) - Search query
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { city, query } = req.query;

    if (!city || !query) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both "city" and "query" are required as query parameters',
        code: 'INVALID_REQUEST',
      });
    }

    const cityStr = Array.isArray(city) ? city[0] : city;
    const queryStr = Array.isArray(query) ? query[0] : query;

    if (typeof cityStr !== 'string' || typeof queryStr !== 'string') {
      return res.status(400).json({
        error: 'Invalid parameter types',
        message: 'city and query must be strings',
        code: 'INVALID_TYPE',
      });
    }

    if (cityStr.trim().length === 0 || queryStr.trim().length === 0) {
      return res.status(400).json({
        error: 'Empty parameters',
        message: 'city and query cannot be empty strings',
        code: 'EMPTY_PARAMS',
      });
    }

    const result = await searchAndAggregate(cityStr.trim(), queryStr.trim());

    return res.status(200).json(result);
  } catch (error) {
    console.error('Search endpoint error:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process search request. Please try again later.',
      code: 'SEARCH_ERROR',
      cached: false,
      restaurants: [],
      totalResults: 0,
    });
  }
});

export default router;
