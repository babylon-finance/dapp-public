import { BigNumber } from '@ethersproject/bignumber';
import styled from 'styled-components';
import { getAnnualizedReturn } from 'helpers/Numbers';
import { Icon } from 'components/shared';
import { FullGardenDetails, IconName } from 'models';
import React from 'react';

interface GardenReturnProps {
  gardenDetails: FullGardenDetails;
  hideLabel?: boolean;
  sinceInception?: boolean;
  className?: string;
  size?: number;
}

const GardenReturn = ({ gardenDetails, hideLabel, className, size, sinceInception }: GardenReturnProps) => {
  const annualReturn = getAnnualizedReturn(gardenDetails, sinceInception);
  return (
    <ReturnContainer className={className}>
      <ReturnIcon>
        <Icon name={annualReturn.gte(BigNumber.from(0)) ? IconName.numberUp : IconName.numberDown} size={size || 32} />
      </ReturnIcon>
      <ReturnValue>
        <ReturnPercent positive={annualReturn.gte(BigNumber.from(0))}>
          {annualReturn.toNumber() / 100 || 0}%
        </ReturnPercent>
        {!hideLabel && <ReturnLabel>Annualized Return</ReturnLabel>}
      </ReturnValue>
    </ReturnContainer>
  );
};

const ReturnContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  margin-left: 12px;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const ReturnIcon = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
`;

const ReturnValue = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding-left: 5px;
  height: 100%;
  position: relative;
  align-items: flex-start;
`;

const ReturnPercent = styled.div<{ positive: boolean }>`
  color: ${(p) => (p.positive ? 'var(--positive)' : 'var(--negative)')};
  display: flex;
  flex-flow: column nowrap;
  font-family: cera-medium;
  font-size: 24px;
  height: 25px;
`;

const ReturnLabel = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  font-size: 13px;
  font-family: cera-medium;
  color: var(--blue-03);
`;

export default React.memo(GardenReturn);
