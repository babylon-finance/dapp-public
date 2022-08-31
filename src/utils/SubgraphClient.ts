import { getApolloClient } from './ApolloClientBuilder';
import { SubgraphUrls } from 'constants/subgraphs';

export interface SubgraphClient {
  client: any;
}

export function getAllSubgraphClients() {
  let subgraphs = {};
  SubgraphUrls.map((entry) => {
    return (subgraphs[entry.name] = getApolloClient(entry.url));
  });

  return subgraphs;
}
