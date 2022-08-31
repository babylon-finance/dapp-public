import { GlobalLoader } from 'components/shared';
import { aggregateUserStats } from './utils/aggregateUserStats';
import { ExploreGardens, Portfolio } from './';
import { FullGardenDetails, GardenDetails, AggWalletMetricResponse, UserStatsObj } from 'models';
import { Routes } from 'constants/Routes';
import { ViewerService, MetricsService } from 'services';
import { useW3Context } from 'context/W3Provider';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import React, { useEffect, useState } from 'react';
import { BREAKPOINTS } from 'config';
import { isMobile } from 'react-device-detect';

const Gardens = () => {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStatsObj | undefined>(undefined);
  const [walletMetrics, setWalletMetrics] = useState<AggWalletMetricResponse | undefined>(undefined);
  const [gardens, setGardens] = useState<GardenDetails[] | undefined>(undefined);
  const { address, userPrefs, quotes, blockTimestamp, network, wallet } = useW3Context();
  const location = useLocation();
  const isPortfolio: boolean =
    address && (location.pathname.includes(Routes.portfolio) || location.pathname.includes('me'));
  const isExplore: boolean = !address || location.pathname.includes(Routes.explore);
  const metricsService = MetricsService.getInstance();
  const viewerService = ViewerService.getInstance();

  const portfolioGardens: FullGardenDetails[] =
    gardens?.filter((g) => !!g && (g as FullGardenDetails).finalizedStrategies).map((g) => g as FullGardenDetails) ||
    [];

  const fetchMetrics = async (newGardens: GardenDetails[]) => {
    const metrics = await metricsService.getLatestMetricForGardens(newGardens.map((garden) => garden.address));
    // Stitch metrics into the Garden records, we could maybe move the fetch back into
    // the viewer but then we're forced to fetch anytime we get GardenDetails which likely
    // isn't what we want.
    const stitched = [
      ...newGardens.map((garden) => {
        return { ...garden, latestMetric: metrics[garden.address] };
      }),
    ];

    setGardens(stitched);
  };

  async function fetchWalletMetrics(address: string | undefined) {
    if (address) {
      const walletMetricsResponse = await metricsService.getAllMetricsForWallet(address);
      setWalletMetrics(walletMetricsResponse);
    }
  }

  const fetchStats = async () => {
    if (blockTimestamp && quotes && userPrefs && gardens) {
      let allStrategies: string[] = [];
      portfolioGardens.forEach((garden: FullGardenDetails) => {
        if (garden.finalizedStrategies) {
          allStrategies = allStrategies.concat(garden.finalizedStrategies);
        }
      });

      if (address && quotes) {
        const userStrategyData = await viewerService.getUserStrategyActions(allStrategies, address || '');
        setUserStats(await aggregateUserStats(portfolioGardens, userStrategyData, quotes, userPrefs));
      }
    }
  };

  const fetchGardens = async (force: boolean = false) => {
    setLoading(true);
    const allGardens: GardenDetails[] = await viewerService.getUserGardens(address, force);
    setGardens(allGardens);
    setUserStats(undefined);
    const promises: Promise<any>[] = [fetchMetrics(allGardens)];
    if (address) {
      promises.push(fetchStats());
      promises.push(fetchWalletMetrics(address));
    }
    await Promise.all(promises);
    setLoading(false);
    return allGardens;
  };

  useEffect(() => {
    // Refetches gardens when user changes wallet
    if (!loading && gardens) {
      fetchGardens(!!address);
    }
  }, [address, wallet, network]);

  useEffect(() => {
    if (!gardens) {
      fetchGardens(false);
    }
  }, []);

  // Refetch stats when user changes currency
  useEffect(() => {
    fetchStats();
  }, [address, userPrefs, blockTimestamp, gardens]);

  return (
    <ContainerFull>
      {loading && (
        <ContentWrapper>
          <GlobalLoader size={isMobile ? 300 : 400} />
        </ContentWrapper>
      )}
      {!loading && gardens && (
        <ContentWrapper>
          {isPortfolio && address && userStats && userStats.totalDeposits.gt(0) && (
            <Portfolio gardens={portfolioGardens} userStats={userStats} walletMetrics={walletMetrics} />
          )}
          {(isExplore || userStats?.totalDeposits.eq(0)) && (
            <ExploreGardens gardens={gardens} fetchData={fetchGardens} />
          )}
        </ContentWrapper>
      )}
    </ContainerFull>
  );
};

const ContentWrapper = styled.div`
  background-color: var(--blue-alt);
  display: flex;
  align-items: center;
  animation: fadeInAnimation ease 0.5s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  width: 100%;
  max-width: var(--screen-lg-min);
  padding: 0 40px;

  @media only screen and (max-width: 1440px) {
    padding: 0 100px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 0 30px;
  }

  @keyframes fadeInAnimation {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

const ContainerFull = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  width: 100%;
  background-color: var(--blue-alt);
  min-height: 85vh;
`;

export default React.memo(Gardens);
