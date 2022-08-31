import WalletDropdown from 'components/user/WalletDropdown';
import UserPrefsDropdown from 'components/user/UserPrefsDropdown';
import { ReferralModal } from 'components/garden/modals';
import { TurquoiseButton } from '../Buttons';

import { Routes } from 'constants/Routes';
import { useW3Context } from 'context/W3Provider';

import { useLocation } from 'react-router-dom';
import { useHistory } from 'react-router';
import Menu from 'react-burger-menu/lib/menus/slide';
import styled from 'styled-components';
import React, { useEffect, useState } from 'react';

interface LinkRecord {
  text: string;
  href: string;
}

interface MobileMenuProps {
  links: LinkRecord[];
  styles?: any;
}

const defaultStyle = {
  bmBurgerButton: {
    position: 'absolute',
    width: '18px',
    height: '18px',
    top: '30px',
    right: '-6px',
  },
  bmBurgerBars: {
    background: 'var(--white)',
    marginLeft: 'auto',
  },
  bmCross: {
    background: '#bdc3c7',
  },
  bmMenuWrap: {
    position: 'fixed',
    height: '100vh',
    width: '80vw',
  },
  bmMenu: {
    background: 'var(--purple-10)',
    padding: '2.5em 0.75em 0',
    fontSize: '18px',
  },
  bmItemList: {
    padding: '0.75em',
    display: 'flex',
    flexFlow: 'column nowrap',
  },
  bmItem: {
    color: 'var(--white)',
    display: 'inline-block',
    padding: '8px 0',
    fontFamily: 'cera-medium',
  },
  bmOverlay: {
    background: 'rgba(0, 0, 0, 0.7)',
  },
};

const landerRoutes = [
  Routes.index,
  Routes.terms,
  Routes.privacy,
  Routes.prophets,
  Routes.daoLander,
  Routes.creatorLander,
];

const MobileMenu = ({ links = [], styles = defaultStyle }: MobileMenuProps) => {
  const [lander, setLander] = useState<boolean>();

  const { address, connect, wallet } = useW3Context();
  const history = useHistory();
  const location = useLocation();

  if (!address) {
    links = links.filter((i) => i.text !== 'Portfolio');
  }

  useEffect(() => {
    setLander(landerRoutes.indexOf(location.pathname) > -1);
  }, [location]);

  return (
    <Menu disableAutoFocus right styles={styles}>
      <ConnectionWrapper>
        {lander && (
          <TurquoiseButton onClick={() => history.push(Routes.explore)} inverted>
            Launch App
          </TurquoiseButton>
        )}
        {!lander && wallet && address && (
          <ConnectedRow>
            <WalletDropdown address={address} />
            <UserPrefsDropdown />
            <ReferralModal />
          </ConnectedRow>
        )}
        {!lander && (!wallet || !address) && <TurquoiseButton onClick={connect}>Connect Wallet</TurquoiseButton>}
      </ConnectionWrapper>
      {links.map((link) => {
        return (
          <a key={link.text} id={link.text} className="menu-item" href={link.href}>
            {link.text}
          </a>
        );
      })}
    </Menu>
  );
};

const ConnectedRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
`;

const ConnectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
`;

export default React.memo(MobileMenu);
