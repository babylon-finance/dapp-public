import { from, parse, eth } from '../../common/utils/helpers.js';
import { getQuotes } from '../../common/utils/quotes.js';
import { getVotesForStrategy } from '../../common/utils/fauna';
import { getStore } from '../../common/utils/store';
import { getProvider, getRelayer, getNow, getGasPrice, getContractAt } from '../../common/utils/web3';
import { handler, expire, execute, finalize, vote } from '../src/index';

import {
  DAY_IN_SECONDS,
  KEEPER_PERCENTAGE,
  GAS_LIMIT_PERCENTAGE,
  MAX_CANDIDATE_PERIOD,
  MAX_FEE_MAP,
  AUTOTASK_DURATION,
  WETH,
  DAI,
  USDC,
  WBTC,
  MAX_GAS_PRICE,
} from 'common/constants.js';

const CONTRACTS = {
  IWETH: { abi: 'IWETH' },
  ERC20: { abi: 'ERC20' },
  BabControllerProxy: { address: 'BabControllerProxy' },
  BabController: { abi: 'BabController' },
  DefaultGarden: { abi: 'DefaultGarden' },
  GardenValuer: { address: 'GardenValuer', abi: 'GardenValuer' },
  Garden: { abi: 'Garden' },
  Strategy: { abi: 'Strategy' },
  GardenNFT: { abi: 'GardenNFT' },
  StrategyNFT: { address: 'StrategyNFT', abi: 'StrategyNFT' },
};

jest.mock('../../common/utils/quotes');
jest.mock('../../common/utils/fauna');
jest.mock('../../common/utils/store');
jest.mock('../../../shared/strategy/queries');
jest.mock('../../../src/1.json', () => {
  return {
    IWETH: { abi: 'IWETH' },
    ERC20: { abi: 'ERC20' },
    BabControllerProxy: { address: 'BabControllerProxy' },
    BabController: { abi: 'BabController' },
    DefaultGarden: { abi: 'DefaultGarden' },
    GardenValuer: { address: 'GardenValuer', abi: 'GardenValuer' },
    Garden: { abi: 'Garden' },
    Strategy: { abi: 'Strategy' },
    GardenNFT: { abi: 'GardenNFT' },
    StrategyNFT: { address: 'StrategyNFT', abi: 'StrategyNFT' },
  };
});

jest.mock('../../common/utils/web3', () => {
  const originalModule = jest.requireActual('../../common/utils/web3');

  return {
    __esModule: true,
    ...originalModule,
    getProvider: jest.fn(),
    getRelayer: jest.fn(),
    getNow: jest.fn(),
    getGasPrice: jest.fn(),
    getContractAt: jest.fn(),
  };
});

const DURATION = 950400;
const COOLDOWN_PERIOD = 86400;
const NOW = 1600000000;
const DEFAULT_STAKE = eth(0.1);
const GAS_PRICE = 10000000000; // 100 gwei
const GAS_COST = 100000;
const GAS_LIMIT = from(GAS_COST).mul(25).div(10);
const ETH_QUOTE = 3000.0;
const WBTC_QUOTE = 50000.0;
const KEEPER_FEE = from(GAS_PRICE).mul(GAS_COST).mul(KEEPER_PERCENTAGE).div(100);
const KEEPER_FEE_IN_USD = KEEPER_FEE.mul(from(Math.round(ETH_QUOTE * 1e10))).div(1e10);

const strategyNftContract = {
  getStrategyName: () => Promise.resolve('StrategyName'),
};

const controllerContract = {
  address: 'controler',
  getGardens: () => Promise.resolve(['DefaultGarden']),
  gardenNFT: () => Promise.resolve('GardenNFT'),
};

const gardenValuerContract = {
  address: 'gardenValuer',
  calculateGardenValuation: () => Promise.resolve(eth()),
};

const gardenNftContract = {
  gardenTokenURIs: () => Promise.resolve('NftUrl'),
};

const wethContract = {
  address: WETH,
  balanceOf: (address) => Promise.resolve(eth(1)),
};

const daiContract = {
  address: DAI,
  balanceOf: (address) => Promise.resolve(eth(1000)),
};

const usdcContract = {
  address: USDC,
  balanceOf: (address) => Promise.resolve(from(1000 * 1e6)),
};

const wbtcContract = {
  address: WBTC,
  balanceOf: (address) => Promise.resolve(parse('1')),
};

const votes = {
  votes: [
    {
      voter: '0x1',
      amount: '2100000000000000000',
      isOpposed: false,
    },
    {
      voter: '0x1',
      amount: '500000000000000000',
      isOpposed: true,
    },
  ],
};

function createGardenContract(params) {
  const { totalSupply, reserveAsset } = {
    ...{ reserveAsset: WETH },
    ...{ totalSupply: eth(1) },
    ...params,
  };

  return {
    address: 'DefaultGarden',
    minVotesQuorum: () => Promise.resolve(parse('0.1').toString()),
    minVoters: () => Promise.resolve('1'),
    totalSupply: () => Promise.resolve(totalSupply),
    balanceOf: () => Promise.resolve(parse('1')),
    reserveAsset: () => Promise.resolve(reserveAsset),
    keeperDebt: () => Promise.resolve(eth(0)),
    reserveAssetRewardsSetAside: () => Promise.resolve(eth(0)),
    totalContributors: () => Promise.resolve(from('1')),
    strategyCooldownPeriod: () => Promise.resolve(from(COOLDOWN_PERIOD)),
    name: () => Promise.resolve('DefaultGarden'),
    getStrategies: () => Promise.resolve(['DefaultStrategy']),
  };
}

function createStrategyContract(params) {
  const {
    active,
    enteredCooldownAt,
    executedAt,
    finalized,
    enteredAt,
    gasCost,
    maxCapitalRequested,
    address,
    maxGasFeePercentage,
    maxAllocationPercentage,
    capitalAllocated,
  } = {
    active: false,
    enteredCooldownAt: 0,
    executedAt: 0,
    finalized: false,
    enteredAt: NOW - 1,
    gasCost: GAS_COST,
    maxCapitalRequested: eth(1000),
    maxGasFeePercentage: eth(0.1),
    maxAllocationPercentage: eth(1),
    capitalAllocated: eth(0),
    address: 'DefaultStrategy',
    ...params,
  };
  return {
    finalized: () => Promise.resolve(finalized),
    getStrategyState: () =>
      Promise.resolve([undefined, active, undefined, finalized, from(executedAt), from(0), from(0)]),
    getStrategyDetails: () =>
      Promise.resolve([
        undefined,
        'strategist',
        [],
        eth(0.1),
        eth(1),
        eth(0),
        capitalAllocated,
        eth(0),
        from(DURATION),
        from(3),
        maxCapitalRequested,
        undefined,
        from(enteredAt),
        eth(1),
      ]),
    address,
    active: () => Promise.resolve(active),
    isStrategyActive: () => Promise.resolve(false),
    enteredAt: () => Promise.resolve(from(enteredAt)),
    enteredCooldownAt: () => Promise.resolve(from(enteredCooldownAt)),
    executedAt: () => Promise.resolve(from(executedAt)),
    duration: () => Promise.resolve(from(DURATION)),
    strategist: () => Promise.resolve('strategist'),
    stake: () => Promise.resolve(eth(0.1)),
    maxAllocationPercentage: () => Promise.resolve(maxAllocationPercentage),
    capitalAllocated: () => Promise.resolve(capitalAllocated),
    maxCapitalRequested: () => Promise.resolve(eth(100)),
    maxGasFeePercentage: () => Promise.resolve(maxGasFeePercentage),
    estimateGas: {
      expireStrategy: () => from(gasCost),
      finalizeStrategy: () => from(gasCost),
      resolveVoting: () => from(gasCost),
      executeStrategy: () => from(gasCost),
    },
    resolveVoting: jest.fn(),
    executeStrategy: jest.fn(),
    finalizeStrategy: jest.fn(),
    expireStrategy: jest.fn(),
  };
}

function getVoteParams(overrides) {
  return {
    ...{
      strategy: 'DefaultStrategy',
      name: 'DefaultStrategy',
      duration: 100,
      strategyContract: undefined,
      strategist: 'Strategist',
      strategistStake: DEFAULT_STAKE,
      garden: 'Garden',
      gardenContract: undefined,
      totalSupply: eth(1),
      now: NOW,
      enteredAt: NOW - 1,
      store: getStore(),
      quotes: { WETH: { quote: { USD: { price: ETH_QUOTE } } } },
      reserveAsset: DAI,
      gasPrice: GAS_PRICE,
      active: false,
      minVoters: 1,
      minVotesQuorum: eth(0.1),
      strategyCooldownPeriod: from(COOLDOWN_PERIOD),
    },
    ...overrides,
  };
}

function getExpireParams(overrides) {
  return {
    ...{
      strategy: 'DefaultStrategy',
      name: 'DefaultStrategy',
      gasPrice: GAS_PRICE,
      reserveAsset: DAI,
      duration: 100,
      quotes: {
        WETH: { quote: { USD: { price: ETH_QUOTE } } },
        WBTC: { quote: { USD: { price: WBTC_QUOTE } } },
      },
    },
    ...overrides,
  };
}

function getFinalizeParams(overrides) {
  return {
    ...{
      strategy: 'DefaultStrategy',
      controllerContract: controllerContract,
      contracts: CONTRACTS,
      signer: 'signer',
      garden: 'DefaultGarden',
      gasPrice: GAS_PRICE,
      reserveAsset: DAI,
      quotes: { WETH: { quote: { USD: { price: ETH_QUOTE } } } },
      name: 'DefaultStrategy',
      capitalAllocated: eth(1e3),
      maxGasFeePercentage: eth(0.1),
      duration: 100,
      executedAt: 0,
    },
    ...overrides,
  };
}

function getExecuteParams(overrides) {
  return {
    ...{
      now: 100,
      executedAt: 0,
      duration: 100,
      gardenNAV: eth(3e4),
      strategy: 'DefaultStrategy',
      strategies: ['DefaultStrategy'],
      strategiesStore: {
        DefaultStrategy: {
          address: 'DefaultStrategy',
          executedAt: 0,
          maxCapitalRequested: eth(1e3),
          capitalAllocated: from(0),
          maxAllocationPercentage: eth(),
        },
      },
      maxGasFeePercentage: eth(0.1),
      capitalAllocated: eth(0),
      maxCapitalRequested: eth(1e3),
      maxAllocationPercentage: eth(1), // 100%,
      reserveAsset: DAI,
      enteredCooldownCheck: true,
      active: true,
      liquidReserve: eth(1e4),
      gasPrice: GAS_PRICE,
      quotes: { WETH: { quote: { USD: { price: ETH_QUOTE } } } },
    },
    ...overrides,
  };
}

function mockStore(obj = {}) {
  const { getValues } = obj;
  const put = jest.fn().mockImplementation((key, value) => {});
  const get = jest.fn().mockImplementation((key) => {
    if (getValues && Object.keys(getValues).includes(key)) {
      return getValues[key];
    }
    if (key === 'gardens') {
      return '{}';
    }
    if (key === 'strategies') {
      return JSON.stringify({
        DefaultStrategy: {
          address: 'DefaultStrategy',
          executedAt: 0,
          maxCapitalRequested: eth(1e3),
          capitalAllocated: from(0),
        },
      });
    }
    if (key.indexOf('quorum-timestamp') > 0) {
      return NOW - COOLDOWN_PERIOD - 1;
    }
    if (key.indexOf('garden-whip') > 0) {
      return {};
    }
  });
  const del = jest.fn().mockImplementation((key) => {});
  getStore.mockReturnValue({
    put,
    get,
    del,
  });
  return { put, get, del };
}

function mockContracts({ strategyContract, gardenContract } = {}) {
  strategyContract = createStrategyContract(strategyContract);
  gardenContract = createGardenContract(gardenContract);

  getContractAt.mockImplementation((address, abi, singer) => {
    switch (address) {
      case WETH:
        return Promise.resolve(wethContract);
      case DAI:
        return Promise.resolve(daiContract);
      case USDC:
        return Promise.resolve(usdcContract);
      case WBTC:
        return Promise.resolve(wbtcContract);
      case 'GardenNFT':
        return Promise.resolve(gardenNftContract);
      case 'DefaultStrategy':
        return Promise.resolve(strategyContract);
      case 'DefaultGarden':
        return Promise.resolve(gardenContract);
      case 'GardenValuer':
        return Promise.resolve(gardenValuerContract);
      case 'BabControllerProxy':
        return Promise.resolve(controllerContract);
      case 'StrategyNFT':
        return Promise.resolve(strategyNftContract);
      default:
        return Promise.resolve({});
    }
  });
  return { gardenContract, strategyContract };
}

describe('keeper', () => {
  beforeAll(() => {
    getVotesForStrategy.mockReturnValue(undefined);

    getQuotes.mockReturnValue({
      WBTC: { quote: { USD: { price: 50000 } } },
      WETH: { quote: { USD: { price: 5000 } } },
    });

    getProvider.mockReturnValue(['provider', 'signer']);
    getRelayer.mockReturnValue({
      list: () => Promise.resolve([]),
    });

    getNow.mockReturnValue(Promise.resolve(NOW));
    getGasPrice.mockReturnValue(Promise.resolve(GAS_PRICE));
    mockStore();
  });

  describe('vote', () => {
    beforeEach(() => {
      mockStore();
    });

    test('resolves voting with only strategist vote', async () => {
      const { strategyContract, gardenContract } = mockContracts();

      await vote(
        getVoteParams({
          strategyContract,
          gardenContract,
        }),
      );

      expect(strategyContract.resolveVoting).toHaveBeenCalledWith(['Strategist'], [DEFAULT_STAKE], KEEPER_FEE_IN_USD, {
        gasLimit: GAS_LIMIT,
      });
    });

    test('resolves voting with votes from fauna', async () => {
      const { strategyContract, gardenContract } = mockContracts();
      getVotesForStrategy.mockReturnValue(Promise.resolve(votes));

      await vote(
        getVoteParams({
          strategyContract,
          gardenContract,
        }),
      );

      expect(strategyContract.resolveVoting).toHaveBeenCalledWith(
        ['0x1', 'Strategist'],
        [eth(1.6), DEFAULT_STAKE],
        KEEPER_FEE_IN_USD,
        {
          gasLimit: GAS_LIMIT,
        },
      );
    });

    test('writes down quorum timestamp', async () => {
      const { strategyContract, gardenContract } = mockContracts();

      const put = jest.fn();
      getStore.mockReturnValue({
        put,
        get: () => undefined,
        del: () => undefined,
      });

      await vote(
        getVoteParams({
          strategyContract,
          gardenContract,
        }),
      );

      expect(put).toHaveBeenCalledWith('DefaultStrategy-quorum-timestamp', NOW.toString());
    });

    test('deletes quorum timestamp after quorum is resolved', async () => {
      const { strategyContract, gardenContract } = mockContracts();

      const { del } = mockStore();

      await vote(
        getVoteParams({
          strategyContract,
          gardenContract,
        }),
      );

      expect(del).toHaveBeenCalledWith('DefaultStrategy-quorum-timestamp');
    });

    test('does NOT resolve votes on the first quorum', async () => {
      const { strategyContract, gardenContract } = mockContracts();

      mockStore({ getValues: { 'DefaultStrategy-quorum-timestamp': undefined } });

      await vote(
        getVoteParams({
          strategyContract,
          gardenContract,
        }),
      );

      expect(strategyContract.resolveVoting).not.toHaveBeenCalled();
    });

    test('does NOT resolve votes if voters do not have enough tokens', async () => {
      const { strategyContract, gardenContract } = mockContracts();

      getVotesForStrategy.mockReturnValue(
        Promise.resolve({
          votes: [
            ...votes.votes,
            {
              voter: '0x3',
              amount: '90000000000000000000000',
              isOpposed: true,
            },
          ],
        }),
      );

      await vote(
        getVoteParams({
          strategyContract,
          gardenContract,
        }),
      );

      expect(strategyContract.resolveVoting).not.toHaveBeenCalled();
    });

    test('does NOT resolve votes if quoruom is not reached', async () => {
      const { strategyContract, gardenContract } = mockContracts({
        gardenContract: { totalSupply: parse('100') },
      });

      await vote(
        getVoteParams({
          strategyContract,
          gardenContract,
        }),
      );

      expect(strategyContract.resolveVoting).not.toHaveBeenCalled();
    });

    test('does NOT resolve votes if users vote against', async () => {
      const { strategyContract, gardenContract } = mockContracts();

      getVotesForStrategy.mockReturnValue(
        Promise.resolve({
          votes: [
            ...votes.votes,
            {
              voter: '0x3',
              amount: '9000000000000000000',
              isOpposed: true,
            },
          ],
        }),
      );

      await vote(
        getVoteParams({
          strategyContract,
          gardenContract,
        }),
      );

      expect(strategyContract.resolveVoting).not.toHaveBeenCalled();
    });
  });

  describe('execute', () => {
    test('would execute a fresh strategy', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: true, enteredCooldownAt: NOW - COOLDOWN_PERIOD },
      });

      await execute(getExecuteParams({ strategyContract }));

      expect(strategyContract.executeStrategy).toHaveBeenCalledWith(eth(1e3), KEEPER_FEE_IN_USD, {
        gasLimit: GAS_LIMIT,
      });
    });

    test('would execute if (now <= executedAt + duration * CAPITAL_ALLOCATION_MAX_DURATION %)', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: true, enteredCooldownAt: NOW - COOLDOWN_PERIOD },
      });

      await execute(
        getExecuteParams({
          now: 170,
          executedAt: 100,
          duration: 100,
          strategyContract,
          strategiesStore: {
            DefaultStrategy: {
              address: 'DefaultStrategy',
              maxCapitalRequested: eth(1e3),
              capitalAllocated: from(0),
              maxAllocationPercentage: eth(),
              executedAt: 100,
              duration: 100,
            },
          },
        }),
      );

      expect(strategyContract.executeStrategy).toHaveBeenCalledWith(eth(1e3), KEEPER_FEE_IN_USD, {
        gasLimit: GAS_LIMIT,
      });
    });

    test('would NOT execute if (now > executedAt + duration * CAPITAL_ALLOCATION_MAX_DURATION %)', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: true, enteredCooldownAt: NOW - COOLDOWN_PERIOD },
      });

      await execute(
        getExecuteParams({
          now: 190,
          executedAt: 100,
          duration: 100,
          strategyContract,
          strategiesStore: {
            DefaultStrategy: {
              address: 'DefaultStrategy',
              maxCapitalRequested: eth(1e3),
              capitalAllocated: from(0),
              maxAllocationPercentage: eth(),
              executedAt: 100,
              duration: 100,
            },
          },
        }),
      );

      expect(strategyContract.executeStrategy).not.toHaveBeenCalled();
    });

    test('would NOT execute if captialNeeded <= maxCapitalRequested * 5%', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: {
          active: true,
          enteredCooldownAt: NOW - COOLDOWN_PERIOD,
          address: 'AlmostReachedCapStrategy',
        },
      });

      await execute(
        getExecuteParams({
          gardenNAV: eth(3e4),
          strategy: 'AlmostReachedCapStrategy',
          strategies: ['AlmostReachedCapStrategy'],
          strategyContract,
          strategiesStore: {
            AlmostReachedCapStrategy: {
              capitalAllocated: eth(950),
              maxCapitalRequested: eth(1e3),
              maxAllocationPercentage: eth(),
              address: 'AlmostReachedCapStrategy',
              executedAt: 0,
              duration: 100,
            },
          },
          capitalAllocated: eth(950),
          maxCapitalRequested: eth(1e3),
          maxAllocationPercentage: eth(), // 100%,
          liquidReserve: eth(1e4),
        }),
      );

      expect(strategyContract.executeStrategy).not.toHaveBeenCalled();
    });

    test('would NOT execute if (fee > capital * 0.01)', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: {
          active: true,
          enteredCooldownAt: NOW - COOLDOWN_PERIOD,
          gasCost: from(1e9),
          maxCapitalRequested: eth(1000),
        },
      });

      getVotesForStrategy.mockReturnValue(Promise.resolve(votes));

      await handler();

      expect(strategyContract.executeStrategy).not.toHaveBeenCalled();
    });

    test('execute a strategy with respect to maxCapitalRequested', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: true, enteredCooldownAt: NOW - COOLDOWN_PERIOD },
      });

      await execute(getExecuteParams({ strategyContract }));

      expect(strategyContract.executeStrategy).toHaveBeenCalledWith(eth(1e3), KEEPER_FEE_IN_USD, {
        gasLimit: GAS_LIMIT,
      });
    });

    test('execute a strategy with respect to maxAllocationPercentage', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: true, enteredCooldownAt: NOW - COOLDOWN_PERIOD },
      });

      await execute(
        getExecuteParams({
          gardenNAV: eth(3e4),
          strategyContract,
          capitalAllocated: eth(0),
          maxCapitalRequested: eth(1e4),
          maxAllocationPercentage: eth(0.1), // 10%,
        }),
      );

      expect(strategyContract.executeStrategy).toHaveBeenCalledWith(eth(3e3), KEEPER_FEE_IN_USD, {
        gasLimit: GAS_LIMIT,
      });
    });

    test('execute a strategy with respect to liquidReserve', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: true, enteredCooldownAt: NOW - COOLDOWN_PERIOD },
      });

      await execute(
        getExecuteParams({
          gardenNAV: eth(3e4),
          strategyContract,
          capitalAllocated: eth(0),
          maxCapitalRequested: eth(1e4),
          maxAllocationPercentage: eth(1), // 100%,
          // account for 5% buffer
          liquidReserve: eth(1e3).add(eth(1500)),
        }),
      );

      expect(strategyContract.executeStrategy).toHaveBeenCalledWith(
        eth(1e3)
          .sub(KEEPER_FEE_IN_USD)
          .sub(eth(1e3).mul(from(5e15)).div(eth())),
        KEEPER_FEE_IN_USD,
        {
          gasLimit: GAS_LIMIT,
        },
      );
    });

    test('execute a strategy with already allocated capital', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: true, enteredCooldownAt: NOW - COOLDOWN_PERIOD },
      });

      await execute(
        getExecuteParams({
          strategyContract,
          capitalAllocated: eth(1e3),
          maxCapitalRequested: eth(3e3),
          maxAllocationPercentage: eth(1), // 100%,
          liquidReserve: eth(1e4),
        }),
      );

      expect(strategyContract.executeStrategy).toHaveBeenCalledWith(eth(2e3), KEEPER_FEE_IN_USD, {
        gasLimit: GAS_LIMIT,
      });
    });

    test('ignores strategies with reached maxAllocationPercentage', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: true, enteredCooldownAt: NOW - COOLDOWN_PERIOD },
      });

      await execute(
        getExecuteParams({
          gardenNAV: eth(2e3),
          strategy: 'ReachedCapStrategy',
          strategies: ['ReachedCapStrategy'],
          strategyContract,
          strategiesStore: {
            ReachedCapStrategy: {
              capitalAllocated: eth(1e3),
              maxCapitalRequested: eth(1e9),
              maxAllocationPercentage: eth(0.5),
              address: 'ReachedCapStrategy',
              executedAt: 0,
              duration: 100,
            },
          },
          capitalAllocated: eth(1e3),
          maxCapitalRequested: eth(1e9),
          maxAllocationPercentage: eth(0.5), // 100%,
          liquidReserve: eth(1e4),
        }),
      );

      expect(strategyContract.executeStrategy).not.toHaveBeenCalled();
    });

    test('ignores strategies with reached maxCapitalRequested', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: true, enteredCooldownAt: NOW - COOLDOWN_PERIOD },
      });

      await execute(
        getExecuteParams({
          gardenNAV: eth(3e4),
          strategy: 'ReachedCapStrategy',
          strategies: ['ReachedCapStrategy'],
          strategyContract,
          strategiesStore: {
            ReachedCapStrategy: {
              capitalAllocated: eth(1e3),
              maxCapitalRequested: eth(1e3),
              maxAllocationPercentage: eth(),
              address: 'ReachedCapStrategy',
              executedAt: 0,
              duration: 100,
            },
          },
          capitalAllocated: eth(1e3),
          maxCapitalRequested: eth(1e3),
          maxAllocationPercentage: eth(1), // 100%,
          liquidReserve: eth(1e4),
        }),
      );

      expect(strategyContract.executeStrategy).not.toHaveBeenCalled();
    });

    test('allocates capital to a strategy with the least capitaAllocated', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: true, enteredCooldownAt: NOW - COOLDOWN_PERIOD },
      });

      await execute(
        getExecuteParams({
          gardenNAV: eth(5e4),
          strategy: 'LeastCapitalAllocatedStrategy',
          strategies: ['DefaultStrategy', 'BigCapitalStrategy', 'LeastCapitalAllocatedStrategy'],
          strategyContract,
          strategiesStore: {
            DefaultStrategy: {
              capitalAllocated: eth(2e3),
              maxCapitalRequested: eth(3e3),
              maxAllocationPercentage: eth(),
              address: 'DefaultStrategy',
              executedAt: 0,
              duration: 100,
            },
            LeastCapitalAllocatedStrategy: {
              capitalAllocated: eth(1e3),
              maxCapitalRequested: eth(1e4),
              maxAllocationPercentage: eth(),
              address: 'LeastCapitalAllocatedStrategy',
              executedAt: 0,
              duration: 100,
            },
            BigCapitalStrategy: {
              capitalAllocated: eth(1e4),
              maxCapitalRequested: eth(1e5),
              maxAllocationPercentage: eth(),
              address: 'BigCapitalStrategy',
              executedAt: 0,
              duration: 100,
            },
          },
          capitalAllocated: eth(1e3),
          maxCapitalRequested: eth(3e3),
          maxAllocationPercentage: eth(1), // 100%,
        }),
      );

      expect(strategyContract.executeStrategy).toHaveBeenCalledWith(eth(2e3), KEEPER_FEE_IN_USD, {
        gasLimit: GAS_LIMIT,
      });
    });

    test('allocates capital up to 1/strategies % limit', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: true, enteredCooldownAt: NOW - COOLDOWN_PERIOD },
      });

      await execute(
        getExecuteParams({
          gardenNAV: eth(4e4),
          strategy: 'LeastCapitalAllocatedStrategy',
          strategies: ['DefaultStrategy', 'BigCapitalStrategy', 'LeastCapitalAllocatedStrategy', 'ExtraStrategy'],
          strategyContract,
          strategiesStore: {
            DefaultStrategy: {
              capitalAllocated: eth(2e3),
              maxCapitalRequested: eth(1e5),
              maxAllocationPercentage: eth(),
              address: 'DefaultStrategy',
              executedAt: 0,
              duration: 100,
            },
            LeastCapitalAllocatedStrategy: {
              capitalAllocated: eth(0),
              maxCapitalRequested: eth(1e5),
              maxAllocationPercentage: eth(),
              address: 'LeastCapitalAllocatedStrategy',
              executedAt: 0,
              duration: 100,
            },
            BigCapitalStrategy: {
              capitalAllocated: eth(1e4),
              maxCapitalRequested: eth(1e5),
              maxAllocationPercentage: eth(),
              address: 'BigCapitalStrategy',
              executedAt: 0,
              duration: 100,
            },
            ExtraStrategy: {
              capitalAllocated: eth(1e4),
              maxCapitalRequested: eth(1e5),
              maxAllocationPercentage: eth(),
              address: 'ExtraStrategy',
              executedAt: 0,
              duration: 100,
            },
          },
          capitalAllocated: eth(0),
          maxCapitalRequested: eth(9e9),
          maxAllocationPercentage: eth(1), // 100%,
          liquidReserve: eth(2e4),
        }),
      );

      expect(strategyContract.executeStrategy).toHaveBeenCalledWith(eth(1e4), KEEPER_FEE_IN_USD, {
        gasLimit: GAS_LIMIT,
      });
    });

    test('sqeeze extra capital from old strategies to hungry strategies', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: true, enteredCooldownAt: NOW - COOLDOWN_PERIOD },
      });

      await execute(
        getExecuteParams({
          now: 90,
          gardenNAV: eth(4e3),
          strategy: 'DefaultStrategy',
          strategies: ['DefaultStrategy', 'OldStrategy'],
          strategyContract,
          strategiesStore: {
            DefaultStrategy: {
              capitalAllocated: eth(2e3),
              maxCapitalRequested: eth(9e9),
              maxAllocationPercentage: eth(),
              address: 'DefaultStrategy',
              executedAt: 90,
              duration: 100,
            },
            OldStrategy: {
              capitalAllocated: eth(0),
              maxCapitalRequested: eth(1e3),
              maxAllocationPercentage: from(0),
              address: 'OldStrategy',
              executedAt: 1,
              duration: 100,
            },
          },
          capitalAllocated: eth(2e3),
          maxCapitalRequested: eth(9e9),
          maxAllocationPercentage: eth(), // 100%,
          liquidReserve: eth(1e4),
        }),
      );

      expect(strategyContract.executeStrategy).toHaveBeenCalledWith(eth(2e3), KEEPER_FEE_IN_USD, {
        gasLimit: GAS_LIMIT,
      });
    });

    test('sqeeze extra capital from full strategies to hungry strategies', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: true, enteredCooldownAt: NOW - COOLDOWN_PERIOD },
      });

      await execute(
        getExecuteParams({
          gardenNAV: eth(4e3),
          strategy: 'DefaultStrategy',
          strategies: ['DefaultStrategy', 'FullStrategy'],
          strategyContract,
          strategiesStore: {
            DefaultStrategy: {
              capitalAllocated: eth(2e3),
              maxCapitalRequested: eth(9e9),
              maxAllocationPercentage: eth(),
              address: 'DefaultStrategy',
              executedAt: 0,
              duration: 100,
            },
            FullStrategy: {
              capitalAllocated: eth(1e3),
              maxCapitalRequested: eth(1e3),
              maxAllocationPercentage: from(0),
              address: 'FullStrategy',
              executedAt: 0,
              duration: 100,
            },
          },
          capitalAllocated: eth(2e3),
          maxCapitalRequested: eth(9e9),
          maxAllocationPercentage: eth(), // 100%,
          liquidReserve: eth(1e4),
        }),
      );

      expect(strategyContract.executeStrategy).toHaveBeenCalledWith(eth(1e3), KEEPER_FEE_IN_USD, {
        gasLimit: GAS_LIMIT,
      });
    });

    test('extra capital from full strategies to hungry strategies is evenly distributed', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: true, enteredCooldownAt: NOW - COOLDOWN_PERIOD },
      });

      await execute(
        getExecuteParams({
          gardenNAV: eth(8e3),
          strategy: 'DefaultStrategy',
          strategies: ['DefaultStrategy', 'FullStrategy', 'HungryStrategy', 'AnotherFullStrategy'],
          strategyContract,
          strategiesStore: {
            HungryStrategy: {
              capitalAllocated: eth(2e3),
              maxCapitalRequested: eth(9e9),
              maxAllocationPercentage: eth(),
              address: 'HungryStrategy',
              executedAt: 0,
              duration: 100,
            },
            DefaultStrategy: {
              capitalAllocated: eth(2e3),
              maxCapitalRequested: eth(9e9),
              maxAllocationPercentage: eth(),
              address: 'DefaultStrategy',
              executedAt: 0,
              duration: 100,
            },
            AnotherFullStrategy: {
              capitalAllocated: eth(1e3),
              maxCapitalRequested: eth(1e3),
              maxAllocationPercentage: from(0),
              address: 'AnotherFullStrategy',
              executedAt: 0,
              duration: 100,
            },
            FullStrategy: {
              capitalAllocated: eth(1e3),
              maxCapitalRequested: eth(1e3),
              maxAllocationPercentage: from(0),
              address: 'FullStrategy',
              executedAt: 0,
              duration: 100,
            },
          },
          capitalAllocated: eth(2e3),
          maxCapitalRequested: eth(9e9),
          maxAllocationPercentage: eth(), // 100%,
          liquidReserve: eth(1e4),
        }),
      );

      expect(strategyContract.executeStrategy).toHaveBeenCalledWith(eth(1e3), KEEPER_FEE_IN_USD, {
        gasLimit: GAS_LIMIT,
      });
    });
  });

  describe('finalize', () => {
    test('finalize a strategy', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: true, executedAt: NOW - (DURATION + 1), capitalAllocated: eth(1) },
      });

      await finalize(getFinalizeParams({ strategyContract }));

      expect(strategyContract.finalizeStrategy).toHaveBeenCalledWith(KEEPER_FEE_IN_USD, 'NftUrl', 0, {
        gasLimit: GAS_LIMIT,
      });
    });

    test('would NOT finalize already finalzed strategy', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { finalized: true, active: true, executedAt: NOW - (DURATION + 1) },
      });

      await handler();

      expect(strategyContract.finalizeStrategy).not.toHaveBeenCalled();
    });
  });

  describe('expire', () => {
    test('expire a strategy', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: false, enteredAt: NOW - (DAY_IN_SECONDS * MAX_CANDIDATE_PERIOD + 1) },
      });

      await expire(getExpireParams({ strategyContract }));

      expect(strategyContract.expireStrategy).toHaveBeenCalledWith(KEEPER_FEE_IN_USD, {
        gasLimit: GAS_LIMIT,
      });
    });
  });

  describe('fee', () => {
    test('calculates correct fee for garden in WETH', async () => {
      const { strategyContract } = mockContracts({
        strategyContract: { active: false, enteredAt: NOW - (DAY_IN_SECONDS * MAX_CANDIDATE_PERIOD + 1) },
      });

      await expire(getExpireParams({ strategyContract, reserveAsset: WETH }));

      expect(strategyContract.expireStrategy).toHaveBeenCalledWith(KEEPER_FEE, {
        gasLimit: GAS_LIMIT,
      });
    });

    test('calculates correct fee for garden in DAI', async () => {
      const { strategyContract } = mockContracts({
        gardenContract: { reserveAsset: DAI },
        strategyContract: { active: false, enteredAt: NOW - (DAY_IN_SECONDS * MAX_CANDIDATE_PERIOD + 1) },
      });

      await expire(getExpireParams({ strategyContract, reserveAsset: DAI }));

      // currently limited to 2.0 DAI but should be fixed
      expect(strategyContract.expireStrategy).toHaveBeenCalledWith(KEEPER_FEE_IN_USD, {
        gasLimit: GAS_LIMIT,
      });
    });

    test('calculates correct fee for garden in USDC', async () => {
      const { strategyContract } = mockContracts({
        gardenContract: { reserveAsset: USDC },
        strategyContract: { active: false, enteredAt: NOW - (DAY_IN_SECONDS * MAX_CANDIDATE_PERIOD + 1) },
      });

      await expire(getExpireParams({ strategyContract, reserveAsset: USDC }));

      expect(strategyContract.expireStrategy).toHaveBeenCalledWith(KEEPER_FEE_IN_USD.div(1e12), {
        gasLimit: GAS_LIMIT,
      });
    });

    test('calculates correct fee for garden in WBTC', async () => {
      const { strategyContract } = mockContracts({
        gardenContract: { reserveAsset: WBTC },
        strategyContract: { active: false, enteredAt: NOW - (DAY_IN_SECONDS * MAX_CANDIDATE_PERIOD + 1) },
      });

      await expire(getExpireParams({ strategyContract, reserveAsset: WBTC }));

      expect(strategyContract.expireStrategy).toHaveBeenCalledWith(KEEPER_FEE_IN_USD.div(WBTC_QUOTE).div(1e10), {
        gasLimit: GAS_LIMIT,
      });
    });
  });
});
