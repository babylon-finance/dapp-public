import React from 'react';
import { BaseButton } from '../BaseButton';

interface RedButtonProps {
  onClick: any;
  disabled?: boolean;
  type?: string;
  children: React.ReactNode;
  className?: string;
}

const RedButton = ({ onClick, className, disabled, children, type }: RedButtonProps) => {
  return (
    <BaseButton
      color={'var(--white)'}
      className={className}
      background={'var(--red)'}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </BaseButton>
  );
};

export default React.memo(RedButton);
