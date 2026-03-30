import React, { useRef, useContext } from 'react';

import { ChartContext } from '../../contexts/chart.context';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import accessibility from 'highcharts/modules/accessibility';
import HC_more from 'highcharts/highcharts-more';
HC_more(Highcharts);
NoDataToDisplay(Highcharts);
accessibility(Highcharts);


export default function WaterDeficitGraph() {
  const chartComponent = useRef(null);
  const { chartData } = useContext(ChartContext);

  let series = [], dates = [], plotBands = [], plotLines = [], min = 0, max = 0;
  if (chartData) {
    ({ series, dates, plotBands, plotLines, min, max } = chartData);
  }

  const options = {
    credits: {
      href: 'https://www.nrcc.cornell.edu/',
      text: 'Northeast Regional Climate Center',
      position: {
        y: -4
      }
    },
    chart: {
      zoomType: 'x',
      plotBorderWidth: 1
    },
    plotOptions: {
      series: {
        marker: {
          enabled: true
        }
      }
    },
    title: {
      text: 'Water Deficit'
    },
    series,
    legend: {
      enabled: true
    },
    xAxis: {
      categories: dates
    },
    yAxis: {
      title: {
        text: 'Water Deficit (inches)',
      },
      tickInterval: 0.5,
      gridLineWidth : 0,
      plotBands,
      plotLines,
      min,
      max,
      endOnTick: false,
      startOnTick: false
    },
    tooltip: {
      shared: true,
      outside: true,
      split: false,
      useHTML: true,
      valueDecimals: 2
    },
  };

  return (
    <HighchartsReact
      ref={chartComponent}
      highcharts={Highcharts}
      options={options}
    />
  );
}