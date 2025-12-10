import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CitySelector } from './CitySelector';
import { CityProvider } from '../context/CityProvider';

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

const CitySelectorWithProvider = () => (
  <CityProvider>
    <CitySelector />
  </CityProvider>
);

describe('CitySelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the city input', () => {
    render(<CitySelectorWithProvider />);
    expect(screen.getByTestId('city-input')).toBeInTheDocument();
  });

  it('shows dropdown when input is focused', async () => {
    render(<CitySelectorWithProvider />);

    const input = screen.getByTestId('city-input');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByTestId('city-dropdown')).toBeInTheDocument();
    });
  });

  it('displays city options in dropdown', async () => {
    render(<CitySelectorWithProvider />);

    const input = screen.getByTestId('city-input');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByTestId('city-option-London')).toBeInTheDocument();
      expect(screen.getByTestId('city-option-Paris')).toBeInTheDocument();
      expect(screen.getByTestId('city-option-New York')).toBeInTheDocument();
    });
  });

  it('filters cities based on search term', async () => {
    const user = userEvent.setup();
    render(<CitySelectorWithProvider />);

    const input = screen.getByTestId('city-input');
    await user.type(input, 'lon');

    await waitFor(() => {
      expect(screen.getByTestId('city-option-London')).toBeInTheDocument();
      expect(screen.queryByTestId('city-option-Paris')).not.toBeInTheDocument();
    });
  });

  it('selects a city when clicked', async () => {
    const user = userEvent.setup();
    render(<CitySelectorWithProvider />);

    const input = screen.getByTestId('city-input');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByTestId('city-option-London')).toBeInTheDocument();
    });

    const londonOption = screen.getByTestId('city-option-London');
    await user.click(londonOption);

    await waitFor(() => {
      expect(screen.getByTestId('selected-city')).toHaveTextContent('Selected: London');
    });
  });

  it('clears search term after selection', async () => {
    const user = userEvent.setup();
    render(<CitySelectorWithProvider />);

    const input = screen.getByTestId('city-input') as HTMLInputElement;
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByTestId('city-option-London')).toBeInTheDocument();
    });

    const londonOption = screen.getByTestId('city-option-London');
    await user.click(londonOption);

    await waitFor(() => {
      expect(input.value).toBe('London');
    });
  });

  it('hides dropdown when a city is selected', async () => {
    const user = userEvent.setup();
    render(<CitySelectorWithProvider />);

    const input = screen.getByTestId('city-input');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByTestId('city-dropdown')).toBeInTheDocument();
    });

    const londonOption = screen.getByTestId('city-option-London');
    await user.click(londonOption);

    await waitFor(() => {
      expect(screen.queryByTestId('city-dropdown')).not.toBeInTheDocument();
    });
  });

  it('shows no results message when search has no matches', async () => {
    const user = userEvent.setup();
    render(<CitySelectorWithProvider />);

    const input = screen.getByTestId('city-input');
    await user.type(input, 'xyz');

    await waitFor(() => {
      const dropdown = screen.getByTestId('city-dropdown');
      expect(within(dropdown).getByText('No cities found')).toBeInTheDocument();
    });
  });

  it('shows selected city display', async () => {
    const user = userEvent.setup();
    render(<CitySelectorWithProvider />);

    const input = screen.getByTestId('city-input');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByTestId('city-option-Paris')).toBeInTheDocument();
    });

    const parisOption = screen.getByTestId('city-option-Paris');
    await user.click(parisOption);

    await waitFor(() => {
      const selectedCity = screen.getByTestId('selected-city');
      expect(selectedCity).toHaveTextContent('Selected: Paris');
    });
  });

  it('reopens dropdown when clicking selected city again', async () => {
    const user = userEvent.setup();
    render(<CitySelectorWithProvider />);

    const input = screen.getByTestId('city-input');

    // Select a city first
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByTestId('city-option-London')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('city-option-London'));

    await waitFor(() => {
      expect(screen.queryByTestId('city-dropdown')).not.toBeInTheDocument();
    });

    // Focus again to reopen
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByTestId('city-dropdown')).toBeInTheDocument();
    });
  });

  it('handles case-insensitive search', async () => {
    const user = userEvent.setup();
    render(<CitySelectorWithProvider />);

    const input = screen.getByTestId('city-input');
    await user.type(input, 'LONDON');

    await waitFor(() => {
      expect(screen.getByTestId('city-option-London')).toBeInTheDocument();
    });
  });

  it('supports selecting different cities sequentially', async () => {
    const user = userEvent.setup();
    render(<CitySelectorWithProvider />);

    const input = screen.getByTestId('city-input');

    // Select first city
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByTestId('city-option-London')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('city-option-London'));

    await waitFor(() => {
      expect(screen.getByTestId('selected-city')).toHaveTextContent('Selected: London');
    });

    // Select different city
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByTestId('city-option-Paris')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('city-option-Paris'));

    await waitFor(() => {
      expect(screen.getByTestId('selected-city')).toHaveTextContent('Selected: Paris');
    });
  });
});
