import React, { useContext } from 'react';

import { LocationsContext } from './contexts/locations.context';

import LocationPicker from './components/LocationPicker/LocationPicker';
import WaterCapacitySelector from './components/WaterCapacitySelector/WaterCapacitySelector.component';
import CropTypeSelector from './components/CropTypeSelector/CropTypeSelector.component';
import PlantDatePicker from './components/PlantDatePicker/PlantDatePicker.component';
import IrrigationDatePicker from './components/IrrigationDatePicker/IrrigationDatePicker.component';
import WaterDeficitGraph from './components/WaterDeficitChart/WaterDeficitChart.component';

export default function App() {
  const { locations, selectedLocation, updateStoredLocations } = useContext(LocationsContext);

  return (
    <div className="App">
      <LocationPicker
        locations={locations}
        selected={selectedLocation}
        newLocationsCallback={updateStoredLocations}
        token={process.env.REACT_APP_MAPBOX_TOKEN}
        modalZIndex={150}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '200px' }}>
        <WaterCapacitySelector />
        <CropTypeSelector />
        <PlantDatePicker />
        <IrrigationDatePicker />
      </div>

      <WaterDeficitGraph />
    </div>
  );
}