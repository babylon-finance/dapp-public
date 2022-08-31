import { GardenPill, Icon, TurquoiseButton, HoverTooltip } from 'components/shared';
import { ReserveNumber } from '../ReserveNumber';
import { TokenDisplay } from '../TokenDisplay';

import addresses from 'constants/addresses';
import {
  GardenDetails,
  GardenRowType,
  getGardenCategory,
  IconName,
  WalletMetricItem,
  FullGardenDetails,
  Token,
} from 'models';
import { TokenListService } from 'services';
import { BREAKPOINTS, HEART_GARDEN_ADDRESS } from 'config';

import { BigNumber } from '@ethersproject/bignumber';
import { isMobile } from 'react-device-detect';
import { useHistory } from 'react-router';
import styled from 'styled-components';
import React from 'react';

interface GardenRowProps {
  garden: GardenDetails | FullGardenDetails;
  rowType: GardenRowType;
  fiat?: boolean;
  walletMetrics?: WalletMetricItem[];
}

const GardenRow = ({ garden, rowType, fiat = false, walletMetrics }: GardenRowProps) => {
  const history = useHistory();
  const tokenListService = TokenListService.getInstance();
  let content;

  const isHeart = garden.address.toLowerCase() === HEART_GARDEN_ADDRESS.toLowerCase();
  const vapr = garden.latestMetric?.returnRates?.annual?.aggregate;
  const last30 = garden.latestMetric?.returnRates?.last30?.aggregate;
  const verified = garden.verified > 0;

  // Explore Page Row
  if (rowType === GardenRowType.base) {
    content = (
      <ContentContainer>
        {!isMobile && <BaseItem width={125}>{garden.totalContributors.toString()}</BaseItem>}
        <BaseItem width={isMobile ? 75 : 150}>
          <StyledReserveNumber fiat={fiat} value={garden.netAssetValue} address={garden.reserveAsset} />
        </BaseItem>
        {!isMobile && (
          <BaseItem width={125}>
            <PercentNumber positive={last30 ? last30 >= 0 : undefined}>
              {last30 ? `${parseFloat(last30.toFixed(2))}%` : '--'}
            </PercentNumber>
          </BaseItem>
        )}
        <BaseItem width={isMobile ? 75 : 125}>
          <PercentNumber positive={vapr ? vapr >= 0 : undefined}>
            {vapr ? `${parseFloat(vapr.toFixed(2))}%` : '--'}
          </PercentNumber>
        </BaseItem>
      </ContentContainer>
    );
  }

  // Portfolio Page Row
  if (rowType === GardenRowType.user) {
    const portfolioGarden = garden as FullGardenDetails;
    const profitsBN =
      portfolioGarden.contribution?.expectedEquity.sub(portfolioGarden.contribution.totalCurrentDeposits) ||
      BigNumber.from(0);

    const totalBablBN = (portfolioGarden.contribution?.rewards?.totalBabl || BigNumber.from(0)).add(
      portfolioGarden.contribution?.claimedBABL || BigNumber.from(0),
    );
    content = (
      <ContentContainer>
        {portfolioGarden.contribution ? (
          <>
            <BaseItem width={isMobile ? 75 : 150}>
              <StyledReserveNumber
                fiat={fiat}
                value={portfolioGarden.contribution.expectedEquity}
                address={portfolioGarden.reserveAsset}
              />
            </BaseItem>
            <BaseItem width={isMobile ? 75 : 150}>
              <ProfitReserveNumber
                fiat={fiat}
                value={profitsBN}
                address={portfolioGarden.reserveAsset}
                positive={profitsBN.gte(BigNumber.from(0))}
              />
            </BaseItem>
            {!isMobile && (
              <>
                {isHeart && (
                  <BaseItem width={150} hover>
                    <HoverTooltip
                      size={24}
                      icon={IconName.compound}
                      placement="right"
                      content={
                        'Rewards earned in this Garden are auto-compounded into your net asset value and do not require claiming.'
                      }
                    />
                  </BaseItem>
                )}
                {!isHeart && (
                  <BaseItem width={150}>
                    {totalBablBN.gt(BigNumber.from(0)) ? (
                      <>
                        <BablIcon name={IconName.babToken} size={24} />
                        <StyledReserveNumber
                          hideSymbol
                          fiat={fiat}
                          value={totalBablBN}
                          address={addresses.tokens.BABL}
                        />
                      </>
                    ) : (
                      '--'
                    )}
                  </BaseItem>
                )}
              </>
            )}
            {!isMobile && (
              <BaseItem width={isMobile ? 75 : 150}>
                <PercentNumber positive={vapr ? vapr >= 0 : undefined}>
                  {vapr ? `${parseFloat(vapr.toFixed(2))}%` : '--'}
                </PercentNumber>
              </BaseItem>
            )}
          </>
        ) : (
          <span>Missing position data for this Garden...</span>
        )}
      </ContentContainer>
    );
  }

  const reserveToken = tokenListService.getTokenByAddress(garden.reserveAsset) as Token;
  const showVerified = isMobile ? rowType === GardenRowType.base : true;

  return (
    <RowContainer key={garden.address} onClick={() => history.push(`/garden/${garden.address}`)}>
      <InnerContainer>
        {showVerified && (
          <VerifiedItem width={isMobile ? 26 : 50} hover>
            {verified && (
              <HoverTooltip
                icon={IconName.check}
                size={isMobile ? 16 : 24}
                color={'var(--white)'}
                content={'This Garden has been verified by the Babylon community.'}
                placement={'up'}
              />
            )}
          </VerifiedItem>
        )}
        <Name width={isMobile ? 135 : 250}>
          <NameContainer>{garden.name}</NameContainer>
        </Name>
        {!isMobile && (
          <BaseItem width={200}>
            <StyledTokenDisplay token={reserveToken} size={24} symbol={false} />
            <CategoryWrapper>
              <GardenPill text={getGardenCategory(garden.verified).display} />
              {garden.customIntegrationsEnabled && <StyledCustomIcon name={IconName.customGarden} size={24} />}
            </CategoryWrapper>
          </BaseItem>
        )}
        <ContentWrapper className="contentWrapper">
          {content ? content : <NoData>Failed to load garden data!</NoData>}
        </ContentWrapper>
        {!isMobile && (
          <ButtonWrapper className="gardenViewButton">
            <ViewButton onClick={() => {}}>View Garden →</ViewButton>
          </ButtonWrapper>
        )}
      </InnerContainer>
    </RowContainer>
  );
};

const StyledTokenDisplay = styled(TokenDisplay)`
  margin-left: 2px;
`;

const BablIcon = styled(Icon)`
  margin-right: 10px;
`;

const PercentNumber = styled.span<{ positive: boolean | undefined }>`
  color: ${(p) =>
    p.positive !== undefined ? (p.positive === true ? 'var(--positive)' : 'var(--negative)') : 'var(--white)'};
  font-family: cera-medium;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

const StyledReserveNumber = styled(ReserveNumber)`
  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

const ProfitReserveNumber = styled(ReserveNumber)<{ positive: boolean }>`
  color: ${(p) => (p.positive ? `var(--positive)` : 'var(--negative)')};

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

const NoData = styled.div`
  flex-grow: 1;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
`;

const BaseItem = styled.div<{ width?: number; hover?: boolean }>`
  width: ${(p) => (p.width ? `${p.width}px` : '100px')};
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${(p) => (p.hover ? 'z-index: 10;' : '')}
`;

const VerifiedItem = styled(BaseItem)`
  margin-right: 4px;
`;

const CategoryWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

const NameContainer = styled.div`
  width: 95%;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Name = styled(BaseItem)`
  font-size: 18px;
  font-family: cera-bold;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

const RowContainer = styled.div`
  position: relative;
  height: 64px;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
  background-color: var(--blue-01);
  padding: 0 15px 0 30px;
  cursor: pointer;

  &:hover {
    background-color: var(--blue-02);
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 0 5px 0 5px;
  }
`;

const InnerContainer = styled.div`
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  width: 100%;
  height: 100%;

  &:hover {
    .gardenViewButton {
      display: flex;
    }
  }
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
`;

const ContentContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  position: absolute;
  display: none;
  width: 100%;
`;

const ViewButton = styled(TurquoiseButton)``;

const StyledCustomIcon = styled(Icon)`
  margin-left: 5px;
`;

export default React.memo(GardenRow);
