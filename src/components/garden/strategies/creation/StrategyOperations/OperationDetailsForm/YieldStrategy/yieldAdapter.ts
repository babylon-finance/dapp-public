import { SearchHarvestVaults } from 'models/subgraphs/queries';

import { Integration } from 'models/Integrations';
import { buildHarvestVaultsQuery, getHarvestVaultsFromResponse } from './adapters/harvestAdapter';

export const buildVaultsQueryParams = (integration: Integration, graphClient: any, tokens: any[]) => {
  switch (integration.displayName.toLowerCase()) {
    case 'harvest':
      return buildHarvestVaultsQuery(graphClient, tokens);
  }
  return buildHarvestVaultsQuery(graphClient, tokens);
};

export const getUnifiedVaultData = (integration: Integration, response: any) => {
  switch (integration.displayName.toLowerCase()) {
    case 'harvest':
      return getHarvestVaultsFromResponse(response);
    default:
      return getHarvestVaultsFromResponse(response);
  }
};

export const getVaultQuery = (integration: Integration) => {
  switch (integration.displayName.toLowerCase()) {
    case 'harvest':
      return SearchHarvestVaults;
  }
  return SearchHarvestVaults;
};
