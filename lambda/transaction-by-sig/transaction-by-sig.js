const FUNCTION_NAME = 'transaction-by-sig';

const axios = require('axios');

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: `Unsupported Request Method: ${event.httpMethod}` };
  }

  try {
    const data = JSON.parse(event.body);
    const { signature, payload, action } = data;

    // pass signature and props to autotask
    const bySigWebhook =
      'https://api.defender.openzeppelin.com/autotasks/69535bac-dfb4-486e-bc1b-21d9fb13a09e/runs/webhook/6e30b068-78f1-4d1e-8956-31c4e0ba8423/nvVSr2ZDtjd3eKjH2M7Gs';
    console.log('before sending post');
    // For now don't wait on this request, we will improve asap
    let responseObject;
    await axios.post(bySigWebhook, { ...payload, signature, action }).then((response) => {
      if (response.data.status === 'error') {
        responseObject = {
          statusCode: 500,
          body: JSON.stringify({ message: response.data.message }),
        };
      } else {
        console.log('parsing', response.data.result);
        const dataObject = JSON.parse(response.data.result);
        console.log('dataObject', dataObject);
        responseObject = {
          statusCode: 200,
          body: JSON.stringify({ message: 'ok', ...dataObject }),
        };
      }
    });
    return responseObject;
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
