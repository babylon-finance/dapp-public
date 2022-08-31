import React from 'react';
import styled from 'styled-components';
import { EmailSignupInput } from 'components/shared';

const SecondaryCTA = () => {
  return (
    <SecondaryCTAWrapper>
      <HalfBlock>
        <LeftSideTitle>Sign Up</LeftSideTitle>
        <LeftSideContent>
          to be notified about our <b>Public Launch</b>.
        </LeftSideContent>
      </HalfBlock>
      <HalfBlock>
        <EmailSignupInput color="white" name={'lander-subscribe-2'} />
      </HalfBlock>
    </SecondaryCTAWrapper>
  );
};

const SecondaryCTAWrapper = styled.div`
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

const HalfBlock = styled.div`
  width: calc(50% - 10px);
  display: flex;
  flex-flow: column nowrap;
  margin: 20px 0;

  &:first-child {
    margin-right: 20px;
  }

  @media only screen and (max-width: 992px) {
    width: 100%;
    align-items: center;
    text-align: center;
    margin-right: 0;
  }
`;

const LeftSideTitle = styled.div`
  font-size: 43px;
  font-weight: bold;

  @media only screen and (max-width: 992px) {
    text-align: left;
    width: 100%;
    font-size: 36px;
  }
`;

const LeftSideContent = styled.div`
  margin-top: 10px;
  font-size: 36px;
  font-weight: normal;

  @media only screen and (max-width: 992px) {
    width: 100%;
    text-align: left;
    font-size: 28px;
    line-height: 1.4;
  }
`;

export default React.memo(SecondaryCTA);
