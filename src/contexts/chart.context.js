import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

import { WeatherContext } from './weather.context';
import { ConstantsContext } from './constants.context';

import { MODEL_DATA } from '../waterDeficitModel/waterDeficitModel';

const PLOT_BAND_COLORS = ['0,128,0', '255,255,0', '255,128,0', '255,0,0'];
const PLOT_BAND_LABELS = ['No deficit for plant', 'Deficit, no plant stress', 'Deficit, plant stress likely', 'Deficit, severe plant stress'];
const PLOT_LINE_LABELS = ['Saturation', 'Field Capacity', 'Plant Stress Begins', 'Wilting Danger Exists'];

function roundXDigits( number, digits ) {
  if (typeof number === 'string') {
    number = parseFloat(number);
  }
  
  const res = (Math.round( number * Math.pow(10, digits) ) / Math.pow(10, digits)).toFixed(digits);
  
  return parseFloat(res);
}

const colorPoints = (bounds, values) => {
  return values.map(value => {
    let color = 'transparent';
    if (value !== null) {
      for (let i = 0; i < bounds.length; i++) {
        const bound = bounds[i];
        if (value >= bound && PLOT_BAND_COLORS[i]) {
          color = `rgba(${PLOT_BAND_COLORS[i]},0.8)`;
          break;
        } else if (i === bounds.length - 1) {
          color = `rgba(${PLOT_BAND_COLORS[i + 1]},0.8)`;
        }
      }
    }
    return {
      color,
      y: value
    };
  });
};

const getPlotBandsLinesBreakpoints = (todayDeficit, soilCap) => {
  const soilConstants = MODEL_DATA.soildata.soilmoistureoptions[soilCap];

  const breakpoints = [
    roundXDigits(soilConstants.saturation - soilConstants.fieldcapacity, 3),
    roundXDigits(soilConstants.fieldcapacity - soilConstants.fieldcapacity, 3),
    roundXDigits(soilConstants.stressthreshold - soilConstants.fieldcapacity, 3),
    roundXDigits(soilConstants.prewiltingpoint - soilConstants.fieldcapacity, 3)
  ];

  const plotLines = breakpoints.map((bp, i) => ({
    value: bp,
    width: 1.0,
    color: 'rgba(200,200,200,0.5)',
    label: {
      text: PLOT_LINE_LABELS[i] || '',
      style: {
          fontSize: '0.8em',
          color: 'gray',
          fontWeight: 'lighter',
      },
      align: 'right',
      x: -4,
      y: 8
    }
  }));

  const plotBands = breakpoints.map((bp, i) => {
    const high = i === 0 ? 99 : bp;
    const low = breakpoints[i + 1] === undefined ? -99 : breakpoints[i + 1];
    const todayInBand = low <= todayDeficit && todayDeficit < high;

    return {
      to: high,
      from: low,
      color: todayInBand ? `rgba(${PLOT_BAND_COLORS[i]},0.13)` : 'transparent',
      label: {
        text: PLOT_BAND_LABELS[i] || '',
        style: {
          fontSize: '1.0em',
          color: todayInBand ? 'black' : 'gray',
          fontWeight: todayInBand ? 'bold' : 'lighter',
        },
        align: 'left',
        verticalAlign: 'middle',
        x: 10,
        y: 5
      }
    };
  });

  breakpoints.shift();

  return { plotBands, plotLines, breakpoints };
};


// Set up initial state of context
export const ChartContext = createContext({
  chartData: null
});

// Set up context provider
export const ChartProvider = ({ children }) => {
  const { waterDeficits } = useContext(WeatherContext);
  const { percentiles } = useContext(ConstantsContext);

  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (waterDeficits) {
      const {
        dates,
        observed,
        qpf,
        percentileDeficits,
        waterCapacity
      } = waterDeficits;

      const { plotBands, plotLines, breakpoints } = getPlotBandsLinesBreakpoints(observed[observed.length - 1], waterCapacity);

      const allValues = [observed, qpf].concat(Object.values(percentileDeficits).flat()).flat().filter(v => v !== null);
      const min = Math.min(...allValues) - 0.1;
      const max = Math.max(...allValues) + 0.1;

      const series = [{
        type: 'line',
        data: colorPoints(breakpoints, observed),
        name: 'Observed',
        zIndex: 2,
        color: 'black',
        marker: {
          enabledThresold: 0,
          lineColor: 'black',
          lineWidth: 1,
          symbol: 'circle',
          radius: 3
        }
      },
      {
        type: 'line',
        data: qpf,
        name: 'QPF Forecast',
        zIndex: 2,
        color: 'red',
        dashStyle: 'ShortDot',
        marker: {
          enabledThresold: 0,
          lineColor: 'red',
          lineWidth: 1,
          symbol: 'circle',
          radius: 3
        }
      }];

      const percentilesCopy = [...percentiles];
      if (percentilesCopy.includes(50)) {
        series.push({
          type: 'line',
          data: percentileDeficits[50],
          name: `Outlook Forecast Mean`,
          zIndex: percentilesCopy.length,
          color: 'orange',
          marker: {
            enabledThresold: 0,
            lineColor: 'orange',
            lineWidth: 1,
            symbol: 'circle',
            radius: 3
          }
        });
        const idx = percentilesCopy.indexOf(50);
        percentilesCopy.splice(idx, 1);
      }

      percentilesCopy.slice(0,percentilesCopy.length/2).forEach((lower, i) => {
        const upper = percentilesCopy[percentilesCopy.length - 1 - i];
        const upperDeficits = percentileDeficits[upper];
        series.push({
          type: 'arearange',
          data: percentileDeficits[lower].map((v,i) => [i, v, upperDeficits[i]]),
          name: `Outlook Forecast ${lower}-${upper}%`,
          zIndex: i,
          marker: {
            enabledThresold: 0,
            lineColor: 'black',
            lineWidth: 1,
            symbol: 'circle',
            radius: 3
          }
        });
      });


      setChartData({ series, dates, plotBands, plotLines, min, max });
    }
  }, [waterDeficits, percentiles]);

  const value = {
    chartData
  };
  return (
    <ChartContext.Provider value={value}>
      {children}
    </ChartContext.Provider>
  );
};

ChartProvider.propTypes = {
  children: PropTypes.node,
};
