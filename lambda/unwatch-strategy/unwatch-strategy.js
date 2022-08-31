const { BASE_PARSIQ_URL } = require('../shared/constants.js');
const { verifyDomain } = require('../shared/Verify.js');

const axios = require('axios');

const FUNCTION_NAME = 'unwatch-strategy';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();

  try {
    const verified = verifyDomain(event.headers.host);

    if (!verified) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (event.httpMethod !== 'DELETE') {
      return { statusCode: 405, body: `Unsupported request method: ${event.httpMethod}` };
    }

    const address = event.path.split('/').slice(-1)[0];

    if (!address) {
      return { statusCode: 400, body: 'Strategy address is required.' };
    }

    const config = {
      baseURL: BASE_PARSIQ_URL,
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${process.env.PARSIQ_BEARER_TOKEN}`,
      },
    };

    return await axios
      .delete(`/strategy/${address.toLowerCase()}`, config)
      .then((response) => {
        return {
          statusCode: 200,
          body: JSON.stringify(response.data),
        };
      })
      .catch((error) => {
        console.log(error.response);

        return {
          statusCode: error.response.status,
          body: JSON.stringify(error.response.data),
        };
      });
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
