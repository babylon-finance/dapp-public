const { verifyDomain } = require('../shared/Verify.js');
const { getStatusByStrategy } = require('../shared/queries.js');

const FUNCTION_NAME = 'get-strategy-status';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();

  if (!verifyDomain(event.headers.host)) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: `Unsupported Request Method: ${event.httpMethod}` };
  }

  const strategy = event.path.split('/').slice(-1)[0];

  if (!strategy) {
    return {
      statusCode: 400,
      body: 'Strategy address required',
    };
  }

  try {
    const maybeResult = await getStatusByStrategy(strategy);
    return {
      statusCode: 200,
      body: JSON.stringify(maybeResult ? maybeResult.data : {}),
    };
  } catch (err) {
    console.log('Failed to fetch strategy status', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    console.log(`${FUNCTION_NAME} completed in ${Date.now() - startTime} ms`);
  }
};
