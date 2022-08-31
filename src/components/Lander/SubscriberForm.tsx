import React, { useState } from 'react';
import styled from 'styled-components';
import { Box, Field, Form, Button } from 'rimble-ui';
import { ReactComponent as DiscordLogo } from 'icons/discord_logo.svg';
import { useW3Context } from 'context/W3Provider';

interface SubscribeFormProps {
  smallScreen: boolean;
}

const SubscribeForm = ({ smallScreen }: SubscribeFormProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [validated, setValidated] = useState(false);

  const { notify } = useW3Context();

  const encode = (data) => {
    return Object.keys(data)
      .map((key: string) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&');
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    if (validated) {
      const notificationObject = {
        eventCode: 'submitEmail',
        type: 'pending',
        message: 'Submitting email...',
      };

      const { update } = notify.notification(notificationObject);

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'lander-subscribe', ...{ email: email } }),
      })
        .then(() => {
          setSubmitted(true);
          setEmail('');
          update({
            eventCode: 'submitEmailSuccess',
            type: 'success',
            message: 'Your email address has been submitted!',
          });
        })
        .catch((error) => {
          update({
            eventCode: 'submitEmailFailed',
            type: 'error',
            message: 'Failed to submit your email address! Please try again later.',
          });
        });

      e.preventDefault();
    }
  };

  const handleFormChange = (e: React.FormEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value);
    setValidated(validateEmail(e.currentTarget.value));
  };

  const validateEmail = (email: string) => {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  return (
    <FormBox>
      {!smallScreen && (
        <HeroSubHeading>
          <SubscribeText>
            {submitted && <FormSuccess>Thanks for connecting! We will be in touch.</FormSuccess>}
            {!submitted && (
              <span>
                Sign up to be notified about our <Emphasize>Public Launch</Emphasize>.
              </span>
            )}
          </SubscribeText>
        </HeroSubHeading>
      )}
      <EmailForm onSubmit={handleSubmit}>
        <Field label="" width={1}>
          <EmailInput
            type="email"
            name="lander-subscribe"
            method="POST"
            data-netlify="true"
            value={email}
            placeholder="youremail@defi.together"
            onChange={handleFormChange}
            required
            width={1}
          ></EmailInput>
        </Field>
        <ButtonUVPWrapper>
          <FormButton disabled={!validated} onClick={handleSubmit}>
            Sign up
          </FormButton>
          <SecondaryFormButton
            onClick={() => {
              window.open('https://discord.gg/eGatHr2a5u');
            }}
          >
            <DiscordIcon>
              <DiscordLogo />
            </DiscordIcon>
            Join us in Discord
          </SecondaryFormButton>
        </ButtonUVPWrapper>
      </EmailForm>
    </FormBox>
  );
};

const EmailForm = styled(Form)`
  width: 100%;
`;

const ButtonUVPWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;

  a {
    width: 100%:
    &:hover {
      text-decoration: none;
    }
  }

  justify-content: flex-start;
`;

const FormButton = styled(Button)`
  --main-color: var(--white);
  color: var(--purple);
  font-family: cera-regular;
  max-width: 200px;
  box-sizing: content-box;
  width: 100%;
  margin-right: 15px;

  @media only screen and (max-width: 768px) {
    margin: 10px 0 0;
    max-width: 100%;
  }
`;

const SecondaryFormButton = styled(Button)`
  font-family: cera-regular;
  color: var(--white);
  text-decoration: none;
  max-width: 200px;
  width: 100%;
  box-sizing: content-box;
  display: flex;
  flex flow: row nowrap;
  align-items: center;

  span {
    display: flex;
    display: flex;
    align-items: center;
  }

  @media only screen and (max-width: 1440px) {
    width: 100%;
  }

  @media only screen and (max-width: 768px) {
    margin: 10px 0 0;
    max-width: 100%;
  }
`;

const DiscordIcon = styled.div`
  display: flex;
  width: 40px;
  height: 40px;
  fill: var(--white);
  opacity: 0.3;
  padding: 4px;
`;

const Emphasize = styled.span`
  font-family: cera-bold;
`;

const SubscribeText = styled.div`
  font-size: 30px;
  color: var(--white);
  line-height: 1.5;

  @media only screen and (max-width: 1240px) {
    font-size: 18px;
    margin: 20px 0;
  }
`;

const EmailInput = styled(Form.Input)`
  width: 100%;
  background: none;
  box-shadow: none;
  border: none;
  border-radius: 0;
  padding-left: 0;
  font-size: 24px;
  color: var(--purple-aux);
  font-family: cera-bold;
  border-bottom: 2px var(--white) solid;
  max-width: 540px;

  &:focus {
    border-bottom: 1px solid #6c679d;
    outline: none;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &::placeholder {
    color: var(--purple-aux);
  }

  &:hover {
    box-shadow: none;
  }
  / @media only screen and (max-width: 1240px) {
    font-size: 16px;
  }
`;

const FormSuccess = styled.div`
  padding: 30px 25%;
  font-size: 36px;
  color: var(--primary);

  @media only screen and (max-width: 1240px) {
    padding: 30px;
    font-size: 18px;
  }
`;

const FormBox = styled(Box)`
  font-family: cera-regular;
  width: 100%;
  margin-top: 50px;
`;

const HeroSubHeading = styled.h2`
  font-family: cera-regular;
  color: var(--primary);
  margin-bottom: 8px;
`;

export default React.memo(SubscribeForm);
