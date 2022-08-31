const { BASE_SITE_URL, BASE_PARSIQ_URL, TRANSPORT_TYPE } = require('../shared/constants.js');
const { verifyDomain } = require('../shared/Verify.js');

const axios = require('axios');

const FUNCTION_NAME = 'create-garden-transport';

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

    const { gardenAddress, name, symbol, decimals } = JSON.parse(data.body);

    const body = {
      garden_name: name,
      garden_url: `${BASE_SITE_URL}/garden/${gardenAddress}`,
      garden_contract_address: gardenAddress,
      garden_contract_decimals: decimals,
      garden_contract_symbol: symbol,
      transport_type: TRANSPORT_TYPE.telegram,
      transport_connection_callback: `${BASE_SITE_URL}/api/v1/transport-connected`,
    };

    const config = {
      baseURL: BASE_PARSIQ_URL,
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${process.env.PARSIQ_BEARER_TOKEN}`,
      },
    };

    return await axios
      .post('/garden', body, config)
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
