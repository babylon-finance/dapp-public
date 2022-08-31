import { Breadcrumbs, Icon, TurquoiseButton, TxLoader } from 'components/shared/';

import AddStrategyRequest from 'models/Tx/AddStrategyRequest';
import { Garden } from 'constants/contracts';
import { FullGardenDetails } from 'models/GardenDetails';
import { StrategyOperations, StrategyParams, StrategyReview } from '..';
import { StrategyOperation } from 'models/Strategies';
import { StrategyParamsData } from '../StrategyParams/strategyParamsTypes';
import { TxType, Token, IconName } from 'models';
import { TokenListService } from 'services';
import { MAX_OPERATIONS, MIN_OPERATIONS } from 'constants/values';
import { loadContractFromNameAndAddress } from 'hooks/ContractLoader';
import { useW3Context } from 'context/W3Provider';
import { parseReserve } from 'helpers/Numbers';
import { Contract } from '@ethersproject/contracts';
import { parseEther } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { concat } from '@ethersproject/bytes';
import React, { useState } from 'react';
import styled from 'styled-components';

interface StrategySubmissionProps {
  subgraphClients: any;
  gardenDetails: FullGardenDetails;
  userTokenBalanceAvailable: number;
  toggleSubmit: () => void;
  refetch: () => void;
}

const strategySteps = ['Name & Operations', 'Capital & Duration', 'Review & Submit'];

const StrategySubmission = ({
  gardenDetails,
  subgraphClients,
  userTokenBalanceAvailable,
  refetch,
  toggleSubmit,
}: StrategySubmissionProps) => {
  const [strategyStep, setStrategyStep] = useState(0);
  const [name, setName] = useState('');
  const [resetCounter, setResetCounter] = useState(0);
  const [operations, setOperations] = useState<StrategyOperation[] | undefined>(undefined);
  const [currentStepValid, setCurrentStepValid] = useState(false);
  const [strategyParams, setStrategyParams] = useState<StrategyParamsData | undefined>(undefined);
  const [txReady, setTxReady] = useState<any | undefined>(undefined);
  const tokenListService = TokenListService.getInstance();
  const reserve = tokenListService.getTokenByAddress(gardenDetails.reserveAsset) as Token;

  const { txProvider, canSubmitTx } = useW3Context();

  const nextStep = async () => {
    if (strategyStep === strategySteps.length - 1) {
      // Finish
      await handleSubmitStrategy();
      return;
    }

    const valid = strategyStep === 1;
    setStrategyStep(strategyStep + 1);
    setCurrentStepValid(valid);
  };

  const previousStep = () => {
    setStrategyStep(strategyStep - 1);
    setCurrentStepValid(true);
  };

  const clearForm = () => {
    setName('');
    setResetCounter(resetCounter + 1);
    setOperations(undefined);
    setStrategyParams(undefined);
    setCurrentStepValid(false);
    setStrategyStep(0);
  };

  const handleSubmitStrategy = async () => {
    if (txProvider && strategyParams && operations) {
      try {
        const gardenWeb3 = (await loadContractFromNameAndAddress(
          gardenDetails.address,
          Garden,
          txProvider,
        )) as Contract;
        const strategy = new AddStrategyRequest(
          name,
          `${gardenDetails.symbol} STRAT`,
          [
            parseReserve(strategyParams.maxCapitalRequested.toString(), reserve),
            parseReserve(strategyParams.stake.toString(), reserve),
            BigNumber.from(60 * 60 * 24 * strategyParams.duration),
            parseEther(Number(strategyParams.expectedReturn / 100).toString()),
            parseEther(Number(strategyParams.maxPercentAllocation / 100).toString()),
            parseEther(Number(strategyParams.maxGasFeePercentage / 100).toString()),
            parseEther(Number(strategyParams.maxSlippagePercentage / 100).toString()),
          ],
          operations.map((o: StrategyOperation) => o.kind),
          operations.map((o: StrategyOperation) => o.integration),
          concat(operations.map((o: StrategyOperation) => o.data)),
        );
        // Sushiswap weird error where metamask cannot estimate
        if (operations.find((o: StrategyOperation) => o.integration === '0x5AB55c258a206faed897b79376660E20A82D7281')) {
          setTxReady(gardenWeb3.addStrategy(...strategy.getProps(), { gasLimit: 1300000 }));
        } else {
          setTxReady(gardenWeb3.addStrategy(...strategy.getProps()));
        }
      } catch (err) {
        console.log('Submit strategy error', err);
      }
    }
  };

  const transactionFinalized = () => {
    setTxReady(undefined);
  };

  return (
    <StrategySubmissionWrapper>
      {!txReady && (
        <ContentWrapper>
          <SectionWrapper>
            <Breadcrumbs currentStep={strategyStep} steps={strategySteps} />
            <FlowContent>
              <StepName>{strategySteps[strategyStep]}</StepName>
              {strategyStep === 0 && (
                <StrategyOperations
                  name={name}
                  subgraphClients={subgraphClients}
                  gardenDetails={gardenDetails}
                  operations={operations || []}
                  setStrategyAndOps={(name: string, operations: StrategyOperation[]) => {
                    setName(name);
                    setOperations(operations);
                    setCurrentStepValid(
                      operations.length >= MIN_OPERATIONS &&
                        operations.length < MAX_OPERATIONS &&
                        name.length >= 5 &&
                        name.length < 40,
                    );
                  }}
                />
              )}
              {strategyStep === 1 && operations && name && (
                <StrategyParams
                  resetCounter={resetCounter}
                  userTokenBalanceAvailable={userTokenBalanceAvailable}
                  strategyParams={strategyParams}
                  gardenDetails={gardenDetails}
                  setStrategyParams={(strategyParams: StrategyParamsData | undefined) => {
                    setCurrentStepValid(!!strategyParams);
                    if (strategyParams) {
                      setStrategyParams(strategyParams);
                    }
                  }}
                />
              )}
              {strategyStep === 2 && operations && strategyParams && (
                <StrategyReview
                  gardenDetails={gardenDetails}
                  name={name}
                  operations={operations}
                  strategyParams={strategyParams}
                />
              )}
            </FlowContent>
          </SectionWrapper>
          <ButtonWrapper>
            {strategyStep > 0 && (
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
            <TurquoiseButton
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (currentStepValid) {
                  nextStep();
                }
                e.currentTarget.blur();
              }}
              disabled={!currentStepValid}
            >
              {strategyStep === strategySteps.length - 1 ? 'Submit' : 'Next'}
            </TurquoiseButton>
          </ButtonWrapper>
        </ContentWrapper>
      )}
      {txReady && (
        <TxLoader
          inModal
          type={TxType.submitStrategy}
          txObject={txReady}
          waitForConfirmation
          onSuccess={() => refetch()}
          onConfirm={transactionFinalized}
          onFailure={() => transactionFinalized()}
        />
      )}
    </StrategySubmissionWrapper>
  );
};

const StrategySubmissionWrapper = styled.div`
  color: white;
  width: 100%;
  padding: 40px 0;
  height: 100%;

  > button {
    position: relative;
    left: 200px;
  }
`;

const SectionWrapper = styled.div`
  display: flex;
  margin-top: 50px;
  width: 100%;
  flex-flow: row nowrap;
`;

const StepName = styled.div`
  font-size: 18px;
  line-height: 24px;
  color: white;
  font-weight: bold;
`;

const FlowContent = styled.div`
  min-height: 250px;
  width: 100%;
  border-left: 1px solid var(--blue-05);
  padding: 0 0 0 50px;
  position: relative;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;

const ButtonWrapper = styled.div`
  display: flex;
  margin-top: 30px;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
  > button:first-child {
    margin-right: 12px;
  }
`;

export default React.memo(StrategySubmission);
