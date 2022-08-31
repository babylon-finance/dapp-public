import BablStar from '../img/BablStar.svg';
import { ProtocolIcon } from 'components/shared';

import { RoutesExternal } from 'constants/Routes';

import { Link } from 'react-router-dom';
import styled from 'styled-components';
import React from 'react';
import { BREAKPOINTS } from 'config';

const BablBlock = () => {
  return (
    <DetailsContainer>
      <BlockWrapper>
        <RowBlock>
          <ImgWrapper>
            <StyledImg alt={'babl-img'} src={BablStar} />
          </ImgWrapper>
        </RowBlock>
        <RowBlock>
          <DetailsHeader>BABL</DetailsHeader>
          <DetailsBody>
            BABL is the ERC-20 governance token that powers the Babylon protocol. It enables participation in protocol
            governance and ensures that Babylon is owned by its users. BABL can be staked in the Heart of Babylon.
          </DetailsBody>
          <MetricsRow>
            <MetricsItem>
              <MetricsItemValue>1M</MetricsItemValue>
              <MetricsItemLabel>
                Total
                <br />
                Supply
              </MetricsItemLabel>
            </MetricsItem>
            <MetricsItem>
              <MetricsItemValue>69%</MetricsItemValue>
              <MetricsItemLabel>
                Community <br />
                Allocation
              </MetricsItemLabel>
            </MetricsItem>
          </MetricsRow>
          <LinkRow>
            <IconLinkWrapper>
              <ProtocolIcon size={30} name="uniswap" />
              <Link to={{ pathname: RoutesExternal.uniswapPool }} target={'_blank'}>
                <IconLink>Trade BABL on Uniswap</IconLink>
              </Link>
            </IconLinkWrapper>
            <IconOnlyWrapper>
              <IconSoloWrapper>
                <Link to={{ pathname: RoutesExternal.messariProfile }} target={'_blank'}>
                  <ProtocolIcon size={30} name="messari" />
                </Link>
              </IconSoloWrapper>
              <IconSoloWrapper>
                <Link to={{ pathname: RoutesExternal.etherscan }} target={'_blank'}>
                  <ProtocolIcon size={30} name="etherscan" />
                </Link>
              </IconSoloWrapper>
              <IconSoloWrapper>
                <Link to={{ pathname: RoutesExternal.coinmarketcap }} target={'_blank'}>
                  <ProtocolIcon size={30} name="coinmarketcap" />
                </Link>
              </IconSoloWrapper>
              <IconSoloWrapper>
                <Link to={{ pathname: RoutesExternal.coingecko }} target={'_blank'}>
                  <ProtocolIcon size={30} name="coingecko" />
                </Link>
              </IconSoloWrapper>
            </IconOnlyWrapper>
            <IconLinkWrapper>
              <Link to={{ pathname: RoutesExternal.tokenomics }} target={'_blank'}>
                <IconLink>Learn about BABL tokenomics</IconLink>
              </Link>
            </IconLinkWrapper>
          </LinkRow>
        </RowBlock>
      </BlockWrapper>
    </DetailsContainer>
  );
};

export default React.memo(BablBlock);

const StyledImg = styled.img`
  width: 90%;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 60%;
  }
`;

const ImgWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    justify-content: center;
  }
`;

const LinkRow = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  padding-top: 60px;
  height: 40px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding: 20px 0;
    flex-flow: column nowrap;
    justify-content: flex-start;
    height: auto;
  }
`;

const IconLinkWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  height: 100%;

  &:hover {
    cursor: pointer;
    opacity: 0.7;
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    &:first-child {
      padding-bottom: 10px;
    }

    &:last-child {
      padding-top: 10px;
    }
  }
`;

const IconOnlyWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 0 15px 0 30px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding: 10px 15px 10px 0;
  }
`;

const IconSoloWrapper = styled.div`
  padding-right: 15px;

  &:last-child {
    padding-right: 0;
  }

  &:hover {
    cursor: pointer;
    opacity: 0.7;
  }
`;

const IconLink = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  margin-left: 8px;
  font-size: 16px;
  padding-bottom: 6px;
  font-family: cera-medium;
  color: var(--purple-aux);
  text-decoration: underline;
  text-underline-offset: 4px;
`;

const MetricsRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
`;

const MetricsItem = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  padding-top: 2%;
  width: 33%;

  &:first-child {
    border-right: 2px solid var(--border-blue);
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 50%;
  }
`;

const MetricsItemValue = styled.div`
  font-size: 44px;
  font-family: cera-bold;
  width: 100%;
  text-align: center;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    font-size: 36px;
  }
`;

const MetricsItemLabel = styled.div`
  font-size: 18px;
  font-family: cera-medium;
  width: 60%;
  text-align: center;
  padding: 8px 0;
`;

const DetailsHeader = styled.div`
  font-size: 44px;
  font-family: cera-bold;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    font-size: 36px;
  }
`;

const DetailsBody = styled.div`
  font-size: 18px;
  padding: 10px 0 30px 0;
`;

const DetailsContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  padding-bottom: 100px;
  font-feature-settings: 'pnum' on, 'lnum' on;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding-bottom: 0;
  }
`;

const RowBlock = styled.div`
  height: 100%;
  width: 50%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: flex-start;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100%;
  }
`;

const BlockWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  height: auto;
  width: 100%;
  justify-content: space-around;
  align-items: center;
  padding: 100px 30px 0;
  align-items: center;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding: 20px 0;
    justify-content: center;
  }
`;
