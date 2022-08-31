import { TokenDisplay } from 'components/shared';

import { BREAKPOINTS } from 'config';
import { Token } from 'models';

import styled from 'styled-components';
import React from 'react';
import { isMobile } from 'react-device-detect';

interface MetricCardProps {
  bgColor?: string;
  altButtons?: React.ReactNode | undefined;
  buttons: React.ReactNode | undefined;
  children: React.ReactNode;
  label: string;
  labelTip?: React.ReactNode;
  token?: Token;
}

const MetricCard = ({ altButtons, bgColor, buttons, children, label, labelTip, token }: MetricCardProps) => {
  return (
    <CardContainer bgColor={bgColor}>
      <InnerContainer>
        <CardTitle>
          <span>{label}</span>
          {token && <TokenDisplay token={token} size={isMobile ? 20 : 24} symbol={false} />}
        </CardTitle>
        <CardContent>{children}</CardContent>
      </InnerContainer>
      {buttons && (
        <CardActions>
          {altButtons && <AltActions>{altButtons}</AltActions>}
          {buttons}
        </CardActions>
      )}
    </CardContainer>
  );
};

const CardTitle = styled.div`
  color: var(--white);
  display: flex;
  flex-flow: column nowrap;
  flex-flow: row nowrap;
  font-family: cera-bold;
  font-size: 18px;
  justify-content: flex-start;
  margin-bottom: 20px;
  width: 100%;

  > span {
    margin-right: 10px;
    font-family: cera-bold;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    margin-bottom: 12px;
  }
`;

const CardContent = styled.div`
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const AltActions = styled.div`
  margin-right: auto;
  max-width: 300px;

  span {
    font-family: cera-medium;
  }
`;

const CardActions = styled.div`
  align-items: center;
  border-top: 1px solid var(--border-blue);
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  margin-top: auto;
  padding: 0 20px 0;
  width: 100%;
  min-height: 70px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 20px;
    min-width: auto;
    width: 100%;
    flex-flow: column nowrap;
    justify-content: flex-end;
    align-items: center;

    > div {
      margin-bottom: 6px;
    }
  }
`;

const InnerContainer = styled.div`
  height: 100%;
  padding: 30px;
  width: 100%;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 20px;
  }
`;

const CardContainer = styled.div<{ bgColor?: string }>`
  background-color: ${(p) => (p.bgColor ? p.bgColor : 'var(--purple)')};
  border-radius: 4px;
  display: flex;
  flex-flow: column nowrap;
  min-height: 250px;
  min-width: 400px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    min-width: auto;
    width: 100%;
  }
`;

export default React.memo(MetricCard);
