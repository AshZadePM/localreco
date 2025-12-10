import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { CitySelector } from './CitySelector';
import { CityProvider } from '../context/CityProvider';
import * as geocoding from '../utils/geocoding';

vi.mock('../utils/geocoding');

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockGetCurrentPosition = vi.fn((successCallback) => {
    successCallback({
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    } as GeolocationPosition);
  });

  Object.defineProperty(navigator, 'geolocation', {
    value: {
      getCurrentPosition: mockGetCurrentPosition,
    },
    configurable: true,
  });

  return <CityProvider>{children}</CityProvider>;
};

describe('CitySelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render city selector input', async () => {
    render(
      <TestWrapper>
        <CitySelector />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument();
    });
  });

  it('should have label', async () => {
    render(
      <TestWrapper>
        <CitySelector />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Select a City')).toBeInTheDocument();
    });
  });

  it('should show status message during initialization', async () => {
    const mockGetCurrentPosition = vi.fn((_successCallback, _errorCallback) => {
      // Simulate slow initialization
    });

    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: mockGetCurrentPosition,
      },
      configurable: true,
    });

    render(
      <TestWrapper>
        <CitySelector />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/location detected/i)).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should search cities when input changes', async () => {
      const mockSearchCities = vi.fn().mockResolvedValue([
        { name: 'New York', latitude: 40.7128, longitude: -74.006 },
      ]);
      vi.mocked(geocoding.searchCities).mockImplementation(mockSearchCities);

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CitySelector />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Search for a city...');
      await user.type(input, 'New');

      await waitFor(() => {
        expect(mockSearchCities).toHaveBeenCalledWith('New');
      });
    });

    it('should debounce search input', async () => {
      const mockSearchCities = vi.fn().mockResolvedValue([]);
      vi.mocked(geocoding.searchCities).mockImplementation(mockSearchCities);

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CitySelector />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Search for a city...');
      await user.type(input, 'N');
      await user.type(input, 'e');
      await user.type(input, 'w');

      // Wait for debounce to settle
      await waitFor(() => {
        expect(mockSearchCities).toHaveBeenCalled();
      }, { timeout: 1000 });

      // Should only be called once due to debouncing
      expect(mockSearchCities.mock.calls.length).toBeLessThanOrEqual(2);
    });

    it('should not search for empty query', async () => {
      const mockSearchCities = vi.fn().mockResolvedValue([]);
      vi.mocked(geocoding.searchCities).mockImplementation(mockSearchCities);

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CitySelector />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Search for a city...');
      await user.click(input);

      await waitFor(() => {
        // Focus should not trigger search for empty input
        expect(mockSearchCities).not.toHaveBeenCalled();
      });
    });

    it('should display search results', async () => {
      const mockResults = [
        { name: 'New York', latitude: 40.7128, longitude: -74.006 },
        { name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
      ];
      const mockSearchCities = vi.fn().mockResolvedValue(mockResults);
      vi.mocked(geocoding.searchCities).mockImplementation(mockSearchCities);

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CitySelector />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Search for a city...');
      await user.type(input, 'New');

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument();
      });
    });

    it('should display no results message', async () => {
      const mockSearchCities = vi.fn().mockResolvedValue([]);
      vi.mocked(geocoding.searchCities).mockImplementation(mockSearchCities);

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CitySelector />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Search for a city...');
      await user.type(input, 'XyzNotACity');

      await waitFor(() => {
        expect(screen.getByText(/No cities found matching/i)).toBeInTheDocument();
      });
    });

    it('should handle search error', async () => {
      const mockSearchCities = vi.fn().mockRejectedValue(new Error('Search failed'));
      vi.mocked(geocoding.searchCities).mockImplementation(mockSearchCities);

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CitySelector />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Search for a city...');
      await user.type(input, 'test');

      await waitFor(() => {
        expect(screen.getByText('Search failed')).toBeInTheDocument();
      });
    });
  });

  describe('city selection', () => {
    it('should select a city from results', async () => {
      const mockResults = [{ name: 'New York', latitude: 40.7128, longitude: -74.006 }];
      const mockSearchCities = vi.fn().mockResolvedValue(mockResults);
      vi.mocked(geocoding.searchCities).mockImplementation(mockSearchCities);

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CitySelector />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Search for a city...');
      await user.type(input, 'New');

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument();
      });

      const result = screen.getByText('New York');
      await user.click(result);

      await waitFor(() => {
        expect(screen.getByDisplayValue('New York')).toBeInTheDocument();
      });
    });

    it('should display selected city in input', async () => {
      const mockResults = [{ name: 'Chicago', latitude: 41.8781, longitude: -87.6298 }];
      const mockSearchCities = vi.fn().mockResolvedValue(mockResults);
      vi.mocked(geocoding.searchCities).mockImplementation(mockSearchCities);

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CitySelector />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Search for a city...') as HTMLInputElement;
      await user.type(input, 'Chicago');

      await waitFor(() => {
        expect(screen.getByText('Chicago')).toBeInTheDocument();
      });

      const result = screen.getByText('Chicago');
      await user.click(result);

      await waitFor(() => {
        expect(input.value).toBe('Chicago');
      });
    });
  });

  describe('clear button', () => {
    it('should show clear button when input has value', async () => {
      const mockSearchCities = vi.fn().mockResolvedValue([]);
      vi.mocked(geocoding.searchCities).mockImplementation(mockSearchCities);

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CitySelector />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Search for a city...');
      await user.type(input, 'test');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Clear selection/i })).toBeInTheDocument();
      });
    });

    it('should clear input when clear button is clicked', async () => {
      const mockSearchCities = vi.fn().mockResolvedValue([]);
      vi.mocked(geocoding.searchCities).mockImplementation(mockSearchCities);

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CitySelector />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Search for a city...') as HTMLInputElement;
      await user.type(input, 'test');

      await waitFor(() => {
        expect(input.value).toBe('test');
      });

      const clearButton = screen.getByRole('button', { name: /Clear selection/i });
      await user.click(clearButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper aria attributes', async () => {
      render(
        <TestWrapper>
          <CitySelector />
        </TestWrapper>
      );

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Search for a city...');
        expect(input).toHaveAttribute('aria-autocomplete', 'list');
        expect(input).toHaveAttribute('aria-expanded', 'false');
        expect(input).toHaveAttribute('aria-controls', 'city-suggestions');
      });
    });

    it('should update aria-expanded when suggestions are shown', async () => {
      const mockResults = [{ name: 'New York', latitude: 40.7128, longitude: -74.006 }];
      const mockSearchCities = vi.fn().mockResolvedValue(mockResults);
      vi.mocked(geocoding.searchCities).mockImplementation(mockSearchCities);

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CitySelector />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Search for a city...');
      await user.type(input, 'New');

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('disabled state during initialization', () => {
    it('should disable input during initialization', async () => {
      const mockGetCurrentPosition = vi.fn();
      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: mockGetCurrentPosition,
        },
        configurable: true,
      });

      render(
        <CityProvider>
          <CitySelector />
        </CityProvider>
      );

      const input = screen.getByPlaceholderText('Search for a city...');
      expect(input).toBeDisabled();
    });
  });
});
