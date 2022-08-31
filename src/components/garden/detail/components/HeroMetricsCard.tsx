import { HoverTooltip, Icon, ReserveNumber } from 'components/shared';
import { FullGardenDetails, IconName, Token } from 'models';
import { BigNumber } from '@ethersproject/bignumber';
import styled from 'styled-components';
import React, { useState } from 'react';

interface HeroMetricsCardProps {
  gardenDetails: FullGardenDetails;
  reserveToken: Token;
}

interface ExpandToggleProps {
  onClick(): void;
  isOpen: boolean;
}

const ExpandToggle = ({ onClick, isOpen }: ExpandToggleProps) => {
  return (
    <ToggleIconWrapper onClick={onClick}>
      <Icon name={isOpen ? IconName.chevronUp : IconName.chevronDown} color={'var(--white)'} size={12} />
    </ToggleIconWrapper>
  );
};

const HeroMetricsCard = ({ gardenDetails, reserveToken }: HeroMetricsCardProps) => {
  const [returnsOpen, setReturnsOpen] = useState<boolean>(true);
  const [expensesOpen, setExpensesOpen] = useState<boolean>(true);

  const toggleReturns = (): void => {
    setReturnsOpen(!returnsOpen);
  };

  const toggleExpenses = (): void => {
    setExpensesOpen(!expensesOpen);
  };

  const grossReturn = (() => {
    return gardenDetails.strategyReturns.gt(gardenDetails.grossReturns)
      ? gardenDetails.strategyReturns
      : gardenDetails.grossReturns;
  })();

  return (
    <MetricsCard>
      <MetricsCardRow>
        <MetricsCardRowLabel>Gross Returns</MetricsCardRowLabel>
        <MetricsCardRowValue>
          <ReserveNumber value={grossReturn} address={gardenDetails.reserveAsset} />
        </MetricsCardRowValue>
        <ExpandToggle onClick={toggleReturns} isOpen={returnsOpen} />
      </MetricsCardRow>
      {returnsOpen && (
        <MetricsSubBlock>
          <MetricsCardRow>
            <MetricsSubBlockLabel>Strategy Returns</MetricsSubBlockLabel>
            <MetricsSubBlockValue>
              <ReserveNumber value={gardenDetails.strategyReturns} address={gardenDetails.reserveAsset} />
            </MetricsSubBlockValue>
          </MetricsCardRow>
          <MetricsCardRow>
            <MetricsSubBlockLabel>BABL Returns</MetricsSubBlockLabel>
            <MetricsSubBlockValue>
              <ReserveNumber value={gardenDetails.bablReturns} address={gardenDetails.reserveAsset} />
            </MetricsSubBlockValue>
          </MetricsCardRow>
          <MetricsCardRow>
            <MetricsSubBlockLabel>
              Other
              <HoverTooltip
                size={14}
                color={'var(--blue-04)'}
                content={'Includes Garden Boosts & Token sweeps.'}
                placement={'up'}
              />
            </MetricsSubBlockLabel>
            <MetricsSubBlockValue>
              <ReserveNumber
                value={gardenDetails.grossReturns.sub(gardenDetails.strategyReturns).sub(gardenDetails.bablReturns)}
                address={gardenDetails.reserveAsset}
              />
            </MetricsSubBlockValue>
          </MetricsCardRow>
        </MetricsSubBlock>
      )}
      <MetricsCardRow>
        <MetricsCardRowLabel>Expenses</MetricsCardRowLabel>
        <MetricsCardRowValue>
          <ReserveNumber
            value={gardenDetails.fees?.total.sub(gardenDetails.profitSplit) || BigNumber.from(0)}
            address={gardenDetails.reserveAsset}
          />
        </MetricsCardRowValue>
        <ExpandToggle onClick={toggleExpenses} isOpen={expensesOpen} />
      </MetricsCardRow>
      {expensesOpen && (
        <MetricsSubBlock>
          <MetricsCardRow>
            <MetricsSubBlockLabel>Gas</MetricsSubBlockLabel>
            <MetricsSubBlockValue>
              <ReserveNumber
                value={gardenDetails.fees?.gas || BigNumber.from(0)}
                address={gardenDetails.reserveAsset}
              />
            </MetricsSubBlockValue>
          </MetricsCardRow>
          <MetricsCardRow>
            <MetricsSubBlockLabel>
              Performance
              <HoverTooltip
                size={14}
                color={'var(--blue-04)'}
                content={'Protocol Performance fee on profits'}
                placement={'up'}
              />
            </MetricsSubBlockLabel>
            <MetricsSubBlockValue>
              <ReserveNumber value={gardenDetails.performanceFees} address={gardenDetails.reserveAsset} />
            </MetricsSubBlockValue>
          </MetricsCardRow>
          <MetricsCardRow>
            <MetricsSubBlockLabel>
              Management
              <HoverTooltip size={14} color={'var(--blue-04)'} content={'Protocol Management fee'} placement={'up'} />
            </MetricsSubBlockLabel>
            <MetricsSubBlockValue>
              <ReserveNumber
                value={gardenDetails.fees?.management || BigNumber.from(0)}
                address={gardenDetails.reserveAsset}
              />
            </MetricsSubBlockValue>
          </MetricsCardRow>
        </MetricsSubBlock>
      )}
      <MetricsCardTotalRow>
        <MetricsCardTotalRowLabel>
          <b>Net Returns</b>
        </MetricsCardTotalRowLabel>
        <MetricsCardTotalRowValue>
          <ReserveNumber value={gardenDetails.netReturns} address={gardenDetails.reserveAsset} />
        </MetricsCardTotalRowValue>
      </MetricsCardTotalRow>
      <MetricsCardRow>
        <MetricsCardRowLabel>
          Profit Split
          <HoverTooltip
            size={14}
            color={'var(--blue-04)'}
            content={'Profits distributed to Strategists & Stewards.'}
            placement={'up'}
          />
        </MetricsCardRowLabel>
        <MetricsCardRowValue>
          <ReserveNumber value={gardenDetails.profitSplit} address={gardenDetails.reserveAsset} />
        </MetricsCardRowValue>
        <RowSpacer />
      </MetricsCardRow>
    </MetricsCard>
  );
};

const RowSpacer = styled.div`
  width: 24px;
`;

const ToggleIconWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding-left: 10px;
  &:hover {
    cursor: pointer;
    color: var(--blue-04);
  }
`;

const MetricsCard = styled.div`
  background-color: var(--blue-07);
  padding: 20px;
  width: 375px;
  margin-left: auto;
  font-size: 18px;
  display: flex;
  flex-flow: column nowrap;
`;

const MetricsCardRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
`;

const MetricsCardTotalRow = styled(MetricsCardRow)`
  margin-top: 14px;
  padding: 10px 24px 0 0;
  border-top: 2px solid var(--purple-aux);
`;

const MetricsCardRowLabel = styled.div`
  display: inline-flex;
  align-items: center;
  font-size: 16px;
  width: 150px;
  text-align: left;
  margin-right: 12px;
`;

const MetricsCardRowValue = styled.span`
  text-align: right;
  font-size: 18px;
  font-family: cera-medium;
  width: 200px;
`;

const MetricsSubBlock = styled.div`
  border-left: 1px solid var(--purple-aux);
  display: column nowrap;
  padding: 0 22px 0 6px;
  margin: 6px 0;
`;

const MetricsSubBlockLabel = styled(MetricsCardRowLabel)`
  font-family: cera-regular;
  color: var(--blue-04);
  font-size: 14px;
`;

const MetricsSubBlockValue = styled(MetricsCardRowValue)`
  font-family: cera-regular;
  color: var(--blue-04);
  font-size: 14px;
`;

const MetricsCardTotalRowLabel = styled(MetricsCardRowLabel)`
  color: var(--purple-aux);
  flex-grow: 1;
`;

const MetricsCardTotalRowValue = styled(MetricsCardRowValue)`
  color: var(--purple-aux);
  flex-grow: 1;
`;

export default React.memo(HeroMetricsCard);
