# Restaurant Aggregation API Documentation

## Overview

The Restaurant Aggregation API searches Reddit for restaurant discussions across multiple subreddits, performs sentiment analysis, and enriches results with Google Maps data.

## Environment Variables

### Required

- **REDDIT_CLIENT_ID**: Reddit API application client ID
  - Obtain from: https://www.reddit.com/prefs/apps
  - Type: script application

- **REDDIT_CLIENT_SECRET**: Reddit API application secret
  - Obtain from: https://www.reddit.com/prefs/apps

- **GOOGLE_MAPS_API_KEY**: Google Maps API key for place search
  - Obtain from: https://developers.google.com/maps/documentation/places/web-service/get-api-key
  - Required scopes: Places API, Geocoding API

### Optional

- **PORT**: Server port (default: 3001)
- **OPENAI_API_KEY**: Reserved for future enhancements

## API Endpoints

### POST /api/search

Search for restaurants in a specific city with a given query.

**Request Body:**
```json
{
  "city": "New York",
  "query": "pizza"
}
```

**Query Parameters (alternative):**
- `city` (string, required): City to search in
- `query` (string, required): Search query (e.g., "pizza", "sushi", "burgers")

**Response (200 OK):**
```json
{
  "query": "pizza",
  "city": "New York",
  "restaurants": [
    {
      "name": "Joe's Pizza",
      "sentimentScore": 3,
      "sentimentLabel": "positive",
      "sentimentComparative": 0.2143,
      "mentionCount": 15,
      "mapUrl": "https://www.google.com/maps/search/?api=1&query=Joe%27s%20Pizza&query_place_id=...",
      "sources": ["post_id_1", "comment_id_2", "comment_id_3"]
    }
  ],
  "totalResults": 5,
  "cached": false,
  "timestamp": 1702345678000
}
```

**Error Responses:**

- **400 Bad Request** - Missing or invalid parameters
```json
{
  "error": "Missing required parameters",
  "message": "Both \"city\" and \"query\" are required in request body",
  "code": "INVALID_REQUEST"
}
```

- **500 Internal Server Error** - Search processing failed
```json
{
  "error": "Internal server error",
  "message": "Failed to process search request. Please try again later.",
  "code": "SEARCH_ERROR",
  "cached": false,
  "restaurants": [],
  "totalResults": 0
}
```

## Data Processing Pipeline

### 1. Reddit API Integration

- Searches multiple subreddits (base subreddits: food, restaurants, foodit, eatingout)
- Dynamically includes city-specific subreddits
- Authenticates using OAuth 2.0 client credentials flow
- Retrieves posts and comments with relevance sorting
- Handles rate limiting with token caching

### 2. Restaurant Extraction

Identifies restaurant mentions using multiple strategies:

- **Quoted Names**: Extracts text in quotes or single quotes
- **Keyword Patterns**: Matches restaurant keywords (restaurant, cafe, diner, bistro, etc.) followed by names
- **Capitalized Names**: Identifies potential restaurant names using capitalization patterns
- **Aggregation**: Deduplicates mentions and counts occurrences

### 3. Sentiment Analysis

**Methodology:**
- Uses the sentiment.js library with pre-trained vocabulary
- Analyzes text on a scale from -5 to 5
- Calculates comparative score (normalized per word)
- Classification:
  - **Positive**: comparative > 0.1
  - **Neutral**: -0.1 ≤ comparative ≤ 0.1
  - **Negative**: comparative < -0.1

**Scoring:**
```
score: Raw sentiment score (-5 to 5)
comparative: score / word_count (normalized score per word)
label: Classification based on comparative threshold
```

Example:
- Text: "This restaurant is amazing! Love it!" 
  - Score: 3
  - Comparative: 0.3 (3 / 10 words)
  - Label: positive

### 4. Google Maps Enrichment

- Searches Google Maps Place API for restaurant details
- Generates formatted Google Maps URLs
- Falls back to generic Google Maps search if specific place not found
- Includes place ID for direct navigation

### 5. Caching & Throttling

**Caching:**
- Results cached for 1 hour (3600 seconds)
- Cache key: `search:{city}:{query}`
- Reduces redundant API calls

**Throttling:**
- Per-identifier rate limiting: 30 requests per minute
- Prevents API quota exhaustion
- Implements sliding window tracking

## Response Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| query | string | Original search query |
| city | string | City searched |
| restaurants | array | Array of restaurant results |
| restaurants[].name | string | Restaurant name |
| restaurants[].sentimentScore | number | Raw sentiment score (-5 to 5) |
| restaurants[].sentimentLabel | string | Sentiment classification (positive/neutral/negative) |
| restaurants[].sentimentComparative | number | Normalized sentiment score per word |
| restaurants[].mentionCount | number | How many times mentioned in results |
| restaurants[].mapUrl | string | Google Maps URL for the restaurant |
| restaurants[].sources | array | IDs of posts/comments where mentioned |
| totalResults | number | Number of unique restaurants found |
| cached | boolean | Whether result was from cache |
| timestamp | number | Unix timestamp of search execution |

## Error Handling

The API implements robust error handling:

1. **Input Validation**: Validates city and query parameters
2. **API Failures**: Gracefully handles Reddit/Google Maps API failures
3. **Partial Results**: Continues processing even if individual enrichments fail
4. **Fallback Messaging**: Returns generic Google Maps links if place search fails
5. **Rate Limiting**: Respects Reddit and Google Maps API quotas

## Usage Examples

### cURL

```bash
# POST request
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"city": "San Francisco", "query": "best sushi"}'

# GET request
curl "http://localhost:3001/api/search?city=Los%20Angeles&query=tacos"
```

### JavaScript/TypeScript

```typescript
const response = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    city: 'New York',
    query: 'pizza'
  })
});

const data = await response.json();
console.log(data.restaurants);
```

### Python

```python
import requests

response = requests.post('http://localhost:3001/api/search', json={
    'city': 'Chicago',
    'query': 'deep dish pizza'
})

restaurants = response.json()['restaurants']
for restaurant in restaurants:
    print(f"{restaurant['name']}: {restaurant['sentimentLabel']}")
```

## Rate Limiting & Quotas

- **Reddit API**: OAuth token cached for token lifetime (typically 1 hour)
- **Google Maps**: Subject to plan quotas (check your API key settings)
- **Internal Throttling**: 30 requests per minute per identifier
- **Cache TTL**: 3600 seconds (1 hour)

## Testing

Run unit tests:
```bash
npm test
```

Tests cover:
- Restaurant extraction patterns
- Sentiment analysis accuracy
- Caching functionality
- Rate limiting behavior
- Data aggregation logic

## Performance Considerations

1. **Caching**: First request for a city/query pair takes longer; subsequent requests return cached results
2. **Subreddit Coverage**: Searches multiple subreddits; more results = longer processing
3. **API Calls**: Each search makes multiple API calls; throttling limits concurrent requests
4. **Timeout**: Individual API calls have 5-10 second timeouts to prevent hanging

## Troubleshooting

### No results returned
- Check Reddit API credentials are valid
- Verify search terms match common restaurant mentions
- Check rate limiting hasn't been exceeded

### Map URLs not working
- Verify Google Maps API key is configured
- Check API key has Places API enabled
- Review API quotas haven't been exceeded

### Sentiment analysis seems off
- Sentiment analysis works best on larger text samples
- Sarcasm and context are limitations of the current approach
- Consider the comparative score rather than just the label

## Future Enhancements

- Integration with OpenAI for enhanced NLP
- Support for multiple languages
- Real-time streaming results
- Advanced filtering and sorting options
- User preference learning
