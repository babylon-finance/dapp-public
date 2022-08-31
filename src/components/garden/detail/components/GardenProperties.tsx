import { GardenPill, GardenTokenIcon, Icon, Member, ReserveNumber, TokenDisplay } from 'components/shared';

import { FullGardenDetails, getGardenCategory, IconName } from 'models';
import { TokenListService } from 'services';
import { formatEtherDecimal } from 'helpers/Numbers';
import { buildEtherscanContractUrl } from 'helpers/Urls';
import { BREAKPOINTS } from 'config';

import { isMobile } from 'react-device-detect';
import styled from 'styled-components';
import React from 'react';

interface GardenPropertiesProps {
  details: FullGardenDetails;
}

const DATE_OPTIONS = { year: 'numeric', month: 'short', day: 'numeric' };

const GardenProperties = ({ details }: GardenPropertiesProps) => {
  const tokenListService = TokenListService.getInstance();
  const reserveToken = tokenListService.getTokenByAddress(details.reserveAsset);
  // @ts-ignore
  const inception = new Date(details.gardenInitializedAt).toLocaleDateString(undefined, DATE_OPTIONS);
  const hardlockFormatted = (() => {
    const hl = details.depositHardlock.toNumber();
    const ONE_HOUR_SEC = 60 * 60;
    const ONE_DAY_SEC = ONE_HOUR_SEC * 24;
    let unit = 'secs';

    if (hl >= ONE_DAY_SEC) {
      return { value: hl / ONE_DAY_SEC, unit: 'days' };
    }

    if (hl >= ONE_HOUR_SEC) {
      return { value: hl / ONE_HOUR_SEC, unit: 'hours' };
    }

    // Not days or hours so fallback to seconds
    return { value: hl, unit };
  })();

  return (
    <PropertiesContainer>
      <PropertyCol>
        <PropertyRow>
          <PropertyRowLabel>Name</PropertyRowLabel>
          <PropertyRowContent>{details.name}</PropertyRowContent>
        </PropertyRow>
        <PropertyRow>
          <PropertyRowLabel>Symbol</PropertyRowLabel>
          <PropertyRowContent>
            <SymbolWrapper>
              <GardenTokenIcon size={isMobile ? 24 : 28} />
              <StyledAddressLink
                href={buildEtherscanContractUrl(details.address)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {details.symbol}
              </StyledAddressLink>
            </SymbolWrapper>
          </PropertyRowContent>
        </PropertyRow>
        <PropertyRow>
          <PropertyRowLabel>Category</PropertyRowLabel>
          <PropertyRowContent>
            <GardenPill text={getGardenCategory(details.verified || 0).display} />
          </PropertyRowContent>
        </PropertyRow>
        <PropertyRow>
          <PropertyRowLabel>Reserve</PropertyRowLabel>
          <PropertyRowContent>
            <TokenDisplay token={reserveToken} size={isMobile ? 20 : 24} />
          </PropertyRowContent>
        </PropertyRow>
        <PropertyRow>
          <PropertyRowLabel>Created by</PropertyRowLabel>
          <PropertyRowContent>
            <Member size={isMobile ? 8 : 10} address={details.creator[0]} link showText />
          </PropertyRowContent>
        </PropertyRow>
        <PropertyRow>
          <PropertyRowLabel>Inception</PropertyRowLabel>
          <PropertyRowContent>
            <span>{inception}</span>
          </PropertyRowContent>
        </PropertyRow>
      </PropertyCol>
      <PropertyCol>
        <PropertyRow>
          <PropertyRowLabel>Minimum Deposit</PropertyRowLabel>
          <PropertyRowContent>
            <ReserveNumber value={details.minContribution} address={details.reserveAsset} />
          </PropertyRowContent>
        </PropertyRow>
        <PropertyRow>
          <PropertyRowLabel>Maximum Principal</PropertyRowLabel>
          <PropertyRowContent>
            <ReserveNumber value={details.maxDepositLimit} address={details.reserveAsset} precision={0} />
          </PropertyRowContent>
        </PropertyRow>
        <PropertyRow>
          <PropertyRowLabel>Minimum Asset Liquidity</PropertyRowLabel>
          <PropertyRowContent>
            <ReserveNumber value={details.minLiquidityAsset} address={details.reserveAsset} precision={0} />
          </PropertyRowContent>
        </PropertyRow>
        <PropertyRow>
          <PropertyRowLabel>Deposit Hardlock</PropertyRowLabel>
          <PropertyRowContent>
            {hardlockFormatted.value} {hardlockFormatted.unit}
          </PropertyRowContent>
        </PropertyRow>
        <PropertyRow>
          <PropertyRowLabel>Strategy Duration</PropertyRowLabel>
          <PropertyRowContent>
            {details.minStrategyDuration.div(60 * 60 * 24).toString()} -{' '}
            {details.maxStrategyDuration.div(60 * 60 * 24).toString()} Days
          </PropertyRowContent>
        </PropertyRow>
        <PropertyRow>
          <PropertyRowLabel>Proposal Cooldown</PropertyRowLabel>
          <PropertyRowContent>
            {details.strategyCooldownPeriod
              .div(60 * 60)
              .mul(2)
              .toString()}{' '}
            Hours
          </PropertyRowContent>
        </PropertyRow>
        <PropertyRow>
          <PropertyRowLabel>Quorum Requirements</PropertyRowLabel>
          <PropertyRowContent>
            <IconRow>
              <Icon name={IconName.steward} size={18} />
              <span>{details.minVoters.toString()}</span>
            </IconRow>
            <IconRow>
              <GardenTokenIcon size={isMobile ? 24 : 28} />
              {/* Safe usage of formatEther since this is internally described */}
              <span>{formatEtherDecimal(details.minVotesQuorum.mul(100))}%</span>
            </IconRow>
          </PropertyRowContent>
        </PropertyRow>
      </PropertyCol>
    </PropertiesContainer>
  );
};

const StyledAddressLink = styled.a`
  color: var(--blue-03);
  font-size: 16px;
  padding-left: 8px;
  text-decoration: underline;

  &:hover {
    color: var(--blue-03);
    text-decoration: none;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

const SymbolWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const IconRow = styled.div`
  display: flex;
  flex-flow: row nowrap;

  > span {
    padding-left: 6px;
  }
`;

const PropertiesContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    flex-flow: column nowrap;
  }
`;

const PropertyCol = styled.div`
  padding: 0 40px 0 20px;
  display: flex;
  flex-flow: column nowrap;
  border-left: 1px solid var(--border-blue);
  width: 50%;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
    border-left: none;
    padding: 0;
  }
`;

const PropertyRow = styled.div`
  min-height: 30px;
  border-bottom: 0.5px solid var(--border-blue);
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  padding: 10px 0;
`;

const PropertyRowLabel = styled.div`
  font-family: cera-bold;
  width: 50%;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

const PropertyRowContent = styled.div`
  width: 50%;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-end;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

export default React.memo(GardenProperties);
