import React from 'react';
import styled from 'styled-components';
import { HoverTooltip } from 'components/shared/';

interface TextAreaProps {
  name: string;
  value: string;
  onChange(e: React.ChangeEvent<HTMLTextAreaElement>): void;
  valid: boolean;
  rows: number;
  height?: string;
  lineHeight?: number;
  fontSize?: string;
  label?: string;
  width?: string;
  placeholder?: string;
  required?: boolean;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}

const TextArea = (props: TextAreaProps) => (
  <TextAreaWrapper className={props.className || ''}>
    <ActionItemLabelWrapper>
      <span>{props.label}</span>
      {props.tooltip && <HoverTooltip content={props.tooltip} placement={'up'} />}
    </ActionItemLabelWrapper>
    <InsideWrapper height={props.height || 'auto'}>
      <StyledTextArea
        valid={props.valid}
        rows={props.rows}
        required={props.required || false}
        fontSize={props.fontSize || '16px'}
        placeholder={props.placeholder}
        disabled={props.disabled}
        width={props.width || 'auto'}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          if (e.target.value || e.target.value === '') {
            props.onChange(e);
          }
        }}
        name={props.name}
        value={props.value || ''}
      />
    </InsideWrapper>
  </TextAreaWrapper>
);

const TextAreaWrapper = styled.div`
  margin: 10px 0;
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
`;

const InsideWrapper = styled.div<{ height: string }>`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-end;
  height: ${(props) => props.height};
  width: auto;
`;

const ActionItemLabelWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  font-size: 14px;
  color: white;
  font-weight: 700;
  margin-bottom: 5px;
`;

const StyledTextArea = styled.textarea<{ width: string; fontSize: string; valid: boolean }>`
  width: ${(props) => (props.width ? `${props.width}` : '100%')};
  background: none;
  box-shadow: none;
  resize: none;
  margin: 0;
  padding: 16px;
  height: 100%;
  font-size: ${(props) => (props.fontSize ? `${props.fontSize}` : '16px')};
  color: ${(props) => (props.valid ? 'var(--purple-aux)' : 'var(--negative)')};
  font-family: cera-bold;
  border: 2px solid var(--blue-05);
  border-radius: 2px;
  width: 100%;

  &:focus {
    border: 2px solid var(--blue-03);
    outline: none;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:hover {
    box-shadow: none;
  }

  &::placeholder {
    color: var(--purple-aux);
  }
`;

export default React.memo(TextArea);
