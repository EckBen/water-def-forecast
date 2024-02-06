import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

import { ConstantsContext } from './constants.context';

// Set up initial state of context
export const LocationsContext = createContext({
  locations: {},
  selectedLocation: null,
  updateStoredLocations: () => null,
  selectedLocationInfo: null
});

// Set up context provider
export const LocationsProvider = ({ children }) => {
  const { toolName } = useContext(ConstantsContext);

  const retrieve = (key, doParse=true) => {
    const results = localStorage.getItem(`${toolName}.${key}`);
    if (results && doParse) {
      return JSON.parse(results);
    }
    return results;
  };
  
  const store = (key, value, doStringify=true) => {
    if (doStringify) {
      localStorage.setItem(`${toolName}.${key}`, JSON.stringify(value));
    } else {
      localStorage.setItem(`${toolName}.${key}`, value);
    }
  }

  const [ locations, setLocations ] = useState(retrieve('locations') || {});
  const [ selectedLocation, setSelectedLocation ] = useState(retrieve('selected', false) || '');
  
  const updateStoredLocations = (newSelectedLocation, newLocations) => {
    store('selected', newSelectedLocation, false);
    store('locations', newLocations);
    setLocations(newLocations);
    setSelectedLocation(newSelectedLocation);
  }

  const value = {
    locations,
    selectedLocation,
    updateStoredLocations,
    selectedLocationInfo: (selectedLocation && selectedLocation in locations) ? locations[selectedLocation] : null
  };
  return (
    <LocationsContext.Provider value={value}>
      {children}
    </LocationsContext.Provider>
  );
};

LocationsProvider.propTypes = {
  children: PropTypes.node,
};