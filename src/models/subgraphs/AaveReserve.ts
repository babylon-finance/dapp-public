export interface AaveReserve {
  id: string;
  symbol: string;
  name: string;
  stableBorrowRate?: string;
  variableBorrowRate?: string;
  utilizationRate?: string;
  baseLTVasCollateral?: string;
  liquidityRate?: string;
  totalLiquidity: string;
  marketSize?: string;
  decimals?: string;
  underlyingAsset?: string;
}
