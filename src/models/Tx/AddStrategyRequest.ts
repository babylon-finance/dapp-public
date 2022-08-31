import { OPERATION_TYPES } from 'constants/values';
import { BigNumber } from '@ethersproject/bignumber';
import { Bytes } from '@ethersproject/bytes';

type ValueOf<T> = T[keyof T];

function asLiterals<T extends number, U extends { [n: string]: T }>(arg: U) {
  return arg;
}

export const OperationTypes = asLiterals(OPERATION_TYPES);

type OperationTypesValues = ValueOf<typeof OperationTypes>;

export default class StrategyProps {
  name: string;
  symbol: string;
  stratParams: BigNumber[];
  opTypes: Number[];
  opIntegrations: string[];
  opDatas: Bytes;

  constructor(
    name: string,
    symbol: string,
    stratParams: BigNumber[],
    opTypes: OperationTypesValues[],
    opIntegrations: string[],
    opDatas: Bytes,
  ) {
    this.name = name;
    this.symbol = symbol;
    this.stratParams = stratParams;
    this.opTypes = opTypes;
    this.opIntegrations = opIntegrations;
    this.opDatas = opDatas;
  }

  getProps() {
    return [this.name, this.symbol, this.stratParams, this.opTypes, this.opIntegrations, this.opDatas];
  }
}
