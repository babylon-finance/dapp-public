import { FullGardenDetails, StrategyDetails } from 'models';
import { BigNumber } from '@ethersproject/bignumber';
import addresses from 'constants/addresses';

const BLACKLIST_KEEPER = [
  '0x9303D3281B0D3956ebFF031f0b5910A188ef891b'.toLowerCase(),
  '0x5C0aFc3BFab3492baA1fC2F3C02355df7915398f'.toLowerCase(),
  '0xC483aFE1F252a4f8C02cE21a11A551Cf37A22852'.toLowerCase(),
  '0xc38E5828c1c84F4687f2080c0C8d2e4a89695A11'.toLowerCase(),
  '0x7AC096D32eAC2464962103238b89370003b8e108'.toLowerCase(),
  '0x8D79A321b2404E6d452267f90AaC07150F26A4F1'.toLowerCase(),
  '0x628c3134915D3d8c5073Ed8F618BCE1631b82416'.toLowerCase(),
  '0x9991D647A35810023A1CDAdD8cE27C5F3a222e7d'.toLowerCase(),
];

export const getBiggestStrategy = (gardenDetails: FullGardenDetails, netAssetValue: BigNumber): any => {
  let strategyToUnwind = addresses.zero;
  let maxCapital = BigNumber.from(0);
  gardenDetails.fullStrategies?.forEach((s: StrategyDetails) => {
    if (
      s.executedAt > 0 &&
      !s.finalized &&
      s.executedAt + s.duration >= Date.now() / 1000 &&
      BLACKLIST_KEEPER.indexOf(s.address.toLowerCase()) === -1
    ) {
      if (s.netAssetValue.gt(maxCapital) && s.netAssetValue.gt(netAssetValue)) {
        maxCapital = s.netAssetValue;
        strategyToUnwind = s.address;
      }
    }
  });
  return { strategy: strategyToUnwind, capital: maxCapital };
};
