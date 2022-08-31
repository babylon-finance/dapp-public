import DaoHandImg from '../img/DaoHand.svg';
import StakingRocketImg from '../img/StakingRocket.svg';
import IndexImg from '../img/IndexBuilder.svg';
import { BablTokenIcon } from 'components/shared/Icons/BablTokenIcon';
import { BREAKPOINTS } from 'config';

import styled from 'styled-components';
import React from 'react';

const DetailBlocks = () => {
  return (
    <DetailsContainer>
      <BlockWrapper>
        <RowBlock>
          <ImgWrapper>
            <StyledImg alt={'staking-img'} src={StakingRocketImg} width={'80%'} />
          </ImgWrapper>
        </RowBlock>
        <RowBlock>
          <BlockContent>
            <BlockTitle>
              Instantly supercharge <br />
              your tokenomics 🚀
            </BlockTitle>
            <BlockBody>
              <span>Add a powerful set of token mechanics right out of the box:</span>
              <br />
              <br />
              <p>
                <span>
                  💰 <b>Token as Collateral</b>
                </span>
                <br />
                Babylon can turn your token into collateral and allow your holders to borrow without selling.
              </p>
              <p>
                <span>
                  🚜 <b>DeFi Yield</b>
                </span>
                <br />
                Start generating yield for your holders through DeFi without building a custom token mechanic.
              </p>
              <p>
                <span>
                  🔄 <b>Token Buybacks</b>
                </span>
                <br />
                Increase token holder value by using generated yield to buyback your tokens.
              </p>
              <p>
                <span>
                  🔒 <b>Voting Escrow Token (ve)</b>
                </span>
                <br />
                Users can deposit your protocol token as principal and lock it for a period of time, aligning long-term
                incentives.
              </p>
            </BlockBody>
          </BlockContent>
        </RowBlock>
      </BlockWrapper>
      <BlockWrapper invert>
        <RowBlock>
          <BlockContent>
            <Justified>
              <BlockTitle>
                Deploy a DeFi index
                <br />
                in just minutes 📈
              </BlockTitle>
              <BlockBody>
                <span>
                  Deploy an index fund with your top DeFi vaults/assets. All Gardens include the following features:
                </span>
                <br />
                <br />
                <p>
                  <span>
                    🏛️ <b>One Deposit</b>
                  </span>
                  <br />
                  Users need to deposit once to gain exposure to the index, potentially minimizing taxable transactions
                  as well*.
                </p>
                <p>
                  <RSpan>
                    <BablTokenIcon size={24} padding={0} /> <b>Shared Incentives</b>
                  </RSpan>
                  Your users earn BABL rewards on top of the yield of your products.
                </p>
                <p>
                  <span>
                    📒 <b>Product Indexation</b>
                  </span>
                  <br />
                  Allow your community members to vote on the composition of your index by vetting the stategies.
                </p>
              </BlockBody>
            </Justified>
          </BlockContent>
        </RowBlock>
        <RowBlock>
          <ImgWrapper>
            <StyledImg alt={'index-creation-img'} src={IndexImg} width={'90%'} />
          </ImgWrapper>
        </RowBlock>
      </BlockWrapper>
      <BlockWrapper>
        <RowBlock>
          <ImgWrapper>
            <StyledImg alt={'claub-img'} src={DaoHandImg} width={'90%'} pad />
          </ImgWrapper>
        </RowBlock>
        <RowBlock>
          <BlockContent>
            <Justified>
              <BlockTitle>
                Invest treasury funds
                <br />
                as a community 🧠
              </BlockTitle>
              <BlockBody>
                <p>🛡️ Safely deploy your treasury investments to blue-chip DeFi protocols.</p>
                <p>✍️ Decide on the best strategies with your community through gasless voting.</p>
                <p>🔥 Gasless transactions minimize fees for participants.</p>
                <RowP>
                  <BablTokenIcon size={24} padding={0} />
                  Receive BABL rewards and own a piece of Babylon.
                </RowP>
              </BlockBody>
            </Justified>
          </BlockContent>
        </RowBlock>
      </BlockWrapper>
    </DetailsContainer>
  );
};

const RSpan = styled.span`
  display: flex;
  flex-flow: row nowrap;

  img {
    margin-right: 4px;
  }
`;

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

const StyledImg = styled.img<{ pad?: boolean }>`
  z-index: 2;
  width: 90%;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100%;
    ${(p) => (p.pad ? 'padding: 30px;' : '')}
  }
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

const RowP = styled.p`
  display: flex;
  flex-flow: row nowrap;

  img {
    margin-right: 4px;
  }
`;

const BlockBody = styled.div`
  margin-top: 20px;
  font-size: 18px;
  line-height: 25px;

  > ul {
    list-style-type: none;
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
