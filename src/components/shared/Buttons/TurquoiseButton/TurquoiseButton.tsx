import { BaseButton } from '../BaseButton/';

import React from 'react';
import styled from 'styled-components';

interface TurquoiseButtonProps {
  onClick: any;
  disabled?: boolean;
  inverted?: boolean;
  type?: string;
  children: React.ReactNode;
  className?: string;
  width?: string;
}

const TurquoiseButton = ({ onClick, className, disabled, children, type, inverted, width }: TurquoiseButtonProps) => {
  return (
    <StyledBaseButton
      color={!inverted ? 'var(--blue)' : 'var(--turquoise-01)'}
      className={className}
      background={!inverted ? 'var(--turquoise-01)' : 'transparent'}
      type={type}
      onClick={onClick}
      inverted={inverted}
      disabled={disabled}
      width={width}
    >
      {children}
    </StyledBaseButton>
  );
};

const StyledBaseButton = styled(BaseButton)<{
  inverted?: boolean;
  width?: string;
}>`
  padding: 0 20px;
  border-color: var(--turquoise-01);
  background: ${(props) => (props.inverted ? 'transparent' : 'var(--turquoise-01)')};
  height: 40px;
  font-family: cera-medium;
  width: ${(p) => (p.width ? p.width : 'auto')};

  &:hover {
    background: var(--turquoise-04);
    opacity: 0.8;
    span {
      color: var(--blue);
    }
  }

  &:focus {
    opacity: ${(props) => (props.inverted ? '0.8' : '0.6')};
    background: var(--turquoise-01);

    span {
      color: var(--blue);
    }
  }
`;

export default React.memo(TurquoiseButton);
