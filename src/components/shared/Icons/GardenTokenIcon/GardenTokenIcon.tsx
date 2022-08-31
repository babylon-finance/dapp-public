import GardenTokenIconImage from './gardentoken_icon.svg';

import React from 'react';
import styled from 'styled-components';

interface GardenTokenIconProps {
  size?: number;
  className?: string;
}

const GardenTokenIcon = ({ size = 100, className }: GardenTokenIconProps) => {
  return (
    <GardenTokenIconImageWrapper className={className}>
      <img alt="babl-reward-img" src={GardenTokenIconImage} height={size} width={size} />
    </GardenTokenIconImageWrapper>
  );
};

const GardenTokenIconImageWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
`;

export default React.memo(GardenTokenIcon);
