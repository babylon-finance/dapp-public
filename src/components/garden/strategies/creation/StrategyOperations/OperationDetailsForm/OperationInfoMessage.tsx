import { Icon } from 'components/shared';
import { IconName } from 'models';

import React from 'react';
import styled from 'styled-components';

interface OperationInfoMessageProps {
  children: React.ReactNode;
  className?: string;
}

const OperationInfoMessage = ({ children, className }: OperationInfoMessageProps) => {
  return (
    <OperationInfoWrapper className={className}>
      <Header>
        <Icon name={IconName.starCrashing} size={24} />
        <span>Strategy Tips</span>
      </Header>
      {children}
    </OperationInfoWrapper>
  );
};

const OperationInfoWrapper = styled.div`
  background: var(--blue-07);
  border-radius: 2px;
  color: white;
  display: flex;
  flex-flow: column nowrap;
  margin: 30px 0;
  padding: 15px;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;

  span {
    margin-left: 10px;
  }
`;

export default React.memo(OperationInfoMessage);
