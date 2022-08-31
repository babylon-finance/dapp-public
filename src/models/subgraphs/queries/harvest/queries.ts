import { gql } from '@apollo/client';

// Temp workaround since graph-ts types are broken
interface Bytes {}
interface Token {}
interface ID {}

export const SearchHarvestToken = gql`
  query Token($id: ID!) {
    tokens(where: { id: $id }) {
      id
      decimals
      name
      symbol
    }
  }
`;

export const SearchHarvestInnerVault = gql`
  query Vault($underlyingToken: Bytes!) {
    vaults(where: { underlying: $underlyingToken }, orderBy: timestamp, orderDirection: desc) {
      id
    }
  }
`;

export const SearchHarvestVaults = gql`
  query Vaults($vault: Bytes!) {
    doHardWorks(first: 10, where: { vault: $vault }, orderBy: timestamp, orderDirection: desc) {
      pricePerFullShare
      timestamp
      balanceWithInvestment
      vault {
        id
        underlying {
          id
          symbol
          name
        }
        fToken {
          id
          symbol
          name
        }
      }
    }
  }
`;
