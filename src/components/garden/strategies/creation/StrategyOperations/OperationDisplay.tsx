import React from 'react';
import { OperationBase, getIconName, getOperations, StrategyOperation } from 'models/Strategies';
import styled from 'styled-components';
import { OperationIcon, ProtocolIcon, ReviewPill, HoverTooltip, OperationDetails, Icon } from 'components/shared';
import { getIntegrationByAddress } from 'models/Integrations';
import { IconName } from 'models';
import { mkShortAddress } from 'helpers/Addresses';

interface OperationDisplayProps {
  operation: StrategyOperation;
  index: number;
  deleteOperation?: () => void;
}

const OperationDisplay = ({ operation, index, deleteOperation }: OperationDisplayProps) => {
  return (
    <OperationDisplayWrapper>
      <OperationIndexWrapper style={{ marginTop: index === 0 ? '30px' : '0' }}>
        <OperationIndex>{index + 1}</OperationIndex>
      </OperationIndexWrapper>
      <OperationProtocolWrapper>
        <ReviewPillW title={index === 0 ? 'Operation Type' : undefined} showYellowGradient={operation.kind === 5}>
          <OperationIcon size={32} name={getIconName(operation.kind)} />
          <p style={{ marginLeft: '20px', color: 'white' }}>
            {getOperations().find((s: OperationBase) => s.kind === operation.kind)?.title}{' '}
          </p>
          {operation.kind === 5 && (
            <HoverTooltip
              icon={IconName.warning}
              content={`This integration is unverified. Please make sure you vet the contract properly before approving it.`}
              placement="top"
            />
          )}
        </ReviewPillW>
        <ReviewPillW title={index === 0 ? 'Protocol' : undefined}>
          {operation.kind === 5 && (
            <>
              <ProtocolIcon size={32} name={'etherscan'} />
              <p style={{ marginLeft: '20px' }}>{mkShortAddress(operation.integration)}</p>
            </>
          )}
          {operation.kind !== 5 && (
            <>
              <ProtocolIcon size={32} name={getIntegrationByAddress(operation.integration)?.iconName as string} />
              <p style={{ marginLeft: '20px' }}>
                {getIntegrationByAddress(operation.integration)?.displayName || 'Integration'}
              </p>
            </>
          )}
        </ReviewPillW>
        <ReviewPillW title={index === 0 ? 'Operation Detail' : undefined}>
          <OperationDetails operation={operation} />
        </ReviewPillW>
      </OperationProtocolWrapper>
      <OperationActions style={{ marginTop: index === 0 ? '27px' : '-9px' }}>
        {deleteOperation && (
          <OperationAction onClick={() => deleteOperation()}>
            <Icon size={24} color="white" name={IconName.trash} />
          </OperationAction>
        )}
      </OperationActions>
    </OperationDisplayWrapper>
  );
};

const OperationIndex = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  border-radius: 25px;
  border: 2px solid var(--purple-02);
  color: var(--purple-02);
  font-feature-settings: 'pnum' on, 'lnum' on;
  font-size: 20px;
  font-family: cera-medium;
  height: 50px;
  width: 50px;
  text-align: center;
`;

const OperationDisplayWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 5px;
`;

const OperationIndexWrapper = styled.div`
  height: 100%;
  margin-right: 16px;
`;

const OperationProtocolWrapper = styled.div`
  width: autox;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;

  p {
    font-size: 14px;
    font-weight: 700;
  }

  > div {
    min-width: 200px;
    margin-right: 10px;
  }
`;

const OperationActions = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
`;

const OperationAction = styled.div`
  display: flex;
  flex-flow: row nowrap;
  height: 56px;
  width: 52px;
  align-items: center;
  justify-content: center;
  background: var(--purple);
  margin: 0 4px;
  cursor: pointer;

  &:hover {
    svg path {
      fill: var(--primary);
    }
  }
`;

const ReviewPillW = styled(ReviewPill)`
  height: 123px;
  overflow: hidden;
  p {
    margin: 0;
  }
`;
export default React.memo(OperationDisplay);
