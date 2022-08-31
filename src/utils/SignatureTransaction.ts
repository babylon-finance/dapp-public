import { GardenVote } from 'models';
import { HEART_GARDEN_ADDRESS } from 'config';
import { ProphetBidPayload } from 'models/ProphetBid';
import { verifyMessage } from '@ethersproject/wallet';

import axios from 'axios';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { arrayify, splitSignature, joinSignature } from '@ethersproject/bytes';
import { defaultAbiCoder } from '@ethersproject/abi';
import { keccak256 } from '@ethersproject/keccak256';
import { parseEther } from '@ethersproject/units';
import { toUtf8Bytes } from '@ethersproject/strings';

export enum SignatureTransactionType {
  deposit = 'deposit',
  withdraw = 'withdraw',
  claim = 'claim',
  claimStake = 'claimStake',
  bond = 'bond',
}

const WITHDRAW_EVENT_CODE = 'withdrawBySig';
const DEPOSIT_EVENT_CODE = 'depositBySig';
const CLAIM_EVENT_CODE = 'claimBySig';
const CLAIM_STAKE_EVENT_CODE = 'claimAndStakeBySig';
const BOND_EVENT_CODE = 'bondBySig';

const getEventCode = (action: SignatureTransactionType): string => {
  switch (action) {
    case SignatureTransactionType.claimStake:
      return CLAIM_STAKE_EVENT_CODE;
    case SignatureTransactionType.claim:
      return CLAIM_EVENT_CODE;
    case SignatureTransactionType.deposit:
      return DEPOSIT_EVENT_CODE;
    case SignatureTransactionType.withdraw:
      return WITHDRAW_EVENT_CODE;
    case SignatureTransactionType.bond:
      return BOND_EVENT_CODE;
  }
};

export const buildDepositMessage = (
  to: string,
  amountIn: BigNumber,
  minAmountOut: BigNumber,
  maxFee: BigNumber,
  nonce: BigNumber,
  gardenAddress: string,
  contributor: string,
  referrer: string,
) => {
  const DEPOSIT_BY_SIG_TYPEHASH = keccak256(
    toUtf8Bytes(
      'DepositBySig(uint256 _amountIn,uint256 _minAmountOut,uint256 _nonce,uint256 _maxFee,address _to,address _referrer)',
    ),
  );

  const payload = defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'address'],
    [DEPOSIT_BY_SIG_TYPEHASH, gardenAddress, amountIn, minAmountOut, nonce, maxFee, to, referrer],
  );

  const payloadHash = keccak256(payload);

  return {
    message: arrayify(payloadHash),
    maxFee,
    amountIn,
    minAmountOut,
    nonce,
    garden: gardenAddress,
    contributor,
    referrer,
  };
};

export const buildBondMessage = (
  to: string,
  assetToBond: string,
  bablDepositAmount: BigNumber,
  amountToBond: BigNumber,
  minAmountOut: BigNumber,
  nonce: BigNumber,
  maxFee: BigNumber,
  gardenAddress: string,
  contributor: string,
  referrer: string,
  userLock: number,
) => {
  const DEPOSIT_BY_SIG_TYPEHASH = keccak256(
    toUtf8Bytes(
      'DepositBySig(uint256 _amountIn,uint256 _minAmountOut,uint256 _nonce,uint256 _maxFee,address _to,address _referrer)',
    ),
  );

  const payload = defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'address'],
    [DEPOSIT_BY_SIG_TYPEHASH, gardenAddress, bablDepositAmount, minAmountOut, nonce, maxFee, to, referrer],
  );

  const payloadHash = keccak256(payload);

  return {
    message: arrayify(payloadHash),
    assetToBond,
    amountToBond,
    maxFee,
    amountIn: bablDepositAmount,
    minAmountOut,
    nonce,
    userLock,
    garden: gardenAddress,
    contributor,
    referrer,
  };
};

export const buildWithdrawMessage = (
  amountIn: BigNumber,
  minAmountOut: BigNumber,
  maxFee: BigNumber,
  nonce: BigNumber,
  gardenAddress: string,
  withPenalty: boolean,
  contributor: string,
) => {
  const WITHDRAW_BY_SIG_TYPEHASH = keccak256(
    toUtf8Bytes(
      'WithdrawBySig(uint256 _amountIn,uint256 _minAmountOut,uint256,_nonce,uint256 _maxFee,uint256 _withPenalty)',
    ),
  );

  const payload = defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'bool'],
    [WITHDRAW_BY_SIG_TYPEHASH, gardenAddress, amountIn, minAmountOut, nonce, maxFee, withPenalty],
  );

  const payloadHash = keccak256(payload);

  return {
    message: arrayify(payloadHash),
    maxFee,
    amountIn,
    minAmountOut,
    nonce,
    garden: gardenAddress,
    withPenalty,
    contributor,
  };
};

export const buildClaimMessage = (
  garden: string,
  babl: BigNumber,
  profits: BigNumber,
  nonce: BigNumber,
  maxFee: BigNumber,
  contributor: string,
) => {
  const REWARDS_BY_SIG_TYPEHASH = keccak256(
    toUtf8Bytes('RewardsBySig(uint256 _babl,uint256 _profits,uint256 _nonce,uint256 _maxFee)'),
  );

  const payload = defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256', 'uint256', 'uint256', 'uint256'],
    [REWARDS_BY_SIG_TYPEHASH, garden, babl, profits, nonce, maxFee],
  );

  const payloadHash = keccak256(payload);

  return {
    message: arrayify(payloadHash),
    babl,
    profits,
    garden,
    maxFee,
    nonce,
    contributor,
  };
};

export const buildClaimAndStakeMessage = (
  garden: string,
  babl: BigNumber,
  profits: BigNumber,
  minAmountOut: BigNumber,
  nonce: BigNumber,
  nonceHeart: BigNumber,
  maxFee: BigNumber,
  contributor: string,
) => {
  const STAKE_BY_SIG_TYPEHASH = keccak256(
    toUtf8Bytes(
      'StakeRewardsBySig(uint256 _babl,uint256 _profits,uint256 _minAmountOut,uint256 _nonce,uint256 _nonceHeart,uint256 _maxFee,address _to)',
    ),
  );

  const payload = defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'address'],
    [STAKE_BY_SIG_TYPEHASH, HEART_GARDEN_ADDRESS, babl, profits, minAmountOut, nonce, nonceHeart, maxFee, contributor],
  );

  const payloadHash = keccak256(payload);

  return {
    message: arrayify(payloadHash),
    babl,
    garden,
    maxFee,
    minAmountOut,
    nonce,
    nonceHeart,
    profits,
    contributor,
  };
};

export const buildGovernanceVoteMessage = (
  address: string,
  contract: string,
  proposal: BigNumber,
  amount: BigNumber,
  isApprove: boolean,
) => {
  const VOTE_PROPOSAL_TYPEHASH = keccak256(
    toUtf8Bytes('ProposalVote(string _proposalId,uint256 _amount,bool _isApprove)'),
  );
  const payload = defaultAbiCoder.encode(
    ['bytes32', 'address', 'string', 'uint256', 'bool'],
    [VOTE_PROPOSAL_TYPEHASH, contract, proposal.toString(), amount, isApprove],
  );
  const payloadHash = keccak256(payload);

  return {
    address,
    contract,
    amount: amount.toString(),
    isApprove,
    proposal: proposal.toString(),
    message: arrayify(payloadHash),
  };
};

export const buildHeartDistVoteMessage = (
  address: string,
  contract: string,
  garden: string,
  amount: BigNumber,
): GardenVote => {
  const VOTE_GARDEN_TYPEHASH = keccak256(toUtf8Bytes('GardenVote(address _garden,uint256 _amount)'));
  const payload = defaultAbiCoder.encode(
    ['bytes32', 'address', 'address', 'uint256'],
    [VOTE_GARDEN_TYPEHASH, contract, garden, amount],
  );
  const payloadHash = keccak256(payload);

  return {
    address,
    amount: amount.toString(),
    contract,
    garden,
    message: arrayify(payloadHash),
  };
};

export const buildProphetBidMessage = (myBid: BigNumber, nonce: BigNumber): ProphetBidPayload => {
  const ARRIVAL_ADDRESS = '0xe9883aee5828756216fd7df80eb56bff90f6e7d7';
  const PROPHET_BID_TYPEHASH = keccak256(toUtf8Bytes('Bid(uint256 _bid,uint256 _nonce)'));
  const payload = defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256', 'uint256'],
    [PROPHET_BID_TYPEHASH, ARRIVAL_ADDRESS, myBid, nonce],
  );
  const payloadHash = keccak256(payload);
  if (nonce.toNumber() === 0) {
    console.error('Nonce cannot be 0');
    throw new Error('Invalid nonce');
  }
  if (myBid.lt(parseEther('0.4')) || myBid.gt(parseEther('200'))) {
    console.error('Amount needs to ne between 0.4 and 200');
    throw new Error('Invalid bid amount');
  }

  return {
    message: arrayify(payloadHash),
    nonce: nonce.toString(),
    myBid: myBid.toString(),
    contract: ARRIVAL_ADDRESS,
  };
};

export const submitSignatureTransaction = async (
  payload: any,
  signer: any,
  action: SignatureTransactionType,
  notify: any,
): Promise<TransactionResponse | undefined> => {
  const eventCode = getEventCode(action);
  const successMessage = `${_firstUpper(action)} by signature is being processed!`;
  const confirmMessage = `Please confirm ${_firstUpper(action)} by signature...`;
  let errorMessage = `${_firstUpper(action)} by signature failed! Please try again later.`;

  const notificationObject = {
    eventCode,
    type: 'pending',
    message: confirmMessage,
  };

  // @ts-ignore
  const { update } = notify.notification(notificationObject);
  try {
    // joinSignature required to flip v to 27/28 for libs which
    // generates signatures with 0/1 for v instead 27/28, add 27 to v to accept
    // these malleable signatures as well.
    const signature = joinSignature(await signer.signMessage(payload.message));
    const valid = await validateSignature(payload.message, signature, await signer.getAddress());

    if (!valid) {
      update({
        eventCode: '400',
        type: 'error',
        message: 'Wallet produced an invalid signature, please contact Babylon support to resolve.',
      });

      return Promise.resolve(undefined);
    }

    const response = await axios.post('/api/v1/transaction-by-sig', { signature, payload, action });
    if (response.status === 200 && !response.data.code) {
      update({
        eventCode,
        type: 'success',
        message: successMessage,
      });
      console.log(response);
      return response.data;
    } else {
      // Handle custom error messages from the Accountant
      update({
        eventCode: '500',
        type: 'error',
        message: response.data.error,
      });
      return undefined;
    }
  } catch (error) {
    update({
      eventCode,
      type: 'error',
      message: errorMessage,
    });
    return undefined;
  }
};

export const validateSignature = async (message: any, signature: any, address: string): Promise<boolean> => {
  try {
    const sig = splitSignature(signature);
    const recoveredAddress = verifyMessage(arrayify(message), sig);

    return recoveredAddress?.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.log('Failed to validate signature', error);
    return false;
  }
};

const _firstUpper = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
