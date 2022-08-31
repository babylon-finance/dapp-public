import { GardenPill, ReserveNumber, TokenDisplay, TurquoiseButton, HoverTooltip } from 'components/shared';
import { GardenDetails, getGardenCategory, IconName } from 'models';
import { CustomGardenDetails, CustomDetails } from 'constants/customDetails';
import { BREAKPOINTS } from 'config';

import { useHistory } from 'react-router';
import styled from 'styled-components';
import React from 'react';

interface VerifiedGardenCardProps {
  garden: GardenDetails;
}

const VerifiedGardenCard = ({ garden }: VerifiedGardenCardProps) => {
  const history = useHistory();
  const customDetails: CustomDetails | undefined = CustomGardenDetails[garden.address.toLowerCase()];
  const vAPR = garden.latestMetric?.returnRates?.annual?.aggregate;
  const last30 = garden.latestMetric?.returnRates?.last30?.aggregate;
  const last90 = garden.latestMetric?.returnRates?.last90?.aggregate;
  return (
    <CardContainer onClick={() => history.push(`/garden/${garden.address}`)}>
      <CardRow>
        <ThumbContainer>
          <img
            src={`/gardens/${garden.address.toLowerCase()}/thumb.png`}
            alt={'garden-thumbnail'}
            width={'100%'}
            height={'100%'}
          />
        </ThumbContainer>
        <CategoryWrapper>
          <HoverTooltip
            icon={IconName.check}
            size={24}
            color={'var(--white)'}
            content={'This Garden has been verified by the Babylon community.'}
            placement={'up'}
          />
          <StyledTokenDisplay token={garden.reserveToken} size={24} symbol={false} />
          <GardenPill text={getGardenCategory(garden.verified).display} />
        </CategoryWrapper>
      </CardRow>
      <Name>{garden.name}</Name>
      <Description>
        {customDetails?.shortDescription || `Deposit and grow your ${garden.reserveToken.symbol}`}
      </Description>
      <MetricsContainer>
        <MetricsRow>
          <RowLabel bold>NAV</RowLabel>
          <RowValue>
            <ReserveNumber value={garden.netAssetValue} address={garden.reserveAsset} numeral={false} fiat />
          </RowValue>
        </MetricsRow>
        <MetricsRow>
          <RowLabel>30D</RowLabel>
          <RowValue positive={last30 ? last30 > 0 : undefined}>
            {last30 ? `${parseFloat(last30.toFixed(2))}%` : '--'}
          </RowValue>
        </MetricsRow>
        <MetricsRow>
          <RowLabel>90D</RowLabel>
          <RowValue positive={last90 ? last90 > 0 : undefined}>
            {last90 ? `${parseFloat(last90.toFixed(2))}%` : '--'}
          </RowValue>
        </MetricsRow>
        <MetricsRow>
          <RowLabel bold>vAPR</RowLabel>
          <RowValue bold positive={vAPR ? vAPR > 0 : undefined}>
            {vAPR ? `${parseFloat(vAPR.toFixed(2))}%` : '--'}
          </RowValue>
        </MetricsRow>
      </MetricsContainer>
      <BottomRow>
        <StyledButton onClick={() => null}>View Garden →</StyledButton>
      </BottomRow>
    </CardContainer>
  );
};

const StyledTokenDisplay = styled(TokenDisplay)`
  margin-left: 2px;
`;

const CategoryWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin-left: auto;
  align-items: center;
`;

const StyledButton = styled(TurquoiseButton)`
  display: none;
  height: 30px;
`;

const BottomRow = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: flex-end;
`;

const RowValue = styled.div<{ bold?: boolean; positive?: boolean }>`
  margin-left: auto;
  font-size: 16px;
  ${(p) => (p.bold ? 'font-family: cera-bold;' : '')}
  color: ${(p) => (p.positive !== undefined ? (p.positive ? 'var(--positive)' : 'var(--negative)') : 'var(--white)')};
`;

const RowLabel = styled.div<{ bold?: boolean }>`
  font-size: 15px;
  ${(p) => (p.bold ? 'font-family: cera-medium' : '')};
`;

const MetricsRow = styled.div`
  font-feature-settings: 'pnum' on, 'lnum' on;
  height: 35px;
  width: 100%;
  border-bottom: 1px solid var(--border-blue);
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  &:last-child {
    border: none;
  }
`;

const MetricsContainer = styled.div`
  margin-top: 4px;
  width: 100%;
`;

const Description = styled.div`
  margin: 6px 0 1px 0;
  line-height: 22.5px;
  width: 100%;
  max-height: 70px;
  min-height: 70px;
  text-overflow: ellipsis;
`;

const Name = styled.div`
  width: 95%;
  text-overflow: ellipsis;
  font-family: cera-medium;
  font-size: 24px;
  margin-top: 10px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 22px;
  }
`;

const CardRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
`;

const ThumbContainer = styled.div`
  width: 68px;
  height: 68px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardContainer = styled.div`
  background-color: var(--purple-07);
  border-radius: 4px;
  display: flex;
  flex-flow: column nowrap;
  height: 400px;
  padding: 20px;
  width: 290px;

  &:hover {
    button {
      display: block;
    }

    cursor: pointer;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;

    button {
      display: block;
    }
  }
`;

export default React.memo(VerifiedGardenCard);
