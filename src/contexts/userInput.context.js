import React, { useState, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

import { ConstantsContext } from './constants.context';

// Set up initial state of context
export const UserInputContext = createContext({
  userSelections: null,
  setterFuncs: null
});

// Set up context provider
export const UserInputProvider = ({ children }) => {
  const { soilData, cropInfo, seasonStartYear } = useContext(ConstantsContext);

  const [waterCapacity, setWaterCapacity] = useState(Object.keys(soilData.labels)[0]);
  const [cropType, setCropType] = useState(Object.keys(cropInfo)[0]);
  const [plantDate, setPlantDate] = useState(new Date(`${seasonStartYear}-05-15T00:00`));
  const [irrigationDate, setIrrigationDate] = useState('');
  
  const value = {
    userSelections: {
      waterCapacity,
      cropType,
      plantDate,
      irrigationDate
    },
    setterFuncs: {
      setWaterCapacity,
      setCropType,
      setPlantDate,
      setIrrigationDate
    }
  };
  return (
    <UserInputContext.Provider value={value}>
      {children}
    </UserInputContext.Provider>
  );
};

UserInputProvider.propTypes = {
  children: PropTypes.node,
};
