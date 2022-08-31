export const buildChartOptions = (chartType, height, plotOptions, chartRange, chartInterval, step, tooltipPrefix) => {
  return {
    chart: {
      type: chartType,
      spacingLeft: 0,
      spacingRight: 0,
      height: height,
      plotBackgroundColor: 'transparent',
      borderColor: 'transparent',
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'cera-regular',
      },
    },
    plotOptions: {
      ...plotOptions,
      series: {
        series: {
          connectNulls: true,
        },
        states: {
          hover: {
            enabled: false,
          },
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
    yAxis: {
      labels: {
        enabled: false,
      },
      gridLineColor: 'transparent',
      title: {
        enabled: false,
      },
      // If undefined then chart auto selects
      ...chartRange,
    },
    xAxis: {
      crosshair: {
        width: 1,
        color: 'var(--border-blue)',
        dashStyle: 'shortdot',
      },
      tickmarkPlacement: 'on',
      tickWidth: 0,
      tickInterval: 24 * 3600 * 1000 * chartInterval,
      type: 'datetime',
      labels: {
        step: step,
        format: '{value:%e %b}',
        style: {
          fontFamily: 'var(--cera-medium)',
          fontSize: '15px',
          color: 'var(--white)',
        },
      },
    },
    legend: {
      enabled: true,
      align: 'left',
      layout: 'horizontal',
      x: 0,
      y: 0,
      paddingTop: 10,
      itemMarginTop: 8,
      itemMarginBottom: 8,
      itemHiddenStyle: {
        color: 'var(--blue-03)',
      },
      itemHoverStyle: {
        color: 'var(--purple-aux)',
      },
      itemStyle: {
        color: 'var(--white)',
        lineHeight: '14px',
        fontSize: '14px',
      },
    },
    tooltip: {
      backgroundColor: 'var(--blue-05)',
      borderWidth: 0,
      padding: 20,
      shared: true,
      crosshairs: true,
      xDateFormat: '%Y-%m-%d',
      valueDecimals: 2,
      valuePrefix: tooltipPrefix,
      hideDelay: 100,
      style: {
        color: 'var(--white)',
        fontSize: '16px',
        lineHeight: '30px',
      },
    },
  };
};
