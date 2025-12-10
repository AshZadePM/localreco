import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResultsView } from '../components/ResultsView';
import { RestaurantResult } from '../types';

const meta = {
  title: 'Components/ResultsView',
  component: ResultsView,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ResultsView>;

export default meta;
type Story = StoryObj<typeof meta>;

const generateMockResults = (count: number): RestaurantResult[] => {
  const restaurants = [
    'Bella Italia',
    'Golden Dragon',
    'The Steakhouse',
    'Sushi Paradise',
    'Taco Fiesta',
    'Le Petit Bistro',
    'Thai Royal',
    'Pizza House',
    'Kebab King',
    'Modern Gastropub',
    'Farm to Table',
    'Ramen Palace',
    'Caribbean Vibes',
    'Burger Barn',
    'Dim Sum House',
  ];

  const subreddits = ['food', 'restaurants', 'FoodCritic', 'DiningOut', 'EatCheapAndHealthy'];

  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    restaurantName: restaurants[i % restaurants.length],
    googleMapsUrl: `https://maps.google.com/example${i}`,
    sentimentSummary: `This is a detailed sentiment summary for ${restaurants[i % restaurants.length]}. People mentioned great food, nice ambiance, and friendly service. The restaurant offers excellent value for money.`,
    redditUrl: `https://reddit.com/r/food/example${i}`,
    sentimentScore: 50 + Math.floor(Math.random() * 50),
    sentimentMetrics: {
      positive: Math.floor(Math.random() * 50),
      neutral: Math.floor(Math.random() * 30),
      negative: Math.floor(Math.random() * 20),
    },
    subreddit: subreddits[i % subreddits.length],
    postAge: `${Math.floor(Math.random() * 30) + 1} days ago`,
  }));
};

export const WithManyResults: Story = {
  args: {
    results: generateMockResults(15),
    isLoading: false,
    error: null,
  },
};

export const WithFewResults: Story = {
  args: {
    results: generateMockResults(3),
    isLoading: false,
    error: null,
  },
};

export const FirstPageLoaded: Story = {
  args: {
    results: generateMockResults(5),
    isLoading: false,
    error: null,
  },
};

export const EmptyState: Story = {
  args: {
    results: [],
    isLoading: false,
    error: null,
  },
};

export const ErrorState: Story = {
  args: {
    results: [],
    isLoading: false,
    error: 'Failed to load results. Please try again later.',
  },
};

export const LoadingState: Story = {
  args: {
    results: generateMockResults(5),
    isLoading: true,
    error: null,
  },
};

export const WithLoadMoreCallback: Story = {
  args: {
    results: generateMockResults(12),
    isLoading: false,
    error: null,
    onLoadMore: () => console.log('Load more clicked!'),
  },
};
