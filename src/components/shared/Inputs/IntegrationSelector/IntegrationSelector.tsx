import React from 'react';
import { components } from 'react-select';
import styled from 'styled-components';
import { OperationKind } from 'models/';
import { integrationsGroupedByKey, Integration, getIntegrationByAddress } from 'models/Integrations';
import { Dropdown, ProtocolIcon, TextInput } from 'components/shared';
import { isAddress } from '@ethersproject/address';
import { ZERO_ADDRESS } from 'config';

const { Option, SingleValue } = components;

const IntegrationDropdownRow = (props: any) => {
  const iconName = getIntegrationByAddress(props.data.value)?.iconName as string;
  return (
    <Option {...props}>
      <IntegrationOptionWrapper>
        <ProtocolIcon size={28} name={iconName} />
        <IntegrationLabel>{props.data.label}</IntegrationLabel>
      </IntegrationOptionWrapper>
    </Option>
  );
};

const SelectedIntegrationDisplay = (props: any) => {
  const iconName = getIntegrationByAddress(props.data.value)?.iconName as string;
  return (
    <SingleValue {...props}>
      <IntegrationOptionWrapper>
        <ProtocolIcon size={28} name={iconName} />
        <IntegrationLabel>{props.data.label}</IntegrationLabel>
      </IntegrationOptionWrapper>
    </SingleValue>
  );
};

interface IntegrationSelectorProps {
  name: string;
  operation: OperationKind | undefined;
  stateCallback: any;
  availableIntegrations: string[];
  required?: boolean;
  disabled?: boolean;
  value?: string;
  className?: string;
}

interface DropdownItem {
  value: string;
  label: string;
}

const IntegrationSelector = ({
  disabled,
  operation,
  required,
  className,
  availableIntegrations,
  value,
  stateCallback,
}: IntegrationSelectorProps) => {
  function getIntegrationOptions(): DropdownItem[] {
    if (operation == undefined) {
      return [];
    }
    const integrations = integrationsGroupedByKey('type')[operation.toString()];
    if (!integrations) {
      return [];
    }
    return integrations
      .filter((integration: Integration) => availableIntegrations.indexOf(integration.name) >= 0)
      .map((integration: Integration) => {
        return {
          value: integration.address,
          label: integration.displayName,
        };
      });
  }
  return (
    <IntegrationSelectorWrapper className={className}>
      {operation === 5 && (
        <TextInput
          value={value || ZERO_ADDRESS}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            stateCallback(e.currentTarget);
          }}
          name={'integration-selector'}
          label={'Integration Address'}
          width={'200px'}
          placeholder="0x...."
          required
          tooltip={'The address of your deployed contract.'}
          valid={isAddress(value || ZERO_ADDRESS) && value !== ZERO_ADDRESS}
        />
      )}
      {operation !== 5 && (
        <Dropdown
          options={getIntegrationOptions()}
          stateCallback={stateCallback}
          required={required}
          disabled={disabled}
          isSearchable={false}
          components={{
            Option: IntegrationDropdownRow,
            SingleValue: SelectedIntegrationDisplay,
          }}
          label={'Protocol'}
          preselectedOptions={value ? getIntegrationOptions().filter((p) => p.value === value) : null}
          name={'integration-selector'}
        />
      )}
    </IntegrationSelectorWrapper>
  );
};

const IntegrationSelectorWrapper = styled.div`
  min-width: 336px;
`;

const IntegrationOptionWrapper = styled.div`
  padding: 9px 0px;
  display: inline-flex;
  width: 100%;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-content: center;
  font-size: 16px;
  color: white;
`;

const IntegrationLabel = styled.div`
  font-weight: 400;
  font-size: 16px;
  min-width: 180px;
  width: 100%;
  text-align: left;
  margin-left: 8px;
  align-items: center;
  display: flex;
`;

export default React.memo(IntegrationSelector);
