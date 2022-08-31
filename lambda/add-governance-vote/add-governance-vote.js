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
const { insertGovernanceVote, getGovernanceVoteByPair } = require('../shared/queries');
const { buildGovernanceVoteMessage } = require('../shared/web3');

const { verifyMessage } = require('@ethersproject/wallet');
const { splitSignature, arrayify } = require('@ethersproject/bytes');
const { BigNumber } = require('@ethersproject/bignumber');

const FUNCTION_NAME = 'add-governance-vote';

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
    const { amount, isApprove, proposal, address, contract } = payload;

    const splitSig = splitSignature(signature);
    const hash = buildGovernanceVoteMessage(contract, proposal, BigNumber.from(amount), isApprove);

    // Verify signature.
    const verifiedAddress = verifyMessage(arrayify(hash.message), splitSig);

    if (verifiedAddress.toLowerCase() !== address.toLowerCase()) {
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

    // If user has already voted they are trying to exploit.
    if (await getGovernanceVoteByPair(address, proposal)) {
      console.low(`Duplicate vote attempt: User ${address} submitting ${amount}`);
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const result = await insertGovernanceVote(signature, amount, isApprove, verifiedAddress, proposal, startTime);
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
