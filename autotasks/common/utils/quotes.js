const axios = require('axios');

const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';

export async function getQuotes(reserves, fiats) {
  try {
    const response = await axios.get(CMC_API_URL, {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
      },
      params: {
        symbol: reserves,
        convert: fiats,
      },
    });
    return response.data.data;
  } catch (err) {
    console.log('Failed to fetch assets quotes', err);
    return undefined;
  }
}
