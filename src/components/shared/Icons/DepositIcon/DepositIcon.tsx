import DepositIconImage from './deposit_icon.svg';

import React from 'react';
import styled from 'styled-components';

interface DepositIconProps {
  size?: number;
  text?: string;
}

const DepositIcon = ({ size = 100 }: DepositIconProps) => {
  return (
    <DepositIconImageWrapper>
      <img alt="deposit-img" src={DepositIconImage} height={size} width={size} />
    </DepositIconImageWrapper>
  );
};

const DepositIconImageWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

export default React.memo(DepositIcon);
