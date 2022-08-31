import AllocationBarItem from './AllocationBarItem';
import { HoverTooltip, Icon, ReserveNumber } from 'components/shared';
import { RenderType } from './StrategiesList';
import { StrategyModal } from 'components/garden/modals';
import { BREAKPOINTS } from 'config';
import {
  IconName,
  StrategyDetails,
  FullGardenDetails,
  ExistingVotes,
  GardenMetricResponse,
  getExecutionEndsBy,
} from 'models';
import { useW3Context } from 'context/W3Provider';
import { displayDurationString } from 'helpers/Date';
import { getDaysSinceActive, getProfitStrategy } from 'helpers/Strategy';

import { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';
import moment from 'moment';
import React from 'react';
import styled from 'styled-components';
import addresses from 'constants/addresses';
import ReturnIndexTooltip from './ReturnIndexTooltip';
import { isMobile } from 'react-device-detect';

interface StrategyRowProps {
  className?: string;
  strategy: StrategyDetails;
  votes?: ExistingVotes;
  voteAction?: boolean;
  metricData?: GardenMetricResponse;
  handleVoteSubmit?: any;
  gardenDetails: FullGardenDetails;
  setTxReady: (value: any) => void;
  renderType: RenderType;
  expanded: boolean;
  hasUserRow?: boolean;
  index: number;
  strategiesCount: number;
  toggleExpanded: () => void;
}

interface BigNumberTdProps {
  number: BigNumber;
  reserveAsset: string;
  result?: number;
}

const BigNumberTd = ({ number, reserveAsset, result }: BigNumberTdProps) => {
  return (
    <ChangeTd result={result}>
      <ReserveNumber value={number} address={reserveAsset} />
    </ChangeTd>
  );
};

const BablTokenTd = ({ number }) => {
  return (
    <td>
      <GardenTokenWrapper>
        <TokenWrapper>
          <Icon name={IconName.babToken} size={24} />
        </TokenWrapper>
        <ReserveNumber value={number} address={addresses.tokens.BABL} hideSymbol />
      </GardenTokenWrapper>
    </td>
  );
};

const DurationInDaysTd = ({ number }) => {
  return <td>{(number / 86400).toFixed(0)} Days</td>;
};

interface PercentTDProps {
  value: number;
  annualized: number;
  rewardColor: string;
}

const PercentTD = ({ value, annualized, rewardColor }: PercentTDProps) => {
  return (
    <RewardScaleTD color={rewardColor}>
      <HoverTooltip
        textOverride={`${value}%`}
        outDelay={350}
        color={rewardColor}
        placement={'right'}
        fontSize={isMobile ? 14 : 16}
        content={<ReturnIndexTooltip value={annualized} color={rewardColor} />}
      />
    </RewardScaleTD>
  );
};

const StrategyRow = ({
  strategy,
  renderType,
  gardenDetails,
  votes,
  className,
  strategiesCount,
  index,
  metricData,
}: StrategyRowProps) => {
  const { blockTimestamp } = useW3Context();
  const now = blockTimestamp ? blockTimestamp * 1000 : Date.now();
  const currentMoment = moment(now);
  const endsBy = getExecutionEndsBy(currentMoment, strategy);
  const daysActive = getDaysSinceActive(currentMoment, strategy).asDays();

  const { profits, annualizedReturn, returnPercent, rewardColor } = getProfitStrategy(strategy, gardenDetails, now);

  // Completed Strategy
  if (renderType === RenderType.completed) {
    return (
      <StyledRow key={strategy.address} className={className}>
        <td>{strategy.name}</td>
        <DurationInDaysTd number={(strategy.exitedAt - strategy.executedAt) / 1000} />
        <BigNumberTd number={strategy.capitalAllocated} reserveAsset={gardenDetails.reserveAsset} />
        <BigNumberTd number={strategy.capitalReturned} reserveAsset={gardenDetails.reserveAsset} />
        <BigNumberTd
          reserveAsset={gardenDetails.reserveAsset}
          number={profits}
          result={parseFloat(formatEther(profits))}
        />
        <BigNumberTd
          number={profits.gt(0) ? profits.mul(15).div(100) : BigNumber.from(0)}
          reserveAsset={gardenDetails.reserveAsset}
        />
        <BablTokenTd number={strategy.rewards} />
        <td>
          <StrategyModalWrapper className={'strategy-wrapper'}>
            <StrategyModal strategy={strategy} gardenDetails={gardenDetails} votes={votes} metricData={metricData} />
          </StrategyModalWrapper>
        </td>
      </StyledRow>
    );
  }

  const totalGardenAllocated = parseFloat(gardenDetails.netAssetValue.toString());
  const currentAllocationPercent = (parseFloat(strategy.capitalAllocated.toString()) / totalGardenAllocated) * 100;
  const maxPercentFromAllocation = parseFloat(
    strategy.maxCapitalRequested.mul(100).div(gardenDetails.netAssetValue).toString(),
  );
  const targetEqualPercent = 100 / strategiesCount;
  const targetPercent = maxPercentFromAllocation < targetEqualPercent ? maxPercentFromAllocation : targetEqualPercent;

  return (
    <StyledRow key={strategy.address} className={className}>
      <NameAllocationTd>
        <AllocationBarItem
          name={strategy.name}
          fillIndex={index}
          percent={currentAllocationPercent}
          targetPercent={currentAllocationPercent > targetPercent ? currentAllocationPercent : targetPercent}
        />
      </NameAllocationTd>
      <BigNumberTd number={strategy.netAssetValue} reserveAsset={gardenDetails.reserveAsset} />
      {!isMobile && (
        <BigNumberTd
          number={profits}
          reserveAsset={gardenDetails.reserveAsset}
          result={parseFloat(formatEther(profits))}
        />
      )}
      {daysActive >= 2 ? (
        <PercentTD value={returnPercent} annualized={annualizedReturn} rewardColor={rewardColor} />
      ) : (
        <td>--</td>
      )}
      {!isMobile && (
        <>
          <BablTokenTd number={strategy.estimatedBABLRewards} />
          <td>{strategy.waitingOnFinalize ? '--' : displayDurationString(endsBy, 'Finalizing soon')}</td>
          <td>
            <StrategyModalWrapper className={'strategy-wrapper'}>
              <StrategyModal strategy={strategy} gardenDetails={gardenDetails} votes={votes} metricData={metricData} />
            </StrategyModalWrapper>
          </td>
        </>
      )}
    </StyledRow>
  );
};

const StyledRow = styled.tr<{ expanded?: boolean }>`
  & > td:first-child {
    padding-left: 10px;
  }

  > td {
    min-width: 135px;

    @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
      font-size: 14px;
      min-width: 0;
      width: 100px;
    }
  }

  border-bottom: ${(p) => (p.expanded ? 'none' : '1px solid var(--border-blue)')} !important;

  &:hover {
    .strategy-wrapper {
      visibility: visible;
    }
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;

    &:hover .strategy-wrapper {
      visibility: hidden;
    }
  }
`;

const NameAllocationTd = styled.td`
  width: 300px !important;
`;
const StrategyModalWrapper = styled.div`
  visibility: hidden;
`;

const ChangeTd = styled.td<{ result?: number }>`
  color: ${(p) => (p.result ? (p.result >= 0 ? 'var(--positive)' : 'var(--negative)') : 'var(--white)')};
  font-family: ${(p) => (p.result ? 'cera-bold' : 'cera-regular')};
`;

const RewardScaleTD = styled.td<{ color: string }>`
  color: ${(p) => p.color};
  font-feature-settings: 'pnum' on, 'lnum' on;
  font-family: cera-bold;
`;

const GardenTokenWrapper = styled.div`
  display: flex;
`;

const TokenWrapper = styled.div`
  display: flex;
  justify-content: center;
  height: 100%;
  margin-right: 4px;
`;

export default React.memo(StrategyRow);
