const { arrayify } = require('@ethersproject/bytes');
const { defaultAbiCoder } = require('@ethersproject/abi');
const { keccak256 } = require('@ethersproject/keccak256');
const { toUtf8Bytes } = require('@ethersproject/strings');

/**
 * @param {BigNumber} myBid
 * @param {BigNumber} nonce
 */
const buildProphetBidMessage = (myBid, nonce, contract) => {
  const PROPHET_BID_TYPEHASH = keccak256(toUtf8Bytes('Bid(uint256 _bid,uint256 _nonce)'));
  const payload = defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256', 'uint256'],
    [PROPHET_BID_TYPEHASH, contract, myBid, nonce],
  );
  const payloadHash = keccak256(payload);

  return {
    message: arrayify(payloadHash),
    nonce: nonce.toString(),
    myBid: myBid.toString(),
    contract: contract,
  };
};

/**
 * @param {string} contract
 * @param {string} proposal
 * @param {BigNumber} amount
 * @param {boolean} isApprove
 */
const buildGovernanceVoteMessage = (contract, proposal, amount, isApprove) => {
  const VOTE_PROPOSAL_TYPEHASH = keccak256(
    toUtf8Bytes('ProposalVote(string _proposalId,uint256 _amount,bool _isApprove)'),
  );
  const payload = defaultAbiCoder.encode(
    ['bytes32', 'address', 'string', 'uint256', 'bool'],
    [VOTE_PROPOSAL_TYPEHASH, contract, proposal, amount, isApprove],
  );
  const payloadHash = keccak256(payload);

  return {
    amount,
    isApprove,
    proposal,
    message: arrayify(payloadHash),
  };
};

/**
 * @param {string} contract
 * @param {string} garden
 * @param {BigNumber} amount
 */
const buildHeartDistVoteMessage = (contract, garden, amount) => {
  const VOTE_GARDEN_TYPEHASH = keccak256(toUtf8Bytes('GardenVote(address _garden,uint256 _amount)'));
  const payload = defaultAbiCoder.encode(
    ['bytes32', 'address', 'address', 'uint256'],
    [VOTE_GARDEN_TYPEHASH, contract, garden, amount],
  );
  const payloadHash = keccak256(payload);

  return {
    amount,
    garden,
    message: arrayify(payloadHash),
  };
};

module.exports = {
  buildGovernanceVoteMessage,
  buildHeartDistVoteMessage,
  buildProphetBidMessage,
};
