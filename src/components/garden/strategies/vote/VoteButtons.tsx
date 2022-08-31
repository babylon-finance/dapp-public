import styled from 'styled-components';
import React from 'react';
import { UpvoteButton, DownvoteButton } from 'components/shared';

interface VoteButtonsProps {
  strategy: string;
  existingEndorse: number;
  existingOppose: number;
  existingEndorseUser: number;
  existingOpposeUser: number;
  userTokenBalance: number;
  enteredCooldownAt: number;
  handleVoteSubmit: (address: string, isOpposed: boolean) => void;
  className?: string;
}

const VoteButtons = ({
  strategy,
  handleVoteSubmit,
  enteredCooldownAt,
  existingOpposeUser,
  existingEndorseUser,
  userTokenBalance,
  className,
}: VoteButtonsProps) => {
  const currentDownvotes = existingOpposeUser || 0;
  const currentUpvotes = existingEndorseUser || 0;
  const hasVoted = currentDownvotes > 0 || currentUpvotes > 0;
  const canVote = enteredCooldownAt === 0;

  return (
    <VoteActionWrapper className={className}>
      {!currentDownvotes && (
        <UpvoteButton
          disabled={hasVoted || !canVote}
          selected={!!currentUpvotes}
          onClick={() => !hasVoted && handleVoteSubmit(strategy, false)}
        />
      )}
      {!currentUpvotes && (
        <DownvoteButton
          disabled={hasVoted || !canVote}
          selected={!!currentDownvotes}
          onClick={() => !hasVoted && handleVoteSubmit(strategy, true)}
        />
      )}
    </VoteActionWrapper>
  );
};

const VoteActionWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;

  > :first-child {
    margin-right: 10px;
  }
`;

export default React.memo(VoteButtons);
