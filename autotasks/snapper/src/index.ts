import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { AutotaskEvent, EnvInfo } from 'common/models/Handler';
import { getQuotes } from 'common/utils/quotes';
import { getNow, getProvider } from 'common/utils/web3';
import { RESERVES, FIAT_CURRENCIES } from 'common/constants';
import { submitMetrics } from './metricsEngine';

import { QuoteResult } from '../../../src/models/QuoteResult';
import { JsonRpcProvider } from '@ethersproject/providers';
import { sendErrorToTelegram } from 'common/utils/telegram.js';

const RUN = process.env.RUN;

export async function handler(event: AutotaskEvent) {
  const startTime = Date.now();
  console.time('Snapper starting...');

  let CMC_API_KEY, FAUNADB_SERVER_SECRET, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID;
  // set env vars
  if (!!event && !!event.secrets) {
    ({ CMC_API_KEY, FAUNADB_SERVER_SECRET, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID } = event.secrets);

    process.env.CMC_API_KEY = CMC_API_KEY;
    process.env.FAUNADB_SERVER_SECRET = FAUNADB_SERVER_SECRET;
    process.env.TELEGRAM_TOKEN = TELEGRAM_TOKEN;
    process.env.TELEGRAM_CHAT_ID = TELEGRAM_CHAT_ID;
  }

  try {
    const [provider] = getProvider(event);
    const now = (await getNow(provider)) as number;

    console.log('Getting quotes...');
    const quotes = (await getQuotes(RESERVES, FIAT_CURRENCIES)) as QuoteResult;
    console.log('Successfully fetched quotes!');

    console.log('Building metric rows and submitting...');
    const stats = await submitMetrics(now, quotes, provider as JsonRpcProvider);
    console.log('Submission stats: ', stats);
    console.time('Snapper run complete!');
  } catch (err) {
    console.error('Snapper run failed!', err);
    sendErrorToTelegram(`Snapper run failed!. Error: ${err}`);
  } finally {
    console.log(`Snapper run completed in ${Date.now() - startTime} ms`);
  }
}

// To run locally (this code will not be executed in Autotasks)
if (RUN) {
  const { API_KEY: apiKey, API_SECRET: apiSecret } = process.env as EnvInfo;
  handler({ apiKey, apiSecret })
    .then(() => process.exit(0))
    .catch((error: Error) => {
      console.error(error);
      process.exit(1);
    });
}
