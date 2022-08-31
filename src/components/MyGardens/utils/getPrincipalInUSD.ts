import { QuoteResult, Token } from 'models';
import { TokenListService } from 'services';

import { BigNumber } from '@ethersproject/bignumber';
import { parseEther } from '@ethersproject/units';

export const getPrincipalInUSD = (quotes: QuoteResult | undefined, amount: BigNumber, reserve: string) => {
  const tokenService = TokenListService.getInstance();
  const token = tokenService.getTokenByAddress(reserve) as Token;
  if (quotes && token) {
    const quote = quotes[token.symbol].quote.USD.price;
    if (quote) {
      let result = amount
        .mul(parseEther(quote.toString()))
        .div(10 ** 9)
        .div(10 ** 9);

      if (token.decimals < 18) {
        result = result.mul(10 ** (18 - token.decimals));
      }

      return result;
    }
  }

  return amount;
};
