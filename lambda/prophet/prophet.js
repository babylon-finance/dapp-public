global._babelPolyfill = false;

const IERC721 = require('../shared/IERC721EnumerableUpgradeable.json');
const { BASE_IPFS_GATEWAY_URL, PROVIDER_URL, PROPHET_ADDRESS } = require('../shared/constants.js');
const { getMinted, updateMinted } = require('../shared/queries');
const { getPinataSDK } = require('../shared/pinata.js');
const { verifyTestWallet } = require('../shared/Verify');

const axios = require('axios');
const { Contract } = require('@ethersproject/contracts');
const { StaticJsonRpcProvider } = require('@ethersproject/providers');

const FUNCTION_NAME = 'prophet';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();
  const provider = new StaticJsonRpcProvider(PROVIDER_URL);

  try {
    const pinata = getPinataSDK(process.env.PINATA_RW_API_KEY, process.env.PINATA_RW_SECRET_KEY);

    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: 'Unsupported Request Method' };
    }

    const override = verifyTestWallet(event.queryStringParameters.user || '');

    const Prophets = new Contract(PROPHET_ADDRESS, IERC721.abi, provider);
    const prophetId = event.path.split('/').slice(-1)[0];
    const isGreatProphet = parseInt(prophetId) > 8000;
    const forceRefresh = event.queryStringParameters.force === 'true';

    // Never fetch supply for GP's because they are preminted / json already uploaded
    if (!isGreatProphet) {
      const cachedMinted = await getMinted();
      const cachedSinceMs = startTime - cachedMinted.data.updatedAt;
      const shouldFetch = cachedMinted ? cachedSinceMs > 1000 * 5 * 60 : true; // > 5 min in ms

      let maxMinted = cachedMinted.data.id;

      if ((shouldFetch || forceRefresh) && !isGreatProphet) {
        await Prophets.totalSupply()
          .then(async (response) => {
            maxMinted = response.toNumber();
            await updateMinted(cachedMinted, maxMinted, startTime);
          })
          .catch((error) => {
            console.log('Error fetching total prophet supply, using cached value', error);
          });
      }

      const isMinted = maxMinted >= prophetId;

      console.log(override);
      // If not minted we return empty with message
      if (!isMinted && !override) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: `Prophet ${prophetId} has not been minted.` }),
        };
      }
    }

    const NOT_FOUND_RESPONSE = {
      statusCode: 404,
      body: JSON.stringify({ message: `No results for prophet ID: ${prophetId}` }),
    };

    if (!prophetId) {
      return { statusCode: 400, body: 'Valid prophet ID is required' };
    }

    const filters = { metadata: { name: `prophet_${prophetId}.json` } };
    const list = await pinata.pinList(filters);
    list.rows = list.rows.filter((row) => row.date_unpinned === null);

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
      body: JSON.stringify({ error: 'There was error fetching prophet metadata.' }),
    };
  } finally {
    console.log(`${FUNCTION_NAME} completed in ${Date.now() - startTime} ms`);
  }
};
