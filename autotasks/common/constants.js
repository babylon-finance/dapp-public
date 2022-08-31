import { from, eth } from 'common/utils/helpers.js';

export const HEART_GARDEN_ADDRESS = '0xaA2D49A1d66A58B8DD0687E730FefC2823649791';
export const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
export const BABL = '0xF4Dc48D260C93ad6a96c5Ce563E70CA578987c74';
export const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
export const WBTC = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
export const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
export const AAVE = '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9';
export const HEART_GARDEN = '0xaA2D49A1d66A58B8DD0687E730FefC2823649791';
export const HEART = '0x51e6775b7bE2eA1d20cA02cFEeB04453366e72C8';
export const RESERVES = 'ETH,WBTC,USDC,DAI,WETH,BABL,AAVE';
export const FIAT_CURRENCIES = 'USD,JPY,EUR,CNY';
export const DAY_IN_SECONDS = 60 * 60 * 24;
export const KEEPER_PERCENTAGE = 103; // 3%
export const PROTOCOL_MANAGEMENT_FEE = from(5e15);
export const GAS_LIMIT_PERCENTAGE = 250; // 200%
export const MAX_CANDIDATE_PERIOD = 7;
export const MAX_GAS_PRICE = 200000000000;
export const MIN_LIQ_PERCENTAGE = eth(0.05);
export const MAX_FEE_MAP = {
  [WETH]: eth(),
  [AAVE]: eth(18),
  [BABL]: eth(40),
  [DAI]: eth(2000),
  [USDC]: from(2000 * 1e6),
  [WBTC]: from(0.05 * 1e8),
};
export const MIN_DEPOSIT_BY_RESERVE = {
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': '0.5',
  '0x6b175474e89094c44da98b954eedeac495271d0f': '2000',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '2000',
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': '0.03',
  '0xf4dc48d260c93ad6a96c5ce563e70ca578987c74': '20',
  '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9': '12',
};
export const YEAR_IN_SECONDS = 86400 * 365;
export const HEART_LOCKING_PERIODS = [
  { index: 0, label: '6 months', seconds: 86400 * 183, discount: 0 },
  { index: 1, label: '1 year', seconds: YEAR_IN_SECONDS, discount: 2 },
  { index: 2, label: '2 years', seconds: YEAR_IN_SECONDS * 2, discount: 4.5 },
  { index: 3, label: '4 years', seconds: YEAR_IN_SECONDS * 4, discount: 10 },
];
export const DECIMALS_BY_RESERVE = {
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 18,
  '0x6b175474e89094c44da98b954eedeac495271d0f': 18,
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 6,
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 8,
  '0xf4dc48d260c93ad6a96c5ce563e70ca578987c74': 18,
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 18,
};
export const AUTOTASK_DURATION = 280 * 1000; // in miliseconds (includes 20 secs margin)
export const GAS_NOW_URL = 'https://www.gasnow.org/api/v3/gas/price';
export const BLOCKNATIVE_API_URL = 'https://api.blocknative.com';
export const GARDEN_MEMBERS_URL = 'https://www.babylon.finance/api/v1/get-members/';
export const CAPITAL_ALLOCATION_MAX_DURATION = 70; // 70%
export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
export const UNIV2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
export const CAPITAL_ALLOCATION_GAS_FEE_RATIO = eth(0.01); // 1e18 === 100%; 5e16 === 5%
