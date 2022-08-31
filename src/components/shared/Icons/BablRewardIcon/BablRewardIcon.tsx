import BablRewardIconImage from './bablreward_icon.svg';

import React from 'react';
import styled from 'styled-components';

interface BablRewardIconProps {
  size?: number;
  text?: string;
  className?: string;
}

const BablRewardIcon = ({ size = 100, className }: BablRewardIconProps) => {
  return (
    <BablRewardIconImageWrapper className={className}>
      <img alt="babl-reward-img" src={BablRewardIconImage} height={size} width={size} />
    </BablRewardIconImageWrapper>
  );
};

const BablRewardIconImageWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

export default React.memo(BablRewardIcon);
