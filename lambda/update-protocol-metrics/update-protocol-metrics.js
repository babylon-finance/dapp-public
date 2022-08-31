const { insertProtocolMetrics, getLatestProtocolMetrics } = require('../shared/queries.js');
const { verifyDomain } = require('../shared/Verify.js');

const FUNCTION_NAME = 'update-protocol-metrics';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();

  try {
    const data = JSON.parse(event.body);
    const verified = verifyDomain(event.headers.host);

    if (!verified) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: `Unsupported Request Method: ${event.httpMethod}` };
    }

    const latest = await getLatestProtocolMetrics();
    const insertedSinceHr = !latest ? 0 : (startTime - latest.data.insertedAt) / 1000 / 60 / 60;

    // Don't update the cache more than every 6 hours
    if (insertedSinceHr < 6) {
      return {
        statusCode: 304,
      };
    }

    await insertProtocolMetrics(data, startTime);

    return {
      statusCode: 200,
    };
  } catch (err) {
    console.log(err);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    console.log(`${FUNCTION_NAME} completed in ${Date.now() - startTime} ms`);
  }
};
