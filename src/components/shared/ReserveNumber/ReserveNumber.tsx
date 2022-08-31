import { formatReserveDisplay, formatReserveToFiatDisplay } from 'helpers/Numbers';
import { useW3Context } from 'context/W3Provider';
import { Ticker, Token } from 'models/';
import { TokenListService } from 'services';

import { BigNumber } from '@ethersproject/bignumber';
import React from 'react';
import styled from 'styled-components';

interface ReserveNumberProps {
  value: BigNumber;
  sharePrice?: BigNumber;
  symbol?: string;
  hideSymbol?: boolean;
  address?: string;
  precision?: number;
  className?: string;
  fiat?: boolean;
  numeral?: boolean;
}

const ReserveNumber = ({
  value,
  className,
  precision,
  symbol,
  address,
  hideSymbol,
  sharePrice,
  fiat = false,
  numeral = true,
}: ReserveNumberProps) => {
  const { quotes, userPrefs } = useW3Context();
  const tokenListService = TokenListService.getInstance();
  const fiatCurrency = (userPrefs && userPrefs.currency) || 'USD';
  let reserve: Token = tokenListService.getTokenBySymbol('ETH') as Token;

  if (symbol) {
    reserve = tokenListService.getTokenBySymbol(symbol) as Token;
  }

  if (address) {
    reserve = tokenListService.getTokenByAddress(address) as Token;
  }

  const ticker: any = quotes && quotes[reserve.symbol === 'WETH' ? 'ETH' : reserve.symbol];
  if (!ticker) {
    return (
      <ReserveNumberWrapper fiat={fiat} className={className}>
        ...
      </ReserveNumberWrapper>
    );
  }
  const quote = (ticker as Ticker).quote;

  let finalValue = sharePrice && value ? sharePrice.mul(value).div(1e9).div(1e9) : value;

  return (
    <ReserveNumberWrapper className={className} fiat={fiat}>
      <div>{formatReserveDisplay(value || BigNumber.from(0), reserve, precision, numeral, !hideSymbol)}</div>
      <div>
        {formatReserveToFiatDisplay(
          finalValue || BigNumber.from(0),
          reserve,
          fiatCurrency,
          quote[fiatCurrency].price,
          numeral,
          precision,
        )}
      </div>
    </ReserveNumberWrapper>
  );
};

const ReserveNumberWrapper = styled.div<{ fiat: boolean }>`
  display: inline-flex;
  font-family: cera-regular;
  font-weight: 700;
  font-feature-settings: 'pnum' on, 'lnum' on;

  div:last-child {
    display: none;
  }

  ${(p) => (p.fiat ? 'div { width: 100%;display: none; } div:last-child { width: 100%;display: block; }' : '')}

  &:hover {
    div {
      width: 100%;
      display: none;
    }

    div:last-child {
      width: 100%;
      display: block;
    }
  }
`;

export default React.memo(ReserveNumber);
