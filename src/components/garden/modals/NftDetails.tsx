import { ProtocolIcon } from 'components/shared/Icons';
import { TurquoiseButton } from 'components/shared';

import { GardenNFTMeta } from 'models';

import styled from 'styled-components';
import React from 'react';

interface NftDetailsProps {
  gardenNFT: GardenNFTMeta;
  onFinish: () => void;
}

const NftDetails = ({ gardenNFT, onFinish }: NftDetailsProps) => {
  return (
    <ResultWrapper>
      <NftImage src={gardenNFT?.image || '/community_logo_pink.svg'} />
      <NftHeadline>Check it out...</NftHeadline>
      <NftText>You have a new Garden NFT!</NftText>
      <OpenSeaLink href="https://opensea.io/collection/babylon-garden-nft" target="_blank" rel="noopener noreferrer">
        <ProtocolIcon name="opensea" size={30} />
        <OpenSeaLinkText>View on OpenSea</OpenSeaLinkText>
      </OpenSeaLink>
      <TurquoiseButton
        onClick={() => {
          onFinish();
        }}
      >
        Close
      </TurquoiseButton>
    </ResultWrapper>
  );
};

const NftImage = styled.img`
  width: 250px;
  height: 250px;
  position: relative;
  overflow: hidden;
  border: 2px solid var(--blue-06);
  border-radius: 2px;
`;

const NftHeadline = styled.div`
  width: 100%
  text-align: center;
  padding: 20px 0px 10px 0;
  font-weight: 500;
  font-size: 24px;
`;

const NftText = styled.div`
  width: 100%;
  text-align: center;
  padding-bottom: 20px;
  font-size: 16px;
`;

const OpenSeaLinkText = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding-left: 8px;
`;

const OpenSeaLink = styled.a`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  font-family: cera-bold;
  font-size: 16px;
  color: var(--white);
  text-decoration: none;
  cursor: pointer;
  margin-bottom: 40px;

  &:hover,
  &:visited,
  &:link,
  &:active {
    color: inherit;
    text-decoration: none;
  }

  &:hover {
    color: var(--purple);
  }
`;

const ResultWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;

  p {
    width: 100%;
  }
  overflow-x: hidden;
`;

export default React.memo(NftDetails);
