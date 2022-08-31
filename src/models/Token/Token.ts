export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  liquidity: number;
  integration: string;
  lastUpdatedAt: number;
  swappable: boolean;
}
