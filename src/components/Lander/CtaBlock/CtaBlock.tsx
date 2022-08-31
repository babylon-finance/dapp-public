import { TurquoiseButton } from 'components/shared';

import { Routes } from 'constants/Routes';
import { BREAKPOINTS } from 'config';

import { useHistory } from 'react-router';
import styled from 'styled-components';
import React from 'react';

const CtaBlock = () => {
  const history = useHistory();
  return (
    <BlockContainer>
      <InternalContainer>
        <BlockItem>
          <MainContentA>
            <BlockTextA>Join a DeFi investment club and build wealth together.</BlockTextA>
            <ButtonWrapper>
              <TurquoiseButton onClick={() => history.push(Routes.explore)}>Explore Gardens</TurquoiseButton>
            </ButtonWrapper>
          </MainContentA>
        </BlockItem>
        <BlockItem>
          <MainContentB>
            <BlockTextB>Take the lead and help others create wealth through DeFi.</BlockTextB>
            <ButtonWrapper>
              <TurquoiseButton inverted onClick={() => history.push(Routes.creatorLander)}>
                Become a Creator
              </TurquoiseButton>
            </ButtonWrapper>
          </MainContentB>
        </BlockItem>
      </InternalContainer>
    </BlockContainer>
  );
};

const BlockContainer = styled.div`
  width: 100%;
  height: 550px;
  display: flex;
  flex-flow: row nowrap;
  background: linear-gradient(90deg, var(--purple-07) 50%, var(--purple-01) 50%);
  justify-content: center;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    height: auto;
    background: transparent;
    justify-content: flex-start;
    background: linear-gradient(180deg, var(--purple-07) 50%, var(--purple-01) 50%);
  }
`;

const InternalContainer = styled.div`
  max-width: var(--screen-lg-min);
  display: flex;
  flex-flow: row wrap;
  padding: 0 30px;
  height: 100%;
`;

const ButtonWrapper = styled.div`
  height: 100%;
  width: 160px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-end;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100%;
    padding-top: 50px;
  }
`;

const BlockItem = styled.div`
  width: 50%;
  height: 100%;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100%;
  }
`;

const BlockContent = styled.div`
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  padding: 80px 0;
  width: 100%;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding: 60px 0;
  }
`;

const BlockTextA = styled.span`
  font-family: cera-bold;
  font-size: 44px;
  line-height: 53px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    font-size: 28px;
    line-height: 30px;
  }
`;

const BlockTextB = styled.span`
  font-family: cera-regular;
  font-size: 44px;
  line-height: 53px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    font-size: 28px;
    line-height: 30px;
    font-family: cera-medium;
  }
`;

const MainContentA = styled(BlockContent)`
  padding-right: 124px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding-right: 0;
  }
`;

const MainContentB = styled(BlockContent)`
  padding-left: 80px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding-left: 0;
  }
`;

export default React.memo(CtaBlock);
