import addresses from 'constants/addresses';

import { MerkleTree } from 'merkletreejs';
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import keccak256 from 'keccak256';

export const mkShortAddress = (address: string): string => {
  const safeAddress = address || addresses.zero;
  const prefix = safeAddress.slice(0, 4);
  const suffix = safeAddress.slice(safeAddress.length - 4, safeAddress.length);

  return `${prefix}...${suffix}`;
};

export const isGardenCreator = (address: string, creators: string[]): boolean => {
  return creators.map((creator: string) => creator.toLowerCase()).includes(address.toLowerCase());
};

export const hashAddress = (address: string) => {
  return Buffer.from(solidityKeccak256(['address'], [address]).slice(2), 'hex');
};

export const getMerkleTree = (wallets: string[]) => {
  return new MerkleTree(
    wallets.map((address) => hashAddress(address)),
    keccak256,
    { sortPairs: true },
  );
};

export const getProofForAddress = (merkleTree: MerkleTree, address: string) => {
  return merkleTree.getHexProof(hashAddress(address));
};
