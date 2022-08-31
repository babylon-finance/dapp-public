import React from 'react';
import { BaseButton } from '../BaseButton/';
import { ReactComponent as DiscordLogo } from 'icons/discord_logo.svg';
import styled from 'styled-components';

interface DiscordButtonProps {
  onClick?: any;
  disabled?: boolean;
  background?: string;
  color?: string;
  type?: string;
  className?: string;
  overrideLink?: string;
}

const DiscordButton = ({ onClick, disabled, type, color, background, className, overrideLink }: DiscordButtonProps) => {
  return (
    <DiscordButtonWrapper
      className={className}
      color={'var(--white)'}
      background={'var(--purple)'}
      type={type}
      onClick={() => {
        window.open(overrideLink || 'https://discord.gg/eGatHr2a5u');
        if (onClick) {
          onClick();
        }
      }}
      disabled={disabled}
    >
      <DiscordIcon color={color}>
        <DiscordLogo />
      </DiscordIcon>
      Join us on Discord
    </DiscordButtonWrapper>
  );
};

const DiscordButtonWrapper = styled(BaseButton)`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  min-width: 240px;
  border-color: transparent;
  border: 2px;

  span {
    display: inline-flex;
    align-items: center;
  }
`;

const DiscordIcon = styled.div<{ color?: string }>`
  display: flex;
  width: 40px;
  height: 40px;

  svg {
    fill: var(--white);
  }
  padding: 4px;
`;

export default React.memo(DiscordButton);
