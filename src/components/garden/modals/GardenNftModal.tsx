import { TurquoiseButton, PurpleButton, TxLoader, BaseModal } from 'components/shared';

import usePoller from 'hooks/Poller';
import { BREAKPOINTS, GAS_PRICES_STALE_AFTER_MSECS } from 'config';
import { FullGardenDetails, QuoteResult, Token } from 'models';
import { TokenListService, QuoteService } from 'services/';
import { formatReserveToFiatDisplay } from 'helpers/Numbers';
import { calculateGasLimit, calculateMaxFee } from './utils';
import { useW3Context } from 'context/W3Provider';
import { wrapAwait } from 'utils/AwaitWrapper';

import { BigNumber } from '@ethersproject/bignumber';
import { Box } from 'rimble-ui';
import { Contract } from '@ethersproject/contracts';
import { isMobile } from 'react-device-detect';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';

interface GardenNftModalProps {
  gardenDetails: FullGardenDetails;
  gardenContract: Contract;
}

function GardenNftModal({ gardenDetails, gardenContract }: GardenNftModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [txReady, setTxReady] = useState<any | undefined>(undefined);
  const [estimatedGasETH, setEstimatedGasETH] = useState<BigNumber>(BigNumber.from(0));
  const [gasFetchedAt, setGasFetchedAt] = useState<number | undefined>(undefined);

  const { address, canSubmitTx, fetchNewGasPrices, gasPrices, quotes, txProvider, userPrefs } = useW3Context();
  const tokenListService = TokenListService.getInstance();
  const daysSinceInitial = gardenDetails.contribution?.initialDepositAt
    ? (Date.now() - gardenDetails.contribution.initialDepositAt.getTime()) / (86400 * 1000)
    : 0;
  const daysRequired = (gardenDetails.nft?.mintNftAfter || 0) / 86400;
  const daysToEligible = Math.max(daysRequired - daysSinceInitial, 0);
  const canMint = gardenDetails.contribution
    ? gardenDetails.contribution.totalCurrentDeposits.gte(gardenDetails.minContribution) && daysToEligible === 0
    : false;
  const isGasPriceStale = gasFetchedAt === undefined ? true : Date.now() - gasFetchedAt > GAS_PRICES_STALE_AFTER_MSECS;
  const quoteService = QuoteService.getInstance();
  const ethPrice = quoteService.getQuoteForReserveAndCurrency(
    'ETH',
    userPrefs?.currency || 'USD',
    quotes as QuoteResult,
  )?.price;

  const updateGasPrices = async () => {
    if (isGasPriceStale) {
      fetchNewGasPrices();
      setGasFetchedAt(Date.now());
    }
  };

  useEffect(() => {
    if (showModal) {
      updateGasPrices();
    }
  }, [showModal]);

  // Check if the gas price is stale to rerender
  usePoller(() => {
    // Do not reuse the isGasPriceStale variable here
    if (!gasFetchedAt || Date.now() - gasFetchedAt > GAS_PRICES_STALE_AFTER_MSECS) {
      setGasFetchedAt(undefined);
    }
  }, 5000);

  useEffect(() => {
    if (showModal) {
      setGasEstimation();
    }
  }, [gasFetchedAt]);

  const toggleModal = () => {
    if (!showModal) {
      setShowModal(true);
    } else {
      onFinish();
    }
  };

  const setGasEstimation = async () => {
    if (!isGasPriceStale) {
      let defaultGas: BigNumber;
      const txGas: BigNumber = await wrapAwait(
        gardenContract.estimateGas.claimNFT(),
        BigNumber.from(2000000),
        'Error Estimating Gas',
      );
      const calculatedLimit = calculateGasLimit(txGas, gardenDetails).toFixed(0);
      defaultGas = BigNumber.from(calculatedLimit);
      if (quotes && ethPrice && gasPrices) {
        const { feeETH } = calculateMaxFee(
          ethPrice,
          defaultGas,
          gasPrices,
          0,
          tokenListService.getTokenBySymbol('WETH') as Token,
        );
        setEstimatedGasETH(feeETH);
      } else {
        throw new Error('Failed to calculate maxFee for transaction, please try again later');
      }
    } else {
      updateGasPrices();
    }
  };

  const handleSubmitMint = async (e: any) => {
    e.preventDefault();
    if (txProvider && address && gardenContract) {
      try {
        setTxReady(gardenContract.claimNFT());
      } catch (error) {
        console.log('Error attempting to mint Garden NFT', error);
      }
    }
  };

  const onFinish = () => {
    setShowModal(false);
    setTxReady(undefined);
  };

  const gasPriceInFiat = formatReserveToFiatDisplay(
    estimatedGasETH,
    tokenListService.getTokenBySymbol('WETH') as Token,
    userPrefs?.currency || 'USD',
    ethPrice?.toString() || '0',
  );

  return (
    <Box className="GardenNftModalBox">
      <PurpleButton disabled={!canSubmitTx} onClick={toggleModal}>
        Mint Garden NFT
      </PurpleButton>
      <BaseModal width={isMobile ? '100vw' : ''} isOpen={showModal} toggleModal={() => setShowModal(!showModal)}>
        <ModalCard>
          {!gardenDetails.nft && <span>Failed to load nft details, please try again later.</span>}
          {gardenDetails.nft && !txReady && (
            <>
              <ModalHeadingRow>Mint Garden NFT</ModalHeadingRow>
              <ModalContentWrapper>
                {!txReady && (
                  <>
                    <img alt="garden-nft-img" src={gardenDetails.nft?.image || ''} width="100%" />
                    {daysToEligible > 0 ? (
                      <EligibilityText>Days Until Eligible: {daysToEligible}</EligibilityText>
                    ) : (
                      <FeeDetailsRow>
                        <FeeDetailsLeft>Estimated Max Fee</FeeDetailsLeft>
                        <FeeDetailsRight>{gasPriceInFiat}</FeeDetailsRight>
                      </FeeDetailsRow>
                    )}
                    <StyledButtonRowWrapper>
                      <TurquoiseButton
                        disabled={isGasPriceStale ? false : canMint === false}
                        onClick={isGasPriceStale ? fetchNewGasPrices : handleSubmitMint}
                      >
                        {isGasPriceStale && canMint
                          ? '(Gas Price Out of Date) Refresh'
                          : canMint
                          ? 'Mint Garden NFT'
                          : 'Wallet not eligible'}
                      </TurquoiseButton>
                    </StyledButtonRowWrapper>
                  </>
                )}
              </ModalContentWrapper>
            </>
          )}
          {txReady && <TxLoader txObject={txReady} onConfirm={onFinish} waitForConfirmation />}
        </ModalCard>
      </BaseModal>
    </Box>
  );
}

const FeeDetailsRow = styled.div`
  margin-top: 20px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`;

const FeeDetailsLeft = styled.div`
  color: var(--blue-03);
  font-size: 16px;
  font-family: cera-regular;
  flex-grow: 1;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

const FeeDetailsRight = styled(FeeDetailsLeft)`
  text-align: right;
  display: flex;
  flex-flow: column nowrap;
`;

const EligibilityText = styled.div`
  font-family: cera-medium;
  font-size: 16px;
  padding-top: 20px;
`;

const ModalContentWrapper = styled.div`
  width: 100%;
`;

const StyledButtonRowWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  height: 50px;
  margin-top: 30px;
  width: 100%;

  > button {
    width: 100%;
  }
`;

const ModalHeadingRow = styled.div`
  font-size: 24px;
  font-family: cera-bold;
  color: var(--white);
  margin-bottom: 24px;
  width: 100%;
`;

const ModalCard = styled.div`
  background-color: var(--modal-blue);
  flex-flow: column nowrap;
  border: none;
  width: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
  }
`;

export default React.memo(GardenNftModal);
