const { getProphetBids } = require('../shared/queries.js');
const { verifyDomain } = require('../shared/Verify.js');

const FUNCTION_NAME = 'get-prophet-sigs';

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

    const data = results.data.reverse().map((result) => {
      return {
        signature: mkShortSig(result.data.signature),
        insertedAt: result.data.insertedAt,
        wallet: result.data.wallet,
      };
    });
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.log('error', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `${FUNCTION_NAME} failed.` }),
    };
  } finally {
    console.log(`${FUNCTION_NAME} completed in ${Date.now() - startTime} ms`);
  }
};

const mkShortSig = (signature) => {
  const prefix = signature.slice(0, 4);
  const suffix = signature.slice(signature.length - 4, signature.length);

  return `${prefix}...${suffix}`;
};
