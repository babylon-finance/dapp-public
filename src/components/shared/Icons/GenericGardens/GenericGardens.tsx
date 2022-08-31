import GenericGardenIcon from './generic_gardens.svg';

import React from 'react';
import styled from 'styled-components';

interface GenericGardenImageProps {
  size?: number;
  text?: string;
}

const GenericGardenImage = ({ size = 100, text }: GenericGardenImageProps) => {
  return (
    <GenericGardenImageWrapper>
      <img alt="generic-garden-group" src={GenericGardenIcon} height={size} width={size} />
      <ImageText>{text}</ImageText>
    </GenericGardenImageWrapper>
  );
};

const GenericGardenImageWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const ImageText = styled.div`
  padding-top: 30px;
  color: var(--white);
  font-size: 28px;
  text-align: center;
`;

export default React.memo(GenericGardenImage);
