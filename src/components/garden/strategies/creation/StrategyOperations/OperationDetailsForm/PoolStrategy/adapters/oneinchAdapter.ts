import { SearchOneInchTokens } from 'models/subgraphs/queries';
import { OneInchPool } from 'models/';

export const getOneInchPoolsFromResponse = (response: any) => {
  if (response.tradingPairs) {
    return response.tradingPairs.map((pair: OneInchPool) => {
      return {
        id: pair.id,
        name: `${pair.fromToken.symbol} - ${pair.toToken.symbol}`,
        supply: false,
        liquidity: false,
        volume: parseFloat(pair.tradeVolume).toFixed(0),
      };
    });
  }
  return [];
};

export const buildOneInchPoolsQuery: any = async (graphClient: any, tokens: any[]) => {
  let [tokenA, tokenB] = tokens;
  let firstTokenQuery: any,
    secondTokenQuery: any = null;
  if (tokenA) {
    firstTokenQuery = await graphClient.query({
      query: SearchOneInchTokens,
      variables: {
        id: tokenA?.toLowerCase(),
      },
    });
  }
  if (tokenB) {
    secondTokenQuery = await graphClient.query({
      query: SearchOneInchTokens,
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
