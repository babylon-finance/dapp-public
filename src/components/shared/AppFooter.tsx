import { ReactComponent as MediumLogo } from '../../icons/medium_logo.svg';
import { ReactComponent as DiscordLogo } from '../../icons/discord_logo.svg';
import { ReactComponent as TwitterLogo } from '../../icons/twitter_logo.svg';
import { ReactComponent as TelegramLogo } from '../../icons/telegram_logo.svg';
import { BREAKPOINTS } from 'config';

import { Box, Link as StyledLink } from 'rimble-ui';
import styled from 'styled-components';
import React from 'react';

const ExternalTarget = {
  discord: 'discord',
  docs: 'docs',
  litepaper: 'litepaper',
  support: 'support',
  medium: 'medium',
  telegram: 'telegram',
  twitter: 'twitter',
  feedback: 'feedback',
  designkit: 'designkit',
};

interface AppFooterProps {
  isMobile: boolean;
}

const AppFooter = ({ isMobile }: AppFooterProps) => {
  const getTargetLink = (target) => {
    switch (target) {
      case ExternalTarget.twitter:
        return 'https://twitter.com/BabylonFinance';
      case ExternalTarget.medium:
        return 'https://medium.com/babylon-finance';
      case ExternalTarget.discord:
        return 'https://discord.com/invite/babylon';
      case ExternalTarget.telegram:
        return 'https://t.me/joinchat/HQ5TId7ZUCb9ktgT';
      // Update these when we have the new links!!!!!!!
      case ExternalTarget.docs:
        return 'https://docs.babylon.finance/';
      case ExternalTarget.litepaper:
        return 'https://docs.babylon.finance/protocol/litepaper';
      case ExternalTarget.support:
        return 'https://discord.gg/mVQZCXmNGF';
      case ExternalTarget.feedback:
        return 'https://babylonfinance.canny.io/';
      case ExternalTarget.designkit:
        return 'https://drive.google.com/open?id=19N2k8ibtYKB-a_HRnIKuV71Pe4cy1ccf';
    }
  };

  return (
    <FooterWrapper>
      <ContainerLarge>
        <FooterContentWrapper>
          <LinkRow>
            {!isMobile && (
              <FooterTextLinkBlock>
                <FooterTextLink href={getTargetLink(ExternalTarget.docs)} target="_blank" rel="noopener noreferrer">
                  Documentation
                </FooterTextLink>
                <FooterTextLink
                  href={getTargetLink(ExternalTarget.litepaper)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Litepaper
                </FooterTextLink>
                <FooterTextLink href={getTargetLink(ExternalTarget.feedback)} target="_blank" rel="noopener noreferrer">
                  Product Feedback
                </FooterTextLink>
                <FooterTextLink
                  href={getTargetLink(ExternalTarget.designkit)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Brand Design Kit
                </FooterTextLink>
              </FooterTextLinkBlock>
            )}
            {!isMobile && (
              <FooterTextLinkBlock>
                <FooterTextLink href={getTargetLink(ExternalTarget.support)} target="_blank" rel="noopener noreferrer">
                  Contact Support
                </FooterTextLink>
                <FooterTextLink href="/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </FooterTextLink>
                <FooterTextLink href="/terms" target="_blank" rel="noopener noreferrer">
                  Terms and Conditions
                </FooterTextLink>
              </FooterTextLinkBlock>
            )}
            {isMobile && (
              <FooterTextLinkBlock>
                <FooterTextLink href={getTargetLink(ExternalTarget.docs)} target="_blank" rel="noopener noreferrer">
                  Documentation
                </FooterTextLink>
                <FooterTextLink href={getTargetLink(ExternalTarget.support)} target="_blank" rel="noopener noreferrer">
                  Contact Support
                </FooterTextLink>
                <FooterTextLink href="/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </FooterTextLink>
                <FooterTextLink href="/terms" target="_blank" rel="noopener noreferrer">
                  Terms and Conditions
                </FooterTextLink>
              </FooterTextLinkBlock>
            )}
            <FooterSocialLinkBlock>
              <FooterSocialLinkLabel>Join us!</FooterSocialLinkLabel>
              <FooterSocialLinkIcons>
                <a href={getTargetLink(ExternalTarget.discord)} target="_blank" rel="noopener noreferrer">
                  <FooterSocialIcon>
                    <DiscordLogo />
                  </FooterSocialIcon>
                </a>
                <a href={getTargetLink(ExternalTarget.medium)} target="_blank" rel="noopener noreferrer">
                  <FooterSocialIcon>
                    <MediumLogo />
                  </FooterSocialIcon>
                </a>
                <a href={getTargetLink(ExternalTarget.twitter)} target="_blank" rel="noopener noreferrer">
                  <FooterSocialIcon>
                    <TwitterLogo />
                  </FooterSocialIcon>
                </a>
                <a href={getTargetLink(ExternalTarget.telegram)} target="_blank" rel="noopener noreferrer">
                  <FooterSocialIcon>
                    <TelegramLogo />
                  </FooterSocialIcon>
                </a>
              </FooterSocialLinkIcons>
            </FooterSocialLinkBlock>
          </LinkRow>
          <FooterLogoWrapper>
            <img height="45" src="/Babylon_logo-horizontal-dark.svg" alt="babylon-logo-mono" />
          </FooterLogoWrapper>
        </FooterContentWrapper>
      </ContainerLarge>
    </FooterWrapper>
  );
};

const LinkRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  height: 100%;
`;

const ContainerLarge = styled(Box)`
  position: relative;
  max-width: var(--screen-lg-min);
  width: 100%;
  padding: 60px 30px 0 30px;

  @media only screen and (max-width: 1440px) {
    padding: 60px 30px 0 30px;
  }

  @media only screen and (max-width: 1280px) {
    padding: 30px 30px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding: 30px 30px;
  }
`;

const FooterTextLinkBlock = styled.div`
  display: flex;
  flex-flow: column;
  min-width: 175px;
  margin-right: 16px;

  @media only screen and (max-width: 1240px) {
    min-width: 140px;
  }
`;

const FooterSocialLinkBlock = styled.div`
  display: flex;
  flex-flow: column;
`;

const FooterSocialLinkLabel = styled.div`
  color: var(--white);
  font-family: cera-bold;
  font-size: 16px;
  margin-bottom: 8px;
`;

const FooterSocialLinkIcons = styled.div`
  display: flex;
  flex-flow: row;
  min-width: 180px;
  justify-content: space-between;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    min-width: 100px;
    width: 100px;
  }
`;

const FooterSocialIcon = styled.svg`
  display: flex;
  width: 40px;
  height: 40px;
  fill: var(--white);
  opacity: 0.5;
  padding: 4px;

  &:hover {
    color: var(--white);
    opacity: 0.9;
    cursor: pointer;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 30px;
    height: 30px;
  }
`;

const FooterTextLink = styled(StyledLink)`
  color: var(--white);
  font-family: cera-light;
  font-size: 16px;
  padding-bottom: 6px;

  &:hover {
    color: var(--purple-aux);
    opacity: 0.7;
    text-decoration: none;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

const FooterContentWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  min-height: 200px;
  width: 100%;

  @media only screen and (max-width: 1240px) {
    min-height: 100px;
  }
`;

const FooterWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  background-color: var(--footer-blue);
  border-top: 1px solid var(--border-blue);
  width: 100%;
`;

const FooterLogoWrapper = styled.div`
  align-items: top;
  display: flex;
  font-family: cera-bold;
  padding: 5px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    display: none;
  }
`;

export default React.memo(AppFooter);
