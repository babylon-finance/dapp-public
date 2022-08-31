import { Animation, AnimationName } from 'components/shared';
import React from 'react';
import styled from 'styled-components';

interface GlobalLoaderProps {
  size?: number;
}

const GlobalLoader = ({ size }: GlobalLoaderProps) => {
  return (
    <GlobalLoaderWrapper>
      <Animation name={AnimationName.gloader1} loop size={size || 400} />
    </GlobalLoaderWrapper>
  );
};

const GlobalLoaderWrapper = styled.div`
  width: 100%;
  height: 70vh;
  padding: 20px;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
`;

export default React.memo(GlobalLoader);
