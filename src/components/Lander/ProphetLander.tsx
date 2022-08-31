import { Icon } from 'components/shared';

import { IconName } from 'models';
import { BREAKPOINTS } from 'config';
import { Routes, RoutesExternal } from 'constants/Routes';

import { Link } from 'react-router-dom';
import styled from 'styled-components';
import React from 'react';

const ProphetLander = () => {
  return (
    <FullWidthContainer>
      <RailContainer>
        <ProphetsHeader>
          <HeaderTitle>The Prophets</HeaderTitle>
          <HeaderContent>
            The Prophets are a rare NFT collection with unique utility within the Babylon ecosystem. In addition to a
            PAOP in the Babylon dApp, Prophets can be staked within Gardens to provide various bonuses to BABL rewards.
            <br />
            <br />
            <Yellow>A collection of only 2,592 Prophets</Yellow>
            <HeaderLinkRow></HeaderLinkRow>
          </HeaderContent>
          <HeaderLinkRow>
            <Link to={Routes.prophetsGallery}>
              <IconLink>
                <Icon name={IconName.merman} size={28} />
                <LinkContent>View Gallery</LinkContent>
              </IconLink>
            </Link>
            <Link to={{ pathname: RoutesExternal.openseaProphets }} target={'_blank'}>
              <IconLink>
                <Icon name={IconName.opensea} size={28} />
                <LinkContent>OpenSea Collection</LinkContent>
              </IconLink>
            </Link>
          </HeaderLinkRow>
        </ProphetsHeader>
        <ProphetsGallery>
          {[...Array(10)].map((_, index) => {
            return (
              <ImageWrapper key={`prophet-${index}`}>
                <ProphetImage src={`/scaled/prophets/${index + 1}.png`} />
              </ImageWrapper>
            );
          })}
        </ProphetsGallery>
      </RailContainer>
    </FullWidthContainer>
  );
};

const HeaderLinkRow = styled.div`
  display: flex;
  flex-flow: row nowrap;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    justify-content: flex-start;
  }
`;

const Yellow = styled.span`
  font-size: 18px;
  color: var(--yellow);

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    font-size: 16px;
  }
`;

const IconLink = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: 18px;
  font-family: cera-medium;
  color: var(--purple-aux);
  text-decoration: underline;
  text-underline-offset: 4px;

  &:first-child {
    margin-right: 20px;
  }

  &:hover {
    cursor: pointer;
    opacity: 0.7;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 15px;
    justify-content: flex-start;
  }
`;

const LinkContent = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding: 0 0 8px 10px;
  height: 50px;
`;

const ProphetsHeader = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  text-align: center;
  align-items: center;
  width: 100%;
`;

const HeaderTitle = styled.div`
  font-family: cera-bold;
  font-size: 36px;
  padding-bottom: 30px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding-bottom: 16px;
    font-size: 32px;
  }
`;

const HeaderContent = styled.div`
  max-width: 700px;
  text-align: center;
  font-size: 18px;
  line-height: 22px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    font-size: 16px;
  }
`;

const ProphetImage = styled.img`
  width: 100%;
  height: 100%;
`;

const ImageWrapper = styled.div`
  width: 20%;
`;

const ProphetsGallery = styled.div`
  padding-top: 50px;
  display: flex;
  flex-flow: row wrap;
  width: 100%;
`;

const RailContainer = styled.div<{ bg?: string; bgImg?: string }>`
  align-items: center;
  background: ${(p) => (p.bg ? `${p.bg}` : 'transparent')};
  background-image: ${(p) => (p.bgImg ? `url(${p.bgImg})` : 'none')};
  background-repeat: repeat-x;
  display: flex;
  height: auto;
  flex-flow: column nowrap;
  justify-content: flex-start;
  padding: 10px 30px 0;
  position: relative;
  width: 100%;

  > div {
    max-width: var(--screen-lg-min);
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding-right: 30px;
  }
`;

const FullWidthContainer = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-start;
  min-height: calc(100vh - 261px);
  padding: 60px 0 100px;
  background-color: var(--blue-alt);

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding: 0;
    height: auto;
  }
`;

export default React.memo(ProphetLander);
