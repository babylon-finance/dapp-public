import { HoverTooltip } from 'components/shared';
import { StrategyStatus, StrategyStates, KeeperError } from 'models';
import { firstUpper } from 'helpers/Strings';

import styled from 'styled-components';
import React from 'react';

interface StrategyStatesProps {
  status: StrategyStatus;
  keeperError?: KeeperError;
  className?: string;
  includeFinalize?: boolean;
}

const STATUS_TEXT = {
  finalized: 'This strategy has already finalized.',
  executed: 'Strategy has been allocated capital and is now active.',
  cooldown: 'Strategy is in cooldown.',
  ready: 'The proposal vote was successful! Garden funds will be allocated soon.',
  voting: 'Voting is in progress.',
};

const StrategyStateWidget = ({ status, keeperError, className, includeFinalize }: StrategyStatesProps) => {
  const tooltipContent = STATUS_TEXT[status];
  const proposalStates = Object.values(StrategyStates).slice(0, includeFinalize ? 6 : 5);
  const statusIndex = proposalStates.findIndex((i) => i === status);

  return (
    <StatesContainer className={className}>
      <Label>
        <Prefix>Status:</Prefix>
        <Status>
          <HoverTooltip
            fontSize={16}
            textOverride={firstUpper(status)}
            content={tooltipContent || ''}
            placement={'up'}
          />
        </Status>
        {keeperError && (
          <ErrorWrapper>
            <HoverTooltip size={16} content={keeperError.text} icon={keeperError.icon} placement={'up'} />
          </ErrorWrapper>
        )}
      </Label>
      <Continuum>
        {proposalStates.map((state, index) => {
          return (
            <StageItem key={state + index}>
              <Stage complete={statusIndex >= index} />
              <StageLabel>{firstUpper(state)}</StageLabel>
            </StageItem>
          );
        })}
      </Continuum>
    </StatesContainer>
  );
};

const ErrorWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-bottom: 4px;
`;

const Continuum = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin-top: 6px;
`;

const StageItem = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  margin-right: 3px;
  justify-content: center;
  align-items: center;
`;

const StageLabel = styled.span`
  padding-top: 4px;
  font-size: 11px;
  color: var(--blue-o3);
`;

const Stage = styled.div<{ complete: boolean; error?: boolean }>`
  height: 10px;
  width: 100%;
  background-color: ${(p) => (p.complete ? 'var(--positive)' : p.error ? 'var(--negative)' : 'var(--yellow)')};
`;

const StatesContainer = styled.div`
  margin: 0 30px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding: 10px;
  width: 300px;
  background-color: var(--blue-07);
  border-radius: 4px;
`;

const Label = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

const Prefix = styled.span`
  font-size: 16px;
  color: var(--blue-03);
`;

const Status = styled.div`
  margin: 0 4px 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 4px;
`;

export default React.memo(StrategyStateWidget);
