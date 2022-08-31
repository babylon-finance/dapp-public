import { Token, ReturnRanges } from 'models';

import { BigNumber } from '@ethersproject/bignumber';

export interface BablToReserves {
  DAI: BigNumber;
  USDC: BigNumber;
  WETH: BigNumber;
  WBTC: BigNumber;
}

export interface MetricsForGarden {
  principalFiat: number;
  navFiat: number;
  bablFiat: number;
  wealthFiat: number;
  reserve: Token;
  returnRates?: ReturnRanges;
  verified?: number;
}

interface ValueByTicker {
  CNY: number;
  EUR: number;
  JPY: number;
  USD: number;
}

export interface LeaderboardResponse {
  results: GardenLeader[];
  totalBABL: number;
  totalContributors: number;
  totalGardens: number;
  totalNAV: ValueByTicker;
  totalPrincipal: ValueByTicker;
}

export interface LeaderboardResult {
  metrics: LeaderboardResponse;
  qualified: string[];
  bablToReserves: BablToReserves;
}

export interface ProtocolMetricsCache {
  investmentReturnsUSD: number; // excludes BABL rewards
  aggregateReturnsUSD: number; // includes BABL rewards
  totalBABL: number;
  totalContributors: number;
  totalGardens: number;
  usdTotalNAV: number;
  usdTotalPrincipal: number;
}

export interface GardenLeader {
  garden: string;
  name: string;
  private: boolean;
  bablReturns: number;
  reserveAsset: string;
  createdAt: number;
  contributors: number;
  principalRaw: number;
  navRaw: number;
  principalByTicker: ValueByTicker;
  navByTicker: ValueByTicker;
  returnRates?: ReturnRanges;
  verified?: number;
}
