const { getProphetCodeForUser } = require('../shared/queries.js');
const { verifyDomain } = require('../shared/Verify.js');

const FUNCTION_NAME = 'get-prophet-code-for-user';

exports.handler = async function (event, context, callback) {
  const startTime = Date.now();

  try {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: `Unsupported Request Method: ${event.httpMethod}` };
    }

    if (!verifyDomain(event.headers.host)) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    const userId = parseInt(event.path.split('/').slice(-1)[0] || '0');

    // check for existing record by userId
    const maybeRecord = await getProphetCodeForUser(userId);
    if (!maybeRecord) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No code exists for user' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ...maybeRecord.data }),
    };
  } catch (error) {
    console.log('error', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    console.log(`${FUNCTION_NAME} completed in ${Date.now() - startTime} ms`);
  }
};
