import { Icon } from 'components/shared';
import { BaseButton } from '../BaseButton/';
import { IconName } from 'models';

import React from 'react';
import styled from 'styled-components';

interface UpvoteButtonProps {
  onClick: any;
  disabled?: boolean;
  selected?: boolean;
  type?: string;
  className?: string;
}

const UpvoteButton = ({ onClick, className, disabled, type, selected }: UpvoteButtonProps) => {
  return (
    <StyledBaseButton
      color={'white'}
      className={className}
      background={selected ? 'var(--positive)' : 'var(--purple)'}
      type={type}
      onClick={onClick}
      selected={selected}
      disabled={disabled}
      height={40}
    >
      <ButtonContents>
        <Icon size={24} name={IconName.bull} />
        <ButtonLabel>Upvote</ButtonLabel>
      </ButtonContents>
    </StyledBaseButton>
  );
};

const ButtonContents = styled.div`
  display: flex;
  align-items: center;
  flex-flow: row nowrap;
`;

const ButtonLabel = styled.div`
  margin-left: 8px;
`;

const StyledBaseButton = styled(BaseButton)<{
  selected?: boolean;
}>`
  padding: 0 27px;
  --main-color: ${(props) => (props.selected ? 'var(--positive)' : 'var(--purple)')};

  &:hover {
    --main-color: var(--purple-06);
    border-color: transparent;
  }

  &:focus {
    opacity: ${(props) => (props.selected ? '0.8' : '0.6')};
    --main-color: var(--positive);
    border-color: transparent;
  }
`;

export default React.memo(UpvoteButton);
