import React from 'react';
import styled from 'styled-components';
import { FullGardenDetails } from 'models/GardenDetails';
import {
  LongStrategyForm,
  PoolStrategyForm,
  YieldStrategyForm,
  LendStrategyForm,
  BorrowStrategyForm,
  CurveGaugeOperationForm,
  LidoOperationForm,
  StakewiseOperationForm,
  FuseLendForm,
  PickleOperationForm,
  AladdinOperationForm,
  PickleFarmOperationForm,
  CustomStrategyForm,
  ConvexOperationForm,
  YearnOperationForm,
} from './';
import {
  IntegrationName,
  StrategyOperation,
  getIntegrationByAddress,
  Integration,
  getCustomIntegration,
} from 'models/';
import { Bytes } from '@ethersproject/bytes';

interface OperationDetailsFormProps {
  subgraphClients: any;
  gardenDetails: FullGardenDetails;
  operationIndex: number;
  operation: StrategyOperation;
  previousOperation: StrategyOperation | undefined;
  setOperationDetails: (data: Bytes, dataAux: any) => void;
}

const getGraphClient = (integrationName: string, subgraphClients: any) => {
  switch (integrationName) {
    case IntegrationName.Balancer:
      return subgraphClients.balancer;
    case IntegrationName.OneInchPool:
      return subgraphClients.oneinchPool;
    case IntegrationName.UniswapPool:
      return subgraphClients.uniswapV2;
    case IntegrationName.SushiswapPool:
      return subgraphClients.sushiswap;
    case IntegrationName.CompoundLend:
      return subgraphClients.compoundV2;
    case IntegrationName.CompoundBorrow:
      return subgraphClients.compoundV2;
    case IntegrationName.AaveLend:
      return subgraphClients.aaveV2;
    case IntegrationName.AaveBorrow:
      return subgraphClients.aaveV2;
    case IntegrationName.CurvePool:
      return subgraphClients.curvePool;
    case IntegrationName.Harvest:
      return subgraphClients.harvest;
    default:
      return undefined;
  }
};

const OperationDetailsForm = ({
  subgraphClients,
  gardenDetails,
  operation,
  previousOperation,
  operationIndex,
  setOperationDetails,
}: OperationDetailsFormProps) => {
  const renderChildForm = () => {
    if (!operation.integration) {
      return;
    }
    const integrationObj =
      operation.kind !== 5
        ? (getIntegrationByAddress(operation.integration) as Integration)
        : getCustomIntegration(operation.integration);
    const graphClient = getGraphClient(integrationObj.name, subgraphClients);
    switch (integrationObj.name) {
      case IntegrationName.Custom:
        return (
          <CustomStrategyForm
            gardenDetails={gardenDetails}
            integration={integrationObj.name}
            operationIndex={operationIndex}
            integrationData={operation.data}
            setIntegrationData={setOperationDetails}
            previousOperation={previousOperation}
          />
        );
      case IntegrationName.FuseLend:
        return (
          <FuseLendForm
            gardenDetails={gardenDetails}
            integration={integrationObj.name}
            operationIndex={operationIndex}
            integrationData={operation.data}
            setIntegrationData={setOperationDetails}
          />
        );
      case IntegrationName.Lido:
        return (
          <LidoOperationForm
            gardenDetails={gardenDetails}
            integration={integrationObj.name}
            operationIndex={operationIndex}
            integrationData={operation.data}
            setIntegrationData={setOperationDetails}
          />
        );
      case IntegrationName.Stakewise:
        return (
          <StakewiseOperationForm
            gardenDetails={gardenDetails}
            integration={integrationObj.name}
            operationIndex={operationIndex}
            integrationData={operation.data}
            setIntegrationData={setOperationDetails}
          />
        );
      case IntegrationName.Convex:
        return (
          <ConvexOperationForm
            previousOperation={previousOperation}
            gardenDetails={gardenDetails}
            operationIndex={operationIndex}
            integration={integrationObj.name}
            integrationData={operation.data}
            setIntegrationData={setOperationDetails}
          />
        );
      case IntegrationName.YearnVault:
        return (
          <YearnOperationForm
            previousOperation={previousOperation}
            gardenDetails={gardenDetails}
            operationIndex={operationIndex}
            integration={integrationObj.name}
            integrationData={operation.data}
            setIntegrationData={setOperationDetails}
          />
        );
      case IntegrationName.PickleJar:
        return (
          <PickleOperationForm
            previousOperation={previousOperation}
            gardenDetails={gardenDetails}
            operationIndex={operationIndex}
            integration={integrationObj.name}
            integrationData={operation.data}
            setIntegrationData={setOperationDetails}
          />
        );
      case IntegrationName.PickleFarm:
        return (
          <PickleFarmOperationForm
            previousOperation={previousOperation}
            gardenDetails={gardenDetails}
            operationIndex={operationIndex}
            integration={integrationObj.name}
            integrationData={operation.data}
            setIntegrationData={setOperationDetails}
          />
        );
      case IntegrationName.AladdinV3:
        return (
          <AladdinOperationForm
            previousOperation={previousOperation}
            gardenDetails={gardenDetails}
            operationIndex={operationIndex}
            integration={integrationObj.name}
            integrationData={operation.data}
            setIntegrationData={setOperationDetails}
          />
        );
      case IntegrationName.CurveGauge:
        return (
          <CurveGaugeOperationForm
            previousOperation={previousOperation}
            gardenDetails={gardenDetails}
            operationIndex={operationIndex}
            integration={integrationObj.name}
            integrationData={operation.data}
            setIntegrationData={setOperationDetails}
          />
        );
      case IntegrationName.Harvest:
        return (
          <YieldStrategyForm
            gardenDetails={gardenDetails}
            graphClient={graphClient}
            operationIndex={operationIndex}
            integration={integrationObj.name}
            integrationData={operation.data}
            setIntegrationData={setOperationDetails}
          />
        );
      case IntegrationName.UniswapV3Trade:
      case IntegrationName.MasterSwapper:
        return (
          <LongStrategyForm
            gardenDetails={gardenDetails}
            operationIndex={operationIndex}
            integrationData={operation.data}
            setIntegrationData={setOperationDetails}
          />
        );
      case IntegrationName.Balancer:
      case IntegrationName.UniswapPool:
      case IntegrationName.OneInchPool:
      case IntegrationName.SushiswapPool:
      case IntegrationName.CurvePool:
        return (
          <PoolStrategyForm
            graphClient={graphClient}
            operationIndex={operationIndex}
            gardenDetails={gardenDetails}
            previousOperation={previousOperation}
            integration={integrationObj.name}
            integrationData={operation.data}
            setIntegrationData={setOperationDetails}
          />
        );
      case IntegrationName.CompoundLend:
      case IntegrationName.AaveLend:
        return (
          <LendStrategyForm
            gardenDetails={gardenDetails}
            graphClient={graphClient}
            operationIndex={operationIndex}
            integration={integrationObj.name}
            integrationData={operation.data}
            setIntegrationData={setOperationDetails}
          />
        );
      case IntegrationName.CompoundBorrow:
      case IntegrationName.AaveBorrow:
      case IntegrationName.FuseBorrow:
        return (
          <BorrowStrategyForm
            previousOperation={previousOperation}
            graphClient={graphClient}
            operationIndex={operationIndex}
            integration={integrationObj.name}
            integrationData={operation.data}
            setIntegrationData={setOperationDetails}
          />
        );
      default:
        return <div />;
    }
  };
  return (
    <OperationDetailsWrapper key={operationIndex}>{operation.integration && renderChildForm()}</OperationDetailsWrapper>
  );
};

const OperationDetailsWrapper = styled.div`
  min-height: 400px;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  color: white;
  align-items: center;
`;

export default React.memo(OperationDetailsForm);
