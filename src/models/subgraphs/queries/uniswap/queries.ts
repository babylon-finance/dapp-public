import { gql } from '@apollo/client';

// Temp workaround since graph-ts types are broken
interface Bytes {}

interface ID {}

export const SearchUniTokens = gql`
  query Token($id: ID!) {
    tokens(where: { id: $id }) {
      id
      symbol
      name
      totalLiquidity
    }
  }
`;

export const SearchUniPairForTokens = gql`
  query Pair($tokenA: Bytes!, $tokenB: Bytes!) {
    pairs(first: 5, where: { token0: $tokenA, token1: $tokenB }, orderBy: totalSupply, orderDirection: desc) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
      totalSupply
      reserveUSD
      volumeUSD
    }
  }
`;
