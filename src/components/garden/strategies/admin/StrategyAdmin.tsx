import { StrategyParamsData } from '../creation/StrategyParams/strategyParamsTypes';
import { StrategyParams } from '../creation/StrategyParams/';
import { BaseModal, Icon, PurpleButton, TxLoader } from 'components/shared';

import { StrategyDetails, FullGardenDetails, UpdateStrategyParamsRequest, Token, IconName } from 'models';
import { firstUpper } from 'helpers/Strings';
import { Strategy } from 'constants/contracts';
import { formatEtherDecimal, formatReserveFloat } from 'helpers/Numbers';
import { TokenListService } from 'services';
import { loadContractFromNameAndAddress } from 'hooks/ContractLoader';
import { useW3Context } from 'context/W3Provider';

import { parseEther, formatEther } from '@ethersproject/units';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';

interface StrategyAdminProps {
  strategy: StrategyDetails;
  gardenDetails: FullGardenDetails;
  refetch(): void;
}

// Note this should be in the order want to display them
const PanelSections = {
  params: 'params',
  exit: '',
};

const OptionText = {
  params: 'Update Parameters',
  exit: 'Exit Strategy',
};

const OptionIcon = {
  exit: IconName.starCrashing,
  params: IconName.switch,
};

interface NavItemProps {
  clickHandler(section: string): void;
  selected: string;
}

const NavOptions = ({ clickHandler, selected }: NavItemProps) => {
  return (
    <NavOptionsWrapper>
      {Object.keys(PanelSections)
        .filter((s) => !!PanelSections[s])
        .map((section) => (
          <NavItem key={section} active={selected === section} onClick={() => clickHandler(section)}>
            <Icon name={OptionIcon[section] || IconName.edit} size={24} />
            <NavItemName>{firstUpper(OptionText[section] || '')}</NavItemName>
          </NavItem>
        ))}
    </NavOptionsWrapper>
  );
};

const StrategyAdminNav = ({ clickHandler, selected }: NavItemProps) => {
  return (
    <NavContainer>
      <StrategyAdminHeader>Admin</StrategyAdminHeader>
      <NavOptionsContainer>
        <NavOptions selected={selected} clickHandler={clickHandler} />
      </NavOptionsContainer>
    </NavContainer>
  );
};

const StrategyAdmin = ({ strategy, gardenDetails, refetch }: StrategyAdminProps) => {
  const [showModal, setShowModal] = useState(false);
  const [txReady, setTxReady] = useState<any | undefined>(undefined);
  const [selection, setSelection] = useState<string>(PanelSections.params);
  const tokenListService = TokenListService.getInstance();
  const reserve = tokenListService.getTokenByAddress(gardenDetails.reserveAsset) as Token;
  const [txContract, setTxContract] = useState<Contract | undefined>(undefined);
  const [resetCounter, setResetCounter] = useState(0);
  const [currentStepValid, setCurrentStepValid] = useState(false);
  const [strategyParams, setStrategyParams] = useState<StrategyParamsData>({
    duration: Math.floor(strategy.duration / 86400),
    expectedReturn: Math.floor(parseFloat(formatEther(strategy.expectedReturn)) * 100),
    stake: parseFloat(formatEther(strategy.stake)),
    maxCapitalRequested: Number(formatReserveFloat(strategy.maxCapitalRequested, reserve, 1)),
    maxPercentAllocation: Math.floor(parseFloat(formatEther(strategy.maxPercentAllocation)) * 100),
    maxGasFeePercentage: Math.floor(parseFloat(formatEther(strategy.maxGasFeePercentage)) * 100) || 1,
    maxSlippagePercentage: Math.floor(parseFloat(formatEther(strategy.maxSlippagePercentage)) * 100) || 1,
  });
  const { txProvider, provider, address } = useW3Context();

  const isStrategist = !!address && address.toLowerCase() === strategy.strategist.toLowerCase();

  const availableTokens = Math.max(
    0,
    formatEtherDecimal(gardenDetails?.contribution?.availableTokens || BigNumber.from(0)),
  );
  // Adds finalize option if needed
  if (!strategy.inCooldown && !strategy.isReadyWaiting && strategy.active) {
    PanelSections.exit = 'finalize';
  }

  useEffect(() => {
    const setContract = async () => {
      const txContract = (await loadContractFromNameAndAddress(strategy.address, Strategy, txProvider)) as Contract;
      setTxContract(txContract);
    };

    setContract();
  }, []);

  if (!isStrategist) {
    return null;
  }

  const toggleModal = (): void => {
    setResetCounter(resetCounter + 1);
    setShowModal(!showModal);
  };

  const setSelected = (selection: string) => {
    setSelection(PanelSections[selection] || PanelSections.params);
  };

  const handleExit = async () => {
    if (txProvider && txContract) {
      try {
        setTxReady(
          txContract?.updateParams([
            BigNumber.from(Math.floor(strategy.timePassed / 1000)),
            strategy.maxGasFeePercentage,
            strategy.maxSlippagePercentage,
            strategy.maxPercentAllocation,
            strategy.maxCapitalRequested,
          ]),
        );
      } catch (err) {
        console.log('Failed to update strategy', err);
      }
    }
  };

  const updateParams = async () => {
    if (txProvider && strategyParams) {
      const strategyContract = (await loadContractFromNameAndAddress(
        strategy.address,
        Strategy,
        txProvider,
      )) as Contract;
      try {
        const updateParamsRequest = new UpdateStrategyParamsRequest([
          BigNumber.from(60 * 60 * 24 * strategyParams.duration),
          parseEther(Number(strategyParams.maxGasFeePercentage / 100).toString()),
          parseEther(Number(strategyParams.maxSlippagePercentage / 100).toString()),
          parseEther(Number(strategyParams.maxPercentAllocation / 100).toString()),
          parseEther(Number(strategyParams.maxCapitalRequested).toString()),
        ]);
        setTxReady(strategyContract.updateParams(...updateParamsRequest.getProps()));
      } catch (err) {
        console.error('Update Garden Params error', err);
      }
    }
  };

  return (
    <StrategyAdminWrapper>
      {txReady && provider && (
        <TxLoader
          inModal
          txObject={txReady}
          waitForConfirmation
          onConfirm={() => {
            setTxReady(undefined);
            refetch();
          }}
          onFailure={() => setTxReady(undefined)}
        />
      )}
      <StyledPurpleButton onClick={toggleModal}>
        <Icon name={IconName.admin} size={24} />
        Admin
      </StyledPurpleButton>
      <BaseModal width={'1200px'} isOpen={showModal} toggleModal={toggleModal}>
        <ModalContainer>
          <StrategyAdminNav selected={selection} clickHandler={setSelected} />
          <PanelContainer>
            <PanelHeader>
              <StrategyName>{strategy.name}</StrategyName>
            </PanelHeader>
            <PanelContent>
              {selection === PanelSections.params && (
                <StrategyPanel>
                  <StrategyParams
                    resetCounter={resetCounter}
                    userTokenBalanceAvailable={availableTokens}
                    onlyUpdate
                    strategyParams={strategyParams}
                    gardenDetails={gardenDetails}
                    setStrategyParams={(strategyParams: StrategyParamsData | undefined) => {
                      setCurrentStepValid(!!strategyParams);
                      if (strategyParams) {
                        setStrategyParams(strategyParams);
                      }
                    }}
                  />
                  <PurpleButton disabled={!currentStepValid} onClick={() => updateParams()}>
                    Update Params
                  </PurpleButton>
                </StrategyPanel>
              )}
              {selection === 'finalize' && (
                <StrategyPanel>
                  <h4>Do you want to exit the strategy asap?</h4>
                  <p>
                    Note: This signals that the strategy is ready to be finalized. The keeper will finalize it as soon
                    as it is gas efficient to do so.
                  </p>
                  {strategy.timePassed > gardenDetails.minStrategyDuration.toNumber() && (
                    <PurpleButton disabled={strategy.waitingOnFinalize} onClick={() => handleExit()}>
                      {strategy.waitingOnFinalize ? 'Finalizing...' : 'Exit Now'}
                    </PurpleButton>
                  )}
                  {strategy.timePassed <= gardenDetails.minStrategyDuration.toNumber() && (
                    <span> Below Minimum Duration </span>
                  )}
                </StrategyPanel>
              )}
            </PanelContent>
          </PanelContainer>
        </ModalContainer>
      </BaseModal>
    </StrategyAdminWrapper>
  );
};

const StrategyAdminWrapper = styled.div``;

const StrategyAdminHeader = styled.div`
  width: 100%;
  font-size: 24px;
  font-family: cera-medium;
  padding-left: 20px;
`;

const NavOptionsContainer = styled.div`
  margin-top: 60px;
`;

const NavOptionsWrapper = styled.div``;

const NavContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  min-width: 300px;
  width: 300px;
  min-height: 1020px;
  margin: -20px 0px;
  padding: 40px 20px 20px 0;
  border-right: 1px solid var(--border-blue);
`;

const NavItem = styled.div<{ active: boolean }>`
  padding: 10px;
  color: var(--white);
  display: flex;
  flex-flow: row nowrap;
  background-color: ${(p) => (p.active ? 'var(--blue-06)' : 'inherit')};
  ${(p) => (!p.active ? '&:hover { cursor: pointer; background-color: var(--blue-07) }' : '')}
`;

const NavItemName = styled.span`
  color: var(--white);
  font-size: 16px;
  padding-left: 10px;
`;

const PanelContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 20px;
  width: 100%;
`;

const PanelContent = styled.div`
  margin-top: 65px;
  width: 100%;
`;

const StrategyPanel = styled.div``;

const PanelHeader = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

const ModalContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

const StyledPurpleButton = styled(PurpleButton)`
  height: 40px;

  > span {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: flex-start;

    svg {
      margin-right: 4px;
    }
  }
`;

const StrategyName = styled.div`
  font-family: cera-medium;
  font-size: 18px;
  display: flex;
  flex-flow: column nowrap;
  padding: 0 20px;
  justify-content: center;
  height: 100%;
`;

export default React.memo(StrategyAdmin);
