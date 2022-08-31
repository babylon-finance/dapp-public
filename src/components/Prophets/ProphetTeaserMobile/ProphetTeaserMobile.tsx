import { Animation, TurquoiseButton } from 'components/shared';
import { AnimationName } from 'components/shared/Animation/Animation';
import { ProphetFooter } from '../ProphetFooter';
import { PROPHETS_MINTED } from 'config';
import mouthSection from './mouth.svg';
import perksSection from './perks.png';
import { Mixpanel } from 'Mixpanel';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import React, { useEffect } from 'react';

const DetailsSection = () => {
  const history = useHistory();

  return (
    <ContentWrapper>
      <OverlayWrapper>
        <SectionHeader>
          <ProphetSectionHeader>
            <SectionTitle>10,000 PROPHETS OF BABYLON</SectionTitle>
            <SectionSubHeader>There are two types of Prophets: Great Prophets and Common Prophets.</SectionSubHeader>
          </ProphetSectionHeader>
          <GreatContainer>
            <ProphetHeader>GREAT PROPHETS</ProphetHeader>
            <ProphetDetails>
              <p>
                <b>Supply:</b> 1,000
              </p>
              <p>
                <b>Format:</b> Auction
              </p>
              <p>
                <b>Minimum Bid:</b> 0.35Ξ
              </p>
              <p>
                <b>Rewards:</b> 10 - 1,000
              </p>
              <DateP>Nov. 15th - Nov. 19th</DateP>
            </ProphetDetails>
          </GreatContainer>
          <CommonContainer>
            <ProphetHeader>PROPHETS</ProphetHeader>
            <ProphetDetails>
              <p>
                <b>Supply:</b> Up to 8,000
              </p>
              <p>
                <b>Format:</b> Fixed 0.25Ξ
              </p>
              <p>
                <b>Rewards:</b> 5 BABL
              </p>
              <p>
                <b>No Limits</b>
              </p>
              <br />
              <p>
                <b>Round 1:</b> Beta users
              </p>
              <p>
                <b>Round 2:</b> Prophet waitlist
              </p>
              <p>
                <b>Round 3:</b> Public Access
              </p>
            </ProphetDetails>
            <StyledButtonProphets onClick={() => history.push('/prophets/gallery?page=334')}>
              View Gallery
            </StyledButtonProphets>
          </CommonContainer>
        </SectionHeader>
      </OverlayWrapper>
      <StyledAnimation name={AnimationName.prophetBg2Mobile} loop size={'100%'} />
    </ContentWrapper>
  );
};

const MouthSection = () => {
  return (
    <UnderlayWrapper>
      <OverlayWrapper>
        <MouthColContent>
          <MouthColBold>NO GAS WARS</MouthColBold>
          <MouthColSubtext>
            Babylon is about being a good citizen and sharing the wealth. <br />
            <br /> Minting will be offered in phases to avoid gas wars and Great Prophets will be a gas free signature
            auction.
          </MouthColSubtext>
        </MouthColContent>
      </OverlayWrapper>
      <img alt={'mouth-section'} src={mouthSection} width={'100%'} />
    </UnderlayWrapper>
  );
};

const PerksSection = () => {
  return (
    <ContentWrapper>
      <OverlayWrapper>
        <SectionHeader>
          <SectionTitle>PERKS</SectionTitle>
          <PerksSubHeader>Each Prophet offers unique perks on the Babylon protocol.</PerksSubHeader>
        </SectionHeader>
      </OverlayWrapper>
      <img alt={'perks-section'} src={perksSection} width={'100%'} />
    </ContentWrapper>
  );
};

const TeaserSection = () => {
  const history = useHistory();

  useEffect(() => {
    Mixpanel.track('prophets-lander', { mobile: true });
  }, []);

  return (
    <ContentWrapper>
      <OverlayWrapper>
        <TaglineContainer>
          <TaglineSmall>
            <i>The</i>
          </TaglineSmall>
          <TaglineMain>PROPHETS</TaglineMain>
          <TaglineSmall>are coming to Babylon</TaglineSmall>
        </TaglineContainer>
        <DateContainer>
          <DateHeader>Minted</DateHeader>
          <DateRow>
            <DateWrapper>
              <DateItem>
                <DateItemCol>
                  <DateNum>{PROPHETS_MINTED}</DateNum>
                </DateItemCol>
              </DateItem>
            </DateWrapper>
          </DateRow>
          <StyledButton onClick={() => history.push('/prophets/gallery')}>View Gallery</StyledButton>
          <CalendarLink to={{ pathname: '/privacy' }} target="_blank">
            Privacy Policy
          </CalendarLink>
        </DateContainer>
        <DiscordContainer>
          <DiscordText>The Prophets are Coming to Babylon</DiscordText>
        </DiscordContainer>
        <MediumContainer>
          <MediumLink
            to={{ pathname: 'https://medium.com/babylon-finance/the-prophets-of-babylon-nfts-4dea318dc729' }}
            target="_blank"
          >
            Read about The Prophets NFTs on Medium
          </MediumLink>
        </MediumContainer>
      </OverlayWrapper>
      <StyledAnimation name={AnimationName.teaserMobile} loop size={'100%'} />
    </ContentWrapper>
  );
};

const ProphetTeaserMobile = () => {
  return (
    <PageContainer>
      <MainWrapper>
        <TeaserSection />
        <PerksSection />
        <DetailsSection />
        <MouthSection />
        <ProphetFooter />
      </MainWrapper>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: rgb(15, 10, 69);
`;

const MainWrapper = styled.div`
  width: 100vw;
  height: 100%;
`;

const ContentWrapper = styled.div`
  position: relative;
  overflow: hidden;
  margin-bottom: -6px;
  z-index: 2;
`;

const OverlayWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  top: 0;
  left: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
`;

const UnderlayWrapper = styled(ContentWrapper)`
  margin-top: -67%;
  z-index: -1;
`;

const TaglineContainer = styled.div`
  align-self: top;
  display: flex;
  flex-flow: column nowrap;
  position: absolute;
  padding-top: 45%;
`;

const DateContainer = styled.div`
  position: absolute;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  padding-top: 115%;
`;

const MediumContainer = styled.div`
  position: absolute;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  padding-top: 220%;
`;

const DiscordContainer = styled.div`
  position: absolute;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  padding-top: 170%;
`;

const DiscordText = styled.span`
  font-family: cera-medium;
  text-align: center;
  max-width: 65%;
  font-size: 16px;
  font-size: 4vw;
`;

const DateWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

const TaglineSmall = styled.span`
  color: var(--yellow);
  font-size: 16px;
  font-size: 4vw;
  text-align: center;
`;

const TaglineMain = styled.span`
  color: var(--yellow);
  font-family: cera-bold;
  font-size: 32px;
  font-size: 8.5vw;
  text-align: center;
  letter-spacing: 0.15em;
`;

const DateHeader = styled.span`
  font-family: cera-bold;
  font-size: 18px;
  font-size: 4vw;
`;

const DateRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: center;
`;

const DateItem = styled.div`
  display: flex;
  flex-flow: row nowrap;
  height: 100%;
`;

const DateItemCol = styled.div`
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
`;

const DateNum = styled.span`
  font-size: 58px;
  font-size: 8vw;
  font-family: cera-black;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const DateSpacer = styled(DateNum)`
  padding: 0 4px;
`;

const Ordinal = styled.div`
  display: flex;
  flex-flow: column nowrap;
  font-family: cera-bold;
  font-size: 16px;
  font-size: 3vw;
  height: 100%;
  justify-content: flex-start;
  padding-top: 6px;
`;

const CalendarLink = styled(Link)`
  font-family: cera-medium;
  font-size: 18px;
  font-size: 3.5vw;
  color: var(--blue-03);
  text-decoration: underline;
  z-index: 2;
  margin-top: 5px;

  a:active {
    text-decoration: underline;
  }

  a:visited {
    text-decoration: underline;
  }
`;

const MediumLink = styled(Link)`
  font-family: cera-medium;
  font-size: 18px;
  font-size: 3.5vw;
  text-decoration: underline;
  color: var(--white);
  z-index: 2;

  a:active {
    text-decoration: underline;
  }

  a:visited {
    text-decoration: underline;
  }
}
`;

const StyledButton = styled(TurquoiseButton)`
  height: 30px;
  z-index: 3;
`;

const StyledAnimation = styled(Animation)`
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
`;

const SectionHeader = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
`;

const MouthColContent = styled.div`
  width: 100%;
  padding-top: 165%;
  display: flex;
  flex-flow: column nowrap;
`;

const MouthColBold = styled.div`
  width: 100%;
  color: var(--yellow);
  font-family: cera-bold;
  font-size: 18px;
  font-size: 5vw;
  text-align: center;
`;

const MouthColSubtext = styled.div`
  width: 100%;
  font-family: cera-regular;
  font-size: 16px;
  font-size: 4.5vw;
  text-align: center;
  padding: 0 8px;
`;

const SectionTitle = styled.div`
  font-size: 22px;
  font-size: 6vw;
  letter-spacing: 4%;
  font-family: cera-black;
  padding-bottom: 8px;
  text-align: center;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const SectionSubHeader = styled.div`
  width: 100%;
  text-align: center;
  align-self: center;
  font-size: 16px;
  font-size: 4.5vw;
`;

const PerksSubHeader = styled(SectionSubHeader)`
  padding-top: 75px;
  width: 75%;
`;

const ProphetContainer = styled.div`
  width: 100%;
  text-align: center;
  align-self: center;
  display: flex;
  flex-flow: column nowrap;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const GreatContainer = styled(ProphetContainer)`
  padding-top: 52%;
`;

const CommonContainer = styled(ProphetContainer)`
  padding-top: 25%;
`;

const ProphetSectionHeader = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  padding: 20% 20px 0;
`;

const ProphetHeader = styled.div`
  font-family: cera-bold;
  font-size: 18px;
  font-size: 5vw;
  color: var(--yellow);
`;

const ProphetDetails = styled.div`
  padding: 25px 0 0 27%;
  width: 100%;
  line-height: 7px;
  font-size: 16px;
  font-size: 4.5vw;
  text-align: left;
  align-self: center;
`;

const DateP = styled.p`
  padding-top: 6px;
  font-family: cera-bold;
`;

const StyledButtonProphets = styled(TurquoiseButton)`
  margin-top: 10px;
  height: 30px;
  width: 40%;
  align-self: center;
  z-index: 3;
`;

export default React.memo(ProphetTeaserMobile);
