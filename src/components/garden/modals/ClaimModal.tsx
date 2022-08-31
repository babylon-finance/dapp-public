import { Animation, BaseLoader, Icon } from 'components/shared';
import { AnimationName } from 'components/shared/Animation/Animation';
import { BaseModal, TxLoader, TurquoiseButton, GardenTable, HoverTooltip } from 'components/shared';
import { Fees, TransactionType, TxChecklist } from './components';
import { loadContractFromNameAndAddress } from 'hooks/ContractLoader';
import { canUseSignature, calculateGasLimit, calculateMaxFee } from './utils';
import { getProphetObject } from 'components/Prophets/Gallery/utils/getProphetObject';
import {
  Contributor,
  ContributorRewards,
  FullGardenDetails,
  IconName,
  ProphetNFT,
  QuoteResult,
  RewardRecord,
  Token,
  TxType,
} from 'models/';
import { Garden } from 'constants/contracts';
import {
  BREAKPOINTS,
  GAS_PRICES_STALE_AFTER_MSECS,
  MAX_GAS_FULL_SUBSIDY_PRICE,
  MAX_CLAIM_BY_SIG_GAS,
  HEART_GARDEN_ADDRESS,
  MAX_CLAIM_AND_STAKE_BY_SIG_GAS,
} from 'config';
import { TokenListService, getStakedForUserGarden, QuoteService, ViewerService } from 'services';
import {
  buildClaimMessage,
  buildClaimAndStakeMessage,
  SignatureTransactionType,
  submitSignatureTransaction,
} from 'utils/SignatureTransaction';
import { formatReserveDisplay, formatEtherDecimal, formatToGas } from 'helpers/Numbers';
import { useW3Context } from 'context/W3Provider';
import { getAllowancePerReserve, calculateGardenTokensFromReserve } from './utils';
import { wrapAwait } from 'utils/AwaitWrapper';
import { commify } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { isMobile } from 'react-device-detect';
import { Box, Loader } from 'rimble-ui';
import { Contract } from '@ethersproject/contracts';
import { Link } from 'react-router-dom';
import { Mixpanel } from 'Mixpanel';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';

interface ClaimModalProps {
  gardenContract: Contract;
  reserveContract: Contract;
  hasUnclaimed: boolean;
  gardenDetails: FullGardenDetails;
  refetch: () => void;
}

const DEFAULT_CONFIRM_STATES = {
  stake: true,
};

const TABLE_HEADERS = ['Category', 'Profit Split', 'BABL'];

interface ClaimDetailRowProps {
  label: string;
  rewards: RewardRecord;
  reserveAsset: Token;
  total?: boolean;
  pending?: boolean;
}

const ClaimDetailRow = ({ label, rewards, reserveAsset, total = false, pending = false }: ClaimDetailRowProps) => {
  return (
    <StyledClaimRow total={total}>
      <td>
        <RowAlign>
          {label}
          {pending && (
            <HoverTooltip
              size={14}
              color={'var(--blue-04)'}
              content={' * For estimation purposes only. Not earned yet. Varies based on market conditions'}
              placement={'up'}
            />
          )}
        </RowAlign>
      </td>
      <td>{formatReserveDisplay(rewards.profits, reserveAsset, 4)}</td>
      {/* Safe usage of formatEther since BABL will always be 10**18 decimals */}
      <td>{formatEtherDecimal(rewards.babl, 2)}</td>
    </StyledClaimRow>
  );
};

const ProphetBonus = ({ kind, value }) => {
  const iconName = {
    lp: IconName.babNeutral,
    voter: IconName.steward,
    strategist: IconName.strategist,
    creator: IconName.garden,
  }[kind];
  return (
    <ProphetBonusWrapper>
      <ProphetBonusKind>
        <Icon size={30} name={iconName} />
        <ProphetKindName>{kind}</ProphetKindName>
      </ProphetBonusKind>
      <ProphetBonusValue>
        <ProphetBonusPercentage>{value}%</ProphetBonusPercentage>
      </ProphetBonusValue>
    </ProphetBonusWrapper>
  );
};

function ClaimModal({ refetch, gardenDetails, gardenContract, reserveContract, hasUnclaimed }: ClaimModalProps) {
  const {
    accountantBalance,
    address,
    fetchNewGasPrices,
    gasPrices,
    notify,
    quotes,
    signatureSupported,
    txProvider,
    userPrefs,
  } = useW3Context();

  const [loading, setLoading] = useState<boolean>(true);
  const [approvalReady, setApprovalReady] = useState<any | undefined>(undefined);
  const [approvalStatus, setApprovalStatus] = useState<string>('check'); // check - loading - required - loading - completed
  const [confirmations, setConfirmations] = useState(DEFAULT_CONFIRM_STATES);
  const [estimatedGasETH, setEstimatedGasETH] = useState<BigNumber>(BigNumber.from(0));
  const [gasFetchedAt, setGasFetchedAt] = useState<number | undefined>(undefined);
  const [isSignatureSelected, setIsSignatureSelected] = useState(
    canUseSignature(accountantBalance, signatureSupported),
  );
  const [maxFee, setMaxFee] = useState<BigNumber>(BigNumber.from(0));
  const [reserveBalance, setReserveBalance] = useState<BigNumber | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [stakedProphet, setStakedProphet] = useState<ProphetNFT | undefined>(undefined);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [txReady, setTxReady] = useState<any | undefined>(undefined);
  const [confirmSignatureWaiting, setConfirmSignatureWaiting] = useState<boolean>(false);
  const [stakeAvailable, setStakeAvailable] = useState<boolean>(false);

  const tokenListService = TokenListService.getInstance();
  const quoteService = QuoteService.getInstance();
  const viewerService = ViewerService.getInstance();

  const usingSignature = canUseSignature(accountantBalance, signatureSupported) && isSignatureSelected;
  const currentGasPrice = formatToGas(gasPrices?.fast || 0);
  const shouldWarnGas = currentGasPrice >= MAX_GAS_FULL_SUBSIDY_PRICE;
  const reserveAsset = tokenListService.getTokenByAddress(gardenDetails.reserveAsset) as Token;
  const contribution: Contributor = gardenDetails.contribution as Contributor;
  const isGasPriceStale =
    !gasFetchedAt || Date.now() - gasFetchedAt > GAS_PRICES_STALE_AFTER_MSECS || currentGasPrice === 0;

  const ethPrice = quoteService.getQuoteForReserveAndCurrency(
    'ETH',
    userPrefs?.currency || 'USD',
    quotes as QuoteResult,
  )?.price;

  const reserveInFiat =
    quoteService.getQuoteForReserveAndCurrency(reserveAsset.symbol, userPrefs?.currency || 'USD', quotes as QuoteResult)
      ?.price || 0;

  const toggleModal = (): void => {
    setShowModal(!showModal);
  };

  const fetchHeartData = async () => {
    if (address && usingSignature) {
      const rewards = gardenDetails.contribution?.rewards?.totalBabl || BigNumber.from(0);
      const heartDetails = await viewerService.getGardenDetails(HEART_GARDEN_ADDRESS, address, true);
      if (heartDetails) {
        setStakeAvailable(
          rewards.lte(heartDetails.maxDepositLimit.sub(heartDetails.principal)) &&
            rewards.gte(heartDetails.minContribution),
        );
      }
    }
    setLoading(false);
  };

  const checkApprovalNeeded = async (amount: BigNumber) => {
    if (gardenDetails && address) {
      setApprovalStatus('loading');
      const allowance = await reserveContract.allowance(address, gardenDetails.address);
      setApprovalStatus(allowance.lt(amount) ? 'required' : 'completed');
    }
  };

  const handleApproveReserve = async () => {
    if (gardenDetails) {
      try {
        Mixpanel.track('approve', { garden: gardenDetails.address });
        setApprovalReady(
          reserveContract.approve(gardenDetails.address, getAllowancePerReserve(gardenDetails.reserveAsset)),
        );
        setApprovalStatus('loading');
      } catch (err) {
        console.log('Failed to approve ERC20 for rewards claim', err);
      }
    }
  };

  const updateGasPrices = async () => {
    if (isGasPriceStale) {
      fetchNewGasPrices();
      setGasFetchedAt(Date.now());
    }
  };

  const setGasEstimation = async () => {
    if (!hasUnclaimed) {
      return;
    }

    if (isGasPriceStale) {
      updateGasPrices();
      return;
    }

    let defaultGas: BigNumber;
    if (isSignatureSelected) {
      defaultGas =
        confirmations.stake && stakeAvailable
          ? BigNumber.from(MAX_CLAIM_AND_STAKE_BY_SIG_GAS)
          : BigNumber.from(MAX_CLAIM_BY_SIG_GAS);
    } else {
      const claimTxGas: BigNumber = await wrapAwait(
        gardenContract.estimateGas.claimReturns(contribution.unclaimedStrategies),
        BigNumber.from(2000000),
        'Error Estimating Gas',
      );
      const calculatedLimit = calculateGasLimit(claimTxGas, gardenDetails).toFixed(0);
      defaultGas = BigNumber.from(calculatedLimit);
    }
    if (gasPrices && quotes && ethPrice) {
      const { feeETH, feeReserve } = calculateMaxFee(ethPrice, defaultGas, gasPrices, reserveInFiat, reserveAsset);
      setEstimatedGasETH(feeETH);
      setMaxFee(feeReserve);
    } else {
      throw new Error('Failed to calculate maxFee for transaction, please try again later');
    }
  };

  const handleSubmitClaim = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (txProvider && gasPrices && maxFee && unclaimedRewards && address) {
      try {
        if (usingSignature) {
          const updatedDetails = await viewerService.getGardenDetails(gardenDetails.address, address, true);
          const updatedRewards = updatedDetails.contribution?.rewards;

          if (!updatedRewards) {
            console.log('Missing rewards data for contributor, cannot perform claim!');
            return;
          }
          const hasUnclaimed =
            updatedRewards.totalProfits.gt(BigNumber.from(0)) || updatedRewards.totalBabl.gt(BigNumber.from(0));
          const gardenNonce = (await gardenContract.getContributor(address))[7] || BigNumber.from(0);

          if (!hasUnclaimed) {
            console.log('User has no unclaimed tokens.');
            return;
          }
          setConfirmSignatureWaiting(true);

          // Final payload depends on whether user is staking in addition to the claim
          let payload;
          let signatureType: SignatureTransactionType;
          if (confirmations.stake && stakeAvailable) {
            signatureType = SignatureTransactionType.claimStake;
            const heartDetails = await viewerService.getGardenDetails(HEART_GARDEN_ADDRESS, address, true);
            const stakingAmount = updatedRewards.totalBabl;
            const bablToken = tokenListService.getTokenBySymbol('BABL') as Token;
            const heartGardenContract = await loadContractFromNameAndAddress(HEART_GARDEN_ADDRESS, Garden, txProvider);
            const heartNonce = (await heartGardenContract?.getContributor(address))[7] || BigNumber.from(0);
            const minAmountOut = calculateGardenTokensFromReserve(heartDetails.sharePrice, stakingAmount, bablToken);

            payload = buildClaimAndStakeMessage(
              gardenDetails.address,
              updatedRewards.totalBabl,
              updatedRewards.totalProfits,
              minAmountOut.sub(minAmountOut.div(20)),
              gardenNonce,
              heartNonce,
              maxFee,
              address,
            );
          } else {
            signatureType = SignatureTransactionType.claim;
            payload = buildClaimMessage(
              gardenDetails.address,
              updatedRewards.totalBabl,
              updatedRewards.totalProfits,
              gardenNonce,
              maxFee,
              address,
            );
          }

          Mixpanel.track('garden-claim-start', {
            garden: gardenDetails.address,
            type: 'sig',
          });

          const signer = txProvider.getSigner();

          try {
            const response = await submitSignatureTransaction(payload, signer, signatureType, notify);
            if (response === undefined || !response.hash) {
              return;
            }
            setTxHash(response.hash);
          } catch (error) {
            console.log(error);
          } finally {
            setConfirmSignatureWaiting(false);
          }
        } else {
          Mixpanel.track('garden-claim-start', {
            garden: gardenDetails.address,
            type: 'tx',
          });
          setTxReady(gardenContract.claimReturns(contribution.unclaimedStrategies));
        }
      } catch (err) {
        console.log('Error during claim submission', err);
      }
    }
  };

  const handleCheck = (e: any) => {
    const newConfirms = { ...confirmations };
    newConfirms[e.target.name] = !confirmations[e.target.name];
    setConfirmations(newConfirms);
  };

  const onFinish = () => {
    setShowModal(false);
    setTxReady(undefined);
    refetch();
  };

  useEffect(() => {
    const getStake = async () => {
      const staked = await getStakedForUserGarden(contribution.address, gardenDetails.address);
      if (staked && staked > 0) {
        setStakedProphet(getProphetObject(staked));
      }
    };

    getStake();
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      if (address) {
        setReserveBalance(await reserveContract.balanceOf(address));
      }
      updateGasPrices();
      fetchHeartData();
    }

    if (showModal) {
      init();
    }
  }, [showModal]);

  useEffect(() => {
    setGasEstimation();
    fetchHeartData();
  }, [isSignatureSelected, gasPrices, gasFetchedAt, confirmations, stakeAvailable]);

  // We need to check whether user has the necessary allowance any time the maxFee is set
  useEffect(() => {
    if (maxFee) {
      checkApprovalNeeded(maxFee);
    }
  }, [maxFee]);

  const lacksSigFunds = isSignatureSelected && maxFee.gt(reserveBalance || BigNumber.from(0));
  const unclaimedRewards = contribution.rewards as ContributorRewards;
  const totalUnclaimedRewards = {
    profits: unclaimedRewards?.totalProfits || BigNumber.from(0),
    babl: unclaimedRewards?.totalBabl || BigNumber.from(0),
  };
  // Min stake amount for BABL to hBABL is 25
  const pendingRewards = contribution.pendingRewards as ContributorRewards;
  const totalPendingRewards = {
    profits: pendingRewards?.totalProfits || BigNumber.from(0),
    babl: pendingRewards?.totalBabl || BigNumber.from(0),
  };

  const totalClaimedRewards = { profits: contribution.claimedProfits, babl: contribution.claimedBABL } as RewardRecord;

  const absoluteTotalRewards = {
    profits: totalUnclaimedRewards.profits.add(totalPendingRewards.profits).add(totalClaimedRewards.profits),
    babl: totalUnclaimedRewards.babl.add(totalPendingRewards.babl).add(totalClaimedRewards.babl),
  };

  const buttonText = (() => {
    const hasProfits = totalUnclaimedRewards.profits.gt(BigNumber.from(0));
    const hasBABL = totalUnclaimedRewards.babl.gt(BigNumber.from(0));
    return hasUnclaimed
      ? `Claim
        ${hasProfits ? formatReserveDisplay(totalUnclaimedRewards.profits, reserveAsset, 4) : ''}
        ${hasProfits && hasBABL ? ' & ' : ''}
        ${hasBABL ? commify(formatEtherDecimal(totalUnclaimedRewards.babl, 2)) + ' BABL' : ''}
        ${usingSignature && stakeAvailable && confirmations.stake ? ' and Stake' : ''}`
      : 'No unclaimed rewards';
  })();

  return (
    <StyledBox className="ClaimModal">
      <StyledToggleWrapper alert={hasUnclaimed}>
        {hasUnclaimed && <UnclaimedAlert />}
        <StyledToggleButton width={isMobile ? '100%' : undefined} inverted onClick={toggleModal}>
          {!isMobile ? 'Manage' : ''} Rewards
        </StyledToggleButton>
      </StyledToggleWrapper>
      {approvalReady && maxFee && (
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
              checkApprovalNeeded(maxFee);
            }
          }}
        />
      )}
      <BaseModal width={isMobile ? '100%' : ''} isOpen={showModal} toggleModal={toggleModal}>
        <ModalCard>
          {loading && (
            <LoaderWrapper>
              <BaseLoader size={60} text={'Loading latest rewards data...'} />
            </LoaderWrapper>
          )}
          {!loading && (
            <>
              {!txReady && !txHash ? (
                <>
                  <ModalHeadingRow>Rewards</ModalHeadingRow>
                  <ModalContentWrapper>
                    <StyledLink
                      to={{
                        pathname: 'https://docs.babylon.finance/babl/mining',
                      }}
                      target="_blank"
                    >
                      Heads up! Learn how BABL rewards work.
                    </StyledLink>
                    <SigTypeWrapper>
                      <StyledTransactionType
                        type={TxType.claimRewards}
                        setUsingSignature={setIsSignatureSelected}
                        canUseSignature={canUseSignature(accountantBalance, signatureSupported)}
                        usingSignature={usingSignature}
                      />
                    </SigTypeWrapper>
                    <CoinWrapper>
                      <Animation speed={0.8} size={isMobile ? 100 : 130} autoplay loop name={AnimationName.coinSpin} />
                    </CoinWrapper>
                    {stakedProphet && (
                      <BonusWrapper>
                        <BonusHeader>Prophet Bonuses</BonusHeader>
                        <BonusRow>
                          <ProphetBonus kind={'lp'} value={stakedProphet.attributes.lpBonus} />
                          <ProphetBonus kind={'voter'} value={stakedProphet.attributes.voterBonus} />
                          <ProphetBonus kind={'strategist'} value={stakedProphet.attributes.strategistBonus} />
                          <ProphetBonus kind={'creator'} value={stakedProphet.attributes.creatorBonus} />
                        </BonusRow>
                      </BonusWrapper>
                    )}
                    <TableWrapper>
                      <GardenTable headers={TABLE_HEADERS}>
                        {!contribution.isDust && (
                          <ClaimDetailRow
                            label={'Not finalized'}
                            rewards={totalPendingRewards}
                            reserveAsset={reserveAsset}
                            pending
                          />
                        )}
                        <ClaimDetailRow
                          label={'Claimable'}
                          rewards={totalUnclaimedRewards}
                          reserveAsset={reserveAsset}
                        />
                        <ClaimDetailRow label={'Claimed'} rewards={totalClaimedRewards} reserveAsset={reserveAsset} />
                        <ClaimDetailRow
                          label={'Total'}
                          rewards={absoluteTotalRewards}
                          reserveAsset={reserveAsset}
                          total
                        />
                      </GardenTable>
                    </TableWrapper>
                    {lacksSigFunds && (
                      <WalletWarning>
                        <Icon name={IconName.warning} color={'var(--negative)'} size={20} />
                        <WarningText>
                          <span>Wallet lacks necessary {reserveAsset.symbol} for gasless transaction fee.</span>
                          <span>
                            Minimum wallet balance must be <b>{formatReserveDisplay(maxFee, reserveAsset, 4)}</b>
                          </span>
                        </WarningText>
                      </WalletWarning>
                    )}
                    {stakeAvailable && usingSignature && (
                      <TxChecklist
                        confirmations={confirmations}
                        handleCheck={handleCheck}
                        txType={TxType.claimRewards}
                      />
                    )}
                    {hasUnclaimed && ethPrice && (
                      <FeesWrapper>
                        <Fees
                          isSignatureSelected={isSignatureSelected}
                          userCurrency={userPrefs?.currency || 'USD'}
                          shouldWarnGas={shouldWarnGas}
                          ethAsset={tokenListService.getTokenByAddress('0x') as Token}
                          reserveAsset={reserveAsset}
                          estimateGasETH={estimatedGasETH}
                          reserveInFiat={reserveInFiat}
                          ethPrice={ethPrice}
                          receivingSymbol={gardenDetails.symbol}
                        />
                      </FeesWrapper>
                    )}
                    <StyledButtonRowWrapper>
                      {(approvalStatus === 'required' || approvalStatus === 'loading') && isSignatureSelected && (
                        <StyledButton onClick={handleApproveReserve} disabled={approvalStatus === 'loading'}>
                          {approvalStatus === 'loading'
                            ? 'Approving...'
                            : `Approve ${gardenDetails.reserveToken?.symbol} Allowance`}
                        </StyledButton>
                      )}
                      {(!isSignatureSelected || approvalStatus === 'completed') && (
                        <StyledButton
                          disabled={!hasUnclaimed || (lacksSigFunds && !isGasPriceStale) || confirmSignatureWaiting}
                          onClick={isGasPriceStale ? updateGasPrices : handleSubmitClaim}
                        >
                          {confirmSignatureWaiting ? (
                            <Loader />
                          ) : isGasPriceStale ? (
                            'Gas price out of date (refresh)'
                          ) : (
                            buttonText
                          )}
                        </StyledButton>
                      )}
                    </StyledButtonRowWrapper>
                  </ModalContentWrapper>
                </>
              ) : (
                <TxLoader
                  type={TxType.claimRewards}
                  txObject={txReady}
                  onConfirm={() => {
                    onFinish();
                    Mixpanel.track('garden-claim-end', { garden: gardenDetails.address });
                  }}
                  waitForConfirmation
                />
              )}
            </>
          )}
        </ModalCard>
      </BaseModal>
    </StyledBox>
  );
}

const LoaderWrapper = styled.div`
  width: 100%;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FeesWrapper = styled.div`
  margin-bottom: 30px;
`;

const StyledBox = styled(Box)`
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const StyledTransactionType = styled(TransactionType)`
  &:first-child {
    margin-bottom: 0px;
  }
`;

const StyledButton = styled(TurquoiseButton)`
  width: 100%;
`;

const StyledToggleWrapper = styled.div<{ alert?: boolean }>`
  ${(p) => (p.alert ? 'height: 55px;' : '')};
`;

const SigTypeWrapper = styled.div`
  padding-top: 20px;
`;

const WalletWarning = styled.div`
  display: flex;
  flex-flow: row nowrap;
  padding: 10px 0 20px;
`;

const WarningText = styled.div`
  margin-left: 10px;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
`;

const ProphetBonusWrapper = styled.div`
  flex-grow: 1;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  border-right: 1px solid var(--border-blue);

  &:last-child {
    border: none;
  }
`;

const ProphetBonusKind = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-start;
`;

const ProphetKindName = styled.div`
  font-size: 16px;
  color: var(--white);
  text-transform: capitalize;
  width: 100%;
  text-align: center;
`;

const ProphetBonusValue = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

const ProphetBonusPercentage = styled.div`
  font-family: cera-bold;
  font-size: 28px;
  text-align: center;
  color: var(--purple-aux);
  width: 100%;
`;

const CoinWrapper = styled.div`
  padding-top: 10px;
  height: 100%;
  width: 100%;
`;

const BonusWrapper = styled.div`
  width: 100%;
  padding-top: 0px;
`;

const BonusRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`;

const BonusHeader = styled.div`
  font-family: cera-medium;
  font-size: 18px;
  width: 100%;
  padding: 10px 0 20px;
`;

const StyledLink = styled(Link)`
  font-family: cera-regular;
  color: var(--turquoise-01);
  text-decoration: underline;

  &:hover {
    color: var(--turquoise-01);
    text-decoration: underline;
    opacity: 0.8;
  }
`;
const RowAlign = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

const UnclaimedAlert = styled.div`
  position: relative;
  z-index: 2;
  margin-left: auto;
  height: 8px;
  width: 8px;
  border-radius: 4px;
  overflow: hidden;
  background-color: var(--pink);
  bottom: -5px;
  right: -3px;'
`;

const StyledToggleButton = styled(TurquoiseButton)``;

const StyledClaimRow = styled.tr<{ total: boolean }>`
  height: 50px !important;
  color: ${(p) => (p.total === true ? 'var(--purple-aux)' : 'var(--white)')} !important;
  border-bottom: ${(p) => (p.total === true ? 'none' : 'inherit')} !important;
  font-family: ${(p) => (p.total === true ? 'cera-bold' : 'inherit')} !important;
  font-size: ${(p) => (p.total === true ? '18px' : 'inherit')} !important;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const ModalContentWrapper = styled.div``;

const TableWrapper = styled.div`
  margin: 10px 0;
`;

const StyledButtonRowWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  height: 50px;
  width: 100%;
  margin-top: auto;
`;

const ModalHeadingRow = styled.div`
  font-size: 24px;
  font-family: cera-bold;
  color: var(--white);
  margin-bottom: 10px;
  width: 100%;
`;

const ModalCard = styled.div`
  background-color: var(--modal-blue);
  border: none;
  width: 460px;
  min-height: 600px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
  }
`;

export default React.memo(ClaimModal);
