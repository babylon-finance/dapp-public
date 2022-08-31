import StarSVG from './star.svg';

import { mkShortAddress } from '../../../helpers/Addresses';
import { buildEtherscanContractUrl } from '../../../helpers/Urls';

import { Blockie } from 'rimble-ui';
import React from 'react';
import styled from 'styled-components';

interface MemberProps {
  address: string;
  displayName?: string | undefined;
  avatarUrl?: string | undefined;
  color?: string;
  bgcolor?: string;
  link?: boolean;
  linkOverride?: string;
  showText?: boolean;
  you?: boolean;
  creator?: boolean;
  width?: number;
  size?: number;
  scale?: number;
  br?: number;
  className?: string;
  noTruncate?: boolean;
  round?: boolean;
}

const Member = ({
  address,
  avatarUrl = undefined,
  bgcolor,
  br = 4,
  className,
  color,
  creator,
  displayName = undefined,
  link = true,
  linkOverride,
  noTruncate = false,
  round = true,
  scale,
  showText,
  size = 10,
  width,
  you,
}: MemberProps) => {
  const buildDisplayText = () => {
    return (
      <StyledMemberText>
        {displayName ? <DisplayName noTruncate={noTruncate}>{displayName}</DisplayName> : mkShortAddress(address)}
        {you && <You>[You]</You>}
      </StyledMemberText>
    );
  };

  return (
    <MemberImageWrapper width={width} className={className}>
      <a href={buildEtherscanContractUrl(address)}>
        {creator && <StarIcon alt="creator-icon" src={StarSVG} />}
        {avatarUrl && (
          <Avatar round={round}>
            <img alt="avatar-img" height={30} width={30} src={avatarUrl} />
          </Avatar>
        )}
        {!avatarUrl && (
          <BlockieContainer br={br || 4}>
            <Blockie
              br={br}
              opts={{
                seed: address,
                color: color || '#4420d8',
                bgcolor: bgcolor || '#00C7BA',
                size: size,
                scale: scale || 3,
                spotcolor: '#937dff',
              }}
            />
          </BlockieContainer>
        )}
      </a>
      {showText && (
        <TextAddress>
          {link ? (
            <StyledAddressLink
              href={linkOverride ? linkOverride : buildEtherscanContractUrl(address)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {buildDisplayText()}
            </StyledAddressLink>
          ) : (
            <>{buildDisplayText()}</>
          )}
        </TextAddress>
      )}
    </MemberImageWrapper>
  );
};

const Avatar = styled.div<{ round: boolean }>`
  overflow: hidden;
  border-radius: ${(p) => (p.round ? '15px' : '4px')};
  width: 30px;
  height: 30px;
  text-align: center;
  display: block;
`;

const StarIcon = styled.img`
  width: 20px;
  height: 20px;
  position: absolute;
  top: -10px;
  left: -10px;
`;

const DisplayName = styled.div<{ noTruncate: boolean; link?: boolean }>`
  max-width: ${(p) => (p.noTruncate ? '200px' : '100px')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const You = styled.span`
  color: var(--purple-02);
  margin-left: 7px;
`;

const MemberImageWrapper = styled.div<{ width: number | undefined }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  width: ${(props) => (props.width ? `${props.width}px` : 'auto')};
`;

const BlockieContainer = styled.div<{ br?: number }>`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  overflow: hidden;
  border-radius: ${(p) => (p.br ? `${p.br}px` : '0px')};
`;

const StyledAddressLink = styled.a`
  color: var(--white);
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: var(--blue-03);
    text-decoration: underline;
  }
`;

const StyledMemberText = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
`;

const TextAddress = styled.span`
  display: flex;
`;

export default React.memo(Member);
