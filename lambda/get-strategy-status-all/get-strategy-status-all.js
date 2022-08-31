const { verifyDomain } = require('../shared/Verify.js');
const { getAllStrategyStatuses } = require('../shared/queries.js');

const FUNCTION_NAME = 'get-strategy-status-all';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();

  if (!verifyDomain(event.headers.host)) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: `Unsupported Request Method: ${event.httpMethod}` };
  }

  try {
    const maybeResults = await getAllStrategyStatuses();
    return {
      statusCode: 200,
      body: JSON.stringify(maybeResults ? maybeResults.data.map((row) => row.data) : []),
    };
  } catch (err) {
    console.log('Failed to fetch strategy statuses', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    console.log(`${FUNCTION_NAME} completed in ${Date.now() - startTime} ms`);
  }
};
