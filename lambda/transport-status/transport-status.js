const { getStatusForTransport } = require('../shared/queries.js');
const { verifyDomain } = require('../shared/Verify.js');

const FUNCTION_NAME = 'transport-status';

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

    const transportId = event.path.split('/').slice(-1)[0];
    if (!transportId) {
      return { statusCode: 400, body: 'Transport ID is required.' };
    }

    const res = await getStatusForTransport(transportId);
    return {
      statusCode: 200,
      body: JSON.stringify(res),
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
