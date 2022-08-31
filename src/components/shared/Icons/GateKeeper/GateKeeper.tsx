import GateKeeperIcon from './gate_keeper.svg';

import React from 'react';
import styled from 'styled-components';

interface GateKeeperProps {
  size?: number;
  text?: string;
  pt?: number; // padding-top
  pb?: number; // padding-bottom
}

const GateKeeper = ({ size = 100, text, pt = 40, pb = 40 }: GateKeeperProps) => {
  return (
    <GateKeeperImageWrapper pt={pt} pb={pb}>
      <img alt="gate-keeper-img" src={GateKeeperIcon} height={size} />
      <ImageText>{text}</ImageText>
    </GateKeeperImageWrapper>
  );
};

const GateKeeperImageWrapper = styled.div<{ pb: number | undefined; pt: number | undefined }>`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  padding-top: ${(p) => p.pt}px;
  padding-bottom: ${(p) => p.pb}px;
`;

const ImageText = styled.div`
  padding-top: 25px;
  color: var(--white);
  font-size: 22px;
  text-align: center;
`;

export default React.memo(GateKeeper);
