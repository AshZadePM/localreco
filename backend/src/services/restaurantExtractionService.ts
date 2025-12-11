interface RestaurantMention {
  name: string;
  source: 'post_title' | 'post_body' | 'comment';
  sourceId: string;
  text: string;
  mentions: number;
}

/**
 * Common patterns and keywords for restaurant identification
 */
const restaurantKeywords = [
  'restaurant',
  'cafe',
  'cafe',
  'diner',
  'bistro',
  'pizzeria',
  'sushi',
  'burger',
  'steakhouse',
  'kitchen',
  'grill',
  'bar and grill',
  'bbq',
  'barbecue',
  'taco',
  'noodles',
  'ramen',
  'pho',
  'bakery',
  'coffee',
  'burger joint',
  'food truck',
];

/**
 * Capitalized names pattern - potential restaurant names
 */
const capitalizedNamePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;

/**
 * Quoted text pattern - often used for restaurant names
 */
const quotedPattern = /"([^"]+)"|'([^']+)'/g;

/**
 * Extracts potential restaurant mentions from text
 * @param text The text to analyze
 * @param sourceType Type of source
 * @param sourceId ID of the source (post/comment)
 * @returns Array of potential restaurant mentions
 */
function extractRestaurantMentions(text: string, sourceType: 'post_title' | 'post_body' | 'comment', sourceId: string): RestaurantMention[] {
  if (!text || text.length === 0) {
    return [];
  }

  const mentions: Map<string, RestaurantMention> = new Map();

  // Look for quoted restaurant names
  let quoteMatch;
  const quotedRegex = new RegExp(quotedPattern);
  while ((quoteMatch = quotedRegex.exec(text)) !== null) {
    const quotedName = (quoteMatch[1] || quoteMatch[2] || '').trim();
    if (quotedName && quotedName.length > 2 && quotedName.length < 100) {
      const key = quotedName.toLowerCase();
      if (!mentions.has(key)) {
        mentions.set(key, {
          name: quotedName,
          source: sourceType,
          sourceId,
          text: text.substring(Math.max(0, quoteMatch.index - 50), Math.min(text.length, quoteMatch.index + 50)),
          mentions: 1,
        });
      } else {
        const existing = mentions.get(key)!;
        existing.mentions += 1;
      }
    }
  }

  // Look for restaurant keywords followed by a name
  const keywords = restaurantKeywords.join('|');
  const keywordPattern = new RegExp(`(?:${keywords})\\s+(?:called\\s+)?"?([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)"?`, 'gi');

  let keywordMatch;
  while ((keywordMatch = keywordPattern.exec(text)) !== null) {
    const restaurantName = keywordMatch[1]?.trim();
    if (restaurantName && restaurantName.length > 2 && restaurantName.length < 100) {
      const key = restaurantName.toLowerCase();
      if (!mentions.has(key)) {
        mentions.set(key, {
          name: restaurantName,
          source: sourceType,
          sourceId,
          text: text.substring(Math.max(0, keywordMatch.index - 50), Math.min(text.length, keywordMatch.index + 50)),
          mentions: 1,
        });
      } else {
        const existing = mentions.get(key)!;
        existing.mentions += 1;
      }
    }
  }

  // Look for capitalized names (potential restaurant names)
  // Only if they appear in restaurant context
  if (text.toLowerCase().includes('restaurant') || text.toLowerCase().includes('food') || text.toLowerCase().includes('eat')) {
    let capitalMatch;
    const capitalRegex = new RegExp(capitalizedNamePattern);
    const potentialNames: string[] = [];

    while ((capitalMatch = capitalRegex.exec(text)) !== null) {
      potentialNames.push(capitalMatch[1]);
    }

    // Only include capitalized names if they're longer or unique-looking
    potentialNames.forEach(name => {
      if (name.length > 3 && name.length < 100 && !restaurantKeywords.includes(name.toLowerCase())) {
        const key = name.toLowerCase();
        if (!mentions.has(key)) {
          mentions.set(key, {
            name,
            source: sourceType,
            sourceId,
            text: text.substring(Math.max(0, text.indexOf(name) - 50), Math.min(text.length, text.indexOf(name) + 50)),
            mentions: 1,
          });
        }
      }
    });
  }

  return Array.from(mentions.values());
}

/**
 * Extract restaurant mentions from posts and comments
 * @param posts Array of post objects with title and selftext
 * @param comments Array of comment objects with body
 * @returns Array of all restaurant mentions
 */
function extractRestaurantMentionsFromPosts(
  posts: Array<{ id: string; title: string; selftext: string }>,
  comments: Array<{ id: string; body: string }>
): RestaurantMention[] {
  const allMentions: RestaurantMention[] = [];

  posts.forEach(post => {
    allMentions.push(...extractRestaurantMentions(post.title, 'post_title', post.id));
    allMentions.push(...extractRestaurantMentions(post.selftext, 'post_body', post.id));
  });

  comments.forEach(comment => {
    allMentions.push(...extractRestaurantMentions(comment.body, 'comment', comment.id));
  });

  return allMentions;
}

/**
 * Deduplicate and aggregate restaurant mentions
 * @param mentions Array of restaurant mentions
 * @returns Map of unique restaurants with aggregated mention count
 */
function aggregateRestaurantMentions(mentions: RestaurantMention[]): Map<string, { name: string; count: number; sources: string[] }> {
  const aggregated = new Map<string, { name: string; count: number; sources: string[] }>();

  mentions.forEach(mention => {
    const key = mention.name.toLowerCase();
    if (aggregated.has(key)) {
      const existing = aggregated.get(key)!;
      existing.count += mention.mentions;
      if (!existing.sources.includes(mention.sourceId)) {
        existing.sources.push(mention.sourceId);
      }
    } else {
      aggregated.set(key, {
        name: mention.name,
        count: mention.mentions,
        sources: [mention.sourceId],
      });
    }
  });

  return aggregated;
}

export {
  extractRestaurantMentions,
  extractRestaurantMentionsFromPosts,
  aggregateRestaurantMentions,
  RestaurantMention,
};
