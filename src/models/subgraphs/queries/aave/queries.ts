import { gql } from '@apollo/client';

// Temp work around for the graph-ts library types being busted
interface Bytes {}

export const AaveGetBestBorrowRates = gql`
  query Reserve {
    reserves(
      first: 50
      where: { totalLiquidity_gt: 100000, isActive: true, borrowingEnabled: true }
      orderBy: variableBorrowRate
      orderDirection: asc
    ) {
      id
      symbol
      name
      variableBorrowRate
      totalLiquidity
    }
  }
`;

export const AaveGetBestLendRates = gql`
  query Reserve {
    reserves(
      first: 50
      where: { isActive: true, usageAsCollateralEnabled: true, totalLiquidity_gt: 100000 }
      orderBy: liquidityRate
      orderDirection: desc
    ) {
      id
      symbol
      name
      liquidityRate
      totalLiquidity
      utilizationRate
      baseLTVasCollateral
      underlyingAsset
    }
  }
`;
