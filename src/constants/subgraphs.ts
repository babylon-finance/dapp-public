export interface SubgraphEntry {
  name: string;
  url: string;
}

export const SubgraphUrls: SubgraphEntry[] = [
  { name: 'aaveV2', url: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2' },
  { name: 'balancer', url: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer' },
  { name: 'compoundV2', url: 'https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2' },
  { name: 'uniswapV2', url: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2' },
  { name: 'sushiswap', url: 'https://api.thegraph.com/subgraphs/name/croco-finance/sushiswap' },
  {
    name: 'oneinchPool',
    url: 'https://api.thegraph.com/subgraphs/name/krboktv/oneinch-liquidity-protocol',
  },
  { name: 'curvePool', url: 'https://api.thegraph.com/subgraphs/name/sistemico/curve' },
  { name: 'yearn', url: 'https://api.thegraph.com/subgraphs/name/yearn/yearn-subgraph' },
  { name: 'harvest', url: 'https://api.thegraph.com/subgraphs/name/harvestfi/harvest-finance' },
];
