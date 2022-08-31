import { CheckboxInput, TurquoiseButton } from 'components/shared';
import WheatShareImage from 'components/garden/detail/components/illustrations/wheat_share.svg';
import GardenChatImage from 'components/garden/detail/components/illustrations/member_chat.svg';
import VoteExplainerImage from 'components/garden/detail/components/illustrations/vote_explainer.svg';
import StrategyAllocationImage from 'components/garden/detail/components/illustrations/strategy_allocation.svg';

import { useW3Context } from 'context/W3Provider';

import styled from 'styled-components';
import React, { useState } from 'react';

interface CreationLearnerProps {
  hide: () => void;
}

const CreationLearner = ({ hide }: CreationLearnerProps) => {
  const { userPrefs, updateUserPrefs } = useW3Context();

  const [disableChecked, setDisableChecked] = useState<boolean>(false);

  const toggleDisable = async () => {
    if (userPrefs) {
      setDisableChecked(!disableChecked);
      updateUserPrefs({ ...userPrefs, hideCreationLearner: !disableChecked });
    }
  };

  return (
    <SubmitContainer>
      <InfoBoxRow>
        <InfoBoxWhy>
          <InfoBoxLabel>Why Create a Garden?</InfoBoxLabel>
          <InfoBoxContent>
            <StackedImage>
              <img alt="win-win-img" src={WheatShareImage} />
              <StackedText>
                <StackedEm>Skin in the game.</StackedEm> Incentives are aligned to produce positive sum outcomes.
              </StackedText>
            </StackedImage>
          </InfoBoxContent>
        </InfoBoxWhy>
        <InfoBoxCreate>
          <InfoBoxLabel>Active roles</InfoBoxLabel>
          <InfoBoxContent>
            <StepsRow>
              <StepStacked>
                <OperationIndex>1</OperationIndex>
                <InfoText>
                  <b>Creators</b>
                  <br />
                  <br />
                  Set the intial thesis and Garden properties while working to grow the community.
                </InfoText>
              </StepStacked>
              <StepStacked>
                <OperationIndex>2</OperationIndex>
                <InfoText>
                  <b>Strategists</b>
                  <br />
                  <br />
                  Submit investment proposals and discover new opportunties for the Garden.
                </InfoText>
              </StepStacked>
              <StepStacked>
                <OperationIndex>3</OperationIndex>
                <InfoText>
                  <b>Voters</b>
                  <br />
                  <br />
                  Determine which proposals are executed on-chain through a light governance model.
                </InfoText>
              </StepStacked>
            </StepsRow>
          </InfoBoxContent>
        </InfoBoxCreate>
      </InfoBoxRow>
      <InfoBoxRow>
        <InfoBoxMulti>
          <InfoBoxLabel>A lightweight investment DAO</InfoBoxLabel>
          <InfoBoxContent>
            <StepsRow>
              <MultiStep>
                <img alt="chat-img" src={GardenChatImage} />
                <MultiText>
                  <b>Share and discuss</b> strategies with your fellow members before investing.
                </MultiText>
              </MultiStep>
              <MultiStep>
                <img alt="vote-img" src={VoteExplainerImage} />
                <MultiText>
                  Strategists submit investment proposals and Voters provide <b>signal</b>.
                </MultiText>
              </MultiStep>
              <MultiStep>
                <img alt="allocation-img" src={StrategyAllocationImage} />
                <MultiText>
                  Executed strategies <b>earn rewards</b> for LP's, voters, and the strategist.
                </MultiText>
              </MultiStep>
            </StepsRow>
          </InfoBoxContent>
        </InfoBoxMulti>
      </InfoBoxRow>
      <ActionRow>
        <ActionContainer>
          <CheckboxInput
            checked={disableChecked}
            onChange={toggleDisable}
            label="Don't show this again"
            name="disableCreationLearner"
          />
          <StyledButton onClick={hide}>Begin setup</StyledButton>
        </ActionContainer>
      </ActionRow>
    </SubmitContainer>
  );
};

const SubmitContainer = styled.div`
  height: 100%;
`;

const ActionRow = styled.div`
  align-items: center;
  display: flex;
  flex-flow: row nowrap;
  margin-top: 15px;
  height: 40px;
  width: 100%;
`;

const ActionContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin-left: auto;
`;

const StyledButton = styled(TurquoiseButton)`
  margin-left: 30px;
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
  height: 340px;
  background-color: var(--odd-table-row);
  padding: 20px;
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

const InfoBoxMulti = styled(InfoBox)`
  width: 100%;
`;

const InfoText = styled.span`
  margin-top: 20px;
  font-family: cera-regular;
  font-size: 16px;
  width: 150px;
  text-align: center;
`;

const MultiText = styled(InfoText)`
  width: 300px;
`;

const StepsRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  padding-top: 15px;
`;

const StackedImage = styled.div`
  align-items: center;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding-top: 15px;
`;

const StepStacked = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  flex-grow: 0.5;
  height: 100%;
`;

const MultiStep = styled(StepStacked)`
  border-left: 1px solid var(--border-blue);

  &:first-child {
    border: none;
  }
`;

const StackedText = styled.span`
  width: 80%;
  text-align: center;
  padding-top: 20px;
  font-size: 16px;
  font-family: cera-medium;
`;

const StackedEm = styled(StackedText)`
  color: var(--yellow);
  font-family: cera-bold;
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

export default React.memo(CreationLearner);
