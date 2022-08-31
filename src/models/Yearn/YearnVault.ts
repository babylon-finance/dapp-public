export interface VaultAPYDetails {
  totalApy: number;
  netApy: number;
  currentBoost: number;
  boostedApr: number;
  tokenRewardsApr: number;
  poolApy: number;
  baseApr: number;
}

export interface VaultAPY {
  description: string;
  type: string;
  data: VaultAPYDetails;
  composite: boolean;
  recommended: number;
}

export interface VaultStrategy {
  name: string;
  address: string;
}

export interface VaultTVL {
  total_assets: number;
  tvl: number;
  price: number;
}

export interface GeneralFees {
  managementFee: number;
  performanceFee: number;
}

export interface VaultFees {
  special: Object;
  general: GeneralFees;
}

export interface VaultToken {
  address: string;
  decimals: number;
  displayName: string;
  icon: string;
  name: string;
  symbol: string;
}

export interface YearnVaultV2 {
  inception: number;
  icon: string; // String representation of the URI
  symbol: string;
  apy: VaultAPY;
  address: string;
  strategies: VaultStrategy[];
  tvl: VaultTVL;
  endorsed: boolean;
  apiVersion: string;
  name: string;
  displayName: string;
  updated: number; // Timestamp
  fees: VaultFees;
  token: VaultToken;
  decimals: number;
  emergencyShutdown: boolean;
  tags: string[];
  type: string;
  special?: boolean;
}
