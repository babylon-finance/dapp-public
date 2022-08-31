import { CreatorDetailBlocks } from './CreatorDetailBlocks';
import { CreatorFeaturesBlock } from './CreatorFeaturesBlock';
import { DefiProtocols } from '.';
import { TurquoiseButton } from 'components/shared';

import { Routes } from 'constants/Routes';
import { BREAKPOINTS } from 'config';

import { useHistory } from 'react-router';
import styled from 'styled-components';
import React from 'react';

const HERO_GRADIENT = 'linear-gradient(267.84deg, #00C7BA 0.63%, rgba(35, 29, 101, 0) 79.51%)';

const CreatorLander = () => {
  const history = useHistory();
  return (
    <FullWidthContainer>
      <RailContainer bg={HERO_GRADIENT}>
        <HeroContainer>
          <HeroContentContainer>
            <HeroTitle>Create a supercharged investment club in minutes.</HeroTitle>
            <HeroSubtext>
              Launch the most flexible investment funds in DeFi without writing a single line of code.
            </HeroSubtext>
            <StyledCreateButton onClick={() => history.push(`${Routes.portfolio}#create`)}>
              Create a Garden
            </StyledCreateButton>
          </HeroContentContainer>
          <HeroImageContainer>
            <StyledHeroImg alt={'creator-hero-img'} src={'/CreatorHero.png'} />
          </HeroImageContainer>
        </HeroContainer>
      </RailContainer>
      <RailContainer>
        <CreatorDetailBlocks />
      </RailContainer>
      <RailContainer bg={'var(--blue-alt)'}>
        <CreatorFeaturesBlock />
      </RailContainer>
      <RailContainer>
        <DefiProtocols />
      </RailContainer>
    </FullWidthContainer>
  );
};

const StyledCreateButton = styled(TurquoiseButton)`
  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    display: none;
  }
`;

const StyledHeroImg = styled.img`
  width: 100%;
`;

const HeroContainer = styled.div`
  padding: 50px 30px;
  display: flex;
  flex-flow: row nowrap;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    flex-flow: row wrap;
    padding: 30px 0;
  }
`;

const HeroContentContainer = styled.div`
  width: 50%;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100%;
    padding-bottom: 30px;
  }
`;

const HeroImageContainer = styled.div`
  width: 50%;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100%;
  }
`;

const HeroTitle = styled.div`
  font-size: 32px;
  font-family: cera-bold;
  text-align: left;
  max-width: 545px;
  line-height: 36px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    font-size: 22px;
    line-height: 28px;
    width: 100%;
  }
`;

const HeroSubtext = styled.div`
  font-size: 18px;
  line-height: 22px;
  padding: 20px 0 30px;
  width: 60%;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    font-size: 16px;
    line-height: 20px;
    width: 100%;
    padding: 10px 0 20px;
  }
`;

const FullWidthContainer = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-start;
`;

const RailContainer = styled.div<{ bg?: string }>`
  align-items: center;
  background: ${(p) => (p.bg ? `${p.bg}` : 'transparent')};

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

  @media only screen and (max-width: 1280px) {
    padding: 30px 30px 20px;
    .uvp-a,
    .uvp-b {
      font-size: 30px;
    }
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding-right: 45px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 0 30px 0;
  }
`;

export default React.memo(CreatorLander);
