import { ApolloClient, InMemoryCache } from '@apollo/client';

export function getApolloClient(uri: string) {
  return new ApolloClient({ uri: uri, cache: new InMemoryCache() });
}
