import { StrategyDetails } from 'models';
import { BigNumber } from '@ethersproject/bignumber';

export const calculateGardenStrategiesTotal = (strategies: StrategyDetails[] | undefined): BigNumber => {
  let strategyReturns = BigNumber.from(0);
  strategies?.forEach((strategy: StrategyDetails) => {
    if (strategy.capitalReturned.gt(0)) {
      if (strategy.capitalReturned.gte(strategy.capitalAllocated)) {
        strategyReturns = strategyReturns.add(strategy.capitalReturned.sub(strategy.capitalAllocated));
      } else {
        strategyReturns = strategyReturns.sub(strategy.capitalAllocated.sub(strategy.capitalReturned));
      }
    } else {
      if (strategy.capitalAllocated.gt(0)) {
        if (strategy.netAssetValue.gte(strategy.capitalAllocated)) {
          strategyReturns = strategyReturns.add(strategy.netAssetValue.sub(strategy.capitalAllocated));
        } else {
          strategyReturns = strategyReturns.sub(strategy.capitalAllocated.sub(strategy.netAssetValue));
        }
      }
    }
  });
  return strategyReturns;
};

export const calculateGardenStrategiesTotalBabl = (strategies: StrategyDetails[] | undefined): BigNumber => {
  let bablReturns = BigNumber.from(0);
  strategies?.forEach((strategy: StrategyDetails) => {
    bablReturns = bablReturns.add(strategy.estimatedBABLRewards).add(strategy.rewards);
  });
  return bablReturns;
};
