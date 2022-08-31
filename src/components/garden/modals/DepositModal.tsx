import UniswapWidget from './UniswapWidget';
import ReferralImage from './referral.svg';
import { GardenTokenIcon } from 'components/shared/Icons';
import { BaseModal, TokenInput, Icon, TxLoader, TurquoiseButton, Member } from 'components/shared';
import { TransactionType, TxChecklist, Fees } from './components/';

import addresses from 'constants/addresses';
import usePoller from 'hooks/Poller';
import {
  formatToGas,
  formatReserveDisplay,
  formatReserveFloat,
  parseReserve,
  formatEtherDecimal,
} from 'helpers/Numbers';
import { FullGardenDetails, TxType, IconName, Token, GardenPermission, QuoteResult } from 'models/';
import { QuoteService, TokenListService, UserPreferenceService } from 'services';
import {
  calculateMaxFee,
  calculateGasLimit,
  canUseSignature,
  getAllowancePerReserve,
  getStepPerReserve,
  calculateGardenTokensFromReserve,
} from './utils/';
import { buildDepositMessage, SignatureTransactionType, submitSignatureTransaction } from 'utils/SignatureTransaction';
import {
  BREAKPOINTS,
  ETH_CURVE_ADDRESS,
  HEART_GARDEN_ADDRESS,
  GAS_PRICES_STALE_AFTER_MSECS,
  MAX_DEPOSIT_BY_SIG_GAS,
  MAX_GAS_FULL_SUBSIDY_PRICE,
  SUBSIDY_ACTIVE,
  ZERO_ADDRESS,
  DEFAULT_CONFIRM_STATES,
  IS_MAINNET,
} from 'config';
import { useW3Context } from 'context/W3Provider';
import { wrapAwait } from 'utils/AwaitWrapper';
import { loadContractFromNameAndAddress, getAddressByName } from 'hooks/ContractLoader';
import { BABLToken, BabController, BabControllerLocal } from 'constants/contracts';

import { BigNumber } from '@ethersproject/bignumber';
import { Box, Loader } from 'rimble-ui';
import { Contract } from '@ethersproject/contracts';
import { Mixpanel } from 'Mixpanel';
import { isMobile } from 'react-device-detect';
import { parseUnits } from '@ethersproject/units';
import styled from 'styled-components';
import React, { useState, useEffect, useRef } from 'react';

interface DepositModalProps {
  gardenDetails: FullGardenDetails;
  buttonText?: string;
  inverted?: boolean;
  accessOverride?: boolean;
  gardenContract: Contract;
  reserveContract: Contract;
  userPermissions: GardenPermission;
  refetch: () => void;
}

function DepositModal({
  buttonText = 'Deposit',
  inverted,
  gardenDetails,
  refetch,
  accessOverride,
  gardenContract,
  reserveContract,
}: DepositModalProps) {
  const {
    accountantBalance,
    address,
    betaAccess,
    canSubmitTx,
    fetchNewGasPrices,
    gasPrices,
    notify,
    quotes,
    signatureSupported,
    txProvider,
    provider,
    userPrefs,
  } = useW3Context();

  const [txReady, setTxReady] = useState<any | undefined>(undefined);
  const [approvalReady, setApprovalReady] = useState<any | undefined>(undefined);
  const [approvalStatus, setApprovalStatus] = useState<string>('check'); // check - loading - required - loading - completed
  const [reserveBalance, setReserveBalance] = useState<BigNumber | undefined>(undefined);
  const [gardenReferralRewards, setGardenReferralRewards] = useState<BigNumber | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [isSignatureSelected, setIsSignatureSelected] = useState(
    canUseSignature(accountantBalance, signatureSupported),
  );
  const [confirmations, setConfirmations] = useState(
    gardenDetails.depositHardlock?.gt(86400) ? { ...DEFAULT_CONFIRM_STATES, lock: false } : DEFAULT_CONFIRM_STATES,
  );
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [confirmSignatureWaiting, setConfirmSignatureWaiting] = useState<boolean>(false);
  const [defaultGasLimit, setDefaultGasLimit] = useState<BigNumber | undefined>(undefined);
  const [estimatedGasETH, setEstimatedGasETH] = useState<BigNumber>(BigNumber.from(0));
  const [gasFetchedAt, setGasFetchedAt] = useState<number | undefined>(undefined);
  const [maxFee, setMaxFee] = useState<BigNumber>(BigNumber.from(0));
  const innerRef = useRef<HTMLInputElement>();

  const tokenListService = TokenListService.getInstance();
  const userPrefsService = UserPreferenceService.getInstance();
  const referralFrom =
    userPrefsService.getReferral() && userPrefsService.getReferral().toLowerCase() !== address?.toLowerCase()
      ? userPrefsService.getReferral()
      : '';
  const referrer = referralFrom ? referralFrom : ZERO_ADDRESS;

  const reserveAsset = gardenDetails.reserveToken as Token;
  const quoteService = QuoteService.getInstance();
  const usingSignature = canUseSignature(accountantBalance, signatureSupported) && isSignatureSelected;
  const currentGasPrice = formatToGas(gasPrices?.fast || 0);
  const shouldWarnGas = currentGasPrice >= MAX_GAS_FULL_SUBSIDY_PRICE;
  const isGasPriceStale = !gasFetchedAt || Date.now() - gasFetchedAt > GAS_PRICES_STALE_AFTER_MSECS;
  const depositBN = parseReserve(depositAmount.toString(), reserveAsset);
  const safeAmountBN = parseUnits(depositAmount.toFixed(16).toString() || '0', 18);
  const underGardenMax = depositBN.lte(gardenDetails.maxDepositLimit.sub(gardenDetails.principal));
  const receivingAmount = calculateGardenTokensFromReserve(gardenDetails.sharePrice, safeAmountBN, reserveAsset);
  const receivingAmountAfterFees = calculateGardenTokensFromReserve(
    gardenDetails.sharePrice,
    safeAmountBN.sub(maxFee).gt(0) ? safeAmountBN.sub(maxFee) : BigNumber.from(0),
    reserveAsset,
  );
  const reserveInFiat =
    quoteService.getQuoteForReserveAndCurrency(reserveAsset.symbol, userPrefs?.currency || 'USD', quotes as QuoteResult)
      ?.price || 0;
  const isSubsidy = SUBSIDY_ACTIVE && currentGasPrice <= MAX_GAS_FULL_SUBSIDY_PRICE * 4 && isSignatureSelected;
  const isFullSubsidy = isSubsidy && currentGasPrice <= MAX_GAS_FULL_SUBSIDY_PRICE;
  let gasDivisor = currentGasPrice <= MAX_GAS_FULL_SUBSIDY_PRICE * 2 ? 2 : 4;
  let receivingBN = receivingAmountAfterFees;
  if (usingSignature) {
    if (isFullSubsidy) {
      receivingBN = receivingAmount;
      gasDivisor = 1;
    } else {
      const difference = receivingAmount.sub(receivingAmountAfterFees);
      receivingBN = receivingAmount.add(difference.div(gasDivisor));
    }
  }
  const ethPrice = quoteService.getQuoteForReserveAndCurrency(
    'ETH',
    userPrefs?.currency || 'USD',
    quotes as QuoteResult,
  )?.price;
  const isConfirmed = confirmations.terms === true && confirmations.risk === true && confirmations.lock === true;
  const isValid =
    reserveBalance && depositBN.gte(gardenDetails.minContribution) && underGardenMax && depositBN.lte(reserveBalance);
  let error: string = '';
  if (!isValid && !underGardenMax) {
    if (gardenDetails.maxDepositLimit.sub(gardenDetails.principal).lt(0)) {
      error = 'Garden already full';
    } else {
      error =
        'Deposit total must be less than ' +
        formatReserveDisplay(gardenDetails.maxDepositLimit.sub(gardenDetails.principal), reserveAsset);
    }
  } else if (!isValid && depositBN.lt(gardenDetails.minContribution)) {
    error = 'Deposit must be at least ' + formatReserveDisplay(gardenDetails.minContribution, reserveAsset);
  } else if (!isValid) {
    if (reserveBalance && reserveBalance.lt(gardenDetails.minContribution)) {
      error = `Wallet lacks minimum ${gardenDetails.reserveToken.symbol} required for deposit`;
    } else {
      error = 'Please enter a valid amount';
    }
  }
  const maxDepositAvailable = formatReserveFloat(
    reserveBalance ? reserveBalance : BigNumber.from(0),
    reserveAsset,
    4,
  ).toString();

  const updateGasPrices = async () => {
    if (isGasPriceStale) {
      fetchNewGasPrices();
      setGasFetchedAt(Date.now());
    }
  };

  const isHeart = gardenDetails.address.toLowerCase() === HEART_GARDEN_ADDRESS.toLowerCase();

  useEffect(() => {
    setGasEstimation();
    checkApprovalNeeded(depositAmount);
  }, [depositAmount, isSignatureSelected, gasFetchedAt]);

  const updateReserveBalance = async () => {
    let lockedBalance = BigNumber.from(0);
    if (gardenDetails.reserveAsset.toLowerCase() === addresses.tokens.BABL.toLowerCase()) {
      const bablContract = (await loadContractFromNameAndAddress(
        addresses.tokens.BABL,
        BABLToken,
        provider,
      )) as Contract;
      lockedBalance = await bablContract.viewLockedBalance(address);
    }

    setReserveBalance((await reserveContract.balanceOf(address)).sub(lockedBalance));
  };

  const fetchReferralInformation = async () => {
    const controllerWeb3 = (await loadContractFromNameAndAddress(
      getAddressByName('BabControllerProxy'),
      IS_MAINNET ? BabController : BabControllerLocal,
      txProvider,
    )) as Contract;
    setGardenReferralRewards(await controllerWeb3.gardenAffiliateRates(gardenDetails.address));
  };

  useEffect(() => {
    async function init() {
      if (address) {
        await updateReserveBalance();
      }
      const defaultDepositAmount = formatReserveFloat(gardenDetails.minContribution, reserveAsset);
      setDepositAmount(defaultDepositAmount);
      checkApprovalNeeded(defaultDepositAmount);
      updateGasPrices();
    }

    if (showModal) {
      innerRef.current && innerRef.current.focus();
      init();
    }
    if (!gardenReferralRewards && address && referralFrom) {
      // no need to await
      fetchReferralInformation();
    }
  }, [showModal]);

  usePoller(async () => {
    // Do not reuse the isGasPriceStale variable here
    if (!gasFetchedAt || Date.now() - gasFetchedAt > GAS_PRICES_STALE_AFTER_MSECS) {
      setGasFetchedAt(undefined);
    }
  }, 30000);

  usePoller(async () => {
    if (address && showModal) {
      updateReserveBalance();
    }
  }, 5000);

  const setGasEstimation = async () => {
    let defaultGas: BigNumber;
    if (isValid && isGasPriceStale) {
      return updateGasPrices();
    }
    if (isValid && !usingSignature) {
      const depositTxGas = await wrapAwait(
        gardenContract.estimateGas.deposit(depositBN, 1, address, ZERO_ADDRESS, {
          value: 0,
        }),
        BigNumber.from(2000000),
        'Error Estimating Gas',
      );
      const calculatedLimit = calculateGasLimit(depositTxGas, gardenDetails).toFixed(0);
      defaultGas = BigNumber.from(calculatedLimit);
    } else {
      defaultGas = BigNumber.from(MAX_DEPOSIT_BY_SIG_GAS);
    }
    setDefaultGasLimit(defaultGas);
    if (gasPrices && quotes && ethPrice) {
      const { feeETH, feeReserve } = calculateMaxFee(
        ethPrice,
        defaultGas,
        gasPrices,
        reserveInFiat,
        reserveAsset,
        gasDivisor,
      );
      setMaxFee(feeReserve);
      setEstimatedGasETH(feeETH);
    } else {
      throw new Error('Failed to calculate maxFee for transaction, please try again later');
    }
  };

  const toggleModal = (): void => {
    setShowModal(!showModal);
    if (!showModal) {
      Mixpanel.track('open-deposit', { garden: gardenDetails.address });
    }
    if (!showModal === false) {
      onClear();
    }
  };

  const handleCheck = (e: any) => {
    const newConfirms = { ...confirmations };
    newConfirms[e.target.name] = !confirmations[e.target.name];
    setConfirmations(newConfirms);
  };

  const checkApprovalNeeded = async (amount: number) => {
    if (gardenDetails && address) {
      setApprovalStatus('loading');
      const allowance = await reserveContract.allowance(address, gardenDetails.address);
      setApprovalStatus(formatReserveFloat(allowance, reserveAsset) <= amount ? 'required' : 'completed');
    }
  };

  const handleApproveReserve = async () => {
    if (gardenDetails) {
      try {
        Mixpanel.track('approve', { garden: gardenDetails.address });
        setApprovalReady(
          reserveContract.approve(gardenDetails.address, getAllowancePerReserve(gardenDetails.reserveAsset), {
            gasLimit: 70000,
          }),
        );
        setApprovalStatus('loading');
      } catch (err) {
        console.log('Failed to approve ERC20 for creation deposit', err);
      }
    }
  };

  const handleSubmitDeposit = async (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isValid && isConfirmed && address && txProvider && gardenDetails && defaultGasLimit) {
      try {
        const minOutFloat = formatReserveFloat(receivingBN, reserveAsset);
        // Note: Hardcoded slippage amount of 5%, in the future we can let the user decide on this value.
        const minOutAfterSlippage = minOutFloat - minOutFloat * 0.05;
        const minAmountBN = parseReserve(String(minOutAfterSlippage), reserveAsset);

        if (usingSignature && gasPrices && maxFee) {
          const previousNonce = (await gardenContract.getContributor(address))[7] || BigNumber.from(0);
          Mixpanel.track('garden-deposit-start', {
            garden: gardenDetails.address,
            type: 'sig',
            amount: depositBN.toString(),
          });

          setConfirmSignatureWaiting(true);

          const signer = txProvider.getSigner();
          const payload = buildDepositMessage(
            address,
            depositBN,
            minAmountBN,
            maxFee,
            previousNonce,
            gardenDetails.address,
            address,
            referrer,
          );
          try {
            const response = await submitSignatureTransaction(
              payload,
              signer,
              SignatureTransactionType.deposit,
              notify,
            );
            if (response === undefined || !response.hash) {
              onClear();
              return;
            }
            setTxHash(response.hash);
          } catch (error) {
            onClear();
          } finally {
            setConfirmSignatureWaiting(false);
          }
        } else {
          Mixpanel.track('garden-deposit-start', {
            garden: gardenDetails.address,
            type: 'tx',
            amount: depositBN.toString(),
          });
          setTxReady(
            gardenContract.deposit(
              parseUnits(depositAmount.toString(), reserveAsset.decimals),
              minAmountBN,
              address,
              referrer,
              {
                gasLimit: defaultGasLimit,
                value: 0,
              },
            ),
          );
        }
      } catch (err) {
        console.log('Error during deposit ', err);
      }
    }
  };

  const onClear = () => {
    setDepositAmount(formatReserveFloat(gardenDetails.minContribution, reserveAsset));
    setConfirmations(DEFAULT_CONFIRM_STATES);
    setApprovalReady(undefined);
    setApprovalStatus('check');
    setTxReady(undefined);
    setShowModal(false);
  };

  const onFinish = () => {
    onClear();
    refetch();
  };

  const rewardAmount = gardenReferralRewards?.gt(0)
    ? safeAmountBN.mul(gardenReferralRewards).div(1e9).div(1e9)
    : BigNumber.from(0);

  const canAccessModal = betaAccess || accessOverride;
  return (
    <Box className="DepositModal">
      <TurquoiseButton width={isMobile ? '100%' : undefined} onClick={toggleModal} inverted={inverted} disabled={true}>
        {!address ? 'Connect Wallet to Deposit' : !canAccessModal ? 'Join Beta to Deposit' : buttonText}
      </TurquoiseButton>
      {approvalReady && (
        <TxLoader
          customConfirmationText={`${reserveAsset.symbol} approved. Ready to Deposit!`}
          inModal
          txObject={approvalReady}
          waitForConfirmation
          onConfirm={(success?: boolean) => {
            if (success) {
              setApprovalReady(undefined);
              setApprovalStatus('completed');
            } else {
              checkApprovalNeeded(depositAmount);
            }
          }}
        />
      )}
      <BaseModal width={isMobile ? '100vw' : ''} isOpen={showModal} toggleModal={toggleModal}>
        <ModalCard>
          {!txReady && !txHash && (
            <>
              <ModalHeadingRow>Deposit</ModalHeadingRow>
              <ModalContentWrapper>
                {!reserveBalance && <Loader size={60} />}
                {showModal &&
                  reserveBalance &&
                  maxFee &&
                  gardenDetails.reserveAsset &&
                  reserveBalance.lt(gardenDetails.minContribution) && (
                    <UniswapWidget
                      reserveToken={gardenDetails.reserveToken}
                      balance={reserveBalance}
                      minContribution={gardenDetails.minContribution}
                      maxFee={isSignatureSelected ? maxFee : undefined}
                    />
                  )}
                {reserveBalance?.gte(gardenDetails.minContribution) && (
                  <>
                    <TransactionType
                      type={TxType.deposit}
                      setUsingSignature={setIsSignatureSelected}
                      canUseSignature={canUseSignature(accountantBalance, signatureSupported)}
                      usingSignature={usingSignature}
                    />
                    <TokenInput
                      pb={'10px'}
                      inputLabel={
                        <DepositInputLabelWrapper>
                          <span>
                            {`Depositing (Min Deposit: ${formatReserveDisplay(
                              gardenDetails.minContribution,
                              reserveAsset,
                            )})`}
                          </span>
                        </DepositInputLabelWrapper>
                      }
                      tokenName={gardenDetails.reserveToken.name}
                      tokenSymbol={gardenDetails.reserveToken.symbol}
                      tokenIcon={
                        <img alt="token-symbol" src={gardenDetails.reserveToken.logoURI} height={24} width={24} />
                      }
                      displayBalance={formatReserveDisplay(reserveBalance, reserveAsset)}
                      innerRef={innerRef}
                      max={maxDepositAvailable}
                      min={'0'}
                      step={getStepPerReserve(gardenDetails.reserveAsset)}
                      showMaxButton={reserveBalance.gt(0)}
                      setMax={() => setDepositAmount(formatReserveFloat(reserveBalance, reserveAsset, 4) - 0.0001)}
                      name="input-giving-deposit"
                      onChange={(e) => setDepositAmount(Number(e.target.value) || 0)}
                      amount={depositAmount}
                      error={error}
                      valid={isValid && underGardenMax}
                    />
                    <StyledArrowWrapper>
                      <Icon name={IconName.arrowDown} size={20} color={'var(--turquoise-01)'} />
                    </StyledArrowWrapper>
                    <TokenInput
                      pb={'10px'}
                      inputLabel="Receiving"
                      primary={false}
                      disabled
                      name="input-receiving-deposit"
                      tokenName="Garden Token"
                      tokenSymbol={`${gardenDetails.name} (${gardenDetails.symbol})`}
                      tokenIcon={isHeart ? <Icon name={IconName.heartFull} size={24} /> : <GardenTokenIcon size={24} />}
                      amount={formatEtherDecimal(receivingBN)}
                    />
                    <TxChecklist
                      confirmations={confirmations}
                      depositHardlock={gardenDetails.depositHardlock}
                      handleCheck={handleCheck}
                      txType={TxType.deposit}
                    />
                    {gardenReferralRewards?.gt(0) && referralFrom && (
                      <ReferralBonus>
                        <ReferralText>
                          <ReferralTitle>Referral Bonus!</ReferralTitle>
                          <ReferralFrom>
                            <Member size={6} address={referralFrom} link showText />
                            <span>
                              referral will give you <b>{formatEtherDecimal(rewardAmount)} BABL</b>
                            </span>
                          </ReferralFrom>
                        </ReferralText>
                        <img alt="referral-img" src={ReferralImage} height={'92px'} />
                      </ReferralBonus>
                    )}
                    {ethPrice && (
                      <Fees
                        isSignatureSelected={isSignatureSelected}
                        userCurrency={userPrefs?.currency || 'USD'}
                        shouldWarnGas={shouldWarnGas}
                        ethAsset={tokenListService.getTokenByAddress('0x') as Token}
                        reserveAsset={reserveAsset}
                        fullSubsidy={isFullSubsidy}
                        isSubsidy={isSubsidy}
                        estimateGasETH={isFullSubsidy && usingSignature ? BigNumber.from(0) : estimatedGasETH}
                        receivingAmountAfterFees={receivingBN}
                        reserveInFiat={reserveInFiat}
                        ethPrice={ethPrice}
                        receivingSymbol={gardenDetails.symbol}
                        isDeposit
                      />
                    )}
                    <StyledButtonRowWrapper>
                      {(approvalStatus === 'required' || approvalStatus === 'loading') && (
                        <TurquoiseButton
                          onClick={handleApproveReserve}
                          disabled={approvalStatus === 'loading' || !isValid || !isConfirmed}
                        >
                          {approvalStatus === 'loading'
                            ? 'Approving...'
                            : `Approve ${gardenDetails.reserveToken?.symbol} Allowance`}
                        </TurquoiseButton>
                      )}
                      {approvalStatus === 'completed' && (
                        <TurquoiseButton
                          disabled={!isValid || !isConfirmed || confirmSignatureWaiting}
                          onClick={isGasPriceStale ? updateGasPrices : handleSubmitDeposit}
                        >
                          {confirmSignatureWaiting ? (
                            <Loader />
                          ) : !isGasPriceStale ? (
                            `Deposit ${isSignatureSelected ? 'by signature' : ''}`
                          ) : (
                            '(Gas Price Out of Date) Refresh'
                          )}
                        </TurquoiseButton>
                      )}
                    </StyledButtonRowWrapper>
                  </>
                )}
              </ModalContentWrapper>
            </>
          )}
          {(txReady || txHash) && (
            <TxLoader
              customConfirmationText={'Deposit Completed'}
              type={TxType.deposit}
              txHash={txHash}
              txObject={txReady}
              onConfirm={() => {
                Mixpanel.track('garden-deposit-end', { garden: gardenDetails.address });
                onFinish();
              }}
              waitForConfirmation
            />
          )}
        </ModalCard>
      </BaseModal>
    </Box>
  );
}

const ModalContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  min-height: 150px;
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
  margin-top: 20px;
  width: 100%;
  > button {
    width: 100%;
  }
`;

const ReferralBonus = styled.div`
  display: flex;
  flex-flow: row nowrap;
  position: relative;
  justify-content: space-between;
  height: 66px;
  overflow: visible;
  margin-top: 24px;
  margin-bottom: 24px;
  color: var(--blue);
  width: 100%;
  background: linear-gradient(89.71deg, var(--yellow) 59.02%, rgba(255, 190, 68, 0) 96.97%);
  border-radius: 4px;
  padding: 12px;

  img {
    position: absolute;
    right: 0;
    top: -30px;
  }
`;

const ReferralText = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 80%;
`;

const ReferralTitle = styled.div`
  width: 100%;
  font-weight: bold;
  font-size: 16px;
`;

const ReferralFrom = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  width: 100%;
  font-size: 13px;

  span {
    margin-left: 3px;
  }

  span b,
  a div {
    font-weight: bold;
    font-size: 16px;
    color: var(--blue);
  }
`;

const DepositInputLabelWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;

  a {
    color: white;
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    span {
      font-size: 14px;
    }
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
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
  }
`;

export default DepositModal;
