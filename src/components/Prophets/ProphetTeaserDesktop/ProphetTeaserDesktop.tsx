import { Animation, TurquoiseButton } from 'components/shared';
import { PROPHETS_MINTED } from 'config';
import { AnimationName } from 'components/shared/Animation/Animation';
import { ProphetFooter } from '../ProphetFooter';
import { Mixpanel } from 'Mixpanel';
import mouthSection from './mouth.svg';
import perksSection from './perks.png';

import useOnScreen from 'hooks/useOnScreen';

import { Link, useHistory } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import styled from 'styled-components';
import React, { useRef, useState, useEffect } from 'react';
import { Routes } from 'constants/Routes';

const TeaserSection = () => {
  const [player, setPlayer] = useState<Player | undefined>(undefined);

  const history = useHistory();
  const cRef = useRef(null);
  const visible = useOnScreen(cRef);

  const setRef = (ref) => {
    setPlayer(ref);
  };

  useEffect(() => {
    if (player) {
      if (visible) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [visible]);

  useEffect(() => {
    Mixpanel.track('prophets-lander', { mobile: false });
  }, []);

  return (
    <ContentWrapper ref={cRef}>
      <OverlayWrapper>
        <ContentColumn3 />
        <ContentColumn3>
          <TaglineContainer>
            <TaglineSmall>
              <i>The</i>
            </TaglineSmall>
            <TaglineMain>PROPHETS</TaglineMain>
            <TaglineSmall>are coming to Babylon</TaglineSmall>
          </TaglineContainer>
          <CenterBotContent>
            <DateContent>
              <DateHeader>Prophets Minted</DateHeader>
              <DateRow>
                <DateContainer>
                  <DateItem>
                    <DateItemCol>
                      <DateNum>{PROPHETS_MINTED}</DateNum>
                    </DateItemCol>
                  </DateItem>
                </DateContainer>
              </DateRow>
              <TurquoiseButton inverted onClick={() => history.push(`${Routes.prophetsGallery}?page=334`)}>
                View Gallery
              </TurquoiseButton>
              <DateLink to={{ pathname: Routes.privacy }} target="_blank">
                Privacy Policy
              </DateLink>
            </DateContent>
          </CenterBotContent>
        </ContentColumn3>
        <ContentColumn3 />
      </OverlayWrapper>
      <StyledAnimation name={AnimationName.teaserFull} autoplay={false} setRef={setRef} loop size={'100%'} />
    </ContentWrapper>
  );
};

const PerksSection = () => {
  return (
    <ContentWrapper>
      <OverlayWrapper>
        <ContentColumn3 />
        <ContentColumn3>
          <PerksSectionHeader>
            <ProphetTitle>PERKS</ProphetTitle>
            <ProphetSubHeader>Each Prophet offers unique perks on the Babylon protocol.</ProphetSubHeader>
          </PerksSectionHeader>
        </ContentColumn3>
        <ContentColumn3 />
      </OverlayWrapper>
      <img alt={'perks-section'} src={perksSection} width={'100%'} />
    </ContentWrapper>
  );
};

const DetailsSection = () => {
  const [player, setPlayer] = useState<any | undefined>(undefined);

  const history = useHistory();
  const cRef = useRef(null);
  const visible = useOnScreen(cRef);

  const setRef = (ref) => {
    setPlayer(ref);
  };

  useEffect(() => {
    if (player) {
      if (visible) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [visible]);

  return (
    <ContentWrapper ref={cRef}>
      <OverlayWrapper noPad>
        <ContentColumn3 />
        <ContentColumn3>
          <ProphetSectionHeader>
            <ProphetTitle>10,000 PROPHETS OF BABYLON</ProphetTitle>
            <ProphetSubHeader>There are two types of Prophets: Great Prophets and Common Prophets.</ProphetSubHeader>
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
                <b>Round 3:</b> Public access
              </p>
            </ProphetDetails>
            <StyledButtonProphets onClick={() => history.push('/prophets/gallery?page=334')}>
              Gallery
            </StyledButtonProphets>
          </CommonContainer>
        </ContentColumn3>
        <ContentColumn3 />
      </OverlayWrapper>
      <StyledAnimation name={AnimationName.prophetBg2} autoplay={false} setRef={setRef} loop size={'100%'} />
    </ContentWrapper>
  );
};

const MouthSection = () => {
  return (
    <UnderlayWrapper>
      <OverlayWrapper>
        <ContentColumn3 />
        <ContentColumn3>
          <MouthColContent>
            <MouthColBold>NO GAS WARS</MouthColBold>
            <MouthColSubtext>
              Babylon is about being a good citizen and sharing the wealth. <br /> Minting will be offered in phases to
              avoid gas wars and Great Prophets will be a gas free signature auction.
            </MouthColSubtext>
          </MouthColContent>
        </ContentColumn3>
        <ContentColumn3 />
      </OverlayWrapper>
      <img alt={'mouth-section'} src={mouthSection} width={'100%'} />
    </UnderlayWrapper>
  );
};

const ProphetTeaser = () => {
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

const UnderlayWrapper = styled(ContentWrapper)`
  margin-top: -18vw;
  z-index: -1;
`;

const OverlayWrapper = styled.div<{ noPad?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  top: 0;
  left: 0;
  position: absolute;
  padding-left: ${(p) => (p.noPad ? '0' : '20px')};
  width: 100%;
  height: 100%;
  z-index: 2;
`;

const DateContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

const TaglineContainer = styled.div`
  align-self: center;
  display: flex;
  flex-flow: column nowrap;
  position: absolute;
  padding-top: 15%;
`;

const TaglineSmall = styled.span`
  color: var(--yellow);
  font-size: 27px;
  font-size: 1.5vw;
  text-align: center;
`;

const TaglineMain = styled.span`
  color: var(--yellow);
  font-family: cera-bold;
  font-size: 66px;
  font-size: 4vw;
  text-align: center;
  letter-spacing: 0.1em;
`;

const DateContent = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
`;

const DateHeader = styled.span`
  font-family: cera-bold;
  font-size: 18px;
  font-size: 1.25vw;
`;

const DateLink = styled(Link)`
  padding-top: 25px;
  font-family: cera-regular;
  font-size: 18px;
  font-size: 1vw;
  color: var(--blue-03);
  text-decoration: underline;
  z-index: 2;

  &:hover {
    color: var(--turquoise-01);
    text-decoration: underline;
    opacity: 0.8;
  }

  a:active {
    text-decoration: underline;
  }

  a:visited {
    text-decoration: underline;
  }
`;

const DateRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: center;
  margin-bottom: 5px;
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
  font-size: 3vw;
  font-family: cera-black;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const StyledAnimation = styled(Animation)`
  position: absolute;
  height: 100%;
  overflow: hidden;
  width: 100%;
  top: 0;
  left: 0;
`;

const ContentColumn3 = styled.div`
  display: flex;
  flex-flow: column nowrap;
  height: 100vh;
  justify-content: flex-start;
  width: 33%;
  z-index: 2;
`;

const ProphetSectionHeader = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  padding-top: 20%;
`;

const PerksSectionHeader = styled(ProphetSectionHeader)`
  padding-top: 0;
`;

const ProphetTitle = styled.div`
  font-size: 30px;
  font-size: 2vw;
  letter-spacing: 4%;
  font-family: cera-black;
  padding-bottom: 14px;
  text-align: center;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const ProphetHeader = styled.div`
  font-family: cera-bold;
  font-size: 20px;
  font-size: 1.5vw;
  color: var(--yellow);
  text-align: center;
`;

const ProphetSubHeader = styled.div`
  width: 150%;
  text-align: center;
  align-self: center;
  font-size: 18px;
  font-size: 1.2vw;
`;

const ProphetContainer = styled.div`
  width: 100%;
  font-family: cera-medium;
  font-size: 18px;
  font-size: 1vw;
  padding-left: 20px;
  align-self: center;
  display: flex;
  flex-flow: column nowrap;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const ProphetDetails = styled.div`
  padding: 30px 0 0 8%;
  line-height: 0.6vw;
  font-size: 18px;
  font-size: 1vw;
  text-align: left;
  align-self: center;
  width: 50%;
`;

const DateP = styled.p`
  padding-top: 3%;
  font-family: cera-bold;
`;

const GreatContainer = styled(ProphetContainer)`
  padding-top: 32%;
`;

const CommonContainer = styled(ProphetContainer)`
  padding-top: 35%;
`;

const StyledButtonProphets = styled(TurquoiseButton)`
  width: 33%;
  align-self: center;
  margin-top: 30px;
`;

const ColContent = styled.div`
  width: 100%;
  font-family: cera-medium;
  font-size: 18px;
  font-size: 1vw;
  text-align: center;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const CenterBotContent = styled(ColContent)`
  padding-top: 130%;
`;

const MouthColContent = styled.div`
  width: 100%;
  padding-top: 175%;
  display: flex;
  flex-flow: column nowrap;
`;

const MouthColBold = styled.div`
  width: 100%;
  color: var(--yellow);
  font-family: cera-bold;
  font-size: 20px;
  font-size: 1.3vw;
  text-align: center;
`;

const MouthColSubtext = styled.div`
  width: 100%;
  font-family: cera-regular;
  font-size: 18px;
  font-size: 1vw;
  text-align: center;
`;

export default React.memo(ProphetTeaser);
