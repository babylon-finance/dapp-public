import React from 'react';
import styled from 'styled-components';
import { Input, Field } from 'rimble-ui';
import { HoverTooltip, GardenTokenIcon } from 'components/shared/';

interface TextInputProps {
  name: string;
  value: string;
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
  valid: boolean;
  label?: string;
  height?: string;
  width?: string;
  fontSize?: string;
  placeholder?: string;
  required?: boolean;
  gardenIcon?: boolean;
  preSpan?: string;
  type?: string;
  tooltip?: string;
  postSpan?: string;
  disabled?: boolean;
  className?: string;
}

const TextInput = (props: TextInputProps) => (
  <TextInputWrapper className={props.className}>
    <ActionItemLabelWrapper>
      <span>{props.label}</span>
      {props.tooltip && <HoverTooltip content={props.tooltip} placement={'up'} />}
    </ActionItemLabelWrapper>
    <InsideWrapper height={props.height}>
      {props.gardenIcon && <StyledGardenIcon size={24} />}
      {props.preSpan && <InputSpanBefore>{props.preSpan}</InputSpanBefore>}
      <StyledBaseField label={''} required={props.label && props.required}>
        <StyledTextInput
          gardenIcon={props.gardenIcon}
          className="styled-text-input"
          valid={props.valid}
          type={props.type || 'text'}
          required={props.required}
          placeholder={props.placeholder}
          fontSize={props.fontSize}
          disabled={props.disabled}
          width={props.width}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.value || e.target.value === '') {
              props.onChange(e);
            }
          }}
          name={props.name}
          value={props.value || ''}
        />
      </StyledBaseField>
      {props.postSpan && <InputSpanAfter>{props.postSpan}</InputSpanAfter>}
    </InsideWrapper>
  </TextInputWrapper>
);

const TextInputWrapper = styled.div`
  margin: 10px 0;
  display: flex;
  flex-flow: column nowrap;
`;

const InsideWrapper = styled.div<{ height?: string }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  height: ${(p) => (p.height ? p.height : 'auto')};
  width: auto;
`;

const ActionItemLabelWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
`;

const InputSpanBefore = styled.div`
  height: 100%;
  font-size: 22px;
  color: var(--white);
  font-family: cera-medium;
  border-bottom: 1px solid #6c679d;
  padding-right: 16px;
`;

const StyledGardenIcon = styled(GardenTokenIcon)`
  img {
    position: absolute;
    margin-top: -45px;
    margin-left: 15px;
  }
`;

const InputSpanAfter = styled.div`
  height: 100%;
  font-size: 15px;
  color: var(--blue-03);
  font-family: cera-bold;
  border-bottom: 1px solid #6c679d;
  display: inline-flex;
  align-items: center;
`;

const StyledBaseField = styled(Field)`
  display: flex;
  margin: 0;
  width: ${(props) => (props.width ? `${props.width}` : '100%')};
`;

const StyledTextInput = styled(Input)`
  width: ${(props) => (props.width ? `${props.width}` : '100%')};
  background: none;
  box-shadow: none;
  border: none;
  border-radius: 0;
  padding-left: ${(props) => (props.gardenIcon ? `20px` : '0')};
  font-size: ${(props) => (props.fontSize ? `${props.fontSize}` : '24px')};
  color: ${(props) => (props.valid ? 'var(--white)' : 'var(--negative)')};
  font-family: cera-medium;
  border-bottom: 1px solid #6c679d;
  font-feature-settings: 'pnum' on, 'lnum' on !important;

  &:focus {
    border-bottom: 1px solid #6c679d;
    outline: none;

    &::placeholder {
      color: transparent;
    }
  }

  &::placeholder {
    color: var(--purple-aux);
    opacity: 0.6;
  }

  &:-ms-input-placeholder {
    color: var(--purple-aux);
  }

  &::-ms-input-placeholder {
    color: var(--purple-aux);
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

export default React.memo(TextInput);
