import React from 'react';
import { BaseButton } from '../BaseButton/';

interface Blue5ButtonProps {
  onClick: any;
  disabled?: boolean;
  type?: string;
  className?: string;
  children: React.ReactNode;
}

const Blue5Button = ({ onClick, disabled, className, children, type }: Blue5ButtonProps) => {
  return (
    <BaseButton
      color={'white'}
      className={className}
      background={'var(--blue-05)'}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </BaseButton>
  );
};

export default React.memo(Blue5Button);
