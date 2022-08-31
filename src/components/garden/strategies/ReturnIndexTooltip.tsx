import { Link } from 'react-router-dom';
import styled from 'styled-components';
import React from 'react';
import { RoutesExternal } from 'constants/Routes';

interface ReturnIndexTooltipProps {
  value: number;
  color: string;
}

const EXPLAINER =
  'The amount of rewards a Strategy earns is subject to the annualized return targets shown above. The more profitable a Strategy is the more of the potential rewards it will earn.';

const ReturnIndexTooltip = ({ value, color }: ReturnIndexTooltipProps) => {
  return (
    <ContentContainer>
      <TipHeader>Annualized Return Targets</TipHeader>
      <BreakdownSection>
        <CurrentRow>
          <SourceTitle color={'var(--white)'}>Current Annualized</SourceTitle>
          <SourceValue bold color={color}>
            {Math.max(value, -100)}%
          </SourceValue>
        </CurrentRow>
        <SourceRow>
          <SourceTitle color={'var(--white)'}>Target</SourceTitle>
          <SourceValue bold>Rewards</SourceValue>
        </SourceRow>
        <SourceRow>
          <SourceTitle color={'var(--positive)'}>{'>= 4%'}</SourceTitle>
          <SourceValue>115%</SourceValue>
        </SourceRow>
        <SourceRow>
          <SourceTitle color={'var(--yellow)'}>{'-19.9% to 3.9%'}</SourceTitle>
          <SourceValue>60%</SourceValue>
        </SourceRow>
        <SourceRow>
          <SourceTitle color={'var(--negative)'}>{'<= -20%'}</SourceTitle>
          <SourceValue>15%</SourceValue>
        </SourceRow>
      </BreakdownSection>
      <ExplainerSection>
        <ExplainerTitle>Why does this matter?</ExplainerTitle>
        <ExplainerContent>{EXPLAINER}</ExplainerContent>
        <LearnMore>
          <StyledLink
            to={{
              pathname: RoutesExternal.profitRewardScale,
            }}
            target="_blank"
          >
            Learn more
          </StyledLink>
        </LearnMore>
      </ExplainerSection>
    </ContentContainer>
  );
};

const CurrentRow = styled.div`
  border-bottom: 1px dotted var(--white);
  display: flex;
  flex-flow: row nowrap;
  margin-bottom: 16px;
  padding-bottom: 4px;
  width: 100%;
  font-family: cera-bold;
`;

const ContentContainer = styled.div`
  width: 100%;
  height: 400px;
  padding: 10px;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const LearnMore = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  padding: 4px 0;
`;

const StyledLink = styled(Link)`
  font-family: cera-medium;
  color: var(--turquoise-01);
  text-decoration: underline;

  &:hover {
    color: var(--turquoise-01);
    text-decoration: underline;
    opacity: 0.8;
  }
`;

const BreakdownSection = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  margin-bottom: 20px;
`;

const SourceTitle = styled.span<{ color: string }>`
  color: ${(p) => p.color};
  font-family: cera-medium;
`;

const SourceValue = styled.span<{ bold?: boolean; color?: string }>`
  ${(p) => (p.bold ? 'font-family: cera-medium;' : '')}
  ${(p) => (p.color ? `color: ${p.color};` : '')}
  margin-left: auto;
`;

const SourceRow = styled.div`
  width: 100%;
  border-bottom: 1px dotted var(--white);
  padding: 4px 0;
  display: flex;
  flex-flow: row nowrap;

  &:first-child {
    border: none;
  }
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

export default React.memo(ReturnIndexTooltip);
