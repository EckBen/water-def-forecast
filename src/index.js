import React from 'react';
import ReactDOM from 'react-dom/client';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

import './index.css';
import App from './App';

import { ConstantsProvider } from './contexts/constants.context';
import { LocationsProvider } from './contexts/locations.context';
import { UserInputProvider } from './contexts/userInput.context';
import { WeatherProvider } from './contexts/weather.context';
import { ChartProvider } from './contexts/chart.context';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ConstantsProvider>
        <UserInputProvider>
          <LocationsProvider>
            <WeatherProvider>
              <ChartProvider>
                <App />
              </ChartProvider>
            </WeatherProvider>
          </LocationsProvider>
        </UserInputProvider>
      </ConstantsProvider>
    </LocalizationProvider>
  </React.StrictMode>
);