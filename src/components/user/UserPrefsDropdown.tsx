import { CurrencySelector, Icon } from 'components/shared/';

import { BREAKPOINTS } from 'config';
import { IconName } from 'models';
import { useW3Context } from 'context/W3Provider';
import useComponentVisible from '../../hooks/useComponentVisible';

import { Box } from 'rimble-ui';
import styled from 'styled-components';
import React from 'react';

const UserPrefsDropdown = () => {
  const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);
  const { userPrefs, updateUserPrefs } = useW3Context();

  const toggleDropdown = (e: React.SyntheticEvent): void => {
    setIsComponentVisible(!isComponentVisible);
    e.stopPropagation();
  };

  const handleUpdateCurrency = async (e: any) => {
    e.preventDefault();
    if (userPrefs) {
      const prefs = { ...userPrefs };
      prefs.currency = e.currentTarget.value;

      updateUserPrefs(prefs);
    }
  };

  return (
    <div ref={ref}>
      <UserPrefsDropdownWrapper>
        <UserSettingsButton active={isComponentVisible} onClick={toggleDropdown}>
          <Icon size={24} color={'var(--white)'} name={IconName.gear} />
        </UserSettingsButton>
      </UserPrefsDropdownWrapper>
      {isComponentVisible && (
        <DropdownWrapper>
          <DropdownItem>
            {userPrefs && (
              <ControlsBox>
                <ControlItem>
                  <ControlItemLabel>Fiat Currency</ControlItemLabel>
                  <CurrencySelector selected={userPrefs.currency} onChange={handleUpdateCurrency} />
                </ControlItem>
              </ControlsBox>
            )}
          </DropdownItem>
        </DropdownWrapper>
      )}
    </div>
  );
};

const UserPrefsDropdownWrapper = styled.div``;

const UserSettingsButton = styled.div<{ active: boolean }>`
  background-color: ${(p) => (p.active ? 'var(--purple-aux)' : 'var(--blue-alt)')};
  height: 40px;
  width: 40px;
  border-radius: 2px;
  display: flex;
  justify-content: center;
  background-color: var(--blue-07);
  margin-right: 20px;

  &:hover {
    background-color: var(--purple-03);
    cursor: pointer;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    background-color: ${(p) => (p.active ? 'var(--blue-alt)' : 'var(--purple-aux)')};
    margin-right: 10px;
  }
`;

const ControlsBox = styled(Box)`
  height: 100%;
`;

const ControlItem = styled.div`
  margin-top: 20px;

  &:first-child {
    margin-top: 0;
  }
`;

const ControlItemLabel = styled.div`
  font-size: 14px;
  font-family: cera-bold;
  padding-bottom: 8px;
`;

const DropdownWrapper = styled.div`
  position: absolute;
`;

const DropdownItem = styled.div`
  border-radius: 4px;
  position: absolute;
  top: 10px;
  bottom: 0;
  left: -320px;
  right: 0;
  z-index: 10;
  width: 360px;
  height: 145px;
  background-color: var(--blue-06);
  box-shadow: 0px 8px 20px rgba(15, 10, 69, 0.5);
  padding: 30px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 10px;
    width: 275px;
    height: 115px;
    left: -160px;
  }
`;

export default React.memo(UserPrefsDropdown);
