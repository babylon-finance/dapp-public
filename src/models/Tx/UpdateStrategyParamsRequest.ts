import { BigNumber } from '@ethersproject/bignumber';

export default class StrategyUpdateProps {
  strategyParams: BigNumber[];
  constructor(strategyParams: BigNumber[]) {
    this.strategyParams = strategyParams;
  }

  getProps() {
    return [this.strategyParams];
  }
}
