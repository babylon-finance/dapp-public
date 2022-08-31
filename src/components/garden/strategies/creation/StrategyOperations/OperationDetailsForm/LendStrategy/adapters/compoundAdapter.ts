import { CompoundMarket } from 'models/';

export const getCompoundReservesFromResponse = (response: any) => {
  if (response.markets) {
    return response.markets
      .filter(
        (market: CompoundMarket) =>
          market.underlyingSymbol !== 'WBTC' ||
          market.id.toLowerCase() === '0xccf4429db6322d5c611ee964527d42e5d685dd6a',
      )
      .map((market: CompoundMarket) => {
        return {
          id: market.underlyingAddress,
          name: market.underlyingName,
          symbol: market.underlyingSymbol,
          collateralFactor: parseFloat(market.collateralFactor) * 100,
          liquidityRate: (parseFloat(market.supplyRate) * 100).toFixed(2),
        };
      });
  }
  return [];
};
