const { getProphetBids } = require('../shared/queries.js');
const { verifyDomain } = require('../shared/Verify.js');
const { markers } = require('../shared/bid-markers.js');
const { parseEther } = require('@ethersproject/units');
const { BigNumber } = require('@ethersproject/bignumber');

const FUNCTION_NAME = 'get-prophet-bids';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();

  try {
    if (!verifyDomain(event.headers.host)) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: `Unsupported Request Method: ${event.httpMethod}` };
    }

    const results = await getProphetBids();

    const markersBN = markers.map((m) => parseEther(m.toString()));
    const resultsBN = results ? results.data.map((r) => BigNumber.from(r.data.amount)) : [];

    const buckets = markersBN.map((marker) => {
      return { floor: marker, count: resultsBN.filter((r) => r.gte(marker)).length };
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ buckets }),
    };
  } catch (error) {
    console.log('error', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `${FUNCTION_NAME} failed with error ${error.message}` }),
    };
  } finally {
    console.log(`${FUNCTION_NAME} completed in ${Date.now() - startTime} ms`);
  }
};
