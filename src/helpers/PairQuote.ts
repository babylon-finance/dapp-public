import { Token } from 'models';

import { BigNumber } from '@ethersproject/bignumber';
import { formatEther, commify } from '@ethersproject/units';

export interface PairQuoteProps {
  providingAmount: number;
  providingDecimals: number;
  providingAddress: string;
  receivingAddress: string;
}

export interface PairQuote {
  expectedRate: BigNumber;
  expectedRateDisplay: string;
}

export const EMPTY_PAIR_QUOTE = {
  expectedRate: BigNumber.from(0),
  expectedRateDisplay: '0',
};

async function getOneInchQuoteForPair(
  providingAddress: string,
  providingDecimals: number,
  receivingAddress: string,
  providingAmount: number,
): Promise<OneInchResponse | undefined> {
  const minDivisibleAmount = providingAmount * 10 ** providingDecimals;
  const quoteUrl = `https://api.1inch.exchange/v2.0/quote?fromTokenAddress=${providingAddress}&toTokenAddress=${receivingAddress}&amount=${minDivisibleAmount}`;

  try {
    const response = await fetch(quoteUrl);
    return response.json();
  } catch (err) {
    console.log(err);
  }
}

interface OneInchResponse {
  fromToken: Token;
  toToken: Token;
  fromTokenAmount: string;
  toTokenAmount: string;
  protocols: any; // need to type this if we plan to use it at all
  estimatedGas: number;
}

export async function getPairQuote(props: PairQuoteProps) {
  const getOneInchQuote = getOneInchQuoteForPair(
    props.providingAddress,
    props.providingDecimals,
    props.receivingAddress,
    props.providingAmount,
  );
  if (props.providingAddress.toLowerCase() === props.receivingAddress.toLowerCase()) {
    return {
      expectedRate: BigNumber.from(1),
      expectedRateDisplay: '1',
    };
  }

  return Promise.all([getOneInchQuote]).then(([oneInchQuote]) => {
    if (oneInchQuote) {
      const safeExpectedRateString = oneInchQuote.toTokenAmount ? oneInchQuote.toTokenAmount : '0';
      let expectedRate = BigNumber.from(safeExpectedRateString);
      if (oneInchQuote.toToken.decimals < 18) {
        expectedRate = expectedRate.mul(10 ** (18 - oneInchQuote.toToken.decimals));
      }
      const expectedRateDisplay = formatEther(expectedRate);

      return {
        expectedRate: expectedRate,
        expectedRateDisplay: commify(expectedRateDisplay),
      };
    } else {
      return EMPTY_PAIR_QUOTE;
    }
  });
}
