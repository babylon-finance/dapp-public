import { BalancerPool } from 'models/';

export const getBalancerPoolsFromResponse = (response: any) => {
  if (response.pools) {
    return response.pools.map((pool: BalancerPool) => {
      return {
        id: pool.id,
        name:
          pool.name ||
          pool.tokens
            .map((t: any) => `${((Number(t.denormWeight) * 100) / Number(pool.totalWeight)).toFixed(0)}% ${t.symbol}`)
            .join(' | '),
        supply: parseFloat(pool.totalShares),
        liquidity: parseFloat(pool.liquidity).toFixed(0),
        volume: parseFloat(pool.totalSwapVolume),
      };
    });
  }

  return [];
};

export const buildBalancerPoolsQuery: any = async (_: any, tokens: any[]) => {
  return {
    variables: { tokens },
  };
};
