const { verifyDomain } = require('../shared/Verify.js');

const pinataSDK = require('@pinata/sdk');

const FUNCTION_NAME = 'get-filtered-pins';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();
  const pinata = pinataSDK(process.env.PINATA_RW_API_KEY, process.env.PINATA_RW_SECRET_KEY);

  try {
    if (!verifyDomain(event.headers.host)) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Unsupported Request Method' };
    }

    const data = JSON.parse(event.body);
    const { filters } = data;

    const response = await pinata.pinList(filters);

    return {
      statusCode: 200,
      body: JSON.stringify(response),
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
