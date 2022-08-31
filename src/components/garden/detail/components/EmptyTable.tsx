import EmptyTableImage from './illustrations/empty_table_outline.svg';
import EmptyMembersImage from './illustrations/invite.svg';

import styled from 'styled-components';
import React from 'react';

interface EmptyTableProps {
  children: React.ReactNode;
  emptyImageKey?: string;
}

const EmptyTable = ({ children, emptyImageKey }: EmptyTableProps) => {
  const image = emptyImageKey
    ? {
        members: EmptyMembersImage,
        strategies: EmptyTableImage,
      }[emptyImageKey]
    : EmptyTableImage;
  return (
    <EmptyTableContainer>
      <ImageContainer>
        <img alt="empty-graph-img" src={image} height={200} width={244} />
      </ImageContainer>
      {children}
    </EmptyTableContainer>
  );
};

const EmptyTableContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  width: 100%;
`;

const ImageContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
`;

export default React.memo(EmptyTable);
