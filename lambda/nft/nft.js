global._babelPolyfill = false;

const { BASE_IPFS_GATEWAY_URL } = require('../shared/constants.js');
const { getPinataSDK } = require('../shared/pinata.js');

const axios = require('axios');

const FUNCTION_NAME = 'nft';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();

  try {
    const pinata = getPinataSDK(process.env.PINATA_RW_API_KEY, process.env.PINATA_RW_SECRET_KEY);

    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: 'Unsupported Request Method' };
    }

    const nftSeed = event.path.split('/').slice(-1)[0];

    const NOT_FOUND_RESPONSE = {
      statusCode: 404,
      body: JSON.stringify({ message: `No results for seed: ${nftSeed}` }),
    };

    if (!nftSeed) {
      return { statusCode: 400, body: 'Valid seed is required' };
    }

    const filters = { metadata: { name: nftSeed || '' } };
    const list = await pinata.pinList(filters);

    if (list.rows.length > 0 && !list.rows[0].date_unpinned) {
      // Note: Pin list is sorted chronologically desc. So newest, ie: most recent, first)
      return await axios.get(BASE_IPFS_GATEWAY_URL + list.rows[0].ipfs_pin_hash).then((response) => {
        return {
          statusCode: 200,
          body: JSON.stringify(response.data),
        };
      });
    }

    return NOT_FOUND_RESPONSE;
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    console.log(`${FUNCTION_NAME} completed in ${Date.now() - startTime} ms`);
  }
};
