import EmptyGraphImage from './illustrations/empty_graph.svg';

import styled from 'styled-components';
import React from 'react';

interface EmptyGraphProps {
  textOverride?: string;
}

const DEFAULT_TEXT =
  "Not enough historical data. We'll display the graph after collecting 48hrs of active strategy metrics.";

const EmptyGraph = ({ textOverride }: EmptyGraphProps) => {
  return (
    <EmptyGraphContainer>
      <ImageContainer>
        <img alt="empty-graph-img" src={EmptyGraphImage} height={'218px'} width={'250px'} />
      </ImageContainer>
      <EmptyText>{textOverride ? textOverride : DEFAULT_TEXT}</EmptyText>
    </EmptyGraphContainer>
  );
};

const EmptyGraphContainer = styled.div`
  display: flex:
  flex-flow: column nowrap;
  width: 100%;
`;

const ImageContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
`;

const EmptyText = styled.div`
  width: 100%;
  text-align: center;
  font-family: cera-medium;
  margin-top: 30px;
  font-size: 16px;
`;

export default React.memo(EmptyGraph);
