import { BigNumber } from '@ethersproject/bignumber';

export interface ProphetBid {
  ref: string;
  ts: number;
  data: BidData;
}

interface BidData {
  wallet: string;
  nonce: string;
  amount: string; // String format 10**18 WETH amount
  signature: string;
  insertedAt: number;
}

export interface ProphetBidBuckets {
  buckets: BidBucket[];
}

export interface ProphetMaxMinted {
  minted: number;
  updated: number;
}

export interface ProphetImageUri {
  id: number;
  uri: string;
}

export interface ProphetSignature {
  insertedAt: number;
  signature: string;
  wallet: string;
}

export interface BidBucket {
  floor: BigNumber;
  count: number;
}

export interface ProphetBidPayload {
  message: Uint8Array;
  nonce: string; // String representation of number
  myBid: string; // String format 10**18 WETH amount
  contract: string; // Arrival contract address
}
