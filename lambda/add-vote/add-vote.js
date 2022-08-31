const { contracts } = require('../shared/1.json');
const contractsDev = require('../shared/31337.json');

let contractsNetwork = contracts;
if (process.env.REACT_APP_CHAIN_ID === '31337') {
  contractsNetwork = contractsDev.contracts;
}

const { getVotesForStrategy, insertIfNotExistsVote, updateVotesForStrategy } = require('../shared/queries.js');
const { PROVIDER_URL } = require('../shared/constants.js');
const { verifyDomain } = require('../shared/Verify.js');
const { StaticJsonRpcProvider } = require('@ethersproject/providers');
const { verifyMessage } = require('@ethersproject/wallet');
const { Contract } = require('@ethersproject/contracts');

const FUNCTION_NAME = 'add-vote';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();
  const provider = new StaticJsonRpcProvider(PROVIDER_URL);

  try {
    if (!verifyDomain(event.headers.host)) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: `Unsupported Request Method: ${event.httpMethod}` };
    }

    const data = JSON.parse(event.body);
    const { value, message, signature } = data;

    // Verify signature.
    const verifiedAddress = verifyMessage(message, signature);

    const garden = value.garden;
    const gardenAbi = contractsNetwork['Garden'].abi;
    const gardenContract = new Contract(garden, gardenAbi, provider);
    const stakeBalance = await gardenContract.balanceOf(verifiedAddress);
    const retVals = [];

    // Check if strategy recored exists and add empty doc if not.
    const strategy = value.strategies[0];
    await insertIfNotExistsVote(value.garden, strategy.address);
    const refStr = await getVotesForStrategy(strategy.address);

    // Add new vote to the votes array and update up/downvotes.
    await updateVotesForStrategy(refStr, strategy, stakeBalance, verifiedAddress);
    retVals.push(refStr.data);

    return {
      statusCode: 200,
      body: JSON.stringify(retVals),
    };
  } catch (error) {
    console.log('error', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    console.log(`${FUNCTION_NAME} completed in ${Date.now() - startTime} ms`);
  }
};
