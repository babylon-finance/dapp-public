import { StrategyDetails, ExistingVotes } from 'models';

import { commify, formatEther } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { truncateDecimals } from 'helpers/Numbers';

export interface VoteCount {
  existingDownvotes: number;
  existingDownvotesUser: number;
  existingUpvotes: number;
  existingUpvotesUser: number;
  hitQuorum: boolean;
  untilQuorum: string;
  uniqueVoters: number;
}

interface VoteItem {
  voter: string;
  amount: any;
}

const EMPTY_VOTE_COUNT: VoteCount = {
  existingDownvotes: 0,
  existingDownvotesUser: 0,
  existingUpvotes: 0,
  existingUpvotesUser: 0,
  hitQuorum: false,
  untilQuorum: '?',
  uniqueVoters: 0,
};

export function countVotes(
  strategy: StrategyDetails,
  votes: ExistingVotes,
  userAddress: string | undefined,
  minVoters: number,
  quorum: number,
  strategistTokens?: BigNumber | undefined,
): VoteCount {
  if (!votes || !strategy) {
    return EMPTY_VOTE_COUNT;
  }

  const strategistVotes = strategistTokens || strategy.stake;
  let existingUpvotes = strategistVotes;
  let existingUpvotesUser = 0;
  let existingDownvotes = BigNumber.from(0);
  let existingDownvotesUser = 0;

  let untilQuorum = '';
  let hitQuorum = false;

  const voteResponse = votes[strategy.address.toLowerCase()];
  const uniqueVoters = (voteResponse?.votes?.length || 0) + 1;
  const minVotersRequirement = uniqueVoters >= minVoters;
  if (voteResponse) {
    voteResponse.votes.forEach((v) => {
      // Strategist stake & votes. Avoid double counting
      if (v.voter.toLowerCase() === strategy.strategist.toLowerCase()) {
        existingUpvotes = existingUpvotes.sub(strategy.stake);
      }
      if (!v.isOpposed) {
        existingUpvotes = existingUpvotes.add(v.amount);
      } else {
        existingDownvotes = existingDownvotes.add(v.amount);
      }
    });
    if (userAddress) {
      const existingUserVotes = voteResponse.votes.filter((v) => v.voter?.toLowerCase() === userAddress);
      const filteredUpvotes = existingUserVotes
        .filter((x) => x.isOpposed === false)
        .map((v: VoteItem) => BigNumber.from(v.amount));

      const filteredDownvotes = existingUserVotes
        .filter((x) => x.isOpposed === true)
        .map((v: VoteItem) => BigNumber.from(v.amount));

      const summedUserUpvotes: number = parseFloat(
        formatEther(filteredUpvotes.reduceRight((a: BigNumber, b: BigNumber) => a.add(b), BigNumber.from(0))),
      );

      const summedUserDownvotes: number = parseFloat(
        formatEther(filteredDownvotes.reduceRight((a: BigNumber, b: BigNumber) => a.add(b), BigNumber.from(0))),
      );

      existingUpvotesUser = summedUserUpvotes;
      existingDownvotesUser = summedUserDownvotes;
    }
  }

  // The creator votes automatically
  if (userAddress && userAddress.toLowerCase() === strategy.strategist.toLowerCase()) {
    existingUpvotesUser = parseFloat(formatEther(strategistVotes));
  }

  const sumExistingVotes = existingUpvotes.sub(existingDownvotes);
  const quorumWithExisting = quorum - parseFloat(formatEther(sumExistingVotes));
  const finalQuorumDelta = Math.max(0, quorumWithExisting);

  hitQuorum = finalQuorumDelta <= 0;
  untilQuorum = commify(truncateDecimals(finalQuorumDelta, 2));

  return {
    existingDownvotes: parseFloat(formatEther(existingDownvotes)),
    existingDownvotesUser: existingDownvotesUser,
    existingUpvotes: parseFloat(formatEther(existingUpvotes)),
    existingUpvotesUser: existingUpvotesUser,
    hitQuorum: hitQuorum && minVotersRequirement,
    untilQuorum: untilQuorum,
    uniqueVoters,
  };
}
