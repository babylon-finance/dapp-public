const { BigNumber } = require('@ethersproject/bignumber');
const { parseEther } = require('@ethersproject/units');

module.exports = {
  PROVIDER_URL: process.env.REACT_APP_CHAIN_ID === '1' ? process.env.QUICKNODE_HTTP_URL : '',
  ALCHEMY_URL: 'https://eth-mainnet.alchemyapi.io/v2/XGC6ieOFYeivjsMk6PQYbIWY9l-741QH',
  BASE_IPFS_GATEWAY_URL: 'https://babylon.mypinata.cloud/ipfs/',
  CMC_API_URL: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
  BASE_BLOXY_URL: 'https://api.bloxy.info',
  BLOXY_HOLDERS_ROUTE: '/token/token_holders_list',
  BASE_SITE_URL: 'https://babylon.finance',
  BASE_PARSIQ_URL: 'https://babylon-live.parsiq.net',
  TRANSPORT_TYPE: {
    telegram: 'telegram',
  },
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  PORPHET_FLOOR: BigNumber.from(parseEther('0.25')),
  START_BLOCK: 12446239,
  CONTROLLER_ADDRESS: '0xd4a5b5fcb561daf3adf86f8477555b92fba43b5f',
  PROPHET_ADDRESS: '0x26231a65ef80706307bbe71f032dc1e5bf28ce43',
  MINTED_RECORD: '315082401025884738',
  MINTED_PROPHETS: 2592,
  TEST_ADDRESS: '0xEeebdeAEC2C87Ee38fA8AA3a148F49a87990d30c',
  HEART_ADDRESS: '0xaA2D49A1d66A58B8DD0687E730FefC2823649791',
};
