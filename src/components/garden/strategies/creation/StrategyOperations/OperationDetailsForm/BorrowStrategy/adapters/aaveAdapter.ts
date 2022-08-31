import { AaveReserve } from 'models/';

export const getAaveReservesFromResponse = (response: any) => {
  if (response.reserves) {
    return response.reserves
      .filter((r) => r.variableBorrowRate !== '0')
      .filter((r) => !r.symbol.startsWith('Amm'))
      .map((reserve: AaveReserve) => {
        return {
          id: reserve.id.substring(0, 42),
          name: reserve.name,
          symbol: reserve.symbol,
          borrowRate: ((parseInt(reserve.variableBorrowRate || '0') / 10 ** 27) * 100).toFixed(2),
        };
      });
  }
  return [];
};
