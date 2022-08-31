import { Tab, IconName } from 'models';
import { BREAKPOINTS } from 'config';
import { Icon } from 'components/shared';
import React, { useState } from 'react';
import styled from 'styled-components';

interface NavTab {
  display: string;
  value: Tab;
  icon?: string;
  metric?: string;
}

interface TabbedNavigationProps {
  tabs: NavTab[];
  currentTab?: string;
  border?: boolean;
  altStyle?: boolean;
  width?: string | undefined;
  setActiveTab(tab: any): void;
}

const TabbedNavigation = ({
  tabs,
  currentTab,
  setActiveTab,
  border = true,
  altStyle = false,
  width,
}: TabbedNavigationProps) => {
  const [active, setActive] = useState(tabs.length > 0 ? currentTab || tabs[0].value : '');

  const handleActiveClick = (value: string) => {
    setActive(value);
    setActiveTab(value);
  };

  const isActive = (value: string) => {
    return value === active;
  };

  const tabStyle = `${!altStyle ? '3px' : '6px'} solid ${!altStyle ? 'var(--turquoise-01)' : 'var(--purple)'}`;

  return (
    <NavWrapper border={border} width={width}>
      {tabs.map((tab) => (
        <NavTab
          altStyle={altStyle}
          tabStyle={tabStyle}
          key={tab.value}
          value={tab.value}
          active={() => isActive(tab.value)}
          onClick={() => handleActiveClick(tab.value)}
        >
          {tab.icon && <StyledIcon name={IconName[tab.icon]} />}
          {tab.display}
          {tab.metric && Number(tab.metric) > 0 && (
            <NavTabStat>
              <NavTabStatValue>{tab.metric}</NavTabStatValue>
            </NavTabStat>
          )}
        </NavTab>
      ))}
    </NavWrapper>
  );
};

const NavWrapper = styled.div<{ border: boolean; width: string | undefined }>`
  border-bottom: ${(p) => (p.border ? '1px solid var(--border-blue)' : 'none')};
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  width: ${(p) => (p.width ? p.width : '100%')};
  position: relative;
  z-index: 2;
`;

const StyledIcon = styled(Icon)`
  height: 24px;
  margin-right: 5px;
`;

const NavTabStat = styled.div`
  border-radius: 25%;
  height: 25px;
  width: 25px;
  background-color: var(--purple);
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  margin-left: 20px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    margin-left: 10px;
    width: 20px;
    height: 20px;
  }
`;

const NavTabStatValue = styled.span`
  color: var(--white);
  font-family: cera-regular;
  font-size: 16px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 13px;
  }
`;

const NavTab = styled.div<{ active: () => boolean; value: string; tabStyle: string; altStyle: boolean }>`
  border-bottom: ${(props) => (props.active() ? props.tabStyle : 'none')};
  color: ${(props) => (props.active() ? (props.altStyle ? 'var(--white)' : 'var(--turquoise-01)') : 'var(--blue-03)')};
  display: flex;
  flex-flow: row nowrap;
  flex-grow: 1;
  font-family: cera-bold;
  font-size: 16px;
  justify-content: center;
  max-width: 300px;
  padding: 20px;
  text-align: center;
  height: 66px;

  &:hover {
    ${(props) =>
      !props.active()
        ? `
          cursor: pointer;
          color: ${(props) => (props.altStyle ? 'var(--white)' : 'var(--turquoise-04)')};
          border-bottom: ${props.tabStyle};
          opacity: 0.8;
          `
        : ''};
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    height: auto;
    padding: 5px;
    font-size: 14px;
  }
`;

export default React.memo(TabbedNavigation);
