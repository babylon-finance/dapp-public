import { BigNumber } from '@ethersproject/bignumber';
import { GardenPermission } from './Permissions';

interface ContributorResponse {
  lastDeposit: Date | undefined;
  initialDepositAt: Date;
  claimedAt: Date | undefined;
  claimedBABL: BigNumber;
  claimedProfits: BigNumber;
  address: string;
  tokens: BigNumber;
}

export interface RewardRecord {
  babl: BigNumber;
  profits: BigNumber;
}

export interface ContributorRewards {
  strategist: RewardRecord;
  steward: RewardRecord;
  lp: RewardRecord;
  totalProfits: BigNumber;
  totalBabl: BigNumber;
}

export interface Contributor extends ContributorResponse {
  isDust: boolean;
  rewards?: ContributorRewards;
  pendingRewards?: ContributorRewards;
  expectedEquity: BigNumber;
  lockedBalance: BigNumber;
  availableTokens: BigNumber;
  reserveAddress: string;
  avgSharePrice: BigNumber;
  percentOwnershipDisplay: string;
  totalCurrentDeposits: BigNumber;
  unclaimedStrategies: string[];
  contributorPower: BigNumber;
  userLock: BigNumber;
  votingPower: BigNumber;
  createdStrategies: number;
  permissions?: GardenPermission;
}
