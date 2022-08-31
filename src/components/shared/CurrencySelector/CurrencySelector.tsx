import { Currency } from 'models';
import { BREAKPOINTS } from 'config';

import styled from 'styled-components';
import React from 'react';

interface CurrencySelectorProps {
  selected: string;
  onChange: (e: React.SyntheticEvent) => void;
}

const CurrencySelector = ({ selected, onChange }: CurrencySelectorProps) => {
  return (
    <ButtonRow>
      {Object.values(Currency).map((currency) => {
        return (
          <SelectorButton
            key={currency.ticker}
            selected={selected === currency.ticker}
            onClick={(e) => onChange(e)}
            value={currency.ticker}
          >
            <ButtonTextWrapper>
              <SymbolText>{currency.symbol}</SymbolText>
              <CurrencyText>{currency.ticker}</CurrencyText>
            </ButtonTextWrapper>
          </SelectorButton>
        );
      })}
    </ButtonRow>
  );
};

const ButtonRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

const ButtonTextWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;

const SymbolText = styled.span`
  font-family: cera-medium;
`;

const CurrencyText = styled.span`
  font-family: cera-regular;
`;

const SelectorButton = styled.button<{ selected?: boolean }>`
  font-family: cera-regular;
  font-size: 15px;
  border-radius: 0;
  border: 1px solid #afacc9;
  outline: none;
  width: 80px;
  color: var(--white);
  background-color: ${(p) => (p.selected ? 'var(--purple-08)' : 'transparent')};
  padding: 4px 16px;

  &:hover {
    background-color: ${(p) => (p.selected ? 'var(--purple-08)' : 'var(--purple-aux)')};
    cursor: ${(p) => (p.selected ? 'default' : 'pointer')};
  }

  &:first-child {
    border-radius: 4px 0px 0px 4px;
    border-right: none;
  }

  &:last-child {
    border-left: none;
    border-radius: 0px 4px 4px 0px;
  }
  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 13px;
  }
`;

export default React.memo(CurrencySelector);
