import OperationDisplay from '../StrategyOperations/OperationDisplay';
import { StrategyOperation, FullGardenDetails } from 'models';
import { ParameterDisplay } from 'components/shared';
import { StrategyParamsData } from '../StrategyParams/strategyParamsTypes';
import { TokenListService } from 'services';

import React from 'react';
import styled from 'styled-components';
import { commify } from '@ethersproject/units';

interface StrategyReviewProps {
  name: string;
  gardenDetails: FullGardenDetails;
  operations: StrategyOperation[];
  strategyParams: StrategyParamsData;
}

const StrategyReview = ({ name, operations, strategyParams, gardenDetails }: StrategyReviewProps) => {
  const tokenListService = TokenListService.getInstance();

  return (
    <StrategyReviewWrapper>
      <Title>Almost done! Please verify the following details are correct before submitting.</Title>
      <ContentWrapper>
        <NameContainer>
          <p>Name</p>
          <h3>{name}</h3>
        </NameContainer>
        <OperationsContainer>
          <OperationsLabel>Operations</OperationsLabel>
          {operations.map((operation: StrategyOperation, index: number) => (
            <OperationDisplay operation={operation} key={index} index={index} />
          ))}
        </OperationsContainer>
        <StrategyDetailsWrapper>
          <p>Capital & Duration</p>
          <StrategyCapitalWrapper>
            <ParameterDisplay name="Expected Return" postSymbol="%" value={strategyParams.expectedReturn.toString()} />
            <ParameterDisplay name="Duration" postSymbol="DAYS" value={strategyParams.duration.toString()} />
            <ParameterDisplay
              name="Your Stake"
              preSymbol={tokenListService.getInputSymbol(gardenDetails.reserveAsset)}
              value={strategyParams.stake.toString()}
            />
          </StrategyCapitalWrapper>
          <StrategyCapitalWrapper>
            <ParameterDisplay
              name="Maximum Strategy Capital"
              preSymbol={tokenListService.getInputSymbol(gardenDetails.reserveAsset)}
              value={commify(strategyParams.maxCapitalRequested.toString())}
            />
            <ParameterDisplay
              name="Maximum Allocation in %"
              postSymbol="%"
              value={strategyParams.maxPercentAllocation.toString()}
            />
            <ParameterDisplay name="" value={''} />
          </StrategyCapitalWrapper>
        </StrategyDetailsWrapper>
        <StrategyDetailsWrapper>
          <p>Capital Efficiency</p>
          <StrategyCapitalWrapper>
            <ParameterDisplay name="Max Gas Fee" postSymbol="%" value={strategyParams.maxGasFeePercentage.toString()} />
            <ParameterDisplay
              name="Max Slippage"
              postSymbol="%"
              value={strategyParams.maxSlippagePercentage.toString()}
            />
          </StrategyCapitalWrapper>
        </StrategyDetailsWrapper>
      </ContentWrapper>
    </StrategyReviewWrapper>
  );
};

const NameContainer = styled.div`
  padding-bottom: 30px;
`;

const OperationsContainer = styled.div`
  padding-bottom: 30px;
`;

const StrategyReviewWrapper = styled.div`
  min-height: 400px;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;

  p {
    font-size: 14px;
    font-weight: 700;
  }
`;

const OperationsLabel = styled.p`
  margin-bottom: 0;
`;

const ContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  color: white;
  padding: 20px 0;

  h3 {
    font-weight: bold;
    margin-bottom: 20px;
  }
`;

const StrategyDetailsWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  margin-bottom: 20px;
`;

const StrategyCapitalWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: flex nowrap;
  justify-content: space-between;
  align-items: center;
  background: var(--purple-02-alpha);
  padding: 12px 20px;
  margin-top: 8px;
`;

const Title = styled.p`
  margin-top: 5px;
  font-size: 14px;
  line-height: 24px;
  color: white;
`;

export default React.memo(StrategyReview);
