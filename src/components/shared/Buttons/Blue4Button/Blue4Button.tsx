import React from 'react';
import { BaseButton } from '../BaseButton/';

interface Blue4ButtonProps {
  onClick: any;
  disabled?: boolean;
  type?: string;
  className?: string;
  children: React.ReactNode;
}

const Blue4Button = ({ onClick, disabled, className, children, type }: Blue4ButtonProps) => {
  return (
    <BaseButton
      color={'var(--blue)'}
      className={className}
      background={'var(--blue-04)'}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </BaseButton>
  );
};

export default React.memo(Blue4Button);
