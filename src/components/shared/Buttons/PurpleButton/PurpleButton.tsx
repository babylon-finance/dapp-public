import React from 'react';
import { BaseButton } from '../BaseButton/';

interface PurpleButtonProps {
  onClick: any;
  disabled?: boolean;
  type?: string;
  children: React.ReactNode;
  className?: string;
}

const PurpleButton = ({ onClick, className, disabled, children, type }: PurpleButtonProps) => {
  return (
    <BaseButton
      color={'white'}
      className={className}
      background={'var(--purple)'}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </BaseButton>
  );
};

export default React.memo(PurpleButton);
