import { AaveReserve } from 'models/';
import { tokens } from 'constants/addresses';

export const getAaveReservesFromResponse = (response: any) => {
  if (response.reserves) {
    return response.reserves
      .filter((r) => !r.symbol.startsWith('Amm'))
      .map((reserve: AaveReserve) => {
        const isWETH = reserve.id === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
        // Id is a concatenated string of underlying asset and protocol lending contract address???
        return {
          id: isWETH ? tokens.WETH : reserve.id.substring(0, 42),
          name: reserve.name,
          symbol: isWETH ? 'WETH' : reserve.symbol,
          collateralFactor: parseFloat(reserve.baseLTVasCollateral || '0') / 100,
          // This value is in ray units ie: 10^27
          liquidityRate: ((parseInt(reserve.liquidityRate || '0') / 10 ** 27) * 100).toFixed(2),
        };
      });
  }

  return [];
};
