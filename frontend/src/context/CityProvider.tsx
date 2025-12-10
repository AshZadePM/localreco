import React, { useEffect, useState, useCallback } from 'react';
import { CityContext, City, GeolocationState } from './CityContext';

interface CityProviderProps {
  children: React.ReactNode;
  onCityChange?: (city: City | null) => void;
}

export const CityProvider: React.FC<CityProviderProps> = ({ children, onCityChange }) => {
  const [selectedCity, setSelectedCityState] = useState<City | null>(null);
  const [geolocationState, setGeolocationState] = useState<GeolocationState>({
    status: 'idle',
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const setSelectedCity = useCallback(
    (city: City) => {
      setSelectedCityState(city);
      onCityChange?.(city);
    },
    [onCityChange]
  );

  const clearCity = useCallback(() => {
    setSelectedCityState(null);
    onCityChange?.(null);
  }, [onCityChange]);

  useEffect(() => {
    const initializeGeolocation = async () => {
      if (!navigator.geolocation) {
        setGeolocationState({
          status: 'error',
          error: 'Geolocation is not supported by your browser',
        });
        setIsInitialized(true);
        return;
      }

      setGeolocationState({ status: 'loading' });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeolocationState({
            status: 'success',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsInitialized(true);
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Location permission was denied';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'Location information is unavailable';
          } else if (error.code === error.TIMEOUT) {
            errorMessage = 'The request to get user location timed out';
          }
          setGeolocationState({
            status: 'error',
            error: errorMessage,
          });
          setIsInitialized(true);
        }
      );
    };

    initializeGeolocation();
  }, []);

  const value = {
    selectedCity,
    setSelectedCity,
    geolocationState,
    isInitialized,
    clearCity,
  };

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
};
