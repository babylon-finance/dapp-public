import React from 'react';
import styled from 'styled-components';

interface ParameterDisplayProps {
  name: string;
  preSymbol?: string;
  value: string;
  postSymbol?: string;
  width?: number;
}

const ParameterDisplay = ({ name, preSymbol, value, postSymbol, width = 200 }: ParameterDisplayProps) => {
  return (
    <ParameterDisplayWrapper width={width}>
      <ParameterName>{name}</ParameterName>
      <ParameterValueGroup>
        {preSymbol && <SpanBefore>{preSymbol}</SpanBefore>}
        <SpanValue>{value}</SpanValue>
        {postSymbol && <SpanAfter>{postSymbol}</SpanAfter>}
      </ParameterValueGroup>
    </ParameterDisplayWrapper>
  );
};

const ParameterDisplayWrapper = styled.div<{ width: number }>`
  display: flex;
  flex-flow: column nowrap;
  min-width: ${(p) => p.width}px;
`;

const ParameterValueGroup = styled.div`
  display: flex;
  flex-flow: flex nowrap;
  justify-content: flex-start;
  align-items: flex-end;
`;
const ParameterName = styled.div`
  color: white;
  font-size: 14px;
`;

const SpanBefore = styled.span`
  height: 100%;
  display: inline-flex;
  font-size: 24px;
  color: var(--white);
  font-family: cera-bold;
  padding-right: 10px;
`;

const SpanValue = styled.span`
  height: 100%;
  display: inline-flex;
  font-size: 24px;
  color: var(--purple-aux);
  font-family: cera-bold;
  padding-right: 10px;
`;

const SpanAfter = styled.span`
  height: 100%;
  display: inline-flex;
  font-size: 15px;
  color: var(--blue-03);
  align-items: center;
`;

export default React.memo(ParameterDisplay);
