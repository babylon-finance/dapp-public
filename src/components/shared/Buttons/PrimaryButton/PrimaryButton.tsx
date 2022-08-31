import React from 'react';
import { BaseButton } from '../BaseButton/';

interface PrimaryButtonProps {
  onClick: any;
  disabled?: boolean;
  type?: string;
  children: React.ReactNode;
  className?: string;
}

const PrimaryButton = ({ onClick, className, disabled, children, type }: PrimaryButtonProps) => {
  return (
    <BaseButton
      color={'var(--white)'}
      className={className}
      background={'var(--primary)'}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </BaseButton>
  );
};

export default React.memo(PrimaryButton);
