import SingleOperationForm from './SingleOperationForm';
import OperationDisplay from './OperationDisplay';
import { TextInput, Icon } from 'components/shared/';
import { convex, yearn, paladin, pickle, curve, aladdin } from 'constants/addresses';
import {
  StrategyOperation,
  FullGardenDetails,
  getIntegrationsFromOps,
  getIntegrationByName,
  getIntegrationByAddress,
  IntegrationName,
  IconName,
} from 'models/';
import { MAX_OPERATIONS, MIN_OPERATIONS } from 'constants/values';

import { hexlify, hexDataSlice } from '@ethersproject/bytes';
import React, { useState } from 'react';
import styled from 'styled-components';

interface StrategyOperationsProps {
  name: string;
  subgraphClients: any;
  gardenDetails: FullGardenDetails;
  operations: StrategyOperation[];
  setStrategyAndOps: (name: string, operations: StrategyOperation[]) => void;
}

const DEFAULT_OP: StrategyOperation = {
  kind: 0,
  integration: '',
  data: [],
};

interface AvailableOptions {
  operations: number[];
  integrations: string[];
}

const StrategyOperations = ({
  name,
  operations,
  gardenDetails,
  setStrategyAndOps,
  subgraphClients,
}: StrategyOperationsProps) => {
  const [newOperation, setNewOperation] = useState<StrategyOperation | undefined>(
    operations.length === 0 ? DEFAULT_OP : undefined,
  );
  const updateOperations = (o: StrategyOperation | undefined, index: number, deleteOp: boolean) => {
    let newOps = [...operations];
    if (deleteOp) {
      newOps = [...newOps.slice(0, index), ...newOps.slice(index + 1)];
    } else {
      newOps = [...newOps.slice(0, index), o as StrategyOperation, ...newOps.slice(index + 1)];
    }
    setStrategyAndOps(name, newOps);
  };
  const lastOp: StrategyOperation | undefined = operations.length > 0 ? operations[operations.length - 1] : undefined;

  const getAvailableOperationsAndIntegrations = (): AvailableOptions => {
    let operationsAv: number[] = [];
    let extraFilter: string[] = [];
    let blacklistFilter: string[] = [
      getIntegrationByName(IntegrationName.PickleFarm)?.displayName as string,
      getIntegrationByName(IntegrationName.CurveGauge)?.displayName as string,
    ];
    if (lastOp) {
      if (lastOp.kind === 0) {
        // last op was a buy, do anything
        operationsAv = [0, 1, 2, 3, 4, 5];
      }
      // If it is lend allow borrow
      if (lastOp.kind === 3) {
        operationsAv = [4];
        extraFilter = [getIntegrationByAddress(lastOp.integration)?.displayName as string];
        // After borrow allow anything except borrow
      } else if (lastOp.kind === 4) {
        operationsAv = [0, 1, 2, 3, 5];
        // After liquidity op
      } else if (lastOp.kind === 1) {
        // Add Convex if Curve before and pool is chainable
        const lastAddress = hexlify(hexDataSlice(lastOp.data, 12, 32)).toLowerCase();
        operationsAv = [];
        if (getIntegrationByAddress(lastOp.integration)?.name == IntegrationName.CurvePool) {
          operationsAv = [2];
          if (convex.pools.find((c: any) => c.crvpool.toLowerCase() === lastAddress)) {
            // Chaining CRV to convex to stake
            extraFilter.push(getIntegrationByName(IntegrationName.Convex)?.displayName as string);
          }
          if (yearn.vaults.find((v: any) => v.crvpool?.toLowerCase() === lastAddress)) {
            // Chaining CRV to yearn to stake
            extraFilter.push(getIntegrationByName(IntegrationName.YearnVault)?.displayName as string);
          }
          if (curve.pools.gaugeBlacklist.indexOf(lastAddress) < 0) {
            // Add curve gauge
            extraFilter.push(getIntegrationByName(IntegrationName.CurveGauge)?.displayName as string);
            blacklistFilter = blacklistFilter.filter(
              (i) => i !== (getIntegrationByName(IntegrationName.CurveGauge)?.displayName as string),
            );
          }
        }
        if (getIntegrationByAddress(lastOp.integration)?.name == IntegrationName.HarvestV3) {
          // Harvest V3 Stake
          operationsAv = [2];
          extraFilter = [getIntegrationByName(IntegrationName.HarvestV3Stake)?.displayName as string];
        }
        // Chaining Pickle
        if (
          pickle.jars.find(
            (p: any) =>
              p.crvpool?.toLowerCase() === lastAddress ||
              p.uni?.toLowerCase() === lastAddress ||
              p.sushi?.toLowerCase() === lastAddress,
          )
        ) {
          operationsAv = [2];
          extraFilter.push(getIntegrationByName(IntegrationName.PickleJar)?.displayName as string);
        }
        if (aladdin.pools.find((p: any) => p.crvpool?.toLowerCase() === lastAddress)) {
          operationsAv = [2];
          extraFilter.push(getIntegrationByName(IntegrationName.AladdinV3)?.displayName as string);
        }
      } else if (lastOp.kind === 2) {
        // if last op is stake
        const lastAddress = hexlify(hexDataSlice(lastOp.data, 12, 32)).toLowerCase();
        if (lastAddress === paladin.palStkAAVE.toLowerCase()) {
          operationsAv = [1];
          extraFilter.push(getIntegrationByName(IntegrationName.CurvePool)?.displayName as string);
        }
        // chain pickle farm
        const lastIntegration = getIntegrationByAddress(lastOp.integration)?.displayName as string;
        if (lastIntegration === getIntegrationByName(IntegrationName.PickleJar)?.displayName) {
          operationsAv = [2];
          extraFilter.push(getIntegrationByName(IntegrationName.PickleFarm)?.displayName as string);
          blacklistFilter = blacklistFilter.filter(
            (i) => i !== (getIntegrationByName(IntegrationName.PickleFarm)?.displayName as string),
          );
        }
      }
    } else {
      operationsAv = [0, 1, 2, 3, 5];
    }
    return {
      operations: operationsAv,
      integrations: getIntegrationsFromOps(operationsAv, extraFilter, blacklistFilter).map((i) => i.name),
    };
  };

  const available = getAvailableOperationsAndIntegrations();

  const deleteOperation = (operation: StrategyOperation | undefined, index: number) => {
    updateOperations(operation, index, true);
    if (operations.length === 1) {
      setNewOperation(DEFAULT_OP);
    }
  };

  return (
    <StrategyOperationsWrapper>
      <TextInput
        value={name}
        onChange={(e: React.FormEvent<HTMLInputElement>) => {
          setStrategyAndOps(e.currentTarget.value, operations);
        }}
        name={'name'}
        label={'Enter the name of the strategy'}
        width={'340px'}
        placeholder="e.g Long UNI, Lend DAI..."
        required
        valid={name.length <= 40 && name.length > 5}
      />
      <OperationSelectorContainer>
        <Title>Select the sequential DeFi operations to execute.</Title>
        {operations.map((operation: StrategyOperation, index: number) => (
          <OperationDisplay
            deleteOperation={() => {
              deleteOperation(operation, index);
            }}
            operation={operation}
            index={index}
            key={index}
          />
        ))}
        {newOperation && (
          <SingleOperationForm
            subgraphClients={subgraphClients}
            operation={newOperation as StrategyOperation}
            gardenDetails={gardenDetails}
            operationIndex={operations.length}
            deleteOperation={() => setNewOperation(undefined)}
            availableOperations={available.operations}
            availableIntegrations={available.integrations}
            previousOperation={operations.length > 0 ? operations[operations.length - 1] : undefined}
            setOperation={(o: StrategyOperation | undefined) => {
              if (o) {
                updateOperations(o, operations.length, false);
                setNewOperation(undefined);
              } else {
                setNewOperation(DEFAULT_OP);
              }
            }}
          />
        )}
        {!newOperation &&
          operations.length >= MIN_OPERATIONS &&
          operations.length < MAX_OPERATIONS &&
          available.operations.length > 0 && (
            <AddOperationWrapper onClick={() => setNewOperation(DEFAULT_OP)}>
              <Icon name={IconName.plus} size={24} color={'var(--turquoise-01)'} />
              <span>Add New Operation</span>
            </AddOperationWrapper>
          )}
      </OperationSelectorContainer>
    </StrategyOperationsWrapper>
  );
};

const OperationSelectorContainer = styled.div`
  margin-top: 30px;
`;

const StrategyOperationsWrapper = styled.div`
  margin-top: 30px;
  min-height: 250px;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  color: white;
`;

const Title = styled.p`
  font-size: 14px;
  line-height: 24px;
  margin-top: 10px;
`;

const AddOperationWrapper = styled.div`
  cursor: pointer;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  &:hover {
    opacity: 0.8;
  }

  span {
    margin-left: 8px;
    color: var(--turquoise-01);
    font-size: 16px;
  }

  &:hover {
    span,
    svg path {
      fill: var(--turquoise-02);
      color: var(--turquoise-02);
    }
  }
`;

export default React.memo(StrategyOperations);
