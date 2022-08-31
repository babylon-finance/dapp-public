import styled from 'styled-components';
import React from 'react';
import { HoverTooltip } from 'components/shared';
import { IconName } from 'models';

interface DisplayVoteProps {
  strategy: string;
  existingEndorseUser: number;
  existingOpposeUser: number;
  userTokenBalance: number;
  small?: boolean;
}

const ENDORSE_COPY = 'You endorsed executing this Strategy and will earn Steward rewards if profitable.';
const OPPOSE_COPY = 'You opposed executing this Strategy and will Steward rewards if unprofitable.';

const DisplayVote = ({
  strategy,
  existingOpposeUser,
  existingEndorseUser,
  userTokenBalance,
  small,
}: DisplayVoteProps) => {
  const currentDownvotes = existingOpposeUser || 0;
  const currentUpvotes = existingEndorseUser || 0;
  const hasVoted = currentDownvotes > 0 || currentUpvotes > 0;
  const endorsed = currentUpvotes > 0;

  if (!hasVoted) {
    return <div>--</div>;
  }

  return (
    <VoteWrapper small={small}>
      <VoteImageWrapper small={small} bull={endorsed}>
        <HoverTooltip
          placement={'up'}
          icon={endorsed ? IconName.bull : IconName.bear}
          size={small ? 20 : 32}
          content={endorsed ? ENDORSE_COPY : OPPOSE_COPY}
        />
      </VoteImageWrapper>
      {!small && <VoteLabel>{currentUpvotes > 0 ? 'Upvote' : 'Downvote'}</VoteLabel>}
    </VoteWrapper>
  );
};

const VoteWrapper = styled.div<{ small?: boolean }>`
  display: flex;
  flex-flow: column nowrap;
  align-items: ${(props) => (props.small ? 'flex-start' : 'center')};
  padding: ${(props) => (props.small ? '0' : '0 14px')};
`;

const VoteImageWrapper = styled.div<{ bull: boolean; small?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => (props.small ? '40px' : '52px')};
  height: ${(props) => (props.small ? '40px' : '52px')};
  border-radius: ${(props) => (props.small ? '20px' : '26px')};

  background: ${(props) => (props.bull ? 'var(--positive)' : 'var(--negative)')};
`;

const VoteLabel = styled.div`
  font-size: 13px;
  margin-top: 4px;
  color: white;
`;

export default React.memo(DisplayVote);
