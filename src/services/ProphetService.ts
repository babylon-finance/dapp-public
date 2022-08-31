import ProphetsJson from 'components/Prophets/contracts/Prophets.json';
import { getProvider, PROPHET_ADDRESS } from 'config';
import { Contract } from '@ethersproject/contracts';

export const getStakedForUserGarden = async (address: string, garden: string): Promise<number | undefined> => {
  try {
    const prophets = new Contract(PROPHET_ADDRESS, ProphetsJson.abi, getProvider());
    const staked = await prophets.stakeOf(address, garden);
    return staked.toNumber();
  } catch (error) {
    console.log(error);
    return;
  }
};
