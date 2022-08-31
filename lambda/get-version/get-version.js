const { verifyDomain } = require('../shared/Verify.js');
const version = require('../shared/version.json');

const FUNCTION_NAME = 'get-version';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);

  if (!verifyDomain(event.headers.host)) {
    return { statusCode: 401, body: 'Unauthorized' };
  }
  console.log('version', version);
  version.version = version.version || '0'; // for dev
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: `Unsupported Request Method: ${event.httpMethod}` };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(version),
  };
};
