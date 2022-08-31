import { BaseButton } from '../BaseButton/';
import React from 'react';

interface YellowButtonProps {
  onClick: any;
  disabled?: boolean;
  type?: string;
  children: React.ReactNode;
  ml?: number;
  mr?: number;
  height?: number;
  minWidth?: number;
}

const YellowButton = ({ onClick, disabled, children, type, ml, mr, height, minWidth }: YellowButtonProps) => {
  return (
    <BaseButton
      ml={ml}
      mr={mr}
      height={height}
      minWidth={minWidth}
      color={'var(--primary)'}
      background={'var(--yellow)'}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </BaseButton>
  );
};

export default React.memo(YellowButton);
