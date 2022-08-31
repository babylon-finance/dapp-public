import { GateKeeper } from '../Icons';
import { TurquoiseButton } from 'components/shared';

import { useW3Context } from 'context/W3Provider';

import styled from 'styled-components';
import React from 'react';

interface NoAccessProps {
  maintenance?: boolean;
  noAdmin?: boolean;
  custom?: string;
  center?: boolean;
}

const CONNECT_TEXT = 'Connect your wallet to see if you can access this page.';
const NO_PERMISSION = 'Sorry, you do not have access. Beta is invite only.';
const UNDER_MAINTENANCE = 'Sorry, the app is under maintenance. Babylon will be back soon.';
const NO_ADMIN = 'Sorry, we could not find the page you were looking for.';

const NoAccess = ({ maintenance, noAdmin, custom, center = true }: NoAccessProps) => {
  const { address, connect } = useW3Context();

  let text = !address ? CONNECT_TEXT : NO_PERMISSION;
  if (noAdmin) {
    text = NO_ADMIN;
  }
  if (maintenance) {
    text = UNDER_MAINTENANCE;
  }
  return (
    <StyledNoAccess center={center}>
      <ContentWrapper>
        <GateKeeper text={custom ? custom : text} size={200} />
        {address === undefined && !maintenance && <TurquoiseButton onClick={connect}>Connect Wallet</TurquoiseButton>}
      </ContentWrapper>
    </StyledNoAccess>
  );
};

const StyledNoAccess = styled.div<{ center: boolean }>`
  height: ${(p) => (p.center ? '75vh' : '300px')};
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
`;

const ContentWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
`;

export default React.memo(NoAccess);
