import type { Meta, StoryObj } from '@storybook/react-vite';
import { RestaurantCard } from '../components/RestaurantCard';
import { RestaurantResult } from '../types';

const meta = {
  title: 'Components/RestaurantCard',
  component: RestaurantCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RestaurantCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockPositiveResult: RestaurantResult = {
  id: '1',
  restaurantName: 'The Italian Kitchen',
  googleMapsUrl: 'https://maps.google.com/example',
  sentimentSummary:
    'Amazing pasta dishes and friendly staff! The ambiance is perfect for date nights. Everyone who visited loved the authentic Italian flavors.',
  redditUrl: 'https://reddit.com/r/food/example',
  sentimentScore: 85,
  sentimentMetrics: {
    positive: 45,
    neutral: 15,
    negative: 5,
  },
  subreddit: 'food',
  postAge: '2 days ago',
};

const mockNeutralResult: RestaurantResult = {
  id: '2',
  restaurantName: 'Quick Burger Joint',
  googleMapsUrl: 'https://maps.google.com/example2',
  sentimentSummary:
    'The burgers are decent and prices are reasonable. Service was average, food arrived on time but nothing extraordinary. Good for a quick lunch.',
  redditUrl: 'https://reddit.com/r/food/example2',
  sentimentScore: 55,
  sentimentMetrics: {
    positive: 20,
    neutral: 35,
    negative: 15,
  },
  subreddit: 'restaurants',
  postAge: '1 week ago',
};

const mockNegativeResult: RestaurantResult = {
  id: '3',
  restaurantName: 'Downtown Steakhouse',
  googleMapsUrl: 'https://maps.google.com/example3',
  sentimentSummary:
    'Disappointing experience. Long wait times, cold food when it arrived, and the prices did not match the quality. Staff seemed unhelpful and disorganized.',
  redditUrl: 'https://reddit.com/r/food/example3',
  sentimentScore: 25,
  sentimentMetrics: {
    positive: 5,
    neutral: 10,
    negative: 50,
  },
  subreddit: 'restaurants',
  postAge: '3 days ago',
};

export const PositiveSentiment: Story = {
  args: {
    result: mockPositiveResult,
  },
};

export const NeutralSentiment: Story = {
  args: {
    result: mockNeutralResult,
  },
};

export const NegativeSentiment: Story = {
  args: {
    result: mockNegativeResult,
  },
};

export const WithoutMetrics: Story = {
  args: {
    result: {
      ...mockPositiveResult,
      sentimentMetrics: undefined,
    },
  },
};
