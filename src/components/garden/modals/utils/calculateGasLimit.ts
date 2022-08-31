import { FullGardenDetails } from 'models';
import { BigNumber } from '@ethersproject/bignumber';

export const calculateGasLimit = (defaultGasLimit: BigNumber, gardenDetails: FullGardenDetails): number => {
  return Math.floor(
    defaultGasLimit.toNumber() + defaultGasLimit.toNumber() * (0.18 * (gardenDetails.strategies.length + 1)),
  );
};
