export interface VoteItem {
  voter: string;
  amount: any; // BigNumber but needs to be marshalled
  isOpposed: boolean;
}
export interface GetStrategyVotesResponse {
  address: string;
  name: string;
  votes: VoteItem[];
}

export interface Domain {
  name: string;
  version: string;
  chainId: string;
  verifyingContract: string;
}

export interface VoteResult {
  address: string;
  votes: string;
  isOpposed: boolean;
}
export interface VoteValue {
  strategies: VoteResult[];
  garden: string;
}

export interface SubmitVotesRequest {
  value: VoteValue;
  message: any;
  signature: any;
}

export interface GovernanceVote {
  address: string;
  contract: string;
  proposal: string;
  amount: string;
  isApprove: boolean;
  message: Uint8Array;
}

export interface GardenVote {
  address: string;
  amount: string;
  contract: string;
  garden: string;
  message: Uint8Array;
}

export interface SubmitGovernanceVoteRequest {
  payload: GovernanceVote;
  signature: any;
}

export interface SubmitHeartGardenVoteRequest {
  payload: GardenVote;
  signature: any;
}

export interface GetVotesResponse {
  address: string;
  downvotes: number;
  upvotes: number;
  name: string;
  votes: VoteItem[];
}

export interface GetGovernanceVotesResponse {}

export interface GetHeartGardenVotesResponse {
  address: string;
  amount: number;
  garden: string;
}

export interface ExistingVotes {
  [address: string]: GetVotesResponse;
}

export interface VoteTally {
  oppose: number;
  endorse: number;
}

export interface VoteMap {
  [address: string]: VoteTally;
}
