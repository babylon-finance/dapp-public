import CoinStackIconImage from './coinstack_icon.svg';

import React from 'react';
import styled from 'styled-components';

interface CoinStackIconProps {
  size?: number;
  text?: string;
}

const CoinStackIcon = ({ size = 100 }: CoinStackIconProps) => {
  return (
    <CoinStackIconImageWrapper>
      <img alt="coin-stack-img" src={CoinStackIconImage} height={size} width={size} />
    </CoinStackIconImageWrapper>
  );
};

const CoinStackIconImageWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

export default React.memo(CoinStackIcon);
