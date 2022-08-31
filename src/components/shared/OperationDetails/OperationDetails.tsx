import { TokenDisplay, Member } from 'components/shared';
import { OperationKind, StrategyOperation, Token } from 'models';
import React, { useState, useEffect } from 'react';
import { TokenListService } from 'services';
import styled from 'styled-components';
import { hexDataSlice } from '@ethersproject/bytes';

interface OperationDetailsProps {
  operation: StrategyOperation;
}

const OperationDetails = ({ operation }: OperationDetailsProps) => {
  const { kind, data, dataAux } = operation;
  const [tokens, setTokens] = useState<Token[] | undefined>(undefined);

  const tokenListService = TokenListService.getInstance();

  const getStrategyDetails = async () => {
    let addresses: string[] = [];

    if (!dataAux) {
      addresses = [hexDataSlice(data, 12, 32)];
      if (kind === OperationKind.pool || kind === OperationKind.yield) {
        // Override tokens with pool data or vault data
      }
    } else {
      addresses = dataAux;
    }

    if (addresses) {
      setTokens(addresses.map((t: string) => tokenListService.getTokenByAddress(t) as Token).filter((i) => !!i));
    }
  };

  useEffect(() => {
    getStrategyDetails();
  }, []);

  const safeTokenDisplay = (maybeToken: any | undefined, size: number) => {
    return <TokenDisplay size={size} token={maybeToken} />;
  };

  return (
    <OperationDetailsWrapper>
      {kind === OperationKind.long && tokens && tokens.length > 0 && safeTokenDisplay(tokens[0], 32)}
      {kind === OperationKind.pool && tokens && tokens.length > 0 && (
        <MultiToken>
          {safeTokenDisplay(tokens[0], 32)}
          <span>LP Pool</span>
        </MultiToken>
      )}
      {kind === OperationKind.yield && tokens && tokens.length > 0 && (
        <MultiToken>
          {safeTokenDisplay(tokens[0], 32)}
          <span>Vault</span>
        </MultiToken>
      )}
      {kind === OperationKind.lend && tokens && tokens.length > 0 && <TokenDisplay size={32} token={tokens[0]} />}
      {kind === OperationKind.borrow && tokens && tokens.length > 0 && <TokenDisplay size={32} token={tokens[0]} />}
      {!tokens || (tokens.length === 0 && <Member size={10} address={hexDataSlice(data, 12, 32)} showText />)}
    </OperationDetailsWrapper>
  );
};

const OperationDetailsWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`;

const MultiToken = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;

  > div {
    font-size: 14px;
    img {
      margin-right: 3px;
    }
  }

  span {
    margin: 0 3px;
  }
`;

export default React.memo(OperationDetails);
