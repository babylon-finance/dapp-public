const { determineLevel } = require('../shared/StrategyLevelEngine.js');
const { verifyDomain, verifyToken } = require('../shared/Verify.js');

const pinataSDK = require('@pinata/sdk');

const FUNCTION_NAME = 'get-strategy-nft';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();
  const pinata = pinataSDK(process.env.PINATA_RW_API_KEY, process.env.PINATA_RW_SECRET_KEY);
  const REQUIRED_SCHEMA = ['name', 'principal', 'profit', 'duration', 'returns', 'rewards', 'secret'];

  try {
    const data = JSON.parse(event.body);
    const verified = verifyDomain(event.headers.host) && verifyToken(data.secret);

    if (!verified) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Unsupported Request Method' };
    }

    if (Object.keys(data) !== REQUIRED_SCHEMA) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: `Request fields do match expected fields: ${REQUIRED_SCHEMA}` }),
      };
    }

    const nftDetails = determineLevel(data);

    const body = {
      name: data.name,
      ...nftDetails, // { image, description }
      strategyObject: data,
    };

    const pinResponse = await pinata.pinJSONToIPFS(body);

    return {
      statusCode: 200,
      body: JSON.stringify(pinResponse),
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
