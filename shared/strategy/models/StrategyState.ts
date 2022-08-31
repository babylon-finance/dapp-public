export enum StrategyActions {
  vote = 'vote',
  execute = 'execute',
  finalize = 'finalize',
  expire = 'expire',
  none = 'none',
}

// NOTE: Order matters here as we build the FSM from this ordered enum
// We also filter expired and uknown
export enum StrategyStates {
  created = 'created',
  voting = 'voting',
  expired = 'expired',
  resolved = 'resolved',
  ready = 'ready',
  cooldown = 'cooldown',
  executed = 'executed',
  waiting = 'waiting',
  finalized = 'finalized',
  unknown = 'unknown',
}

export enum StrategyErrorCodes {
  allocationBalance = 'allocation_balance',
  blacklisted = 'blacklisted',
  cannotSwap = 'cannot_swap',
  executionError = 'execution_error',
  gasFeeTooHigh = 'gas_fee_too_high',
  insufficientCapital = 'insufficient_capital',
  inactive = 'inactive',
  maxCapitalReached = 'max_capital_reached',
  quorumLost = 'quorum_lost',
  remainingDuration = 'remaining_duration',
  slippageTooHigh = 'slippage_too_high',
  unknownError = 'unknown_error',
}

export type StrategyStatus =
  | 'created'
  | 'voting'
  | 'resolved'
  | 'cooldown'
  | 'ready' // ready to execute
  | 'executed'
  | 'expired'
  | 'waiting' // waiting to finalize
  | 'finalized'
  | 'unknown';
export type StrategyAction = 'vote' | 'execute' | 'finalize' | 'expire' | 'none' | undefined;
export type StrategyErrorCode =
  | 'allocation_balance'
  | 'blacklisted'
  | 'cannot_swap'
  | 'execution_error'
  | 'gas_fee_too_high'
  | 'insufficient_capital'
  | 'max_capital_reached'
  | 'quorum_lost'
  | 'remaining_duration'
  | 'slippage_too_high'
  | 'inactive'
  | 'unknown_error';

export interface StrategyError {
  code: StrategyErrorCode;
  data?: Record<string, any>;
}

export interface StrategyStateRow {
  action: StrategyAction;
  status: StrategyStatus;
  duration: number;
  executedAt: number;
  garden: string; // Garden Address
  strategy: string; // Strategy Address
  error?: StrategyError | undefined; // No error if undefined
  insertedAt: number; // Unix Timestamp
  updatedAt: number; // Unix Timestamp
}

export interface RefStateRow {
  ref: string;
  ts: number;
  data: StrategyStateRow;
}

export interface FaunaResponse {
  data: RefStateRow[];
}

export const mkStrategyRow = (
  strategy: string,
  garden: string,
  duration: number,
  executedAt: number,
  action: StrategyAction,
  status: StrategyStatus,
  error: StrategyError | undefined,
): StrategyStateRow => {
  return {
    action,
    error,
    duration,
    executedAt,
    garden,
    status,
    strategy,
    insertedAt: Date.now(),
    updatedAt: Date.now(),
  };
};

// Example StrategyStateRow
//{
//  strategy: '0xdead....',
//  garden: '0xbabylon...',
//  status: 'executed',
//  action: undefined,
//  // the error field is the most tricky one; it will require union schemas because different error would have different
//  // extra fields but if we keep it typed should not be a problem
//  // if nested objects is an issue in Fauna we can flat it; or we can flat anyway if you prefet it
//  error: {
//    code: 'gas_fees_too_high',
//    data: {
//      feeLimit: '1000', // 1000 DAI is required
//      fee: '400', // 400 DAI amount present
//    },
//  },
//  insertedAt: 13723370, // Unix Timestamp
//  updatedAt: 13723380, // Unix Timestamp
//};
