import { tokens } from 'constants/addresses';
import { GasPrices, Token } from 'models';
import { BigNumber } from '@ethersproject/bignumber';

// 3% Keeper processing surcharge
const KEEPER_SURCHARGE = 1.03;

export const calculateMaxFee = (
  ethPrice: number,
  defaultGas: BigNumber,
  gasPrices: GasPrices,
  reserveInFiat: number,
  reserveAsset: Token,
  divisor?: number,
) => {
  if (!gasPrices.fast || gasPrices.fast <= 0) {
    gasPrices.fast = 170000000000;
    console.error('Lacking gas price to calculate maxFee, defaulting to 170 gwei');
  }

  const isWETH = reserveAsset.address.toLowerCase() === tokens.WETH.toLowerCase();
  const normDecimals = 1e10;
  const keeperFeeBN = BigNumber.from(Math.round(KEEPER_SURCHARGE * normDecimals));
  let gasFeeBN = BigNumber.from(defaultGas).mul(BigNumber.from(gasPrices.fast));

  // Note: This is used when subsidies are active, should ONLY be for Deposits
  if (divisor) {
    gasFeeBN = gasFeeBN.div(divisor);
  }

  const rawFeeAndKeeperBN = gasFeeBN.mul(keeperFeeBN);
  let finalFeeBN: BigNumber;

  // If WETH is the reserve no conversion needed just drop the normalization
  if (!isWETH) {
    finalFeeBN = rawFeeAndKeeperBN
      .mul(BigNumber.from(Math.round(ethPrice * normDecimals)))
      .div(BigNumber.from(Math.round(reserveInFiat * normDecimals)))
      .div(normDecimals);
    if (reserveAsset.decimals < 18) {
      finalFeeBN = finalFeeBN.div(10**(18- reserveAsset.decimals));
    }
  } else {
    finalFeeBN = rawFeeAndKeeperBN.div(normDecimals);
  }

  if (finalFeeBN.lte(BigNumber.from(0))) {
    throw new Error('Calculated maxFee is 0, please refresh and try submitting again.');
  }

  return { feeETH: gasFeeBN, feeReserve: finalFeeBN };
};
