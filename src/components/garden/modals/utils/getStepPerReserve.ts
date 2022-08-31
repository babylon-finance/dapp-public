import addresses from 'constants/addresses';

export const getStepPerReserve = (reserveAsset: string): string => {
  if (reserveAsset === addresses.tokens.WETH.toLowerCase()) {
    return '0.01';
  }
  if (reserveAsset === addresses.tokens.WBTC.toLowerCase()) {
    return '0.01';
  }
  if (reserveAsset === addresses.tokens.USDC.toLowerCase()) {
    return '1';
  }
  if (reserveAsset === addresses.tokens.DAI.toLowerCase()) {
    return '1';
  }
  // Garden tokens
  return '0.1';
};
