import { gql } from '@apollo/client';

// Temp work around for the graph-ts library types being busted
interface Bytes {}

export const SearchOneInchTokens = gql`
  query Token($id: ID!) {
    tokens(where: { id: $id }) {
      id
      symbol
      name
    }
  }
`;

export const GetOneInchPairs = gql`
  query TradingPair($tokenA: Bytes!, $tokenB: Bytes!) {
    tradingPairs(
      first: 5
      where: { fromToken: $tokenA, toToken: $tokenB }
      orderBy: tradeVolume
      orderDirection: desc
    ) {
      id
      fromToken {
        id
        symbol
        name
      }
      toToken {
        id
        symbol
        name
      }
      tradeVolume
    }
  }
`;
