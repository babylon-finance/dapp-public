global._babelPolyfill = false;

const { verifyDomain } = require('../shared/Verify.js');
const { getPinataSDK } = require('../shared/pinata.js');

const striptags = require('striptags');

const FUNCTION_NAME = 'pin-to-ipfs';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();
  const pinata = getPinataSDK(process.env.PINATA_RW_API_KEY, process.env.PINATA_RW_SECRET_KEY);

  try {
    if (!verifyDomain(event.headers.host)) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Unsupported Request Method' };
    }

    const data = JSON.parse(event.body);
    const { body, options } = data;

    let finalBody = { ...body };

    const inputFields = ['description', 'image', 'name'];

    // Strip all HTML tags, including script, from user input fields
    Object.keys(body).forEach((field) => {
      const original = body[field];

      if (inputFields.includes(field) && typeof original === 'string') {
        finalBody[field] = striptags(original);
      }
    });

    const response = await pinata.pinJSONToIPFS(finalBody, options);

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
