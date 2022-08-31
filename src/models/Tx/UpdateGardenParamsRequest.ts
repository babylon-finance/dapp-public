import { BigNumber } from '@ethersproject/bignumber';

export default class GardenUpdateProps {
  gardenParams: BigNumber[];
  constructor(gardenParams: BigNumber[]) {
    this.gardenParams = gardenParams;
  }

  getProps() {
    return [this.gardenParams];
  }
}
