import { Icon, ProtocolIcon, TurquoiseButton } from 'components/shared';
import { BREAKPOINTS } from 'config';
import { RoutesExternal } from 'constants/Routes';
import { IconName } from 'models';

import React from 'react';
import styled from 'styled-components';

const ICON_SIZE = 90;

const DefiProtocols = () => {
  return (
    <DefiWrapper>
      <DefiTitle>Integrations</DefiTitle>
      <DefiSubtext>
        Babylon integrates with all major DeFi protocols so Gardens can take advantage of constantly changing market
        conditions.
      </DefiSubtext>
      <DefiIcons>
        <ProtocolIcon large name="aave" size={ICON_SIZE} />
        <ProtocolIcon large name="curve" size={ICON_SIZE} />
        <ProtocolIcon large name="convex" size={ICON_SIZE} />
        <ProtocolIcon large name="yearn" size={ICON_SIZE} />
        <ProtocolIcon large name="uniswap" size={ICON_SIZE} />
        <ProtocolIcon large name="lido" size={ICON_SIZE} />
        <ProtocolIcon large name="compound" size={ICON_SIZE} />
        <ProtocolIcon large name="balancer" size={ICON_SIZE} />
      </DefiIcons>
      <LinkWrapper>
        <StyledButton inverted onClick={() => window.open(RoutesExternal.docsIntegrations, '_blank', 'noopener')}>
          <ButtonLabel>
            <ButtonIconWrapper>
              <Icon name={IconName.book} />
            </ButtonIconWrapper>
            <LabelSpan>Read more about integrations</LabelSpan>
          </ButtonLabel>
        </StyledButton>
      </LinkWrapper>
    </DefiWrapper>
  );
};

const DefiWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  height: auto;
  width: 100%;
  justify-content: flex-start;
  padding: 100px 60px;
  align-items: center;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding: 50px 0;
  }
`;

const DefiSubtext = styled.div`
  font-size: 22px;
  width: 100%;
  text-align: center;
  padding: 20px 0 60px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    font-size: 18px;
  }
`;

const DefiTitle = styled.div`
  font-family: cera-bold;
  font-size: 44px;
  text-align: center;
  width: 100%;
  margin-bottom: 30px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    font-size: 28px;
    text-align: center;
    line-height: 36px;
  }
`;

const DefiIcons = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;

  > div {
    padding: 0 10px;
  }
`;

const StyledButton = styled(TurquoiseButton)`
  width: 100%;
`;

const ButtonIconWrapper = styled.div`
  padding-right: 6px;
`;

const ButtonLabel = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

const LabelSpan = styled.span`
  padding-top: 4px;
`;

const LinkWrapper = styled.div`
  padding: 60px 0 70px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 20px 0 0 0;
    width: 100%;
  }
`;

export default React.memo(DefiProtocols);
