import { Member, Icon } from 'components/shared';

import { buildEtherscanContractUrl } from '../../helpers/Urls';
import { Identity, IconName } from 'models';
import { IdentityService } from 'services';
import { useW3Context } from 'context/W3Provider';
import useComponentVisible from '../../hooks/useComponentVisible';
import { BREAKPOINTS } from 'config';

import styled from 'styled-components';
import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';

interface WalletDropdownProps {
  address: string;
}

const WalletDropdown = ({ address }: WalletDropdownProps) => {
  const [identity, setIdentity] = useState<Identity | undefined>(undefined);

  const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);
  const { disconnect, switchWallet } = useW3Context();
  const identityService = IdentityService.getInstance();

  const toggleDropdown = (e: React.SyntheticEvent): void => {
    setIsComponentVisible(!isComponentVisible);
    e.stopPropagation();
  };

  const fetchIdentity = async () => {
    const identityResponse = await identityService.getIdentities([address]);
    if (identityResponse?.usersByAddress) {
      setIdentity(identityResponse?.usersByAddress[address]);
    }
  };

  useEffect(() => {
    fetchIdentity();
  }, [address]);

  const iconSize = isMobile ? 20 : 25;

  return (
    <div ref={ref}>
      <WalletDropdownWrapper>
        <ConnectedWrapper active={isComponentVisible} onClick={toggleDropdown}>
          <Member
            link={false}
            br={2}
            size={10}
            scale={3}
            address={address}
            displayName={identity?.displayName}
            avatarUrl={identity?.avatarUrl}
            showText
          />
        </ConnectedWrapper>
      </WalletDropdownWrapper>
      {isComponentVisible && (
        <DropdownWrapper>
          <DropdownItem>
            <DropdownRow>
              <ExternalLinkWrapper href={buildEtherscanContractUrl(address)} target="_blank" rel="noopener noreferrer">
                <DropdownRowContent>
                  <Icon name={IconName.external} size={iconSize} color={'var(--white)'} />
                  <DropdownRowText>View on Etherscan</DropdownRowText>
                </DropdownRowContent>
              </ExternalLinkWrapper>
            </DropdownRow>
            <DropdownRow>
              <ExternalLinkWrapper
                href={'https://www.withtally.com/user/settings'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <DropdownRowContent>
                  <Icon name={IconName.identity} size={iconSize} color={'var(--white)'} />
                  <DropdownRowText>Manage Identity</DropdownRowText>
                </DropdownRowContent>
              </ExternalLinkWrapper>
            </DropdownRow>
            <DropdownRow
              onClick={(e) => {
                switchWallet(e);
                toggleDropdown(e);
              }}
            >
              <DropdownRowContent>
                <Icon name={IconName.switch} size={iconSize} color={'var(--white)'} />
                <DropdownRowText>Switch Wallet Provider</DropdownRowText>
              </DropdownRowContent>
            </DropdownRow>
            <DropdownRow onClick={disconnect}>
              <DropdownRowContent>
                <Icon name={IconName.exit} size={iconSize} color={'var(--white)'} />
                <DropdownRowText>Disconnect Wallet</DropdownRowText>
              </DropdownRowContent>
            </DropdownRow>
          </DropdownItem>
        </DropdownWrapper>
      )}
    </div>
  );
};

const WalletDropdownWrapper = styled.div``;

const ExternalLinkWrapper = styled.a`
  color: var(--white);
  text-decoration: none;

  &:hover,
  &:visited,
  &:link,
  &:active {
    color: inherit;
    text-decoration: none;
    margin-left: 0px;
  }
`;

const DropdownWrapper = styled.div`
  position: absolute;
`;

const DropdownItem = styled.div`
  border-radius: 4px;
  position: absolute;
  top: 10px;
  bottom: 0;
  left: -165px;
  right: 0;
  z-index: 10;
  width: 300px;
  height: 240px;
  background-color: var(--blue-06);
  box-shadow: 0px 8px 20px rgba(15, 10, 69, 0.5);

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    left: 0;
    width: 250px;
  }
`;

const DropdownRow = styled.div`
  width: 100%;
  height: 60px;
  border-bottom: 1px solid var(--border-blue);
  padding: 20px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;

  &:hover {
    background-color: var(--blue-05);
    cursor: pointer;
  }

  &:first-child {
    border-radius: 4px 4px 0 0;
  }

  &:last-child {
    border-radius: 0 0 4px 4px;
    border: none;
  }
`;

const DropdownRowContent = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
`;

const DropdownRowText = styled.div`
  padding-left: 10px;
  font-family: cera-medium;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

const ConnectedWrapper = styled.div<{ active: boolean }>`
  align-items: center;
  border-radius: 2px;
  display: flex;
  margin-left: auto;
  padding: 4px;
  height: 40px;
  min-width: 135px;
  background-color: ${(p) => (p.active ? 'var(--purple-aux)' : 'inherit')};

  &:hover {
    background-color: var(--purple-03);
    cursor: pointer;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    margin-left: 0;
    margin-right: 10px;
  }
`;

export default React.memo(WalletDropdown);
