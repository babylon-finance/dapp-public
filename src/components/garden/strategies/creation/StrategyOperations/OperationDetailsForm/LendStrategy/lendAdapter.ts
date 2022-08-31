import { Integration } from 'models/Integrations';
import { CompoundGetBestLendAssets, AaveGetBestLendRates } from 'models/subgraphs/queries/';
import { getCompoundReservesFromResponse } from './adapters/compoundAdapter';
import { getAaveReservesFromResponse } from './adapters/aaveAdapter';

export const getUnifiedReserveData = (integration: Integration, response: any) => {
  switch (integration.displayName.toLowerCase()) {
    case 'compound':
      return getCompoundReservesFromResponse(response);
    case 'aave':
      return getAaveReservesFromResponse(response);
  }
  return getCompoundReservesFromResponse(response);
};

export const getReserveQuery = (integration: Integration) => {
  switch (integration.displayName.toLowerCase()) {
    case 'compound':
      return CompoundGetBestLendAssets;
    case 'aave':
      return AaveGetBestLendRates;
  }
  return CompoundGetBestLendAssets;
};
