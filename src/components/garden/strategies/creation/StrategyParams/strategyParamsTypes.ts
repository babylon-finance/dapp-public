export enum StrategyParamField {
  duration = 'duration',
  expectedReturn = 'expectedReturn',
  maxCapitalRequested = 'maxCapitalRequested',
  maxPercentAllocation = 'maxPercentAllocation',
  maxGasFeePercentage = 'maxGasFeePercentage',
  maxSlippagePercentage = 'maxSlippagePercentage',
  stake = 'stake',
  userTokenBalanceAvailable = 'userTokenBalanceAvailable',
}

export interface StrategyParamsData {
  duration: number;
  expectedReturn: number;
  stake: number;
  maxCapitalRequested: number;
  maxPercentAllocation: number;
  maxGasFeePercentage: number;
  maxSlippagePercentage: number;
}

export interface StrategyParamsDataValidation {
  duration: boolean;
  expectedReturn: boolean;
  stake: boolean;
  maxCapitalRequested: boolean;
  maxPercentAllocation: boolean;
  maxGasFeePercentage: boolean;
  maxSlippagePercentage: boolean;
}

export interface ReducerAction {
  type?: StrategyParamField;
  value?: any;
  validate?: boolean;
  changeFieldsShown?: boolean;
}

export const DEFAULT_VALIDATION: StrategyParamsDataValidation = {
  duration: true,
  expectedReturn: true,
  stake: true,
  maxCapitalRequested: true,
  maxPercentAllocation: true,
  maxGasFeePercentage: true,
  maxSlippagePercentage: true,
};
