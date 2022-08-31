export interface IdentityAddress {
  address: string;
}

export interface Identity {
  tallyId: string;
  displayName: string;
  description: string;
  avatarUrl: string;
  twitterUsername: string;
  discordHandle: string;
  source: string;
  attestationUrl: string;
  addresses: IdentityAddress[];
}

export interface IdentityResponse {
  usersByAddress: { [key: string]: Identity };
}
