import { BaseModal, Icon, PurpleButton } from 'components/shared';
import { ChatPanel, CreatorsPanel, DescriptionPanel, MembersPanel, ParamsPanel, PermissionsPanel } from './panels';

import { FullGardenDetails, IconName } from 'models';
import { firstUpper } from 'helpers/Strings';

import styled from 'styled-components';
import React, { useState } from 'react';

interface AdminPanelProps {
  gardenDetails: FullGardenDetails;
  refetch(): void;
}

// Note this should be in the order want to display them
const PanelSections = {
  description: 'description',
  params: 'params',
  members: 'members',
  creators: 'creators',
  permissions: 'permissions',
  chat: 'chat',
};

const OptionText = {
  chat: 'Manage Chat',
  creators: 'Manage Creators',
  description: 'Edit Description',
  params: 'Garden Properties',
  members: 'Manage Members',
  permissions: 'Manage Permissions',
};

const OptionIcon = {
  chat: IconName.chat,
  params: IconName.switch,
  creators: IconName.creator,
  description: IconName.edit,
  members: IconName.members,
  permissions: IconName.permission,
};

interface NavItemProps {
  clickHandler(section: string): void;
  selected: string;
}

const NavOptions = ({ clickHandler, selected }: NavItemProps) => {
  return (
    <NavOptionsWrapper>
      {Object.keys(PanelSections).map((section) => (
        <NavItem key={section} active={selected === section} onClick={() => clickHandler(section)}>
          <Icon name={OptionIcon[section] || IconName.edit} size={24} />
          <NavItemName>{firstUpper(OptionText[section] || '')}</NavItemName>
        </NavItem>
      ))}
    </NavOptionsWrapper>
  );
};

const AdminPanelNav = ({ clickHandler, selected }: NavItemProps) => {
  return (
    <NavContainer>
      <AdminPanelHeader>Admin</AdminPanelHeader>
      <NavOptionsContainer>
        <NavOptions selected={selected} clickHandler={clickHandler} />
      </NavOptionsContainer>
    </NavContainer>
  );
};

const AdminPanel = ({ gardenDetails, refetch }: AdminPanelProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selection, setSelection] = useState<string>(PanelSections.description);

  const toggleModal = (): void => {
    setShowModal(!showModal);
  };

  const setSelected = (selection: string) => {
    setSelection(PanelSections[selection] || PanelSections.chat);
  };

  return (
    <AdminPanelWrapper>
      <StyledPurpleButton onClick={toggleModal}>
        <Icon name={IconName.admin} size={20} />
        Admin
      </StyledPurpleButton>
      <BaseModal width={'1200px'} isOpen={showModal} toggleModal={toggleModal}>
        <ModalContainer>
          <AdminPanelNav selected={selection} clickHandler={setSelected} />
          <PanelContainer>
            <PanelHeader>
              <GardenSymbolWrapper>
                <GardenSymbol src={gardenDetails.nft?.image || '/community_logo_pink.svg'} />
              </GardenSymbolWrapper>
              <GardenName>{gardenDetails.name}</GardenName>
            </PanelHeader>
            <PanelContent>
              {selection === PanelSections.members && <MembersPanel gardenDetails={gardenDetails} />}
              {selection === PanelSections.params && <ParamsPanel gardenDetails={gardenDetails} refetch={refetch} />}
              {selection === PanelSections.chat && <ChatPanel gardenDetails={gardenDetails} refetch={refetch} />}
              {selection === PanelSections.permissions && (
                <PermissionsPanel refetch={refetch} gardenDetails={gardenDetails} />
              )}
              {selection === PanelSections.creators && (
                <CreatorsPanel gardenDetails={gardenDetails} refetch={refetch} />
              )}
              {gardenDetails.nft && selection === PanelSections.description && (
                <DescriptionPanel
                  gardenAddress={gardenDetails.address}
                  seed={gardenDetails.seed}
                  gardenNFT={gardenDetails.nft}
                  refetch={refetch}
                />
              )}
            </PanelContent>
          </PanelContainer>
        </ModalContainer>
      </BaseModal>
    </AdminPanelWrapper>
  );
};

const AdminPanelWrapper = styled.div``;

const AdminPanelHeader = styled.div`
  width: 100%;
  font-size: 24px;
  font-family: cera-medium;
  padding-left: 20px;
`;

const NavOptionsContainer = styled.div`
  margin-top: 60px;
`;

const NavOptionsWrapper = styled.div``;

const NavContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  min-width: 300px;
  width: 300px;
  min-height: 1020px;
  margin: -20px 0px;
  padding: 40px 20px 20px 0;
  border-right: 1px solid var(--border-blue);
`;

const NavItem = styled.div<{ active: boolean }>`
  padding: 10px;
  color: var(--white);
  display: flex;
  flex-flow: row nowrap;
  background-color: ${(p) => (p.active ? 'var(--blue-06)' : 'inherit')};
  ${(p) => (!p.active ? '&:hover { cursor: pointer; background-color: var(--blue-07) }' : '')}
`;

const NavItemName = styled.span`
  color: var(--white);
  font-size: 16px;
  padding-left: 10px;
`;

const PanelContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 20px;
  width: 100%;
`;

const PanelContent = styled.div`
  margin-top: 65px;
  width: 100%;
`;

const PanelHeader = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

const ModalContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

const StyledPurpleButton = styled(PurpleButton)`
  height: 25px;

  > span {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: flex-start;
    font-size: 16px;

    svg {
      margin-right: 4px;
    }
  }
`;

const GardenSymbol = styled.img`
  width: 40px;
  height: 40px;
  position: relative;
  overflow: hidden;
  border: 2px solid var(--blue-06);
  border-radius: 2px;
`;

const GardenSymbolWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
`;

const GardenName = styled.div`
  font-family: cera-medium;
  font-size: 18px;
  display: flex;
  flex-flow: column nowrap;
  padding: 0 20px;
  justify-content: center;
  height: 100%;
`;

export default React.memo(AdminPanel);
