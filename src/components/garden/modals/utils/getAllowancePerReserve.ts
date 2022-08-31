import addresses from 'constants/addresses';
import { BigNumber } from '@ethersproject/bignumber';
import { parseEther, parseUnits } from '@ethersproject/units';

export const getAllowancePerReserve = (reserveAsset: string): BigNumber => {
  if (reserveAsset === addresses.tokens.WETH.toLowerCase()) {
    return parseEther('1000');
  }
  if (reserveAsset === addresses.tokens.WBTC.toLowerCase()) {
    return parseUnits('1000000', 8);
  }
  if (reserveAsset === addresses.tokens.USDC.toLowerCase()) {
    return parseUnits('1000000', 6);
  }
  if (reserveAsset === addresses.tokens.DAI.toLowerCase()) {
    return parseEther('10000000');
  }
  return parseEther('10000000');
};
