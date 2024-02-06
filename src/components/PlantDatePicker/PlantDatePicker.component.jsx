import React, { useContext } from 'react';
import { DatePicker } from '@mui/x-date-pickers';

import { UserInputContext } from '../../contexts/userInput.context';

import './PlantDatePicker.styles.scss';

export default function PlantDatePicker() {
  const { userSelections, setterFuncs } = useContext(UserInputContext);

  return (
    <DatePicker
      label='Planting/Budbreak'
      value={userSelections.plantDate}
      onChange={(newValue) => setterFuncs.setPlantDate(newValue)}
    />
  );
}