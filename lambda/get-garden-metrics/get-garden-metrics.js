const { getMetricsForGarden, getMetricsForGardenStrategies } = require('../shared/queries.js');
const { verifyDomain } = require('../shared/Verify.js');

const FUNCTION_NAME = 'get-garden-metrics';

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

    const garden = event.path.split('/').slice(-1)[0];

    if (!garden) {
      return { statusCode: 400, body: 'Garden address is required.' };
    }

    const strategyResults = getMetricsForGardenStrategies(garden);
    const gardenResults = getMetricsForGarden(garden, null, null, null);

    // Note that we reverse the results from the query. This is necessary because the index
    // rows are in DESC order of insertedAt to reduce paging depth.
    const results = await Promise.all([strategyResults, gardenResults]);

    // The goal here is to significantly reduce the fidelity of results down to daily, first writer wins.
    // This matters now since we are caching results in the client localstorage and want to be good citizens.
    const strategyResultsByDay = {};
    results[0].data.forEach((item) => {
      const date = buildItemDate(item);

      if (!date) {
        return;
      }

      if (!strategyResultsByDay[date]) {
        strategyResultsByDay[date] = {};
      }

      // Make it first writer wins since data is desc order
      if (strategyResultsByDay[date][item.data.strategy]) {
        return;
      }

      const updatedItem = { ...item, insertedAt: parseInt(date) };

      strategyResultsByDay[date][item.data.strategy] = updatedItem;
    });

    const gardenResultsByDay = {};
    results[1].data.forEach((item) => {
      const date = buildItemDate(item);

      if (!date) {
        return;
      }

      // Make it first writer wins since data is desc order
      if (gardenResultsByDay[date]) {
        return;
      }

      const updatedItem = { ...item, insertedAt: parseInt(date) };

      gardenResultsByDay[date] = updatedItem;
    });

    const strategyDates = Object.keys(strategyResultsByDay);
    const unwrappedStrategyRecords = strategyDates
      .map((date) => {
        return Object.values(strategyResultsByDay[date]);
      })
      .flat();

    const strategyMetrics = unwrappedStrategyRecords
      .sort((a, b) => new Date(a.data.insertedAt) - new Date(b.data.insertedAt))
      .slice(RangeDays.year);

    const gardenMetrics = Object.values(gardenResultsByDay)
      .sort((a, b) => new Date(a.data.insertedAt) - new Date(b.data.insertedAt))
      .slice(RangeDays.year);

    return {
      statusCode: 200,
      body: JSON.stringify({ strategy: strategyMetrics, garden: gardenMetrics }),
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
  const date = new Date(item.data.insertedAt * 1000).setHours(0, 0, 0, 0).toString();

  // Old data was in js Date value format so we just dump it in favor of unix 13 digit values
  // This should be a no op at some point and we can drop it. It is very difficult to clean the data in Fauna
  // which is why I am resorting to this hack.
  if (date.length > 13) {
    return;
  }

  return date;
};
