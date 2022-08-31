import ReturnsIconImage from './returns_icon.svg';

import React from 'react';
import styled from 'styled-components';

interface ReturnsIconLargeProps {
  size?: number;
  text?: string;
}

const ReturnsIconLarge = ({ size = 100 }: ReturnsIconLargeProps) => {
  return (
    <ReturnsIconLargeImageWrapper>
      <img alt="rewards-img" src={ReturnsIconImage} height={size} width={size} />
    </ReturnsIconLargeImageWrapper>
  );
};

const ReturnsIconLargeImageWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
`;

export default React.memo(ReturnsIconLarge);
