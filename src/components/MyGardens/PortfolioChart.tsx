import { FiatNumber, Icon, HoverTooltip, ReserveNumber, TimeframeSelector, ToggleInput } from 'components/shared';
import { EmptyGraph } from 'components/garden/detail';

import addresses from 'constants/addresses';
import { Currency, IconName, Timeframe, AggWalletMetricResponse, WalletMetricItem, UserStatsObj } from 'models';
import { formatEtherDecimal } from 'helpers/Numbers';
import { mkShortAddress } from 'helpers/Addresses';
import { buildChartOptions } from './utils/buildChartOptions';
import { useW3Context } from 'context/W3Provider';

import { BigNumber } from '@ethersproject/bignumber';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import styled from 'styled-components';
import React, { useState } from 'react';

const EmptyMetrics = () => {
  return (
    <EmptyGraph
      textOverride={
        "Collecting position data.. We'll display this chart once we have two or more days of metrics for your positions."
      }
    />
  );
};

interface MinMax {
  max: number;
  min: number;
}

const TIMEFRAME_OPTIONS = {
  week: 'week',
  month: 'month',
  quarter: 'quarter',
  halfYear: 'halfYear',
  year: 'year',
};

const SERIES_COLORS = [
  'var(--purple)',
  'var(--yellow)',
  'var(--purple-03)',
  'var(--turquoise-01)',
  'var(--blue-perf)',
  'var(--purple-aux)',
  'var(--green-02)',
];

let SERIES_OPTIONS = [
  {
    value: 'nav',
    label: 'Net Asset Value',
  },
];

const AREA_OPTIONS = {
  area: {
    marker: {
      enabled: false,
    },
    stacking: 'normal',
    lineWidth: 0,
    lineColor: '#666666',
  },
};

interface NetAssetHeroProps {
  value: BigNumber;
}

interface PortfolioChartProps {
  stats: UserStatsObj;
  metrics: AggWalletMetricResponse;
  height: number;
  gardenNameMap: any;
}

const PortfolioChart = ({ stats, metrics, height, gardenNameMap }: PortfolioChartProps) => {
  const [selectedChart, setSelectedChart] = useState<any>(SERIES_OPTIONS[0].value);
  const [selectedTimeframe, setSelectedTimeframe] = useState<any>(TIMEFRAME_OPTIONS.week);
  const [babl, setBabl] = useState<boolean>(false);
  const { quotes, userPrefs } = useW3Context();

  const handleChartSelection = (selected: any) => {
    setSelectedChart(selected.value);
  };

  const handleTimeframeSelection = (selected: string) => {
    setSelectedTimeframe(selected);
  };

  const handleBablToggle = () => {
    setBabl(!babl);
  };

  const buildItemDate = (item: WalletMetricItem, rangeDays: number): string | undefined => {
    const date = new Date(item.insertedAt).toString();
    const offset = +new Date(new Date().setDate(new Date().getDate() - rangeDays));

    if (date < offset.toString()) {
      return;
    }

    return date;
  };

  const chartRange = (chartSeries: any): MinMax => {
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
  };

  const buildSeriesPerGarden = (
    metrics: AggWalletMetricResponse,
    currency: string,
    offset: number = 7,
    babl: boolean = false,
    bablQuote: number,
  ) => {
    return Object.keys(metrics).map((garden, index) => {
      const rawRows = metrics[garden].slice(offset * -1);

      const formattedRows = rawRows.map((row) => {
        const { claimedRewards, pendingRewards, unclaimedRewards, reserveToFiats, garden, walletNAV } = row.data;
        const bablNAV =
          (babl ? unclaimedRewards.totalBabl + claimedRewards.babl + pendingRewards.totalBabl : 0) * bablQuote;
        const maybeQuote = reserveToFiats[currency];
        return [row.insertedAt, (walletNAV * maybeQuote?.price || 0) + bablNAV, garden];
      });

      return {
        name: gardenNameMap[garden.toLowerCase()] || mkShortAddress(garden),
        data: [...formattedRows],
        color: SERIES_COLORS[index] || 'var(--purple-04)',
      };
    });
  };

  // Rerender bug that I can't seem to iron out... from what I can tell it is caused by async context
  if (Object.keys(metrics || {}).length === 0 || !!metrics.error) {
    return <EmptyMetrics />;
  }
  // We hide options that have less than the total number of days in the window with a 20% margin
  // ie: if 180 days in the window then we need 144 days of data to show the option
  const disabledOptions = Object.keys(Timeframe)
    .filter((t) => Object.values(metrics)[0].length * 1.2 + 5 < Timeframe[t].days)
    .map((t) => Timeframe[t].value)
    .filter((t) => t !== undefined) as string[];

  const timeFrame = Timeframe[selectedTimeframe || TIMEFRAME_OPTIONS.month];
  const selectedCurrency = (userPrefs && userPrefs.currency) || 'USD';
  const bablQuote = quotes?.BABL.quote[selectedCurrency].price || 0;
  const currencySymbol = Currency[selectedCurrency].symbol;
  const gardenSeries = buildSeriesPerGarden(metrics, selectedCurrency, timeFrame.days, babl, bablQuote);
  const navAreaChart = [...gardenSeries].filter((g) => g.data.length > 1);
  let startingNAV = gardenSeries
    // Get oldest NAV in the array
    .map((garden) => Number(garden.data[0][1]))
    .reduce((a, b) => a + b, 0);
  const startingBABL = Object.keys(metrics)
    .map((garden) => {
      const firstDay = metrics[garden][0];
      return (
        Number(
          firstDay
            ? firstDay.data.unclaimedRewards.totalBabl +
                firstDay.data.pendingRewards.totalBabl +
                firstDay.data.claimedRewards.babl
            : 0,
        ) * bablQuote
      );
    })
    .reduce((a, b) => a + b, 0);
  const currentBABL = formatEtherDecimal(stats.totalBABL) * bablQuote;
  let currentNAV = formatEtherDecimal(stats.totalNAV, 2);

  if (babl) {
    currentNAV = currentNAV + currentBABL;
    startingNAV = startingNAV + startingBABL;
  }

  const navDelta = ((currentNAV - startingNAV) / startingNAV) * 100;
  const netReturn = stats.totalNAV.sub(stats.totalDeposits);

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

  let selectedChartType;
  let selectedChartSeries;
  let plotOptions;
  let chartRangeSetting;
  let chartStep;

  switch (selectedChart) {
    case SERIES_OPTIONS[0].value:
      selectedChartSeries = navAreaChart;
      selectedChartType = 'area';
      plotOptions = AREA_OPTIONS;
      chartRangeSetting = undefined;
      chartStep = timeFrame.value === TIMEFRAME_OPTIONS.week ? 1 : 2;
      break;
  }

  const chartOptions = buildChartOptions(
    selectedChartType,
    height,
    plotOptions,
    chartRangeSetting,
    chartInterval,
    chartStep,
    currencySymbol,
  );

  const chart = {
    ...chartOptions,
    series: selectedChartSeries,
  };

  console.log('selected chartSeries', navAreaChart, selectedChartSeries);

  return (
    <ChartWrapper>
      <ChartRow>
        <ChartContainer>
          <HeaderContainer>
            <NetAssetContainer>
              <NetAssetLabel>Net Asset Value</NetAssetLabel>
              <NetAssetNumber value={babl ? stats.totalDeposits.add(stats.totalReturn) : stats.totalNAV} />
            </NetAssetContainer>
            <StyledSelectorContainer>
              <ToggleWrapper>
                <ToggleInput
                  margins={0}
                  label="BABL"
                  tooltip={'Include pending and earned BABL in your Net Asset Value.'}
                  name="babl"
                  required
                  checked={babl}
                  onChange={(e: React.ChangeEvent<any>) => {
                    handleBablToggle();
                  }}
                />
              </ToggleWrapper>
              <TimeframeSelector
                height={30}
                selected={timeFrame.display}
                disabledOptions={disabledOptions}
                onChange={(selected) => handleTimeframeSelection(selected)}
              />
            </StyledSelectorContainer>
          </HeaderContainer>
          {selectedChartSeries.length <= 0 && <EmptyMetrics />}
          {selectedChartSeries.length >= 1 && <HighchartsReact highcharts={Highcharts} options={chart} />}
        </ChartContainer>
        <MetricsContainer>
          <MetricItem>
            <MetricLabel>
              <HoverTooltip
                textOverride={`Last ${timeFrame.days} days`}
                content={`The change in your net asset value over the last ${timeFrame.days} days.`}
                placement="left"
              />
            </MetricLabel>
            <MetricValue positive={navDelta > 0}>
              <DeltaIconWrapper>
                <Icon name={navDelta > 0 ? IconName.numberUp : IconName.numberDown} size={20} />
              </DeltaIconWrapper>
              <DeltaNumber>{navDelta.toFixed(2)}%</DeltaNumber>
            </MetricValue>
          </MetricItem>
          <MetricItem>
            <MetricLabel>
              <HoverTooltip
                textOverride="BABL Rewards"
                content={'All pending, earned, and claimed BABL rewards.'}
                placement="left"
              />
            </MetricLabel>
            <StyledReserveNumber value={stats.totalBABL} address={addresses.tokens.BABL} />
          </MetricItem>
          <MetricItem>
            <MetricLabel>
              <HoverTooltip
                textOverride="Net Return"
                content={'Net return on your investments across all Gardens.'}
                placement="left"
              />
            </MetricLabel>
            <MetricValue positive={netReturn.gte(BigNumber.from(0))}>
              <StyledFiatNumber value={netReturn} />
            </MetricValue>
          </MetricItem>
          <MetricItem>
            <MetricLabel>
              <HoverTooltip
                textOverride="Total Return"
                content={'The sum of your return on investments inclusive of pending and earned BABL rewards.'}
                placement="left"
              />
            </MetricLabel>
            <MetricValue positive={stats.totalReturn.gte(BigNumber.from(0))}>
              <StyledFiatNumber value={stats.totalReturn} />
            </MetricValue>
          </MetricItem>
        </MetricsContainer>
      </ChartRow>
    </ChartWrapper>
  );
};

const ToggleWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  margin-right: 20px;
`;

const StyledFiatNumber = styled(FiatNumber)`
  font-size: 22px;
  font-family: cera-bold;
`;

const StyledReserveNumber = styled(ReserveNumber)`
  color: var(--purple-aux);
  font-size: 22px;
  font-family: cera-bold;
`;

const DeltaIconWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding-right: 10px;
`;

const DeltaNumber = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  font-size: 22px;
  font-family: cera-bold;
`;

const MetricsContainer = styled.div`
  margin-left: 40px;
  width: 25%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
`;

const MetricItem = styled.div`
  padding: 20px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  width: 100%;
  height: 80px;
  border-radius: 4px;
  margin-bottom: 10px;
  background-color: var(--purple-10);
`;

const MetricValue = styled.div<{ positive: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  color: ${(p) => (p.positive ? 'var(--positive)' : 'var(--negative)')};
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const MetricLabel = styled.div`
  width: 100%;
  font-size: 15px;
  font-family: cera-medium;
`;

const NetAssetContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-self: flex-start;
`;

const NetAssetLabel = styled.span`
  font-size: 16px;
  font-family: cera-bold;
`;

const NetAssetNumber = styled(FiatNumber)`
  font-size: 40px;
  font-family: cera-bold;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const ChartRow = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
`;

const ChartContainer = styled.div`
  width: 75%;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  width: 100%;
`;

const StyledSelectorContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  margin-left: auto;
  align-items: flex-start
  justify-self: flex-end;
`;

const ChartWrapper = styled.div`
  width: 100%;
  padding: 0 20px;
`;

export default React.memo(PortfolioChart);
