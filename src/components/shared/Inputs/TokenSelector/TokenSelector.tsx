import { TokenDisplay, HoverTooltip } from 'components/shared';

import TokenListService from 'services/TokenListService';
import { customStyles } from '../Dropdown/styles';
import { Token } from 'models';

import WindowedSelect from 'react-windowed-select';
import { components } from 'react-select';
import styled from 'styled-components';
import React, { useEffect, useState } from 'react';

const { Option, MultiValueLabel, SingleValue } = components;

const TokenSelectRow = (props: any) => {
  return (
    <Option {...props}>
      <TokenOptionWrapper>
        <TokenDisplayWrapper>
          <TokenDisplay size={28} token={props.data.data as Token} />
        </TokenDisplayWrapper>
        <TokenLabel>{props.label}</TokenLabel>
      </TokenOptionWrapper>
    </Option>
  );
};

const SingleValueWrapper = (props: any) => {
  return (
    <SingleValue {...props}>
      <TokenDisplay size={22} token={props.data.data as Token} />
    </SingleValue>
  );
};

const MultiSelectedTokenLabel = (props: any) => {
  return (
    <MultiValueLabel {...props}>
      <TokenDisplay size={22} token={props.data.data as Token} />
    </MultiValueLabel>
  );
};

interface Selection {
  value: string;
  label: string;
  data: Token;
}

interface TokenSelectorProps {
  name: string;
  stateCallback: any;
  required?: boolean;
  disabled?: boolean;
  isMulti?: boolean;
  options?: Token[];
  filterAddresses?: string[];
  filterSymbols?: string[];
  tooltip?: string;
  label?: string;
  className?: string;
  preselectedAddresses?: string[];
  maxTokens?: number;
  onlySwappable?: boolean;
  includeUniV2?: boolean;
}

const TokenSelector = ({
  name,
  label,
  tooltip,
  className,
  disabled,
  required,
  options,
  preselectedAddresses = [],
  filterAddresses = [],
  filterSymbols = [],
  isMulti = false,
  stateCallback,
  maxTokens = 2,
  onlySwappable = false,
  includeUniV2 = false,
}: TokenSelectorProps) => {
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [tokenOptions, setTokenOptions] = useState<Token[] | undefined>(options);
  const [selectedValues, setSelectedValues] = useState<Selection | undefined>();

  const tokenListService = TokenListService.getInstance();
  const defaultList = tokenListService.getTokenList();

  useEffect(() => {
    const getTokenList = () => {
      if (!options && initialLoad && defaultList) {
        let filtered = defaultList;

        if (onlySwappable) {
          filtered = filtered.filter((t) => t.swappable === true);
        }

        if (!includeUniV2) {
          filtered = filtered.filter((t) => t.integration !== 'uniV2');
        }

        setTokenOptions(filtered);
      }

      if (preselectedAddresses) {
        const selectedToken = tokenListService.getTokenByAddress(preselectedAddresses[0] || '');

        if (selectedToken) {
          setSelectedValues(constructTokenOption(selectedToken));
        }
      }
    };

    getTokenList();

    setLoading(false);
    setInitialLoad(false);
  }, [initialLoad]);

  const constructTokenOption = (t: Token): Selection => {
    return { value: t.symbol, label: t.name, data: t };
  };

  const handleSelect = (selectedTokens: any) => {
    setSelectedValues(selectedTokens);
    const addresses = selectedTokens.map(
      (token: any) => tokenListService.getTokenBySymbol(token.value.toString())?.address,
    );

    stateCallback(addresses.sort());
  };

  return (
    <TokenSelectorWrapper className={className}>
      <ActionItemLabelWrapper>
        <span>{label || 'Assets'}</span>
        {tooltip && <HoverTooltip content={tooltip} placement={'up'} />}
      </ActionItemLabelWrapper>
      {tokenOptions && !loading && (
        <WindowedSelect
          options={tokenOptions
            .filter((t: Token) => t.address !== '0x0000000000000000000000000000000000000000')
            .filter((t: Token) => !filterAddresses.find((f: string) => f.toLowerCase() === t.address.toLowerCase()))
            .filter((t: Token) => !filterSymbols.includes(t.symbol))
            .map(constructTokenOption)}
          name={name}
          styles={customStyles}
          components={{
            Option: TokenSelectRow,
            MultiValueLabel: MultiSelectedTokenLabel,
            SingleValue: SingleValueWrapper,
          }}
          isMulti={isMulti}
          value={selectedValues}
          isDisabled={disabled || loading}
          required={required}
          onChange={(selectedTokens: any) => {
            if (Array.isArray(selectedTokens)) {
              if (selectedTokens.length <= maxTokens) {
                handleSelect(selectedTokens);
              }
            } else {
              handleSelect([selectedTokens]);
            }
          }}
          isSearchable
          placeholder={isMulti ? 'Select one or more assets' : 'Select an asset'}
        />
      )}
    </TokenSelectorWrapper>
  );
};

const TokenSelectorWrapper = styled.div`
  min-width: 336px;

  > div {
    z-index: 3;
  }
`;

const ActionItemLabelWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: 15px;
  font-weight: 400;
  margin-bottom: 8px;
`;

const TokenOptionWrapper = styled.div`
  padding: 9px 0px;
  display: inline-flex;
  width: 100%;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-content: center;
  font-size: 16px;
  color: var(--white);
`;

const TokenDisplayWrapper = styled.div`
  display: flex;
  width: 20%;
  min-width: 150px;
  overflow: hidden;
`;

const TokenLabel = styled.div`
  font-weight: 400;
  font-size: 16px;
  min-width: 180px;
  width: 100%;
  display: inline-flex;
  text-align: left;
`;

export default React.memo(TokenSelector);
