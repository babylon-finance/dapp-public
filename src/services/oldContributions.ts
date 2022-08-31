import { parseEther } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';

// Object needed to add old deposits
const oldContributions = {
  '0x1a731c4aa6fa5acbe52f82af60fff3aae5a05abc': {
    '0x1c4ad6087b14e69a4f8ae378ccef1df2a46c671f': parseEther('100'),
    '0xd9d3f8eecb27e12f337f75fca59b9d9bde08efc3': parseEther('100'),
    '0x766e4d47a35d7ffcc7f4e12ac338697f3e94392b': parseEther('100'),
  },
  '0xa1a354b7f37b9e4d59d352a0c98ef9d0b43d7375': {
    '0x48d21dc6bbf18288520e9384aa505015c26ea43c': parseEther('100'),
  },
  '0xd42b3a30ca89155d6c3499c81f0c4e5a978be5c2': {
    '0xeeebdeaec2c87ee38fa8aa3a148f49a87990d30c': parseEther('1004.28'),
    '0x1c4ad6087b14e69a4f8ae378ccef1df2a46c671f': parseEther('400.19'),
    '0xde3baaea1799338349c50e0f80d37a8bae79cc54': parseEther('150'),
    '0xd9d3f8eecb27e12f337f75fca59b9d9bde08efc3': parseEther('199'),
    '0x48d21dc6bbf18288520e9384aa505015c26ea43c': parseEther('250'),
    '0x166d00d97af29f7f6a8cd725f601023b843ade66': parseEther('450'),
    '0x5833c06e94ff2fd88522f4452b2351e38c51ee54': parseEther('1250'),
    '0x7810cc5b2ea5f7a5862c9a30dfab2512e30b80f0': parseEther('1077.79'),
    '0x4b7154921f4c7c54fce3c0fb972cde51251edfe4': parseEther('460'),
    '0x14cd4257a95f3278425a2db43fa8aaa284bae204': parseEther('500'),
    '0x9031537e04e25f02dccfd0988214ac320611ed6f': parseEther('200'),
    '0x54289103189384becd00bc885cd039a605192db1': parseEther('2500'),
    '0xc31c4549356d46c37021393eeeb6f704b38061ec': parseEther('200'),
    '0x6f805005aaa1350074a6654a03f32a6ff79351fc': parseEther('500'),
  },
  '0x2c4beb32f0c80309876f028694b4633509e942d4': {
    '0xc31c4549356d46c37021393eeeb6f704b38061ec': parseEther('0.1'),
    '0x48d21dc6bbf18288520e9384aa505015c26ea43c': parseEther('0.1'),
    '0xd9d3f8eecb27e12f337f75fca59b9d9bde08efc3': parseEther('0.1'),
    '0xeeebdeaec2c87ee38fa8aa3a148f49a87990d30c': parseEther('0.1'),
    '0x1c4ad6087b14e69a4f8ae378ccef1df2a46c671f': parseEther('0.1'),
    '0x166d00d97af29f7f6a8cd725f601023b843ade66': parseEther('0.1'),
  },
};

export function getOldContribution(gardenAdd: string, address: string): BigNumber {
  const gardenObj = oldContributions[gardenAdd.toLowerCase()];
  const defaultValue = BigNumber.from(0);
  if (gardenObj) {
    return gardenObj[address.toLowerCase()] || defaultValue;
  }
  return defaultValue;
}
