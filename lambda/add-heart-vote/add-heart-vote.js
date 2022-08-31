const { contracts } = require('../shared/1.json');
const contractsDev = require('../shared/31337.json');

let contractsNetwork = contracts;
if (process.env.REACT_APP_CHAIN_ID === '31337') {
  contractsNetwork = contractsDev.contracts;
}
const { Contract } = require('@ethersproject/contracts');
const { verifyDomain } = require('../shared/Verify.js');
const { PROVIDER_URL, HEART_ADDRESS } = require('../shared/constants.js');
const { StaticJsonRpcProvider } = require('@ethersproject/providers');
const { insertHeartDistVote, getHeartDistVoteByUser, updateHeartDistVoteForUser } = require('../shared/queries');
const { buildHeartDistVoteMessage } = require('../shared/web3.js');

const { verifyMessage } = require('@ethersproject/wallet');
const { splitSignature, arrayify } = require('@ethersproject/bytes');
const { BigNumber } = require('@ethersproject/bignumber');

const FUNCTION_NAME = 'add-heart-vote';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();

  try {
    if (!verifyDomain(event.headers.host)) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: `Unsupported Request Method: ${event.httpMethod}` };
    }

    const data = JSON.parse(event.body);
    const { signature, payload } = data;
    const { amount, garden, address, contract } = payload;

    const splitSig = splitSignature(signature);
    const hash = buildHeartDistVoteMessage(contract, garden, BigNumber.from(amount));

    // Verify signature.
    const verifiedAddress = verifyMessage(arrayify(hash.message), splitSig);

    if (verifiedAddress.toLowerCase() !== address.toLowerCase()) {
      console.error('invalid signature', verifiedAddress.toLowerCase(), address.toLowerCase());
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid signature' }),
      };
    }

    // Verifies voting power
    const provider = new StaticJsonRpcProvider(PROVIDER_URL);
    const gardenAbi = contractsNetwork['Garden'].abi;
    const heartContract = new Contract(HEART_ADDRESS, gardenAbi, provider);
    const votingPowerBalance = await heartContract.getHeartVotingPower(verifiedAddress);

    if (!votingPowerBalance.eq(BigNumber.from(amount))) {
      console.error(
        `Invalid voting balance for address: ${verifiedAddress}`,
        votingPowerBalance.toNumber(),
        amount.toNumber(),
      );
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid signature' }),
      };
    }

    const existing = await getHeartDistVoteByUser(address);

    if (existing.data[0]) {
      // update the record instead if they have an existing vote
      const updated = await updateHeartDistVoteForUser(existing.data[0], garden, amount, address, signature);
      return {
        statusCode: 200,
        body: JSON.stringify(updated.data),
      };
    }

    const result = await insertHeartDistVote(signature, amount, address, garden, startTime);
    return {
      statusCode: 200,
      body: JSON.stringify(result.data),
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
