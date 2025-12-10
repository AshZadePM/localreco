import React from 'react';
import { CityProvider, CitySelector, useCity } from '../index';

/**
 * Example app demonstrating city selector usage
 */

const CityInfoPanel: React.FC = () => {
  const { selectedCity, geolocationState, isInitialized } = useCity();

  if (!isInitialized) {
    return <div>Initializing...</div>;
  }

  return (
    <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5' }}>
      <h2>City Information</h2>
      {selectedCity ? (
        <div>
          <p>
            <strong>Name:</strong> {selectedCity.name}
          </p>
          <p>
            <strong>Latitude:</strong> {selectedCity.latitude.toFixed(4)}°
          </p>
          <p>
            <strong>Longitude:</strong> {selectedCity.longitude.toFixed(4)}°
          </p>
        </div>
      ) : (
        <p>No city selected</p>
      )}

      <h3>Geolocation State</h3>
      <p>
        <strong>Status:</strong> {geolocationState.status}
      </p>
      {geolocationState.latitude && (
        <p>
          <strong>Detected Location:</strong> {geolocationState.latitude.toFixed(4)}°,{' '}
          {geolocationState.longitude?.toFixed(4)}°
        </p>
      )}
      {geolocationState.error && (
        <p>
          <strong>Error:</strong> {geolocationState.error}
        </p>
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1>City Selector Demo</h1>

      <CitySelector />

      <CityInfoPanel />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CityProvider
      onCityChange={(city) => {
        if (city) {
          console.log(`City changed to: ${city.name}`);
        } else {
          console.log('City cleared');
        }
      }}
    >
      <AppContent />
    </CityProvider>
  );
};
