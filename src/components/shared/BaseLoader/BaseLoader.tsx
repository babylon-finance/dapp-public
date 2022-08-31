import { Loader } from 'rimble-ui';
import React from 'react';
import styled from 'styled-components';

interface BaseLoaderProps {
  size: number;
  color?: string;
  background?: string;
  text?: string;
}

const BaseLoader = ({ size, color, background, text }: BaseLoaderProps) => {
  return (
    <BaseLoaderWrapper>
      <Loader size={size} color={color} background={background} />
      {text && <LoaderText>{text}</LoaderText>}
    </BaseLoaderWrapper>
  );
};

const BaseLoaderWrapper = styled.div`
  width: 100%;
  height: auto;
  padding: 20px;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
`;

const LoaderText = styled.div`
  font-size: 20px;
  margin: 40px 0 10px;
  width: auto;
  text-align: center;
  color: white;
  width: 100%;
  padding: 0 30px;
`;

export default React.memo(BaseLoader);
