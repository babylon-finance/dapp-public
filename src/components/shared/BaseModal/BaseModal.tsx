import { Button, Modal, Card } from 'rimble-ui';
import React from 'react';
import styled from 'styled-components';

interface BaseModalProps {
  header?: string;
  children: React.ReactNode;
  width: string;
  isOpen: boolean;
  className?: string;
  hideClose?: boolean;
  toggleModal?: () => void;
}

function BaseModal({ children, header, width, isOpen, hideClose, toggleModal, className }: BaseModalProps) {
  const closeModal = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (toggleModal) {
      toggleModal();
    }
  };
  return (
    <StyledModal width={width} autoFocus={false} isOpen={isOpen} className={className}>
      <ModalCard width={width} p={0}>
        {!hideClose && (
          <StyledCloseButton
            icononly
            icon={'Close'}
            position={'absolute'}
            top={0}
            right={0}
            mt={3}
            mr={3}
            onClick={closeModal}
          />
        )}
        {header && <ModalHeadingRow>{header}</ModalHeadingRow>}
        <ModalContentWrapper>{children}</ModalContentWrapper>
      </ModalCard>
    </StyledModal>
  );
}

const StyledModal = styled(Modal)``;

const ModalHeadingRow = styled.div`
  font-size: 24px;
  font-family: cera-medium;
  color: var(--white);
  margin-bottom: 50px;
  width: 100%;
`;

const ModalCard = styled(Card)<{ width: string }>`
  color: var(--white);
  overflow-x: hidden;
  overflow-y: auto;
  height: auto;
  max-height: 90vh;
  width: ${(p) => `${p.width}`};
  background-color: var(--modal-blue);
  border: 1px solid rgb(196, 196, 196, 0.15);
  padding: 20px;
`;

const StyledCloseButton = styled(Button.Text)`
  color: var(--white);
  z-index: 1;
`;

const ModalContentWrapper = styled.div`
  font-family: cera-regular;
`;

export default React.memo(BaseModal);
