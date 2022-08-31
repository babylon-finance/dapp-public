import { Icon, TurquoiseButton } from 'components/shared';

import { IconName } from 'models';
import { Routes, RoutesExternal } from 'constants/Routes';
import { BREAKPOINTS } from 'config';

import { Link } from 'react-router-dom';
import { useHistory } from 'react-router';
import styled from 'styled-components';
import React from 'react';

const HeartBlock = () => {
  const history = useHistory();
  return (
    <BlockContainer>
      <BlockContent>
        <BlockTitle>The Heart of Babylon</BlockTitle>
        <BlockBody>
          <Subheading>
            Stake your BABL to earn APR, direct protocol flows, and perform gasless governance voting.
          </Subheading>
          <BlockSection>
            Welcome to DeFi 3.0.{' '}
            <Em>
              The Heart includes 10 + 1 different token mechanics inspired by the very best of DeFi and synthesized
              together
            </Em>{' '}
            to provide value to BABL holders and Babylon users alike.
          </BlockSection>
          <CtaSection>
            <StyledButton inverted onClick={() => history.push(Routes.heart)}>
              <ButtonLabel>
                <ButtonIconWrapper>
                  <Icon name={IconName.heartFull} />
                </ButtonIconWrapper>
                <LabelSpan>Stake your BABL</LabelSpan>
              </ButtonLabel>
            </StyledButton>
            <Link to={{ pathname: RoutesExternal.heartPost }} target={'_blank'}>
              <DetailsLink>Read more about the Heart</DetailsLink>
            </Link>
          </CtaSection>
        </BlockBody>
      </BlockContent>
    </BlockContainer>
  );
};

const StyledButton = styled(TurquoiseButton)`
  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    display: none;
  }
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
  padding-left: 20px;

  &:hover {
    cursor: pointer;
    opacity: 0.7;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 15px;
    padding-left: 0;
  }
`;

const CtaSection = styled.div`
  padding-top: 50px;
  display: flex;
  flex-flow: row wrap;
  align-items: center;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding-top: 12px;
  }
`;

const Em = styled.span`
  color: var(--yellow);
  font-family: cera-bold;
`;

const BlockSection = styled.div`
  padding-top: 30px;
  font-size: 18px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding-top: 20px;
    font-size: 16px;
  }
`;

const Subheading = styled.div`
  padding-top: 16px;
  font-size: 24px;
  font-family: cera-medium;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding-top: 10px;
    font-size: 20px;
    line-height: 24px;
  }
`;

const BlockBody = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
`;

const BlockTitle = styled.div`
  font-size: 44px;
  font-family: cera-bold;
  line-height: 46px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 36px;
    line-height: 38px;
  }
`;

const BlockContainer = styled.div`
  height: 880px;
  width: 100%;
  background-image: url('/scaled/heart_gradient.png');
  background-repeat: no-repeat;
  background-size: 55%;
  background-position: center right;
  padding: 0 30px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding: 0;
    height: auto;
    background-size: contain;
    background-position: right 60%;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    background-image: none;
  }
`;

const BlockContent = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding: 50px 0;
  width: 40%;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 50%;
    justify-content: flex-start;
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100%;
  }
`;

export default React.memo(HeartBlock);
