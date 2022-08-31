import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import styled from 'styled-components';
import React from 'react';

interface SparkLineProps {
  data: number[];
  precision?: number;
}

const SparkLine = ({ data, precision = 4 }: SparkLineProps) => {
  const chartOptions = {
    chart: {
      type: 'spline',
      height: '70px',
      plotBackgroundColor: 'transparent',
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'cera-regular',
      },
    },
    plotOptions: {
      series: {
        states: {
          hover: {
            enabled: false,
          },
        },
        marker: {
          enabled: false,
        },
      },
    },
    title: {
      style: {
        display: 'none',
      },
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      enabled: false,
    },
    yAxis: {
      visible: false,
      gridLineColor: 'transparent',
      title: {
        enabled: false,
      },
      min: Math.min(...data),
      max: Math.max(...data),
    },
    xAxis: {
      visible: false,
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        color: data[data.length - 1] >= data[0] ? 'var(--positive)' : 'var(--negative)',
        data: data.map((item) => parseFloat(item.toFixed(precision))),
      },
    ],
  };

  return (
    <SparkLineContainer>
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </SparkLineContainer>
  );
};

const SparkLineContainer = styled.div`
  height: 70px;
  width: 100%;
`;

export default React.memo(SparkLine);
