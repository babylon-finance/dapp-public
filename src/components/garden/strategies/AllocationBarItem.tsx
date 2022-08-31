import { TokenDisplay } from 'components/shared';
import { Token } from 'models';

import Tooltip from 'react-tooltip-lite';
import styled from 'styled-components';
import React from 'react';
import { isMobile } from 'react-device-detect';

const ALLOCATION_COLORS = ['var(--blue-08)', 'var(--turquoise-02)', 'var(--pink-01)', 'var(--purple-09)'];

const AllocationBar = ({ percent, targetPercent, fillIndex }) => {
  return (
    <AllocationBarSVG>
      <AllocationBarRect fill={ALLOCATION_COLORS[fillIndex] || 'var(--purple-aux)'} width={`${percent}%`} />
      {targetPercent > 0 && <AllocationTargetWedge offset={`${targetPercent}%`} />}
    </AllocationBarSVG>
  );
};

interface AllocationBarItemProps {
  name: string;
  percent: number;
  targetPercent: number;
  fillIndex: number;
  token?: Token;
}

const AllocationBarItem = ({ name, percent, targetPercent, token, fillIndex }: AllocationBarItemProps) => {
  const targetText = `${targetPercent > 0 ? `Target: ${parseFloat(targetPercent.toFixed(2))}%` : ''}`;
  return (
    <NameAllocation>
      <Name>
        <span>{name}</span>
        {token && <TokenDisplay token={token} size={18} symbol={false} />}
      </Name>
      {!isMobile && (
        <Tooltip content={`${parseFloat(percent.toFixed(2))}% of principal. ${targetText}`}>
          <AllocationBar fillIndex={fillIndex} percent={percent} targetPercent={targetPercent} />
        </Tooltip>
      )}
    </NameAllocation>
  );
};

const NameAllocation = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
`;

const Name = styled.div`
  display: flex;
  flex-flow: row nowrap;

  span {
    margin-right: 10px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;

    @supports (-webkit-line-clamp: 2) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: initial;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
`;

const AllocationBarSVG = styled.svg`
  width: 100%;
  max-width: 250px;
  background: var(--blue-06);
  height: 4px;
  margin-top: 10px;
`;

const AllocationBarRect = styled.rect<{ fill: string }>`
  height: 4px;
  fill: ${(p) => p.fill};
`;

const AllocationTargetWedge = styled.rect<{ offset: string }>`
  height: 8px;
  width: 3px;
  fill: var(--yellow);
  x: ${(p) => p.offset};
`;

export default React.memo(AllocationBarItem);
