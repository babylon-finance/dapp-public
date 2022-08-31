import { Dropdown, TimeframeSelector, ReserveNumber, HoverTooltip, Icon } from 'components/shared';
import { EmptyGraph } from 'components/garden/detail';
import ReturnIndexTooltip from 'components/garden/strategies/ReturnIndexTooltip';
import GardenDetailChartHeroMetric from './GardenDetailChartHeroMetric';
import addresses from 'constants/addresses';
import { W3Context } from 'context/W3Provider';
import {
  FullGardenDetails,
  GardenMetricItem,
  GardenMetricResponse,
  StrategyDetails,
  StrategyMetricItem,
  Token,
  Timeframe,
  IconName,
} from 'models';
import { TokenListService } from 'services';
import { mkShortAddress } from 'helpers/Addresses';
import { getProfitStrategy } from 'helpers/Strategy';
import { formatReserveFloat } from 'helpers/Numbers';
import { daysBetween } from 'helpers/Date';
import { GARDEN_NEW_NUM_DAYS } from 'config';

import { BigNumber } from '@ethersproject/bignumber';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import styled from 'styled-components';
import React from 'react';
import HeroMetricsCard from './HeroMetricsCard';

interface ChartProps {
  height: number;
  metricData?: GardenMetricResponse;
  reserveAddress: string;
  gardenDetails: FullGardenDetails;
  strategy?: StrategyDetails;
}

interface MinMax {
  max: number;
  min: number;
}

interface ChartState {
  selectedChart: string;
  selectedTimeFrame: string;
  tokenListService: TokenListService;
}

const TIMEFRAME_OPTIONS = {
  week: 'week',
  month: 'month',
  quarter: 'quarter',
  halfYear: 'halfYear',
  year: 'year',
};

const SERIES_COLORS = ['var(--purple)', 'var(--yellow)', 'var(--purple-03)', 'var(--turquoise-01)'];

let SERIES_OPTIONS = [
  {
    value: 'garden',
    label: 'Share Price',
  },
  {
    value: 'strategies',
    label: 'Strategies NAV',
  },
  {
    value: 'allocation',
    label: 'Active vs Idle Principal',
  },
  {
    value: 'nav',
    label: 'Net Asset Value',
  },
];

const LINE_LABEL = {
  labels: {
    format: '{value}',
    style: {
      fontSize: '16px',
      color: 'var(--border-blue)',
    },
  },
};

const AREA_LABEL = {
  labels: {
    format: '{value}',
    style: {
      fontSize: '16px',
      color: 'var(--border-blue)',
    },
  },
};

const LINE_OPTIONS = {
  series: {
    marker: {
      enabled: false,
    },
  },
};

const AREA_OPTIONS = {
  area: {
    stacking: 'percent',
    lineWidth: 1,
    marker: {
      lineWidth: 1,
    },
  },
};

interface StrategyMetricBoxProps {
  label: string;
  children: React.ReactNode;
  tooltip?: boolean;
  bablIcon?: boolean;
}

const StrategyMetricBox = ({ label, children, tooltip, bablIcon }: StrategyMetricBoxProps) => {
  return (
    <StrategyMetricBoxWrapper>
      <StrategyMetricLabel>{label}</StrategyMetricLabel>
      <StrategyMetricValue>{children}</StrategyMetricValue>
    </StrategyMetricBoxWrapper>
  );
};

export default class GardenDetailChart extends React.PureComponent<ChartProps, ChartState> {
  static contextType = W3Context;

  constructor(props: ChartProps) {
    super(props);
    if (props.gardenDetails.contribution !== undefined) {
      SERIES_OPTIONS[0].label = 'Share Price vs Your Avg Share Price';
    }
    this.state = {
      tokenListService: TokenListService.getInstance(),
      selectedChart: props.strategy ? SERIES_OPTIONS[1].value : SERIES_OPTIONS[0].value,
      selectedTimeFrame: TIMEFRAME_OPTIONS.week,
    };
  }

  handleChartSelection(selected: any) {
    this.setState({ selectedChart: selected.value });
  }

  handleTimeFrameSelection(selected: string) {
    this.setState({ selectedTimeFrame: selected });
  }

  buildItemDate(item: StrategyMetricItem | GardenMetricItem, rangeDays: number): string | undefined {
    const date = new Date(item.insertedAt).toString();
    const offset = +new Date(new Date().setDate(new Date().getDate() - rangeDays));

    // we have some invalid ts that Date converts to unix epoch of 1970... so we discard those just in case
    if (date === '1584000000') {
      return;
    }

    if (date < offset.toString()) {
      return;
    }

    return date;
  }

  buildGardenSeries(series: GardenMetricItem[], rangeDays: number = 30): GardenMetricItem[] {
    const byDate = {};

    series.forEach((item) => {
      const date = this.buildItemDate(item, rangeDays);

      if (!date) {
        return;
      }

      byDate[date] = item;
    });

    return Object.values(byDate);
  }

  buildStrategySeries(series: StrategyMetricItem[] = [], selectedCurrency: string, rangeDays: number = 30): any {
    let byStrategyAndDate = {};

    series.forEach((item) => {
      const date = this.buildItemDate(item, rangeDays);

      if (!date) {
        return;
      }

      if (!byStrategyAndDate[date]) {
        byStrategyAndDate[date] = {};
      }

      byStrategyAndDate[date][item.data.strategy] = item;
    });

    const byStrategy = {};
    const dates = Object.keys(byStrategyAndDate);

    dates.forEach((date) => {
      const group = byStrategyAndDate[date];
      Object.keys(group).forEach((strategy) => {
        if (!byStrategy[strategy]) {
          byStrategy[strategy] = [];
        }

        const item = group[strategy];
        const maybeQuote = item.data.reserveToFiats[selectedCurrency];

        byStrategy[strategy].push([
          new Date(item.insertedAt).setHours(0, 0, 0, 0),
          item.data.netAssetValue * maybeQuote?.price || 1,
          item.data.strategy,
        ]);
      });
    });

    return byStrategy;
  }

  buildSeriesPerStartegy(seriesMap: any) {
    return Object.keys(seriesMap)
      .filter((key) =>
        this.props.strategy?.address ? key.toLowerCase() === this.props.strategy?.address.toLowerCase() : true,
      )
      .map((key, index) => {
        const series = seriesMap[key];
        const strategyDetails = this.props.gardenDetails.fullStrategies?.find(
          (strategy: StrategyDetails) => strategy.address === key,
        );
        return {
          name: `Strategy: ${strategyDetails?.name || mkShortAddress(key || '')}`,
          data: series,
          color: SERIES_COLORS[index] || 'var(--purple-04)',
        };
      });
  }

  chartRange(chartSeries: any): MinMax {
    const allValues = chartSeries
      .map((series) => {
        return series.data.map((row) => {
          return row[1];
        });
      })
      .flat();

    const min = Math.min(...allValues.filter((a) => a > 0));
    const max = Math.max(...allValues);

    return { max: max * 1.1, min: min - min * 0.1 };
  }

  getReturnDeltaPerc(metrics: GardenMetricResponse, currentValue: number) {
    const numMetrics = metrics.garden.length;
    const startValue = metrics.garden[0].data.netAssetValue;

    if (numMetrics < 2) {
      return { return: 0, periodInDays: 0 };
    }

    const periodInDays = numMetrics;

    if (startValue === 0) {
      return { return: 0, periodInDays: 0 };
    }

    return {
      return: ((currentValue - startValue) * 100) / startValue,
      periodInDays,
    };
  }

  render() {
    const { metricData, reserveAddress, gardenDetails, strategy } = this.props;
    const { selectedChart, tokenListService, selectedTimeFrame } = this.state;
    const { userPrefs } = this.context;

    const reserveToken = tokenListService.getTokenByAddress(reserveAddress) as Token;

    const renderMetrics = () => {
      if (strategy) {
        const { profits, annualizedReturn, returnPercent, rewardColor } = getProfitStrategy(
          strategy,
          gardenDetails,
          Date.now(),
        );
        return (
          <StrategyMetrics>
            <StrategyMetricBox label="Profits">
              <ReserveNumber value={profits} address={gardenDetails.reserveAsset} />
            </StrategyMetricBox>
            <StrategyMetricBox label="% Return">{returnPercent}%</StrategyMetricBox>
            <StrategyMetricBox label="% Return Annualized">
              <HoverTooltip
                textOverride={`${annualizedReturn}%`}
                outDelay={350}
                placement={'right'}
                fontSize={24}
                color={rewardColor}
                content={<ReturnIndexTooltip value={annualizedReturn} color={rewardColor} />}
              />
            </StrategyMetricBox>
            <StrategyMetricBox label={(strategy.exitedAt === 0 ? 'Current ' : '') + 'BABL Rewards'} tooltip>
              <TokenWrapper>
                <Icon name={IconName.babToken} size={24} />
              </TokenWrapper>
              <ReserveNumber
                value={strategy.exitedAt === 0 ? strategy.estimatedBABLRewards : strategy.rewards}
                address={addresses.tokens.BABL}
                hideSymbol
              />
            </StrategyMetricBox>
          </StrategyMetrics>
        );
      }

      return <HeroMetricsCard gardenDetails={gardenDetails} reserveToken={reserveToken} />;
    };

    if (!metricData || !metricData.garden || metricData.garden.length === 0) {
      return (
        <GraphPlaceholderWrapper>
          <EmptyGraphWrapper>
            <EmptyGraph />
          </EmptyGraphWrapper>
          {renderMetrics()}
        </GraphPlaceholderWrapper>
      );
    }
    const gardenCreated = new Date(gardenDetails.gardenInitializedAt);
    const isNew: boolean = daysBetween(gardenCreated, new Date()) <= GARDEN_NEW_NUM_DAYS;
    // We hide options that have less than the total number of days in the window with a 20% margin
    // ie: if 180 days in the window then we need 144 days of data to show the option
    const disabledOptions = Object.keys(Timeframe)
      .filter((t) => metricData.garden.length * 1.2 < Timeframe[t].days)
      .map((t) => Timeframe[t].value)
      .filter((t) => t !== undefined) as string[];

    const timeFrame = Timeframe[selectedTimeFrame || TIMEFRAME_OPTIONS.month];

    const metrics = {
      strategy: metricData.strategy.slice(-1 * timeFrame.days),
      garden: metricData.garden.slice(-1 * timeFrame.days),
    };

    const selectedCurrency = (userPrefs && userPrefs.currency) || 'USD';
    const groupedGardenData = this.buildGardenSeries(metrics.garden);
    const groupedStrategyData = this.buildStrategySeries(metrics.strategy, selectedCurrency);
    const strategySeries = this.buildSeriesPerStartegy(groupedStrategyData);
    const navDelta = this.getReturnDeltaPerc(metrics, formatReserveFloat(gardenDetails.netAssetValue, reserveToken));

    const gardenNAVSeries = groupedGardenData.map((item) => {
      return [new Date(item.insertedAt).setHours(0, 0, 0, 0), item.data.netAssetValue];
    });

    const gardenSharePriceSeries = groupedGardenData.map((item) => {
      return [new Date(item.insertedAt).setHours(0, 0, 0, 0), item.data.netAssetValue / item.data.totalSupply];
    });

    const activePrincipalSeries = groupedGardenData.map((item) => {
      return {
        x: new Date(item.insertedAt).setHours(0, 0, 0, 0),
        y: item.data.totalCapitalAllocated ? item.data.totalCapitalAllocated : 0,
      };
    });

    const idlePrincipalSeries = groupedGardenData.map((item) => {
      const value = item.data.idleReserve
        ? item.data.idleReserve
        : item.data.principal
        ? Math.max(item.data.principal - item.data.totalCapitalAllocated, 0)
        : 0;
      return {
        x: new Date(item.insertedAt).setHours(0, 0, 0, 0),
        y: value,
      };
    });

    let baselineSeries;

    if (gardenDetails.contribution !== undefined) {
      baselineSeries = groupedGardenData.map((item) => {
        return [
          new Date(item.insertedAt).setHours(0, 0, 0, 0),
          formatReserveFloat(gardenDetails.contribution?.avgSharePrice || BigNumber.from(0), reserveToken),
        ];
      });
    } else {
      baselineSeries = groupedGardenData.map((item) => {
        return [
          new Date(item.insertedAt).setHours(0, 0, 0, 0),
          formatReserveFloat(gardenDetails.sharePrice, reserveToken),
        ];
      });
    }

    // only set for share price chart
    const shouldZoom = selectedChart === SERIES_OPTIONS[0].value;

    const navChart = [
      {
        name: 'Net Asset Value',
        data: gardenNAVSeries,
        color: 'var(--turquoise-01)',
      },
    ];

    const allocationChart = [
      {
        name: 'Active',
        data: activePrincipalSeries,
        color: SERIES_COLORS[0],
      },
      {
        name: 'Idle',
        data: idlePrincipalSeries,
        color: SERIES_COLORS[1],
      },
    ];

    const sharePriceChart = [
      {
        name: 'Share Price',
        data: gardenSharePriceSeries,
        color: 'var(--yellow)',
      },
    ];

    if (gardenDetails.contribution) {
      sharePriceChart.push({
        name: `Your Avg Share Price`,
        data: baselineSeries.slice(0),
        color: 'var(--purple-02)',
      });
    }

    const strategyChart = [...strategySeries];
    const chartInterval =
      timeFrame.value === TIMEFRAME_OPTIONS.month
        ? 3
        : timeFrame.value === TIMEFRAME_OPTIONS.week
        ? 1
        : timeFrame.value === TIMEFRAME_OPTIONS.halfYear
        ? 14
        : timeFrame.value === TIMEFRAME_OPTIONS.year
        ? 60
        : 7;

    let selectedChartSeries;
    let selectedChartType;
    let plotOptions;
    let chartRangeSetting;
    let labelOptions;

    switch (selectedChart) {
      case SERIES_OPTIONS[0].value:
        selectedChartSeries = sharePriceChart;
        selectedChartType = 'spline';
        plotOptions = LINE_OPTIONS;
        labelOptions = LINE_LABEL;
        chartRangeSetting = this.chartRange(selectedChartSeries);
        break;
      case SERIES_OPTIONS[1].value:
        selectedChartSeries = strategyChart;
        selectedChartType = 'spline';
        plotOptions = LINE_OPTIONS;
        labelOptions = LINE_LABEL;
        chartRangeSetting = this.chartRange(selectedChartSeries);
        break;
      case SERIES_OPTIONS[2].value:
        selectedChartSeries = allocationChart;
        selectedChartType = 'area';
        chartRangeSetting = { min: 0, max: 100 };
        plotOptions = AREA_OPTIONS;
        labelOptions = AREA_LABEL;
        break;
      case SERIES_OPTIONS[3].value:
        selectedChartSeries = navChart;
        selectedChartType = 'spline';
        plotOptions = LINE_OPTIONS;
        labelOptions = LINE_LABEL;
        chartRangeSetting = this.chartRange(selectedChartSeries);
        break;
      default:
        selectedChartSeries = sharePriceChart;
        selectedChartType = 'spline';
        chartRangeSetting = this.chartRange(selectedChartSeries);
        plotOptions = LINE_OPTIONS;
        labelOptions = LINE_LABEL;
        break;
    }

    const chartOptions = {
      chart: {
        type: selectedChartType,
        height: this.props.height,
        plotBackgroundColor: 'transparent',
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'cera-regular',
        },
      },
      plotOptions: {
        ...plotOptions,
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
        ...labelOptions,
        gridLineColor: 'transparent',
        title: {
          enabled: false,
        },
        //...chartRangeSetting,
      },
      xAxis: {
        tickWidth: 0,
        tickInterval: 24 * 3600 * 1000 * chartInterval,
        type: 'datetime',
        labels: {
          step: timeFrame.value === TIMEFRAME_OPTIONS.week ? 1 : 2,
          format: '{value:%e %b}',
          style: {
            fontSize: '16px',
            color: 'var(--white)',
          },
        },
      },
      legend: {
        enabled: !strategy,
        align: 'left',
        layout: 'horizontal',
        x: 0,
        y: 0,
        paddingTop: 10,
        itemMarginTop: 12,
        itemMarginBottom: 8,
        itemHiddenStyle: {
          color: 'var(--purple)',
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
        padding: 30,
        shared: true,
        crosshairs: true,
        xDateFormat: '%Y-%m-%d',
        valueDecimals: shouldZoom ? 4 : 2,
        valuePrefix: '',
        valueSuffix: ` ${selectedChart !== SERIES_OPTIONS[1].value ? reserveToken.symbol : selectedCurrency}`,
        hideDelay: 100,
        style: {
          color: 'var(--white)',
          fontSize: '16px',
          lineHeight: '32px',
        },
      },
      series: selectedChartSeries,
    };

    return (
      <ChartWrapper>
        <ChartRow>
          <ChartContainer>
            {!strategy && (
              <StyledDropdownContainer>
                <Dropdown
                  name="Series"
                  stateCallback={(selected) => this.handleChartSelection(selected)}
                  options={SERIES_OPTIONS}
                  isSearchable={false}
                  required={false}
                  preselectedOptions={[SERIES_OPTIONS[0]]}
                />
              </StyledDropdownContainer>
            )}
            <ChartHeader>
              {!strategy && (
                <GardenDetailChartHeroMetric
                  gardenDetails={gardenDetails}
                  navDelta={navDelta}
                  reserveToken={reserveToken}
                  metrics={gardenSharePriceSeries}
                  isNAV={selectedChart === SERIES_OPTIONS[3].value || gardenDetails.strategyReturns.eq(0)}
                />
              )}
              <DropdownContainer>
                {!isNew && (
                  <StyledSelectorContainer>
                    <TimeframeSelector
                      selected={timeFrame.display}
                      disabledOptions={disabledOptions}
                      onChange={(selected) => this.handleTimeFrameSelection(selected)}
                    />
                  </StyledSelectorContainer>
                )}
              </DropdownContainer>
            </ChartHeader>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          </ChartContainer>
          {renderMetrics()}
        </ChartRow>
      </ChartWrapper>
    );
  }
}

const ChartRow = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`;

const ChartContainer = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  padding-right: 20px;
  max-width: 900px;
`;

const ChartHeader = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  margin-top: 0px;
`;

const DropdownContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  width: auto;
`;

const StyledDropdownContainer = styled.div`
  width: 375px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-end;
  margin-bottom: 20px;
`;

const StyledSelectorContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-end;
  margin-left: 20px;
`;

const GraphPlaceholderWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  margin-bottom: 40px;
`;

const EmptyGraphWrapper = styled.div``;

const StrategyMetrics = styled.div`
  display: flex;
  width: 280px;
  flex-flow: column nowrap;
  float: right;
`;

const StrategyMetricBoxWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 280px;
  height: 74px;
  background: var(--purple-10);
  padding: 14px 16px;
  box-sizing: border-box;
  margin-bottom: 8px;
`;

const StrategyMetricLabel = styled.div`
  font-size: 15px;
  font-weight: 400;
  width: 100%;
`;

const StrategyMetricValue = styled.div`
  font-size: 24px;
  margin-top: 2px;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  div {
    padding: 0;
  }
`;

const ChartWrapper = styled.div`
  width: 100%;
`;

const TokenWrapper = styled.div`
  display: flex;
  justify-content: center;
  height: 100%;
  margin-right: 4px;
`;
