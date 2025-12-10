export interface SentimentMetrics {
  positive: number;
  negative: number;
  neutral: number;
}

export interface RestaurantResult {
  id: string;
  restaurantName: string;
  googleMapsUrl: string;
  sentimentSummary: string;
  redditUrl: string;
  sentimentScore: number;
  sentimentMetrics?: SentimentMetrics;
  subreddit: string;
  postAge: string;
  postDate?: Date;
}
