const { PROVIDER_URL } = require('../shared/constants.js');
const { getMembersForGarden } = require('../shared/queries.js');
const { verifyDomain } = require('../shared/Verify.js');

const { StaticJsonRpcProvider } = require('@ethersproject/providers');

const FUNCTION_NAME = 'get-members';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();
  const provider = new StaticJsonRpcProvider(PROVIDER_URL);

  try {
    if (!verifyDomain(event.headers.host)) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: `Unsupported Request Method: ${event.httpMethod}` };
    }

    const gardenAddress = event.path.split('/').slice(-1)[0];
    const force = event.queryStringParameters.force;
    const currentBlock = (await provider.getBlock()).number;

    if (!gardenAddress) {
      return { statusCode: 400, body: 'Garden address is required.' };
    }

    const members = await getMembersForGarden(gardenAddress, force, currentBlock);

    return {
      statusCode: 200,
      body: JSON.stringify(members),
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
