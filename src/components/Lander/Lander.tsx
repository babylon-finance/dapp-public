import ZigZag from './img/ZigZagBg.svg';
import { HeartBlock } from './HeartBlock';
import { AuditsBlock } from './AuditsBlock';
import { FeaturesBlock } from './FeaturesBlock';
import { DetailBlocks } from './DetailBlocks';
/* eslint-disable jsx-a11y/accessible-emoji */
import { TeamMembers, StatsBlocks, Investors } from './';
import { Animation, AnimationName, TurquoiseButton } from 'components/shared';
import { CtaBlock } from './CtaBlock';
import { BablBlock } from './BablBlock';

import { BREAKPOINTS } from 'config';
import { Routes } from 'constants/Routes';

import { isMobile } from 'react-device-detect';
import { useHistory } from 'react-router';
import styled from 'styled-components';
import React from 'react';

const LanderMinimal = () => {
  const history = useHistory();

  return (
    <FullWidthContainer>
      <RailContainer bg={'var(--blue-alt)'}>
        <HeroContainer>
          <LeftSide>
            <HeroValuePropA>
              Crypto investing,
              {<Spacer px={isMobile ? 25 : 50} />}simplified.
            </HeroValuePropA>
            <HeroValuePropB>DeFi Together</HeroValuePropB>
            <HeroSubtext>
              Split fees, share profits, and earn rewards
              <br />
              via DeFi investment clubs.
            </HeroSubtext>
            <HeroButtonRow>
              <TurquoiseButton onClick={() => history.push(Routes.explore)}>Start Investing</TurquoiseButton>
            </HeroButtonRow>
          </LeftSide>
          <RightSide>
            <StyledHeroContainer>
              <Animation name={AnimationName.landerHero2} loop size={'100%'} />
            </StyledHeroContainer>
          </RightSide>
        </HeroContainer>
      </RailContainer>
      <RailContainer>
        <StatsBlocks />
      </RailContainer>
      <RailContainer>
        <DetailBlocks />
      </RailContainer>
      <RailContainer bgImg={ZigZag} bg={'var(--purple-07)'}>
        <FeaturesBlock />
      </RailContainer>
      <RailContainer bg={'var(--blue-alt)'}>
        <BablBlock />
      </RailContainer>
      <RailContainer>
        <HeartBlock />
      </RailContainer>
      <RailContainer bg={'var(--blue-alt)'}>
        <TeamMembers />
      </RailContainer>
      <RailContainer bg={'var(--blue-alt)'}>
        <AuditsBlock />
      </RailContainer>
      <RailContainer bg={'var(--blue-alt)'}>
        <Investors />
      </RailContainer>
      <CtaBlock />
    </FullWidthContainer>
  );
};

const Spacer = styled.br<{ px: number }>`
  line-height: ${(p) => p.px}px;
`;

const HeroButtonRow = styled.div`
  padding-top: 40px;
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: center;
  height: 60px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding-top: 0;
    margin: 10px 0;
  }
`;

const HeroSubtext = styled.div`
  padding-top: 10px;
  width: 80%;
  font-family: cera-regular;
  font-size: 22px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100%;
    font-size: 18px;
    line-height: 22px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
    font-size: 16px;
    line-height: 18px;
    padding-top: 0;
  }
`;

const StyledHeroContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: flex-end;
`;

const FullWidthContainer = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-start;
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
  padding: 0 30px;
  position: relative;
  width: 100%;

  > div {
    max-width: var(--screen-lg-min);
  }

  @media only screen and (max-width: 1280px) {
    padding: 0 30px;
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

const HeroContainer = styled.div`
  display: flex;
  width: 100%;
  flex-flow: row wrap;
  min-height: 25vh;
  padding: 0 30px 60px;
  align-items: center;
  justify-content: space-between;

  @media only screen and (max-width: 1440px) {
    padding: 0 70px 20px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding: 0 0 30px 0;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    min-height: 60vh;
    align-items: flex-start;
    margin-bottom: 10px;
  }
`;

const LeftSide = styled.div`
  margin-top: 30px;
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  max-width: 650px;

  @media only screen and (max-width: 1440px) {
    max-width: 600px;
  }

  @media only screen and (max-width: 1240px) {
    max-width: 580px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100%;
  }
`;

const RightSide = styled.div`
  margin-top: 30px;
  display: flex;
  height: auto;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  max-width: 680px;

  @media only screen and (max-width: 1475px) {
    width: 600px;
    height: auto;
  }

  @media only screen and (max-width: 1385px) {
    width: 500px;
    height: auto;
  }

  @media only screen and (max-width: 1200px) {
    padding-top: 20px;
    width: 460px;
    height: auto;
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    margin-top: 0;
    width: 100%;
    height: auto;
  }
`;

const HeroValuePropA = styled.div`
  color: var(--white);
  font-family: cera-bold;
  font-size: 56px;
  line-height: 60px;

  span {
    font-family: cera-bold;
    font-size: 56px;
    line-height: 60px;
    color: var(--purple-aux);
  }

  @media only screen and (max-width: 1240px) {
    margin-bottom: 4px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    span {
      font-size: 32px;
      line-height: 35px;
    }
    font-size: 32px;
    line-height: 35px;
  }
`;

const HeroValuePropB = styled.div`
  color: var(--purple-aux);
  font-family: cera-bold;
  font-size: 38px;

  @media only screen and (max-width: 1240px) {
    margin-bottom: 6px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    font-size: 22px;
  }
`;

export default React.memo(LanderMinimal);
