import { TurquoiseButton, TokenInput, TxLoader, BaseModal, Icon } from 'components/shared';
import { ReactComponent as FacePalm } from 'components/shared/img/facepalm.svg';
import { GardenTokenIcon } from 'components/shared/Icons';
import addresses from 'constants/addresses';
import usePoller from 'hooks/Poller';
import { TransactionType, Fees, TxChecklist } from './components/';
import {
  BREAKPOINTS,
  MAX_GAS_FULL_SUBSIDY_PRICE,
  GAS_PRICES_STALE_AFTER_MSECS,
  MAX_WITHDRAW_BY_SIG_GAS,
  MAX_WITHDRAW_BY_SIG_PENALTY_GAS,
} from 'config';
import { FullGardenDetails, Contributor, IconName, TxType, Token, QuoteResult, AprResult } from 'models';
import { QuoteService, TokenListService } from 'services/';
import { buildWithdrawMessage, SignatureTransactionType, submitSignatureTransaction } from 'utils/SignatureTransaction';
import { formatReserveFloat, formatGardenTokensDisplay, formatToGas, formatEtherDecimal } from 'helpers/Numbers';
import { calculateGasLimit, calculateMaxFee, canUseSignature, getStepPerReserve, getBiggestStrategy } from './utils/';
import { useW3Context } from 'context/W3Provider';
import { wrapAwait } from 'utils/AwaitWrapper';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { parseEther, parseUnits } from '@ethersproject/units';
import { Box, Loader } from 'rimble-ui';
import styled from 'styled-components';
import React, { useState, useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';

interface WithdrawModalProps {
  gardenDetails: FullGardenDetails;
  gardenContract: Contract;
  reserveContract: Contract;
  vapr?: AprResult | undefined;
  refetch: () => void;
}

const DEFAULT_CONFIRM_STATES = {
  pending: false,
};

const LIQUIDATION_PENALTY = 0.025; // 2.5%

function WithdrawModal({ gardenDetails, refetch, gardenContract, vapr }: WithdrawModalProps) {
  let {
    accountantBalance,
    address,
    canSubmitTx,
    fetchNewGasPrices,
    gasPrices,
    notify,
    quotes,
    signatureSupported,
    txProvider,
    userPrefs,
  } = useW3Context();
  const [showModal, setShowModal] = useState(false);
  const [isSignatureSelected, setIsSignatureSelected] = useState(
    canUseSignature(accountantBalance, signatureSupported),
  );
  const [showExitWarning, setShowExitWarning] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [confirmations, setConfirmations] = useState(DEFAULT_CONFIRM_STATES);
  const [txReady, setTxReady] = useState<any | undefined>(undefined);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [defaultGasLimit, setDefaultGasLimit] = useState<BigNumber | undefined>(undefined);
  const [estimatedGasETH, setEstimatedGasETH] = useState<BigNumber>(BigNumber.from(0));

  const [gasFetchedAt, setGasFetchedAt] = useState<number | undefined>(undefined);
  const [maxFee, setMaxFee] = useState<BigNumber>(BigNumber.from(0));
  const [confirmSignatureWaiting, setConfirmSignatureWaiting] = useState<boolean>(false);
  const tokenListService = TokenListService.getInstance();
  const contribution = gardenDetails.contribution as Contributor;
  const innerRef = useRef<HTMLInputElement>();

  const quoteService = QuoteService.getInstance();
  const reserveAsset = gardenDetails.reserveToken as Token;

  const lockedBalanceTotal = contribution.lockedBalance || BigNumber.from(0);
  const availableBN = contribution.tokens.sub(lockedBalanceTotal) || BigNumber.from(0);
  const available = formatEtherDecimal(availableBN, 4);
  const availableDisplay = formatEtherDecimal(availableBN);

  const ethPrice = quoteService.getQuoteForReserveAndCurrency(
    'ETH',
    userPrefs?.currency || 'USD',
    quotes as QuoteResult,
  )?.price;
  const reserveInFiat =
    quoteService.getQuoteForReserveAndCurrency(reserveAsset.symbol, userPrefs?.currency || 'USD', quotes as QuoteResult)
      ?.price || 0;

  const withdrawAmountBN = parseEther(String(withdrawAmount));
  const hasActiveStrategies = !!gardenDetails.fullStrategies?.find((s) => s.active);

  let receivingAmountBN = withdrawAmountBN
    .mul(10 ** (18 - reserveAsset.decimals))
    .mul(gardenDetails.sharePrice)
    .div(10 ** (18 - reserveAsset.decimals))
    .div(parseEther('1'));

  let hasLiquidReserves = true;
  let strategyToUnwind = addresses.zero;
  if (hasActiveStrategies) {
    hasLiquidReserves = receivingAmountBN.lte(gardenDetails.availableLiquidReserve);
    if (!hasLiquidReserves && gardenDetails.strategies.length > 0 && gardenDetails.fullStrategies) {
      const res = getBiggestStrategy(gardenDetails, receivingAmountBN);
      // TODO: Remove after rari is refunded
      if (res.strategy.toLowerCase() !== '0xbf2647e5319cFbbE840ad0fafbE5E073E89B40f0'.toLowerCase()) {
        strategyToUnwind = res.strategy;
        receivingAmountBN = receivingAmountBN.lte(res.capital) ? receivingAmountBN : res.capital;
      } else {
        receivingAmountBN = gardenDetails.availableLiquidReserve;
      }
    }
  } else {
    receivingAmountBN = receivingAmountBN.lte(gardenDetails.availableLiquidReserve)
      ? receivingAmountBN
      : gardenDetails.availableLiquidReserve;
  }
  const penaltyBN = hasLiquidReserves ? BigNumber.from(0) : receivingAmountBN.mul(LIQUIDATION_PENALTY * 1000).div(1000);

  const safeValueBN = parseUnits(withdrawAmount.toFixed(reserveAsset.decimals).toString() || '0', 18);

  let isValid = safeValueBN.gt(BigNumber.from(0)) && safeValueBN.lte(availableBN);

  // Note: If hasLiquid true penalty is 0 else we take the 2.5%
  const receivingAfterPenaltyBN = receivingAmountBN.gt(penaltyBN)
    ? receivingAmountBN.sub(penaltyBN)
    : BigNumber.from(0);

  let receivingAfterFeesBN = receivingAfterPenaltyBN.gt(maxFee)
    ? receivingAfterPenaltyBN.sub(maxFee)
    : BigNumber.from(0);

  receivingAfterFeesBN = receivingAfterFeesBN.gt(0) ? receivingAfterFeesBN : BigNumber.from(0);
  const shouldWarnFeeSignature = !receivingAfterFeesBN.gt(BigNumber.from(0));
  const usingSignature =
    isSignatureSelected && canUseSignature(accountantBalance, signatureSupported) && !shouldWarnFeeSignature;
  const shouldWarnPenalty = isValid && penaltyBN.gt(0);
  const shouldWarnGas = formatToGas(gasPrices?.fast || 0) >= MAX_GAS_FULL_SUBSIDY_PRICE;
  const minAmountOut = receivingAfterFeesBN;
  const timeSinceDeposit = gardenDetails.contribution?.lastDeposit
    ? Date.now() - gardenDetails.contribution.lastDeposit.getTime()
    : Infinity;
  const daysSinceDeposit = timeSinceDeposit / (86400 * 1000);
  const isGasPriceStale = !gasFetchedAt || Date.now() - gasFetchedAt > GAS_PRICES_STALE_AFTER_MSECS;
  const hardlockDays = gardenDetails.contribution?.userLock?.gt(86400)
    ? gardenDetails.contribution?.userLock.toNumber() / 86400
    : 0;
  const hardlockSecs = gardenDetails.depositHardlock.toNumber() * 1000;
  isValid = isValid && timeSinceDeposit > hardlockSecs && receivingAfterFeesBN.gt(0);
  let error: string = '';
  if (!isValid && timeSinceDeposit < hardlockSecs) {
    const daysLeft = hardlockDays - daysSinceDeposit;
    if (Math.floor(daysLeft) > 30) {
      error = `Your tokens are locked for ${Math.floor(daysLeft / 30)} more months`;
    } else if (Math.floor(daysLeft) > 0) {
      error = `Your tokens are locked for ${Math.floor(daysLeft)} more days`;
    } else {
      const hoursSinceDeposit = timeSinceDeposit / (3600 * 1000);
      const hardlockHours = gardenDetails.depositHardlock?.gt(3600)
        ? gardenDetails.depositHardlock.toNumber() / 3600
        : 0;
      const hoursLeft = Math.floor(hardlockHours - hoursSinceDeposit);
      error = `Your tokens are locked for ${hoursLeft > 0 ? hoursLeft + 1 : 1} more hours`;
    }
  } else if (!isValid && withdrawAmountBN.gt(availableBN) && lockedBalanceTotal.gt(0)) {
    error =
      'Your locked tokens cannnot be withdrawn. Burn up to' +
      formatGardenTokensDisplay(availableBN, gardenDetails.symbol);
  } else if (!isValid && withdrawAmountBN.gt(availableBN)) {
    error = 'Tokens to burn must be less than ' + formatGardenTokensDisplay(availableBN, gardenDetails.symbol);
  } else if (!isValid && receivingAfterFeesBN.eq(0)) {
    error = 'There are no idle funds in the garden';
  } else if (!isValid) {
    error = 'Please enter a valid amount';
  }

  const updateGasPrices = async () => {
    if (isGasPriceStale) {
      fetchNewGasPrices();
      setGasFetchedAt(Date.now());
    }
  };

  useEffect(() => {
    async function init() {
      innerRef.current && innerRef.current.focus();
      handleChangeTokenAmount(available);
      updateGasPrices();
    }

    if (showModal) {
      init();
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
    if (isValid) {
      setGasEstimation();
    }
  }, [withdrawAmount, isSignatureSelected, gasFetchedAt]);

  const toggleModal = () => {
    if (!showModal) {
      setShowModal(true);
    } else {
      onFinish();
    }
  };

  const handleCheck = (e: any) => {
    const newConfirms = { ...confirmations };
    newConfirms[e.target.name] = !confirmations[e.target.name];
    setConfirmations(newConfirms);
  };

  const setGasEstimation = async () => {
    if (isValid && !isGasPriceStale) {
      const withPenalty = hasLiquidReserves === false;
      let defaultGas: BigNumber;
      if (isSignatureSelected) {
        defaultGas = BigNumber.from(withPenalty ? MAX_WITHDRAW_BY_SIG_PENALTY_GAS : MAX_WITHDRAW_BY_SIG_GAS);
      } else {
        const withdrawTxGas: BigNumber = await wrapAwait(
          gardenContract.estimateGas.withdraw(
            withdrawAmountBN,
            minAmountOut,
            address,
            !hasLiquidReserves,
            strategyToUnwind,
          ),
          BigNumber.from(2000000),
          'Error Estimating Gas',
        );
        const calculatedLimit = calculateGasLimit(withdrawTxGas, gardenDetails).toFixed(0);
        defaultGas = BigNumber.from(calculatedLimit);
      }
      setDefaultGasLimit(defaultGas);
      if (quotes && ethPrice && gasPrices) {
        const { feeETH, feeReserve } = calculateMaxFee(ethPrice, defaultGas, gasPrices, reserveInFiat, reserveAsset);
        if (gardenDetails.address.toLowerCase() !== '0x99acDD18eb788E199be6Bf64d14142329316687a'.toLowerCase()) {
          setMaxFee(feeReserve);
        }
        setEstimatedGasETH(feeETH);
      } else {
        throw new Error('Failed to calculate maxFee for transaction, please try again later');
      }
    } else {
      updateGasPrices();
    }
  };

  const handleSubmitWithdraw = async (e) => {
    e.preventDefault();
    if (isValid && txProvider && address && gardenContract && defaultGasLimit) {
      try {
        const withPenalty = hasLiquidReserves === false;
        if (maxFee && usingSignature && !shouldWarnFeeSignature && gasPrices) {
          const previousNonce = (await gardenContract.getContributor(address))[7] || BigNumber.from(0);

          setConfirmSignatureWaiting(true);

          const signer = txProvider.getSigner();

          const message = buildWithdrawMessage(
            withdrawAmountBN,
            minAmountOut,
            maxFee,
            previousNonce,
            gardenDetails.address,
            withPenalty,
            address,
          );

          try {
            await submitSignatureTransaction(message, signer, SignatureTransactionType.withdraw, notify).then(
              (response) => {
                if (response === undefined) {
                  onFinish();
                  return;
                }
                setTxHash(response.hash);
              },
            );
          } catch (error) {
            onFinish();
          } finally {
            setConfirmSignatureWaiting(false);
          }
        } else {
          setTxReady(
            gardenContract.withdraw(withdrawAmountBN, minAmountOut, address, withPenalty, strategyToUnwind, {
              gasLimit: calculateGasLimit(defaultGasLimit, gardenDetails),
            }),
          );
        }
      } catch (error) {
        console.log('Error during withdrawal', error);
      }
    }
  };

  const onFinish = () => {
    setShowModal(false);
    setTxReady(undefined);
    setWithdrawAmount(0);
    refetch();
  };

  const handleChangeTokenAmount = async (value: number) => {
    setWithdrawAmount(value);
  };

  const isConfirmed = confirmations.pending === true || !hasActiveStrategies;

  const cleanedName = gardenDetails.name.length > 15 ? gardenDetails.name.slice(0, 12) + '...' : gardenDetails.name;

  return (
    <Box className="WithdrawModal">
      <TurquoiseButton
        width={isMobile ? '100%' : undefined}
        disabled={!gardenDetails.active || !canSubmitTx}
        onClick={toggleModal}
      >
        {gardenDetails.active === true ? 'Withdraw' : 'Inactive'}
      </TurquoiseButton>
      <BaseModal width={isMobile ? '100vw' : ''} isOpen={showModal} toggleModal={() => setShowModal(!showModal)}>
        <ModalCard>
          {!txReady && !txHash && !showExitWarning && (
            <>
              <ModalHeadingRow>Withdraw</ModalHeadingRow>
              <ModalContentWrapper>
                {!txReady && (
                  <>
                    {gardenDetails.reserveToken && (
                      <>
                        <TransactionType
                          type={TxType.withdraw}
                          setUsingSignature={setIsSignatureSelected}
                          canUseSignature={
                            canUseSignature(accountantBalance, signatureSupported) && !shouldWarnFeeSignature
                          }
                          usingSignature={usingSignature}
                        />
                        <TokenInput
                          name={'input-giving'}
                          primary={false}
                          inputLabel={`Burning (Available: ${formatGardenTokensDisplay(
                            availableBN,
                            gardenDetails.symbol,
                          )})`}
                          tokenName="Garden Token"
                          tokenSymbol={`${cleanedName} (${gardenDetails.symbol})`}
                          tokenIcon={<GardenTokenIcon size={24} />}
                          displayBalance={availableDisplay.toString()}
                          amount={withdrawAmount}
                          onChange={(e) => handleChangeTokenAmount(Number(e.target.value))}
                          warn={shouldWarnPenalty}
                          valid={isValid}
                          step={getStepPerReserve(gardenDetails.reserveAsset)}
                          showMaxButton
                          setMax={() => handleChangeTokenAmount(available)}
                          max={available.toString() || '0'}
                          error={error}
                          innerRef={innerRef}
                        />
                        <StyledArrowWrapper>
                          <Icon name={IconName.arrowDown} size={20} color={'var(--turquoise-01)'} />
                        </StyledArrowWrapper>
                        <TokenInput
                          disabled
                          inputLabel="Receiving"
                          name={'input-receiving'}
                          tokenName={gardenDetails.reserveToken.name}
                          tokenSymbol={gardenDetails.reserveToken.symbol}
                          tokenIcon={
                            <img alt="token-symbol" src={gardenDetails.reserveToken.logoURI} height={24} width={24} />
                          }
                          amount={formatReserveFloat(
                            usingSignature ? receivingAfterFeesBN : receivingAfterPenaltyBN,
                            gardenDetails.reserveToken,
                          )}
                        />
                        {isValid && (
                          <TxChecklist
                            confirmations={confirmations}
                            handleCheck={handleCheck}
                            hasActiveStrategies={hasActiveStrategies}
                            txType={TxType.withdraw}
                          />
                        )}
                        {isValid && ethPrice && (
                          <Fees
                            isSignatureSelected={isSignatureSelected}
                            userCurrency={userPrefs?.currency || 'USD'}
                            shouldWarnGas={shouldWarnGas}
                            ethAsset={tokenListService.getTokenByAddress('0x') as Token}
                            reserveAsset={reserveAsset}
                            estimateGasETH={estimatedGasETH}
                            receivingAmountAfterFees={
                              isSignatureSelected ? receivingAfterFeesBN : receivingAfterPenaltyBN
                            }
                            reserveInFiat={reserveInFiat}
                            liquidationPenalty={penaltyBN}
                            ethPrice={ethPrice}
                            receivingSymbol={gardenDetails.reserveToken.symbol}
                          />
                        )}
                        <StyledButtonRowWrapper>
                          <TurquoiseButton
                            disabled={!isValid || confirmSignatureWaiting || (!isConfirmed && !isGasPriceStale)}
                            onClick={isGasPriceStale ? fetchNewGasPrices : () => setShowExitWarning(true)}
                          >
                            {confirmSignatureWaiting ? (
                              <Loader />
                            ) : isGasPriceStale && isValid ? (
                              '(Gas Price Out of Date) Refresh'
                            ) : (
                              'Withdraw'
                            )}
                          </TurquoiseButton>
                        </StyledButtonRowWrapper>
                      </>
                    )}
                  </>
                )}
              </ModalContentWrapper>
            </>
          )}
          {showExitWarning && !txReady && !txHash && (
            <ExitWarning>
              <ExitWarningHeader>
                <ExitWarningImage>
                  <FacePalm />
                </ExitWarningImage>
                <span>Be sure you're ready to exit!</span>
              </ExitWarningHeader>
              <ExitWarningBody>
                <ExitWarningRow>
                  <ExitRowIcon>
                    <Icon name={IconName.bolt} size={28} />
                  </ExitRowIcon>
                  <ExitRowContent>
                    <p>
                      Any <Yellow>"pending" BABL rewards will be relenquished</Yellow> to active members of this Garden.
                      <br />
                      <Blue>(Does not impact Claimable rewards)</Blue>
                    </p>
                  </ExitRowContent>
                </ExitWarningRow>
                {vapr && (
                  <ExitWarningRow>
                    <ExitRowIcon>
                      <Icon name={IconName.bolt} size={28} />
                    </ExitRowIcon>
                    <ExitRowContent>
                      <p>
                        This Garden is earning{' '}
                        <Yellow>{`${parseFloat(vapr.aggregate.toFixed(2))}%`} returns annualized.</Yellow> Compounding
                        interest over medium to long time horizons is the most effective way to build wealth.
                      </p>
                    </ExitRowContent>
                  </ExitWarningRow>
                )}
                <ExitWarningRow>
                  <ExitRowIcon>
                    <Icon name={IconName.bolt} size={28} />
                  </ExitRowIcon>
                  <ExitRowContent>
                    <p>
                      Exchanging Garden tokens is a <Yellow>taxable event</Yellow> in most jurisdictions. Be sure to
                      consider your potential tax burden when exiting this Garden.
                    </p>
                  </ExitRowContent>
                </ExitWarningRow>
              </ExitWarningBody>
              <ExitWarningActions>
                <ExitWarningActionTitle>Are you sure you want to withdraw?</ExitWarningActionTitle>
                <ExitButtons>
                  <ButtonWrapper>
                    <TurquoiseButton onClick={() => setShowExitWarning(false)}>Back</TurquoiseButton>
                  </ButtonWrapper>
                  <ButtonWrapper>
                    <TurquoiseButton inverted onClick={handleSubmitWithdraw}>
                      Submit
                    </TurquoiseButton>
                  </ButtonWrapper>
                </ExitButtons>
              </ExitWarningActions>
            </ExitWarning>
          )}
          {(txReady || txHash) && (
            <TxLoader
              type={TxType.withdraw}
              txHash={txHash}
              txObject={txReady}
              onConfirm={onFinish}
              waitForConfirmation
            />
          )}
        </ModalCard>
      </BaseModal>
    </Box>
  );
}

const Yellow = styled.span`
  color: var(--yellow);
`;

const Blue = styled.span`
  color: var(--blue-03);
`;

const ExitWarningActions = styled.div`
  height: 100%;
  border-top: 1px solid var(--border-blue);
  width: 100%;
  padding: 30px 0;
`;

const ExitWarningActionTitle = styled.div`
  width: 100%;
  padding-bottom: 20px;
  text-align: center;
  font-family: cera-bold;
`;

const ExitButtons = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
`;

const ButtonWrapper = styled.div`
  &:first-child {
    padding-right: 8px;
  }
`;

const ExitWarningBody = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
`;

const ExitWarningRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin-bottom: 12px;
  width: 100%;
`;

const ExitRowIcon = styled.div`
  height: 100%;
  width: 10%;
  margin-right: 20px;
`;

const ExitRowContent = styled.div`
  flex-grow: 1;
  height: 100%;
`;

const ExitWarningHeader = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  margin-bottom: 30px;

  span {
    font-family: cera-medium;
    font-size: 24px;
    padding-top: 20px;
  }
`;

const ExitWarningImage = styled.div`
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ExitWarning = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  min-height: 500px;
`;

const ModalContentWrapper = styled.div`
  width: 100%;
`;

const StyledArrowWrapper = styled.div`
  height: 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
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

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
  }
`;

export default React.memo(WithdrawModal);
