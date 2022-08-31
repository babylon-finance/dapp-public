import { JsonRpcProvider } from '@ethersproject/providers';

export const TEMP_DISABLE_FLOW = [
  '0xB5bD20248cfe9480487CC0de0d72D0e19eE0AcB6', // Fountain
  '0x3eeC6Ac8675ab1B4768f6032F0598e36Ac64f415', // Stable Pebble
  '0x1D50c4F18D7af4fCe2Ea93c7942aae6260788596', // Stable Garden
  '0xa7D88c885209e953Eb66B238914a639cbbad94a8', // Amplify Stables
  '0x99acDD18eb788E199be6Bf64d14142329316687a', // WATERFALL2
];

export const YEAR_IN_SECONDS = 86400 * 365;
export const HEART_GARDEN_ADDRESS = '0xaA2D49A1d66A58B8DD0687E730FefC2823649791';
export const HEART_ADDRESS = '0x51e6775b7bE2eA1d20cA02cFEeB04453366e72C8';
export const BLOCKNATIVE_API_URL = 'https://api.blocknative.com';
export const LITEPAPER_URL = 'https://www.withtally.com/governance/babylon';
export const TALLY_URL = 'https://www.withtally.com/governance/babylon';
export const MAX_GARDEN_STRATEGIES = 20;
export const SUBSIDY_ACTIVE = process.env.REACT_APP_SUBSIDY_ACTIVE === 'true' || false;
export const RESERVES_CREATION_CONFIG = {
  dai: { minDeposit: 2000, totalDepositLimit: 100000000, minLiquidityAsset: 100000 },
  usdc: { minDeposit: 2000, totalDepositLimit: 100000000, minLiquidityAsset: 100000 },
  weth: { minDeposit: 0.5, totalDepositLimit: 100000, minLiquidityAsset: 50 },
  wbtc: { minDeposit: 0.03, totalDepositLimit: 2000, minLiquidityAsset: 4 },
  babl: { minDeposit: 25, totalDepositLimit: 1000000, minLiquidityAsset: 2000 },
  aave: { minDeposit: 12, totalDepositLimit: 500000, minLiquidityAsset: 1000 },
};

export const DEFAULT_CONFIRM_STATES = {
  terms: false,
  nft: false,
  risk: false,
  lock: true,
};

export const HEART_LOCKING_PERIODS = [
  { index: 0, label: '6 months', seconds: 183 * 86400, discount: 0 },
  { index: 1, label: '1 year', seconds: YEAR_IN_SECONDS, discount: 2 },
  { index: 2, label: '2 years', seconds: YEAR_IN_SECONDS * 2, discount: 4.5 },
  { index: 3, label: '4 years', seconds: YEAR_IN_SECONDS * 4, discount: 10 },
];
// Signature TX Values
export const MAX_CLAIM_BY_SIG_GAS = 360000;
export const MAX_CLAIM_AND_STAKE_BY_SIG_GAS = 900000;
export const MAX_WITHDRAW_BY_SIG_GAS = 520000;
export const MAX_WITHDRAW_BY_SIG_PENALTY_GAS = 5500000;
export const MEDIAN_DEPOSIT_NFT_BY_SIG_GAS = 898925;
export const MAX_DEPOSIT_BY_SIG_GAS = 565000;
export const MAX_BOND_ASSET = 1200000;

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ETH_CURVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const ACCOUNTANT_ADDRESS = '0x529f9586169377e719268bae1edcce748318122e';
export const DEFAULT_TX_MAX_FEE_USD = 100;
export const PROPHETS_MINTED = 2592;
export const GARDEN_NEW_NUM_DAYS = 14;
export const GAS_PRICES_STALE_AFTER_MSECS = 15000;
export const MIN_SAFE_ACCOUNTANT_BAL_ETH = 0.1;
export const UNDER_MAINTENANCE = process.env.REACT_APP_UNDER_MAINTENANCE === 'true' || false;
export const USE_DEPOSIT_BY_SIG = process.env.REACT_APP_DEPOSIT_BY_SIG_ENABLED === 'true' || true;
export const YEARN_VAULT_LIST_API_URL = 'https://api.yearn.finance/v1/chains/1/vaults/all';
export const BASE_IPFS_GATEWAY_URL = 'https://babylon.mypinata.cloud/ipfs/';
export const ENV_CHAIN_ID = process.env.REACT_APP_CHAIN_ID;
export const IS_MAINNET = process.env.REACT_APP_CHAIN_ID === '1';
export const GLOBAL_IPFS_TIMEOUT_MS = 10 * 1000;
export const DEFAULT_INVESTMENT_ICON_SIZE = 30;
export const GAS_STATION_API_URL = 'https://www.gasnow.org/api/v3/gas/price?utm_source=babylon_finance';
export const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
export const BLOCKNATIVE_DAPPID = process.env.REACT_APP_BLOCKNATIVE_DAPPID;
export const FAUNA_CLIENT_SECRET = process.env.REACT_APP_FAUNADB_SERVER_SECRET;
export const APP_URL = 'https://www.babylon.finance/';
export const CONTACT_EMAIL = 'contact@babylon.finance';
export const INBOUND_EMAIL = 'inbound@babylon.finance';
export const APP_NAME = 'Babylon.finance';
export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_PROD = process.env.NODE_ENV === 'production';
export const BASE_NFT_URL = IS_PROD ? `${APP_URL}api/v1/nft/` : `localhost:8888/api/v1/nft/`;
export const SENTRY_SAMPLE_RATE = IS_PROD ? 0.1 : 1.0;
export const STARTING_BLOCK = 12413620;
export const SENTRY_DSN = process.env.REACT_APP_SENTRY_KEY || '';
export const MAX_GAS_FULL_SUBSIDY_PRICE = 125;
export const RESERVES = 'BABL,ETH,WBTC,USDC,DAI,WETH,AAVE';
export const MAIN_DISCORD_INVITE_LINK = 'https://discord.gg/babylon';
export const FIAT_CURRENCIES = 'USD,JPY,EUR,CNY';
export const RPC_URL = ENV_CHAIN_ID === '1' ? process.env.REACT_APP_QUICKNODE_HTTP_URL : 'http://127.0.0.1:8545';
export const ALCHEMY_WS_URL = 'wss://eth-mainnet.ws.alchemyapi.io/v2/QUXRm3G97Ue2oJHfh5KCTaC2arHgjiXp';
export const WS_URL =
  ENV_CHAIN_ID === '1'
    ? (IS_DEV ? ALCHEMY_WS_URL : process.env.REACT_APP_QUICKNODE_WS_URL) || ''
    : 'ws://localhost:8545';

export const BASE_DOMAIN_URL = IS_DEV ? 'http://localhost:8888' : 'https://www.babylon.finance';
export const getNotifyOptions = (networkId?: number) => {
  return {
    dappId: BLOCKNATIVE_DAPPID,
    system: 'ethereum',
    networkId: networkId || 1,
    darkMode: true,
    desktopPosition: 'bottomLeft',
    txApproveReminderTimeout: 10000,
    txStallPendingTimeout: 30000,
  };
};

export const BREAKPOINTS = {
  large: '1440px',
  standard: '1280px',
  medium: '992px',
  mobile: '598px',
};

const WALLET_CONNECT = {
  walletName: 'walletConnect',
  rpc: {
    1: RPC_URL,
  },
  preferred: true,
};

export const walletsSupported = [{ walletName: 'metamask', preferred: true }];

if (ENV_CHAIN_ID === '1') {
  walletsSupported.push(WALLET_CONNECT);
}

// Reuse the same instance
let rpcProvider;

export const getProvider = (force: boolean = false): JsonRpcProvider => {
  if (!rpcProvider || force) {
    rpcProvider = new JsonRpcProvider(RPC_URL);
  }
  return rpcProvider;
};

export const GOVERNANCE_PROPOSALS_INFO = [
  {
    displayId: 26,
    id: '37739355232741924385947675751466910155625583478655815511040285529952573461540',
    name: 'BIP-26: 💰 Security Bounty Rewards',
  },
  {
    displayId: 25,
    id: '52568742925274466133386400284731251288414041647812700673930289619709761985746',
    name: 'BIP-25: 🕵️ Security Bounty Rewards',
  },
  {
    displayId: 23,
    id: '82375474957633426622541765424852873600349768070021673704036628167191474647983',
    name: 'BIP-23: 🚑 Fuse Hack Actions',
  },
  {
    displayId: 22,
    id: '83310954882073965923000200493074196623795911070618625373163676013025576580745',
    name: 'BIP-22: 🫀 The Heart of Babylon Reloaded',
  },
  {
    displayId: 21,
    id: '21514074957108090911489421425678739498534527282577121527635622102194742845904',
    name: 'BIP-21: 🕵️ Security Bounty',
  },
  {
    displayId: 20,
    id: '41313043056893538475502527403885805562605491584091209137895451494691048349980',
    name: 'BIP-20: 💰 Idle Finance Bounty',
  },
  {
    displayId: 19,
    id: '93421996078266288913900757925842757765741472971850515018264167322542349349737',
    name: 'BIP-19: 🛡️ Babylon Shield',
  },
  {
    displayId: 18,
    id: '36991166096317872536390464099422757581316990721078254119550388071166409754542',
    name: 'BIP-18: 🤝 Verify Pickle & Paladin Gardens',
  },
  {
    displayId: 17,
    id: '24793948250029472218768149021450997854742207683782731217359843291070456377520',
    name: 'BIP-17: 💰 HackMoney',
  },
  {
    displayId: 16,
    id: '10015185773157414746034784743836462091895169213864005592670733679822312309251',
    name: 'BIP-16: 💰 Marketing Spend',
  },
  {
    displayId: 15,
    id: '86171126911354945858603088962227503010533461806058649199425320470185120379092',
    name: 'BIP-15: 🤝 Referral Program',
  },
  {
    displayId: 14,
    id: '4498211051769687188613261549867299236087323159037497869444453542749799584996',
    name: 'BIP-14: 🌊 Increase BABL Liquidity',
  },
  {
    displayId: 13,
    id: '54130041705785477270353544160521789609557076497160491094804860428001291433826',
    name: 'BIP-13: Enable Garden Tokens Transfer',
  },
  {
    displayId: 12,
    id: '94595419675211353671813838332426780458146885466769664104415679756763149367979',
    name: 'BIP-12: Verified Gardens',
  },
  {
    displayId: 11,
    id: '43136438228420234127439242165728406855560943995597370153579727537282848124169',
    name: 'BIP-11: Heart Bonding Program',
  },
  {
    displayId: 10,
    id: '78817265558555979358372190833964450694070165926941922942875808883601373432428',
    name: 'BIP-10: Heart Tokenomics',
  },
  {
    displayId: 9,
    id: '96926906852583318420120210736156562250032829980249658428548490379878799127253',
    name: 'BIP-9: Development Fund',
  },
  {
    displayId: 8,
    id: '109344422653955248538795393396780479297640603841439438135853586337408509937165',
    name: 'BIP-8: Setup BABL Fuse pool on Rari',
  },
  {
    displayId: 7,
    id: '42309909082201573650128991948203453910830611292212115544850475689408371624584',
    name: 'BIP-7: Mining Adjustments',
  },
  {
    displayId: 6,
    id: '68090775159519722507573580472107742668797454677789568657838887072860212998947',
    name: 'BIP-6: Babylon Diplomats',
  },
  {
    displayId: 5,
    id: '42085977095607266457097219539404807865434877802710084240266272159723037383793',
    name: 'BIP-5: Garden Seed Program',
  },
  {
    displayId: 4,
    id: '32156439968584618709935706941284187564699780275842591571726595721389081057467',
    name: 'BIP-4: Uniswap V3 Pool + Harvest Vault',
  },
  {
    displayId: 3,
    id: '101114191999043486697736420869088395356011912576891508818550663031478128389980',
    name: 'BIP-3: The Prophets Arrival',
  },
  {
    displayId: 2,
    id: '51316540435411867931073262327741931439077029233771028218250644149379053250372',
    name: 'BIP-2: Establish the Babylon Foundation',
  },
  {
    displayId: 1,
    id: '86895390742944283448920585513992384112055913494715263243154281712731665188411',
    name: 'BIP-1: BABL Mining Program',
  },
];

export const PRIMARY_TOKENS = [
  {
    chainId: 1,
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    name: 'Wrapped Ethereum',
    symbol: 'WETH',
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/uniswap/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    liquidity: 1000000,
    swappable: true,
    integration: 'uniV3',
  },
  {
    chainId: 1,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389',
    liquidity: 1000000,
    swappable: true,
    integration: 'uniV3',
  },
  {
    chainId: 1,
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    logoURI: 'https://tokens.1inch.exchange/0x6b175474e89094c44da98b954eedeac495271d0f.png',
    liquidity: 1000000,
    swappable: true,
    integration: 'uniV3',
  },
  {
    chainId: 1,
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    name: 'WrappedBTC',
    symbol: 'WBTC',
    decimals: 8,
    logoURI: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png?1548822744',
    liquidity: 1000000,
    swappable: true,
    integration: 'uniV3',
  },
  {
    chainId: 1,
    address: '0xf4dc48d260c93ad6a96c5ce563e70ca578987c74',
    name: 'Babylon Finance',
    symbol: 'BABL',
    decimals: 18,
    logoURI: 'https://babylon.finance/babl_92x92.png',
    liquidity: 1000000,
    swappable: true,
    integration: 'uniV3',
  },
  {
    chainId: 1,
    address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    name: 'AAVE',
    symbol: 'AAVE',
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7278.png',
    liquidity: 1000000,
    swappable: true,
    integration: 'uniV3',
  },
  {
    chainId: '1',
    address: '0xaA2D49A1d66A58B8DD0687E730FefC2823649791',
    name: 'The Heart Garden',
    symbol: 'hBABL',
    decimals: 18,
    logoURI: '/hBABL.png',
    liquidity: 1000000,
    swappable: false,
    integration: 'babylon',
  },
  {
    chainId: '1',
    address: '0xa6c25548df506d84afd237225b5b34f2feb1aa07',
    name: 'fDAI',
    symbol: 'fDAI',
    decimals: 18,
    logoURI: '/rari.png',
    liquidity: 1000000,
    swappable: false,
    integration: 'rari',
  },
  {
    chainId: '1',
    address: '0xa54c548d11792b3d26ad74f5f899e12cdfd64fd6',
    name: 'fFRAX',
    symbol: 'fFRAX',
    decimals: 18,
    logoURI: '/rari.png',
    liquidity: 1000000,
    swappable: false,
    integration: 'rari',
  },
  {
    chainId: '1',
    address: '0x812eedc9eba9c428434fd3ce56156b4e23012ebc',
    name: 'fBABL',
    symbol: 'fBABL',
    decimals: 18,
    logoURI: '/rari.png',
    liquidity: 1000000,
    swappable: false,
    integration: 'rari',
  },
  {
    chainId: '1',
    address: '0x7dbc3af9251756561ce755fcc11c754184af71f7',
    name: 'fWETH',
    symbol: 'fWETH',
    decimals: 18,
    logoURI: '/rari.png',
    liquidity: 1000000,
    swappable: false,
    integration: 'rari',
  },
  {
    chainId: '1',
    address: '0x3a2804ec0ff521374af654d8d0daa1d1ae1ee900',
    name: 'fFEI',
    symbol: 'fFEI',
    decimals: 18,
    logoURI: '/rari.png',
    liquidity: 1000000,
    swappable: false,
    integration: 'rari',
  },
  {
    chainId: '1',
    address: '0x705b3aCaF102404CfDd5e4A60535E4e70091273C',
    name: 'BABL-ETH',
    symbol: 'BABL-ETH',
    decimals: 18,
    logoURI: '/gamma.png',
    liquidity: 1000000,
    swappable: false,
    integration: 'gamma',
  },
];

// PROPHET STUFF
export const PROPHET_CALENDAR_LINK =
  'https://www.google.com/calendar/render?action=TEMPLATE&text=The+Arrival%3A+Prophets+of+Babylon&details=The+Prophets+are+coming+to+Babylon%21+Join+us+for+a+special+launch+event+and+secure+your+spot+by+completing+the+invite+flow+starting+in+Discord.%0A%0AHead+to+Discord%3A%0Ahttps%3A%2F%2Fdiscord.com%2Finvite%2Fbabylon%0A%0ACheck+out+Babylon%3A%0Ahttps%3A%2F%2Fwww.babylon.finance&location=Babylon&dates=20211115T160000Z%2F20211120T000000Z';
export const PROPHET_PRICE = '0.25';
export const PROPHET_ADDRESS = '0x26231A65EF80706307BbE71F032dc1e5Bf28ce43';
export const ARRIVAL_ADDRESS = '0xE9883Aee5828756216FD7DF80eb56Bff90f6E7D7';
export const ADMIN_ADDRESSES = [
  '0x1C4aD6087B14e69a4f8ae378ccEF1DF2A46c671f',
  '0xde3baaea1799338349c50e0f80d37a8bae79cc54',
  '0xc31C4549356d46c37021393EeEb6f704B38061eC',
  '0x48d21Dc6BBF18288520E9384aA505015c26ea43C',
  '0x166D00d97AF29F7F6a8cD725F601023b843ade66',
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  '0x769741a2b76C6B1c4Da7A022754d567Cc7954847',
].map((addr) => addr.toLowerCase());

export const AUCTION_CLOSE = new Date(1637366400 * 1000);

export const GREAT_PROPHETS_MINTED = [
  '8996',
  '8995',
  '8994',
  '8993',
  '8992',
  '8991',
  '8990',
  '8989',
  '8988',
  '8987',
  '8986',
  '8985',
  '8983',
  '8981',
  '8955',
  '8946',
  '8945',
  '8929',
  '8921',
  '8920',
  '8901',
  '8900',
  '8873',
  '8872',
  '8857',
  '8856',
  '8855',
  '8834',
  '8782',
  '8753',
  '8752',
  '8732',
  '8731',
  '8706',
  '8685',
  '8662',
  '8645',
  '8644',
  '8602',
  '8547',
  '8546',
  '8545',
  '8476',
  '8475',
  '8474',
  '8430',
  '8429',
  '8333',
  '8332',
  '8331',
  '8290',
  '8289',
  '8288',
  '8287',
  '8286',
  '8285',
  '8284',
  '8283',
  '8282',
  '8281',
  '8280',
  '8279',
  '8237',
  '8333',
  '8332',
  '8331',
  '8290',
  '8289',
  '8288',
  '8287',
  '8286',
  '8285',
  '8284',
  '8283',
  '8282',
  '8281',
  '8280',
  '8279',
  '8237',
  '8236',
  '8235',
  '8234',
  '8195',
  '8194',
  '8148',
  '8147',
  '8115',
  '8114',
  '8113',
  '8112',
  '8111',
  '8110',
  '8109',
  '8108',
  '8082',
  '8081',
  '8059',
  '8058',
  '8057',
  '8056',
  '8036',
  '8035',
  '8024',
  '8008',
  '8007',
  '8006',
  '8005',
  '8004',
  '8003',
  '8002',
  '8001',
];
