import { gql } from '@apollo/client';

// Temp work around for the graph-ts library types being busted
interface Bytes {}

export const CompoundGetBestBorrowRates = gql`
  query Market {
    markets(first: 30, where: { reserves_gt: 0 }, orderBy: borrowRate, orderDirection: asc) {
      id
      underlyingSymbol
      underlyingName
      underlyingAddress
      reserves
      totalSupply
      borrowRate
    }
  }
`;

export const CompoundGetBestLendAssets = gql`
  query Market {
    markets(first: 30, where: { collateralFactor_gt: 0 }, orderBy: reserves, orderDirection: desc) {
      id
      underlyingSymbol
      underlyingName
      underlyingAddress
      reserves
      collateralFactor
      reserveFactor
      totalSupply
      supplyRate
    }
  }
`;
