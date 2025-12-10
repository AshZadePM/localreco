import { useEffect, useState } from 'react';
import axios from 'axios';
import { ResultsView } from './components/ResultsView';
import { RestaurantResult } from './types';

const mockResults: RestaurantResult[] = [
  {
    id: '1',
    restaurantName: 'The Italian Kitchen',
    googleMapsUrl: 'https://maps.google.com/example1',
    sentimentSummary:
      'Amazing pasta dishes and friendly staff! The ambiance is perfect for date nights. Everyone who visited loved the authentic Italian flavors.',
    redditUrl: 'https://reddit.com/r/food/example1',
    sentimentScore: 85,
    sentimentMetrics: { positive: 45, neutral: 15, negative: 5 },
    subreddit: 'food',
    postAge: '2 days ago',
  },
  {
    id: '2',
    restaurantName: 'Sushi Paradise',
    googleMapsUrl: 'https://maps.google.com/example2',
    sentimentSummary:
      'Fresh and high-quality sushi. Great service and reasonable prices for the portion sizes. Would definitely return.',
    redditUrl: 'https://reddit.com/r/food/example2',
    sentimentScore: 78,
    sentimentMetrics: { positive: 38, neutral: 20, negative: 7 },
    subreddit: 'restaurants',
    postAge: '5 days ago',
  },
  {
    id: '3',
    restaurantName: 'Quick Burger Joint',
    googleMapsUrl: 'https://maps.google.com/example3',
    sentimentSummary:
      'The burgers are decent and prices are reasonable. Service was average, food arrived on time but nothing extraordinary.',
    redditUrl: 'https://reddit.com/r/food/example3',
    sentimentScore: 55,
    sentimentMetrics: { positive: 20, neutral: 35, negative: 15 },
    subreddit: 'FoodCritic',
    postAge: '1 week ago',
  },
  {
    id: '4',
    restaurantName: 'Golden Dragon',
    googleMapsUrl: 'https://maps.google.com/example4',
    sentimentSummary:
      'Excellent Chinese cuisine with authentic flavors. The dim sum is outstanding and service is impeccable.',
    redditUrl: 'https://reddit.com/r/food/example4',
    sentimentScore: 82,
    sentimentMetrics: { positive: 42, neutral: 18, negative: 5 },
    subreddit: 'DiningOut',
    postAge: '3 days ago',
  },
  {
    id: '5',
    restaurantName: 'The Steakhouse',
    googleMapsUrl: 'https://maps.google.com/example5',
    sentimentSummary:
      'Premium cuts of beef cooked to perfection. Beautiful presentation and excellent wine selection.',
    redditUrl: 'https://reddit.com/r/food/example5',
    sentimentScore: 88,
    sentimentMetrics: { positive: 48, neutral: 12, negative: 5 },
    subreddit: 'food',
    postAge: '1 week ago',
  },
  {
    id: '6',
    restaurantName: 'Downtown Diner',
    googleMapsUrl: 'https://maps.google.com/example6',
    sentimentSummary:
      'Classic American diner with comfort food. Good for breakfast and casual lunches.',
    redditUrl: 'https://reddit.com/r/food/example6',
    sentimentScore: 62,
    sentimentMetrics: { positive: 28, neutral: 28, negative: 12 },
    subreddit: 'restaurants',
    postAge: '10 days ago',
  },
];

function App() {
  const [status, setStatus] = useState<string>('Checking backend...');

  useEffect(() => {
    axios
      .get('/api/health')
      .then((response) => {
        setStatus(response.data.message);
      })
      .catch((error) => {
        console.error(error);
        setStatus('Backend not reachable');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Search Results</h1>
          <p className="text-gray-600">
            Backend Status: <span className="font-semibold">{status}</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <ResultsView results={mockResults} isLoading={false} error={null} />
      </div>
    </div>
  );
}

export default App;
