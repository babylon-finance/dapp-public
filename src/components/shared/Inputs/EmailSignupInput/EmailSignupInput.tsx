import React, { useState } from 'react';
import styled from 'styled-components';
import { Field, Form, Button } from 'rimble-ui';
import { DiscordButton } from 'components/shared/';
import { useW3Context } from 'context/W3Provider';

interface EmailSignupInputProps {
  withDiscord?: boolean;
  color?: string;
  name: string;
  toggleCta?(): void;
}

const EmailSignupInput = ({ withDiscord, color, name, toggleCta }: EmailSignupInputProps) => {
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
          if (toggleCta) {
            toggleCta();
          }
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
    <EmailSignupInputWrapper onSubmit={handleSubmit}>
      {!submitted && (
        <FieldWrapper>
          <Field label="" width={1}>
            <EmailInput
              color={color}
              type="email"
              name={name}
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
            {withDiscord && <DiscordWrapper />}
          </ButtonUVPWrapper>
        </FieldWrapper>
      )}
    </EmailSignupInputWrapper>
  );
};

const EmailSignupInputWrapper = styled(Form)`
  width: 100%;
  display: flex;
`;
const FieldWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
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

const DiscordWrapper = styled(DiscordButton)`
  min-width: 261px;
  @media only screen and (max-width: 768px) {
    margin: 10px 0;
    width: 100%;
  }
`;

const FormButton = styled(Button)`
  --main-color: var(--white);
  color: var(--purple);
  font-family: cera-regular;
  max-width: 200px;
  box-sizing: content-box;
  width: 100%;
  margin-right: 15px;
  border-radius: 2px;

  @media only screen and (max-width: 768px) {
    margin: 10px 0 0;
    max-width: 100%;
  }
`;

const EmailInput = styled(Form.Input)<{ color: string }>`
  width: 100%;
  background: transparent;
  box-shadow: none;
  border: none;
  border-radius: 0;
  padding-left: 0;
  font-size: 24px;
  color: ${(p) => (p.color ? p.color : 'var(--purple-aux)')};
  font-family: cera-bold;
  border-bottom: 2px ${(p) => (p.color ? p.color : 'var(--purple-aux)')} solid;
  max-width: 740px;

  &:focus {
    border-bottom: 1px solid ${(p) => (p.color ? p.color : 'var(--purple-aux)')};
    outline: none;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &::placeholder {
    color: ${(p) => (p.color ? p.color : 'var(--purple-aux)')};
  }

  &:hover {
    box-shadow: none;
  }
  / @media only screen and (max-width: 1240px) {
    font-size: 16px;
  }
`;

const FormSuccess = styled.div`
  font-size: 36px;
  color: var(--primary);
`;

export default React.memo(EmailSignupInput);
