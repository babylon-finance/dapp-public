import React from 'react';
import { components } from 'react-select';
import styled from 'styled-components';
import { getIconName, getOperations, OperationKind, OperationBase } from 'models/Strategies';
import { Dropdown, OperationIcon } from 'components/shared';

const { Option, SingleValue } = components;

const OperationDropdownRow = (props: any) => {
  const iconName = getIconName(props.value);
  return (
    <Option {...props}>
      <OperationOptionWrapper>
        <OperationIcon size={28} name={iconName} />
        <OperationLabel>{props.label}</OperationLabel>
      </OperationOptionWrapper>
    </Option>
  );
};

const SelectedOperationDisplay = (props: any) => {
  const iconName = getIconName(props.data.value);
  return (
    <SingleValue {...props}>
      <OperationOptionWrapper>
        <OperationIcon size={28} name={iconName} />
        <OperationLabel>{props.data.label}</OperationLabel>
      </OperationOptionWrapper>
    </SingleValue>
  );
};

interface OperationSelectorProps {
  name: string;
  stateCallback: any;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  value?: OperationKind;
  availableOperations: number[];
}

interface DropdownItem {
  value: OperationKind;
  label: string;
}

const OperationSelector = ({
  disabled,
  availableOperations,
  required,
  name,
  className,
  value,
  stateCallback,
}: OperationSelectorProps) => {
  const getOperationOptions = (): DropdownItem[] => {
    const strategies = getOperations();
    return strategies
      .filter((strat) => availableOperations.indexOf(strat.kind) >= 0)
      .map((strat: OperationBase) => {
        return { value: strat.kind, label: strat.title, isDisabled: strat.kind > 5 };
      });
  };

  return (
    <OperationSelectorWrapper className={className}>
      <Dropdown
        options={getOperationOptions()}
        stateCallback={stateCallback}
        required={required}
        disabled={disabled}
        isSearchable={false}
        label={'Operation type'}
        components={{
          Option: OperationDropdownRow,
          SingleValue: SelectedOperationDisplay,
        }}
        preselectedOptions={value ? [value] : null}
        name={name}
      />
    </OperationSelectorWrapper>
  );
};

const OperationSelectorWrapper = styled.div`
  min-width: 336px;
`;

const OperationOptionWrapper = styled.div`
  padding: 9px 0px;
  display: inline-flex;
  width: 100%;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-content: center;
  font-size: 16px;
  color: white;
`;

const OperationLabel = styled.div`
  font-weight: 400;
  font-size: 16px;
  min-width: 180px;
  width: 100%;
  text-align: left;
  margin-left: 8px;
  align-items: center;
  display: flex;
`;

export default React.memo(OperationSelector);
