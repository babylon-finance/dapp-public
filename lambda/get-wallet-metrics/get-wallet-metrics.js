const { getMetricsForWallet } = require('../shared/queries.js');
const { verifyDomain } = require('../shared/Verify.js');

const FUNCTION_NAME = 'get-wallet-metrics';

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

    const props = event.path.split('/').slice(-2);
    const address = props[0];
    const garden = props[1];

    if (address === 'undefined') {
      return { statusCode: 400, body: 'Wallet address is required.' };
    }

    if (garden === 'undefined') {
      return { statusCode: 400, body: 'Garden address is required.' };
    }

    const results = await getMetricsForWallet(address.toLowerCase(), garden);
    const resultsByDay = mkResultsByDay(results);

    const metrics = Object.values(resultsByDay)
      .sort((a, b) => new Date(a.data.insertedAt) - new Date(b.data.insertedAt))
      .slice(RangeDays.year);

    return {
      statusCode: 200,
      body: JSON.stringify({ metrics }),
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
  return date;
};

const mkResultsByDay = (results) => {
  const resultsByDay = {};
  results.data.forEach((item) => {
    const date = buildItemDate(item);

    if (!date) {
      return;
    }

    // Make it first writer wins since data is desc order
    if (resultsByDay[date]) {
      return;
    }

    const updatedItem = { ...item, insertedAt: parseInt(date) };

    resultsByDay[date] = updatedItem;
  });

  return resultsByDay;
};
