import NumberInput from '../NumberInput/NumberInput';
import { Blue4Button } from 'components/shared';

import { BREAKPOINTS } from 'config';

import React from 'react';
import styled from 'styled-components';
import { isMobile } from 'react-device-detect';

interface TokenInputProps {
  precision?: number;
  tokenIcon: React.ReactChild;
  inputLabel?: string | React.ReactNode;
  tokenName: string;
  tokenSymbol: string;
  amount: number;
  pb?: string; // padding-bottom
  displayBalance?: string;
  balancePrefix?: string;
  primary?: boolean;
  step?: string;
  max?: string;
  name: string;
  min?: string;
  error?: string;
  className?: string;
  innerRef?: any;
  valid?: boolean;
  showMaxButton?: boolean;
  warn?: boolean;
  minimal?: boolean;
  disabled?: boolean;
  setMax?: () => void;
  onChange?(e: React.ChangeEvent<HTMLInputElement>): void;
}

const TokenInput = ({
  precision = 4,
  balancePrefix = 'Wallet',
  tokenIcon,
  className,
  inputLabel,
  tokenName,
  tokenSymbol,
  displayBalance,
  amount,
  error,
  minimal,
  step = '0.1',
  min = '0',
  max = (999999999).toString(),
  innerRef,
  name,
  showMaxButton,
  disabled = false,
  primary = true,
  valid = true,
  warn = false,
  pb,
  setMax,
  onChange,
}: TokenInputProps) => {
  if (minimal) {
    return (
      <StyledNumberInput
        className={className}
        name={name}
        disabled={disabled}
        valid={valid}
        warn={warn}
        step={step}
        min={min}
        max={max}
        innerRef={innerRef}
        onChange={onChange}
        value={amount}
      />
    );
  }

  return (
    <TokenInputWrapper className={className} pb={pb}>
      <TokenInputLabel>{inputLabel}</TokenInputLabel>
      <TokenBox primary={primary}>
        <TokenDetails>
          <TokenName>{tokenName}</TokenName>
          <TokenSymbol>
            {tokenIcon}
            <Symbol>{tokenSymbol}</Symbol>
          </TokenSymbol>
        </TokenDetails>
        <TokenInputContainer>
          <AboveInputWrapper>
            {displayBalance && (
              <TokenBalance>{`${isMobile ? '' : balancePrefix} Balance: ${displayBalance}`}</TokenBalance>
            )}
            {showMaxButton && setMax && (
              <MaxButton
                onClick={() => {
                  setMax();
                }}
                disabled={displayBalance === '0'}
              >
                MAX
              </MaxButton>
            )}
          </AboveInputWrapper>
          <StyledNumberInput
            name={name}
            disabled={disabled}
            valid={valid}
            warn={warn}
            step={step}
            min={min}
            max={max}
            innerRef={innerRef}
            onChange={onChange}
            value={amount}
          />
        </TokenInputContainer>
      </TokenBox>
      <ErrorWrapper>{error}</ErrorWrapper>
    </TokenInputWrapper>
  );
};

const TokenInputWrapper = styled.div<{ pb?: string }>`
  padding-bottom: ${(p) => (p.pb ? p.pb : '30px')};
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
`;

const TokenInputLabel = styled.span`
  font-family: cera-regular;
  font-size: 16px;
  color: var(--white);
  padding-bottom: 10px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

const TokenItem = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;

const AboveInputWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  font-size: 13px;
  color: var(--red);
  width: 100%;
  margin-top: 4px;
`;

const TokenInputContainer = styled(TokenItem)`
  margin-left: auto;
  align-items: right;
`;

const TokenBox = styled.div<{ primary?: boolean }>`
  background: ${(props) => (props.primary ? 'var(--purple)' : 'rgba(68, 32, 216, 0.4)')};
  border: ${(props) => (props.primary ? '1px solid var(--border-blue)' : '1px solid var(--blue)')};
  border-radius: 2px;
  display: flex;
  flex-flow: row nowrap;
  height: 80px;
  width: 100%;
  padding: 10px;
`;

const StyledNumberInput = styled(NumberInput)<{ warn?: boolean }>`
  input {
    font-feature-settings: 'pnum' on, 'lnum' on;
    text-align: right;
    padding-right: 0;
    font-size: 18px;
    border-bottom: 0;
    color: ${(props) => (props.valid ? (!props.warn ? 'var(--white)' : 'var(--turquoise-01)') : 'var(--negative)')};

    &:focus {
      border-bottom: 0;
    }
  }
  background: none;
  box-shadow: none;
  border: none;
  border-radius: 0;
  padding: 0;
  font-family: cera-bold;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:hover {
    box-shadow: none;
  }
`;

const TokenDetails = styled(TokenItem)``;

const MaxButton = styled(Blue4Button)`
  padding: 2px 8px;
  height: auto;
  width: 50px;
  margin-left: 10px;
  min-width: 50px;
  font-size: 13px;
`;

const TokenBalance = styled.div`
  margin-left: auto;
  font-family: cera-regular;
  font-size: 13px;
  color: var(--blue-03);
`;

const TokenSymbol = styled.div`
  padding-top: 8px;
  display: flex;
  flex-flow: row nowrap;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

const Symbol = styled.span`
  color: var(--white);
  font-size: 16px;
  font-family: cera-regular;
  padding-left: 12px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding-left: 8px;
    font-size: 14px;
  }
`;

const TokenName = styled.span`
  color: var(--blue-04);
  font-family: cera-regular;
  font-size: 16px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

export default React.memo(TokenInput);
