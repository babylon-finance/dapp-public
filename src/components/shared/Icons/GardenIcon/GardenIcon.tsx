import React from 'react';
import styled from 'styled-components';
import PlaceHolderIcon from './placeholder.svg';

interface GardenIconProps {
  url?: string;
  size: number;
}

const GardenIcon = ({ url, size }: GardenIconProps) => {
  return <GardenIconWrapper src={url || PlaceHolderIcon} width={size} height={size} />;
};

const GardenIconWrapper = styled.img`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default React.memo(GardenIcon);
