import { StrategyStateRow } from 'shared/strategy/models';
import { IconName } from './IconName';
import { BigNumber } from '@ethersproject/bignumber';
import { Bytes } from '@ethersproject/bytes';
import moment from 'moment';

type Address = string;

export const StrategyStates = {
  voting: 'voting',
  resolved: 'resolved',
  cooldown: 'cooldown',
  ready: 'ready',
  executed: 'executed',
  finalized: 'finalized',
  waiting: 'waiting',
  unknown: 'unknown',
} as const;

type StrategyStatusKey = keyof typeof StrategyStates;
export type StrategyStatus = typeof StrategyStates[StrategyStatusKey];

export interface StateEntry {
  value: StrategyStatus;
  prev: StrategyStatus | undefined;
  next: StrategyStatus | undefined;
}

type StrategyStateMachine = {
  [key in StrategyStatus]: StateEntry;
};

export enum OperationKind {
  long = 0,
  pool = 1,
  yield = 2,
  lend = 3,
  borrow = 4,
  custom = 5,
  nft = 6,
}

export interface OperationBase {
  kind: OperationKind;
  title: string;
  disabled?: boolean;
}

export type OperationKinds = keyof typeof OperationKind;

export interface StrategyDetails {
  name: string;
  garden: Address;
  address: Address;
  strategist: Address;
  opsCount: number;
  stake: BigNumber;
  absoluteTotalVotes: BigNumber;
  totalVotes: BigNumber;
  capitalAllocated: BigNumber;
  executionCosts: BigNumber;
  capitalReturned: BigNumber;
  duration: number;
  expectedReturn: BigNumber;
  maxCapitalRequested: BigNumber;
  maxPercentAllocation: BigNumber;
  maxGasFeePercentage: BigNumber;
  maxSlippagePercentage: BigNumber;
  estimatedBABLRewards: BigNumber;
  netAssetValue: BigNumber;
  enteredAt: number;
  maxVoteWindowDays: number;
  operations: StrategyOperation[] | undefined;
  active: boolean;
  dataSet: boolean;
  finalized: boolean;
  rewards: BigNumber;
  executedAt: number;
  exitedAt: number;
  enteredCooldownAt: number;
  inCooldown: boolean;
  waitingOnFinalize: boolean;
  isReadyWaiting: boolean;
  status: StrategyStatus;
  timeRemaining: number;
  timePassed: number;
  keeperStatus?: StrategyStateRow;
}

export interface StrategyOperation {
  kind: number;
  integration: string;
  data: Bytes;
  dataAux?: any;
}

export enum StrategyFilter {
  active = 'active',
  candidate = 'candidate',
  cooldown = 'cooldown',
  completed = 'completed',
  user = 'user',
}

export interface UserStratStats {
  activatedStrategies: number;
  activatedVotes: number;
}

export interface UserStatsObj extends UserStratStats {
  totalDeposits: BigNumber;
  totalNAV: BigNumber;
  totalReturn: BigNumber;
  totalBABL: BigNumber;
  totalRewards: BigNumber;
  stewardRewards: BigNumber;
  annualizedReturn: number;
  strategistRewards: BigNumber;
}

export interface UserStratStatsCache {
  [key: string]: UserStratStats;
}

export interface KeeperError {
  name: string;
  text: string;
  icon: IconName;
}

export interface KeeperCode {
  [key: string]: KeeperError;
}

export const KeeperCodes: KeeperCode = {
  allocation_balance: {
    name: 'Allocation balance',
    text: 'This Strategy would exceed the provided allocation target. It will not receive more capital at this time.',
    icon: IconName.bellDisabled,
  },
  blacklisted: {
    name: 'Blocked',
    text: 'The Strategy has been blocked and cannot be executed. Please contact support to resolve.',
    icon: IconName.stop,
  },
  cannot_swap: {
    name: 'Unable to swap',
    text: 'The proposed swap action is not possible. Please contact support to resolve.',
    icon: IconName.warning,
  },
  execution_error: {
    name: 'Execution error',
    text: 'There was an error executing the proposed Strategy. Please contact support if the problem persists.',
    icon: IconName.error,
  },
  gas_fee_too_high: {
    name: 'High gas fee',
    text: 'The gas fee required to execute is greater than the limit set in the Strategy. Please adjust the limit or wait for gas prices to decline.',
    icon: IconName.flame,
  },
  insufficient_capital: {
    name: 'Insufficient capital',
    text: 'This Garden lacks the required liquidity to execute the proposed strategy.',
    icon: IconName.failure,
  },
  inactive: {
    name: 'Garden closed',
    text: 'This Garden is no longer active. Please activate the Garden to execute this strategy.',
    icon: IconName.stop,
  },
  max_capital_reached: {
    name: 'Maximum capital',
    text: 'This Strategy has received the maximum amount of capital as defined in the Strategy properties.',
    icon: IconName.starShooting,
  },
  quorum_lost: {
    name: 'Quorum lost',
    text: 'Quorum for this Strategy has been lost due to opposing votes.',
    icon: IconName.steward,
  },
  remaining_duration: {
    name: 'Strategy duration',
    text: 'The remaining duration of this Strategy is too short to allocate more capital.',
    icon: IconName.clipboard,
  },
  slippage_too_high: {
    name: 'High slippage',
    text: 'Slippage for the proposed the trade in the proposed Strategy is higher than the max set by the strategist.',
    icon: IconName.flame,
  },
  unknown_error: {
    name: 'Unknown error',
    text: 'There was an unkown error when attempting to execute the Strategy. Please contact support if the problem persists.',
    icon: IconName.error,
  },
};

export const getExecutionEndsBy = (currentMoment: moment.Moment, strategy: StrategyDetails) => {
  if (strategy.inCooldown || strategy.isReadyWaiting || strategy.waitingOnFinalize) {
    return moment.duration(0);
  }
  const strategyDuration = moment.duration(strategy.duration, 'seconds');
  const executionTimeActive = moment.duration(currentMoment.diff(strategy.executedAt)).asMinutes();
  return moment.duration(strategyDuration.asMinutes() - executionTimeActive, 'minutes');
};

export const getVoteEndsBy = (
  currentMoment: moment.Moment,
  strategy: StrategyDetails,
  strategyCooldownHours: number,
  hitQuorum: boolean,
) => {
  const enteredAt = moment(strategy.enteredAt);
  const maxVoteMinutes = hitQuorum
    ? moment.duration(strategyCooldownHours, 'hours').asMinutes()
    : moment.duration(strategy.maxVoteWindowDays, 'days').asMinutes();
  let submitTimeActive = moment.duration(currentMoment.diff(enteredAt)).asMinutes();
  if (hitQuorum) {
    // TODO: receive the time when the vote that made the quorum was casted
    submitTimeActive = 0;
  }
  return moment.duration(maxVoteMinutes - submitTimeActive, 'minutes');
};

export function getOperations(): OperationBase[] {
  return [
    { kind: OperationKind.long, title: 'Long an Asset' },
    { kind: OperationKind.pool, title: 'Add Liquidity' },
    { kind: OperationKind.yield, title: 'Stake' },
    { kind: OperationKind.lend, title: 'Lend' },
    { kind: OperationKind.borrow, title: 'Borrow' },
    {
      kind: OperationKind.custom,
      title: 'Custom',
    },
    { kind: OperationKind.nft, title: 'Buy an NFT', disabled: true },
  ];
}
export function getIconName(kind: OperationKind) {
  return ['long', 'liquidity', 'yield', 'lend', 'borrow', 'nft', 'custom'][kind];
}

export const getCooldownEndsBy = (currentMoment: moment.Moment, strategy: StrategyDetails, cooldown: number) => {
  const enteredAt = moment(strategy.enteredCooldownAt);
  const cooldownPeriod = moment.duration(cooldown, 'seconds').asMinutes();
  const cooldownTimeActive = moment.duration(currentMoment.diff(enteredAt)).asMinutes();
  return moment.duration(cooldownPeriod - cooldownTimeActive, 'minutes');
};

const _mkStateFromStatus = (status: StrategyStatus, statusArray: StrategyStatus[]): StateEntry => {
  const index = statusArray.findIndex((t) => t === status);

  if (index === -1) {
    throw new Error(`Status: ${status} not supported!`);
  }

  return {
    value: status,
    prev: index > 0 ? statusArray[index - 1] : undefined,
    next: statusArray.length > index + 1 ? statusArray[index + 1] : undefined,
  };
};

const _mkStrategyStateMachine = (): StrategyStateMachine => {
  const statusArray = Object.values(StrategyStates) as StrategyStatus[];

  const stateMachine = {};

  statusArray.forEach((status) => {
    // @ts-ignore
    stateMachine[status] = _mkStateFromStatus(StrategyStates[status] || StrategyStates.unknown, statusArray);
  });

  return stateMachine as StrategyStateMachine;
};

export interface StrategyProfit {
  profits: BigNumber;
  annualizedReturn: number;
  returnPercent: number;
  rewardColor: string;
}

export const STRATEGY_STATES: StrategyStateMachine = _mkStrategyStateMachine();
