import { Token } from 'models';

import React from 'react';
import styled from 'styled-components';

interface TokenDisplayProps {
  size: number;
  token: Token | undefined;
  symbol?: boolean;
  reserveSymbol?: string;
  className?: string;
}

const TokenDisplay = ({ size, token, symbol = true, className, reserveSymbol }: TokenDisplayProps) => {
  const buildTokenURI = (address: string) => {
    return `https://raw.githubusercontent.com/uniswap/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
  };

  const src = token?.logoURI === '' ? buildTokenURI(token.address) : token?.logoURI || '';
  const tokenSymbol = reserveSymbol || token?.symbol || 'SYMBOL';

  return (
    <TokenImgWrapper className={className}>
      <TokenImg
        onError={(e: any) => {
          e.target.src = '/gardentoken_icon.svg';
        }}
        width={size}
        height={size}
        src={src}
        alt={tokenSymbol}
      />
      {symbol && <TokenSymbol>{tokenSymbol}</TokenSymbol>}
    </TokenImgWrapper>
  );
};

const TokenImgWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  width: auto;
`;

const TokenSymbol = styled.div`
  font-size: 16px;
  text-align: left;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TokenImg = styled.img`
  margin-right: 10px;
`;

export default React.memo(TokenDisplay);
