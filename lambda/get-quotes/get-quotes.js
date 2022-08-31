const { CMC_API_URL } = require('../shared/constants.js');
const { verifyDomain } = require('../shared/Verify.js');

const axios = require('axios');

const FUNCTION_NAME = 'get-quotes';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: `Unsupported Request Method: ${event.httpMethod}` };
  }

  try {
    if (!verifyDomain(event.headers.host)) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    const data = JSON.parse(event.body);

    return await axios
      .get(CMC_API_URL, {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
        },
        params: {
          symbol: data.reserves,
          convert: data.fiats,
        },
      })
      .then((resp) => {
        return {
          statusCode: 200,
          body: JSON.stringify(resp.data.data),
        };
      });
  } catch (err) {
    console.log('Failed to fetch member quotes data', err.response.data);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    console.log(`${FUNCTION_NAME} completed in ${Date.now() - startTime} ms`);
  }
};
