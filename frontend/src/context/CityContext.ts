import React from 'react';

export interface City {
  name: string;
  latitude: number;
  longitude: number;
}

export interface GeolocationState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  latitude?: number;
  longitude?: number;
}

export interface CityContextType {
  selectedCity: City | null;
  setSelectedCity: (city: City) => void;
  geolocationState: GeolocationState;
  isInitialized: boolean;
  clearCity: () => void;
}

export const CityContext = React.createContext<CityContextType | undefined>(undefined);
