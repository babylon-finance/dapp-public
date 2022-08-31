const { getStatusForTransport, setStatusForTransport } = require('../shared/queries.js');
const { verifyToken } = require('../shared/Verify.js');

const FUNCTION_NAME = 'transport-connected';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();

  try {
    const bearer = event.headers.authorization.split(' ')[1];

    if (!verifyToken(bearer)) {
      return { statusCode: 401, body: `Unauthorized` };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: `Unsupported Request Method: ${event.httpMethod}` };
    }

    const data = JSON.parse(event.body);
    const transportId = data['transport_id'];

    let response = {
      statusCode: 304,
    };

    const exists = await getStatusForTransport(transportId);

    if (!exists) {
      const ret = await setStatusForTransport(transportId);

      response = {
        statusCode: 200,
        body: JSON.stringify(ret),
      };
    }

    return response;
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
