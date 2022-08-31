import BablTokenIconImage from './babltoken_icon.svg';

import React from 'react';
import styled from 'styled-components';

interface BablTokenIconProps {
  size?: number;
  padding?: number;
}

const BablTokenIcon = ({ size = 100, padding = 40 }: BablTokenIconProps) => {
  return (
    <BablTokenIconImageWrapper padding={padding}>
      <img alt="babl-reward-img" src={BablTokenIconImage} height={size} width={size} />
    </BablTokenIconImageWrapper>
  );
};

const BablTokenIconImageWrapper = styled.div<{ padding: number }>`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  padding: ${(p) => `${p.padding}px`};
`;

export default React.memo(BablTokenIcon);
