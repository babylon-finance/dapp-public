import React from 'react';
import { BaseButton } from '../BaseButton/';

interface GreenButtonProps {
  onClick: any;
  disabled?: boolean;
  type?: string;
  children: React.ReactNode;
  className?: string;
}

const GreenButton = ({ onClick, className, disabled, children, type }: GreenButtonProps) => {
  return (
    <BaseButton
      color={'var(--primary)'}
      className={className}
      background={'var(--green)'}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </BaseButton>
  );
};

export default React.memo(GreenButton);
