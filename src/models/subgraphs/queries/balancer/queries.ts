import { gql } from '@apollo/client';

// Temp work around for the graph-ts library types being busted
interface Bytes {}

export const BalancerGetPoolsForTokens = gql`
  query Pool($tokens: [Bytes!]!) {
    pools(
      first: 25
      where: { tokensList_contains: $tokens, liquidity_gt: 10000 }
      orderBy: totalSwapVolume
      orderDirection: desc
      isPublicSwap: true
      active: true
    ) {
      id
      name
      tokens {
        symbol
        denormWeight
      }
      totalWeight
      liquidity
      totalSwapVolume
      totalShares
    }
  }
`;
