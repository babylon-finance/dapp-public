const { getProphetCodeForUser, insertProphetCodeForUser } = require('../shared/queries.js');
const { verifyToken } = require('../shared/Verify.js');
const shortid = require('shortid');

const FUNCTION_NAME = 'generate-prophet-code';

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
    const userId = generate32BitIntegerHash(data['user_id']);

    const maybeExisting = await getProphetCodeForUser(userId);

    // check for existing record by userId
    if (maybeExisting) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: 'Code already exists for user' }),
      };
    }

    const code = shortid.generate();
    const response = await insertProphetCodeForUser(userId, code, startTime);

    return {
      statusCode: 200,
      body: JSON.stringify({ code: response.data.code }),
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

const generate32BitIntegerHash = (str) => {
  for (var i = 0, h = 9; i < str.length; ) h = Math.imul(h ^ str.charCodeAt(i++), 9 ** 9);

  const hashInt = h ^ (h >>> 9);

  return Math.abs(hashInt);
};
