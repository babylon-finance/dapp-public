import { BREAKPOINTS } from 'config';

import styled from 'styled-components';
import React from 'react';

interface GardenPillProps {
  color?: string;
  text: string;
}

const GardenPill = ({ color, text }: GardenPillProps) => {
  let matchColor;

  switch (text) {
    case 'Accumulation':
      matchColor = 'var(--blue-perf)';
      break;
    case 'Other':
      matchColor = 'var(--purple-aux)';
      break;
    case 'High Risk':
      matchColor = 'var(--high-risk)';
      break;
  }

  return <PillContainer color={color || matchColor}>{text}</PillContainer>;
};

const PillContainer = styled.div<{ color?: string }>`
  background-color: ${(p) => (p.color ? p.color : 'var(--blue-alt)')};
  height: 24px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 12px;
  min-width: 80px;
  font-size: 14px;
  font-family: cera-medium;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 0 8px 4px;
    height: 20px;
    border-radius: 10px;
    font-size: 12px;
  }
`;

export default React.memo(GardenPill);
