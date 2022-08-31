import { Animation } from 'components/shared';
import { AnimationName } from 'components/shared/Animation/Animation';
import { GlobalLoader, NoAccess, TxLoader, TurquoiseButton, GardenTable } from 'components/shared';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useW3Context } from 'context/W3Provider';
import { ViewerService } from 'services';
import { BABLToken, TimeLockRegistry } from 'constants/contracts';
import { Contract } from '@ethersproject/contracts';
import { formatEther } from '@ethersproject/units';
import moment from 'moment';
import { loadContractFromNameAndAddress, getAddressByName } from 'hooks/ContractLoader';
import addresses from 'constants/addresses';
import { BigNumber } from '@ethersproject/bignumber';

const Seed = () => {
  const [loading, setLoading] = useState(true);
  const [claimableBalance, setClaimableBalance] = useState<BigNumber>(BigNumber.from(0));
  const [lockedBalance, setLockedBalance] = useState<BigNumber>(BigNumber.from(0));
  const [walletBalance, setWalletBalance] = useState<BigNumber>(BigNumber.from(0));
  const [vestingStart, setVestingStart] = useState<number>(0);
  const [vestingEnd, setVestingEnd] = useState<number>(0);
  const [txReady, setTxReady] = useState<any | undefined>(undefined);
  const { address, betaAccess, txProvider, provider } = useW3Context();
  const viewerService = ViewerService.getInstance();

  const fetchBalances = async () => {
    if (address) {
      if (!loading) {
        setLoading(true);
      }
      const bablContract = (await loadContractFromNameAndAddress(
        addresses.tokens.BABL,
        BABLToken,
        provider,
      )) as Contract;
      const timelockContract = (await loadContractFromNameAndAddress(
        getAddressByName('TimeLockRegistry'),
        TimeLockRegistry,
        provider,
      )) as Contract;

      const walletBalance = await viewerService.getTokenBalance(addresses.tokens.BABL, address);
      setWalletBalance(walletBalance);
      if (walletBalance.gt(0)) {
        const lockedBalance = await bablContract.viewLockedBalance(address);
        setLockedBalance(lockedBalance);
        if (lockedBalance.gt(0)) {
          const vestingInfo = await bablContract.vestedToken(address);
          setVestingStart(vestingInfo[1].toNumber() * 1000);
          setVestingEnd(vestingInfo[2].toNumber() * 1000);
        }
      }
      const claimableBalance = await timelockContract.checkRegisteredDistribution(address);
      setClaimableBalance(claimableBalance);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [address]);

  const handleClaim = async (e) => {
    e.preventDefault();
    if (address && txProvider) {
      try {
        const bablContract = (await loadContractFromNameAndAddress(
          addresses.tokens.BABL,
          BABLToken,
          txProvider,
        )) as Contract;
        setTxReady(bablContract.claimMyTokens());
      } catch (err) {
        console.error('Error during BABL token claim ', err);
      }
    }
  };

  return (
    <SeedContainer>
      {!loading && (!betaAccess || !address) && <NoAccess />}
      {loading && (
        <ContentWrapper>
          <GlobalLoader />
        </ContentWrapper>
      )}
      {address && !loading && !txReady && (
        <ContentWrapper>
          <ModalCard>
            <h5>{claimableBalance.gt(0) ? 'Claim vested BABL tokens' : 'You already claimed your BABL'}</h5>
            <Animation size={150} autoplay loop name={AnimationName.coinSpin} />
            <GardenTable headers={[]} fillSpace>
              {claimableBalance.gt(0) && (
                <BalancesRow total>
                  <BalanceLabel>BABL to claim:</BalanceLabel>
                  <BalanceValue>{formatEther(claimableBalance)}</BalanceValue>
                </BalancesRow>
              )}
              {walletBalance.gt(0) && (
                <BalancesRow total>
                  <BalanceLabel>Total BABL Tokens:</BalanceLabel>
                  <BalanceValue>{formatEther(walletBalance)}</BalanceValue>
                </BalancesRow>
              )}
              {lockedBalance.gt(0) && (
                <BalancesRow>
                  <BalanceLabel>BABL Locked (Vesting):</BalanceLabel>
                  <BalanceValue>{formatEther(lockedBalance)}</BalanceValue>
                </BalancesRow>
              )}
              {lockedBalance.gt(0) && vestingStart > 0 && (
                <BalancesRow>
                  <BalanceLabel>Vesting Starts On:</BalanceLabel>
                  <BalanceValue>{moment(vestingStart).format('MMM DD, YYYY')}</BalanceValue>
                </BalancesRow>
              )}
              {lockedBalance.gt(0) && vestingEnd > 0 && (
                <BalancesRow>
                  <BalanceLabel>Vesting Ends On:</BalanceLabel>
                  <BalanceValue>{moment(vestingEnd).format('MMM DD, YYYY')}</BalanceValue>
                </BalancesRow>
              )}
              {walletBalance.sub(lockedBalance).gt(0) && (
                <BalancesRow>
                  <BalanceLabel>BABL Vested & Unlocked:</BalanceLabel>
                  <BalanceValue>{formatEther(walletBalance.sub(lockedBalance))}</BalanceValue>
                </BalancesRow>
              )}
            </GardenTable>
            {claimableBalance.gt(0) && (
              <StyledButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClaim(e)}>
                Claim BABL tokens
              </StyledButton>
            )}
            {claimableBalance.eq(0) && lockedBalance.eq(0) && <p> No vested tokens to claim </p>}
          </ModalCard>
        </ContentWrapper>
      )}
      {txReady && (
        <TxLoader
          customConfirmationText={'BABL claimed successfully'}
          txObject={txReady}
          onConfirm={() => {
            fetchBalances();
          }}
          waitForConfirmation
        />
      )}
    </SeedContainer>
  );
};

const SeedContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-start;
  padding: 80px 40px;
`;

const ContentWrapper = styled.div`
  position: relative;
  margin: 0 auto;
  width: var(--screen-lg-min);
  padding: 0 30px 0 30px;

  @media only screen and (max-width: 1440px) {
    width: 100%;
  }
`;

const ModalCard = styled.div`
  background-color: var(--modal-blue);
  flex-flow: column nowrap;
  border: none;
  width: 600px;
  height: auto;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 40px;

  h5 {
    width: 100%;
    color: white;
    text-align: left;
    font-size: 24px;
    line-height: 32px;
    margin-bottom: 30px;
  }
`;

const BalancesDetail = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;

const BalancesRow = styled.tr<{ total?: boolean }>`
  height: 50px !important;
  color: ${(p) => (p.total === true ? 'var(--purple-aux)' : 'var(--white)')} !important;
  border-bottom: ${(p) => (p.total === true ? 'none' : 'inherit')} !important;
  font-family: ${(p) => (p.total === true ? 'cera-bold' : 'inherit')} !important;
  font-size: ${(p) => (p.total === true ? '18px' : 'inherit')} !important;
`;
const BalanceLabel = styled.td``;

const BalanceValue = styled.td``;

const StyledButton = styled(TurquoiseButton)`
  margin-top: 20px;
`;

export default React.memo(Seed);
