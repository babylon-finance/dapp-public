import { BaseNFT } from './Nft';

interface ProphetAttributes {
  id: number;
  babl: number;
  floorPrice: number;
  lpBonus: number;
  voterBonus: number;
  strategistBonus: number;
  creatorBonus: number;
}

export interface ProphetNFT extends BaseNFT {
  attributes: ProphetAttributes;
}
