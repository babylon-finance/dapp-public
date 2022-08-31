global._babelPolyfill = false;

const ImageUriJSON = require('../shared/prophetImageMap.json');
const { MINTED_PROPHETS } = require('../shared/constants.js');

const FUNCTION_NAME = 'get-prophet-images';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();

  try {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: 'Unsupported Request Method' };
    }

    const allImages = Object.entries(ImageUriJSON);
    const finalImages = allImages.slice(0, MINTED_PROPHETS);

    return {
      statusCode: 200,
      body: JSON.stringify(
        finalImages.map((entry) => {
          return { id: parseInt(entry[0]), uri: entry[1] };
        }),
      ),
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'There was error fetching prophet minted count.' }),
    };
  } finally {
    console.log(`${FUNCTION_NAME} completed in ${Date.now() - startTime} ms`);
  }
};
