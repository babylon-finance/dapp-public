import { BigNumber } from '@ethersproject/bignumber';
import { Token } from 'models/';

import { formatReserveFloat, parseReserve } from 'helpers/Numbers';

export const calculateGardenTokensFromReserve = (
  sharePrice: BigNumber,
  amount: BigNumber,
  reserveAsset: Token,
): BigNumber => {
  const sharePriceFloat = formatReserveFloat(sharePrice, reserveAsset);
  const amountFloat = formatReserveFloat(amount, reserveAsset);

  return parseReserve((amountFloat / sharePriceFloat).toFixed(reserveAsset.decimals - 1).toString(), reserveAsset);
};
