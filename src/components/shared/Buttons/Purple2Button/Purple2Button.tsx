import React from 'react';
import { BaseButton } from '../BaseButton/';

interface Purple2ButtonProps {
  onClick: any;
  disabled?: boolean;
  type?: string;
  children: React.ReactNode;
  className?: string;
}

const Purple2Button = ({ onClick, className, disabled, children, type }: Purple2ButtonProps) => {
  return (
    <BaseButton
      color={'white'}
      className={className}
      background={'var(--purple-02)'}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </BaseButton>
  );
};

export default React.memo(Purple2Button);
