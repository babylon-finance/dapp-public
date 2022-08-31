import React from 'react';
import styled from 'styled-components';
import { BigNumber } from '@ethersproject/bignumber';
import { formatFiatDisplay, formatReserveToFiatDisplay } from 'helpers/Numbers';
import { Token, Ticker } from 'models';
import { useW3Context } from 'context/W3Provider';

interface FiatNumberProps {
  value: BigNumber;
  convertFrom?: Token;
  className?: string;
  precision?: number;
}

const FiatNumber = ({ value, convertFrom, className, precision }: FiatNumberProps) => {
  const { userPrefs, quotes } = useW3Context();
  const ticker: any = quotes && convertFrom && quotes[convertFrom.symbol === 'WETH' ? 'ETH' : convertFrom.symbol];
  const fiatCurrency = (userPrefs && userPrefs.currency) || 'USD';
  return (
    <FiatNumberWrapper className={className}>
      {convertFrom && (
        <>
          {formatReserveToFiatDisplay(
            value,
            convertFrom,
            fiatCurrency,
            (ticker as Ticker).quote[fiatCurrency].price,
            true,
            precision,
          )}
        </>
      )}
      {!convertFrom && <>{formatFiatDisplay(value, fiatCurrency, precision)}</>}
    </FiatNumberWrapper>
  );
};

const FiatNumberWrapper = styled.div`
  display: inline-flex;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

export default React.memo(FiatNumber);
