import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import styled from 'styled-components';
import { HoverTooltip } from 'components/shared';
import { customStyles } from './styles';

interface Option {
  value: any;
  label: string;
  data?: any;
}

interface DropdownProps {
  name: string;
  stateCallback: any;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  isSearchable?: boolean;
  isMulti?: boolean;
  tooltip?: string;
  label?: string;
  className?: string;
  components?: any;
  preselectedOptions?: any[] | null;
}

const Dropdown = ({
  name,
  label,
  tooltip,
  disabled,
  required,
  options,
  components,
  className,
  preselectedOptions,
  isMulti = false,
  isSearchable = true,
  stateCallback,
}: DropdownProps) => {
  const [selectedValues, setSelectedValues] = useState<any[] | undefined | null>(preselectedOptions);

  const handleSelect = (selectedOptions: any) => {
    setSelectedValues(selectedOptions);
    stateCallback(selectedOptions);
  };

  useEffect(() => {
    if (!preselectedOptions) {
      setSelectedValues(null);
    }
  }, [preselectedOptions]);
  return (
    <DropdownWrapper className={className}>
      <ActionItemLabelWrapper>
        <span>{label}</span>
        {tooltip && <HoverTooltip content={tooltip} placement={'up'} />}
      </ActionItemLabelWrapper>
      <Select
        options={options}
        name={name}
        components={components}
        styles={customStyles}
        isMulti={isMulti}
        value={selectedValues}
        isOptionDisabled={(option: any) => option.isDisabled}
        isSearchable={isSearchable}
        isDisabled={disabled}
        required={required}
        onChange={(selectedOptions: any) => {
          handleSelect(selectedOptions);
        }}
        placeholder={isMulti ? 'Select options' : 'Select an option'}
      />
    </DropdownWrapper>
  );
};

const DropdownWrapper = styled.div`
  min-width: 336px;
  width: 100%;
`;

const ActionItemLabelWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  font-size: 15px;
  font-family: cera-medium;
  margin-bottom: 8px;
  width: 100%;
`;

export default React.memo(Dropdown);
