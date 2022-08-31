import {
  GetOneInchPairs,
  SearchUniPairForTokens,
  BalancerGetPoolsForTokens,
  CurveGetAllPools,
} from 'models/subgraphs/queries/';
import { Integration } from 'models/Integrations';
import { buildUniswapPoolsQuery, getUniswapPoolsFromResponse } from './adapters/uniswapAdapter';
import { buildBalancerPoolsQuery, getBalancerPoolsFromResponse } from './adapters/balancerAdapter';
import { buildOneInchPoolsQuery, getOneInchPoolsFromResponse } from './adapters/oneinchAdapter';
import { buildCurvePoolsQuery, getCurvePoolsFromResponse } from './adapters/curveAdapter';

export const buildPoolsQueryParams = (integration: Integration, graphClient: any, tokens: any[]) => {
  switch (integration.displayName.toLowerCase()) {
    case 'sushiswap':
    case 'uniswap':
      return buildUniswapPoolsQuery(graphClient, tokens);
    case 'balancer':
      return buildBalancerPoolsQuery(graphClient, tokens);
    case 'oneinchpool':
      return buildOneInchPoolsQuery(graphClient, tokens);
    case 'curve pool':
      return buildCurvePoolsQuery(graphClient);
  }
  return buildUniswapPoolsQuery(graphClient, tokens);
};

export const getUnifiedPoolData = (integration: Integration, response: any) => {
  switch (integration.displayName.toLowerCase()) {
    case 'sushiswap':
    case 'uniswap':
      return getUniswapPoolsFromResponse(response);
    case 'balancer':
      return getBalancerPoolsFromResponse(response);
    case 'oneinchpool':
      return getOneInchPoolsFromResponse(response);
    case 'curve pool':
      return getCurvePoolsFromResponse(response);
  }
  return getUniswapPoolsFromResponse(response);
};

export const getPoolQuery = (integration: Integration) => {
  switch (integration.displayName.toLowerCase()) {
    case 'uniswap':
    case 'sushiswap':
      return SearchUniPairForTokens;
    case 'balancer':
      return BalancerGetPoolsForTokens;
    case 'oneinchpool':
      return GetOneInchPairs;
    case 'curve pool':
      return CurveGetAllPools;
  }
  return SearchUniPairForTokens;
};
