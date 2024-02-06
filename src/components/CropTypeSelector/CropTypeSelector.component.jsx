import React, { useContext } from 'react';
import { TextField, MenuItem } from '@mui/material';

import { ConstantsContext } from '../../contexts/constants.context';
import { UserInputContext } from '../../contexts/userInput.context';

import './CropTypeSelector.styles.scss';

export default function CropTypeSelector() {
  const { cropInfo } = useContext(ConstantsContext);
  const { userSelections, setterFuncs } = useContext(UserInputContext);

  return (
    <TextField
      select
      value={userSelections.cropType}
      onChange={(e) => setterFuncs.setCropType(e.target.value)}
      label='Crop Type'
    >
      {
        Object.entries(cropInfo).map(([k,v]) => (
          <MenuItem key={k} value={k}>{v.label}</MenuItem>
        ))
      }
        select
    </TextField>
  );
}