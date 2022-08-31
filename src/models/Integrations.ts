import { getAddressByName } from 'hooks/ContractLoader';
import { OperationKind } from './Strategies';

const BalancerIntegrationAddress = getAddressByName('BalancerIntegration');
const UniswapV3TradeIntegrationAddress = getAddressByName('UniswapV3TradeIntegration');
const HarvestVaultIntegrationAddress = getAddressByName('HarvestVaultIntegration');
const MasterSwapperIntegrationAddress = getAddressByName('MasterSwapper');
const UniswapPoolIntegrationAddress = getAddressByName('UniswapPoolIntegration');
const YearnVaultIntegrationAddress = getAddressByName('YearnVaultIntegration');
const ConvexStakeIntegrationAddress = getAddressByName('ConvexStakeIntegration');
const OneInchPoolIntegrationAddress = getAddressByName('OneInchPoolIntegration');
const SushiswapPoolIntegrationAddress = getAddressByName('SushiswapPoolIntegration');
const CompoundLendIntegrationAddress = getAddressByName('CompoundLendIntegration');
const CompoundBorrowIntegrationAddress = getAddressByName('CompoundBorrowIntegration');
const FuseLendIntegrationAddress = getAddressByName('FuseLendIntegration');
const FuseBorrowIntegrationAddress = getAddressByName('FuseBorrowIntegration');
const AaveLendIntegrationAddress = getAddressByName('AaveLendIntegration');
const AaveBorrowIntegrationAddress = getAddressByName('AaveBorrowIntegration');
const StakeWiseIntegrationAddress = getAddressByName('StakewiseIntegration');
const LidoStakeIntegrationAddress = getAddressByName('LidoStakeIntegration');
const CurvePoolIntegrationAddress = getAddressByName('CurvePoolIntegration');
const AladdinIntegrationAddress = getAddressByName('AladdinConcentratorIntegration');
const CurveGaugeIntegrationAddress = getAddressByName('CurveGaugeIntegration');
const PickleJarIntegrationAddress = getAddressByName('PickleJarIntegration');
const PickleFarmIntegrationAddress = getAddressByName('PickleFarmIntegration');
const HarvestV3PoolIntegrationAddress = getAddressByName('HarvestPoolV3Integration');
const HarvestV3StakeIntegrationAddress = getAddressByName('HarvestV3StakeIntegration');

// Types

export type GroupedIntegrations = any;

export interface Integration {
  name: string;
  displayName: string;
  address: string;
  iconName: string;
  type: OperationKind;
  active: boolean;
}

export interface IntegrationList {
  integrations: Integration[];
}

export function getCustomIntegration(address: string): Integration {
  return {
    name: IntegrationName.Custom,
    address,
    displayName: 'custom',
    iconName: 'custom',
    type: OperationKind.custom,
    active: true,
  };
}

export enum IntegrationName {
  AladdinV3 = 'Aladdin',
  MasterSwapper = 'MasterSwapper',
  Balancer = 'BalancerIntegration',
  Custom = 'CustomIntegration',
  Harvest = 'HarvestVaultIntegration',
  HarvestV3 = 'HarvestV3PoolIntegration',
  HarvestV3Stake = 'HarvestV3StakeIntegration',
  Lido = 'LidoStakeIntegration',
  CurvePool = 'CurvePoolIntegration',
  CurveGauge = 'CurveGaugeIntegration',
  Convex = 'ConvexStakeIntegration',
  UniswapV3Trade = 'UniswapV3TradeIntegration',
  CompoundLend = 'CompoundLendIntegration',
  CompoundBorrow = 'CompoundBorrowIntegration',
  FuseLend = 'FuseLendIntegration',
  FuseBorrow = 'FuseBorrowIntegration',
  AaveLend = 'AaveLendIntegration',
  AaveBorrow = 'AaveBorrowIntegration',
  UniswapPool = 'UniswapPoolIntegration',
  OneInchPool = 'OneInchPoolIntegration',
  PickleJar = 'PickleJarIntegration',
  PickleFarm = 'PickleFarmIntegration',
  Stakewise = 'StakewiseIntegration',
  SushiswapPool = 'SushiswapPoolIntegration',
  YearnVault = 'YearnVaultIntegration',
}

export const integrations = [
  {
    name: IntegrationName.MasterSwapper,
    displayName: 'Babylon Swapper',
    iconName: 'babylon',
    type: OperationKind.long,
    address: MasterSwapperIntegrationAddress,
    active: true,
  },
  {
    name: IntegrationName.UniswapV3Trade,
    displayName: 'Uniswap V3',
    iconName: 'uniswap',
    type: OperationKind.long,
    address: UniswapV3TradeIntegrationAddress,
    oldAddresses: ['0x4f8508be29c5ddcf40a2d5106e45078874737fa6'.toLowerCase()],
    active: false,
  },
  {
    name: IntegrationName.CompoundLend,
    displayName: 'Compound',
    type: OperationKind.lend,
    iconName: 'compound',
    address: CompoundLendIntegrationAddress,
    oldAddresses: ['0xE1170885795C9f1c8EAe3986FF77FD446cB1Fe17'.toLowerCase()],
    active: true,
  },
  {
    name: IntegrationName.CompoundBorrow,
    displayName: 'Compound',
    type: OperationKind.borrow,
    iconName: 'compound',
    address: CompoundBorrowIntegrationAddress,
    active: true,
  },
  {
    name: IntegrationName.FuseLend,
    displayName: 'Fuse Pool',
    type: OperationKind.lend,
    iconName: 'babylon',
    address: FuseLendIntegrationAddress,
    oldAddresses: [],
    active: true,
  },
  {
    name: IntegrationName.FuseBorrow,
    displayName: 'Fuse Pool',
    type: OperationKind.borrow,
    iconName: 'babylon',
    address: FuseBorrowIntegrationAddress,
    oldAddresses: ['0x84E546A3b93B5d8e804e84fB2c9aD898bAb70dF4'],
    active: true,
  },
  {
    name: IntegrationName.AaveLend,
    displayName: 'Aave',
    iconName: 'aave',
    type: OperationKind.lend,
    address: AaveLendIntegrationAddress,
    oldAddresses: ['0xA2a49663d9b719FE8169bb767047aF0619f86fc1'],
    active: true,
  },
  {
    name: IntegrationName.AaveBorrow,
    displayName: 'Aave',
    iconName: 'aave',
    type: OperationKind.borrow,
    address: AaveBorrowIntegrationAddress,
    oldAddresses: ['0xB34A2F7f32cc587C3562E695fBe24756E6BE5638'],
    active: true,
  },
  // Balancer V1 is deprecated
  {
    name: IntegrationName.Balancer,
    displayName: 'Balancer',
    iconName: 'balancer',
    type: OperationKind.pool,
    address: BalancerIntegrationAddress,
    active: false,
  },
  {
    name: IntegrationName.UniswapPool,
    displayName: 'Uniswap',
    iconName: 'uniswap',
    type: OperationKind.pool,
    address: UniswapPoolIntegrationAddress,
    active: true,
  },
  {
    name: IntegrationName.OneInchPool,
    displayName: 'OneInchPool',
    iconName: 'oneinch',
    type: OperationKind.pool,
    address: OneInchPoolIntegrationAddress,
    active: false,
  },
  {
    name: IntegrationName.SushiswapPool,
    displayName: 'SushiswapPool',
    iconName: 'sushiswap',
    type: OperationKind.pool,
    address: SushiswapPoolIntegrationAddress,
    active: true,
  },
  {
    name: IntegrationName.CurvePool,
    displayName: 'Curve Pool',
    iconName: 'curve',
    type: OperationKind.pool,
    address: CurvePoolIntegrationAddress,
    oldAddresses: [
      '0x4dc23befea4fa92af2de5834120e14ea43ad7924'.toLowerCase(),
      '0x745a51080efDF5C8664A28f150eF3688f97E331e'.toLowerCase(),
    ],
    active: true,
  },
  {
    name: IntegrationName.CurveGauge,
    displayName: 'Curve Gauge',
    iconName: 'curve',
    type: OperationKind.yield,
    address: CurveGaugeIntegrationAddress,
    active: true,
  },
  {
    name: IntegrationName.Convex,
    displayName: 'Convex',
    iconName: 'convex',
    type: OperationKind.yield,
    address: ConvexStakeIntegrationAddress,
    oldAddresses: [
      '0xFe06f1d501f417e6E87531aB7618c65D42735995'.toLowerCase(),
      '0xee919d9E48289e0A2900BA4b6aF9464459E428CD'.toLowerCase(),
      '0x27725Cd03f82e9Af5811940da6cB27bc6A51CEDC'.toLowerCase(),
      '0xDcCDf2D78239aBB788aD728D63ac45d90dEfe24A'.toLowerCase(),
      '0x22619F6710C7D82D7b7FE31449D351B61373D63D'.toLowerCase(),
    ],
    active: true,
  },
  {
    name: IntegrationName.AladdinV3,
    displayName: 'Aladdin',
    iconName: 'aladdin',
    type: OperationKind.yield,
    address: AladdinIntegrationAddress,
    oldAddresses: [],
    active: true,
  },
  {
    name: IntegrationName.YearnVault,
    displayName: 'Yearn',
    iconName: 'yearn',
    type: OperationKind.yield,
    address: YearnVaultIntegrationAddress,
    active: true,
  },
  {
    name: IntegrationName.PickleJar,
    displayName: 'Pickle Jar',
    iconName: 'pickle',
    type: OperationKind.yield,
    address: PickleJarIntegrationAddress,
    active: true,
  },
  {
    name: IntegrationName.PickleFarm,
    displayName: 'Pickle Farm',
    iconName: 'pickle',
    type: OperationKind.yield,
    address: PickleFarmIntegrationAddress,
    active: true,
  },
  {
    name: IntegrationName.Lido,
    displayName: 'Lido Stake',
    iconName: 'lido',
    type: OperationKind.yield,
    address: LidoStakeIntegrationAddress,
    active: true,
  },
  {
    name: IntegrationName.Stakewise,
    displayName: 'Stakewise',
    iconName: 'stakewise',
    type: OperationKind.yield,
    address: StakeWiseIntegrationAddress,
    oldAddresses: ['0x8E4796f9E2612AFF12f9AE37a7091Dfd4253A5C1'],
    active: true,
  },
  {
    name: IntegrationName.Harvest,
    displayName: 'Harvest',
    iconName: 'harvest',
    type: OperationKind.yield,
    address: HarvestVaultIntegrationAddress,
    active: false,
  },
  {
    name: IntegrationName.HarvestV3,
    displayName: 'Harvest V3',
    iconName: 'harvest',
    type: OperationKind.pool,
    address: HarvestV3PoolIntegrationAddress,
    active: false,
  },
  {
    name: IntegrationName.HarvestV3Stake,
    displayName: 'Harvest Stake',
    iconName: 'harvest',
    type: OperationKind.yield,
    address: HarvestV3StakeIntegrationAddress,
    active: false,
  },
];

// Functions

export function getIntegrations(): IntegrationList {
  return { integrations };
}

export function integrationsGroupedByKey(key: keyof Integration): GroupedIntegrations {
  return getIntegrations().integrations.reduce(function (storage, item) {
    var group = item[key.toString()];
    storage[group] = storage[group] || [];
    storage[group].push(item);
    return storage;
  }, {});
}

export function getIntegrationsFromOps(
  kinds: number[],
  whitelistDisplayNames?: string[],
  blacklistDisplayNames?: string[],
): Integration[] {
  const integrations = getIntegrations()
    .integrations.filter((i) => i.active)
    .filter((integration: Integration) => {
      return (
        kinds.indexOf(integration.type) >= 0 &&
        (whitelistDisplayNames && whitelistDisplayNames.length > 0
          ? whitelistDisplayNames.indexOf(integration.displayName) !== -1
          : true)
      );
    });
  if (blacklistDisplayNames && blacklistDisplayNames.length > 0) {
    return integrations.filter((integration: Integration) => {
      return blacklistDisplayNames.indexOf(integration.displayName) === -1;
    });
  }
  return integrations;
}

export function getIntegrationByAddress(integrationAddress: string): Integration | undefined {
  let found = integrations.find(({ address }) => address === integrationAddress);
  if (!found) {
    found = integrations.find(({ oldAddresses }) =>
      oldAddresses?.find((oldAddress: string) => oldAddress === integrationAddress.toLowerCase()),
    );
  }
  return found;
}

export function getIntegrationByName(integrationName: string): Integration | undefined {
  return integrations.find(({ name }) => name === integrationName);
}
