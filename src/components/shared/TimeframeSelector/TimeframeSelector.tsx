import { Timeframe } from 'models';

import styled from 'styled-components';
import React from 'react';

interface TimeframeSelectorProps {
  selected: string;
  disabledOptions: string[];
  height?: number;
  onChange: (value: string) => void;
}

const TimeframeSelector = ({ selected, onChange, disabledOptions, height }: TimeframeSelectorProps) => {
  return (
    <ButtonRow>
      {Object.values(Timeframe).map((t) => {
        return (
          <SelectorButton
            height={height}
            key={t.display}
            disabled={disabledOptions.includes(t.value)}
            selected={selected === t.display}
            onClick={(e) => onChange(e.currentTarget.value)}
            value={t.value}
          >
            <ButtonTextWrapper>
              <TimeframeText>{t.display}</TimeframeText>
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

const TimeframeText = styled.span`
  font-family: cera-regular;
`;

const SelectorButton = styled.button<{ selected?: boolean; disabled: boolean; height?: number }>`
  font-family: cera-medium;
  font-size: 15px;
  border-radius: 0;
  border: 1px solid var(--border-blue);
  outline: none;
  width: 60px;
  height: ${(p) => (p.height ? `${p.height}px` : '50px')};
  color: ${(p) => (p.disabled ? 'var(--border-blue)' : 'var(--white)')};
  background-color: ${(p) => (p.selected ? 'var(--purple-08)' : 'transparent')};
  padding: 4px 16px;
  ${(p) => (p.disabled ? 'pointer-events: none;' : '')}
  &:hover {
    background-color: ${(p) => (p.selected ? 'var(--purple-08)' : 'var(--purple-aux)')};
    cursor: ${(p) => (p.selected || p.disabled ? 'default' : 'pointer')};
  }

  &:first-child {
    border-radius: 4px 0px 0px 4px;
    border-right: none;
  }

  &:last-child {
    border-left: none;
    border-radius: 0px 4px 4px 0px;
  }
`;

export default React.memo(TimeframeSelector);
