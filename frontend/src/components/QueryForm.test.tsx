import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryForm } from './QueryForm';
import { QueryProvider } from '../context/QueryProvider';
import { CityProvider } from '../context/CityProvider';
import { useCity } from '../hooks/useCity';

// Mock axios
vi.mock('axios', () => {
  return {
    default: {
      post: vi.fn(),
      isAxiosError: vi.fn((error) => error.response !== undefined),
    },
  };
});

import axios from 'axios';

const mockAxios = axios as any;

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn((success) =>
    success({
      coords: { latitude: 51.5074, longitude: -0.1278 },
    })
  ),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

// Component wrapper
const QueryFormWithProviders = () => (
  <CityProvider>
    <QueryProvider>
      <div>
        <CitySelector />
        <QueryForm />
      </div>
    </QueryProvider>
  </CityProvider>
);

// Simple city selector for testing
const CitySelector = () => {
  const { setSelectedCity, selectedCity } = useCity();

  return (
    <div>
      <button
        onClick={() =>
          setSelectedCity({
            name: 'London',
            latitude: 51.5074,
            longitude: -0.1278,
          })
        }
        data-testid="select-city-button"
      >
        Select City
      </button>
      {selectedCity && <span data-testid="selected-city-display">{selectedCity.name}</span>}
    </div>
  );
};

describe('QueryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({
      data: {
        results: [
          {
            id: '1',
            title: 'Result 1',
            description: 'Description 1',
          },
        ],
        total: 1,
      },
    });
  });

  it('renders the query form', () => {
    render(<QueryFormWithProviders />);

    expect(screen.getByTestId('query-form')).toBeInTheDocument();
    expect(screen.getByTestId('query-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('disables submit button when no city is selected', () => {
    render(<QueryFormWithProviders />);

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when city is selected', async () => {
    render(<QueryFormWithProviders />);

    const selectCityButton = screen.getByTestId('select-city-button');
    fireEvent.click(selectCityButton);

    await waitFor(() => {
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('shows validation error when submitting with empty query', async () => {
    const user = userEvent.setup();
    render(<QueryFormWithProviders />);

    // Select city
    const selectCityButton = screen.getByTestId('select-city-button');
    await user.click(selectCityButton);

    // Try to submit with empty query
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      const validationErrors = screen.getByTestId('validation-errors');
      expect(validationErrors).toBeInTheDocument();
      expect(within(validationErrors).getByText(/enter a search query/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when city is not selected', async () => {
    const user = userEvent.setup();
    render(<QueryFormWithProviders />);

    // Try to submit without selecting city
    const queryInput = screen.getByTestId('query-input');
    await user.type(queryInput, 'test query');

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      const validationErrors = screen.getByTestId('validation-errors');
      expect(validationErrors).toBeInTheDocument();
      expect(within(validationErrors).getByText(/select a city/i)).toBeInTheDocument();
    });
  });

  it('calls API with correct parameters on form submit', async () => {
    const user = userEvent.setup();
    render(<QueryFormWithProviders />);

    // Select city
    const selectCityButton = screen.getByTestId('select-city-button');
    await user.click(selectCityButton);

    // Enter query
    const queryInput = screen.getByTestId('query-input');
    await user.type(queryInput, 'best coffee');

    // Submit
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/api/search', {
        city: 'London',
        query: 'best coffee',
      });
    });
  });

  it('shows loading indicator while searching', async () => {
    const user = userEvent.setup();
    let resolveSearch: () => void;
    const searchPromise = new Promise<void>((resolve) => {
      resolveSearch = resolve;
    });

    mockAxios.post.mockReturnValue(searchPromise);

    render(<QueryFormWithProviders />);

    // Select city
    const selectCityButton = screen.getByTestId('select-city-button');
    await user.click(selectCityButton);

    // Enter query
    const queryInput = screen.getByTestId('query-input');
    await user.type(queryInput, 'test');

    // Submit
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    // Resolve the search
    resolveSearch!();

    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
  });

  it('shows error message on API error', async () => {
    const user = userEvent.setup();
    mockAxios.post.mockRejectedValue({
      response: {
        data: {
          error: 'Search failed',
        },
      },
    });
    mockAxios.isAxiosError.mockReturnValue(true);

    render(<QueryFormWithProviders />);

    // Select city
    const selectCityButton = screen.getByTestId('select-city-button');
    await user.click(selectCityButton);

    // Enter query
    const queryInput = screen.getByTestId('query-input');
    await user.type(queryInput, 'test');

    // Submit
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      const errorIndicator = screen.getByTestId('error-indicator');
      expect(errorIndicator).toBeInTheDocument();
      expect(errorIndicator.textContent).toContain('Search failed');
    });
  });

  it('shows success message with result count', async () => {
    const user = userEvent.setup();
    render(<QueryFormWithProviders />);

    // Select city
    const selectCityButton = screen.getByTestId('select-city-button');
    await user.click(selectCityButton);

    // Enter query
    const queryInput = screen.getByTestId('query-input');
    await user.type(queryInput, 'coffee');

    // Submit
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      const resultsSummary = screen.getByTestId('results-summary');
      expect(resultsSummary).toBeInTheDocument();
      expect(resultsSummary.textContent).toContain('Found 1 result');
    });
  });

  it('submits on Enter key press', async () => {
    const user = userEvent.setup();
    render(<QueryFormWithProviders />);

    // Select city
    const selectCityButton = screen.getByTestId('select-city-button');
    await user.click(selectCityButton);

    // Enter query
    const queryInput = screen.getByTestId('query-input');
    await user.type(queryInput, 'test{Enter}');

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/api/search', {
        city: 'London',
        query: 'test',
      });
    });
  });

  it('debounces automatic search after query change', async () => {
    vi.useFakeTimers();

    const user = userEvent.setup({ delay: null });
    render(<QueryFormWithProviders />);

    // Select city
    const selectCityButton = screen.getByTestId('select-city-button');
    await user.click(selectCityButton);

    // Start typing
    const queryInput = screen.getByTestId('query-input');
    await user.type(queryInput, 'coffee');

    // Should not have called API immediately
    expect(mockAxios.post).not.toHaveBeenCalled();

    // Advance time to trigger debounce
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalled();
    });

    vi.useRealTimers();
  });

  it('does not submit if debounced and another submit is in progress', async () => {
    const user = userEvent.setup();
    let resolveSearch: () => void;
    const searchPromise = new Promise<void>((resolve) => {
      resolveSearch = resolve;
    });

    mockAxios.post.mockReturnValue(searchPromise);

    render(<QueryFormWithProviders />);

    // Select city
    const selectCityButton = screen.getByTestId('select-city-button');
    await user.click(selectCityButton);

    // Enter query
    const queryInput = screen.getByTestId('query-input');
    await user.type(queryInput, 'test');

    // Submit manually
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    // While search is in progress, the button should be disabled
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    // Resolve the search
    resolveSearch!();

    // Button should be enabled again
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('clears validation errors when user starts typing', async () => {
    const user = userEvent.setup();
    render(<QueryFormWithProviders />);

    // Select city and try to submit with empty query to show errors
    const selectCityButton = screen.getByTestId('select-city-button');
    await user.click(selectCityButton);

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('validation-errors')).toBeInTheDocument();
    });

    // Start typing
    const queryInput = screen.getByTestId('query-input');
    await user.type(queryInput, 'a');

    await waitFor(() => {
      expect(screen.queryByTestId('validation-errors')).not.toBeInTheDocument();
    });
  });

  it('trims whitespace from query before sending', async () => {
    const user = userEvent.setup();
    render(<QueryFormWithProviders />);

    // Select city
    const selectCityButton = screen.getByTestId('select-city-button');
    await user.click(selectCityButton);

    // Enter query with whitespace
    const queryInput = screen.getByTestId('query-input');
    await user.type(queryInput, '   test query   ');

    // Submit
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/api/search', {
        city: 'London',
        query: 'test query',
      });
    });
  });
});
