import React from 'react';
import styled from 'styled-components';

import CheckedIcon from './checked.svg';
import UncheckedIcon from './unchecked.svg';

interface CheckmarkDisplayProps {
  label: string;
  value?: boolean;
  size: number;
  inline?: boolean;
}

const CheckmarkDisplay = ({ label, value, size, inline = false }: CheckmarkDisplayProps) => {
  return (
    <CheckmarkDisplayWrapper inline={inline}>
      <CheckmarkImg src={value ? CheckedIcon : UncheckedIcon} width={size} height={size} />
      <CheckmarkText>{label}</CheckmarkText>
    </CheckmarkDisplayWrapper>
  );
};

const CheckmarkDisplayWrapper = styled.div<{ inline: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  width: ${(p) => (p.inline ? 'auto' : '100%')};
`;

const CheckmarkImg = styled.img`
  margin-right: 12px;
`;

const CheckmarkText = styled.div`
  font-size: 14px;
  color: white;
`;

export default React.memo(CheckmarkDisplay);
