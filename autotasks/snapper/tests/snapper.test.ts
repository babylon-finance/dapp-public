import { submitMetrics } from '../src/metricsEngine';
import { handler } from '../src/index';

import { getQuotes } from '../../common/utils/quotes.js';
import { getProvider } from '../../common/utils/web3';

import { jest } from '@jest/globals';

jest.mock('../../common/utils/quotes');
jest.mock('../../common/utils/fauna');
jest.mock('../../../src/1.json', () => ({
  contracts: {
    IWETH: { abi: 'IWETH' },
    ERC20: { abi: 'ERC20' },
    BabControllerProxy: { address: 'BabControllerProxy' },
    BabController: { abi: 'BabController' },
    DefaultGarden: { abi: 'DefaultGarden' },
    Garden: { abi: 'Garden' },
    Strategy: { abi: 'Strategy' },
    GardenNFT: { abi: 'GardenNFT' },
  },
}));

jest.mock('../../common/utils/web3', () => {
  const originalModule: Object = jest.requireActual('../../common/utils/web3');

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

jest.mock('../src/metricsEngine');

jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn());

describe('snapper', () => {
  beforeAll(() => {
    (getQuotes as unknown as jest.Mock).mockReturnValue({
      WBTC: { quote: { USD: { price: 50000 } } },
      WETH: { quote: { USD: { price: 5000 } } },
    });

    (getProvider as unknown as jest.Mock).mockReturnValue(['provider', 'signer']);
  });

  describe('submitMetrics', () => {
    test('gathers metrics and inserts data into faunaDB', async () => {
      await handler({ apiKey: '', apiSecret: '' });

      expect(submitMetrics).toHaveBeenCalled();
    });
  });
});
