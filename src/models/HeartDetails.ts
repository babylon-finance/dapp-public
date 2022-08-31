// Note: these imports are relative due to dependency in autotask/ project
// plan is to fix transitive imports for autotask and then move back to 'models' pattern
import { FullGardenDetails } from './GardenDetails';
import { BigNumber } from '@ethersproject/bignumber';

// 0: fees accumulated in weth
// 1: Money sent to treasury
// 2: babl bought in babl
// 3: liquidity added in weth
// 4: amount invested in gardens in weth
// 5: amount lent on fuse in weth
// 6: weekly rewards paid
export interface HeartStats {
  totalFees: BigNumber;
  treasury: BigNumber;
  buybacks: BigNumber;
  liquidity: BigNumber;
  gardenInvestments: BigNumber;
  fuse: BigNumber;
  weeklyRewards: BigNumber;
  shield: BigNumber;
}

// 0: Treasury
// 1: Buybacks
// 2: Liquidity BABL-ETH
// 3: Garden Seed Investments
// 4: Fuse Pool
export interface HeartWeights {
  treasury: BigNumber;
  buybacks: BigNumber;
  liquidity: BigNumber;
  gardenInvestments: BigNumber;
  fuse: BigNumber;
  shield: BigNumber;
}

export interface GardenWeight {
  weight: BigNumber;
  address: string;
}

export interface GovernanceProposal {
  id: BigNumber;
  displayId: number;
  name: string;
  proposer: string;
  endedAt: number;
  netVotes: BigNumber;
  state: BigNumber;
}
export interface HeartBond {
  name: string;
  address: string;
  discount: number;
  link?: string;
}

export interface HeartLockingPeriod {
  index: number;
  label: string;
  seconds: number;
  discount: number;
}

export interface HeartDetails {
  gardenAddress: string;
  gardenDetails: FullGardenDetails;
  nextLendAsset: string;
  totalStats: HeartStats;
  feeWeights: HeartWeights;
  gardenWeights: GardenWeight[];
  weeklyReward: BigNumber;
  rewardLeft: BigNumber;
  lastPumpAt: number;
  lastVoteAt: number;
  currentLiquidityWeth: BigNumber;
  currentLiquidityBabl: BigNumber;
  proposals: GovernanceProposal[];
  bonds: HeartBond[];
}
