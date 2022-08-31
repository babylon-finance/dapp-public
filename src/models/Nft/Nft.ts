import { ParsiqTransport } from '../Parsiq';

type Mutate<T, R> = Omit<T, keyof R> & R;

export interface BaseNFT {
  description: string;
  image: string;
  name: string;
}

export interface GardenNFTMeta extends BaseNFT {
  createdAt: number;
  mintNftAfter?: number;
  seed: string | number;
  telegram: string | undefined;
  transport: ParsiqTransport | undefined;
  updatedAt: number;
}

export type GardenNFTOptionals = Mutate<
  GardenNFTMeta,
  {
    createdAt?: number;
    description?: string;
    image?: string;
    mintNftAfter?: number;
    name?: string;
    seed?: number;
    telegram?: string;
    transport?: ParsiqTransport;
    updatedAt?: number;
  }
>;

export interface StrategyNFTMeta extends BaseNFT {}
