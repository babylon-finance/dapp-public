import { SearchUniTokens } from 'models/subgraphs/queries';
import { UniswapPool } from 'models/';
import { pickle } from 'constants/addresses';

export const getUniswapPoolsFromResponse = (response: any) => {
  if (response.pairs) {
    return response.pairs.map((pair: UniswapPool) => {
      const stakeable: string[] = [];
      if (
        pickle.jars.find(
          (v: any) =>
            v.sushi?.toLowerCase() === pair.id.toLowerCase() || v.uni?.toLowerCase() === pair.id.toLowerCase(),
        )
      ) {
        stakeable.push('pickle');
      }
      return {
        id: pair.id,
        name: `${pair.token0.symbol} - ${pair.token1.symbol}`,
        supply: parseFloat(pair.totalSupply),
        liquidity: parseFloat(pair.reserveUSD).toFixed(0),
        volume: parseFloat(pair.volumeUSD),
        stakeable,
      };
    });
  }
  return [];
};

export const buildUniswapPoolsQuery: any = async (graphClient: any, tokens: any[]) => {
  let [tokenA, tokenB] = tokens;
  let firstTokenQuery: any,
    secondTokenQuery: any = null;
  if (tokenA) {
    firstTokenQuery = await graphClient.query({
      query: SearchUniTokens,
      variables: {
        id: tokenA?.toLowerCase(),
      },
    });
  }
  if (tokenB) {
    secondTokenQuery = await graphClient.query({
      query: SearchUniTokens,
      variables: {
        id: tokenB?.toLowerCase(),
      },
    });
  }
  return {
    variables: {
      tokenA: firstTokenQuery?.data?.tokens[0].id || '',
      tokenB: secondTokenQuery?.data?.tokens[0].id || '',
    },
  };
};
