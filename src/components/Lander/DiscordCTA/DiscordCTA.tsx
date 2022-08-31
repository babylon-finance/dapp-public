import React from 'react';
import styled from 'styled-components';
import { DiscordButton } from 'components/shared/';

const DiscordCTA = () => {
  return (
    <DiscordCTAWrapper>
      <HalfBlock>
        <LeftSideContent>We will prioritize sending invites to Babylonians who are active in Discord.</LeftSideContent>
      </HalfBlock>
      <HalfBlock>
        <StyledDiscordButton color={'var(--purple-06)'} background={'transparent'} />
      </HalfBlock>
    </DiscordCTAWrapper>
  );
};

const DiscordCTAWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  height: auto;
  width: 100%;
  justify-content: space-between;
  padding: 100px 0;
  align-items: center;

  @media only screen and (max-width: 992px) {
    padding: 0;
  }
`;

const StyledDiscordButton = styled(DiscordButton)`
  @media only screen and (max-width: 992px) {
    width: 100%;
  }
`;

const HalfBlock = styled.div`
  width: calc(50% - 10px);
  display: flex;
  flex-flow: column nowrap;
  margin: 20px 0;

  &:first-child {
    margin-right: 20px;
  }

  @media only screen and (max-width: 992px) {
    align-items: center;
    width: 100%;
    text-align: left;
    margin: 20px 0;
  }
`;

const LeftSideContent = styled.div`
  font-size: 26px;
  margin-top: 10px;
  line-height: 38px;
  max-width: 80%;

  @media only screen and (max-width: 992px) {
    align-items: center;
    max-width: 100%;
    width: 100%;
    font-size: 22px;
  }
`;

export default React.memo(DiscordCTA);
