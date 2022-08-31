import React from 'react';
import styled from 'styled-components';
import 'react-toggle/style.css';
import { Checkbox } from 'rimble-ui';
import { HoverTooltip } from 'components/shared/';

interface CheckboxInput {
  name: string;
  defaultChecked?: boolean;
  onChange(e: React.ChangeEvent<any>): void;
  label?: string;
  color?: string;
  tooltip?: string;
  checked?: boolean;
  disabled?: boolean;
}

const CheckboxInput = (props: CheckboxInput) => (
  <TextInputWrapper>
    <InsideWrapper>
      <StyledToggleCheckbox
        name={props.name}
        color={props.color || 'primary'}
        checked={props.checked}
        defaultChecked={props.defaultChecked}
        onChange={props.onChange}
      />
      {props.label && (
        <ActionItemLabelWrapper>
          <span>{props.label}</span>
          {props.tooltip && <HoverTooltip content={props.tooltip} placement={'up'} />}
        </ActionItemLabelWrapper>
      )}
    </InsideWrapper>
  </TextInputWrapper>
);

const TextInputWrapper = styled.div`
  margin: 10px 0;
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
`;

const StyledToggleCheckbox = styled(Checkbox)`
  outline: none;

  input:focus {
    outline: none;
  }
`;

export default React.memo(CheckboxInput);
