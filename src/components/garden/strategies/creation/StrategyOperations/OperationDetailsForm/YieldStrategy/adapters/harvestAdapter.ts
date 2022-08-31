import { SearchHarvestToken, SearchHarvestInnerVault } from 'models/subgraphs/queries/';
import { HarvestVault } from 'models/subgraphs/HarvestVault';
import { Vault } from '../YieldStrategyForm';
import { formatReserveFloat } from 'helpers/Numbers';
import { TokenListService } from 'services';
import { Token } from 'models';

import { BigNumber } from '@ethersproject/bignumber';

const tokenListService = TokenListService.getInstance();

export const getHarvestVaultsFromResponse = (response: any): Vault[] => {
  if (response.doHardWorks) {
    const vaults = response.doHardWorks
      .map((vault: HarvestVault) => {
        const underlying = tokenListService.getTokenByAddress(vault.vault.underlying.id) as Token;

        return {
          id: vault.vault.id,
          name: `${vault.vault.fToken.name}`,
          balance: formatReserveFloat(BigNumber.from(vault.balanceWithInvestment), underlying).toFixed(2),
          pricePerFullShare: formatReserveFloat(BigNumber.from(vault.pricePerFullShare), underlying).toFixed(2),
        };
      })
      .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);

    return vaults;
  }

  return [];
};

export const buildHarvestVaultsQuery: any = async (graphClient: any, tokens: any[]) => {
  let [underlyingToken] = tokens;

  const underlyingObject = await graphClient.query({
    query: SearchHarvestToken,
    variables: {
      id: underlyingToken.toLowerCase(),
    },
  });

  const vault = await graphClient.query({
    query: SearchHarvestInnerVault,
    variables: {
      underlyingToken: underlyingObject?.data.tokens[0]?.id || '',
    },
  });

  return {
    variables: {
      vault: vault?.data.vaults[0]?.id || '',
    },
  };
};
