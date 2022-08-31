import { BREAKPOINTS } from 'config';

import { isMobile } from 'react-device-detect';
import styled from 'styled-components';
import React from 'react';

interface ProfitSplitElement {
  color: string;
  percentage: number;
  name: string;
}

interface GardenProfitSplitProps {
  splits: ProfitSplitElement[];
}

const GardenProfitSplit = ({ splits }: GardenProfitSplitProps) => {
  const SPLIT_WIDTH = isMobile ? 275 : 297;
  return (
    <ProfitSplitBarWrapper width={SPLIT_WIDTH}>
      <ProfitSplitHorizontal>
        {splits.map((e: ProfitSplitElement) => (
          <ProfitSplitBar key={e.name} size={e.percentage} color={e.color} width={SPLIT_WIDTH} />
        ))}
      </ProfitSplitHorizontal>
      <LabelContainer>
        {splits.map((e: ProfitSplitElement, i: number) => (
          <ProfitSplitLabel color={e.color} key={e.name}>
            {e.percentage}% {e.name}
          </ProfitSplitLabel>
        ))}
      </LabelContainer>
    </ProfitSplitBarWrapper>
  );
};

const ProfitSplitBarWrapper = styled.div<{ width: number }>`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: flex-start;
  width: ${(p) => p.width}px;
`;

const ProfitSplitHorizontal = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
`;

const LabelContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
`;

const ProfitSplitBar = styled.div<{ color: string; size: number; width: number }>`
  height: 8px;
  width: ${(p) => Math.ceil((p.size * p.width) / 100)}px;
  background: ${(p) => p.color};
`;

const ProfitSplitLabel = styled.div<{ color: string }>`
  font-size: 14px;
  line-height: 17px;
  width: auto;
  text-align: left;
  font-family: cera-medium;
  color: ${(p) => p.color};
  font-feature-settings: 'pnum' on, 'lnum' on;

  &:first-child {
    margin-top: 6px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
  }
`;

export default React.memo(GardenProfitSplit);
