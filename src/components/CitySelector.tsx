import React, { useState, useRef, useEffect } from 'react';
import { useCity } from '../hooks/useCity';
import { searchCities } from '../utils/geocoding';
import { City } from '../context/CityContext';
import './CitySelector.css';

export const CitySelector: React.FC = () => {
  const { selectedCity, setSelectedCity, geolocationState, isInitialized } = useCity();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const results = await searchCities(searchQuery);
        setSearchResults(results);
        setShowSuggestions(true);
      } catch (error) {
        setSearchError(error instanceof Error ? error.message : 'Search failed');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(performSearch, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setSearchQuery(city.name);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSelection = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
  };

  const getStatusMessage = (): { text: string; className: string } | null => {
    if (!isInitialized) {
      return { text: 'Initializing location services...', className: 'status-loading' };
    }

    if (selectedCity) {
      return {
        text: `Selected: ${selectedCity.name} (${selectedCity.latitude.toFixed(2)}°, ${selectedCity.longitude.toFixed(2)}°)`,
        className: 'status-success',
      };
    }

    if (geolocationState.status === 'loading') {
      return { text: 'Detecting your location...', className: 'status-loading' };
    }

    if (geolocationState.status === 'success' && geolocationState.latitude) {
      return {
        text: `Location detected (${geolocationState.latitude.toFixed(2)}°, ${geolocationState.longitude?.toFixed(2)}°)`,
        className: 'status-success',
      };
    }

    if (geolocationState.status === 'error') {
      return {
        text: `Location error: ${geolocationState.error}`,
        className: 'status-error',
      };
    }

    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="city-selector" ref={containerRef}>
      <div className="city-selector-container">
        <label htmlFor="city-input" className="city-selector-label">
          Select a City
        </label>

        <div className="city-selector-input-wrapper">
          <input
            id="city-input"
            type="text"
            className="city-selector-input"
            placeholder="Search for a city..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => searchQuery && setShowSuggestions(true)}
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls="city-suggestions"
            disabled={!isInitialized}
          />
          {searchQuery && (
            <button
              className="city-selector-clear-btn"
              onClick={handleClearSelection}
              aria-label="Clear selection"
              disabled={!isInitialized}
            >
              ✕
            </button>
          )}
        </div>

        {showSuggestions && searchResults.length > 0 && (
          <ul
            id="city-suggestions"
            className="city-selector-suggestions"
            role="listbox"
          >
            {searchResults.map((city) => (
              <li
                key={`${city.name}-${city.latitude}-${city.longitude}`}
                className="city-selector-suggestion-item"
                onClick={() => handleCitySelect(city)}
                role="option"
                aria-selected={selectedCity?.name === city.name}
              >
                <span className="city-name">{city.name}</span>
                <span className="city-coords">
                  {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                </span>
              </li>
            ))}
          </ul>
        )}

        {showSuggestions && searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="city-selector-no-results">
            No cities found matching "{searchQuery}"
          </div>
        )}

        {isSearching && (
          <div className="city-selector-searching">
            Searching...
          </div>
        )}

        {searchError && (
          <div className="city-selector-search-error">
            {searchError}
          </div>
        )}
      </div>

      {statusMessage && (
        <div className={`city-selector-status ${statusMessage.className}`}>
          {statusMessage.text}
        </div>
      )}
    </div>
  );
};
