import { AprResult } from 'models';

import styled from 'styled-components';
import React from 'react';

interface ReturnTooltipProps {
  result: AprResult;
}

const EXPLAINER =
  'Variable Annual Percent Return is based on the change in share price over the previous quarter (90 days), extrapolated out to an annual rate.';

const ReturnTooltip = ({ result }: ReturnTooltipProps) => {
  return (
    <ContentContainer>
      <TipHeader>vAPR Breakdown</TipHeader>
      <BreakdownSection>
        <SourceRow>
          <SourceTitle>Investments</SourceTitle>
          <SourceValue>{Math.max(parseFloat(result.raw.toFixed(2)), -100)}%</SourceValue>
        </SourceRow>
        <SourceRow>
          <SourceTitle>Rewards</SourceTitle>
          <SourceValue>{parseFloat(result.babl.toFixed(2))}%</SourceValue>
        </SourceRow>
        <SourceRow>
          <SourceTitle>Total</SourceTitle>
          <SourceValue>{result.aggregate.toFixed(2)}%</SourceValue>
        </SourceRow>
      </BreakdownSection>
      <ExplainerSection>
        <ExplainerTitle>What is vAPR?</ExplainerTitle>
        <ExplainerContent>{EXPLAINER}</ExplainerContent>
      </ExplainerSection>
    </ContentContainer>
  );
};

const ContentContainer = styled.div`
  width: 100%;
  height: 300px;
  padding: 10px;
`;

const BreakdownSection = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  margin-bottom: 20px;
`;

const SourceTitle = styled.span`
  font-family: cera-medium;
`;

const SourceValue = styled.span`
  margin-left: auto;
`;

const SourceRow = styled.div`
  width: 100%;
  border-bottom: 1px dotted var(--white);
  padding: 4px 0;
  display: flex;
  flex-flow: row nowrap;
`;

const TipHeader = styled.div`
  font-size: 18px;
  font-family: cera-medium;
  width: 100%;
  margin-bottom: 20px;
`;

const ExplainerTitle = styled.span`
  font-family: cera-medium;
  margin-bottom: 10px;
`;

const ExplainerContent = styled.span``;

const ExplainerSection = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin-top: 10px;
  width: 100%;
`;

export default React.memo(ReturnTooltip);
