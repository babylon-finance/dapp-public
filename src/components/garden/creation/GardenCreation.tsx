/* eslint-disable jsx-a11y/accessible-emoji */
import { CreationLearner } from './CreationLearner';
import { BaseModal, Breadcrumbs, TurquoiseButton, TxLoader } from 'components/shared/';
import { MainDetails, NftDetails, DepositDetails, AccessControl, GardenMechanics, CreationSummary } from './';
import { BabController, BabControllerLocal } from 'constants/contracts';
import { loadContractFromNameAndAddress, getAddressByName } from 'hooks/ContractLoader';
import { IS_MAINNET } from 'config';
import { IERC20 } from 'constants/contracts';
import {
  AddGardenRequest,
  GardenCreationAccessDetails,
  GardenCreationDepositDetails,
  GardenCreationMainDetails,
  GardenCreationMechanics,
  GardenCreationSummaryDetails,
  GardenCreationNftDetails,
  GardenNFTMeta,
  Token,
  TxType,
} from 'models/';
import { BASE_NFT_URL } from 'config';
import { formatReserveFloat, parseReserve } from 'helpers/Numbers';
import { NftService, TokenListService, ViewerService } from 'services';
import { useW3Context } from 'context/W3Provider';
import { Contract } from '@ethersproject/contracts';
import { parseEther } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';

interface GardenCreationProps {
  labelOverride?: string;
  refetch: () => void;
}

const gardenSteps = [
  'Name & Description',
  'Image & NFT',
  'Deposits & Redemptions',
  'Access Control',
  'Capital & Duration',
  'Review',
];

const GardenCreation = ({ labelOverride, refetch }: GardenCreationProps) => {
  const { address, canSubmitTx, connect, txProvider, userPrefs } = useW3Context();

  const [showLearner, setShowLearner] = useState<boolean>(userPrefs ? !userPrefs.hideCreationLearner : true);
  const [showModal, setShowModal] = useState(false);
  const [gardenStep, setGardenStep] = useState(0);
  const [controller, setController] = useState<undefined | Contract>(undefined);
  const [currentStepValid, setCurrentStepValid] = useState(false);
  const [txReady, setTxReady] = useState<any | undefined>(undefined);
  const [approvalReady, setApprovalReady] = useState<any | undefined>(undefined);
  const [approvalRequired, setApprovalRequired] = useState<boolean>(false);
  const [approvalCompleted, setApprovalCompleted] = useState<boolean>(false);
  const [approvalLoading, setApprovalLoading] = useState<boolean>(false);
  const [gardenDetails, setGardenDetails] = useState<GardenCreationMainDetails | undefined>(undefined);
  const [depositDetails, setDepositDetails] = useState<GardenCreationDepositDetails | undefined>(undefined);
  const [nftDetails, setNftDetails] = useState<GardenCreationNftDetails | undefined>(undefined);
  const [controlDetails, setControlDetails] = useState<GardenCreationAccessDetails | undefined>(undefined);
  const [mechanics, setGardenMechanics] = useState<GardenCreationMechanics | undefined>(undefined);
  const [summaryDetails, setSummaryDetails] = useState<GardenCreationSummaryDetails | undefined>(undefined);

  const nftService = NftService.getInstance();
  const viewerService = ViewerService.getInstance();
  const tokenListService = TokenListService.getInstance();

  useEffect(() => {
    const setCont = async () => {
      const controllerWeb3 = (await loadContractFromNameAndAddress(
        getAddressByName('BabControllerProxy'),
        IS_MAINNET ? BabController : BabControllerLocal,
        txProvider,
      )) as Contract;
      setController(controllerWeb3);
    };
    if (txProvider) {
      setCont();
    }
  }, [txProvider]);

  const nextStep = async () => {
    if (gardenStep === gardenSteps.length - 1) {
      // Finish
      await handleSubmitGarden();
      return;
    }
    const valid = gardenStep !== 3;
    setGardenStep(gardenStep + 1);
    setCurrentStepValid(valid);
  };

  const previousStep = () => {
    setGardenStep(gardenStep - 1);
    setCurrentStepValid(true);
  };

  const toggleModal = (): void => {
    if (showModal) {
      clearForm();
    }
    setShowModal(!showModal);
  };

  const checkApprovalNeeded = async (amount: number) => {
    if (gardenDetails?.reserveAsset && address) {
      setApprovalLoading(true);
      const allowance = await viewerService.getTokenControllerAllowance(gardenDetails.reserveAsset, address);
      const token = tokenListService.getTokenByAddress(gardenDetails.reserveAsset) as Token;
      const needed = formatReserveFloat(allowance, token) <= amount;
      setApprovalRequired(needed);
      setApprovalLoading(false);
    }
  };

  const handleApproveReserve = async () => {
    if (gardenDetails && controller) {
      try {
        const tokenContract = (await loadContractFromNameAndAddress(
          gardenDetails.reserveAsset,
          IERC20,
          txProvider,
        )) as Contract;

        // Lazy number since max uint256 - 1 wasn't working
        // Currently set to 1 billion tokens of the reserve
        const MAX_ALLOWANCE = `${1000 * 1000 * 1000}`;

        setApprovalReady(tokenContract.approve(controller.address, parseEther(MAX_ALLOWANCE)));
      } catch (err) {
        console.log('Failed to approve ERC20 for creation deposit', err);
      }
    }
  };

  const clearForm = () => {
    setGardenDetails(undefined);
    setControlDetails(undefined);
    setDepositDetails(undefined);
    setGardenMechanics(undefined);
    setSummaryDetails(undefined);
    setGardenStep(0);
    setApprovalRequired(false);
    setApprovalCompleted(false);
    setApprovalReady(undefined);
    setCurrentStepValid(false);
  };

  const handleSubmitGarden = async () => {
    if (controller && mechanics && depositDetails && controlDetails && gardenDetails && nftDetails && summaryDetails) {
      try {
        const reserve = tokenListService.getTokenByAddress(gardenDetails.reserveAsset) as Token;
        const nftSeed = nftDetails.seed;
        const gardenNFT: GardenNFTMeta = {
          name: gardenDetails.name,
          description: gardenDetails.description,
          image: nftDetails.image,
          seed: nftSeed,
          mintNftAfter: nftDetails.mintNftAfter,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          transport: undefined,
          telegram: undefined,
        };

        // Pin the nft data
        await nftService.pinNft(nftSeed.toString(), gardenNFT);
        const garden = new AddGardenRequest(
          gardenDetails.reserveAsset,
          gardenDetails.name,
          gardenDetails.symbol,
          `${BASE_NFT_URL}${nftSeed}`,
          BigNumber.from(nftSeed),
          [
            parseReserve(depositDetails.maxDepositLimit.toString(), reserve),
            parseReserve(mechanics.minLiquidityAsset.toString(), reserve),
            BigNumber.from(depositDetails.depositHardlock),
            parseReserve(depositDetails.minContribution.toString(), reserve),
            BigNumber.from((60 * 60 * mechanics.strategyCooldownPeriod) / 2),
            parseEther((mechanics.minVotesQuorum / 100).toString()),
            BigNumber.from(60 * 60 * 24 * mechanics.minStrategyDuration),
            BigNumber.from(60 * 60 * 24 * mechanics.maxStrategyDuration),
            BigNumber.from(mechanics.minVoters),
            BigNumber.from(0),
            parseEther((depositDetails.sharePriceDeltaDecay / 100).toString()),
            parseEther((depositDetails.sharePriceDelta / 100).toString()),
            BigNumber.from(nftDetails.mintNftAfter),
            BigNumber.from(mechanics.customIntegrations ? 1 : 0),
          ],
          parseReserve(summaryDetails.creatorDeposit.toString(), reserve),
          [controlDetails.publicLP, controlDetails.publicStrategist, controlDetails.publicVoter],
          [
            parseEther((controlDetails.strategistShare / 100).toString()),
            parseEther((controlDetails.stewardsShare / 100).toString()),
            parseEther(((95 - (controlDetails.strategistShare + controlDetails.stewardsShare)) / 100).toString()),
          ],
        );
        setShowModal(false);
        setTxReady(
          controller.createGarden(...garden.getProps(), {
            value: parseEther('0'),
          }),
        );
      } catch (err) {
        console.log('Submit garden error', err);
      }
    }
  };

  const approvalSuccess = () => {
    setApprovalCompleted(true);
    setApprovalRequired(false);
  };

  const approvalConfirmed = () => {
    setApprovalReady(undefined);
  };

  const transactionRejected = () => {
    setTxReady(undefined);
    setShowModal(true);
  };

  const transactionFinalized = () => {
    setTxReady(undefined);
    setApprovalRequired(false);
    setApprovalReady(undefined);
    setApprovalCompleted(false);
    refetch();
  };

  const approvalFailed = () => {};

  return (
    <GardenCreationWrapper>
      <TurquoiseButton
        disabled={true}
        onClick={(e) => {
          if (!address) {
            connect(e);
            return;
          }
          toggleModal();
          clearForm();
        }}
      >
        {address ? `${labelOverride || 'Create a Garden'}` : 'Connect Wallet'}
      </TurquoiseButton>
      {!txReady && (
        <BaseModal width={'1200px'} isOpen={showModal} toggleModal={toggleModal}>
          <ContentWrapper>
            <ModalTitle>Create a Garden</ModalTitle>
            {showLearner && <CreationLearner hide={() => setShowLearner(false)} />}
            {!showLearner && address && (
              <>
                <SectionWrapper>
                  <Breadcrumbs currentStep={gardenStep} steps={gardenSteps} />
                  <FlowContent>
                    <StepHeader>
                      <StepName>{gardenSteps[gardenStep]}</StepName>
                    </StepHeader>
                    {gardenStep === 0 && (
                      <MainDetails
                        address={address}
                        details={gardenDetails}
                        setGardenDetails={(gardenDetails: GardenCreationMainDetails, isValid: boolean) => {
                          setCurrentStepValid(isValid);
                          setGardenDetails(gardenDetails);
                        }}
                      />
                    )}
                    {gardenStep === 1 && gardenDetails && (
                      <NftDetails
                        gardenDetails={gardenDetails}
                        details={nftDetails}
                        setNftDetails={(nftDetails: GardenCreationNftDetails, isValid: boolean) => {
                          setCurrentStepValid(isValid);
                          setNftDetails(nftDetails);
                        }}
                      />
                    )}
                    {gardenStep === 2 && gardenDetails && (
                      <DepositDetails
                        details={depositDetails}
                        gardenDetails={gardenDetails}
                        setDepositDetails={(depositDetails: GardenCreationDepositDetails, isValid: boolean) => {
                          setCurrentStepValid(isValid);
                          setDepositDetails(depositDetails);
                        }}
                      />
                    )}
                    {gardenStep === 3 && gardenDetails && (
                      <AccessControl
                        details={controlDetails}
                        setControlDetails={(controlDetails: GardenCreationAccessDetails, isValid: boolean) => {
                          setCurrentStepValid(isValid);
                          setControlDetails(controlDetails);
                        }}
                      />
                    )}
                    {gardenStep === 4 && gardenDetails && (
                      <GardenMechanics
                        gardenDetails={gardenDetails}
                        mechanics={mechanics}
                        setMechanics={(mechanics: GardenCreationMechanics, isValid: boolean) => {
                          setCurrentStepValid(isValid);
                          setGardenMechanics(mechanics);
                        }}
                      />
                    )}
                    {gardenStep === 5 && (
                      <CreationSummary
                        gardenDetails={gardenDetails as GardenCreationMainDetails}
                        depositDetails={depositDetails as GardenCreationDepositDetails}
                        controlDetails={controlDetails as GardenCreationAccessDetails}
                        nftDetails={nftDetails as GardenCreationNftDetails}
                        mechanics={mechanics as GardenCreationMechanics}
                        summaryDetails={summaryDetails as GardenCreationSummaryDetails}
                        setApprovalNeeded={checkApprovalNeeded}
                        onFinalizeSummary={(summaryDetails: GardenCreationSummaryDetails, valid: boolean) => {
                          setSummaryDetails(summaryDetails);
                          setCurrentStepValid(valid);
                        }}
                      />
                    )}
                  </FlowContent>
                </SectionWrapper>
                <ButtonWrapper>
                  {gardenStep > 0 && (
                    <TurquoiseButton
                      inverted
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        previousStep();
                        e.currentTarget.blur();
                      }}
                      disabled={false}
                    >
                      Back
                    </TurquoiseButton>
                  )}
                  {gardenStep === gardenSteps.length - 1 && approvalRequired ? (
                    <TurquoiseButton disabled={approvalCompleted || !currentStepValid} onClick={handleApproveReserve}>
                      {approvalCompleted ? 'Approved!' : 'Approval Required'}
                    </TurquoiseButton>
                  ) : (
                    <TurquoiseButton
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        if (currentStepValid) {
                          nextStep();
                        }
                        e.currentTarget.blur();
                      }}
                      disabled={!currentStepValid || (gardenStep === 4 && (approvalRequired || approvalLoading))}
                    >
                      {gardenStep === gardenSteps.length - 1 ? 'Create a Garden' : 'Next'}
                    </TurquoiseButton>
                  )}
                </ButtonWrapper>
              </>
            )}
          </ContentWrapper>
        </BaseModal>
      )}
      {approvalReady && (
        <TxLoader
          inModal
          txObject={approvalReady}
          waitForConfirmation
          customConfirmationText={'Approval Confirmed'}
          onSuccess={approvalSuccess}
          onConfirm={approvalConfirmed}
          onFailure={approvalFailed}
        />
      )}
      {txReady && !approvalReady && (
        <TxLoader
          inModal
          type={TxType.createGarden}
          txObject={txReady}
          waitForConfirmation
          customConfirmationText={'Garden Created'}
          onConfirm={transactionFinalized}
          onFailure={transactionRejected}
        />
      )}
    </GardenCreationWrapper>
  );
};

const GardenCreationWrapper = styled.div`
  color: white;
`;

const SectionWrapper = styled.div`
  display: flex;
  margin-top: 50px;
  width: 100%;
  flex-flow: row nowrap;
`;
const ModalTitle = styled.div`
  color: white;
  font-size: 22px;
  font-weight: 700;
  line-height: 32px;
`;

const StepHeader = styled.div`
  display: flex;
  width: 760px;
  justify-content: space-between;
  align-items: center;
`;

const StepName = styled.div`
  font-size: 18px;
  line-height: 24px;
  color: white;
  font-weight: bold;
`;

const FlowContent = styled.div`
  min-height: 400px;
  width: 100%;
  border-left: 1px solid var(--blue-05);
  padding: 0 0 0 50px;
  position: relative;
`;
const ContentWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 0px 40px 40px 40px;
  min-height: 600px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  margin-top: 10px;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
  > button {
    margin-right: 12px;
  }
  > button:last-child {
    margin-right: 0;
  }
`;

export default GardenCreation;
