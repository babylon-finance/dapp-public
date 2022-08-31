import { Icon, TurquoiseButton } from 'components/shared';

import { IconName } from 'models';
import { RoutesExternal } from 'constants/Routes';
import { BREAKPOINTS } from 'config';

import styled from 'styled-components';
import React from 'react';

const FeaturesBlock = () => {
  return (
    <BlockWrapper>
      <BlockTitle>A powerful suite of investment tools</BlockTitle>
      <BlockContentRow>
        <ContentItem>
          <StyledImgWrapper>
            <Icon name={IconName.nocode} size={108} />
          </StyledImgWrapper>
          <ContentItemTitle>No-code strategies</ContentItemTitle>
          <ContentItemBody>
            Through Babylon's Strategy builder, you can build and deploy powerful smart contracts in a matter of
            minutes.
          </ContentItemBody>
        </ContentItem>
        <ContentItem>
          <StyledImgWrapper>
            <Icon name={IconName.controls} size={108} />
          </StyledImgWrapper>
          <ContentItemTitle>Flexible controls</ContentItemTitle>
          <ContentItemBody>
            Define and manage all aspects of your strategy. Babylon enables detailed control of each investment;
            slippage tolerance, max gas fees, capital allocation limits, and more.
          </ContentItemBody>
        </ContentItem>
        <ContentItem>
          <StyledImgWrapper>
            <Icon name={IconName.management} size={108} />
          </StyledImgWrapper>
          <ContentItemTitle>Actively managed, pain free</ContentItemTitle>
          <ContentItemBody>
            Rapidly adjust to changing market conditions. Whether a bear or bull market, Gardens can easily adapt a
            portfolio to account for changes in the market.
          </ContentItemBody>
        </ContentItem>
        <ContentItem>
          <StyledImgWrapper>
            <Icon name={IconName.dialogue} size={108} />
          </StyledImgWrapper>
          <ContentItemTitle>Community Chat</ContentItemTitle>
          <ContentItemBody>
            Tightly integrated chat features allow members to quickly and easily organize to discuss strategies. Parsiq
            event notifications provide timely event information.
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
  margin-top: 100px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    margin-top: 50px;
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
