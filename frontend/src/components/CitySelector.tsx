import React, { useState } from 'react';
import { useCity } from '../hooks/useCity';
import { City } from '../context/CityContext';
import './CitySelector.css';

const CITIES: City[] = [
  { name: 'London', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Paris', latitude: 48.8566, longitude: 2.3522 },
  { name: 'New York', latitude: 40.7128, longitude: -74.006 },
  { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Sydney', latitude: -33.8688, longitude: 151.2093 },
];

export const CitySelector: React.FC = () => {
  const { selectedCity, setSelectedCity } = useCity();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredCities = CITIES.filter((city) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setSearchTerm('');
    setShowDropdown(false);
  };

  return (
    <div className="city-selector">
      <div className="city-input-wrapper">
        <input
          type="text"
          placeholder="Select a city..."
          value={searchTerm || selectedCity?.name || ''}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="city-input"
          data-testid="city-input"
        />
        {showDropdown && (
          <div className="city-dropdown" data-testid="city-dropdown">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <div
                  key={city.name}
                  className="city-option"
                  onClick={() => handleSelectCity(city)}
                  data-testid={`city-option-${city.name}`}
                >
                  {city.name}
                </div>
              ))
            ) : (
              <div className="city-no-results">No cities found</div>
            )}
          </div>
        )}
      </div>
      {selectedCity && (
        <div className="selected-city" data-testid="selected-city">
          Selected: <strong>{selectedCity.name}</strong>
        </div>
      )}
    </div>
  );
};
