import { gql } from '@apollo/client';

// Temp work around for the graph-ts library types being busted
interface Bytes {}

export const CurveGetAllPools = gql`
  query Pool {
    pools(first: 100, orderBy: coinCount, orderDirection: desc) {
      id
      name
    }
  }
`;
