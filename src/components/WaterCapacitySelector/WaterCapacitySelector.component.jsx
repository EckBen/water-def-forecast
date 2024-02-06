import React, { useContext } from 'react';
import { TextField, MenuItem } from '@mui/material';

import { ConstantsContext } from '../../contexts/constants.context';
import { UserInputContext } from '../../contexts/userInput.context';

import './WaterCapacitySelector.styles.scss';

export default function WaterCapacitySelector() {
  const { soilData } = useContext(ConstantsContext);
  const { userSelections, setterFuncs } = useContext(UserInputContext);

  return (
    <TextField
      select
      value={userSelections.waterCapacity}
      onChange={(e) => setterFuncs.setWaterCapacity(e.target.value)}
      label='Soil Water Capacity'
    >
      {
        Object.entries(soilData.labels).map(([k,v]) => (
          <MenuItem key={k} value={k}>{v}</MenuItem>
        ))
      }
    </TextField>
  );
}