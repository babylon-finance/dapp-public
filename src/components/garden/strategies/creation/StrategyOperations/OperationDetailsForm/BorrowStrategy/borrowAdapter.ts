import { Integration } from 'models/Integrations';
import { CompoundGetBestBorrowRates, AaveGetBestBorrowRates } from 'models/subgraphs/queries/';
import { getCompoundReservesFromResponse } from './adapters/compoundAdapter';
import { getAaveReservesFromResponse } from './adapters/aaveAdapter';
import { getFuseMarkets } from './adapters/fuseAdapter';

export const getUnifiedReserveData = (integration: Integration, response: any) => {
  switch (integration.displayName.toLowerCase()) {
    case 'compound':
      return getCompoundReservesFromResponse(response);
    case 'aave':
      return getAaveReservesFromResponse(response);
    case 'fuse pool':
      return getFuseMarkets();
  }
  return getCompoundReservesFromResponse(response);
};

export const getReserveQuery = (integration: Integration) => {
  switch (integration.displayName.toLowerCase()) {
    case 'compound':
      return CompoundGetBestBorrowRates;
    case 'aave':
      return AaveGetBestBorrowRates;
  }
  return CompoundGetBestBorrowRates;
};
