import { BigNumber } from '@ethersproject/bignumber';

export default class GardenProps {
  reserveAsset: string;
  name: string;
  symbol: string;
  tokenURI: string;
  seed: BigNumber;
  gardenParams: BigNumber[];
  gardenerDeposit: BigNumber;
  publicFlags: boolean[];
  profitSharing: BigNumber[];

  constructor(
    reserveAsset: string,
    name: string,
    symbol: string,
    tokenURI: string,
    seed: BigNumber,
    gardenParams: BigNumber[],
    gardenerDeposit: BigNumber,
    publicFlags: boolean[],
    profitSharing: BigNumber[],
  ) {
    this.reserveAsset = reserveAsset;
    this.name = name;
    this.symbol = symbol;
    this.tokenURI = tokenURI;
    this.seed = seed;
    this.gardenParams = gardenParams;
    this.gardenerDeposit = gardenerDeposit;
    this.publicFlags = publicFlags;
    this.profitSharing = profitSharing;
  }

  getProps() {
    return [
      this.reserveAsset,
      this.name,
      this.symbol,
      this.tokenURI,
      this.seed,
      this.gardenParams,
      this.gardenerDeposit,
      this.publicFlags,
      this.profitSharing,
    ];
  }
}
