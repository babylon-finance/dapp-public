import AutoCompoundImg from '../img/Autocompound.svg';
import ComposableImg from '../img/Composable.svg';
import SharedFeesImg from '../img/SharedFees.svg';
import TrustlessImg from '../img/Trustless.svg';
import { Icon, TurquoiseButton } from 'components/shared';

import { IconName } from 'models';
import { RoutesExternal } from 'constants/Routes';
import { BREAKPOINTS } from 'config';

import styled from 'styled-components';
import React from 'react';

const FeaturesBlock = () => {
  return (
    <BlockWrapper>
      <BlockTitle>Investment clubs for the crypto-native.</BlockTitle>
      <BlockContentRow>
        <ContentItem>
          <StyledImgWrapper>
            <StyledImg alt={'shared-fees-img'} src={SharedFeesImg} />
          </StyledImgWrapper>
          <ContentItemTitle>Shared transaction fees</ContentItemTitle>
          <ContentItemBody>
            It's no secret fees and gas costs can quickly eat into profits. Split investment costs across all members of
            a Garden and receive a higher profit margin.
          </ContentItemBody>
        </ContentItem>
        <ContentItem>
          <StyledImgWrapper>
            <StyledImg alt={'composability-img'} src={ComposableImg} />
          </StyledImgWrapper>
          <ContentItemTitle>DeFi Village</ContentItemTitle>
          <ContentItemBody>
            It takes a village to stay up to date with all that's happening in DeFi. It's 24/7 and it's literally
            impossible for a single individual to keep up. Share the load with your garden.
          </ContentItemBody>
        </ContentItem>
        <ContentItem>
          <StyledImgWrapper>
            <StyledImg alt={'trustless-img'} src={TrustlessImg} />
          </StyledImgWrapper>
          <ContentItemTitle>Trustless & non-custodial</ContentItemTitle>
          <ContentItemBody>
            No single point of control. Deposit or withdraw capital at any time.* Garden's are trustless smart contracts
            and only you have access to your funds.
          </ContentItemBody>
        </ContentItem>
        <ContentItem>
          <StyledImgWrapper>
            <StyledImg alt={'auto-compounding-img'} src={AutoCompoundImg} />
          </StyledImgWrapper>
          <ContentItemTitle>Autocompounded profits</ContentItemTitle>
          <ContentItemBody>
            No need to manually claim and rebalance profits. Gardens autocompound investment profits across new and
            existing strategies to maintain maximum capital efficiency.
          </ContentItemBody>
        </ContentItem>
      </BlockContentRow>
      <DocsLinkWrapper>
        <StyledButton inverted onClick={() => window.open(RoutesExternal.docs, '_blank', 'noopener')}>
          <ButtonLabel>
            <ButtonIconWrapper>
              <Icon name={IconName.book} />
            </ButtonIconWrapper>
            <LabelSpan>Read the docs</LabelSpan>
          </ButtonLabel>
        </StyledButton>
      </DocsLinkWrapper>
    </BlockWrapper>
  );
};

export default React.memo(FeaturesBlock);

const StyledImg = styled.img`
  width: 100px;
  height: 100px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 80px;
    height: 80px;
  }
`;

const StyledButton = styled(TurquoiseButton)`
  width: 100%;
`;

const ButtonIconWrapper = styled.div`
  padding-right: 6px;
`;

const ButtonLabel = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

const LabelSpan = styled.span`
  padding-top: 4px;
`;

const DocsLinkWrapper = styled.div`
  padding: 60px 0 70px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 0;
    width: 100%;
  }
`;

const StyledImgWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: flex-start;
  padding-bottom: 20px;
`;

const BlockTitle = styled.div`
  font-size: 38px;
  font-family: cera-bold;
  text-align: center;
  height: 50px;
  margin-top: 200px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    margin-top: 100px;
    font-size: 28px;
  }
`;

const BlockContentRow = styled.div`
  margin-top: 60px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
  padding: 20px 0;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    flex-flow: row wrap;
    margin-top: 40px;
  }
`;

const ContentItem = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  text-align: left;
  width: 20%;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100%;
    padding-bottom: 30px;
  }
`;

const ContentItemTitle = styled.div`
  width: 100%;
  font-family: cera-bold;
  font-size: 18px;
  padding-bottom: 6px;
`;

const ContentItemBody = styled.div`
  width: 100%;
  font-family: cera-regular;
  font-size: 18px;
`;

const BlockWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
  padding: 0 30px;

  @media only screen and (max-width: 1240px) {
    padding: 0 30px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding: 20px 0px 60px;
  }
`;
