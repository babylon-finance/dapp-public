import PortfolioChart from './PortfolioChart';
import { BaseLoader, GardenRow, Icon, ToggleInput } from 'components/shared';
import { getPrincipalInUSD } from './utils/getPrincipalInUSD';
import { AggWalletMetricResponse, FullGardenDetails, GardenRowType, IconName, UserStatsObj } from 'models';
import { formatEtherDecimal } from 'helpers/Numbers';
import { useW3Context } from 'context/W3Provider';

import { BigNumber } from '@ethersproject/bignumber';
import styled from 'styled-components';
import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import { BREAKPOINTS } from 'config';

interface PortfolioProps {
  gardens: FullGardenDetails[];
  userStats: UserStatsObj;
  walletMetrics: AggWalletMetricResponse | undefined;
}

const Portfolio = ({ gardens, userStats, walletMetrics }: PortfolioProps) => {
  const [fiat, setFiat] = useState<boolean>(true);
  const { quotes } = useW3Context();

  gardens = gardens.filter((g: FullGardenDetails) => !!g);

  const filteredPortfolio = {
    portfolio: gardens.filter((g: FullGardenDetails) => g.contribution),
    invites: gardens.filter((g: FullGardenDetails) => !g.contribution && !g.publicLP),
  };

  let currentPortfolio = filteredPortfolio.portfolio;

  // Simple default sort sort by Net Return
  currentPortfolio = currentPortfolio.sort((a: FullGardenDetails, b: FullGardenDetails) => {
    const aNet = a.contribution
      ? a.contribution.expectedEquity.sub(a.contribution.totalCurrentDeposits)
      : BigNumber.from(0);
    const bNet = b.contribution
      ? b.contribution.expectedEquity.sub(b.contribution.totalCurrentDeposits)
      : BigNumber.from(0);
    const aNetReturnFloat = formatEtherDecimal(getPrincipalInUSD(quotes, aNet, a.reserveAsset));
    const bNetReturnFloat = formatEtherDecimal(getPrincipalInUSD(quotes, bNet, b.reserveAsset));

    return bNetReturnFloat - aNetReturnFloat;
  });

  const gardenNameMap = {};
  currentPortfolio.forEach((garden) => {
    gardenNameMap[garden.address.toLowerCase()] = garden.name;
  });

  return (
    <PortfolioContainer>
      <HeaderSection>
        <HeaderTitle>Portfolio</HeaderTitle>
      </HeaderSection>
      {!isMobile && (
        <ChartContainer>
          <ChartWrapper>
            {!walletMetrics && (
              <LoaderWrapper>
                <BaseLoader size={60} />
              </LoaderWrapper>
            )}
            {walletMetrics && userStats && (
              <PortfolioChart metrics={walletMetrics} height={300} stats={userStats} gardenNameMap={gardenNameMap} />
            )}
          </ChartWrapper>
        </ChartContainer>
      )}
      <PositionsContainer>
        <SectionHeaderRow>
          <SectionHeader>
            <Icon name={IconName.chartUp} size={20} />
            <span>My Positions</span>
          </SectionHeader>
          {!isMobile && (
            <ToggleWrapper>
              <ToggleInput
                label="Fiat"
                tooltip={'Display position values in preferred fiat conversion.'}
                name="fiat"
                required
                checked={fiat}
                onChange={(e: React.ChangeEvent<any>) => {
                  setFiat(!fiat);
                }}
              />
            </ToggleWrapper>
          )}
        </SectionHeaderRow>
        <LabelRow>
          {!isMobile && <LabelItem width={50} />}
          <LabelItem width={isMobile ? 135 : 250}>Name</LabelItem>
          {!isMobile && <LabelItem width={200}>Category</LabelItem>}
          <LabelItem width={isMobile ? 75 : 150}>NAV</LabelItem>
          <LabelItem width={isMobile ? 75 : 150}>Net Return</LabelItem>
          {!isMobile && <LabelItem width={150}>Rewards</LabelItem>}
          {!isMobile && <LabelItem>vAPR</LabelItem>}
        </LabelRow>
        {currentPortfolio.map((garden) => {
          return (
            <GardenRow
              key={garden.address}
              garden={garden}
              rowType={GardenRowType.user}
              fiat={fiat}
              walletMetrics={walletMetrics ? walletMetrics[garden.address] || [] : []}
            />
          );
        })}
      </PositionsContainer>
    </PortfolioContainer>
  );
};

const LoaderWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const ChartContainer = styled.div`
  padding: 30px 0;
  width: 100%;
  background-color: var(--purple-07);
  height: 440px;
  margin-bottom: 60px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  border-radius: 4px;
`;

const ToggleWrapper = styled.div`
  margin-left: auto;
`;

const SectionHeaderRow = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  padding-bottom: 30px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding-bottom: 10px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  > span {
    font-size: 16px;
    font-family: cera-bold;
    padding-left: 6px;
  }
`;

const LabelRow = styled.div`
  padding-left: 30px;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  height: 40px;
  align-items: center;
  font-family: cera-medium;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding-left: 5px;
    font-size: 14px;
  }
`;

const LabelItem = styled.div<{ width?: number }>`
  font-feature-settings: 'pnum' on, 'lnum' on;
  width: ${(p) => (p.width ? `${p.width}px` : '100px')};
`;

const HeaderSection = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  padding-bottom: 12px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding-bottom: 8px;
  }
`;

const HeaderTitle = styled.div`
  font-size: 28px;
  font-family: cera-medium;
  line-height: 40px;
  margin-bottom: 10px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 22px;
  }
`;

const PortfolioContainer = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  animation: fadeInAnimation ease 0.5s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  @keyframes fadeInAnimation {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

const PositionsContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding-bottom: 50px;
`;

export default React.memo(Portfolio);
