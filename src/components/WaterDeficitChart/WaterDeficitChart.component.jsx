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


export default function WaterDeficitGraph({ soilCap, todayIdx, today, irrigationDates }) {
  const chartComponent = useRef(null);
  const { chartData } = useContext(ChartContext);

  let series = [], dates = [], plotBands = [], plotLines = [], min = 0, max = 0;
  if (chartData) {
    ({ series, dates, plotBands, plotLines, min, max } = chartData);
  }

  // // Shift deficits to have stress threshold be 0 on the new scale (instead of field capacity as is output from the model)
  // const adjustment = SOIL_DATA.soilmoistureoptions[props.soilCap].fieldcapacity - SOIL_DATA.soilmoistureoptions[props.soilCap].stressthreshold;
  // const adjustedDeficits = props.deficits.map(val => val + adjustment);
  // const defMin = Math.min(...adjustedDeficits) - 0.1;
  // const defMax = Math.max(...adjustedDeficits) + 0.1;

  // const { plotLines, plotBands, breakpoints }  = getPlotBandsLinesBreakpoints(adjustedDeficits[props.todayIdx], props.soilCap);
  // const observedDeficits = colorPoints(breakpoints, adjustedDeficits.slice(0,props.todayIdx + 1).concat(Array(adjustedDeficits.length - (props.todayIdx + 1)).fill(null)));
  // const forecastedDeficits = colorPoints(breakpoints, Array(props.todayIdx + 1).fill(null).concat(adjustedDeficits.slice(props.todayIdx + 1)));
  // const irrigationIdxs = props.irrigationDates.length > 0 ? props.irrigationDates.map(irriDate => props.dates.findIndex(d => d === irriDate?.slice(5))) : [];
  // const dates = [...props.dates];
  // if (props.dates.findIndex(d => d ==='10-31') === props.todayIdx) {
  //   for (let i = 0; i < adjustedDeficits.length - (props.todayIdx + 1); i++) {
  //     observedDeficits.pop();
  //     forecastedDeficits.pop();
  //     dates.pop();
  //   }
  // }

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
      categories: dates,
      // plotLines: irrigationIdxs.map(idx => ({
      //   color: 'rgba(0,0,255,0.5)',
      //   width: 2,
      //   dashStyle: 'dash',
      //   value: idx,
      //   label: {
      //       text: 'Irrigation',
      //       rotation: 90,
      //       y: 10,
      //   },
      //   zIndex: 1
      // }))
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
      // formatter: function () {
      //   if (!this || !this.points) return '';

      //   const dataElems = this.points.map((p) => {
      //     return (
      //       <Fragment key={p.series.name}>
      //         <Box>{p.series.name}</Box>
      //         <Box style={{ justifySelf: 'right' }}>
      //           <span style={{ fontWeight: 'bold' }}>{typeof p.y === 'number' ? roundXDigits(p.y, 2) : ''}</span> in
      //         </Box>
      //       </Fragment>
      //     );
      //   });

      //   return renderToStaticMarkup(
      //     <Box
      //       style={{
      //         padding: '0px 6px',
      //         height: 'fit-content',
      //       }}
      //     >
      //       <Box
      //         style={{
      //           fontSize: '16px',
      //           fontWeight: 'bold',
      //           textAlign: 'center',
      //         }}
      //       >
      //         {this.points[0].key}
      //       </Box>

      //       <Box
      //         style={{
      //           height: '1px',
      //           width: '85%',
      //           backgroundColor: 'rgb(239,64,53)',
      //           margin: '2px auto',
      //         }}
      //       />

      //       <Box
      //         style={{
      //           display: 'grid',
      //           gridTemplateColumns: 'repeat(2, 50%)',
      //           gridTemplateRows: `repeat(${this.points.length}, 18px)`,
      //           gridColumnGap: '3px',
      //           alignItems: 'center',
      //         }}
      //       >
      //         {dataElems}
      //       </Box>
      //     </Box>
      //   );
      // },
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