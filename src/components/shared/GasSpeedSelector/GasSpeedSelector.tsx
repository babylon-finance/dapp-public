import { GasSpeed } from 'models';
import { formatToGas } from 'helpers/Numbers';
import { useW3Context } from 'context/W3Provider';

import styled from 'styled-components';
import React from 'react';

interface GasSpeedSelectorProps {
  selected: string;
  onChange: (e: React.SyntheticEvent) => void;
}

const GasSpeedSelector = ({ selected, onChange }: GasSpeedSelectorProps) => {
  const { gasPrices } = useW3Context();

  return (
    <ButtonRow>
      <SelectorButton selected={selected === GasSpeed.standard} onClick={(e) => onChange(e)} value={GasSpeed.standard}>
        <b>{gasPrices ? formatToGas(gasPrices.standard) : '--'}</b>
        <br />
        Standard
      </SelectorButton>
      <SelectorButton selected={selected === GasSpeed.fast} onClick={(e) => onChange(e)} value={GasSpeed.fast}>
        <b>{gasPrices ? formatToGas(gasPrices.fast) : '--'}</b>
        <br />
        Fast
      </SelectorButton>
      <SelectorButton selected={selected === GasSpeed.instant} onClick={(e) => onChange(e)} value={GasSpeed.instant}>
        <b>{gasPrices ? formatToGas(gasPrices.rapid) : '--'}</b>
        <br />
        Instant
      </SelectorButton>
    </ButtonRow>
  );
};

const ButtonRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  jsutify-content: space-between;
`;

const SelectorButton = styled.button<{ selected?: boolean }>`
  font-family: cera-regular;
  font-feature-settings: 'pnum' on, 'lnum' on
  font-size: 15px;
  min-width: 100px;
  border-radius: 0;
  border: 1px solid #afacc9;
  outline: none;
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

  &:nth-child(3) {
    border-left: none;
    border-radius: 0px 4px 4px 0px;
  }
`;

export default React.memo(GasSpeedSelector);
