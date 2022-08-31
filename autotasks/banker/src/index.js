import { ethers } from 'ethers';
import { from, eth, sortBN, parseUnits } from 'common/utils/helpers.js';
import {
  getRelayer,
  getGasPrice,
  getProvider,
  getContractAt,
  weiToAsset,
  toAssetWithSymbol,
  getPrice,
  getDepositSigHash,
  getWithdrawSigHash,
  getRewardsSigHash,
  checkQuotes,
  getNow,
  checkAndSwapAssets,
} from 'common/utils/web3.js';
import { sendErrorToTelegram } from 'common/utils/telegram.js';
import { getQuotes } from 'common/utils/quotes.js';
import {
  GAS_LIMIT_PERCENTAGE,
  DECIMALS_BY_RESERVE,
  KEEPER_PERCENTAGE,
  DAI,
  BABL,
  ADDRESS_ZERO,
} from 'common/constants.js';
import { getStore } from 'common/utils/store.js';
import { getHeartDistVoteAll } from 'common/utils/fauna.js';

import contractsJSON from '../../../src/1.json';
const contracts = contractsJSON.contracts;

const MAX_GAS_PRICE = 200000000000;

export async function handler(event) {
  console.time('banker');

  try {
    let CMC_API_KEY, FAUNADB_SERVER_SECRET, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, BLOCKNATIVE_API_KEY;
    // set env vars
    if (!!event && !!event.secrets) {
      ({ CMC_API_KEY, FAUNADB_SERVER_SECRET, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, BLOCKNATIVE_API_KEY } = event.secrets);

      process.env.BLOCKNATIVE_API_KEY = BLOCKNATIVE_API_KEY;
      process.env.CMC_API_KEY = CMC_API_KEY;
      process.env.FAUNADB_SERVER_SECRET = FAUNADB_SERVER_SECRET;
      process.env.TELEGRAM_CHAT_ID = TELEGRAM_CHAT_ID;
      process.env.TELEGRAM_TOKEN = TELEGRAM_TOKEN;
    }

    const quotes = await getQuotes('WBTC,WETH,BABL,AAVE', 'USD');
    for (const key of Object.keys(quotes)) {
      console.log(`${key}: $${quotes[key].quote.USD.price}`);
    }
    const store = getStore(event);
    await checkQuotes(quotes, store);

    const [provider, signer, readOnlyProvider] = getProvider(event);
    const relayer = getRelayer(event);

    const txs = await relayer.list({
      status: 'pending', // can be 'pending', 'mined', or 'failed'
    });

    if (txs.length > 0) {
      console.log('There are pending txs');
      return;
    }

    const gasPrice = await getGasPrice();

    console.log('gasPrice', gasPrice);
    if (gasPrice > MAX_GAS_PRICE) {
      // if gas price higher than 200 gwei then abort
      console.log('Gas price is higher than 200 gwei. Exiting.');
      return;
    }

    await checkAndSwapAssets(provider, signer, store, relayer, contracts);

    console.timeEnd('banker');
  } catch (e) {
    console.log(`Failed to pump banker. Event: ${e}. `);
    sendErrorToTelegram(`Failed to pump banker. Event: ${e}`);
    return;
  }
}
