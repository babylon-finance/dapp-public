import { Icon, TurquoiseButton, BaseModal } from 'components/shared/';
import { StrategySubmission } from '../StrategySubmission';
import WheatShareImage from 'components/garden/detail/components/illustrations/wheat_share.svg';
import GardenChatImage from 'components/garden/detail/components/illustrations/member_chat.svg';
import VoteExplainerImage from 'components/garden/detail/components/illustrations/vote_explainer.svg';
import StrategyAllocationImage from 'components/garden/detail/components/illustrations/strategy_allocation.svg';

import { FullGardenDetails, IconName } from 'models';
import { MAX_GARDEN_STRATEGIES } from 'config';

import { Link } from 'react-router-dom';
import styled from 'styled-components';
import React, { useState } from 'react';

interface SubmitStrategyTabProps {
  subgraphClients: any;
  gardenDetails: FullGardenDetails;
  userTokenBalanceAvailable: number;
  refetch: () => void;
}

interface SubmitHeaderProps {
  gardenDetails: FullGardenDetails;
  toggleSubmit(state: boolean): void;
}

const SubmitHeader = ({ gardenDetails, toggleSubmit }: SubmitHeaderProps) => {
  return (
    <HeaderContainer>
      <HeaderContentRow>
        <HeaderPrimary>Create a strategy and earn</HeaderPrimary>
      </HeaderContentRow>
      <HeaderContentRow>
        <HeaderSecondary>{gardenDetails.profits.strategist}% of profits </HeaderSecondary>
        <HeaderSymbol>+</HeaderSymbol>
        <HeaderSecondary>BABL Rewards</HeaderSecondary>
      </HeaderContentRow>
      <HeaderButtonRow>
        <TurquoiseButton disabled={true} onClick={toggleSubmit}>
          <ButtonLabel>
            <ButtonIconWrapper>
              <Icon name={IconName.starShooting} size={24} />
            </ButtonIconWrapper>
            <span>
              {gardenDetails.strategies.length >= MAX_GARDEN_STRATEGIES
                ? 'Max Strategies Reached'
                : 'Create a Strategy'}
            </span>
          </ButtonLabel>
        </TurquoiseButton>
        <LinkWrapper>
          <TextLink to={{ pathname: 'https://docs.babylon.finance/protocol/participants#strategist' }} target="_blank">
            Learn more
          </TextLink>
        </LinkWrapper>
      </HeaderButtonRow>
    </HeaderContainer>
  );
};

const SubmitStrategyTab = ({
  subgraphClients,
  gardenDetails,
  userTokenBalanceAvailable,
  refetch,
}: SubmitStrategyTabProps) => {
  const [displaySubmit, setDisplaySubmit] = useState<boolean>(false);

  return (
    <SubmitContainer>
      {displaySubmit && (
        <BaseModal width={'1200px'} isOpen={displaySubmit} toggleModal={() => setDisplaySubmit(false)}>
          <ModalTitle>Submit a strategy</ModalTitle>
          <StrategySubmission
            toggleSubmit={() => setDisplaySubmit(false)}
            gardenDetails={gardenDetails}
            subgraphClients={subgraphClients}
            userTokenBalanceAvailable={userTokenBalanceAvailable}
            refetch={refetch}
          />
        </BaseModal>
      )}
      {!displaySubmit && (
        <>
          <SubmitHeader gardenDetails={gardenDetails} toggleSubmit={() => setDisplaySubmit(true)} />
          <InfoBoxRow>
            <InfoBoxWhy>
              <InfoBoxLabel>Why share Alpha?</InfoBoxLabel>
              <InfoBoxContent>
                <StackedImage>
                  <img alt="win-win-img" src={WheatShareImage} />
                  <StackedText>
                    <StackedEm>Positive sum outcomes.</StackedEm> Earn profits and rewards by generating returns for you
                    and your Garden.
                  </StackedText>
                </StackedImage>
              </InfoBoxContent>
            </InfoBoxWhy>
            <InfoBoxCreate>
              <InfoBoxLabel>Design a strategy</InfoBoxLabel>
              <InfoBoxContent>
                <StepsRow>
                  <StepStacked>
                    <OperationIndex>1</OperationIndex>
                    <InfoText>Combine DeFi operations to define investment actions.</InfoText>
                  </StepStacked>
                  <StepStacked>
                    <OperationIndex>2</OperationIndex>
                    <InfoText>Define the max duration of the strategy (in days).</InfoText>
                  </StepStacked>
                  <StepStacked>
                    <OperationIndex>3</OperationIndex>
                    <InfoText>Define the capital constraints and expected return.</InfoText>
                  </StepStacked>
                </StepsRow>
                <NoCode>No code Required!</NoCode>
              </InfoBoxContent>
            </InfoBoxCreate>
          </InfoBoxRow>
          <InfoBoxRow>
            <InfoBoxVote>
              <InfoBoxLabel>Lifecycle of a proposal</InfoBoxLabel>
              <InfoBoxContent>
                <StepsRow>
                  <VoteStep>
                    <img alt="chat-img" src={GardenChatImage} />
                    <VoteText>
                      <b>Share and discuss</b> strategies with your fellow members before submitting.
                    </VoteText>
                  </VoteStep>
                  <VoteStep>
                    <img alt="vote-img" src={VoteExplainerImage} />
                    <VoteText>
                      Members provide <b>signal votes</b> to determine which strategies get executed.
                    </VoteText>
                  </VoteStep>
                  <VoteStep>
                    <img alt="allocation-img" src={StrategyAllocationImage} />
                    <VoteText>
                      Approved strategies are executed in a <b>capital efficient</b> manner.
                    </VoteText>
                  </VoteStep>
                </StepsRow>
              </InfoBoxContent>
            </InfoBoxVote>
          </InfoBoxRow>
        </>
      )}
    </SubmitContainer>
  );
};

const NoCode = styled.div`
  margin-top: 30px;
  width: 100%;
  text-align: center;
  font-family: cera-bold;
`;

const InfoText = styled.span`
  margin-top: 20px;
  font-family: cera-regular;
  font-size: 16px;
  width: 150px;
  text-align: center;
`;

const VoteText = styled(InfoText)`
  width: 300px;
`;

const StepsRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  padding-top: 40px;
`;

const StepStacked = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  flex-grow: 0.5;
  height: 100%;
`;

const VoteStep = styled(StepStacked)`
  border-left: 1px solid var(--border-blue);

  &:first-child {
    border: none;
  }
`;

const OperationIndex = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  border-radius: 25px;
  border: 2px solid var(--purple-02);
  color: var(--purple-02);
  font-feature-settings: 'pnum' on, 'lnum' on;
  font-size: 28px;
  font-family: cera-bold;
  height: 50px;
  width: 50px;
  text-align: center;
`;

const StackedImage = styled.div`
  align-items: center;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding-top: 20px;
`;

const StackedText = styled.span`
  width: 65%;
  text-align: center;
  padding-top: 20px;
  font-size: 18px;
  font-family: cera-medium;
`;

const StackedEm = styled(StackedText)`
  color: var(--yellow);
  font-family: cera-bold;
`;

const LinkWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  justify-content: center;
  padding-left: 20px;
`;

const TextLink = styled(Link)`
  color: var(--turquoise-01);
  font-family: cera-medium;
  font-size: 16px;
  text-align: center;
  text-decoration: underline;

  &:hover {
    cursor: pointer;
    opacity: 0.7;
  }
`;

const SubmitContainer = styled.div`
  height: 100%;
  min-height: 900px;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 60px 0 40px 0;
`;

const HeaderContentRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

const HeaderPrimary = styled.span`
  font-family: cera-bold;
  font-size: 28px;
  color: var(--white);
`;

const HeaderSymbol = styled(HeaderPrimary)`
  padding: 0 10px;
`;

const HeaderSecondary = styled.span`
  font-family: cera-bold;
  font-size: 28px;
  color: var(--purple-aux);
`;

const HeaderButtonRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin-top: 40px;
  height: 50px;
`;

const InfoBoxRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin-top: 30px;
`;

const InfoBoxLabel = styled.span`
  color: var(--white);
  font-family: cera-medium;
  font-size: 16px;
`;

const InfoBox = styled.div`
  height: 400px;
  background-color: var(--odd-table-row);
  padding: 30px;
`;

const InfoBoxContent = styled.div`
  padding-top: 20px;
`;

const InfoBoxWhy = styled(InfoBox)`
  width: 40%;
  margin-right: 30px;
`;

const InfoBoxCreate = styled(InfoBox)`
  width: 60%;
`;

const InfoBoxVote = styled(InfoBox)`
  width: 100%;
`;

const ButtonIconWrapper = styled.div`
  padding-right: 6px;
`;

const ModalTitle = styled.div`
  color: white;
  font-size: 22px;
  font-weight: 700;
  line-height: 32px;
`;

const ButtonLabel = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

export default React.memo(SubmitStrategyTab);
