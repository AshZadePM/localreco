import axios from 'axios';

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  subreddit: string;
  created_utc: number;
  url: string;
}

interface RedditComment {
  id: string;
  body: string;
  subreddit: string;
  created_utc: number;
  score: number;
}

interface RedditSearchResult {
  posts: RedditPost[];
  comments: RedditComment[];
}

let redditToken: string | null = null;
let tokenExpiry: number = 0;

async function getRedditToken(): Promise<string> {
  const now = Date.now();

  if (redditToken !== null && tokenExpiry > now) {
    return redditToken;
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Reddit API credentials not configured');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'RestaurantAggregator/1.0',
        },
        timeout: 10000,
      }
    );

    redditToken = response.data.access_token;
    tokenExpiry = now + response.data.expires_in * 1000;

    return redditToken!;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to authenticate with Reddit API: ${error.message}`);
    }
    throw error;
  }
}

async function searchReddit(query: string, subreddits: string[]): Promise<RedditSearchResult> {
  const token = await getRedditToken();

  const posts: RedditPost[] = [];
  const comments: RedditComment[] = [];

  try {
    for (const subreddit of subreddits) {
      try {
        const searchUrl = `https://oauth.reddit.com/r/${subreddit}/search`;

        const response = await axios.get(searchUrl, {
          headers: {
            Authorization: `bearer ${token}`,
            'User-Agent': 'RestaurantAggregator/1.0',
          },
          params: {
            q: query,
            type: 'link,comment',
            limit: 25,
            sort: 'relevance',
          },
          timeout: 10000,
        });

        if (response.data?.data?.children) {
          for (const child of response.data.data.children) {
            const data = child.data;
            if (child.kind === 't3') {
              posts.push({
                id: data.id,
                title: data.title || '',
                selftext: data.selftext || '',
                subreddit: data.subreddit || '',
                created_utc: data.created_utc || 0,
                url: data.url || '',
              });
            } else if (child.kind === 't1') {
              comments.push({
                id: data.id,
                body: data.body || '',
                subreddit: data.subreddit || '',
                created_utc: data.created_utc || 0,
                score: data.score || 0,
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to search subreddit ${subreddit}:`, error instanceof Error ? error.message : String(error));
      }
    }

    return { posts, comments };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Reddit API search failed: ${error.message}`);
    }
    throw error;
  }
}

export { searchReddit, RedditSearchResult, RedditPost, RedditComment };
