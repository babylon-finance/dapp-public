const { verifyDomain } = require('../shared/Verify.js');

const axios = require('axios');

const FUNCTION_NAME = 'get-identities';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();
  const TALLY_API_URL = 'https://identity.withtally.com/user/profiles/by/address';

  if (!verifyDomain(event.headers.host)) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: `Unsupported Request Method: ${event.httpMethod}` };
  }

  const data = JSON.parse(event.body);

  if (data.addresses.length > 100) {
    return {
      statusCode: 400,
      body: `Maximum of 100 addresses allowed for lookup, ${data.addresses.length} sent`,
    };
  }

  const body = {
    headers: {
      'Content-Type': 'application/json',
    },
    addresses: data.addresses,
  };

  try {
    return await axios
      .post(TALLY_API_URL, {
        ...body,
      })
      .then((resp) => {
        return {
          statusCode: 200,
          body: JSON.stringify(resp.data.data),
        };
      });
  } catch (err) {
    console.log('Failed to fetch member identity data', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    console.log(`${FUNCTION_NAME} completed in ${Date.now() - startTime} ms`);
  }
};
