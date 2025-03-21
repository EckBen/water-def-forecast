import React, { createContext } from 'react';
import PropTypes from 'prop-types';
import { isBefore } from 'date-fns';

import { MODEL_DATA } from '../waterDeficitModel/waterDeficitModel';

// Name of app for use in localStorage
const TOOL_NAME = 'WATER-DEF-FORECAST';

// Percentiles for outlook values
const PERCENTILES = [0,10,25,50,75,90,100];

// URL for cors-proxy API's forecast endpoint
// const FORECAST_API_URL = 'http://0.0.0.0:8787/getOutlook';
const FORECAST_API_URL = 'https://precip-outlook.rcc-acis.workers.dev/getOutlook';
// const FORECAST_API_URL = 'https://cors-proxy.benlinux915.workers.dev/month-precip-forecast';

// ACIS server url
const ACIS_GRID_URL = 'https://grid2.rcc-acis.org/GridData';

// Irrigation API url
const IRRIGATION_API_URL_CONSTRUCTOR = (coords, year) => `https://csf-irrigation-api-worker.rcc-acis.workers.dev/?lat=${coords[1]}&lon=${coords[0]}&year=${year}`;

const TODAY = new Date();
const thisYear = TODAY.getFullYear();
const SEASON_START_YEAR = thisYear - (isBefore(TODAY, new Date(`${thisYear}-03-01`)) ? 1 : 0);

// Set up initial state of context
export const ConstantsContext = createContext({
  toolName: TOOL_NAME,
  cropInfo: MODEL_DATA.cropinfo,
  soilData: MODEL_DATA.soildata,
  percentiles: PERCENTILES,
  fcstUrl: FORECAST_API_URL,
  acisUrl: ACIS_GRID_URL,
  petUrlCreator: IRRIGATION_API_URL_CONSTRUCTOR,
  today: TODAY,
  seasonStartYear: SEASON_START_YEAR
});

// Set up context provider
export const ConstantsProvider = ({ children }) => {
  const value = {
    toolName: TOOL_NAME,
    cropInfo: MODEL_DATA.cropinfo,
    soilData: MODEL_DATA.soildata,
    percentiles: PERCENTILES,
    fcstUrl: FORECAST_API_URL,
    acisUrl: ACIS_GRID_URL,
    petUrlCreator: IRRIGATION_API_URL_CONSTRUCTOR,
    today: TODAY,
    seasonStartYear: SEASON_START_YEAR
};
  return (
    <ConstantsContext.Provider value={value}>
      {children}
    </ConstantsContext.Provider>
  );
};

ConstantsProvider.propTypes = {
  children: PropTypes.node,
};
