import React, { useContext } from 'react';
import { DatePicker } from '@mui/x-date-pickers';

import { UserInputContext } from '../../contexts/userInput.context';

import './IrrigationDatePicker.styles.scss';

export default function IrrigationDatePicker() {
  const { userSelections, setterFuncs } = useContext(UserInputContext);

  return (
    <DatePicker
      label='Last Irrigation Date'
      value={userSelections.irrigationDate}
      onChange={(newValue) => setterFuncs.setIrrigationDate(newValue)}
      disabled
    />
  );
}