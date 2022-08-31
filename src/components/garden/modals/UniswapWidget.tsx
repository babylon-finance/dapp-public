import { formatReserveFloat } from 'helpers/Numbers';
import { Token } from 'models';
import { TokenListService } from 'services';
import { useW3Context } from 'context/W3Provider';

import { BigNumber } from '@ethersproject/bignumber';
import { Theme, SwapWidget } from '@uniswap/widgets';
import React from 'react';
import styled from 'styled-components';

const theme: Theme = {
  accent: '#00c7ba',
  borderRadius: 0.2,
  container: '#231d65',
  dialog: '#181350',
  fontFamily: 'cera-regular',
  interactive: '#38336d',
  module: '#181350',
  outline: '#917dff',
  primary: '#fff',
  secondary: '#afacc9',
  onInteractive: '#fff',
};

interface UniswapWidgetProps {
  reserveToken: Token;
  minContribution: BigNumber;
  balance: BigNumber;
  maxFee: BigNumber | undefined;
}

const UniswapWidget = ({ reserveToken, balance, minContribution, maxFee }: UniswapWidgetProps) => {
  const { txProvider } = useW3Context();
  const tokenListService = TokenListService.getInstance();
  const reserveList = tokenListService.getReserveTokens();
  // 20% buffer in case for signature deposit
  const needed = Math.ceil(
    formatReserveFloat(minContribution.add(maxFee || BigNumber.from(0)).sub(balance), reserveToken, 8) * 1.05,
  );

  if (needed < 0) {
    return <div />;
  }

  return (
    <WidgetContainer>
      <WidgetDescription>
        Wallet holds less than the minimum {reserveToken.symbol} necessary for deposit. Please acquire more{' '}
        {reserveToken.symbol} to continue.
      </WidgetDescription>
      <SwapWrapper>
        <SwapWidget
          theme={theme}
          provider={txProvider}
          jsonRpcEndpoint={process.env.REACT_APP_QUICKNODE_HTTP_URL}
          width={'100%'}
          tokenList={reserveList}
          defaultOutputAmount={needed}
          defaultOutputTokenAddress={reserveToken.address}
        />
      </SwapWrapper>
      <AmountRow>
        <AmountLabel>Minimum Deposit</AmountLabel>
        <AmountValue>
          {formatReserveFloat(minContribution, reserveToken, 2)} {reserveToken.symbol}
        </AmountValue>
      </AmountRow>
      {maxFee && (
        <AmountRow>
          <AmountLabel>Estimated Deposit Fee</AmountLabel>
          <AmountValue>
            ~ {formatReserveFloat(maxFee, reserveToken, 2)} {reserveToken.symbol}
          </AmountValue>
        </AmountRow>
      )}
      <AmountRow>
        <AmountLabel>Balance</AmountLabel>
        <AmountValue>
          {formatReserveFloat(balance, reserveToken, 2)} {reserveToken.symbol}
        </AmountValue>
      </AmountRow>
      <AmountRow>
        <AmountLabel>Needed</AmountLabel>
        <AmountValue>
          ~ {needed} {reserveToken.symbol}
        </AmountValue>
      </AmountRow>
    </WidgetContainer>
  );
};

const AmountRow = styled.div`
  color: var(--blue-03);
  display: flex;
  flex-flow: row nowrap;
  padding-bottom: 6px;
  width: 100%;
`;

const AmountLabel = styled.div`
  flex-grow: 1;
`;

const AmountValue = styled.div`
  width: auto;
  margin-left: auto;
  text-align: left;
`;

const WidgetDescription = styled.div`
  width: 100%;
  padding-bottom: 30px;
`;

const WidgetContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const SwapWrapper = styled.div`
  padding: 0 0 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default React.memo(UniswapWidget);
