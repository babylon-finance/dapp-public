import { SparkLine, ReserveNumber } from 'components/shared';

import { Contributor, WalletMetricResponse } from 'models';
import { calculateUserReturnForDisplay } from 'helpers/Numbers';
import { BREAKPOINTS } from 'config';

import { BigNumber } from '@ethersproject/bignumber';
import { isMobile } from 'react-device-detect';
import styled from 'styled-components';
import React from 'react';

interface PositionContentProps {
  contribution: Contributor | undefined;
  reserve: string;
  bablToReserve: BigNumber;
  metricData: WalletMetricResponse | undefined;
}

interface RewardsContentProps {
  contribution: Contributor | undefined;
  reserve: string;
}

const PositionContent = ({ contribution, reserve, bablToReserve, metricData }: PositionContentProps) => {
  if (!contribution) {
    return null;
  }

  const walletSparkData = metricData?.metrics ? metricData.metrics.slice(-29).map((item) => item.data.walletNAV) : [];
  const positiveReturn = contribution.expectedEquity.gt(contribution.totalCurrentDeposits);

  return (
    <ContentRow>
      <UserMetricItem width={isMobile ? '100%' : '50%'}>
        <SparkRow>
          <MetricItem>
            <StyledReserveNumber hideSymbol value={contribution.expectedEquity} address={reserve} precision={2} />
            <MetricLabel>Net Asset Value</MetricLabel>
          </MetricItem>
          <SparkWrapper>
            <SparkLine data={walletSparkData} />
          </SparkWrapper>
        </SparkRow>
      </UserMetricItem>
      <UserMetricItem width={isMobile ? '50%' : '25%'}>
        <PercentValue positive={positiveReturn}>
          {calculateUserReturnForDisplay(
            contribution.totalCurrentDeposits || BigNumber.from(0),
            contribution.expectedEquity || BigNumber.from(0),
            contribution.rewards,
            contribution.pendingRewards,
            bablToReserve,
          )}
        </PercentValue>
        <MetricLabel>% Return</MetricLabel>
      </UserMetricItem>
      <UserMetricItem width={'25%'}>
        <StyledReserveNumber hideSymbol value={contribution.totalCurrentDeposits} address={reserve} precision={2} />
        <MetricLabel>Principal</MetricLabel>
      </UserMetricItem>
    </ContentRow>
  );
};

const PercentValue = styled.span<{ positive?: boolean }>`
  font-size: 24px;
  font-family: cera-bold;
  color: ${(p) =>
    p.positive === true ? 'var(--positive)' : p.positive === false ? 'var(--negative)' : 'var(--white)'};

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 20px;
  }
`;

const MetricLabel = styled.span`
  padding-top: 8px
  font-family: cera-medium;
  text-align: left;
  width: 100%;
  color: var(--blue-03);

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

const StyledReserveNumber = styled(ReserveNumber)<{ positive?: boolean }>`
  font-size: 24px;
  font-family: cera-bold;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 20px;
  }
`;

const MetricItem = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;

const SparkWrapper = styled.div`
  width: 50%;
`;

const SparkRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: space-between;
`;

const ContentRow = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    justify-content: flex-start;
    flex-flow: row wrap;
  }
`;

const UserMetricItem = styled.div<{ width: string }>`
  height: 100%;
  padding: 0 30px;
  border-right: 1px solid var(--border-blue);
  width: ${(p) => p.width};
  display: flex;
  flex-flow: column nowrap;

  &:first-child {
    padding: 0;
  }

  &:last-child {
    padding-right: 0;
    border: none;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    flex-flow: row wrap;

    &:first-child {
      border-right: none;
      margin-bottom: 10px;
    }

    &:nth-child(2) {
      padding-left: 0;
    }
  }
`;

export default React.memo(PositionContent);
