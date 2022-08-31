import { NumberInput, TabSelector } from 'components/shared/';
import { ONE_DAY_IN_SECONDS } from 'constants/values';
import { FullGardenDetails } from 'models';
import {
  StrategyParamField,
  StrategyParamsData,
  StrategyParamsDataValidation,
  ReducerAction,
  DEFAULT_VALIDATION,
} from './strategyParamsTypes';
import { TokenListService } from 'services';
import { Link } from 'react-router-dom';
import React, { Reducer, useEffect, useReducer } from 'react';
import styled from 'styled-components';

interface StrategyParamsProps {
  gardenDetails: FullGardenDetails;
  userTokenBalanceAvailable: number;
  strategyParams: StrategyParamsData | undefined;
  resetCounter: number;
  setStrategyParams: (params: StrategyParamsData | undefined) => void;
  onlyUpdate?: boolean;
}

interface StrategyParamsState {
  duration: number;
  expectedReturn: number;
  stake: number;
  maxCapitalRequested: number;
  maxPercentAllocation: number;
  maxGasFeePercentage: number;
  maxSlippagePercentage: number;
  formValidated: boolean | undefined;
  initialLoad: boolean;
  validation: StrategyParamsDataValidation;
  fieldsShown: string;
}

const validateForm = (props: StrategyParamsProps, state: StrategyParamsState): StrategyParamsDataValidation => {
  let validation: StrategyParamsDataValidation = { ...state.validation };
  const ValidationRules = {
    minMaxDuration:
      state.duration >= props.gardenDetails.minStrategyDuration.div(ONE_DAY_IN_SECONDS).toNumber() &&
      state.duration <= props.gardenDetails.maxStrategyDuration.div(ONE_DAY_IN_SECONDS).toNumber(),
    minMaxReturn: state.expectedReturn > 0 && state.expectedReturn <= 1000,
    minMaxStake: state.stake > 0 && state.stake <= props.userTokenBalanceAvailable,
    minMaxPercentAllocation: state.maxPercentAllocation > 0 && state.maxPercentAllocation <= 99,
    minMaxGasFeePercentage: state.maxGasFeePercentage >= 0.1 && state.maxGasFeePercentage <= 10,
    minMaxSlippagePercentage: state.maxSlippagePercentage >= 0.1 && state.maxGasFeePercentage <= 20,
  };

  // We could make this a bit better if we did a prev / curr value comparison of the fields and
  // only validate if there has been a change.
  Object.keys(state).map((key) => {
    switch (key) {
      case StrategyParamField.duration:
        validation[StrategyParamField.duration] = ValidationRules.minMaxDuration;
        break;
      case StrategyParamField.expectedReturn:
        validation[StrategyParamField.expectedReturn] = ValidationRules.minMaxReturn;
        break;
      case StrategyParamField.stake:
        if (!props.onlyUpdate) {
          validation[StrategyParamField.stake] = ValidationRules.minMaxStake;
        }
        break;
      case StrategyParamField.maxPercentAllocation:
        validation[StrategyParamField.maxPercentAllocation] = ValidationRules.minMaxPercentAllocation;
        break;
      case StrategyParamField.maxGasFeePercentage:
        validation[StrategyParamField.maxGasFeePercentage] = ValidationRules.minMaxGasFeePercentage;
        break;
      case StrategyParamField.maxSlippagePercentage:
        validation[StrategyParamField.maxSlippagePercentage] = ValidationRules.minMaxSlippagePercentage;
        break;
    }
  });

  return validation;
};

const initialFormState: StrategyParamsState = {
  expectedReturn: 0,
  duration: 30,
  stake: 0.1,
  maxCapitalRequested: 100,
  maxPercentAllocation: 99,
  maxGasFeePercentage: 5,
  maxSlippagePercentage: 3,
  formValidated: undefined,
  initialLoad: true,
  validation: DEFAULT_VALIDATION,
  fieldsShown: 'basic',
};

const overrideDefaultParamsByReserve = {
  WETH: {
    stake: 0.1,
    maxCapitalRequested: 100,
  },
  USDC: {
    stake: 100,
    maxCapitalRequested: 10000000,
  },
  DAI: {
    stake: 100,
    maxCapitalRequested: 10000000,
  },
  WBTC: {
    stake: 0.01,
    maxCapitalRequested: 200,
  },
};

const StrategyParams = (props: StrategyParamsProps) => {
  const { strategyParams, setStrategyParams, userTokenBalanceAvailable, gardenDetails, resetCounter } = props;
  const tokenListService = TokenListService.getInstance();
  const reserveSymbol = tokenListService.getInputSymbol(props.gardenDetails.reserveAsset);
  initialFormState.duration = gardenDetails.minStrategyDuration.toNumber() / 60 / 60 / 24;
  const overrideParams = overrideDefaultParamsByReserve[reserveSymbol.toUpperCase()];
  if (overrideParams) {
    initialFormState.maxCapitalRequested = overrideParams.maxCapitalRequested;
    initialFormState.stake = overrideParams.stake;
  }
  initialFormState.fieldsShown = props.onlyUpdate ? 'advanced' : 'basic';
  const reducer = (state: StrategyParamsState, action: ReducerAction) => {
    let newState: StrategyParamsState = { ...state };

    if (action.changeFieldsShown) {
      newState.fieldsShown = action.value;
    }
    if (action.type) {
      newState[action.type.toString()] = action.value;
      if (action.validate === true) {
        newState.validation = validateForm(props, newState);
        const allFieldsValid = !Object.values(newState.validation).includes(false);
        newState.formValidated = allFieldsValid;
      }
    }

    return newState;
  };

  const [state, dispatch] = useReducer<Reducer<StrategyParamsState, ReducerAction>, StrategyParamsState>(
    reducer,
    Object.assign(initialFormState, strategyParams),
    () => initialFormState,
  );
  const {
    maxCapitalRequested,
    maxPercentAllocation,
    maxGasFeePercentage,
    maxSlippagePercentage,
    duration,
    expectedReturn,
    initialLoad,
    stake,
    formValidated,
    validation,
    fieldsShown,
  } = state;

  useEffect(() => {
    if (initialLoad) {
      dispatch({ type: StrategyParamField.userTokenBalanceAvailable, value: userTokenBalanceAvailable });
    }
    if (formValidated) {
      setStrategyParams({
        duration,
        expectedReturn,
        stake,
        maxCapitalRequested,
        maxPercentAllocation,
        maxGasFeePercentage,
        maxSlippagePercentage,
      });
    } else {
      setStrategyParams(undefined);
    }
  }, [
    initialLoad,
    formValidated,
    maxCapitalRequested,
    maxPercentAllocation,
    maxGasFeePercentage,
    maxSlippagePercentage,
    stake,
    expectedReturn,
    duration,
  ]);

  useEffect(() => {
    dispatch({ type: StrategyParamField.expectedReturn, value: expectedReturn, validate: true });
  }, [resetCounter]);

  const onChangeWithValidation = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { name, value } = e.currentTarget;
    dispatch({ type: name as StrategyParamField, value: Number(value), validate: true });
  };

  const tabs = [
    { name: 'Basic', value: 'basic' },
    { name: 'Advanced', value: 'advanced' },
  ];

  return (
    <StrategyDetailsWrapper>
      {!props.onlyUpdate && (
        <TabSelectorWrapper>
          <TabSelector
            current={fieldsShown}
            changeTab={(newFieldsShown: string) => {
              dispatch({ value: newFieldsShown, changeFieldsShown: true });
            }}
            tabs={tabs}
          />
        </TabSelectorWrapper>
      )}
      <SubHeadingWrapper>
        <Title>
          Your profits and rewards will be based on the duration and delta between actual vs expected returns.
        </Title>
        <TextLink to={{ pathname: 'https://docs.babylon.finance/protocol/participants#strategist' }} target="_blank">
          Learn more
        </TextLink>
      </SubHeadingWrapper>
      <NumberInputWrapper>
        <NumberInput
          name={StrategyParamField.expectedReturn}
          value={expectedReturn}
          onChange={onChangeWithValidation}
          disabled={props.onlyUpdate}
          label={'Expected Return'}
          required
          valid={validation.expectedReturn}
          postSpan="%"
          tooltip={'The percent returns you anticipate from the Strategy.'}
        />
      </NumberInputWrapper>
      <NumberInputWrapper>
        <NumberInput
          name={StrategyParamField.duration}
          value={duration}
          disabled={props.onlyUpdate}
          onChange={onChangeWithValidation}
          noDecimals
          label={'Expected Duration'}
          required
          valid={validation.duration}
          postSpan="days"
          tooltip={'The maximum number of days the Strategy will be active.'}
        />
      </NumberInputWrapper>
      <NumberInputWrapper>
        <NumberInput
          name={StrategyParamField.stake}
          value={stake}
          disabled={props.onlyUpdate}
          onChange={onChangeWithValidation}
          label={`Your Strategist Stake (Available: ${userTokenBalanceAvailable.toFixed(2)})`}
          required
          valid={validation.stake}
          preSpan={reserveSymbol}
          tooltip={'The number of tokens you will stake as the Strategist on the Strategy.'}
        />
      </NumberInputWrapper>
      <NumberInputWrapper>
        <NumberInput
          name={StrategyParamField.maxGasFeePercentage}
          value={maxGasFeePercentage}
          onChange={onChangeWithValidation}
          label={'Max % spent on gas'}
          required
          valid={validation.maxGasFeePercentage}
          postSpan="%"
          tooltip={'The maximum amount of the Strategy principal that can be spent on gas during execution.'}
        />
      </NumberInputWrapper>
      <NumberInputWrapper>
        <NumberInput
          name={StrategyParamField.maxSlippagePercentage}
          value={maxSlippagePercentage}
          onChange={onChangeWithValidation}
          label={'Max % slippage per DeFi trade'}
          required
          valid={validation.maxSlippagePercentage}
          postSpan="%"
          tooltip={'The maximum slippage allowed per trade. Set this value higher for tokens with less liquidity.'}
        />
      </NumberInputWrapper>
      {fieldsShown !== 'basic' && (
        <>
          <NumberInputWrapper>
            <NumberInput
              name={StrategyParamField.maxPercentAllocation}
              value={maxPercentAllocation}
              onChange={onChangeWithValidation}
              label={'Maximum Percent Allocation (< 100%)'}
              required
              valid={validation.maxPercentAllocation}
              postSpan="%"
              tooltip={'The maximum percent of Garden principal to be allocated to the Strategy.'}
            />
          </NumberInputWrapper>
          <NumberInputWrapper>
            <NumberInput
              name={StrategyParamField.maxCapitalRequested}
              value={maxCapitalRequested}
              onChange={onChangeWithValidation}
              label={'Maximum Capital Allocation'}
              required
              valid={validation.maxCapitalRequested}
              preSpan={reserveSymbol}
              tooltip={'The maximum amount of capital that can be allocated to the Strategy.'}
            />
          </NumberInputWrapper>
        </>
      )}
    </StrategyDetailsWrapper>
  );
};

const SubHeadingWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
`;

const TextLink = styled(Link)`
  padding-left: 8px;
  color: var(--turquoise-01);
  font-family: cera-medium;
  font-size: 14px;
  text-align: center;
  text-decoration: underline;

  &:hover {
    cursor: pointer;
    opacity: 0.7;
  }
`;

const Title = styled.span`
  font-size: 14px;
  line-height: 24px;
  margin-bottom: 10px;
`;

const NumberInputWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 10px 0;
  color: white;
`;

const TabSelectorWrapper = styled.div`
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
`;

const StrategyDetailsWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 25px 0;
  color: white;
`;

export default React.memo(StrategyParams);
