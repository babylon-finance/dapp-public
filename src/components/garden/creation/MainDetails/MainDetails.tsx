import { TokenListService } from 'services';
import { TextInput, TokenSelector, TextArea, TabbedNavigation, Markdown } from 'components/shared/';
import { GardenCreationMainDetails, Tab, Token } from 'models/';
import { tokens } from 'constants/addresses';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface MainDetailsProps {
  address: string;
  details: GardenCreationMainDetails | undefined;
  setGardenDetails: (details: GardenCreationMainDetails, isValid: boolean) => void;
}

const defaultDetails: GardenCreationMainDetails = {
  name: '',
  symbol: '',
  reserveAsset: tokens.DAI,
  description: '',
};

const DESCRIPTION_TABS = [
  { display: 'Edit', metric: undefined, value: Tab.EDIT },
  { display: 'Preview', metric: undefined, value: Tab.PREVIEW },
];

const MainDetails = ({ details, setGardenDetails }: MainDetailsProps) => {
  const [descriptionTab, setDescriptionTab] = useState<string>(Tab.EDIT);
  const [tokenOptions, setTokenOptions] = useState<Token[] | undefined>(undefined);

  const tokenListService = TokenListService.getInstance();
  const detailsToRender = details || defaultDetails;

  useEffect(() => {
    const getTokens = async () => {
      const dai = tokenListService.getTokenBySymbol('DAI') as Token;
      const weth = tokenListService.getTokenBySymbol('WETH') as Token;
      const usdc = tokenListService.getTokenBySymbol('USDC') as Token;
      const wbtc = tokenListService.getTokenBySymbol('WBTC') as Token;
      const reserves = [dai, weth, usdc, wbtc];

      setTokenOptions(reserves);
    };

    getTokens();
  }, []);

  const onChangeItem = (prop: string, value: string) => {
    const newDetails: GardenCreationMainDetails = { ...detailsToRender } as GardenCreationMainDetails;
    newDetails[prop] = value;
    if (prop === 'name') {
      newDetails.symbol = value.substr(0, 4).trim().toUpperCase().replace(' ', '');
    }
    setGardenDetails(newDetails, isFormValid(newDetails));
  };

  const isValid = (prop: string, value: string): boolean => {
    if (prop === 'name' && value) {
      return value.length > 0 && value.length <= 20;
    }
    if (prop === 'symbol' && value) {
      return value.length > 0 && value.length <= 5;
    }
    if (prop === 'description' && value) {
      return value.length > 0 && value.length <= 2000;
    }
    return !!value;
  };

  const isFormValid = (details: GardenCreationMainDetails) => {
    return (
      isValid('name', details.name) &&
      isValid('symbol', details.symbol) &&
      isValid('reserveAsset', details.reserveAsset) &&
      isValid('description', details.description)
    );
  };

  return (
    <MainDetailsWrapper>
      <InputWrapper>
        <StyledTextInput
          name={'name'}
          value={detailsToRender.name}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            onChangeItem('name', e.currentTarget.value);
          }}
          label={'Name'}
          placeholder="e.g Yield Farming Garden"
          required
          valid={isValid('name', detailsToRender.name)}
        />
        <StyledTextInput
          name={'symbol'}
          value={detailsToRender.symbol}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            onChangeItem('symbol', e.currentTarget.value);
          }}
          gardenIcon
          label={'Garden Symbol (ERC-20)'}
          placeholder="YFG"
          tooltip={'Define the token symbol that will represent the garden shares.'}
          required
          valid={isValid('symbol', detailsToRender.symbol)}
        />
        {tokenOptions && (
          <StyledTokenSelector
            name="reserveAsset"
            required
            label="Reserve Asset"
            options={tokenOptions}
            onlySwappable
            preselectedAddresses={[detailsToRender.reserveAsset]}
            tooltip={'Reserve asset will be used to consolidate deposits/withdrawals and as a return benchmark.'}
            stateCallback={(address: string[]) => onChangeItem('reserveAsset', address[0])}
          />
        )}
      </InputWrapper>
      <InputWrapper>
        <DescriptionTitle>Investment Thesis</DescriptionTitle>
        <TabWrapper>
          <TabbedNavigation tabs={DESCRIPTION_TABS} setActiveTab={(tab) => setDescriptionTab(tab)} />
        </TabWrapper>
        {descriptionTab === Tab.EDIT && (
          <StyledTextArea
            name={'description'}
            value={detailsToRender.description}
            rows={4}
            lineHeight={22}
            height={'180px'}
            onChange={(e: React.FormEvent<HTMLTextAreaElement>) => {
              onChangeItem('description', e.currentTarget.value);
            }}
            label={''}
            placeholder={'Enter the Garden investment thesis (Markdown supported).'}
            required
            valid={isValid('description', detailsToRender.description)}
          />
        )}
        {descriptionTab === Tab.PREVIEW && (
          <DescriptionPreview>
            <Markdown content={detailsToRender.description} />
          </DescriptionPreview>
        )}
      </InputWrapper>
    </MainDetailsWrapper>
  );
};

const TabWrapper = styled.div`
  padding: 10px 0;

  > div > div {
    padding: 5px 20px;
  }
`;

const DescriptionTitle = styled.div`
  font-size: 15px;
  width: 100%;
  margin: 30px 0 0;
`;

const StyledTextInput = styled(TextInput)`
  margin: 30px 0 0;

  span {
    font-size: 15px;
  }
`;
const StyledTokenSelector = styled(TokenSelector)`
  margin: 30px 0 0;
`;

const StyledTextArea = styled(TextArea)`
  margin: 0;

  span {
    font-size: 15px;
  }
`;

const DescriptionPreview = styled.div`
  height: 250px;
  width: 100%;
  overflow-y: auto;
`;

const MainDetailsWrapper = styled.div`
  min-height: 400px;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  color: white;
`;

const InputWrapper = styled.div`
  margin: 10px 0 0;
  display: flex;
  width: 440px;
  flex-flow: column nowrap;

  &:last-child {
    margin-bottom: 0;
  }
`;

export default React.memo(MainDetails);
