import CreatorPieImg from '../img/CreatorPie.svg';
import CreatorLiftImg from '../img/CreatorLift.svg';
import NftCreationImg from '../img/NftCreation.svg';

import { RoutesExternal } from 'constants/Routes';
import { BREAKPOINTS } from 'config';

import { Link } from 'react-router-dom';
import styled from 'styled-components';
import React from 'react';

const DetailBlocks = () => {
  return (
    <DetailsContainer>
      <BlockWrapper>
        <RowBlock>
          <ImgWrapper>
            <StyledImg alt={'club-img'} src={CreatorPieImg} width={'90%'} />
          </ImgWrapper>
        </RowBlock>
        <RowBlock>
          <BlockContent>
            <Justified>
              <BlockTitle>
                Grow the pie, <br />
                earn rewards 🙌
              </BlockTitle>
              <BlockBody>
                We believe in the power of a "smaller slice of a bigger pie." By helping others find alpha, strategists
                earn rewards along with a fully customizable split of profits. Gardens can be designed to best fit your
                club.
              </BlockBody>
              <Link to={{ pathname: RoutesExternal.babylonOrigin }} target={'_blank'}>
                <DetailsLink>
                  <LinkContent>Learn about Babylon's origin story</LinkContent>
                </DetailsLink>
              </Link>
            </Justified>
          </BlockContent>
        </RowBlock>
      </BlockWrapper>
      <BlockWrapper invert>
        <RowBlock>
          <BlockContent>
            <BlockTitle>
              Gardens are ERC-20
              <br />
              compatible tokens
            </BlockTitle>
            <BlockBody>
              <span>Members receive garden tokens as shares upon depositing.</span>
              <ul>
                <li>Garden tokens are priced in real time</li>
                <li>Tokens are fully transferrable in the ERC-20 standard</li>
                <li>When a member withdraws, they burn their tokens in exchange for their share of the Garden</li>
              </ul>
            </BlockBody>
            <Link to={{ pathname: RoutesExternal.gardenExplainer }} target={'_blank'}>
              <DetailsLink>
                <LinkContent>Learn more about Gardens</LinkContent>
              </DetailsLink>
            </Link>
          </BlockContent>
        </RowBlock>
        <RowBlock>
          <ImgWrapper>
            <StyledImg alt={'club-img'} src={CreatorLiftImg} width={'80%'} />
          </ImgWrapper>
        </RowBlock>
      </BlockWrapper>
      <BlockWrapper>
        <RowBlock>
          <ImgWrapper>
            <StyledImg alt={'nft-creation-img'} src={NftCreationImg} width={'90%'} />
          </ImgWrapper>
        </RowBlock>
        <RowBlock>
          <BlockContent>
            <Justified>
              <BlockTitle>
                Assign a custom NFT
                <br />
                for Garden members
              </BlockTitle>
              <BlockBody>
                Upload your artwork, set the membership thresholds, and enable new members to mint a custom NFT without
                ever writing a line of code. Babylon Gardens offer creators a unique membership incentive that can be
                customized to fit your Garden.
              </BlockBody>
            </Justified>
          </BlockContent>
        </RowBlock>
      </BlockWrapper>
    </DetailsContainer>
  );
};

const ImgWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    justify-content: center;
    padding-top: 20px;
  }
`;

const StyledImg = styled.img`
  z-index: 2;
  width: 90%;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100%;
  }
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
  padding: 0 0 8px 0;
  height: 50px;
`;

const DetailsContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  padding: 60px 0 150px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 30px 0 60px;
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
    margin-top: 10px;
  }
`;

const BlockBody = styled.div`
  margin-top: 20px;
  font-size: 18px;
  line-height: 25px;

  > ul {
    margin-top: 10px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 16px;
    line-height: 22px;
  }
`;

const Justified = styled.div`
  padding-left: 30px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
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
    padding: 0;
    ${(p) => (p.invert ? 'flex-direction: column-reverse' : '')};

    &:first-child {
      padding-bottom: 30px;
    }
  }
`;

export default React.memo(DetailBlocks);
