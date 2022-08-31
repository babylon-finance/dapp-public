import { AuditsBlock } from './AuditsBlock';
import { CreatorFeaturesBlock } from './CreatorFeaturesBlock';
import { DaoDetailBlocks } from './DaoDetailBlocks';
import { TeamMembers } from './TeamMembers';
import { TurquoiseButton } from 'components/shared';

import { BREAKPOINTS } from 'config';

import styled from 'styled-components';
import React from 'react';

const HERO_GRADIENT = 'linear-gradient(267.84deg, var(--yellow) 0.63%, rgba(35, 29, 101, 0) 79.51%)';

const DaoLander = () => {
  return (
    <FullWidthContainer>
      <RailContainer bg={HERO_GRADIENT}>
        <HeroContainer>
          <HeroContentContainer>
            <HeroTitle>Supercharge your token mechanics and invest your treasury assets</HeroTitle>
            <StyledContactButton
              onClick={() => window.open('https://m5jat2r3r6s.typeform.com/to/FVDCBcpz', '_blank', 'noopener')}
            >
              Contact us to get started
            </StyledContactButton>
          </HeroContentContainer>
          <HeroImageContainer>
            <StyledHeroImg alt={'dao-hero-img'} src={'/DaoHero.svg'} />
          </HeroImageContainer>
        </HeroContainer>
      </RailContainer>
      <RailContainer>
        <DaoDetailBlocks />
      </RailContainer>
      <RailContainer bg={'var(--blue-alt)'}>
        <CreatorFeaturesBlock />
      </RailContainer>
      <RailContainer bg={'var(--blue-alt)'}>
        <TeamMembers />
      </RailContainer>
      <RailContainer bg={'var(--blue-alt)'}>
        <AuditsBlock />
      </RailContainer>
      <BlockContainer>
        <InternalContainer>
          <BlockTextCTA>
            Manage your treasury and supercharge your token mechanics through a Babylon Garden
          </BlockTextCTA>
          <ButtonWrapper>
            <StyledContactButton
              onClick={() => window.open('https://m5jat2r3r6s.typeform.com/to/FVDCBcpz', '_blank', 'noopener')}
            >
              Contact us to get started
            </StyledContactButton>
          </ButtonWrapper>
        </InternalContainer>
      </BlockContainer>
    </FullWidthContainer>
  );
};

const BlockContainer = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  background: var(--purple-07);
`;

const InternalContainer = styled.div`
  max-width: var(--screen-lg-min);
  padding: 30px 0;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  height: 100%;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding: 30px 30px;
  }
`;

const ButtonWrapper = styled.div`
  width: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-end;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100%;
    padding-top: 50px;
  }
`;

const BlockTextCTA = styled.span`
  font-family: cera-medium;
  font-size: 28px;
  margin-bottom: 20px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    font-size: 22px;
  }
`;

const StyledContactButton = styled(TurquoiseButton)`
  margin-top: 20px;
  width: auto;
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
    margin-bottom: 40px;
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

export default React.memo(DaoLander);
