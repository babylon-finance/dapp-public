import { BigNumber } from '@ethersproject/bignumber';

export interface GatePermissions {
  hasGate: boolean;
  creator: boolean;
}

export interface UserGatePermissions {
  [key: string]: GatePermissions;
}

export interface GardenPermission {
  strategist: boolean;
  steward: boolean;
  member: boolean;
}

export interface GardenPermsCache {
  [key: string]: GardenPermission;
}

export interface UserGardenPermsCache {
  [key: string]: GardenPermsCache;
}

export interface BablAsReserveCache {
  [key: string]: BigNumber[];
}

export interface InvitesCount {
  total: number;
  used: number;
}

export interface GardenInvitesCache {
  [key: string]: InvitesCount;
}
