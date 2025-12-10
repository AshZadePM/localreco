import { useContext } from 'react';
import { CityContext, CityContextType } from '../context/CityContext';

export const useCity = (): CityContextType => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
