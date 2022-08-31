import { buildEtherscanContractUrl } from 'helpers/Urls';

import { Box, Link as StyledLink } from 'rimble-ui';
import { isMobile } from 'react-device-detect';
import styled from 'styled-components';
import React from 'react';

const ExternalTarget = {
  audit: 'audit',
  nft: 'nft',
  arrival: 'arrival',
};

const ProphetFooter = () => {
  const getTargetLink = (target) => {
    switch (target) {
      case ExternalTarget.audit:
        return '';
      case ExternalTarget.arrival:
        return buildEtherscanContractUrl('0xe9883aee5828756216fd7df80eb56bff90f6e7d7');
      case ExternalTarget.nft:
        return buildEtherscanContractUrl('0x26231a65ef80706307bbe71f032dc1e5bf28ce43');
    }
  };

  return (
    <FooterWrapper>
      <ContainerLarge>
        <FooterContentWrapper>
          <LinkRow mobile={isMobile}>
            <FooterLogoWrapperMobile>
              <img height="40" src="/Babylon_logo-horizontal-dark.svg" alt="babylon-logo-mono" />
            </FooterLogoWrapperMobile>
            <FooterTextLinkBlock>
              Babylon is a community-led asset management protocol. Invest in DeFi together.
              <HomeLink href={'https://www.babylon.finance/'} target="_blank" rel="noopener noreferrer">
                Learn more at babylon.finance
              </HomeLink>
            </FooterTextLinkBlock>
            <FooterTextLinkBlock>
              <FooterTextLink href={'./prophets_audit.pdf'} target="_blank" rel="noopener noreferrer">
                Audit Report
              </FooterTextLink>
              <FooterTextLink href={getTargetLink(ExternalTarget.arrival)} target="_blank" rel="noopener noreferrer">
                Arrival Contract
              </FooterTextLink>
              <FooterTextLink href={getTargetLink(ExternalTarget.nft)} target="_blank" rel="noopener noreferrer">
                Prophets Contract
              </FooterTextLink>
            </FooterTextLinkBlock>
          </LinkRow>
          <FooterLogoWrapper>
            <img height="60" src="/Babylon_logo-horizontal-dark.svg" alt="babylon-logo-mono" />
          </FooterLogoWrapper>
        </FooterContentWrapper>
      </ContainerLarge>
    </FooterWrapper>
  );
};

const LinkRow = styled.div<{ mobile: boolean }>`
  display: flex;
  flex-flow: row wrap;
  height: 100%;

  @media only screen and (max-width: 1240px) {
    flex-flow: column nowrap;
    justify-content: center;
    width: 100%;
  }
`;

const ContainerLarge = styled(Box)`
  position: relative;
  max-width: var(--screen-lg-min);
  width: 100%;
  padding: 60px 30px 60px 30px;

  @media only screen and (max-width: 1440px) {
    padding: 60px 100px 0 100px;
  }

  @media only screen and (max-width: 1240px) {
    padding: 30px 30px 0 0;
  }

  @media only screen and (max-width: 992px) {
    padding: 30px 50px;
  }
`;

const FooterTextLinkBlock = styled.div`
  display: flex;
  flex-flow: column;
  min-width: 175px;
  max-width: 250px;
  margin-right: 30px;

  @media only screen and (max-width: 1240px) {
    min-width: 140px;
    width: 100%;
    align-items: center;
    justify-content: center;
    margin-right: 0;
    text-align: center;
    padding: 10px 0;
    max-width: 100%;
  }
`;

const FooterTextLink = styled(StyledLink)`
  color: var(--white);
  font-family: cera-bold;
  font-size: 18px;
  padding-bottom: 6px;

  &:hover {
    color: var(--purple-aux);
    opacity: 0.7;
    text-decoration: none;
  }
`;

const HomeLink = styled(FooterTextLink)`
  padding-top: 20px;
  font-size: 16px;
  font-family: cera-light;
  color: var(--purple-aux);
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
  align-items: center;
  display: flex;
  font-family: cera-bold;
  padding: 5px;

  @media only screen and (max-width: 1240px) {
    display: none;
  }
`;

const FooterLogoWrapperMobile = styled.div`
  display: none;

  @media only screen and (max-width: 1240px) {
    display: block;
    align-items: center;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    font-family: cera-bold;
    padding: 20px 0;
    width: 100%;
  }
`;

export default React.memo(ProphetFooter);
