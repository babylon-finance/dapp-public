import { GardenLeaders } from '.';
import { GlobalLoader, HoverTooltip } from 'components/shared';

import { formatNumberFiatDisplay } from 'helpers/Numbers';
import { LeaderboardResult, Currency } from 'models';
import { LeaderboardService } from 'services';
import { useW3Context } from 'context/W3Provider';

import styled from 'styled-components';
import React, { useState, useEffect } from 'react';

interface MetricCurrencyLargeProps {
  value: number;
  color?: string;
  currency: string;
}

const MetricCurrencyLarge = ({ value, currency, color }: MetricCurrencyLargeProps) => {
  return <MetricValueLarge color={color}>{formatNumberFiatDisplay(value, currency, 2, true)}</MetricValueLarge>;
};

interface MetricSmallProps {
  value: number;
}

const MetricSmall = ({ value }: MetricSmallProps) => {
  return <MetricValueSmall>{value}</MetricValueSmall>;
};

interface ProtocolMetricsProps {
  contributors: number;
  currency: string;
  gardens: number;
  returns: number;
  tvl: number;
}

const ProtocolMetrics = ({ tvl, returns, contributors, gardens, currency }: ProtocolMetricsProps) => {
  return (
    <HeroMetricRow>
      <MetricBox>
        <MetricTitle>Protocol TVL</MetricTitle>
        <MetricCurrencyLarge color={'var(--yellow)'} value={tvl} currency={currency} />
      </MetricBox>
      <MetricBox>
        <MetricTitleHover>
          <HoverTooltip
            textOverride={'Total Returns'}
            content={'The aggregated returns across all Strategies on Babylon, including the value of accrued BABL.'}
            placement={'up'}
          />
        </MetricTitleHover>
        <MetricCurrencyLarge color={'var(--purple-aux)'} value={returns} currency={currency} />
      </MetricBox>
      <MetricBox>
        <MetricTitle>Total Gardens</MetricTitle>
        <MetricSmall value={gardens} />
      </MetricBox>
      <MetricBox>
        <MetricTitle>Total Babylonians</MetricTitle>
        <MetricSmall value={contributors} />
      </MetricBox>
    </HeroMetricRow>
  );
};

const Leaderboard = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<LeaderboardResult | undefined>(undefined);

  const { userPrefs, quotes, admin } = useW3Context();
  const leaderboardService = LeaderboardService.getInstance();

  const fetchData = async () => {
    setData(await leaderboardService.fetchLeaderboardData(quotes));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ContainerFull>
      {loading && admin && (
        <ContentWrapper>
          <GlobalLoader />
        </ContentWrapper>
      )}
      {!loading && admin && (
        <>
          <BorderWrapper>
            <ContainerLarge>
              <HeaderSection>
                <HeaderTitle>Leaderboard</HeaderTitle>
              </HeaderSection>
            </ContainerLarge>
          </BorderWrapper>
          <ContainerLarge>
            {data && quotes && (
              <MetricsWrapper>
                <ProtocolMetrics
                  tvl={data.metrics.totalNAV[userPrefs?.currency || Currency.USD.ticker]}
                  returns={leaderboardService.mkReturnsAfterBabl(
                    data.bablToReserves,
                    userPrefs?.currency || Currency.USD.ticker,
                    quotes,
                    data.metrics.totalNAV[userPrefs?.currency || Currency.USD.ticker],
                    data.metrics.totalPrincipal[userPrefs?.currency || Currency.USD.ticker],
                    data.metrics.results,
                  )}
                  gardens={data.metrics.totalGardens}
                  contributors={data.metrics.totalContributors}
                  currency={userPrefs?.currency || Currency.USD.ticker}
                />
                <GardenLeaders
                  data={data.metrics.results
                    .filter((i) => data.qualified.includes(i.garden))
                    // Sorted by vAPR
                    .sort(
                      (a, b) =>
                        Number(b.returnRates?.annual?.aggregate || 0) - Number(a.returnRates?.annual?.aggregate || 0),
                    )}
                  currency={userPrefs?.currency || Currency.USD.ticker}
                  bablToReserves={data.bablToReserves}
                />
              </MetricsWrapper>
            )}
          </ContainerLarge>
        </>
      )}
    </ContainerFull>
  );
};

const HeaderTitle = styled.div`
  font-size: 28px;
  font-family: cera-medium;
  line-height: 40px;
  margin-bottom: 10px;
`;

const ContentWrapper = styled.div`
  width: 100%;
`;

const BorderWrapper = styled(ContentWrapper)`
  border-bottom: 1px solid var(--border-blue);
  background-color: var(--blue-alt);
`;

const HeroMetricRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const MetricBox = styled.div`
  width: 25%;
  background-color: var(--blue-alt);
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  padding: 30px 0 30px;
  height: 150px;
`;

const MetricTitle = styled.span`
  width: 100%;
  height: 30px;
  padding: 4px;
  text-align: center;
  font-family: cera-medium;
`;

const MetricTitleHover = styled.div`
  width: 100%;
  font-family: cera-medium;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MetricValue = styled.span`
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const MetricValueLarge = styled(MetricValue)<{ color?: string }>`
  font-size: 36px;
  font-family: cera-medium;
  color: ${(p) => (p.color ? p.color : 'inherit')};
`;

const MetricValueSmall = styled(MetricValue)`
  font-size: 32px;
  font-family: cera-medium;
`;

const MetricsWrapper = styled.div`
  margin: 20px 0 60px;
`;

const ContainerFull = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  width: 100%;
  min-height: 85vh;
`;

const ContainerLarge = styled.div`
  position: relative;
  padding: 10px 30px 0;
  position: relative;
  max-width: var(--screen-lg-min);
  width: 100%;
  margin: 0 auto;

  @media only screen and (max-width: 1440px) {
    padding: 10px 100px;
  }

  @media only screen and (max-width: 992px) {
    padding: 10px 50px;
  }

  @media only screen and (max-width: 598px) {
    padding: 10px 20px;
  }
`;

const HeaderSection = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  padding-bottom: 12px;
`;

export default React.memo(Leaderboard);
