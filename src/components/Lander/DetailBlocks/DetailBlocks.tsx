import ClubImage from '../img/Club.svg';
import GardenImage from '../img/Garden.svg';
import StackImage from '../img/Stack.svg';
import WidgetImage from '../img/WidgetBox.svg';
import { Icon } from 'components/shared';

import { IconName } from 'models';
import { RoutesExternal } from 'constants/Routes';
import { BREAKPOINTS } from 'config';
import { Routes } from 'constants/Routes';

import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import React from 'react';

const DetailBlocks = () => {
  const history = useHistory();
  return (
    <DetailsContainer>
      <BlockWrapper>
        <RowBlock>
          <ImgWrapper>
            <StyledImg alt={'club-img'} src={ClubImage} width={'90%'} />
          </ImgWrapper>
        </RowBlock>
        <RowBlock>
          <BlockContent>
            <Justified>
              <BlockTitle>
                Split the fees,
                <br />
                share the wealth 💰
              </BlockTitle>
              <BlockBody>
                Babylon started from a desire to share crypto investment opportunities with people that don’t have the
                time to get started. By joining a community, you can crowdsource information, split the gas costs and
                build wealth together.
              </BlockBody>
              <Link to={{ pathname: RoutesExternal.babylonOrigin }} target={'_blank'}>
                <DetailsLink>
                  <Icon name={IconName.video} size={28} />
                  <LinkContent>Learn more about our origin story</LinkContent>
                </DetailsLink>
              </Link>
            </Justified>
          </BlockContent>
        </RowBlock>
      </BlockWrapper>
      <BlockWrapper invert>
        <RowBlock>
          <BlockContent>
            <Justified>
              <BlockTitle>
                Minimize taxable <br />
                events ✨
              </BlockTitle>
              <BlockBody>
                Gardens can execute hundreds of DeFi operations searching for returns. In certain jurisdictions, Garden
                members are able to consolidate all of these taxable events into just two transactions; deposit and
                withdrawal.
              </BlockBody>
              <SubBody>
                Disclaimer: Babylon Finance does not provide tax or legal advice. Consult with your tax professional
                about your personal tax implications of using Babylon to manage investments.
              </SubBody>
            </Justified>
          </BlockContent>
        </RowBlock>
        <RowBlock>
          <ImgWrapper>
            <StyledImg alt={'widget-img'} src={WidgetImage} width={'90%'} />
          </ImgWrapper>
        </RowBlock>
      </BlockWrapper>
      <BlockWrapper>
        <RowBlock>
          <ImgWrapper>
            <StyledImg alt={'garden-img'} src={GardenImage} />
          </ImgWrapper>
        </RowBlock>
        <RowBlock>
          <BlockContent>
            <BlockTitle>
              Investment clubs
              <br />
              meet DeFi 👋
            </BlockTitle>
            <BlockBody>
              Gardens are super-charged investment clubs that have all the power and composability of DeFi baked in. Our
              micro-governance model enables you to deposit, propose and contribute to the selection of investment
              strategies. All with the trustless benefits of the Ethereum blockchain.
            </BlockBody>
            <Link to={{ pathname: RoutesExternal.gardenExplainer }} target={'_blank'}>
              <DetailsLink>
                <Icon name={IconName.video} size={28} />
                <LinkContent>Watch Video</LinkContent>
              </DetailsLink>
            </Link>
          </BlockContent>
        </RowBlock>
        <CreatorCTA onClick={() => history.push(Routes.creatorLander)}>
          <CreatorIconWrapper>
            <StyledImg alt={'stack-img'} src={StackImage} />
          </CreatorIconWrapper>
          <CreatorContent>
            <CreatorTitle>Interested in starting a Garden?</CreatorTitle>
            <CreatorSub>Learn more</CreatorSub>
          </CreatorContent>
        </CreatorCTA>
      </BlockWrapper>
    </DetailsContainer>
  );
};

const SubBody = styled.div`
  padding-top: 30px;
  max-width: 500px;
  color: var(--blue-03);
  font-size: 12px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding-top: 10px;
  }
`;

const ImgWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    justify-content: center;
    padding: 20px 0;
  }
`;

const StyledImg = styled.img`
  z-index: 2;
  width: 90%;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100%;
  }
`;

const CreatorCTA = styled.div`
  width: 100%;
  background: linear-gradient(180deg, rgba(22, 14, 107, 0) -53.38%, #160e6b 100%);
  height: 150px;
  top: -20px;
  position: relative;
  padding: 30px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;

  &:hover {
    cursor: pointer;
    opacity: 0.7;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    margin-top: 20px;
    padding: 10px;
    height: auto;
  }
`;

const CreatorContent = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
`;

const CreatorTitle = styled.span`
  font-size: 24px;
  font-family: cera-medium;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

const CreatorSub = styled.div`
  font-size: 18px;
  font-family: cera-medium;
  color: var(--purple-aux);
  text-decoration: underline;
  text-underline-offset: 2px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

const CreatorIconWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
`;

const DetailsLink = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: 18px;
  font-family: cera-medium;
  color: var(--purple-aux);
  text-decoration: underline;
  text-underline-offset: 4px;

  &:hover {
    cursor: pointer;
    opacity: 0.7;
  }
  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 15px;
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

const DetailsContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  padding: 60px 0 150px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 0 0 60px;
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
    &:first-child {
      margin-top: 20px;
    }
  }
`;

const BlockContent = styled.div`
  max-width: 500px;
`;

const BlockTitle = styled.div`
  font-size: 44px;
  font-family: cera-bold;
  line-height: 46px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 24px;
    line-height: 28px;
  }
`;

const BlockBody = styled.div`
  margin-top: 20px;
  font-size: 18px;
  line-height: 25px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 16px;
    line-height: 22px;
  }
`;

const Justified = styled.div`
  padding-left: 30px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding-left: 0;
  }
`;

const BlockWrapper = styled.div<{ invert?: boolean }>`
  display: flex;
  flex-flow: row wrap;
  height: auto;
  width: 100%;
  justify-content: space-around;
  align-items: center;
  padding: 100px 30px 0;
  align-items: center;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    ${(p) => (p.invert ? 'flex-direction: column-reverse' : '')};
    padding: 0;
  }
`;

export default React.memo(DetailBlocks);
