const { getMetricsForWalletAll } = require('../shared/queries.js');
const { verifyDomain } = require('../shared/Verify.js');

const FUNCTION_NAME = 'get-wallet-metrics-all';

exports.handler = async function (event, context, callback) {
  const startTime = Date.now();
  console.log(`${FUNCTION_NAME} starting...`);

  const RangeDays = {
    month: -31,
    week: -7,
    year: -365,
  };

  try {
    if (!verifyDomain(event.headers.host)) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: 'Unsupported request method.' };
    }

    const props = event.path.split('/').slice(-1);
    const address = props[0];

    if (address === 'undefined') {
      return { statusCode: 400, body: 'Wallet address is required.' };
    }

    const results = await getMetricsForWalletAll(address.toLowerCase());
    const resultsGrouped = mkResultsByDayAndGarden(results);

    const metrics = {};
    const dates = Object.keys(resultsGrouped);

    dates.forEach((date) => {
      const dateGroup = resultsGrouped[date];

      Object.keys(dateGroup).forEach((garden) => {
        if (!metrics[garden]) {
          metrics[garden] = [];
        }

        const row = dateGroup[garden];
        metrics[garden].push(row);
      });
    });

    // For each Garden group reverse sort the results
    const gardens = Object.keys(metrics);
    gardens.forEach((garden) => {
      metrics[garden] = metrics[garden].sort((a, b) => a.insertedAt - b.insertedAt).slice(RangeDays.year);
    });

    return {
      statusCode: 200,
      body: JSON.stringify(metrics),
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

const buildItemDate = (item) => {
  const date = new Date(item.data.insertedAt).setHours(0, 0, 0, 0).toString();
  return date;
};

const mkResultsByDayAndGarden = (results) => {
  const resultsByDayGarden = {};
  results.data.forEach((item) => {
    const date = buildItemDate(item);

    if (!date) {
      return;
    }

    // We have some incomplete data for a couple of days so the simplest solution
    // is just drop it here.
    if (parseInt(date) >= 1647072000000) {
      if (!resultsByDayGarden[date]) {
        resultsByDayGarden[date] = {};
      }

      if (resultsByDayGarden[date][item.data.garden]) {
        return;
      }

      const updatedItem = { ...item, insertedAt: parseInt(date) };
      resultsByDayGarden[date][item.data.garden] = updatedItem;
    }
  });

  return resultsByDayGarden;
};
