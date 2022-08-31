import addresses from 'constants/addresses';
import UserPrefsDropdown from '../user/UserPrefsDropdown';
import WalletDropdown from '../user/WalletDropdown';
import { TokenDisplay } from './TokenDisplay';
import { Icon } from 'components/shared';
import { ReferralModal } from 'components/garden/modals';
import { TurquoiseButton } from './Buttons';

import { MAX_GAS_FULL_SUBSIDY_PRICE, IS_MAINNET, BREAKPOINTS } from 'config';
import { IconName, QuoteResult } from 'models';
import { Routes, RoutesExternal } from 'constants/Routes';
import { TokenListService } from 'services';
import { formatToGas } from 'helpers/Numbers';
import { useW3Context } from 'context/W3Provider';

import { Link, useLocation } from 'react-router-dom';
import { Box } from 'rimble-ui';
import styled from 'styled-components';
import React from 'react';

interface AppHeaderProps {
  isMobile: boolean;
}

const NETWORK_NAME = {
  1: 'mainnet',
  4: 'rinkeby',
  31337: 'hardhat',
};

interface BablPriceProps {
  quotes: QuoteResult;
}

const BablPrice = ({ quotes }: BablPriceProps) => {
  const tokenListService = TokenListService.getInstance();
  const token = tokenListService.getTokenByAddress(addresses.tokens.BABL);

  return (
    <PriceContainer onClick={() => window.open(RoutesExternal.uniswapPool, '_blank', 'noopener')}>
      <TokenDisplay token={token} size={22} />
      <TokenPrice>{`$${quotes.BABL.quote.USD.price.toFixed(2) || 0}`}</TokenPrice>
    </PriceContainer>
  );
};

const AppHeader = ({ isMobile }: AppHeaderProps) => {
  const { address, admin, wallet, connect, network, gasPrices, quotes } = useW3Context();
  const location = useLocation();

  const isLander = (() => {
    return (
      [Routes.index, Routes.terms, Routes.privacy, Routes.creatorLander, Routes.daoLander].indexOf(location.pathname) >
      -1
    );
  })();

  const isProphetsSubpage = (() => {
    if (location.pathname.split('/')[1] === 'prophets') {
      return true;
    }

    return false;
  })();

  const preferredNetwork = Number(process.env.REACT_APP_CHAIN_ID);
  const gasPrice = gasPrices?.fast || 0;

  return (
    <>
      {!isMobile && wallet && address && IS_MAINNET && formatToGas(gasPrice) > MAX_GAS_FULL_SUBSIDY_PRICE && !isLander && (
        <GasBanner>
          <Icon name={IconName.flame} size={24} />
          <GasBannerText>
            The Ethereum blockchain is currently congested; transactions are more expensive than usual. Consider waiting
            until gas prices are below <b>{MAX_GAS_FULL_SUBSIDY_PRICE} gwei</b>.
          </GasBannerText>
        </GasBanner>
      )}
      {!isMobile && wallet && address && network !== preferredNetwork && !isLander && (
        <WrongNetworkBanner>
          <WrongNetworkText>
            This application requires a connection to <b> ETH {NETWORK_NAME[preferredNetwork] || 'unknown'} network</b>.
            Please select the correct network from your wallet provider.
          </WrongNetworkText>
        </WrongNetworkBanner>
      )}
      <GasBanner>
        <Icon name={IconName.warning} size={24} />
        <GasBannerText>
          {'  '}Babylon Finance is shutting down. You need to withdraw before November 15th. Read the full announcement
          <StyledLink
            to={{
              pathname: 'https://docs.babylon.finance/babl/mining',
            }}
            target="_blank"
          >
            here
          </StyledLink>
          .
        </GasBannerText>
      </GasBanner>
      <HeaderWrapper>
        <ContainerLarge>
          <StyledHeader>
            <LogoWrapper>
              <Link to={Routes.index}>
                <LogoImg src={'/Babylon_logo-horizontal-dark.svg'} alt="babylon-logo-full" />
              </Link>
            </LogoWrapper>
            {!isMobile && admin && <AdminPill>Admin</AdminPill>}
            {!isLander && !isProphetsSubpage && !isMobile && (
              <>
                <NavLinkWrapper>
                  {address && <NavLinkItem to={Routes.portfolio}>Portfolio</NavLinkItem>}
                  <NavLinkItem to={Routes.explore}>Explore</NavLinkItem>
                  <NavLinkItem to={Routes.heart}>Heart</NavLinkItem>
                  {admin && <NavLinkItem to={Routes.leaderboard}>Leaderboard</NavLinkItem>}
                  {admin && <NavLinkItem to={Routes.admin}>Admin</NavLinkItem>}
                  {quotes && <BablPrice quotes={quotes} />}
                </NavLinkWrapper>
                <ConnectionWrapper>
                  {wallet && address && (
                    <>
                      <ReferralModal />
                      <UserPrefsDropdown />
                      <WalletDropdown address={address} />
                    </>
                  )}
                  {(!wallet || !address) && <TurquoiseButton onClick={connect}>Connect Wallet</TurquoiseButton>}
                </ConnectionWrapper>
              </>
            )}
            {!isMobile && isLander && !isProphetsSubpage && (
              <>
                <NavLinkWrapperMain>
                  <NavLinkItem to={Routes.creatorLander}>For Managers</NavLinkItem>
                  <NavLinkItem to={Routes.daoLander}>For DAOs</NavLinkItem>
                  <NavLinkItem to={{ pathname: 'https://docs.babylon.finance' }} target="_blank">
                    Docs
                  </NavLinkItem>
                  <NavLinkItem to={Routes.heart}>Heart</NavLinkItem>
                  <NavLinkItem to={{ pathname: Routes.prophets }}>The Prophets</NavLinkItem>
                  {quotes && <BablPrice quotes={quotes} />}
                </NavLinkWrapperMain>
                {!isMobile && (
                  <NavLinkItem to={Routes.portfolio}>
                    <TurquoiseButton onClick={() => null} inverted>
                      Launch App
                    </TurquoiseButton>
                  </NavLinkItem>
                )}
              </>
            )}
            {!isMobile && isProphetsSubpage && (
              <NavLinkMobileEnabledWrapper>
                <NavLinkItem to={Routes.prophets}>The Prophets</NavLinkItem>
                <NavLinkItem to={Routes.prophetPortfolio}>Portfolio</NavLinkItem>
                <NavLinkItem to={Routes.prophetsGallery}>Gallery</NavLinkItem>
                <ConnectionWrapper>
                  {wallet && address && (
                    <>
                      <WalletDropdown address={address} />
                    </>
                  )}
                  {(!wallet || !address) && <TurquoiseButton onClick={connect}>Connect Wallet</TurquoiseButton>}
                </ConnectionWrapper>
              </NavLinkMobileEnabledWrapper>
            )}
          </StyledHeader>
        </ContainerLarge>
      </HeaderWrapper>
    </>
  );
};

const PriceContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 8px 0 0 40px;

  &:hover {
    opacity: 0.7;
    cursor: pointer;
  }
`;

const TokenPrice = styled.div`
  padding-left: 6px;
  font-size: 16px;
  color: var(--blue-03);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WrongNetworkBanner = styled.div`
  width: 100%;
  background-color: var(--yellow);
  padding: 10px 0;
`;

const GasBanner = styled.div`
  width: 100%;
  padding: 10px 0;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;

  animation: fadeInAnimation ease 0.5s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;

  @keyframes fadeInAnimation {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  > div:first-child {
    margin-right: 5px;
  }
`;

const AdminPill = styled.div`
  margin-top: 4px;
  background-color: var(--purple-aux);
  border-radius: 2px;
  color: var(--primary);
  font-size: 13px;
  font-family: cera-medium;
  padding: 4px;
  text-align: center;
  margin-left: 6px;
`;

const GasBannerText = styled.div`
  text-align: center;
  color: var(--white);
  font-size: 16px;
  font-family: cera-regular;
  height: 100%;
`;

const WrongNetworkText = styled.div`
  text-align: center;
  color: var(--blue);
  font-size: 16px;
  font-family: cera-regular;
  height: 100%;
`;

const NavLinkWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  width: 100%;
  padding-left: 40px;
  align-items: center;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    a {
      display: none;
    }
  }

  a {
    margin-left: 20px;
    display: inline-block;
  }
`;

const NavLinkWrapperMain = styled(NavLinkWrapper)`
  padding-left: 0;
  width: 100%;
  @media only screen and (max-width: 598px) {
    a {
      display: none;
    }

    a:nth-child(3) {
      display: block;
    }
  }
`;

const NavLinkMobileEnabledWrapper = styled(NavLinkWrapper)`
  width: 100%;
  flex-flow: row nowrap;
  justify-content: flex-end;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    flex-flow: row wrap;
  }
`;

const NavLinkItem = styled(Link)<{ selected: boolean }>`
  font-size: 14px;
  font-family: cera-bold;
  text-align: center;
  color: var(--white);
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  justify-content: center;
  padding: 6px 10px 0 10px;
  text-decoration: ${(p) => (p.selected ? 'underline' : 'inherit')};

  &:hover {
    cursor: ${(p) => (p.selected ? 'default' : 'pointer')};
    color: ${(p) => (p.selected ? 'var(--white)' : 'var(--blue-03)')};
    text-decoration: ${(p) => (p.selected ? 'underline' : 'none')};
  }
`;

const ContainerLarge = styled(Box)`
  position: relative;
  max-width: var(--screen-lg-min);
  width: 100%;
  padding: 0 40px;

  @media only screen and (max-width: 1440px) {
    padding: 0 100px;
  }

  @media only screen and (max-width: 992px) {
    padding: 0 45px 0 30px;
  }

  @media only screen and (max-width: 598px) {
    padding: 0 30px;
  }
`;

const LogoImg = styled.img`
  height: 45px;
  object-fit: fill;
  object-position: -4px 0px;

  @media only screen and (max-width: 1240px) {
    height: 40px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    height: 35px;
  }
`;

const HeaderWrapper = styled.div`
  align-items: flex-end;
  background-color: var(--blue-alt);
  display: flex;
  justify-content: center;
  width: 100%;
`;

const LogoWrapper = styled.div`
  display: flex;
  margin-top: -10px;
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100px;

  @media only screen and (max-width: 992px) {
    height: 80px;
  }
`;

const StyledLink = styled(Link)`
  font-family: cera-regular;
  color: var(--turquoise-01);
  text-decoration: underline;
  margin-left: 3px;

  &:hover {
    color: var(--turquoise-01);
    text-decoration: underline;
    opacity: 0.8;
  }
`;

const ConnectionWrapper = styled.div`
  margin-left: 10px;
  display: flex;
  align-items: center;
`;

export default React.memo(AppHeader);
