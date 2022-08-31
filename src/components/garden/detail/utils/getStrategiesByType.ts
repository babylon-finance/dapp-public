import { FullGardenDetails, StrategyDetails } from 'models';
import { BigNumber } from '@ethersproject/bignumber';

export const getStrategiesByType = (garden: FullGardenDetails, blockNow: number, userAddress?: string) => {
  // Get all strategies and split them up by status so we don't need to chain several calls here.
  if (garden) {
    const results = garden.fullStrategies || [];

    const cooldown = results.filter(
      (record: StrategyDetails) =>
        record.executedAt === 0 &&
        record.enteredCooldownAt > 0 &&
        record?.active === true &&
        record?.finalized === false,
    );

    const active = results
      .filter((record: StrategyDetails) => record?.active === true && record?.executedAt > 0)
      .sort((a, b) => b.executedAt - a.executedAt);

    const candidate = results
      .filter(
        (record: StrategyDetails) =>
          record?.active === false && record?.finalized === false && record.enteredCooldownAt === 0,
      )
      .concat(cooldown);

    const completed = results
      .filter((record: StrategyDetails) => record?.finalized === true)
      .sort((a, b) => b.exitedAt - a.exitedAt);

    const user = userAddress
      ? results.filter((s: StrategyDetails) => s.strategist.toLowerCase() === userAddress.toLowerCase())
      : [];

    const totalCapitalAllocated = completed
      .map((r: StrategyDetails) => r.capitalAllocated)
      .reduceRight((a: BigNumber, b: BigNumber) => a.add(b), BigNumber.from(0));

    const totalCapitalReturned = completed
      .map((r: StrategyDetails) => r.capitalReturned)
      .reduceRight((a: BigNumber, b: BigNumber) => a.add(b), BigNumber.from(0));

    return { active, candidate, completed, cooldown, user, totalCapitalAllocated, totalCapitalReturned };
  }
};
