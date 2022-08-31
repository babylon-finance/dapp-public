const { getLatestMetricForGarden, parallelResolve } = require('../shared/queries.js');
const { verifyDomain } = require('../shared/Verify.js');

const FUNCTION_NAME = 'get-garden-metrics-bulk';

exports.handler = async function (event, context, callback) {
  const startTime = Date.now();
  console.log(`${FUNCTION_NAME} starting...`);

  try {
    if (!verifyDomain(event.headers.host)) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Unsupported request method.' };
    }

    const data = JSON.parse(event.body);
    let { gardens } = data;

    if (!gardens || gardens.length === 0) {
      return { statusCode: 400, body: 'Garden addresses required.' };
    }

    const metricPromises = gardens.map(async (garden) => {
      return getLatestMetricForGarden(garden);
    });

    const results = await parallelResolve(metricPromises, 10);
    const gardenMap = {};

    results.forEach((gardenRow) => {
      const date = buildDate(gardenRow.data.insertedAt);

      if (!date) {
        return;
      }

      gardenMap[gardenRow.data.garden] = gardenRow.data;
    });

    return {
      statusCode: 200,
      body: JSON.stringify(gardenMap),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    console.log(`${FUNCTION_NAME} completed in ${Date.now() - startTime} ms`);
  }
};

const buildDate = (ts) => {
  const date = new Date(ts * 1000).setHours(0, 0, 0, 0).toString();
  return date;
};
