import { BigNumber } from '@ethersproject/bignumber';

export interface GovernanceVoteResult {
  address: string;
  contract: string;
  amount: BigNumber;
  isApprove: boolean;
  proposal: BigNumber;
  message: Uint8Array;
}

export interface HeartVoteResult {
  address: string;
  contract: string;
  amount: BigNumber;
  garden: string;
  message: Uint8Array;
}
