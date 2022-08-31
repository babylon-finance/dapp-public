const { getProphetBidsForWallet } = require('../shared/queries.js');
const { verifyDomain } = require('../shared/Verify.js');

const FUNCTION_NAME = 'get-prophet-bids-by-address';

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

    const wallet = event.path.split('/').slice(-1)[0];

    if (!wallet) {
      return { statusCode: 400, body: 'Address is required.' };
    }

    const results = await getProphetBidsForWallet(wallet.toLowerCase());

    return {
      statusCode: 200,
      body: JSON.stringify(results ? results.data : []),
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
