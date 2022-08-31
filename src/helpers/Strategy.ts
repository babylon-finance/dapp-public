import { formatReserveFloat } from 'helpers/Numbers';
import { StrategyDetails, StrategyProfit } from 'models';
import moment from 'moment';

const getRewardColor = (value: number): string => {
  if (value <= -20) {
    return 'var(--negative)';
  }
  if (value < 4) {
    return `var(--yellow)`;
  }
  if (value >= 4) {
    return 'var(--positive)';
  }
  return 'var(--white)';
};

export const getDaysSinceActive = (currentMoment: moment.Moment, strategy: StrategyDetails): moment.Duration => {
  if (strategy.inCooldown || strategy.isReadyWaiting) {
    return moment.duration(0);
  }
  return moment.duration(currentMoment.diff(strategy.executedAt));
};

export const getProfitStrategy = (strategy: StrategyDetails, gardenDetails: any, now: number): StrategyProfit => {
  const currentMoment = moment(now);
  const daysActive = getDaysSinceActive(currentMoment, strategy).asDays();
  const profits = (strategy.exitedAt > 0 ? strategy.capitalReturned : strategy.netAssetValue).sub(
    strategy.capitalAllocated,
  );
  const returnPercent = parseFloat(
    (
      (formatReserveFloat(profits, gardenDetails.reserveToken) /
        formatReserveFloat(strategy.capitalAllocated, gardenDetails.reserveToken)) *
      100
    ).toFixed(2),
  );

  const percentAnnualRemaining = 365 / Math.max(daysActive, 1);
  const annualizedReturn = parseFloat((returnPercent * percentAnnualRemaining).toFixed(2));
  return { profits, annualizedReturn, returnPercent, rewardColor: getRewardColor(annualizedReturn) };
};
