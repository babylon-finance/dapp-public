import { ReserveNumber } from 'components/shared';

import addresses from 'constants/addresses';
import { BREAKPOINTS } from 'config';
import { Contributor } from 'models';

import { BigNumber } from '@ethersproject/bignumber';
import { isMobile } from 'react-device-detect';
import styled from 'styled-components';
import React from 'react';

interface RewardsContentProps {
  contribution: Contributor | undefined;
  reserve: string;
}

const RewardsContent = ({ contribution, reserve }: RewardsContentProps) => {
  if (!contribution) {
    return null;
  }

  return (
    <ContentRow>
      <UserMetricItem width={isMobile ? '50%' : '25%'}>
        <StyledReserveNumber
          value={contribution.pendingRewards?.totalBabl || BigNumber.from(0)}
          address={addresses.tokens.BABL}
          hideSymbol
          color={'var(--purple-aux)'}
          precision={2}
        />
        <MetricLabel>Pending</MetricLabel>
      </UserMetricItem>
      <UserMetricItem width={isMobile ? '50%' : '25%'}>
        <StyledReserveNumber
          value={contribution.rewards?.totalBabl || BigNumber.from(0)}
          address={addresses.tokens.BABL}
          hideSymbol
          precision={2}
        />
        <MetricLabel>Claimable</MetricLabel>
      </UserMetricItem>
      <UserMetricItem width={isMobile ? '50%' : '25%'}>
        <StyledReserveNumber
          value={contribution.claimedBABL}
          address={addresses.tokens.BABL}
          hideSymbol
          precision={2}
        />
        <MetricLabel>Claimed</MetricLabel>
      </UserMetricItem>
      <UserMetricItem width={isMobile ? '50%' : '25%'}>
        <StyledReserveNumber
          value={(contribution.rewards?.totalBabl || BigNumber.from(0)).add(contribution.claimedBABL)}
          address={addresses.tokens.BABL}
          hideSymbol
          precision={2}
        />
        <MetricLabel>Total Earned</MetricLabel>
      </UserMetricItem>
    </ContentRow>
  );
};

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

const StyledReserveNumber = styled(ReserveNumber)<{ color?: string }>`
  font-size: 24px;
  font-family: cera-bold;
  color: ${(p) => (p.color ? p.color : 'var(--white)')};

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 20px;
  }
`;

const ContentRow = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
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
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
    border: none;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    flex-flow: row wrap;

    &:first-child {
      margin-bottom: 10px;
    }

    &:nth-child(2) {
      border-right: none;
    }

    &:nth-child(3) {
      padding-left: 0;
    }
  }
`;

export default React.memo(RewardsContent);
