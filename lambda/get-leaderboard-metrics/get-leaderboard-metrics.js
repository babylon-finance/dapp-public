const { contracts } = require('../shared/1.json');
const contractsDev = require('../shared/31337.json');
const {
  getLatestMetricForGarden,
  insertLeaderboardResult,
  getLatestLeaderboardResult,
} = require('../shared/queries.js');
const { verifyDomain } = require('../shared/Verify.js');
const { PROVIDER_URL, CONTROLLER_ADDRESS, CMC_API_URL } = require('../shared/constants.js');

const { StaticJsonRpcProvider } = require('@ethersproject/providers');
const { Contract } = require('@ethersproject/contracts');
const axios = require('axios');

let contractsNetwork = contracts;

if (process.env.REACT_APP_CHAIN_ID === '31337') {
  contractsNetwork = contractsDev.contracts;
}

const FUNCTION_NAME = 'get-leaderboard-metrics';

exports.handler = async function (event, context, callback) {
  const startTime = Date.now();
  console.log(`${FUNCTION_NAME} starting...`);
  const provider = new StaticJsonRpcProvider(PROVIDER_URL);

  try {
    if (!verifyDomain(event.headers.host)) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: 'Unsupported request method.' };
    }

    const THREE_HOUR_MS = 1000 * 60 * 60 * 3;
    const cABI = contractsNetwork['BabController'].abi;
    const controller = new Contract(CONTROLLER_ADDRESS, cABI, provider);
    const gardens = await controller.getGardens();
    const latestCached = await getLatestLeaderboardResult();
    const cacheAgeMs = Date.now() - latestCached.data.insertedAt;

    // Cache result for three hours
    if (latestCached && cacheAgeMs < THREE_HOUR_MS) {
      console.log(
        `Leaderboard cache is ${(cacheAgeMs / 1000 / 60).toFixed(2)} minutes old, returning cached results...`,
      );
      return {
        statusCode: 200,
        body: JSON.stringify(latestCached.data),
      };
    }

    console.log(
      `Leaderboard cache is ${(cacheAgeMs / 1000 / 60).toFixed(
        2,
      )}  minutes old, results outdated. Fetching new results...`,
    );

    const bablQuoteUSD = await axios
      .get(CMC_API_URL, {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
        },
        params: {
          symbol: 'BABL',
          convert: 'USD',
        },
      })
      .then((resp) => {
        return resp.data.data['BABL'].quote['USD'].price;
      });

    const promises = gardens.map((garden) => {
      return getLatestMetricForGarden(garden);
    });

    const rawResults = await Promise.all(promises);

    // We need this later for constructing global TVL for each supported currency
    let currencies;

    // Keyed by currency string, snapshot of reserve to our supported currencies
    const totalNAV = {};
    const totalPrincipal = {};

    // We'll need to be careful this doesn't blow up if we 100x the number of gardens
    const results = rawResults
      // For backwards compat in the case we grab some metric rows that don't include the updated schema
      // They will be temporarily excluded until they have a new row written.
      .filter((row) => row)
      .map((row) => {
        const { data } = row;
        const navByTicker = {};
        const principalByTicker = {};

        if (!currencies) {
          currencies = Object.keys(data.reserveToFiats);
        }

        for (const symbol of currencies) {
          principalByTicker[symbol] = parseFloat((data.principal * data.reserveToFiats[symbol].price).toFixed(0));
          navByTicker[symbol] = parseFloat((data.netAssetValue * data.reserveToFiats[symbol].price).toFixed(0));

          const curGlobalNAV = totalNAV[symbol] || 0;
          totalNAV[symbol] = curGlobalNAV + navByTicker[symbol];

          const curGlobalPrincipal = totalPrincipal[symbol] || 0;
          totalPrincipal[symbol] = curGlobalPrincipal + principalByTicker[symbol];
        }

        const netRaw = data.bablReturns * bablQuoteUSD + (navByTicker['USD'] - principalByTicker['USD']);

        return {
          garden: data.garden,
          name: data.name,
          createdAt: data.createdAt,
          bablReturns: data.bablReturns,
          private: data.private,
          totalSupply: data.totalSupply,
          reserveAsset: data.reserveAsset,
          contributors: data.totalContributors,
          principalRaw: parseFloat(data.principal.toFixed(4)),
          navRaw: parseFloat(data.netAssetValue.toFixed(4)),
          returnRates: data.returnRates,
          verified: data.verified,
          netRaw,
          principalByTicker,
          navByTicker,
        };
      })
      .sort((a, b) => b.netRaw - a.netRaw);

    const totalContributors = results.reduce((a, b) => a + b.contributors, 0);
    const updated = await insertLeaderboardResult(results, totalNAV, totalContributors, totalPrincipal);

    return {
      statusCode: 200,
      body: JSON.stringify(updated.data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    console.log(`${FUNCTION_NAME} completed in ${Date.now() - startTime} ms`);
  }
};
