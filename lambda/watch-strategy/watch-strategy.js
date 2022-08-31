const { BASE_SITE_URL, BASE_PARSIQ_URL } = require('../shared/constants.js');
const { verifyDomain } = require('../shared/Verify.js');

const axios = require('axios');

const FUNCTION_NAME = 'watch-strategy';

exports.handler = async function (event, context, callback) {
  const startTime = Date.now();
  console.log(`${FUNCTION_NAME} starting...`);

  try {
    const data = JSON.parse(event.body);
    const verified = verifyDomain(event.headers.host);

    if (!verified) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: `Unsupported Request Method: ${event.httpMethod}` };
    }

    const { strategyName, strategyAddress, transportID } = data;

    const body = {
      strategy_name: strategyName,
      strategy_url: `${BASE_SITE_URL}/strategy/${strategyAddress}`,
      strategy_contract_address: strategyAddress,
      transport_id: transportID,
    };

    console.log(body);

    const config = {
      baseURL: BASE_PARSIQ_URL,
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${process.env.PARSIQ_BEARER_TOKEN}`,
      },
    };

    const response = await axios.post('/strategy', body, config);

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
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
