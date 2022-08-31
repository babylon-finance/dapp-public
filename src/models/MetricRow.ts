interface BaseMetricRow {
  garden: string;
  principal: number;
  netAssetValue: number;
  insertedAt: number;
  reserveToFiats: Object;
}

interface StrategyReturn {
  absolute: number;
  relativePercent: number;
}

export interface WalletRewardRecord {
  babl: number;
  profits: number;
}

export interface WalletRewards {
  strategist: WalletRewardRecord;
  steward: WalletRewardRecord;
  lp: WalletRewardRecord;
  totalProfits: number;
  totalBabl: number;
}

export interface WalletMetricRow {
  address: string;
  garden: string;
  walletNAV: number;
  balance: number;
  principal: number;
  ownership: number;
  unclaimedRewards: WalletRewards;
  pendingRewards: WalletRewards;
  claimedRewards: WalletRewardRecord;
  reserveAsset: string;
  reserveToFiats: Object;
  insertedAt: number;
}

export interface ReturnResult {
  raw: number;
  babl: number;
  aggregate: number;
}

export interface ReturnRanges {
  last30: ReturnResult;
  last90: ReturnResult;
  annual: ReturnResult;
}

export interface GardenMetricRow extends BaseMetricRow {
  name: string;
  private: boolean;
  absoluteReturns: number;
  bablReturns: number;
  createdAt: number;
  idleReserve: number;
  reserveAsset: string;
  strategyReturn: StrategyReturn;
  totalCapitalAllocated: number;
  totalContributors: number;
  totalSupply: number;
  returnRates?: ReturnRanges;
  verified?: number;
}

export interface StrategyMetricRow extends BaseMetricRow {
  strategy: string;
}

interface RewardsItem {
  babl: number;
  profits: number;
}

export interface RewardsRecord {
  strategist: RewardsItem;
  steward: RewardsItem;
  lp: RewardsItem;
  totalProfits: number;
  totalBabl: number;
}

export interface WalletMetricItem {
  data: WalletMetricRow;
  ref: unknown;
  ts: number;
  insertedAt: number;
}

export interface GardenMetricItem {
  data: GardenMetricRow;
  ref: unknown;
  ts: number;
  insertedAt: number;
}

export interface StrategyMetricItem {
  data: StrategyMetricRow;
  ref: unknown;
  ts: number;
  insertedAt: number;
}

export interface GardenMetricResponse {
  garden: GardenMetricItem[];
  strategy: StrategyMetricItem[];
}

export interface WalletMetricResponse {
  metrics: WalletMetricItem[];
}

export interface AggWalletMetricResponse {
  [key: string]: WalletMetricItem[];
}

export interface LatestMetricForGardensResponse {
  [key: string]: GardenMetricRow;
}
