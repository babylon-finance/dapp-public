import { Box } from 'rimble-ui';
import { EmailSignupInput } from 'components/shared/';
import React, { useState } from 'react';
import styled from 'styled-components';

const SubscriberForm = () => {
  const [showSubscribeCta, setShowSubscribeCta] = useState<boolean>(true);

  return (
    <SubscribeWrapper>
      {showSubscribeCta && (
        <HeroSubHeading>
          Sign up to be notified about our <Emphasize>Public Launch</Emphasize>.
        </HeroSubHeading>
      )}
      <EmailSignupInput toggleCta={() => setShowSubscribeCta(false)} withDiscord name={'lander-subscribe'} />
    </SubscribeWrapper>
  );
};

const SubscribeWrapper = styled(Box)`
  font-family: cera-regular;
  width: 100%;
  margin-top: 50px;

  @media only screen and (max-width: 992px) {
    margin-top: 10px;
  }
`;

const HeroSubHeading = styled.h2`
  font-family: cera-regular;
  color: var(--primary);
  margin-bottom: 8px;

  font-size: 24px;
  color: var(--white);
  line-height: 1.5;

  @media only screen and (max-width: 1240px) {
    font-size: 18px;
    margin: 20px 0;
  }

  @media only screen and (max-width: 992px) {
    margin: 10px 0;
  }
`;

const Emphasize = styled.span`
  font-family: cera-bold;
`;

export default React.memo(SubscriberForm);
