import { ProtocolMetricsCache } from 'models';
import { LeaderboardService } from 'services';

import numeral from 'numeral';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { BREAKPOINTS } from 'config';

const StatsBlocks = () => {
  const [data, setData] = useState<ProtocolMetricsCache | undefined>(undefined);

  const leaderboardService = LeaderboardService.getInstance();

  const fetchData = async () => {
    setData(await leaderboardService.fetchProtocolData());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const blocks = {
    usdTotalNAV: { defaultValue: '--', label: 'Protocol TVL', useNumeral: true },
    aggregateReturnsUSD: { defaultValue: '--', label: 'Wealth Generated', useNumeral: true },
    totalGardens: { defaultValue: '--', label: 'Investment Clubs', useNumeral: false },
    totalContributors: { defaultValue: '--', label: 'Babylonians', useNumeral: false },
  };

  const buildBlocks = (data: ProtocolMetricsCache | undefined) => {
    return Object.entries(blocks).map(([key, { defaultValue, label, useNumeral }], index: number) => {
      let dataValue = data ? data[key] : undefined;
      const formattedValue =
        dataValue !== undefined && dataValue > 0
          ? useNumeral
            ? `$${numeral(dataValue).format('0.00a')}`
            : dataValue
          : defaultValue;

      return (
        <MainStatsBlockItem key={index}>
          <MainStatsBlockItemLabel>{label}</MainStatsBlockItemLabel>
          <MainStatsBlockItemValue>{formattedValue}</MainStatsBlockItemValue>
        </MainStatsBlockItem>
      );
    });
  };

  return <MainStatsBlock>{buildBlocks(data)}</MainStatsBlock>;
};

const MainStatsBlock = styled.div`
  display: flex;
  flex-flow: row wrap;
  height: auto;
  width: 100%;
  justify-content: space-between;
  background-color: transparent;
  padding: 40px 50px;

  @media only screen and (max-width: 1280px) {
    padding: 20px 60px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100%;
    justify-content: center;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 20px 0;
  }
`;

const MainStatsBlockItem = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  max-width: 220px;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  text-align: center;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    margin: 12px 0;
    width: 50%;
  }
`;

const MainStatsBlockItemLabel = styled.span`
  font-size: 18px;
  font-family: cera-medium;
  color: var(--white);
  padding: 10px 0;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 15px;
  }
`;

const MainStatsBlockItemValue = styled.span`
  color: var(--white);
  font-family: cera-bold;
  font-feature-settings: 'pnum' on, 'lnum' on;
  font-size: 40px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 24px;
  }
`;

export default React.memo(StatsBlocks);
