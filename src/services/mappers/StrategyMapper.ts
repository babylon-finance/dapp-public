// Note: these imports are relative due to dependency in autotask/ project
// plan is to fix transitive imports for autotask and then move back to 'models' pattern
import { StrategyStateRow } from 'shared/strategy/models';
import { StrategyDetails, FullGardenDetails, StrategyOperation, StrategyStates, StrategyStatus } from 'models/';
import { BigNumber } from '@ethersproject/bignumber';
import moment from 'moment';

export const retrieveFullStrategyDetails = (
  address: string,
  gardenDetails: FullGardenDetails,
  details: any,
  ops: any,
  firstNAV: string | undefined,
  keeperStatus: StrategyStateRow | undefined,
): StrategyDetails => {
  const now = Date.now();
  const currentMoment = moment(now);
  //  TODO: FirstVal needs to account for reallocations of capital
  //  const firstVal = firstNAV ? BigNumber.from(firstNAV) : details[2][4];
  const firstVal = details[2][4];
  let strategyResult = {
    address,
    strategist: details[0],
    name: details[1],
    garden: gardenDetails.address,
    opsCount: details[2][0],
    stake: details[2][1],
    absoluteTotalVotes: details[2][2].add(details[2][3]),
    totalVotes: details[2][2].add(BigNumber.from(details[2][3]).abs()),
    capitalAllocated: firstVal,
    executionCosts: firstNAV ? details[2][4].sub(firstVal) : BigNumber.from(0),
    capitalReturned: details[2][5],
    duration: details[2][6].toNumber(), // in seconds
    expectedReturn: details[2][7],
    maxCapitalRequested: details[2][8],
    maxPercentAllocation: details[2][12],
    maxGasFeePercentage: details[2][13],
    maxSlippagePercentage: details[2][14],
    estimatedBABLRewards: details[2][15] || BigNumber.from(0),
    enteredAt: details[2][9].toNumber() * 1000,
    netAssetValue: details[2][10],
    rewards: details[2][11],
    maxVoteWindowDays: 7,
    operations: getOperations(ops),
    active: details[3][0],
    dataSet: details[3][1],
    finalized: details[3][2],
    executedAt: details[4][0].toNumber() * 1000,
    exitedAt: details[4][1].toNumber() * 1000,
    enteredCooldownAt: details[4][3].toNumber() * 1000,
    inCooldown: false,
    waitingOnFinalize: false,
    isReadyWaiting: false,
    status: StrategyStates.unknown,
    timePassed: 0,
    timeRemaining: 0,
  };

  if (keeperStatus && Object.keys(keeperStatus).length > 0) {
    strategyResult['keeperStatus'] = keeperStatus;
  }

  const strategyDuration = moment.duration(strategyResult.duration, 'seconds');
  strategyResult.inCooldown = now - strategyResult.enteredCooldownAt <= gardenDetails.strategyCooldownPeriod.toNumber();
  strategyResult.waitingOnFinalize =
    currentMoment.isAfter(strategyResult.executedAt + strategyDuration.asMilliseconds()) &&
    strategyResult.executedAt > 0;
  strategyResult.isReadyWaiting =
    strategyResult.enteredCooldownAt > 0 && !strategyResult.inCooldown && strategyResult.executedAt === 0;
  strategyResult.timePassed = currentMoment.diff(strategyResult.executedAt);
  strategyResult.timeRemaining = Math.abs((strategyResult.duration * 1000 - strategyResult.timePassed) / 1000);

  return { ...strategyResult, status: getStrategyStatus(strategyResult) };
};

function getOperations(strategyOpsRaw: any): StrategyOperation[] | undefined {
  let operations: StrategyOperation[] = [];
  if (strategyOpsRaw && strategyOpsRaw[0].length > 0) {
    strategyOpsRaw[0].forEach((kind: number, index: number) => {
      operations.push({
        kind,
        integration: strategyOpsRaw[1][index],
        data: strategyOpsRaw[2][index],
      });
    });
  }
  return operations;
}

function getStrategyStatus(strategy: StrategyDetails): StrategyStatus {
  if (strategy.exitedAt > 0) {
    return StrategyStates.finalized;
  }
  if (strategy.executedAt > 0) {
    return StrategyStates.executed;
  }
  if (strategy.inCooldown) {
    return StrategyStates.cooldown;
  }
  if (strategy.isReadyWaiting) {
    return StrategyStates.ready;
  }
  if (strategy.waitingOnFinalize) {
    return StrategyStates.waiting;
  }
  return StrategyStates.voting;
}
