import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { format, addDays, parse } from 'date-fns';

import { LocationsContext } from './locations.context';
import { ConstantsContext } from './constants.context';
import { UserInputContext } from './userInput.context';

import { runWaterDeficitModel } from '../waterDeficitModel/waterDeficitModel';

const postRequest = async (bodyObj, url, headers={}) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      ...headers
    },
    body: JSON.stringify(bodyObj),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const results = await response.json();
  return results;
};

const getRequest = async (url, headers={}) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      ...headers
    }
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const results = await response.json();
  return results;
};

const processIrrigationData = (irrigationData, year, targetLength) => {
  const {
    dates_pet,
    dates_pet_fcst,
    pet,
    pet_fcst
  } = irrigationData;

  // Remove missing days from PET
  const stripped_pet = [...pet];
  while (stripped_pet.length && stripped_pet[stripped_pet.length - 1] === -999) {
    stripped_pet.pop();
  }

  let dates = dates_pet.slice(0,stripped_pet.length);
  const stripped_dates_pet_fcst = [...dates_pet_fcst];
  const stripped_pet_fcst = [...pet_fcst];
  while (stripped_dates_pet_fcst.length && dates.includes(stripped_dates_pet_fcst[0])) {
    stripped_dates_pet_fcst.splice(0,1);
    stripped_pet_fcst.splice(0,1);
  }

  dates = dates.concat(stripped_dates_pet_fcst).map(d => `${year}-${d.replace('/','-')}`);
  const values = stripped_pet.concat(stripped_pet_fcst);
  const avgPet = values.reduce((a,b) => a + b) / values.length;

  const numDaysToFcst = targetLength - values.length;
  const finalObsDate = parse(dates[dates.length - 1], 'yyyy-MM-dd', new Date());
  for (let i = 1; i <= numDaysToFcst; i++) {
    dates.push(format(addDays(finalObsDate, i), 'yyyy-MM-dd'));
    values.push(avgPet);    
  }

  return { dates, values };
};

// Set up initial state of context
export const WeatherContext = createContext({
  waterDeficits: null
});

// Set up context provider
export const WeatherProvider = ({ children }) => {
  const { selectedLocationInfo } = useContext(LocationsContext);
  const { percentiles, fcstUrl, acisUrl, petUrlCreator, today, seasonStartYear } = useContext(ConstantsContext);
  const { userSelections } = useContext(UserInputContext);
  
  const [weatherData, setWeatherData] = useState(null);
  const [waterDeficits, setWaterDeficits] = useState(null);

  useEffect(() => {
    if (selectedLocationInfo) {
      const lngLatArr = [selectedLocationInfo.lng, selectedLocationInfo.lat];
      
      const acisBody = {
        loc: lngLatArr.join(','),
        grid: 'nrcc-model',
        sDate: `${seasonStartYear}-03-01`,
        eDate: format(today, 'yyyy-MM-dd'),
        elems: [{ name: 'pcpn' }]
      };

      const fcstBody = {
        lngLatArr,
        percentiles
      };

      (async () => {
        const [observedPrecip, forecastPrecip, irrigationData] = await Promise.all([
          postRequest(acisBody, acisUrl),
          postRequest(fcstBody, fcstUrl, { 'Authorization': 'api-673283n7-token' }),
          getRequest(petUrlCreator(lngLatArr, seasonStartYear), { 'Authorization': 'api-4a0607-token' })
        ]);

        console.log('ACIS precip return: ', observedPrecip);
        console.log('Forecasted precip return: ', forecastPrecip);
        console.log('Irrigation API return: ', irrigationData);

        setWeatherData({
          qpf: forecastPrecip.qpf,
          outlook: forecastPrecip.outlook,
          obsPrecip: observedPrecip.data.reduce((acc, [date, value]) => {
            acc.dates.push(date);
            acc.values.push(value);
            return acc;
          },{ dates: [], values: [] }),
          pet: processIrrigationData(irrigationData, seasonStartYear, observedPrecip.data.length + 28)
        });
      })();
    }
  }, [selectedLocationInfo, fcstUrl, acisUrl, petUrlCreator, percentiles, today, seasonStartYear]);

  useEffect(() => {
    if (userSelections && weatherData && today && seasonStartYear) {
      const {
        waterCapacity,
        cropType,
        plantDate,
        irrigationDate
      } = userSelections;
      const {
        qpf,
        outlook,
        obsPrecip,
        pet
      } = weatherData;

      const plantDateStr = format(plantDate, 'yyyy-MM-dd');
      const irrigationDateStr = irrigationDate === '' ? '' : format(irrigationDate, 'yyyy-MM-dd');

      const observed = [...obsPrecip.values];
      while (observed[observed.length - 1] === -999) {
        observed.pop();
      }

      let initDeficit = 0;
      let startPetIdx = 0;
      let endPetIdx = pet.dates.findIndex(d => d === obsPrecip.dates[observed.length - 1]) + 1;
      let irrigationDateIdxInChunk = pet.dates.slice(startPetIdx, endPetIdx).findIndex(d => d === irrigationDateStr);
      const { deficitDaily: observedDeficits } = runWaterDeficitModel(observed,pet.values.slice(startPetIdx, endPetIdx),initDeficit,pet.dates[startPetIdx],plantDateStr, irrigationDateIdxInChunk ,waterCapacity,cropType,false);

      initDeficit = observedDeficits[observedDeficits.length - 1];
      // Handle observed overlapping QPF forecast
      const qpfStartIdx = pet.dates.findIndex(d => d === qpf.dates[0]);
      const qpfStartTrim = Math.max(endPetIdx - qpfStartIdx, 0);
      startPetIdx = qpfStartIdx + qpfStartTrim;
      endPetIdx = startPetIdx + qpf.values.length - qpfStartTrim;
      irrigationDateIdxInChunk = pet.dates.slice(startPetIdx, endPetIdx).findIndex(d => d === irrigationDateStr);
      const { deficitDaily: qpfDeficits } = runWaterDeficitModel(qpf.values.slice(qpfStartTrim),pet.values.slice(startPetIdx, endPetIdx),initDeficit,pet.dates[startPetIdx],plantDateStr, irrigationDateIdxInChunk ,waterCapacity,cropType,true);
      const qpfSeries = Array(startPetIdx).fill(null).concat(qpfDeficits);

      initDeficit = qpfDeficits[qpfDeficits.length - 1];
      startPetIdx = pet.dates.findIndex(d => d === outlook.dates[0]);
      endPetIdx = Math.min(pet.values.length, startPetIdx + outlook[percentiles[0]].length);
      irrigationDateIdxInChunk = pet.dates.slice(startPetIdx, endPetIdx).findIndex(d => d === irrigationDateStr);
      const percentileDefs = percentiles.reduce((acc,percentile) => {
        const { deficitDaily } = runWaterDeficitModel(outlook[percentile],pet.values.slice(startPetIdx, endPetIdx),initDeficit,pet.dates[startPetIdx],plantDateStr, irrigationDateIdxInChunk ,waterCapacity,cropType,true);
        acc[percentile] = Array(startPetIdx).fill(null).concat(deficitDaily);
        return acc;
      }, {});

      setWaterDeficits({
        dates: pet.dates,
        observed: observedDeficits,
        qpf: qpfSeries,
        percentileDeficits: percentileDefs,
        waterCapacity
      });
    }
  }, [weatherData, userSelections, today, seasonStartYear, percentiles]);
  
  const value = {
    waterDeficits
  };
  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};

WeatherProvider.propTypes = {
  children: PropTypes.node,
};
