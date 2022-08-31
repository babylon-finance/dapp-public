import RewardsIconImage from './rewards_icon.svg';

import React from 'react';
import styled from 'styled-components';

interface RewardsIconLargeProps {
  size?: number;
  text?: string;
}

const RewardsIconLarge = ({ size = 100 }: RewardsIconLargeProps) => {
  return (
    <RewardsIconLargeImageWrapper>
      <img alt="rewards-img" src={RewardsIconImage} height={size} width={size} />
    </RewardsIconLargeImageWrapper>
  );
};

const RewardsIconLargeImageWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
`;

export default React.memo(RewardsIconLarge);
