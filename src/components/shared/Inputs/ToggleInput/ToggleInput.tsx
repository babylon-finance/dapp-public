import React from 'react';
import styled from 'styled-components';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

import { HoverTooltip } from 'components/shared/';

interface ToggleInputProps {
  name: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange(e: React.ChangeEvent<any>): void;
  label?: string;
  tooltip?: string;
  disabled?: boolean;
  required?: boolean;
  margins?: number;
}

const ToggleInput = (props: ToggleInputProps) => (
  <TextInputWrapper margins={props.margins}>
    <InsideWrapper>
      <StyledToggleInput
        name={props.name}
        checked={props.checked}
        defaultChecked={props.defaultChecked}
        icons={false}
        disabled={props.disabled}
        onChange={props.onChange}
      />
      {props.label && (
        <ActionItemLabelWrapper>
          <div>{props.label}</div>
          {props.tooltip && <HoverTooltip content={props.tooltip} placement={'up'} />}
        </ActionItemLabelWrapper>
      )}
    </InsideWrapper>
  </TextInputWrapper>
);

const TextInputWrapper = styled.div<{ margins: number | undefined }>`
  margin: ${(p) => p.margins}px 0;
  display: flex;
  flex-flow: column nowrap;
`;

const InsideWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  height: auto;
  width: auto;
`;

const ActionItemLabelWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  color: 14px;
  font-weight: 700;
  width: auto;
  font-size: 16px;
  align-items: center;
`;

const StyledToggleInput = styled(Toggle)`
  margin-right: 20px;
  width: 40px;
  .react-toggle-track {
    background: var(--purple);
  }

  &.react-toggle--checked:hover:not(.react-toggle--disabled) .react-toggle-track {
    background-color: var(--primary);
  }

  &.react-toggle:hover:not(.react-toggle--disabled) .react-toggle-track {
    background-color: var(--primary);
  }

  &.react-toggle--checked .react-toggle-track {
    background: var(--turquoise-01);
  }
`;

export default React.memo(ToggleInput);
