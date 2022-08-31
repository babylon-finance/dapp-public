import BorderBottom from './border-bottom.svg';
import { Animation } from 'components/shared';
import { AnimationName } from 'components/shared/Animation/Animation';
import { GlobalLoader } from 'components/shared';
import { ProphetProfile } from '../Gallery';
import { TurquoiseButton, Icon, TxLoader } from 'components/shared';

import ProphetsJson from '../contracts/Prophets.json';
import { PROPHET_ADDRESS } from 'config';
import { Routes } from 'constants/Routes';
import { TxType, IconName } from 'models/';
import { ViewerService, IdentityService } from 'services';
import { useW3Context } from 'context/W3Provider';

import { Contract } from '@ethersproject/contracts';
import { Link } from 'react-router-dom';
import { BigNumber } from '@ethersproject/bignumber';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';

const Minted = ({ prophet }) => {
  return (
    <ContentWrapper>
      <ProphetWrapper>
        <ProphetProfile prophetId={prophet} actions={false} />
      </ProphetWrapper>
    </ContentWrapper>
  );
};

const ProphetMint = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [txReady, setTxReady] = useState<any | undefined>(undefined);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [claimable, setClaimable] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState<string | undefined>();
  const [prophetIds, setProphetIds] = useState<number[] | undefined>(undefined);

  const viewerService = ViewerService.getInstance();
  const identityService = IdentityService.getInstance();

  const { address, connect, txProvider, provider } = useW3Context();

  const getProphetsForAddress = async (address: string) => {
    try {
      const prophetIdsBN = await viewerService.getAllProphets(address);
      const prophetIds = prophetIdsBN.map((b: BigNumber) => b.toNumber());
      setProphetIds(prophetIds);
      if (prophetIds.length > 0) {
        if (prophetIds[0] < 2500 || prophetIds[0] > 8000) {
          const prophetContract = new Contract(PROPHET_ADDRESS, ProphetsJson.abi, provider);
          const claimed = await prophetContract.prophetsBABLClaimed(prophetIds[prophetIds.length - 1]);
          setClaimable(!claimed);
          setCountryCode(await identityService.getCountry());
        }
      }
    } catch (error) {
      // Error code when no Prophet exists for wallet
      setProphetIds([]);
      if (error?.error?.code === -32603) {
      } else {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      if (txProvider) {
        if (address) {
          await getProphetsForAddress(address);
        }
      }
      setLoading(false);
    };
    initialize();
  }, [address, txProvider]);

  const handleClaim = async (e) => {
    e.preventDefault();
    if (address && txProvider && prophetIds) {
      try {
        setClaiming(true);
        const prophetContract = new Contract(PROPHET_ADDRESS, ProphetsJson.abi, txProvider.getSigner());
        const filteredIds: number[] = [];
        const promises = prophetIds.map(async (prophetId: number) => {
          const claimed = await prophetContract.prophetsBABLClaimed(prophetId);
          if (!claimed) {
            filteredIds.push(prophetId);
          }
        });
        await Promise.all(promises);
        setTxReady(
          filteredIds.length == 1
            ? prophetContract.claimLoot(filteredIds[0])
            : prophetContract.batchClaimLoot(filteredIds),
        );
      } catch (err) {
        console.error('Error during BABL loot claim ', err);
      }
    }
  };

  return (
    <>
      <ContainerFull>
        {loading && <GlobalLoader />}
        {!loading && (
          <>
            <HeaderContainer>
              <HeaderText>Your Prophets</HeaderText>
              {address && (
                <HeaderSubText>You have {prophetIds ? prophetIds.length : 'no'} Prophets minted</HeaderSubText>
              )}
            </HeaderContainer>
            <ProphetBenefits>
              <ProphetBenefitRow>
                <Icon name={IconName.babToken} size={40} />
                <div>
                  Right to <span>claim BABL tokens</span>.
                  <StyledLink
                    to={{ pathname: 'https://docs.babylon.finance/babl/tokenomics' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more
                  </StyledLink>
                </div>
              </ProphetBenefitRow>
              <ProphetBenefitRow>
                <Icon name={IconName.gate} size={40} />
                <div>
                  Exclusive <span>access to the beta</span> during the highest period of mining rewards.
                  <StyledLink
                    to={{ pathname: 'https://docs.babylon.finance/babl/mining' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more
                  </StyledLink>
                </div>
              </ProphetBenefitRow>
              <ProphetBenefitRow>
                <Icon name={IconName.rocket} size={40} />
                <div>
                  Permanent <span>1% LP bonus</span> on Mining Rewards for depositing into gardens.
                </div>
              </ProphetBenefitRow>
            </ProphetBenefits>
            {!address && (
              <ButtonWrapper>
                <TurquoiseButton onClick={connect}>Connect Wallet to Begin</TurquoiseButton>
              </ButtonWrapper>
            )}
            {address && (
              <>
                {claimable && (
                  <>
                    <CoinWrapper>
                      <Animation size={150} autoplay loop name={AnimationName.coinSpin} />
                    </CoinWrapper>
                    <ButtonWrapper>
                      <TurquoiseButton disabled={claiming || countryCode === 'US'} onClick={handleClaim}>
                        {claiming
                          ? 'Loading...'
                          : countryCode === 'US'
                          ? '🇺🇸 Residents cannot claim BABL'
                          : 'Claim BABL loot from Prophets'}
                      </TurquoiseButton>
                    </ButtonWrapper>
                  </>
                )}
                {prophetIds &&
                  prophetIds.reverse().map((prophetId: number) => <Minted key={prophetId} prophet={prophetId} />)}
                {<img alt={'border-row'} src={BorderBottom} width={'100%'} />}
                <AuctionDetailsContainer>
                  <AuctionText>
                    {prophetIds?.length === 0 && <span> You don't have any prophets</span>}
                    {prophetIds && prophetIds?.length > 0 && (
                      <span>Stake your prophet(s) into garden(s) to boost your rewards!</span>
                    )}
                  </AuctionText>
                  <Link to={Routes.portfolio}>
                    <StyledButton onClick={() => null}>Go to Gardens</StyledButton>
                  </Link>
                </AuctionDetailsContainer>
              </>
            )}
          </>
        )}
      </ContainerFull>
      {txReady && (
        <TxLoader
          type={TxType.claimRewards}
          customConfirmationText={'BABL claimed successfully'}
          txObject={txReady}
          onConfirm={() => {
            setClaiming(false);
          }}
          onFailure={() => {
            setClaiming(false);
          }}
          waitForConfirmation
        />
      )}
    </>
  );
};

const ContainerFull = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  position: relative;
  width: 100%;
  padding-bottom: 60px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;

  align-items: center;
  animation: fadeInAnimation ease 1s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  width: 100%;
  z-index: 1;

  padding-bottom: 60px;

  @keyframes fadeInAnimation {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @media only screen and (max-width: 598px) {
    padding-top: 0px;
  }
`;

const ProphetBenefits = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  max-width: 400px;
  justify-content: center;
  align-items: center;
  background: var(--purple-07);
  padding: 10px;
  margin: 20px 0;
`;

const ProphetBenefitRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  align-items: center;
  margin: 10px 0;

  div {
    margin-left: 10px;
    font-size: 16px;
    color: white;

    span {
      font-weight: bold;
    }
  }
`;

const AuctionDetailsContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  z-index: 3;
`;

const ProphetWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: top;
  width: 100%;
  margin-top: 0px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 10px;
`;

const CoinWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 10px;
`;

const AuctionText = styled.span`
  padding-bottom: 30px;
  font-family: cera-regular;
  font-size: 18px;
  text-align: center;

  @media only screen and (max-width: 598px) {
    padding: 0 20px 30px;
  }
`;

const StyledButton = styled(TurquoiseButton)`
  height: 40px;
  min-width: 280px;

  @media only screen and (max-width: 598px) {
    width: 100%;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  margin-top: 40px;

  @media only screen and (max-width: 598px) {
    padding: 30px 10px 0 10px;
  }
`;

const HeaderText = styled.span`
  text-align: center;
  font-family: cera-bold;
  font-size: 40px;

  @media only screen and (max-width: 598px) {
    font-size: 36px;
  }
`;

const HeaderSubText = styled.span`
  text-align: center;
  font-family: cera-regular;
  font-size: 18px;
`;

const StyledLink = styled(Link)`
  padding-left: 6px;
  font-family: cera-regular;
  color: var(--turquoise-01);
  text-decoration: underline;
  z-index: 3;

  &:hover {
    color: var(--turquoise-01);
    text-decoration: underline;
    opacity: 0.8;
  }
`;

export default React.memo(ProphetMint);
