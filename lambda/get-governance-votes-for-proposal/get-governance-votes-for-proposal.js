const { getGovernanceVotesByProposal, getGovernanceVoteByPair } = require('../shared/queries.js');
const { verifyDomain } = require('../shared/Verify.js');

const FUNCTION_NAME = 'get-governance-votes-for-proposal';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();

  try {
    if (!verifyDomain(event.headers.host)) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: 'Unsupported request method.' };
    }

    const params = event.path.split('get-governance-votes-for-proposal/');
    let funcArgs = params[1].split('/');

    if (funcArgs.length === 0 || funcArgs.length > 2) {
      return { statusCode: 400, body: 'Proposal ID is required.' };
    }

    let proposal;
    let result;
    if (funcArgs.length === 1) {
      proposal = funcArgs[0];
      result = await getGovernanceVotesByProposal(proposal);
      result = result ? result.data.map((d) => d.data) : [];
    }
    if (funcArgs.length === 2) {
      proposal = funcArgs[0];
      result = await getGovernanceVoteByPair(proposal, funcArgs[1]);
      result = result ? result.data : {};
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result),
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
