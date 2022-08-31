// Note: these imports are relative due to dependency in autotask/ project
// plan is to fix transitive imports for autotask and then move back to 'models' pattern
import { StrategyDetails } from './Strategies';
import { Contributor } from './Contributor';
import { Token } from './Token';

import { BigNumber } from '@ethersproject/bignumber';
import { GardenNFTMeta } from './Nft';
import { GardenMetricRow } from './MetricRow';

interface ProfitSharing {
  strategist: number;
  stewards: number;
  lp: number;
}

export interface MinimalGardenDetails {
  address: string;
  name: string;
  publicLP: boolean;
  verified: number;
  totalContributors: BigNumber;
  reserveAsset: string;
  reserveToken: Token;
  netAssetValue: BigNumber;
  customIntegrationsEnabled: boolean;
  latestMetric?: GardenMetricRow | undefined;
}

export type GardenDetails = FullGardenDetails | MinimalGardenDetails;
export interface FullGardenDetails extends MinimalGardenDetails {
  symbol: string;
  creator: string[];
  active: boolean;
  fees: GardenFees | undefined;
  profitSplit: BigNumber;
  performanceFees: BigNumber;
  grossReturns: BigNumber;
  strategyReturns: BigNumber;
  bablReturns: BigNumber;
  netReturns: BigNumber;
  publicVoter: boolean;
  publicStrategist: boolean;
  strategies: string[];
  finalizedStrategies: string[];
  depositHardlock: BigNumber;
  minVotesQuorum: BigNumber;
  maxDepositLimit: BigNumber;
  minVoters: BigNumber;
  minStrategyDuration: BigNumber;
  maxStrategyDuration: BigNumber;
  strategyCooldownPeriod: BigNumber;
  minContribution: BigNumber;
  minLiquidityAsset: BigNumber;
  gasFees: BigNumber;
  principal: BigNumber;
  reserveAssetRewardsSetAside: BigNumber;
  absoluteReturns: BigNumber;
  gardenInitializedAt: number;
  totalStake: BigNumber;
  totalTokenSupply: BigNumber;
  contribution: Contributor | undefined;
  contributors: Contributor[] | undefined;
  fullStrategies: StrategyDetails[] | undefined;
  sharePrice: BigNumber;
  seed: number;
  profits: ProfitSharing;
  availableLiquidReserve: BigNumber;
  hardlockStartsAt: BigNumber;
  sharePriceDelta: BigNumber;
  sharePriceDeltaDecay: BigNumber;
  nft?: GardenNFTMeta;
  mintNftAfter: number;
  customIntegrationsEnabled: boolean;
}

// Creation Types
export interface GardenCreationMainDetails {
  name: string;
  symbol: string;
  reserveAsset: string;
  description: string;
}

export interface GardenCreationNftDetails {
  image: string;
  mintNftAfter: number;
  seed: number;
}

export interface GardenCreationDepositDetails {
  minContribution: number;
  maxDepositLimit: number;
  depositHardlock: number;
  sharePriceDelta: number;
  sharePriceDeltaDecay: number;
}

export interface GardenCreationAccessDetails {
  publicLP: boolean;
  publicVoter: boolean;
  publicStrategist: boolean;
  strategistShare: number;
  stewardsShare: number;
}

export interface GardenCreationMechanics {
  earlyWithdrawalPenalty: number;
  minStrategyDuration: number;
  maxStrategyDuration: number;
  minVotesQuorum: number;
  strategyCooldownPeriod: number;
  minLiquidityAsset: number;
  minVoters: number;
  customIntegrations: boolean;
}

export interface GardenCreationSummaryDetails {
  creatorDeposit: number;
  terms: boolean;
}

export interface GardenStrategies {
  active: StrategyDetails[];
  candidate: StrategyDetails[];
  completed: StrategyDetails[];
  cooldown: StrategyDetails[];
  user: StrategyDetails[];
  totalCapitalAllocated: BigNumber;
  totalCapitalReturned: BigNumber;
}

export interface UserGardens {
  gardens: string[];
  hasDepositedFlags: boolean[];
  data: MinimalGardenDetails[];
}

export interface UserGardensKeyCache {
  [key: string]: UserGardens;
}

export interface GardensCache {
  [key: string]: FullGardenDetails;
}

export interface PerformanceSplit {
  strategist: BigNumber;
  stewards: BigNumber;
  protocol: BigNumber;
  total: BigNumber;
}

export interface PerformanceFees {
  actualized: PerformanceSplit;
  anticipated: PerformanceSplit;
}
export interface GardenFees {
  management: BigNumber;
  performance: PerformanceFees;
  gas: BigNumber;
  total: BigNumber;
}
