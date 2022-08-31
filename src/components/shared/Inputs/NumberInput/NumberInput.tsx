import React from 'react';
import styled from 'styled-components';
import { Input, Field } from 'rimble-ui';
import { HoverTooltip } from 'components/shared/';

interface NumberInputProps {
  name: string;
  value: number;
  onChange?(e: React.ChangeEvent<HTMLInputElement>): void;
  valid?: boolean;
  warn?: boolean;
  label?: string;
  width?: string;
  required?: boolean;
  preSpan?: string;
  tooltip?: string;
  postSpan?: string;
  className?: string;
  step?: string;
  noDecimals?: boolean;
  min?: string;
  max?: string;
  innerRef?: any;
  disabled?: boolean;
  style?: any;
}

const NumberInput = (props: NumberInputProps) => {
  const valueWithEmpty = props.value === 0 ? '' : props.value;
  return (
    <NumberInputWrapper className={props.className}>
      <ActionItemLabelWrapper>
        <span>{props.label}</span>
        {props.tooltip && <HoverTooltip content={props.tooltip} placement={'up'} />}
      </ActionItemLabelWrapper>
      <InsideWrapper>
        {props.preSpan && <InputSpanBefore disabled={props.disabled}>{props.preSpan}</InputSpanBefore>}
        <StyledBaseField label={''} required={props.required}>
          <StyledNumberInput
            valid={props.valid}
            warn={props.warn}
            type="number"
            required={true}
            style={props.style}
            disabled={props.disabled}
            width={props.width}
            step={props.step || '0.1'}
            min={props.min || '0'}
            ref={props.innerRef}
            max={props.max}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if ((Number(e.target.value) >= 0 || e.target.value === '') && e.target.value.length < 10) {
                if (props.noDecimals) {
                  e.target.value = e.target.value.split('.')[0];
                }
                if (props.onChange) {
                  props.onChange(e);
                }
              }
            }}
            name={props.name}
            value={valueWithEmpty}
          />
        </StyledBaseField>
        {props.postSpan && <InputSpanAfter disabled={props.disabled}>{props.postSpan}</InputSpanAfter>}
      </InsideWrapper>
    </NumberInputWrapper>
  );
};

const NumberInputWrapper = styled.div`
  margin: 10px 0;
`;

const InsideWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  height: 40px;
  width: auto;
`;

const ActionItemLabelWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: 14px;
  font-weight: 700;
`;

const InputSpanBefore = styled.div<{ disabled?: boolean }>`
  height: 100%;
  font-size: 28px;
  color: var(--white);
  font-family: cera-bold;
  border-bottom: 1px solid #6c679d;
  padding-right: 16px;
  opacity: ${(props) => (props.disabled ? `0.4` : '1.0')};
`;

const InputSpanAfter = styled.div<{ disabled?: boolean }>`
  height: 100%;
  font-size: 15px;
  color: var(--blue-03);
  font-family: cera-bold;
  border-bottom: 1px solid #6c679d;
  display: inline-flex;
  align-items: center;
  opacity: ${(props) => (props.disabled ? `0.4` : '1.0')};
`;

const StyledBaseField = styled(Field)`
  margin: 0;
  width: ${(props) => (props.width ? `${props.width}` : '100%')};
`;

const StyledNumberInput = styled(Input)`
  width: ${(props) => (props.width ? `${props.width}` : '100%')};
  background: none;
  box-shadow: none;
  margin: 0;
  border: none;
  border-radius: 0;
  padding-left: 0;
  font-size: 30px;
  color: ${(props) => (props.valid ? 'var(--purple-aux)' : 'var(--negative)')};
  font-family: cera-medium;
  border-bottom: 1px solid #6c679d;

  &:focus {
    border-bottom: 1px solid #6c679d;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:hover {
    box-shadow: none;
  }

  label {
    width: ${(props) => (props.width ? `${props.width}` : '100%')};
  }
`;

export default React.memo(NumberInput);
