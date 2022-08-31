import { Icon, ReserveNumber } from 'components/shared';

import { FullGardenDetails, IconName, Token } from 'models';
import { GARDEN_NEW_NUM_DAYS } from 'config';
import { daysBetween } from 'helpers/Date';
import { formatReserveFloat } from 'helpers/Numbers';

import styled from 'styled-components';
import React from 'react';

interface GardenDetailChartHeroMetricProps {
  gardenDetails: FullGardenDetails;
  reserveToken: Token;
  navDelta: any;
  metrics: number[][];
  isNAV: boolean;
}

const NewGardenTag = () => {
  return <NewFlag onClick={() => {}}>New!</NewFlag>;
};

const getSharePriceChangePerc = (startValue: number, endValue: number) => {
  if (startValue > 0) {
    const delta = Math.abs(startValue - endValue);
    return (delta / startValue) * 100;
  } else {
    return 0;
  }
};

const getChangePercent = (isNav: boolean, navDelta: any, startShare: number, endShare: number) => {
  if (isNav) {
    return navDelta.return;
  } else {
    return getSharePriceChangePerc(startShare, endShare);
  }
};

const getMetricIsUp = (isNAV: boolean, navDelta: any, startShare: number, endShare: number) => {
  if (isNAV) {
    return navDelta.return >= 0;
  } else {
    return endShare >= startShare;
  }
};

const GardenDetailChartHeroMetric = ({
  gardenDetails,
  navDelta,
  reserveToken,
  metrics,
  isNAV,
}: GardenDetailChartHeroMetricProps) => {
  const gardenCreated = new Date(gardenDetails.gardenInitializedAt);
  const isNew: boolean = daysBetween(gardenCreated, new Date()) <= GARDEN_NEW_NUM_DAYS;
  const currentShareFloat = formatReserveFloat(gardenDetails.sharePrice, reserveToken);
  const startShareFloat = metrics[0][1] || 0;
  const changePercent = getChangePercent(isNAV, navDelta, startShareFloat, currentShareFloat);
  const metricIsUp = getMetricIsUp(isNAV, navDelta, startShareFloat, currentShareFloat);
  return (
    <HeroMetricItem>
      <StyledHeroMetric>
        <PrimaryMetric>
          <ReserveNumber
            value={isNAV ? gardenDetails.netAssetValue : gardenDetails.sharePrice}
            address={gardenDetails.reserveAsset}
          />
          <HeroMetricLabel>{isNAV ? 'Net Asset Value' : 'Share Price'}</HeroMetricLabel>
        </PrimaryMetric>
        {isNew ? (
          <FlagWrapper>
            <NewGardenTag />
          </FlagWrapper>
        ) : (
          <DeltaWrapper>
            <DeltaItem>
              <DeltaIconWrapper>
                <Icon name={metricIsUp ? IconName.numberUp : IconName.numberDown} size={18} />
              </DeltaIconWrapper>
              <DeltaValue>
                <DeltaValuePercent positive={metricIsUp}>{Number(changePercent).toFixed(2)}%</DeltaValuePercent>
              </DeltaValue>
            </DeltaItem>
            <DeltaValuePeriod>Last {navDelta.periodInDays} days</DeltaValuePeriod>
          </DeltaWrapper>
        )}
      </StyledHeroMetric>
    </HeroMetricItem>
  );
};

const PrimaryMetric = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;

const FlagWrapper = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  padding-left: 20px;
`;

const NewFlag = styled.div`
  background-color: var(--yellow);
  border-radius: 4px;
  color: var(--primary);
  font-size: 12px;
  padding: 8px;
`;

const HeroMetricItem = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
`;

const HeroMetricLabel = styled.div`
  font-family: cera-medium;
  font-size: 16px;
  color: var(--blue-03);
  text-align: left;
`;

const StyledHeroMetric = styled.div`
  display: flex;
  flex-flow: row nowrap;
  font-family: cera-bold;
  font-feature-settings: 'pnum' on, 'lnum' on;
  font-size: 24px;
  justify-content: flex-start;
`;

const DeltaWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin-left: 40px;
`;

const DeltaItem = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  padding-top: 6px;
  height: 34px;
`;

const DeltaIconWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  height: 25px;
`;

const DeltaValue = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding-left: 6px;
  align-items: flex-start;
`;

const DeltaValuePercent = styled.span<{ positive: boolean }>`
  vertical-align: top;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  height: 25px;
  font-size: 18px;
  padding-bottom: 8px;
  font-family: cera-medium;
  font-feature-settings: 'pnum' on, 'lnum' on;
  color: ${(p) => (p.positive ? 'var(--positive)' : 'var(--negative)')};
`;

const DeltaValuePeriod = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  font-size: 16px;
  font-family: cera-medium;
  color: var(--blue-03);
`;

export default GardenDetailChartHeroMetric;
