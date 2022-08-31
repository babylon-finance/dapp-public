import { BREAKPOINTS } from 'config';

import { Button } from 'rimble-ui';
import React from 'react';
import styled from 'styled-components';

interface BaseButtonProps {
  onClick: any;
  disabled?: boolean;
  type?: string;
  className?: string;
  children: React.ReactNode;
  color: string;
  background: string;
  ml?: number;
  mr?: number;
  height?: number;
  minWidth?: number;
}

const BaseButton = ({
  onClick,
  color,
  className,
  background,
  disabled,
  children,
  type,
  ml = 0,
  mr = 0,
  height = 50,
  minWidth = 100,
}: BaseButtonProps) => {
  return (
    <StyledPrimaryButton
      className={className}
      mr={mr}
      ml={ml}
      height={height}
      minWidth={minWidth}
      color={color}
      background={background}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </StyledPrimaryButton>
  );
};

const StyledPrimaryButton = styled(Button)<{
  color: string;
  background: string;
  mr: number;
  ml: number;
  height: number;
  minWidth: number;
}>`
  margin-right: ${(props) => props.mr};
  margin-left: ${(props) => props.ml};
  height: ${(props) => props.height}px;
  min-width: ${(props) => props.minWidth}px;
  border-radius: 2px;
  border: 1px solid transparent;
  font-family: cera-regular;
  --main-color: ${(props) => props.background};
  color: ${(props) => `${props.color}`};
  border-color: ${(props) => props.background};
  font-size: 16px;
  padding: 10px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

export default React.memo(BaseButton);
