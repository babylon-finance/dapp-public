import React from 'react';
import { BaseButton } from '../BaseButton/';
import styled from 'styled-components';

interface WhiteButtonProps {
  onClick: any;
  disabled?: boolean;
  type?: string;
  className?: string;
  children: React.ReactNode;
}

const WhiteButton = ({ onClick, disabled, className, children, type }: WhiteButtonProps) => {
  return (
    <StyledBaseButton
      color={'var(--blue)'}
      className={className}
      background={'var(--white)'}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </StyledBaseButton>
  );
};

const StyledBaseButton = styled(BaseButton)`
  padding: 0 20px;
  height: 40px;
  font-family: cera-medium;
  border-color: transparent;
  span {
    color: var(--blue);
  }

  &:hover {
    --main-color: var(--blue-04);
    background: var(--blue-04);
  }

  &:focus {
    --main-color: var(--blue-03);
    background: var(--blue-03);
  }

  &:disabled {
    background: var(--blue-03);
    --main-color: var(--blue-03);
    opacity: 0.4;
  }
`;

export default React.memo(WhiteButton);
