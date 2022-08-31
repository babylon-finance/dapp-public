const { getFormSubmissionByCode } = require('../shared/queries.js');
const { verifyDomain } = require('../shared/Verify.js');

const FUNCTION_NAME = 'get-prophet-submit-status';

exports.handler = async function (event, context, callback) {
  const startTime = Date.now();

  try {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: `Unsupported Request Method: ${event.httpMethod}` };
    }

    if (!verifyDomain(event.headers.host)) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    const code = event.path.split('/').slice(-1)[0];
    console.log(code);
    const maybeRecord = await getFormSubmissionByCode(code);

    return {
      statusCode: 200,
      body: JSON.stringify(maybeRecord !== undefined ? 1 : 0),
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
