const { getFirstNAVForGardenStrategies } = require('../shared/queries.js');
const { verifyDomain } = require('../shared/Verify.js');

const FUNCTION_NAME = 'get-first-nav';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();

  try {
    if (!verifyDomain(event.headers.host)) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: 'Unsupported request method.' };
    }

    const address = event.path.split('/').slice(-1)[0];
    if (!address) {
      return { statusCode: 400, body: 'Garden address is required.' };
    }

    const navResponse = await getFirstNAVForGardenStrategies(address);
    const finalResponse = navResponse ? navResponse.data.map((d) => d.data) : [];

    return {
      statusCode: 200,
      body: JSON.stringify(finalResponse),
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
