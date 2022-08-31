import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { StrategyOperation, FullGardenDetails, OperationKind, IconName } from 'models/';
import { OperationSelector, IntegrationSelector, Icon } from 'components/shared';
import { OperationDetailsForm } from './OperationDetailsForm';
import { Bytes, zeroPad, concat } from '@ethersproject/bytes';

interface SingleOperationFormProps {
  operation: StrategyOperation;
  previousOperation: StrategyOperation | undefined;
  operationIndex: number;
  subgraphClients: any;
  gardenDetails: FullGardenDetails;
  availableOperations: number[];
  availableIntegrations: string[];
  deleteOperation: () => void;
  setOperation: (operation: StrategyOperation | undefined) => void;
}

const SingleOperationForm = ({
  operationIndex,
  subgraphClients,
  gardenDetails,
  operation,
  previousOperation,
  setOperation,
  deleteOperation,
  availableOperations,
  availableIntegrations,
}: SingleOperationFormProps) => {
  const [operationKind, setOperationKind] = useState<OperationKind | undefined>(operation.kind || undefined);
  const [integration, setIntegration] = useState<string | undefined>(operation.integration || undefined);
  const [dataOperation, setDataOperation] = useState<Bytes | undefined>(operation.data || undefined);
  const [dataAuxOperation, setDataAuxOperation] = useState<string | undefined>(operation.dataAux || undefined);

  const setBytesData = (bytes: Bytes) => {
    const allZeroes = zeroPad([], 64);
    const twelveZeroes = zeroPad([], 12);
    const newBytes = concat([twelveZeroes, bytes, allZeroes]).slice(0, 64);
    setDataOperation(newBytes);
  };

  useEffect(() => {
    setDataOperation(undefined);
    setDataAuxOperation(undefined);
  }, [integration]);

  useEffect(() => {
    if (operationKind !== undefined && dataOperation && integration) {
      setOperation({ kind: operationKind, data: dataOperation, integration, dataAux: dataAuxOperation });
    }
  }, [dataOperation, dataAuxOperation]);

  return (
    <OperationFormWrapper key={operationIndex}>
      <StrategyAndIntegration>
        <OperationSelectorW
          required
          availableOperations={availableOperations}
          name={`operation-selector-${operationIndex}`}
          value={operationKind}
          stateCallback={(value: any) => {
            setOperationKind(value.value);
            setIntegration(undefined);
            setOperation(undefined);
          }}
        />
        <IntegrationSelectorW
          disabled={operationKind === undefined}
          required
          operation={operationKind}
          availableIntegrations={availableIntegrations}
          name={`integration-selector-${operationIndex}`}
          value={integration}
          stateCallback={(value: any) => {
            setIntegration(value.value);
            setOperation(undefined);
          }}
        />
      </StrategyAndIntegration>
      {operationKind !== undefined && integration && (
        <OperationDetailsForm
          subgraphClients={subgraphClients}
          operationIndex={operationIndex}
          gardenDetails={gardenDetails}
          previousOperation={previousOperation}
          operation={{ kind: operationKind, integration, data: dataOperation as Bytes }}
          setOperationDetails={(data: Bytes, dataAux: any) => {
            setBytesData(data);
            setDataAuxOperation(dataAux);
          }}
        />
      )}
      {operationIndex > 0 && (
        <CancelOperationWrapper onClick={deleteOperation}>
          <Icon name={IconName.trash} size={24} color={'var(--turquoise-01)'} />
          <span>Cancel Operation</span>
        </CancelOperationWrapper>
      )}
    </OperationFormWrapper>
  );
};

const OperationFormWrapper = styled.div`
  min-height: 400px;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  color: white;
`;

const StrategyAndIntegration = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`;

const CancelOperationWrapper = styled.div`
  cursor: pointer;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin-top: 10px;
  height: 100%;

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

const OperationSelectorW = styled(OperationSelector)`
  width: 45%;
`;

const IntegrationSelectorW = styled(IntegrationSelector)`
  width: 45%;
`;

export default React.memo(SingleOperationForm);
