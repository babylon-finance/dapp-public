// import { Tooltip, Icon } from 'rimble-ui';
import React from 'react';
import styled from 'styled-components';

export interface RoundOptionProps {
  option: RoundOptionProp;
  setOption: any;
  children: React.ReactNode;
}

export interface RoundOptionProp {
  disabled?: boolean;
  kind: number | string;
  title: string;
  selected: boolean;
  iconBg?: string;
}

const RoundOption = ({ option, setOption, children }: RoundOptionProps) => {
  return (
    <RoundOptionWrapper
      disabled={option.disabled}
      selected={option.selected}
      onClick={() => !option.disabled && setOption(option)}
    >
      <RoundOuterCircle iconBg={option.iconBg}>
        <RoundOptionCircle>{children}</RoundOptionCircle>
      </RoundOuterCircle>
      <RoundOptionName>{option.title}</RoundOptionName>
    </RoundOptionWrapper>
  );
};

const RoundOptionWrapper = styled.div<{ selected: boolean; disabled: boolean | undefined }>`
  display: flex;
  flex-flow: column nowrap;
  padding: 28px 32px;
  margin: 0 48px 0 0;
  cursor: pointer;
  width: 150px;
  margin: 0 48px 24px 0;
  align-items: center;
  opacity: ${(p) => `${p.disabled ? '0.2' : '1'} `};
  background: ${(p) => `${p.selected ? 'var(--blue-01)' : 'transparent'} `};
  font-weight: ${(p) => `${p.selected ? '700' : '400'} `};
  &:hover {
    > div:first-child {
      border: 3px solid ${(p) => `${p.selected || p.disabled ? 'transparent' : 'var(--purple-02)'}`};
    }
  }
`;

const RoundOptionCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 92px;
  height: 92px;
  border-radius: 46px;
  padding: 2px;
  border: 2px solid transparent;
`;

const RoundOuterCircle = styled.div<{ iconBg: string | undefined }>`
  border-radius: 48px;
  border: 3px solid transparent;
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => `${p.iconBg ? p.iconBg : 'transparent'} `};
  padding: 2px;
`;

const RoundOptionName = styled.div`
  font-size: 15px;
  line-height: 20px;
  height: 25px;
  margin-top: 10px;
  text-align: center;
  display: flex;
  justify-content: center;
  width: 100%;
`;

export default React.memo(RoundOption);
