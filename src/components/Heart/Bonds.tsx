import {
  BaseModal,
  PurpleButton,
  WhiteButton,
  TurquoiseButton,
  TokenDisplay,
  TokenInput,
  Icon,
  TxLoader,
  BaseLoader,
} from 'components/shared';
import UniswapWidget from 'components/garden/modals/UniswapWidget';

import addresses from 'constants/addresses';
import usePoller from 'hooks/Poller';
import {
  BREAKPOINTS,
  MAX_GAS_FULL_SUBSIDY_PRICE,
  MAX_DEPOSIT_BY_SIG_GAS,
  GAS_PRICES_STALE_AFTER_MSECS,
  SUBSIDY_ACTIVE,
  ZERO_ADDRESS,
  MAX_BOND_ASSET,
  HEART_ADDRESS,
  HEART_LOCKING_PERIODS,
  DEFAULT_CONFIRM_STATES,
} from 'config';
import {
  calculateMaxFee,
  calculateGasLimit,
  canUseSignature,
  calculateGardenTokensFromReserve,
  calculateLockDiscount,
} from 'components/garden/modals/utils';
import { buildBondMessage, SignatureTransactionType, submitSignatureTransaction } from 'utils/SignatureTransaction';
import { formatReserveFloat, parseReserve, formatToGas } from 'helpers/Numbers';
import { TransactionType, LockPeriods, TxChecklist, Fees } from 'components/garden/modals/components/';
import { getAddressByName, loadContractFromNameAndAddress } from 'hooks/ContractLoader';
import { HeartDetails, HeartBond, Token, IconName, QuoteResult, TxType } from 'models';
import { useW3Context } from 'context/W3Provider';
import { wrapAwait } from 'utils/AwaitWrapper';
import { TokenListService, ViewerService, QuoteService } from 'services';
import { IERC20, Heart } from 'constants/contracts';

import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { Mixpanel } from 'Mixpanel';
import styled from 'styled-components';
import React, { useState, useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';

interface BondsProps {
  heartDetails: HeartDetails;
  gardenContract: Contract;
  reserveContract: Contract;
  refetch: () => void;
  isBABL?: boolean;
}

const Bonds = ({ heartDetails, gardenContract, refetch, isBABL }: BondsProps) => {
  const {
    accountantBalance,
    address,
    connect,
    fetchNewGasPrices,
    gasPrices,
    notify,
    quotes,
    signatureSupported,
    txProvider,
    userPrefs,
  } = useW3Context();

  const [txReady, setTxReady] = useState<any | undefined>(undefined);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [approvalReady, setApprovalReady] = useState<any | undefined>(undefined);
  const [approvalStatus, setApprovalStatus] = useState<string>('check');
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [bondSelected, setBondSelected] = useState<HeartBond | undefined>(
    isBABL
      ? heartDetails.bonds.find((b: HeartBond) => b.address.toLowerCase() === addresses.tokens.BABL.toLowerCase())
      : undefined,
  );
  const minLock = heartDetails.gardenDetails?.contribution?.userLock.toNumber() || HEART_LOCKING_PERIODS[0].seconds;
  const [bondAssetBalance, setBondAssetBalance] = useState<BigNumber | undefined>(undefined);
  const [bondAmount, setBondAmount] = useState<BigNumber | undefined>(undefined);
  const [bablDepositAmount, setBablDepositAmount] = useState<BigNumber | undefined>(undefined);
  const [defaultGasLimit, setDefaultGasLimit] = useState<BigNumber | undefined>(undefined);
  const [confirmSignatureWaiting, setConfirmSignatureWaiting] = useState<boolean>(false);
  const [estimatedGasETH, setEstimatedGasETH] = useState<BigNumber>(BigNumber.from(0));
  const [userLock, setUserLock] = useState<number>(minLock);
  const [confirmations, setConfirmations] = useState({ ...DEFAULT_CONFIRM_STATES, lock: false });
  const [gasFetchedAt, setGasFetchedAt] = useState<number | undefined>(undefined);
  const [isSignatureSelected, setIsSignatureSelected] = useState(
    canUseSignature(accountantBalance, signatureSupported),
  );
  const [maxFee, setMaxFee] = useState<BigNumber>(BigNumber.from(0));
  const innerRef = useRef<HTMLInputElement>();

  const tokenListService = TokenListService.getInstance();
  const viewerService = ViewerService.getInstance();
  const quoteService = QuoteService.getInstance();
  const usingSignature = canUseSignature(accountantBalance, signatureSupported) && isSignatureSelected;
  const currentGasPrice = formatToGas(gasPrices?.fast || 0);
  const isSubsidy = SUBSIDY_ACTIVE && currentGasPrice <= MAX_GAS_FULL_SUBSIDY_PRICE * 4 && usingSignature;
  const isFullSubsidy = isSubsidy && currentGasPrice <= MAX_GAS_FULL_SUBSIDY_PRICE;
  let gasDivisor = currentGasPrice <= MAX_GAS_FULL_SUBSIDY_PRICE * 2 ? 2 : 4;
  const gardenDetails = heartDetails.gardenDetails;
  const reserveAsset = gardenDetails.reserveToken as Token;
  const isGasPriceStale = !gasFetchedAt || Date.now() - gasFetchedAt > GAS_PRICES_STALE_AFTER_MSECS;
  const underGardenMax =
    bablDepositAmount && bablDepositAmount.lte(gardenDetails.maxDepositLimit.sub(gardenDetails.principal));
  const tokenSelected: Token | undefined = bondSelected
    ? (tokenListService.getTokenByAddress(bondSelected.address) as Token)
    : undefined;

  const referrer = ZERO_ADDRESS;
  const bablDepositingSafe = bablDepositAmount || BigNumber.from(0);
  const receivingAmount = calculateGardenTokensFromReserve(gardenDetails.sharePrice, bablDepositingSafe, reserveAsset);
  const receivingAmountAfterFees = calculateGardenTokensFromReserve(
    gardenDetails.sharePrice,
    bablDepositingSafe.sub(maxFee).gt(0) ? bablDepositingSafe.sub(maxFee) : BigNumber.from(0),
    reserveAsset,
  );
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

  const hbabl = tokenListService.getTokenByAddress(addresses.tokens.hBABL) as Token;
  const babl = tokenListService.getTokenByAddress(addresses.tokens.BABL) as Token;
  const ethPrice = quoteService.getQuoteForReserveAndCurrency(
    'ETH',
    userPrefs?.currency || 'USD',
    quotes as QuoteResult,
  )?.price;
  const reserveInFiat =
    quoteService.getQuoteForReserveAndCurrency(reserveAsset.symbol, userPrefs?.currency || 'USD', quotes as QuoteResult)
      ?.price || 0;

  const isValid =
    bablDepositAmount &&
    bablDepositAmount.gte(gardenDetails.minContribution) &&
    underGardenMax &&
    bondAmount &&
    bondAmount.gt(0);

  let error: string = '';
  if (!isValid && bondSelected) {
    if (!bondAssetBalance?.gt(0)) {
      error = `You need to acquire ${bondSelected.name}`;
    } else if (!bablDepositAmount?.gte(gardenDetails.minContribution)) {
      error = `Your ${bondSelected.name} is not enough`;
    } else if (!underGardenMax) {
      error = 'Over Heart capacity';
    }
  }

  useEffect(() => {
    const init = async () => {
      await updateGasPrices();
    };
    init();
  }, [address, showModal]);

  useEffect(() => {
    const loadBondAssetBalance = async () => {
      if (bondSelected && address) {
        setLoading(true);
        if (!bondAssetBalance || !bondAmount) {
          await refreshBondAssetBalance(bondSelected);
        } else {
          const bablinAssetPrice = await viewerService.getBablAsReserve(bondSelected.address, true);
          const fairAmount = bondAmount.mul(1e9).mul(1e9).div(bablinAssetPrice[0]);
          // Add lock discount if any
          const discount = bondSelected.discount + calculateLockDiscount(userLock);
          const finalAmount = fairAmount.add(
            fairAmount
              .div(100)
              .mul(discount * 100)
              .div(100),
          );
          setBablDepositAmount(finalAmount);
          await setGasEstimation();
          await checkApprovalNeeded();
        }
        setLoading(false);
      }
    };
    loadBondAssetBalance();
  }, [bondSelected, address, bondAssetBalance, isSignatureSelected, bondAmount, userLock]);

  usePoller(async () => {
    if (address && bondSelected) {
      refreshBondAssetBalance(bondSelected);
    }
    // Do not reuse the isGasPriceStale variable here
    if (!gasFetchedAt || Date.now() - gasFetchedAt > GAS_PRICES_STALE_AFTER_MSECS) {
      setGasFetchedAt(undefined);
    }
  }, 30000);

  const updateGasPrices = async () => {
    if (isGasPriceStale) {
      fetchNewGasPrices();
      setGasFetchedAt(Date.now());
    }
  };

  const refreshBondAssetBalance = async (bondSelected: HeartBond) => {
    if (address && bondSelected) {
      const newBondAssetBalance = await viewerService.getTokenBalance(bondSelected.address, address);
      if (!bondAssetBalance || !newBondAssetBalance.eq(bondAssetBalance)) {
        setBondAssetBalance(newBondAssetBalance);
        setBondAmount(newBondAssetBalance);
      }
    }
  };

  const onClear = () => {
    setBondSelected(undefined);
    setBablDepositAmount(undefined);
    setApprovalReady(undefined);
    setApprovalStatus('check');
    setTxReady(undefined);
  };

  const onFinish = () => {
    setShowModal(false);
    refetch();
    onClear();
  };

  const setGasEstimation = async () => {
    let defaultGas: BigNumber;
    if (isValid && isGasPriceStale) {
      return updateGasPrices();
    }
    const heartContract = (await loadContractFromNameAndAddress(
      getAddressByName('HeartProxy'),
      Heart,
      txProvider,
    )) as Contract;
    if (isValid && !usingSignature && bondSelected && bondAssetBalance) {
      const depositTxGas = await wrapAwait(
        heartContract.estimateGas.bondAsset(bondSelected.address, bondAssetBalance, receivingBN, referrer, userLock, {
          value: 0,
        }),
        BigNumber.from(2000000),
        'Error Estimating Gas',
      );
      const calculatedLimit = calculateGasLimit(depositTxGas, gardenDetails);
      defaultGas = BigNumber.from(calculatedLimit < MAX_BOND_ASSET ? MAX_BOND_ASSET : calculatedLimit.toFixed(0));
    } else {
      defaultGas = BigNumber.from(MAX_DEPOSIT_BY_SIG_GAS).mul(13).div(10);
    }
    setDefaultGasLimit(defaultGas);
    if (gasPrices && ethPrice) {
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
      throw new Error('Failed to calculate maxFee for bond transaction, please try again later');
    }
  };

  const checkApprovalNeeded = async () => {
    if (bondSelected && address && bondAmount) {
      setApprovalStatus('loading');
      const bondContract = (await loadContractFromNameAndAddress(bondSelected.address, IERC20, txProvider)) as Contract;
      const allowance = await bondContract.allowance(address, getAddressByName('HeartProxy'));
      setApprovalStatus(allowance.lt(bondAmount) ? 'required' : 'completed');
    }
  };

  const handleApproveReserve = async () => {
    if (bondSelected && bondAmount) {
      try {
        const bondContract = (await loadContractFromNameAndAddress(
          bondSelected.address,
          IERC20,
          txProvider,
        )) as Contract;
        Mixpanel.track('approve-bond', { bond: bondSelected.address });
        setApprovalReady(bondContract.approve(getAddressByName('HeartProxy'), bondAmount));
        setApprovalStatus('loading');
      } catch (err) {
        console.error('Failed to approve ERC20 for bond', err);
      }
    }
  };

  const handleCheck = (e: any) => {
    const newConfirms = { ...confirmations };
    newConfirms[e.target.name] = !confirmations[e.target.name];
    setConfirmations(newConfirms);
  };

  const handleSubmitDeposit = async (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (
      isValid &&
      address &&
      txProvider &&
      gardenDetails &&
      defaultGasLimit &&
      bondAmount &&
      bondSelected &&
      receivingBN
    ) {
      try {
        const minOutFloat = formatReserveFloat(receivingBN, hbabl);
        // Note: Hardcoded slippage amount of 5%, in the future we can let the user decide on this value.
        const minOutAfterSlippage = minOutFloat - minOutFloat * 0.05;
        const minAmountBN = parseReserve(String(minOutAfterSlippage), hbabl);
        const heartContract = (await loadContractFromNameAndAddress(
          getAddressByName('HeartProxy'),
          Heart,
          txProvider,
        )) as Contract;

        if (usingSignature && gasPrices && maxFee && bablDepositAmount) {
          const previousNonce = (await gardenContract.getContributor(address))[7] || BigNumber.from(0);
          Mixpanel.track('bond-deposit-start', {
            garden: gardenDetails.address,
            bond: bondSelected.address,
            type: 'sig',
            amount: bondAmount,
          });

          setConfirmSignatureWaiting(true);
          const payload = buildBondMessage(
            address,
            bondSelected.address,
            bablDepositAmount,
            bondAmount,
            minAmountBN,
            previousNonce,
            maxFee,
            gardenDetails.address,
            address,
            referrer,
            userLock,
          );
          const signer = txProvider.getSigner();
          try {
            const response = await submitSignatureTransaction(payload, signer, SignatureTransactionType.bond, notify);
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
          Mixpanel.track('bond-deposit-start', {
            garden: gardenDetails.address,
            bond: bondSelected.address,
            type: 'tx',
            amount: bondAmount.toString(),
          });
          setTxReady(
            heartContract.bondAsset(bondSelected.address, bondAmount, minAmountBN, referrer, BigNumber.from(userLock), {
              gasLimit: defaultGasLimit,
              value: 0,
            }),
          );
        }
      } catch (err) {
        console.error('Error during bond ', err);
      }
    }
  };

  const bondAssetToken = tokenListService.getTokenByAddress(bondSelected?.address || addresses.tokens.DAI) as Token;
  const hasEnoughToBond =
    bondAssetBalance?.gt(0) &&
    bablDepositAmount &&
    bondAmount &&
    bablDepositAmount
      .mul(bondAssetBalance)
      .div(bondAmount.gt(0) ? bondAmount : 1)
      ?.gte(gardenDetails.minContribution);

  const connectOrShow = (e: any) => {
    if (!address) {
      connect(e);
    } else {
      setShowModal(true);
    }
  };

  return (
    <BondsContainer>
      {isBABL && (
        <TurquoiseButton width={isMobile ? '100%' : undefined} onClick={connectOrShow}>
          {!address ? 'Connect' : 'Stake'}
        </TurquoiseButton>
      )}
      {!isBABL && <BondsButton onClick={connectOrShow}>{address ? 'Bond' : 'Connect'}</BondsButton>}
      <BaseModal width={isMobile ? '100%' : '460px'} isOpen={showModal} toggleModal={() => setShowModal(!showModal)}>
        <ModalCard>
          {!txReady && !txHash && (
            <>
              {loading && !bondSelected && (
                <LoaderWrapper>
                  <BaseLoader size={60} />
                </LoaderWrapper>
              )}
              {!loading && !bondSelected && (
                <>
                  <ModalHeadingRow>Bond and receive a bonus in staked BABL</ModalHeadingRow>
                  <ModalContentWrapper>
                    <BondSubtitle>Lock Period: 6 months - 4 years</BondSubtitle>
                    <BondTable>
                      <BondHeaderRow>
                        <BondHeaderField key={'asset'}>Asset</BondHeaderField>
                        <BondHeaderField key={'bonus'}>Bonus</BondHeaderField>
                      </BondHeaderRow>
                      {heartDetails.bonds.map((bond: HeartBond) => (
                        <BondRow
                          onClick={() => {
                            if (bond !== bondSelected) {
                              setBondSelected(bond);
                              setBondAssetBalance(undefined);
                              setBondAmount(undefined);
                              innerRef.current && innerRef.current.focus();
                            }
                          }}
                          key={bond.address}
                        >
                          <BondRowAssetField>
                            <TokenDisplay
                              size={isMobile ? 22 : 28}
                              token={tokenListService.getTokenByAddress(bond.address) as Token}
                            />
                          </BondRowAssetField>
                          <BondRowDiscountField>
                            {parseFloat(bond.discount.toString()).toFixed(2).toString()}%
                          </BondRowDiscountField>
                          <BondRowButton onClick={() => {}}>Bond</BondRowButton>
                        </BondRow>
                      ))}
                    </BondTable>
                  </ModalContentWrapper>
                </>
              )}
              {bondSelected && tokenSelected && (
                <>
                  <ModalHeadingRow>
                    <BackArrow onClick={() => setBondSelected(undefined)}>
                      <Icon name={IconName.backArrow} /> Back
                    </BackArrow>
                    <BondSelectedTitle>
                      Bond {bondSelected.name} (Min {formatReserveFloat(gardenDetails.minContribution, babl, 0)} BABL)
                    </BondSelectedTitle>
                  </ModalHeadingRow>
                  <TransactionType
                    type={TxType.bond}
                    setUsingSignature={setIsSignatureSelected}
                    canUseSignature={canUseSignature(accountantBalance, signatureSupported)}
                    usingSignature={usingSignature}
                  />
                  <BondAmounts>
                    <BigTokenContainer>
                      <TokenDisplay size={92} symbol={false} token={tokenSelected} />
                      <BigTokenName>{bondSelected.name}</BigTokenName>
                      <BigTokenAmount>
                        {loading && !bondAmount && <MinLoader size={16} />}
                        {!loading && bondAmount && !hasEnoughToBond && (
                          <>
                            {bondSelected.address === '0x705b3aCaF102404CfDd5e4A60535E4e70091273C'
                              ? bondAmount.toString()
                              : formatReserveFloat(bondAmount, tokenSelected, 2)}
                          </>
                        )}
                        {hasEnoughToBond && bondAssetBalance && bondAmount && (
                          <>
                            {bondSelected.address === '0x705b3aCaF102404CfDd5e4A60535E4e70091273C' && (
                              <>bondAmount.toString()</>
                            )}
                            {bondSelected.address !== '0x705b3aCaF102404CfDd5e4A60535E4e70091273C' && (
                              <StyledMinTokenInput
                                tokenName={gardenDetails.reserveToken.name}
                                tokenSymbol={gardenDetails.reserveToken.symbol}
                                tokenIcon={<div />}
                                innerRef={innerRef}
                                max={formatReserveFloat(bondAssetBalance, reserveAsset, 4).toString()}
                                min={'0'}
                                step={'1'}
                                showMaxButton={bondAmount?.gt(0)}
                                setMax={() => setBondAmount(bondAssetBalance)}
                                name="input-giving-deposit"
                                onChange={(e) => setBondAmount(parseReserve(e.target.value || '0', reserveAsset))}
                                amount={formatReserveFloat(bondAmount, reserveAsset)}
                                error={error}
                                minimal
                                valid={isValid && underGardenMax}
                              />
                            )}
                          </>
                        )}
                      </BigTokenAmount>
                      <BigTokenBonus></BigTokenBonus>
                    </BigTokenContainer>
                    <Icon name={IconName.rightArrow} size={24} />
                    <BigTokenContainer>
                      <TokenDisplay size={92} symbol={false} token={hbabl} />
                      <BigTokenName>hBABL</BigTokenName>
                      <BigTokenAmount>
                        {loading && <MinLoader size={18} />}
                        {!loading && formatReserveFloat(receivingBN, babl, 2)}
                      </BigTokenAmount>
                      <BigTokenBonus>
                        {bondSelected.discount > 0 && <>({bondSelected.discount}% Bonus)</>}
                      </BigTokenBonus>
                    </BigTokenContainer>
                  </BondAmounts>
                  {!loading && !hasEnoughToBond && bondAssetBalance && (
                    <>
                      {bondSelected.link && (
                        <WidgetLink href={bondSelected.link} target="_blank" rel="noopener noreferrer">
                          <Icon name={IconName.link} size={16} />
                          Need {bondSelected.name}? Acquire it here
                        </WidgetLink>
                      )}
                      {!bondSelected.link && (
                        <UniswapWidget
                          reserveToken={bondAssetToken}
                          balance={bondAssetBalance || BigNumber.from(0)}
                          minContribution={gardenDetails.minContribution}
                          maxFee={isSignatureSelected ? (isFullSubsidy ? BigNumber.from(0) : maxFee) : undefined}
                        />
                      )}
                    </>
                  )}
                  {hasEnoughToBond && (
                    <>
                      <LockPeriods minLock={minLock} selectedLock={userLock} setLock={setUserLock} />
                      {ethPrice && (
                        <Fees
                          isSignatureSelected={isSignatureSelected}
                          userCurrency={userPrefs?.currency || 'USD'}
                          shouldWarnGas={currentGasPrice >= MAX_GAS_FULL_SUBSIDY_PRICE}
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
                          votingPower={heartDetails.gardenDetails?.contribution?.votingPower || BigNumber.from(0)}
                          bonus={bondSelected.discount + calculateLockDiscount(userLock)}
                        />
                      )}
                      {approvalStatus === 'completed' && (
                        <StyledTxChecklist
                          confirmations={confirmations}
                          depositHardlock={BigNumber.from(userLock)}
                          handleCheck={handleCheck}
                          txType={TxType.bond}
                        />
                      )}
                    </>
                  )}
                  <StyledButtonRowWrapper>
                    {hasEnoughToBond && (approvalStatus === 'required' || approvalStatus === 'loading') && (
                      <TurquoiseButton
                        onClick={handleApproveReserve}
                        disabled={approvalStatus === 'loading' || !isValid}
                      >
                        {approvalStatus === 'loading' ? 'Approving...' : `Approve ${bondSelected.name} Allowance`}
                      </TurquoiseButton>
                    )}
                    {approvalStatus === 'completed' && (
                      <TurquoiseButton
                        disabled={!isValid || confirmSignatureWaiting}
                        onClick={isGasPriceStale ? updateGasPrices : handleSubmitDeposit}
                      >
                        {!isValid && error}
                        {isValid && (
                          <>
                            {loading || confirmSignatureWaiting ? (
                              <BaseLoader size={18} />
                            ) : !isGasPriceStale ? (
                              `Bond ${bondSelected.name} ${isSignatureSelected ? 'by signature' : ''}`
                            ) : (
                              '(Gas Price Out of Date) Refresh'
                            )}
                          </>
                        )}
                      </TurquoiseButton>
                    )}
                  </StyledButtonRowWrapper>
                </>
              )}
              {approvalReady && bondSelected && (
                <TxLoader
                  customConfirmationText={`${bondSelected.name} approved. Ready to Bond!`}
                  inModal
                  txObject={approvalReady}
                  waitForConfirmation
                  onConfirm={(success?: boolean) => {
                    if (success) {
                      setApprovalReady(undefined);
                      setApprovalStatus('completed');
                    } else {
                      checkApprovalNeeded();
                    }
                  }}
                />
              )}
            </>
          )}
          {(txReady || txHash) && (
            <TxLoader
              customConfirmationText={'Bond Completed'}
              type={TxType.bond}
              txHash={txHash}
              txObject={txReady}
              onConfirm={() => {
                Mixpanel.track('bond-deposit-end', { garden: gardenDetails.address, bond: bondSelected?.address });
                onFinish();
              }}
              waitForConfirmation
            />
          )}
        </ModalCard>
      </BaseModal>
    </BondsContainer>
  );
};

const BondsContainer = styled.div`
  display: flex;
  width: auto;
`;

const ModalContentWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;

const ModalHeadingRow = styled.div`
  font-size: 18px;
  font-family: cera-bold;
  color: var(--white);
  width: 255px;
`;

const ModalCard = styled.div`
  background-color: var(--modal-blue);
  border: none;
  display: flex;
  flex-flow: column nowrap;
  height: auto;
  width: 100%;
`;

const LoaderWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  min-height: 300px;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const BondSubtitle = styled.div`
  font-weight: normal;
  font-size: 13px;
  margin-top: 15px;
  color: white;
`;

const BondTable = styled.div`
  width: 412px;
  display: flex;
  flex-flow: column nowrap;
  margin: 55px 0 80px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
    margin: 20px 0;
  }
`;

const BondHeaderRow = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 12px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding-left: 12px;
  }
`;

const BondRow = styled(BondHeaderRow)`
  background: var(--blue-07);
  padding: 6px 12px;
  height: 40px;
  width: 100%;
  justify-content: space-between;
  cursor: pointer;

  &:hover button {
    visibility: visible;
  }
`;

const BondHeaderField = styled.div`
  width: 177px;
  font-size: 13px;
  color: white;
  height: 20px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 116px;
  }
`;

const BondRowAssetField = styled.div`
  font-size: 15px;
  width: 116px;
`;

const BondRowDiscountField = styled.div`
  font-size: 24px;
  color: var(--yellow);
  width: 124px;
  font-feature-settings: 'pnum' on, 'lnum' on;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 18px;
    font-family: cera-medium;
  }
`;

const BondsButton = styled(WhiteButton)`
  height: 48px;
  width: 89px;
  border-radius: 2px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    height: 40px;
    width: 79px;
  }
`;

const BondRowButton = styled(PurpleButton)`
  height: 24px !important;
  width: 50px !important;
  min-width: 50px;
  font-size: 13px;
  visibility: hidden;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    visibility: visible;
  }
`;

const BackArrow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    opacity: 0.8;
  }
`;

const BondSelectedTitle = styled.div`
  margin-top: 8px;
  font-weight: bold;
  font-size: 18px;
`;

const WidgetLink = styled.a`
  display: inline-flex;
  font-size: 16px;
  color: var(--turquoise-02);
  text-decoration: underline;
  cursor: pointer;
  margin-top: 4px;
  width: 100%;
  text-align: center;
  justify-content: center;

  &:visited,
  &:hover {
    color: var(--turquoise-02);
  }

  > div {
    margin-right: 4px;
  }
`;

const BondAmounts = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  margin: 36px 0;
`;

const BigTokenContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  width: 150px;

  img {
    margin-right: 0;
  }
`;

const BigTokenName = styled.div`
  font-size: 15px;
  margin-top: 12px;
  text-align: center;
  width: 100%;
`;

const BigTokenAmount = styled.div`
  font-size: 24px;
  margin-top: 10px;
  width: 120px;
  text-align: center;
  height: 34px;
`;

const BigTokenBonus = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-top: 4px;
  width: 100%;
  text-align: center;
  color: var(--yellow);
  height: 23px;
`;

const StyledButtonRowWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  height: auto;
  margin-top: 20px;
  width: 100%;
  > button {
    width: 100%;
    height: 50px;
  }
`;

const MinLoader = styled(BaseLoader)`
  padding: 0;
`;

const StyledTxChecklist = styled(TxChecklist)`
  margin-top: 10px;
`;

const StyledMinTokenInput = styled(TokenInput)`
  height: auto;
  margin: 0;
  padding: 0;
  label {
    display: block !important;
    margin: 0;
    padding: 0;

    > div {
      display: none;
    }
  }

  input {
    font-size: 24px;
    margin: 0px;
    padding: 0px;
    text-align: center;
    background: var(--purple);
    border: 1px solid var(--border-blue);
  }
`;

export default React.memo(Bonds);
